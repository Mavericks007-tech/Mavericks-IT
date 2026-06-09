'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; name: string; slug: string; order: number; is_active: boolean }

export default function IndustriesList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Industries</h1>
        <EntityTable<Row>
          resource="industries"
          searchKey="name"
          newHref="/manage/cms-industries/new"
          editHref={(r) => `/manage/cms-industries/${r.id}`}
          columns={[
            { key: 'order', label: '#', className: 'w-12' },
            { key: 'name', label: 'Name' },
            { key: 'slug', label: 'Slug', render: (r) => <code className="text-cyan/80 text-xs">/industries/{r.slug}</code> },
            { key: 'is_active', label: 'Active', render: (r) => r.is_active ? '✓' : '—', className: 'w-20 text-center' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
