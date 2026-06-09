'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

import { MagneticTilt } from '@/components/effects/MagneticTilt';
import { Container, Section } from '@/components/ui/Container';
import type { Testimonial } from '@/lib/api';

export function TestimonialsSection({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  if (!testimonials.length) return null;

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
            Trusted By
          </span>
          <h2 className="font-display text-h2 text-white">
            Don&apos;t Take Our <span className="text-gradient">Word For It</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.slice(0, 4).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <MagneticTilt intensity={6} className="h-full">
                <div className="glass rounded-2xl p-8 relative h-full">
                  <Quote className="absolute top-6 right-6 text-electric-cyan/20" size={48} />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                      <Star key={idx} size={16} className="fill-electric-cyan text-electric-cyan" />
                    ))}
                  </div>
                  <p className="text-body-lg text-white leading-relaxed mb-6 relative z-10">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="border-t border-white/10 pt-4">
                    <div className="font-display font-bold text-white">{t.name}</div>
                    <div className="text-sm text-soft-gray">
                      {t.title}{t.company && `, ${t.company}`}
                    </div>
                  </div>
                </div>
              </MagneticTilt>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
