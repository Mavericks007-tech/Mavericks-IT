'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { caseStudyFields } from '@/lib/manage-schemas';

export default function CaseStudyEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="case-studies"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-case-studies"
          title={id === 'new' ? 'New Case Study' : 'Edit Case Study'}
          fields={caseStudyFields}
        />
      </div>
    </ManageShell>
  );
}
