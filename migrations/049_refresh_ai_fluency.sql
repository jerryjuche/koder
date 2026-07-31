-- ============================================================================
-- Koder :: AI Fluency: Foundations for AI Engineering Content Refresh
-- Generated: 2026-07-31 03:35:41
-- ============================================================================
-- Idempotent refresh for an already-seeded course. Course, modules, and lessons are
-- updated in place by slug (IDs preserved, so user progress survives). Sections,
-- projects, and lesson dependencies are deleted and re-inserted for exact parity
-- with the source JSON.
-- ============================================================================

BEGIN;

-- ── 1. COURSE (UPDATE) ──────────────────────────────────────────────

UPDATE courses
SET title = 'AI Fluency: Foundations for AI Engineering',
    description = 'Master the foundational knowledge, skills, and judgment required to work effectively, efficiently, ethically, and safely with AI systems. This course is built directly on Anthropic''s AI Fluency Framework — the four competencies of Delegation, Description, Discernment, and Diligence, developed by Anthropic with Prof. Rick Dakan (Ringling College of Art and Design) and Prof. Joseph Feller (University College Cork) — and extends it into the technical and professional skills a working AI engineer needs: neural network intuition, transformer architecture, prompt engineering, retrieval-augmented generation, evaluation, agents, and responsible deployment. Go analogies are used throughout to bridge from your existing engineering background.',
    difficulty_level = 2,
    estimated_hours = 22,
    order_number = 13
WHERE slug = 'ai-fluency';

-- ── 2. MODULES (UPDATE) ─────────────────────────────────────────────

UPDATE modules
SET title = 'The AI Landscape & Human-AI Collaboration',
    description = 'Define AI fluency using Anthropic''s own framework, trace how the field arrived at today''s models, and master the strategic vocabulary — Delegation and the three modes of AI interaction — that every later module builds on.',
    order_number = 1
WHERE course_id = (SELECT c.id FROM courses c WHERE c.slug = 'ai-fluency')
  AND slug = 'ai-landscape';

UPDATE modules
SET title = 'The Technical Core: How AI Actually Works',
    description = 'Build real technical grounding — data pipelines, neural network intuition, the Transformer architecture, the model lifecycle, and inference-time controls — so your Delegation and Discernment decisions rest on understanding, not guesswork.',
    order_number = 2
WHERE course_id = (SELECT c.id FROM courses c WHERE c.slug = 'ai-fluency')
  AND slug = 'technical-core';

UPDATE modules
SET title = 'The Craft of Description: Prompt Engineering',
    description = 'This module is the technical deep dive into the Description competency. Master the six prompting techniques from Anthropic''s AI Fluency Framework and apply them through the lens of Product, Process, and Performance.',
    order_number = 3
WHERE course_id = (SELECT c.id FROM courses c WHERE c.slug = 'ai-fluency')
  AND slug = 'prompt-craft';

UPDATE modules
SET title = 'Responsible AI: Discernment & Diligence',
    description = 'This module is the deep dive into Discernment (accurately assessing AI outputs) and Diligence (taking responsibility for what you do with AI), the two competencies that determine whether your AI-assisted work can actually be trusted.',
    order_number = 4
WHERE course_id = (SELECT c.id FROM courses c WHERE c.slug = 'ai-fluency')
  AND slug = 'responsible-ai';

UPDATE modules
SET title = 'AI Engineering in Production',
    description = 'Apply all four Ds together to real software engineering work: AI-assisted development, RAG, evaluation pipelines, agentic systems, and how the field is likely to keep changing.',
    order_number = 5
WHERE course_id = (SELECT c.id FROM courses c WHERE c.slug = 'ai-fluency')
  AND slug = 'engineering-workflow';

-- ── 3. LESSONS (UPDATE) ─────────────────────────────────────────────

UPDATE lessons
SET title = 'Defining AI Fluency & The 4D Framework',
    description = 'Learn what it means to be fluent in AI — beyond prompting — and internalize the four competencies (Delegation, Description, Discernment, Diligence) that Anthropic''s AI Fluency Framework defines as the basis of effective human-AI collaboration.',
    difficulty = 1,
    estimated_minutes = 20,
    xp_reward = 40,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape')
  AND slug = 'defining-ai-fluency';

UPDATE lessons
SET title = 'A Brief History of Artificial Intelligence',
    description = 'Trace AI''s path from the 1956 Dartmouth workshop through two AI winters to the 2017 Transformer paper and the generative AI era, and understand why today is a genuine inflection point rather than another hype cycle.',
    difficulty = 1,
    estimated_minutes = 18,
    xp_reward = 40,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape')
  AND slug = 'history-of-ai';

UPDATE lessons
SET title = 'The Three Modes of AI Interaction',
    description = 'Master Anthropic''s three modes of human-AI collaboration — Automation, Augmentation, and Agency — and learn how they connect to the Delegation competency.',
    difficulty = 2,
    estimated_minutes = 22,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape')
  AND slug = 'human-ai-interaction-modes';

UPDATE lessons
SET title = 'The AI Ecosystem: ML, DL, NLP, CV, and GenAI',
    description = 'Map how machine learning, deep learning, NLP, computer vision, and generative AI relate to each other, so you can place any new AI tool or paper in context.',
    difficulty = 2,
    estimated_minutes = 20,
    xp_reward = 45,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape')
  AND slug = 'ai-ecosystem';

UPDATE lessons
SET title = 'AI in the Real World: Industry Case Studies',
    description = 'Examine how AI is actually deployed in healthcare, finance, creative work, and software engineering, and connect each case back to the 4Ds.',
    difficulty = 2,
    estimated_minutes = 25,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape')
  AND slug = 'ai-real-world-impact';

UPDATE lessons
SET title = 'Data: The Fuel of AI',
    description = 'Understand data types, the training/validation/test split, and why data leakage silently invalidates model evaluation.',
    difficulty = 2,
    estimated_minutes = 20,
    xp_reward = 45,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core')
  AND slug = 'data-the-fuel-of-ai';

UPDATE lessons
SET title = 'Machine Learning & Neural Network Intuition',
    description = 'Understand the shift from rule-based programming to learned patterns, and build working intuition for what a neuron and a layer actually compute.',
    difficulty = 2,
    estimated_minutes = 25,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core')
  AND slug = 'machine-learning-basics';

UPDATE lessons
SET title = 'LLM Architecture: Transformers, Parameters & Scaling',
    description = 'Understand self-attention, what parameters actually are, and what scaling laws do and don''t tell you about model capability.',
    difficulty = 3,
    estimated_minutes = 25,
    xp_reward = 55,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core')
  AND slug = 'llm-architecture-deep-dive';

UPDATE lessons
SET title = 'The AI Lifecycle: Pre-training, Fine-tuning & Inference',
    description = 'Understand the three stages of a model''s life — where the cost is, who does what, and where your Go backend fits.',
    difficulty = 3,
    estimated_minutes = 22,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core')
  AND slug = 'ai-lifecycle';

UPDATE lessons
SET title = 'AI Behavior Controls: Temperature, Top-P & System Prompts',
    description = 'Learn how temperature and top-p shape output randomness at inference time, and how system prompts set the model''s overall posture.',
    difficulty = 2,
    estimated_minutes = 20,
    xp_reward = 45,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core')
  AND slug = 'ai-behavior-controls';

UPDATE lessons
SET title = 'Product Description: Defining the Output',
    description = 'Learn to specify format, length, audience, and style so precisely that the AI has no meaningful ambiguity left to guess at.',
    difficulty = 2,
    estimated_minutes = 20,
    xp_reward = 45,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft')
  AND slug = 'product-description';

UPDATE lessons
SET title = 'Process Description: Defining the Method',
    description = 'Guide the AI''s reasoning using two more of the six techniques — breaking tasks into steps, and asking the AI to think first.',
    difficulty = 2,
    estimated_minutes = 20,
    xp_reward = 45,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft')
  AND slug = 'process-description';

UPDATE lessons
SET title = 'Performance Description: Defining the Behavior',
    description = 'Use the remaining two prompting techniques — defining role/tone and iterating on the interaction — to control how the AI behaves during collaboration.',
    difficulty = 2,
    estimated_minutes = 18,
    xp_reward = 40,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft')
  AND slug = 'performance-description';

UPDATE lessons
SET title = 'Advanced Prompting: Few-Shot Examples & Combined Techniques',
    description = 'Combine the sixth core technique — showing examples — with role, process, and constraints to handle the hardest description problems.',
    difficulty = 3,
    estimated_minutes = 22,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft')
  AND slug = 'advanced-prompting';

UPDATE lessons
SET title = 'Structured Outputs: JSON, Function Calling & Tool Use',
    description = 'Bridge natural-language Description to machine-readable data your Go backend can parse reliably, via JSON mode and function/tool calling.',
    difficulty = 3,
    estimated_minutes = 25,
    xp_reward = 55,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft')
  AND slug = 'structured-outputs';

UPDATE lessons
SET title = 'Product Discernment: Evaluating the Output',
    description = 'Learn to assess accuracy, coherence, and relevance in AI outputs, and detect hallucinations before they reach production.',
    difficulty = 3,
    estimated_minutes = 22,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai')
  AND slug = 'product-discernment';

UPDATE lessons
SET title = 'Process Discernment: Evaluating the Reasoning',
    description = 'Look past the final answer to audit the AI''s reasoning path itself, and catch flawed logic before it compounds into a bad decision.',
    difficulty = 3,
    estimated_minutes = 20,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai')
  AND slug = 'process-discernment';

UPDATE lessons
SET title = 'Performance Discernment: Evaluating the Interaction',
    description = 'Assess whether the AI''s communication style, confidence calibration, and tone actually fit your audience and context.',
    difficulty = 2,
    estimated_minutes = 18,
    xp_reward = 40,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai')
  AND slug = 'performance-discernment';

UPDATE lessons
SET title = 'Creation & Transparency: Choosing and Disclosing Responsibly',
    description = 'Apply Diligence to which AI systems you choose to use and how honestly you disclose their involvement in your work.',
    difficulty = 3,
    estimated_minutes = 22,
    xp_reward = 50,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai')
  AND slug = 'creation-transparency-diligence';

UPDATE lessons
SET title = 'Deployment Diligence: Verification & Accountability',
    description = 'Take ownership of AI outputs in production — testing, canary rollout, human-in-the-loop review, monitoring, and rollback.',
    difficulty = 3,
    estimated_minutes = 24,
    xp_reward = 55,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai')
  AND slug = 'deployment-diligence';

UPDATE lessons
SET title = 'Automation in Development: AI Coding Assistants',
    description = 'Use AI-powered dev tools effectively by applying Delegation to decide what to hand off, and Product Discernment to what comes back.',
    difficulty = 2,
    estimated_minutes = 20,
    xp_reward = 45,
    problem_references = ARRAY['error-message-for-code']::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow')
  AND slug = 'ai-automation-dev-tools';

UPDATE lessons
SET title = 'RAG in Production',
    description = 'Implement Retrieval-Augmented Generation to ground AI responses in your own data, reducing hallucination risk on domain-specific questions.',
    difficulty = 3,
    estimated_minutes = 25,
    xp_reward = 55,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow')
  AND slug = 'rag-in-production';

UPDATE lessons
SET title = 'Testing & Evaluation Frameworks',
    description = 'Build automated evaluation pipelines for AI outputs at scale, since AI behavior is probabilistic and can''t be tested the way deterministic code is.',
    difficulty = 3,
    estimated_minutes = 22,
    xp_reward = 50,
    problem_references = ARRAY['two-sum']::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow')
  AND slug = 'testing-evaluation';

UPDATE lessons
SET title = 'Agency: Multi-Step Autonomous Systems',
    description = 'Configure AI agents to plan, use tools, and act across multiple steps — the deepest application of the Agency mode, and the one requiring the strongest Diligence.',
    difficulty = 4,
    estimated_minutes = 25,
    xp_reward = 60,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow')
  AND slug = 'agency-and-agents';

UPDATE lessons
SET title = 'The Road Ahead: Open Questions, Regulation & Your Career',
    description = 'Understand the genuinely unresolved debates in AI (capability timelines, open vs. closed models), the current regulatory trajectory, and how to build a durable career at the intersection of AI and production engineering.',
    difficulty = 2,
    estimated_minutes = 20,
    xp_reward = 45,
    problem_references = ARRAY[]::TEXT[]
WHERE module_id = (SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow')
  AND slug = 'road-ahead';

-- ── 4. CLEAR CHILD ROWS (re-insert for parity) ───────────────────────

DELETE FROM lesson_dependencies
WHERE lesson_id IN (
  SELECT l.id FROM lessons l
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'ai-fluency');

DELETE FROM lesson_sections
WHERE lesson_id IN (
  SELECT l.id FROM lessons l
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'ai-fluency');

DELETE FROM projects
WHERE lesson_id IN (
  SELECT l.id FROM lessons l
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'ai-fluency');

-- ── 4. SECTIONS ───────────────────────────────────────────────────

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define **AI Fluency** using Anthropic's own published framework, and distinguish it from AI literacy
- Name and explain the **four competencies (the 4Ds)**: Delegation, Description, Discernment, and Diligence
- Understand why fluency — not just prompting skill — is the real differentiator for AI engineers
- Map each of the 4Ds to a concrete software engineering scenario$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Core Concept: AI Fluency',
$py$<div class="info">ℹ️ **Source:** This course is built on the AI Fluency Framework, developed by Anthropic together with Prof. Rick Dakan (Ringling College of Art and Design) and Prof. Joseph Feller (University College Cork), released under CC BY-NC-SA 4.0. We use its definitions directly rather than paraphrasing loosely, because precision here matters — the framework is deliberately narrow about what it does and doesn't claim.</div>

Anthropic defines **AI Fluency** as the ability to interact with AI systems in ways that are **effective, efficient, ethical, and safe**. Notice what that definition does *not* require: it doesn't require you to be a machine learning researcher, to know how to train a model, or to write flawless prompts on the first try. Fluency is a practice, not a credential.

Fluency is distinct from **literacy**. Literacy means you can operate the tool — you can type a prompt and get a response. Fluency means you know *whether* to use the tool at all, *how* to instruct it precisely, *how* to judge what comes back, and *who is accountable* for what happens next.

Think of it like Go programming:
- **Literacy** is knowing the syntax (`func`, `chan`, `interface{}`).
- **Fluency** is knowing when to reach for channels vs. mutexes, how to structure packages so a team can maintain them, and how to profile a production system under load.

## The 4D Framework, As Anthropic Defines It

| Competency | Anthropic's Definition | Go Engineer Analogy |
|------------|-------------------------|---------------------|
| **Delegation** | Setting goals and deciding whether, when, and how to engage with AI | Deciding which capabilities belong in a shared library vs. which stay as inline logic you own |
| **Description** | Effectively describing goals to prompt useful AI behaviors and outputs | Writing a precise, unambiguous API specification before anyone implements it |
| **Discernment** | Accurately assessing the usefulness of AI outputs and behaviors | Reviewing a pull request for correctness, edge cases, and hidden assumptions |
| **Diligence** | Taking responsibility for what we do with AI and how we do it | Owning the on-call pager for a service you shipped — the buck stops with you, not the tool |

<div class="tip">💡 **Pro Tip:** The 4Ds are described as *interconnected*, not sequential. You don't do Delegation once and move on — a bad Discernment finding often sends you back to redo Description, and a Diligence failure can mean you should never have Delegated the task in the first place.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Examples: The 4Ds in Action',
$py$## Example 1: AI-Assisted Code Review

You want an AI to review a Go pull request for concurrency issues.

- **Delegation:** You decide the AI should flag *candidate* race conditions and lock-ordering issues, but *you* decide whether the underlying business logic is correct — that judgment call stays human.
- **Description:** You write: *"Review this Go code for data races and potential deadlocks. Assume it runs in a high-throughput service with multiple goroutines sharing the `cache` struct."*
- **Discernment:** You check each flagged issue against the actual code — is it a real race, or is the AI pattern-matching on syntax that happens to be safe here?
- **Diligence:** You note in the PR description that AI-assisted review was used, and you still run the race detector (`go test -race`) yourself before merging — the AI's opinion doesn't replace verification.

## Example 2: AI for Documentation Generation

- **Delegation:** You assign the first draft of a new package's README to the AI.
- **Description:** *"Generate a README with installation, a runnable usage example, and a table of exported functions for this package."*
- **Discernment:** You check whether the usage example actually compiles against the current package API — AI-written examples frequently drift from real signatures.
- **Diligence:** You update your prompt template with the team's documentation style guide so future drafts need less correction — you're improving the system, not just the output.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Identify the 4Ds',
$py$Read the scenario and identify which of the 4Ds is being applied at each step.

**Scenario:** Sarah, an AI engineer, asks a model to generate test cases for a Go HTTP handler. She reviews the test cases, corrects two that would fail because of a routing nuance the AI didn't know about, and adds a note in the commit message that the tests were AI-drafted.

**Your Task:** Fill in the scaffold below.

```python
def identify_4ds():
    """
    Map each of Sarah's actions to the competency it demonstrates.
    Use Anthropic's definitions: Delegation (what/whether to engage AI),
    Description (how she instructed it), Discernment (how she judged
    the output), Diligence (how she took responsibility for it).
    """
    actions = {
        "Delegation": "",   # What did she choose to hand to the AI, and what did she keep?
        "Description": "",  # What can we infer about how she framed the request?
        "Discernment": "",  # What did she catch and correct?
        "Diligence": "",    # How did she take responsibility for the outcome?
    }
    return actions

if __name__ == "__main__":
    for d, action in identify_4ds().items():
        print(f"{d}: {action}")
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **AI Fluency**, per Anthropic's framework, means effective, efficient, ethical, and safe collaboration with AI — not raw prompting skill.
- The **4Ds** — Delegation, Description, Discernment, Diligence — are interconnected competencies, not a checklist you complete once.
- As a Go engineer you already practice versions of these competencies in code review and system design; this course applies them to AI collaboration specifically.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Trace the key milestones in AI history from 1956 to today
- Understand what an "AI Winter" was and why funding collapsed twice
- Identify the specific 2017 breakthrough that made today's LLMs possible
- Place current AI systems in accurate historical context, without hype$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Four Eras of AI',
$py$## Era 1: The Dawn (1956–1974)

The field was founded at the **Dartmouth Workshop** in 1956, where the term "Artificial Intelligence" was coined. Early researchers focused on symbolic reasoning and theorem proving — the assumption was that intelligence was fundamentally about manipulating symbols according to logical rules.

## Era 2: The Winters (1974–1990)

Symbolic AI couldn't handle the messiness of the real world, and government funding was cut sharply — the first "AI Winter." A second winter followed in the late 1980s when commercial "expert systems" failed to scale or generalize.

## Era 3: The Statistical Revival (1990–2012)

Statistical machine learning replaced hand-coded rules. IBM's Deep Blue beating Kasparov at chess in 1997 was a landmark, but it was **narrow intelligence** — a system built for one task, not a general reasoner.

## Era 4: The Deep Learning & Transformer Era (2012–Today)

In 2012, AlexNet showed that deep neural networks trained on GPUs dramatically outperformed prior methods on image recognition, kicking off the modern deep learning boom.

<div class="warning">⚠️ **The actual breakthrough for language:** In 2017, a team at Google (Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, and Polosukhin) published *"Attention Is All You Need,"* introducing the **Transformer** architecture. Its core innovation was **self-attention**: instead of processing a sentence word-by-word like a recurrent network, the Transformer lets every token attend to every other token in parallel, using multi-head attention and positional encoding to preserve word order. This made training dramatically more parallelizable — a genuine engineering unlock, not just a modeling curiosity. It's the architecture behind GPT, Claude, Gemini, and virtually every modern LLM.</div>

ChatGPT's late-2022 launch brought generative AI to a mainstream audience, but the underlying architecture had already existed for five years — the 2017 paper is the real hinge point in this history, not any one product launch.

<div class="example">📝 **Engineering Parallel:** The move from RNNs (sequential, one-token-at-a-time) to Transformers (parallel, attention-based) is like the move from a single-threaded request handler to a properly parallelized worker pool — the ceiling on throughput changes qualitatively, not just incrementally.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Milestones Every AI Engineer Should Know',
$py$| Year | Milestone | Why It Matters |
|------|-----------|-----------------|
| 1956 | Dartmouth Workshop | AI founded as a formal research discipline |
| 1997 | Deep Blue beats Kasparov | Proof that narrow, task-specific AI can exceed human performance in a constrained domain |
| 2012 | AlexNet wins ImageNet | Deep learning + GPU compute proven superior to hand-engineered features |
| 2017 | "Attention Is All You Need" published | The Transformer architecture — the technical foundation of every modern LLM |
| 2022 | ChatGPT launches | Generative AI reaches consumer scale; public awareness explodes |
| 2023–2026 | Multimodal & agentic systems | Models that see, reason over long contexts, use tools, and act semi-autonomously become standard products |$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Timeline Sort',
$py$```python
def sort_ai_milestones(milestones):
    """
    Given a list of strings in the format 'Year: Event',
    return a new list sorted by year ascending.
    """
    return sorted(milestones, key=lambda x: int(x.split(':')[0]))

test_milestones = [
    "2022: ChatGPT Launch",
    "1956: Dartmouth Workshop",
    "2017: Transformer Architecture Published",
    "1997: Deep Blue beats Kasparov",
]
print(sort_ai_milestones(test_milestones))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- AI has gone through real boom-and-bust cycles — funding and hype are not reliable signals of technical progress.
- The 2017 Transformer paper, not any single product launch, is the architectural breakthrough underlying today's LLMs.
- Understanding this history helps you separate durable technical progress from marketing cycles.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define Anthropic's three modes of AI interaction: **Automation**, **Augmentation**, and **Agency**
- Understand how these modes connect specifically to the **Delegation** competency
- Recognize which mode fits which engineering task, and why moving up the ladder increases both leverage and risk
- Apply the modes to a real production workflow$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Three Modes, As Anthropic Defines Them',
$py$<div class="info">ℹ️ **Source:** These three modes are part of the same AI Fluency Framework document that defines the 4Ds — they are the "Key Concepts" that make Delegation decisions concrete.</div>

## 1. Automation

**Definition:** AI executes specific tasks based on human instruction.

**Go Engineer Analogy:** A shell script or a deterministic batch job — you fully specify the sequence, and the machine executes it.

- **When to use:** Repetitive, well-defined, low-ambiguity tasks — formatting, boilerplate generation, log parsing.
- **Risk:** Automating something you haven't fully specified means the AI is silently filling gaps with guesses.

## 2. Augmentation

**Definition:** Humans and AI collaborate as thinking partners.

**Go Engineer Analogy:** Pair programming with a very fast, very well-read colleague who doesn't get tired — you guide, they draft; you critique, they revise.

- **When to use:** Architecture design, debugging, exploratory problem-solving, documentation.
- **Risk:** Over-reliance can quietly erode your own critical thinking if you stop pushing back.

## 3. Agency

**Definition:** Humans configure AI to independently perform future tasks on their behalf.

**Go Engineer Analogy:** Deploying a service with a configuration (env vars, feature flags, retry policy) that then runs unattended, handling requests without your direct supervision.

- **When to use:** Monitoring pipelines, scheduled workflows, agentic systems that need to act across many steps.
- **Risk:** The furthest mode from direct human oversight — requires the strongest guardrails, logging, and rollback plans.

<div class="tip">💡 **Pro Tip:** These modes aren't a maturity ladder you're supposed to climb for its own sake. A well-designed workflow often mixes all three: Agency watches a system for anomalies, Augmentation helps you design the fix, Automation applies the patch once you've approved it.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Examples Across the Spectrum',
$py$## Example 1: Bug-Fixing Workflow

- **Automation:** AI runs `go vet` and `go test` and surfaces failures — no judgment required, just execution.
- **Augmentation:** You and the AI discuss root cause together, weighing tradeoffs between two possible fixes.
- **Agency:** You configure an agent that watches production error logs and drafts (but does not merge) PRs for a known class of nil-pointer bugs — a human still approves the merge.

## Example 2: Documentation Pipeline

- **Automation:** AI extracts every exported function signature and generates stub doc comments.
- **Augmentation:** You and the AI co-write the narrative introduction together, iterating on tone.
- **Agency:** An agent monitors the main branch and opens a PR updating the docs site whenever public APIs change — you review before merge.

<div class="warning">⚠️ **Safety Note:** Agency is the highest-leverage and highest-risk mode. Start new workflows in Automation, graduate to Augmentation once you trust the interaction, and only move to Agency with explicit evaluation criteria, logging, and a rollback plan in place.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Mode Classification',
$py$```python
def classify_mode(scenario_description):
    """
    Return 'Automation', 'Augmentation', or 'Agency'.
    Hint: look for language like 'without human intervention' (Agency),
    'jointly' / 'iterating' (Augmentation), or a single deterministic
    task with no judgment involved (Automation).
    """
    pass

print(classify_mode("The AI generates a weekly report and emails it to the team without human review."))
print(classify_mode("The AI and engineer jointly design a new API contract, iterating on the design together."))
print(classify_mode("The AI reformats all source files to match the team's style guide."))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Automation** = execute a fully specified task.
- **Augmentation** = collaborate as a thinking partner.
- **Agency** = configure independent, ongoing action.
- Choosing a mode is a Delegation decision — the earlier competency this lesson connects back to.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define and differentiate ML, DL, NLP, CV, and GenAI
- Understand how these fields overlap as nested categories, not silos
- Identify where a Go backend engineer typically sits relative to these layers
- Classify a real project description into the right subfield$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The AI Family Tree',
$py$Think of the AI ecosystem as nested packages, similar to a Go module hierarchy.

## 1. Machine Learning (ML) — The Root Package

**Definition:** Systems that learn patterns from data rather than following explicitly hand-written rules.

**Subcategories:** Supervised learning (labeled data — e.g. spam detection), unsupervised learning (unlabeled data — e.g. customer segmentation), reinforcement learning (learning via reward signals — e.g. game-playing agents).

## 2. Deep Learning (DL) — A Specialized Subpackage

**Definition:** ML using neural networks with multiple layers, capable of learning directly from raw, unstructured data (pixels, audio, text) without manual feature engineering.

## 3. Natural Language Processing (NLP) — An Application Domain

**Definition:** AI for understanding and generating human language — translation, sentiment analysis, summarization, question-answering. NLP predates deep learning but is now almost entirely built on it.

## 4. Computer Vision (CV) — Another Application Domain

**Definition:** AI for interpreting visual data — object detection, facial recognition, medical imaging, autonomous driving.

## 5. Generative AI (GenAI) — A Capability, Not a Separate Field

**Definition:** Deep learning models that *create* new content (text, images, code, audio) rather than only classifying or analyzing it. Traditional ML *discriminates* (is this a cat or a dog?); GenAI *generates* (draw a cat). Modern LLMs like Claude are GenAI systems specialized for text and, increasingly, other modalities.

<div class="info">ℹ️ **The relationship:** GenAI is a capability built on Deep Learning, which is a specialized approach within Machine Learning. NLP and CV are *applications* that today are almost entirely implemented using DL and GenAI techniques — they aren't separate technology stacks anymore, they're use cases.</div>

<div class="example">📝 **Go Analogy:** `ml/` is the root package. `dl/` is an optimized subpackage inside it. `nlp/` and `cv/` are interfaces defined against that subpackage for specific domains. `genai/` isn't a sibling package — it's a capability that `nlp/` and `cv/` both now import.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Ecosystem in Action',
$py$| Field | Real-World Application | Typical Technique |
|-------|--------------------------|---------------------|
| ML | Credit card fraud scoring | Gradient-boosted trees / random forests |
| DL | Autonomous vehicle perception | Convolutional neural networks (CNNs) |
| NLP | Customer support chat routing | Transformer-based classifiers |
| CV | Medical imaging diagnostics | Deep CNNs / vision transformers |
| GenAI | AI pair-programming assistants | Transformer-based LLMs |

<div class="tip">💡 **Insight for Go Engineers:** Your backend services usually sit *above* these layers — you call a model via REST or gRPC, orchestrate the pipeline, and manage data flow. You don't need to implement backpropagation to be fluent; you need to understand what's happening beneath the API you're calling well enough to reason about its failure modes.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Ecosystem Mapping',
$py$```python
def map_to_ai_field(description):
    """
    Return one of: 'ML', 'DL', 'NLP', 'CV', 'GenAI'.
    Build simple keyword heuristics — this mirrors the kind of
    lightweight routing logic you'd write in a real triage system.
    """
    pass

print(map_to_ai_field("A system that writes personalized short stories based on a user's mood."))
print(map_to_ai_field("A system that flags faulty parts on an assembly line from camera footage."))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **ML** is the broadest category; **DL** is the specialized technique behind most modern progress.
- **NLP** and **CV** are application domains, now largely implemented via DL and GenAI.
- **GenAI** is a capability, not a rival field — it's what happens when DL is applied to content creation.
- As an AI engineer you'll interact primarily with GenAI (LLMs) and, secondarily, NLP tooling.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Analyze real-world AI deployments across several industries
- Identify which AI Fluency competency is under the most strain in each domain
- Understand the engineering integration pattern that recurs across industries
- Avoid treating AI as a black box by breaking deployments into concrete engineering components$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'AI Across Sectors',
$py$## Healthcare: Diagnosis Support

- **Technique:** Deep learning (CNNs) for medical imaging, NLP for clinical notes.
- **Reality check:** AI-assisted screening tools have shown accuracy competitive with radiologists on specific, narrow tasks (e.g. certain mammography screens) under controlled conditions — this is not the same claim as "replaces radiologists," and results vary heavily by dataset and deployment.
- **Fluency takeaway:** **Discernment** carries the highest stakes here — a false negative can cost a life, so human-in-the-loop review is standard practice, not optional.

## Finance: Fraud Detection

- **Technique:** Supervised ML (anomaly/classification models) running in real time on transaction streams.
- **Fluency takeaway:** **Diligence** is paramount — regulatory compliance (fair lending, data protection) and bias auditing have to be engineered in from the start, not bolted on afterward.

## Creative Industries: Content Generation

- **Technique:** Generative AI (LLMs, diffusion models) for drafting, storyboarding, and ideation.
- **Fluency takeaway:** **Description** is the bottleneck — output quality tracks prompt quality closely, and vague instructions produce generic results.

## Software Engineering: AI-Assisted Development

- **Technique:** LLMs for code completion, review, and documentation.
- **Fluency takeaway:** **Delegation** is central — deciding which coding tasks to hand off (boilerplate, tests) versus which require your own judgment (architecture, security-sensitive logic).

<div class="warning">⚠️ **Common Pitfall:** Treating AI as a magic box that either "works" or "doesn't" skips the actual engineering work. Fluent teams treat an AI call as a subsystem with its own latency, cost, and reliability characteristics — the same discipline you'd apply to any third-party dependency.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Case Study: Fraud Detection Integration',
$py$**The Problem:** Fraud patterns evolve constantly; hardcoded rule engines can't keep pace.

**The AI Solution:** A model trained on historical transaction data flags anomalies in real time.

**The Engineering Integration (where you come in):**
1. A Go microservice receives transaction events from a message queue.
2. It calls the model-serving layer over gRPC and receives a fraud-risk score.
3. The Go service applies business rules on top of that score, logs the decision path for auditability, and triggers a manual-review queue for borderline cases.

<div class="tip">💡 **Your Go Advantage:** You already know how to build the reliable, high-throughput infrastructure that serves a model in production. Fluency means you can now have an informed conversation with data scientists about feature drift, latency budgets, and what "good enough" confidence means for this specific decision.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Real-World Case Analysis',
$py$```python
def evaluate_ai_risks(industry, ai_technique, stakes):
    """
    Return a dict with qualitative risk levels ('low'/'medium'/'high')
    for Bias, Hallucination, and Security, plus one concrete mitigation.
    Avoid inventing precise numeric scores you can't justify — qualitative
    levels with a stated rationale are more honest than fake precision.
    """
    pass

print(evaluate_ai_risks("Healthcare", "GenAI summarization of clinical notes", "High"))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- AI's real-world impact varies by domain, and so does which of the 4Ds matters most: Discernment in healthcare, Diligence in finance, Description in creative work, Delegation in software engineering.
- Every deployment you'll encounter reduces to a concrete engineering pattern: a service calling a model, with latency, cost, and audit logging around it.
- Resist treating AI capability claims as universal — accuracy figures are almost always task- and dataset-specific.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Distinguish structured, unstructured, and semi-structured data
- Explain the purpose of training, validation, and test splits
- Understand why data leakage produces a false sense of model quality
- See where Go-based data pipelines fit relative to Python-based model training$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Data Journey',
$py$AI models are statistical systems: their ceiling is set by the data they're trained on.

## Types of Data
- **Structured:** Tabular, relational data (SQL databases) — the kind your Go ORMs already work with.
- **Unstructured:** Text, images, audio, video — the primary substrate for LLMs and computer vision.
- **Semi-structured:** JSON, XML, logs — common in Go microservices and a frequent source of real-world training data.

## The Three Splits

| Split | Purpose | Go Analogy |
|-------|---------|------------|
| **Training** | The model learns patterns from this data (typically 70–80%) | Writing the initial implementation |
| **Validation** | Tunes hyperparameters and catches overfitting during development (typically 10–15%) | Running your internal test suite and linters |
| **Test** | Final, one-time evaluation on data the model has never seen | A production canary release |

<div class="warning">⚠️ **Critical Discernment:** If test data leaks into training — even accidentally, through duplicated records or overlapping time windows — your evaluation metrics become meaningless. It's the ML equivalent of a test suite that only re-checks the exact inputs you already debugged by hand.</div>

<div class="example">📝 **Real-World:** ImageNet, the dataset behind the 2012 deep learning breakthrough, contains roughly 14 million hand-labeled images across thousands of categories. Your API might handle millions of requests a day, but those are transactions, not labels — supervised learning specifically needs data annotated with the answer you want the model to learn.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Data Pipeline in Go',
$py$Models are usually trained in Python, but the data pipeline feeding them frequently runs in Go for throughput and reliability.

```go
// A typical Go data pipeline stage
type DataProcessor interface {
    Process(ctx context.Context, raw []byte) (*TrainingSample, error)
}

type Cleaner struct {
    // Strips PII, normalizes text encoding, validates schema
}

func (c *Cleaner) Process(ctx context.Context, raw []byte) (*TrainingSample, error) {
    // 1. Decode the incoming record
    // 2. Sanitize and validate fields
    // 3. Emit a TrainingSample the Python training job can consume
    return nil, nil
}
```

Go handles the scale and reliability of getting clean data to disk or object storage; Python (via pandas, PyTorch, etc.) handles the model training itself. This is a genuinely common production split, not a hypothetical.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Detecting Data Leakage',
$py$```python
import random

def detect_data_leakage(training_ids, test_ids):
    """
    Return the set of IDs present in both splits.
    A non-empty result means leakage.
    """
    return set(training_ids) & set(test_ids)

data_ids = list(range(100))
random.seed(42)
training_ids = random.sample(data_ids, 80)
test_ids = [x for x in data_ids if x not in training_ids]

print(detect_data_leakage(training_ids, test_ids))  # Should print an empty set
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Model quality is bounded by data quality — there's no substitute for clean, representative, correctly labeled data.
- Strict separation of training, validation, and test data is non-negotiable; leakage invalidates your evaluation.
- Go is a strong fit for the data pipeline layer feeding into Python-based model training.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Explain the paradigm shift from traditional programming to machine learning
- Distinguish supervised, unsupervised, and reinforcement learning
- Understand what a neuron, a weight, and an activation function actually compute
- Implement a minimal working perceptron$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Paradigm Shift',
$py$Traditional programming:

`Rules + Data → Answer`

You write the `if`/`else` logic explicitly; the rules are yours.

Machine learning:

`Data + Answers → Rules`

The model infers the mapping from input to output by adjusting internal parameters until its predictions match the labeled examples closely enough.

## Types of Learning

| Type | Input | Goal | Example |
|------|-------|------|---------|
| **Supervised** | Labeled pairs (X, y) | Predict y for new X | Spam detection |
| **Unsupervised** | Unlabeled data (X) | Find hidden structure | Customer segmentation |
| **Reinforcement** | Agent + environment | Learn a policy that maximizes reward | Game-playing agents |

## Neural Network Intuition

A neural network layer is, mechanically, a matrix multiplication followed by a non-linear function.

- **Weights:** The numbers the network adjusts during training — its "learned knowledge."
- **Bias:** An offset added after the weighted sum, giving the model more flexibility.
- **Activation function:** A non-linear function (e.g., ReLU: `max(0, x)`) applied after the weighted sum. Without it, stacking any number of layers collapses mathematically into a single linear transformation — the activation function is what lets the network represent curved, complex decision boundaries at all.

<div class="tip">💡 **Go Engineer's Bridge:** A single layer is close to a pure function: `func Layer(input []float64, weights [][]float64, bias []float64) []float64` — takes a vector, multiplies by a weight matrix, adds bias, applies an activation. No side effects, fully deterministic given fixed weights.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'A Single Neuron in Code',
$py$```python
import math

class Neuron:
    def __init__(self, weights, bias):
        self.weights = weights
        self.bias = bias

    def sigmoid(self, x):
        return 1 / (1 + math.exp(-x))

    def forward(self, inputs):
        total = sum(w * i for w, i in zip(self.weights, inputs)) + self.bias
        return self.sigmoid(total)

neuron = Neuron([0.5, -0.3, 0.8], 0.1)
output = neuron.forward([1.0, 2.0, 3.0])
print(f"Neuron output: {output:.4f}")
```

This single neuron is the building block. A modern LLM stacks billions of parameters like this across many layers — conceptually the same operation, at enormous scale.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Build a Simple Perceptron',
$py$```python
class Perceptron:
    def __init__(self, learning_rate=0.1, epochs=10):
        self.weights = [0.0, 0.0]
        self.bias = 0.0
        self.lr = learning_rate
        self.epochs = epochs

    def activation(self, x):
        return 1 if x >= 0 else 0

    def predict(self, inputs):
        # TODO: weighted sum + bias, then activation
        pass

    def train(self, X, y):
        for _ in range(self.epochs):
            for inputs, target in zip(X, y):
                prediction = self.predict(inputs)
                error = target - prediction
                # TODO: update self.weights and self.bias using error and self.lr
        return self

X = [[0, 0], [0, 1], [1, 0], [1, 1]]
y = [0, 0, 0, 1]  # logical AND

p = Perceptron()
p.train(X, y)
print(p.predict([1, 1]))  # Should be 1
print(p.predict([0, 1]))  # Should be 0
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- ML shifts the burden from hand-writing rules to learning them from labeled examples.
- Supervised, unsupervised, and reinforcement learning are the three foundational paradigms.
- A neural network layer is matrix multiplication plus a non-linearity — the complexity comes from scale, not from any single operation being mysterious.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Explain why the Transformer replaced recurrent networks for language
- Define **parameters**, **context window**, and **knowledge cutoff** precisely
- Understand what scaling laws describe — and their limits as a predictive tool
- Reason about the tradeoff between model size and task-specific fine-tuning$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Transformer, Concretely',
$py$Before Transformers, recurrent neural networks (RNNs) processed text one token at a time, in sequence — slow to train and prone to losing context over long passages.

**Vaswani et al.'s 2017 innovation** (*"Attention Is All You Need"*) replaced recurrence entirely with **self-attention**: every token looks at every other token in the sequence simultaneously and learns how much "attention" to pay to each. The paper combined this with **multi-head attention** (multiple attention patterns learned in parallel) and **positional encoding** (since attention alone has no inherent sense of word order).

```python
# Simplified attention (intuition only — real implementations use
# learned Q/K/V projection matrices, not raw tokens)
def attention(query, keys, values):
    scores = dot_product(query, keys) / sqrt(dimension)
    weights = softmax(scores)
    return weighted_sum(weights, values)
```

## Key Technical Terms

| Term | Definition | Go Analogy |
|------|------------|------------|
| **Parameters** | The learned numerical weights inside the model | The values in your `config.yaml`, but numbering in the billions |
| **Context window** | The maximum number of tokens the model can process in a single request | The max size of an `http.Request` body your server accepts |
| **Knowledge cutoff** | The date after which the model has no training data, and therefore no first-hand knowledge of events | Querying a database snapshot taken on a specific date |
| **Scaling laws** | The empirically observed relationship between model size, data, compute, and performance | An observed trend line, not a guarantee for any specific model |

<div class="warning">⚠️ **Discernment check:** Bigger is not automatically better for your use case. A smaller model fine-tuned on domain-specific data frequently outperforms a much larger general-purpose model on a narrow task, at a fraction of the latency and cost. Choosing model size is an engineering tradeoff, not a status symbol.</div>

<div class="info">ℹ️ **Emergent capabilities — with a caveat:** As models scale, they sometimes exhibit capabilities not directly optimized for during training (e.g., basic arithmetic reasoning, code generation). This is a genuinely active and somewhat unsettled area of research — treat strong claims about "emergence" with the same skepticism you'd apply to any early-stage empirical finding, and don't assume a capability will keep improving smoothly just because scale did.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Context Window Budgeting',
$py$In production, context window is a real engineering constraint you budget against — like memory or connection-pool limits.

```python
def estimate_tokens(text):
    """Rough rule of thumb: ~4 characters per token in English text.
    Real tokenization is model-specific and this is only an estimate —
    always validate against your provider's actual tokenizer before
    shipping a hard limit."""
    return len(text) // 4

def fits_in_context(text, max_tokens):
    return estimate_tokens(text) <= max_tokens

long_text = "The quick brown fox jumps over the lazy dog. " * 1000
print(fits_in_context(long_text, 128_000))
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Context Window Calculator',
$py$```python
def estimate_tokens(text):
    """Rough estimate: 1 token ≈ 4 characters in English."""
    # TODO: implement
    pass

def can_fit_in_context(text, max_tokens=128000):
    """Return True if the text fits within max_tokens."""
    return estimate_tokens(text) <= max_tokens

long_text = "The quick brown fox jumps over the lazy dog. " * 1000
print(can_fit_in_context(long_text, 128000))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Self-attention** is the specific mechanism that made Transformers both more capable and more parallelizable than RNNs.
- **Parameters**, **context window**, and **knowledge cutoff** are distinct, precise technical terms — don't conflate them.
- **Scaling laws** describe an empirical trend, not a law of nature — treat capability claims from scale alone with appropriate skepticism.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Distinguish **pre-training**, **fine-tuning**, and **inference**
- Understand why RLHF (Reinforcement Learning from Human Feedback) is applied during fine-tuning
- Understand the relative cost and time profile of each stage
- Recognize inference as the stage where backend engineers do most of their work$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Three Stages',
$py$## 1. Pre-training (The Foundation)
- **What:** Training a large model on massive volumes of text (and increasingly other modalities).
- **Goal:** Learn language structure, world knowledge, and general reasoning patterns.
- **Who does it:** A small number of well-resourced labs — pre-training runs for frontier models are a major capital expense, typically requiring large, dedicated compute clusters.
- **Output:** A "base" model — often capable but not yet reliably helpful, safe, or instruction-following.

## 2. Fine-tuning (The Specialization)
- **Supervised fine-tuning (SFT):** Training on curated instruction/response pairs so the model reliably follows instructions.
- **RLHF:** Human raters rank candidate responses; the model is further trained to prefer outputs humans judge as more helpful and safer.
- **Who does it:** A much broader set of organizations — SFT and lighter-weight fine-tuning are accessible at far lower cost than pre-training.
- **Output:** An assistant-style model tuned for helpfulness and safety.

## 3. Inference (The Serving)
- **What:** Using the trained model to generate responses to new inputs in production.
- **Where:** This is where you, as a backend engineer, spend most of your time — managing latency, throughput, retries, and cost per request.

<div class="tip">💡 **Go Engineer's Bridge:** Pre-training is like the language runtime and standard library being built. Fine-tuning is your team building an internal framework on top of it. Inference is running your application in production — the stage you're actually responsible for operating.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Where the Cost and Ownership Sit',
$py$| Stage | Relative Cost | Relative Time | Typical Owner |
|-------|-----------------|-----------------|------------------|
| Pre-training | Very high (major capital expense) | Weeks to months | Frontier AI labs |
| Fine-tuning | Low to moderate | Hours to days | ML/applied AI teams |
| Inference | Low per request, scales with volume | Milliseconds per request | **Backend/infra engineers — you** |

<div class="warning">⚠️ **Key Insight:** Because inference cost scales linearly with usage, small per-request savings (caching, batching, choosing an appropriately sized model) compound significantly at production scale — this is usually where an AI engineer has the most day-to-day leverage.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Lifecycle Matching',
$py$```python
def map_to_stage(task_description):
    """Return 'pretraining', 'finetuning', or 'inference'."""
    # TODO: implement keyword-based logic
    pass

print(map_to_stage("Updating model weights based on human feedback rankings"))   # finetuning
print(map_to_stage("Deploying the model to handle 10,000 requests per second"))  # inference
print(map_to_stage("Training on a massive general-purpose text corpus from scratch"))  # pretraining
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Pre-training** builds the foundation and is dominated by a small number of large labs.
- **Fine-tuning** specializes the model and is far more broadly accessible.
- **Inference** is where most AI engineers, including you, spend their time — optimizing latency, cost, and reliability.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Control output randomness using **temperature**
- Understand **top-p** (nucleus sampling) and how it differs from temperature
- Use **system prompts** to set the model's overall behavior for a session
- Choose appropriate settings for a given production use case$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Knobs and Levers',
$py$## Temperature
Controls randomness in token selection. Lower values make output more deterministic and focused; higher values make it more varied and, past a point, less coherent.

- **Near 0:** Consistently picks the highest-probability next token — good for factual, repeatable tasks.
- **Moderate (around 1.0, provider-dependent default):** A balance between focus and variety.
- **High:** Increasingly random selection — can produce creative or surprising output, but coherence degrades if pushed too far.

**Analogy:** Think of a glass of water. Low temperature is ice — stable and predictable. High temperature is boiling water — energetic, but harder to control.

## Top-P (Nucleus Sampling)
Restricts token selection to the smallest set of tokens whose cumulative probability exceeds `P`.

- **P = 1.0:** All tokens considered.
- **P = 0.9:** Only tokens making up the top 90% of probability mass are eligible.
- **P = 0.5:** A much narrower, more conservative selection.

Temperature and top-p are often used together, and the exact interaction and default values differ by provider — always check current documentation for the specific model you're calling rather than assuming settings transfer identically across providers.

## System Prompts
Set the overarching context, tone, and constraints for an entire conversation or session.

```
You are a senior Go engineer reviewing a pull request. Be concise,
focus on concurrency correctness, and propose specific code changes
rather than general advice.
```

<div class="tip">💡 **Pro Tip:** For production APIs where you need consistent, repeatable output — data extraction, classification, structured generation — use low temperature. Reserve higher temperature for genuinely creative tasks where variety is the point.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Temperature, Simulated',
$py$```python
import math

def softmax_with_temperature(logits, temperature):
    """
    Convert raw scores to probabilities, scaled by temperature.
    Higher temperature flattens the distribution (more randomness);
    temperature near 0 approaches a greedy, deterministic choice.
    """
    if temperature <= 1e-6:
        best = max(range(len(logits)), key=lambda i: logits[i])
        return [1.0 if i == best else 0.0 for i in range(len(logits))]

    scaled = [l / temperature for l in logits]
    m = max(scaled)
    exps = [math.exp(l - m) for l in scaled]
    total = sum(exps)
    return [e / total for e in exps]

logits = [2.0, 1.0, 0.5]
print("T=0.5:", softmax_with_temperature(logits, 0.5))
print("T=1.0:", softmax_with_temperature(logits, 1.0))
print("T=2.0:", softmax_with_temperature(logits, 2.0))
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Recommend Settings by Intent',
$py$```python
def recommend_settings(intent):
    """
    Return (temperature, top_p) as a tuple.
    Guideline (not a hard rule — verify against your provider's docs):
    - factual/deterministic tasks: low temperature, high top_p
    - creative tasks: higher temperature
    - code generation: low-to-moderate temperature, high top_p
    """
    # TODO: implement mapping for at least: 'math', 'creative writing',
    # 'code generation', 'brainstorming'
    pass
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Temperature** controls randomness; low = consistent, high = varied and eventually less coherent.
- **Top-p** restricts the candidate token pool by cumulative probability — a complementary, not identical, control.
- **System prompts** set behavior for the whole session.
- Defaults and interactions between these settings vary by provider — check current docs before shipping.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define the **Product** dimension of Description
- Apply two of Anthropic's six prompting techniques — **giving context** and **specifying constraints** — to define output precisely
- Tailor output to a specific audience
- Write a prompt that produces exactly the artifact you need on the first attempt$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Art of Defining the Outcome',
$py$<div class="info">ℹ️ This lesson is a deep dive into **Description**, which Anthropic's framework defines as *effectively describing goals to prompt useful AI behaviors and outputs*. "Product" is the dimension of Description focused on defining *what* you want.</div>

## The 4 Dimensions of Product Description
1. **Format:** JSON, Markdown, CSV, plain text, or Go source code.
2. **Structure:** Headings, bullet points, numbered steps, or paragraphs.
3. **Length:** Word count, line count, or number of items.
4. **Audience & style:** Beginner vs. expert, technical vs. executive, formal vs. casual.

Two of Anthropic's six core prompting techniques map directly onto this dimension:

- **Give context:** Be specific about what you want, why you want it, and who it's for — vague context forces the model to guess your intent.
- **Specify constraints:** State format, length, and style requirements explicitly rather than hoping the model infers them.

**Go Engineer Example:**
```
Generate a README.md for a Go package named 'retry'.
Format: Markdown.
Structure: Title, Description, Installation (go get), Usage
(runnable code example), API Reference, Contributing.
Audience: Go developers with intermediate experience.
Style: Clear, concise, conversational.
```

<div class="warning">⚠️ **Common Mistake:** A vague product description forces the AI to guess, and it will guess plausibly rather than admit uncertainty. If you don't know exactly what you want, expect to iterate — that's normal, but naming the dimensions above up front reduces the number of iterations you'll need.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Before vs. After Product Description',
$py$## Before (Vague)
> "Write a function to parse CSV in Go."

**Result:** Could be a 5-line snippet or a 50-line library — you genuinely can't predict which.

## After (Well-Specified)
> "Write a Go function `ParseCSV(filename string) ([][]string, error)` that reads a CSV file and returns rows and columns. It must handle quoted fields containing commas. Add a second function `ParseCSVWithConfig` that accepts a custom delimiter. Output a single commented code block including imports. Audience: intermediate Go developers. Style: idiomatic Go with explicit error handling."

**Result:** You get the exact package you need, in the style you specified, with far fewer round trips.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Write a Product Description',
$py$```python
def generate_product_prompt(goal, output_format, audience, style):
    """Assemble a prompt string that clearly defines the Product."""
    return f"""Goal: {goal}
Output Format: {output_format}
Audience: {audience}
Style: {style}

Please produce the output exactly as described."""

print(generate_product_prompt(
    goal="Generate test cases for a Go API endpoint",
    output_format="Markdown table with columns: Test Case, Input, Expected, Pass/Fail",
    audience="QA engineers",
    style="Detailed and exhaustive",
))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Product Description** defines the *what*: format, structure, length, audience, style.
- **Giving context** and **specifying constraints** are two of Anthropic's six core prompting techniques, and both live inside Product Description.
- Precision here reduces iteration — an unspecified dimension is a dimension the model has to guess.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define the **Process** dimension of Description
- Apply **breaking complex tasks into steps** and **asking the AI to think first** — two more of Anthropic's six core prompting techniques
- Use chain-of-thought style prompting to make reasoning auditable
- Recognize when guiding the process matters as much as specifying the output$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Guiding the AI''s Internal Workflow',
$py$<div class="info">ℹ️ **Process Description** covers *how* the AI approaches your request — the reasoning path it takes to get to an answer, not just the shape of the final output.</div>

## Breaking Complex Tasks Into Steps
Instead of asking for a finished artifact in one leap, you decompose the task and let the model work through it piece by piece.

**Without decomposition:**
> "Design a REST API for a todo list."

**With decomposition:**
> "Design a REST API for a todo list.
> Step 1: List the resources and their relationships.
> Step 2: Define CRUD operations for each resource.
> Step 3: Specify request/response JSON schemas.
> Step 4: Provide a Go implementation skeleton."

## Asking the AI to Think First
Asking a model to reason through a problem before committing to an answer tends to surface intermediate steps you can inspect and, if needed, correct — rather than a single opaque final answer.

**Without thinking first:**
> "What is 137 × 53?"
> **Answer:** 7261 — correct, but with no auditable reasoning if it were wrong.

**With thinking first:**
> "What is 137 × 53? Show your calculation steps, then give the final answer."
> **Answer:** `137 × 50 = 6850`, `137 × 3 = 411`, `6850 + 411 = 7261`. Final answer: 7261.

<div class="tip">💡 **When to use:** Process Description matters most for debugging, architecture design, multi-step math, and any task where an incorrect intermediate step would be worth catching before you rely on the final answer.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Process Description in API Design',
$py$**Prompt (process-focused):**
"Design a REST API for a todo list. Think through each step before writing code:
Step 1 — list resources and relationships.
Step 2 — define CRUD operations per resource.
Step 3 — specify JSON schemas.
Step 4 — provide a Go Gin implementation skeleton."

**Why it works:** The model reasons through the design before jumping to code, which both improves the final result and gives you a visible chain of decisions to check against your own judgment — that visibility is the actual point, not just a nicer-looking answer.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Process Description Writer',
$py$```python
def process_guide(task, steps):
    """
    Generate a prompt that walks the AI through explicit reasoning steps.
    steps: list of strings, one per reasoning step.
    """
    guide = f"Task: {task}\nFollow these steps in order:\n"
    for i, step in enumerate(steps, 1):
        guide += f"Step {i}: {step}\n"
    guide += "Show your reasoning for each step before giving the final answer."
    return guide

task = "Refactor a Go codebase to use context.Context for request timeouts"
steps = [
    "Identify all external calls (DB, HTTP, gRPC) that currently lack a timeout",
    "Propagate context from the request-entry handler downward",
    "Replace blocking calls with a select on ctx.Done()",
    "Add cleanup logic for the cancellation path",
]
print(process_guide(task, steps))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Process Description** guides *how* the AI reasons, not just what it produces.
- **Breaking tasks into steps** and **asking the AI to think first** are two of Anthropic's six core prompting techniques, both aimed at making reasoning auditable.
- Use this deliberately when the reasoning path is as important as the final answer.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define the **Performance** dimension of Description
- Apply **defining role and tone**, the fifth of Anthropic's six core prompting techniques
- Understand why effective prompting is iterative, not one-shot
- Design a system prompt that sets a consistent collaboration style$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Setting the Collaboration Vibe',
$py$<div class="info">ℹ️ **Performance Description** covers the AI's behavior *during* your collaboration — whether it's concise or detailed, supportive or challenging, formal or casual.</div>

## Defining Role and Tone
One of Anthropic's six core prompting techniques is to explicitly tell the model what role to occupy and how to communicate.

> "Adopt the tone of a senior Go engineer mentoring a junior developer: direct but encouraging. Prioritize feedback — start with correctness issues, then performance, then style. Limit yourself to the 5 most important points."

## Performance Dimensions

| Dimension | Lower setting | Higher setting |
|-----------|-----------------|-------------------|
| **Detail level** | Concise, bullet points | Verbose, exhaustive |
| **Tone** | Supportive, encouraging | Direct, critical |
| **Formality** | Casual | Formal, authoritative |
| **Interactivity** | Single answer, no follow-up | Asks clarifying questions before answering |

<div class="tip">💡 **The second mindset shift (beyond the six techniques):** Effective prompting is inherently iterative. Anthropic's own materials emphasize this — you shouldn't expect a perfect result from a single prompt on a genuinely ambiguous task. Treat the first response as a draft to refine, not a failure if it isn't exactly right.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Performance Description in Action',
$py$## Scenario: Explaining Goroutines to Different Audiences

**Without Performance Description**, an AI explaining goroutines to anyone defaults to a fairly technical register: *"Goroutines are lightweight threads managed by the Go runtime, multiplexed onto OS threads, communicating via channels."*

**With Performance Description** targeting a non-technical stakeholder:
> "Explain goroutines to a non-technical executive. Avoid jargon. Use a business-relevant analogy. Keep it to 2-3 sentences."

**Result:** *"Goroutines let our software handle many tasks at once efficiently — like a kitchen that can prep several dishes in parallel instead of one at a time. That's part of why our services stay fast under heavy load."*$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Craft a Performance Prompt',
$py$```python
def system_prompt_for_performance(tone, detail_level, style):
    """
    tone: 'critical' | 'supportive' | 'neutral'
    detail_level: 'concise' | 'balanced' | 'exhaustive'
    style: 'formal' | 'casual' | 'friendly'
    Return a system prompt string that sets these three dimensions explicitly.
    """
    # TODO: construct and return the prompt
    pass
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Performance Description** controls the AI's interpersonal behavior — tone, detail, formality, interactivity.
- **Defining role and tone** is one of Anthropic's six core prompting techniques.
- Treat prompting as iterative by design — refining a first draft is normal practice, not a sign you did it wrong.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **showing examples** (few-shot prompting), the last of Anthropic's six core techniques
- Combine Product, Process, and Performance Description in a single, high-stakes prompt
- Recognize how examples teach format and style faster than lengthy instructions
- Recognize a well-formed prompt when reviewing someone else's$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Showing Examples: The Sixth Technique',
$py$The sixth of Anthropic's core prompting techniques is **showing examples**: demonstrating the kind of output you want, rather than only describing it in the abstract. This is often the fastest way to communicate format and style — a well-chosen example frequently does more work than several sentences of instruction.

**Example (2-shot):**
```
Translate English to French, matching this style:

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous ?"

English: "I am fine, thank you."
French: "Je vais bien, merci."

English: "Where is the library?"
French: [continue in the same style]
```

## Combining All Six Techniques
For high-stakes prompts, combine context, examples, constraints, decomposition, thinking-first, and role/tone deliberately rather than picking one at random:

> **Context + Role:** "You are a senior Go engineer specializing in performance-sensitive services."
> **Examples:** Two short snippets showing the coding style you want matched.
> **Task + Constraints:** "Write `Checksum(data []byte) string` returning a SHA-256 hex digest. Must handle a `nil` slice safely. Max 10 lines. Use the standard library's `crypto/sha256` package."
> **Process:** "Think through the edge cases first, then write the final code."

<div class="warning">⚠️ **Discipline, not decoration:** More techniques stacked together isn't automatically better — each one should be doing real work. A prompt with five unnecessary constraints is harder to satisfy than one with the two that actually matter.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Putting It Together: A Production-Grade Prompt',
$py$**Task:** Generate a Go function to compute a file checksum.

> **Role:** You are a Go performance specialist.
>
> **Examples:**
> `func Sum(a, b int) int { return a + b }` — simple, zero allocations.
> `func Concat(s []string) string { var b strings.Builder; for _, v := range s { b.WriteString(v) }; return b.String() }` — efficient builder pattern, avoids repeated allocation.
>
> **Task:** Write `Checksum(data []byte) string` returning a SHA-256 hex digest.
> **Constraints:** Handle `nil` safely. Use `crypto/sha256`. Max 10 lines. One comment explaining the performance characteristics.
> **Process:** Consider the nil-input edge case before writing the final code.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Multi-Technique Prompt Assembler',
$py$```python
def assemble_advanced_prompt(role, examples, task, constraints):
    prompt = f"Role: {role}\n\n"
    if examples:
        prompt += "Examples:\n" + "\n".join(examples) + "\n\n"
    prompt += f"Task: {task}\n\nConstraints: {constraints}"
    return prompt

role = "Go performance specialist"
examples = [
    "Input: sum two ints -> Output: simple addition, no allocations",
    "Input: concatenate strings -> Output: use strings.Builder",
]
task = "Write a function to parse a large JSON file"
constraints = "Max 20 lines. Use json.Decoder to avoid loading the whole file into memory."
print(assemble_advanced_prompt(role, examples, task, constraints))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Showing examples** completes Anthropic's set of six core prompting techniques (context, examples, constraints, decomposition, think-first, role/tone).
- Combine techniques deliberately — each addition should solve a specific ambiguity, not just add length.
- All six techniques together are still just Description — Discernment and Diligence, covered next module, are what determine whether the output is actually trustworthy.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Generate structured, machine-parseable output from an AI model
- Understand **function calling / tool use** as a more reliable alternative to parsing free text
- Design a Go handler that executes a tool call and returns the result to the model
- Recognize the failure modes of naive JSON-in-text parsing$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'From Natural Language to Production Data',
$py$Models natively produce text, but your backend speaks JSON, Protobuf, and Go structs. Structured output techniques bridge this gap.

## Technique 1: JSON Mode / Structured Output
Many model APIs support a mode that constrains generation to valid JSON matching a schema you provide.

> "Extract the following fields from the text and return valid JSON only, with keys 'name', 'age', 'city'."

```json
{"name": "Alice", "age": 30, "city": "New York"}
```

## Technique 2: Function Calling (Tool Use)
Instead of generating free text you have to parse, the model returns a structured object naming a function and its arguments:

```json
{
  "name": "get_weather",
  "arguments": {"location": "San Francisco", "unit": "celsius"}
}
```

Your service receives this, executes the actual function, and (in an agentic loop) returns the result to the model for it to incorporate into its final answer.

<div class="tip">💡 **Go Engineer's Bridge:** This is squarely backend territory. You parse `arguments`, dispatch to your existing Go functions, and return a structured result — you're extending the model's capabilities with your own codebase, not asking it to "know" things it can't reliably know on its own (like live weather).</div>

<div class="warning">⚠️ **Why not just parse JSON out of free text?** A model asked to "reply with JSON" in an unstructured completion can wrap it in explanatory prose, use inconsistent field names, or produce almost-but-not-quite-valid JSON. Native structured-output or tool-calling modes exist specifically to give you a reliable contract instead of a string you have to defensively parse.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'End-to-End Tool-Use Pipeline',
$py$1. **User asks:** "What's the weather in Austin?"
2. **Model (with tools available):** Emits `{"name": "get_weather", "arguments": {"location": "Austin"}}` instead of guessing an answer.
3. **Your Go service:** Parses this, calls `weatherAPI.Fetch("Austin")`.
4. **Your Go service:** Returns the real data to the model as a tool result.
5. **Model:** Incorporates the real data into a natural-language reply: *"It's currently sunny and 28°C in Austin."*

```go
// Go struct for parsing a tool call from the model's response
type ToolCall struct {
    Name      string          `json:"name"`
    Arguments json.RawMessage `json:"arguments"`
}

func handleToolCall(call ToolCall) (interface{}, error) {
    switch call.Name {
    case "get_weather":
        var args struct{ Location string `json:"location"` }
        if err := json.Unmarshal(call.Arguments, &args); err != nil {
            return nil, err
        }
        return GetWeather(args.Location)
    default:
        return nil, fmt.Errorf("unknown tool: %s", call.Name)
    }
}
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: JSON Extraction Prompt Builder',
$py$```python
import json

def build_extraction_prompt(text, fields_to_extract):
    """
    Build the prompt you'd actually send to a model's structured-output
    endpoint to extract the given fields as JSON. This exercise focuses
    on prompt construction, not on faking a model response.
    """
    fields = ", ".join(fields_to_extract)
    return (
        f"Extract the following fields from the text and return ONLY "
        f"valid JSON with these exact keys: {fields}.\n\nText: {text}"
    )

print(build_extraction_prompt("Alice is 30 and lives in NYC.", ["name", "age", "city"]))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **JSON mode / structured output** forces schema-conformant generation.
- **Function calling** extends the model with real capabilities by handing execution back to your own code.
- This is the layer where your Go backend does its most direct integration work with an AI system.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Product Discernment**, per Anthropic's definition of accurately assessing the usefulness of AI outputs
- Understand mechanically why hallucinations happen
- Build a personal checklist for reviewing AI-generated content and code
- Recognize why unverified AI output should never be treated as ground truth$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Art of Critical Evaluation',
$py$<div class="info">ℹ️ **Discernment**, per Anthropic's framework, is *accurately assessing the usefulness of AI outputs and behaviors*. Product Discernment is the sub-skill focused specifically on evaluating what the AI produced.</div>

## The Product Discernment Checklist
1. **Accuracy:** Are the facts, syntax, or figures correct?
2. **Coherence:** Does the response contradict itself anywhere?
3. **Relevance:** Does it actually address what was asked?
4. **Completeness:** Is anything critical missing?

## Why Hallucinations Happen
A language model is fundamentally predicting the statistically most plausible next token given everything before it — it has no built-in mechanism for checking a generated claim against ground truth. When the training data doesn't cleanly determine the answer, the model can produce a confident, fluent, and entirely wrong statement — a fabricated citation, an incorrect API signature, a nonexistent legal case. This isn't a bug that gets patched away; it's a structural property of how these models generate text, and it's exactly why Discernment exists as a distinct competency rather than something you can skip once the model "gets good enough."

<div class="warning">⚠️ **Critical Skill:** Never trust code you haven't run. Never trust a fact or citation you haven't independently verified. This applies regardless of how confident or fluent the response sounds — confidence in the writing has no reliable correlation with correctness.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Spotting the Hallucination',
$py$**Prompt:** "What's the standard-library way to read a whole file in Go?"

**Hypothetical hallucinated answer:**
> "Use `io.ReadFile("file.txt")` from the `io` package. It returns a `string` directly."

**Your Product Discernment, applied:**
1. **Accuracy check:** The actual function is `os.ReadFile`, in the `os` package — not `io`.
2. **Coherence check:** It returns `([]byte, error)`, not a bare `string`.
3. **Correct answer:** `data, err := os.ReadFile("file.txt")`.

**Action:** Reject the incorrect claim and verify against the actual Go standard library documentation before using it — this exact class of error (plausible package name, wrong signature) is a common and well-documented hallucination pattern for API details.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Hallucination Detector',
$py$```python
def detect_hallucination(ai_response, known_facts):
    """
    known_facts: dict of key -> correct value.
    Compare the AI's claimed values against ground truth and
    return a list of mismatches.
    """
    errors = []
    for key, correct_val in known_facts.items():
        claimed = ai_response.get(key)
        if claimed is not None and str(correct_val) != str(claimed):
            errors.append(f"Mismatch on {key}: expected '{correct_val}', got '{claimed}'")
    return errors

known = {"go_readfile_package": "os", "go_readfile_return": "[]byte, error"}
claimed = {"go_readfile_package": "io", "go_readfile_return": "string"}
print(detect_hallucination(claimed, known))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Product Discernment** means checking accuracy, coherence, relevance, and completeness before trusting an output.
- Hallucinations are structural, not incidental — expect them, and verify accordingly.
- Never ship AI-generated code or facts you haven't personally verified.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Process Discernment** to trace and audit AI reasoning
- Recognize common reasoning failure patterns
- Understand why a correct-looking answer built on flawed reasoning is a latent risk
- Use the 'think first' Process Description technique specifically to enable this kind of audit$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Looking Under the Hood',
$py$<div class="info">ℹ️ **Process Discernment** evaluates *how* the AI arrived at an output — the reasoning steps, assumptions, and logical structure behind it — not just whether the final answer happens to be right.</div>

## Why Process Matters
A correct answer built on broken reasoning is fragile: it can fail unpredictably the moment the context shifts slightly, because the underlying logic wasn't actually sound. Auditing process, not just product, is how you catch that fragility before it becomes a production incident.

## Common Reasoning Failure Patterns
1. **Jumping to conclusions:** Skipping intermediate steps that would have surfaced a problem.
2. **Ignoring contradictory context:** Reaching a conclusion that conflicts with information given earlier in the same conversation.
3. **False equivalence:** Treating two situations as comparable when a key difference actually matters.
4. **Over-generalization:** Applying a narrow, context-specific rule too broadly.

<div class="tip">💡 **How to audit:** This is precisely why 'asking the AI to think first' (from the Process Description lesson) matters for Discernment too — it's the same technique serving two purposes: better initial output, and a visible reasoning trail you can actually check.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Auditing the Process',
$py$**Scenario:** An AI recommends a plain `sync.Mutex` for a high-throughput Go service.

**Its stated reasoning:** "A mutex is simple to implement and prevents data races."

**Your Process Discernment:**
1. **Logical validity:** The claim is technically true but incomplete.
2. **Missing step:** Did it consider read/write ratio? Would `sync.RWMutex` or `atomic` operations perform better under this specific access pattern?
3. **Hidden assumption:** It implicitly assumed low contention without asking about actual request volume.
4. **Verdict:** The reasoning is shallow, not wrong — it needed one more step (asking about throughput and access pattern) before recommending an implementation.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Process Audit',
$py$```python
def audit_reasoning(steps):
    """
    steps: list of strings, the AI's stated reasoning steps.
    Return a list of flagged concerns using simple heuristics.
    """
    issues = []
    if len(steps) < 3:
        issues.append("Reasoning is shallow — missing intermediate steps.")
    if any("always" in s.lower() or "never" in s.lower() for s in steps):
        issues.append("Found an absolute claim ('always'/'never') — check for over-generalization.")
    return issues

test_steps = [
    "A mutex always prevents races.",
    "We should use a mutex here.",
]
print(audit_reasoning(test_steps))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Process Discernment** audits reasoning, not just the final answer.
- Watch for skipped steps, ignored context, false equivalence, and over-generalization.
- Asking the model to 'think first' makes this kind of audit possible in the first place.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Performance Discernment** to evaluate the interaction itself, not just its content
- Recognize overconfident phrasing on genuinely uncertain topics
- Judge whether tone and clarity fit your actual audience
- Adjust your Description in response to a Performance Discernment finding$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Human Side of AI Evaluation',
$py$<div class="info">ℹ️ **Performance Discernment** evaluates the *interaction dynamics* — is the communication style actually effective for what you need right now, independent of whether the underlying facts are correct.</div>

## Key Evaluation Dimensions
1. **Confidence calibration:** Does the model hedge on genuinely uncertain claims, or state everything with the same flat confidence?
2. **Tone match:** Does the register fit the audience — executive summary vs. engineering deep-dive?
3. **Clarity:** Is it understandable, or hiding behind unnecessary jargon?
4. **Interactivity:** Did it ask a useful clarifying question where one was warranted, or guess instead?

<div class="warning">⚠️ **Overconfidence risk:** Language models don't have calibrated "belief" the way a person weighing evidence does — they produce fluent text regardless of the underlying certainty of a claim. Treat uniformly confident phrasing as a reason to check, not as evidence of correctness.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Performance Evaluation in Practice',
$py$**Scenario:** You ask an AI to explain goroutines to a non-technical executive, and it responds with heavy jargon ("multiplexed onto OS threads," "channel-based communication").

**Your Performance Discernment:**
1. **Tone:** Mismatched — too technical for the stated audience.
2. **Clarity:** Jargon-dense, unlikely to land with a non-technical reader.
3. **Adjustment:** Revise your Description — explicitly name the audience and ask for a business-relevant analogy, no jargon, 2–3 sentences.
4. **Result:** A response that actually serves the audience — this is Discernment feeding directly back into a better Description, exactly the interconnected loop the framework describes.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Performance Evaluator',
$py$```python
def evaluate_performance(response, target_audience):
    """
    Return qualitative flags, not fabricated numeric scores:
    e.g. {'tone_mismatch': True/False, 'jargon_heavy': True/False}
    based on simple heuristics (e.g. presence of technical terms
    when target_audience == 'non-technical').
    """
    # TODO: implement
    pass

response = "Goroutines are lightweight threads multiplexed onto OS threads..."
print(evaluate_performance(response, target_audience="non-technical"))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Performance Discernment** evaluates the quality of the interaction: confidence calibration, tone, clarity, interactivity.
- Models don't have calibrated uncertainty in their phrasing — don't read confidence as a proxy for correctness.
- A Performance Discernment finding usually loops back into a revised Description, not a one-off fix.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Diligence**, per Anthropic's definition of taking responsibility for what you do with AI and how you do it
- Make deliberate, defensible choices about which AI systems to use
- Disclose AI involvement appropriately to colleagues, users, and regulators
- Understand the current regulatory landscape well enough to know when to check further$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Choosing and Disclosing',
$py$<div class="info">ℹ️ **Diligence**, per Anthropic's framework, means *taking responsibility for what we do with AI and how we do it*. This lesson splits that into two practical habits: being deliberate about which system you use (Creation), and being honest about its involvement (Transparency).
</div>

## Choosing an AI System — Questions Worth Asking
1. **Capability fit:** Does this model actually fit the task, at acceptable cost and latency?
2. **Data handling:** Does the provider train on your inputs by default? Check the current terms of service — this changes across providers and over time.
3. **Bias and fairness:** Has the model been evaluated for your specific domain, or only on general benchmarks?

## Disclosing AI Involvement — Questions Worth Asking
1. **User-facing:** Do end users know they're interacting with an AI system where that matters (e.g., support chat)?
2. **Internal:** Do your colleagues know when code, docs, or analysis were AI-drafted, so they can calibrate their own review?
3. **Regulatory:** Are you in a jurisdiction or industry with a specific disclosure requirement?

<div class="tip">💡 **Best practice:** When in doubt, disclose. A one-line note in a PR — "This test scaffold was AI-drafted and human-reviewed" — costs almost nothing and sets accurate expectations for reviewers.</div>

<div class="warning">⚠️ **Regulatory landscape is moving — verify before you rely on it.** As of mid-2026, the EU AI Act's high-risk system obligations (covering use cases like employment decisions, credit scoring, and law enforcement) were amended by the "Digital Omnibus on AI," approved by the European Parliament in June 2026. That amendment deferred the compliance deadline for standalone high-risk systems from 2 August 2026 to **2 December 2027**, and for AI embedded in regulated products (e.g. medical devices) from 2027 to **2 August 2028**. Watermarking/transparency obligations for AI-generated content were separately deferred to 2 December 2026. Because these dates were actively being renegotiated through mid-2026, always check the current official EU AI Act timeline before making a compliance claim — this is exactly the kind of fact that goes stale fast, and this lesson should be re-verified periodically before being republished.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Diligence in Action',
$py$## Scenario: An AI-Assisted Resume Screening Tool

**Creation Diligence:**
- You evaluate multiple models for disparate outcomes across demographic groups on your own hiring data before choosing one.
- You check the vendor's data-retention terms and confirm inputs aren't used for further training without consent.

**Transparency Diligence:**
- Candidates are told, in plain language, that AI assists in an initial screening step, and that a human recruiter makes the final decision.
- Every AI-assisted screening decision is logged for audit.

## Why This Use Case Specifically Requires More Care
Employment-related AI decisions (recruitment, performance evaluation, promotion/termination) are explicitly classified as high-risk under the EU AI Act's Annex III, which is precisely why the deadline details above matter operationally, not just academically — a system like this is squarely in scope once the deferred obligations take effect.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Diligence Checklist Builder',
$py$```python
def diligence_recommendations(use_case, data_sensitivity, jurisdiction):
    """
    Return a dict with 'creation' and 'transparency' lists of concrete
    steps to take, based on the inputs. Keep recommendations qualitative
    and defensible rather than inventing specific legal citations —
    flag 'verify current regulation' rather than asserting a stale rule.
    """
    recs = {"creation": [], "transparency": []}
    # TODO: implement conditional logic, e.g.:
    # if jurisdiction involves the EU and use_case is employment-related,
    # flag it as a likely high-risk category and recommend verifying
    # the current AI Act compliance deadline before launch.
    return recs

print(diligence_recommendations("Resume screening", "personal data", "EU"))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Diligence** means owning both the choice of AI system (Creation) and the honesty of disclosing its role (Transparency).
- Default to disclosure when uncertain — it's cheap and it protects trust.
- Regulation in this space, notably the EU AI Act's high-risk timeline, was actively changing through mid-2026 — verify current dates before making a compliance claim, don't rely on this lesson as a legal source.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Deployment Diligence** to a production AI system
- Design a verification, canary-rollout, and rollback strategy
- Implement human-in-the-loop safeguards for high-stakes decisions
- Understand why accountability for AI output rests with the engineer who shipped it, not the model$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Taking Responsibility',
$py$<div class="info">ℹ️ **Deployment Diligence** is the operational half of Diligence: taking responsibility for verifying and vouching for AI outputs once they're live in production, not just at design time.</div>

## The Deployment Diligence Pipeline
1. **Offline evaluation:** Test against a held-out dataset; measure accuracy, latency, and — where relevant — disparate impact across groups.
2. **Canary deployment:** Roll out to a small fraction of traffic first; watch closely before expanding.
3. **Human-in-the-loop (HITL):** For high-stakes decisions, require human approval below a confidence threshold, or for flagged sensitive categories.
4. **Continuous monitoring:** Track accuracy drift, escalation rate, and user feedback over time — a model's performance can degrade as real-world inputs shift away from its training distribution.
5. **Rollback plan:** Maintain a way to disable the AI path and fall back to a deterministic or human process.

<div class="warning">⚠️ **Engineering reality:** You are professionally accountable for the AI outputs your system serves. "The model produced it" is not a defense — the same way "the library had a bug" doesn't absolve you of shipping broken code that depended on it.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Deployment Diligence Checklist',
$py$## Scenario: Deploying a Customer Support AI

1. **Offline testing:** Evaluate against a sample of historical support tickets; compare quality against current human-agent outcomes.
2. **Canary:** Release to a small percentage of traffic first, for a defined trial period.
3. **HITL:** Route to a human agent whenever the model's confidence falls below a set threshold, or the topic is flagged as sensitive.
4. **Monitoring:** Track unresolved-issue rate, escalation rate, and customer satisfaction over time.
5. **Rollback:** If escalation rate spikes beyond an agreed threshold, automatically fall back to full human routing.

```go
// Go pseudocode for deployment guardrails
func handleAIResponse(response AIResponse, confidence float64) (string, bool) {
    if confidence < confidenceThreshold {
        return escalateToHuman(response), false
    }
    if containsSensitiveTopic(response) {
        return requestHumanReview(response), false
    }
    return formatFinalResponse(response), true
}
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Deployment Plan Builder',
$py$```python
def deployment_checklist(use_case, risk_level):
    """
    risk_level: 'low' | 'medium' | 'high'
    Return a structured checklist covering testing, monitoring,
    rollback, and human oversight, scaled to the stated risk level.
    Higher risk should mean stricter HITL requirements and tighter
    rollback triggers, not just 'more of everything'.
    """
    checklist = {
        "testing": [],
        "monitoring": [],
        "rollback": [],
        "human_oversight": [],
    }
    # TODO: populate based on risk_level
    return checklist
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Deployment Diligence** is your operational quality gate: test, canary, monitor, and keep a rollback path.
- Human-in-the-loop review is standard practice for high-stakes decisions, not an afterthought.
- Accountability for what you ship stays with you — the model producing an output doesn't transfer responsibility for it.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Use AI coding assistants effectively within the Automation mode
- Apply Delegation to distinguish what to hand off from what stays yours
- Apply Product Discernment to AI-generated code before merging it
- Recognize what these tools are, and aren't, currently reliable for$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'AI in Your IDE',
$py$AI coding assistants are models fine-tuned heavily on source code. They're strongest at pattern completion — predicting what a competent developer would plausibly write next, given the surrounding context.

**What they're strong at (good Automation candidates):**
- Boilerplate (structs, constructors, standard error-handling patterns)
- Unit test scaffolding
- Documentation comments
- Mechanical, repetitive transformations

**What still needs your judgment (keep as Augmentation, or do yourself):**
- System and API architecture decisions
- Security-sensitive logic
- Performance-critical code paths where the "obvious" solution may not be idiomatic or efficient

<div class="tip">💡 **Go Engineer's Bridge:** Coding assistants often suggest Go that compiles but isn't idiomatic — for example, reaching for a hand-rolled string check instead of the standard library's actual validation utilities. Product Discernment is the filter between "compiles" and "should ship."</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Automation in Action',
$py$**Task:** Validate an email address in Go.

**A plausible naive AI suggestion:**
```go
func ValidateEmail(email string) bool {
    return strings.Contains(email, "@") && strings.Contains(email, ".")
}
```

**Your Discernment:**
- **Product:** Technically a function, but far too permissive — it would accept `"@."` as valid.
- **Action:** Reject it and prefer the standard library's actual address parser instead of a hand-rolled check.

**Corrected version:**
```go
import "net/mail"

func ValidateEmail(email string) bool {
    _, err := mail.ParseAddress(email)
    return err == nil
}
```

**Problem reference:** This lesson pairs with the existing **`error-message-for-code`** problem, where you practice running and debugging Go solutions rather than trusting them on sight.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Code Review Checklist',
$py$```python
def review_ai_code(code_snippet, requirements):
    """
    Return a dict of {check_name: passed(bool)} covering at minimum:
    correctness against stated requirements, obvious security issues,
    and idiomatic style. This models the checklist a reviewer should
    run against any AI-suggested code before merging.
    """
    # TODO: implement checks
    pass
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- AI coding assistants excel at Automation-mode tasks: boilerplate, tests, docs.
- They are not a substitute for architectural judgment or security review.
- Every suggestion you accept is still your responsibility once it's merged — Product Discernment doesn't get to be skipped because the code looks clean.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define **Retrieval-Augmented Generation (RAG)** and the problem it solves
- Walk through the pipeline: chunking → embedding → indexing → retrieval → generation
- Implement a minimal RAG system in Python
- Understand where a Go backend fits in a production RAG stack$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The RAG Pipeline',
$py$A model's knowledge is frozen at its training cutoff and doesn't include your private or fast-changing data. RAG addresses this by retrieving relevant documents at query time and feeding them into the model's context, rather than relying purely on what it memorized during training.

## Step-by-Step
1. **Chunking:** Split source documents into smaller, semantically coherent pieces.
2. **Embedding:** Convert each chunk into a numerical vector that captures its meaning.
3. **Indexing:** Store vectors in a vector database (e.g., a dedicated vector store, or `pgvector` inside Postgres).
4. **Retrieval:** Embed the incoming query, find the most similar stored chunks (commonly via cosine similarity).
5. **Generation:** Insert the retrieved chunks into the prompt as context, and ask the model to answer using them.

<div class="tip">💡 **Go Engineer's Role:** Your service can own chunking, orchestrate the retrieval call to the vector store, and assemble the final prompt before calling the model — this is largely an I/O-orchestration problem, which plays directly to Go's strengths.</div>

<div class="warning">⚠️ **RAG reduces hallucination risk, it doesn't eliminate it.** Grounding the model in retrieved context makes fabrication much less likely on questions the context actually covers, but the model can still misread or over-generalize from the provided chunks. Discernment still applies to RAG-based answers — 'it cited a source' is not the same as 'it accurately represented that source.'</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'RAG in Action: Internal Documentation Bot',
$py$## Problem
A company wants a chatbot that can answer questions about its internal API documentation — content the base model was never trained on.

## RAG Solution
1. Chunk the documentation into a few-hundred-token pieces.
2. Embed and store each chunk in a vector database.
3. A user asks: "How do I authenticate against the billing API?"
4. The system retrieves the specific "Authentication" section relevant to that query.
5. The prompt becomes: "Based on this documentation excerpt, answer the user's question: [retrieved chunks] [question]."
6. The result is grounded in the actual current docs, not the model's possibly outdated general knowledge.

```python
def rag_retrieve(query, vector_db, top_k=3):
    query_embedding = embed(query)
    results = vector_db.search(query_embedding, top_k=top_k)
    return [r["text"] for r in results]

def rag_generate(query, context_chunks, generate_llm_response):
    prompt = f"Context:\n{context_chunks}\n\nQuestion: {query}\nAnswer using only the context above:"
    return generate_llm_response(prompt)
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Minimal RAG Retriever',
$py$```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SimpleRAG:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.documents = []
        self.matrix = None

    def add_documents(self, texts):
        self.documents = texts
        self.matrix = self.vectorizer.fit_transform(texts)

    def retrieve(self, query, top_k=1):
        # TODO: vectorize the query with self.vectorizer.transform,
        # compute cosine_similarity against self.matrix, and return
        # the top_k most similar documents.
        pass

rag = SimpleRAG()
rag.add_documents([
    "The capital of France is Paris.",
    "Berlin is the capital of Germany.",
])
print(rag.retrieve("What is the capital of France?"))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **RAG** connects a model to data it wasn't trained on, at query time.
- Pipeline: chunk → embed → index → retrieve → generate.
- It reduces, but does not eliminate, hallucination risk — Discernment still applies to RAG-grounded answers.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Build evaluation datasets for testing AI behavior
- Understand exact-match, overlap-based (e.g., ROUGE/BLEU-style), and LLM-as-a-judge evaluation approaches
- Integrate evaluation into a CI/CD pipeline
- Recognize why probabilistic output requires a different testing mindset than deterministic code$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Testing the Unpredictable',
$py$Deterministic Go code either passes a test or it doesn't. AI output is probabilistic — the same prompt can produce meaningfully different (but both reasonable) responses, so "does it match exactly" is often the wrong question.

## Types of Evaluation
1. **Exact match:** Does the output match a specific expected string? Useful for narrow, deterministic sub-tasks (e.g., extracted structured fields).
2. **Overlap-based metrics:** Measure n-gram overlap between generated and reference text — useful for summarization, less meaningful for open-ended generation.
3. **LLM-as-a-judge:** Use a capable model to grade another model's output against a rubric — scales far better than human review, but needs periodic calibration against human judgment since it inherits its own biases.
4. **Human evaluation:** Manual review — the most reliable signal, and the most expensive; often used to calibrate and spot-check the automated methods above rather than as the sole method at scale.

## Evaluation Pipeline
1. **Curate a test set:** A representative sample of realistic inputs with expected outputs or a grading rubric.
2. **Run:** Pass every input through the current model/prompt configuration.
3. **Score:** Apply the appropriate metric(s) above.
4. **Gate:** Block deployment if scores fall below an agreed threshold.

<div class="tip">💡 **Go Integration:** Your CI/CD pipeline can shell out to a Python evaluation script, parse its results, and fail the build if scores regress — the same pattern you'd use for any other automated quality gate.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Evaluation in Practice (Problem Reference)',
$py$This lesson references the existing **`two-sum`** problem. Students solve the underlying Go problem, then extend the exercise by writing an *evaluator* for a hypothetical AI system that generates two-sum solutions — checking not just whether the generated code compiles, but whether it actually passes the full test suite, including edge cases like duplicate values and no valid pair existing.

```python
def evaluate_ai_solution(generated_code_passes_tests, edge_cases_covered):
    """
    A minimal evaluator: real correctness requires actually running
    the generated code against a test suite, not just inspecting it.
    """
    return generated_code_passes_tests and edge_cases_covered
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Build an Evaluator',
$py$```python
def exact_match_accuracy(predictions, ground_truth):
    """Return the percentage of exact matches between predictions and ground truth."""
    correct = sum(1 for p, g in zip(predictions, ground_truth) if p.strip() == g.strip())
    return correct / len(predictions) * 100

preds = ["Hello", "World", "foo"]
truth = ["Hello", "World", "bar"]
print(f"Accuracy: {exact_match_accuracy(preds, truth):.1f}%")
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Probabilistic AI output needs dedicated evaluation methodology, not a pass/fail deterministic test.
- Combine exact-match, overlap-based, LLM-as-a-judge, and periodic human evaluation depending on the task.
- Wire evaluation into CI/CD so regressions get caught automatically, the same way you'd catch a broken deterministic test.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Connect the **Agency** mode (from Module 1) to concrete agent architecture
- Understand the planning → tool-use → reflection loop common to agent frameworks
- Design a minimal tool-calling agent loop in Python
- Implement guardrails appropriate for autonomous, multi-step AI systems$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Agency, Operationalized',
$py$Recall from Module 1: **Agency** is when you configure AI to independently perform future tasks on your behalf. This lesson is about what that actually looks like in code.

## Common Agent Architecture
1. **Planning:** The agent breaks a high-level goal into sub-tasks.
2. **Tool use:** It calls external functions or APIs — the function-calling pattern from the Structured Outputs lesson, now looped repeatedly.
3. **Reflection:** It evaluates its own intermediate output and can retry or adjust.
4. **Coordination (in multi-agent systems):** Separate agents handle separate roles — e.g., one researches, one drafts, one reviews.

<div class="warning">⚠️ **Engineering reality:** Agency is the mode with the least direct human oversight per step, which means it's also where Diligence has to be structurally encoded rather than applied after the fact. Enforce timeouts, step limits, token budgets, and an explicit allowlist of tools the agent is permitted to call — don't rely on the agent to self-limit.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'A Minimal Agent Loop',
$py$```python
# Conceptual agent loop
class SimpleAgent:
    def __init__(self, tools, max_steps=5):
        self.tools = tools          # allowlist: name -> callable
        self.max_steps = max_steps  # hard step limit — Diligence, encoded

    def run(self, goal, call_llm):
        context = [
            {"role": "system", "content": "You are an agent. Use only the provided tools to achieve the goal."},
            {"role": "user", "content": goal},
        ]

        for _ in range(self.max_steps):
            response = call_llm(context)
            if "tool_call" in response:
                name = response["tool_call"]["name"]
                if name not in self.tools:
                    return f"Blocked: tool '{name}' is not in the allowlist."
                args = response["tool_call"]["arguments"]
                result = self.tools[name](**args)
                context.append({"role": "tool", "content": result})
            else:
                return response  # final answer
        return "Max steps exceeded — stopping rather than looping indefinitely."
```

Note the allowlist check and the hard `max_steps` bound — both are Diligence decisions made at design time, not left to the agent's judgment at run time.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Design a Guardrailed Research Agent',
$py$```python
class ResearchAgent:
    def __init__(self, allowed_tools, max_steps=4):
        self.allowed_tools = allowed_tools
        self.max_steps = max_steps

    def search(self, query):
        """Simulated search — in production this calls a real search tool."""
        return f"Results for {query}: [simulated result]"

    def run(self, research_question, call_llm):
        """
        TODO: implement the plan -> tool-call -> reflect loop, respecting
        self.max_steps and only calling tools in self.allowed_tools.
        """
        pass
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Agency**, from Module 1, becomes concrete here as a plan → tool-use → reflect loop.
- Guardrails (tool allowlists, step limits, logging) are Diligence decisions that must be encoded in the system design, not left to the agent.
- The more autonomous the system, the more the earlier modules' competencies compound — weak Description or Discernment upstream becomes much more dangerous once Agency removes the per-step human check.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Understand why capability-timeline predictions vary widely and should be held loosely
- Navigate the open-source vs. closed-source model landscape as a practical, not ideological, choice
- Track the regulatory trajectory well enough to know when to check for updates
- Build a concrete plan for applying the 4Ds throughout your career, not just in this course$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'What''s Genuinely Unresolved (And What Isn''t)',
$py$## Capability Timelines
Serious researchers disagree substantially on how quickly AI capabilities will keep advancing and what future systems will be able to do — this is a live, contested question, not settled science. Treat specific timeline predictions from any source, including this course, as informed speculation rather than fact.

## Open-Source vs. Closed-Source Models
- **Closed/API-based models** (from labs like Anthropic, OpenAI, Google) typically lead on raw capability and come with vendor-managed safety tooling, at the cost of less control and ongoing usage cost.
- **Open-weight models** (e.g., from Meta, Mistral, and others) offer more control and the ability to self-host, at the cost of needing your own infrastructure and safety tooling.
- **Practical takeaway:** This is an engineering tradeoff — cost, control, latency, capability — not a matter of picking a side. Expect to work with both across a career.

## Regulation: What's Actually Moving
- **EU AI Act:** As covered in the Diligence module, high-risk system obligations were deferred via the mid-2026 Digital Omnibus amendment — this is the clearest example of how quickly compliance timelines can shift, and why you should verify current dates before treating any specific date as fixed.
- **Broader trend:** Regulatory approaches vary significantly by jurisdiction and continue to evolve — this is an area to actively monitor, not memorize once.

<div class="tip">💡 **Career Advice:** Demand is high for engineers who can *productionize* AI responsibly — not just call an API, but build the infrastructure, evaluation, and guardrails around it. Your Go background is a genuine asset here: reliability, concurrency, and systems thinking are exactly what's needed once an AI feature has to survive real production traffic.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Career Paths Worth Considering',
$py$## Path 1: Backend AI Engineer
Build the services that orchestrate model calls — caching, rate limiting, fallback logic, cost management.

## Path 2: ML/AI Platform Engineer
Build internal tooling for applied AI teams — evaluation infrastructure, model registries, feature stores.

## Path 3: Applied AI / Agent Engineer
Design and harden agentic workflows — the Agency-mode systems from the previous lesson, with production-grade guardrails.

<div class="info">ℹ️ **Fluency is your differentiator:** Plenty of engineers can call an API. Fewer can decide what should be delegated, describe it precisely, evaluate the result rigorously, and take responsibility for what ships. That's the actual skill this course has been building — the 4Ds, applied end to end.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Personal Fluency Plan',
$py$```python
def fluency_action_plan(current_role, target_focus):
    """
    Return a plan mapping each of the 4Ds to one concrete habit
    the learner will adopt going forward, tailored to target_focus
    (e.g. 'backend AI engineering', 'AI platform engineering').
    """
    # TODO: implement — this is intentionally open-ended; there's no
    # single correct answer, only a defensible one.
    pass

print(fluency_action_plan("Go backend engineer", "backend AI engineering"))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Capability timelines are genuinely contested — hold specific predictions loosely, including your own.
- Open vs. closed model choice is a practical tradeoff, not an ideological one.
- Regulation, especially the EU AI Act, is actively moving — build a habit of checking current status rather than relying on a fixed date.
- The 4Ds — Delegation, Description, Discernment, Diligence — are the durable skillset; specific tools and models will keep changing under them.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

UPDATE lesson_sections SET metadata = $json${
                "question": "According to Anthropic's AI Fluency Framework, which best describes AI Fluency?",
                "options": [
                  "Knowing how to write effective prompts",
                  "The ability to interact with AI systems in ways that are effective, efficient, ethical, and safe",
                  "Understanding transformer architecture well enough to reimplement it",
                  "Being able to fine-tune or train a model from scratch"
                ],
                "correct_index": 1,
                "explanation": "Anthropic's framework defines AI Fluency precisely this way. Prompting (A) is only part of one competency, Description. Technical depth (C, D) is valuable but is not what the framework measures — you can be highly fluent without ever training a model."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'defining-ai-fluency');

UPDATE lesson_sections SET metadata = $json${
                "question": "What was the core technical contribution of the 2017 paper 'Attention Is All You Need'?",
                "options": [
                  "It introduced the self-attention-based Transformer architecture, enabling parallel sequence processing without recurrence",
                  "It proved neural networks could never exceed human performance",
                  "It introduced reinforcement learning from human feedback (RLHF)",
                  "It launched the first publicly available chatbot"
                ],
                "correct_index": 0,
                "explanation": "Vaswani et al.'s paper replaced recurrence and convolution with self-attention, enabling far greater parallelization during training. RLHF (C) and ChatGPT's launch (D) came later and rest on top of this architecture."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'history-of-ai');

UPDATE lesson_sections SET metadata = $json${
                "question": "An engineer configures a system that monitors production metrics and independently opens GitHub issues with severity labels when anomalies are detected, without asking for approval first. Which mode is this?",
                "options": [
                  "Automation",
                  "Augmentation",
                  "Agency",
                  "Discernment"
                ],
                "correct_index": 2,
                "explanation": "This is Agency: the human configured the AI's behavior in advance, and it now acts independently on an ongoing basis. Discernment (D) is a competency, not a mode — it's what you'd apply afterward to judge whether the issues it opened were actually useful."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'human-ai-interaction-modes');

UPDATE lesson_sections SET metadata = $json${
                "question": "Which statement about Generative AI is accurate?",
                "options": [
                  "Generative AI can only generate text, never images or code",
                  "Generative AI is a capability built on Deep Learning, itself a subset of Machine Learning",
                  "Generative AI is a field entirely separate from Machine Learning",
                  "Generative AI does not require training data"
                ],
                "correct_index": 1,
                "explanation": "GenAI sits on top of Deep Learning, which sits on top of Machine Learning — it's nested, not separate. It still depends heavily on training data and can generate text, images, audio, and code."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'ai-ecosystem');

UPDATE lesson_sections SET metadata = $json${
                "question": "Why do AI-assisted coding tools primarily augment rather than replace software engineers today?",
                "options": [
                  "They can predict future coding trends",
                  "They generate boilerplate and completions well, but architecture, security review, and business-logic judgment still require human Discernment",
                  "They are literally faster than the Go compiler",
                  "They eliminate the need for code review entirely"
                ],
                "correct_index": 1,
                "explanation": "AI coding tools are strongest at pattern-completion tasks (boilerplate, tests, documentation) and weakest at tasks requiring judgment about tradeoffs, security, and system-level design — which is exactly what human Discernment is for."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'ai-real-world-impact');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary purpose of a validation dataset?",
                "options": [
                  "To generate the final accuracy figure used in marketing materials",
                  "To tune hyperparameters and monitor for overfitting during development",
                  "To train the model on its hardest examples first",
                  "To replace the need for a held-out test set"
                ],
                "correct_index": 1,
                "explanation": "Validation data guides decisions made during training — hyperparameters, early stopping, architecture choices. The test set is reserved and used only once, at the very end, precisely so it stays an unbiased measure of generalization."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'data-the-fuel-of-ai');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the role of an activation function in a neural network?",
                "options": [
                  "It compresses input data to save memory",
                  "It introduces non-linearity, which is what lets stacked layers represent complex, non-linear patterns",
                  "It guarantees all weights stay positive",
                  "It reduces the number of training steps needed"
                ],
                "correct_index": 1,
                "explanation": "Without a non-linear activation function, any number of stacked linear layers mathematically reduces to a single linear transformation — no more expressive than one layer. The activation function is what makes depth actually useful."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'machine-learning-basics');

UPDATE lesson_sections SET metadata = $json${
                "question": "What does a model's 'knowledge cutoff' refer to?",
                "options": [
                  "The maximum number of API calls allowed per day",
                  "The date after which the model has no training data and therefore no first-hand knowledge of subsequent events",
                  "The maximum context window length in tokens",
                  "The point at which the model starts hallucinating"
                ],
                "correct_index": 1,
                "explanation": "Knowledge cutoff is a training-data boundary, unrelated to API limits or context window size. A model can hallucinate at any point, cutoff or not — it's a distinct failure mode covered later, in the Discernment module."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'llm-architecture-deep-dive');

UPDATE lesson_sections SET metadata = $json${
                "question": "RLHF (Reinforcement Learning from Human Feedback) is primarily applied during which stage?",
                "options": [
                  "Pre-training",
                  "Fine-tuning",
                  "Inference",
                  "Data collection"
                ],
                "correct_index": 1,
                "explanation": "RLHF happens during fine-tuning, after pre-training has produced a base model, and before that model is deployed for inference. It aligns the model's behavior with human preferences for helpfulness and safety."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'ai-lifecycle');

UPDATE lesson_sections SET metadata = $json${
                "question": "You're building a support bot that must give consistent, repeatable answers about shipping policy. What temperature setting best fits this need?",
                "options": [
                  "A high temperature, to sound more natural",
                  "A low temperature, to reduce randomness and favor the most likely, consistent response",
                  "It doesn't matter — temperature only affects speed",
                  "The maximum allowed temperature, to maximize accuracy"
                ],
                "correct_index": 1,
                "explanation": "Low temperature biases the model toward its highest-confidence tokens, producing more consistent, repeatable answers — exactly what a policy-lookup bot needs. Temperature does not affect factual accuracy directly, and does not control inference speed."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'ai-behavior-controls');

UPDATE lesson_sections SET metadata = $json${
                "question": "Which of the following is an example of Product Description?",
                "options": [
                  "\"Think step-by-step before answering.\"",
                  "\"Output a JSON object with keys 'name' and 'age'.\"",
                  "\"Be concise and professional in tone throughout our conversation.\"",
                  "\"Ask me clarifying questions if anything is ambiguous.\""
                ],
                "correct_index": 1,
                "explanation": "Specifying output format is Product Description — it defines *what* you want. 'Think step-by-step' guides *how* the AI reasons (Process); tone and interactivity instructions govern the collaboration itself (Performance)."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'product-description');

UPDATE lesson_sections SET metadata = $json${
                "question": "Asking an AI to 'think first' before answering primarily helps with which aspect of the interaction?",
                "options": [
                  "It reduces the total number of tokens used",
                  "It makes the AI's reasoning path visible, so intermediate errors can be caught before you rely on the final answer",
                  "It guarantees the final answer is correct",
                  "It restricts the AI to only known facts"
                ],
                "correct_index": 1,
                "explanation": "Thinking-first prompts don't guarantee correctness — they make the reasoning inspectable, which lets your Discernment catch problems earlier in the process rather than only at the final output."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'process-description');

UPDATE lesson_sections SET metadata = $json${
                "question": "Which instruction is an example of Performance Description?",
                "options": [
                  "\"Use JSON format for the output.\"",
                  "\"Break this into three reasoning steps before answering.\"",
                  "\"Respond as a supportive but direct senior engineer, and keep it concise.\"",
                  "\"Include one runnable code example.\""
                ],
                "correct_index": 2,
                "explanation": "Tone and interaction style define Performance. Output format is Product; step-by-step reasoning is Process; a specific content requirement (a code example) is closer to Product as well."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'performance-description');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the main benefit of showing examples (few-shot prompting) instead of only describing the desired output in words?",
                "options": [
                  "It significantly reduces token usage",
                  "Examples often communicate format, tone, and style faster and more precisely than lengthy verbal instructions",
                  "It forces the model to be more creative",
                  "It disables the model's safety behavior"
                ],
                "correct_index": 1,
                "explanation": "A well-chosen example demonstrates the exact pattern you want in a way that's often clearer and more efficient than an equivalent block of instructions — that's why it's one of Anthropic's six core prompting techniques."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'advanced-prompting');

UPDATE lesson_sections SET metadata = $json${
                "question": "Why is native function calling / tool use generally more reliable than asking a model to embed JSON in a free-text reply?",
                "options": [
                  "It makes responses shorter",
                  "It gives your backend a structured, schema-constrained contract to parse, rather than a string that might contain extra prose or malformed JSON",
                  "It lets the model bypass its safety training",
                  "It always uses less compute"
                ],
                "correct_index": 1,
                "explanation": "Function calling constrains the model's output to a defined schema, which is far more reliable for production parsing than hoping a free-text reply contains clean, well-formed JSON with no surrounding commentary."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'structured-outputs');

UPDATE lesson_sections SET metadata = $json${
                "question": "Why do LLMs sometimes produce confident but factually incorrect statements ('hallucinations')?",
                "options": [
                  "They are deliberately programmed to mislead users occasionally",
                  "They generate the statistically most plausible next token, with no built-in mechanism for verifying claims against ground truth",
                  "They run out of memory and substitute a random guess",
                  "They are only creative when instructed to be, and hallucinate otherwise"
                ],
                "correct_index": 1,
                "explanation": "Hallucination is a structural consequence of next-token prediction, not an intentional behavior or a memory failure. This is exactly why independent verification — Product Discernment — is a required step, not an optional one."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'product-discernment');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary purpose of Process Discernment?",
                "options": [
                  "Ensuring the final output is grammatically correct",
                  "Evaluating whether the AI's reasoning steps are logically sound, not just whether the final answer looks right",
                  "Making the AI respond faster",
                  "Eliminating the need for any human decision-making"
                ],
                "correct_index": 1,
                "explanation": "Process Discernment audits the *how*, not just the *what*. A logically unsound path can still land on a correct-looking answer by chance — and fail unpredictably the next time conditions differ slightly."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'process-discernment');

UPDATE lesson_sections SET metadata = $json${
                "question": "You ask an AI to summarize a technical issue for a non-technical executive, and it replies with dense jargon and formulas. Which competency should you apply?",
                "options": [
                  "Product Discernment",
                  "Process Discernment",
                  "Performance Discernment",
                  "Deployment Diligence"
                ],
                "correct_index": 2,
                "explanation": "Evaluating whether tone, clarity, and register fit the intended audience is Performance Discernment — this is about the interaction itself, separate from whether the technical content is accurate."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'performance-discernment');

UPDATE lesson_sections SET metadata = $json${
                "question": "A developer uses AI to draft most of a pull request but doesn't mention this anywhere in the PR description. Which principle does this violate?",
                "options": [
                  "Creation Diligence",
                  "Transparency Diligence",
                  "Process Discernment",
                  "Product Description"
                ],
                "correct_index": 1,
                "explanation": "Transparency Diligence is specifically about honestly disclosing AI's role in your work to the people who need to know — reviewers can't calibrate their scrutiny correctly if they don't know a PR was AI-drafted."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'creation-transparency-diligence');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary purpose of a canary deployment for an AI system?",
                "options": [
                  "To train the model incrementally on live traffic",
                  "To expose the system to a small slice of real users first, limiting the blast radius while you monitor for problems",
                  "To reduce infrastructure costs",
                  "To remove the need for human oversight once launched"
                ],
                "correct_index": 1,
                "explanation": "A canary release limits how many users are affected if something goes wrong, giving you a chance to catch problems and roll back before a full rollout — it doesn't train the model or eliminate the need for oversight."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'deployment-diligence');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the best practice when using an AI coding assistant?",
                "options": [
                  "Accept all suggestions immediately to maximize speed",
                  "Treat suggestions as a starting point, then review, test, and understand the code before committing it",
                  "Only use it for languages you don't already know",
                  "Avoid it entirely, since it slows down learning"
                ],
                "correct_index": 1,
                "explanation": "AI coding tools are strong drafting assistants, not a substitute for review. Blindly accepting suggestions skips both Product Discernment and Deployment Diligence."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'ai-automation-dev-tools');

UPDATE lesson_sections SET metadata = $json${
                "question": "Why does RAG typically reduce (though not eliminate) hallucination on domain-specific questions?",
                "options": [
                  "It disables the model's ability to generate freely",
                  "It grounds the model's answer in retrieved, relevant documents rather than relying solely on what it memorized during training",
                  "It sets temperature to exactly zero automatically",
                  "It permanently updates the model's weights with the retrieved content"
                ],
                "correct_index": 1,
                "explanation": "RAG supplies authoritative, current context at query time. It doesn't modify the model's weights (D) or force deterministic output (C) — it changes what information the model has available to draw from for this specific answer."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'rag-in-production');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the main advantage of using LLM-as-a-judge evaluation?",
                "options": [
                  "It fully replaces human evaluators with no oversight needed",
                  "It offers a scalable, lower-cost way to assess subjective qualities like helpfulness, at the cost of needing periodic calibration against human judgment",
                  "It is always more accurate than exact-match scoring",
                  "It removes the need for a curated test dataset"
                ],
                "correct_index": 1,
                "explanation": "LLM-as-a-judge scales far better than manual review for nuanced criteria, but it inherits its own biases and blind spots — it's a strong complement to human evaluation, not a full replacement for it."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'testing-evaluation');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is a critical risk specific to AI agents with tool-calling capabilities operating in the Agency mode?",
                "options": [
                  "The agent might refuse to call any tools at all",
                  "Without an explicit allowlist, step limits, and validation, the agent could take a harmful or costly action with little to no human oversight in the moment",
                  "The agent will always be too slow to be useful",
                  "The agent will improve itself beyond human control automatically"
                ],
                "correct_index": 1,
                "explanation": "The core risk of Agency is exactly its defining feature — reduced per-step human oversight. That's why guardrails (allowlists, step limits, validation) need to be designed in up front rather than assumed."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'agency-and-agents');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the most defensible approach for a software engineer entering the AI field today?",
                "options": [
                  "Abandon software engineering entirely for a purely research-focused role",
                  "Wait for the open questions around AI capability to resolve before learning anything",
                  "Build on existing backend and systems skills, and focus on productionizing AI responsibly using the 4D framework",
                  "Ignore AI entirely and focus only on legacy systems"
                ],
                "correct_index": 2,
                "explanation": "The clearest, most durable demand is for engineers who can take AI capabilities and make them reliable, evaluated, and accountable in production — exactly the combination of existing engineering skill and AI fluency this course has built toward."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'road-ahead');

-- ── 5. DEPENDENCIES ───────────────────────────────────────────────

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'defining-ai-fluency')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'defining-ai-fluency')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'history-of-ai')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'ai-ecosystem')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'ai-real-world-impact')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'data-the-fuel-of-ai')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'machine-learning-basics')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'llm-architecture-deep-dive')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'ai-lifecycle')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'ai-behavior-controls')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'product-description')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'process-description')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'performance-description')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'advanced-prompting')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'structured-outputs')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'product-discernment')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'process-discernment')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'performance-discernment')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'creation-transparency-diligence')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'deployment-diligence')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'ai-automation-dev-tools')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'rag-in-production')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'testing-evaluation')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'ai-fluency' AND l.slug = 'agency-and-agents')
ON CONFLICT DO NOTHING;

-- ── 6. PROJECTS ───────────────────────────────────────────────────

INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'mini-rag-system', 'Mini RAG System: Build a Document QA Bot', 'Build a complete RAG pipeline — chunking, embedding, retrieval, and generation — that answers questions grounded in a provided set of text documents, and returns an honest confidence signal rather than a false sense of certainty.',
$py$1. Implement chunking: split text into overlapping chunks (e.g. ~200 words with some overlap) so context isn't lost at chunk boundaries.
2. Implement embedding: use TF-IDF (via scikit-learn) as a lightweight, dependency-light stand-in for a production embedding model.
3. Implement retrieval: return the top-3 most similar chunks for a query using cosine similarity.
4. Implement generation: assemble the retrieved chunks and query into a well-formed prompt (simulate the LLM call — e.g. print the assembled prompt, or call a real API if configured).
5. Build a command-line interface that loads documents and answers user questions interactively.
6. Add a similarity-based confidence signal, and have the system say so explicitly when no retrieved chunk is a strong match, rather than answering anyway.$py$,
$py$import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MiniRAG:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.chunks = []
        self.matrix = None

    def chunk_document(self, text, chunk_size=200, overlap=50):
        # TODO: split text into overlapping word chunks
        pass

    def add_documents(self, texts):
        # TODO: chunk every document, then fit/transform with self.vectorizer
        pass

    def retrieve(self, query, top_k=3):
        # TODO: transform the query, compute cosine_similarity against
        # self.matrix, and return the top_k (chunk, score) pairs
        pass

    def answer(self, query, min_confidence=0.15):
        results = self.retrieve(query)
        # TODO: if the best score is below min_confidence, say so honestly
        # instead of generating an answer from weak context. Otherwise,
        # assemble a grounded prompt and return it (or call an LLM).
        pass

if __name__ == "__main__":
    rag = MiniRAG()
    docs = ["The capital of France is Paris.", "Berlin is the capital of Germany."]
    rag.add_documents(docs)
    print(rag.answer("What is the capital of France?"))$py$, 4, 200, ARRAY['Chunk on paragraph or sentence boundaries where possible rather than a hard word-count cut, to avoid splitting mid-thought.', 'Use sklearn.metrics.pairwise.cosine_similarity between the query vector and the document matrix.', 'TF-IDF is a reasonable, dependency-light stand-in for embeddings in this exercise — in production you''d typically use a dedicated embedding model instead.', 'The honest ''low confidence, no strong match'' path is not optional — it''s the difference between a RAG system and a system that just always sounds confident.']::TEXT[], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production'
ON CONFLICT (lesson_id, slug) DO NOTHING;

INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'bias-detector', 'AI Bias Detector Tool', 'Build a Python tool that evaluates a dataset of AI-assisted decisions for potential disparate impact across groups, as part of Deployment Diligence for a high-stakes system.',
$py$1. Load a CSV dataset containing a sensitive attribute column, a target/actual outcome column, and a predicted/AI-decision column.
2. Calculate demographic parity: the selection (positive-outcome) rate for each group.
3. Calculate equal opportunity: the true positive rate for each group among those who should have received a positive outcome.
4. Generate a readable report highlighting disparities between groups, framed as findings to investigate rather than as a definitive fairness verdict.
5. Suggest concrete next steps (e.g. re-weighting training data, adjusting the decision threshold per group, escalating to human review) without overstating what a purely statistical analysis can prove on its own.$py$,
$py$import pandas as pd
import numpy as np

class BiasDetector:
    def __init__(self, df, sensitive_col, target_col, prediction_col):
        self.df = df
        self.sensitive_col = sensitive_col
        self.target_col = target_col
        self.prediction_col = prediction_col

    def demographic_parity(self):
        # TODO: for each group in self.sensitive_col, compute the rate
        # of positive predictions in self.prediction_col
        pass

    def equal_opportunity(self):
        # TODO: for each group, compute true positive rate:
        # TP / (TP + FN), restricted to rows where target_col == positive
        pass

    def run_report(self):
        # TODO: print a report combining both metrics, and flag any
        # group-to-group gap above a stated threshold for investigation
        pass

# Example usage:
# df = pd.read_csv('hiring_decisions.csv')
# detector = BiasDetector(df, sensitive_col='group', target_col='qualified', prediction_col='ai_recommended')
# detector.run_report()$py$, 4, 200, ARRAY['Use pandas groupby to compute per-group rates cleanly.', 'True positive rate is TP / (TP + FN) — compute it only among rows where the true label is positive.', 'A raw rate difference between groups is a signal to investigate further, not proof of unlawful or unethical bias by itself — say so explicitly in your report output.', 'This tool models Deployment Diligence: it''s the kind of check that belongs in your offline-evaluation step, before a high-risk system like a hiring tool ever reaches canary rollout.']::TEXT[], 2, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence'
ON CONFLICT (lesson_id, slug) DO NOTHING;


COMMIT;
