/**
 * Typed API client for Mavericks Tech backend.
 * All fetches go through here. Easily swap base URL for prod.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  simple_explanation: string;
  icon_name: string;
  order: number;
  cta_link?: string;
  gradient_from?: string;
  gradient_to?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  service_used?: string;
}

export interface TrustStat {
  id: string;
  label: string;
  value: string;
  numeric_value: number;
  suffix?: string;
}

export interface Industry {
  id: string;
  name: string;
  icon_name: string;
  description?: string;
  example_service?: string;
}

export interface Differentiator {
  id: string;
  title: string;
  description: string;
  icon_name: string;
}

export interface HeroData {
  headline: string;
  subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  gradient_start?: string;
  gradient_end?: string;
  particle_count?: number;
}

export interface HomepageData {
  hero: HeroData | null;
  services: Service[];
  testimonials: Testimonial[];
  trust_stats: TrustStat[];
  industries?: Industry[];
  differentiators?: Differentiator[];
}

async function safeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  homepage: () => safeFetch<HomepageData>('/homepage/'),

  // Public lead capture (no auth)
  submitLead: (data: {
    full_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    industry?: string;
    service_interest?: string[];
    notes?: string;
  }) => safeFetch<{ id: string }>('/crm/public/leads/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Portal (auth via Bearer token)
  portal: {
    me: (token: string) => safeFetch('/portal/me/', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    projects: (token: string) => safeFetch('/portal/projects/', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    invoices: (token: string) => safeFetch('/portal/invoices/', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    requestAccess: (email: string) => safeFetch('/portal/request-access/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  },
};
