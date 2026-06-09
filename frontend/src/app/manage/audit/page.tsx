'use client';

import { useEffect, useMemo, useState } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import type { AuditEntry, AuditFeed } from '@/lib/manage-api';
import { manage } from '@/lib/manage-api';

const ACTION_COLOR: Record<string, string> = {
  create: 'bg-aurora/15 text-aurora border-aurora/40',
  update: 'bg-cyan/15 text-cyan border-cyan/40',
  delete: 'bg-crimson/15 text-crimson border-crimson/40',
};

const PAGE_SIZE = 50;

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AuditPage() {
  const [feed, setFeed] = useState<AuditFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modelFilter, setModelFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (modelFilter)  qs.set('model', modelFilter);
    if (actionFilter) qs.set('action', actionFilter);
    if (userFilter)   qs.set('user', userFilter);
    manage.auditLog(`?${qs}`)
      .then((d) => { setFeed(d); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [modelFilter, actionFilter, userFilter, offset]);

  const totalPages = useMemo(() => {
    if (!feed) return 1;
    return Math.max(1, Math.ceil(feed.total / PAGE_SIZE));
  }, [feed]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <header className="flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-h2 text-white">Audit Log</h1>
            <p className="text-soft-gray text-sm mt-1">
              Every change tracked by django-simple-history. Read-only.
            </p>
          </div>
          {feed && (
            <span className="text-soft-gray text-sm">
              {feed.total.toLocaleString()} records total
            </span>
          )}
        </header>

        <div className="glass rounded-xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={modelFilter}
            onChange={(e) => { setModelFilter(e.target.value); setOffset(0); }}
            className="bg-midnight border border-white/10 rounded-md px-3 py-2 text-sm text-white"
          >
            <option value="">All models</option>
            {feed?.available_models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setOffset(0); }}
            className="bg-midnight border border-white/10 rounded-md px-3 py-2 text-sm text-white"
          >
            <option value="">All actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>

          <input
            type="text"
            placeholder="Filter by username"
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value); setOffset(0); }}
            className="bg-midnight border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-soft-gray/60"
          />

          <button
            onClick={() => { setModelFilter(''); setActionFilter(''); setUserFilter(''); setOffset(0); }}
            className="border border-white/10 rounded-md px-3 py-2 text-sm text-soft-gray hover:text-white hover:border-white/30 transition-colors"
          >
            Clear filters
          </button>
        </div>

        {error && (
          <div className="glass rounded-xl p-4 border border-crimson/40 text-crimson text-sm">
            {error}
          </div>
        )}

        {loading && !feed && (
          <div className="glass rounded-xl p-10 text-center text-soft-gray">Loading audit feed…</div>
        )}

        {feed && (
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-soft-gray text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">When</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Model</th>
                    <th className="px-4 py-3 text-left">Object</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.results.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-soft-gray">
                      No audit records match the current filters.
                    </td></tr>
                  )}
                  {feed.results.map((row: AuditEntry) => {
                    const key = `${row.app}.${row.model}.${row.id}`;
                    const isOpen = expanded === key;
                    return (
                      <>
                        <tr
                          key={key}
                          className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer"
                          onClick={() => setExpanded(isOpen ? null : key)}
                        >
                          <td className="px-4 py-3 text-soft-gray whitespace-nowrap">{fmtTime(row.timestamp)}</td>
                          <td className="px-4 py-3 text-white">{row.user ?? <span className="text-soft-gray italic">system</span>}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${ACTION_COLOR[row.action] ?? 'bg-white/5 text-soft-gray border-white/10'}`}>
                              {row.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-cyan font-mono text-xs">{row.app}.{row.model}</td>
                          <td className="px-4 py-3 text-white truncate max-w-md">{row.object_repr}</td>
                          <td className="px-4 py-3 text-soft-gray truncate max-w-xs">{row.change_reason || '—'}</td>
                        </tr>
                        {isOpen && (
                          <tr key={key + '-detail'} className="border-t border-white/5 bg-black/30">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="text-xs text-soft-gray space-y-1">
                                <div><span className="text-white">history_id:</span> {row.id}</div>
                                <div><span className="text-white">object_id:</span> <code>{row.object_id}</code></div>
                                <div><span className="text-white">timestamp:</span> {row.timestamp}</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-white/10 text-sm">
              <span className="text-soft-gray">
                Page {currentPage} of {totalPages} — showing {feed.results.length} of {feed.total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0}
                  className="px-3 py-1 border border-white/10 rounded-md text-soft-gray hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={offset + PAGE_SIZE >= feed.total}
                  className="px-3 py-1 border border-white/10 rounded-md text-soft-gray hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManageShell>
  );
}
