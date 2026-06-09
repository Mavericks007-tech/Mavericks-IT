'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { pageFields } from '@/lib/manage-schemas';

export default function PageEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="pages"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-pages"
          title={id === 'new' ? 'New Page' : 'Edit Page'}
          fields={pageFields}
        />
      </div>
    </ManageShell>
  );
}
