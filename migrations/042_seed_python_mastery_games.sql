-- ============================================================================
-- Koder :: Python Mastery: Build Your Own Games (Fun Elective)
-- A playful, project-driven elective. Sits alongside "Practical Python" —
-- same prerequisite (Foundations completed), lighter tone, same rigor.
-- ============================================================================
-- Formatting note, since this was flagged on the previous file:
-- Every multi-paragraph content field below uses a genuine BLANK LINE
-- (two consecutive newlines) between paragraphs, between prose and code
-- blocks, and between headers and their following text — not a single
-- trailing \n. Because these fields are dollar-quoted ($py$...$py$), the
-- literal newlines typed into this file ARE the newlines stored in the
-- database, byte for byte. If a rendering pipeline ever collapses blank
-- lines, that's a markdown-renderer setting downstream, not a data issue —
-- the stored content itself is spaced correctly at the source.
-- ============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. COURSE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
VALUES (
  'python-mastery-games',
  'Python Mastery: Build Your Own Games',
  E'Every concept in this course is one you already know — variables, loops, functions, dicts, randomness, and the input()/print() loop from Foundations. What changes here is the payoff: instead of "print the sum of two numbers," you''re building a number-guessing game with a scoring system, a Rock-Paper-Scissors opponent with actual personality, a working Hangman with a real word bank, and a text adventure with rooms, inventory, and win conditions.\n\nThis course exists for one reason: game logic is an unusually good forcing function for real programming skill. A guessing game needs a loop that knows when to stop. Rock-Paper-Scissors needs a clean way to compare three possible outcomes without a wall of nested if-statements. A text adventure needs a data structure that represents "the world" — which turns out to be nothing more exotic than a dictionary of dictionaries, the exact same tool from the Dicts & Sets lesson, just pointed at a more interesting problem.\n\nExpect this course to feel noticeably faster-paced and more playful than Foundations. It is still professionally built — every lesson follows the same structure, every quiz still targets a real misconception, and the capstone is a genuinely complete, replayable game — but the goal here is momentum and confidence, not new theory. If Foundations taught you the alphabet, this is the first time you get to write a short story with it.',
  2, 10, 12, false
)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. MODULES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'py-games-classics', 'Classic Games, Rebuilt Properly',
       E'Three games nearly every programmer builds at some point, done right: a real game loop that knows when to stop, clean comparison logic instead of a wall of if-statements, and a genuine win/lose condition backed by actual data instead of a lucky guess at when to print "you win."\n\nEach lesson in this module takes a game most people have seen before and rebuilds it with the specific tools from Foundations that make it actually good code, not just working code.',
       1, false FROM courses c WHERE c.slug = 'python-mastery-games'
UNION ALL
SELECT c.id, 'py-games-worldbuilding', 'Words, Worlds, and One Big Finale',
       E'A shift from "games with one clear winning move" to games with actual STATE — a world that remembers where you are, an inventory that remembers what you''re carrying, a puzzle generator that needs real string manipulation to feel fair rather than nonsensical.\n\nThis module closes with a capstone dungeon crawler that pulls together everything from both modules into one complete, replayable game.',
       2, false FROM courses c WHERE c.slug = 'python-mastery-games'
ON CONFLICT (course_id, slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. LESSONS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-guessing-game', 'Number Guessing Game & Real Game Loops',
       E'Building a genuinely well-behaved game loop — one that limits attempts, gives useful feedback ("too high" / "too low"), and handles bad input without crashing — instead of the fragile while-True loop most beginners write on their first try.',
       1, 22, 45, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-rps-game', 'Rock-Paper-Scissors: Clean Comparison Logic',
       E'The nine-way if-statement almost everyone writes for Rock-Paper-Scissors the first time, and the much smaller, much more honest version that replaces it — plus a running score, a best-of-N match structure, and a computer opponent with a hint of personality.',
       1, 20, 45, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-hangman-game', 'Hangman: Strings, Sets, and Win Conditions',
       E'A full Hangman implementation with a real word bank, a masked display that updates correctly as letters are guessed, and a win condition built on a set comparison instead of a fragile manual character-by-character check.',
       2, 26, 55, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-text-adventure', 'Building a Text Adventure',
       E'Modeling an entire game world as a dictionary of dictionaries — rooms, exits, and items — and writing a command loop that lets a player actually move through it, pick things up, and reach a genuine ending.',
       2, 30, 60, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-word-puzzle', 'Word Scramble & Anagram Puzzles',
       E'Generating fair, solvable word-scramble puzzles, checking anagram guesses correctly (a surprisingly common source of subtle bugs), and building a scoring system based on how many hints the player needed.',
       2, 24, 50, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-dungeon-capstone', 'Capstone: Dungeon Crawler',
       E'A complete, replayable dungeon crawler combining a real game world, an inventory system, random encounters, a scoring/health system, and a genuine win-or-lose ending — every tool from this entire course, used together in one program.',
       3, 45, 150, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. LESSON DEPENDENCIES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-dungeon-capstone'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. LESSON SECTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════ LESSON 1: py-guessing-game ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Every Game Needs a Loop That Knows When to Stop',
$py$Picture the laziest possible number-guessing game: the computer picks a number, the player guesses forever, and the loop only ends when they happen to get it right. That "works," technically. It's also a bad game — no limit on attempts, no useful feedback beyond right or wrong, and one bad keystroke crashes the whole thing.

This lesson is about the difference between a loop that merely runs and a loop that behaves like it was designed on purpose: bounded attempts, meaningful hints ("too high," "too low"), and graceful handling of the input a real player will absolutely type eventually — letters instead of numbers, blank lines, numbers way outside the valid range.

Everything here is loops, conditionals, and input validation from Foundations. Nothing new is being introduced. What's new is treating those tools as a toolkit for something a person would actually enjoy playing.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'From "Guess Forever" to a Real Game Loop',
$py$```python
import random

def play_guessing_game(low=1, high=100, max_attempts=7):
    secret = random.randint(low, high)
    attempts_used = 0

    print(f"I'm thinking of a number between {low} and {high}.")
    print(f"You have {max_attempts} attempts. Good luck!")

    while attempts_used < max_attempts:
        raw_guess = input(f"\nAttempt {attempts_used + 1}/{max_attempts} — your guess: ").strip()

        if not raw_guess.isdigit():
            print("That doesn't look like a whole number — try again.")
            continue

        guess = int(raw_guess)
        attempts_used += 1

        if guess == secret:
            print(f"\nYou got it in {attempts_used} attempts! The number was {secret}.")
            return True

        elif guess < secret:
            print("Too low.")
        else:
            print("Too high.")

    print(f"\nOut of attempts! The number was {secret}.")
    return False
```

Notice what changed from the "guess forever" version. The loop condition itself (`attempts_used < max_attempts`) is the bound — there's no reliance on the player eventually guessing correctly, and no risk of it running forever. Bad input (`raw_guess.isdigit()` failing) uses `continue` to re-prompt WITHOUT counting against the attempt limit — a genuinely important design choice: a typo shouldn't cost the player a real guess.

The function also returns `True`/`False` rather than just printing something and ending. That return value is what lets the NEXT lesson's scoring system, or a "play again?" wrapper, actually know how the round went — a small detail that turns a script into something reusable.$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Adding Difficulty Levels and a Play-Again Loop',
$py$```python
DIFFICULTIES = {
    "easy":   {"high": 50,  "max_attempts": 10},
    "medium": {"high": 100, "max_attempts": 7},
    "hard":   {"high": 200, "max_attempts": 5},
}

def choose_difficulty():
    while True:
        choice = input("Choose difficulty (easy / medium / hard): ").strip().lower()
        if choice in DIFFICULTIES:
            return DIFFICULTIES[choice]
        print(f"'{choice}' isn't a valid difficulty — try easy, medium, or hard.")

def main():
    wins = 0
    rounds_played = 0

    while True:
        settings = choose_difficulty()
        won = play_guessing_game(high=settings["high"], max_attempts=settings["max_attempts"])

        rounds_played += 1
        if won:
            wins += 1

        print(f"\nScore so far: {wins}/{rounds_played} rounds won.")

        again = input("Play again? (y/n): ").strip().lower()
        if again != "y":
            break

    print(f"\nFinal score: {wins}/{rounds_played}. Thanks for playing!")

if __name__ == "__main__":
    main()
```

This is the exact `DIFFICULTIES` dict pattern from the Dicts & Sets lesson, now doing real work — one dictionary drives three completely different game configurations, and adding a fourth difficulty later means adding one new entry, not rewriting any logic. The outer `main()` loop is a second, SEPARATE game loop, one level up from the guessing loop itself: it manages ROUNDS, while `play_guessing_game()` manages ATTEMPTS within a single round. Recognizing that these are two different loops with two different jobs is exactly the kind of structural thinking this course is building.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Where Beginner Game Loops Break',
$py$**1. Counting a bad guess against the attempt limit**

If invalid input (a typo, a blank line) silently consumes one of the player's limited attempts, the game feels unfair and buggy even though nothing "crashed." Always validate BEFORE incrementing the attempt counter, and `continue` past invalid input without penalty — exactly the ordering used above.

**2. Comparing the raw string input directly to the secret number**

```python
guess = input("Guess: ")
if guess == secret:   # secret is an int; guess is a STRING — this NEVER matches,
    ...                 # even when the player typed the exact right number
```

This is the `input()` lesson's core lesson, and it's the single most common bug in every beginner guessing-game implementation. Convert with `int()` before comparing.

**3. Forgetting a maximum attempt count entirely**

A loop that only ends on a correct guess isn't really a "game" — there's no tension, no way to lose, and a player who wants to see what happens on failure has no path to find out. A bounded loop with a real "you're out of attempts" ending is what makes it a game rather than a formality.

**4. Not handling `random.randint`'s inclusive range correctly**

`random.randint(1, 100)` can return exactly `100` — it's inclusive on BOTH ends, unlike `range()`, which stops before its second argument. Telling the player "between 1 and 100" while secretly excluding 100 is a subtle correctness bug, not just a UX nitpick.$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game';

UPDATE lesson_sections SET metadata = '{"question": "attempts = 0\nmax_attempts = 3\n\nwhile attempts < max_attempts:\n    guess = input(\"Guess: \").strip()\n    attempts += 1\n    if not guess.isdigit():\n        print(\"Not a number, try again\")\n        continue\n    print(f\"Attempt {attempts} recorded\")\n\nIf the player types a non-numeric guess on every single attempt, what happens?", "options": ["The loop runs exactly 3 times, then ends, because attempts is incremented before the isdigit() check", "The loop runs forever, because continue skips back to the top without the isdigit() check ever passing", "The loop runs exactly 3 times, printing ''Attempt X recorded'' each time regardless of input", "A ValueError is raised on the third invalid guess"], "correct_index": 0, "explanation": "This is the exact mistake called out in this lesson''s pitfalls, deliberately reproduced: attempts += 1 happens BEFORE the isdigit() check, so every guess -- valid or not -- consumes one of the three attempts. A player typing garbage three times in a row exhausts max_attempts and the loop ends normally after 3 iterations, without ever printing \"Attempt X recorded\" even once. The fix is reordering the code so the increment only happens after input has been confirmed valid -- exactly the ordering used in this lesson''s main play_guessing_game example."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Add Hints and a Streak Bonus',
$py$Extend the guessing game from this lesson with two features:

1. **Hint system** — after 3 wrong guesses in a single round, print an extra hint: whether the secret number is even or odd. After 5 wrong guesses, additionally print whether it's a multiple of 5.

2. **Streak bonus** — track how many rounds in a row the player has won across `main()`'s outer loop. If they win 3 rounds in a row, print a congratulatory streak message and, for one round only, increase `max_attempts` by 2 as a reward.

**Trick to watch for:** make sure a LOSS resets the streak counter back to zero — a common bug is forgetting to reset it anywhere, which means one early win keeps counting toward the streak forever even after several later losses.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- A bounded loop (checking `attempts < max_attempts`) is what turns "guess forever" into an actual game with real stakes and a real ending
- Validate input BEFORE incrementing any counter that tracks limited attempts — a typo should never cost the player a real guess
- `random.randint(low, high)` is inclusive on both ends, unlike `range()`, which excludes its stop value
- A function that returns `True`/`False` (or similar) instead of just printing output can be reused inside a larger structure — here, an outer round-tracking loop in `main()`
- A dictionary of settings (`DIFFICULTIES`) is a clean way to support several game configurations without duplicating logic for each one
- Two nested loops can have two entirely different jobs — attempts within a round, and rounds within a session — and recognizing that separation makes the code's structure much easier to reason about$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-guessing-game';

-- ═══════════════ LESSON 2: py-rps-game ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'The Nine-Way If-Statement Everyone Writes Once',
$py$Ask someone to code Rock-Paper-Scissors for the first time, and you'll almost always get the same shape of solution: nine separate `if` branches, one for every combination of player choice and computer choice. It works. It's also nine lines of near-identical code that will silently break the moment someone adds a fourth option like "Lizard" or "Spock," because now there are sixteen combinations to hand-check instead of nine.

This lesson rebuilds Rock-Paper-Scissors around a genuinely smaller idea: what beats what is DATA, not a pile of conditionals. Once the rules live in a dictionary, comparing two choices becomes one line, adding new rules becomes one new dictionary entry, and the whole game gets shorter AND more correct at the same time.

Along the way, this lesson adds a running score and a best-of-N match structure — the same round-tracking pattern from the previous lesson, applied again, because that repetition is exactly how a pattern actually sticks.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Rules as Data, Not as a Wall of If-Statements',
$py$```python
import random

# What beats what. Read as: "the KEY beats the VALUE."
BEATS = {
    "rock": "scissors",
    "paper": "rock",
    "scissors": "paper",
}

def get_winner(player, computer):
    """Return 'player', 'computer', or 'tie'."""
    if player == computer:
        return "tie"
    if BEATS[player] == computer:
        return "player"
    return "computer"

print(get_winner("rock", "scissors"))    # "player" — rock beats scissors
print(get_winner("scissors", "rock"))    # "computer" — rock beats scissors, so
                                            # scissors LOSES to rock here
print(get_winner("paper", "paper"))       # "tie"
```

Compare this to the nine-branch version most people write first — nine `if player == "rock" and computer == "scissors":`-style lines, each one a distinct, hand-typed fact. Here, there are exactly THREE facts in `BEATS`, and `get_winner` is three lines that work for any pair of valid choices, because the rule "rock beats scissors" only needs to be stated once, not duplicated for every possible ordering.

**This is also why adding a fourth option is now genuinely easy** — extending to Rock-Paper-Scissors-Lizard-Spock only means adding more entries to a dictionary-of-lists structure (since some choices now beat TWO things instead of one), not restructuring the comparison logic itself:

```python
BEATS_EXTENDED = {
    "rock": ["scissors", "lizard"],
    "paper": ["rock", "spock"],
    "scissors": ["paper", "lizard"],
    "lizard": ["spock", "paper"],
    "spock": ["scissors", "rock"],
}

def get_winner_extended(player, computer):
    if player == computer:
        return "tie"
    if computer in BEATS_EXTENDED[player]:
        return "player"
    return "computer"
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'A Best-of-Five Match With a Running Score',
$py$```python
CHOICES = ["rock", "paper", "scissors"]

def get_player_choice():
    while True:
        choice = input("Rock, paper, or scissors? ").strip().lower()
        if choice in CHOICES:
            return choice
        print(f"'{choice}' isn't valid — pick rock, paper, or scissors.")

def play_match(rounds_to_win=3):
    player_score = 0
    computer_score = 0
    round_number = 0

    print(f"First to {rounds_to_win} wins takes the match. Let's go!")

    while player_score < rounds_to_win and computer_score < rounds_to_win:
        round_number += 1
        print(f"\n--- Round {round_number} ---")

        player = get_player_choice()
        computer = random.choice(CHOICES)
        print(f"You chose {player}. I chose {computer}.")

        result = get_winner(player, computer)

        if result == "tie":
            print("It's a tie — replay this round!")
            round_number -= 1   # a tie doesn't count as a completed round
        elif result == "player":
            player_score += 1
            print(f"You win this round! Score: {player_score}-{computer_score}")
        else:
            computer_score += 1
            print(f"I win this round! Score: {player_score}-{computer_score}")

    if player_score > computer_score:
        print(f"\nYou won the match, {player_score}-{computer_score}!")
    else:
        print(f"\nI won the match, {computer_score}-{player_score}. Good game!")

if __name__ == "__main__":
    play_match()
```

The `round_number -= 1` on a tie is a small, deliberate detail: without it, ties would still count toward the round total even though nothing was decided, quietly inflating the round counter in a way a careful player would notice and find confusing. Small correctness details like this are exactly what separates a game that "basically works" from one that feels genuinely well-made.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Where Rock-Paper-Scissors Logic Goes Wrong',
$py$**1. Writing the nine-branch version and never questioning it**

It works for three choices. It becomes genuinely painful — and error-prone, since it's easy to accidentally write a rule backwards — the moment the game grows to include even one more option. Recognizing "this pile of conditionals IS the data, just written the slow way" is the actual skill this lesson is teaching.

**2. Getting the direction of `BEATS` backwards**

```python
BEATS = {"rock": "scissors"}   # correct: rock BEATS scissors
# vs. accidentally reading/writing it as "rock LOSES TO scissors" somewhere
# else in the code — a single flipped rule silently makes the game wrong
# in a way that's easy to miss during casual testing, since it only shows
# up on that one specific matchup
```

Pick ONE consistent reading (`BEATS[x] == y` meaning "x beats y") and use it everywhere — mixing directions across different parts of the same program is a subtle, hard-to-spot bug.

**3. Not validating the player's choice before comparing it**

If `get_winner` is called with a typo like `"rocks"` instead of `"rock"`, `BEATS[player]` raises a `KeyError` immediately, because `"rocks"` isn't a key in the dictionary at all. Validate input (as `get_player_choice` does above) BEFORE it ever reaches the comparison logic.

**4. Forgetting that a tie shouldn't count as a "round" toward the match total** — covered above, but worth calling out again: subtle round-counting bugs are one of the most common sources of "this game feels slightly off" reports, even when every individual comparison is technically correct.$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game';

UPDATE lesson_sections SET metadata = '{"question": "BEATS = {\"rock\": \"scissors\", \"paper\": \"rock\", \"scissors\": \"paper\"}\n\ndef get_winner(player, computer):\n    if player == computer:\n        return \"tie\"\n    if BEATS[player] == computer:\n        return \"player\"\n    return \"computer\"\n\nprint(get_winner(\"paper\", \"scissors\"))\n\nWhat prints, and why?", "options": ["player -- because paper beats scissors according to real Rock-Paper-Scissors rules", "computer -- because BEATS[\"paper\"] is \"rock\", not \"scissors\", so the if-check fails and the function falls through to computer by default", "tie -- because paper and scissors are considered equivalent in this implementation", "KeyError -- \"scissors\" is not a key that maps to \"paper\" in BEATS"], "correct_index": 1, "explanation": "This is a genuinely important detail about how get_winner is written: it does NOT check whether the computer''s choice beats the player''s choice -- it ONLY checks whether the player''s choice beats the computer''s. BEATS[\"paper\"] is \"rock\", not \"scissors\", so BEATS[player] == computer (\"rock\" == \"scissors\") is False. Since player and computer aren''t equal either, the function falls through to its final line and returns \"computer\" by default -- which happens to be CORRECT here, since scissors genuinely does beat paper in real Rock-Paper-Scissors, but only because the function''s fallback assumption (\"if the player didn''t win and it wasn''t a tie, the computer must have won\") happens to be logically sound for a two-choice comparison where exactly one side must win. Understanding why that fallback logic is actually valid, rather than just accepting the printed answer, is the real point of this question."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Give the Computer a Personality',
$py$Extend the Rock-Paper-Scissors game from this lesson:

1. Instead of a purely random `random.choice(CHOICES)`, give the computer a simple "personality": track the player's last 3 choices in a list, and if the player has picked the SAME choice twice in a row, have the computer counter it on purpose (choosing whatever beats the player's last pick) rather than choosing randomly.

2. At the end of a full match, print a small summary showing how many times the player chose rock, paper, and scissors respectively (hint: `Counter` from the Standard Library lesson, if you've taken the Practical Python course — otherwise, a plain dict works fine too).

**Trick to watch for:** make sure the "counter the repeated choice" logic only activates AFTER the player has genuinely repeated a choice — a common bug is triggering it on the very first round, when there's no previous choice to compare against yet.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Game rules that "compare two things and decide a winner" are almost always better represented as a dictionary of facts than a wall of hand-written if-statements
- A `BEATS` dictionary needs a consistent, single direction of meaning (`BEATS[x] == y` meaning "x beats y") used everywhere it's referenced
- Extending a rules-as-data system to more options (Rock-Paper-Scissors-Lizard-Spock) means adding entries, not restructuring comparison logic
- Validate player input against the exact set of valid choices BEFORE it reaches a dictionary lookup, or a typo becomes a `KeyError` instead of a friendly re-prompt
- A tie shouldn't count as a completed round toward a best-of-N match total — small counting details like this are what separate "technically correct" from "feels genuinely polished"
- The round-tracking pattern from the Guessing Game lesson (an outer loop managing overall progress, an inner check managing one round) reappears here almost unchanged — recognizing a pattern you've already used is a real skill, not a coincidence$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-rps-game';

-- ═══════════════ LESSON 3: py-hangman-game ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'A Real Word Bank and a Win Condition You Can Trust',
$py$Hangman looks simple from the outside — guess letters, reveal a word — but a genuinely correct implementation needs to answer a few questions cleanly: how do you display a partially-guessed word without leaking letters you haven't earned yet? How do you know, precisely, when the player has actually won, rather than just guessing that they probably have? And how do you avoid double-counting a letter the player guesses twice?

This lesson answers all three using two tools you already know extremely well from Foundations: strings, and sets. The set specifically is what makes the win condition genuinely trustworthy instead of approximate — comparing "every unique letter in the word" against "every letter the player has guessed correctly" is a single, precise set comparison, not a fragile hand-rolled counting loop.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Masking a Word and Checking Wins With Sets',
$py$```python
import random

WORD_BANK = ["python", "hangman", "keyboard", "variable", "function", "iteration"]

def get_masked_word(word, guessed_letters):
    """Show correctly-guessed letters, hide everything else behind underscores."""
    return " ".join(letter if letter in guessed_letters else "_" for letter in word)

word = "python"
guessed = {"p", "y", "z"}   # a SET of guessed letters
print(get_masked_word(word, guessed))   # "p y _ _ _ _"
```

That single line inside `get_masked_word` is a list comprehension (from Foundations) feeding directly into `" ".join(...)` (also from Foundations) — nothing new syntactically, just two familiar tools solving a problem you probably hadn't pointed them at before.

**The win condition, done properly, is a set comparison:**

```python
def has_won(word, guessed_letters):
    unique_letters_in_word = set(word)
    return unique_letters_in_word.issubset(guessed_letters)

print(has_won("python", {"p", "y", "t", "h", "o", "n"}))  # True — every unique
                                                              # letter has been guessed
print(has_won("python", {"p", "y", "t", "h", "o"}))        # False — missing "n"
```

`.issubset()` answers exactly the right question: "is every letter this word actually needs already inside the set of letters the player has correctly guessed?" This is precise in a way a hand-rolled `for letter in word: if letter not in guessed: ...` loop can quietly get wrong if written carelessly (for instance, forgetting that a word with a REPEATED letter, like "keyboard" has no repeats but "iteration" does, only needs that letter guessed ONCE, not once per occurrence — a set naturally handles this correctly, without any extra logic, because a set collapses duplicates automatically).$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'The Full Game Loop, Tying It All Together',
$py$```python
def play_hangman(max_wrong_guesses=6):
    word = random.choice(WORD_BANK)
    guessed_letters = set()
    wrong_guesses = 0

    while wrong_guesses < max_wrong_guesses:
        print(f"\nWord: {get_masked_word(word, guessed_letters)}")
        print(f"Wrong guesses: {wrong_guesses}/{max_wrong_guesses}")

        if guessed_letters:
            print(f"Already guessed: {', '.join(sorted(guessed_letters))}")

        if has_won(word, guessed_letters):
            print(f"\nYou got it! The word was '{word}'.")
            return True

        letter = input("Guess a letter: ").strip().lower()

        if len(letter) != 1 or not letter.isalpha():
            print("Please enter a single letter.")
            continue

        if letter in guessed_letters:
            print(f"You already guessed '{letter}' — try a new letter.")
            continue

        guessed_letters.add(letter)

        if letter not in word:
            wrong_guesses += 1
            print(f"'{letter}' isn't in the word.")
        else:
            print(f"Nice — '{letter}' is in the word!")

    print(f"\nOut of guesses! The word was '{word}'.")
    return False

if __name__ == "__main__":
    play_hangman()
```

Notice the win check happens at the TOP of each loop iteration, right after displaying the current state — this ensures the player sees the fully-revealed word immediately on the round where their final correct letter completes it, rather than the game ending one iteration too early or too late. Small ordering decisions like this are exactly where a lot of beginner Hangman implementations quietly go wrong.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Where Hangman Implementations Break',
$py$**1. Using a list instead of a set for guessed letters**

A list allows the SAME letter to be added multiple times if you don't explicitly check first, silently bloating the "already guessed" display and, worse, potentially double-counting a wrong guess if the checking logic isn't careful. A set makes "have I seen this before" automatic — adding a letter that's already present simply does nothing, by definition.

**2. Checking for a win by comparing the masked word to the actual word as strings**

```python
if get_masked_word(word, guessed) == word:   # fragile — depends entirely on
    ...                                        # get_masked_word's exact formatting
                                                # (spacing, underscores) staying
                                                # perfectly consistent forever
```

This technically can work, but it's needlessly fragile — any future change to how the masked word is displayed (different spacing, different placeholder character) silently breaks the win condition too, since the two are now coupled by accident. The set-based `.issubset()` check has no dependency on display formatting at all.

**3. Not handling multi-character or non-letter input**

If the player types `"ab"` or a number, code that assumes `letter` is always exactly one valid character will misbehave — either crashing, or worse, silently treating a multi-character guess as if it were a single letter, which produces subtly wrong game behavior instead of a clean error message.

**4. Incrementing the wrong-guess counter for a REPEATED wrong guess** — if the player guesses `"z"` (not in the word) twice, that should only count as one wrong guess total, not two. Checking `if letter in guessed_letters` and re-prompting BEFORE the correctness check (as shown in the example above) is what prevents this.$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game';

UPDATE lesson_sections SET metadata = '{"question": "word = \"keyboard\"\nguessed = {\"k\", \"e\", \"o\", \"r\", \"d\"}\n\nprint(set(word).issubset(guessed))\n\nWhat prints, and what letter (if any) is still missing?", "options": ["True -- every letter has been guessed", "False -- ''a'' has not been guessed yet", "False -- ''b'' has not been guessed yet", "True -- repeated letters do not need to be guessed twice, and all unique letters are covered"], "correct_index": 1, "explanation": "set(\"keyboard\") produces the unique letters {k, e, y, b, o, a, r, d}. Comparing that against guessed = {k, e, o, r, d} using issubset() checks whether EVERY element of the word''s letter set is already present in guessed. The letters y, b, and a are all missing from guessed -- issubset() returns False the moment even one required element is absent, so this is False specifically because y, b, AND a are all still unguessed, not just one of them. This highlights exactly why the set-based check is trustworthy: it correctly requires every unique letter, with no risk of a manual counting loop accidentally missing one."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Categories and a Hint System',
$py$Extend the Hangman game from this lesson:

1. Replace the flat `WORD_BANK` list with a dictionary of categories, e.g. `{"animals": ["elephant", "giraffe", ...], "countries": [...]}`, and let the player choose a category before the word is randomly selected from within it.

2. Add a hint system: after 3 wrong guesses, reveal one random un-guessed letter for free (without it counting as a correct guess the player earned — just display it as revealed, but don't add it to `guessed_letters`, so it still shows as needing to eventually be part of a completed win... or, as a design choice, decide whether it SHOULD count, and be explicit in a comment about why you chose that.)

**Trick to watch for:** whichever choice you make for the hint system in part 2, make sure your `has_won` check still behaves consistently with it — if a hinted letter doesn't get added to `guessed_letters`, the word can never actually be "won" via the set-based check without the player eventually guessing that letter too, which may or may not be the behavior you intended. Test this specific edge case directly.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- A masked word display is a one-line list comprehension plus `.join()` — checking each letter against a set of guessed letters, exactly the tools from Foundations
- A set of guessed letters automatically prevents duplicate tracking, since adding an already-present element to a set has no effect
- `.issubset()` is a precise, display-independent way to check a win condition — comparing "every unique letter needed" against "every letter guessed," with duplicate letters in the word handled correctly for free
- Checking for a win by comparing formatted display strings is fragile, because it silently couples the win condition to unrelated display formatting choices
- Re-prompt on an already-guessed letter BEFORE checking correctness, so a repeated wrong guess never double-counts against the player's limited attempts
- The ordering of "check win condition" relative to "display current state" inside a loop is a small decision with a real, player-visible effect on when the game correctly ends$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-classics' AND l.slug = 'py-hangman-game';

-- ═══════════════ LESSON 4: py-text-adventure ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'A Whole World Is Just a Dictionary of Dictionaries',
$py$Every game so far in this course has had one clear "state" — a secret number, a word being guessed, a running score. A text adventure needs something bigger: an entire WORLD the player can move around inside, with rooms that connect to each other, items that can be picked up, and a genuine ending reachable only by navigating it correctly.

The reveal of this lesson is that "an entire world" is not a new kind of data structure at all — it's a dictionary, where each key is a room name and each value is another dictionary describing that room: its description, its exits, and what's in it. This is the exact same nested-dictionary shape from the JSON lesson in Practical Python, if you've taken it, or simply "a dict where the values are also dicts" straight out of Foundations if you haven't. Either way, nothing genuinely new is required to build something that feels, to a player, like a real place.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Modeling the World and Writing the Command Loop',
$py$```python
WORLD = {
    "entrance": {
        "description": "A dusty stone entrance hall. Passages lead north and east.",
        "exits": {"north": "library", "east": "armory"},
        "items": ["torch"],
    },
    "library": {
        "description": "Shelves of ancient books line the walls. A door leads south.",
        "exits": {"south": "entrance"},
        "items": ["old_key"],
    },
    "armory": {
        "description": "Rusted weapons hang on the walls. A passage leads west, and a locked door leads north.",
        "exits": {"west": "entrance", "north": "treasure_room"},
        "items": [],
    },
    "treasure_room": {
        "description": "Gold coins glitter everywhere. You've found the treasure!",
        "exits": {},
        "items": ["treasure"],
    },
}

def describe_current_room(room_name):
    room = WORLD[room_name]
    print(f"\n{room['description']}")
    if room["items"]:
        print(f"You see: {', '.join(room['items'])}")
    if room["exits"]:
        print(f"Exits: {', '.join(room['exits'].keys())}")
```

Every piece of this world — every room, every exit, every item — is just data sitting inside `WORLD`. There is no special "room" type, no special "exit" mechanism beyond a dictionary lookup. That's deliberate: the entire complexity of "a navigable world" reduces to a data structure you were already comfortable with, plus a command loop that reads player input and looks things up inside it.

**The command loop** — the part that actually lets a player move:

```python
def play_adventure():
    current_room = "entrance"
    inventory = []

    print("Welcome to the dungeon! Type 'go <direction>', 'take <item>', 'inventory', or 'quit'.")

    while True:
        describe_current_room(current_room)

        if current_room == "treasure_room":
            print("\nYou win! Thanks for playing.")
            break

        command = input("\n> ").strip().lower()
        parts = command.split()

        if not parts:
            print("Please enter a command.")
            continue

        action = parts[0]

        if action == "quit":
            print("Thanks for playing!")
            break

        elif action == "inventory":
            print(f"You are carrying: {', '.join(inventory) if inventory else 'nothing'}")

        elif action == "go" and len(parts) > 1:
            direction = parts[1]
            exits = WORLD[current_room]["exits"]
            if direction in exits:
                current_room = exits[direction]
            else:
                print(f"You can't go {direction} from here.")

        elif action == "take" and len(parts) > 1:
            item = parts[1]
            room_items = WORLD[current_room]["items"]
            if item in room_items:
                room_items.remove(item)
                inventory.append(item)
                print(f"You picked up the {item}.")
            else:
                print(f"There's no '{item}' here.")

        else:
            print("I don't understand that command.")
```

`command.split()` breaking `"go north"` into `["go", "north"]` is the entire "language" this game understands — the Strings lesson's `.split()`, doing genuinely load-bearing work here rather than a minor convenience.$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Adding a Locked Door That Needs an Item',
$py$```python
LOCKED_EXITS = {
    ("armory", "north"): "old_key",   # a tuple (room, direction) as a dict key —
}                                       # this only works because tuples are
                                        # immutable and hashable, exactly the
                                        # reason the Lists & Tuples lesson gave
                                        # for when to reach for a tuple over a list

def try_go(current_room, direction, inventory):
    exits = WORLD[current_room]["exits"]

    if direction not in exits:
        print(f"You can't go {direction} from here.")
        return current_room

    lock_key = (current_room, direction)
    if lock_key in LOCKED_EXITS:
        required_item = LOCKED_EXITS[lock_key]
        if required_item not in inventory:
            print(f"The door is locked. You need the {required_item.replace('_', ' ')}.")
            return current_room
        print(f"You use the {required_item.replace('_', ' ')} to unlock the door.")

    return exits[direction]
```

Using `(current_room, direction)` as a dictionary key is a genuinely elegant trick that only works BECAUSE tuples are immutable — exactly the property the Lists & Tuples lesson pointed to when explaining why tuples, and not lists, can serve as dict keys. Here it lets `LOCKED_EXITS` describe "this specific exit from this specific room needs this specific item" in one compact line, without any special-case room logic scattered through `try_go`.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Where Text Adventures Go Wrong',
$py$**1. Storing the world as separate, disconnected variables instead of one structure**

```python
entrance_description = "..."
entrance_exits = {"north": "library"}
library_description = "..."
# ...multiplied by every room, every field — this scales terribly and makes
# "add a new room" require touching several unrelated variables at once
```

A single `WORLD` dictionary keeps everything about a room in one place, and adding a new room means adding one new entry, not several new loose variables scattered through the file.

**2. Mutating a room's item list without checking the item is actually there first**

```python
room_items.remove(item)   # ValueError if item isn't actually in room_items!
```

Always check `if item in room_items:` before calling `.remove()` — this is precisely why the example above checks membership first, rather than assuming the player only ever types valid item names.

**3. Not handling an empty or malformed command**

`"go".split()` produces `["go"]` — a single-element list. Code that assumes `parts[1]` always exists will raise an `IndexError` the moment a player types just `"go"` with no direction. Checking `len(parts) > 1` before accessing `parts[1]`, as the example does, is what prevents this.

**4. Forgetting that a list stored inside a dict is still a REFERENCE, not a copy**

If two different rooms in `WORLD` accidentally end up pointing at the exact same list object (easy to do by copy-pasting a room definition carelessly and reusing a variable), picking up an item in one room can silently make it vanish from the other too — exactly the list-aliasing trap from the Lists & Tuples lesson, resurfacing here in a genuinely game-breaking way.$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure';

UPDATE lesson_sections SET metadata = '{"question": "command = \"go\"\nparts = command.split()\n\nif action == \"go\" and len(parts) > 1:\n    direction = parts[1]\n    ...\n\nIf the player types just \"go\" with no direction, what happens, and why does the len(parts) > 1 check matter here?", "options": ["parts[1] raises an IndexError immediately, crashing the game, since len(parts) > 1 only checks AFTER accessing parts[1]", "The and short-circuits: since len(parts) > 1 is False (parts has only 1 element), Python never evaluates parts[1] at all, so the go-branch is simply skipped without error", "parts[1] silently returns an empty string instead of raising an error", "The condition raises a TypeError because action is being compared before parts is fully evaluated"], "correct_index": 1, "explanation": "\"go\".split() produces [\"go\"], a list with exactly one element, so len(parts) is 1 -- meaning len(parts) > 1 evaluates to False. Because Python''s and operator short-circuits, and the LEFT side of an and is False, Python never even evaluates the right side -- parts[1] is never accessed at all, and no IndexError occurs. Execution simply falls through, typically to an ''I don''t understand that command'' fallback elsewhere in the loop, which is exactly the intended graceful behavior for an incomplete command like ''go'' with no direction specified."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Expand the Map',
$py$Extend the text adventure from this lesson:

1. Add at least 2 new rooms to `WORLD`, connected to the existing map, with their own items
2. Add a second locked exit somewhere on your new map, requiring a different item than the existing `old_key` example
3. Add a `"look"` command that re-prints the current room's description and contents without requiring the player to move first
4. Add a `"drop <item>"` command — the reverse of `"take"` — that removes an item from the player's inventory and adds it back to the current room's item list

**Trick to watch for:** after adding `"drop"`, test picking an item up, dropping it in a DIFFERENT room than where you found it, then walking back to the original room — confirm the item genuinely stays in the new room and does not somehow reappear in both places. This directly tests whether you've avoided the list-aliasing trap called out in this lesson's pitfalls.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- A whole game world fits naturally into a dictionary of dictionaries — one entry per room, each holding its description, exits, and items — no new data structure required beyond what Foundations already covered
- `command.split()` turns free-text input into a simple, checkable command language, and is genuinely load-bearing logic here, not a minor convenience
- A tuple like `(room, direction)` makes a clean, precise dictionary key specifically because tuples are immutable — exactly why the Lists & Tuples lesson recommended them for fixed, structured lookups
- Always check an item's presence with `in` before calling `.remove()` on a list — assuming a value is present is a reliable source of `ValueError`s in interactive programs
- `and` short-circuits, so a guard like `len(parts) > 1 and parts[1] == ...` safely protects against accessing an index that doesn't exist
- List aliasing (two variables secretly pointing at the same list) is a real risk when building a data-driven world by copy-pasting room definitions — verify newly added rooms don't accidentally share item lists with existing ones$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-text-adventure';

-- ═══════════════ LESSON 5: py-word-puzzle ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Fair Puzzles Need Careful String Handling',
$py$A word scramble sounds trivial — shuffle the letters, ask the player to unscramble them — until you actually try to build one that feels fair. What happens if the shuffle happens to produce the ORIGINAL word by pure chance? What happens if the player's answer has different capitalization or stray whitespace but is otherwise correct? What happens with a word that has repeated letters, where a naive anagram check might get fooled?

This lesson is about those exact details — the ones that separate a puzzle generator a player trusts from one that occasionally feels broken or unfair for reasons they can't quite articulate. Every tool involved is string manipulation and `random`, both already familiar; the value here is entirely in the care applied to edge cases.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Scrambling Fairly and Checking Anagrams Correctly',
$py$```python
import random

def scramble_word(word):
    """Shuffle a word's letters, guaranteed different from the original
    (for any word with at least 2 distinct letters)."""
    letters = list(word)
    scrambled = word

    while scrambled == word:
        random.shuffle(letters)
        scrambled = "".join(letters)

    return scrambled

print(scramble_word("python"))   # e.g. "ohtnyp" — guaranteed NOT "python" itself
```

That `while scrambled == word:` loop is doing genuinely important work: `random.shuffle` has a real, non-zero chance of producing the exact original ordering purely by luck, especially for short words. Without the loop re-shuffling until the result actually differs, a player would occasionally be shown an "unscrambled" puzzle and rightly feel like something was broken.

**Checking whether a guess is correct** needs the same defensive normalization you've used everywhere else in this course:

```python
def check_guess(guess, correct_word):
    return guess.strip().lower() == correct_word.strip().lower()

print(check_guess("  PYTHON ", "python"))   # True — whitespace and case
                                               # differences shouldn't matter
                                               # to a player who got it right
```

**A correct anagram check — genuinely different from a naive character-count-by-eye approach:**

```python
def is_anagram(word_a, word_b):
    normalize = lambda w: sorted(w.strip().lower())
    return normalize(word_a) == normalize(word_b)

print(is_anagram("listen", "silent"))   # True
print(is_anagram("Python", "Typhon"))    # True — case-insensitive
print(is_anagram("hello", "world"))      # False
```

Sorting both words' letters and comparing the results is a small, precise trick: two strings are anagrams of each other exactly when they contain the same letters the same number of times — and sorting is a reliable way to normalize "the same letters" into a directly comparable form, correctly handling repeated letters without any special-case counting logic.$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'A Full Puzzle Round With Hints and Scoring',
$py$```python
WORD_LIST = ["python", "keyboard", "variable", "function", "iteration", "dictionary"]

def play_scramble_round(word, max_hints=2):
    scrambled = scramble_word(word)
    hints_used = 0
    revealed = ""

    print(f"\nUnscramble this: {scrambled}")

    while True:
        guess = input(f"Your guess (or 'hint' — {max_hints - hints_used} left): ").strip()

        if guess.lower() == "hint":
            if hints_used >= max_hints:
                print("No hints left!")
                continue
            hints_used += 1
            revealed = word[:hints_used]
            print(f"Hint: starts with '{revealed}'")
            continue

        if check_guess(guess, word):
            points = max(10 - hints_used * 3, 1)   # fewer hints -> more points,
                                                       # but never fewer than 1
            print(f"Correct! You earned {points} points.")
            return points

        print("Not quite — try again, or type 'hint'.")

def play_scramble_game(rounds=3):
    total_score = 0
    words = random.sample(WORD_LIST, rounds)   # rounds UNIQUE words, no repeats

    for round_number, word in enumerate(words, start=1):
        print(f"\n=== Round {round_number}/{rounds} ===")
        total_score += play_scramble_round(word)

    print(f"\nFinal score: {total_score} points across {rounds} rounds!")

if __name__ == "__main__":
    play_scramble_game()
```

`random.sample(WORD_LIST, rounds)` — rather than calling `random.choice` in a loop — is deliberate: it guarantees `rounds` DIFFERENT words, with no risk of the same word appearing twice in one game session, exactly the distinction the Standard Library lesson draws between `choice` and `sample`.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Where Word Puzzles Go Wrong',
$py$**1. Not guaranteeing the scramble actually differs from the original**

Skipping the `while scrambled == word:` loop means an occasional round will present the player with the word already "unscrambled" by chance, which reads as a bug even though nothing technically malfunctioned — random chance genuinely did that.

**2. Comparing guesses without normalizing case and whitespace**

```python
if guess == word:   # "Python" != "python" — a technically correct guess with
    ...               # different capitalization is rejected, which feels
                        # unfair and arbitrary to the player
```

Always `.strip().lower()` both sides before comparing player-typed text to a stored answer, exactly the habit from the User Input lesson, applied here.

**3. Checking anagrams by comparing character SETS instead of sorted letter lists**

```python
set("aab") == set("abb")   # True! But these are NOT anagrams —
                              # "aab" has two a's and one b;
                              # "abb" has one a and two b's — a set silently
                              # throws away the COUNT of each letter, only
                              # keeping which distinct letters are present
sorted("aab") == sorted("abb")   # False, correctly — sorting preserves
                                    # every occurrence, including duplicates
```

This is a genuinely easy mistake to make, since `set()` "feels" like the right tool (it's the natural choice for "same letters," per the Dicts & Sets lesson) — but a set specifically discards duplicate-count information that an anagram check actually needs.

**4. Awarding points that can go negative or hit zero unexpectedly** — a scoring formula like `10 - hints_used * 3` can go negative if a player is allowed excessive hints; the `max(..., 1)` in the example above is a small, deliberate guard ensuring a correct answer is never worth zero or fewer points, no matter how many hints were used.$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle';

UPDATE lesson_sections SET metadata = '{"question": "def is_anagram_buggy(a, b):\n    return set(a.lower()) == set(b.lower())\n\nprint(is_anagram_buggy(\"kitten\", \"tinket\"))\n\nWhat prints, and what is specifically wrong with this function''s approach?", "options": ["False -- set() cannot compare strings of different lengths at all", "True -- and this happens to be correct, since kitten and tinket really are anagrams of each other", "True -- but the function would ALSO incorrectly return True for genuinely non-anagram pairs like ''aab'' and ''abb'', because set() discards how many times each letter appears", "False -- kitten and tinket are not actually anagrams of each other"], "correct_index": 2, "explanation": "\"kitten\" and \"tinket\" happen to both be six letters using exactly the same letters the same number of times, so they genuinely ARE anagrams, and set(\"kitten\") == set(\"tinket\") does correctly return True here. But that correct result is accidental, not reliable: the underlying method is broken, because set() only tracks which DISTINCT letters are present, not how many times each one appears. This exact function would incorrectly report \"aab\" and \"abb\" as anagrams too, even though they use different letter counts -- exactly the pitfall this lesson calls out. The reliable fix is comparing sorted(a.lower()) == sorted(b.lower()) instead, which preserves every letter''s exact count."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: A Themed Word Puzzle Pack',
$py$Extend the word scramble game from this lesson:

1. Replace the flat `WORD_LIST` with a dictionary of themed word packs (e.g. `"animals"`, `"programming"`, `"countries"`), and let the player pick a theme before the game starts — the same category-selection pattern from the Hangman lesson's practice exercise, applied again here deliberately.

2. Add a `find_anagram_pairs(word_list)` function that, given a list of words, returns every pair of words within it that are anagrams of each other (using the correct sorted-letters check from this lesson, not the buggy set-based one from the quiz).

3. Use `find_anagram_pairs` on a small test list that includes at least one genuine anagram pair (like `"listen"`/`"silent"`) and at least one pair that looks similar but ISN'T actually an anagram, and confirm your function tells them apart correctly.

**Trick to watch for:** make sure `find_anagram_pairs` doesn't accidentally pair a word with ITSELF (every word is trivially an "anagram" of itself, but that's not a useful or interesting pair to report) and doesn't report the same pair twice in reversed order (e.g. both `("listen", "silent")` AND `("silent", "listen")`).$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- A scramble that might accidentally equal the original word by chance needs an explicit re-shuffle loop — pure randomness alone isn't enough to guarantee a genuinely scrambled result
- Normalize player guesses (`.strip().lower()`) before comparing them to a stored answer, so harmless differences in case or whitespace never cause an unfair rejection
- A correct anagram check compares SORTED letters, not letter SETS — sets discard how many times each letter appears, which silently breaks on words with repeated letters
- `random.sample()` guarantees unique selections across a whole game session; `random.choice()` in a loop does not, and can repeat the same word
- A scoring formula that subtracts for hints needs an explicit floor (`max(..., 1)`) to avoid producing zero or negative rewards for a correct answer
- Every tool in this lesson — string methods, `random`, sorting, dictionaries — came from Foundations or earlier in this course; the actual skill demonstrated here is care around edge cases, not new syntax$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-word-puzzle';

-- ═══════════════ LESSON 6: py-dungeon-capstone ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Everything, Combined, One More Time',
$py$This capstone is deliberately not a new topic — it's the text adventure from earlier in this module, given actual stakes. A health bar that can run out. Random monster encounters that use the Rock-Paper-Scissors comparison pattern from Lesson 2 as a real combat system. A locked treasure room that needs an item, exactly like the locked door from the Text Adventure lesson, except now finding that item is the entire point of playing.

Every single mechanic below has already appeared somewhere earlier in this course. What's new is only the combination — and building the discipline to combine several small, already-understood systems into one coherent game is, genuinely, most of what real software development actually is.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-dungeon-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Combat as Rock-Paper-Scissors With Consequences',
$py$```python
import random

ATTACK_BEATS = {
    "slash": "block",
    "block": "dodge",
    "dodge": "slash",
}
ATTACKS = list(ATTACK_BEATS.keys())

def resolve_combat_round(player_move, monster_move):
    """Return 'player', 'monster', or 'tie' — the exact same shape as
    the Rock-Paper-Scissors get_winner function from earlier in this course."""
    if player_move == monster_move:
        return "tie"
    if ATTACK_BEATS[player_move] == monster_move:
        return "player"
    return "monster"

def fight_monster(monster_name, monster_health=15, player_health_ref=None):
    print(f"\nA wild {monster_name} appears!")
    monster_hp = monster_health

    while monster_hp > 0 and player_health_ref[0] > 0:
        print(f"\nYour HP: {player_health_ref[0]} | {monster_name}'s HP: {monster_hp}")
        print(f"Choose your move: {', '.join(ATTACKS)}")

        player_move = input("> ").strip().lower()
        if player_move not in ATTACKS:
            print("Not a valid move — try again.")
            continue

        monster_move = random.choice(ATTACKS)
        result = resolve_combat_round(player_move, monster_move)

        if result == "tie":
            print(f"Both chose {player_move} — no damage this round.")
        elif result == "player":
            monster_hp -= 5
            print(f"Your {player_move} beats their {monster_move}! You deal 5 damage.")
        else:
            player_health_ref[0] -= 5
            print(f"Their {monster_move} beats your {player_move}! You take 5 damage.")

    if player_health_ref[0] <= 0:
        print(f"\nYou were defeated by the {monster_name}...")
        return False

    print(f"\nYou defeated the {monster_name}!")
    return True
```

`resolve_combat_round` is, structurally, exactly `get_winner` from the Rock-Paper-Scissors lesson — same three-way return value, same "rules as a dictionary" approach, just renamed and pointed at a different theme (slash/block/dodge instead of rock/paper/scissors). Recognizing that this "new" combat system is really the same pattern you already built, wearing a different costume, is precisely the kind of recognition this whole course has been building toward.

`player_health_ref` being passed as a single-element list (`[player_health_ref[0]]`) rather than a plain integer is a deliberate, slightly unusual choice worth noticing: a plain `int` argument can't be modified by a function and have that change visible to the caller (ints are immutable, exactly like the Variables lesson's `a = 5; b = a` example), but a list CAN be mutated in place — so wrapping the health value in a one-element list is a small, real trick for letting `fight_monster` update a health value that the calling code also needs to see change.$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-dungeon-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'The Full Dungeon: World, Inventory, and Random Encounters',
$py$```python
DUNGEON = {
    "entrance": {
        "description": "A torchlit entrance. Passages lead north and east.",
        "exits": {"north": "armory", "east": "library"},
        "items": [],
        "encounter_chance": 0.0,
    },
    "armory": {
        "description": "Weapon racks line the walls. A door leads south and north.",
        "exits": {"south": "entrance", "north": "treasure_room"},
        "items": ["rusty_key"],
        "encounter_chance": 0.4,
    },
    "library": {
        "description": "Dusty tomes fill every shelf. A passage leads west.",
        "exits": {"west": "entrance"},
        "items": ["health_potion"],
        "encounter_chance": 0.3,
    },
    "treasure_room": {
        "description": "A locked vault. Gold glimmers behind the bars.",
        "exits": {},
        "items": ["treasure"],
        "encounter_chance": 0.0,
    },
}

LOCKED_EXITS = {("armory", "north"): "rusty_key"}
MONSTERS = ["goblin", "skeleton", "shadow wolf"]

def play_dungeon():
    current_room = "entrance"
    inventory = []
    health = [20]   # single-element list, per the mutability trick above

    print("You enter the dungeon. Find the treasure — and survive.\n")

    while health[0] > 0:
        room = DUNGEON[current_room]
        print(f"\n{room['description']}")

        if room["items"]:
            print(f"You see: {', '.join(room['items'])}")

        if current_room == "treasure_room" and "treasure" in room["items"]:
            print("\nYou claim the treasure. VICTORY!")
            return

        if random.random() < room["encounter_chance"]:
            monster = random.choice(MONSTERS)
            survived = fight_monster(monster, player_health_ref=health)
            if not survived:
                return
            continue   # skip the command prompt this round — you just fought!

        command = input(f"\n[HP: {health[0]}] > ").strip().lower().split()
        if not command:
            continue
        action = command[0]

        if action == "quit":
            print("You retreat from the dungeon.")
            return

        elif action == "go" and len(command) > 1:
            direction = command[1]
            exits = room["exits"]
            if direction not in exits:
                print(f"You can't go {direction} from here.")
                continue
            key_needed = LOCKED_EXITS.get((current_room, direction))
            if key_needed and key_needed not in inventory:
                print(f"The way is locked. You need the {key_needed.replace('_', ' ')}.")
                continue
            current_room = exits[direction]

        elif action == "take" and len(command) > 1:
            item = command[1]
            if item in room["items"]:
                room["items"].remove(item)
                inventory.append(item)
                print(f"You picked up the {item.replace('_', ' ')}.")
                if item == "health_potion":
                    health[0] = min(health[0] + 10, 20)
                    inventory.remove("health_potion")
                    print(f"You drink it immediately. HP: {health[0]}/20.")
            else:
                print(f"There's no '{item}' here.")

        else:
            print("Unknown command. Try: go <direction>, take <item>, quit.")

    print("\nYou have fallen in the dungeon...")

if __name__ == "__main__":
    play_dungeon()
```

This single function is, quite literally, every lesson in this course at once: the world-as-a-dictionary and command loop from the Text Adventure lesson, the tuple-keyed locked-exit trick from that same lesson, the combat-as-comparison-rules system built directly on Rock-Paper-Scissors, a bounded health system that plays the exact same "loop that knows when to stop" role as the Guessing Game's attempt limit, and `random.random()` driving encounter probability the same way `random.randint` drove the secret number at the very start of this course.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-dungeon-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'Tips for Building Your Own Version',
$py$- **Build and test each system in isolation first** — get combat working with a tiny throwaway test (fight a monster with 5 HP and confirm it resolves correctly) before wiring it into full dungeon exploration, exactly the "one module at a time" discipline from the Practical Python capstone, if you've taken that course.

- **Keep `encounter_chance` low while testing**, or set it to `0` temporarily — constantly getting pulled into random combat while you're trying to test the navigation logic makes debugging painfully slow.

- **Print the player's HP prominently and often** — a health system a player can't clearly see at all times feels unfair even when it's working correctly; visibility matters as much as correctness here.

- **Balance damage numbers by actually playing it**, not by guessing — if every fight takes 15 rounds or ends in 1 hit, the fixed damage values need adjusting; there's no substitute for running the game yourself several times.

- **Resist the urge to add ten more rooms before the core loop is solid** — a small, three-room dungeon that works completely correctly (navigation, combat, win condition, loss condition) is a far better finished product than a large map built on top of a shaky, half-tested foundation.$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-dungeon-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'mini_project', 'Dungeon Crawler Project',
$py$Build and test the complete Dungeon Crawler described in this lesson, using the starter code as your foundation.

**Requirements:**
1. At least 5 connected rooms, with at least one locked exit requiring a specific item
2. A working combat system using the rock-paper-scissors-style comparison pattern, with random monster encounters tied to per-room encounter chances
3. A health system that can genuinely run out, ending the game in defeat — and a genuine win condition reaching the treasure room
4. At least one consumable item (like the health potion) with a real effect on play
5. Graceful handling of invalid commands, invalid moves in combat, and attempts to take/go somewhere that doesn't make sense

**Stretch goals:**
- Add a second, tougher monster type with more HP and a different attack pattern (e.g. it only ever picks from 2 of the 3 possible moves, making it slightly predictable if the player pays attention)
- Add a scoring system tracking how many rooms were explored and how many monsters were defeated, printed as a final summary on both victory and defeat
- Add a save-state feature: let the player type "save" to print their current room, inventory, and HP as a JSON string they could theoretically paste back in later (a nod to the CSV/JSON lesson from Practical Python, if you've taken it — full save/load isn't required, just producing a correct JSON snapshot)

**Closing thought:** if you've taken every course in this catalog to this point, notice that this single capstone genuinely uses pieces from Foundations, Practical Python, and this games course all at once — dictionaries, sets, string methods, the standard library, and careful edge-case handling, combined into one program a person could actually enjoy playing. That combination is the entire point.$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-dungeon-capstone';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-dungeon-crawler-project', 'Dungeon Crawler',
'A complete, replayable text-based dungeon crawler with room navigation, an inventory system, random monster encounters resolved through a rock-paper-scissors-style combat system, and genuine win and loss conditions.',
$py$1. At least 5 connected rooms with at least one locked exit requiring a specific item
2. A working combat system with random encounters tied to per-room encounter chances
3. A health system that can run out (loss) and a treasure room that can be reached (win)
4. At least one consumable item with a real gameplay effect
5. Graceful handling of invalid commands and invalid combat moves$py$,
$py$import random

ATTACK_BEATS = {"slash": "block", "block": "dodge", "dodge": "slash"}
ATTACKS = list(ATTACK_BEATS.keys())

DUNGEON = {
    "entrance": {
        "description": "A torchlit entrance. Passages lead north and east.",
        "exits": {"north": "armory", "east": "library"},
        "items": [],
        "encounter_chance": 0.0,
    },
    "armory": {
        "description": "Weapon racks line the walls. A door leads south and north.",
        "exits": {"south": "entrance", "north": "treasure_room"},
        "items": ["rusty_key"],
        "encounter_chance": 0.4,
    },
    "library": {
        "description": "Dusty tomes fill every shelf. A passage leads west.",
        "exits": {"west": "entrance"},
        "items": ["health_potion"],
        "encounter_chance": 0.3,
    },
    "treasure_room": {
        "description": "A locked vault. Gold glimmers behind the bars.",
        "exits": {},
        "items": ["treasure"],
        "encounter_chance": 0.0,
    },
}

LOCKED_EXITS = {("armory", "north"): "rusty_key"}
MONSTERS = ["goblin", "skeleton", "shadow wolf"]

def resolve_combat_round(player_move, monster_move):
    if player_move == monster_move:
        return "tie"
    if ATTACK_BEATS[player_move] == monster_move:
        return "player"
    return "monster"

def fight_monster(monster_name, player_health_ref, monster_health=15):
    print(f"\nA wild {monster_name} appears!")
    monster_hp = monster_health

    while monster_hp > 0 and player_health_ref[0] > 0:
        print(f"\nYour HP: {player_health_ref[0]} | {monster_name}'s HP: {monster_hp}")
        print(f"Choose your move: {', '.join(ATTACKS)}")
        player_move = input("> ").strip().lower()
        if player_move not in ATTACKS:
            print("Not a valid move — try again.")
            continue
        monster_move = random.choice(ATTACKS)
        result = resolve_combat_round(player_move, monster_move)
        if result == "tie":
            print(f"Both chose {player_move} — no damage this round.")
        elif result == "player":
            monster_hp -= 5
            print(f"Your {player_move} beats their {monster_move}! You deal 5 damage.")
        else:
            player_health_ref[0] -= 5
            print(f"Their {monster_move} beats your {player_move}! You take 5 damage.")

    if player_health_ref[0] <= 0:
        print(f"\nYou were defeated by the {monster_name}...")
        return False
    print(f"\nYou defeated the {monster_name}!")
    return True

def play_dungeon():
    current_room = "entrance"
    inventory = []
    health = [20]
    print("You enter the dungeon. Find the treasure — and survive.\n")

    while health[0] > 0:
        room = DUNGEON[current_room]
        print(f"\n{room['description']}")
        if room["items"]:
            print(f"You see: {', '.join(room['items'])}")

        if current_room == "treasure_room" and "treasure" in room["items"]:
            print("\nYou claim the treasure. VICTORY!")
            return

        if random.random() < room["encounter_chance"]:
            monster = random.choice(MONSTERS)
            if not fight_monster(monster, health):
                return
            continue

        command = input(f"\n[HP: {health[0]}] > ").strip().lower().split()
        if not command:
            continue
        action = command[0]

        if action == "quit":
            print("You retreat from the dungeon.")
            return
        elif action == "go" and len(command) > 1:
            direction = command[1]
            exits = room["exits"]
            if direction not in exits:
                print(f"You can't go {direction} from here.")
                continue
            key_needed = LOCKED_EXITS.get((current_room, direction))
            if key_needed and key_needed not in inventory:
                print(f"The way is locked. You need the {key_needed.replace('_', ' ')}.")
                continue
            current_room = exits[direction]
        elif action == "take" and len(command) > 1:
            item = command[1]
            if item in room["items"]:
                room["items"].remove(item)
                inventory.append(item)
                print(f"You picked up the {item.replace('_', ' ')}.")
                if item == "health_potion":
                    health[0] = min(health[0] + 10, 20)
                    inventory.remove("health_potion")
                    print(f"You drink it immediately. HP: {health[0]}/20.")
            else:
                print(f"There's no '{item}' here.")
        else:
            print("Unknown command. Try: go <direction>, take <item>, quit.")

    print("\nYou have fallen in the dungeon...")

if __name__ == "__main__":
    play_dungeon()$py$,
3, 150,
ARRAY['Test combat in isolation with a low-HP monster before wiring it into full exploration', 'Temporarily set encounter_chance to 0 while debugging navigation logic', 'Print HP prominently every turn so the stakes are always visible to the player', 'Play through it yourself several times to balance damage numbers rather than guessing', 'Get a small 3-room version fully working before expanding the map'],
1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery-games' AND m.slug = 'py-games-worldbuilding' AND l.slug = 'py-dungeon-capstone'
ON CONFLICT (lesson_id, slug) DO NOTHING;

COMMIT;
