import { TrendingUp } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'Portfolio | Real Clients, Real Results',
  description: 'Explore 250+ successful projects across 16 industries. Custom software, websites, e-commerce, mobile apps, cybersecurity.',
};

export default async function PortfolioPage() {
  const data = await api.portfolio();
  const cases = data?.results ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Our Work"
        title="Real Clients. Real Results. Real Receipts."
        subtitle="Every project tells a story. Here are some of them — from neighborhood restaurants to multinational corporations."
      />

      <Section className="pt-0">
        <Container>
          {cases.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-soft-gray mb-2">Case studies are being curated.</p>
              <p className="text-sm text-soft-gray">Check back soon or <a href="/contact" className="text-electric-cyan hover:underline">contact us</a> for client references.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {cases.map((c) => (
                <a key={c.id} href={`/portfolio/${c.id}`} className="group glass rounded-2xl overflow-hidden transition-all hover:shadow-glow-cyan">
                  {c.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image_url} alt={c.title} className="w-full h-64 object-cover" />
                  )}
                  <div className="p-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan">{c.industry}</span>
                    <h3 className="font-display text-xl font-bold text-white mt-2 mb-3 group-hover:text-electric-cyan transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-soft-gray text-sm mb-4">{c.client_name}</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <TrendingUp size={20} className="text-aurora-green" />
                      <div>
                        <p className="font-display font-bold text-white">{c.metric}</p>
                        <p className="text-xs text-soft-gray">{c.metric_description}</p>
                      </div>
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
