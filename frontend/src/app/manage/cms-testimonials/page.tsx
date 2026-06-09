'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; client_name: string; company: string; rating: number; is_featured: boolean; order: number }

export default function TestimonialsList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Testimonials</h1>
        <EntityTable<Row>
          resource="testimonials"
          searchKey="client_name"
          newHref="/manage/cms-testimonials/new"
          editHref={(r) => `/manage/cms-testimonials/${r.id}`}
          columns={[
            { key: 'order', label: '#', className: 'w-12' },
            { key: 'client_name', label: 'Client' },
            { key: 'company', label: 'Company' },
            { key: 'rating', label: 'Rating', render: (r) => '★'.repeat(r.rating) },
            { key: 'is_featured', label: 'Featured', render: (r) => r.is_featured ? '★' : '—', className: 'w-20 text-center' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
