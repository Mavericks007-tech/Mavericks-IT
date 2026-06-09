'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; headline: string; eyebrow: string; is_active: boolean }

export default function HeroList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Hero Sections</h1>
        <p className="text-soft-gray text-sm">Homepage hero copy + CTAs. The first <code>is_active=true</code> row is rendered.</p>
        <EntityTable<Row>
          resource="hero-sections"
          newHref="/manage/cms-hero/new"
          editHref={(r) => `/manage/cms-hero/${r.id}`}
          columns={[
            { key: 'eyebrow',  label: 'Eyebrow' },
            { key: 'headline', label: 'Headline' },
            { key: 'is_active', label: 'Active', render: (r) => r.is_active ? '✓' : '—' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
