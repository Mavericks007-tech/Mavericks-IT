'use client';

import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import type { LineItem } from '@/components/manage/LineItemEditor';
import { LineItemEditor } from '@/components/manage/LineItemEditor';
import { ManageShell } from '@/components/manage/Shell';
import { useToast } from '@/components/ui/Toast';
import type { DRFPage } from '@/lib/manage-api';
import { cmsAdmin, manage } from '@/lib/manage-api';

const STATUSES = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];

interface ClientRow { id: string; company_name: string }
interface LeadRow { id: string; full_name: string; company_name: string }

interface QuoteData {
  id?: string;
  number?: string;
  title: string;
  description: string;
  client?: string | null;
  lead?: string | null;
  issue_date: string;
  valid_until: string;
  service_type: string;
  status: string;
  currency: string;
  discount: number;
  vat_percent: number;
  payment_terms: string;
  inclusions: string;
  exclusions: string;
  cover_letter: string;
  line_items: LineItem[];
}

const EMPTY: QuoteData = {
  title: '',
  description: '',
  client: null,
  lead: null,
  issue_date: new Date().toISOString().slice(0, 10),
  valid_until: '',
  service_type: 'custom_software',
  status: 'draft',
  currency: 'BDT',
  discount: 0,
  vat_percent: 15,
  payment_terms: '40% upfront, 30% midway, 30% on delivery.',
  inclusions: '',
  exclusions: '',
  cover_letter: '',
  line_items: [],
};

export default function QuoteEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = useState<QuoteData>(EMPTY);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cmsAdmin.list<ClientRow>('users' as never, '').catch(() => {});  // warm session
    manage.clients()
      .then((d) => setClients(((d as { results?: ClientRow[] }).results) ?? (d as ClientRow[])))
      .catch(() => {});
    manage.leads('?page_size=200')
      .then((d) => setLeads(((d as { results?: LeadRow[] }).results) ?? (d as LeadRow[])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    manage.quote(id)
      .then((d) => setData({ ...EMPTY, ...(d as QuoteData), line_items: (d as QuoteData).line_items ?? [] }))
      .catch((e: Error) => toast.error('Could not load', e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof QuoteData>(k: K, v: QuoteData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function save() {
    if (!data.title.trim()) { toast.warning('Title required'); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...data,
        valid_until: data.valid_until || null,
        line_items: data.line_items.map((it, i) => ({
          description: it.description,
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          order: i,
        })),
      };
      // Server-required for new: number — auto-generate if blank
      if (isNew && !payload.number) {
        payload.number = `Q-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
      }
      if (isNew) {
        const created = await manage.createQuote(payload) as { id: string };
        toast.success('Quote created');
        router.push(`/manage/quotes/${created.id}`);
      } else {
        const updated = await manage.updateQuote(id, payload) as QuoteData;
        setData({ ...EMPTY, ...updated, line_items: updated.line_items ?? [] });
        toast.success('Quote saved');
      }
    } catch (e) {
      toast.error('Save failed', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm('Delete this quote?')) return;
    try {
      await manage.deleteQuote(id);
      toast.success('Deleted');
      router.push('/manage/quotes');
    } catch (e) {
      toast.error('Delete failed', (e as Error).message);
    }
  }

  if (loading) {
    return <ManageShell><div className="p-8 text-soft-gray">Loading…</div></ManageShell>;
  }

  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Link href="/manage/quotes" className="inline-flex items-center gap-1 text-soft-gray text-sm hover:text-white">
              <ArrowLeft size={14} /> All quotes
            </Link>
            <h1 className="font-display text-h2 text-white mt-1">
              {isNew ? 'New Quote' : `Quote ${data.number ?? ''}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                <a href={manage.quotePdfUrl(id)} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/10 rounded-md text-sm text-soft-gray hover:text-white hover:border-white/30">
                  <Download size={14} /> PDF
                </a>
                <button onClick={remove} className="px-3 py-2 border border-crimson/40 text-crimson rounded-md text-sm hover:bg-crimson/10">
                  Delete
                </button>
              </>
            )}
            <button onClick={save} disabled={saving}
                    className="px-4 py-2 bg-electric-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-electric-cyan/90 disabled:opacity-50">
              {saving ? 'Saving…' : isNew ? 'Create quote' : 'Save changes'}
            </button>
          </div>
        </header>

        <div className="glass rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Title" full>
            <input value={data.title} onChange={(e) => set('title', e.target.value)} className="input" required />
          </Field>
          <Field label="Client">
            <select value={data.client ?? ''} onChange={(e) => set('client', e.target.value || null)} className="input">
              <option value="">— none —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </Field>
          <Field label="Lead">
            <select value={data.lead ?? ''} onChange={(e) => set('lead', e.target.value || null)} className="input">
              <option value="">— none —</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name}{l.company_name ? ` (${l.company_name})` : ''}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={data.status} onChange={(e) => set('status', e.target.value)} className="input">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Issue date">
            <input type="date" value={data.issue_date} onChange={(e) => set('issue_date', e.target.value)} className="input" />
          </Field>
          <Field label="Valid until">
            <input type="date" value={data.valid_until} onChange={(e) => set('valid_until', e.target.value)} className="input" />
          </Field>
          <Field label="Description" full>
            <textarea rows={2} value={data.description} onChange={(e) => set('description', e.target.value)} className="input" />
          </Field>
        </div>

        <LineItemEditor
          items={data.line_items}
          onChange={(items) => set('line_items', items)}
          currency={data.currency}
          discount={data.discount}
          onDiscount={(v) => set('discount', v)}
          vatPercent={data.vat_percent}
          onVat={(v) => set('vat_percent', v)}
        />

        <div className="glass rounded-xl p-5 grid sm:grid-cols-2 gap-4">
          <Field label="Payment terms" full>
            <textarea rows={2} value={data.payment_terms} onChange={(e) => set('payment_terms', e.target.value)} className="input" />
          </Field>
          <Field label="Inclusions" full>
            <textarea rows={3} value={data.inclusions} onChange={(e) => set('inclusions', e.target.value)} className="input" />
          </Field>
          <Field label="Exclusions" full>
            <textarea rows={3} value={data.exclusions} onChange={(e) => set('exclusions', e.target.value)} className="input" />
          </Field>
          <Field label="Cover letter" full>
            <textarea rows={3} value={data.cover_letter} onChange={(e) => set('cover_letter', e.target.value)} className="input" />
          </Field>
        </div>

        <style>{`
          .input { width:100%; background:rgba(15,23,42,1); border:1px solid rgba(255,255,255,0.1);
                   border-radius:6px; padding:8px 12px; color:#fff; font-size:14px; outline:none; }
          .input:focus { border-color:rgba(0,217,255,.6); }
        `}</style>
      </div>
    </ManageShell>
  );
}


function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2 lg:col-span-3' : ''}>
      <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
