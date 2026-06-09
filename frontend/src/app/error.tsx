'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to Sentry if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as unknown as { Sentry?: { captureException: (e: unknown) => void } };
    w.Sentry?.captureException(error);
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-[80vh] flex items-center pt-32 pb-20">
      <Container>
        <div className="max-w-xl mx-auto text-center">
          <AlertTriangle size={48} className="mx-auto text-sunset mb-6" />
          <p className="font-mono text-sunset mb-4">SOMETHING BROKE</p>
          <h1 className="font-display text-h2 text-white mb-4">
            Hit a snag rendering this page.
          </h1>
          <p className="text-soft-gray mb-2">
            Engineers have been notified. Try again — usually a transient glitch.
          </p>
          {error.digest && (
            <p className="text-xs text-soft-gray/60 font-mono mb-8">ref: {error.digest}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} size="lg"><RefreshCw size={18} /> Retry</Button>
            <Button href="/" variant="secondary" size="lg"><Home size={18} /> Homepage</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
