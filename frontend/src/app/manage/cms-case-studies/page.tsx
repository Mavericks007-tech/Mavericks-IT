'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row {
  id: string;
  title: string;
  client_name: string;
  industry: string;
  metric: string;
  is_featured: boolean;
  order: number;
}

export default function CaseStudyList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Case Studies</h1>
        <p className="text-soft-gray text-sm">Portfolio entries shown on /portfolio + homepage featured rotation.</p>
        <EntityTable<Row>
          resource="case-studies"
          searchKey="title"
          newHref="/manage/cms-case-studies/new"
          editHref={(r) => `/manage/cms-case-studies/${r.id}`}
          columns={[
            { key: 'order',        label: '#',        className: 'w-12' },
            { key: 'title',        label: 'Project' },
            { key: 'client_name',  label: 'Client' },
            { key: 'industry',     label: 'Industry' },
            { key: 'metric',       label: 'Metric',   render: (r) => <span className="text-cyan font-mono">{r.metric}</span> },
            { key: 'is_featured',  label: 'Featured', render: (r) => r.is_featured ? '★' : '—', className: 'w-20 text-center' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
