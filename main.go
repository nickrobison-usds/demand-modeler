package main

import (
	"context"
	"github.com/jackc/pgx/v4"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"log"
)

func main() {
	// Load it up
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, "postgres://covid:goaway@localhost:5432/covid?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(ctx)

	log.Println("Loading CoVid Cases")
	err = cmd.LoadCases(ctx, "./data/covid19_cases_county_fips.csv", conn)
	if err != nil {
		log.Fatal(err)
	}
}
