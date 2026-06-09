import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function PortalLoading() {
  return (
    <main className="min-h-screen p-6 lg:p-10 space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-1/2" />
      <SkeletonText lines={2} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </main>
  );
}
