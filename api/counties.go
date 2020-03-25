package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"github.com/rs/zerolog/log"
)

func getCountIDs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Get DB from context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	rows, err := conn.Query(ctx, "SELECT county || ', ' || state as name, id from counties")
	if err != nil {
		log.Error().Err(err).Msg("Cannot execute County ID query")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	ids := make(map[string]string, 0)
	for rows.Next() {
		var name string
		var id string
		err = rows.Scan(&name, &id)
		if err != nil {
			log.Error().Err(err).Msg("Cannot read row from database")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		ids[name] = id
	}

	err = json.NewEncoder(w).Encode(ids)
	if err != nil {
		log.Error().Err(err).Msg("Cannot write to json")
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func getTopCounties(w http.ResponseWriter, r *http.Request) {
	log.Debug().Msg("Loading top counties")
	ctx := r.Context()
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Get DB from context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	log.Debug().Msg("Returning case data")

	query := "SELECT c.ID, c.County, c.State, s.Update, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead FROM counties as c " +
		"LEFT JOIN cases as s " +
		"ON s.geoid = c.ID "

	start, ok := r.URL.Query()["start"]
	if ok && len(start) == 1 {
		startTime, err := time.Parse(time.RFC3339, start[0])
		if err != nil {
			log.Error().Err(err).Msg("Cannot parse start query param")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		query = fmt.Sprintf("%s WHERE s.update > '%s' ", query, startTime.Format(time.RFC3339))
	}

	query = query + "ORDER BY c.ID, s.update DESC, s.Confirmed DESC;"

	cases, err := queryCountyCasesb(ctx, conn, query)
	if err != nil {
		log.Error().Err(err).Msg("Cannot execute county queries")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Debug().Msg("Ready to return")
	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Error().Err(err).Msg("Cannot write to json")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func getCountyGeo(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	countyID := ctx.Value("countyID").(string)
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Get DB from context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	geo := &json.RawMessage{}
	err = conn.QueryRow(ctx, "SELECT ST_AsGeoJSON(t.geom) as geom FROM counties as c "+
		"LEFT JOIN tiger as t "+
		"ON c.ID = t.geoid "+
		"WHERE c.id = $1;", countyID).Scan(geo)
	if err != nil {
		log.Error().Err(err).Msg("Cannot execute geo query")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(geo)
	if err != nil {
		log.Error().Err(err).Msg("Cannot write to json")
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func getCountyCases(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	countyID := ctx.Value("countyID").(string)
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Get DB from context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	log.Debug().Msgf("Returning case data for county: %s\n" + countyID)

	query := "SELECT c.ID, c.County, c.State, s.Update, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead, ST_AsGeoJSON(t.geom) as geom FROM counties as c " +
		"LEFT JOIN tiger as t " +
		"ON c.ID = t.geoid " +
		"LEFT JOIN cases as s " +
		"ON s.geoid = c.ID WHERE c.id = $1 " +
		"ORDER BY update DESC;"

	cases, err := queryCountyCases(ctx, conn, query, countyID)
	if err != nil {
		log.Error().Err(err).Msg("Cannot execute county cases query")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Debug().Msg("Ready to return")
	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Error().Err(err).Msg("Cannot write to json")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func queryCountyCases(ctx context.Context, conn *pgxpool.Conn, sql string, args ...interface{}) ([]cmd.CountyCases, error) {
	cases := make([]cmd.CountyCases, 0)

	rows, err := conn.Query(ctx, sql, args...)
	if err != nil {
		return cases, err
	}

	log.Debug().Msg("Case counties are loaded")
	for rows.Next() {
		var id string
		var county string
		var state string
		var updated time.Time
		var confirmed int
		var newConfirmed int
		var dead int
		var newDead int
		geo := &json.RawMessage{}
		err := rows.Scan(&id, &county, &state, &updated, &confirmed, &newConfirmed, &dead, &newDead, geo)
		if err != nil {
			return cases, err
		}

		caseCount := &cmd.CaseCount{
			Confirmed:    confirmed,
			NewConfirmed: newConfirmed,
			Dead:         dead,
			NewDead:      newDead,
			Reported:     updated,
		}

		cases = append(cases, cmd.CountyCases{
			ID:        id,
			County:    county,
			State:     state,
			CaseCount: caseCount,
		})
	}

	return cases, nil
}

func queryCountyCasesb(ctx context.Context, conn *pgxpool.Conn, sql string, args ...interface{}) ([]cmd.CountyCases, error) {
	cases := make([]cmd.CountyCases, 0)

	rows, err := conn.Query(ctx, sql, args...)
	if err != nil {
		return cases, err
	}

	log.Debug().Msg("Case counties are loaded")
	for rows.Next() {
		var id string
		var county string
		var state string
		var updated time.Time
		var confirmed int
		var newConfirmed int
		var dead int
		var newDead int
		err := rows.Scan(&id, &county, &state, &updated, &confirmed, &newConfirmed, &dead, &newDead)
		if err != nil {
			return cases, err
		}

		caseCount := &cmd.CaseCount{
			Confirmed:    confirmed,
			NewConfirmed: newConfirmed,
			Dead:         dead,
			NewDead:      newDead,
			Reported:     updated,
		}

		cases = append(cases, cmd.CountyCases{
			ID:        id,
			County:    county,
			State:     state,
			CaseCount: caseCount,
		})
	}

	return cases, nil
}

func countyCTX(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		countyID := chi.URLParam(r, "countyID")
		log.Debug().Msgf("ID from param: %s\n", countyID)
		ctx := context.WithValue(r.Context(), "countyID", countyID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func countyAPI(r chi.Router) {
	// For some reason, the URL param context doesn't work unless you use the .with directly on the methods
	r.With(countyCTX).Get("/{countyID}", getCountyCases)
	r.With(countyCTX).Get("/{countyID}/geo", getCountyGeo)
	r.Get("/id", getCountIDs)
	r.Get("/", getTopCounties)
}
