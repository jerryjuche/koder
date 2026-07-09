-- ============================================================================
-- Koder :: Python Variables & Math Operators Seed Migration
-- 1 problem, beginner Python concepts (module: python-variables-math)
--
-- Covers the seven arithmetic operators (+, -, *, /, //, %, **) and variable
-- assignment. 10 test cases — one per operator plus edge cases.
-- ============================================================================

BEGIN;

-- ---- Math Operations Calculator (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-vars-math-calc',
    'python-variables-math',
    'function',
    'python',
    'Math Operations Calculator',
    'Variables are the fundamental building blocks of every program. Think of a variable as a named container that holds a value — once you assign a value to a variable, you can use that variable anywhere you would use the value itself.

Creating and using variables in Python is straightforward:

    score = 0
    score = score + 10
    doubled = score * 2

The equals sign (=) is the assignment operator. It takes the value on the right and stores it in the variable name on the left. After these lines run, the variable score holds 10 and doubled holds 20.

Python provides seven arithmetic operators for mathematical calculations:

    +    Addition          Adds two numbers together
    -    Subtraction       Subtracts the second number from the first
    *    Multiplication    Multiplies two numbers
    /    True Division     Always returns a float (decimal) result
    //   Floor Division    Divides and rounds down to the nearest integer
    %    Modulus           Returns the remainder after division
    **   Exponentiation    Raises the first number to the power of the second

When combining multiple operators, Python follows the standard order of operations: Parentheses, Exponents, Multiplication and Division (left to right), Addition and Subtraction (left to right). You can use parentheses to make the evaluation order explicit:

    result = (a + b) * c - d / e

In this problem, you will apply these concepts to evaluate arithmetic expressions. Use variables to store intermediate results and the appropriate operator to produce the correct value.',
    '- The integers a and b are between -10^6 and 10^6
- operator is one of: "+", "-", "*", "/", "//", "%", "**"
- Division by zero will not occur',
    'Learn to use Python''s seven arithmetic operators and variable assignment to evaluate mathematical expressions correctly in code.',
    'calculate',
    'float',
    '{"int","int","str"}',
    '{"Use an if-elif chain to check the value of the operator parameter and perform the corresponding arithmetic operation.","Store the result in a variable before returning it — this makes your code easier to read and debug.","True division (/) always returns a float in Python 3, even when both operands are whole numbers."}',
    1,
    70,
    '{"python","beginner","variables","arithmetic"}',
    true,
    'seed-py-vars-math-calc',
    '## Math Operations Calculator

Variables are the fundamental building blocks of every program. Think of a variable as a named container that holds a value — once you assign a value to a variable, you can use that variable anywhere you would use the value itself.

Creating and using variables in Python is straightforward:

    score = 0
    score = score + 10
    doubled = score * 2

The equals sign (=) is the assignment operator. It takes the value on the right and stores it in the variable name on the left. After these lines run, the variable score holds 10 and doubled holds 20.

Python provides seven arithmetic operators for mathematical calculations:

    +    Addition          Adds two numbers together
    -    Subtraction       Subtracts the second number from the first
    *    Multiplication    Multiplies two numbers
    /    True Division     Always returns a float (decimal) result
    //   Floor Division    Divides and rounds down to the nearest integer
    %    Modulus           Returns the remainder after division
    **   Exponentiation    Raises the first number to the power of the second

### Expected function

```python
def calculate(a: int, b: int, operator: str) -> float:
    # Your code here
    pass
```

### Examples

- `calculate(10, 5, "+")` returns `15.0`
- `calculate(17, 5, "//")` returns `3.0`
- `calculate(2, 10, "**")` returns `1024.0`

### Constraints

- The integers a and b are between -10^6 and 10^6
- operator is one of: "+", "-", "*", "/", "//", "%", "**"
- Division by zero will not occur

### Learning objective

Gain hands-on experience with Python''s seven arithmetic operators and practice using variables to store and return computed values.

### Reference solution

```python
def calculate(a, b, operator):
    if operator == "+":
        result = a + b
    elif operator == "-":
        result = a - b
    elif operator == "*":
        result = a * b
    elif operator == "/":
        result = a / b
    elif operator == "//":
        result = a // b
    elif operator == "%":
        result = a % b
    elif operator == "**":
        result = a ** b
    return float(result)
```

The solution uses an if-elif chain to match the operator string to the correct arithmetic operation. Each branch assigns the result to a variable named result, and that single variable is returned at the end after being converted to a float. This accumulator pattern keeps the logic clean — one return point instead of returning from inside each branch.',
    '{"python": {"func_name": "calculate", "return_type": "float", "param_types": ["int", "int", "str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Visible test cases (7)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[10, 5, "+"]'::jsonb, '15.0', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[10, 5, "-"]'::jsonb, '5.0', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[10, 5, "*"]'::jsonb, '50.0', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[10, 5, "/"]'::jsonb, '2.0', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[17, 5, "//"]'::jsonb, '3.0', false, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[17, 5, "%"]'::jsonb, '2.0', false, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[2, 10, "**"]'::jsonb, '1024.0', false, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- Hidden test cases (3)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[-5, 3, "+"]'::jsonb, '-2.0', true, 8)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[7, 2, "**"]'::jsonb, '49.0', true, 9)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-vars-math-calc'), '[20, 4, "-"]'::jsonb, '16.0', true, 10)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;
