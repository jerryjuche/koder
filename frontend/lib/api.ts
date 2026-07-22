import {
  ApiResponse,
  LeaderboardEntry,
  Problem,
  ExecutionResult,
  User,
  AdminStats,
  AIUsageStats,
  ActivityLog,
  UserProfile,
  UserProblem,
  CommunitySolution,
  ActivityEntry,
  NotificationItem,
  FeedbackItem,
  Broadcast,
  UpdateProblemPayload,
  AIAssistRequest,
  AIAssistResponse,
  PublicUserData,
  UserSearchResult,
  Course,
  CourseWithModules,
  ModuleWithLessons,
  LessonWithSections,
  ProgressResponse,
  LessonProgress,
  Module,
  Lesson,
  LessonSection,
  Project,
  NewLessonSection,
  TestCase,
} from "./types";
import { getCache, setCache, clearCache } from "./cache";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (v: boolean) => void }> = [];

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push({ resolve }));
  }
  isRefreshing = true;

  let success = false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      localStorage.removeItem("koder_token");
      localStorage.removeItem("refresh_token");
      success = false;
    } else {
      const data = await res.json();
      if (data?.data) {
        if (data.data.token) {
          localStorage.setItem("koder_token", data.data.token);
        }
        if (data.data.refresh_token) {
          localStorage.setItem("refresh_token", data.data.refresh_token);
        }
      }
      success = true;
    }
  } catch {
    localStorage.removeItem("koder_token");
    localStorage.removeItem("refresh_token");
    success = false;
  } finally {
    isRefreshing = false;
    refreshQueue.forEach((q) => q.resolve(success));
    refreshQueue = [];
  }
  return success;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  // Skip auth refresh for auth endpoints to avoid loops
  const isAuthEndpoint = endpoint.startsWith("/auth/");

  // Return cached GET response if fresh
  if (!options?.method || options.method === "GET") {
    const cached = getCache<T>(endpoint);
    if (cached) return { success: true, data: cached };
  }

  const doFetch = async (): Promise<ApiResponse<T>> => {
    const token = !isAuthEndpoint ? localStorage.getItem("koder_token") : null;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include",
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
      return { ...data, success: false };
    }

    if (!data.success && data.error) {
      const err = data.error as any;
      const msg = err.details ? `${err.message}: ${err.details}` : err.message;
      throw new Error(msg);
    }

    return data;
  };

  try {
    const result = await doFetch();
    const authErrCode = result.error?.code;
    if (!result.success && !isAuthEndpoint && (authErrCode === "AUTH_REQUIRED" || authErrCode === "AUTH_INVALID" || authErrCode === "TOKEN_REVOKED")) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return doFetch();
      }
    }
    // Cache successful GET responses
    if (result.success && (!options?.method || options.method === "GET")) {
      setCache(endpoint, result.data);
    }
    return result;
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

type AuthResponse = { token: string; refresh_token?: string; onboarding?: boolean };

function handleAuthResponse(res: ApiResponse<AuthResponse>): ApiResponse<AuthResponse> {
  if (res.success && res.data) {
    if (res.data.token) {
      localStorage.setItem("koder_token", res.data.token);
    }
    if (res.data.refresh_token) {
      localStorage.setItem("refresh_token", res.data.refresh_token);
    }
  }
  return res;
}

export async function login(
  data: any,
): Promise<ApiResponse<AuthResponse>> {
  const res = await fetchApi<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleAuthResponse(res);
}

export async function register(
  data: any,
): Promise<ApiResponse<AuthResponse>> {
  const res = await fetchApi<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleAuthResponse(res);
}

export async function googleLogin(
  idToken: string,
): Promise<ApiResponse<AuthResponse>> {
  const res = await fetchApi<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
  return handleAuthResponse(res);
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function forgotPasswordPin(
  email: string,
  pin: string,
): Promise<ApiResponse<{ token: string }>> {
  return fetchApi<{ token: string }>("/auth/forgot-password-pin", {
    method: "POST",
    body: JSON.stringify({ email, pin }),
  });
}

export async function resetPasswordPin(
  token: string,
  password: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/auth/reset-password-pin", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function completeOnboarding(
  username: string,
): Promise<ApiResponse<{ token: string; refresh_token?: string }>> {
  return fetchApi<{ token: string; refresh_token?: string }>("/auth/complete-onboarding", {
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

export async function logout(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/auth/logout", {
    method: "POST",
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
        attemptedCount: res.data.attempted_count || 0,
        streak: res.data.current_streak_days ?? 0,
        verified: res.data.verified ?? false,
        google_avatar_url: res.data.google_avatar_url,
        google_linked: res.data.google_linked ?? false,
        usernameSet: res.data.username_set ?? true,
        primaryLanguage: res.data.primary_language ?? "go",
      },
    };
  }

  return {
    success: false,
    data: null,
    error: { code: "AUTH_FAILED", message: "Token rejected by server" },
  };
}

export async function updatePrimaryLanguage(language: string): Promise<ApiResponse<User>> {
  return fetchApi<User>("/me/language", {
    method: "PUT",
    body: JSON.stringify({ language }),
  });
}

export async function updateUsername(
  username: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/me/username", {
    method: "PUT",
    body: JSON.stringify({ username }),
  });
}

export async function fetchProblems(language?: string): Promise<ApiResponse<Problem[]>> {
  const params = language ? `?language=${language}` : "";
  return fetchApi<Problem[]>(`/problems${params}`);
}

export async function fetchProblem(
  slug: string,
): Promise<ApiResponse<Problem>> {
  return fetchApi<Problem>(`/problems/${slug}`);
}

export async function submitSolution(
  slug: string,
  code: string,
  language?: string,
): Promise<ApiResponse<ExecutionResult>> {
  return fetchApi<ExecutionResult>(`/submit`, {
    method: "POST",
    body: JSON.stringify({ problem_slug: slug, code: code, language }),
  });
}

export async function testCode(
  slug: string,
  code: string,
  language?: string,
): Promise<ApiResponse<ExecutionResult>> {
  return fetchApi<ExecutionResult>(`/test`, {
    method: "POST",
    body: JSON.stringify({ problem_slug: slug, code: code, language }),
  });
}

export async function fetchRecentNotifications(): Promise<ApiResponse<NotificationItem[]>> {
  return fetchApi<NotificationItem[]>("/notifications/recent");
}

export async function fetchLeaderboard(
  period: string = "all",
): Promise<ApiResponse<LeaderboardEntry[]>> {
  return fetchApi<LeaderboardEntry[]>(`/leaderboard?period=${period}`);
}

export async function fetchUserById(id: string): Promise<ApiResponse<PublicUserData>> {
  return fetchApi<PublicUserData>(`/users/${id}`);
}

export async function ingestGitHubRepo(url: string): Promise<ApiResponse<any>> {
  return fetchApi<any>("/admin/ingest", {
    method: "POST",
    body: JSON.stringify({ repo_url: url }),
  });
}

export async function enrichProblem(slug: string): Promise<ApiResponse<Problem>> {
  return fetchApi<Problem>(`/admin/enrich`, {
    method: "POST",
    body: JSON.stringify({ slug }),
  });
}

export async function aiAssist(data: AIAssistRequest): Promise<ApiResponse<AIAssistResponse>> {
  return fetchApi<AIAssistResponse>("/admin/ai/assist", {
    method: "POST",
    body: JSON.stringify(data),
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

export async function updateProblem(id: string, data: UpdateProblemPayload): Promise<ApiResponse<Problem>> {
  return fetchApi<Problem>(`/admin/problems/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchProblemTestCases(id: string): Promise<ApiResponse<TestCase[]>> {
  return fetchApi<TestCase[]>(`/admin/problems/${id}/test-cases`);
}

export async function updateTestCase(id: string, data: {
  input?: any;
  expected?: string;
  is_hidden?: boolean;
  ordinal?: number;
}): Promise<ApiResponse<TestCase>> {
  return fetchApi<TestCase>(`/admin/test-cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Feedback

export async function submitFeedback(data: {
  type: string;
  title: string;
  description: string;
  priority: string;
  screenshot_url?: string;
  is_anonymous: boolean;
  problem_slug?: string;
  code_snippet?: string;
  error_message?: string;
}): Promise<ApiResponse<any>> {
  return fetchApi<any>("/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchMyFeedback(): Promise<ApiResponse<FeedbackItem[]>> {
  return fetchApi<FeedbackItem[]>("/feedback/mine");
}

export async function fetchAdminFeedback(status?: string): Promise<ApiResponse<FeedbackItem[]>> {
  const params = status ? `?status=${status}` : "";
  return fetchApi<FeedbackItem[]>(`/admin/feedback${params}`);
}

export async function fetchAdminFeedbackCounts(): Promise<ApiResponse<Record<string, number>>> {
  return fetchApi<Record<string, number>>("/admin/feedback/counts");
}

export async function fetchProblemReports(): Promise<ApiResponse<FeedbackItem[]>> {
  return fetchApi<FeedbackItem[]>("/admin/problem-reports");
}

export async function updateFeedbackStatus(id: string, status: string, adminNotes?: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/admin/feedback/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  });
}

export async function deleteAccount(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/me/delete-account", {
    method: "POST",
  });
}

// Broadcasts

export async function fetchActiveBroadcasts(): Promise<ApiResponse<Broadcast[]>> {
  return fetchApi<Broadcast[]>("/me/broadcasts");
}

export async function dismissBroadcast(id: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/me/broadcasts/${id}/dismiss`, { method: "POST" });
}

export async function fetchAllBroadcasts(): Promise<ApiResponse<Broadcast[]>> {
  return fetchApi<Broadcast[]>("/admin/broadcasts");
}

export async function createBroadcast(data: {
  type: string;
  priority: string;
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
}): Promise<ApiResponse<Broadcast>> {
  return fetchApi<Broadcast>("/admin/broadcasts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deactivateBroadcast(id: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/admin/broadcasts/${id}/deactivate`, { method: "PATCH" });
}

export async function activateBroadcast(id: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/admin/broadcasts/${id}/activate`, { method: "PATCH" });
}

export async function deleteBroadcast(id: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/admin/broadcasts/${id}`, { method: "DELETE" });
}

export async function changePassword(pin: string, newPassword: string): Promise<ApiResponse<any>> {
  return fetchApi<any>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ pin, new_password: newPassword }),
  });
}

export async function verifyPin(pin: string): Promise<ApiResponse<{ valid: boolean }>> {
  return fetchApi<{ valid: boolean }>("/auth/verify-pin", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

export async function setPin(pin: string, confirmPin: string): Promise<ApiResponse<any>> {
  return fetchApi<any>("/auth/set-pin", {
    method: "POST",
    body: JSON.stringify({ pin, confirm_pin: confirmPin }),
  });
}

export async function fetchAIUsageStats(): Promise<ApiResponse<AIUsageStats>> {
  return fetchApi<AIUsageStats>("/admin/ai/usage");
}

export async function searchUsers(q: string): Promise<ApiResponse<UserSearchResult[]>> {
  return fetchApi<UserSearchResult[]>(`/admin/users/search?q=${encodeURIComponent(q)}`);
}

export async function toggleUserVerified(id: string): Promise<ApiResponse<{ verified: boolean }>> {
  return fetchApi<{ verified: boolean }>(`/admin/users/${id}/verified`, {
    method: "PATCH",
  });
}

// ── Curriculum CMS API ──

// Student endpoints
export async function fetchCourses(): Promise<ApiResponse<Course[]>> {
  return fetchApi<Course[]>("/learn/courses");
}

export async function fetchCourse(slug: string): Promise<ApiResponse<CourseWithModules>> {
  return fetchApi<CourseWithModules>(`/learn/courses/${encodeURIComponent(slug)}`);
}

export async function fetchModule(courseSlug: string, moduleSlug: string): Promise<ApiResponse<ModuleWithLessons>> {
  return fetchApi<ModuleWithLessons>(`/learn/courses/${encodeURIComponent(courseSlug)}/modules/${encodeURIComponent(moduleSlug)}`);
}

export async function fetchLesson(courseSlug: string, moduleSlug: string, lessonSlug: string): Promise<ApiResponse<LessonWithSections>> {
  return fetchApi<LessonWithSections>(`/learn/courses/${encodeURIComponent(courseSlug)}/modules/${encodeURIComponent(moduleSlug)}/lessons/${encodeURIComponent(lessonSlug)}`);
}

export async function fetchProgress(): Promise<ApiResponse<ProgressResponse>> {
  return fetchApi<ProgressResponse>("/learn/progress");
}

export async function completeLesson(lessonId: string): Promise<ApiResponse<LessonProgress>> {
  const res = await fetchApi<LessonProgress>(`/learn/lessons/${lessonId}/complete`, {
    method: "POST",
  });
  if (res.success) {
    clearCache("/learn");
  }
  return res;
}

// Admin endpoints
export async function fetchAllCourses(): Promise<ApiResponse<Course[]>> {
  return fetchApi<Course[]>("/admin/courses");
}

export async function createCourse(data: Partial<Course>): Promise<ApiResponse<Course>> {
  return fetchApi<Course>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
  return fetchApi<Course>(`/admin/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: string): Promise<ApiResponse<{ status: string }>> {
  return fetchApi<{ status: string }>(`/admin/courses/${id}`, {
    method: "DELETE",
  });
}

export async function toggleCourseVisibility(id: string): Promise<ApiResponse<Course>> {
  return fetchApi<Course>(`/admin/courses/${id}/visibility`, {
    method: "PATCH",
  });
}

export async function fetchModules(courseId: string): Promise<ApiResponse<Module[]>> {
  return fetchApi<Module[]>(`/admin/courses/${courseId}/modules`);
}

export async function createModule(courseId: string, data: Partial<Module>): Promise<ApiResponse<Module>> {
  return fetchApi<Module>(`/admin/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateModule(id: string, data: Partial<Module>): Promise<ApiResponse<Module>> {
  return fetchApi<Module>(`/admin/modules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteModule(id: string): Promise<ApiResponse<{ status: string }>> {
  return fetchApi<{ status: string }>(`/admin/modules/${id}`, {
    method: "DELETE",
  });
}

export async function toggleModuleVisibility(id: string): Promise<ApiResponse<Module>> {
  return fetchApi<Module>(`/admin/modules/${id}/visibility`, {
    method: "PATCH",
  });
}

export async function toggleModuleLock(id: string): Promise<ApiResponse<Module>> {
  return fetchApi<Module>(`/admin/modules/${id}/lock`, {
    method: "PATCH",
  });
}

export async function fetchLessons(moduleId: string): Promise<ApiResponse<Lesson[]>> {
  return fetchApi<Lesson[]>(`/admin/modules/${moduleId}/lessons`);
}

export async function createLesson(moduleId: string, data: { lesson: Partial<Lesson>; sections?: Partial<LessonSection>[]; dependency_ids?: string[] }): Promise<ApiResponse<Lesson>> {
  return fetchApi<Lesson>(`/admin/modules/${moduleId}/lessons`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLesson(id: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
  return fetchApi<Lesson>(`/admin/lessons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLesson(id: string): Promise<ApiResponse<{ status: string }>> {
  return fetchApi<{ status: string }>(`/admin/lessons/${id}`, {
    method: "DELETE",
  });
}

export async function toggleLessonVisibility(id: string): Promise<ApiResponse<Lesson>> {
  return fetchApi<Lesson>(`/admin/lessons/${id}/visibility`, {
    method: "PATCH",
  });
}

export async function fetchProjects(lessonId: string): Promise<ApiResponse<Project[]>> {
  return fetchApi<Project[]>(`/admin/lessons/${lessonId}/projects`);
}

export async function createProject(lessonId: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
  return fetchApi<Project>(`/admin/lessons/${lessonId}/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
  return fetchApi<Project>(`/admin/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<ApiResponse<{ status: string }>> {
  return fetchApi<{ status: string }>(`/admin/projects/${id}`, {
    method: "DELETE",
  });
}

export async function toggleProjectVisibility(id: string): Promise<ApiResponse<Project>> {
  return fetchApi<Project>(`/admin/projects/${id}/visibility`, {
    method: "PATCH",
  });
}

// ── Section CRUD (Admin) ──

export async function fetchLessonSections(lessonId: string): Promise<ApiResponse<LessonSection[]>> {
  return fetchApi<LessonSection[]>(`/admin/lessons/${lessonId}/sections`);
}

export async function createSection(lessonId: string, data: NewLessonSection): Promise<ApiResponse<LessonSection>> {
  return fetchApi<LessonSection>(`/admin/lessons/${lessonId}/sections`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSection(id: string, data: Partial<LessonSection>): Promise<ApiResponse<LessonSection>> {
  return fetchApi<LessonSection>(`/admin/sections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSection(id: string): Promise<ApiResponse<{ status: string }>> {
  return fetchApi<{ status: string }>(`/admin/sections/${id}`, {
    method: "DELETE",
  });
}

export async function reorderSections(lessonId: string, orderedIds: string[]): Promise<ApiResponse<{ status: string }>> {
  return fetchApi<{ status: string }>(`/admin/lessons/${lessonId}/sections/reorder`, {
    method: "PUT",
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
}

export async function updateLessonDependencies(lessonId: string, dependencyIds: string[]): Promise<ApiResponse<{ status: string }>> {
  return fetchApi<{ status: string }>(`/admin/lessons/${lessonId}/dependencies`, {
    method: "PUT",
    body: JSON.stringify({ dependency_ids: dependencyIds }),
  });
}

// ── Problem module locks ──

export interface ModuleLock {
  module_name: string;
  locked?: boolean;
  created_at?: string;
}

export async function fetchModuleLocks(): Promise<ApiResponse<ModuleLock[]>> {
  return fetchApi<ModuleLock[]>("/admin/module-locks");
}

export async function toggleProblemModuleLock(moduleName: string): Promise<ApiResponse<ModuleLock>> {
  return fetchApi<ModuleLock>(`/admin/module-locks/${encodeURIComponent(moduleName)}`, {
    method: "POST",
  });
}

export async function deleteProblemModule(moduleName: string): Promise<ApiResponse<{ module_name: string; status: string }>> {
  return fetchApi<{ module_name: string; status: string }>(`/admin/problem-modules/${encodeURIComponent(moduleName)}`, {
    method: "DELETE",
  });
}

// ── Module metadata (display names, pinning) ──

export interface ModuleMeta {
  module_name: string;
  display_name: string;
  is_pinned: boolean;
  created_at: string;
}

export async function fetchModuleMeta(): Promise<ApiResponse<ModuleMeta[]>> {
  return fetchApi<ModuleMeta[]>("/me/module-meta");
}

export async function upsertModuleMeta(moduleName: string, displayName: string): Promise<ApiResponse<ModuleMeta>> {
  return fetchApi<ModuleMeta>(`/admin/module-meta/${encodeURIComponent(moduleName)}`, {
    method: "PUT",
    body: JSON.stringify({ display_name: displayName }),
  });
}

export async function setModulePin(moduleName: string, pinned: boolean): Promise<ApiResponse<ModuleMeta>> {
  return fetchApi<ModuleMeta>(`/admin/module-meta/${encodeURIComponent(moduleName)}/pin`, {
    method: "PATCH",
    body: JSON.stringify({ pinned }),
  });
}


