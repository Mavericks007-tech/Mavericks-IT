import { cn } from '@/lib/cn';

interface Props {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shimmer?: boolean;
}

const RADIUS = {
  none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg',
  xl: 'rounded-xl', '2xl': 'rounded-2xl', full: 'rounded-full',
};

export function Skeleton({ className, rounded = 'md', shimmer = true }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-white/[0.05] relative overflow-hidden',
        RADIUS[rounded],
        shimmer && 'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent before:animate-[shimmer_1.6s_infinite] motion-reduce:before:hidden',
        className,
      )}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <Skeleton className="h-44 w-full" rounded="xl" />
      <Skeleton className="h-6 w-3/4" />
      <SkeletonText lines={3} />
    </div>
  );
}
