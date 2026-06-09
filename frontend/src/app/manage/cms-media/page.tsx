'use client';

import { useEffect, useState } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import type { DRFPage } from '@/lib/manage-api';
import { cmsAdmin } from '@/lib/manage-api';

interface MediaRow {
  id: string;
  file: string;
  file_url?: string;
  caption: string;
  asset_type: string;
  file_size?: number;
  width?: number | null;
  height?: number | null;
  created_at: string;
}

function fmtSize(b?: number): string {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    cmsAdmin
      .list<MediaRow>('media')
      .then((d) => {
        const list = Array.isArray(d) ? d : (d as DRFPage<MediaRow>).results;
        setRows(list);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of files) {
        await cmsAdmin.uploadMedia(f, { caption: f.name, asset_type: f.type.startsWith('video') ? 'video' : 'image' });
      }
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(row: MediaRow) {
    if (!confirm(`Delete ${row.caption || row.file}?`)) return;
    try {
      await cmsAdmin.remove('media', row.id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function copyURL(url: string) {
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
  }

  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-h2 text-white">Media Library</h1>
            <p className="text-soft-gray text-sm">Images + videos uploaded via admin. Click an item to copy its URL.</p>
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan rounded-md text-sm font-medium cursor-pointer transition-colors">
            {uploading ? 'Uploading…' : '+ Upload'}
            <input type="file" multiple accept="image/*,video/*" hidden onChange={handleUpload} disabled={uploading} />
          </label>
        </header>

        {error && <div className="glass rounded-xl p-4 border border-crimson/40 text-crimson text-sm">{error}</div>}

        {loading && rows.length === 0 && <div className="glass rounded-xl p-10 text-center text-soft-gray">Loading…</div>}

        {rows.length === 0 && !loading && (
          <div className="glass rounded-xl p-10 text-center text-soft-gray">No media uploaded yet.</div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {rows.map((row) => {
            const url = row.file_url ?? row.file;
            return (
              <div key={row.id} className="glass rounded-xl overflow-hidden group">
                <button
                  type="button"
                  onClick={() => copyURL(url)}
                  className="block aspect-square w-full bg-midnight relative overflow-hidden"
                  title="Click to copy URL"
                >
                  {row.asset_type === 'video' ? (
                    <video src={url} className="w-full h-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={row.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Copy URL
                  </span>
                </button>
                <div className="p-3 space-y-1">
                  <p className="text-white text-xs truncate" title={row.caption}>{row.caption || '(no caption)'}</p>
                  <div className="flex items-center justify-between text-xs text-soft-gray">
                    <span>{fmtSize(row.file_size)}</span>
                    <button onClick={() => handleDelete(row)} className="text-crimson hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ManageShell>
  );
}
