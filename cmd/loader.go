package cmd

import (
	"bufio"
	"context"
	"encoding/csv"
	"io"
	"os"
	"path/filepath"
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


// loads the daikon CSV files
func (d *DataLoader) Load() error {
	log.Debug().Msgf("Loading Case data from: %s", d.dataDir)

	file := filepath.Join(d.dataDir, "FIPSData.csv")
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

//Truncate removes all data from the Cases table
func (d *DataLoader) Truncate() error {
	// Truncate the database
	log.Warn().Msg("Truncating database")
	_, err := d.conn.Exec(d.ctx, "TRUNCATE TABLE Cases CASCADE;")
	if err != nil {
		return err
	}
	return nil
}

//Close shutdowns the loader and closes the connection
func (d *DataLoader) Close() error {
	return d.conn.Close(d.ctx)
}

func (d *DataLoader) insertCase(c *CountyCases) error {
	_, err := d.conn.Exec(d.ctx, "INSERT INTO Cases(Geoid, "+
	"Confirmed, "+
	"Dead, Update) VALUES($1, $2, $3, $4)", c.ID, c.Confirmed, c.Dead, c.Reported)
	if err != nil {
		log.Printf("Error inserting county: %s %s", c.ID, c.Reported)
		return err
	}
	return nil
}
