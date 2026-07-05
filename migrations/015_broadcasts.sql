-- Broadcast messages for admin-to-user notifications
CREATE TABLE broadcasts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type         TEXT NOT NULL DEFAULT 'info',        -- 'info' | 'warning' | 'update' | 'new_feature' | 'maintenance' | 'announcement'
    priority     TEXT NOT NULL DEFAULT 'medium',      -- 'low' | 'medium' | 'high' | 'critical'
    title        TEXT NOT NULL,
    message      TEXT NOT NULL,
    action_label TEXT,                                -- Optional CTA button text
    action_url   TEXT,                                -- Optional CTA link
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by   UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Per-user broadcast dismissal tracking
CREATE TABLE user_broadcast_status (
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    broadcast_id UUID REFERENCES broadcasts(id) ON DELETE CASCADE,
    dismissed    BOOLEAN NOT NULL DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, broadcast_id)
);

CREATE INDEX idx_broadcasts_active ON broadcasts(active, created_at DESC);
