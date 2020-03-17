package api

import (
	"context"
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v4"
	"log"
	"net/http"
)

type Case struct {
	ID        int
	County    string
	State     string
	Confirmed int
	Geo       *json.RawMessage
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
		conn := ctx.Value("db").(*pgx.Conn)

		rows, err := conn.Query(ctx, "SELECT c.ID, c.County, c.State, c.Confirmed, ST_AsGeoJSON(t.geom) as geom FROM cases as c "+
			"LEFT JOIN tiger as t "+
			"ON c.Geoid = t.geoid;")
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		cases := make([]Case, 0)

		for rows.Next() {
			var id int
			var county string
			var state string
			var confirmed int
			geo := &json.RawMessage{}
			err := rows.Scan(&id, &county, &state, &confirmed, geo)
			if err != nil {
				log.Print(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			cases = append(cases, Case{
				ID:        id,
				County:    county,
				State:     state,
				Confirmed: confirmed,
				Geo:       geo,
			})
		}
		err = json.NewEncoder(w).Encode(cases)
		if err != nil {
			log.Print(err)
		}
	}
}

func DBContext(conn *pgx.Conn) func(next http.Handler) http.Handler {
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
