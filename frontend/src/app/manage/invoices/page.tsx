'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Download, Receipt, TrendingUp, DollarSign } from 'lucide-react';

import { DataTable } from '@/components/manage/DataTable';
import { ManageShell } from '@/components/manage/Shell';
import { RecordPaymentDialog } from '@/components/manage/RecordPaymentDialog';
import { manage } from '@/lib/manage-api';

interface Invoice {
  id: string;
  number: string;
  client: string;
  total: string;
  amount_paid: string;
  amount_due: string;
  status: string;
  currency: string;
  issue_date: string;
  due_date: string | null;
  is_overdue: boolean;
}

interface Summary { total_billed: number; total_paid: number }

const STATUS_COLOR: Record<string, string> = {
  draft: '#94A3B8', sent: '#00D9FF', viewed: '#0066FF', paid: '#00FF88',
  partial: '#FF6B35', overdue: '#FF3366', cancelled: '#94A3B8',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [overdueCount, setOverdueCount] = useState(0);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    manage.invoices()
      .then((d) => setInvoices(((d as { results?: Invoice[] }).results) ?? (d as Invoice[])))
      .catch(() => {});
    manage.invoiceSummary().then((s) => setSummary(s as Summary)).catch(() => {});
    manage.overdueInvoices().then((d) => setOverdueCount(((d as Invoice[]) ?? []).length)).catch(() => {});
  }, [reloadKey]);

  return (
    <ManageShell>
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-h2 text-white">Invoices</h1>
          <p className="text-soft-gray text-sm">{invoices.length} invoices total.</p>
        </div>
        <a href="/manage/invoices/new"
           className="inline-flex items-center gap-1 px-3 py-2 bg-electric-cyan/15 hover:bg-electric-cyan/25 border border-electric-cyan/40 text-electric-cyan rounded-md text-sm font-medium">
          + New invoice
        </a>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card label="Total Billed" value={summary ? `৳${Math.round(summary.total_billed).toLocaleString()}` : '—'} icon={<Receipt size={18} />} />
        <Card label="Total Paid" value={summary ? `৳${Math.round(summary.total_paid).toLocaleString()}` : '—'} icon={<TrendingUp size={18} />} accent="aurora" />
        <Card label="Overdue" value={overdueCount} icon={<AlertTriangle size={18} />} accent="crimson" />
      </div>

      <DataTable
        rows={invoices}
        columns={[
          { key: 'number', label: 'Number', render: (i) => <a href={`/manage/invoices/${i.id}`} className="text-electric-cyan font-mono text-sm hover:underline">{i.number}</a> },
          { key: 'total', label: 'Total', render: (i) => <span className="text-white font-semibold">{i.currency} {Number(i.total).toLocaleString()}</span> },
          { key: 'amount_paid', label: 'Paid', render: (i) => <span className="text-aurora-green font-mono text-sm">{i.currency} {Number(i.amount_paid).toLocaleString()}</span> },
          { key: 'amount_due', label: 'Due', render: (i) => <span className="text-soft-gray font-mono text-sm">{i.currency} {Number(i.amount_due).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (i) => (
            <span className="text-xs font-mono uppercase px-2 py-1 rounded" style={{ color: STATUS_COLOR[i.status] || '#94A3B8', background: (STATUS_COLOR[i.status] || '#94A3B8') + '20' }}>
              {i.is_overdue ? 'OVERDUE' : i.status}
            </span>
          )},
          { key: 'due_date', label: 'Due Date', render: (i) => <span className="text-soft-gray text-xs">{i.due_date || '—'}</span> },
          { key: 'actions', label: 'Actions', render: (i) => (
            <div className="flex items-center gap-2">
              <a
                href={manage.invoicePdfUrl(i.id)}
                target="_blank"
                rel="noreferrer"
                title="Download PDF"
                className="inline-flex items-center gap-1 text-cyan hover:underline text-xs"
              >
                <Download size={12} /> PDF
              </a>
              {i.status !== 'paid' && i.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setPayTarget(i)}
                  className="inline-flex items-center gap-1 text-aurora-green hover:underline text-xs"
                >
                  <DollarSign size={12} /> Pay
                </button>
              )}
            </div>
          )},
        ]}
      />

      {payTarget && (
        <RecordPaymentDialog
          invoiceId={payTarget.id}
          invoiceNumber={payTarget.number}
          amountDue={Number(payTarget.amount_due)}
          currency={payTarget.currency}
          open={true}
          onClose={() => setPayTarget(null)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      )}
    </ManageShell>
  );
}

function Card({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: string }) {
  const color = accent === 'crimson' ? 'text-crimson-red' : accent === 'aurora' ? 'text-aurora-green' : 'text-white';
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-soft-gray">{label}</span>
        <span className="text-electric-cyan">{icon}</span>
      </div>
      <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
    </div>
  );
}
