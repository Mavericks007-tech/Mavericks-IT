import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function ManageLoading() {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:block w-64 bg-midnight-navy border-r border-white/5 p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
      </aside>
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <SkeletonText lines={2} />
        <div className="glass rounded-xl p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </main>
    </div>
  );
}
