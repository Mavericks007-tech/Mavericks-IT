import { Check, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'Pricing | Transparent Software Pricing Bangladesh',
  description: 'Transparent pricing for software development, websites, e-commerce, mobile apps. No hidden costs. Flexible packages.',
};

const TRUST = [
  '14-day money-back guarantee',
  'Free initial consultation',
  'Transparent contracts',
  'No hidden setup fees',
  'Flexible payment plans (40%-30%-30%)',
  'Source code ownership',
];

export default async function PricingPage() {
  const data = await api.services();
  const services = data?.results ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Transparent Pricing. No Hidden Surprises."
        subtitle="Choose the package that fits your goals — or contact us for fully custom solutions."
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="glass rounded-2xl p-6 flex flex-col">
                <h3 className="font-display text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-soft-gray mb-4">{s.subtitle}</p>
                {s.starting_price ? (
                  <p className="font-display text-3xl font-bold text-gradient mb-4">
                    {s.currency} {parseFloat(s.starting_price).toLocaleString()}+
                  </p>
                ) : (
                  <p className="font-display text-2xl font-bold text-electric-cyan mb-4">Quote-based</p>
                )}
                <p className="text-xs text-soft-gray mb-6">Starting price. Final quote after free consultation.</p>
                <Button href={`/services/${s.slug}`} variant="secondary" className="mt-auto">
                  Details →
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-3xl mx-auto glass rounded-2xl p-8">
            <h3 className="font-display text-xl font-bold text-white mb-6 text-center">
              Every package includes
            </h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              {TRUST.map((t) => (
                <li key={t} className="flex items-start gap-2 text-soft-gray">
                  <Check size={18} className="text-electric-cyan shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 text-center">
            <Button href="/contact" size="lg">
              Get Custom Quote <ArrowRight size={18} />
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
