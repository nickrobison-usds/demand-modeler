package cmd

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

var testCase = "[{\"countyFIPS\":\"00\",\"county\":\"Statewide Unallocated\",\"stateAbbr\":\"AL\", \"stateFIPS\":\"01\",\"deaths\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"confirmed\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0]}]"

func TestTransformFacts(t *testing.T) {
	var facts []USAFacts

	err := json.Unmarshal([]byte(testCase), &facts)
	if err != nil {
		t.Error(err)
	}

	f, err := transformFact(&facts[0])
	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, len(facts[0].Confirmed), len(f), "Should have correct number of facts")
	// Verify that the start/end dates are correct
	start, err := time.Parse(time.Stamp, startDate)
	if err != nil {
		t.Error(err)
	}

	first := f[0]
	assert.Equal(t, start, first.Reported, "Should have correct start date")
	assert.Equal(t, "AL", first.State, "Should have correct abbreviation")
}
