'use client';

import { motion } from 'framer-motion';
import {
  Award, Shield, Zap, Search, HeartHandshake, Crown,
  Code2, Globe, Cloud, Sparkles, type LucideIcon,
} from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import type { Differentiator } from '@/lib/api';

const ICONS: Record<string, LucideIcon> = {
  Award, Shield, Zap, Search, HeartHandshake, Crown, Code2, Globe, Cloud, Sparkles,
};

export function DifferentiatorsSection({ items = [] }: { items?: Differentiator[] }) {
  if (!items.length) return null;

  return (
    <Section>
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
          {items.map((d, i) => {
            const Icon = ICONS[d.icon_name] || Award;
            return (
              <motion.div
                key={d.id}
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
                  {d.title}
                </h3>
                <p className="text-soft-gray leading-relaxed">
                  {d.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
