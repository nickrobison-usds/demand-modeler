package cmd

import (
	"bufio"
	"context"
	"encoding/csv"
	"fmt"
	"github.com/jackc/pgx/v4"
	"io"
	"log"
	"os"
	"path/filepath"
)

type DataLoader struct {
	ctx     context.Context
	conn    *pgx.Conn
	dataDir string
}

func NewLoader(ctx context.Context, url string, dataDir string) (*DataLoader, error) {
	// Load it up
	conn, err := pgx.Connect(ctx, url)
	if err != nil {
		return nil, err
	}

	//log.Println("Loading CoVid Cases")
	//err = cmd.LoadCases(ctx, "./data/covid19_cases_county_fips.csv", conn)
	//if err != nil {
	//	log.Fatal(err)
	//}
	return &DataLoader{
		ctx:     ctx,
		conn:    conn,
		dataDir: dataDir,
	}, nil
}

func (d *DataLoader) Load() error {
	return d.loadCases()
}

func (d *DataLoader) Close() error {
	return d.conn.Close(d.ctx)
}

func (d *DataLoader) loadCases() error {
	log.Printf("Loading Case data from: %s\n", d.dataDir)
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
	log.Printf("Loading file: %s\n", file)
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

	// Truncate the database
	log.Println("Truncating database")
	_, err = d.conn.Exec(d.ctx, "TRUNCATE TABLE Cases")
	if err != nil {
		return err
	}

	for idx, row := range rows {
		// Generate a geoid by padding the fips values
		county := fmt.Sprintf("%03s", row[8])
		state := fmt.Sprintf("%02s", row[7])
		geoid := fmt.Sprintf("%s%s", state, county)
		log.Printf("Loading record %d with ID: %s\n", idx, geoid)

		// Determine if we've seen this county before, if not, create a new row in the table
		var exists bool
		err := d.conn.QueryRow(d.ctx, "SELECT EXISTS(SELECT 1 from Counties WHERE ID=$1)", geoid).Scan(&exists)
		if err != nil {
			return err
		}

		if !exists {
			_, err = d.conn.Exec(d.ctx, "INSERT INTO Counties(County, State, "+
				"StateFP, CountyFP, ID) VALUES($1, $2, $3, $4, $5)", row[0], row[1], state, county, geoid)
			if err != nil {
				return err
			}
		}

		// Now insert into the Cases table
		_, err = d.conn.Exec(d.ctx, "INSERT INTO Cases(Geoid, "+
			"Confirmed, NewConfirmed, "+
			"Dead, NewDead, Fatality, Update) VALUES($1, $2, $3, $4, $5, $6, $7)", geoid, row[2], row[3], row[4], row[5], row[6], row[9])
		if err != nil {
			return err
		}

	}
	return nil
}
