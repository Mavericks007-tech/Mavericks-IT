import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'Our Process | How We Deliver Software Projects',
  description: 'A proven 5-step process that has delivered 250+ successful projects on time and on budget.',
};

export default async function ProcessPage() {
  const data = await api.homepage();
  const steps = data?.process_steps ?? [];

  return (
    <>
      <PageHeader
        eyebrow="How We Work"
        title="How We Turn Ideas Into Software That Wins"
        subtitle="A proven process refined over 250+ projects. Transparent timelines. Weekly updates. Zero surprises."
      />

      <Section>
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            {steps.map((step, i) => (
              <div key={step.id} className="glass rounded-2xl p-8 flex gap-6 items-start">
                <div className="shrink-0 inline-flex w-14 h-14 rounded-xl items-center justify-center text-deep-space font-display font-bold text-2xl" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
                    <span className="text-xs font-mono text-electric-cyan">{step.duration}</span>
                  </div>
                  <p className="text-soft-gray leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
