import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function PortalNotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="glass rounded-2xl p-10 max-w-md text-center space-y-4">
        <FileQuestion size={40} className="mx-auto text-cyan" />
        <p className="font-mono text-cyan text-sm">404 — PORTAL</p>
        <h1 className="font-display text-h3 text-white">Not found in your portal.</h1>
        <p className="text-soft-gray text-sm">
          You may not have access, or the item was removed.
        </p>
        <Link href="/portal/dashboard" className="inline-block mt-2 px-4 py-2 bg-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-cyan/90">
          Portal Dashboard
        </Link>
      </div>
    </div>
  );
}
