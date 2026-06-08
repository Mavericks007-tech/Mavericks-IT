'use client';

import clsx from 'clsx';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'mark';
  className?: string;
  showText?: boolean;
}

/**
 * Mavericks Tech logo. Geometric M with circuit traces.
 * Pure SVG — scales perfectly at any size, themable via currentColor.
 */
export function Logo({ size = 48, variant = 'mark', className, showText = false }: LogoProps) {
  return (
    <div className={clsx('inline-flex items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_24px_rgba(0,217,255,0.35)]"
        aria-label="Mavericks Tech"
      >
        <defs>
          <linearGradient id="m-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#00D9FF" />
          </linearGradient>
          <linearGradient id="circuit-grad" x1="50" y1="40" x2="100" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Left half of M */}
        <path
          d="M 15 85 L 15 22 L 30 22 L 50 55 L 50 85 L 35 85 L 35 50 L 28 38 L 28 85 Z"
          fill="url(#m-grad)"
        />

        {/* Right half of M (split) */}
        <path
          d="M 50 55 L 70 22 L 85 22 L 85 85 L 72 85 L 72 38 L 65 50 L 50 75 Z"
          fill="url(#m-grad)"
          opacity="0.9"
        />

        {/* Circuit traces extending right */}
        <g stroke="url(#circuit-grad)" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M 72 50 L 82 50 L 88 56" />
          <circle cx="90" cy="58" r="2" fill="#00D9FF" />

          <path d="M 72 60 L 85 60 L 91 66" />
          <circle cx="93" cy="68" r="2" fill="#00D9FF" />

          <path d="M 72 70 L 80 70 L 86 76" />
          <circle cx="88" cy="78" r="2" fill="#00D9FF" />
        </g>

        {/* Small accent triangle */}
        <path d="M 47 78 L 53 78 L 50 73 Z" fill="#00D9FF" />
      </svg>

      {(variant === 'full' || showText) && (
        <span className="font-display font-bold text-[1.25em] tracking-tight">
          MAVERICKS
        </span>
      )}
    </div>
  );
}

/** Favicon variant — square SVG ready to drop into /public/favicon.svg */
export function LogoFavicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="f-grad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#00D9FF" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="#0A0A0F" />
      <path d="M 20 80 L 20 25 L 32 25 L 50 55 L 68 25 L 80 25 L 80 80 L 70 80 L 70 42 L 58 58 L 50 70 L 42 58 L 30 42 L 30 80 Z" fill="url(#f-grad)" />
    </svg>
  );
}
