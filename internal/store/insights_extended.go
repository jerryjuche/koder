package store

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// ── Extended admin insights ────────────────────────────────────────────────
//
// Everything here is still aggregate SQL: no emails, no code, no free-text
// answers. The added sections exist so the admin analyst can answer follow-up
// questions (XP and levels, week-over-week movement, who is going quiet, which
// skills are weak, curriculum reach, what just happened) without guessing.

// InsightsComparison is the previous, equal-length window used for deltas.
type InsightsComparison struct {
	WindowStart      time.Time      `json:"window_start"`
	WindowEnd        time.Time      `json:"window_end"`
	Previous         InsightsTotals `json:"previous"`
	SubmissionsDelta int            `json:"submissions_delta"`
	PassedDelta      int            `json:"passed_delta"`
	ActiveUsersDelta int            `json:"active_users_delta"`
	SolvedDelta      int            `json:"solved_delta"`
	XPEarnedDelta    int            `json:"xp_earned_delta"`
	PassRateDelta    float64        `json:"pass_rate_delta"`
}

// InsightsLeaderboardEntry is a lifetime XP ranking row with window movement.
type InsightsLeaderboardEntry struct {
	UserID      string  `json:"user_id"`
	Name        string  `json:"name"`
	Username    string  `json:"username"`
	LifetimeXP  int     `json:"lifetime_xp"`
	Level       int     `json:"level"`
	WindowXP    int     `json:"window_xp"`
	WindowRank  int     `json:"window_rank"`
	RankChange  int     `json:"rank_change"` // positive = moved up
	Solved      int     `json:"solved"`
	StreakDays  int     `json:"streak_days"`
}

// InsightsLevelBucket is one level band and how many students sit in it.
type InsightsLevelBucket struct {
	Level    int `json:"level"`
	Students int `json:"students"`
	XPFloor  int `json:"xp_floor"`
}

// InsightsAtRiskStudent is an engaged student who has gone quiet.
type InsightsAtRiskStudent struct {
	UserID      string    `json:"user_id"`
	Name        string    `json:"name"`
	Username    string    `json:"username"`
	LifetimeXP  int       `json:"lifetime_xp"`
	Level       int       `json:"level"`
	LastActive  time.Time `json:"last_active"`
	DaysQuiet   int       `json:"days_quiet"`
}

// InsightsStuckStudent is a student repeatedly failing one problem.
type InsightsStuckStudent struct {
	UserID   string `json:"user_id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Problem  string `json:"problem"`
	Slug     string `json:"slug"`
	Fails    int    `json:"fails"`
}

// InsightsAtRisk groups the two risk signals.
type InsightsAtRisk struct {
	GoneQuiet []InsightsAtRiskStudent `json:"gone_quiet"`
	Stuck     []InsightsStuckStudent  `json:"stuck"`
}

// InsightsFunnel covers curriculum reach. Lesson rows only record completion,
// so course_progress supplies the started/completed pair for a real funnel.
type InsightsFunnel struct {
	LessonsPublished     int     `json:"lessons_published"`
	LessonsCompleted     int     `json:"lessons_completed_all_time"`
	CompletionsInWindow  int     `json:"completions_in_window"`
	LearnersInWindow     int     `json:"learners_in_window"`
	LessonXPInWindow     int     `json:"lesson_xp_in_window"`
	CoursesStarted       int     `json:"courses_started"`
	CoursesCompleted     int     `json:"courses_completed"`
	CourseCompletionRate float64 `json:"course_completion_rate"`
}

// InsightsActivity is one recent platform activity log entry.
type InsightsActivity struct {
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// InsightsStudentRef is the minimal directory row used to resolve a name in an
// admin question to a user id. No emails or credentials leave the store.
type InsightsStudentRef struct {
	UserID   string `json:"user_id"`
	Name     string `json:"name"`
	Username string `json:"username"`
}

// StudentInsight is the per-student drill-down for "how is <name> doing?".
type StudentInsight struct {
	UserID      string     `json:"user_id"`
	Name        string     `json:"name"`
	Username    string     `json:"username"`
	LifetimeXP  int        `json:"lifetime_xp"`
	Level       int        `json:"level"`
	Rank        int        `json:"rank"`
	StreakDays  int        `json:"streak_days"`
	LastActive  *time.Time `json:"last_active"`
	SolvedTotal int        `json:"solved_total"`

	WindowAttempts     int     `json:"window_attempts"`
	WindowPassed       int     `json:"window_passed"`
	WindowSolved       int     `json:"window_solved"`
	WindowXPEarned     int     `json:"window_xp_earned"`
	WindowPassRate     float64 `json:"window_pass_rate"`
	WindowAvgRuntimeMs int     `json:"window_avg_runtime_ms"`
	LessonsCompleted   int     `json:"lessons_completed"`

	Difficulties   []InsightsDifficulty   `json:"difficulties"`
	Modules        []InsightsModule       `json:"modules"`
	Skills         []InsightsSkill        `json:"skills"`
	StrugglingWith []InsightsProblemHealth `json:"struggling_with"`
	RecentSolved   []string               `json:"recent_solved"`
}

// GetInsightsExtended fills the parts of the snapshot that need their own
// queries. Called from GetInsightsSnapshot.
func (s *PostgresStore) GetInsightsExtended(ctx context.Context, out *InsightsSnapshot, period string, start, end time.Time) error {
	if err := s.insightsComparison(ctx, out, period, start, end); err != nil {
		return err
	}
	if err := s.insightsLeaderboard(ctx, out, start, end); err != nil {
		return err
	}
	if err := s.insightsLevels(ctx, out); err != nil {
		return err
	}
	if err := s.insightsAtRisk(ctx, out, start, end); err != nil {
		return err
	}
	if err := s.insightsWeakSkills(ctx, out, start, end); err != nil {
		return err
	}
	if err := s.insightsFunnel(ctx, out, start, end); err != nil {
		if !isRelationNotExist(err) {
			return err
		}
	}
	if err := s.insightsRecentActivity(ctx, out); err != nil {
		if !isRelationNotExist(err) {
			return err
		}
	}
	return nil
}

// insightsComparison re-runs the totals query over the preceding window of the
// same length. "all" has no meaningful predecessor, so it is left nil.
func (s *PostgresStore) insightsComparison(ctx context.Context, out *InsightsSnapshot, period string, start, end time.Time) error {
	if period == "all" {
		return nil
	}
	length := end.Sub(start)
	if length <= 0 {
		return nil
	}
	prevStart, prevEnd := start.Add(-length), start

	previous := &InsightsSnapshot{}
	if err := s.insightsTotals(ctx, previous, prevStart, prevEnd); err != nil {
		return err
	}

	out.Comparison = &InsightsComparison{
		WindowStart:      prevStart.UTC(),
		WindowEnd:        prevEnd.UTC(),
		Previous:         previous.Totals,
		SubmissionsDelta: out.Totals.Submissions - previous.Totals.Submissions,
		PassedDelta:      out.Totals.Passed - previous.Totals.Passed,
		ActiveUsersDelta: out.Totals.ActiveUsers - previous.Totals.ActiveUsers,
		SolvedDelta:      out.Totals.Solutions - previous.Totals.Solutions,
		XPEarnedDelta:    out.Totals.XPEarned - previous.Totals.XPEarned,
		PassRateDelta:    round1(out.Totals.PassRate - previous.Totals.PassRate),
	}
	return nil
}

// insightsLeaderboard ranks by lifetime XP and reports movement based on where
// each student sat in the previous window's XP ranking.
func (s *PostgresStore) insightsLeaderboard(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		WITH window_subs AS (
			SELECT user_id, problem_id, status
			  FROM submissions
			 WHERE created_at >= $1 AND created_at < $2
		),
		window_agg AS (
			SELECT user_id,
			       COUNT(DISTINCT problem_id) FILTER (WHERE status = 'passed')::int AS solved
			  FROM window_subs
			 GROUP BY user_id
		),
		earned AS (
			SELECT fp.user_id, COALESCE(SUM(p.xp_reward), 0)::int AS xp_earned
			  FROM (SELECT user_id, problem_id, MIN(created_at) AS first_pass
			          FROM submissions
			         WHERE status = 'passed'
			         GROUP BY user_id, problem_id) fp
			  JOIN problems p ON p.id = fp.problem_id
			 WHERE fp.first_pass >= $1 AND fp.first_pass < $2
			 GROUP BY fp.user_id
		),
		pass_days AS (
			SELECT user_id, (created_at AT TIME ZONE 'UTC')::date AS d
			  FROM submissions
			 WHERE status = 'passed'
			 GROUP BY 1, 2
		),
		islands AS (
			SELECT user_id, d,
			       d - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d))::int AS grp
			  FROM pass_days
		),
		streaks AS (
			SELECT user_id, COUNT(*)::int AS streak_days
			  FROM islands
			 GROUP BY user_id, grp
			HAVING MAX(d) >= (NOW() AT TIME ZONE 'UTC')::date - 1
		)
		SELECT u.id::text,
		       COALESCE(u.name, ''),
		       COALESCE(u.username, u.student_id),
		       u.xp,
		       u.xp / 1000 + 1,
		       COALESCE(e.xp_earned, 0),
		       COALESCE(a.solved, 0),
		       COALESCE(st.streak_days, 0)
		  FROM users u
		  LEFT JOIN window_agg a ON a.user_id = u.id
		  LEFT JOIN earned e ON e.user_id = u.id
		  LEFT JOIN streaks st ON st.user_id = u.id
		 WHERE u.role <> 'admin'
		 ORDER BY u.xp DESC, COALESCE(e.xp_earned, 0) DESC
		 LIMIT 10
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return fmt.Errorf("insights: leaderboard query: %w", err)
	}
	defer rows.Close()

	// Movement is measured inside the current and previous top-10 only, which
	// keeps the query cheap; the UI labels it as top-10 movement.
	currentRank := make(map[string]int, len(out.TopPerformers))
	for i, p := range out.TopPerformers {
		currentRank[p.UserID] = i + 1
	}
	previousRank := make(map[string]int)
	prevPerformers, err := s.insightsPerformersFor(ctx, start.Add(-(end.Sub(start))), start)
	if err == nil {
		for i, p := range prevPerformers {
			previousRank[p.UserID] = i + 1
		}
	}

	for rows.Next() {
		var e InsightsLeaderboardEntry
		if err := rows.Scan(
			&e.UserID, &e.Name, &e.Username, &e.LifetimeXP, &e.Level,
			&e.WindowXP, &e.Solved, &e.StreakDays,
		); err != nil {
			return fmt.Errorf("insights: scan leaderboard: %w", err)
		}
		e.WindowRank = currentRank[e.UserID]
		if prev, ok := previousRank[e.UserID]; ok && e.WindowRank > 0 {
			e.RankChange = prev - e.WindowRank
		}
		out.Leaderboard = append(out.Leaderboard, e)
	}
	return rows.Err()
}

// insightsLevels counts students per level band so the UI can show the
// distribution instead of a single average.
func (s *PostgresStore) insightsLevels(ctx context.Context, out *InsightsSnapshot) error {
	rows, err := s.pool.Query(ctx, `
		SELECT (u.xp / 1000) + 1 AS level, COUNT(*)::int
		  FROM users u
		 WHERE u.role <> 'admin'
		 GROUP BY 1
		 ORDER BY 1
		 LIMIT 12
	`)
	if err != nil {
		return fmt.Errorf("insights: levels query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var b InsightsLevelBucket
		if err := rows.Scan(&b.Level, &b.Students); err != nil {
			return fmt.Errorf("insights: scan level: %w", err)
		}
		b.XPFloor = (b.Level - 1) * 1000
		out.Levels = append(out.Levels, b)
	}
	return rows.Err()
}

func (s *PostgresStore) insightsAtRisk(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	quietQuery := `
		WITH last_sub AS (
			SELECT user_id, MAX(created_at) AS last_at
			  FROM submissions
			 GROUP BY user_id
		)
		SELECT u.id::text,
		       COALESCE(u.name, ''),
		       COALESCE(u.username, u.student_id),
		       u.xp,
		       u.xp / 1000 + 1,
		       ls.last_at,
		       GREATEST(EXTRACT(DAY FROM (NOW() - ls.last_at))::int, 1)
		  FROM users u
		  JOIN last_sub ls ON ls.user_id = u.id
		 WHERE u.role <> 'admin'
		   AND u.xp > 0
		   AND ls.last_at < NOW() - INTERVAL '7 days'
		   AND ls.last_at > NOW() - INTERVAL '60 days'
		 ORDER BY u.xp DESC
		 LIMIT 6
	`
	rows, err := s.pool.Query(ctx, quietQuery)
	if err != nil {
		return fmt.Errorf("insights: gone-quiet query: %w", err)
	}
	for rows.Next() {
		var r InsightsAtRiskStudent
		if err := rows.Scan(&r.UserID, &r.Name, &r.Username, &r.LifetimeXP, &r.Level, &r.LastActive, &r.DaysQuiet); err != nil {
			rows.Close()
			return fmt.Errorf("insights: scan gone-quiet: %w", err)
		}
		out.AtRisk.GoneQuiet = append(out.AtRisk.GoneQuiet, r)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return err
	}
	rows.Close()

	stuckQuery := `
		WITH fails AS (
			SELECT user_id, problem_id, COUNT(*)::int AS fails
			  FROM submissions
			 WHERE created_at >= $1 AND created_at < $2
			   AND status <> 'passed'
			 GROUP BY user_id, problem_id
			HAVING COUNT(*) >= 3
		),
		passed AS (
			SELECT DISTINCT user_id, problem_id
			  FROM submissions
			 WHERE status = 'passed' AND created_at >= $1 AND created_at < $2
		)
		SELECT u.id::text,
		       COALESCE(u.name, ''),
		       COALESCE(u.username, u.student_id),
		       COALESCE(p.title, p.slug),
		       p.slug,
		       f.fails
		  FROM fails f
		  JOIN users u ON u.id = f.user_id
		  JOIN problems p ON p.id = f.problem_id
		 WHERE u.role <> 'admin'
		   AND NOT EXISTS (SELECT 1 FROM passed ps WHERE ps.user_id = f.user_id AND ps.problem_id = f.problem_id)
		 ORDER BY f.fails DESC
		 LIMIT 8
	`
	stuckRows, err := s.pool.Query(ctx, stuckQuery, start, end)
	if err != nil {
		return fmt.Errorf("insights: stuck query: %w", err)
	}
	defer stuckRows.Close()
	for stuckRows.Next() {
		var r InsightsStuckStudent
		if err := stuckRows.Scan(&r.UserID, &r.Name, &r.Username, &r.Problem, &r.Slug, &r.Fails); err != nil {
			return fmt.Errorf("insights: scan stuck: %w", err)
		}
		out.AtRisk.Stuck = append(out.AtRisk.Stuck, r)
	}
	return stuckRows.Err()
}

// insightsWeakSkills lists tags with enough volume to be a real signal but a
// low pass rate. The general Skills list is ordered by volume, which hides the
// topics the cohort is actually failing.
func (s *PostgresStore) insightsWeakSkills(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT t.tag,
		       COUNT(DISTINCT (s.user_id, s.problem_id)) FILTER (WHERE s.status = 'passed')::int,
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		  CROSS JOIN LATERAL unnest(COALESCE(p.tags, ARRAY[]::text[])) AS t(tag)
		 WHERE s.created_at >= $1 AND s.created_at < $2
		   AND t.tag <> ''
		 GROUP BY t.tag
		HAVING COUNT(*) >= 5
		   AND COUNT(*) FILTER (WHERE s.status = 'passed')::numeric / COUNT(*) < 0.55
		 ORDER BY 100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*) ASC, COUNT(*) DESC
		 LIMIT 6
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return fmt.Errorf("insights: weak skills query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var sk InsightsSkill
		if err := rows.Scan(&sk.Tag, &sk.Solved, &sk.Attempts, &sk.PassRate); err != nil {
			return fmt.Errorf("insights: scan weak skill: %w", err)
		}
		out.WeakSkills = append(out.WeakSkills, sk)
	}
	return rows.Err()
}

func (s *PostgresStore) insightsFunnel(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	f := &out.Funnel
	err := s.pool.QueryRow(ctx, `
		SELECT
			(SELECT COUNT(*) FROM lessons WHERE visible = true),
			(SELECT COUNT(*) FROM lesson_progress WHERE completed = true),
			(SELECT COUNT(*) FROM lesson_progress WHERE completed = true AND completed_at >= $1 AND completed_at < $2),
			(SELECT COUNT(DISTINCT user_id) FROM lesson_progress WHERE completed = true AND completed_at >= $1 AND completed_at < $2),
			(SELECT COALESCE(SUM(xp_awarded), 0)::int FROM lesson_progress WHERE completed = true AND completed_at >= $1 AND completed_at < $2),
			(SELECT COUNT(*) FROM course_progress WHERE started_at >= $1 AND started_at < $2),
			(SELECT COUNT(*) FROM course_progress WHERE completed_at >= $1 AND completed_at < $2)
	`, start, end).Scan(
		&f.LessonsPublished, &f.LessonsCompleted, &f.CompletionsInWindow,
		&f.LearnersInWindow, &f.LessonXPInWindow, &f.CoursesStarted, &f.CoursesCompleted,
	)
	if err != nil {
		return fmt.Errorf("insights: funnel query: %w", err)
	}
	if f.CoursesStarted > 0 {
		f.CourseCompletionRate = round1(float64(f.CoursesCompleted) / float64(f.CoursesStarted) * 100)
	}
	return nil
}

// insightsRecentActivity gives the analyst "what just happened" context that is
// not limited to the selected window.
func (s *PostgresStore) insightsRecentActivity(ctx context.Context, out *InsightsSnapshot) error {
	rows, err := s.pool.Query(ctx, `
		SELECT type, message, created_at
		  FROM activity_logs
		 ORDER BY created_at DESC
		 LIMIT 10
	`)
	if err != nil {
		return fmt.Errorf("insights: activity feed query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var a InsightsActivity
		if err := rows.Scan(&a.Type, &a.Message, &a.CreatedAt); err != nil {
			return fmt.Errorf("insights: scan activity: %w", err)
		}
		out.ActivityFeed = append(out.ActivityFeed, a)
	}
	return rows.Err()
}

// ListStudentDirectory returns the minimal identity rows used to resolve a
// name mentioned in an admin question. Bounded so a huge tenant stays cheap.
func (s *PostgresStore) ListStudentDirectory(ctx context.Context) ([]InsightsStudentRef, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, COALESCE(name, ''), COALESCE(username, student_id)
		  FROM users
		 WHERE role <> 'admin'
		 ORDER BY xp DESC, name ASC
		 LIMIT 2000
	`)
	if err != nil {
		return nil, fmt.Errorf("insights: directory query: %w", err)
	}
	defer rows.Close()

	out := make([]InsightsStudentRef, 0, 64)
	for rows.Next() {
		var r InsightsStudentRef
		if err := rows.Scan(&r.UserID, &r.Name, &r.Username); err != nil {
			return nil, fmt.Errorf("insights: scan directory: %w", err)
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

// GetStudentInsight builds one student's profile for the window. Like the
// platform snapshot it returns aggregates only.
func (s *PostgresStore) GetStudentInsight(ctx context.Context, userID uuid.UUID, start, end time.Time) (*StudentInsight, error) {
	out := &StudentInsight{
		UserID:         userID.String(),
		Difficulties:   make([]InsightsDifficulty, 0),
		Modules:        make([]InsightsModule, 0),
		Skills:         make([]InsightsSkill, 0),
		StrugglingWith: make([]InsightsProblemHealth, 0),
		RecentSolved:   make([]string, 0),
	}

	err := s.pool.QueryRow(ctx, `
		SELECT COALESCE(name, ''), COALESCE(username, student_id), xp, xp / 1000 + 1,
		       (SELECT COUNT(*)::int FROM users WHERE role <> 'admin' AND xp > u.xp) + 1,
		       (SELECT COUNT(*)::int FROM progress WHERE user_id = u.id AND solved = true)
		  FROM users u
		 WHERE u.id = $1 AND u.role <> 'admin'
	`, userID).Scan(
		&out.Name, &out.Username, &out.LifetimeXP, &out.Level, &out.Rank, &out.SolvedTotal,
	)
	if err != nil {
		return nil, fmt.Errorf("insights: student profile: %w", err)
	}

	var lastActive *time.Time
	_ = s.pool.QueryRow(ctx, `SELECT MAX(created_at) FROM submissions WHERE user_id = $1`, userID).Scan(&lastActive)
	out.LastActive = lastActive

	if err := s.pool.QueryRow(ctx, `
		SELECT
			COUNT(*)::int,
			COUNT(*) FILTER (WHERE status = 'passed')::int,
			COUNT(DISTINCT problem_id) FILTER (WHERE status = 'passed')::int,
			COALESCE(ROUND(AVG(runtime_ms) FILTER (WHERE status = 'passed'))::int, 0)
		  FROM submissions
		 WHERE user_id = $1 AND created_at >= $2 AND created_at < $3
	`, userID, start, end).Scan(
		&out.WindowAttempts, &out.WindowPassed, &out.WindowSolved, &out.WindowAvgRuntimeMs,
	); err != nil {
		return nil, fmt.Errorf("insights: student window: %w", err)
	}
	if out.WindowAttempts > 0 {
		out.WindowPassRate = round1(float64(out.WindowPassed) / float64(out.WindowAttempts) * 100)
	}

	if err := s.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(p.xp_reward), 0)::int
		  FROM (SELECT problem_id, MIN(created_at) AS first_pass
		          FROM submissions
		         WHERE user_id = $1 AND status = 'passed'
		         GROUP BY problem_id) fp
		  JOIN problems p ON p.id = fp.problem_id
		 WHERE fp.first_pass >= $2 AND fp.first_pass < $3
	`, userID, start, end).Scan(&out.WindowXPEarned); err != nil {
		return nil, fmt.Errorf("insights: student xp: %w", err)
	}

	_ = s.pool.QueryRow(ctx, `
		SELECT COUNT(*)::int FROM lesson_progress
		 WHERE user_id = $1 AND completed = true AND completed_at >= $2 AND completed_at < $3
	`, userID, start, end).Scan(&out.LessonsCompleted)

	if streak, err := s.CalculateStreak(ctx, userID); err == nil {
		out.StreakDays = streak
	}

	if err := s.studentBreakdowns(ctx, out, userID, start, end); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *PostgresStore) studentBreakdowns(ctx context.Context, out *StudentInsight, userID uuid.UUID, start, end time.Time) error {
	diffRows, err := s.pool.Query(ctx, `
		SELECT COALESCE(p.difficulty, 0),
		       COUNT(DISTINCT (s.user_id, s.problem_id)) FILTER (WHERE s.status = 'passed')::int,
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		 WHERE s.user_id = $1 AND s.created_at >= $2 AND s.created_at < $3
		 GROUP BY COALESCE(p.difficulty, 0)
		 ORDER BY 1
	`, userID, start, end)
	if err != nil {
		return fmt.Errorf("insights: student difficulty: %w", err)
	}
	for diffRows.Next() {
		var d InsightsDifficulty
		if err := diffRows.Scan(&d.Difficulty, &d.Solved, &d.Attempts, &d.PassRate); err != nil {
			diffRows.Close()
			return fmt.Errorf("insights: scan student difficulty: %w", err)
		}
		out.Difficulties = append(out.Difficulties, d)
	}
	if err := diffRows.Err(); err != nil {
		diffRows.Close()
		return err
	}
	diffRows.Close()

	modRows, err := s.pool.Query(ctx, `
		SELECT p.module,
		       1,
		       COUNT(DISTINCT (s.user_id, s.problem_id)) FILTER (WHERE s.status = 'passed')::int,
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8,
		       COALESCE(ROUND(AVG(s.runtime_ms) FILTER (WHERE s.status = 'passed'))::int, 0)
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		 WHERE s.user_id = $1 AND s.created_at >= $2 AND s.created_at < $3
		 GROUP BY p.module
		 ORDER BY COUNT(*) DESC
		 LIMIT 8
	`, userID, start, end)
	if err != nil {
		return fmt.Errorf("insights: student modules: %w", err)
	}
	for modRows.Next() {
		var m InsightsModule
		if err := modRows.Scan(&m.Module, &m.Students, &m.Solved, &m.Attempts, &m.PassRate, &m.AvgRuntimeMs); err != nil {
			modRows.Close()
			return fmt.Errorf("insights: scan student module: %w", err)
		}
		out.Modules = append(out.Modules, m)
	}
	if err := modRows.Err(); err != nil {
		modRows.Close()
		return err
	}
	modRows.Close()

	skillRows, err := s.pool.Query(ctx, `
		SELECT t.tag,
		       COUNT(DISTINCT (s.user_id, s.problem_id)) FILTER (WHERE s.status = 'passed')::int,
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		  CROSS JOIN LATERAL unnest(COALESCE(p.tags, ARRAY[]::text[])) AS t(tag)
		 WHERE s.user_id = $1 AND s.created_at >= $2 AND s.created_at < $3
		   AND t.tag <> ''
		 GROUP BY t.tag
		 ORDER BY COUNT(*) DESC
		 LIMIT 10
	`, userID, start, end)
	if err != nil {
		return fmt.Errorf("insights: student skills: %w", err)
	}
	for skillRows.Next() {
		var sk InsightsSkill
		if err := skillRows.Scan(&sk.Tag, &sk.Solved, &sk.Attempts, &sk.PassRate); err != nil {
			skillRows.Close()
			return fmt.Errorf("insights: scan student skill: %w", err)
		}
		out.Skills = append(out.Skills, sk)
	}
	if err := skillRows.Err(); err != nil {
		skillRows.Close()
		return err
	}
	skillRows.Close()

	struggleRows, err := s.pool.Query(ctx, `
		SELECT p.slug,
		       COALESCE(p.title, p.slug),
		       p.module,
		       COALESCE(p.difficulty, 0),
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		 WHERE s.user_id = $1 AND s.created_at >= $2 AND s.created_at < $3
		 GROUP BY p.id
		HAVING COUNT(*) >= 2
		   AND COUNT(*) FILTER (WHERE s.status = 'passed')::numeric / COUNT(*) < 0.5
		 ORDER BY COUNT(*) FILTER (WHERE s.status <> 'passed') DESC
		 LIMIT 5
	`, userID, start, end)
	if err != nil {
		return fmt.Errorf("insights: student struggles: %w", err)
	}
	for struggleRows.Next() {
		var p InsightsProblemHealth
		if err := struggleRows.Scan(&p.Slug, &p.Title, &p.Module, &p.Difficulty, &p.Attempts, &p.PassRate); err != nil {
			struggleRows.Close()
			return fmt.Errorf("insights: scan student struggle: %w", err)
		}
		out.StrugglingWith = append(out.StrugglingWith, p)
	}
	if err := struggleRows.Err(); err != nil {
		struggleRows.Close()
		return err
	}
	struggleRows.Close()

	solvedRows, err := s.pool.Query(ctx, `
		SELECT COALESCE(p.title, p.slug)
		  FROM progress pr
		  JOIN problems p ON p.id = pr.problem_id
		 WHERE pr.user_id = $1 AND pr.solved = true
		 ORDER BY pr.best_runtime ASC NULLS LAST
		 LIMIT 8
	`, userID)
	if err != nil {
		return fmt.Errorf("insights: student solved: %w", err)
	}
	defer solvedRows.Close()
	for solvedRows.Next() {
		var title string
		if err := solvedRows.Scan(&title); err != nil {
			return fmt.Errorf("insights: scan student solved: %w", err)
		}
		out.RecentSolved = append(out.RecentSolved, title)
	}
	return solvedRows.Err()
}
