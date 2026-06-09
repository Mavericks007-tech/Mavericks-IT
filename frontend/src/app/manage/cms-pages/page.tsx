'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; slug: string; title: string; status: string; show_in_sitemap: boolean }

export default function PagesList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Pages</h1>
        <EntityTable<Row>
          resource="pages"
          searchKey="title"
          newHref="/manage/cms-pages/new"
          editHref={(r) => `/manage/cms-pages/${r.id}`}
          columns={[
            { key: 'slug',  label: 'Slug', render: (r) => <code className="text-cyan/80 text-xs">/{r.slug}</code> },
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status', render: (r) => {
              const cls = r.status === 'published' ? 'text-aurora' : r.status === 'archived' ? 'text-soft-gray' : 'text-sunset';
              return <span className={cls}>{r.status}</span>;
            }},
            { key: 'show_in_sitemap', label: 'Sitemap', render: (r) => r.show_in_sitemap ? '✓' : '—' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
