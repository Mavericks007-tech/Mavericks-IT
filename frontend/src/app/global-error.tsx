'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Global error boundary:', error);
  }, [error]);
  return (
    <html lang="en">
      <body style={{ background: '#0A0A0F', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'ui-sans-serif, system-ui' }}>
        <main style={{ textAlign: 'center', padding: '2rem', maxWidth: 440 }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Application crashed</h1>
          <p style={{ color: '#94A3B8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            A fatal error stopped the app. We&apos;ve logged it.
          </p>
          {error.digest && <p style={{ color: '#94A3B888', fontSize: '12px', fontFamily: 'monospace' }}>ref: {error.digest}</p>}
          <button
            onClick={reset}
            style={{
              marginTop: '1.5rem', padding: '0.75rem 1.5rem',
              background: '#00D9FF', color: '#0A0A0F',
              borderRadius: 8, border: 0, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </main>
      </body>
    </html>
  );
}
