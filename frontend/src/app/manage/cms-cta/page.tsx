'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; headline: string; is_active: boolean }

export default function CTAList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">CTA Sections</h1>
        <EntityTable<Row>
          resource="cta-sections"
          newHref="/manage/cms-cta/new"
          editHref={(r) => `/manage/cms-cta/${r.id}`}
          columns={[
            { key: 'headline', label: 'Headline' },
            { key: 'is_active', label: 'Active', render: (r) => r.is_active ? '✓' : '—' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
