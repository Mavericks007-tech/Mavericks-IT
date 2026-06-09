'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { serviceFields } from '@/lib/manage-schemas';

export default function ServiceEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="services"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-services"
          title={id === 'new' ? 'New Service' : 'Edit Service'}
          fields={serviceFields}
        />
      </div>
    </ManageShell>
  );
}
