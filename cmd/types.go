package cmd

import (
	"strconv"
	"strings"
	"time"
)

var csbsFormatter string = "2006-01-02 15:04 MST"

type CaseCount struct {
	Confirmed    int
	NewConfirmed int
	Dead         int
	NewDead      int
	Reported     time.Time
}

type CountyCases struct {
	ID         string
	County     string
	State      string
	StateFIPS  string
	CountyFIPS string
	*CaseCount
}

type StateCases struct {
	ID    string
	State string
	*CaseCount
}

func (c *CountyCases) ToRow() []string {
	return []string{c.County, c.State, strconv.Itoa(c.Confirmed), strconv.Itoa(c.Dead), c.Reported.Format(time.RFC822Z), c.StateFIPS, c.CountyFIPS}
}

// CountyCaseFromCSBS generates a CountyCases struct from the CSBS CSV. Does not include the ID or FIPS codes, those must be added later
func CountyCaseFromCSBS(row []string) (*CountyCases, error) {
	// _, err := d.conn.Exec(d.ctx, "INSERT INTO Counties(County, State, "+
	// "StateFP, CountyFP, ID) VALUES($1, $2, $3, $4, $5)", row[0], row[1], state, county, geoid)

	// Split the dead column into dead and new dead
	dead, newDead, err := splitDead(row[4])
	if err != nil {
		return nil, err
	}

	confirmed, err := strconv.Atoi(row[0])
	if err != nil {
		return nil, err
	}

	reported, err := time.Parse(csbsFormatter, row[8])
	if err != nil {
		return nil, err
	}

	return &CountyCases{
		County: row[0],
		State:  row[1],
		CaseCount: &CaseCount{
			Confirmed:    confirmed,
			Dead:         dead,
			NewConfirmed: 0,
			NewDead:      newDead,
			Reported:     reported,
		},
	}, nil
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
