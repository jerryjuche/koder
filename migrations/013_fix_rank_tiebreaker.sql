-- Fix profile rank to match all-time leaderboard ordering (xp DESC, solved_count DESC)
CREATE OR REPLACE FUNCTION get_full_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH
    user_data AS (
      SELECT id, student_id, name, bio, role, color_index, xp, username, google_avatar_url, created_at
      FROM users
      WHERE id = p_user_id
    ),
    user_xp AS (
      SELECT xp FROM users WHERE id = p_user_id
    ),
    user_solved AS (
      SELECT COUNT(*)::int AS solved_count FROM progress WHERE user_id = p_user_id AND solved
    ),
    user_rank AS (
      SELECT
        CASE WHEN ux.xp > 0 THEN (
          SELECT COUNT(*) + 1 FROM users u
          WHERE u.role != 'admin' AND u.xp > 0
            AND (
              u.xp > ux.xp
              OR (u.xp = ux.xp AND (
                SELECT COUNT(*) FROM progress WHERE user_id = u.id AND solved
              ) > us.solved_count)
              OR (u.xp = ux.xp AND (
                SELECT COUNT(*) FROM progress WHERE user_id = u.id AND solved
              ) = us.solved_count AND u.id < p_user_id)
            )
        ) ELSE 0 END AS rank
      FROM user_xp ux
      CROSS JOIN user_solved us
      LIMIT 1
    ),
    base_stats AS (
      SELECT
        COUNT(DISTINCT p.problem_id) FILTER (WHERE p.solved) AS solved_count,
        COUNT(DISTINCT p.problem_id) AS attempted_count,
        COALESCE(AVG(p.stars) FILTER (WHERE p.solved), 0.0)::float AS avg_stars,
        COALESCE(MIN(p.best_runtime) FILTER (WHERE p.solved AND p.best_runtime > 0), 0) AS best_runtime
      FROM progress p
      LEFT JOIN submissions s ON p.user_id = s.user_id AND p.problem_id = s.problem_id
      WHERE p.user_id = p_user_id
    ),
    diff_progress AS (
      SELECT
        pr.difficulty,
        COUNT(DISTINCT CASE WHEN pg.solved THEN pg.problem_id END) AS solved,
        COUNT(DISTINCT pr.id) AS total
      FROM problems pr
      LEFT JOIN progress pg ON pr.id = pg.problem_id AND pg.user_id = p_user_id
      WHERE pr.visible = true
      GROUP BY pr.difficulty
    ),
    streak_calc AS (
      WITH daily_submissions AS (
        SELECT DISTINCT DATE(created_at) AS sub_date
        FROM submissions
        WHERE user_id = p_user_id AND status = 'passed'
      ),
      streak_groups AS (
        SELECT sub_date,
               sub_date - (DENSE_RANK() OVER (ORDER BY sub_date ASC))::integer AS grp
        FROM daily_submissions
      )
      SELECT COUNT(*) AS streak_days
      FROM streak_groups
      WHERE grp = (
        SELECT grp FROM streak_groups
        WHERE sub_date >= CURRENT_DATE - INTERVAL '1 day'
        ORDER BY sub_date DESC LIMIT 1
      )
    ),
    module_prof AS (
      SELECT
        pr.module,
        COUNT(DISTINCT CASE WHEN pg.solved THEN pg.problem_id END) AS solved,
        COUNT(DISTINCT pr.id) AS total
      FROM problems pr
      LEFT JOIN progress pg ON pr.id = pg.problem_id AND pg.user_id = p_user_id
      WHERE pr.visible = true
      GROUP BY pr.module
    ),
    recent_subs AS (
      SELECT
        id, user_id, problem_id, language, status, passed_count, total_count, runtime_ms, created_at
      FROM submissions
      WHERE user_id = p_user_id
      ORDER BY created_at DESC
      LIMIT 10
    )
  SELECT jsonb_build_object(
    'user', (SELECT row_to_json(u)::jsonb FROM user_data u),
    'rank', (SELECT rank FROM user_rank),
    'stats', jsonb_build_object(
      'solved_count', (SELECT solved_count FROM base_stats),
      'attempted_count', (SELECT attempted_count FROM base_stats),
      'average_stars', (SELECT avg_stars FROM base_stats),
      'best_runtime_ms', (SELECT best_runtime FROM base_stats),
      'current_streak_days', (SELECT streak_days FROM streak_calc)
    ),
    'progress_by_difficulty', (
      SELECT jsonb_object_agg(
        CASE difficulty
          WHEN 1 THEN 'easy'
          WHEN 2 THEN 'medium'
          WHEN 3 THEN 'hard'
          ELSE 'unknown'
        END,
        jsonb_build_object('solved', solved, 'total', total)
      )
      FROM diff_progress
    ),
    'module_proficiency', (
      SELECT jsonb_object_agg(module, jsonb_build_object('solved', solved, 'total', total))
      FROM module_prof
    ),
    'recent_submissions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'problem_id', problem_id,
          'language', language,
          'status', status,
          'passed_count', passed_count,
          'total_count', total_count,
          'runtime_ms', runtime_ms,
          'created_at', created_at
        )
        ORDER BY created_at DESC
      )
      FROM recent_subs
    )
  ) INTO result;

  RETURN result;
END;
$$;


