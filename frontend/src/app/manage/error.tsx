'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ManageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="glass rounded-2xl p-10 max-w-md text-center space-y-4">
        <AlertTriangle size={40} className="mx-auto text-sunset" />
        <h1 className="font-display text-h3 text-white">Admin error</h1>
        <p className="text-soft-gray text-sm">
          Something broke while loading this admin screen. The error has been logged.
        </p>
        {error.digest && <p className="text-soft-gray/60 text-xs font-mono">ref: {error.digest}</p>}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-cyan/90"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    </div>
  );
}
