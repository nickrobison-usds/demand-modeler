package main

import (
	"context"
	"github.com/jackc/pgx/v4"
	"github.com/nickrobison-usds/demand-modeling/cmd"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi"
)

func main() {
	// Load it up
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, "postgres://covid:goaway@localhost:5432/covid?sslmode=disable")
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
	err = serve(filesDir)
	if err != nil {
		log.Fatal(err)
	}

}

func rootHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world"))
	}
}

func serve(filesDir string) error {
	r := chi.NewRouter()

	r.Get("/api", rootHandler())
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
