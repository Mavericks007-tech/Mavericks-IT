'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/brand/Logo';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * First-paint loading screen.
 * Shows for max 1.2s OR until window 'load' fires. Then morphs out.
 * Skipped entirely under prefers-reduced-motion.
 */
export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (reduced) {
      setVisible(false);
      return;
    }

    // Skip on hot reload (page already loaded)
    if (document.readyState === 'complete') {
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }

    const maxTimer = setTimeout(() => setVisible(false), 1200);
    const onLoad = () => {
      setTimeout(() => setVisible(false), 200);
      clearTimeout(maxTimer);
    };
    window.addEventListener('load', onLoad);
    return () => {
      clearTimeout(maxTimer);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-deep-space pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6"
          >
            <Logo size={80} />
            <div className="w-32 h-px bg-white/10 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-full bg-electric-cyan"
              />
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-electric-cyan">
              MAVERICKS TECH
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
