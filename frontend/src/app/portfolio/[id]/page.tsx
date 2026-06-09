import { ArrowLeft, Quote } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Container, Section } from '@/components/ui/Container';
import { api } from '@/lib/api';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await api.caseStudy(id);
  if (!c) return { title: 'Case Study Not Found' };
  return { title: c.title, description: c.description };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await api.caseStudy(id);
  if (!c) notFound();

  return (
    <article className="pt-32 pb-20">
      <Container>
        <a href="/portfolio" className="inline-flex items-center gap-2 text-soft-gray hover:text-electric-cyan transition mb-8">
          <ArrowLeft size={16} /> All Case Studies
        </a>

        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan">{c.industry}</span>
          <h1 className="font-display text-h1 text-white mt-3 mb-4 text-balance">{c.title}</h1>
          <p className="text-body-lg text-soft-gray">Client: {c.client_name}</p>

          <div className="my-10 glass rounded-2xl p-8 text-center">
            <p className="text-5xl font-display font-bold text-gradient mb-2">{c.metric}</p>
            <p className="text-soft-gray">{c.metric_description}</p>
          </div>

          <Section className="space-y-10 py-0">
            <div>
              <h2 className="font-display text-h3 text-white mb-4">The Challenge</h2>
              <p className="text-body-lg text-soft-gray leading-relaxed">{c.challenge}</p>
            </div>
            <div>
              <h2 className="font-display text-h3 text-white mb-4">Our Solution</h2>
              <p className="text-body-lg text-soft-gray leading-relaxed">{c.solution}</p>
            </div>
            {c.results && c.results.length > 0 && (
              <div>
                <h2 className="font-display text-h3 text-white mb-4">Results</h2>
                <ul className="space-y-2">
                  {c.results.map((r, i) => (
                    <li key={i} className="text-soft-gray flex gap-3">
                      <span className="text-electric-cyan">▸</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.technologies && c.technologies.length > 0 && (
              <div>
                <h3 className="font-display text-h4 text-white mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {c.technologies.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full glass text-sm text-soft-gray">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {c.testimonial_quote && (
            <div className="mt-12 glass rounded-2xl p-8 relative">
              <Quote className="absolute top-6 right-6 text-electric-cyan/20" size={48} />
              <p className="text-body-lg text-white italic leading-relaxed mb-6">&ldquo;{c.testimonial_quote}&rdquo;</p>
              <div className="pt-4 border-t border-white/10">
                <p className="font-display font-bold text-white">{c.testimonial_author}</p>
                <p className="text-sm text-soft-gray">{c.testimonial_title}</p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </article>
  );
}
