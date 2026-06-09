'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTable } from '@/components/manage/DataTable';
import { ManageShell } from '@/components/manage/Shell';
import { manage } from '@/lib/manage-api';

interface Quote {  // eslint-disable-line @typescript-eslint/no-unused-vars
  id: string;
  number: string;
  title: string;
  status: string;
  total: string;
  currency: string;
  issue_date: string;
  valid_until: string | null;
  view_count: number;
}

const STATUS_COLOR: Record<string, string> = {
  draft: '#94A3B8', sent: '#00D9FF', viewed: '#0066FF', accepted: '#00FF88',
  rejected: '#FF3366', expired: '#FF6B35',
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    manage.quotes()
      .then((d) => setQuotes(((d as { results?: Quote[] }).results) ?? (d as Quote[])))
      .catch(() => {});
  }, []);

  return (
    <ManageShell>
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-h2 text-white">Quotes</h1>
          <p className="text-soft-gray text-sm">{quotes.length} quotes.</p>
        </div>
        <a href="/manage/quotes/new"
           className="inline-flex items-center gap-1 px-3 py-2 bg-electric-cyan/15 hover:bg-electric-cyan/25 border border-electric-cyan/40 text-electric-cyan rounded-md text-sm font-medium">
          + New quote
        </a>
      </div>

      <DataTable
        rows={quotes}
        columns={[
          { key: 'number', label: 'Number', render: (q) => <a href={`/manage/quotes/${q.id}`} className="text-electric-cyan font-mono text-sm hover:underline">{q.number}</a> },
          { key: 'title', label: 'Title', render: (q) => <a href={`/manage/quotes/${q.id}`} className="text-white hover:text-electric-cyan">{q.title}</a> },
          { key: 'total', label: 'Total', render: (q) => <span className="text-white font-semibold">{q.currency} {Number(q.total).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (q) => (
            <span className="text-xs font-mono uppercase px-2 py-1 rounded" style={{ color: STATUS_COLOR[q.status], background: (STATUS_COLOR[q.status] || '#94A3B8') + '20' }}>{q.status}</span>
          )},
          { key: 'view_count', label: 'Views', render: (q) => <span className="text-soft-gray font-mono text-sm">{q.view_count}</span> },
          { key: 'valid_until', label: 'Valid Until', render: (q) => <span className="text-soft-gray text-xs">{q.valid_until || '—'}</span> },
          { key: 'pdf', label: 'PDF', render: (q) => (
            <a
              href={manage.quotePdfUrl(q.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-cyan hover:underline text-xs"
            >
              <Download size={12} /> PDF
            </a>
          )},
        ]}
      />
    </ManageShell>
  );
}
