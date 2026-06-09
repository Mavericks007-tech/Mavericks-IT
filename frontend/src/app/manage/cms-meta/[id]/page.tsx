'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { metaTagFields } from '@/lib/manage-schemas';

export default function MetaTagEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="meta-tags"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-meta"
          title={id === 'new' ? 'New Meta Tag' : 'Edit Meta Tag'}
          fields={metaTagFields}
        />
      </div>
    </ManageShell>
  );
}
