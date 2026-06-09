'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { ctaFields } from '@/lib/manage-schemas';

export default function CTAEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="cta-sections"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-cta"
          title={id === 'new' ? 'New CTA' : 'Edit CTA'}
          fields={ctaFields}
        />
      </div>
    </ManageShell>
  );
}
