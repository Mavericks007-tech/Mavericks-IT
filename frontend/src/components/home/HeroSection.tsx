'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import type { HeroData, TrustStat } from '@/lib/api';

const HeroScene = dynamic(() => import('@/components/three/HeroScene').then(m => m.HeroScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 -z-10" style={{ background: 'rgba(0, 217, 255, 0.06)' }} />
  ),
});

interface Props {
  hero: HeroData | null;
  trustStats?: TrustStat[];
}

export function HeroSection({ hero, trustStats = [] }: Props) {
  if (!hero) {
    return (
      <section className="relative min-h-screen flex items-center justify-center">
        <p className="text-soft-gray">Loading...</p>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <HeroScene />

      <Container className="relative z-10 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-xs font-mono uppercase tracking-wider text-electric-cyan"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-aurora-green animate-pulse" />
            250+ Projects Delivered
          </motion.span>

          <h1 className="font-display text-h1 text-white mb-6 text-balance">
            {hero.headline.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.6, ease: 'easeOut' }}
                className={`inline-block mr-[0.25em] ${
                  word.toLowerCase().includes('trusted') || word.toLowerCase().includes('technology')
                    ? 'text-gradient'
                    : ''
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-body-lg text-soft-gray max-w-2xl mx-auto mb-10"
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button href={hero.primary_cta_link} size="lg">
              {hero.primary_cta_text} <ArrowRight size={18} />
            </Button>
            <Button href={hero.secondary_cta_link} size="lg" variant="secondary">
              {hero.secondary_cta_text}
            </Button>
          </motion.div>
        </motion.div>

        {trustStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {trustStats.map((stat) => (
              <div key={stat.id} className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-soft-gray">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </Container>
    </section>
  );
}
