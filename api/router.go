package api

import (
	"context"
	"net/http"

	"github.com/go-chi/chi"
)

// BackendContext injects the DataBackend into the http handler
func BackendContext(backend DataBackend) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), BackendKey, backend)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// MakeRouter creates and returns the API routes
func MakeRouter(r chi.Router) {
	r.Route("/county", countyAPI)
	r.Route("/state", stateAPI)
}
