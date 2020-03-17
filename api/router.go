package api

import (
	"context"
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v4/pgxpool"
	"log"
	"net/http"
)

type Case struct {
	ID           string
	County       string
	State        string
	Confirmed    int
	NewConfirmed int
	Dead         int
	NewDead      int
	Geo          *json.RawMessage
}

func rootHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world"))
	}
}

func subHandler() http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		writer.Write([]byte("Sub route"))
	}
}

func caseHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		conn := ctx.Value("db").(*pgxpool.Pool)

		rows, err := conn.Query(ctx, "SELECT c.ID, c.County, c.State, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead, ST_AsGeoJSON(t.geom) as geom FROM counties as c "+
			"LEFT JOIN tiger as t "+
			"ON c.ID = t.geoid "+
			"LEFT JOIN cases as s "+
			"ON s.geoid = c.ID;")
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		cases := make([]Case, 0)

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

			cases = append(cases, Case{
				ID:           id,
				County:       county,
				State:        state,
				Confirmed:    confirmed,
				NewConfirmed: newConfirmed,
				Dead:         dead,
				NewDead:      newDead,
				Geo:          geo,
			})
		}
		err = json.NewEncoder(w).Encode(cases)
		if err != nil {
			log.Print(err)
		}
	}
}

func DBContext(conn *pgxpool.Pool) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), "db", conn)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func MakeRouter(r chi.Router) {
	r.Get("/", rootHandler())
	r.Get("/sub", subHandler())
	r.Get("/cases", caseHandler())
}
