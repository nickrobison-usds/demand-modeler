package cmd

import (
	"context"
	"encoding/csv"
	"net/http"
	"os"
	"regexp"

	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

var unknownRegex = regexp.MustCompile("Waiting on information|Indeterminate|Unassigned|Unknown|Non-*")

// Unassigned values have to start higher than the largest FIPS code in the TIGER database (which is 840)
var countyIter int32 = 850

type DataLoader struct {
	ctx     context.Context
	conn    *pgx.Conn
	dataDir string
	regex   regexp.Regexp
}

func NewLoader(ctx context.Context, url string, dataDir string) (*DataLoader, error) {
	// Load it up
	conn, err := pgx.Connect(ctx, url)
	if err != nil {
		return nil, err
	}

	return &DataLoader{
		ctx:     ctx,
		conn:    conn,
		dataDir: dataDir,
	}, nil
}

func getTimeseriesData() ([][]string, error) {
	url := "https://protect.hhs.gov/foundry-data-proxy/api/dataproxy/datasets/ri.foundry.main.dataset.4dd075cf-4925-41b2-a38e-abdc0735781e/branches/master/csv/?includeColumnNames=false"

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("authorization", "Bearer " + os.Getenv("DAIKON_TOKEN"))

	resp, err := client.Do(req)
	
	if err != nil {
		log.Printf("client error %", resp.StatusCode)
		return nil, err
	}

	defer resp.Body.Close()

	reader := csv.NewReader(resp.Body)
	reader.Comma = ','
	data, err := reader.ReadAll()
	if err != nil {
		log.Printf("Error loading data %", resp.Body)
		return nil, err
	}

	return data, nil
}


// loads the daikon CSV files
func (d *DataLoader) Load() error {
	log.Debug().Msgf("Loading Case data from: %s", d.dataDir)


	data, err := getTimeseriesData()
	if err != nil {
		return err
	}

	for _, row := range data {
		c, err := CountyCaseFromDaikon(row)
		if err != nil {
			return err
		}

		// Now insert into the Cases table
		err = d.insertCase(c)
		if err != nil {
			return err
		}

	}
	return nil
}

//Close shutdowns the loader and closes the connection
func (d *DataLoader) Close() error {
	return d.conn.Close(d.ctx)
}

func (d *DataLoader) insertCase(c *CountyCases) error {
	rows, err := d.conn.Query(d.ctx, "SELECT c.geoid FROM Cases as c WHERE c.geoid=$1 AND c.update=$2", c.ID, c.Reported)
	if err != nil {
		log.Printf("Error selecting county: %s %s", c.ID, c.Reported)
		return err
	}
	var geoid = ""
	for rows.Next() {
		var id string
		rows.Scan(&id)
		geoid = id
	}
	if len(geoid) > 0 {
		_, err := d.conn.Exec(d.ctx, "UPDATE Cases SET confirmed=$1, dead=$2 WHERE geoid=$3 AND update=$4", c.Confirmed, c.Dead, c.ID, c.Reported)
		if err != nil {
			log.Printf("Error updating county: %s %s %s %s", c.Confirmed, c.Dead, c.ID, c.Reported)
			return err
		}
	} else {
		_, err := d.conn.Exec(d.ctx, "INSERT INTO Cases(Geoid, Confirmed, Dead, Update) VALUES($1, $2, $3, $4)", c.ID, c.Confirmed, c.Dead, c.Reported)
		if err != nil {
			log.Printf("Error inserting county: %s %s %s %s", c.ID, c.Confirmed, c.Dead, c.Reported)
			return err
		}
	}
	return nil
}
