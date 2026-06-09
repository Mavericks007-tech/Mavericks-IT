'use client';

import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

/**
 * Animates 0 → target when scrolled into view.
 * Under prefers-reduced-motion, renders the final value immediately.
 */
export function AnimatedCounter({ to, className, suffix = '', prefix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20, mass: 1 });

  useEffect(() => {
    if (reduced || !inView) return;
    mv.set(to);
  }, [inView, mv, to, reduced]);

  useEffect(() => {
    if (reduced) return;
    return spring.on('change', (latest) => {
      if (!ref.current) return;
      ref.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`;
    });
  }, [spring, prefix, suffix, reduced]);

  const initialText = reduced
    ? `${prefix}${to.toLocaleString()}${suffix}`
    : `${prefix}0${suffix}`;

  return <span ref={ref} className={className}>{initialText}</span>;
}
