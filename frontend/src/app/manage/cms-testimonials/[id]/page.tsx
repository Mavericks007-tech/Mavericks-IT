'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { testimonialFields } from '@/lib/manage-schemas';

export default function TestimonialEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="testimonials"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-testimonials"
          title={id === 'new' ? 'New Testimonial' : 'Edit Testimonial'}
          fields={testimonialFields}
        />
      </div>
    </ManageShell>
  );
}
