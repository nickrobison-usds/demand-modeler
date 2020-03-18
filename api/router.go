package api

import (
	"context"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v4/pgxpool"
	"net/http"
)

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
	r.Route("/county", countyAPI)
}
