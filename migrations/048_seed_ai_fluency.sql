-- ============================================================================
-- Koder :: AI Fluency: Foundations for AI Engineering Seed Data
-- Generated: 2026-07-29 22:34:08
-- ============================================================================
-- Run this in your Supabase SQL editor after migrations 001-038.
-- ============================================================================

BEGIN;

-- ── 1. COURSE ─────────────────────────────────────────────────────

INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
VALUES ('ai-fluency', 'AI Fluency: Foundations for AI Engineering', 'Master the foundational knowledge, skills, and judgment required to work effectively, ethically, and strategically with AI systems. This course bridges your Go engineering background into the world of AI, covering everything from neural network intuition to production-grade responsible deployment.', 2, 22, 13, false)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. MODULES ────────────────────────────────────────────────────

INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'ai-landscape', 'The AI Landscape & Human-AI Collaboration', 'Define AI fluency, understand the history and ecosystem of AI, and master the strategic decision-making framework for human-AI interaction.', 1, false
FROM courses c WHERE c.slug = 'ai-fluency'
UNION ALL
SELECT c.id, 'technical-core', 'The Technical Core: How AI Actually Works', 'Demystify the mathematics and architecture behind AIâ€”data pipelines, neural networks, transformers, and model lifecycle.', 2, false
FROM courses c WHERE c.slug = 'ai-fluency'
UNION ALL
SELECT c.id, 'prompt-craft', 'The Craft of Description: Prompt Engineering', 'Master the three pillars of Descriptionâ€”Product, Process, and Performanceâ€”to become a world-class AI communicator.', 3, false
FROM courses c WHERE c.slug = 'ai-fluency'
UNION ALL
SELECT c.id, 'responsible-ai', 'Responsible AI: Discernment & Diligence', 'Critically evaluate AI outputs and take ownership of AI-assisted work through the lenses of Product, Process, and Performance Discernment, and Creation, Transparency, and Deployment Diligence.', 4, false
FROM courses c WHERE c.slug = 'ai-fluency'
UNION ALL
SELECT c.id, 'engineering-workflow', 'AI Engineering in Production', 'Apply all four 4Ds to real software engineering: automation, RAG, evaluation, agents, and the future of the field.', 5, false
FROM courses c WHERE c.slug = 'ai-fluency'
ON CONFLICT (course_id, slug) DO NOTHING;

-- ── 3. LESSONS ────────────────────────────────────────────────────

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'defining-ai-fluency', 'Defining AI Fluency & The 4Ds', 'Learn what it truly means to be fluent in AIâ€”beyond just using chatbotsâ€”and internalize the 4D framework that underpins all effective AI collaboration.', 1, 20, 40, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape'
UNION ALL
SELECT m.id, 'history-of-ai', 'A Brief History of Artificial Intelligence', 'Trace the evolution of AI from the Dartmouth workshop in 1956 to the generative AI revolution, and understand why the 2020s are a turning point.', 1, 18, 40, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape'
UNION ALL
SELECT m.id, 'human-ai-interaction-modes', 'Human-AI Interaction Modes', 'Master the three strategic modes of human-AI collaboration: Automation, Augmentation, and Agency.', 2, 22, 50, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape'
UNION ALL
SELECT m.id, 'ai-ecosystem', 'The AI Ecosystem: ML, DL, NLP, CV, and GenAI', 'Map the AI landscape and understand how different subfields relate to each other.', 2, 20, 45, 4, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape'
UNION ALL
SELECT m.id, 'ai-real-world-impact', 'AI in the Real World: Industry Case Studies', 'Explore how AI is transforming healthcare, finance, creative industries, and software engineering.', 2, 25, 50, 5, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape'
UNION ALL
SELECT m.id, 'data-the-fuel-of-ai', 'Data: The Fuel of AI', 'Understand the types of data, data pipelines, and why ''garbage in, garbage out'' is the golden rule of AI.', 2, 20, 45, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core'
UNION ALL
SELECT m.id, 'machine-learning-basics', 'Machine Learning & Neural Network Intuition', 'Learn the fundamental paradigm shifts of MLâ€”from rule-based code to learned patternsâ€”and build intuition for neural networks.', 2, 25, 50, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core'
UNION ALL
SELECT m.id, 'llm-architecture-deep-dive', 'LLM Architecture: Transformers, Parameters & Scaling', 'Demystify the Transformer architecture, learn what parameters mean, and understand why scaling laws matter.', 3, 25, 55, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core'
UNION ALL
SELECT m.id, 'ai-lifecycle', 'The AI Lifecycle: Pre-training, Fine-tuning & Inference', 'Understand the two main phases of an AI model''s lifeâ€”training and deploymentâ€”and the crucial steps in between.', 3, 22, 50, 4, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core'
UNION ALL
SELECT m.id, 'ai-behavior-controls', 'AI Behavior Controls: Temperature, Top-P & System Prompts', 'Learn how to control the creativity, randomness, and style of AI outputs using inference-time parameters.', 2, 20, 45, 5, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core'
UNION ALL
SELECT m.id, 'product-description', 'Product Description: Defining the Output', 'Learn to specify exactly what you want in terms of format, length, audience, and style.', 2, 20, 45, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft'
UNION ALL
SELECT m.id, 'process-description', 'Process Description: Defining the Method', 'Learn to guide the AI''s reasoning process using Chain-of-Thought and Think-first approaches.', 2, 20, 45, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft'
UNION ALL
SELECT m.id, 'performance-description', 'Performance Description: Defining the Behavior', 'Control the AI''s tone, engagement style, and interaction dynamics to suit your working preferences.', 2, 18, 40, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft'
UNION ALL
SELECT m.id, 'advanced-prompting', 'Advanced Prompting: Few-shot, Role-Play & Constraints', 'Combine multiple advanced techniques to tackle the hardest AI interaction problems.', 3, 22, 50, 4, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft'
UNION ALL
SELECT m.id, 'structured-outputs', 'Structured Outputs: JSON, Function Calling & Tool Use', 'Bridge the gap between AI and your Go backend by extracting structured, machine-readable data.', 3, 25, 55, 5, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft'
UNION ALL
SELECT m.id, 'product-discernment', 'Product Discernment: Evaluating the Output', 'Assess the accuracy, coherence, and relevance of what AI produces.', 3, 22, 50, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai'
UNION ALL
SELECT m.id, 'process-discernment', 'Process Discernment: Evaluating the Reasoning', 'Examine the AI''s logic, identify flawed reasoning steps, and prevent bad decisions.', 3, 20, 50, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai'
UNION ALL
SELECT m.id, 'performance-discernment', 'Performance Discernment: Evaluating the Interaction', 'Assess the AI''s communication style, effectiveness, and appropriateness for the context.', 2, 18, 40, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai'
UNION ALL
SELECT m.id, 'creation-transparency-diligence', 'Creation & Transparency Diligence', 'Make responsible choices about which AI systems to use, how to use them, and when to disclose AI involvement.', 3, 22, 50, 4, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai'
UNION ALL
SELECT m.id, 'deployment-diligence', 'Deployment Diligence: Verification & Accountability', 'Take ownership of AI outputs in productionâ€”test, verify, monitor, and establish human-in-the-loop safeguards.', 3, 24, 55, 5, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai'
UNION ALL
SELECT m.id, 'ai-automation-dev-tools', 'Automation in Development: Copilot & Beyond', 'Use AI to automate coding tasks while maintaining quality through discernment.', 2, 20, 45, 1, false, ARRAY['error-message-for-code']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow'
UNION ALL
SELECT m.id, 'rag-in-production', 'RAG in Production', 'Implement Retrieval-Augmented Generation to connect AI to private data and reduce hallucinations.', 3, 25, 55, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow'
UNION ALL
SELECT m.id, 'testing-evaluation', 'Testing & Evaluation Frameworks', 'Build automated testing pipelines to evaluate AI outputs at scale.', 3, 22, 50, 3, false, ARRAY['two-sum']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow'
UNION ALL
SELECT m.id, 'agency-and-agents', 'Agency: Multi-Agent Systems & Autonomy', 'Configure AI agents to work independently, interact with tools, and solve complex multi-step problems.', 4, 25, 60, 4, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow'
UNION ALL
SELECT m.id, 'road-ahead', 'The Road Ahead: AGI, Regulation & Your Career', 'Prepare for the future landscape of AI engineeringâ€”AGI timelines, open-source trends, regulatory shifts, and how to thrive.', 2, 20, 45, 5, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ── 4. SECTIONS ───────────────────────────────────────────────────

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define **AI Fluency** and distinguish it from AI literacy
- Identify the **four core competencies (4Ds)**: Delegation, Description, Discernment, and Diligence
- Understand why fluency is a strategic imperative for AI engineers
- Map the 4Ds to real-world software engineering scenarios$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Core Concept: AI Fluency',
$py$<div class="info">â„¹ï¸ **Definition:** AI Fluency is the ability to work with AI systems in ways that are effective, efficient, ethical, and safe. It combines practical skills, knowledge, insights, and values that help you adapt to evolving AI technologies.</div>

Fluency is distinct from **literacy**. Literacy means you can read and writeâ€”you can craft a prompt. Fluency means you know *when* to prompt, *how* to design the interaction strategically, and *how* to evaluate the results critically.

Think of it like Go programming:
- **Literacy** is knowing the syntax (`func`, `chan`, `interface{}`).
- **Fluency** is knowing when to use channels vs. mutexes, how to structure packages for maintainability, and how to profile and debug production systems.

## The 4Ds Explained

| Competency | Core Question | Go Engineer Analogy |
|------------|---------------|---------------------|
| **Delegation** | What should the AI do vs. what should I do? | Deciding which services to spin off into microservices vs. keeping in the monolith |
| **Description** | How do I clearly instruct the AI? | Writing a clean, well-documented API specification |
| **Discernment** | How do I critically evaluate AI output? | Reviewing a PR for bugs, performance, and edge cases |
| **Diligence** | How do I use AI responsibly and accountably? | Implementing rigorous testing, observability, and compliance in your pipeline |

<div class="tip">ðŸ’¡ **Pro Tip:** Fluency is not a checkboxâ€”it's a practice. The best AI engineers treat the 4Ds as a recurring mental checklist for every interaction.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Examples: The 4Ds in Action',
$py$## Example 1: AI-Assisted Code Review

Imagine you want AI to review a Go PR for concurrency issues.

- **Delegation:** You decide the AI should analyze the locking strategy, but *you* decide if the business logic is correct.
- **Description:** You craft a prompt: *"Review this Go code for data races and potential deadlocks. Assume the code runs in a high-throughput environment."*
- **Discernment:** You evaluate the AI's suggestionsâ€”are they actually valid race conditions, or is the AI hallucinating?
- **Diligence:** You document that AI-assisted review was used, and you manually test the changes before merging.

## Example 2: AI for Documentation Generation

- **Delegation:** You assign the AI to draft documentation for a new package.
- **Description:** You specify: *"Generate a README with installation, usage examples, and API reference for this package."*
- **Discernment:** You check the examples for correctnessâ€”do they actually compile?
- **Diligence:** You update the AI's base prompt with your company's documentation style guide to maintain consistency.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Identify the 4Ds',
$py$Read the following scenario and identify which of the 4Ds (or combination) is being applied.

**Scenario:** Sarah, an AI engineer, asks a model to generate test cases for a Go HTTP handler. She reviews the test cases, modifies two that would fail due to a nuance in the router, and adds a note in the commit message that the tests were AI-generated.

**Your Task:**
Write a short Python script that outputs a dictionary mapping each D to a specific action Sarah took. We'll provide a scaffold.

```python
# TODO: Fill in the actions for each of the 4Ds
# You can use the cheat sheet provided in the course material!

def identify_4ds():
    actions = {
        "Delegation": "",      # What did she ask the AI to do?
        "Description": "",     # How did she structure the request? (inferred)
        "Discernment": "",     # What did she evaluate and correct?
        "Diligence": ""       # What did she do to stay responsible?
    }
    return actions

if __name__ == "__main__":
    result = identify_4ds()
    for d, action in result.items():
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
$py$- **AI Fluency** is a strategic skill, not just a technical one.
- The **4Ds** (Delegation, Description, Discernment, Diligence) are the pillars of fluency.
- Fluency allows you to adapt to new AI models and tools as they emerge.
- As a Go engineer, you already practice many of these competenciesâ€”AI fluency is about applying them to a new medium.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'defining-ai-fluency';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Trace the key milestones in AI history from 1956 to today
- Understand the concept of "AI Winters" and why they occurred
- Recognize the breakthroughs that led to the Generative AI boom
- Place today's LLMs in their proper historical context$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Four Eras of AI',
$py$AI history can be divided into four distinct eras:

## Era 1: The Dawn (1956â€“1974)

The field was founded at the **Dartmouth Workshop** in 1956, where John McCarthy coined the term "Artificial Intelligence." Early optimism was highâ€”researchers believed a fully intelligent machine would be built within a decade. Pioneers focused on symbolic reasoning, theorem proving, and early game-playing programs (like checkers).

<div class="info">â„¹ï¸ **Fun Fact:** The first AI program, the Logic Theorist, was able to prove 38 of the first 52 theorems in Principia Mathematica.</div>

## Era 2: The Winters (1974â€“1990)

Early promises went unfulfilled. Governments cut funding, and the field experienced the first "AI Winter." Progress stalled due to hardware limitations and the realization that symbolic AI couldn't handle real-world complexity. A second winter occurred in the late 1980s when expert systems failed to deliver on their hype.

## Era 3: The Revival (1990â€“2012)

Statistical methods and machine learning emerged. The 1997 victory of IBM's Deep Blue over Kasparov in chess reignited interest, but it was **specialized intelligence**â€”narrow AI. Other highlights: autonomous vehicles in DARPA challenges, and the rise of the internet providing massive datasets.

## Era 4: The Deep Learning Revolution (2012â€“Today)

In 2012, AlexNet demonstrated that deep neural networks on GPUs could dramatically outperform traditional methods in image recognition. This sparked the modern AI boom.

<div class="warning">âš ï¸ **Key Insight:** The Transformers architecture (2017) was the missing piece for languageâ€”it allowed parallel processing of sequences, enabling the scale we see today. By 2022, ChatGPT brought this to the public, marking the beginning of the Generative AI era.</div>

<div class="example">ðŸ“ **Engineering Parallel:** The shift from symbolic AI to deep learning is like the shift from monolithic Go apps to microservicesâ€”it unlocked a massive leap in capabilities by distributing computation (parameter weights) across billions of units.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Milestones Every AI Engineer Should Know',
$py$| Year | Milestone | Significance |
|------|-----------|--------------|
| 1956 | Dartmouth Workshop | AI founded as a formal discipline |
| 1969 | Shakey the Robot | First AI system that could reason about its actions |
| 1997 | Deep Blue beats Kasparov | AI exceeds human capability in a constrained domain (chess) |
| 2012 | AlexNet wins ImageNet | Deep learning proved superior; GPU compute becomes central |
| 2017 | "Attention Is All You Need" | The Transformer architecture is published; the foundation of all modern LLMs |
| 2022 | ChatGPT launch | Generative AI reaches consumer scale; mainstream awareness explodes |
| 2023â€“2025 | Multimodal & Agentic AI | AI systems can see, hear, and act independently |$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Timeline Sort',
$py$Write a Python function that takes a list of year-event strings and returns them sorted chronologically. This reinforces the timeline mentally.

```python
def sort_ai_milestones(milestones):
    """
    Given a list of strings in the format 'Year: Event', 
    return a new list sorted by year ascending.
    """
    # Your code here
    return sorted(milestones, key=lambda x: int(x.split(':')[0]))

# Example test:
test_milestones = [
    "2022: ChatGPT Launch",
    "1956: Dartmouth Workshop",
    "2017: Transformer Architecture",
    "1997: Deep Blue beats Kasparov"
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
$py$- AI has had multiple waves and wintersâ€”success is never linear.
- The Transformer architecture (2017) is the critical breakthrough enabling today's LLMs.
- Generative AI is a new paradigm shift, but it builds on decades of research.
- Understanding history helps you separate hype from real technical progress.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'history-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Distinguish between **Automation**, **Augmentation**, and **Agency**
- Map each mode to the appropriate engineering context
- Recognize when to shift between modes in a production workflow
- Apply the modes to real-world engineering tasks$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Three Modes of Collaboration',
$py$<div class="info">â„¹ï¸ **Core Framework:** How you collaborate with AI is a strategic choice. Anthropic defines three distinct modes, each suited to different tasks.</div>

## 1. Automation

**Definition:** AI performs specific tasks based on specific human instructions. The human defines what needs to be done, and the AI executes it.

**Go Engineer Analogy:** This is like writing a shell script that runs a set of commands. You fully define the sequence, and the machine executes it deterministically.

- **When to use:** Repetitive, well-defined, low-stakes tasks (e.g., formatting code, generating boilerplate, parsing logs).
- **Risk:** Over-automation can obscure edge casesâ€”always review the output.

## 2. Augmentation

**Definition:** Humans and AI collaborate as thinking partners to complete tasks together. Involves iterative back-and-forth where both contribute to the outcome.

**Go Engineer Analogy:** This is pair programming with an extremely knowledgeable junior engineer who can talk at lightning speed. You guide, they draft; you critique, they revise.

- **When to use:** Complex problem-solving, architecture design, debugging, writing documentation.
- **Risk:** Over-reliance can degrade your own critical thinkingâ€”maintain a balanced dialogue.

## 3. Agency

**Definition:** Humans configure AI to work independently on their behalf, including interacting with other humans or AI. The human establishes the AI's knowledge and behavior patterns rather than specifying exact actions.

**Go Engineer Analogy:** This is like deploying a microservice with a specific configuration (environment variables, feature flags) that runs independently and handles requests without your direct supervision.

- **When to use:** Multi-step workflows, monitoring and alerting, automated customer support, agentic pipelines.
- **Risk:** Loss of control. You must implement guardrails, logging, and fallback mechanisms.

<div class="tip">ðŸ’¡ **Pro Tip:** Don't default to one mode. A mature AI workflow often chains them: Agency monitors the system, Augmentation helps you design the fix, and Automation executes the patch.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Examples Across the Spectrum',
$py$## Example 1: Bug Fixing Workflow

- **Automation:** AI runs `go vet` and `go test` automatically to surface failures.
- **Augmentation:** You discuss the root cause with the AI, exploring possible fixes together.
- **Agency:** You configure an AI agent that watches the error log and automatically proposes PRs for known patterns (e.g., nil pointer dereferences).

## Example 2: Documentation Pipeline

- **Automation:** AI extracts all exported functions and generates stub documentation.
- **Augmentation:** You and the AI co-write the narrative introduction.
- **Agency:** An AI agent monitors the main branch and auto-updates the documentation site.

<div class="warning">âš ï¸ **Safety Note:** Agency is the most powerful but also the most dangerous mode. Always start with Automation, then move to Augmentation, and only graduate to Agency with strict evaluation and rollback plans.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Mode Classification',
$py$Given the scenarios below, write a Python function that classifies the primary interaction mode.

```python
def classify_mode(scenario_description):
    """
    Return 'Automation', 'Augmentation', or 'Agency'.
    """
    # Your logic here
    # Hint: Look for keywords like 'independently', 'drafts', 'suggests', 'runs automatically'
    pass

# Test cases:
print(classify_mode("The AI generates a weekly report and emails it to the team without human intervention."))
print(classify_mode("The AI and engineer jointly design a new API contract, iterating on the design."))
print(classify_mode("The AI reformats all source files to match the company style guide."))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Automation** = Execute specific instructions (like a script).
- **Augmentation** = Collaborative thinking partner (like pair programming).
- **Agency** = Independent operation with configured behavior (like a microservice).
- Moving from Automation to Agency increases leverage but requires more rigorous oversight.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'human-ai-interaction-modes';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define and differentiate: ML, DL, NLP, CV, and GenAI
- Visualize how these fields overlap
- Understand where your Go engineering skills fit into the AI stack
- Identify use cases for each subfield$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The AI Family Tree',
$py$Think of the AI ecosystem as a layered set of circles, similar to Go's package hierarchy:

## 1. Machine Learning (ML) â€” The Parent Package

**Definition:** Systems that learn from data rather than being explicitly programmed.

**Subcategories:**
- **Supervised Learning:** Labeled data (e.g., spam detection).
- **Unsupervised Learning:** Unlabeled data (e.g., customer segmentation).
- **Reinforcement Learning:** Learning via rewards/penalties (e.g., game-playing AI).

## 2. Deep Learning (DL) â€” A Specialized Package of ML

**Definition:** A subset of ML using neural networks with multiple layers (â‰¥ 3).

**Why it matters:** DL excels at raw data (images, audio, text) without manual feature engineering. It's the engine behind modern AI.

## 3. Natural Language Processing (NLP) â€” An Interface

**Definition:** AI for understanding, interpreting, and generating human language.

**Tasks:** Translation, sentiment analysis, summarization, question-answering.

## 4. Computer Vision (CV) â€” Another Interface

**Definition:** AI for interpreting visual information (images, video).

**Tasks:** Object detection, facial recognition, autonomous driving.

## 5. Generative AI (GenAI) â€” The Hot New Feature

**Definition:** AI that creates new content (text, images, code, audio) rather than just analyzing or classifying.

**Distinction:** Traditional ML *discriminates* (is this a cat or a dog?). GenAI *generates* (draw a cat). LLMs (like Claude) are a type of GenAI focused on text.

<div class="info">â„¹ï¸ **Relationship Map:** GenAI is a subset of Deep Learning, which is a subset of ML. NLP and CV are application domains that can use DL or GenAI techniques.</div>

<div class="example">ðŸ“ **Go Analogy:** Think of `ai/` as the root package. Inside you have `ml/` (core functionality), `dl/` (optimized sub-package), `nlp/` and `cv/` (specific interfaces), and `genai/` (a new feature flag that builds on all of them).</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Ecosystem in Action',
$py$| Field | Real-World Application | AI Technique Used |
|-------|------------------------|-------------------|
| ML | Fraud detection in banking | Supervised classification (Random Forest) |
| DL | Autonomous vehicle perception | Convolutional Neural Networks (CNNs) |
| NLP | Customer support chatbots | Recurrent Neural Networks (RNNs) / Transformers |
| CV | Medical imaging diagnostics | Deep CNNs |
| GenAI | Code generation (Copilot) | Transformer-based LLMs |

<div class="tip">ðŸ’¡ **Insight for Go Engineers:** Your backend services often sit *above* these AI layers. You call the ML model via REST/gRPC, handle the orchestration, and manage the data pipelines. Your fluency means you understand *what* the AI is doing underneath the hood.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Ecosystem Mapping',
$py$Write a Python function that takes a project description and maps it to the correct AI subfield.

```python
def map_to_ai_field(description):
    """
    Return one of: 'ML', 'DL', 'NLP', 'CV', 'GenAI'
    """
    # Example logic structure:
    # if 'generates' or 'creates' in description -> GenAI
    # if 'images' or 'video' in description -> CV
    # if 'text' or 'language' in description -> NLP
    # Add your own robust mapping!
    pass

# Test case: should map to GenAI
print(map_to_ai_field("A system that writes personalized poetry based on user mood."))

# Test case: should map to CV
print(map_to_ai_field("A system that detects faulty parts on an assembly line from camera feeds."))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **ML** is the broadest category; **DL** is a specialized set of techniques.
- **NLP** and **CV** are applications that can use ML, DL, or GenAI.
- **GenAI** is the current frontier, capable of creation, not just analysis.
- You will primarily interact with GenAI (LLMs) and NLP as an AI engineer.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-ecosystem';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Analyze real-world AI deployments across multiple industries
- Identify the specific AI techniques used in each case
- Understand the business and societal impact of AI
- Draw parallels between these cases and your own engineering work$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'AI Across Sectors',
$py$## Healthcare: Diagnosis and Drug Discovery

- **AI Technique:** Deep Learning (CNNs for medical imaging), NLP for clinical notes, GenAI for molecule generation.
- **Example:** AI systems detect breast cancer in mammograms with accuracy rivaling human radiologists.
- **Fluency Takeaway:** Discernment is criticalâ€”false positives cause anxiety; false negatives cost lives. Engineers must implement rigorous validation and human-in-the-loop.

## Finance: Fraud Detection and Trading

- **AI Technique:** Supervised ML (anomaly detection), Reinforcement Learning (high-frequency trading).
- **Example:** Mastercard uses AI to detect fraudulent transactions in milliseconds.
- **Fluency Takeaway:** Diligence is paramountâ€”compliance with regulations (GDPR, PCI-DSS) and bias avoidance (fair lending) must be baked in.

## Creative Industries: Content Generation

- **AI Technique:** Generative AI (LLMs, Diffusion Models).
- **Example:** Studios use AI for storyboarding, script generation, and even animating backgrounds.
- **Fluency Takeaway:** Description is keyâ€”the quality of the prompt directly determines the quality of the creative output.

## Software Engineering: AI-Powered Development

- **AI Technique:** LLMs for code generation, bug detection, documentation.
- **Example:** GitHub Copilot boosts developer productivity by 30-40%.
- **Fluency Takeaway:** Delegation is centralâ€”knowing *which* coding tasks to offload (boilerplate) vs. which to handle yourself (complex architecture).

<div class="warning">âš ï¸ **Common Pitfall:** Many teams treat AI as a magic box. Fluency requires breaking it down into its components and treating it as an engineering subsystemâ€”with latency, cost, and reliability SLAs.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Case Study: AI in Financial Fraud Detection',
$py$**The Problem:** Fraudsters are adaptive. Rule-based systems (hardcoded if-conditions) cannot keep up with novel patterns.

**The AI Solution:** A gradient-boosted decision tree model trained on historical transaction data. It detects anomalies in real-time.

**The Engineering Integration (where you come in!):**
1. A Go microservice receives transaction events via Kafka.
2. It calls the Python ML model (served via TensorFlow Serving / Ray Serve) over gRPC.
3. The Go service handles the response, logs the reasoning, and triggers alerts.

<div class="tip">ðŸ’¡ **Your Go Advantage:** You already know how to build the reliable, high-throughput infrastructure that serves AI models. Fluency means you can now have intelligent conversations with the data scientists about feature engineering and model drift.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Real-World Case Analysis',
$py$Write a Python function that evaluates the risks of an AI deployment scenario.

```python
def evaluate_ai_risks(industry, ai_technique, stakes):
    """
    Return a dict with risk scores for Bias, Hallucination, and Security (1-5).
    Also suggest one mitigation strategy.
    """
    # Your implementation
    pass

# Example:
# evaluate_ai_risks("Healthcare", "GenAI for summarization", "High")
# Might output: {"bias": 4, "hallucination": 5, "security": 3, "mitigation": "Always have a physician review summaries"}
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- AI is transforming every major industry, but the risks vary by domain.
- Healthcare prioritizes **Discernment**, Finance prioritizes **Diligence**, Creative prioritizes **Description**.
- As an AI engineer, you bridge the gap between model performance and production reliability.
- Your Go skills are the perfect complement to Python-based AI models.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'ai-landscape' AND l.slug = 'ai-real-world-impact';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Distinguish between structured, unstructured, and semi-structured data
- Understand the difference between training, validation, and test datasets
- Recognize the importance of data quality, labeling, and bias
- See how data pipelines feed into model training$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Data Journey',
$py$AI models are essentially statistical machines. Their performance is bound by the **data** they see.

## Types of Data
- **Structured:** Tabular, relational (e.g., SQL databases). Your Go ORMs work with this.
- **Unstructured:** Text, images, audio, video. This is the main playground for LLMs and CV.
- **Semi-structured:** JSON, XML, logsâ€”common in Go microservices.

## The Three Splits
| Split | Purpose | Go Analogy |
|-------|---------|------------|
| **Training** | The model learns patterns from this data (70-80%) | Writing the initial code |
| **Validation** | Used to tune hyperparameters and prevent overfitting (10-15%) | Running internal linters and tests |
| **Test** | Final evaluation; never seen during training (10-15%) | Production canary deployment |

<div class="warning">âš ï¸ **Critical Discernment:** If your test data leaks into training, you get a "false sense of success"â€”like passing tests because you memorized the answers. Always enforce strict separation.</div>

<div class="example">ðŸ“ **Real-World:** ImageNet, the dataset that drove the 2012 deep learning breakthrough, contains 14 million labeled images. Your average Go service might handle millions of API requests, but those are transactionsâ€”AI needs *labeled* data to learn.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Data Pipeline in Go',
$py$While AI models are trained in Python, the data pipeline often runs in Go for performance.

```go
// A typical Go data pipeline stage
type DataProcessor interface {
    Process(ctx context.Context, data []byte) (*TrainingSample, error)
}

type Cleaner struct {
    // Removes PII, normalizes text
}

func (c *Cleaner) Process(ctx context.Context, data []byte) (*TrainingSample, error) {
    // 1. Decode JSON
    // 2. Sanitize fields
    // 3. Validate schema
    // 4. Return TrainingSample for Python model
}
```

This is a crucial bridge: Go handles the scale, Python handles the model training.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Data Quality Check',
$py$Write a Python function that simulates a basic training/test split and identifies data leakage.

```python
import random

def detect_data_leakage(training_ids, test_ids):
    """
    Return True if there is an overlap between training and test sets.
    """
    return set(training_ids) & set(test_ids)  # Non-empty = leakage!

# Simulate a dataset with 100 samples, 80 training, 20 test
data_ids = list(range(100))
random.seed(42)
training_ids = random.sample(data_ids, 80)
test_ids = [x for x in data_ids if x not in training_ids]

print(detect_data_leakage(training_ids, test_ids))  # Should output empty set
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Data quality determines model qualityâ€”clean, labeled data is non-negotiable.
- Strictly separate Training, Validation, and Test sets to avoid leakage.
- Go excels at building the data pipelines that feed Python AI models.
- "Garbage in, garbage out" remains the #1 rule of AI.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'data-the-fuel-of-ai';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Explain the core difference between traditional programming and machine learning
- Understand supervised, unsupervised, and reinforcement learning
- Grasp the intuition behind neural networks (layers, weights, activations)
- Connect these concepts to your Go programming knowledge$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Paradigm Shift',
$py$Traditional programming:

`Rules + Data â†’ Answer`

You write `if/else` logic, loops, and functions. The rules are explicit.

Machine Learning:

`Data + Answers â†’ Rules`

The model discovers the rules from the data. It learns the mapping from input to output.

## Types of Learning
| Type | Input | Output | Example |
|------|-------|--------|---------|
| **Supervised** | Labeled data (X, y) | Predict y for new X | Spam detection |
| **Unsupervised** | Unlabeled data (X) | Find hidden structure | Customer segmentation |
| **Reinforcement** | Agent + Environment | Sequence of actions | Game-playing AI |

## Neural Network Intuition
A neural network is a series of matrix multiplications and non-linear activations.

- **Layer:** A set of neurons. Each neuron computes a weighted sum + bias, then applies an activation function.
- **Weights:** The "knowledge" of the network. These are analogous to the coefficients in a Go math library.
- **Activation:** Adds non-linearity (e.g., ReLU: `max(0, x)`). Without it, the whole network is just a linear regression.

<div class="tip">ðŸ’¡ **Go Engineer's Bridge:** Think of a neural network layer like a pure Go function: `func Layer(input []float64, weights [][]float64, bias []float64) []float64`. It takes an input vector, multiplies it by a weight matrix, adds bias, and applies an activation. No side effects.</div>$py$, 2
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
        # Weighted sum + bias
        total = sum(w * i for w, i in zip(self.weights, inputs)) + self.bias
        return self.sigmoid(total)  # Activation

# A neuron with 3 inputs
neuron = Neuron([0.5, -0.3, 0.8], 0.1)
output = neuron.forward([1.0, 2.0, 3.0])
print(f"Neuron output: {output:.4f}")
```

This is the building block of all deep learning. Modern LLMs have billions of these neurons arranged in layers.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Build a Simple Perceptron',
$py$Complete the `Perceptron` class to implement an AND gate.

```python
class Perceptron:
    def __init__(self, learning_rate=0.1, epochs=10):
        self.weights = [0.0, 0.0]
        self.bias = 0.0
        self.lr = learning_rate
        self.epochs = epochs
    
    def activation(self, x):
        # Step function: return 1 if x >= 0 else 0
        return 1 if x >= 0 else 0
    
    def predict(self, inputs):
        # Calculate weighted sum + bias, then apply activation
        pass  # TODO: implement
    
    def train(self, X, y):
        for _ in range(self.epochs):
            for inputs, target in zip(X, y):
                prediction = self.predict(inputs)
                error = target - prediction
                # Update weights and bias using the error
                # TODO: implement weight update
        return self

# Training data for AND gate
X = [[0, 0], [0, 1], [1, 0], [1, 1]]
y = [0, 0, 0, 1]

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
$py$- ML shifts the burden from writing explicit rules to learning rules from data.
- Supervised/Unsupervised/Reinforcement are the three main paradigms.
- Neural networks are just function approximatorsâ€”lots of linear algebra with non-linearities.
- Your Go logic skills translate well to understanding matrix operations and data flow.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'machine-learning-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Understand the Transformer architecture and its key innovation (Attention)
- Define model **parameters** and why they matter (and don't matter)
- Explain **scaling laws** and emergent capabilities
- Know what a **context window** and **knowledge cutoff** are$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Transformer Revolution',
$py$Before Transformers, RNNs (Recurrent Neural Networks) processed text sequentially. This was slow and lost context over long passages.

**The Breakthrough: Attention**
The Transformer architecture (2017) uses a mechanism called **Self-Attention** that looks at all words in the sequence simultaneously and assigns "importance scores" to relationships between them.

```python
# Simplified Attention (Intuition)
def attention(query, keys, values):
    # query: what we are looking for
    # keys: what we are comparing against
    # values: what we return if keys match query
    scores = dot_product(query, keys) / sqrt(dimension)
    weights = softmax(scores)
    output = weighted_sum(weights, values)
    return output
```

## Key Technical Terms
| Term | Definition | Go Analogy |
|------|------------|------------|
| **Parameters** | The numerical weights inside the model | The configuration variables in your `config.yaml` |
| **Context Window** | Max tokens the model can process in one go | The max size of your `http.Request` body |
| **Knowledge Cutoff** | The date when training stopped | Using a database snapshot from a specific date |
| **Scaling Laws** | The observed improvement in capability as you scale parameters, data, and compute | Moore's Law for AI |

<div class="warning">âš ï¸ **Critical Discernment:** Bigger is not always better. A 7B parameter model fine-tuned on specialized data can outperform a 70B parameter generalist on specific tasks. Fluency means knowing the trade-offs.</div>

<div class="info">â„¹ï¸ **Emergent Capabilities:** As models scale, they suddenly gain abilities they weren't explicitly trained for (e.g., code generation, reasoning). This is a fascinating and still somewhat mysterious property of scaling laws.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Parameters in Python (Simulation)',
$py$Let's simulate why 'emergence' occurs mathematically. We'll just write a quick script to visualize scaling.

```python
# Simulating scaling effects (conceptual)
import math

def estimate_capability(parameter_count, data_volume):
    """A very rough emulation of scaling laws."""
    log_params = math.log10(parameter_count)
    log_data = math.log10(data_volume)
    # Simple linear combination
    score = (log_params * 0.7) + (log_data * 0.3)
    return min(100, max(0, score * 10))

# Test different scales
print("1M params, 1GB data:", estimate_capability(1_000_000, 1))
print("1B params, 1TB data:", estimate_capability(1_000_000_000, 1000))
print("1T params, 10TB data:", estimate_capability(1_000_000_000_000, 10000))
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Context Window Calculator',
$py$Write a function that calculates how many tokens a given text will consume (estimation).

```python
def estimate_tokens(text):
    """
    Rough estimate: 1 token â‰ˆ 4 characters in English.
    Return the token count.
    """
    # TODO: implement
    pass

def can_fit_in_context(text, max_tokens=128000):
    """
    Return True if the text fits in the context window.
    """
    return estimate_tokens(text) <= max_tokens

# Test with a long string
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
$py$- **Transformers** use self-attention to process text in parallel.
- **Parameters** are the configurable weights; scaling laws govern performance.
- **Context window** limits the immediate memory of the model.
- **Knowledge cutoff** defines the temporal boundary of the model's knowledge.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'llm-architecture-deep-dive';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Distinguish between **pre-training**, **fine-tuning**, and **inference**
- Understand why RLHF (Reinforcement Learning from Human Feedback) is used
- Know the cost and time implications of each stage
- Appreciate the engineering pipeline that supports this lifecycle$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Three Stages',
$py$## 1. Pre-training (The Foundation)
- **What:** Training a massive model on billions of tokens (e.g., entire internet, books).
- **Goal:** Learn language, grammar, facts, reasoning.
- **Who does it:** Big tech (OpenAI, Anthropic, Google) due to immense cost ($100M+).
- **Output:** A "base" modelâ€”smart but not necessarily helpful or safe.

## 2. Fine-tuning (The Specialization)
- **Supervised Fine-Tuning (SFT):** Training on high-quality Q&A pairs to make the model follow instructions.
- **RLHF (Reinforcement Learning from Human Feedback):** Humans rank model responses; the model learns to optimize for "helpfulness" and "harmlessness."
- **Who does it:** Organizations and even individuals with modest resources (GPUs).
- **Output:** A helpful, safe, instruction-following assistant.

## 3. Inference (The Serving)
- **What:** Using the trained model to generate responses to new user inputs.
- **Where:** Production systems. This is where you (Go engineer) come in.
- **Cost:** Cheap per request but expensive at scale. You manage latency, throughput, and cost.

<div class="tip">ðŸ’¡ **Go Engineer's Bridge:** Pre-training is like writing the Go standard library. Fine-tuning is like building your specific application on top of it. Inference is running your application in production.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Cost Comparison',
$py$| Stage | Cost Scale | Time Scale | Who handles it? |
|-------|------------|------------|-----------------|
| Pre-training | $10M - $100M | Months | Research orgs |
| Fine-tuning | $1K - $10K | Days | ML Engineers |
| Inference | $0.001 - $0.1 per request | Milliseconds | **You** (Backend/Infra) |

<div class="warning">âš ï¸ **Key Insight:** Your job as an AI engineer often focuses on optimizing inferenceâ€”caching results, batching requests, and choosing the right model size for the task.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Lifecycle Matching',
$py$Write a Python function that maps a given task to the correct stage.

```python
def map_to_stage(task_description):
    """
    Return 'pretraining', 'finetuning', or 'inference'.
    """
    # TODO: Implement logic based on keywords
    pass

# Test cases:
print(map_to_stage("Updating model weights based on user feedback ranking"))  # -> finetuning
print(map_to_stage("Deploying the model to handle 10,000 RPS"))  # -> inference
print(map_to_stage("Training on the entire CommonCrawl dataset"))  # -> pretraining
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Pre-training** builds the foundation (costly, done by major labs).
- **Fine-tuning** makes the model useful for specific tasks (accessible).
- **Inference** is the production phaseâ€”where software engineers excel.
- You will likely interact most with fine-tuning and inference.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-lifecycle';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Control randomness using **Temperature**
- Manage word diversity using **Top-P**
- Structure the model's overall posture using **System Prompts**
- Apply these controls to real-world use cases$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Knobs and Levers',
$py$## Temperature (0.0 to 2.0)
Controls randomness. Lower = more deterministic and focused.
- **0.0:** Always picks the highest probability token. Outputs are consistent (good for factual Q&A).
- **1.0:** Default. Balanced.
- **1.5+:** High randomness. Outputs are creative, surprising, but can become incoherent.

**Analogy:** Think of a glass of water.
- Low temperature (0.0) = ice crystals: stable, structured, predictable.
- High temperature (1.5) = boiling water: bubbling, chaotic, surprising.

## Top-P (Nucleus Sampling)
Cuts off the vocabulary distribution to the top `P` percentage of probability mass.
- **1.0:** All tokens considered.
- **0.9:** Only the top 90% of the most probable tokens are considered.
- **0.5:** Very focused, restricts creativity.

## System Prompts
Sets the overarching context, tone, and rules for the entire conversation.

*Example:*
```
You are a senior Go engineer reviewing a PR. Be concise, focus on concurrency issues, and suggest specific code changes. Do not mention Python.
```

<div class="tip">ðŸ’¡ **Pro Tip:** For production APIs (e.g., your Go backend calling an LLM), use low Temperature (0.0-0.2) for predictable, repeatable results. Use higher Temperature for creative tasks like marketing copy.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Temperature Simulation in Python',
$py$We can simulate the effect of temperature on token selection by modifying a probability distribution.

```python
import math
import random

def softmax_with_temperature(logits, temperature):
    """
    Convert logits to probabilities, scaled by temperature.
    Higher temperature = more uniform probabilities (more randomness).
    """
    if temperature == 0:
        # Greedy: select the highest logit
        return [1.0 if i == max(range(len(logits)), key=lambda i: logits[i]) else 0.0 for i in range(len(logits))]
    
    # Scale logits by 1/temperature
    scaled_logits = [logit / temperature for logit in logits]
    max_logit = max(scaled_logits)
    exp_logits = [math.exp(logit - max_logit) for logit in scaled_logits]
    sum_exp = sum(exp_logits)
    return [e / sum_exp for e in exp_logits]

# Example: 3 possible next words with different scores
logits = [2.0, 1.0, 0.5]
print("Temperature 0.5:", softmax_with_temperature(logits, 0.5))
print("Temperature 1.0:", softmax_with_temperature(logits, 1.0))
print("Temperature 2.0:", softmax_with_temperature(logits, 2.0))
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Build a Temperature Controller',
$py$Write a function that takes a user intent and recommends the best Temperature and Top-P settings.

```python
def recommend_settings(intent):
    """
    Return a tuple (temperature, top_p) based on intent.
    Examples:
    - "math": (0.0, 1.0)
    - "creative writing": (1.0, 0.95)
    - "code generation": (0.2, 0.9)
    - "brainstorming": (1.2, 0.9)
    """
    # TODO: implement mapping
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
$py$- **Temperature** controls randomness (0.0 = deterministic, 1.5+ = chaotic).
- **Top-P** controls vocabulary diversity (focuses on the most likely tokens).
- **System Prompts** set the global behavior and tone.
- As an engineer, you'll tune these for latency, cost, and quality.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'technical-core' AND l.slug = 'ai-behavior-controls';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define the **Product** dimension of Description
- Craft prompts that specify format, structure, and length
- Use audience-awareness to tailor outputs
- Write prompts that produce exactly the artifact you need$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Art of Defining the Outcome',
$py$<div class="info">â„¹ï¸ **Product Description** is about defining *what* you want in terms of outputs, format, audience, and style.</div>

## The 4 Dimensions of Product Description
1. **Format:** JSON, Markdown, CSV, plain text, or `go` source code.
2. **Structure:** Headings, bullet points, numbered steps, or paragraphs.
3. **Length:** Word count, token count, or number of items.
4. **Audience & Style:** Beginner vs. expert, technical vs. executive, formal vs. casual.

**Go Engineer Example:**
```
Generate a README.md for a Go package named 'retry'.
Format: Markdown.
Structure: Title, Description, Installation (go get), Usage (code example), API Reference, and Contributing.
Audience: Go developers with intermediate experience.
Style: Clear, concise, conversational.
```

<div class="warning">âš ï¸ **Common Mistake:** Vague product descriptions lead to vague AI outputs. If you don't know exactly what you want, the AI will guessâ€”and you'll likely be disappointed.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Before vs. After Product Description',
$py$## Before (Vague)
> "Write a function to parse CSV in Go."

**Result:** The AI might produce a 5-line snippet, or a 50-line library. You don't know.

## After (Excellent Product Description)
> "Write a Go function named `ParseCSV` that reads a CSV file from a file path.
> - Input: `filename string`
> - Output: `[][]string` (rows and columns)
> - Should handle quoted fields with commas.
> - Add a `ParseCSVWithConfig` function that accepts a custom delimiter.
> - Output a commented code block with the `import` statements.
> - Format: Full Go source code in a single code block.
> - Audience: Intermediate Go developers.
> - Style: Clean, idiomatic Go with proper error handling (`return error`)."

**Result:** You get exactly the package you need, in the exact style, with no back-and-forth.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Write a Product Description',
$py$Write a Python function that generates a Product Description prompt for a given user goal.

```python
def generate_product_prompt(goal, output_format, audience, style):
    """
    Assemble a full prompt string that clearly defines the Product.
    """
    prompt = f"""
    Goal: {goal}
    Output Format: {output_format}
    Audience: {audience}
    Style: {style}
    
    Please produce the output exactly as described.
    """
    return prompt

# Example
print(generate_product_prompt(
    goal="Generate test cases for a Go API endpoint",
    output_format="Table in Markdown with columns: Test Case, Input, Expected, Pass/Fail",
    audience="QA engineers",
    style="Detailed and exhaustive"
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
$py$- **Product Description** defines the *what*: format, structure, length, audience, and style.
- The more specific you are, the less guesswork the AI has to do.
- A well-defined product description reduces iteration time significantly.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'product-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define the **Process** dimension of Description
- Use **Chain-of-Thought (CoT)** prompting to improve reasoning
- Implement the **Think-First** approach for complex tasks
- Recognize when process guidance is necessary$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Guiding the AI''s Internal Workflow',
$py$<div class="info">â„¹ï¸ **Process Description** is about defining *how* the AI approaches your request, such as providing step-by-step instructions for the AI to follow.</div>

## Chain-of-Thought (CoT) Prompting
Encouraging the model to break down a problem into intermediate steps before giving the final answer.

**Without CoT:**
> "What is the result of 137 * 53?"
> **Answer:** 7261 (Might be correct, but you can't audit the reasoning).

**With CoT:**
> "What is 137 * 53? Show your calculation steps."
> **Answer:**
> 1. 137 * 50 = 6850
> 2. 137 * 3 = 411
> 3. 6850 + 411 = 7261
> **Final Answer:** 7261

## The Think-First Approach
A specific flavor of CoT where you ask the model to structure its reasoning explicitly.

**Prompt:**
"Think first. Identify the key variables, determine the approach, consider edge cases, and then write the final solution."

<div class="tip">ðŸ’¡ **When to use:** Process Description is critical for debugging, architecture design, complex math, and any task where the *path* matters as much as the *destination*.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Process Description in Code Generation',
$py$## Example: API Design

**Prompt (Process-Focused):**
"Design a REST API for a todo list.

Step 1: List the resources and their relationships.
Step 2: Define the CRUD operations for each resource.
Step 3: Specify the request/response schemas (JSON).
Step 4: Provide a Go Gin implementation skeleton.
Think through each step before writing the final code."

**Why it works:** The AI now acts like a junior developer under your guidanceâ€”it doesn't jump straight to code; it reasons out the design first, leading to higher quality output.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Process Description Writer',
$py$Write a Python function that converts a complex task into a process-guided prompt.

```python
def process_guide(task, steps):
    """
    Generate a prompt that forces the AI to follow specific reasoning steps.
    steps: list of strings describing each reasoning step.
    """
    guide = f"Task: {task}\n"
    guide += "Follow these steps in order:\n"
    for i, step in enumerate(steps, 1):
        guide += f"Step {i}: {step}\n"
    guide += "Show your reasoning for each step before providing the final answer."
    return guide

# Test
task = "Refactor a Go codebase to use context.Context for timeouts"
steps = [
    "Identify all external calls (DB, HTTP, gRPC)",
    "Propagate context from main handlers",
    "Replace select with ctx.Done()",
    "Add fallback logic for cancellation"
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
$py$- **Process Description** guides *how* the AI thinks.
- **Chain-of-Thought** improves accuracy on complex tasks.
- **Think-First** adds structure to the reasoning process.
- Use this when the reasoning is as important as the answer.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'process-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define the **Performance** dimension of Description
- Control the AI's tone (concise vs. detailed, challenging vs. supportive)
- Set interaction rules for optimal collaboration
- Design system prompts that embody performance preferences$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Setting the Collaboration Vibe',
$py$<div class="info">â„¹ï¸ **Performance Description** is about defining the AI's behavior during your collaboration, such as whether it should be concise or detailed, challenging or supportive.</div>

## Performance Dimensions

| Dimension | Low / Moderate | High / Expert |
|-----------|----------------|---------------|
| **Detail Level** | Concise, bullet points | Verbose, exhaustive explanation |
| **Tone** | Supportive, encouraging | Critical, challenging (Devil's advocate) |
| **Formality** | Casual, friendly | Formal, authoritative |
| **Interactivity** | Single answer, no follow-up | Ask clarifying questions before answering |

**Go Engineer Example:**
> "Adopt a supportive but critical tone. Point out inefficiencies in my code, but suggest improvements constructively. Keep explanations to 2-3 paragraphs max. Ask me clarifying questions if the requirement is ambiguous."

<div class="tip">ðŸ’¡ **Pro Tip:** The best AI engineers iterate on performance settings. If the AI is too chatty, ask for brevity. If it's too blunt, ask for empathy.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Performance Description in Action',
$py$## Scenario: Code Review

**Without Performance Description:**
AI just lists issues: "Line 10 has a nil pointer dereference."

**With Performance Description:**
"You are a senior Go engineer with 10 years of experience. Review this code as if you are mentoring a junior developer. Be direct but encouraging. Prioritize your feedback: start with critical issues (concurrency, errors), then performance, then readability. Limit your feedback to 5 key points. Suggest exact code changes."

**Result:** You get a prioritized, actionable, and respectful review.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Craft a Performance Prompt',
$py$Write a Python function that takes a user preference and outputs a system prompt.

```python
def system_prompt_for_performance(tone, detail_level, style):
    """
    Generate a system prompt that sets the AI's behavior.
    tone: 'critical', 'supportive', 'neutral'
    detail_level: 'concise', 'balanced', 'exhaustive'
    style: 'formal', 'casual', 'friendly'
    """
    # TODO: construct the prompt
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
$py$- **Performance Description** controls the AI's interpersonal behavior.
- You can set tone, detail, formality, and interactivity.
- Good performance settings make collaboration smoother and more productive.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'performance-description';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Few-shot learning** to teach the AI with examples
- Use **Role/Persona Definition** to unlock expert-level responses
- Set **Output Constraints** to enforce exact formats
- Combine all techniques for complex tasks$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Swiss Army Knife of Prompting',
$py$## Few-shot Learning (N-shot)
Providing 1-5 examples of the desired input-output pairs.

**Example (2-shot):**
```
Translate English to French:
English: "Hello, how are you?"
French: "Bonjour, comment allez-vous?"

English: "I am fine, thank you."
French: "Je vais bien, merci."

English: "Where is the library?"
French: [answer]
```

## Role / Persona Definition
Give the AI a character, expertise, or personality.

**Example:**
> "Act as a senior security engineer. Identify vulnerabilities in this Go code. Explain each vulnerability as if you're teaching a junior developer."

## Output Constraints
Exact specifications on length, structure, and forbidden elements.

**Example:**
> "Generate a list of 3 bullet points. Each bullet must start with an action verb. Maximum 15 words per bullet. Do not mention pricing."

<div class="warning">âš ï¸ **Combining them:** For mission-critical prompts, combine all three. Role defines the expertise, Few-shot provides the style/format examples, Constraints enforce the delivery.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Putting It All Together',
$py$## Task: Generate a Go function to calculate checksums.

**Advanced Prompt:**
> **Role:** You are a seasoned Go architect specializing in performance optimization.
>
> **Few-shot:** Here are two examples of how to write efficient Go functions:
> Example 1: `func Sum(a, b int) int { return a + b }` (simple, no allocations).
> Example 2: `func Concat(s []string) string { var b strings.Builder; for _, v := range s { b.WriteString(v) }; return b.String() }` (efficient builder pattern).
>
> **Task:** Write a function `Checksum(data []byte) string` that returns a SHA-256 checksum as a hex string.
> **Constraint:** The function must handle `nil` slices safely. Must use the `crypto/sha256` package. Maximum 10 lines of code. Include a comment explaining the performance characteristics.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Multi-Technique Prompt',
$py$Write a Python function that assembles a complex prompt using Role, Few-shot, and Constraints.

```python
def assemble_advanced_prompt(role, examples, task, constraints):
    prompt = f"Role: {role}\n\n"
    if examples:
        prompt += "Examples:\n" + "\n".join(examples) + "\n\n"
    prompt += f"Task: {task}\n\nConstraints: {constraints}"
    return prompt

# Test:
role = "Go performance expert"
examples = [
    "Input: 1+1 -> Output: 2 (no allocations)",
    "Input: concat strings -> Output: use strings.Builder"
]
task = "Write a function to parse a large JSON file"
constraints = "Max 20 lines. Use 'json.Decoder' to avoid reading entire file into memory."
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
$py$- **Few-shot** examples are the most efficient way to teach format and style.
- **Role/Persona** unlocks specialized knowledge and tone.
- **Constraints** enforce guardrails on the output.
- Advanced prompting is a multiplierâ€”use all three for best results.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'advanced-prompting';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Generate **structured JSON** outputs from AI
- Understand **Function Calling** (Tools) for deterministic actions
- Build a pipeline that integrates AI outputs into Go services
- Avoid common parsing pitfalls$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'From Natural Language to Production Data',
$py$AI models natively speak text, but your backend speaks JSON, Protobuf, and Go structs. Structured outputs bridge this gap.

## Technique 1: JSON Mode
Many APIs (including Claude) support a JSON mode where the model is forced to output valid JSON.

**Prompt:**
> "Extract the following information from the text and output it as JSON with keys: 'name', 'age', 'city'."

**Result:**
```json
{"name": "Alice", "age": 30, "city": "New York"}
```

## Technique 2: Function Calling (Tool Use)
Instead of generating text, the model returns a JSON object representing a function call.

**Example (Go compatible):**
```json
{
  "name": "get_weather",
  "arguments": {
    "location": "San Francisco",
    "unit": "celsius"
  }
}
```

Your Go service receives this, executes the function, and returns the result to the AI.

<div class="tip">ðŸ’¡ **Go Engineer's Bridge:** This is where your backend shines. You parse the `arguments`, call your existing Go functions (e.g., `GetWeather(loc string)`), and format the response back to the AI. You are effectively extending the AI's capabilities with your Go codebase.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'End-to-End Pipeline',
$py$1. **User Query:** *"What's the weather in Austin?"*
2. **AI (with Tools):** Identifies the need and outputs `{"name": "get_weather", "arguments": {"location": "Austin"}}`.
3. **Your Go Service:** Parses this, calls `weatherApi.Fetch("Austin")`.
4. **Your Go Service:** Sends the weather data back to the AI.
5. **AI:** Formats the data into natural language: *"It's currently 28Â°C and sunny in Austin."*

```go
// Go Struct for parsing AI tool call
type ToolCall struct {
    Name      string          `json:"name"`
    Arguments json.RawMessage `json:"arguments"`
}

func handleToolCall(call ToolCall) (interface{}, error) {
    switch call.Name {
    case "get_weather":
        var args struct{ Location string }
        json.Unmarshal(call.Arguments, &args)
        return GetWeather(args.Location)
    default:
        return nil, errors.New("unknown tool")
    }
}
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: JSON Extractor',
$py$Write a Python function that extracts a specific set of fields from a given text and returns a JSON string.

```python
import json

def extract_to_json(text, fields_to_extract):
    """
    Simulate an AI extraction. For this exercise, you'll write a simple parser
    or use string manipulation to mimic the extraction, but in reality the AI does this.
    We'll just structure it conceptually.
    """
    # In a real app, you'd call the Claude API here with a prompt.
    # Here, we just accept a prompt string.
    prompt = f"Extract the following fields from this text: {', '.join(fields_to_extract)}. Output JSON only. Text: {text}"
    # Simulate the JSON output (in a real app this is the AI response)
    extracted = {field: f"extracted_{field}" for field in fields_to_extract}
    return json.dumps(extracted)

print(extract_to_json("Alice is 30 and lives in NYC.", ["name", "age", "city"]))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **JSON Mode** forces structured data extraction.
- **Function Calling** extends AI capabilities to your Go services.
- Structured outputs are essential for production-grade AI integration.
- Your Go backend is the perfect executor of these AI-generated tool calls.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'prompt-craft' AND l.slug = 'structured-outputs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Product Discernment** to evaluate AI outputs
- Detect **hallucinations** and factual errors
- Assess relevance and coherence of responses
- Build a mental checklist for reviewing AI work$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Art of Critical Evaluation',
$py$<div class="info">â„¹ï¸ **Product Discernment** is evaluating the quality of what AI produces (accuracy, appropriateness, coherence, relevance).</div>

## The Product Discernment Checklist
1. **Accuracy:** Are the facts correct? (e.g., Is the Go syntax correct? Are the historical dates right?)
2. **Coherence:** Does it logically flow? Does it contradict itself?
3. **Relevance:** Does it directly address the question/context?
4. **Completeness:** Is anything critical missing?

## Hallucination Detection
Hallucinations occur when AI confidently states something plausible but false.

**Why they happen:** The AI is a next-token predictor. It doesn't have a "fact-checker." It just predicts the most statistically likely sequence of words, which sometimes results in fictional citations, wrong dates, or incorrect code.

<div class="warning">âš ï¸ **Critical Skill:** Never trust code that you haven't run. Never trust facts that you haven't verified. Product Discernment is your shield against downstream disasters.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Spotting the Hallucination',
$py$**Prompt:** "What is the API for reading a file in Go?"

**AI Output (Hallucinated):**
> "Use the `os.ReadFile` function from the `io` package: `result := io.ReadFile("file.txt")`. It returns a `string` directly."

**Your Product Discernment:**
1. **Accuracy Check:** `os.ReadFile` is in the `os` package, not `io`.
2. **Coherence Check:** It returns `([]byte, error)`, not a `string`.
3. **Correct Answer:** `data, err := os.ReadFile("file.txt")`.

**Action:** Reject the output and re-prompt with the correction.

## Real-World: Legal Case
In a notable case, an AI invented legal citations that didn't exist. The lawyer who used it faced sanctions. Product Discernment would have caught this by verifying the citations against a database.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Hallucination Detector',
$py$Write a Python function that simulates evaluating an AI response for factual consistency based on a knowledge base.

```python
def detect_hallucination(ai_response, known_facts):
    """
    known_facts: dict of key -> correct value.
    Simulates checking the response against ground truth.
    """
    errors = []
    for key, correct_val in known_facts.items():
        if key in ai_response and str(correct_val) not in str(ai_response[key]):
            errors.append(f"Mismatch on {key}: expected '{correct_val}', got '{ai_response.get(key)}'")
    return errors

known = {"go_io_package": "os", "go_readfile_return": "[]byte, error"}
response = {"go_io_package": "io", "go_readfile_return": "string"}
print(detect_hallucination(response, known))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Product Discernment** is critical for fact-checking and coherence.
- **Hallucinations** are a realityâ€”treat AI outputs as draft suggestions.
- Always verify code, citations, and data against authoritative sources.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'product-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Process Discernment** to trace AI reasoning
- Spot logical fallacies and invalid assumptions
- Understand why the process matters as much as the product
- Use chain-of-thought visibility to audit decisions$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Looking Under the Hood',
$py$<div class="info">â„¹ï¸ **Process Discernment** involves evaluating how the AI arrived at its output, looking for logical errors, lapses in attention, or inappropriate reasoning steps.</div>

## Why Process Matters
A correct answer from flawed reasoning is a ticking time bomb. If the logic is broken, the AI might fail catastrophically when the context changes slightly.

## Common Reasoning Errors
1. **Jumping to Conclusions:** Skipping necessary intermediate steps.
2. **Confirmation Bias:** Ignoring contradictory evidence.
3. **False Equivalence:** Treating unrelated things as comparable.
4. **Over-Generalization:** Applying a narrow rule to a broad context.

<div class="tip">ðŸ’¡ **How to Audit:** Force the AI to show its work. "Explain your thought process step-by-step." This makes Process Discernment possible.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Auditing the Process',
$py$**Scenario:** An AI recommends using a simple mutex for a high-throughput Go service.

**AI Reasoning:** "Mutexes are simple to implement and prevent data races."

**Your Process Discernment:**
1. **Logical Flow:** The conclusion is technically correct but incomplete.
2. **Missing Step:** Did the AI consider performance? Did it evaluate `sync.RWMutex` vs `atomic`?
3. **Assumptions:** The AI assumed low contention.
4. **Verdict:** The reasoning is flawed because it ignored the scale. The AI should have asked about QPS first.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Process Audit',
$py$Write a Python function that analyzes the step-by-step reasoning of an AI and flags errors.

```python
def audit_reasoning(steps):
    """
    steps: list of strings representing the AI's reasoning steps.
    Return a list of flagged issues.
    """
    issues = []
    # Simple heuristic: check if step 1 is missing, or if steps jump
    # TODO: Implement more sophisticated logic (e.g., keyword matching for 'maybe', 'always')
    if len(steps) < 3:
        issues.append("Reasoning is too shallow; missing intermediate steps.")
    # Check for over-generalization
    if any("always" in s for s in steps):
        issues.append("Found 'always' - potential over-generalization.")
    return issues

test_steps = [
    "Mutex prevents races.",
    "We should use a mutex."
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
$py$- **Process Discernment** audits the logic, not just the answer.
- Watch for jumps, assumptions, and over-generalizations.
- Asking the AI to 'show its work' enables this audit.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'process-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Performance Discernment** to evaluate interaction dynamics
- Assess whether the AI's tone and style fit the audience
- Recognize overconfidence or under-confidence in AI responses
- Adjust interaction strategies based on performance evaluation$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Human Side of AI Evaluation',
$py$<div class="info">â„¹ï¸ **Performance Discernment** focuses on how the AI behaves during your interaction, considering whether its communication style is effective for your needs.</div>

## Key Evaluation Dimensions
1. **Confidence Calibration:** Is the AI overconfident about uncertain topics? Does it hedge appropriately?
2. **Tone Matching:** Does the tone align with your audience (e.g., executive vs. junior dev)?
3. **Clarity:** Is the AI understandable, or is it hiding behind jargon?
4. **Interactivity:** Does it ask the right clarifying questions?

<div class="warning">âš ï¸ **Overconfidence Risk:** An AI that says "Absolutely certain" for a probabilistic prediction is a warning sign. Fluency means recognizing that AI doesn't have 'belief'â€”it has statistical likelihood.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Performance Evaluation in Practice',
$py$**Scenario:** You ask an AI to explain goroutines to a business executive.

**AI Output:** "Goroutines are lightweight threads managed by the Go runtime. They multiplex onto OS threads and communicate via channels, enabling concurrent execution without heavy overhead."

**Your Performance Discernment:**
1. **Tone:** Too technical for an executive.
2. **Clarity:** Jargon-heavy (multiplex, OS threads).
3. **Adjustment:** Re-prompt: "Explain goroutines to a non-technical CEO. Focus on business value (efficiency, scalability) using analogies."
4. **Result:** "Goroutines let your application handle many tasks simultaneously, like a restaurant kitchen handling many orders at once without burning food."$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Performance Evaluator',
$py$Write a Python function that scores an AI response based on clarity, tone, and conciseness.

```python
def evaluate_performance(response):
    """
    Return a dict with scores for: clarity, tone, conciseness (1-5).
    Provide brief reasoning.
    """
    # Simple heuristics (e.g., count jargon, count words)
    scores = {"clarity": 3, "tone": 3, "conciseness": 3}
    # TODO: implement more robust logic
    return scores

response = "Goroutines are lightweight threads managed by the Go runtime..."
print(evaluate_performance(response))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Performance Discernment** evaluates the quality of the interaction.
- Key metrics: Confidence calibration, tone, clarity, interactivity.
- A fluent engineer adjusts the AI's performance dynamically.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'performance-discernment';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Creation Diligence** to select appropriate AI systems
- Apply **Transparency Diligence** to disclose AI usage appropriately
- Navigate the regulatory landscape (EU AI Act, GDPR)
- Build a personal ethics framework for AI$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Choosing and Disclosing',
$py$<div class="info">â„¹ï¸ **Creation Diligence:** Being thoughtful about which AI systems you use and how you interact with them.</div>

## Creation Diligence Checklist
1. **Capability:** Does this model fit the task (cost, performance, latency)?
2. **Safety:** Is the model aligned? Does it have content filters?
3. **Data Privacy:** Does the provider train on user data? (e.g., API terms of service)
4. **Bias:** Has the model been evaluated for fairness in your domain?

<div class="info">â„¹ï¸ **Transparency Diligence:** Being honest about AI's role in your work with everyone who needs to know.</div>

## Transparency Diligence Checklist
1. **User Facing:** Do users know they are talking to an AI (chatbots, support)?
2. **Internal Use:** Are colleagues aware when AI generated code/documentation?
3. **Regulatory Compliance:** Are you compliant with disclosure requirements (e.g., EU AI Act transparency provisions)?

<div class="tip">ðŸ’¡ **Best Practice:** When in doubt, disclose. A simple comment in a PRâ€”"This test harness was generated with AI assistance"â€”builds trust and sets expectations.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Diligence in Action',
$py$## Scenario: Building an HR Tech Tool
You are building a system that screens resumes.

**Creation Diligence:**
- You evaluate three LLMs for bias against certain demographics.
- You choose a model that shows the lowest bias scores.
- You avoid using a model that stores inputs for training (privacy).

**Transparency Diligence:**
- You add a disclosure: "This tool uses AI to assist in resume screening. Final decisions are made by human recruiters."
- You audit the system weekly and log all AI-assisted decisions.

## The EU AI Act Impact
The EU AI Act categorizes AI systems by risk level. Resume screening is **High Risk**, requiring strict transparency, human oversight, and documentation. Diligence is not optionalâ€”it's legally required.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Diligence Framework',
$py$Write a Python function that evaluates an AI use case and suggests diligence measures.

```python
def diligence_recommendations(use_case, data_type, jurisdiction):
    """
    Return a dict with recommended diligence steps.
    """
    recs = {"creation": [], "transparency": []}
    # TODO: implement logic based on parameters
    # e.g., if 'healthcare' -> require human review
    # if 'EU' -> require GDPR compliance
    return recs

print(diligence_recommendations("Resume screening", "Personal data", "EU"))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **Creation Diligence** = Choosing the right tool for the job (safely).
- **Transparency Diligence** = Being honest about AI involvement.
- Regulatory landscape is evolvingâ€”stay informed (EU AI Act, GDPR).$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'creation-transparency-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Apply **Deployment Diligence** to production AI systems
- Design verification and rollback strategies
- Implement human-in-the-loop safeguards
- Understand bias monitoring and ongoing evaluation$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Taking Responsibility',
$py$<div class="info">â„¹ï¸ **Deployment Diligence:** Taking responsibility for verifying and vouching for the outputs you use or share.</div>

## The Deployment Diligence Pipeline
1. **Offline Testing:** Evaluate the model on a hold-out test set. Measure accuracy, bias, and latency.
2. **Canary Deployment:** Roll out to 1% of users, monitor for errors and complaints.
3. **Human-in-the-Loop (HITL):** For high-stakes decisions, require human approval before execution.
4. **Continuous Monitoring:** Track metrics (accuracy drift, hallucination rate, user feedback).
5. **Rollback Plan:** Have a button to switch off AI and fallback to deterministic rules.

<div class="warning">âš ï¸ **Engineering Reality:** You are legally and professionally accountable for the AI outputs you serve. 'The AI made me do it' is not a valid defense.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Deployment Diligence Checklist',
$py$## Scenario: Deploying a Customer Support AI

1. **Testing:** Evaluate 1000 sample queries. Compare against human agents. Achieve >90% satisfaction.
2. **Canary:** Release to 5% of users for 1 week.
3. **HITL:** If confidence score < 0.8, route to human agent.
4. **Monitoring:** Track (a) unresolved issues, (b) escalation rate, (c) sentiment analysis.
5. **Rollback:** If escalation rate spikes >15%, fallback to rule-based system.

```go
// Go pseudo-code for deployment guardrails
func handleAIResponse(response AIResponse, confidence float64) (string, bool) {
    if confidence < 0.75 {
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
SELECT l.id, 'exercises', 'Practice: Deployment Plan',
$py$Write a Python function that generates a deployment diligence checklist for a given AI use case.

```python
def deployment_checklist(use_case, risk_level):
    """
    Return a structured checklist of tasks to complete before deployment.
    risk_level: 'low', 'medium', 'high'
    """
    checklist = {
        "testing": [],
        "monitoring": [],
        "rollback": [],
        "human_oversight": []
    }
    # TODO: populate based on risk level
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
$py$- **Deployment Diligence** is your final quality gate.
- Always test, monitor, and have a rollback plan.
- Human-in-the-loop is mandatory for high-risk applications.
- You are the accountable engineerâ€”own the AI's outputs.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Use AI-powered dev tools (Copilot, CodeWhisperer) effectively
- Distinguish between automation and augmentation in coding
- Apply Product Discernment to AI-generated code
- Optimize the human-AI pair programming loop$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'AI in Your IDE',
$py$Tools like GitHub Copilot are AI models fine-tuned on billions of lines of code. They excel at pattern completion.

**What they automate:**
- Boilerplate (structs, getters, setters)
- Unit test stubs
- Documentation comments
- Repetitive transformations

**What they don't automate (yet):**
- System architecture
- Security reviews
- Performance tuning

<div class="tip">ðŸ’¡ **Go Engineer's Bridge:** Copilot often suggests Go code that compilesâ€”but it may miss idiomatic patterns (e.g., using `sync.Once` vs a `mutex`). Your discernment is the filter.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Automation in Action',
$py$**Task:** Generate a function to validate email formats in Go.

**AI Suggestion:**
```go
func ValidateEmail(email string) bool {
    return strings.Contains(email, "@") && strings.Contains(email, ".")
}
```

**Your Discernment:**
- **Product:** It's technically a function, but it's weak. It would validate "@." as true.
- **Action:** You delegate the routine task (write a simple check) but augment the solution with a proper regex from `net/mail` package.

**Resulting Go Code:**
```go
import "net/mail"

func ValidateEmail(email string) bool {
    _, err := mail.ParseAddress(email)
    return err == nil
}
```

**Problem Reference:** This lesson uses `error-message-for-code` to practice running Go solutions.$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Copilot Code Review',
$py$Write a Python script that simulates a code review of an AI-generated function.

```python
def review_ai_code(code_snippet, requirements):
    """
    Return a dict with issues found and severity.
    """
    # TODO: implement checks for security, performance, style
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
$py$- AI coding tools excel at automation and boilerplate.
- They cannot replace system design or deep debugging.
- Always review generated codeâ€”it's your responsibility.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'ai-automation-dev-tools';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define **Retrieval-Augmented Generation (RAG)**
- Understand the pipeline: Chunking â†’ Embedding â†’ Retrieval â†’ Generation
- Implement a basic RAG system in Python
- Connect RAG to your Go backend$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The RAG Pipeline',
$py$RAG solves the static knowledge problem. It retrieves relevant documents from a knowledge base and injects them into the context.

## Step-by-Step
1. **Chunking:** Split documents (PDFs, markdown) into smaller pieces.
2. **Embedding:** Convert chunks into vector embeddings (numerical representations).
3. **Indexing:** Store vectors in a vector database (e.g., Pinecone, pgvector).
4. **Retrieval:** On a user query, convert it to a vector, find the top-K similar chunks.
5. **Generation:** Inject the chunks into the system prompt and ask the LLM to answer based on them.

<div class="tip">ðŸ’¡ **Go Engineer's Role:** Your Go service can handle chunking, orchestrate the retrieval (calling a vector DB), and parse the results before passing them to the LLM.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'RAG in Action: Customer Support',
$py$## Problem
A SaaS company wants an AI chatbot that answers questions about their specific API documentation (which wasn't in the model's training data).

## RAG Solution
1. Chunk all API docs into 512-token pieces.
2. Embed them and store in a vector DB.
3. User asks: "How do I authenticate?"
4. System retrieves the specific "Authentication" section from the docs.
5. System prompt: "Based on this documentation snippet, answer the user's question."
6. Result: Accurate, verified answer from the docs.

```python
# Conceptual Python for RAG
def rag_retrieve(query, vector_db, top_k=3):
    query_embedding = embed(query)
    results = vector_db.search(query_embedding, top_k=top_k)
    return [r['text'] for r in results]

def rag_generate(query, context_chunks):
    prompt = f"Context: {context_chunks}\nQuestion: {query}\nAnswer: "
    return generate_llm_response(prompt)
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Basic RAG Simulator',
$py$Write a Python class that simulates a RAG pipeline using a small in-memory vector store.

```python
import numpy as np

class SimpleRAG:
    def __init__(self):
        self.documents = []
        self.embeddings = []
    
    def add_document(self, text):
        # Simulate embedding using length/n-grams for simplicity
        emb = np.array([ord(c) for c in text[:10]] + [0]*10)[:10]
        self.documents.append(text)
        self.embeddings.append(emb)
    
    def retrieve(self, query, top_k=1):
        # Simple cosine similarity on fake embeddings
        query_emb = np.array([ord(c) for c in query[:10]] + [0]*10)[:10]
        # TODO: compute similarity and return top_k
        pass
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- **RAG** connects AI to private, up-to-date knowledge.
- Pipeline: Chunk â†’ Embed â†’ Retrieve â†’ Generate.
- It is the standard architecture for enterprise AI applications.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Build evaluation datasets for AI testing
- Implement automated scoring metrics (ROUGE, BLEU, exact-match)
- Use A/B testing for model comparison
- Integrate evaluations into your CI/CD pipeline$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Testing the Unpredictable',
$py$Unlike deterministic Go code, AI output is probabilistic. Testing requires a different approach.

## Types of Evaluation
1. **Exact Match:** Does the output exactly match the expected string? (Good for code generation).
2. **ROUGE/BLEU:** Overlap of n-grams between generated and reference texts. (Good for summarization).
3. **LLM-as-a-Judge:** Use a strong model to grade the output (e.g., Claude grading a smaller model).
4. **Human Evaluation:** Manual quality review (gold standard).

## Evaluation Pipeline
1. **Test Set:** Curate a dataset of 500+ examples (input, expected_output).
2. **Run:** Pass all inputs to the AI model.
3. **Score:** Compare outputs to expected using metrics.
4. **Threshold:** If score < 85%, block deployment.

<div class="tip">ðŸ’¡ **Go Integration:** Your Go CI/CD pipeline can call a Python evaluation script, parse the results, and fail the build if scores are below threshold.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Evaluation in Practice (Problem Reference)',
$py$This lesson references the existing problem **`two-sum`**. Students will solve this Go problem, but the lesson extends it by teaching them to write an *evaluator* for a hypothetical AI that generates two-sum solutions.

```python
# Example evaluator
def evaluate_ai_solution(ai_output, test_cases):
    """Check if the AI-generated code passes all test cases."""
    # In reality, we'd run the code. Here we simulate.
    pass
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Build an Evaluator',
$py$Write a Python function that calculates the exact-match accuracy of AI-generated answers.

```python
def exact_match_accuracy(predictions, ground_truth):
    """
    Calculate the percentage of exact matches.
    """
    correct = sum(1 for p, g in zip(predictions, ground_truth) if p.strip() == g.strip())
    return correct / len(predictions) * 100

preds = ["Hello", "World", "foo"]
truth = ["Hello", "World", "bar"]
print(f"Accuracy: {exact_match_accuracy(preds, truth)}%") # 66.6%
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- AI testing requires dedicated evaluation datasets.
- Metrics range from exact match to LLM-as-a-Judge.
- Integrate evaluation into CI/CD to catch regressions.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'testing-evaluation';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Define AI **Agency** and multi-agent systems
- Understand the architecture of agentic workflows
- Design a tool-calling agent in Python
- Implement guardrails for autonomous AI$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Next Frontier: Agentic AI',
$py$<div class="info">â„¹ï¸ **Agency:** When humans configure AI to work independently on their behalf, including interacting with other humans or AI.</div>

## Agent Architecture
1. **Planning:** Agent breaks down a complex goal into sub-tasks.
2. **Tool Use:** Agent calls external APIs (weather, calendar, code execution).
3. **Reflection:** Agent evaluates its own outputs and retries if needed.
4. **Coordination:** Multiple agents collaborate (e.g., one researches, one writes, one reviews).

## Popular Frameworks
- LangChain / LangGraph
- AutoGen (Microsoft)
- CrewAI

<div class="warning">âš ï¸ **Engineering Reality:** Agency is powerful but complex. Implement strict timeouts, token budgets, and allowlists for tool calls to prevent runaway loops or costly mistakes.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Agency in Code: A Simple Agent',
$py$```python
# Conceptual agent loop
class SimpleAgent:
    def __init__(self, tools, max_steps=5):
        self.tools = tools
        self.max_steps = max_steps
    
    def run(self, goal):
        context = [{"role": "system", "content": "You are an agent. Use tools to achieve your goal."}]
        context.append({"role": "user", "content": goal})
        
        for step in range(self.max_steps):
            response = call_llm(context)
            # If the LLM calls a tool, execute it and add result to context
            if "tool_call" in response:
                tool_name = response["tool_call"]["name"]
                tool_args = response["tool_call"]["arguments"]
                result = self.tools[tool_name](**tool_args)
                context.append({"role": "tool", "content": result})
            else:
                # Final answer
                return response
        return "Max steps exceeded"
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Design an Agent',
$py$Write a Python class for an agent that can perform a web search and analyze the results (simulated).

```python
class ResearchAgent:
    def __init__(self):
        # TODO: define tools
        pass
    
    def search(self, query):
        # Simulate web search
        return f"Results for {query}: [simulated result]"
    
    def analyze(self, content):
        # Simulate analysis using an LLM
        pass
    
    def run(self, research_question):
        # TODO: chain search + analyze
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
$py$- **Agency** enables autonomous, multi-step problem solving.
- Agents use tools to interact with the real world.
- Safety and guardrails are non-negotiable in production.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'agency-and-agents';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What You''ll Learn',
$py$By the end of this lesson, you will:

- Understand the discourse around AGI timelines
- Navigate the open-source vs. closed-source debate
- Anticipate regulatory changes (EU AI Act, US Executive Orders)
- Chart your career path as an AI Engineer$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'The Future is Unwritten (But We Can Prepare)',
$py$## AGI Timelines
- **Optimists (OpenAI, DeepMind):** AGI by 2029-2035.
- **Skeptics (Gary Marcus, Yan LeCun):** Decades away; current systems lack true understanding.
- **Practical Reality:** Even if AGI is distant, narrow AI will continue to transform industries.

## Open-Source vs. Closed-Source
- **Closed:** OpenAI, Anthropic, Google. Best models, but controlled.
- **Open:** Llama, Mistral, DeepSeek. Democratizing AI, but may lag behind SOTA.
- **Your Strategy:** Learn both paradigms. Build with APIs, but also run models locally.

## Regulatory Landscape
- **EU AI Act:** Risk-based regulation. Fines up to â‚¬35M.
- **US:** Executive Orders on safety, voluntary commitments.
- **UK:** Pro-innovation approach.

<div class="tip">ðŸ’¡ **Career Advice:** The market for AI engineers is exploding. Your Go backend expertise combined with AI fluency makes you uniquely valuable. Focus on *infrastructure*â€”how to serve, scale, and secure AI. That's where the real demand is.</div>$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Your Career Roadmap',
$py$## Path 1: Backend AI Engineer
- Build Go services that orchestrate AI calls.
- Implement caching, rate limiting, and fallback.
- Monitor latency and costs.

## Path 2: ML Platform Engineer
- Build internal tools for data scientists.
- Manage model registries, feature stores.
- Optimize training infrastructure.

## Path 3: Applied AI Researcher
- Fine-tune open-source models for specific domains.
- Implement cutting-edge research (RAG, agents).
- Collaborate with data scientists.

<div class="info">â„¹ï¸ **Fluency is your differentiator:** Many engineers can code. Fewer can strategically deploy AI with discernment and diligence. You now have both.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Future-Proofing Plan',
$py$Write a Python function that generates a personalized study plan for an AI Engineer based on their current skills.

```python
def career_roadmap(current_skills, desired_role):
    """
    Return a list of recommended learning resources and skills.
    """
    # TODO: implement mapping
    pass

print(career_roadmap(["Go", "Python"], "AI Infrastructure"))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding', '', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- AGI is uncertain, but AI transformation is certain.
- Stay fluent with both open and closed models.
- Regulations are comingâ€”prepare for compliance.
- Your unique value is at the intersection of AI and production engineering.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'road-ahead';

UPDATE lesson_sections SET metadata = $json${
                "question": "Which of the following best describes AI Fluency?",
                "options": [
                  "Knowing how to write effective prompts for ChatGPT",
                  "The ability to work with AI systems effectively, efficiently, ethically, and safely",
                  "Understanding how transformers work under the hood",
                  "Being able to train a neural network from scratch"
                ],
                "correct_index": 1,
                "explanation": "AI Fluency encompasses effective, efficient, ethical, and safe collaboration with AI. While prompt writing (A) is part of it, fluency is broader, covering delegation, discernment, and diligence as well. Understanding transformers (C) is technical knowledge, and training networks (D) is a specialized skillâ€”neither defines full fluency."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'defining-ai-fluency');

UPDATE lesson_sections SET metadata = $json${
                "question": "What was the major contribution of the 2017 paper 'Attention Is All You Need'?",
                "options": [
                  "It introduced the Transformer architecture for processing sequences in parallel",
                  "It proved that neural networks could never surpass human performance",
                  "It invented the first AI winter prevention strategy",
                  "It introduced the concept of reinforcement learning from human feedback"
                ],
                "correct_index": 0,
                "explanation": "The Transformer architecture, introduced in 'Attention Is All You Need', enabled parallel processing of sequences via self-attention, making it scalable and foundational for all modern LLMs like GPT, Claude, and Gemini."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'history-of-ai');

UPDATE lesson_sections SET metadata = $json${
                "question": "An AI engineer configures a system that monitors production metrics and independently creates GitHub issues with severity labels when anomalies are detected. What interaction mode is this?",
                "options": [
                  "Automation",
                  "Augmentation",
                  "Agency",
                  "Discernment"
                ],
                "correct_index": 2,
                "explanation": "This is Agency because the AI is configured to work independently (creating issues) on behalf of the engineer, without specifying exact actions for each anomaly. It has autonomy within defined parameters."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'human-ai-interaction-modes');

UPDATE lesson_sections SET metadata = $json${
                "question": "Which of the following statements about Generative AI is TRUE?",
                "options": [
                  "Generative AI can only generate text, not code or images",
                  "Generative AI is a subset of Deep Learning that creates new content",
                  "Generative AI is entirely separate from Machine Learning",
                  "Generative AI does not require training data"
                ],
                "correct_index": 1,
                "explanation": "Generative AI is a subset of Deep Learning (which is a subset of ML) focused on creating new content (text, images, audio, code). It relies heavily on training data and is not separate from ML."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'ai-ecosystem');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary reason AI is used in software engineering (e.g., Copilot) rather than just traditional IDEs?",
                "options": [
                  "AI can predict future coding trends",
                  "AI can generate boilerplate and suggest completions, reducing context switching",
                  "AI is faster than the Go compiler",
                  "AI replaces the need for code reviews"
                ],
                "correct_index": 1,
                "explanation": "AI in software engineering primarily augments developers by generating boilerplate, suggesting completions, and automating repetitive tasks. It does not replace code reviews or the Go compiler, and it cannot predict the future."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'ai-landscape' AND l2.slug = 'ai-real-world-impact');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary purpose of a validation dataset in machine learning?",
                "options": [
                  "To finalize the model's accuracy score for marketing",
                  "To tune hyperparameters and prevent overfitting during training",
                  "To train the model on the most complex examples",
                  "To replace the need for a test set"
                ],
                "correct_index": 1,
                "explanation": "The validation dataset is used during training to tune hyperparameters and monitor for overfitting. The test set is used only once at the end for final evaluation."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'data-the-fuel-of-ai');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary role of an activation function in a neural network?",
                "options": [
                  "To compress the input data to save memory",
                  "To introduce non-linearity, allowing the network to learn complex patterns",
                  "To ensure all weights are positive",
                  "To speed up the training process by reducing matrix size"
                ],
                "correct_index": 1,
                "explanation": "Activation functions introduce non-linearity into the network. Without them, stacking layers would just be linear transformations, which cannot represent complex functions."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'machine-learning-basics');

UPDATE lesson_sections SET metadata = $json${
                "question": "What does the 'knowledge cutoff' of an AI model refer to?",
                "options": [
                  "The maximum number of API calls allowed per day",
                  "The date after which the model has no knowledge of world events, as it was trained only on data up to that point",
                  "The maximum context window length in tokens",
                  "The threshold at which the model starts hallucinating"
                ],
                "correct_index": 1,
                "explanation": "The knowledge cutoff is the date when the model's training data was collected. It does not know anything about events that occurred after that date. This is important for discerning its limitations."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'llm-architecture-deep-dive');

UPDATE lesson_sections SET metadata = $json${
                "question": "Reinforcement Learning from Human Feedback (RLHF) is primarily applied during which stage of the AI lifecycle?",
                "options": [
                  "Pre-training",
                  "Fine-tuning",
                  "Inference",
                  "Data collection"
                ],
                "correct_index": 1,
                "explanation": "RLHF is used during the fine-tuning stage to align the model's behavior (helpfulness/harmlessness) with human preferences. It occurs after pre-training but before the model is deployed for inference."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'ai-lifecycle');

UPDATE lesson_sections SET metadata = $json${
                "question": "If you are building a customer support bot that needs to provide consistent, factual answers about shipping times, what Temperature should you set?",
                "options": [
                  "1.5",
                  "1.0",
                  "0.2",
                  "2.0"
                ],
                "correct_index": 2,
                "explanation": "A low temperature (0.2) reduces randomness, making the model more deterministic and focused on the highest probability tokens. This ensures consistent, factual responsesâ€”critical for customer support where precision matters."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'technical-core' AND l2.slug = 'ai-behavior-controls');

UPDATE lesson_sections SET metadata = $json${
                "question": "Which of the following is an example of Product Description?",
                "options": [
                  "\"Think step-by-step before answering.\"",
                  "\"Output a JSON object with keys 'name' and 'age'.\"",
                  "\"Be concise and professional in tone.\"",
                  "\"Use chain-of-thought reasoning.\""
                ],
                "correct_index": 1,
                "explanation": "Specifying output format (JSON object) is Product Description. 'Think step-by-step' is Process Description. 'Be concise' is Performance Description."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'product-description');

UPDATE lesson_sections SET metadata = $json${
                "question": "Chain-of-Thought prompting is primarily used to:",
                "options": [
                  "Shorten the AI's response time",
                  "Force the AI to generate longer responses",
                  "Encourage the AI to break down complex problems into reasoning steps for better accuracy",
                  "Restrict the AI to only using factual data"
                ],
                "correct_index": 2,
                "explanation": "Chain-of-Thought encourages explicit reasoning steps, which improves accuracy on multi-step problems by making the logic transparent and reducing shortcut errors."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'process-description');

UPDATE lesson_sections SET metadata = $json${
                "question": "Which of the following prompt instructions is an example of Performance Description?",
                "options": [
                  "\"Use JSON format for the output.\"",
                  "\"Provide a step-by-step solution.\"",
                  "\"Be concise and adopt a supportive tone.\"",
                  "\"Include a code example.\""
                ],
                "correct_index": 2,
                "explanation": "Adopting a specific tone and brevity is Performance Description (defining how the AI behaves). Format is Product, steps are Process."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'performance-description');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary benefit of Few-shot learning?",
                "options": [
                  "It reduces the model's token usage significantly",
                  "It teaches the model the desired output pattern and format through examples",
                  "It forces the model to be more creative",
                  "It disables the model's safety filters"
                ],
                "correct_index": 1,
                "explanation": "Few-shot learning provides examples that demonstrate the expected input-output relationship, which helps the model understand the specific format, style, or logic you want, often outperforming lengthy text instructions."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'advanced-prompting');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary advantage of using Function Calling (Tools) over asking the AI to generate text containing JSON?",
                "options": [
                  "It makes the AI's response shorter",
                  "It provides a deterministic, machine-readable contract that your backend can reliably parse and execute",
                  "It allows the AI to bypass safety filters",
                  "It uses less compute than text generation"
                ],
                "correct_index": 1,
                "explanation": "Function Calling provides a structured, deterministic contract (like a well-defined gRPC API). It guarantees the shape of the arguments, making it much safer and more reliable for production integration than hoping the AI correctly formats a JSON string inside text."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'prompt-craft' AND l2.slug = 'structured-outputs');

UPDATE lesson_sections SET metadata = $json${
                "question": "Why do LLMs sometimes hallucinate factual information?",
                "options": [
                  "They are programmed to lie to test users",
                  "They are trained to generate plausible text based on statistical patterns, not to verify facts against a definitive knowledge base",
                  "They have limited memory and forget the correct answer",
                  "They are intentionally designed to be creative at the expense of accuracy"
                ],
                "correct_index": 1,
                "explanation": "LLMs are next-token predictors trained on massive text data. They excel at generating text that *looks* correct (plausible), but they don't have an internal fact-checking mechanism or a lookup table of absolute truths. This makes hallucination an inherent risk."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'product-discernment');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary goal of Process Discernment?",
                "options": [
                  "To ensure the final output is grammatically correct",
                  "To evaluate the validity of the AI's reasoning steps and identify logical gaps",
                  "To shorten the AI's response time",
                  "To replace the need for human decision-making"
                ],
                "correct_index": 1,
                "explanation": "Process Discernment focuses on the *how*â€”the chain of reasoning. It ensures the logical path is sound, which is crucial for high-stakes tasks where flawed logic could lead to costly mistakes even if the immediate answer seems right."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'process-discernment');

UPDATE lesson_sections SET metadata = $json${
                "question": "You ask an AI for a summary of a complex technical issue to present to your non-technical CEO. The AI returns a response full of jargon and mathematical formulas. Which aspect of Discernment needs to be applied?",
                "options": [
                  "Product Discernment",
                  "Process Discernment",
                  "Performance Discernment",
                  "Deployment Diligence"
                ],
                "correct_index": 2,
                "explanation": "Evaluating the tone, clarity, and appropriateness of the communication style for the audience falls under Performance Discernment."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'performance-discernment');

UPDATE lesson_sections SET metadata = $json${
                "question": "A developer uses an AI to draft code commits. The developer does not mention this in the PR description. Which diligence principle is being violated?",
                "options": [
                  "Creation Diligence",
                  "Transparency Diligence",
                  "Deployment Diligence",
                  "Process Discernment"
                ],
                "correct_index": 1,
                "explanation": "Transparency Diligence requires being honest about AI's role in your work. Not disclosing AI-generated code in the PR violates this principle, as reviewers are unaware of the AI's involvement."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'creation-transparency-diligence');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the primary purpose of a Canary Deployment in the context of AI systems?",
                "options": [
                  "To train the AI model on new data incrementally",
                  "To reduce infrastructure costs by limiting usage",
                  "To test the AI system on a small subset of real users before full rollout, allowing safe monitoring and early detection of issues",
                  "To bypass the need for human oversight"
                ],
                "correct_index": 2,
                "explanation": "Canary deployment gradually exposes the AI system to live traffic. It minimizes blast radiusâ€”if the AI starts hallucinating badly, only a small group is affected, and you can quickly rollback."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'responsible-ai' AND l2.slug = 'deployment-diligence');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the best practice for using AI coding assistants like Copilot?",
                "options": [
                  "Accept all suggestions blindly to maximize speed",
                  "Use the suggestions as a starting point, but always review, test, and understand the code before committing",
                  "Only use it for languages you don't know",
                  "Avoid it entirely because it reduces learning"
                ],
                "correct_index": 1,
                "explanation": "AI coding tools are powerful assistants, not replacements. Always review, test, and understand the code. This applies Product Discernment and Deployment Diligence."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'ai-automation-dev-tools');

UPDATE lesson_sections SET metadata = $json${
                "question": "Why does RAG reduce hallucinations?",
                "options": [
                  "It disables the AI's creative generation abilities",
                  "It grounds the AI's response in specific, provided context documents rather than relying purely on its parametric memory",
                  "It reduces the model's temperature to zero",
                  "It preemptively deletes the model's knowledge cutoff"
                ],
                "correct_index": 1,
                "explanation": "RAG provides authoritative context from a knowledge base. The model is forced to base its answer on this provided context, which dramatically reduces the chance of fabricating facts outside its training data."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'rag-in-production');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the purpose of using an LLM-as-a-Judge for evaluation?",
                "options": [
                  "To replace human evaluators entirely without any oversight",
                  "To provide a scalable, cost-effective way to assess subjective qualities like helpfulness and reasoning quality",
                  "To make the evaluation process slower and more expensive",
                  "To eliminate the need for a test dataset"
                ],
                "correct_index": 1,
                "explanation": "LLM-as-a-Judge uses a capable model (like Claude) to evaluate responses on nuanced criteria (helpfulness, reasoning). It's scalable and aligns well with human preferences, though it still benefits from human oversight for calibration."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'testing-evaluation');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is a critical risk when deploying AI agents with tool-calling capabilities?",
                "options": [
                  "The agent might refuse to call any tools",
                  "The agent could execute harmful actions (e.g., deleting data, sending emails) if not properly sandboxed and guardrailed",
                  "The agent will always be too slow to be useful",
                  "The agent will automatically improve itself beyond human control"
                ],
                "correct_index": 1,
                "explanation": "The primary risk of tool-calling agents is unintended execution. Without strict allowlists, validation, and human approval for destructive actions, an agent could inadvertently cause real-world damage."
              }$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
  AND lesson_id = (SELECT l2.id FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'ai-fluency' AND m2.slug = 'engineering-workflow' AND l2.slug = 'agency-and-agents');

UPDATE lesson_sections SET metadata = $json${
                "question": "What is the best approach for a software engineer aiming to enter the AI field today?",
                "options": [
                  "Quit software engineering to become a data scientist exclusively",
                  "Wait for AGI to solve everything before learning anything",
                  "Build on existing backend skills, master AI fluency, and focus on the infrastructure and productionization of AI systems",
                  "Ignore AI entirely and focus solely on legacy systems"
                ],
                "correct_index": 2,
                "explanation": "The demand is for engineers who can *productionize* AI. Your existing software engineering skills (scalability, reliability, security) are the perfect complement to AI models."
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
SELECT l.id, 'mini-rag-system', 'Mini RAG System: Build a Document QA Bot', 'Build a complete RAG pipeline that answers questions about a provided set of text documents.',
$py$1. Implement chunking: split text into overlapping chunks of 200 words.
2. Implement embedding: use a simple TF-IDF vectorizer (or a mock embedding for simulation).
3. Implement retrieval: find the top-3 chunks for a query using cosine similarity.
4. Implement generation: format the retrieved chunks into a prompt and call a mock LLM (or print the prompt).
5. Write a command-line interface that loads documents and answers user questions.
6. Add a 'confidence' score based on retrieval distance.$py$,
$py$import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

class MiniRAG:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.chunks = []
        self.vectors = None

    def chunk_document(self, text, chunk_size=200):
        # TODO: split text into overlapping chunks
        pass

    def add_documents(self, texts):
        # TODO: chunk and vectorize all documents
        pass

    def retrieve(self, query, top_k=3):
        # TODO: compute similarity and return top_k chunks
        pass

    def answer(self, query):
        chunks = self.retrieve(query)
        # TODO: format prompt and call LLM (simulate with print)
        pass

if __name__ == "__main__":
    rag = MiniRAG()
    docs = ["The capital of France is Paris.", "Berlin is the capital of Germany."]
    rag.add_documents(docs)
    print(rag.answer("What is the capital of France?"))$py$, 4, 200, ARRAY['For chunking, split on newlines first, then paragraphs, then sentences.', 'Use cosine similarity from sklearn.metrics.pairwise.', 'In your generation step, use a simple template: ''Context: {chunks}\nQuestion: {query}\nAnswer:''', 'If you want to test with a real LLM, use the Claude API (but we simulate here).']::TEXT[], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'engineering-workflow' AND l.slug = 'rag-in-production'
ON CONFLICT (lesson_id, slug) DO NOTHING;

INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'bias-detector', 'AI Bias Detector Tool', 'Build a Python tool that evaluates a dataset for potential bias using statistical methods.',
$py$1. Load a CSV dataset with a sensitive attribute (e.g., gender, race) and a target variable.
2. Calculate demographic parity: (selection rate per group).
3. Calculate equal opportunity: true positive rate per group.
4. Generate a report highlighting statistically significant disparities.
5. Suggest mitigations (re-weighting, re-sampling).$py$,
$py$import pandas as pd
import numpy as np
from scipy import stats

class BiasDetector:
    def __init__(self, df, sensitive_col, target_col, label_col='predicted'):
        self.df = df
        self.sensitive_col = sensitive_col
        self.target_col = target_col
        self.label_col = label_col

    def demographic_parity(self):
        # TODO: Calculate selection rate per group
        pass

    def equal_opportunity(self):
        # TODO: Calculate true positive rate per group
        pass

    def run_report(self):
        # TODO: Print a formatted report with statistics
        pass

# Example usage:
# df = pd.read_csv('your_data.csv')
# detector = BiasDetector(df, 'gender', 'hired', 'ai_decision')
# detector.run_report()$py$, 4, 200, ARRAY['Use `groupby` in Pandas to aggregate metrics per group.', 'For true positive rate: `TP / (TP + FN)`.', 'Use Cohen''s h or chi-squared tests to measure significance of differences.']::TEXT[], 2, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'ai-fluency' AND m.slug = 'responsible-ai' AND l.slug = 'deployment-diligence'
ON CONFLICT (lesson_id, slug) DO NOTHING;


COMMIT;
