const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; username: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getDashboard: () => request<DashboardData>('/api/dashboard'),

  getSources: () => request<Source[]>('/api/sources'),

  updateSource: (id: string, enabled: boolean) =>
    request<Source>(`/api/sources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),

  getSchedule: () => request<ScheduleSettings>('/api/schedule'),

  updateSchedule: (data: Partial<ScheduleSettings>) =>
    request<ScheduleSettings>('/api/schedule', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getDigests: (q = '', page = 1) =>
    request<Paginated<DigestSummary>>(`/api/digests?q=${encodeURIComponent(q)}&page=${page}`),

  getDigest: (id: string) => request<DigestDetail>(`/api/digests/${id}`),

  triggerDigest: () =>
    request<{ success: boolean; digestId: string }>('/api/digests/trigger', { method: 'POST' }),

  getArticles: (q = '', page = 1) =>
    request<Paginated<Article>>(`/api/articles?q=${encodeURIComponent(q)}&page=${page}`),

  getLogs: (page = 1, level?: string) =>
    request<Paginated<AppLog>>(`/api/logs?page=${page}${level ? `&level=${level}` : ''}`),
};

export interface Source {
  id: string;
  name: string;
  slug: string;
  type: string;
  url: string;
  enabled: boolean;
  lastFetched: string | null;
  fetchCount: number;
  errorCount: number;
  lastError: string | null;
}

export interface ScheduleSettings {
  id: string;
  cronExpr: string;
  timezone: string;
  enabled: boolean;
}

export interface DigestSummary {
  id: string;
  title: string;
  date: string;
  sendStatus: string;
  sentAt: string | null;
  triggeredBy: string;
  trendingTopics: string[];
  stats: { articlesAnalyzed: number; selected: number; categories: Record<string, number> };
}

export interface DigestDetail extends DigestSummary {
  message: string;
  topFiveMessage: string | null;
  items: Array<{
    rank: number;
    article: Article & { summary: Summary | null };
  }>;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  publishedAt: string | null;
  description: string | null;
  summary?: Summary | null;
  source?: Source;
}

export interface Summary {
  summary: string;
  category: string;
  importanceScore: number;
  whyItMatters: string;
  keyTakeaway: string;
  verified: boolean;
}

export interface AppLog {
  id: string;
  level: string;
  message: string;
  context: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardData {
  sources: Source[];
  recentDigests: DigestSummary[];
  schedule: ScheduleSettings;
  logCount: number;
  articleCount: number;
}

export interface Paginated<T> {
  items?: T[];
  digests?: T[];
  articles?: T[];
  logs?: T[];
  total: number;
  page: number;
  limit: number;
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
