package store

import (
	"context"
	"fmt"
	"time"
)

// ── Admin insights snapshot ────────────────────────────────────────────────
//
// The admin AI insights endpoint never lets the model query the database and
// never lets it see raw rows. Instead this file computes one compact,
// pre-aggregated snapshot with plain SQL and hands that to the model as
// grounding data. Every number the admin sees is therefore reproducible from
// the database alone; the model's only job is to explain it.
//
// All windows are half-open [WindowStart, WindowEnd) in UTC so consecutive
// "today" snapshots never double-count the same submission.

// InsightsTotals summarises activity inside the requested window.
type InsightsTotals struct {
	ActiveUsers    int     `json:"active_users"`    // distinct students who submitted
	NewUsers       int     `json:"new_users"`       // accounts created in the window
	Submissions    int     `json:"submissions"`     // grading attempts
	Passed         int     `json:"passed"`          // attempts that fully passed
	Failed         int     `json:"failed"`          // attempts that did not pass
	PassRate       float64 `json:"pass_rate"`       // passed / submissions, percent
	Solutions      int     `json:"solutions"`       // distinct (student, problem) solved
	XPEarned       int     `json:"xp_earned"`       // XP from first-time solves only
	AvgRuntimeMs   int     `json:"avg_runtime_ms"`  // mean runtime of passing attempts
	SubmissionsDay float64 `json:"submissions_per_active_user"`
}

// InsightsLifetime is platform context that does not depend on the window.
type InsightsLifetime struct {
	Students        int `json:"students"`          // non-admin accounts
	EngagedStudents int `json:"engaged_students"`  // non-admin accounts with XP > 0
	ActiveProblems  int `json:"active_problems"`   // visible problems
	TotalSolves     int `json:"total_solves"`      // solved progress rows
	ActiveLast7Days int `json:"active_last_7_days"`// students with a submission in 7d
}

// InsightsDailyCount is one day of submission volume for trend narration.
type InsightsDailyCount struct {
	Day         string `json:"day"` // YYYY-MM-DD (UTC)
	Submissions int    `json:"submissions"`
	Passed      int    `json:"passed"`
	ActiveUsers int    `json:"active_users"`
}

// InsightsPerformer is a ranked student inside the window.
type InsightsPerformer struct {
	UserID      string  `json:"user_id"`
	Name        string  `json:"name"`
	Username    string  `json:"username"`
	XPEarned    int     `json:"xp_earned"`
	LifetimeXP  int     `json:"lifetime_xp"`
	Solved      int     `json:"solved"`
	Attempts    int     `json:"attempts"`
	PassRate    float64 `json:"pass_rate"`
		AvgRuntimeMs int    `json:"avg_runtime_ms"`
	StreakDays  int    `json:"streak_days"`
	Level       int    `json:"level"`
}

// InsightsSkill aggregates practice by problem tag (e.g. "recursion").
type InsightsSkill struct {
	Tag      string  `json:"tag"`
	Solved   int     `json:"solved"`
	Attempts int     `json:"attempts"`
	PassRate float64 `json:"pass_rate"`
}

// InsightsModule aggregates practice by curriculum module.
type InsightsModule struct {
	Module       string  `json:"module"`
	Students     int     `json:"students"`
	Solved       int     `json:"solved"`
	Attempts     int     `json:"attempts"`
	PassRate     float64 `json:"pass_rate"`
	AvgRuntimeMs int     `json:"avg_runtime_ms"`
}

// InsightsDifficulty aggregates practice by difficulty level 1-5.
type InsightsDifficulty struct {
	Difficulty int     `json:"difficulty"`
	Solved     int     `json:"solved"`
	Attempts   int     `json:"attempts"`
	PassRate   float64 `json:"pass_rate"`
}

// InsightsProblemHealth is a problem students are currently failing.
type InsightsProblemHealth struct {
	Slug     string  `json:"slug"`
	Title    string  `json:"title"`
	Module   string  `json:"module"`
	Difficulty int   `json:"difficulty"`
	Attempts int     `json:"attempts"`
	PassRate float64 `json:"pass_rate"`
}

// InsightsCommunity covers contribution, feedback and social signal volume.
type InsightsCommunity struct {
	ContributionsSubmitted int `json:"contributions_submitted"`
	ContributionsPending   int `json:"contributions_pending"`
	ContributionsReviewed  int `json:"contributions_reviewed"`
	FeedbackNew            int `json:"feedback_new"`
	FeedbackOpen           int `json:"feedback_open"`
	Likes                  int `json:"likes"`
}

// InsightsCurriculum covers lesson-level learning progress.
type InsightsCurriculum struct {
	LessonsCompleted int `json:"lessons_completed"`
	LessonLearners   int `json:"lesson_learners"`
	LessonXP         int `json:"lesson_xp"`
}

// InsightsAI reports the platform's own AI spend for the window.
type InsightsAI struct {
	Calls      int              `json:"calls"`
	SuccessRate float64         `json:"success_rate"`
	AvgMs      int              `json:"avg_response_ms"`
	TokensIn   int              `json:"tokens_in"`
	TokensOut  int              `json:"tokens_out"`
	ByAction   []InsightsAIActivity `json:"by_action"`
}

// InsightsAIActivity is one AI action bucket.
type InsightsAIActivity struct {
	Action string `json:"action"`
	Calls  int    `json:"calls"`
}

// InsightsSnapshot is the full grounding payload for one admin question.
type InsightsSnapshot struct {
	GeneratedAt        time.Time              `json:"generated_at"`
	Period             string                 `json:"period"`
	WindowStart        time.Time              `json:"window_start"`
	WindowEnd          time.Time              `json:"window_end"`
	Totals             InsightsTotals         `json:"totals"`
	Lifetime           InsightsLifetime       `json:"lifetime"`
	DailyActivity      []InsightsDailyCount   `json:"daily_activity"`
	TopPerformers      []InsightsPerformer    `json:"top_performers"`
	Skills             []InsightsSkill        `json:"skills"`
	Modules            []InsightsModule       `json:"modules"`
	Difficulty         []InsightsDifficulty   `json:"difficulty"`
	StrugglingProblems []InsightsProblemHealth `json:"struggling_problems"`
	Community          InsightsCommunity      `json:"community"`
	Curriculum         InsightsCurriculum     `json:"curriculum"`
	AI                 InsightsAI             `json:"ai"`

	// Extended sections (internal/store/insights_extended.go): comparison with
	// the previous window, lifetime XP leaderboard, level distribution, risk
	// signals, skill gaps, curriculum funnel and recent platform activity.
	Comparison  *InsightsComparison       `json:"comparison,omitempty"`
	Leaderboard []InsightsLeaderboardEntry `json:"leaderboard"`
	Levels      []InsightsLevelBucket      `json:"levels"`
	AtRisk      InsightsAtRisk             `json:"at_risk"`
	WeakSkills  []InsightsSkill            `json:"weak_skills"`
	Funnel      InsightsFunnel             `json:"funnel"`
	ActivityFeed []InsightsActivity        `json:"activity_feed"`
}

// GetInsightsSnapshot builds the read-only analytics snapshot for a window.
// It runs only aggregate SELECTs — no user-authored text, no emails, no code —
// so the payload is safe to send to a third-party model.
func (s *PostgresStore) GetInsightsSnapshot(ctx context.Context, period string, windowStart, windowEnd time.Time) (*InsightsSnapshot, error) {
	snapshot := &InsightsSnapshot{
		GeneratedAt: time.Now().UTC(),
		Period:      period,
		WindowStart: windowStart.UTC(),
		WindowEnd:   windowEnd.UTC(),
		DailyActivity: make([]InsightsDailyCount, 0),
		TopPerformers: make([]InsightsPerformer, 0),
		Skills: make([]InsightsSkill, 0),
		Modules: make([]InsightsModule, 0),
		Difficulty: make([]InsightsDifficulty, 0),
		StrugglingProblems: make([]InsightsProblemHealth, 0),
		Leaderboard:        make([]InsightsLeaderboardEntry, 0),
		Levels:             make([]InsightsLevelBucket, 0),
		WeakSkills:         make([]InsightsSkill, 0),
		ActivityFeed:       make([]InsightsActivity, 0),
	}
	snapshot.AI.ByAction = make([]InsightsAIActivity, 0)
	snapshot.AtRisk.GoneQuiet = make([]InsightsAtRiskStudent, 0)
	snapshot.AtRisk.Stuck = make([]InsightsStuckStudent, 0)

	if err := s.insightsTotals(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	if err := s.insightsLifetime(ctx, snapshot); err != nil {
		return nil, err
	}
	if err := s.insightsDaily(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	// Extended aggregates run after the core totals because the comparison and
	// leaderboard sections read the core window values.
	if err := s.GetInsightsExtended(ctx, snapshot, period, windowStart, windowEnd); err != nil {
		return nil, err
	}
	if err := s.insightsPerformers(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	if err := s.insightsSkills(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	if err := s.insightsModules(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	if err := s.insightsDifficulty(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	if err := s.insightsProblemHealth(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	if err := s.insightsCommunity(ctx, snapshot, windowStart, windowEnd); err != nil {
		return nil, err
	}
	// Curriculum and AI usage tables are optional on older deployments; a
	// missing relation degrades to zeroes instead of failing the whole report.
	if err := s.insightsCurriculum(ctx, snapshot, windowStart, windowEnd); err != nil {
		if !isRelationNotExist(err) {
			return nil, err
		}
	}
	if err := s.insightsAI(ctx, snapshot, windowStart, windowEnd); err != nil {
		if !isRelationNotExist(err) {
			return nil, err
		}
	}

	return snapshot, nil
}

func (s *PostgresStore) insightsTotals(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT
			(SELECT COUNT(DISTINCT user_id) FROM submissions WHERE created_at >= $1 AND created_at < $2),
			(SELECT COUNT(*) FROM users WHERE role <> 'admin' AND created_at >= $1 AND created_at < $2),
			(SELECT COUNT(*) FROM submissions WHERE created_at >= $1 AND created_at < $2),
			(SELECT COUNT(*) FROM submissions WHERE status = 'passed' AND created_at >= $1 AND created_at < $2),
			(SELECT COUNT(DISTINCT (user_id, problem_id)) FROM submissions WHERE status = 'passed' AND created_at >= $1 AND created_at < $2),
			(SELECT COALESCE(ROUND(AVG(runtime_ms))::int, 0) FROM submissions WHERE status = 'passed' AND created_at >= $1 AND created_at < $2),
			(SELECT COALESCE(SUM(p.xp_reward), 0)::int
			   FROM (SELECT user_id, problem_id, MIN(created_at) AS first_pass
			           FROM submissions
			          WHERE status = 'passed'
			          GROUP BY user_id, problem_id) fp
			   JOIN problems p ON p.id = fp.problem_id
			  WHERE fp.first_pass >= $1 AND fp.first_pass < $2)
	`
	t := &out.Totals
	if err := s.pool.QueryRow(ctx, query, start, end).Scan(
		&t.ActiveUsers, &t.NewUsers, &t.Submissions, &t.Passed,
		&t.Solutions, &t.AvgRuntimeMs, &t.XPEarned,
	); err != nil {
		return fmt.Errorf("insights: totals query: %w", err)
	}
	t.Failed = t.Submissions - t.Passed
	if t.Submissions > 0 {
		t.PassRate = round1(float64(t.Passed) / float64(t.Submissions) * 100)
		t.SubmissionsDay = round1(float64(t.Submissions) / float64(t.ActiveUsers))
	}
	return nil
}

func (s *PostgresStore) insightsLifetime(ctx context.Context, out *InsightsSnapshot) error {
	query := `
		SELECT
			(SELECT COUNT(*) FROM users WHERE role <> 'admin'),
			(SELECT COUNT(*) FROM users WHERE role <> 'admin' AND xp > 0),
			(SELECT COUNT(*) FROM problems WHERE visible = true),
			(SELECT COUNT(*) FROM progress WHERE solved = true),
			(SELECT COUNT(DISTINCT user_id) FROM submissions WHERE created_at >= NOW() - INTERVAL '7 days')
	`
	if err := s.pool.QueryRow(ctx, query).Scan(
		&out.Lifetime.Students, &out.Lifetime.EngagedStudents,
		&out.Lifetime.ActiveProblems, &out.Lifetime.TotalSolves,
		&out.Lifetime.ActiveLast7Days,
	); err != nil {
		return fmt.Errorf("insights: lifetime query: %w", err)
	}
	return nil
}

func (s *PostgresStore) insightsDaily(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT to_char((created_at AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD'),
		       COUNT(*)::int,
		       COUNT(*) FILTER (WHERE status = 'passed')::int,
		       COUNT(DISTINCT user_id)::int
		  FROM submissions
		 WHERE created_at >= $1 AND created_at < $2
		 GROUP BY 1
		 ORDER BY 1
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return fmt.Errorf("insights: daily query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var day InsightsDailyCount
		if err := rows.Scan(&day.Day, &day.Submissions, &day.Passed, &day.ActiveUsers); err != nil {
			return fmt.Errorf("insights: scan daily: %w", err)
		}
		out.DailyActivity = append(out.DailyActivity, day)
	}
	return rows.Err()
}

func (s *PostgresStore) insightsPerformers(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	performers, err := s.insightsPerformersFor(ctx, start, end)
	if err != nil {
		return err
	}
	out.TopPerformers = performers
	return nil
}

// insightsPerformersFor is the raw ranking used both for the window's top
// performers and, with the previous window, for leaderboard movement.
func (s *PostgresStore) insightsPerformersFor(ctx context.Context, start, end time.Time) ([]InsightsPerformer, error) {
	// Streak uses the same gaps-and-islands idea as CalculateStreak: consecutive
	// UTC days with a passing submission, a new island starting at every gap.
	// Only the island containing today or yesterday counts as "current".
	query := `
		WITH window_subs AS (
			SELECT user_id, problem_id, status, runtime_ms
			  FROM submissions
			 WHERE created_at >= $1 AND created_at < $2
		),
		agg AS (
			SELECT user_id,
			       COUNT(*)::int AS attempts,
			       COUNT(*) FILTER (WHERE status = 'passed')::int AS passed,
			       COUNT(DISTINCT problem_id) FILTER (WHERE status = 'passed')::int AS solved,
			       COALESCE(ROUND(AVG(runtime_ms) FILTER (WHERE status = 'passed'))::int, 0) AS avg_runtime_ms
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
		       COALESCE(e.xp_earned, 0),
		       u.xp,
		       a.solved,
		       a.attempts,
		       CASE WHEN a.attempts > 0
		            THEN ROUND(100.0 * a.passed / a.attempts, 1)::float8
		            ELSE 0 END,
		       a.avg_runtime_ms,
		       COALESCE(st.streak_days, 0)
		  FROM agg a
		  JOIN users u ON u.id = a.user_id
		  LEFT JOIN earned e ON e.user_id = a.user_id
		  LEFT JOIN streaks st ON st.user_id = a.user_id
		 WHERE u.role <> 'admin'
		 ORDER BY COALESCE(e.xp_earned, 0) DESC, a.solved DESC, u.name ASC
		 LIMIT 10
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return nil, fmt.Errorf("insights: performers query: %w", err)
	}
	defer rows.Close()

	out := make([]InsightsPerformer, 0, 10)
	for rows.Next() {
		var p InsightsPerformer
		if err := rows.Scan(
			&p.UserID, &p.Name, &p.Username, &p.XPEarned, &p.LifetimeXP,
			&p.Solved, &p.Attempts, &p.PassRate, &p.AvgRuntimeMs, &p.StreakDays,
		); err != nil {
			return nil, fmt.Errorf("insights: scan performer: %w", err)
		}
		p.Level = p.LifetimeXP/1000 + 1
		out = append(out, p)
	}
	return out, rows.Err()
}

func (s *PostgresStore) insightsSkills(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT t.tag,
		       COUNT(DISTINCT (s.user_id, s.problem_id)) FILTER (WHERE s.status = 'passed')::int AS solved,
		       COUNT(*)::int AS attempts,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8 AS pass_rate
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		  CROSS JOIN LATERAL unnest(COALESCE(p.tags, ARRAY[]::text[])) AS t(tag)
		 WHERE s.created_at >= $1 AND s.created_at < $2
		   AND t.tag <> ''
		 GROUP BY t.tag
		 ORDER BY solved DESC, attempts DESC
		 LIMIT 12
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return fmt.Errorf("insights: skills query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var sk InsightsSkill
		if err := rows.Scan(&sk.Tag, &sk.Solved, &sk.Attempts, &sk.PassRate); err != nil {
			return fmt.Errorf("insights: scan skill: %w", err)
		}
		out.Skills = append(out.Skills, sk)
	}
	return rows.Err()
}

func (s *PostgresStore) insightsModules(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT p.module,
		       COUNT(DISTINCT s.user_id)::int,
		       COUNT(DISTINCT (s.user_id, s.problem_id)) FILTER (WHERE s.status = 'passed')::int,
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8,
		       COALESCE(ROUND(AVG(s.runtime_ms) FILTER (WHERE s.status = 'passed'))::int, 0)
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		 WHERE s.created_at >= $1 AND s.created_at < $2
		 GROUP BY p.module
		 ORDER BY COUNT(*) DESC
		 LIMIT 12
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return fmt.Errorf("insights: modules query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var m InsightsModule
		if err := rows.Scan(&m.Module, &m.Students, &m.Solved, &m.Attempts, &m.PassRate, &m.AvgRuntimeMs); err != nil {
			return fmt.Errorf("insights: scan module: %w", err)
		}
		out.Modules = append(out.Modules, m)
	}
	return rows.Err()
}

func (s *PostgresStore) insightsDifficulty(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT COALESCE(p.difficulty, 0),
		       COUNT(DISTINCT (s.user_id, s.problem_id)) FILTER (WHERE s.status = 'passed')::int,
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		 WHERE s.created_at >= $1 AND s.created_at < $2
		 GROUP BY COALESCE(p.difficulty, 0)
		 ORDER BY 1
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return fmt.Errorf("insights: difficulty query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var d InsightsDifficulty
		if err := rows.Scan(&d.Difficulty, &d.Solved, &d.Attempts, &d.PassRate); err != nil {
			return fmt.Errorf("insights: scan difficulty: %w", err)
		}
		out.Difficulty = append(out.Difficulty, d)
	}
	return rows.Err()
}

func (s *PostgresStore) insightsProblemHealth(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT p.slug,
		       COALESCE(p.title, p.slug),
		       p.module,
		       COALESCE(p.difficulty, 0),
		       COUNT(*)::int,
		       ROUND(100.0 * COUNT(*) FILTER (WHERE s.status = 'passed') / COUNT(*), 1)::float8
		  FROM submissions s
		  JOIN problems p ON p.id = s.problem_id
		 WHERE s.created_at >= $1 AND s.created_at < $2
		 GROUP BY p.id
		HAVING COUNT(*) >= 3
		   AND COUNT(*) FILTER (WHERE s.status = 'passed')::numeric / COUNT(*) < 0.6
		 ORDER BY COUNT(*) FILTER (WHERE s.status <> 'passed') DESC, COUNT(*) DESC
		 LIMIT 8
	`
	rows, err := s.pool.Query(ctx, query, start, end)
	if err != nil {
		return fmt.Errorf("insights: problem health query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p InsightsProblemHealth
		if err := rows.Scan(&p.Slug, &p.Title, &p.Module, &p.Difficulty, &p.Attempts, &p.PassRate); err != nil {
			return fmt.Errorf("insights: scan problem health: %w", err)
		}
		out.StrugglingProblems = append(out.StrugglingProblems, p)
	}
	return rows.Err()
}

func (s *PostgresStore) insightsCommunity(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT
			(SELECT COUNT(*) FROM user_problems WHERE created_at >= $1 AND created_at < $2),
			(SELECT COUNT(*) FROM user_problems WHERE status = 'pending'),
			(SELECT COUNT(*) FROM user_problems WHERE reviewed_at >= $1 AND reviewed_at < $2),
			(SELECT COUNT(*) FROM feedback WHERE created_at >= $1 AND created_at < $2),
			(SELECT COUNT(*) FROM feedback WHERE status = 'new'),
			(SELECT COUNT(*) FROM submission_likes WHERE created_at >= $1 AND created_at < $2)
	`
	c := &out.Community
	if err := s.pool.QueryRow(ctx, query, start, end).Scan(
		&c.ContributionsSubmitted, &c.ContributionsPending, &c.ContributionsReviewed,
		&c.FeedbackNew, &c.FeedbackOpen, &c.Likes,
	); err != nil {
		return fmt.Errorf("insights: community query: %w", err)
	}
	return nil
}

func (s *PostgresStore) insightsCurriculum(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT
			(SELECT COUNT(*) FROM lesson_progress WHERE completed = true AND completed_at >= $1 AND completed_at < $2),
			(SELECT COUNT(DISTINCT user_id) FROM lesson_progress WHERE completed = true AND completed_at >= $1 AND completed_at < $2),
			(SELECT COALESCE(SUM(xp_awarded), 0)::int FROM lesson_progress WHERE completed = true AND completed_at >= $1 AND completed_at < $2)
	`
	if err := s.pool.QueryRow(ctx, query, start, end).Scan(
		&out.Curriculum.LessonsCompleted, &out.Curriculum.LessonLearners, &out.Curriculum.LessonXP,
	); err != nil {
		return fmt.Errorf("insights: curriculum query: %w", err)
	}
	return nil
}

func (s *PostgresStore) insightsAI(ctx context.Context, out *InsightsSnapshot, start, end time.Time) error {
	query := `
		SELECT COUNT(*)::int,
		       COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE success) / NULLIF(COUNT(*), 0), 1)::float8, 0),
		       COALESCE(ROUND(AVG(response_time_ms) FILTER (WHERE success))::int, 0),
		       COALESCE(SUM(tokens_in), 0)::int,
		       COALESCE(SUM(tokens_out), 0)::int
		  FROM ai_usage_logs
		 WHERE created_at >= $1 AND created_at < $2
	`
	if err := s.pool.QueryRow(ctx, query, start, end).Scan(
		&out.AI.Calls, &out.AI.SuccessRate, &out.AI.AvgMs, &out.AI.TokensIn, &out.AI.TokensOut,
	); err != nil {
		return fmt.Errorf("insights: ai usage query: %w", err)
	}

	rows, err := s.pool.Query(ctx, `
		SELECT action, COUNT(*)::int
		  FROM ai_usage_logs
		 WHERE created_at >= $1 AND created_at < $2
		 GROUP BY action
		 ORDER BY COUNT(*) DESC
		 LIMIT 6
	`, start, end)
	if err != nil {
		return fmt.Errorf("insights: ai action query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var a InsightsAIActivity
		if err := rows.Scan(&a.Action, &a.Calls); err != nil {
			return fmt.Errorf("insights: scan ai action: %w", err)
		}
		out.AI.ByAction = append(out.AI.ByAction, a)
	}
	return rows.Err()
}

func round1(v float64) float64 {
	return float64(int(v*10+0.5)) / 10
}
