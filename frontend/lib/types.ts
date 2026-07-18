export type User = {
  id: string;
  name: string;
  username: string;
  studentId: string;
  role: string;
  colorIndex: number;
  xp: number;
  level: number;
  solvedCount: number;
  attemptedCount: number;
  streak: number;
  verified?: boolean;
  google_avatar_url?: string;
  google_linked?: boolean;
  usernameSet?: boolean;
  primaryLanguage?: string;
};

export type ProblemDifficulty =
  | "Beginner"
  | "Easy"
  | "Medium"
  | "Hard"
  | "Expert";

export type Problem = {
  id: string;
  slug: string;
  title: string;
  module: string;
  difficulty: number;
  xpReward: number;
  solved: boolean;
  status: "active" | "draft" | "error";
  visible: boolean;
  successRate: number;
  estTimeMinutes: number;
  tags: string[];
  statement?: string;
  constraints?: string;
  learningObjective?: string;
  descriptionMarkdown?: string;
  examples?: { id: string; input: string; expected: string; ordinal: number }[];
  func_name?: string;
  return_type?: string;
  param_types?: string[];
  hints?: string[];
  total_submissions?: number;
  success_rate?: number;
  author_id?: string;
  author_name?: string;
  language_versions?: Record<string, {
    func_name: string;
    return_type: string;
    param_types: string[];
  }>;
};

export type UserProblemTestCase = {
  input: any; // Can be parsed JSON
  expected: string;
  is_hidden: boolean;
  ordinal: number;
};

export type UserProblem = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  statement: string;
  func_name: string;
  return_type: string;
  param_types: string[];
  hints: string[];
  difficulty: number;
  xp_reward: number;
  tags: string[];
  test_cases: UserProblemTestCase[];
  author_name?: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
};

export type AdminStats = {
  total_problems: number;
  active_problems: number;
  total_submissions: number;
  total_ai_calls: number;
  ai_calls_today: number;
};

export type AIUsageStats = {
  total_ai_calls: number;
  ai_calls_today: number;
  ai_calls_this_week: number;
  success_rate: number;
  avg_response_time_ms: number;
};

export type ActivityLog = {
  id: string;
  type: string;
  message: string;
  color: string;
  icon: string;
  created_at: string;
};

export type Submission = {
  id: string;
  problem_id: string;
  language: string;
  code: string;
  status: "passed" | "failed" | "compiler_error" | "timeout";
  passed_count: number;
  total_count: number;
  output_logs: string;
  runtime_ms: number;
  created_at: string;
};

export type ProgressByDifficulty = {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
};

export type UserProfile = {
  id: string;
  student_id: string;
  username: string;
  name: string;
  bio?: string;
  color_index: number;
  xp: number;
  level: number;
  global_rank: number;
  created_at: string;
  google_avatar_url?: string;
  stats: {
    solved_count: number;
    attempted_count: number;
    average_stars: number;
    best_runtime_ms: number;
    current_streak_days: number;
  };
  progress_by_difficulty: ProgressByDifficulty;
  module_proficiency: Record<string, { solved: number; total: number }>;
  recent_submissions: Submission[];
};

export type PublicUserData = {
  id: string;
  name: string;
  username: string;
  role: string;
  color_index: number;
  xp: number;
  level: number;
  solved_count: number;
  streak: number;
  google_avatar_url?: string;
  verified: boolean;
};

export type CommunitySolution = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar_url?: string;
  verified: boolean;
  problem_id: string;
  problem_slug?: string;
  language: string;
  code: string;
  runtime_ms: number;
  likes: number;
  has_liked: boolean;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
};

export type LeaderboardEntry = {
  rank: number;
  user: User;
  bestTimeMs: number;
  rankDelta: number; // e.g., 2 for up 2, -1 for down 1
};

export type TestResult = {
  id: string;
  name: string;
  passed: boolean;
  executionTimeMs: number;
  output?: string;
  expectedOutput?: string;
};

export type BackendTestResult = {
  test_case_id: string;
  ordinal: number;
  passed: boolean;
  got: string;
  expected: string;
  is_hidden: boolean;
};

export type ExecutionResult = {
  status: "passed" | "failed" | "compiler_error" | "timeout";
  friendly_message?: string;
  passed_count: number;
  total_count: number;
  runtime_ms: number;
  output_logs: string;
  test_results: BackendTestResult[];
};

export type FeedbackItem = {
  id: string;
  user_id: string;
  type: "general" | "bug" | "feature";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  screenshot_url?: string;
  status: "new" | "in_progress" | "resolved";
  admin_notes?: string;
  is_anonymous: boolean;
  problem_slug?: string;
  code_snippet?: string;
  error_message?: string;
  problem_title?: string;
  created_at: string;
  user_name?: string;
};

export type ActivityEntry = {
  date: string;
  submissions: number;
  solved: number;
  tests_run: number;
  level: number;
};

export type Broadcast = {
  id: string;
  type: "info" | "warning" | "update" | "new_feature" | "maintenance" | "announcement";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
};

export type UpdateProblemPayload = {
  title?: string;
  statement?: string;
  constraints?: string;
  learning_objective?: string;
  module?: string;
  type?: string;
  func_name?: string;
  return_type?: string;
  param_types?: string[];
  language_versions?: Record<string, {
    func_name: string;
    return_type: string;
    param_types: string[];
  }>;
  hints?: string[];
  difficulty?: number;
  xp_reward?: number;
  tags?: string[];
  visible?: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

// AI Assist Types
export type AIActionType =
  | 'rephrase_statement'
  | 'improve_hints'
  | 'generate_test_cases'
  | 'regenerate_test_cases'
  | 'adjust_difficulty'
  | 'fix_signatures'
  | 'add_edge_cases'
  | 'chat';

export interface AIAssistRequest {
  action: AIActionType;
  problem: Problem;
  message?: string;
  test_cases?: TestCase[];
  difficulty?: number;
}

export interface AIAssistResponse {
  statement?: string;
  hints?: string[];
  constraints?: string;
  learning_objective?: string;
  func_name?: string;
  return_type?: string;
  param_types?: string[];
  language_versions?: Record<string, {
    func_name: string;
    return_type: string;
    param_types: string[];
  }>;
  test_cases?: TestCase[];
  difficulty?: number;
  xp_reward?: number;
  explanation: string;
}

export interface TestCase {
  id?: string;
  input: any;
  expected: string;
  is_hidden: boolean;
  ordinal: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'pending' | 'streaming' | 'complete' | 'error';
  response?: AIAssistResponse;
  error?: string;
  applied?: boolean;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  verified: boolean;
  google_avatar_url?: string;
  created_at: string;
}

// ── Curriculum CMS Types ──

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url?: string;
  icon?: string;
  difficulty_level: number;
  estimated_hours: number;
  order_number: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string;
  image_url?: string;
  order_number: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
  lesson_count?: number;
  completed_lessons?: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string;
  raw_readme: string;
  difficulty: number;
  estimated_minutes: number;
  xp_reward: number;
  order_number: number;
  visible: boolean;
  problem_references: string[];
  created_at: string;
  updated_at: string;
}

export interface LessonSection {
  id: string;
  lesson_id: string;
  section_type: SectionType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  order_number: number;
  created_at: string;
}

export type SectionType =
  | "overview"
  | "explanation"
  | "examples"
  | "best_practices"
  | "common_mistakes"
  | "summary"
  | "quiz"
  | "exercises"
  | "mini_project"
  | "assessment"
  | "ai_review";

export interface LessonPrereq {
  lesson_id: string;
  depends_on_lesson_id: string;
}

export interface Project {
  id: string;
  lesson_id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string;
  starter_code: string;
  difficulty: number;
  xp_reward: number;
  hints: string[];
  order_number: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  user_id: string;
  course_id: string;
  started_at: string;
  completed_at?: string;
  progress_pct: number;
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  xp_awarded: number;
  completed_at?: string;
}

export interface QuizMetadata {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface CourseWithModules {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url?: string;
  icon?: string;
  difficulty_level: number;
  estimated_hours: number;
  order_number: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
  modules: Module[];
  progress?: CourseProgress;
  total_lessons: number;
  completed_lessons: number;
}

export interface LessonWithSections {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string;
  raw_readme: string;
  difficulty: number;
  estimated_minutes: number;
  xp_reward: number;
  order_number: number;
  visible: boolean;
  problem_references: string[];
  created_at: string;
  updated_at: string;
  sections: LessonSection[];
  dependencies: LessonPrereq[];
  projects: Project[];
  progress?: LessonProgress;
  prerequisites_met: boolean;
}

// ── Creation Payload Types ──

export interface NewCourse {
  slug: string;
  title: string;
  description?: string;
  image_url?: string;
  icon?: string;
  difficulty_level: number;
  estimated_hours: number;
  order_number: number;
}

export interface NewModule {
  course_id: string;
  slug: string;
  title: string;
  description?: string;
  image_url?: string;
  order_number: number;
}

export interface NewLesson {
  module_id: string;
  slug: string;
  title: string;
  description?: string;
  difficulty: number;
  estimated_minutes: number;
  xp_reward: number;
  order_number: number;
  problem_references?: string[];
  visible?: boolean;
}

export interface NewLessonSection {
  section_type: string;
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  order_number: number;
}

export interface NewProject {
  lesson_id: string;
  slug: string;
  title: string;
  description?: string;
  requirements?: string;
  starter_code?: string;
  difficulty: number;
  xp_reward: number;
  hints?: string[];
  order_number: number;
}

export interface ModuleWithLessons {
  module: Module;
  lessons: (Lesson & { completed: boolean; dependencies?: LessonPrereq[] })[];
}

export interface CourseProgressEntry {
  course_id: string;
  course_slug: string;
  progress_pct: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface ProgressResponse {
  courses: CourseProgressEntry[];
}
