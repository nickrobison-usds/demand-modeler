package api

import (
	"context"
	"time"

	"github.com/nickrobison-usds/demand-modeling/cmd"
)

type keyInterface interface{}

// BackendKey type for accessing backend from context
var BackendKey keyInterface = 0

// DataBackend defines the interface for retrieving required information from an abstract data source
type DataBackend interface {
	// County APIs
	GetTopCounties(ctx context.Context, start *time.Time) ([]cmd.CountyCases, error)
	// State APIs
	GetTopStates(ctx context.Context, start *time.Time) ([]cmd.StateCases, error)
}
