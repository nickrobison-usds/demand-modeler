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

func getCountIDs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	conn := ctx.Value("db").(*pgxpool.Pool)

	rows, err := conn.Query(ctx, "SELECT county || ', ' || state as name, id from counties")
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	ids := make(map[string]string, 0)
	for rows.Next() {
		var name string
		var id string
		err = rows.Scan(&name, &id)
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		ids[name] = id
	}

	err = json.NewEncoder(w).Encode(ids)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func getTopCounties(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	innerQuery := "SELECT c.ID, c.County, c.State, a.update, a.confirmed, a.newconfirmed, a.dead, a.newdead, ST_AsGeoJSON(t.geom) as geom from counties as c " +
		"LEFT JOIN cases as a ON c.id = a.geoid " +
		"ORDER BY a.update DESC, confirmed DESC "

	limit, ok := r.URL.Query()["limit"]
	if ok && len(limit) == 1 {
		innerQuery = fmt.Sprintf("%s LIMIT %s", innerQuery, limit[0])
	}

	// 							 SELECT c.ID, c.County, c.State, s.Update, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead, ST_AsGeoJSON(t.geom) as geom FROM counties as c
	query := fmt.Sprintf("SELECT c.ID, c.County, c.State, a.update, a.confirmed, a.newconfirmed, a.dead, a.newdead, ST_AsGeoJSON(t.geom) as geom from counties as c "+
		"LEFT JOIN cases as a "+
		"ON c.id = a.geoid "+
		"LEFT JOIN tiger as t "+
		"ON c.ID = t.geoid "+
		"WHERE c.ID in (SELECT Z.ID from (%s) AS Z) "+
		"ORDER BY c.ID, a.update DESC, confirmed DESC", innerQuery)

	cases, err := queryCountyCases(ctx, conn, query)
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
	conn, err := ctx.Value("db").(*pgxpool.Pool).Acquire(ctx)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	log.Println("Returning case data for county: " + countyID)

	query := "SELECT c.ID, c.County, c.State, s.Update, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead, ST_AsGeoJSON(t.geom) as geom FROM counties as c " +
		"LEFT JOIN tiger as t " +
		"ON c.ID = t.geoid " +
		"LEFT JOIN cases as s " +
		"ON s.geoid = c.ID WHERE c.id = $1 " +
		"ORDER BY update DESC;"

	cases, err := queryCountyCases(ctx, conn, query, countyID)
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

func queryCountyCases(ctx context.Context, conn *pgxpool.Conn, sql string, args ...interface{}) ([]cmd.CountyCases, error) {
	cases := make([]cmd.CountyCases, 0)

	rows, err := conn.Query(ctx, sql, args...)
	if err != nil {
		return cases, err
	}

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
	r.Get("/id", getCountIDs)
	r.Get("/", getTopCounties)
}
