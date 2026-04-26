export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('access_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorMsg = errorJson.error;
      }
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }

  const text = await response.text();
  if (!text) return {} as T;

  const json = JSON.parse(text);
  // Unpack our standard wrapper if it matches
  if (json && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  
  return json as T;
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me', { method: 'GET' }),
  updatePreferences: (data: any) => request<any>('/auth/preferences', { method: 'PATCH', body: JSON.stringify(data) }),
  
  // Courses
  getCourses: () => request<any[]>('/courses', { method: 'GET' }),
  getCourse: (id: number | string) => request<any>(`/courses/${id}`, { method: 'GET' }),
  createCourse: (data: any) => request<any>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: number | string, data: any) => request<any>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id: number | string) => request<any>(`/courses/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (queries?: any) => {
    let q = '';
    if (queries) {
      const searchParams = new URLSearchParams(queries);
      q = `?${searchParams.toString()}`;
    }
    return request<any[]>(`/tasks${q}`, { method: 'GET' })
  },
  getTask: (id: number | string) => request<any>(`/tasks/${id}`, { method: 'GET' }),
  createTask: (data: any) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number | string, data: any) => request<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  completeTask: (id: number | string) => request<any>(`/tasks/${id}/complete`, { method: 'PATCH' }),
  rescheduleTask: (id: number | string) => request<any>(`/tasks/${id}/reschedule`, { method: 'PATCH' }),
  deleteTask: (id: number | string) => request<any>(`/tasks/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: (queries?: any) => {
    let q = '';
    if (queries) {
      const searchParams = new URLSearchParams(queries);
      q = `?${searchParams.toString()}`;
    }
    return request<any[]>(`/notifications${q}`, { method: 'GET' })
  },
  readNotification: (id: number | string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  readAllNotifications: () => request<any>('/notifications/read-all', { method: 'PATCH' }),
  getUnreadNotificationCount: () => request<any>('/notifications/unread-count', { method: 'GET' }),
  
  // Gamification
  getGamificationProfile: () => request<any>('/gamification/profile', { method: 'GET' }),
  getBadges: () => request<any[]>('/gamification/badges', { method: 'GET' }),
  getLeaderboard: () => request<any[]>('/gamification/leaderboard', { method: 'GET' }),

  // AI
  parseSyllabus: (data: any) => request<any>('/ai/parse-syllabus', { method: 'POST', body: JSON.stringify(data) }),
  getStudyPath: (course_id: number | string) => request<any>(`/ai/study-path/${course_id}`, { method: 'GET' }),
  generateStudyPath: (course_id: number | string) => request<any>(`/ai/study-path/${course_id}`, { method: 'POST' }),
  suggestSchedule: () => request<any>('/ai/suggest-schedule', { method: 'GET' }),

  // Mood
  recordMood: (data: any) => request<any>('/mood', { method: 'POST', body: JSON.stringify(data) }),
  getMoodHistory: (limit?: number) => request<any[]>(`/mood/history${limit ? '?limit=' + limit : ''}`, { method: 'GET' }),
  getLatestMood: () => request<any>('/mood/latest', { method: 'GET' }),

  // Schedule
  getSchedule: (queries?: any) => {
    let q = '';
    if (queries) {
      const searchParams = new URLSearchParams(queries);
      q = `?${searchParams.toString()}`;
    }
    return request<any[]>(`/schedule${q}`, { method: 'GET' })
  },
  getTodaySchedule: () => request<any[]>('/schedule/today', { method: 'GET' }),
  getWeekSchedule: () => request<any[]>('/schedule/week', { method: 'GET' }),
};
