package cmd

import (
	"fmt"
	"strconv"
	"time"

	"github.com/rs/zerolog/log"
)

var daikonFormatter string = "2006-01-02"

type CaseCount struct {
	Confirmed    int
	Dead         int
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

// CountyCaseFromDaikon generates a CountyCases struct from the Daikon CSV. Does not include the ID or FIPS codes, those must be added later
func CountyCaseFromDaikon(row []string) (*CountyCases, error) {

	// Split the dead column into dead and new dead
	dead, err := strconv.Atoi(row[5])
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
	statefps := ""
	countyfps := ""
	if len(id) == 2 {
		statefps = id
		log.Debug().Msgf("missing county fips: %s", id)
	} else if len(id) == 5 {
		statefps = string(id[0:2])
		countyfps = string(id[2:4])
	} else {
		log.Debug().Msgf("invalid fips length: %s", id)
	}

	return &CountyCases{
		County: row[3],
		State:  row[4],
		CaseCount: &CaseCount{
			Confirmed:    confirmed,
			Dead:         dead,
			Reported:     reported,
		},
		StateFIPS:  statefps,
		CountyFIPS: countyfps,
		ID:         id,
	}, nil
}