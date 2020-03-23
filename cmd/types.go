package cmd

import "time"

type CaseCount struct {
	Confirmed    int
	NewConfirmed int
	Dead         int
	NewDead      int
	Reported     time.Time
}

type CountyCases struct {
	ID     string
	County string
	State  string
	*CaseCount
}

func (c *CountyCases) ToRow() []string {
	return []string{c.County, c.State, string(c.Confirmed), c.Reported.Format(time.RFC822Z), "0", "0"}
}

type StateCases struct {
	ID    string
	State string
	*CaseCount
}
