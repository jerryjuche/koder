import { ApiResponse, LeaderboardEntry, Problem, TestResult, User } from './types';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    // For prototype preview, we intercept specific routes to return mock data
    // in a real app, this would be:
    // const response = await fetch(`${API_BASE}${endpoint}`, {
    //   ...options,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    //     ...options?.headers,
    //   },
    // });
    // return await response.json();

    return await mockBackend(endpoint, options);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to connect to the server',
      },
    };
  }
}

// ============================================
// API ENDPOINTS
// ============================================

export async function fetchUser(): Promise<ApiResponse<User>> {
  return fetchApi<User>('/user');
}

export async function fetchProblems(): Promise<ApiResponse<Problem[]>> {
  return fetchApi<Problem[]>('/problems');
}

export async function fetchProblem(slug: string): Promise<ApiResponse<Problem>> {
  return fetchApi<Problem>(`/problems/${slug}`);
}

export async function submitSolution(slug: string, code: string): Promise<ApiResponse<TestResult[]>> {
  return fetchApi<TestResult[]>(`/problems/${slug}/submit`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function fetchLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
  return fetchApi<LeaderboardEntry[]>('/leaderboard');
}

export async function ingestGitHubRepo(url: string): Promise<ApiResponse<{ queued: number }>> {
  return fetchApi<{ queued: number }>('/admin/ingest', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

// ============================================
// MOCK DATA GENERATOR (For Prototype Preview)
// ============================================

const mockUser: User = {
  id: 'u1',
  name: 'Alex Chen',
  studentId: 's1234567',
  avatarIndex: 2,
  xp: 6180,
  level: 6,
  solvedCount: 72,
};

const mockProblems: Problem[] = [
  {
    id: 'p1',
    slug: 'hello-world',
    title: 'Hello, World!',
    module: 'Basics',
    difficulty: 'Beginner',
    xpReward: 20,
    solved: true,
    status: 'active',
    visible: true,
    successRate: 98,
    estTimeMinutes: 5,
    tags: ['fmt', 'output'],
    descriptionMarkdown: `Print 'Hello, World!' to stdout using Go's \`fmt\` package. Write a Go function that computes the result efficiently.\n\nThe Fibonacci sequence is defined as \`F(n) = F(n-1) + F(n-2)\`, with base cases \`F(0) = 0\` and \`F(1) = 1\`.\n\n### Constraints\n* \`0 <= n <= 30\`\n* Your function must handle the base cases correctly\n* Time limit: 2 seconds\n* Memory limit: 64 MB\n\n### Examples\n**Example 1**\n\`\`\`\nInput: n = 5\nOutput: 5\nNote: F(5) = F(4) + F(3) = 3 + 2 = 5\n\`\`\`\n\n**Example 2**\n\`\`\`\nInput: n = 10\nOutput: 55\nNote: F(10) = 55\n\`\`\``
  },
  { id: 'p2', slug: 'fibonacci', title: 'Fibonacci Sequence', module: 'Recursion', difficulty: 'Easy', xpReward: 50, solved: false, status: 'active', visible: true, successRate: 81, estTimeMinutes: 15, tags: ['recursion', 'math'] },
  { id: 'p3', slug: 'two-sum', title: 'Two Sum', module: 'Arrays', difficulty: 'Easy', xpReward: 50, solved: true, status: 'active', visible: true, successRate: 76, estTimeMinutes: 20, tags: ['array', 'hash-map'] },
  { id: 'p4', slug: 'reverse-linked-list', title: 'Reverse a Linked List', module: 'Data Structures', difficulty: 'Medium', xpReward: 100, solved: false, status: 'active', visible: true, successRate: 62, estTimeMinutes: 25, tags: ['linked-list', 'pointers'] },
  { id: 'p5', slug: 'binary-search', title: 'Binary Search', module: 'Algorithms', difficulty: 'Easy', xpReward: 50, solved: false, status: 'active', visible: true, successRate: 84, estTimeMinutes: 15, tags: ['search', 'array'] },
  { id: 'p6', slug: 'concurrent-counter', title: 'Concurrent Counter', module: 'Concurrency', difficulty: 'Hard', xpReward: 200, solved: false, status: 'active', visible: true, successRate: 43, estTimeMinutes: 40, tags: ['goroutine', 'mutex', 'sync'] },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: { ...mockUser, name: 'Maya Patel', studentId: 's2021001', xp: 8420, solvedCount: 98, avatarIndex: 1 }, bestTimeMs: 0.8, rankDelta: 0 },
  { rank: 2, user: { ...mockUser, name: 'Liam Zhang', studentId: 's2021045', xp: 7815, solvedCount: 91, avatarIndex: 3 }, bestTimeMs: 1.1, rankDelta: 1 },
  { rank: 3, user: { ...mockUser, name: 'Sofia Rodriguez', studentId: 's2020187', xp: 7640, solvedCount: 89, avatarIndex: 5 }, bestTimeMs: 0.9, rankDelta: -1 },
  { rank: 6, user: mockUser, bestTimeMs: 2.1, rankDelta: 1 },
];

async function mockBackend<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<any>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data: any = null;
      if (endpoint === '/user') data = mockUser;
      else if (endpoint === '/problems') data = mockProblems;
      else if (endpoint.startsWith('/problems/') && !endpoint.includes('/submit')) {
        const slug = endpoint.split('/')[2];
        data = mockProblems.find(p => p.slug === slug) || mockProblems[0];
      }
      else if (endpoint === '/leaderboard') data = mockLeaderboard;
      else if (endpoint.includes('/submit')) {
        data = [
          { id: 't1', name: 'fibonacci(0)', passed: true, executionTimeMs: 0.9 },
          { id: 't2', name: 'fibonacci(1)', passed: true, executionTimeMs: 1.0 },
          { id: 't3', name: 'fibonacci(5)', passed: true, executionTimeMs: 3.2 },
          { id: 't4', name: 'fibonacci(10)', passed: false, executionTimeMs: 4.1, output: 'Got 0, Expected 55', expectedOutput: '55' }
        ];
      }
      else if (endpoint === '/admin/ingest') data = { queued: 12 };

      resolve({ success: true, data, error: undefined });
    }, 800); // simulate network delay
  });
}
