import {
  ApiResponse,
  LeaderboardEntry,
  Problem,
  ExecutionResult,
  User,
  AdminStats,
  ActivityLog,
  UserProfile,
  UserProblem,
  CommunitySolution,
  ActivityEntry,
} from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      data = { success: false, data: null, error: { code: "PARSE_ERROR", message: `Server returned ${response.status}` } };
    }

    if (!response.ok) {
      const serverError = data?.error as { message?: string; details?: string } | undefined;
      if (serverError?.details) {
        (data.error as any).message = `${serverError.message}: ${serverError.details}`;
      }
      return data;
    }

    if (!data.success && data.error) {
      const err = data.error as any;
      const msg = err.details ? `${err.message}: ${err.details}` : err.message;
      throw new Error(msg);
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: {
        code: "NETWORK_ERROR",
        message: error.message || "Failed to connect to the server",
      },
    };
  }
}

// ============================================
// API ENDPOINTS
// ============================================

export async function login(
  data: any,
): Promise<ApiResponse<{ token: string; onboarding?: boolean }>> {
  return fetchApi<{ token: string; onboarding?: boolean }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(
  data: any,
): Promise<ApiResponse<{ token: string; onboarding?: boolean }>> {
  return fetchApi<{ token: string; onboarding?: boolean }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function googleLogin(
  idToken: string,
): Promise<ApiResponse<{ token: string; onboarding?: boolean }>> {
  return fetchApi<{ token: string; onboarding?: boolean }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function completeGoogleOnboarding(
  username: string,
): Promise<ApiResponse<{ token: string }>> {
  return completeOnboarding(username);
}

export async function completeOnboarding(
  username: string,
): Promise<ApiResponse<{ token: string }>> {
  return fetchApi<{ token: string }>("/auth/complete-onboarding", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function linkGoogle(
  idToken: string,
): Promise<ApiResponse<{ token: string }>> {
  return fetchApi<{ token: string }>("/auth/link-google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function checkUsername(
  username: string,
): Promise<ApiResponse<{ username: string; available: boolean }>> {
  return fetchApi<{ username: string; available: boolean }>(
    `/auth/check-username?username=${encodeURIComponent(username)}`,
  );
}

export async function fetchUser(): Promise<ApiResponse<User>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    return {
      success: false,
      data: null,
      error: { code: "UNAUTHORIZED", message: "No token" },
    };
  }

  // Try the real /me endpoint first
  const res = await fetchApi<any>("/me");
  if (res.success && res.data) {
    return {
      success: true,
      data: {
        id: res.data.id,
        name: res.data.name || res.data.student_id || "Student",
        username: res.data.username || res.data.student_id || "",
        studentId: res.data.student_id,
        role: res.data.role || "student",
        colorIndex: res.data.color_index ?? 0,
        xp: res.data.xp || 0,
        level: res.data.level || 1,
        solvedCount: res.data.solved_count || 0,
        google_avatar_url: res.data.google_avatar_url,
      },
    };
  }

  // Fallback: decode JWT locally
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);

    return {
      success: true,
      data: {
        id: payload.user_id || "u1",
        name: payload.name || payload.student_id || "Student",
        username: payload.username || payload.student_id || "",
        studentId: payload.student_id || "s000000",
        role: payload.role || "student",
        colorIndex: 0,
        xp: 0,
        level: 1,
        solvedCount: 0,
      },
    };
  } catch (e) {
    return {
      success: false,
      data: null,
      error: { code: "INVALID_TOKEN", message: "Invalid token" },
    };
  }
}

export async function fetchProblems(): Promise<ApiResponse<Problem[]>> {
  return fetchApi<Problem[]>("/problems");
}

export async function fetchProblem(
  slug: string,
): Promise<ApiResponse<Problem>> {
  return fetchApi<Problem>(`/problems/${slug}`);
}

export async function submitSolution(
  slug: string,
  code: string,
): Promise<ApiResponse<ExecutionResult>> {
  return fetchApi<ExecutionResult>(`/submit`, {
    method: "POST",
    body: JSON.stringify({ problem_slug: slug, code: code }),
  });
}

export async function testCode(
  slug: string,
  code: string,
): Promise<ApiResponse<ExecutionResult>> {
  return fetchApi<ExecutionResult>(`/test`, {
    method: "POST",
    body: JSON.stringify({ problem_slug: slug, code: code }),
  });
}

export async function fetchLeaderboard(
  period: string = "all",
): Promise<ApiResponse<LeaderboardEntry[]>> {
  return fetchApi<LeaderboardEntry[]>(`/leaderboard?period=${period}`);
}

export async function ingestGitHubRepo(url: string): Promise<ApiResponse<any>> {
  return fetchApi<any>("/admin/ingest", {
    method: "POST",
    body: JSON.stringify({ repo_url: url }),
  });
}

export async function enrichAllProblems(): Promise<ApiResponse<any>> {
  return fetchApi<any>("/admin/enrich-all", {
    method: "POST",
  });
}

export async function fetchAdminStats(): Promise<ApiResponse<AdminStats>> {
  return fetchApi<AdminStats>("/admin/stats");
}

export async function fetchAdminActivity(): Promise<
  ApiResponse<ActivityLog[]>
> {
  return fetchApi<ActivityLog[]>("/admin/activity");
}

export async function fetchAllProblemsAdmin(): Promise<ApiResponse<Problem[]>> {
  return fetchApi<Problem[]>("/admin/problems");
}

export async function fetchUserProfile(): Promise<ApiResponse<UserProfile>> {
  return fetchApi<UserProfile>("/me/profile");
}

export async function updateUserName(name: string): Promise<ApiResponse<User>> {
  return fetchApi<User>("/me/profile", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function updateUserProfile(name: string, bio: string): Promise<ApiResponse<User>> {
  return fetchApi<User>("/me/profile", {
    method: "PUT",
    body: JSON.stringify({ name, bio }),
  });
}

// Community & Likes

export async function fetchCommunitySolutions(slug: string, limit: number = 3): Promise<ApiResponse<CommunitySolution[]>> {
  return fetchApi<CommunitySolution[]>(`/problems/${slug}/community-solutions?limit=${limit}`);
}

export async function fetchBestPractices(limit: number = 20): Promise<ApiResponse<CommunitySolution[]>> {
  return fetchApi<CommunitySolution[]>(`/best-practices?limit=${limit}`);
}

export async function likeSubmission(submissionId: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/submissions/${submissionId}/like`, { method: "POST" });
}

export async function unlikeSubmission(submissionId: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/submissions/${submissionId}/like`, { method: "DELETE" });
}

// Community Contributions
export async function submitContribution(data: any): Promise<ApiResponse<any>> {
  return fetchApi<any>("/user-problems", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchUserActivity(year?: number): Promise<ApiResponse<ActivityEntry[]>> {
  const params = year ? `?year=${year}` : "";
  return fetchApi<ActivityEntry[]>(`/me/activity${params}`);
}

export async function fetchMyContributions(): Promise<ApiResponse<UserProblem[]>> {
  return fetchApi<UserProblem[]>("/me/contributions");
}

export async function fetchPendingContributions(): Promise<ApiResponse<any>> {
  return fetchApi<any>("/admin/user-problems/pending");
}

export async function approveContribution(id: string, notes: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/admin/user-problems/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ admin_notes: notes }),
  });
}

export async function rejectContribution(id: string, notes: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/admin/user-problems/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ admin_notes: notes }),
  });
}

export async function toggleProblemVisibility(id: string, visible: boolean): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/admin/problems/${id}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ visible }),
  });
}

export async function publishAllDrafts(): Promise<ApiResponse<{ published: number }>> {
  return fetchApi<{ published: number }>("/admin/problems/publish-all", {
    method: "POST",
  });
}


