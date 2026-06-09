'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { useToast } from '@/components/ui/Toast';
import { manage } from '@/lib/manage-api';

const METHODS = ['bkash', 'nagad', 'rocket', 'bank_transfer', 'cash', 'card', 'other'];

interface Props {
  invoiceId: string;
  invoiceNumber: string;
  amountDue: number;
  currency: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function RecordPaymentDialog({ invoiceId, invoiceNumber, amountDue, currency, open, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState<string>(String(amountDue));
  const [method, setMethod] = useState('bkash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [verified, setVerified] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.warning('Amount required'); return;
    }
    setSaving(true);
    try {
      await manage.recordPayment(invoiceId, {
        amount: Number(amount), method, reference, notes, verified,
        paid_at: new Date().toISOString(),
      });
      toast.success('Payment recorded', `${currency} ${Number(amount).toLocaleString()} on ${method}`);
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error('Could not record', (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[150] grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md bg-midnight-navy border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-display text-h3 text-white">Record payment</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-soft-gray hover:text-white"><X size={18} /></button>
        </header>
        <div className="p-5 space-y-3">
          <p className="text-soft-gray text-sm">Invoice <code className="text-cyan">{invoiceNumber}</code> — due {currency} {amountDue.toLocaleString()}</p>

          <Field label={`Amount (${currency})`}>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                   className="input" required />
          </Field>

          <Field label="Method">
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>

          <Field label="Reference / transaction id">
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="input" placeholder="e.g. bKash TrxID, bank ref" />
          </Field>

          <Field label="Notes">
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
          </Field>

          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="accent-cyan" />
            Verified (mark as confirmed received)
          </label>
        </div>

        <footer className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 border border-white/10 rounded-md text-sm text-soft-gray hover:text-white">Cancel</button>
          <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-cyan/90 disabled:opacity-50">
            {saving ? 'Saving…' : 'Record payment'}
          </button>
        </footer>

        <style>{`
          .input { width:100%; background:rgba(15,23,42,1); border:1px solid rgba(255,255,255,0.1);
                   border-radius:6px; padding:8px 12px; color:#fff; font-size:14px; outline:none; }
          .input:focus { border-color:rgba(0,217,255,.6); }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}
