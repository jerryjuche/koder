package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"
)

type courseInput struct {
	Slug            string `json:"slug"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	DifficultyLevel int    `json:"difficulty_level"`
	EstimatedHours  int    `json:"estimated_hours"`
	OrderNumber     int    `json:"order_number"`
}

type moduleInput struct {
	Slug        string        `json:"slug"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	OrderNumber int           `json:"order_number"`
	Language    string        `json:"language"`
	Lessons     []lessonInput `json:"lessons"`
}

type lessonInput struct {
	Slug              string         `json:"slug"`
	Title             string         `json:"title"`
	Description       string         `json:"description"`
	Difficulty        int            `json:"difficulty"`
	EstimatedMinutes  int            `json:"estimated_minutes"`
	XPReward          int            `json:"xp_reward"`
	OrderNumber       int            `json:"order_number"`
	ProblemReferences []string       `json:"problem_references"`
	Dependencies      []string       `json:"dependencies"`
	Sections          []sectionInput `json:"sections"`
}

type sectionInput struct {
	SectionType string          `json:"section_type"`
	Title       string          `json:"title"`
	Content     string          `json:"content"`
	Metadata    json.RawMessage `json:"metadata"`
}

type projectInput struct {
	LessonSlug   string   `json:"lesson_slug"`
	ModuleSlug   string   `json:"module_slug"`
	Slug         string   `json:"slug"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Requirements string   `json:"requirements"`
	StarterCode  string   `json:"starter_code"`
	Difficulty   int      `json:"difficulty"`
	XPReward     int      `json:"xp_reward"`
	Hints        []string `json:"hints"`
	OrderNumber  int      `json:"order_number"`
}

type input struct {
	Course   courseInput    `json:"course"`
	Modules  []moduleInput  `json:"modules"`
	Projects []projectInput `json:"projects"`
}

func main() {
	inFile := flag.String("in", "curriculum.json", "input JSON file with AI-generated curriculum content")
	outFile := flag.String("out", "seed.sql", "output SQL migration file")
	update := flag.Bool("update", false, "emit UPDATE statements for existing rows (course/module/lesson by slug; delete+re-insert sections/projects/dependencies) instead of INSERT ... ON CONFLICT")
	flag.Parse()

	data, err := os.ReadFile(*inFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to read input file: %v\n", err)
		os.Exit(1)
	}

	var in input
	if err := json.Unmarshal(data, &in); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to parse JSON: %v\n", err)
		os.Exit(1)
	}

	if in.Course.Slug == "" {
		fmt.Fprintln(os.Stderr, "ERROR: course.slug is required")
		os.Exit(1)
	}
	if len(in.Modules) == 0 {
		fmt.Fprintln(os.Stderr, "ERROR: at least one module is required")
		os.Exit(1)
	}

	var sql strings.Builder

	ts := time.Now().Format("2006-01-02 15:04:05")
	fmt.Fprintf(&sql, "-- ============================================================================\n")
	if *update {
		fmt.Fprintf(&sql, "-- Koder :: %s Content Refresh\n", escapeSQL(in.Course.Title))
	} else {
		fmt.Fprintf(&sql, "-- Koder :: %s Seed Data\n", escapeSQL(in.Course.Title))
	}
	fmt.Fprintf(&sql, "-- Generated: %s\n", ts)
	fmt.Fprintf(&sql, "-- ============================================================================\n")
	if *update {
		fmt.Fprintf(&sql, "-- Idempotent refresh for an already-seeded course. Course, modules, and lessons are\n")
		fmt.Fprintf(&sql, "-- updated in place by slug (IDs preserved, so user progress survives). Sections,\n")
		fmt.Fprintf(&sql, "-- projects, and lesson dependencies are deleted and re-inserted for exact parity\n")
		fmt.Fprintf(&sql, "-- with the source JSON.\n")
	} else {
		fmt.Fprintf(&sql, "-- Run this in your Supabase SQL editor after migrations 001-038.\n")
	}
	fmt.Fprintf(&sql, "-- ============================================================================\n\n")
	fmt.Fprintf(&sql, "BEGIN;\n\n")

	if *update {
		writeCourseUpdate(&sql, in.Course)
		writeModulesUpdate(&sql, in.Course.Slug, in.Modules)
		writeLessonsUpdate(&sql, in.Course.Slug, in.Modules)
		clearChildRows(&sql, in.Course.Slug)
		writeSections(&sql, in.Course.Slug, in.Modules)
		writeDependencies(&sql, in.Course.Slug, in.Modules)
		if len(in.Projects) > 0 {
			writeProjects(&sql, in.Course.Slug, in.Projects)
		}
	} else {
		writeCourse(&sql, in.Course)
		writeModules(&sql, in.Course.Slug, in.Modules)
		writeLessons(&sql, in.Course.Slug, in.Modules)
		writeSections(&sql, in.Course.Slug, in.Modules)
		writeDependencies(&sql, in.Course.Slug, in.Modules)
		if len(in.Projects) > 0 {
			writeProjects(&sql, in.Course.Slug, in.Projects)
		}
	}

	fmt.Fprintf(&sql, "\nCOMMIT;\n")

	if err := os.WriteFile(*outFile, []byte(sql.String()), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to write output file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Curriculum %s generated → %s\n", map[bool]string{true: "refresh", false: "seed"}[*update], *outFile)
	fmt.Printf("  Course: %s (%s)\n", in.Course.Title, in.Course.Slug)
	fmt.Printf("  Modules: %d\n", len(in.Modules))
	totalLessons := 0
	for _, m := range in.Modules {
		totalLessons += len(m.Lessons)
	}
	fmt.Printf("  Lessons: %d\n", totalLessons)
	fmt.Printf("  Projects: %d\n", len(in.Projects))
	if *update {
		fmt.Println("✓ Refresh semantics: course/modules/lessons updated by slug; child rows re-inserted")
	} else {
		fmt.Println("⚠  Review seed.sql before running against your database")
	}
}

func writeCourse(sql *strings.Builder, c courseInput) {
	fmt.Fprintf(sql, "-- ── 1. COURSE ─────────────────────────────────────────────────────\n\n")

	fmt.Fprintf(sql, "INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)\n")
	fmt.Fprintf(sql, "VALUES ('%s', '%s', '%s', %d, %d, %d, false)\n",
		escapeSQL(c.Slug), escapeSQL(c.Title), escapeSQL(c.Description),
		c.DifficultyLevel, c.EstimatedHours, c.OrderNumber)
	fmt.Fprintf(sql, "ON CONFLICT (slug) DO NOTHING;\n\n")
}

func writeModules(sql *strings.Builder, courseSlug string, modules []moduleInput) {
	fmt.Fprintf(sql, "-- ── 2. MODULES ────────────────────────────────────────────────────\n\n")

	fmt.Fprintf(sql, "INSERT INTO modules (course_id, slug, title, description, order_number, visible)\n")
	first := true
	for _, m := range modules {
		if !first {
			fmt.Fprintf(sql, "\nUNION ALL\n")
		}
		fmt.Fprintf(sql, "SELECT c.id, '%s', '%s', '%s', %d, false\nFROM courses c WHERE c.slug = '%s'",
			escapeSQL(m.Slug), escapeSQL(m.Title), escapeSQL(m.Description),
			m.OrderNumber, escapeSQL(courseSlug))
		first = false
	}
	fmt.Fprintf(sql, "\nON CONFLICT (course_id, slug) DO NOTHING;\n\n")
}

func writeLessons(sql *strings.Builder, courseSlug string, modules []moduleInput) {
	fmt.Fprintf(sql, "-- ── 3. LESSONS ────────────────────────────────────────────────────\n\n")

	fmt.Fprintf(sql, "INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)\n")
	first := true
	for _, m := range modules {
		for _, l := range m.Lessons {
			refs := formatRefs(l.ProblemReferences)
			if !first {
				fmt.Fprintf(sql, "\nUNION ALL\n")
			}
			fmt.Fprintf(sql, "SELECT m.id, '%s', '%s', '%s', %d, %d, %d, %d, false, %s\nFROM modules m JOIN courses c ON m.course_id = c.id\nWHERE c.slug = '%s' AND m.slug = '%s'",
				escapeSQL(l.Slug), escapeSQL(l.Title), escapeSQL(l.Description),
				l.Difficulty, l.EstimatedMinutes, l.XPReward, l.OrderNumber,
				refs, escapeSQL(courseSlug), escapeSQL(m.Slug))
			first = false
		}
	}
	fmt.Fprintf(sql, "\nON CONFLICT (module_id, slug) DO NOTHING;\n\n")
}

// writeCourseUpdate updates an existing course in place by slug. The row id is
// preserved so course_progress records stay valid.
func writeCourseUpdate(sql *strings.Builder, c courseInput) {
	fmt.Fprintf(sql, "-- ── 1. COURSE (UPDATE) ──────────────────────────────────────────────\n\n")

	fmt.Fprintf(sql, "UPDATE courses\nSET title = '%s',\n    description = '%s',\n    difficulty_level = %d,\n    estimated_hours = %d,\n    order_number = %d\nWHERE slug = '%s';\n\n",
		escapeSQL(c.Title), escapeSQL(c.Description),
		c.DifficultyLevel, c.EstimatedHours, c.OrderNumber,
		escapeSQL(c.Slug))
}

// writeModulesUpdate updates existing modules in place by (course_id, slug).
// Row ids are preserved so lesson ids (and progress) stay valid.
func writeModulesUpdate(sql *strings.Builder, courseSlug string, modules []moduleInput) {
	fmt.Fprintf(sql, "-- ── 2. MODULES (UPDATE) ─────────────────────────────────────────────\n\n")

	for _, m := range modules {
		fmt.Fprintf(sql, "UPDATE modules\nSET title = '%s',\n    description = '%s',\n    order_number = %d\nWHERE course_id = (SELECT c.id FROM courses c WHERE c.slug = '%s')\n  AND slug = '%s';\n\n",
			escapeSQL(m.Title), escapeSQL(m.Description), m.OrderNumber,
			escapeSQL(courseSlug), escapeSQL(m.Slug))
	}
}

// writeLessonsUpdate updates existing lessons in place by (module_id, slug).
// Row ids are preserved so lesson_progress records stay valid.
func writeLessonsUpdate(sql *strings.Builder, courseSlug string, modules []moduleInput) {
	fmt.Fprintf(sql, "-- ── 3. LESSONS (UPDATE) ─────────────────────────────────────────────\n\n")

	for _, m := range modules {
		for _, l := range m.Lessons {
			refs := formatRefs(l.ProblemReferences)
			fmt.Fprintf(sql, "UPDATE lessons\nSET title = '%s',\n    description = '%s',\n    difficulty = %d,\n    estimated_minutes = %d,\n    xp_reward = %d,\n    problem_references = %s\nWHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = '%s' AND m.slug = '%s')\n  AND slug = '%s';\n\n",
				escapeSQL(l.Title), escapeSQL(l.Description),
				l.Difficulty, l.EstimatedMinutes, l.XPReward,
				refs, escapeSQL(courseSlug), escapeSQL(m.Slug), escapeSQL(l.Slug))
		}
	}
}

// clearChildRows deletes sections, projects, and lesson dependencies belonging
// to the course so they can be re-inserted with exact parity to the JSON. Only
// child rows are removed — parent course/module/lesson rows and user progress
// are untouched.
func clearChildRows(sql *strings.Builder, courseSlug string) {
	fmt.Fprintf(sql, "-- ── 4. CLEAR CHILD ROWS (re-insert for parity) ───────────────────────\n\n")

	fmt.Fprintf(sql, "DELETE FROM lesson_dependencies\nWHERE lesson_id IN (\n  SELECT l.id FROM lessons l\n  JOIN modules m ON l.module_id = m.id\n  JOIN courses c ON m.course_id = c.id\n  WHERE c.slug = '%s');\n\n", escapeSQL(courseSlug))

	fmt.Fprintf(sql, "DELETE FROM lesson_sections\nWHERE lesson_id IN (\n  SELECT l.id FROM lessons l\n  JOIN modules m ON l.module_id = m.id\n  JOIN courses c ON m.course_id = c.id\n  WHERE c.slug = '%s');\n\n", escapeSQL(courseSlug))

	fmt.Fprintf(sql, "DELETE FROM projects\nWHERE lesson_id IN (\n  SELECT l.id FROM lessons l\n  JOIN modules m ON l.module_id = m.id\n  JOIN courses c ON m.course_id = c.id\n  WHERE c.slug = '%s');\n\n", escapeSQL(courseSlug))
}

func writeSections(sql *strings.Builder, courseSlug string, modules []moduleInput) {
	fmt.Fprintf(sql, "-- ── 4. SECTIONS ───────────────────────────────────────────────────\n\n")

	for _, m := range modules {
		for _, l := range m.Lessons {
			for i, s := range l.Sections {
				order := i + 1
				content := s.Content
				if content == "" {
					fmt.Fprintf(sql, "INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)\nSELECT l.id, '%s', '%s', '', %d\nFROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id\nWHERE c.slug = '%s' AND m.slug = '%s' AND l.slug = '%s';\n\n",
						escapeSQL(s.SectionType), escapeSQL(s.Title), order,
						escapeSQL(courseSlug), escapeSQL(m.Slug), escapeSQL(l.Slug))
				} else {
					fmt.Fprintf(sql, "INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)\nSELECT l.id, '%s', '%s',\n%s, %d\nFROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id\nWHERE c.slug = '%s' AND m.slug = '%s' AND l.slug = '%s';\n\n",
						escapeSQL(s.SectionType), escapeSQL(s.Title),
						dollarQuote(content, "py"), order,
						escapeSQL(courseSlug), escapeSQL(m.Slug), escapeSQL(l.Slug))
				}
			}
		}
	}

	writeMetadataUpdates(sql, courseSlug, modules)
}

func writeMetadataUpdates(sql *strings.Builder, courseSlug string, modules []moduleInput) {
	for _, m := range modules {
		for _, l := range m.Lessons {
			for _, s := range l.Sections {
				if s.Metadata == nil || string(s.Metadata) == "null" || len(s.Metadata) <= 2 {
					continue
				}
				where := fmt.Sprintf("WHERE section_type = '%s' AND title = '%s'\n  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id\n    WHERE c2.slug = '%s' AND m2.slug = '%s' AND l2.slug = '%s')",
					escapeSQL(s.SectionType), escapeSQL(s.Title),
					escapeSQL(courseSlug), escapeSQL(m.Slug), escapeSQL(l.Slug))

				fmt.Fprintf(sql, "UPDATE lesson_sections SET metadata = %s::jsonb\n%s;\n\n",
					jsonDollarQuote(string(s.Metadata)), where)
			}
		}
	}
}

func writeDependencies(sql *strings.Builder, courseSlug string, modules []moduleInput) {
	hasDeps := false
	for _, m := range modules {
		for _, l := range m.Lessons {
			if len(l.Dependencies) > 0 {
				hasDeps = true
				break
			}
		}
		if hasDeps {
			break
		}
	}
	if !hasDeps {
		return
	}

	fmt.Fprintf(sql, "-- ── 5. DEPENDENCIES ───────────────────────────────────────────────\n\n")

	for _, m := range modules {
		for _, l := range m.Lessons {
			for _, dep := range l.Dependencies {
				fmt.Fprintf(sql, "INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)\nSELECT\n  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id\n    WHERE c.slug = '%s' AND m.slug = '%s' AND l.slug = '%s'),\n  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id\n    WHERE c.slug = '%s' AND l.slug = '%s')\nON CONFLICT DO NOTHING;\n\n",
					escapeSQL(courseSlug), escapeSQL(m.Slug), escapeSQL(l.Slug),
					escapeSQL(courseSlug), escapeSQL(dep))
			}
		}
	}
}

func writeProjects(sql *strings.Builder, courseSlug string, projects []projectInput) {
	fmt.Fprintf(sql, "-- ── 6. PROJECTS ───────────────────────────────────────────────────\n\n")

	for _, p := range projects {
		hints := formatRefs(p.Hints)
		fmt.Fprintf(sql, "INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)\nSELECT l.id, '%s', '%s', '%s',\n%s,\n%s, %d, %d, %s, %d, false\nFROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id\nWHERE c.slug = '%s' AND m.slug = '%s' AND l.slug = '%s'\nON CONFLICT (lesson_id, slug) DO NOTHING;\n\n",
			escapeSQL(p.Slug), escapeSQL(p.Title), escapeSQL(p.Description),
			dollarQuote(p.Requirements, "py"),
			dollarQuote(p.StarterCode, "py"),
			p.Difficulty, p.XPReward, hints, p.OrderNumber,
			escapeSQL(courseSlug), escapeSQL(p.ModuleSlug), escapeSQL(p.LessonSlug))
	}
}

func dollarQuote(s, tag string) string {
	if s == "" {
		return "''"
	}
	delim := tag + "$"
	if strings.Contains(s, "$"+tag+"$") {
		for i := 0; ; i++ {
			d := fmt.Sprintf("%s%d$", tag, i)
			if !strings.Contains(s, "$"+d) {
				delim = d
				break
			}
		}
	}
	return fmt.Sprintf("$%s%s$%s", delim, s, delim)
}

func jsonDollarQuote(s string) string {
	if s == "" {
		return "'{}'"
	}
	delim := "json$"
	if strings.Contains(s, "$json$") {
		for i := 0; ; i++ {
			d := fmt.Sprintf("json%d$", i)
			if !strings.Contains(s, "$"+d) {
				delim = d
				break
			}
		}
	}
	return fmt.Sprintf("$%s%s$%s", delim, s, delim)
}

func escapeSQL(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}

func formatRefs(refs []string) string {
	if len(refs) == 0 {
		return "ARRAY[]::TEXT[]"
	}
	escaped := make([]string, len(refs))
	for i, r := range refs {
		escaped[i] = "'" + escapeSQL(r) + "'"
	}
	return "ARRAY[" + strings.Join(escaped, ", ") + "]::TEXT[]"
}
