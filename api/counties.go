package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/rs/zerolog/log"
)

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

func countyAPI(r chi.Router) {
	// For some reason, the URL param context doesn't work unless you use the .with directly on the methods
	r.Get("/", getTopCounties)
}
