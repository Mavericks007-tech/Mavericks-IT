'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useMemo } from 'react';

export interface LineItem {
  id?: string;
  description: string;
  quantity: number | string;
  rate: number | string;
  amount?: number | string;
  order?: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  vat_percent: number;
  vat_amount: number;
  total: number;
}

interface Props {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency: string;
  discount: number;
  onDiscount: (v: number) => void;
  vatPercent: number;
  onVat: (v: number) => void;
}

export function computeTotals(items: LineItem[], discount: number, vatPercent: number): Totals {
  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0);
  const afterDiscount = Math.max(0, subtotal - (Number(discount) || 0));
  const vat_amount = (afterDiscount * (Number(vatPercent) || 0)) / 100;
  return {
    subtotal,
    discount: Number(discount) || 0,
    vat_percent: Number(vatPercent) || 0,
    vat_amount,
    total: afterDiscount + vat_amount,
  };
}

export function LineItemEditor({ items, onChange, currency, discount, onDiscount, vatPercent, onVat }: Props) {
  const totals = useMemo(() => computeTotals(items, discount, vatPercent), [items, discount, vatPercent]);

  function update(idx: number, patch: Partial<LineItem>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...items, { description: '', quantity: 1, rate: 0, order: items.length }]);
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-soft-gray text-xs uppercase tracking-wider">
              <th className="px-3 py-2 text-left w-8"></th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-right w-24">Qty</th>
              <th className="px-3 py-2 text-right w-36">Rate ({currency})</th>
              <th className="px-3 py-2 text-right w-36">Amount</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-soft-gray text-sm">
                No line items yet. Click <em>+ Add line</em> below.
              </td></tr>
            )}
            {items.map((it, idx) => {
              const amount = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
              return (
                <tr key={it.id ?? idx} className="border-t border-white/5">
                  <td className="px-3 py-2 text-soft-gray/60"><GripVertical size={14} /></td>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={it.description}
                      onChange={(e) => update(idx, { description: e.target.value })}
                      placeholder="e.g. Discovery + wireframes"
                      className="w-full bg-transparent border border-transparent focus:border-electric-cyan/40 rounded px-2 py-1 text-white text-sm"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      step="any"
                      value={it.quantity}
                      onChange={(e) => update(idx, { quantity: e.target.value })}
                      className="w-full bg-transparent border border-transparent focus:border-electric-cyan/40 rounded px-2 py-1 text-white text-sm text-right"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      step="0.01"
                      value={it.rate}
                      onChange={(e) => update(idx, { rate: e.target.value })}
                      className="w-full bg-transparent border border-transparent focus:border-electric-cyan/40 rounded px-2 py-1 text-white text-sm text-right"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-white text-sm font-mono">
                    {currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <button type="button" onClick={() => remove(idx)} aria-label="Remove" className="text-crimson hover:text-crimson/80">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-white/5 p-3">
          <button type="button" onClick={add}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-electric-cyan/40 text-electric-cyan rounded-md text-sm hover:bg-electric-cyan/10">
            <Plus size={14} /> Add line
          </button>
        </div>
      </div>

      <div className="glass rounded-xl p-4 grid sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Field label={`Discount (${currency})`}>
            <input type="number" step="0.01" value={discount}
                   onChange={(e) => onDiscount(Number(e.target.value))}
                   className="input" />
          </Field>
          <Field label="VAT %">
            <input type="number" step="0.01" value={vatPercent}
                   onChange={(e) => onVat(Number(e.target.value))}
                   className="input" />
          </Field>
        </div>
        <div className="space-y-2 text-sm sm:text-right">
          <Row label="Subtotal" value={`${currency} ${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          <Row label="Discount" value={`− ${currency} ${totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          <Row label={`VAT (${totals.vat_percent}%)`} value={`${currency} ${totals.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          <Row label="Total" value={`${currency} ${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} bold />
        </div>
      </div>

      <style>{`
        .input { width:100%; background:rgba(15,23,42,1); border:1px solid rgba(255,255,255,0.1);
                 border-radius:6px; padding:6px 10px; color:#fff; font-size:14px; outline:none; }
        .input:focus { border-color:rgba(0,217,255,.6); }
      `}</style>
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

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between sm:justify-end sm:gap-6">
      <span className="text-soft-gray">{label}</span>
      <span className={`font-mono ${bold ? 'text-white text-lg font-bold' : 'text-white'}`}>{value}</span>
    </div>
  );
}
