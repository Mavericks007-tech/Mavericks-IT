'use client';

import { use } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { blogPostFields } from '@/lib/manage-schemas';

export default function BlogEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="blog-posts"
          id={id === 'new' ? undefined : id}
          listHref="/manage/cms-blog"
          title={id === 'new' ? 'New Blog Post' : 'Edit Blog Post'}
          fields={blogPostFields}
        />
      </div>
    </ManageShell>
  );
}
