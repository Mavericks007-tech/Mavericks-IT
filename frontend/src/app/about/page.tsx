import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { RichBody } from '@/components/ui/RichBody';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'About Mavericks Tech | Bangladesh\'s Premier IT Company',
  description: "Meet Mavericks Tech Bangladesh — senior engineers building world-class software since 2020.",
};

const VALUES = [
  { title: 'Engineering Excellence', desc: "We don't ship until it's perfect. Every line of code is reviewed. Every feature is tested." },
  { title: 'Client Obsession', desc: 'Your success is our only metric. We measure ourselves by your growth.' },
  { title: 'Security First', desc: 'Every system we build is built to defend. Security is the foundation.' },
  { title: 'Innovation Always', desc: "We use tomorrow's technology today. Constantly learning, experimenting, improving." },
  { title: 'Honest Partnership', desc: "Transparent pricing. Honest timelines. Real results." },
];

export default async function AboutPage() {
  const page = await api.page('about');
  const homepage = await api.homepage();
  const trustStats = homepage?.trust_stats ?? [];

  return (
    <>
      <PageHeader
        eyebrow="About Mavericks Tech"
        title="We Are Mavericks. We Build For The Brave."
        subtitle="Founded in Bangladesh with global ambition. We exist for one reason — to give bold businesses the digital weapons they need to win."
      />

      {page?.body && (
        <Section className="pt-0">
          <Container>
            <div className="max-w-3xl mx-auto glass rounded-2xl p-8 sm:p-12">
              <RichBody html={page.body} />
            </div>
          </Container>
        </Section>
      )}

      <Section>
        <Container>
          <h2 className="font-display text-h2 text-white text-center mb-12">
            What We <span className="text-gradient">Stand For</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="glass rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-white mb-2">{v.title}</h3>
                <p className="text-soft-gray text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {trustStats.length > 0 && (
        <Section>
          <Container>
            <h2 className="font-display text-h2 text-white text-center mb-12">
              Mavericks In <span className="text-gradient">Numbers</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustStats.map((s) => (
                <div key={s.id} className="glass rounded-2xl p-6 text-center">
                  <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{s.value}</div>
                  <div className="text-sm text-soft-gray">{s.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
