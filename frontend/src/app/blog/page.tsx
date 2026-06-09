import { Calendar, Clock } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'Insights From Our Engineers',
  description: 'Web development, custom software, SEO, cybersecurity, industry insights, case studies from Bangladesh tech experts.',
};

export default async function BlogPage() {
  const data = await api.blog();
  const posts = data?.results ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Insights From Our Engineers"
        subtitle="Web dev. Custom software. SEO. Cybersecurity. Industry insights. Real lessons from the trenches."
      />

      <Section className="pt-0">
        <Container>
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-soft-gray">No posts published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {posts.map((p) => (
                <a key={p.id} href={`/blog/${p.slug}`} className="group glass rounded-2xl overflow-hidden transition-all hover:shadow-glow-cyan">
                  {p.featured_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.featured_image} alt={p.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan">{p.category}</span>
                    <h3 className="font-display text-xl font-bold text-white mt-2 mb-2 group-hover:text-electric-cyan transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-soft-gray text-sm mb-4 line-clamp-2">{p.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-soft-gray pt-4 border-t border-white/5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {new Date(p.published_at).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {p.read_time} min
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
