'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Container } from './Container';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-4xl mx-auto text-center"
        >
          {eyebrow && (
            <span className="inline-block text-xs font-mono uppercase tracking-widest text-electric-cyan mb-4">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display text-h1 text-white mb-6 text-balance">
            {title.split(' ').map((word, i, arr) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
                className={`inline-block mr-[0.25em] ${i >= arr.length - 2 ? 'text-gradient' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-body-lg text-soft-gray max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </motion.div>
      </Container>
    </section>
  );
}
