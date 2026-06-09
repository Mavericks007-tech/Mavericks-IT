'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; from_path: string; to_path: string; status_code: number; is_active: boolean; hit_count: number }

export default function RedirectsList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Redirects</h1>
        <p className="text-soft-gray text-sm">
          301/302 rules. Applied by <code>core.middleware.RedirectMiddleware</code> with 60-second cache.
        </p>
        <EntityTable<Row>
          resource="redirects"
          searchKey="from_path"
          newHref="/manage/cms-redirects/new"
          editHref={(r) => `/manage/cms-redirects/${r.id}`}
          columns={[
            { key: 'from_path', label: 'From', render: (r) => <code className="text-cyan/80 text-xs">{r.from_path}</code> },
            { key: 'to_path',   label: 'To',   render: (r) => <code className="text-white/80 text-xs">{r.to_path}</code> },
            { key: 'status_code', label: 'Code', className: 'w-16' },
            { key: 'is_active', label: 'Active', render: (r) => r.is_active ? '✓' : '—' },
            { key: 'hit_count', label: 'Hits', className: 'text-right' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
