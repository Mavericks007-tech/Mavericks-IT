'use client';

import { useEffect, useRef } from 'react';

/**
 * Desktop-only magnetic cursor. Hidden on touch devices.
 */
export function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip on touch / coarse pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      raf = requestAnimationFrame(animate);
    };
    let raf = requestAnimationFrame(animate);

    const onHover = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-magnetic]')) cursor.classList.add('hover');
      else cursor.classList.remove('hover');
    };

    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', onHover);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', onHover);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric-cyan mix-blend-difference transition-[width,height,border-color] duration-200 lg:block"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric-cyan lg:block"
        style={{ willChange: 'transform' }}
      />
      <style jsx global>{`
        .hover {
          width: 64px !important;
          height: 64px !important;
          background: rgba(0, 217, 255, 0.1);
        }
      `}</style>
    </>
  );
}
