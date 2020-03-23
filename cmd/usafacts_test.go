package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
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
	start = start.AddDate(2020, 0, 0)

	first := f[0]
	assert.Equal(t, start, first.Reported, "Should have correct start date")
	assert.Equal(t, "AL", first.State, "Should have correct abbreviation")
	last := f[len(f)-1]
	assert.Equal(t, start.AddDate(0, 0, 60), last.Reported, "Should have correct start date")
	assert.Equal(t, "AL", last.State, "Should have correct abbreviation")
}

func TestUSALoader(t *testing.T) {
	srv := createTestServer(t)
	defer srv.Close()

	loader, err := NewUSALoader(context.Background(), srv.URL)
	if err != nil {
		t.Error(err)
	}

	cases, err := loader.Load()
	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, 61, len(cases), "Should have the correct number of cases")
}

func createTestServer(t *testing.T) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := fmt.Fprint(w, testCase)
		if err != nil {
			t.Error(err)
		}
	}))
}
