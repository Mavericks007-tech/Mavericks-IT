'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { CmsResource, DRFPage } from '@/lib/manage-api';
import { cmsAdmin } from '@/lib/manage-api';

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

interface Props<T> {
  resource: CmsResource;
  columns: Column<T>[];
  newHref?: string;
  editHref: (row: T) => string;
  emptyText?: string;
  pageSize?: number;
  searchKey?: keyof T & string;
}

function isPaged<T>(d: DRFPage<T> | T[]): d is DRFPage<T> {
  return typeof (d as DRFPage<T>).count === 'number' && Array.isArray((d as DRFPage<T>).results);
}

export function EntityTable<T extends { id: string | number }>({
  resource,
  columns,
  newHref,
  editHref,
  emptyText = 'No records yet.',
  pageSize = 25,
  searchKey,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search && searchKey) qs.set('search', search);
    cmsAdmin
      .list<T>(resource, `?${qs}`)
      .then((d) => {
        if (isPaged<T>(d)) {
          setRows(d.results);
          setTotal(d.count);
        } else {
          setRows(d);
          setTotal(d.length);
        }
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [resource, page, pageSize, search, searchKey, refreshKey]);

  async function handleDelete(row: T) {
    if (!confirm(`Delete this ${resource.slice(0, -1)}? Tracked in audit log.`)) return;
    try {
      await cmsAdmin.remove(resource, row.id);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {searchKey && (
          <input
            type="search"
            placeholder={`Search by ${searchKey}…`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-midnight border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-soft-gray/60 w-72"
          />
        )}
        <div className="flex items-center gap-3 ml-auto">
          {total !== null && (
            <span className="text-soft-gray text-sm">{total.toLocaleString()} records</span>
          )}
          {newHref && (
            <Link
              href={newHref}
              className="inline-flex items-center gap-1 px-3 py-2 bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan rounded-md text-sm font-medium transition-colors"
            >
              + New
            </Link>
          )}
        </div>
      </div>

      {error && <div className="glass rounded-xl p-4 border border-crimson/40 text-crimson text-sm">{error}</div>}

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-soft-gray text-xs uppercase tracking-wider">
                {columns.map((c) => (
                  <th key={String(c.key)} className={`px-4 py-3 text-left ${c.className ?? ''}`}>{c.label}</th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-soft-gray">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-soft-gray">{emptyText}</td></tr>
              )}
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-t border-white/5 hover:bg-white/[0.02]">
                  {columns.map((c) => (
                    <td key={String(c.key)} className={`px-4 py-3 text-white ${c.className ?? ''}`}>
                      {c.render ? c.render(row) : String((row as unknown as Record<string, unknown>)[c.key as string] ?? '')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={editHref(row)} className="text-cyan hover:underline mr-3">Edit</Link>
                    <button onClick={() => handleDelete(row)} className="text-crimson hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total !== null && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 text-sm">
            <span className="text-soft-gray">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-white/10 rounded-md text-soft-gray hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-white/10 rounded-md text-soft-gray hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
