'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { redirectFields } from '@/lib/manage-schemas';

export default function RedirectEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="redirects"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-redirects"
          title={id === 'new' ? 'New Redirect' : 'Edit Redirect'}
          fields={redirectFields}
        />
      </div>
    </ManageShell>
  );
}
