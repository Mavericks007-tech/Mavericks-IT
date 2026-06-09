'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityTable } from '@/components/manage/EntityTable';

interface Row {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  is_published: boolean;
  published_at: string;
  views: number;
}

export default function BlogList() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <h1 className="font-display text-h2 text-white">Blog Posts</h1>
        <EntityTable<Row>
          resource="blog-posts"
          searchKey="title"
          newHref="/manage/cms-blog/new"
          editHref={(r) => `/manage/cms-blog/${r.id}`}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'author', label: 'Author' },
            { key: 'category', label: 'Category' },
            { key: 'is_published', label: 'Published', render: (r) => r.is_published ? '✓' : '—' },
            { key: 'views', label: 'Views', className: 'text-right' },
            { key: 'published_at', label: 'Date', render: (r) => new Date(r.published_at).toLocaleDateString() },
          ]}
        />
      </div>
    </ManageShell>
  );
}
