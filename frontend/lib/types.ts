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
  difficulty: ProblemDifficulty;
  xpReward: number;
  solved: boolean;
  status: 'active' | 'draft' | 'error';
  visible: boolean;
  successRate: number;
  estTimeMinutes: number;
  tags: string[];
  descriptionMarkdown?: string;
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
  name: string;
  passed: boolean;
  output: string;
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
