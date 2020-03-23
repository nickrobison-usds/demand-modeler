package cmd

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
)

var unassignedAL = "[{\"countyFIPS\":\"00\",\"county\":\"Statewide Unallocated\",\"stateAbbr\":\"AL\", \"stateFIPS\":\"01\",\"deaths\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"confirmed\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0]}]"
var assignedWA = "[{\"countyFIPS\":\"53033\",\"county\":\"King County\",\"stateAbbr\":\"WA\", \"stateFIPS\":\"53\",\"deaths\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,5,6,9,10,12,15,17,21,22,26,27,32,35,37,43,43,56,60,67,74,75],\"confirmed\":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,9,14,21,31,51,58,71,83,116,190,234,270,328,387,420,488,562,562,693,793,934,1040]}]"

func TestUnassignedFacts(t *testing.T) {
	var facts []USAFacts

	err := json.Unmarshal([]byte(unassignedAL), &facts)
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
	start = start.AddDate(2020, 0, 0)

	first := f[0]
	assert.Equal(t, start, first.Reported, "Should have correct start date")
	assert.Equal(t, "AL", first.State, "Should have correct abbreviation")
	assert.Equal(t, "00", first.CountyFIPS, "Should have 0 fips")
	last := f[len(f)-1]
	assert.Equal(t, start.AddDate(0, 0, 60), last.Reported, "Should have correct start date")
	assert.Equal(t, "AL", last.State, "Should have correct abbreviation")
	assert.Equal(t, "00", last.CountyFIPS, "Should have 0 fips")
}

func TestAssignedFacts(t *testing.T) {
	var facts []USAFacts

	err := json.Unmarshal([]byte(assignedWA), &facts)
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
	start = start.AddDate(2020, 0, 0)

	first := f[0]
	assert.Equal(t, start, first.Reported, "Should have correct start date")
	assert.Equal(t, "WA", first.State, "Should have correct abbreviation")
	assert.Equal(t, 1, first.Confirmed, "Should have correct confirmed")
	assert.Equal(t, "033", first.CountyFIPS, "Should have correct county fipscode")
	assert.Equal(t, "53", first.StateFIPS, "Should have correct state fipscode")
	last := f[len(f)-1]
	assert.Equal(t, start.AddDate(0, 0, 60), last.Reported, "Should have correct start date")
	assert.Equal(t, "WA", last.State, "Should have correct abbreviation")
	assert.Equal(t, 1040, last.Confirmed, "Should have correct confirmed")
	assert.Equal(t, "033", last.CountyFIPS, "Should have correct county fipscode")
	assert.Equal(t, "53", last.StateFIPS, "Should have correct state fipscode")
}

func TestUSALoader(t *testing.T) {
	srv := createTestServer(t)
	defer srv.Close()

	dir, err := ioutil.TempDir("", "fearless-dreamer")
	if err != nil {
		t.Error(err)
	}

	loader, err := NewUSALoader(context.Background(), srv.URL, dir)
	if err != nil {
		t.Error(err)
	}

	cases, err := loader.Load()
	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, 61, len(cases), "Should have the correct number of cases")

	// Write it to a CSV
	csvFile, err := loader.writeCSV(cases)
	if err != nil {
		t.Error(err)
	}

	// Read it back from CSV
	f, err := os.Open(csvFile)
	if err != nil {
		t.Error(err)
	}
	defer f.Close()

	reader := csv.NewReader(f)
	rows, err := reader.ReadAll()
	if err != nil {
		t.Error(err)
	}
	assert.Equal(t, 62, len(rows), "Should have an equal number of rows, plus a header")
	// Read the first non-header row and poke at some values
	assert.Equal(t, "0", rows[1][2], "Should have confirmed cases")
	assert.Equal(t, "22 Jan 20 00:00 +0000", rows[1][3], "Should have January report time")
	assert.Equal(t, "01", rows[1][4], "Should have Alabama state fips")
}

func createTestServer(t *testing.T) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := fmt.Fprint(w, unassignedAL)
		if err != nil {
			t.Error(err)
		}
	}))
}
