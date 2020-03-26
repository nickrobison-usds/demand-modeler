package api

import (
	"context"
	"net/http"

	"github.com/go-chi/chi"
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

// BackendContext injects the DataBackend into the http handler
func BackendContext(backend DataBackend) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), "db", backend)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// MakeRouter creates and returns the API routes
func MakeRouter(r chi.Router) {
	r.Get("/", rootHandler())
	r.Get("/sub", subHandler())
	r.Route("/county", countyAPI)
	r.Route("/state", stateAPI)
}
