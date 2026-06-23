export type User = {
  id: string;
  name: string;
  studentId: string;
  role: string;
  colorIndex: number;
  xp: number;
  level: number;
  solvedCount: number;
  verified?: boolean;
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
  descriptionMarkdown?: string;
  examples?: { id: string; input: string; expected: string; ordinal: number }[];
  func_name?: string;
  return_type?: string;
  param_types?: string[];
  total_submissions?: number;
  success_rate?: number;
  author_id?: string;
  author_name?: string;
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
  name: string;
  bio?: string;
  color_index: number;
  xp: number;
  level: number;
  global_rank: number;
  created_at: string;
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

export type CommunitySolution = {
  id: string;
  user_id: string;
  user_name: string;
  problem_id: string;
  problem_slug?: string;
  language: string;
  code: string;
  runtime_ms: number;
  likes: number;
  has_liked: boolean;
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

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};
