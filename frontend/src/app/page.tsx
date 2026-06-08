import { DifferentiatorsSection } from '@/components/home/DifferentiatorsSection';
import { FinalCTA } from '@/components/home/FinalCTA';
import { HeroSection } from '@/components/home/HeroSection';
import { IndustriesSection } from '@/components/home/IndustriesSection';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { API_BASE, HomepageData } from '@/lib/api';

export const revalidate = 60; // ISR — regenerate at most every 60s

async function getHomepage(): Promise<HomepageData | null> {
  try {
    const res = await fetch(`${API_BASE}/homepage/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomepage();

  return (
    <>
      <HeroSection hero={data?.hero ?? null} trustStats={data?.trust_stats ?? []} />
      <ServicesGrid services={data?.services ?? []} />
      <IndustriesSection industries={data?.industries ?? []} />
      <DifferentiatorsSection items={data?.differentiators ?? []} />
      <TestimonialsSection testimonials={data?.testimonials ?? []} />
      <FinalCTA />
    </>
  );
}
