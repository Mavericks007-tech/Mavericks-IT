'use client';

import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Props {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

/**
 * Animates 0 → target when scrolled into view.
 */
export function AnimatedCounter({ to, duration = 2, className, suffix = '', prefix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20, mass: 1 });

  useEffect(() => {
    if (!inView) return;
    mv.set(to);
  }, [inView, mv, to]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (!ref.current) return;
      ref.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`;
    });
  }, [spring, prefix, suffix]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
