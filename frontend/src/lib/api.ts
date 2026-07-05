/**
 * Typed API client for Mavericks Tech backend.
 *
 * Two URLs:
 *  - browser (client-side JS in visitor's browser) → NEXT_PUBLIC_API_URL, must be publicly reachable
 *  - server (Next.js SSR/RSC inside Docker) → API_INTERNAL_URL, points at backend container
 *
 * When both are unset we fall back to localhost dev.
 * The internal URL avoids hairpin NAT: SSR trying to fetch the droplet's own
 * public IP from inside a Docker container often hangs on cloud VPS.
 */
export const API_BASE_BROWSER = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const API_BASE_SERVER = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const API_BASE = typeof window === 'undefined' ? API_BASE_SERVER : API_BASE_BROWSER;

export interface Service {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  simple_explanation: string;
  long_description: string;
  icon_name: string;
  order: number;
  cta_link?: string;
  gradient_from?: string;
  gradient_to?: string;
  starting_price?: string | null;
  currency?: string;
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
  slug: string;
  icon_name: string;
  description?: string;
  long_description?: string;
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

export interface CaseStudyDetail extends CaseStudy {
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  logo_url?: string;
  testimonial_quote: string;
  testimonial_author: string;
  testimonial_title: string;
  technologies: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  author: string;
  read_time: number;
  category: string;
  tags: string[];
  published_at: string;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  author_avatar?: string;
  views: number;
}

export interface PageDetail {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: string;
  featured_image?: string | null;
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
  social: { linkedin: string; facebook: string; instagram: string; youtube: string; twitter: string };
  analytics: { google_analytics_id: string; google_tag_manager_id: string; facebook_pixel_id: string };
  verification?: { google: string; bing: string };
  og_default_image?: string | null;
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

async function safeFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export const api = {
  homepage: () => safeFetch<HomepageData>('/homepage/'),
  site: () => safeFetch<SiteData>('/site/'),
  seo: (path: string) => safeFetch<SeoData>(`/seo/?path=${encodeURIComponent(path)}`),
  services: () => safeFetch<{ results: Service[] }>('/services/'),
  service: (slug: string) => safeFetch<Service>(`/services/${slug}/`),
  industries: () => safeFetch<{ results: Industry[] }>('/industries/'),
  industry: (slug: string) => safeFetch<Industry>(`/industries/${slug}/`),
  page: (slug: string) => safeFetch<PageDetail>(`/pages/${slug}/`),
  blog: () => safeFetch<{ results: BlogPost[] }>('/blog/'),
  blogPost: (slug: string) => safeFetch<BlogPostDetail>(`/blog/${slug}/`),
  portfolio: () => safeFetch<{ results: CaseStudy[] }>('/portfolio/'),
  caseStudy: (id: string) => safeFetch<CaseStudyDetail>(`/portfolio/${id}/`),
  submitLead: (data: {
    full_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    industry?: string;
    service_interest?: string[];
    notes?: string;
  }) =>
    fetch(`${API_BASE}/crm/public/leads/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

// Server-side helpers
export const fetchSite = () => api.site();
export const fetchHomepage = () => api.homepage();
export const fetchSeo = (path: string) => api.seo(path);
