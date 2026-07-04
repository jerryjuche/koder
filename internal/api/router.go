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
	r.Use(SecurityHeadersMiddleware)

	authHandler := NewAuthHandler(store, cfg)
	passwordResetHandler := NewPasswordResetHandler(store, cfg)
	pinResetHandler := NewPINResetHandler(store, cfg)

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

	// Auth endpoints: IP-based rate limiting (10 req/min)
	authRateLimiter := NewIPRateLimiter(10, 1*time.Minute)
	r.Route("/auth", func(r chi.Router) {
		r.Use(authRateLimiter.Middleware)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/register", authHandler.Register)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/login", authHandler.Login)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/google", authHandler.GoogleAuth)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/forgot-password", passwordResetHandler.ForgotPassword)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/reset-password", passwordResetHandler.ResetPassword)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/forgot-password-pin", pinResetHandler.ForgotPasswordPin)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/reset-password-pin", pinResetHandler.ResetPasswordPin)
	})

	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware(cfg, store))

		meHandler := NewMeHandler(store)
		r.Get("/me", meHandler.GetMe)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/me/delete-account", meHandler.DeleteAccount)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/logout", authHandler.Logout)

		profileHandler := NewProfileHandler(store)
		r.Get("/me/profile", profileHandler.GetProfile)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Put("/me/profile", profileHandler.UpdateProfile)

		activityHandler := NewActivityHandler(store)
		r.Get("/me/activity", activityHandler.GetActivity)

		contributionsHandler := NewContributionsHandler(store)
		r.Group(func(r chi.Router) {
			r.Use(VerifiedContributorOnly)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/user-problems", contributionsHandler.PostContribution)
		})
		r.Get("/me/contributions", contributionsHandler.GetMyContributions)

		// Onboarding routes
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/complete-google", authHandler.CompleteOnboarding)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/complete-onboarding", authHandler.CompleteOnboarding)
		r.Get("/auth/check-username", authHandler.CheckUsername)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/link-google", authHandler.LinkGoogle)

		notificationsHandler := NewNotificationsHandler(store)
		r.Get("/notifications", notificationsHandler.GetUnreadNotifications)
		r.Get("/notifications/recent", notificationsHandler.GetRecentNotifications)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/notifications/read-all", notificationsHandler.MarkAllAsRead)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/notifications/{id}/read", notificationsHandler.MarkAsRead)

		broadcastsHandler := NewBroadcastsHandler(store)
		r.Get("/me/broadcasts", broadcastsHandler.ListActive)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/me/broadcasts/{id}/dismiss", broadcastsHandler.Dismiss)

		feedbackHandler := NewFeedbackHandler(store, cfg)
		r.With(BodySizeLimitMiddleware(10 * 1024 * 1024)).Post("/feedback", feedbackHandler.Submit)
		r.Get("/feedback/mine", feedbackHandler.ListMine)

		leaderboardHandler := NewLeaderboardHandler(store)
		r.Get("/leaderboard", leaderboardHandler.GetLeaderboard)

		r.Get("/problems", problemHandler.ListVisibleProblems)
		r.Get("/problems/{slug}", problemHandler.GetProblemBySlug)

		communityHandler := NewCommunityHandler(store)
		r.Get("/problems/{slug}/community-solutions", communityHandler.GetCommunitySolutions)
		r.Get("/best-practices", communityHandler.GetBestPractices)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/submissions/{id}/like", communityHandler.LikeSubmission)
		r.Delete("/submissions/{id}/like", communityHandler.UnlikeSubmission)

		r.With(RateLimitMiddleware(rateLimiter), BodySizeLimitMiddleware(10*1024*1024)).Post("/submit", submissionHandler.Submit)
		r.With(RateLimitMiddleware(rateLimiter), BodySizeLimitMiddleware(10*1024*1024)).Post("/test", testHandler.Test)

		r.Group(func(r chi.Router) {
			r.Use(AdminOnly)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/ingest", adminHandler.Ingest)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/enrich", adminHandler.Enrich)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/enrich-all", adminHandler.EnrichAll)
			r.Get("/admin/stats", adminHandler.GetAdminStats)
			r.Get("/admin/activity", adminHandler.GetAdminActivity)
			r.Get("/admin/problems", adminHandler.ListAllProblems)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/problems/{id}/visibility", adminHandler.ToggleVisibility)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/problems/publish-all", adminHandler.PublishAllDrafts)
			r.Get("/admin/user-problems/pending", adminHandler.ListPendingUserProblems)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Patch("/admin/user-problems/{id}/approve", adminHandler.ApproveUserProblem)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Patch("/admin/user-problems/{id}/reject", adminHandler.RejectUserProblem)
			r.Get("/admin/broadcasts", broadcastsHandler.ListAll)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/admin/broadcasts", broadcastsHandler.Create)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/broadcasts/{id}/deactivate", broadcastsHandler.Deactivate)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/broadcasts/{id}", broadcastsHandler.Delete)

			r.Get("/admin/feedback", feedbackHandler.ListAdmin)
			r.Get("/admin/feedback/counts", feedbackHandler.Counts)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/feedback/{id}", feedbackHandler.UpdateStatus)
		})
	})

	return r, nil
}
