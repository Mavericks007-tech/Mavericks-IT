'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { industryFields } from '@/lib/manage-schemas';

export default function IndustryEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="industries"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-industries"
          title={id === 'new' ? 'New Industry' : 'Edit Industry'}
          fields={industryFields}
        />
      </div>
    </ManageShell>
  );
}
