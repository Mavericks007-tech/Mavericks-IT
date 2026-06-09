import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function ManageNotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="glass rounded-2xl p-10 max-w-md text-center space-y-4">
        <FileQuestion size={40} className="mx-auto text-cyan" />
        <p className="font-mono text-cyan text-sm">404 — ADMIN ROUTE</p>
        <h1 className="font-display text-h3 text-white">No screen at this path.</h1>
        <p className="text-soft-gray text-sm">
          Check the sidebar or jump back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/manage/dashboard" className="px-4 py-2 bg-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-cyan/90">
            Dashboard
          </Link>
          <Link href="/manage/settings" className="px-4 py-2 border border-white/10 text-white rounded-md text-sm hover:bg-white/5">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
