-- 005_community_contributions.sql

-- 1. Update users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 2. Update problems table
ALTER TABLE problems
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 3. Create user_problems table
CREATE TABLE IF NOT EXISTS user_problems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    statement       TEXT NOT NULL,
    func_name       TEXT NOT NULL,
    return_type     TEXT NOT NULL,
    param_types     TEXT[] NOT NULL,
    hints           TEXT[] NOT NULL,
    difficulty      INT NOT NULL,
    xp_reward       INT NOT NULL,
    tags            TEXT[] NOT NULL,
    test_cases      JSONB[] NOT NULL, -- Array of {input, expected, is_hidden, ordinal}
    status          TEXT DEFAULT 'pending', -- pending | approved | rejected
    admin_notes     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_problems_status ON user_problems(status);
CREATE INDEX IF NOT EXISTS idx_user_problems_user ON user_problems(user_id);
