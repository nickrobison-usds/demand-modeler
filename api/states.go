package api

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"log"
	"net/http"
	"time"
)

func getStateIDs(w http.ResponseWriter, r *http.Request) {
	err := json.NewEncoder(w).Encode(cmd.StateFips)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func getStates(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	query := "SELECT c.statefp, c.State, s.Update, SUM(s.Confirmed) as confirmed, SUM(s.NewConfirmed), SUM(s.Dead), SUM(s.NewDead) FROM counties as c " +
		"LEFT JOIN cases as s " +
		"ON s.geoid = c.ID "

	start, ok := r.URL.Query()["start"]
	if ok && len(start) == 1 {
		startTime, err := time.Parse(time.RFC3339, start[0])
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		query = fmt.Sprintf("%s WHERE s.update > '%s' ", query, startTime.Format(time.RFC3339))
	}
	query = query + "GROUP BY c.statefp, c.state, s.update " +
		"ORDER BY c.state, s.update;"

	cases, err := queryStateCases(ctx, conn, query)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

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
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	log.Println("Returning case data for state: " + stateID)

	query := "SELECT c.statefp, c.state, a.update, SUM(a.confirmed) as confirmed, SUM(a.newconfirmed), SUM(a.dead), SUM(a.newdead) from counties as c " +
		"LEFT JOIN cases as a ON c.id = a.geoid " +
		"WHERE c.statefp = $1 " +
		"GROUP BY c.statefp, c.state, a.update " +
		"ORDER BY a.update DESC, confirmed DESC"

	cases, err := queryStateCases(ctx, conn, query, stateID)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func queryStateCases(ctx context.Context, conn *pgxpool.Conn, sql string, args ...interface{}) ([]cmd.StateCases, error) {
	cases := make([]cmd.StateCases, 0)

	rows, err := conn.Query(ctx, sql, args...)
	if err != nil {
		return cases, err
	}

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
			return cases, err
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
	return cases, nil
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
	r.Get("/id", getStateIDs)
	r.Get("/", getStates)
}
