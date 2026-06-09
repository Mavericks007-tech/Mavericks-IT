/**
 * Manage (admin) API client — uses session cookie via credentials: 'include'.
 * Every state-changing request needs X-CSRFToken header.
 */
import { API_BASE } from './api';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export async function manageFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const csrf = getCookie('csrftoken') || '';
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrf,
      ...(init?.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/manage/login')) {
      window.location.href = '/manage/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function ensureCsrf(): Promise<void> {
  await fetch(`${API_BASE}/auth/csrf/`, { credentials: 'include' });
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  groups: string[];
}

export interface AuditEntry {
  id: string;
  model: string;
  app: string;
  object_repr: string;
  object_id: string;
  action: 'create' | 'update' | 'delete' | string;
  user: string | null;
  user_id: number | null;
  timestamp: string;
  change_reason: string;
  snapshot?: Record<string, unknown>;
}

export interface AuditFeed {
  total: number;
  limit: number;
  offset: number;
  results: AuditEntry[];
  available_models: string[];
}

export const manage = {
  // Auth
  csrf: () => ensureCsrf(),
  login: (username: string, password: string) =>
    manageFetch<AdminUser>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => manageFetch('/auth/logout/', { method: 'POST' }),
  me: () => manageFetch<AdminUser>('/auth/me/'),

  // Reports
  dashboard: () => manageFetch('/reports/dashboard/'),
  salesFunnel: () => manageFetch('/reports/sales-funnel/'),
  leadSources: () => manageFetch('/reports/lead-sources/'),
  revenueByMonth: () => manageFetch('/reports/revenue/by-month/'),
  revenueByClient: () => manageFetch('/reports/revenue/by-client/'),
  revenueByService: () => manageFetch('/reports/revenue/by-service/'),
  projectProfitability: () => manageFetch('/reports/projects/profitability/'),
  teamPerformance: () => manageFetch('/reports/team/performance/'),
  emailStats: () => manageFetch('/reports/email/stats/'),
  auditLog: (params = '') => manageFetch<AuditFeed>(`/reports/audit/${params}`),
  auditObject: (app: string, model: string, id: string) =>
    manageFetch<{ results: AuditEntry[] }>(`/reports/audit/${app}/${model}/${id}/`),

  // CRM
  leads: (params = '') => manageFetch(`/crm/leads/${params}`),
  lead: (id: string) => manageFetch(`/crm/leads/${id}/`),
  updateLead: (id: string, data: Record<string, unknown>) =>
    manageFetch(`/crm/leads/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  convertLead: (id: string) => manageFetch(`/crm/leads/${id}/convert/`, { method: 'POST' }),
  leadPipeline: () => manageFetch('/crm/leads/pipeline/'),

  clients: () => manageFetch('/crm/clients/'),
  client: (id: string) => manageFetch(`/crm/clients/${id}/`),

  projects: () => manageFetch('/crm/projects/'),
  project: (id: string) => manageFetch(`/crm/projects/${id}/`),
  projectsKanban: () => manageFetch('/crm/projects/kanban/'),

  quotes: () => manageFetch('/crm/quotes/'),
  quote: (id: string) => manageFetch(`/crm/quotes/${id}/`),

  invoices: () => manageFetch('/crm/invoices/'),
  invoice: (id: string) => manageFetch(`/crm/invoices/${id}/`),
  invoiceSummary: () => manageFetch('/crm/invoices/summary/'),
  overdueInvoices: () => manageFetch('/crm/invoices/overdue/'),

  // Comms
  emailTemplates: () => manageFetch('/comms/templates/'),
  emailTemplate: (key: string) => manageFetch(`/comms/templates/${key}/`),
  updateEmailTemplate: (key: string, data: Record<string, unknown>) =>
    manageFetch(`/comms/templates/${key}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  emailLogs: () => manageFetch('/comms/logs/'),
  campaigns: () => manageFetch('/comms/campaigns/'),
  runCampaign: (id: string) =>
    manageFetch(`/comms/campaigns/${id}/run/`, { method: 'POST' }),
};


// ---------------------------------------------------------------------------
// Generic CMS admin client
// /api/v1/cms/admin/<resource>/  (DRF DefaultRouter — paginated list, CRUD)
// ---------------------------------------------------------------------------
export type CmsResource =
  | 'hero-sections' | 'services' | 'testimonials' | 'trust-stats'
  | 'industries' | 'case-studies' | 'differentiators' | 'process-steps'
  | 'blog-posts' | 'cta-sections'
  | 'pages' | 'media' | 'redirects' | 'site-settings'
  | 'nav-menus' | 'nav-items' | 'footer-columns' | 'footer-links'
  | 'meta-tags' | 'schemas'
  | 'email-settings' | 'email-templates'
  | 'users' | 'groups';

export interface DRFPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const cmsAdmin = {
  list: <T = Record<string, unknown>>(resource: CmsResource, qs = '') =>
    manageFetch<DRFPage<T> | T[]>(`/cms/admin/${resource}/${qs}`),
  get: <T = Record<string, unknown>>(resource: CmsResource, id: string | number) =>
    manageFetch<T>(`/cms/admin/${resource}/${id}/`),
  create: <T = Record<string, unknown>>(resource: CmsResource, data: Record<string, unknown>) =>
    manageFetch<T>(`/cms/admin/${resource}/`, { method: 'POST', body: JSON.stringify(data) }),
  update: <T = Record<string, unknown>>(resource: CmsResource, id: string | number, data: Record<string, unknown>) =>
    manageFetch<T>(`/cms/admin/${resource}/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (resource: CmsResource, id: string | number) =>
    manageFetch(`/cms/admin/${resource}/${id}/`, { method: 'DELETE' }),
  singleton: <T = Record<string, unknown>>(resource: 'site-settings' | 'email-settings') =>
    manageFetch<T>(`/cms/admin/${resource}/singleton/`),
  updateSingleton: <T = Record<string, unknown>>(resource: 'site-settings' | 'email-settings', data: Record<string, unknown>) =>
    manageFetch<T>(`/cms/admin/${resource}/singleton/`, { method: 'PATCH', body: JSON.stringify(data) }),
  uploadMedia: async (file: File, extra: Record<string, string> = {}) => {
    const csrf = getCookie('csrftoken') || '';
    const fd = new FormData();
    fd.append('file', file);
    for (const [k, v] of Object.entries(extra)) fd.append(k, v);
    const res = await fetch(`${API_BASE}/cms/admin/media/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': csrf },
      body: fd,
    });
    if (!res.ok) throw new Error(`Upload ${res.status}: ${await res.text()}`);
    return res.json();
  },
};
