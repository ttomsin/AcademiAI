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
  
  // Courses
  getCourses: () => request<any[]>('/courses', { method: 'GET' }),
  createCourse: (data: any) => request<any>('/courses', { method: 'POST', body: JSON.stringify(data) }),
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
  createTask: (data: any) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  completeTask: (id: number | string) => request<any>(`/tasks/${id}/complete`, { method: 'PATCH' }),
  deleteTask: (id: number | string) => request<any>(`/tasks/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications', { method: 'GET' }),
  readNotification: (id: number | string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  
  // Gamification
  getGamificationProfile: () => request<any>('/gamification/profile', { method: 'GET' }),
};
