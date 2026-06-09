'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; title: string; slug: string; order: number; is_featured: boolean; starting_price?: string }

export default function ServicesList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Services</h1>
        <EntityTable<Row>
          resource="services"
          searchKey="title"
          newHref="/manage/cms-services/new"
          editHref={(r) => `/manage/cms-services/${r.id}`}
          columns={[
            { key: 'order', label: '#', className: 'w-12' },
            { key: 'title', label: 'Title' },
            { key: 'slug', label: 'Slug', render: (r) => <code className="text-cyan/80 text-xs">/services/{r.slug}</code> },
            { key: 'is_featured', label: 'Featured', render: (r) => r.is_featured ? '★' : '—', className: 'w-20 text-center' },
            { key: 'starting_price', label: 'Price', render: (r) => r.starting_price ? `৳${Number(r.starting_price).toLocaleString()}` : '—', className: 'w-32' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
