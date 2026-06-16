import { ApiResponse, LeaderboardEntry, Problem, ExecutionResult, User } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
   
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success && data.error) {
      throw new Error(data.error.message);
    }

    return data;
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

export async function login(data: any): Promise<ApiResponse<{ token: string }>> {
  return fetchApi<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function register(data: any): Promise<ApiResponse<{ token: string }>> {
  return fetchApi<{ token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchUser(): Promise<ApiResponse<User>> {
  // Wait, user said "There is no /user or /me endpoint yet"
  // So we will just decode JWT or mock user for now to avoid breaking UI
  // The UI requires a User object. Let's return a dummy user.
  return {
    success: true,
    data: {
      id: 'u1',
      name: 'Student',
      studentId: 's1234567',
      avatarIndex: 1,
      xp: 0,
      level: 1,
      solvedCount: 0
    }
  };
}

export async function fetchProblems(): Promise<ApiResponse<Problem[]>> {
  return fetchApi<Problem[]>('/problems');
}

export async function fetchProblem(slug: string): Promise<ApiResponse<Problem>> {
  return fetchApi<Problem>(`/problems/${slug}`);
}

export async function submitSolution(slug: string, code: string): Promise<ApiResponse<ExecutionResult>> {
  return fetchApi<ExecutionResult>(`/submit`, {
    method: 'POST',
    body: JSON.stringify({ problem_slug: slug, code: code }),
  });
}

export async function fetchLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
  return fetchApi<LeaderboardEntry[]>('/leaderboard');
}

export async function ingestGitHubRepo(url: string): Promise<ApiResponse<any>> {
  return fetchApi<any>('/admin/ingest', {
    method: 'POST',
    body: JSON.stringify({ repo_url: url }),
  });
}

export async function enrichAllProblems(): Promise<ApiResponse<any>> {
  return fetchApi<any>('/admin/enrich-all', {
    method: 'POST',
  });
}
