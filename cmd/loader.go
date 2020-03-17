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
	"strconv"
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
	_, err = conn.Exec(ctx, "TRUNCATE TABLE Cases")
	if err != nil {
		return nil
	}

	for idx, row := range rows {
		county, err := strconv.Atoi(row[8])
		if err != nil {
			return nil
		}

		state, err := strconv.Atoi(row[7])
		if err != nil {
			return err
		}
		id, err := strconv.Atoi(fmt.Sprintf("%d%d", state, county))
		if err != nil {
			return err
		}
		log.Printf("Loading record %d with ID: %d\n", idx, id)

		_, err = conn.Exec(ctx, "INSERT INTO Cases(ID, StateFP, CountyFP) VALUES($1, $2, $3)", id, state, county)
		if err != nil {
			return err
		}
	}

	return nil
}
