import { Container, Section } from '@/components/ui/Container';
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <Section className="pt-32">
      <Container>
        <div className="max-w-2xl space-y-4 mb-12">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <SkeletonText lines={3} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </Container>
    </Section>
  );
}
