package store

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// ── Course Operations ──

// ListCourses returns all courses ordered by order_number.
// When called from a student context, filter by visible=true.
func (s *PostgresStore) ListCourses(ctx context.Context) ([]Course, error) {
	query := `SELECT id, slug, title, description, image_url, icon, difficulty_level,
		estimated_hours, order_number, visible, created_at, updated_at
		FROM courses ORDER BY order_number`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query courses: %w", err)
	}
	defer rows.Close()

	var courses []Course
	for rows.Next() {
		var c Course
		if err := rows.Scan(
			&c.ID, &c.Slug, &c.Title, &c.Description, &c.ImageURL, &c.Icon,
			&c.DifficultyLevel, &c.EstimatedHours, &c.OrderNumber, &c.Visible,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan course: %w", err)
		}
		courses = append(courses, c)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return courses, nil
}

// GetCourseBySlug returns a single course by its slug.
func (s *PostgresStore) GetCourseBySlug(ctx context.Context, slug string) (*Course, error) {
	query := `SELECT id, slug, title, description, image_url, icon, difficulty_level,
		estimated_hours, order_number, visible, created_at, updated_at
		FROM courses WHERE slug = $1`

	var c Course
	err := s.pool.QueryRow(ctx, query, slug).Scan(
		&c.ID, &c.Slug, &c.Title, &c.Description, &c.ImageURL, &c.Icon,
		&c.DifficultyLevel, &c.EstimatedHours, &c.OrderNumber, &c.Visible,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("course not found: %s", slug)
		}
		return nil, fmt.Errorf("failed to get course by slug: %w", err)
	}
	return &c, nil
}

// CreateCourse inserts a new course and returns it.
func (s *PostgresStore) CreateCourse(ctx context.Context, nc *NewCourse) (*Course, error) {
	if nc == nil {
		return nil, fmt.Errorf("course cannot be nil")
	}
	if nc.Slug == "" || nc.Title == "" {
		return nil, fmt.Errorf("slug and title are required")
	}

	query := `INSERT INTO courses (slug, title, description, image_url, icon, difficulty_level,
		estimated_hours, order_number, visible, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW())
		RETURNING id, slug, title, description, image_url, icon, difficulty_level,
			estimated_hours, order_number, visible, created_at, updated_at`

	var c Course
	err := s.pool.QueryRow(ctx, query,
		nc.Slug, nc.Title, nc.Description, nc.ImageURL, nc.Icon,
		nc.DifficultyLevel, nc.EstimatedHours, nc.OrderNumber,
	).Scan(
		&c.ID, &c.Slug, &c.Title, &c.Description, &c.ImageURL, &c.Icon,
		&c.DifficultyLevel, &c.EstimatedHours, &c.OrderNumber, &c.Visible,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if msg, ok := IsUniqueViolation(err); ok {
			return nil, fmt.Errorf("course slug already exists: %s", msg)
		}
		return nil, fmt.Errorf("failed to create course: %w", err)
	}
	return &c, nil
}

// UpdateCourse updates an existing course and returns the updated record.
func (s *PostgresStore) UpdateCourse(ctx context.Context, course *Course) (*Course, error) {
	if course == nil {
		return nil, fmt.Errorf("course cannot be nil")
	}

	query := `UPDATE courses SET slug=$1, title=$2, description=$3, image_url=$4, icon=$5,
		difficulty_level=$6, estimated_hours=$7, order_number=$8, visible=$9, updated_at=NOW()
		WHERE id=$10
		RETURNING id, slug, title, description, image_url, icon, difficulty_level,
			estimated_hours, order_number, visible, created_at, updated_at`

	var c Course
	err := s.pool.QueryRow(ctx, query,
		course.Slug, course.Title, course.Description, course.ImageURL, course.Icon,
		course.DifficultyLevel, course.EstimatedHours, course.OrderNumber, course.Visible, course.ID,
	).Scan(
		&c.ID, &c.Slug, &c.Title, &c.Description, &c.ImageURL, &c.Icon,
		&c.DifficultyLevel, &c.EstimatedHours, &c.OrderNumber, &c.Visible,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("course not found")
		}
		return nil, fmt.Errorf("failed to update course: %w", err)
	}
	return &c, nil
}

// DeleteCourse removes a course by ID (CASCADE deletes modules and lessons).
func (s *PostgresStore) DeleteCourse(ctx context.Context, id uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM courses WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete course: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("course not found")
	}
	return nil
}

// ── Module Operations ──

// ListModules returns all modules for a course ordered by order_number.
func (s *PostgresStore) ListModules(ctx context.Context, courseID uuid.UUID) ([]Module, error) {
	query := `SELECT id, course_id, slug, title, description, image_url,
		order_number, visible, created_at, updated_at
		FROM modules WHERE course_id = $1 ORDER BY order_number`

	rows, err := s.pool.Query(ctx, query, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to query modules: %w", err)
	}
	defer rows.Close()

	var modules []Module
	for rows.Next() {
		var m Module
		if err := rows.Scan(
			&m.ID, &m.CourseID, &m.Slug, &m.Title, &m.Description, &m.ImageURL,
			&m.OrderNumber, &m.Visible, &m.CreatedAt, &m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan module: %w", err)
		}
		modules = append(modules, m)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return modules, nil
}

// GetModuleBySlug returns a module by course slug and module slug.
func (s *PostgresStore) GetModuleBySlug(ctx context.Context, courseSlug, moduleSlug string) (*Module, error) {
	query := `SELECT m.id, m.course_id, m.slug, m.title, m.description, m.image_url,
		m.order_number, m.visible, m.created_at, m.updated_at
		FROM modules m
		JOIN courses c ON c.id = m.course_id
		WHERE c.slug = $1 AND m.slug = $2`

	var m Module
	err := s.pool.QueryRow(ctx, query, courseSlug, moduleSlug).Scan(
		&m.ID, &m.CourseID, &m.Slug, &m.Title, &m.Description, &m.ImageURL,
		&m.OrderNumber, &m.Visible, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("module not found: %s/%s", courseSlug, moduleSlug)
		}
		return nil, fmt.Errorf("failed to get module by slug: %w", err)
	}
	return &m, nil
}

// CreateModule inserts a new module and returns it.
func (s *PostgresStore) CreateModule(ctx context.Context, nm *NewModule) (*Module, error) {
	if nm == nil {
		return nil, fmt.Errorf("module cannot be nil")
	}
	if nm.Slug == "" || nm.Title == "" {
		return nil, fmt.Errorf("slug and title are required")
	}

	courseID, err := uuid.Parse(nm.CourseID)
	if err != nil {
		return nil, fmt.Errorf("invalid course_id: %w", err)
	}

	query := `INSERT INTO modules (course_id, slug, title, description, image_url,
		order_number, visible, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
		RETURNING id, course_id, slug, title, description, image_url,
			order_number, visible, created_at, updated_at`

	var m Module
	err = s.pool.QueryRow(ctx, query,
		courseID, nm.Slug, nm.Title, nm.Description, nm.ImageURL, nm.OrderNumber,
	).Scan(
		&m.ID, &m.CourseID, &m.Slug, &m.Title, &m.Description, &m.ImageURL,
		&m.OrderNumber, &m.Visible, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if msg, ok := IsUniqueViolation(err); ok {
			return nil, fmt.Errorf("module slug already exists in course: %s", msg)
		}
		return nil, fmt.Errorf("failed to create module: %w", err)
	}
	return &m, nil
}

// UpdateModule updates an existing module and returns the updated record.
func (s *PostgresStore) UpdateModule(ctx context.Context, module *Module) (*Module, error) {
	if module == nil {
		return nil, fmt.Errorf("module cannot be nil")
	}

	query := `UPDATE modules SET slug=$1, title=$2, description=$3, image_url=$4,
		order_number=$5, visible=$6, updated_at=NOW()
		WHERE id=$7
		RETURNING id, course_id, slug, title, description, image_url,
			order_number, visible, created_at, updated_at`

	var m Module
	err := s.pool.QueryRow(ctx, query,
		module.Slug, module.Title, module.Description, module.ImageURL,
		module.OrderNumber, module.Visible, module.ID,
	).Scan(
		&m.ID, &m.CourseID, &m.Slug, &m.Title, &m.Description, &m.ImageURL,
		&m.OrderNumber, &m.Visible, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("module not found")
		}
		return nil, fmt.Errorf("failed to update module: %w", err)
	}
	return &m, nil
}

// DeleteModule removes a module by ID.
func (s *PostgresStore) DeleteModule(ctx context.Context, id uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM modules WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete module: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("module not found")
	}
	return nil
}

// ── Lesson Operations ──

// ListLessons returns all lessons for a module ordered by order_number.
func (s *PostgresStore) ListLessons(ctx context.Context, moduleID uuid.UUID) ([]Lesson, error) {
	query := `SELECT id, module_id, slug, title, description, raw_readme,
		difficulty, estimated_minutes, xp_reward, order_number, visible,
		problem_references, created_at, updated_at
		FROM lessons WHERE module_id = $1 ORDER BY order_number`

	rows, err := s.pool.Query(ctx, query, moduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to query lessons: %w", err)
	}
	defer rows.Close()

	var lessons []Lesson
	for rows.Next() {
		var l Lesson
		if err := rows.Scan(
			&l.ID, &l.ModuleID, &l.Slug, &l.Title, &l.Description, &l.RawReadme,
			&l.Difficulty, &l.EstimatedMinutes, &l.XPReward, &l.OrderNumber, &l.Visible,
			&l.ProblemReferences, &l.CreatedAt, &l.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan lesson: %w", err)
		}
		lessons = append(lessons, l)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return lessons, nil
}

// GetLessonBySlug returns a lesson by module slug and lesson slug.
func (s *PostgresStore) GetLessonBySlug(ctx context.Context, moduleSlug, lessonSlug string) (*Lesson, error) {
	query := `SELECT l.id, l.module_id, l.slug, l.title, l.description, l.raw_readme,
		l.difficulty, l.estimated_minutes, l.xp_reward, l.order_number, l.visible,
		l.problem_references, l.created_at, l.updated_at
		FROM lessons l
		JOIN modules m ON m.id = l.module_id
		WHERE m.slug = $1 AND l.slug = $2`

	var l Lesson
	err := s.pool.QueryRow(ctx, query, moduleSlug, lessonSlug).Scan(
		&l.ID, &l.ModuleID, &l.Slug, &l.Title, &l.Description, &l.RawReadme,
		&l.Difficulty, &l.EstimatedMinutes, &l.XPReward, &l.OrderNumber, &l.Visible,
		&l.ProblemReferences, &l.CreatedAt, &l.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("lesson not found: %s/%s", moduleSlug, lessonSlug)
		}
		return nil, fmt.Errorf("failed to get lesson by slug: %w", err)
	}
	return &l, nil
}

// CreateLessonWithSections creates a lesson with its sections and dependencies in a transaction.
func (s *PostgresStore) CreateLessonWithSections(ctx context.Context, nl *NewLesson, sections []NewLessonSection, dependencyIDs []uuid.UUID) (*Lesson, error) {
	if nl == nil {
		return nil, fmt.Errorf("lesson cannot be nil")
	}
	if nl.Slug == "" || nl.Title == "" {
		return nil, fmt.Errorf("slug and title are required")
	}

	moduleID, err := uuid.Parse(nl.ModuleID)
	if err != nil {
		return nil, fmt.Errorf("invalid module_id: %w", err)
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Insert lesson
	var lesson Lesson
	lessonQuery := `INSERT INTO lessons (module_id, slug, title, description, difficulty,
		estimated_minutes, xp_reward, order_number, visible, problem_references, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, NOW(), NOW())
		RETURNING id, module_id, slug, title, description, raw_readme,
			difficulty, estimated_minutes, xp_reward, order_number, visible,
			problem_references, created_at, updated_at`

	err = tx.QueryRow(ctx, lessonQuery,
		moduleID, nl.Slug, nl.Title, nl.Description, nl.Difficulty,
		nl.EstimatedMinutes, nl.XPReward, nl.OrderNumber, nl.ProblemReferences,
	).Scan(
		&lesson.ID, &lesson.ModuleID, &lesson.Slug, &lesson.Title, &lesson.Description, &lesson.RawReadme,
		&lesson.Difficulty, &lesson.EstimatedMinutes, &lesson.XPReward, &lesson.OrderNumber, &lesson.Visible,
		&lesson.ProblemReferences, &lesson.CreatedAt, &lesson.UpdatedAt,
	)
	if err != nil {
		if msg, ok := IsUniqueViolation(err); ok {
			return nil, fmt.Errorf("lesson slug already exists in module: %s", msg)
		}
		return nil, fmt.Errorf("failed to create lesson: %w", err)
	}

	// 2. Bulk insert sections
	if len(sections) > 0 {
		valueStrings := make([]string, 0, len(sections))
		args := make([]interface{}, 0, 1+len(sections)*5)
		args = append(args, lesson.ID)
		for i, sec := range sections {
			base := 1 + i*5
			valueStrings = append(valueStrings,
				fmt.Sprintf("($1, $%d, $%d, $%d, $%d, $%d)", base+1, base+2, base+3, base+4, base+5))
			meta := sec.Metadata
			if len(meta) == 0 {
				meta = json.RawMessage(`{}`)
			}
			args = append(args, sec.SectionType, sec.Title, sec.Content, json.RawMessage(meta), sec.OrderNumber)
		}
		insertQuery := `INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number) VALUES ` +
			strings.Join(valueStrings, ", ")
		if _, err := tx.Exec(ctx, insertQuery, args...); err != nil {
			return nil, fmt.Errorf("failed to bulk insert lesson sections: %w", err)
		}
	}

	// 3. Bulk insert dependencies
	if len(dependencyIDs) > 0 {
		valueStrings := make([]string, 0, len(dependencyIDs))
		args := make([]interface{}, 0, 1+len(dependencyIDs))
		args = append(args, lesson.ID)
		for i, depID := range dependencyIDs {
			base := 1 + i
			valueStrings = append(valueStrings, fmt.Sprintf("($1, $%d)", base+1))
			args = append(args, depID)
		}
		insertQuery := `INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id) VALUES ` +
			strings.Join(valueStrings, ", ") +
			` ON CONFLICT DO NOTHING`
		if _, err := tx.Exec(ctx, insertQuery, args...); err != nil {
			return nil, fmt.Errorf("failed to bulk insert lesson dependencies: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit lesson creation: %w", err)
	}

	return &lesson, nil
}

// UpdateLesson updates an existing lesson and returns the updated record.
func (s *PostgresStore) UpdateLesson(ctx context.Context, lesson *Lesson) (*Lesson, error) {
	if lesson == nil {
		return nil, fmt.Errorf("lesson cannot be nil")
	}

	query := `UPDATE lessons SET slug=$1, title=$2, description=$3, difficulty=$4,
		estimated_minutes=$5, xp_reward=$6, order_number=$7, visible=$8,
		problem_references=$9, updated_at=NOW()
		WHERE id=$10
		RETURNING id, module_id, slug, title, description, raw_readme,
			difficulty, estimated_minutes, xp_reward, order_number, visible,
			problem_references, created_at, updated_at`

	var l Lesson
	err := s.pool.QueryRow(ctx, query,
		lesson.Slug, lesson.Title, lesson.Description, lesson.Difficulty,
		lesson.EstimatedMinutes, lesson.XPReward, lesson.OrderNumber, lesson.Visible,
		lesson.ProblemReferences, lesson.ID,
	).Scan(
		&l.ID, &l.ModuleID, &l.Slug, &l.Title, &l.Description, &l.RawReadme,
		&l.Difficulty, &l.EstimatedMinutes, &l.XPReward, &l.OrderNumber, &l.Visible,
		&l.ProblemReferences, &l.CreatedAt, &l.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("lesson not found")
		}
		return nil, fmt.Errorf("failed to update lesson: %w", err)
	}
	return &l, nil
}

// DeleteLesson removes a lesson by ID.
func (s *PostgresStore) DeleteLesson(ctx context.Context, id uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM lessons WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete lesson: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("lesson not found")
	}
	return nil
}

// ── Project Operations ──

// ListProjects returns all projects for a lesson ordered by order_number.
func (s *PostgresStore) ListProjects(ctx context.Context, lessonID uuid.UUID) ([]Project, error) {
	query := `SELECT id, lesson_id, slug, title, description, requirements,
		starter_code, difficulty, xp_reward, hints, order_number, visible,
		created_at, updated_at
		FROM projects WHERE lesson_id = $1 ORDER BY order_number`

	rows, err := s.pool.Query(ctx, query, lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects: %w", err)
	}
	defer rows.Close()

	var projects []Project
	for rows.Next() {
		var p Project
		if err := rows.Scan(
			&p.ID, &p.LessonID, &p.Slug, &p.Title, &p.Description, &p.Requirements,
			&p.StarterCode, &p.Difficulty, &p.XPReward, &p.Hints, &p.OrderNumber, &p.Visible,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, p)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return projects, nil
}

// CreateProject inserts a new project and returns it.
func (s *PostgresStore) CreateProject(ctx context.Context, np *NewProject) (*Project, error) {
	if np == nil {
		return nil, fmt.Errorf("project cannot be nil")
	}
	if np.Slug == "" || np.Title == "" {
		return nil, fmt.Errorf("slug and title are required")
	}

	lessonID, err := uuid.Parse(np.LessonID)
	if err != nil {
		return nil, fmt.Errorf("invalid lesson_id: %w", err)
	}

	query := `INSERT INTO projects (lesson_id, slug, title, description, requirements,
		starter_code, difficulty, xp_reward, hints, order_number, visible, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, NOW(), NOW())
		RETURNING id, lesson_id, slug, title, description, requirements,
			starter_code, difficulty, xp_reward, hints, order_number, visible,
			created_at, updated_at`

	var p Project
	err = s.pool.QueryRow(ctx, query,
		lessonID, np.Slug, np.Title, np.Description, np.Requirements,
		np.StarterCode, np.Difficulty, np.XPReward, np.Hints, np.OrderNumber,
	).Scan(
		&p.ID, &p.LessonID, &p.Slug, &p.Title, &p.Description, &p.Requirements,
		&p.StarterCode, &p.Difficulty, &p.XPReward, &p.Hints, &p.OrderNumber, &p.Visible,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if msg, ok := IsUniqueViolation(err); ok {
			return nil, fmt.Errorf("project slug already exists in lesson: %s", msg)
		}
		return nil, fmt.Errorf("failed to create project: %w", err)
	}
	return &p, nil
}

// UpdateProject updates an existing project and returns the updated record.
func (s *PostgresStore) UpdateProject(ctx context.Context, project *Project) (*Project, error) {
	if project == nil {
		return nil, fmt.Errorf("project cannot be nil")
	}

	query := `UPDATE projects SET slug=$1, title=$2, description=$3, requirements=$4,
		starter_code=$5, difficulty=$6, xp_reward=$7, hints=$8, order_number=$9,
		visible=$10, updated_at=NOW()
		WHERE id=$11
		RETURNING id, lesson_id, slug, title, description, requirements,
			starter_code, difficulty, xp_reward, hints, order_number, visible,
			created_at, updated_at`

	var p Project
	err := s.pool.QueryRow(ctx, query,
		project.Slug, project.Title, project.Description, project.Requirements,
		project.StarterCode, project.Difficulty, project.XPReward, project.Hints,
		project.OrderNumber, project.Visible, project.ID,
	).Scan(
		&p.ID, &p.LessonID, &p.Slug, &p.Title, &p.Description, &p.Requirements,
		&p.StarterCode, &p.Difficulty, &p.XPReward, &p.Hints, &p.OrderNumber, &p.Visible,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("project not found")
		}
		return nil, fmt.Errorf("failed to update project: %w", err)
	}
	return &p, nil
}

// DeleteProject removes a project by ID.
func (s *PostgresStore) DeleteProject(ctx context.Context, id uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
}

// ── Section Operations ──

// CreateSection inserts a new lesson section.
func (s *PostgresStore) CreateSection(ctx context.Context, lessonID uuid.UUID, ns *NewLessonSection) (*LessonSection, error) {
	if ns == nil {
		return nil, fmt.Errorf("section cannot be nil")
	}

	query := `INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, lesson_id, section_type, title, content, metadata, order_number, created_at`

	meta := ns.Metadata
	if len(meta) == 0 {
		meta = json.RawMessage(`{}`)
	}

	var sec LessonSection
	var metadataBytes []byte
	err := s.pool.QueryRow(ctx, query,
		lessonID, ns.SectionType, ns.Title, ns.Content, json.RawMessage(meta), ns.OrderNumber,
	).Scan(
		&sec.ID, &sec.LessonID, &sec.SectionType, &sec.Title, &sec.Content,
		&metadataBytes, &sec.OrderNumber, &sec.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create section: %w", err)
	}
	if len(metadataBytes) > 0 {
		sec.Metadata = json.RawMessage(metadataBytes)
	}
	return &sec, nil
}

// UpdateSection updates an existing lesson section.
func (s *PostgresStore) UpdateSection(ctx context.Context, section *LessonSection) (*LessonSection, error) {
	if section == nil {
		return nil, fmt.Errorf("section cannot be nil")
	}

	query := `UPDATE lesson_sections SET section_type=$1, title=$2, content=$3, metadata=$4, order_number=$5
		WHERE id=$6
		RETURNING id, lesson_id, section_type, title, content, metadata, order_number, created_at`

	meta := section.Metadata
	if len(meta) == 0 {
		meta = json.RawMessage(`{}`)
	}

	var sec LessonSection
	var metadataBytes []byte
	err := s.pool.QueryRow(ctx, query,
		section.SectionType, section.Title, section.Content, json.RawMessage(meta),
		section.OrderNumber, section.ID,
	).Scan(
		&sec.ID, &sec.LessonID, &sec.SectionType, &sec.Title, &sec.Content,
		&metadataBytes, &sec.OrderNumber, &sec.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("section not found")
		}
		return nil, fmt.Errorf("failed to update section: %w", err)
	}
	if len(metadataBytes) > 0 {
		sec.Metadata = json.RawMessage(metadataBytes)
	}
	return &sec, nil
}

// DeleteSection removes a lesson section by ID.
func (s *PostgresStore) DeleteSection(ctx context.Context, id uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM lesson_sections WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete section: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("section not found")
	}
	return nil
}

// ── Progress Operations ──

// GetCourseProgress returns a user's progress for a specific course.
func (s *PostgresStore) GetCourseProgress(ctx context.Context, userID, courseID uuid.UUID) (*CourseProgress, error) {
	query := `SELECT user_id, course_id, started_at, completed_at, progress_pct
		FROM course_progress WHERE user_id = $1 AND course_id = $2`

	var cp CourseProgress
	err := s.pool.QueryRow(ctx, query, userID, courseID).Scan(
		&cp.UserID, &cp.CourseID, &cp.StartedAt, &cp.CompletedAt, &cp.ProgressPct,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return &CourseProgress{
				UserID:    pgtype.UUID{Bytes: userID, Valid: true},
				CourseID:  pgtype.UUID{Bytes: courseID, Valid: true},
				ProgressPct: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to get course progress: %w", err)
	}
	return &cp, nil
}

// UpsertCourseProgress creates or updates a user's course progress.
func (s *PostgresStore) UpsertCourseProgress(ctx context.Context, userID, courseID uuid.UUID, pct float32, completed bool) error {
	query := `INSERT INTO course_progress (user_id, course_id, started_at, completed_at, progress_pct)
		VALUES ($1, $2, NOW(), $3, $4)
		ON CONFLICT (user_id, course_id) DO UPDATE SET
			progress_pct = GREATEST(course_progress.progress_pct, $4),
			completed_at = CASE WHEN $3 IS NOT NULL AND course_progress.completed_at IS NULL
				THEN NOW() ELSE course_progress.completed_at END`

	var completedAt *time.Time
	if completed {
		now := time.Now()
		completedAt = &now
	}

	_, err := s.pool.Exec(ctx, query, userID, courseID, completedAt, pct)
	if err != nil {
		return fmt.Errorf("failed to upsert course progress: %w", err)
	}
	return nil
}

// GetLessonProgress returns a user's progress for a specific lesson.
func (s *PostgresStore) GetLessonProgress(ctx context.Context, userID, lessonID uuid.UUID) (*LessonProgress, error) {
	query := `SELECT user_id, lesson_id, completed, xp_awarded, completed_at
		FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2`

	var lp LessonProgress
	err := s.pool.QueryRow(ctx, query, userID, lessonID).Scan(
		&lp.UserID, &lp.LessonID, &lp.Completed, &lp.XPAwarded, &lp.CompletedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return &LessonProgress{
				UserID:   pgtype.UUID{Bytes: userID, Valid: true},
				LessonID: pgtype.UUID{Bytes: lessonID, Valid: true},
			}, nil
		}
		return nil, fmt.Errorf("failed to get lesson progress: %w", err)
	}
	return &lp, nil
}

// UpsertLessonProgress marks a lesson as completed and awards XP.
func (s *PostgresStore) UpsertLessonProgress(ctx context.Context, userID, lessonID uuid.UUID, xp int) (*LessonProgress, error) {
	query := `INSERT INTO lesson_progress (user_id, lesson_id, completed, xp_awarded, completed_at)
		VALUES ($1, $2, true, $3, NOW())
		ON CONFLICT (user_id, lesson_id) DO UPDATE SET
			completed = true,
			xp_awarded = GREATEST(lesson_progress.xp_awarded, $3),
			completed_at = CASE WHEN lesson_progress.completed_at IS NULL THEN NOW() ELSE lesson_progress.completed_at END
		RETURNING user_id, lesson_id, completed, xp_awarded, completed_at`

	var lp LessonProgress
	err := s.pool.QueryRow(ctx, query, userID, lessonID, xp).Scan(
		&lp.UserID, &lp.LessonID, &lp.Completed, &lp.XPAwarded, &lp.CompletedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert lesson progress: %w", err)
	}
	return &lp, nil
}

// ── Helpers ──

// GetLessonSections returns all sections for a lesson ordered by order_number.
func (s *PostgresStore) GetLessonSections(ctx context.Context, lessonID uuid.UUID) ([]LessonSection, error) {
	query := `SELECT id, lesson_id, section_type, title, content, metadata, order_number, created_at
		FROM lesson_sections WHERE lesson_id = $1 ORDER BY order_number`

	rows, err := s.pool.Query(ctx, query, lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to query lesson sections: %w", err)
	}
	defer rows.Close()

	var sections []LessonSection
	for rows.Next() {
		var sec LessonSection
		var metadataBytes []byte
		if err := rows.Scan(
			&sec.ID, &sec.LessonID, &sec.SectionType, &sec.Title, &sec.Content, &metadataBytes, &sec.OrderNumber, &sec.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan lesson section: %w", err)
		}
		if len(metadataBytes) > 0 {
			sec.Metadata = json.RawMessage(metadataBytes)
		}
		sections = append(sections, sec)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return sections, nil
}

// GetLessonDependencies returns all prerequisites for a lesson.
func (s *PostgresStore) GetLessonDependencies(ctx context.Context, lessonID uuid.UUID) ([]LessonPrereq, error) {
	query := `SELECT lesson_id, depends_on_lesson_id
		FROM lesson_dependencies WHERE lesson_id = $1`

	rows, err := s.pool.Query(ctx, query, lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to query lesson dependencies: %w", err)
	}
	defer rows.Close()

	var deps []LessonPrereq
	for rows.Next() {
		var d LessonPrereq
		if err := rows.Scan(&d.LessonID, &d.DependsOnLessonID); err != nil {
			return nil, fmt.Errorf("failed to scan lesson dependency: %w", err)
		}
		deps = append(deps, d)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return deps, nil
}

// getLessonSectionsTx returns all sections for a lesson (transactional variant).
func getLessonSectionsTx(ctx context.Context, tx pgx.Tx, lessonID pgtype.UUID) ([]LessonSection, error) {
	query := `SELECT id, lesson_id, section_type, title, content, metadata, order_number, created_at
		FROM lesson_sections WHERE lesson_id = $1 ORDER BY order_number`

	rows, err := tx.Query(ctx, query, lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to query lesson sections: %w", err)
	}
	defer rows.Close()

	var sections []LessonSection
	for rows.Next() {
		var s LessonSection
		var metadataBytes []byte
		if err := rows.Scan(
			&s.ID, &s.LessonID, &s.SectionType, &s.Title, &s.Content, &metadataBytes, &s.OrderNumber, &s.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan lesson section: %w", err)
		}
		if len(metadataBytes) > 0 {
			s.Metadata = json.RawMessage(metadataBytes)
		}
		sections = append(sections, s)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return sections, nil
}

// getLessonDependenciesTx returns all prerequisites for a lesson (transactional variant).
func getLessonDependenciesTx(ctx context.Context, tx pgx.Tx, lessonID pgtype.UUID) ([]LessonPrereq, error) {
	query := `SELECT lesson_id, depends_on_lesson_id
		FROM lesson_dependencies WHERE lesson_id = $1`

	rows, err := tx.Query(ctx, query, lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to query lesson dependencies: %w", err)
	}
	defer rows.Close()

	var deps []LessonPrereq
	for rows.Next() {
		var d LessonPrereq
		if err := rows.Scan(&d.LessonID, &d.DependsOnLessonID); err != nil {
			return nil, fmt.Errorf("failed to scan lesson dependency: %w", err)
		}
		deps = append(deps, d)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return deps, nil
}
