package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/rs/zerolog/log"
)


func getStates(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	backend := ctx.Value(BackendKey).(DataBackend)

	var t *time.Time = nil
	start, ok := r.URL.Query()["start"]
	if ok && len(start) == 1 {
		startTime, err := time.Parse(time.RFC3339, start[0])
		if err != nil {
			log.Error().Err(err).Msg("Cannot decode start time parameter")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		t = &startTime
	}
	cases, err := backend.GetTopStates(ctx, t)
	if err != nil {
		log.Error().Err(err).Msg("Cannot query for state cases")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(cases)
	if err != nil {
		log.Error().Err(err).Msg("Cannot encode to json")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func stateAPI(r chi.Router) {
	r.Get("/", getStates)
}
