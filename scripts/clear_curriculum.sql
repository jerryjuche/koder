BEGIN;

DELETE FROM lesson_progress;
DELETE FROM course_progress;
DELETE FROM lesson_dependencies;
DELETE FROM lesson_sections;
DELETE FROM projects;
DELETE FROM lessons;
DELETE FROM modules;
DELETE FROM courses;

COMMIT;
