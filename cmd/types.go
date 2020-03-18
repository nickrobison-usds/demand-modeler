package cmd

type CaseCount struct {
	ID           string
	County       string
	State        string
	Confirmed    int
	NewConfirmed int
	Dead         int
	NewDead      int
}
