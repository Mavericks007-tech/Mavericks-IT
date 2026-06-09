'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; path: string; title: string; description: string; robots: string }

export default function MetaTagList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">SEO Meta Tags</h1>
        <p className="text-soft-gray text-sm">
          Per-path title, description, OG, Twitter, JSON-LD source data. Consumed by Next <code>generateMetadata</code>.
        </p>
        <EntityTable<Row>
          resource="meta-tags"
          searchKey="path"
          newHref="/manage/cms-meta/new"
          editHref={(r) => `/manage/cms-meta/${r.id}`}
          columns={[
            { key: 'path',  label: 'Path',  render: (r) => <code className="text-cyan/80 text-xs">{r.path}</code> },
            { key: 'title', label: 'Title', render: (r) => <span className="truncate">{r.title}</span> },
            { key: 'robots', label: 'Robots', className: 'w-32' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
