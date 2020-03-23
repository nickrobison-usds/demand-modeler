package cmd

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

const startDate string = "Jan 22 00:00:00"

type USAFacts struct {
	CountyFIPS string `json:"countyFIPS"`
	County     string
	StateAbbr  string
	StateFIPS  string
	Deaths     []int
	Confirmed  []int
}

type USAFactsLoader struct {
	ctx context.Context
	url string
}

func NewUSALoader(ctx context.Context, url string) (*USAFactsLoader, error) {

	return &USAFactsLoader{
		ctx: ctx,
		url: url,
	}, nil
}

func (f *USAFactsLoader) Load() ([]*CountyCases, error) {
	// Download the file from

	resp, err := http.Get("https://usafactsstatic.blob.core.windows.net/public/2020/coronavirus-timeline/allData.json")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var facts []USAFacts
	{
	}

	err = json.NewDecoder(resp.Body).Decode(&facts)
	if err != nil {
		return nil, err
	}

	var totalCases []*CountyCases

	// Transform the facts into something useful
	for _, fact := range facts {
		cases, err := transformFact(&fact)
		if err != nil {
			return nil, err
		}

		totalCases = append(totalCases, cases...)
	}

	return totalCases, nil
}

func transformFact(fact *USAFacts) ([]*CountyCases, error) {

	start, err := time.Parse(time.Stamp, startDate)
	if err != nil {
		return nil, err
	}

	var cases []*CountyCases

	for idx, confirmed := range fact.Confirmed {
		observedTime := start.AddDate(0, 0, idx)

		c := &CaseCount{
			Confirmed:    confirmed,
			NewConfirmed: 0,
			Dead:         fact.Deaths[idx],
			NewDead:      0,
			Reported:     observedTime,
		}

		cases = append(cases, &CountyCases{
			ID:        fact.CountyFIPS,
			County:    fact.County,
			State:     fact.StateAbbr,
			CaseCount: c,
		})
	}
	return cases, nil
}
