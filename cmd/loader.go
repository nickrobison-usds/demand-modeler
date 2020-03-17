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
)

func LoadCases(ctx context.Context, file string, conn *pgx.Conn) error {
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
	_, err = conn.Exec(ctx, "TRUNCATE TABLE Cases")
	if err != nil {
		return err
	}

	for idx, row := range rows {
		// Generate a geoid by padding the fips values
		county := fmt.Sprintf("%03s", row[8])
		state := fmt.Sprintf("%02s", row[7])
		geoid := fmt.Sprintf("%s%s", state, county)
		log.Printf("Loading record %d with ID: %s\n", idx, geoid)

		_, err = conn.Exec(ctx, "INSERT INTO Cases(County, State, "+
			"Confirmed, NewConfirmed, "+
			"Dead, NewDead, Fatality, "+
			"StateFP, CountyFP, Geoid, Update) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", row[0], row[1], row[2], row[3], row[4], row[5], row[6], state, county, geoid, row[9])
		if err != nil {
			return err
		}
	}

	return nil
}
