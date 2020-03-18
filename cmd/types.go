package cmd

type CaseCount struct {
	Confirmed    int
	NewConfirmed int
	Dead         int
	NewDead      int
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
