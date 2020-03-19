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
	"regexp"
	"strconv"
	"strings"
	"sync/atomic"
)

const unknownState = "99"

var unknownRegex = regexp.MustCompile("Waiting on information|Indeterminate|Unassigned|Unknown|Non-*")

var countyIter int32 = 800

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

func (d *DataLoader) Load() error {
	return d.loadCases()
}

func (d *DataLoader) Close() error {
	return d.conn.Close(d.ctx)
}

func (d *DataLoader) loadCases() error {
	log.Printf("Loading Case data from: %s\n", d.dataDir)

	// Truncate the database
	log.Println("Truncating database")
	_, err := d.conn.Exec(d.ctx, "TRUNCATE TABLE Counties CASCADE; TRUNCATE TABLE Cases CASCADE;")
	if err != nil {
		return err
	}
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

	for _, row := range rows {

		// Determine if we've seen this county before, if not, create a new row in the table
		var geoid string
		err = d.conn.QueryRow(d.ctx, "SELECT id from Counties WHERE County=$1 AND State=$2", row[0], row[1]).Scan(&geoid)
		// No rows means we need to create a new one
		if err != nil {
			// Yes, this is terrible, but it works for now.
			if err.Error() == "no rows in result set" {
				geoid, err = d.createNewCounty(row)
				if err != nil {
					return err
				}
			} else {
				return err
			}
		} else {
			log.Printf("Loading existing county: %s, %s. %s\n", row[0], row[1], geoid)
		}

		// Split the dead column into
		dead, newDead, err := splitDead(row[4])
		if err != nil {
			return err
		}

		// Now insert into the Cases table
		_, err = d.conn.Exec(d.ctx, "INSERT INTO Cases(Geoid, "+
			"Confirmed, NewConfirmed, "+
			"Dead, NewDead, Update) VALUES($1, $2, $3, $4, $5, $6)", geoid, row[2], row[3], dead, newDead, row[8])
		if err != nil {
			return err
		}

	}
	return nil
}

func (d *DataLoader) createNewCounty(row []string) (string, error) {
	log.Printf("No matching geography for %s, %s", row[0], row[1])

	// See if the county intersects with anything
	var geoid string
	var county string
	var state string

	// If the county name is unknown, unassigned, etc, then we create a fake geoid and move along.
	if unknownRegex.MatchString(row[0]) {
		state = unknownState
		county = fmt.Sprintf("%03d", countyIter)
		geoid = fmt.Sprintf("%s%s", unknownState, county)
		atomic.AddInt32(&countyIter, 1)
	} else {

		// Get the state fips code
		state = fmt.Sprintf("%02d", StateFips[strings.ToUpper(row[1])])

		// We need the fips information from the Shapefile database, so query for it
		err := d.conn.QueryRow(d.ctx, "SELECT t.countyfp FROM tiger as t where (t.name = $1 OR t.namelsad = $1) and t.statefp = $2", row[0], state).Scan(&county)
		// More gross
		if err != nil && err.Error() == "no rows in result set" {
			// No rows means we have a non-spatial county, so create a fake fips
			state = unknownState
			county = fmt.Sprintf("%03d", countyIter)
			geoid = fmt.Sprintf("%s%s", unknownState, county)
			atomic.AddInt32(&countyIter, 1)
		} else if err != nil {
			log.Printf("Unable to load %s, %s: %s\n", row[0], row[1], err.Error())
			return "", err
		} else {
			geoid = fmt.Sprintf("%s%s", state, county)
		}
	}

	// Load the new county
	log.Printf("Loading new county: %s, %s. %s\n", row[0], row[1], geoid)
	_, err := d.conn.Exec(d.ctx, "INSERT INTO Counties(County, State, "+
		"StateFP, CountyFP, ID) VALUES($1, $2, $3, $4, $5)", row[0], row[1], state, county, geoid)
	if err != nil {
		return "", err
	}

	return geoid, nil
}

func splitDead(dead string) (int, int, error) {
	strs := strings.Split(dead, "+")
	d, err := strconv.Atoi(strs[0])
	if err != nil {
		return 0, 0, err
	}
	if len(strs) == 1 {
		return d, 0, nil
	}

	n, err := strconv.Atoi(strs[1])
	if err != nil {
		return 0, 0, err
	}
	return d, n, err
}
