package api

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/executor"
	"github.com/jerryjuche/koder/internal/store"
)

// NewRouter builds the application router for Koder.
func NewRouter(cfg *config.Config, store store.Store, exec *executor.Executor) (http.Handler, error) {
	r := chi.NewRouter()

	r.Use(CORSMiddleware(cfg))

	authHandler := NewAuthHandler(store, cfg)

	problemHandler := NewProblemHandler(store)
	submissionHandler := NewSubmissionHandler(store, exec)
	testHandler := NewTestHandler(store, exec)

	rateLimiter := NewRateLimiter(5, 45*time.Second)
	slog.Info("rate_limiter: enabled", "max_requests", 5, "window_seconds", 45)

	adminHandler, err := NewAdminHandler(store, cfg)
	if err != nil {
		return nil, err
	}

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		RespondSuccess(w, map[string]string{
			"status": "healthy",
			"time":   time.Now().UTC().String(),
		})
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/google", authHandler.GoogleAuth)
	})

	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware(cfg))

		meHandler := NewMeHandler(store)
		r.Get("/me", meHandler.GetMe)

		profileHandler := NewProfileHandler(store)
		r.Get("/me/profile", profileHandler.GetProfile)
		r.Put("/me/profile", profileHandler.UpdateProfile)

		activityHandler := NewActivityHandler(store)
		r.Get("/me/activity", activityHandler.GetActivity)

		contributionsHandler := NewContributionsHandler(store)
		r.Group(func(r chi.Router) {
			r.Use(VerifiedContributorOnly)
			r.Post("/user-problems", contributionsHandler.PostContribution)
		})
		r.Get("/me/contributions", contributionsHandler.GetMyContributions)

		// Onboarding routes
		r.Post("/auth/complete-google", authHandler.CompleteOnboarding)
		r.Post("/auth/complete-onboarding", authHandler.CompleteOnboarding)
		r.Get("/auth/check-username", authHandler.CheckUsername)
		r.Post("/auth/link-google", authHandler.LinkGoogle)

		notificationsHandler := NewNotificationsHandler(store)
		r.Get("/notifications", notificationsHandler.GetUnreadNotifications)
		r.Post("/notifications/read-all", notificationsHandler.MarkAllAsRead)
		r.Post("/notifications/{id}/read", notificationsHandler.MarkAsRead)

		leaderboardHandler := NewLeaderboardHandler(store)
		r.Get("/leaderboard", leaderboardHandler.GetLeaderboard)

		r.Get("/problems", problemHandler.ListVisibleProblems)
		r.Get("/problems/{slug}", problemHandler.GetProblemBySlug)

		communityHandler := NewCommunityHandler(store)
		r.Get("/problems/{slug}/community-solutions", communityHandler.GetCommunitySolutions)
		r.Get("/best-practices", communityHandler.GetBestPractices)
		r.Post("/submissions/{id}/like", communityHandler.LikeSubmission)
		r.Delete("/submissions/{id}/like", communityHandler.UnlikeSubmission)

		r.With(RateLimitMiddleware(rateLimiter)).Post("/submit", submissionHandler.Submit)
		r.With(RateLimitMiddleware(rateLimiter)).Post("/test", testHandler.Test)

		r.Group(func(r chi.Router) {
			r.Use(AdminOnly)
			r.Post("/admin/ingest", adminHandler.Ingest)
			r.Post("/admin/enrich", adminHandler.Enrich)
			r.Post("/admin/enrich-all", adminHandler.EnrichAll)
			r.Get("/admin/stats", adminHandler.GetAdminStats)
			r.Get("/admin/activity", adminHandler.GetAdminActivity)
			r.Get("/admin/problems", adminHandler.ListAllProblems)
			r.Patch("/admin/problems/{id}/visibility", adminHandler.ToggleVisibility)
			r.Post("/admin/problems/publish-all", adminHandler.PublishAllDrafts)
			r.Get("/admin/user-problems/pending", adminHandler.ListPendingUserProblems)
			r.Patch("/admin/user-problems/{id}/approve", adminHandler.ApproveUserProblem)
			r.Patch("/admin/user-problems/{id}/reject", adminHandler.RejectUserProblem)
		})
	})

	return r, nil
}
