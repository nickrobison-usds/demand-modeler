package cmd

import (
	"fmt"
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

	confirmed, err := strconv.Atoi(row[2])
	if err != nil {
		return nil, err
	}

	reported, err := time.Parse(csbsFormatter, row[8])
	if err != nil {
		return nil, err
	}

	new, err := strconv.Atoi(row[3])
	if err != nil {
		return nil, err
	}

	statefps := fmt.Sprintf("%02s", row[9])
	countyfps := fmt.Sprintf("%03s", row[10])
	id := statefps + countyfps

	return &CountyCases{
		County: row[0],
		State:  row[1],
		CaseCount: &CaseCount{
			Confirmed:    confirmed,
			Dead:         dead,
			NewConfirmed: new,
			NewDead:      newDead,
			Reported:     reported,
		},
		StateFIPS:  statefps,
		CountyFIPS: countyfps,
		ID:         id,
	}, nil
}

// CountyCasesFromUSAFacts splits a USAFact row into multiple cases
func CountyCasesFromUSAFacts(row []string, times []time.Time, deaths bool) ([]*CountyCases, error) {
	// Each row is a single county, with all observations

	statefp := fmt.Sprintf("%02s", row[3])

	// If the CountyFIPS is 0, then it's unallocated, so set it as county 999
	var countyfp string
	if row[0] == "0" {
		countyfp = "999"
	} else {
		countyfp = row[0][len(row[0])-3:]
	}
	// Iterate through all the remaining rows and build cases
	var cases []*CountyCases

	for idx, val := range row[4:] {

		reported := times[idx]
		// log.Debug().Msgf("value: %s %s %s", statefp, countyfp, val)

		value, err := strconv.Atoi(val)
		if err != nil {
			return nil, err
		}

		state, ok := StateAbr[row[2]]
		if !ok {
			return nil, fmt.Errorf("Cannot find state name for %s", row[2])
		}

		if deaths {
			cases = append(cases, &CountyCases{
				ID:         countyfp + statefp,
				County:     row[1],
				CountyFIPS: countyfp,
				StateFIPS:  statefp,
				State:      state,
				CaseCount: &CaseCount{
					Confirmed:    0,
					Dead:         value,
					NewConfirmed: 0,
					NewDead:      0,
					Reported:     reported,
				},
			})
		} else {
			cases = append(cases, &CountyCases{
				ID:         countyfp + statefp,
				County:     row[1],
				CountyFIPS: countyfp,
				StateFIPS:  statefp,
				State:      state,
				CaseCount: &CaseCount{
					Confirmed:    value,
					Dead:         0,
					NewConfirmed: 0,
					NewDead:      0,
					Reported:     reported,
				},
			})
		}

	}

	return cases, nil
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
