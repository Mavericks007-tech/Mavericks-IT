import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ServiceSceneLazy } from '@/components/three/ServiceSceneLazy';
import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { RichBody } from '@/components/ui/RichBody';
import { api } from '@/lib/api';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await api.service(slug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: service.title,
    description: service.subtitle,
  };
}

export async function generateStaticParams() {
  const data = await api.services();
  return (data?.results ?? []).map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await api.service(slug);
  if (!service) notFound();

  return (
    <>
      <div className="relative">
        <ServiceSceneLazy slug={service.slug} />
        <PageHeader eyebrow="Service" title={service.title} subtitle={service.subtitle}>
          <Button href="/contact" size="lg">
            Get Free Consultation <ArrowRight size={18} />
          </Button>
        </PageHeader>
      </div>

      <Section>
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 glass rounded-2xl p-8 sm:p-12">
              {service.long_description ? (
                <RichBody html={service.long_description} />
              ) : (
                <div>
                  <h2 className="font-display text-h3 text-white mb-4">In Simple Words</h2>
                  <p className="text-body-lg text-soft-gray leading-relaxed">{service.simple_explanation}</p>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {service.starting_price && (
                <div className="glass rounded-2xl p-6">
                  <p className="text-xs font-mono uppercase tracking-widest text-electric-cyan mb-2">
                    Investment
                  </p>
                  <p className="font-display text-3xl font-bold text-white">
                    {service.currency} {parseFloat(service.starting_price).toLocaleString()}+
                  </p>
                  <p className="text-sm text-soft-gray mt-2">Starting price. Final quote after discovery call.</p>
                </div>
              )}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-white mb-4">Ready to start?</h3>
                <p className="text-sm text-soft-gray mb-4">
                  Free 30-min consultation. No commitment.
                </p>
                <Button href="/contact" className="w-full">
                  Book a Call →
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
