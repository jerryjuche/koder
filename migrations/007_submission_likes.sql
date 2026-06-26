-- 007_submission_likes.sql

CREATE TABLE submission_likes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, user_id)  -- Prevent duplicate likes
);

CREATE INDEX idx_submission_likes_submission ON submission_likes(submission_id);
CREATE INDEX idx_submission_likes_user ON submission_likes(user_id);
