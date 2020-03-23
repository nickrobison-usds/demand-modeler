package cmd

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/urfave/cli/v2"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
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
	ctx     context.Context
	url     string
	dataDir string
}

func USALoaderCMD() *cli.Command {
	return &cli.Command{
		Name:  "usafacts",
		Usage: "Download and export data from usafacts.org",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:  "url",
				Value: "https://usafactsstatic.blob.core.windows.net/public/2020/coronavirus-timeline/allData.json",
				Usage: "Fact download location",
			},
			&cli.StringFlag{
				Name:  "dir",
				Value: "data/usafacts",
				Usage: "Directory to output data",
			},
		},
		Action: func(c *cli.Context) error {
			loader, err := NewUSALoader(c.Context, c.String("url"), c.String("dir"))
			if err != nil {
				return err
			}
			cases, err := loader.Load()
			if err != nil {
				return err
			}

			filename, err := loader.writeCSV(cases)
			if err != nil {
				return err
			}

			log.Println("Wrote CSV: " + filename)
			return nil
		},
	}
}

func NewUSALoader(ctx context.Context, url string, dataDir string) (*USAFactsLoader, error) {

	return &USAFactsLoader{
		ctx:     ctx,
		url:     url,
		dataDir: dataDir,
	}, nil
}

func (f *USAFactsLoader) Load() ([]*CountyCases, error) {
	// Download the file from

	// "https://usafactsstatic.blob.core.windows.net/public/2020/coronavirus-timeline/allData.json"
	resp, err := http.Get(f.url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var facts []USAFacts

	err = json.NewDecoder(resp.Body).Decode(&facts)
	if err != nil {
		return nil, err
	}

	totalCases := make([]*CountyCases, 0)

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

func (f *USAFactsLoader) writeCSV(cases []*CountyCases) (string, error) {
	filename := filepath.Join(f.dataDir, makeFilename())
	file, err := os.Create(filename)
	if err != nil {
		return "", err
	}
	defer file.Close()

	err = writeToCSV(file, cases)
	if err != nil {
		return "", err
	}

	return filename, nil
}

func transformFact(fact *USAFacts) ([]*CountyCases, error) {

	start, err := time.Parse(time.Stamp, startDate)
	if err != nil {
		return nil, err
	}

	var cases []*CountyCases

	for idx, confirmed := range fact.Confirmed {
		// The values come with no dates, so we need to add that
		observedTime := start.AddDate(2020, 0, idx)

		c := &CaseCount{
			Confirmed:    confirmed,
			NewConfirmed: 0,
			Dead:         fact.Deaths[idx],
			NewDead:      0,
			Reported:     observedTime,
		}

		state, county := splitFIPS(fact.CountyFIPS)
		if county == "00" {
			state = fact.StateFIPS
		}

		cases = append(cases, &CountyCases{
			ID:         fact.CountyFIPS,
			County:     fact.County,
			State:      fact.StateAbbr,
			StateFIPS:  state,
			CountyFIPS: county,
			CaseCount:  c,
		})
	}
	return cases, nil
}

func writeToCSV(w io.Writer, cases []*CountyCases) error {
	writer := csv.NewWriter(w)
	defer writer.Flush()

	// Write header
	header := []string{"countyName", "stateName", "confirmed", "dead", "lastUpdate", "STATEFP", "COUNTYFP"}
	err := writer.Write(header)
	if err != nil {
		return err
	}

	for _, c := range cases {
		err = writer.Write(c.ToRow())
		if err != nil {
			return err
		}
	}
	return nil
}

func makeFilename() string {
	t := time.Now()
	timestamp := fmt.Sprintf("%04d-%02d-%02d_%02d-%02d-%02d", t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second())
	return fmt.Sprintf("usafacts_%s.csv", timestamp)
}

func splitFIPS(fipsCode string) (string, string) {
	if len(fipsCode) < 5 {
		return fipsCode, "00"
	}
	stateFips := fipsCode[0:2]
	countyFips := fipsCode[2:]

	return stateFips, countyFips
}
