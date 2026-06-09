import { Mail, Heart, Zap, BookOpen, Users, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Careers | Join Mavericks Tech Bangladesh',
  description: 'Work on world-class projects, latest technologies, competitive salary, health insurance, learning budget.',
};

const PERKS = [
  { icon: Trophy, title: 'World-class projects', desc: 'Build software for top BD businesses and global clients.' },
  { icon: Zap, title: 'Latest technologies', desc: 'React, Next.js, Python, Go, AWS, modern tooling.' },
  { icon: Heart, title: 'Health insurance', desc: 'Full coverage for you and immediate family.' },
  { icon: BookOpen, title: '৳25,000/year learning budget', desc: 'Courses, books, conferences — invest in growth.' },
  { icon: Users, title: 'Team activities', desc: 'Friday team activities + annual offsite trips.' },
  { icon: Trophy, title: 'Career growth', desc: 'Clear levels, mentorship, real impact from day one.' },
];

const OPENINGS = [
  'Senior Full-Stack Developer',
  'UI/UX Designer',
  'Sales Executive',
  'Content Writer',
  'Project Manager',
  'DevOps Engineer',
  'Cybersecurity Specialist',
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Join The Mavericks. Build The Future."
        subtitle="We're hiring senior talent who care about craft. World-class projects. Real ownership."
      />

      <Section className="pt-0">
        <Container>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6">
                <div className="inline-flex w-12 h-12 mb-4 rounded-xl items-center justify-center text-deep-space" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-soft-gray text-sm">{desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-h2 text-white text-center mb-8">
              Current <span className="text-gradient">Openings</span>
            </h2>
            <div className="space-y-3 mb-12">
              {OPENINGS.map((role) => (
                <div key={role} className="glass rounded-xl p-5 flex items-center justify-between gap-4">
                  <span className="font-display font-semibold text-white">{role}</span>
                  <a
                    href={`mailto:careers@maverickstech.com.bd?subject=Application — ${encodeURIComponent(role)}`}
                    className="text-sm font-semibold text-electric-cyan hover:underline"
                  >
                    Apply →
                  </a>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-soft-gray mb-4">Don&apos;t see your role?</p>
              <Button href="mailto:careers@maverickstech.com.bd" size="lg">
                <Mail size={18} /> Send Resume
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
