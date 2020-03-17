package main

import (
	"context"
	"github.com/go-chi/chi/middleware"
	"github.com/nickrobison-usds/demand-modeling/api"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"

	"github.com/jackc/pgx/v4/pgxpool"
	_ "github.com/urfave/cli/v2"
)

func main() {

	log.Println("Server starting")

	pgURL := "postgres://covid:goaway@localhost:5432/covid?sslmode=disable"

	//app := &cli.App{
	//	Action: func(c *cli.Context) error {
	//	},
	//}
	workDir, _ := os.Getwd()
	// Load it up
	ctx := context.Background()
	loader, err := cmd.NewLoader(ctx, pgURL, filepath.Join(workDir, "data"))
	if err != nil {
		log.Fatal(err)
	}
	defer loader.Close()

	err = loader.Load()
	if err != nil {
		log.Fatal(err)
	}

	pool, err := pgxpool.Connect(ctx, pgURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	filesDir := filepath.Join(workDir, "ui/build")
	err = serve(pool, filesDir)
	if err != nil {
		log.Fatal(err)
	}
}

func rootHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world"))
	}
}

func serve(db *pgxpool.Pool, filesDir string) error {
	r := chi.NewRouter()
	r.Use(api.DBContext(db))

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

	r.Route("/api", api.MakeRouter)
	FileServer(r, "", "/", http.Dir(filesDir))
	log.Println("Listening")
	return http.ListenAndServe(":8080", r)
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
