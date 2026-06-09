'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row { id: string; name: string; key: string; subject: string; is_active: boolean }

export default function EmailTemplatesList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Email Templates</h1>
        <EntityTable<Row>
          resource="email-templates"
          searchKey="name"
          newHref="/manage/cms-email-templates/new"
          editHref={(r) => `/manage/cms-email-templates/${r.id}`}
          columns={[
            { key: 'name',     label: 'Name' },
            { key: 'key',      label: 'Key',     render: (r) => <code className="text-cyan/80 text-xs">{r.key}</code> },
            { key: 'subject',  label: 'Subject' },
            { key: 'is_active', label: 'Active', render: (r) => r.is_active ? '✓' : '—' },
          ]}
        />
      </div>
    </ManageShell>
  );
}
