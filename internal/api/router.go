package api

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jerryjuche/koder/internal/broker"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/executor"
	storepkg "github.com/jerryjuche/koder/internal/store"
)

// App holds the HTTP handler and lifecycle-managed resources that need
// clean shutdown (rate limiters, caches, etc.).
type App struct {
	Handler         http.Handler
	rateLimiter     *RateLimiter
	authRateLimiter *IPRateLimiter
	aiRateLimiter   *RateLimiter
}

// Shutdown stops all background goroutines managed by the API layer.
func (a *App) Shutdown() {
	a.rateLimiter.Stop()
	a.authRateLimiter.Stop()
	a.aiRateLimiter.Stop()
	StopCaches()
}

// NewRouter builds the application router for Koder.
func NewRouter(cfg *config.Config, store storepkg.Store, exec *executor.Executor, b *broker.Broker) (*App, error) {
	r := chi.NewRouter()

	r.Use(RecoveryMiddleware)
	r.Use(RequestLoggingMiddleware)
	r.Use(CORSMiddleware(cfg))
	r.Use(SecurityHeadersMiddleware(cfg))

	authHandler := NewAuthHandler(store, cfg)
	passwordResetHandler := NewPasswordResetHandler(store, cfg)
	pinResetHandler := NewPINResetHandler(store, cfg)
	changePasswordHandler := NewChangePasswordHandler(store, cfg)

	problemHandler := NewProblemHandler(store)
	submissionHandler := NewSubmissionHandler(store, exec, b)
	testHandler := NewTestHandler(store, exec)

	cmHandler := NewCMHandler(store, b)

	rateLimiter := NewRateLimiter(5, 45*time.Second)
	slog.Info("rate_limiter: enabled", "max_requests", 5, "window_seconds", 45)

	aiRateLimiter := NewRateLimiter(15, 1*time.Minute)
	slog.Info("ai_rate_limiter: enabled", "max_requests", 15, "window_seconds", 60)

	adminHandler, err := NewAdminHandler(store, cfg, b)
	if err != nil {
		return nil, err
	}

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		dbErr := store.Ping(r.Context())
		dbStatus := "ok"
		httpStatus := http.StatusOK
		overallStatus := "healthy"
		if dbErr != nil {
			dbStatus = "error"
			httpStatus = http.StatusServiceUnavailable
			overallStatus = "degraded"
		}
		respondJSON(w, httpStatus, map[string]any{
			"status":      overallStatus,
			"time":        time.Now().UTC().String(),
			"db_status":   dbStatus,
			"db_ms":       time.Since(start).Milliseconds(),
			"sandbox_url": cfg.SandboxURL,
			"environment": cfg.Environment,
		}, nil)
	})

	r.Get("/version", func(w http.ResponseWriter, r *http.Request) {
		RespondSuccess(w, map[string]string{
			"commit": cfg.BuildCommit,
			"build":  cfg.BuildTime,
			"go":     cfg.GoVersion,
		})
	})

	// Auth endpoints: IP-based rate limiting (10 req/min)
	authRateLimiter := NewIPRateLimiter(10, 1*time.Minute)
	r.Route("/auth", func(r chi.Router) {
		r.Use(authRateLimiter.Middleware)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/register", authHandler.Register)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/login", authHandler.Login)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/google", authHandler.GoogleAuth)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/refresh", authHandler.RefreshToken)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/forgot-password", passwordResetHandler.ForgotPassword)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/reset-password", passwordResetHandler.ResetPassword)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/forgot-password-pin", pinResetHandler.ForgotPasswordPin)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/reset-password-pin", pinResetHandler.ResetPasswordPin)
		r.Get("/check-username", authHandler.CheckUsername)
	})

	// Public curriculum CMS — no auth required
	r.Get("/learn/courses", cmHandler.ListPublishedCourses)
	r.Get("/learn/courses/{courseSlug}", cmHandler.GetCourseDetail)
	r.Get("/learn/courses/{courseSlug}/modules/{moduleSlug}", cmHandler.GetModuleDetail)
	r.Get("/learn/courses/{courseSlug}/modules/{moduleSlug}/lessons/{lessonSlug}", cmHandler.GetLessonDetail)

	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware(cfg, store))

		meHandler := NewMeHandler(store)
		r.Get("/me", meHandler.GetMe)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Put("/me/username", meHandler.SetUsername)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Put("/me/language", meHandler.UpdateLanguage)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Get("/me/export-data", meHandler.ExportData)
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
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/link-google", authHandler.LinkGoogle)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/change-password", changePasswordHandler.ChangePassword)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/verify-pin", changePasswordHandler.VerifyPin)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/auth/set-pin", changePasswordHandler.SetPin)

		notificationsHandler := NewNotificationsHandler(store)
		r.Get("/notifications", notificationsHandler.GetUnreadNotifications)
		r.Get("/notifications/recent", notificationsHandler.GetRecentNotifications)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/notifications/read-all", notificationsHandler.MarkAllAsRead)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/notifications/{id}/read", notificationsHandler.MarkAsRead)

		broadcastsHandler := NewBroadcastsHandler(store, b)
		r.Get("/me/broadcasts", broadcastsHandler.ListActive)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/me/broadcasts/{id}/dismiss", broadcastsHandler.Dismiss)

		feedbackHandler := NewFeedbackHandler(store, cfg, b)
		r.With(BodySizeLimitMiddleware(10 * 1024 * 1024)).Post("/feedback", feedbackHandler.Submit)
		r.Get("/feedback/mine", feedbackHandler.ListMine)

		leaderboardHandler := NewLeaderboardHandler(store)
		r.Get("/leaderboard", leaderboardHandler.GetLeaderboard)

		usersHandler := NewUsersHandler(store)
		r.Get("/users/{id}", usersHandler.GetUserPublicData)

		r.Get("/problems", problemHandler.ListVisibleProblems)
		r.Get("/problems/{slug}", problemHandler.GetProblemBySlug)

		communityHandler := NewCommunityHandler(store)
		r.Get("/problems/{slug}/community-solutions", communityHandler.GetCommunitySolutions)
		r.Get("/best-practices", communityHandler.GetBestPractices)
		r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/submissions/{id}/like", communityHandler.LikeSubmission)
		r.Delete("/submissions/{id}/like", communityHandler.UnlikeSubmission)

		r.With(RateLimitMiddleware(rateLimiter), BodySizeLimitMiddleware(10*1024*1024)).Post("/submit", submissionHandler.Submit)
		r.With(RateLimitMiddleware(rateLimiter), BodySizeLimitMiddleware(10*1024*1024)).Post("/test", testHandler.Test)

		// Curriculum CMS — student endpoints (auth required)
		r.Get("/learn/progress", cmHandler.GetAllProgress)
		r.With(BodySizeLimitMiddleware(256 * 1024)).Post("/learn/lessons/{lessonId}/complete", cmHandler.CompleteLesson)

		r.Group(func(r chi.Router) {
			r.Use(AdminOnly)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/ingest", adminHandler.Ingest)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/enrich", adminHandler.Enrich)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/enrich-all", adminHandler.EnrichAll)
			r.With(AIRateLimitMiddleware(aiRateLimiter), BodySizeLimitMiddleware(1*1024*1024)).Post("/admin/ai/assist", adminHandler.AIAssist)
			r.Get("/admin/ai/usage", adminHandler.GetAIUsage)
			r.Get("/admin/stats", adminHandler.GetAdminStats)
			r.Get("/admin/activity", adminHandler.GetAdminActivity)
			r.Get("/admin/problems", adminHandler.ListAllProblems)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/problems/{id}/visibility", adminHandler.ToggleVisibility)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Put("/admin/problems/{id}", adminHandler.UpdateProblem)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/problems/publish-all", adminHandler.PublishAllDrafts)
			r.Get("/admin/user-problems/pending", adminHandler.ListPendingUserProblems)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Patch("/admin/user-problems/{id}/approve", adminHandler.ApproveUserProblem)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Patch("/admin/user-problems/{id}/reject", adminHandler.RejectUserProblem)
			r.Get("/admin/broadcasts", broadcastsHandler.ListAll)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/admin/broadcasts", broadcastsHandler.Create)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/broadcasts/{id}/deactivate", broadcastsHandler.Deactivate)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/broadcasts/{id}/activate", broadcastsHandler.Activate)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/broadcasts/{id}", broadcastsHandler.Delete)

			r.Get("/admin/feedback", feedbackHandler.ListAdmin)
			r.Get("/admin/feedback/counts", feedbackHandler.Counts)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/feedback/{id}", feedbackHandler.UpdateStatus)

			r.Get("/admin/problem-reports", feedbackHandler.ListProblemReports)
			r.Get("/admin/users/search", adminHandler.SearchUsers)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/users/{id}/verified", adminHandler.ToggleUserVerified)

			// Problem module locks
			r.Get("/admin/module-locks", adminHandler.ListProblemModuleLocks)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/admin/module-locks/{moduleName}", adminHandler.ToggleProblemModuleLock)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/problem-modules/{moduleName}", adminHandler.DeleteProblemModule)

			// Module metadata (display names, pinning)
			r.Get("/admin/module-meta", adminHandler.ListModuleMeta)
			r.With(BodySizeLimitMiddleware(256 * 1024)).Put("/admin/module-meta/{moduleName}", adminHandler.UpsertModuleMeta)
			r.With(BodySizeLimitMiddleware(256 * 1024)).Patch("/admin/module-meta/{moduleName}/pin", adminHandler.SetModulePin)

			// Curriculum CMS — admin endpoints
			r.Get("/admin/courses", cmHandler.ListAllCourses)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/admin/courses", cmHandler.CreateCourse)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Put("/admin/courses/{courseId}", cmHandler.UpdateCourse)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/courses/{courseId}", cmHandler.DeleteCourse)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/courses/{courseId}/visibility", cmHandler.ToggleCourseVisibility)
			r.Get("/admin/courses/{courseId}/modules", cmHandler.ListModules)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/admin/courses/{courseId}/modules", cmHandler.CreateModule)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Put("/admin/modules/{moduleId}", cmHandler.UpdateModule)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/modules/{moduleId}", cmHandler.DeleteModule)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/modules/{moduleId}/visibility", cmHandler.ToggleModuleVisibility)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/modules/{moduleId}/lock", cmHandler.ToggleModuleLock)
			r.Get("/admin/modules/{moduleId}/lessons", cmHandler.ListLessons)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/modules/{moduleId}/lessons", cmHandler.CreateLesson)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Put("/admin/lessons/{lessonId}", cmHandler.UpdateLesson)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/lessons/{lessonId}", cmHandler.DeleteLesson)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/lessons/{lessonId}/visibility", cmHandler.ToggleLessonVisibility)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/admin/lessons/{lessonId}/problems", cmHandler.LinkProblemToLesson)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Put("/admin/lessons/{lessonId}/dependencies", cmHandler.UpdateLessonDependencies)
			r.Get("/admin/lessons/{lessonId}/projects", cmHandler.ListProjects)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Post("/admin/lessons/{lessonId}/projects", cmHandler.CreateProject)
			r.With(BodySizeLimitMiddleware(5 * 1024 * 1024)).Put("/admin/projects/{projectId}", cmHandler.UpdateProject)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/projects/{projectId}", cmHandler.DeleteProject)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Patch("/admin/projects/{projectId}/visibility", cmHandler.ToggleProjectVisibility)

			// Section CRUD
			r.Get("/admin/lessons/{lessonId}/sections", cmHandler.ListLessonSections)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Post("/admin/lessons/{lessonId}/sections", cmHandler.CreateSection)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Put("/admin/sections/{sectionId}", cmHandler.UpdateSection)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Delete("/admin/sections/{sectionId}", cmHandler.DeleteSection)
			r.With(BodySizeLimitMiddleware(1 * 1024 * 1024)).Put("/admin/lessons/{lessonId}/sections/reorder", cmHandler.ReorderSections)
		})

		// Module metadata — student-facing (read-only, for display names + pin ordering)
		r.Get("/me/module-meta", func(w http.ResponseWriter, r *http.Request) {
			metas, err := store.ListModuleMeta(r.Context())
			if err != nil {
				slog.Error("module_meta: failed to list", "error", err)
				RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list module metadata", nil)
				return
			}
			if metas == nil {
				metas = []storepkg.ModuleMeta{}
			}
			RespondSuccess(w, metas)
		})

		// Problem module locks — public (student-facing)
		r.Get("/me/module-locks", func(w http.ResponseWriter, r *http.Request) {
			locks, err := store.ListLockedModules(r.Context())
			if err != nil {
				slog.Error("module_locks: failed to list", "error", err)
				RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list module locks", nil)
				return
			}
			if locks == nil {
				locks = []storepkg.ModuleLock{}
			}
			RespondSuccess(w, locks)
		})

		wsHandler := NewWSHandler(b)
		r.Get("/ws", wsHandler.ServeHTTP)
	})

	return &App{
		Handler:         r,
		rateLimiter:     rateLimiter,
		authRateLimiter: authRateLimiter,
		aiRateLimiter:   aiRateLimiter,
	}, nil
}
