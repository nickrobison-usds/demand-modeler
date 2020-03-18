package api

import (
	"context"
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"log"
	"net/http"
)

func getCountyGeo(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	countyID := ctx.Value("countyID").(string)
	conn := ctx.Value("db").(*pgxpool.Pool)

	geo := &json.RawMessage{}
	err := conn.QueryRow(ctx, "SELECT ST_AsGeoJSON(t.geom) as geom FROM counties as c "+
		"LEFT JOIN tiger as t "+
		"ON c.ID = t.geoid "+
		"WHERE c.id = $1;", countyID).Scan(geo)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(geo)
}

func getCountyCases(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	countyID := ctx.Value("countyID").(string)
	conn := ctx.Value("db").(*pgxpool.Pool)

	log.Println("Returning case data for: " + countyID)
	rows, err := conn.Query(ctx, "SELECT c.ID, c.County, c.State, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead, ST_AsGeoJSON(t.geom) as geom FROM counties as c "+
		"LEFT JOIN tiger as t "+
		"ON c.ID = t.geoid "+
		"LEFT JOIN cases as s "+
		"ON s.geoid = c.ID WHERE c.id = $1;", countyID)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	cases := make([]cmd.CountyCases, 0)
	for rows.Next() {
		var id string
		var county string
		var state string
		var confirmed int
		var newConfirmed int
		var dead int
		var newDead int
		geo := &json.RawMessage{}
		err := rows.Scan(&id, &county, &state, &confirmed, &newConfirmed, &dead, &newDead, geo)
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		caseCount := &cmd.CaseCount{
			Confirmed:    confirmed,
			NewConfirmed: newConfirmed,
			Dead:         dead,
			NewDead:      newDead,
		}

		cases = append(cases, cmd.CountyCases{
			ID:        id,
			County:    county,
			State:     state,
			CaseCount: caseCount,
		})
	}
	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Print(err)
	}
}

func countyCTX(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		countyID := chi.URLParam(r, "countyID")
		log.Println("ID from param: " + countyID)
		ctx := context.WithValue(r.Context(), "countyID", countyID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func countyAPI(r chi.Router) {
	// For some reason, the URL param context doesn't work unless you use the .with directly on the methods
	r.With(countyCTX).Get("/{countyID}", getCountyCases)
	r.With(countyCTX).Get("/{countyID}/geo", getCountyGeo)
}
