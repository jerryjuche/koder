export type User = {
  id: string;
  name: string;
  studentId: string;
  avatarIndex: number;
  xp: number;
  level: number;
  solvedCount: number;
};

export type ProblemDifficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type Problem = {
  id: string;
  slug: string;
  title: string;
  module: string;
  difficulty: number;
  xpReward: number;
  solved: boolean;
  status: 'active' | 'draft' | 'error';
  visible: boolean;
  successRate: number;
  estTimeMinutes: number;
  tags: string[];
  statement?: string;
  descriptionMarkdown?: string;
  func_name?: string;
  return_type?: string;
  param_types?: string[];
  total_submissions?: number;
  success_rate?: number;
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
  status: 'passed' | 'failed' | 'compiler_error' | 'timeout';
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
