'use client';

import { Mail, Send, FileText, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTable } from '@/components/manage/DataTable';
import { ManageShell } from '@/components/manage/Shell';
import { manage } from '@/lib/manage-api';

interface Template {
  id: string;
  key: string;
  name: string;
  category: string;
  is_active: boolean;
  subject: string;
}
interface Log {
  id: string;
  subject: string;
  to_email: string;
  status: string;
  open_count: number;
  sent_at: string | null;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  sent: '#00D9FF', opened: '#00FF88', failed: '#FF3366',
  queued: '#94A3B8', clicked: '#0066FF', bounced: '#FF6B35',
};

export default function EmailPage() {
  const [tab, setTab] = useState<'templates' | 'logs' | 'stats'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<{ logs: { total: number; sent: number; opened: number; failed: number }; open_rate_percent: number } | null>(null);

  useEffect(() => {
    manage.emailTemplates().then((d) => setTemplates(((d as { results?: Template[] }).results) ?? (d as Template[]))).catch(() => {});
    manage.emailLogs().then((d) => setLogs(((d as { results?: Log[] }).results) ?? (d as Log[]))).catch(() => {});
    manage.emailStats().then((s) => setStats(s as typeof stats)).catch(() => {});
  }, []);

  return (
    <ManageShell>
      <div className="mb-6">
        <h1 className="font-display text-h2 text-white">Email</h1>
        <p className="text-soft-gray text-sm">Templates, logs, and stats.</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-white/5">
        {(['templates', 'logs', 'stats'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 ${tab === t ? 'border-electric-cyan text-electric-cyan' : 'border-transparent text-soft-gray hover:text-white'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <DataTable
          rows={templates}
          columns={[
            { key: 'name', label: 'Name', render: (t) => <span className="text-white font-semibold">{t.name}</span> },
            { key: 'key', label: 'Key', render: (t) => <span className="text-electric-cyan font-mono text-xs">{t.key}</span> },
            { key: 'category', label: 'Category', render: (t) => <span className="text-soft-gray text-sm uppercase">{t.category}</span> },
            { key: 'subject', label: 'Subject', render: (t) => <span className="text-soft-gray text-sm truncate">{t.subject}</span> },
            { key: 'is_active', label: 'Active', render: (t) => t.is_active ? <span className="text-aurora-green">●</span> : <span className="text-soft-gray">○</span> },
          ]}
        />
      )}

      {tab === 'logs' && (
        <DataTable
          rows={logs}
          columns={[
            { key: 'subject', label: 'Subject', render: (l) => <span className="text-white text-sm">{l.subject}</span> },
            { key: 'to_email', label: 'Recipient', render: (l) => <span className="text-soft-gray text-sm">{l.to_email}</span> },
            { key: 'status', label: 'Status', render: (l) => (
              <span className="text-xs font-mono uppercase px-2 py-1 rounded" style={{ color: STATUS_COLOR[l.status], background: (STATUS_COLOR[l.status] || '#94A3B8') + '20' }}>{l.status}</span>
            )},
            { key: 'open_count', label: 'Opens', render: (l) => <span className="text-electric-cyan font-mono text-sm">{l.open_count}</span> },
            { key: 'sent_at', label: 'Sent', render: (l) => <span className="text-soft-gray text-xs">{l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}</span> },
          ]}
        />
      )}

      {tab === 'stats' && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Mail size={18} />} label="Total" value={stats.logs.total} />
          <StatCard icon={<Send size={18} />} label="Sent" value={stats.logs.sent} />
          <StatCard icon={<BarChart3 size={18} />} label="Opened" value={stats.logs.opened} />
          <StatCard icon={<FileText size={18} />} label="Open Rate" value={`${stats.open_rate_percent}%`} />
        </div>
      )}
    </ManageShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-soft-gray">{label}</span>
        <span className="text-electric-cyan">{icon}</span>
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
    </div>
  );
}
