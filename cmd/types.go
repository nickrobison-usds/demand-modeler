package cmd

import (
	"strconv"
	"time"
)

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

func (c *CountyCases) ToRow() []string {
	return []string{c.County, c.State, strconv.Itoa(c.Confirmed), strconv.Itoa(c.Dead), c.Reported.Format(time.RFC822Z), c.StateFIPS, c.CountyFIPS}
}

type StateCases struct {
	ID    string
	State string
	*CaseCount
}
