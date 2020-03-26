package dbbackend

import (
	"context"
	"encoding/json"
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

func (d *DBBackend) GetCountyIDs(ctx context.Context) (map[string]string, error) {
	ids := make(map[string]string, 0)
	conn, err := d.pool.Acquire(ctx)
	if err != nil {
		return ids, err
	}
	defer conn.Release()

	rows, err := conn.Query(ctx, "SELECT county || ', ' || state as name, id from counties")
	if err != nil {
		log.Error().Err(err).Msg("Cannot execute County ID query")
		return ids, err
	}
	for rows.Next() {
		var name string
		var id string
		err = rows.Scan(&name, &id)
		if err != nil {
			log.Error().Err(err).Msg("Cannot read row from database")
			return ids, err
		}
		ids[name] = id
	}

	return ids, nil
}

func (d *DBBackend) GetTopCounties(ctx context.Context, start *time.Time) ([]cmd.CountyCases, error) {
	log.Debug().Msg("Loading top counties")
	var cases []cmd.CountyCases = []cmd.CountyCases{}
	conn, err := d.pool.Acquire(ctx)
	if err != nil {
		return cases, err
	}
	defer conn.Release()

	log.Debug().Msg("Returning case data")

	query := "SELECT c.ID, c.County, c.State, s.Update, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead FROM counties as c " +
		"LEFT JOIN cases as s " +
		"ON s.geoid = c.ID "

	if start != nil {
		query = fmt.Sprintf("%s WHERE s.update > '%s' ", query, start.Format(time.RFC3339))
	}

	query = query + "ORDER BY c.ID, s.update DESC, s.Confirmed DESC;"

	cases, err = queryCountyCases(ctx, conn, query)
	if err != nil {
		return cases, err
	}

	return cases, nil
}

func (d *DBBackend) GetCountyCases(ctx context.Context, countyID string) ([]cmd.CountyCases, error) {
	var cases []cmd.CountyCases = []cmd.CountyCases{}
	conn, err := d.pool.Acquire(ctx)
	if err != nil {
		return cases, err
	}
	defer conn.Release()

	log.Debug().Msgf("Returning case data for county: %s\n" + countyID)

	query := "SELECT c.ID, c.County, c.State, s.Update, s.Confirmed, s.NewConfirmed, s.Dead, s.NewDead, ST_AsGeoJSON(t.geom) as geom FROM counties as c " +
		"LEFT JOIN tiger as t " +
		"ON c.ID = t.geoid " +
		"LEFT JOIN cases as s " +
		"ON s.geoid = c.ID WHERE c.id = $1 " +
		"ORDER BY update DESC;"

	cases, err = queryCountyCases(ctx, conn, query, countyID)
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

	query := "SELECT c.statefp, c.State, s.Update, SUM(s.Confirmed) as confirmed, SUM(s.NewConfirmed), SUM(s.Dead), SUM(s.NewDead) FROM counties as c " +
		"LEFT JOIN cases as s " +
		"ON s.geoid = c.ID "

	if start != nil {
		query = fmt.Sprintf("%s WHERE s.update > '%s' ", query, start.Format(time.RFC3339))
	}
	query = query + "GROUP BY c.statefp, c.state, s.update " +
		"ORDER BY c.state, s.update;"

	cases, err = queryStateCases(ctx, conn, query)
	if err != nil {
		return cases, err
	}

	return cases, nil
}

func (d *DBBackend) GetStateCases(ctx context.Context, stateID string) ([]cmd.StateCases, error) {
	log.Debug().Msgf("Returning case data for state: %s", stateID)
	var cases []cmd.StateCases = []cmd.StateCases{}
	conn, err := d.pool.Acquire(ctx)
	if err != nil {
		return cases, err
	}
	defer conn.Release()

	query := "SELECT c.statefp, c.state, a.update, SUM(a.confirmed) as confirmed, SUM(a.newconfirmed), SUM(a.dead), SUM(a.newdead) from counties as c " +
		"LEFT JOIN cases as a ON c.id = a.geoid " +
		"WHERE c.statefp = $1 " +
		"GROUP BY c.statefp, c.state, a.update " +
		"ORDER BY a.update DESC, confirmed DESC"

	cases, err = queryStateCases(ctx, conn, query, stateID)
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
		var county string
		var state string
		var updated time.Time
		var confirmed int
		var newConfirmed int
		var dead int
		var newDead int
		geo := &json.RawMessage{}
		err := rows.Scan(&id, &county, &state, &updated, &confirmed, &newConfirmed, &dead, &newDead, geo)
		if err != nil {
			return cases, err
		}

		caseCount := &cmd.CaseCount{
			Confirmed:    confirmed,
			NewConfirmed: newConfirmed,
			Dead:         dead,
			NewDead:      newDead,
			Reported:     updated,
		}

		cases = append(cases, cmd.CountyCases{
			ID:        id,
			County:    county,
			State:     state,
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
		var state string
		var confirmed int
		var newConfirmed int
		var dead int
		var newDead int
		var reported time.Time
		err := rows.Scan(&id, &state, &reported, &confirmed, &newConfirmed, &dead, &newDead)
		if err != nil {
			return cases, err
		}
		caseCount := &cmd.CaseCount{
			Confirmed:    confirmed,
			NewConfirmed: newConfirmed,
			Dead:         dead,
			NewDead:      newDead,
			Reported:     reported,
		}

		cases = append(cases, cmd.StateCases{
			ID:        id,
			State:     state,
			CaseCount: caseCount,
		})
	}
	return cases, nil
}
