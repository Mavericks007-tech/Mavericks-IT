'use client';

import { motion } from 'framer-motion';

import { Container, Section } from '@/components/ui/Container';
import type { Industry } from '@/lib/api';

export function IndustriesSection({ industries = [] }: { industries?: Industry[] }) {
  if (!industries.length) return null;

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
            Industries We Serve
          </span>
          <h2 className="font-display text-h2 text-white mb-4">
            Built For Every Industry. <span className="text-gradient">Tailored For Yours.</span>
          </h2>
          <p className="text-body-lg text-soft-gray">
            Whether you run a restaurant in Dhaka, a garments factory in Gazipur,
            or a corporate office in Gulshan — we understand your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.id}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              className="group glass rounded-xl p-5 text-center cursor-pointer transition-all duration-300 hover:border-electric-cyan/40 hover:shadow-glow-cyan"
            >
              <div className="text-sm font-semibold text-white group-hover:text-electric-cyan transition-colors">
                {ind.name}
              </div>
              {ind.description && (
                <p className="mt-2 text-xs text-soft-gray opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-24 transition-all duration-300 overflow-hidden">
                  {ind.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
