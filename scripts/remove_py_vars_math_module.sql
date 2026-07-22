-- Remove Python Variables & Math module and its single problem (py-vars-math-calc)
-- Safe delete order: submissions -> progress -> test_cases -> problems
-- Also cleans up module_meta and module_locks

BEGIN;

-- Delete any submissions for the problem(s) in this module
DELETE FROM submissions
WHERE problem_id IN (
    SELECT id FROM problems WHERE module = 'python-variables-math'
);

-- Delete progress entries
DELETE FROM progress
WHERE problem_id IN (
    SELECT id FROM problems WHERE module = 'python-variables-math'
);

-- Delete test cases
DELETE FROM test_cases
WHERE problem_id IN (
    SELECT id FROM problems WHERE module = 'python-variables-math'
);

-- Delete the problem(s)
DELETE FROM problems
WHERE module = 'python-variables-math';

-- Delete module lock entry if any
DELETE FROM module_locks
WHERE module_name = 'python-variables-math';

-- Delete module meta entry
DELETE FROM module_meta
WHERE module_name = 'python-variables-math';

COMMIT;

-- Find any problem with "atoi" in title or slug (if it exists in your live DB)
SELECT id, slug, title, module FROM problems
WHERE slug ILIKE '%atoi%' OR title ILIKE '%atoi%';
