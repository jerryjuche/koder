-- Module metadata: editable display names and pinning for problem modules
CREATE TABLE IF NOT EXISTS module_meta (
    module_name  TEXT        PRIMARY KEY,
    display_name TEXT        NOT NULL,
    is_pinned    BOOLEAN     NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed all known module slugs with their default display names
INSERT INTO module_meta (module_name, display_name) VALUES
    ('arrays-strings', 'Arrays & Strings'),
    ('strings-runes', 'Strings & Runes'),
    ('math-recursion', 'Math & Recursion'),
    ('data-structures', 'Data Structures'),
    ('sorting-searching', 'Sorting & Searching'),
    ('hashmaps-sets', 'Hash Maps & Sets'),
    ('concurrency', 'Concurrency'),
    ('dynamic-programming', 'Dynamic Programming'),
    ('bit-manipulation', 'Bit Manipulation'),
    ('trees-graphs', 'Trees & Graphs'),
    ('error-handling', 'Error Handling'),
    ('testing', 'Testing'),
    ('file-io', 'File I/O'),
    ('networking', 'Networking'),
    ('interfaces-generics', 'Interfaces & Generics'),
    ('pointers', 'Pointers'),
    ('oop-composition', 'OOP & Composition'),
    ('design-patterns', 'Design Patterns'),
    ('encoding-serialization', 'Encoding & Serialization'),
    ('linked-lists', 'Linked Lists'),
    ('go-fundamentals', 'Go Fundamentals'),
    ('python-fundamentals', 'Python Fundamentals'),
    ('python-challenges', 'Python Challenges'),
    ('python-intermediate', 'Python Intermediate'),
    ('python-variables-math', 'Python Variables & Math'),
    ('python-arrays-strings', 'Python Arrays & Strings')
ON CONFLICT (module_name) DO NOTHING;
