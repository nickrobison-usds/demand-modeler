package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/nickrobison-usds/demand-modeling/api"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"github.com/nickrobison-usds/demand-modeling/dbbackend"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli/v2"
)

func main() {

	// Initialize logger
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	app := &cli.App{
		Name: "Fearless Dreamer",
		Commands: []*cli.Command{
			cmd.USALoaderCMD(),
		},
		Action: runServer,
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal().Err(err).Send()
	}
}

func runServer(c *cli.Context) error {
	workDir, err := os.Getwd()
	if err != nil {
		log.Fatal().Err(err).Send()
	}
	filesDir := filepath.Join(workDir, "ui/build")

	url := getDBURL()
	// Do the migration
	err = migrateDatabase(url, workDir)

	// Load it up
	ctx := context.Background()
	backend, err := dbbackend.NewBackend(ctx, url)
	if err != nil {
		if err != nil {
			log.Fatal().Err(err).Send()
		}
	}
	defer backend.Shutdown()
	loader, err := cmd.NewLoader(ctx, url, filepath.Join(workDir, "data"))
	if err != nil {
		log.Fatal().Err(err).Send()
	}
	defer loader.Close()

	err = loader.Truncate()
	if err != nil {
		log.Fatal().Err(err).Send()
	}
	err = loader.LoadUSAFacts()
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	return serve(backend, filesDir)
}

func rootHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world"))
	}
}

func serve(backend api.DataBackend, filesDir string) error {
	r := chi.NewRouter()
	r.Use(api.BackendContext(backend))

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Setup CORS
	// Basic CORS
	// for more ideas, see: https://developer.github.com/v3/#cross-origin-resource-sharing
	cors := cors.New(cors.Options{
		// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})
	r.Use(cors.Handler)

	// Get the port
	var port string
	portenv := os.Getenv("PORT")
	if portenv == "" {
		port = "8080"
	} else {
		port = portenv
	}

	r.Route("/api", api.MakeRouter)
	FileServer(r, "", "/", http.Dir(filesDir))
	log.Printf("Listening on %s", port)
	return http.ListenAndServe(":"+port, r)
}

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, basePath string, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit URL parameters.")
	}
	fs := http.StripPrefix(basePath+path, http.FileServer(root))
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	})
}

func migrateDatabase(dbURL string, workDir string) error {
	migrationDir := fmt.Sprintf("file://%s", filepath.Join(workDir, "db", "migrations"))
	log.Printf("Connecting to %s from location: %s\n", dbURL, migrationDir)

	m, err := migrate.New(
		migrationDir,
		dbURL)
	if err != nil {
		return err
	}
	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		return err
	}
	return nil
}

func getDBURL() string {
	//if cfenv.IsRunningOnCF() {
	//	app, err := cfenv.Current()
	//	if err != nil {
	//		log.Fatal(err)
	//	}
	//
	//	serv, err := app.Services.WithName("fearless-dreamer-psql")
	//	if err != nil {
	//		log.Fatal(err)
	//	}
	//
	//	url, _ := serv.CredentialString("uri")
	//	return url
	//} else {
	return os.Getenv("DATABASE_URL")
	//}
}
