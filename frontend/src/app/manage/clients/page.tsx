'use client';

import { useEffect, useState } from 'react';

import { DataTable } from '@/components/manage/DataTable';
import { ManageShell } from '@/components/manage/Shell';
import { manage } from '@/lib/manage-api';

interface Client {
  id: string;
  company_name: string;
  industry: string;
  is_vip: boolean;
  health_score: number;
  lifetime_value: string;
  account_manager?: number | null;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    manage.clients()
      .then((d) => setClients(((d as { results?: Client[] }).results) ?? (d as Client[])))
      .catch(() => {});
  }, []);

  return (
    <ManageShell>
      <div className="mb-6">
        <h1 className="font-display text-h2 text-white">Clients</h1>
        <p className="text-soft-gray text-sm">{clients.length} companies in your book.</p>
      </div>

      <DataTable
        rows={clients}
        rowHref={(c) => `/manage/clients/${c.id}`}
        columns={[
          { key: 'company_name', label: 'Company', render: (c) => (
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{c.company_name}</span>
              {c.is_vip && <span className="text-xs px-1.5 py-0.5 rounded font-mono uppercase" style={{ background: '#FFA50020', color: '#FFA500' }}>VIP</span>}
            </div>
          )},
          { key: 'industry', label: 'Industry', render: (c) => <span className="text-soft-gray text-sm">{c.industry}</span> },
          { key: 'health_score', label: 'Health', render: (c) => <span className="text-electric-cyan font-mono text-sm">{c.health_score}/10</span> },
          { key: 'lifetime_value', label: 'Lifetime Value', render: (c) => <span className="text-white font-semibold">৳{Number(c.lifetime_value).toLocaleString()}</span> },
          { key: 'created_at', label: 'Since', render: (c) => <span className="text-soft-gray text-xs">{new Date(c.created_at).toLocaleDateString()}</span> },
        ]}
      />
    </ManageShell>
  );
}
