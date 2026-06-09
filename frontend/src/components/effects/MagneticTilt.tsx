'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef, MouseEvent } from 'react';

import { cn } from '@/lib/cn';

interface Props {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

/**
 * 3D tilt card. Mouse moves → rotates on X+Y axes.
 * Spring smoothing for premium feel. Touch / reduced-motion = no-op.
 */
export function MagneticTilt({ children, className, intensity = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 240, damping: 25, mass: 0.6 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  const rotateY = useTransform(sx, [-0.5, 0.5], [-intensity, intensity]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [intensity, -intensity]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover)').matches) return;
    }
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}
