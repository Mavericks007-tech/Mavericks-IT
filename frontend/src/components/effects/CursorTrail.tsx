'use client';

import { useEffect, useRef } from 'react';

/**
 * Electric blue particle trail behind cursor.
 * Desktop only, RAF-throttled, max 20 particles, GPU-accelerated.
 */
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    interface P { x: number; y: number; vx: number; vy: number; life: number; max: number }
    const particles: P[] = [];

    const onMove = (e: MouseEvent) => {
      if (particles.length > 20) particles.shift();
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        life: 0,
        max: 30 + Math.random() * 20,
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.max) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = 1 - p.life / p.max;
        const size = 3 * alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 255, ${alpha * 0.6})`;
        ctx.shadowColor = 'rgba(0, 217, 255, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998] hidden lg:block"
      aria-hidden
    />
  );
}
