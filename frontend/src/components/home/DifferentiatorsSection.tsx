'use client';

import { motion } from 'framer-motion';
import { Award, Shield, Zap, Search, HeartHandshake, Crown } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import type { Differentiator } from '@/lib/api';

const FALLBACK: Array<{ title: string; description: string; icon: any }> = [
  { title: 'Engineering Excellence', description: 'Custom code, never templates. Every project built from scratch.', icon: Award },
  { title: 'Security First', description: 'Bank-grade encryption on every project. We protect like a fortress.', icon: Shield },
  { title: 'Speed & Performance', description: 'Sub-2-second load times guaranteed. Faster = more customers = more sales.', icon: Zap },
  { title: 'SEO Built-In', description: 'Rank on Google from day one. SEO baked into every page.', icon: Search },
  { title: 'Lifetime Support', description: "We don't disappear after launch. Partners, not vendors.", icon: HeartHandshake },
  { title: 'Premium Quality', description: 'Award-worthy design meets enterprise reliability. Nothing less.', icon: Crown },
];

const ICONS: Record<string, any> = {
  Award, Shield, Zap, Search, HeartHandshake, Crown,
};

export function DifferentiatorsSection({ items = [] }: { items?: Differentiator[] }) {
  const cards = items.length
    ? items.map((d) => ({ title: d.title, description: d.description, icon: ICONS[d.icon_name] || Award }))
    : FALLBACK;

  return (
    <Section className="bg-surface-elevated">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan mb-4 inline-block">
            Why Mavericks Tech
          </span>
          <h2 className="font-display text-h2 text-white mb-4">
            What Makes Us <span className="text-gradient">Different</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="glass rounded-2xl p-8 hover:shadow-glow-cyan transition-shadow duration-500"
              >
                <div className="inline-flex w-14 h-14 mb-5 rounded-xl items-center justify-center text-white shadow-glow-blue" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                  <Icon size={26} />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-soft-gray leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
