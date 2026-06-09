import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { RichBody } from '@/components/ui/RichBody';
import { api } from '@/lib/api';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ind = await api.industry(slug);
  if (!ind) return { title: 'Industry Not Found' };
  return { title: `${ind.name} Solutions`, description: ind.description };
}

export async function generateStaticParams() {
  const data = await api.industries();
  return (data?.results ?? []).map((i) => ({ slug: i.slug }));
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = await api.industry(slug);
  if (!ind) notFound();

  return (
    <>
      <PageHeader eyebrow={`Solutions for ${ind.name}`} title={`Technology for ${ind.name}`} subtitle={ind.description}>
        <Button href="/contact" size="lg">
          Schedule Industry Consultation <ArrowRight size={18} />
        </Button>
      </PageHeader>

      <Section>
        <Container>
          <div className="max-w-3xl mx-auto glass rounded-2xl p-8 sm:p-12">
            {ind.long_description ? (
              <RichBody html={ind.long_description} />
            ) : (
              <p className="text-body-lg text-soft-gray">
                {ind.description ||
                  `We deliver custom technology solutions tailored to the ${ind.name.toLowerCase()} industry. Get in touch to discuss your specific needs.`}
              </p>
            )}
            {ind.example_service && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-xs font-mono uppercase tracking-widest text-electric-cyan mb-2">Example Service</p>
                <p className="text-white font-semibold">{ind.example_service}</p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
