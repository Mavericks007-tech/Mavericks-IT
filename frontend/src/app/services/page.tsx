import { ArrowRight } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { Container, Section } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'IT Services Bangladesh | Web, Software, Cybersecurity, Cloud',
  description:
    "Complete IT services in Bangladesh — custom software, websites, e-commerce, mobile apps, cybersecurity, cloud setup & more.",
};

export default async function ServicesPage() {
  const data = await api.services();
  const services = data?.results ?? [];

  return (
    <>
      <PageHeader
        eyebrow="What We Build"
        title="Every Service Your Business Needs. One Trusted Partner."
        subtitle="From the first line of code to your millionth user — Mavericks Tech handles it all."
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <a
                key={s.id}
                href={`/services/${s.slug}`}
                className="group glass rounded-2xl p-6 transition-all hover:shadow-glow-cyan hover:border-electric-cyan/40"
              >
                <h3 className="font-display text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-soft-gray mb-4">{s.subtitle}</p>
                {s.starting_price && (
                  <p className="text-xs font-mono text-electric-cyan mb-3">
                    Starting at {s.currency} {parseFloat(s.starting_price).toLocaleString()}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-electric-cyan group-hover:gap-2 transition-all">
                  Learn More <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button href="/contact" size="lg">
              Schedule Free Consultation →
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
