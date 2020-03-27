package cmd

import (
	"bufio"
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync/atomic"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

var unknownRegex = regexp.MustCompile("Waiting on information|Indeterminate|Unassigned|Unknown|Non-*")

// Unassigned values have to start higher than the largest FIPS code in the TIGER database (which is 840)
var countyIter int32 = 850

var usaFactsTime string = "1/2/06 MST"

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

// LoadUSAFacts imports the USAFacts JSON file and loads it into the database
func (d *DataLoader) LoadUSAFacts() error {

	file := filepath.Join(d.dataDir, "covid_confirmed_usafacts.csv")

	log.Debug().Msgf("Loading file: %s", file)
	f, err := os.Open(file)
	if err != nil {
		return err
	}
	defer f.Close()

	// Read remaining rows
	r := csv.NewReader(f)

	// Transform the header rows into dates
	header, err := r.Read()
	if err != nil {
		return nil
	}

	dates := make([]time.Time, len(header)-4)

	for idx, h := range header[4:] {
		t, err := time.Parse(usaFactsTime, h+" EST")
		if err != nil {
			return err
		}
		dates[idx] = t
	}

	rows, err := r.ReadAll()
	if err != nil {
		return err
	}

	var cases []*CountyCases

	for _, row := range rows {
		c, err := CountyCasesFromUSAFacts(row, dates)
		if err != nil {
			return err
		}

		cases = append(cases, c...)
	}

	for _, c := range cases {
		err := d.loadUSACase(c)
		if err != nil {
			return err
		}
	}
	return nil
}

//LoadCSBS loads the CSBS CSV files
func (d *DataLoader) LoadCSBS() error {
	return d.loadCSBSCases()
}

//Truncate removes all data from the Counties and Cases tables
func (d *DataLoader) Truncate() error {
	// Truncate the database
	log.Warn().Msg("Truncating database")
	_, err := d.conn.Exec(d.ctx, "TRUNCATE TABLE Counties CASCADE; TRUNCATE TABLE Cases CASCADE;")
	if err != nil {
		return err
	}
	return nil
}

//Close shutdowns the loader and closes the connection
func (d *DataLoader) Close() error {
	return d.conn.Close(d.ctx)
}

func (d *DataLoader) loadCSBSCases() error {
	log.Debug().Msgf("Loading Case data from: %s", d.dataDir)
	// Find all the temporal data files
	files, err := filepath.Glob(filepath.Join(d.dataDir, "covid19_county_*.csv"))
	if err != nil {
		return err
	}
	// Load each file individually
	for _, file := range files {
		err := d.loadCaseFile(file)
		if err != nil {
			return err
		}
	}
	return nil
}

func (d *DataLoader) loadCaseFile(file string) error {
	log.Debug().Msgf("Loading file: %s", file)
	f, err := os.Open(file)
	if err != nil {
		return err
	}
	defer f.Close()

	// Skip the row header
	row1, err := bufio.NewReader(f).ReadSlice('\n')
	if err != nil {
		return err
	}
	_, err = f.Seek(int64(len(row1)), io.SeekStart)
	if err != nil {
		return err
	}

	// Read remaining rows
	r := csv.NewReader(f)
	rows, err := r.ReadAll()
	if err != nil {
		return err
	}
	for _, row := range rows {

		c, err := CountyCaseFromCSBS(row)
		if err != nil {
			return err
		}
		// We should be able to remove this in the future, once we move fully to the USAFacts dataset
		var geoid string
		err = d.conn.QueryRow(d.ctx, "SELECT id from Counties WHERE ID=$1", c.ID).Scan(&geoid)
		// No rows means we need to create a new one
		if err != nil {
			// Yes, this is terrible, but it works for now.
			if err.Error() == "no rows in result set" {
				err = d.createNewCounty(c)
				if err != nil {
					return err
				}
			} else {
				return err
			}
		} else {
			c.ID = geoid
			log.Debug().Msgf("Loading existing county: %s, %s. %s", c.County, c.State, c.ID)
		}

		// Now insert into the Cases table
		err = d.insertCase(c)
		if err != nil {
			return err
		}

	}
	return nil
}

func (d *DataLoader) loadUSACase(c *CountyCases) error {

	// For each case, see if we already have a county
	// Otherwise, load a new county and move on
	var geoid string
	err := d.conn.QueryRow(d.ctx, "SELECT id from Counties WHERE ID=$1", c.ID).Scan(&geoid)
	if err != nil {
		// Yes, this is terrible, but it works for now.
		// This means we need to create a new county
		if err.Error() == "no rows in result set" {
			err = d.createNewCounty(c)
			if err != nil {
				return err
			}
		} else {
			return err
		}
	}

	return d.insertCase(c)
}

func (d *DataLoader) createNewCounty(county *CountyCases) error {
	log.Debug().Msgf("No matching geography for %s, %s", county.County, county.State)
	var stateFIPS string

	stateF, ok := StateFips[strings.ToUpper(county.State)]
	if !ok {
		log.Error().Msgf("Cannot find FIPS for state: %s", county.State)
	}
	stateFIPS = fmt.Sprintf("%02d", stateF)

	// If the county name is unknown, unassigned, etc, then we create a fake geoid and move along.
	if unknownRegex.MatchString(county.County) {
		county.CountyFIPS = fmt.Sprintf("%03d", countyIter)
		county.ID = fmt.Sprintf("%s%s", stateFIPS, county.CountyFIPS)
		atomic.AddInt32(&countyIter, 1)
	} else {

		// 	// Get the state fips code
		// 	stateFIPS = fmt.Sprintf("%02d", StateFips[strings.ToUpper(county.State)])

		// 	// We need the fips information from the Shapefile database, so query for it
		// 	err := d.conn.QueryRow(d.ctx, "SELECT t.countyfp FROM tiger as t where (t.name = $1 OR t.namelsad = $1) and t.statefp = $2", county.County, stateFIPS).Scan(&countyFIPS)
		// 	// More gross
		// 	if err != nil && err.Error() == "no rows in result set" {
		// 		// No rows means we have a non-spatial county, but still try to match up with an existing state
		// 		countyFIPS = fmt.Sprintf("%03d", countyIter)
		// 		geoid = fmt.Sprintf("%s%s", stateFIPS, countyFIPS)
		// 		atomic.AddInt32(&countyIter, 1)
		// 	} else if err != nil {
		// 		log.Error().Msgf("Unable to load %s, %s: %s", county.County, county.State, err.Error())
		// 		return err
		// 	} else {
		// 		geoid = fmt.Sprintf("%s%s", stateFIPS, countyFIPS)
		// 	}
		// }
	}

	// county.CountyFIPS = countyFIPS
	// county.StateFIPS = stateFIPS
	// county.ID = geoid

	// Load the new county
	log.Debug().Msgf("Loading new county: %s, %s. %s", county.County, county.State, county.ID)
	_, err := d.conn.Exec(d.ctx, "INSERT INTO Counties(County, State, "+
		"StateFP, CountyFP, ID) VALUES($1, $2, $3, $4, $5)", county.County, county.State, county.StateFIPS, county.CountyFIPS, county.ID)
	if err != nil {
		return err
	}

	return nil
}

func (d *DataLoader) insertCase(c *CountyCases) error {
	_, err := d.conn.Exec(d.ctx, "INSERT INTO Cases(Geoid, "+
		"Confirmed, NewConfirmed, "+
		"Dead, NewDead, Update) VALUES($1, $2, $3, $4, $5, $6)", c.ID, c.Confirmed, c.NewConfirmed, c.Dead, c.NewDead, c.Reported)
	if err != nil {
		log.Printf("Error inserting county: %s, %s. %s %s", c.County, c.State, c.ID, c.Reported)
		return err
	}

	return nil
}
