'use client';

import { ArrowLeft, Download, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import type { LineItem } from '@/components/manage/LineItemEditor';
import { LineItemEditor } from '@/components/manage/LineItemEditor';
import { RecordPaymentDialog } from '@/components/manage/RecordPaymentDialog';
import { ManageShell } from '@/components/manage/Shell';
import { useToast } from '@/components/ui/Toast';
import { manage } from '@/lib/manage-api';

const STATUSES = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'];

interface ClientRow { id: string; company_name: string }
interface ProjectRow { id: string; name: string; code: string }
interface QuoteRow { id: string; number: string; title: string }

interface InvoiceData {
  id?: string;
  number?: string;
  client?: string | null;
  project?: string | null;
  quote?: string | null;
  issue_date: string;
  due_date: string;
  status: string;
  currency: string;
  discount: number;
  vat_percent: number;
  amount_paid?: string;
  amount_due?: string;
  notes: string;
  payment_instructions: string;
  line_items: LineItem[];
}

const EMPTY: InvoiceData = {
  client: null,
  project: null,
  quote: null,
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  status: 'draft',
  currency: 'BDT',
  discount: 0,
  vat_percent: 15,
  notes: '',
  payment_instructions: 'bKash: 01XXXXXXXXX\nNagad: 01XXXXXXXXX\nBank: ... A/C ...',
  line_items: [],
};

export default function InvoiceEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = useState<InvoiceData>(EMPTY);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    manage.clients()
      .then((d) => setClients(((d as { results?: ClientRow[] }).results) ?? (d as ClientRow[])))
      .catch(() => {});
    manage.projects()
      .then((d) => setProjects(((d as { results?: ProjectRow[] }).results) ?? (d as ProjectRow[])))
      .catch(() => {});
    manage.quotes()
      .then((d) => setQuotes(((d as { results?: QuoteRow[] }).results) ?? (d as QuoteRow[])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    manage.invoice(id)
      .then((d) => setData({ ...EMPTY, ...(d as InvoiceData), line_items: (d as InvoiceData).line_items ?? [] }))
      .catch((e: Error) => toast.error('Could not load', e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof InvoiceData>(k: K, v: InvoiceData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...data,
        due_date: data.due_date || null,
        line_items: data.line_items.map((it, i) => ({
          description: it.description,
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          order: i,
        })),
      };
      if (isNew && !payload.number) {
        payload.number = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
      }
      if (isNew) {
        const created = await manage.createInvoice(payload) as { id: string };
        toast.success('Invoice created');
        router.push(`/manage/invoices/${created.id}`);
      } else {
        const updated = await manage.updateInvoice(id, payload) as InvoiceData;
        setData({ ...EMPTY, ...updated, line_items: updated.line_items ?? [] });
        toast.success('Invoice saved');
      }
    } catch (e) {
      toast.error('Save failed', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm('Delete this invoice?')) return;
    try {
      await manage.deleteInvoice(id);
      toast.success('Deleted');
      router.push('/manage/invoices');
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
            <Link href="/manage/invoices" className="inline-flex items-center gap-1 text-soft-gray text-sm hover:text-white">
              <ArrowLeft size={14} /> All invoices
            </Link>
            <h1 className="font-display text-h2 text-white mt-1">
              {isNew ? 'New Invoice' : `Invoice ${data.number ?? ''}`}
            </h1>
            {!isNew && data.amount_due !== undefined && (
              <p className="text-soft-gray text-sm mt-1">
                Paid {data.currency} {Number(data.amount_paid).toLocaleString()} · Due <span className="text-white font-mono">{data.currency} {Number(data.amount_due).toLocaleString()}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                <a href={manage.invoicePdfUrl(id)} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/10 rounded-md text-sm text-soft-gray hover:text-white hover:border-white/30">
                  <Download size={14} /> PDF
                </a>
                {data.status !== 'paid' && data.status !== 'cancelled' && (
                  <button onClick={() => setPayOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-aurora-green text-deep-space rounded-md text-sm font-semibold hover:opacity-90">
                    <DollarSign size={14} /> Record payment
                  </button>
                )}
                <button onClick={remove} className="px-3 py-2 border border-crimson/40 text-crimson rounded-md text-sm hover:bg-crimson/10">
                  Delete
                </button>
              </>
            )}
            <button onClick={save} disabled={saving}
                    className="px-4 py-2 bg-electric-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-electric-cyan/90 disabled:opacity-50">
              {saving ? 'Saving…' : isNew ? 'Create invoice' : 'Save changes'}
            </button>
          </div>
        </header>

        <div className="glass rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Client" full>
            <select value={data.client ?? ''} onChange={(e) => set('client', e.target.value || null)} className="input">
              <option value="">— none —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </Field>
          <Field label="Project">
            <select value={data.project ?? ''} onChange={(e) => set('project', e.target.value || null)} className="input">
              <option value="">— none —</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
            </select>
          </Field>
          <Field label="Quote (link)">
            <select value={data.quote ?? ''} onChange={(e) => set('quote', e.target.value || null)} className="input">
              <option value="">— none —</option>
              {quotes.map((q) => <option key={q.id} value={q.id}>{q.number} — {q.title}</option>)}
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
          <Field label="Due date">
            <input type="date" value={data.due_date} onChange={(e) => set('due_date', e.target.value)} className="input" />
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
          <Field label="Notes" full>
            <textarea rows={3} value={data.notes} onChange={(e) => set('notes', e.target.value)} className="input" />
          </Field>
          <Field label="Payment instructions" full>
            <textarea rows={4} value={data.payment_instructions} onChange={(e) => set('payment_instructions', e.target.value)} className="input" />
          </Field>
        </div>

        {!isNew && payOpen && data.amount_due !== undefined && (
          <RecordPaymentDialog
            invoiceId={id}
            invoiceNumber={data.number ?? ''}
            amountDue={Number(data.amount_due)}
            currency={data.currency}
            open={payOpen}
            onClose={() => setPayOpen(false)}
            onSaved={() => {
              setPayOpen(false);
              manage.invoice(id).then((d) => setData({ ...EMPTY, ...(d as InvoiceData), line_items: (d as InvoiceData).line_items ?? [] }));
            }}
          />
        )}

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
