package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/store"
)

// CMHandler handles curriculum management endpoints.
type CMHandler struct {
	store store.Store
}

// NewCMHandler creates a new curriculum management handler.
func NewCMHandler(s store.Store) *CMHandler {
	return &CMHandler{store: s}
}

// ── Student Endpoints ──

// ListPublishedCourses returns all visible courses for students.
func (h *CMHandler) ListPublishedCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := h.store.ListCourses(r.Context())
	if err != nil {
		slog.Error("cms: failed to list courses", "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list courses", nil)
		return
	}

	visible := make([]store.Course, 0, len(courses))
	for _, c := range courses {
		if c.Visible {
			visible = append(visible, c)
		}
	}
	if visible == nil {
		visible = []store.Course{}
	}

	RespondSuccess(w, visible)
}

// GetCourseDetail returns a course with its modules, lessons, and user progress.
func (h *CMHandler) GetCourseDetail(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "courseSlug")
	if slug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "course slug is required", nil)
		return
	}

	course, err := h.store.GetCourseBySlug(r.Context(), slug)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Course not found", nil)
			return
		}
		slog.Error("cms: failed to get course", "slug", slug, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to get course", nil)
		return
	}

	claims := GetClaims(r.Context())
	userID, _ := uuid.Parse(claims.UserID)

	modules, err := h.store.ListModules(r.Context(), course.ID.Bytes)
	if err != nil {
		slog.Error("cms: failed to list modules", "course_id", course.ID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list modules", nil)
		return
	}

	visibleMods := make([]store.Module, 0, len(modules))
	for _, m := range modules {
		if m.Visible {
			visibleMods = append(visibleMods, m)
		}
	}

	// Enrich modules with per-module lesson counts and progress
	type moduleWithProgress struct {
		store.Module
		LessonCount      int `json:"lesson_count"`
		CompletedLessons int `json:"completed_lessons"`
	}

	enrichedMods := make([]moduleWithProgress, 0, len(visibleMods))
	for _, m := range visibleMods {
		mwp := moduleWithProgress{Module: m}
		lessons, err := h.store.ListLessons(r.Context(), m.ID.Bytes)
		if err == nil {
			for _, l := range lessons {
				if !l.Visible {
					continue
				}
				mwp.LessonCount++
				if userID != uuid.Nil {
					lp, err := h.store.GetLessonProgress(r.Context(), userID, l.ID.Bytes)
					if err == nil && lp.Completed {
						mwp.CompletedLessons++
					}
				}
			}
		}
		enrichedMods = append(enrichedMods, mwp)
	}

	type courseDetailResponse struct {
		store.Course
		Modules          []moduleWithProgress `json:"modules"`
		Progress         *store.CourseProgress `json:"progress,omitempty"`
		TotalLessons     int                  `json:"total_lessons"`
		CompletedLessons int                  `json:"completed_lessons"`
	}

	response := courseDetailResponse{
		Course:  *course,
		Modules: enrichedMods,
	}

	// Get progress if user is authenticated
	if userID != uuid.Nil {
		cp, err := h.store.GetCourseProgress(r.Context(), userID, course.ID.Bytes)
		if err == nil {
			response.Progress = cp
		}

		// Count completed lessons across all modules
		completedCount := 0
		totalCount := 0
		for _, m := range enrichedMods {
			totalCount += m.LessonCount
			completedCount += m.CompletedLessons
		}
		response.TotalLessons = totalCount
		response.CompletedLessons = completedCount
	}

	RespondSuccess(w, response)
}

// GetModuleDetail returns a module with its lessons and progress.
func (h *CMHandler) GetModuleDetail(w http.ResponseWriter, r *http.Request) {
	courseSlug := chi.URLParam(r, "courseSlug")
	moduleSlug := chi.URLParam(r, "moduleSlug")
	if courseSlug == "" || moduleSlug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "course and module slugs are required", nil)
		return
	}

	module, err := h.store.GetModuleBySlug(r.Context(), courseSlug, moduleSlug)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Module not found", nil)
			return
		}
		slog.Error("cms: failed to get module", "course", courseSlug, "module", moduleSlug, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to get module", nil)
		return
	}

	claims := GetClaims(r.Context())
	userID, _ := uuid.Parse(claims.UserID)

	lessons, err := h.store.ListLessons(r.Context(), module.ID.Bytes)
	if err != nil {
		slog.Error("cms: failed to list lessons", "module_id", module.ID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list lessons", nil)
		return
	}

	type lessonWithProgress struct {
		store.Lesson
		Completed bool `json:"completed"`
	}

	result := make([]lessonWithProgress, 0, len(lessons))
	for _, l := range lessons {
		if !l.Visible {
			continue
		}
		lwp := lessonWithProgress{Lesson: l}
		if userID != uuid.Nil {
			lp, err := h.store.GetLessonProgress(r.Context(), userID, l.ID.Bytes)
			if err == nil {
				lwp.Completed = lp.Completed
			}
		}
		result = append(result, lwp)
	}

	RespondSuccess(w, map[string]interface{}{
		"module":  module,
		"lessons": result,
	})
}

// GetLessonDetail returns a lesson with sections, dependencies, projects, and progress.
func (h *CMHandler) GetLessonDetail(w http.ResponseWriter, r *http.Request) {
	courseSlug := chi.URLParam(r, "courseSlug")
	moduleSlug := chi.URLParam(r, "moduleSlug")
	lessonSlug := chi.URLParam(r, "lessonSlug")
	if courseSlug == "" || moduleSlug == "" || lessonSlug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "course, module, and lesson slugs are required", nil)
		return
	}

	_, err := h.store.GetModuleBySlug(r.Context(), courseSlug, moduleSlug)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Module not found", nil)
		return
	}

	lesson, err := h.store.GetLessonBySlug(r.Context(), moduleSlug, lessonSlug)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Lesson not found", nil)
			return
		}
		slog.Error("cms: failed to get lesson", "module", moduleSlug, "lesson", lessonSlug, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to get lesson", nil)
		return
	}

	claims := GetClaims(r.Context())
	userID, _ := uuid.Parse(claims.UserID)

	// Build response with sections, dependencies, projects, and progress
	result := store.LessonWithSections{
		Lesson: *lesson,
	}

	sections, err := h.store.GetLessonSections(r.Context(), lesson.ID.Bytes)
	if err != nil {
		slog.Warn("cms: failed to get lesson sections", "lesson_id", lesson.ID, "error", err)
		result.Sections = []store.LessonSection{}
	} else {
		if sections == nil {
			result.Sections = []store.LessonSection{}
		} else {
			result.Sections = sections
		}
	}

	deps, err := h.store.GetLessonDependencies(r.Context(), lesson.ID.Bytes)
	if err != nil {
		slog.Warn("cms: failed to get lesson dependencies", "lesson_id", lesson.ID, "error", err)
		result.Dependencies = []store.LessonPrereq{}
	} else {
		if deps == nil {
			result.Dependencies = []store.LessonPrereq{}
		} else {
			result.Dependencies = deps
		}
	}

	// Fetch projects
	projects, err := h.store.ListProjects(r.Context(), lesson.ID.Bytes)
	if err == nil {
		if projects == nil {
			result.Projects = []store.Project{}
		} else {
			result.Projects = projects
		}
	} else {
		result.Projects = []store.Project{}
	}

	// Check prerequisites completion
	if userID != uuid.Nil {
		allMet := true
		for _, dep := range deps {
			depID := uuid.UUID(dep.DependsOnLessonID.Bytes)
			lp, err := h.store.GetLessonProgress(r.Context(), userID, depID)
			if err != nil || !lp.Completed {
				allMet = false
				break
			}
		}
		result.PrerequisitesMet = allMet
	} else {
		result.PrerequisitesMet = len(deps) == 0
	}

	// Fetch progress
	if userID != uuid.Nil {
		lp, err := h.store.GetLessonProgress(r.Context(), userID, lesson.ID.Bytes)
		if err == nil {
			result.Progress = lp
		}
	}

	RespondSuccess(w, result)
}

// CompleteLesson marks a lesson as completed for the current user.
func (h *CMHandler) CompleteLesson(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	if lessonIDStr == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "lesson ID is required", nil)
		return
	}

	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	claims := GetClaims(r.Context())
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_ERROR", "Invalid user", nil)
		return
	}

	// Fetch lesson to get xp_reward and module_id
	lesson, err := h.store.GetLessonByID(r.Context(), lessonID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Lesson not found", nil)
			return
		}
		slog.Error("cms: failed to get lesson", "lesson_id", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to complete lesson", nil)
		return
	}

	// Check if already completed — only award XP once
	var xpAwarded int
	existingProgress, _ := h.store.GetLessonProgress(r.Context(), userID, lessonID)
	xpReward := lesson.XPReward
	if xpReward <= 0 {
		xpReward = 50
	}

	lp, err := h.store.UpsertLessonProgress(r.Context(), userID, lessonID, xpReward)
	if err != nil {
		slog.Error("cms: failed to complete lesson", "lesson_id", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to complete lesson", nil)
		return
	}

	// Award XP to user only if newly completed
	if existingProgress == nil || !existingProgress.Completed {
		xpToAward := xpReward
		if existingProgress != nil {
			xpToAward = xpReward - existingProgress.XPAwarded
			if xpToAward < 0 {
				xpToAward = 0
			}
		}
		if xpToAward > 0 {
			if err := h.store.AddUserXP(r.Context(), userID, xpToAward); err != nil {
				slog.Error("cms: failed to award XP", "user_id", userID, "xp", xpToAward, "error", err)
				// Non-fatal — lesson progress was already saved
			}
		}
	}
	xpAwarded = xpReward
	if existingProgress != nil && existingProgress.Completed {
		xpAwarded = 0
	}

	// Update course progress: find course_id from module, then count lessons
	moduleID := uuid.UUID(lesson.ModuleID.Bytes)
	mod, err := h.store.GetModuleByID(r.Context(), moduleID)
	if err != nil {
		slog.Error("cms: failed to get module for progress", "module_id", moduleID, "error", err)
		RespondSuccess(w, lp)
		return
	}

	courseID := uuid.UUID(mod.CourseID.Bytes)
	modules, err := h.store.ListModules(r.Context(), courseID)
	if err != nil {
		slog.Error("cms: failed to list modules for progress", "course_id", courseID, "error", err)
		RespondSuccess(w, lp)
		return
	}

	totalLessons := 0
	completedLessons := 0
	for _, m := range modules {
		lessons, err := h.store.ListLessons(r.Context(), m.ID.Bytes)
		if err != nil {
			continue
		}
		for _, l := range lessons {
			if !l.Visible {
				continue
			}
			totalLessons++
			lp, err := h.store.GetLessonProgress(r.Context(), userID, l.ID.Bytes)
			if err == nil && lp.Completed {
				completedLessons++
			}
		}
	}

	if totalLessons > 0 {
		pct := float32(completedLessons) / float32(totalLessons) * 100
		completed := completedLessons >= totalLessons
		if err := h.store.UpsertCourseProgress(r.Context(), userID, courseID, pct, completed); err != nil {
			slog.Error("cms: failed to update course progress", "course_id", courseID, "error", err)
		}
	}

	// Include xp_awarded in response
	response := map[string]interface{}{
		"lesson_progress": lp,
		"xp_awarded":      xpAwarded,
	}
	RespondSuccess(w, response)
}

// GetAllProgress returns all course and lesson progress for the current user.
func (h *CMHandler) GetAllProgress(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_ERROR", "Invalid user", nil)
		return
	}

	courses, err := h.store.ListCourses(r.Context())
	if err != nil {
		slog.Error("cms: failed to list courses for progress", "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to load progress", nil)
		return
	}

	type courseProgressEntry struct {
		CourseID         string  `json:"course_id"`
		CourseSlug       string  `json:"course_slug"`
		ProgressPct      float32 `json:"progress_pct"`
		CompletedLessons int     `json:"completed_lessons"`
		TotalLessons     int     `json:"total_lessons"`
	}

	type progressResponse struct {
		Courses []courseProgressEntry `json:"courses"`
	}

	resp := progressResponse{Courses: make([]courseProgressEntry, 0)}

	for _, c := range courses {
		if !c.Visible {
			continue
		}
		entry := courseProgressEntry{
			CourseID:   uuid.UUID(c.ID.Bytes).String(),
			CourseSlug: c.Slug,
		}

		cp, err := h.store.GetCourseProgress(r.Context(), userID, c.ID.Bytes)
		if err == nil {
			entry.ProgressPct = cp.ProgressPct
		}

		modules, err := h.store.ListModules(r.Context(), c.ID.Bytes)
		if err != nil {
			continue
		}

		for _, m := range modules {
			if !m.Visible {
				continue
			}
			lessons, err := h.store.ListLessons(r.Context(), m.ID.Bytes)
			if err != nil {
				continue
			}
			for _, l := range lessons {
				if !l.Visible {
					continue
				}
				entry.TotalLessons++
				lp, err := h.store.GetLessonProgress(r.Context(), userID, l.ID.Bytes)
				if err == nil && lp.Completed {
					entry.CompletedLessons++
				}
			}
		}

		resp.Courses = append(resp.Courses, entry)
	}

	RespondSuccess(w, resp)
}

// ── Admin Endpoints ──

// ListAllCourses returns all courses (including invisible) for admin.
func (h *CMHandler) ListAllCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := h.store.ListCourses(r.Context())
	if err != nil {
		slog.Error("cms: failed to list all courses", "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list courses", nil)
		return
	}
	if courses == nil {
		courses = []store.Course{}
	}
	RespondSuccess(w, courses)
}

// CreateCourse creates a new course.
func (h *CMHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var nc store.NewCourse
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&nc); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if nc.Slug == "" || nc.Title == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "slug and title are required", nil)
		return
	}

	course, err := h.store.CreateCourse(r.Context(), &nc)
	if err != nil {
		if strings.Contains(err.Error(), "slug already exists") {
			RespondError(w, http.StatusConflict, "DUPLICATE", err.Error(), nil)
			return
		}
		slog.Error("cms: failed to create course", "slug", nc.Slug, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to create course", nil)
		return
	}

	RespondCreated(w, course)
}

// UpdateCourse updates an existing course.
func (h *CMHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	courseIDStr := chi.URLParam(r, "courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid course ID", nil)
		return
	}

	var course store.Course
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&course); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	course.ID = pgtypeUUID(courseID)

	updated, err := h.store.UpdateCourse(r.Context(), &course)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Course not found", nil)
			return
		}
		slog.Error("cms: failed to update course", "id", courseID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to update course", nil)
		return
	}

	RespondSuccess(w, updated)
}

// DeleteCourse deletes a course.
func (h *CMHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	courseIDStr := chi.URLParam(r, "courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid course ID", nil)
		return
	}

	if err := h.store.DeleteCourse(r.Context(), courseID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Course not found", nil)
			return
		}
		slog.Error("cms: failed to delete course", "id", courseID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to delete course", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "deleted"})
}

// ToggleCourseVisibility toggles the visible flag on a course.
func (h *CMHandler) ToggleCourseVisibility(w http.ResponseWriter, r *http.Request) {
	courseIDStr := chi.URLParam(r, "courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid course ID", nil)
		return
	}

	course, err := h.store.ToggleCourseVisibility(r.Context(), courseID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Course not found", nil)
			return
		}
		slog.Error("cms: failed to toggle course visibility", "id", courseID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to toggle visibility", nil)
		return
	}

	RespondSuccess(w, course)
}

// ToggleModuleVisibility toggles the visible flag on a module.
func (h *CMHandler) ToggleModuleVisibility(w http.ResponseWriter, r *http.Request) {
	moduleIDStr := chi.URLParam(r, "moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid module ID", nil)
		return
	}

	mod, err := h.store.ToggleModuleVisibility(r.Context(), moduleID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Module not found", nil)
			return
		}
		slog.Error("cms: failed to toggle module visibility", "id", moduleID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to toggle visibility", nil)
		return
	}

	RespondSuccess(w, mod)
}

// ToggleLessonVisibility toggles the visible flag on a lesson.
func (h *CMHandler) ToggleLessonVisibility(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	lesson, err := h.store.ToggleLessonVisibility(r.Context(), lessonID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Lesson not found", nil)
			return
		}
		slog.Error("cms: failed to toggle lesson visibility", "id", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to toggle visibility", nil)
		return
	}

	RespondSuccess(w, lesson)
}

// ToggleProjectVisibility toggles the visible flag on a project.
func (h *CMHandler) ToggleProjectVisibility(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "projectId")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid project ID", nil)
		return
	}

	project, err := h.store.ToggleProjectVisibility(r.Context(), projectID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Project not found", nil)
			return
		}
		slog.Error("cms: failed to toggle project visibility", "id", projectID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to toggle visibility", nil)
		return
	}

	RespondSuccess(w, project)
}

// ListModules returns all modules for a course.
func (h *CMHandler) ListModules(w http.ResponseWriter, r *http.Request) {
	courseIDStr := chi.URLParam(r, "courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid course ID", nil)
		return
	}

	modules, err := h.store.ListModules(r.Context(), courseID)
	if err != nil {
		slog.Error("cms: failed to list modules", "course_id", courseID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list modules", nil)
		return
	}
	if modules == nil {
		modules = []store.Module{}
	}

	RespondSuccess(w, modules)
}

// CreateModule creates a new module.
func (h *CMHandler) CreateModule(w http.ResponseWriter, r *http.Request) {
	var nm store.NewModule
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&nm); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if nm.Slug == "" || nm.Title == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "slug and title are required", nil)
		return
	}

	module, err := h.store.CreateModule(r.Context(), &nm)
	if err != nil {
		if strings.Contains(err.Error(), "slug already exists") {
			RespondError(w, http.StatusConflict, "DUPLICATE", err.Error(), nil)
			return
		}
		slog.Error("cms: failed to create module", "slug", nm.Slug, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to create module", nil)
		return
	}

	RespondCreated(w, module)
}

// UpdateModule updates an existing module.
func (h *CMHandler) UpdateModule(w http.ResponseWriter, r *http.Request) {
	moduleIDStr := chi.URLParam(r, "moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid module ID", nil)
		return
	}

	var module store.Module
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&module); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	module.ID = pgtypeUUID(moduleID)

	updated, err := h.store.UpdateModule(r.Context(), &module)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Module not found", nil)
			return
		}
		slog.Error("cms: failed to update module", "id", moduleID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to update module", nil)
		return
	}

	RespondSuccess(w, updated)
}

// DeleteModule deletes a module.
func (h *CMHandler) DeleteModule(w http.ResponseWriter, r *http.Request) {
	moduleIDStr := chi.URLParam(r, "moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid module ID", nil)
		return
	}

	if err := h.store.DeleteModule(r.Context(), moduleID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Module not found", nil)
			return
		}
		slog.Error("cms: failed to delete module", "id", moduleID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to delete module", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "deleted"})
}

// ListLessons returns all lessons for a module.
func (h *CMHandler) ListLessons(w http.ResponseWriter, r *http.Request) {
	moduleIDStr := chi.URLParam(r, "moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid module ID", nil)
		return
	}

	lessons, err := h.store.ListLessons(r.Context(), moduleID)
	if err != nil {
		slog.Error("cms: failed to list lessons", "module_id", moduleID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list lessons", nil)
		return
	}
	if lessons == nil {
		lessons = []store.Lesson{}
	}

	RespondSuccess(w, lessons)
}

// CreateLesson creates a new lesson with sections and dependencies.
func (h *CMHandler) CreateLesson(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Lesson       store.NewLesson          `json:"lesson"`
		Sections     []store.NewLessonSection `json:"sections,omitempty"`
		Dependencies []string                 `json:"dependency_ids,omitempty"`
	}

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Lesson.Slug == "" || req.Lesson.Title == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "slug and title are required", nil)
		return
	}

	dependencyIDs := make([]uuid.UUID, 0, len(req.Dependencies))
	for _, depStr := range req.Dependencies {
		depID, err := uuid.Parse(depStr)
		if err != nil {
			RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid dependency ID: "+depStr, nil)
			return
		}
		dependencyIDs = append(dependencyIDs, depID)
	}

	// Default sections to empty
	if req.Sections == nil {
		req.Sections = []store.NewLessonSection{}
	}

	lesson, err := h.store.CreateLessonWithSections(r.Context(), &req.Lesson, req.Sections, dependencyIDs)
	if err != nil {
		if strings.Contains(err.Error(), "slug already exists") {
			RespondError(w, http.StatusConflict, "DUPLICATE", err.Error(), nil)
			return
		}
		slog.Error("cms: failed to create lesson", "slug", req.Lesson.Slug, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to create lesson", nil)
		return
	}

	RespondCreated(w, lesson)
}

// UpdateLesson updates an existing lesson.
func (h *CMHandler) UpdateLesson(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	var lesson store.Lesson
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&lesson); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	lesson.ID = pgtypeUUID(lessonID)

	updated, err := h.store.UpdateLesson(r.Context(), &lesson)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Lesson not found", nil)
			return
		}
		slog.Error("cms: failed to update lesson", "id", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to update lesson", nil)
		return
	}

	RespondSuccess(w, updated)
}

// DeleteLesson deletes a lesson.
func (h *CMHandler) DeleteLesson(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	if err := h.store.DeleteLesson(r.Context(), lessonID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Lesson not found", nil)
			return
		}
		slog.Error("cms: failed to delete lesson", "id", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to delete lesson", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "deleted"})
}

// ListProjects returns all projects for a lesson.
func (h *CMHandler) ListProjects(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	projects, err := h.store.ListProjects(r.Context(), lessonID)
	if err != nil {
		slog.Error("cms: failed to list projects", "lesson_id", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list projects", nil)
		return
	}
	if projects == nil {
		projects = []store.Project{}
	}

	RespondSuccess(w, projects)
}

// CreateProject creates a new project.
func (h *CMHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var np store.NewProject
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&np); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if np.Slug == "" || np.Title == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "slug and title are required", nil)
		return
	}

	project, err := h.store.CreateProject(r.Context(), &np)
	if err != nil {
		if strings.Contains(err.Error(), "slug already exists") {
			RespondError(w, http.StatusConflict, "DUPLICATE", err.Error(), nil)
			return
		}
		slog.Error("cms: failed to create project", "slug", np.Slug, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to create project", nil)
		return
	}

	RespondCreated(w, project)
}

// UpdateProject updates an existing project.
func (h *CMHandler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "projectId")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid project ID", nil)
		return
	}

	var project store.Project
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&project); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	project.ID = pgtypeUUID(projectID)

	updated, err := h.store.UpdateProject(r.Context(), &project)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Project not found", nil)
			return
		}
		slog.Error("cms: failed to update project", "id", projectID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to update project", nil)
		return
	}

	RespondSuccess(w, updated)
}

// DeleteProject deletes a project.
func (h *CMHandler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "projectId")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid project ID", nil)
		return
	}

	if err := h.store.DeleteProject(r.Context(), projectID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Project not found", nil)
			return
		}
		slog.Error("cms: failed to delete project", "id", projectID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to delete project", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "deleted"})
}

// ListLessonSections returns all sections for a lesson.
func (h *CMHandler) ListLessonSections(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	sections, err := h.store.GetLessonSections(r.Context(), lessonID)
	if err != nil {
		slog.Error("cms: failed to list sections", "lesson_id", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list sections", nil)
		return
	}
	if sections == nil {
		sections = []store.LessonSection{}
	}

	RespondSuccess(w, sections)
}

// ── Section Endpoints (Admin) ──

// CreateSection creates a new lesson section.
func (h *CMHandler) CreateSection(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	var ns store.NewLessonSection
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&ns); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if ns.SectionType == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "section_type is required", nil)
		return
	}

	section, err := h.store.CreateSection(r.Context(), lessonID, &ns)
	if err != nil {
		slog.Error("cms: failed to create section", "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to create section", nil)
		return
	}

	RespondCreated(w, section)
}

// UpdateSection updates an existing lesson section.
func (h *CMHandler) UpdateSection(w http.ResponseWriter, r *http.Request) {
	sectionIDStr := chi.URLParam(r, "sectionId")
	sectionID, err := uuid.Parse(sectionIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid section ID", nil)
		return
	}

	var section store.LessonSection
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&section); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	section.ID = pgtypeUUID(sectionID)

	updated, err := h.store.UpdateSection(r.Context(), &section)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Section not found", nil)
			return
		}
		slog.Error("cms: failed to update section", "id", sectionID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to update section", nil)
		return
	}

	RespondSuccess(w, updated)
}

// DeleteSection deletes a lesson section.
func (h *CMHandler) DeleteSection(w http.ResponseWriter, r *http.Request) {
	sectionIDStr := chi.URLParam(r, "sectionId")
	sectionID, err := uuid.Parse(sectionIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid section ID", nil)
		return
	}

	if err := h.store.DeleteSection(r.Context(), sectionID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Section not found", nil)
			return
		}
		slog.Error("cms: failed to delete section", "id", sectionID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to delete section", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "deleted"})
}

// ReorderSections reorders lesson sections (admin only).
func (h *CMHandler) ReorderSections(w http.ResponseWriter, r *http.Request) {
	lessonIDStr := chi.URLParam(r, "lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid lesson ID", nil)
		return
	}

	var req struct {
		OrderedIDs []string `json:"ordered_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if len(req.OrderedIDs) == 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "ordered_ids must not be empty", nil)
		return
	}

	ids := make([]uuid.UUID, len(req.OrderedIDs))
	for i, idStr := range req.OrderedIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid section ID: "+idStr, nil)
			return
		}
		ids[i] = id
	}

	if err := h.store.ReorderLessonSections(r.Context(), lessonID, ids); err != nil {
		slog.Error("cms: failed to reorder sections", "lesson", lessonID, "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to reorder sections", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "reordered"})
}

// pgtypeUUID creates a pgtype.UUID from a uuid.UUID.
func pgtypeUUID(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{Bytes: id, Valid: true}
}
