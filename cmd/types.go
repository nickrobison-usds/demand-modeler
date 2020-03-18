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

type StateCases struct {
	ID    string
	State string
	*CaseCount
}
