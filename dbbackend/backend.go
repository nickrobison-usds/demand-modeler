package dbbackend

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"github.com/rs/zerolog/log"
)

// DBBackend api.DataBackend for communicating with Postgres db
type DBBackend struct {
	pool *pgxpool.Pool
}

// NewBackend creates a new DBBackend
func NewBackend(ctx context.Context, url string) (*DBBackend, error) {
	// Create the pool
	pool, err := pgxpool.Connect(ctx, url)
	if err != nil {
		return nil, err
	}

	return &DBBackend{
		pool: pool,
	}, nil
}

//GetTopCounties fetches the counties with the highest number of confirmed cases
func (d *DBBackend) GetTopCounties(ctx context.Context, start *time.Time) ([]cmd.CountyCases, error) {
	log.Debug().Msg("Loading top counties")
	var cases []cmd.CountyCases = []cmd.CountyCases{}
	conn, err := d.pool.Acquire(ctx)
	if err != nil {
		return cases, err
	}
	defer conn.Release()

	log.Debug().Msg("Returning case data")

	query := "SELECT c.geoid, c.Update, c.Confirmed, c.Dead FROM cases as c "

	if start != nil {
		query = fmt.Sprintf("%s WHERE c.update > '%s' ", query, start.Format(time.RFC3339))
	}

	query = query + "ORDER BY c.geoid, c.update DESC, c.Confirmed DESC;"

	cases, err = queryCountyCases(ctx, conn, query)
	if err != nil {
		return cases, err
	}

	return cases, nil
}

func (d *DBBackend) GetTopStates(ctx context.Context, start *time.Time) ([]cmd.StateCases, error) {
	var cases []cmd.StateCases = []cmd.StateCases{}
	conn, err := d.pool.Acquire(ctx)
	if err != nil {
		return cases, err
	}
	defer conn.Release()

	query := "SELECT substring(c.geoid, 1, 2), c.Update, SUM(c.Confirmed) as confirmed, SUM(c.Dead) FROM cases as c "

	if start != nil {
		query = fmt.Sprintf("%s WHERE c.update > '%s' ", query, start.Format(time.RFC3339))
	}
	query = query + "GROUP BY substring(c.geoid, 1, 2), c.update " +
		"ORDER BY substring(c.geoid, 1, 2), c.update;"

	cases, err = queryStateCases(ctx, conn, query)
	if err != nil {
		return cases, err
	}

	return cases, nil
}

// Shutdown closes all connections and releases all resources
func (d *DBBackend) Shutdown() {
	d.pool.Close()
}

func queryCountyCases(ctx context.Context, conn *pgxpool.Conn, sql string, args ...interface{}) ([]cmd.CountyCases, error) {
	cases := make([]cmd.CountyCases, 0)

	rows, err := conn.Query(ctx, sql, args...)
	if err != nil {
		return cases, err
	}

	log.Debug().Msg("Case counties are loaded")
	for rows.Next() {
		var id string
		var updated time.Time
		var confirmed int
		var dead int
		err := rows.Scan(&id, &updated, &confirmed, &dead)
		if err != nil {
			return cases, err
		}

		caseCount := &cmd.CaseCount{
			Confirmed:    confirmed,
			Dead:         dead,
			Reported:     updated,
		}

		cases = append(cases, cmd.CountyCases{
			ID:        id,
			CaseCount: caseCount,
		})
	}

	return cases, nil
}

func queryStateCases(ctx context.Context, conn *pgxpool.Conn, sql string, args ...interface{}) ([]cmd.StateCases, error) {
	cases := make([]cmd.StateCases, 0)

	rows, err := conn.Query(ctx, sql, args...)
	if err != nil {
		return cases, err
	}

	for rows.Next() {
		var id string
		var confirmed int
		var dead int
		var reported time.Time
		err := rows.Scan(&id, &reported, &confirmed, &dead)
		if err != nil {
			return cases, err
		}
		caseCount := &cmd.CaseCount{
			Confirmed:    confirmed,
			Dead:         dead,
			Reported:     reported,
		}

		cases = append(cases, cmd.StateCases{
			ID:        id,
			CaseCount: caseCount,
		})
	}
	return cases, nil
}
