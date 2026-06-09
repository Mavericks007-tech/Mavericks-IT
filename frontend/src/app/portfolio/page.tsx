import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
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
            <PortfolioGrid cases={cases} />
          )}
        </Container>
      </Section>
    </>
  );
}
