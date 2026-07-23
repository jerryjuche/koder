-- Migration 038: Curriculum CMS schema
-- Creates the structured course/module/lesson system with typed sections.
-- Lessons reference existing problems via problem_references TEXT[].
BEGIN;

-- ── ENUM: lesson_section_type ──
DO $$ BEGIN
    CREATE TYPE lesson_section_type AS ENUM (
        'overview',
        'explanation',
        'examples',
        'best_practices',
        'common_mistakes',
        'summary',
        'quiz',
        'exercises',
        'mini_project',
        'assessment',
        'ai_review'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ── courses ──
CREATE TABLE IF NOT EXISTS courses (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             TEXT NOT NULL UNIQUE,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    image_url        TEXT,
    icon             TEXT,
    difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_hours  INTEGER NOT NULL DEFAULT 0,
    order_number     INTEGER NOT NULL DEFAULT 0,
    visible          BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── modules ──
CREATE TABLE IF NOT EXISTS modules (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    slug         TEXT NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    image_url    TEXT,
    order_number INTEGER NOT NULL DEFAULT 0,
    visible      BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, slug)
);

-- ── lessons ──
CREATE TABLE IF NOT EXISTS lessons (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id         UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    slug              TEXT NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT NOT NULL DEFAULT '',
    raw_readme        TEXT NOT NULL DEFAULT '',
    difficulty        INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    estimated_minutes INTEGER NOT NULL DEFAULT 10,
    xp_reward         INTEGER NOT NULL DEFAULT 50,
    order_number      INTEGER NOT NULL DEFAULT 0,
    visible           BOOLEAN NOT NULL DEFAULT false,
    problem_references TEXT[] NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (module_id, slug)
);

-- ── lesson_dependencies (prerequisite DAG) ──
CREATE TABLE IF NOT EXISTS lesson_dependencies (
    lesson_id            UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    depends_on_lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, depends_on_lesson_id),
    CHECK (lesson_id <> depends_on_lesson_id)
);

-- ── lesson_sections ──
CREATE TABLE IF NOT EXISTS lesson_sections (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    section_type lesson_section_type NOT NULL,
    title        TEXT NOT NULL DEFAULT '',
    content      TEXT NOT NULL DEFAULT '',
    metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
    order_number INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── projects ──
CREATE TABLE IF NOT EXISTS projects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    slug         TEXT NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    requirements TEXT NOT NULL DEFAULT '',
    starter_code TEXT NOT NULL DEFAULT '',
    difficulty   INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    xp_reward    INTEGER NOT NULL DEFAULT 100,
    hints        TEXT[] NOT NULL DEFAULT '{}',
    order_number INTEGER NOT NULL DEFAULT 0,
    visible      BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (lesson_id, slug)
);

-- ── course_progress ──
CREATE TABLE IF NOT EXISTS course_progress (
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_pct REAL NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    PRIMARY KEY (user_id, course_id)
);

-- ── lesson_progress ──
CREATE TABLE IF NOT EXISTS lesson_progress (
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed    BOOLEAN NOT NULL DEFAULT false,
    xp_awarded   INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, lesson_id)
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, order_number);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons(module_id, order_number);
CREATE INDEX IF NOT EXISTS idx_lesson_sections_lesson_order ON lesson_sections(lesson_id, order_number);
CREATE INDEX IF NOT EXISTS idx_lesson_dependencies_lesson ON lesson_dependencies(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_dependencies_depends ON lesson_dependencies(depends_on_lesson_id);
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses(order_number);
CREATE INDEX IF NOT EXISTS idx_projects_lesson_order ON projects(lesson_id, order_number);
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_lookup ON course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lookup ON lesson_progress(user_id, lesson_id);

COMMIT;
