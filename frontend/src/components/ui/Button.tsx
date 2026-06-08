'use client';

import { motion } from 'framer-motion';
import { useRef, MouseEvent, ReactNode, forwardRef } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  className?: string;
  magnetic?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
}

const variants: Record<Variant, string> = {
  primary: 'bg-electric-cyan text-deep-space hover:shadow-glow-cyan-lg',
  secondary: 'bg-transparent border border-soft-gray/40 text-white hover:border-electric-cyan hover:text-electric-cyan',
  ghost: 'bg-transparent text-electric-cyan hover:bg-electric-cyan/10',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', href, onClick, className, magnetic = true, type = 'button', disabled, ...rest },
  _ref,
) {
  const innerRef = useRef<HTMLElement>(null);

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    if (!magnetic || !innerRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = innerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    innerRef.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  const handleLeave = () => {
    if (!innerRef.current) return;
    innerRef.current.style.transform = '';
  };

  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
    'transition-[box-shadow,background,border-color,color] duration-300',
    'select-none cursor-pointer will-change-transform',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  );

  const motionProps = {
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
  };

  if (href) {
    return (
      <motion.a
        ref={innerRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...motionProps}
        {...rest}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={innerRef as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
