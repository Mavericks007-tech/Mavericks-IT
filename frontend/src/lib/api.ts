/**
 * Typed API client for Mavericks Tech backend.
 * All fetches go through here.
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

export interface ProcessStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  duration: string;
  icon_name: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  client_name: string;
  industry: string;
  metric: string;
  metric_description: string;
  image_url?: string;
}

export interface HeroData {
  id: string;
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

export interface CTAData {
  id: string;
  headline: string;
  subtext: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
}

export interface HomepageData {
  hero: HeroData | null;
  services: Service[];
  testimonials: Testimonial[];
  trust_stats: TrustStat[];
  industries: Industry[];
  differentiators: Differentiator[];
  process_steps: ProcessStep[];
  case_studies: CaseStudy[];
  cta: CTAData | null;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  open_in_new_tab: boolean;
  icon_name?: string;
  order: number;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  open_in_new_tab: boolean;
  order: number;
}

export interface FooterColumn {
  id: string;
  heading: string;
  order: number;
  links: FooterLink[];
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  logo: string | null;
  favicon: string | null;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  office_address: string;
  office_hours: string;
  social: {
    linkedin: string;
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
  };
  analytics: {
    google_analytics_id: string;
    google_tag_manager_id: string;
    facebook_pixel_id: string;
  };
}

export interface SiteData {
  settings: SiteSettings | null;
  header_nav: NavItem[];
  footer_columns: FooterColumn[];
}

export interface MetaTagData {
  path: string;
  title: string;
  description: string;
  canonical_url: string;
  robots: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
  og_type: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string | null;
  primary_keywords: string[];
  secondary_keywords: string[];
}

export interface SchemaData {
  schema_type: string;
  data: Record<string, unknown>;
}

export interface SeoData {
  meta: MetaTagData | null;
  schemas: SchemaData[];
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
  site: () => safeFetch<SiteData>('/site/'),
  seo: (path: string) => safeFetch<SeoData>(`/seo/?path=${encodeURIComponent(path)}`),

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

// Server-side fetch helpers (for Next.js app router)
export async function fetchSite(): Promise<SiteData | null> {
  try {
    const res = await fetch(`${API_BASE}/site/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchHomepage(): Promise<HomepageData | null> {
  try {
    const res = await fetch(`${API_BASE}/homepage/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchSeo(path: string): Promise<SeoData | null> {
  try {
    const res = await fetch(`${API_BASE}/seo/?path=${encodeURIComponent(path)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
