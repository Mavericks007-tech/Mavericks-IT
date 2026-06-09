import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { RichBody } from '@/components/ui/RichBody';
import { api } from '@/lib/api';

const ALLOWED = new Set([
  'privacy-policy',
  'terms-conditions',
  'cookie-policy',
  'refund-policy',
]);

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ legal: string }> }): Promise<Metadata> {
  const { legal } = await params;
  if (!ALLOWED.has(legal)) return { title: 'Not Found' };
  const page = await api.page(legal);
  return { title: page?.title ?? legal };
}

export async function generateStaticParams() {
  return Array.from(ALLOWED).map((legal) => ({ legal }));
}

export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const { legal } = await params;
  if (!ALLOWED.has(legal)) notFound();

  const page = await api.page(legal);
  if (!page) notFound();

  return (
    <>
      <PageHeader title={page.title} eyebrow="Legal" />
      <section className="pb-20">
        <Container>
          <div className="max-w-3xl mx-auto glass rounded-2xl p-8 sm:p-12">
            <RichBody html={page.body} />
          </div>
        </Container>
      </section>
    </>
  );
}
