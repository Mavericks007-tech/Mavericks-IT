'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { API_BASE } from '@/lib/api';

interface PortalInvoice {
  id: string;
  number: string;
  issue_date: string;
  due_date: string | null;
  total: string;
  amount_paid: string;
  amount_due: string;
  status: string;
  currency: string;
  is_overdue: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'aurora-green',
  partial: 'sunset-orange',
  overdue: 'crimson-red',
  sent: 'electric-cyan',
  draft: 'soft-gray',
  cancelled: 'soft-gray',
  viewed: 'electric-cyan',
};

export default function PortalInvoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) { router.push('/portal/login'); return; }
    fetch(`${API_BASE}/portal/invoices/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setInvoices(d.results ?? d ?? []))
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <PageHeader eyebrow="Invoices" title="Billing & Payments">
        <a href="/portal/dashboard" className="text-soft-gray hover:text-electric-cyan inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
      </PageHeader>

      <Section className="pt-0">
        <Container>
          {loading ? (
            <p className="text-soft-gray text-center">Loading…</p>
          ) : invoices.length === 0 ? (
            <p className="text-soft-gray text-center">No invoices yet.</p>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-mono text-electric-cyan">{inv.number}</p>
                    <p className="font-display font-bold text-white">
                      {inv.currency} {parseFloat(inv.total).toLocaleString()}
                    </p>
                    <p className="text-xs text-soft-gray mt-1">
                      Issued {inv.issue_date} · Due {inv.due_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider`} style={{ background: 'rgba(255,255,255,0.05)', color: `var(--color-${STATUS_COLOR[inv.status] || 'cyan'})` }}>
                      {inv.is_overdue ? 'OVERDUE' : inv.status}
                    </span>
                    <p className="text-sm text-soft-gray mt-2">
                      Paid {inv.currency} {parseFloat(inv.amount_paid).toLocaleString()}
                    </p>
                    <p className="text-sm font-bold text-white">
                      Due {inv.currency} {parseFloat(inv.amount_due).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
