package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/rs/zerolog/log"
)

func getCountIDs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	backend := ctx.Value(BackendKey).(DataBackend)

	ids, err := backend.GetCountyIDs(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Cannot write to json")
		w.WriteHeader(http.StatusInternalServerError)
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
	backend := ctx.Value(BackendKey).(DataBackend)

	var startTime *time.Time = nil
	start, ok := r.URL.Query()["start"]
	if ok && len(start) == 1 {
		t, err := time.Parse(time.RFC3339, start[0])
		if err != nil {
			log.Error().Err(err).Msg("Cannot parse start query param")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		startTime = &t
	}

	cases, err := backend.GetTopCounties(ctx, startTime)
	if err != nil {
		log.Error().Err(err).Msg("Cannot get top queries")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Error().Err(err).Msg("Cannot write to json")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func getCountyCases(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	countyID := ctx.Value("countyID").(string)
	backend := ctx.Value(BackendKey).(DataBackend)

	cases, err := backend.GetCountyCases(ctx, countyID)
	if err != nil {
		log.Error().Err(err).Msg("Cannot get county cases")
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
	r.Get("/id", getCountIDs)
	r.Get("/", getTopCounties)
}
