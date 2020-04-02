package cmd

import (
	"fmt"
	"strconv"
	"time"
)

// var daikonFormatter string = "2006-01-02"
var daikonFormatter string = "1/2/06"

type CaseCount struct {
	Confirmed    int
	Dead         int
	Reported     time.Time
}

type CountyCases struct {
	ID         string
	*CaseCount
}

type StateCases struct {
	ID    string
	*CaseCount
}

// CountyCaseFromDaikon generates a CountyCases struct from the Daikon CSV. Does not include the ID or FIPS codes, those must be added later
func CountyCaseFromDaikon(row []string) (*CountyCases, error) {

	// Split the dead column into dead and new dead
	dead, err := strconv.Atoi(row[3])
	if err != nil {
		return nil, err
	}

	confirmed, err := strconv.Atoi(row[0])
	if err != nil {
		return nil, err
	}

	reported, err := time.Parse(daikonFormatter, row[2])
	if err != nil {
		return nil, err
	}

	id := fmt.Sprintf("%s", row[1])
	return &CountyCases{
		CaseCount: &CaseCount{
			Confirmed:    confirmed,
			Dead:         dead,
			Reported:     reported,
		},
		ID:         id,
	}, nil
}