// ─── API client for the Habitual backend ─────────────────────────────────────
const BASE = 'http://localhost:5000';

function getToken(): string | null {
  return localStorage.getItem('habitual:token') || sessionStorage.getItem('habitual:token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  xp: number;
  streak: number;
  theme: string;
  dark_mode: boolean;
  language: string;
};

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  goal: number;
  unit: string;
  streak: number;
  sort_order: number;
  done: number;
};

export type Reminder = {
  id: string;
  user_id: number;
  title: string;
  reminder_time: string;
  days: string;
  icon: string;
  color: string;
  is_on: boolean;
};

export type AppNotification = {
  id: string;
  user_id: number;
  title: string;
  body: string;
  kind: string;
  route: string;
  icon: string;
  color_class: string;
  is_read: boolean;
  created_at: string;
};

export type FeedPost = {
  id: string;
  body: string;
  likes: number;
  created_at: string;
  name: string;
  avatar: string;
  mins_ago: number;
};

export type LeaderboardEntry = {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
};

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    getToken,

    signup: (name: string, email: string, password: string) =>
      request<{ token: string; user: User }>('POST', '/api/auth/signup', { name, email, password }, false),

    login: (email: string, password: string) =>
      request<{ token: string; user: User }>('POST', '/api/auth/login', { email, password }, false),

    saveToken: (token: string, user: User, remember?: boolean) => {
      let useRemember = remember;
      if (useRemember === undefined) {
        useRemember = !sessionStorage.getItem('habitual:token');
      }
      const storage = useRemember ? localStorage : sessionStorage;
      const otherStorage = useRemember ? sessionStorage : localStorage;

      storage.setItem('habitual:token', token);
      storage.setItem('habitual:user', JSON.stringify(user));

      otherStorage.removeItem('habitual:token');
      otherStorage.removeItem('habitual:user');
    },

    clearSession: () => {
      localStorage.removeItem('habitual:token');
      localStorage.removeItem('habitual:user');
      sessionStorage.removeItem('habitual:token');
      sessionStorage.removeItem('habitual:user');
    },

    getStoredUser: (): User | null => {
      const raw = localStorage.getItem('habitual:user') || sessionStorage.getItem('habitual:user');
      return raw ? JSON.parse(raw) : null;
    },

    isLoggedIn: () => !!(localStorage.getItem('habitual:token') || sessionStorage.getItem('habitual:token')),
  },

  // ─── Profile ───────────────────────────────────────────────────────────────
  profile: {
    get: () => request<User>('GET', '/api/profile'),
    update: (data: Partial<User>) => request<User>('PUT', '/api/profile', data),
  },

  // ─── Habits ────────────────────────────────────────────────────────────────
  habits: {
    list: (date?: string) => {
      const q = date ? `?date=${date}` : '';
      return request<Habit[]>('GET', `/api/habits${q}`);
    },
    create: (data: { name: string; icon?: string; color?: string; goal?: number; unit?: string }) =>
      request<Habit>('POST', '/api/habits', data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/habits/${id}`),
    log: (id: string, value: number, date?: string) =>
      request<{ ok: boolean; streak: number; value: number }>('POST', `/api/habits/${id}/log`, { value, date }),
    stats: () => request<{ log_date: string; goal: number; value: number; completed: number }[]>('GET', '/api/habits/stats'),
  },

  // ─── Reminders ─────────────────────────────────────────────────────────────
  reminders: {
    list: () => request<Reminder[]>('GET', '/api/reminders'),
    create: (data: { title: string; reminder_time?: string; days?: string; icon?: string; color?: string }) =>
      request<Reminder>('POST', '/api/reminders', data),
    update: (id: string, data: Partial<Reminder>) => request<Reminder>('PUT', `/api/reminders/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/reminders/${id}`),
  },

  // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    list: () => request<AppNotification[]>('GET', '/api/notifications'),
    markRead: (id: string) => request<{ ok: boolean }>('PUT', `/api/notifications/${id}/read`),
    markAllRead: () => request<{ ok: boolean }>('PUT', '/api/notifications/read-all'),
  },

  // ─── Community ─────────────────────────────────────────────────────────────
  community: {
    feed: () => request<FeedPost[]>('GET', '/api/community/feed'),
    post: (body: string) => request<FeedPost>('POST', '/api/community/posts', { body }),
    like: (id: string) => request<{ likes: number }>('POST', `/api/community/posts/${id}/like`),
    leaderboard: () => request<LeaderboardEntry[]>('GET', '/api/community/leaderboard'),
  },
};

export default api;
