'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { emailTemplateFields } from '@/lib/manage-schemas';

export default function EmailTemplateEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="email-templates"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-email-templates"
          title={id === 'new' ? 'New Email Template' : 'Edit Email Template'}
          fields={emailTemplateFields}
        />
      </div>
    </ManageShell>
  );
}
