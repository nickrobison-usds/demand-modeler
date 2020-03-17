package main

import (
	"context"
	"github.com/go-chi/chi/middleware"
	"github.com/jackc/pgx/v4"
	"github.com/nickrobison-usds/demand-modeling/api"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
)

func main() {
	// Load it up
	ctx := context.Background()
	time.Sleep(10 * time.Second)
	conn, err := pgx.Connect(ctx, "postgres://covid:goaway@postgres:5432/covid?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(ctx)

	log.Println("Loading CoVid Cases")
	err = cmd.LoadCases(ctx, "./data/covid19_cases_county_fips.csv", conn)
	if err != nil {
		log.Fatal(err)
	}

	workDir, _ := os.Getwd()
	filesDir := filepath.Join(workDir, "ui/build")
	err = serve(conn, filesDir)
	if err != nil {
		log.Fatal(err)
	}

}

func rootHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world"))
	}
}

func serve(db *pgx.Conn, filesDir string) error {
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
