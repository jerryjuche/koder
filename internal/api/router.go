package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// NewRouter builds the application router for Koder.
func NewRouter(cfg *config.Config, store store.Store) http.Handler {
	r := chi.NewRouter()

	r.Use(CORSMiddleware(cfg))

	authHandler := NewAuthHandler(store, cfg)
	problemHandler := NewProblemHandler(store)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		RespondSuccess(w, map[string]string{"status": "healthy"})
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware(cfg))
		r.Get("/problems", problemHandler.ListVisibleProblems)
		r.Get("/problems/{slug}", problemHandler.GetProblemBySlug)
	})

	return r
}
