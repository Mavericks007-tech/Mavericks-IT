'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { heroFields } from '@/lib/manage-schemas';

export default function HeroEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="hero-sections"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-hero"
          title={id === 'new' ? 'New Hero' : 'Edit Hero'}
          fields={heroFields}
        />
      </div>
    </ManageShell>
  );
}
