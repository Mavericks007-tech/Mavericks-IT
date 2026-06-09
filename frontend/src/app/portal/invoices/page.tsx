'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, X } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
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

const METHODS = ['bkash', 'nagad', 'rocket', 'bank_transfer', 'cash', 'card', 'other'];

export default function PortalInvoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payTarget, setPayTarget] = useState<PortalInvoice | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) { router.push('/portal/login'); return; }
    fetch(`${API_BASE}/portal/invoices/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setInvoices(d.results ?? d ?? []))
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, [router, reloadKey]);

  function pdfHref(id: string): string {
    const token = localStorage.getItem('portal_token') || '';
    // Server reads token from Authorization header. Browser <a> cannot set
    // headers — so we proxy via fetch+blob.
    return `${API_BASE}/portal/invoices/${id}/pdf/?token=${encodeURIComponent(token)}`;
  }

  async function downloadPdf(inv: PortalInvoice) {
    const token = localStorage.getItem('portal_token') || '';
    try {
      const res = await fetch(`${API_BASE}/portal/invoices/${inv.id}/pdf/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${inv.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Download failed', (e as Error).message);
    }
  }

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
                  <div className="text-right space-y-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider"
                          style={{ background: 'rgba(255,255,255,0.05)', color: `var(--color-${STATUS_COLOR[inv.status] || 'cyan'})` }}>
                      {inv.is_overdue ? 'OVERDUE' : inv.status}
                    </span>
                    <p className="text-sm text-soft-gray">
                      Paid {inv.currency} {parseFloat(inv.amount_paid).toLocaleString()}
                    </p>
                    <p className="text-sm font-bold text-white">
                      Due {inv.currency} {parseFloat(inv.amount_due).toLocaleString()}
                    </p>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => downloadPdf(inv)}
                        className="inline-flex items-center gap-1 px-3 py-1 border border-white/10 rounded-md text-xs text-soft-gray hover:text-white hover:border-white/30"
                      >
                        <Download size={12} /> PDF
                      </button>
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <button
                          onClick={() => setPayTarget(inv)}
                          className="px-3 py-1 bg-electric-cyan text-deep-space rounded-md text-xs font-semibold hover:bg-electric-cyan/90"
                        >
                          I have paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {payTarget && (
        <PortalPayDialog
          invoice={payTarget}
          onClose={() => setPayTarget(null)}
          onSaved={() => { setPayTarget(null); setReloadKey((k) => k + 1); toast.success('Payment recorded', 'We will verify and confirm by email.'); }}
        />
      )}
    </>
  );
}


function PortalPayDialog({ invoice, onClose, onSaved }: { invoice: PortalInvoice; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(invoice.amount_due);
  const [method, setMethod] = useState('bkash');
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { toast.warning('Enter amount'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('portal_token') || '';
      const res = await fetch(`${API_BASE}/portal/invoices/${invoice.id}/record-payment/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Number(amount), method, reference }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      onSaved();
    } catch (e) {
      toast.error('Could not record', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[150] grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
            className="w-full max-w-md bg-midnight-navy border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-display text-xl text-white">Record your payment</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-soft-gray hover:text-white"><X size={18} /></button>
        </header>
        <div className="p-5 space-y-3">
          <p className="text-soft-gray text-sm">
            Invoice <code className="text-electric-cyan">{invoice.number}</code> — due {invoice.currency} {Number(invoice.amount_due).toLocaleString()}.
            We will verify with our records and email confirmation.
          </p>
          <div>
            <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1">Amount ({invoice.currency})</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                   className="w-full bg-deep-space border border-white/10 rounded-md px-3 py-2 text-sm text-white" required />
          </div>
          <div>
            <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-deep-space border border-white/10 rounded-md px-3 py-2 text-sm text-white">
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1">Reference / TrxID</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                   placeholder="e.g. bKash TrxID, bank receipt no"
                   className="w-full bg-deep-space border border-white/10 rounded-md px-3 py-2 text-sm text-white" />
          </div>
        </div>
        <footer className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 border border-white/10 rounded-md text-sm text-soft-gray hover:text-white">Cancel</button>
          <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-electric-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-electric-cyan/90 disabled:opacity-50">
            {saving ? 'Sending…' : 'Submit'}
          </button>
        </footer>
      </form>
    </div>
  );
}
