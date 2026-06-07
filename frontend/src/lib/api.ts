const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  simple_explanation: string;
  icon_name: string;
  order: number;
  cta_link: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  service_used: string;
}

export interface TrustStat {
  id: string;
  label: string;
  value: string;
  numeric_value: number;
  suffix: string;
  order: number;
}

export interface Industry {
  id: string;
  name: string;
  icon_name: string;
  description: string;
  example_service: string;
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
  gradient_start: string;
  gradient_end: string;
  particle_count: number;
}

export interface HomepageData {
  hero: HeroData | null;
  services: Service[];
  testimonials: Testimonial[];
  trust_stats: TrustStat[];
  industries: Industry[];
  differentiators: Differentiator[];
}

export async function fetchHomepageData(): Promise<HomepageData> {
  try {
    const response = await fetch(`${API_BASE_URL}/homepage/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Return fallback data
    return {
      hero: {
        headline: "Bangladesh's Most Trusted Technology Partner",
        subheadline: "We design, develop, and deploy world-class software, websites, and digital solutions for ambitious businesses",
        primary_cta_text: "Get a Free Consultation",
        primary_cta_link: "/contact",
        secondary_cta_text: "View Our Work",
        secondary_cta_link: "/portfolio",
        gradient_start: "#0A0A0F",
        gradient_end: "#0F172A",
        particle_count: 50,
      },
      services: [],
      testimonials: [],
      trust_stats: [],
      industries: [],
      differentiators: [],
    };
  }
}
