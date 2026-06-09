import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

interface Props { size?: number; className?: string; label?: string }

export function Spinner({ size = 18, className, label = 'Loading' }: Props) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex items-center', className)}>
      <Loader2 size={size} className="animate-spin motion-reduce:animate-none" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
