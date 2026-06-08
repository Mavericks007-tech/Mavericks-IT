import { DifferentiatorsSection } from '@/components/home/DifferentiatorsSection';
import { FinalCTA } from '@/components/home/FinalCTA';
import { HeroSection } from '@/components/home/HeroSection';
import { IndustriesSection } from '@/components/home/IndustriesSection';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { fetchHomepage, fetchSite } from '@/lib/api';

export const revalidate = 60;

export default async function HomePage() {
  const [data, site] = await Promise.all([fetchHomepage(), fetchSite()]);

  return (
    <>
      <HeroSection hero={data?.hero ?? null} trustStats={data?.trust_stats ?? []} />
      <ServicesGrid services={data?.services ?? []} />
      <IndustriesSection industries={data?.industries ?? []} />
      <DifferentiatorsSection items={data?.differentiators ?? []} />
      <TestimonialsSection testimonials={data?.testimonials ?? []} />
      <FinalCTA cta={data?.cta ?? null} settings={site?.settings ?? null} />
    </>
  );
}
