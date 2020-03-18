package api

import (
	"context"
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"log"
	"net/http"
	"time"
)

func getStateGeo(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	stateID := ctx.Value("stateID").(string)
	conn := ctx.Value("db").(*pgxpool.Pool)

	geo := &json.RawMessage{}
	err := conn.QueryRow(ctx, "SELECT ST_AsGeoJSON(geom) FROM states "+
		"WHERE statefp = $1;", stateID).Scan(geo)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(geo)
}

func getStateCases(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	stateID := ctx.Value("stateID").(string)
	conn := ctx.Value("db").(*pgxpool.Pool)

	log.Println("Returning case data for state: " + stateID)
	rows, err := conn.Query(ctx, "SELECT c.statefp, c.state, a.update, SUM(a.confirmed), SUM(a.newconfirmed), SUM(a.dead), SUM(a.newdead) from counties as c "+
		"LEFT JOIN cases as a ON c.id = a.geoid "+
		"WHERE c.statefp = $1 "+
		"GROUP BY c.statefp, c.state, a.update", stateID)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	cases := make([]cmd.StateCases, 0)
	for rows.Next() {
		var id string
		var state string
		var confirmed int
		var newConfirmed int
		var dead int
		var newDead int
		var reported time.Time
		err := rows.Scan(&id, &state, &reported, &confirmed, &newConfirmed, &dead, &newDead)
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
			Reported:     reported,
		}

		cases = append(cases, cmd.StateCases{
			ID:        id,
			State:     state,
			CaseCount: caseCount,
		})
	}
	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Print(err)
	}
}

func stateCTX(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		countyID := chi.URLParam(r, "stateID")
		log.Println("ID from param: " + countyID)
		ctx := context.WithValue(r.Context(), "stateID", countyID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func stateAPI(r chi.Router) {
	r.With(stateCTX).Get("/{stateID}/geo", getStateGeo)
	r.With(stateCTX).Get("/{stateID}", getStateCases)
}
