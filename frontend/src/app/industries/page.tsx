import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'Industries We Serve | Tailored Technology Solutions',
  description: 'Industry-specific solutions for 16 sectors across Bangladesh — corporates, e-commerce, healthcare, garments, restaurants, and more.',
};

export default async function IndustriesPage() {
  const data = await api.industries();
  const industries = data?.results ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Industries We Serve"
        title="Built For Every Industry. Tailored For Yours."
        subtitle="16 industries. One trusted partner. Custom solutions engineered for your specific business."
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind) => (
              <a
                key={ind.id}
                href={`/industries/${ind.slug}`}
                className="group glass rounded-2xl p-6 transition-all hover:shadow-glow-cyan hover:border-electric-cyan/40"
              >
                <h3 className="font-display text-xl font-bold text-white mb-2">{ind.name}</h3>
                {ind.description && (
                  <p className="text-sm text-soft-gray mb-4 line-clamp-3">{ind.description}</p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-electric-cyan group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button href="/contact" size="lg">
              Discuss Your Industry →
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
