'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Download, X } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { API_BASE } from '@/lib/api';

interface PortalQuote {
  id: string;
  number: string;
  title: string;
  total: string;
  currency: string;
  issue_date: string;
  valid_until: string | null;
  status: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'soft-gray',
  sent: 'electric-cyan',
  viewed: 'electric-cyan',
  accepted: 'aurora-green',
  rejected: 'crimson-red',
  expired: 'sunset-orange',
};

export default function PortalQuotes() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<PortalQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [accept, setAccept] = useState<PortalQuote | null>(null);
  const [reload, setReload] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) { router.push('/portal/login'); return; }
    fetch(`${API_BASE}/portal/quotes/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setQuotes(d.results ?? d ?? []))
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, [router, reload]);

  async function downloadPdf(q: PortalQuote) {
    const token = localStorage.getItem('portal_token') || '';
    try {
      const res = await fetch(`${API_BASE}/portal/quotes/${q.id}/pdf/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Quote-${q.number}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Download failed', (e as Error).message);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Quotes" title="Project Proposals">
        <a href="/portal/dashboard" className="text-soft-gray hover:text-electric-cyan inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
      </PageHeader>

      <Section className="pt-0">
        <Container>
          {loading ? (
            <p className="text-soft-gray text-center">Loading…</p>
          ) : quotes.length === 0 ? (
            <p className="text-soft-gray text-center">No quotes yet.</p>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {quotes.map((q) => (
                <div key={q.id} className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-mono text-electric-cyan">{q.number}</p>
                    <p className="font-display font-bold text-white">{q.title}</p>
                    <p className="text-sm text-soft-gray mt-1">
                      {q.currency} {parseFloat(q.total).toLocaleString()} · valid until {q.valid_until || '—'}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider"
                          style={{ background: 'rgba(255,255,255,0.05)', color: `var(--color-${STATUS_COLOR[q.status] || 'cyan'})` }}>
                      {q.status}
                    </span>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => downloadPdf(q)}
                        className="inline-flex items-center gap-1 px-3 py-1 border border-white/10 rounded-md text-xs text-soft-gray hover:text-white hover:border-white/30"
                      >
                        <Download size={12} /> PDF
                      </button>
                      {q.status !== 'accepted' && q.status !== 'rejected' && q.status !== 'expired' && (
                        <button
                          onClick={() => setAccept(q)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-aurora-green text-deep-space rounded-md text-xs font-semibold hover:opacity-90"
                        >
                          <CheckCircle2 size={12} /> Accept
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

      {accept && (
        <AcceptDialog quote={accept} onClose={() => setAccept(null)}
                      onAccepted={() => { setAccept(null); setReload((r) => r + 1); toast.success('Quote accepted', 'We will send the engagement letter shortly.'); }} />
      )}
    </>
  );
}


function AcceptDialog({ quote, onClose, onAccepted }: { quote: PortalQuote; onClose: () => void; onAccepted: () => void }) {
  const [signature, setSignature] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (signature.trim().length < 2) { toast.warning('Type your full name to sign'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('portal_token') || '';
      const res = await fetch(`${API_BASE}/portal/quotes/${quote.id}/accept/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      onAccepted();
    } catch (e) {
      toast.error('Accept failed', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[150] grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
            className="w-full max-w-md bg-midnight-navy border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-display text-xl text-white">Accept quote {quote.number}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-soft-gray hover:text-white"><X size={18} /></button>
        </header>
        <div className="p-5 space-y-3">
          <p className="text-soft-gray text-sm">
            Accepting <code className="text-electric-cyan">{quote.number}</code> for <b className="text-white">{quote.currency} {Number(quote.total).toLocaleString()}</b>.
            Type your full legal name to sign — this is a binding intent to proceed.
          </p>
          <div>
            <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1">Full name</label>
            <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} required
                   className="w-full bg-deep-space border border-white/10 rounded-md px-3 py-2 text-white" />
          </div>
        </div>
        <footer className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 border border-white/10 rounded-md text-sm text-soft-gray hover:text-white">Cancel</button>
          <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-aurora-green text-deep-space rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? 'Signing…' : 'Sign & Accept'}
          </button>
        </footer>
      </form>
    </div>
  );
}
