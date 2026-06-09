'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { CmsResource } from '@/lib/manage-api';
import { cmsAdmin } from '@/lib/manage-api';

export type FieldType =
  | 'text' | 'textarea' | 'rich' | 'number' | 'decimal' | 'boolean'
  | 'select' | 'multiselect' | 'image' | 'json' | 'slug' | 'url' | 'email' | 'color'
  | 'datetime' | 'password';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  rows?: number;
  placeholder?: string;
  defaultValue?: unknown;
}

interface Props {
  resource: CmsResource;
  id?: string | number;
  fields: Field[];
  listHref: string;
  title: string;
  singleton?: boolean;
  beforeSubmit?: (data: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>>;
}

const SECTION_CLASS = 'glass rounded-xl p-6 space-y-4';

export function EntityForm({ resource, id, fields, listHref, title, singleton, beforeSubmit }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(Boolean(id || singleton));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successAt, setSuccessAt] = useState<number | null>(null);

  // Initial load
  useEffect(() => {
    if (singleton) {
      cmsAdmin
        .singleton(resource as 'site-settings' | 'email-settings')
        .then((r) => setData(r as Record<string, unknown>))
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
      return;
    }
    if (id) {
      cmsAdmin
        .get<Record<string, unknown>>(resource, id)
        .then(setData)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      // pre-fill defaults
      const init: Record<string, unknown> = {};
      for (const f of fields) if (f.defaultValue !== undefined) init[f.name] = f.defaultValue;
      setData(init);
    }
  }, [resource, id, singleton, fields]);

  function update(name: string, value: unknown) {
    setData((d) => ({ ...d, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccessAt(null);
    try {
      let payload: Record<string, unknown> = { ...data };
      for (const f of fields) {
        if (f.type === 'json' && typeof payload[f.name] === 'string') {
          try { payload[f.name] = JSON.parse(payload[f.name] as string); }
          catch { throw new Error(`${f.label}: invalid JSON`); }
        }
        if (f.type === 'number' && payload[f.name] !== '' && payload[f.name] != null) {
          payload[f.name] = Number(payload[f.name]);
        }
      }
      if (beforeSubmit) payload = await beforeSubmit(payload);

      if (singleton) {
        const updated = await cmsAdmin.updateSingleton(resource as 'site-settings' | 'email-settings', payload);
        setData(updated as Record<string, unknown>);
      } else if (id) {
        const updated = await cmsAdmin.update(resource, id, payload);
        setData(updated as Record<string, unknown>);
      } else {
        const created = await cmsAdmin.create<{ id: string | number }>(resource, payload);
        router.push(listHref);
        return;
      }
      setSuccessAt(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={SECTION_CLASS}><div className="text-soft-gray text-center py-10">Loading…</div></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-h3 text-white">{title}</h1>
          {!singleton && (
            <a href={listHref} className="text-soft-gray text-sm hover:text-white">← Back to list</a>
          )}
        </div>
        <div className="flex items-center gap-3">
          {successAt && Date.now() - successAt < 4000 && (
            <span className="text-aurora text-sm">Saved ✓</span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-cyan/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : id || singleton ? 'Save changes' : 'Create'}
          </button>
        </div>
      </header>

      {error && <div className="glass rounded-xl p-4 border border-crimson/40 text-crimson text-sm whitespace-pre-wrap">{error}</div>}

      <div className={SECTION_CLASS}>
        {fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={data[f.name]}
            onChange={(v) => update(f.name, v)}
          />
        ))}
      </div>
    </form>
  );
}


function FieldInput({ field, value, onChange }: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const labelEl = (
    <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1.5">
      {field.label}{field.required && <span className="text-crimson"> *</span>}
    </label>
  );
  const help = field.help && <p className="text-soft-gray/70 text-xs mt-1">{field.help}</p>;

  const base = 'w-full bg-midnight border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-soft-gray/40 focus:outline-none focus:border-cyan/60 transition-colors';

  const v = value as string | number | boolean | null | undefined;

  switch (field.type) {
    case 'textarea':
      return (
        <div>
          {labelEl}
          <textarea
            value={(v as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            required={field.required}
            className={`${base} font-mono`}
          />
          {help}
        </div>
      );
    case 'rich':
      return (
        <div>
          {labelEl}
          <textarea
            value={(v as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows ?? 12}
            placeholder={field.placeholder ?? '<p>HTML allowed. Use the legacy admin for CKEditor.</p>'}
            className={`${base} font-mono`}
          />
          <p className="text-soft-gray/70 text-xs mt-1">
            HTML / CKEditor markup. Open the legacy admin if you need the WYSIWYG.
          </p>
        </div>
      );
    case 'number':
    case 'decimal':
      return (
        <div>
          {labelEl}
          <input
            type="number"
            step={field.type === 'decimal' ? 'any' : '1'}
            value={(v as number | string) ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            placeholder={field.placeholder}
            required={field.required}
            className={base}
          />
          {help}
        </div>
      );
    case 'boolean':
      return (
        <div className="flex items-center gap-3">
          <input
            id={`f-${field.name}`}
            type="checkbox"
            checked={Boolean(v)}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 bg-midnight border border-white/20 rounded accent-cyan"
          />
          <label htmlFor={`f-${field.name}`} className="text-white text-sm">{field.label}</label>
          {field.help && <span className="text-soft-gray/70 text-xs">— {field.help}</span>}
        </div>
      );
    case 'select':
      return (
        <div>
          {labelEl}
          <select
            value={(v as string | number) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={base}
          >
            <option value="">— select —</option>
            {field.options?.map((o) => (
              <option key={String(o.value)} value={o.value}>{o.label}</option>
            ))}
          </select>
          {help}
        </div>
      );
    case 'multiselect': {
      const arr = Array.isArray(value) ? (value as (string | number)[]) : [];
      return (
        <div>
          {labelEl}
          <select
            multiple
            value={arr.map(String)}
            onChange={(e) => onChange(Array.from(e.target.selectedOptions).map((o) => o.value))}
            className={`${base} min-h-32`}
          >
            {field.options?.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
          {help ?? <p className="text-soft-gray/70 text-xs mt-1">Hold Cmd/Ctrl to multi-select.</p>}
        </div>
      );
    }
    case 'json':
      return (
        <div>
          {labelEl}
          <textarea
            value={typeof v === 'string' ? v : JSON.stringify(v ?? [], null, 2)}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows ?? 6}
            placeholder='["one","two"]'
            className={`${base} font-mono`}
          />
          <p className="text-soft-gray/70 text-xs mt-1">Valid JSON. Lists, dicts, primitives.</p>
        </div>
      );
    case 'color':
      return (
        <div>
          {labelEl}
          <input
            type="text"
            value={(v as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#00D9FF"
            className={base}
          />
        </div>
      );
    case 'image':
      return <ImageInput label={field.label} value={(v as string) ?? ''} onChange={onChange} help={field.help} />;
    default:
      return (
        <div>
          {labelEl}
          <input
            type={field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'datetime' ? 'datetime-local' : 'text'}
            value={(v as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={base}
          />
          {help}
        </div>
      );
  }
}


function ImageInput({ label, value, onChange, help }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await cmsAdmin.uploadMedia(file, { caption: file.name, asset_type: 'image' });
      const url = (r as { file_url?: string; file?: string }).file_url ?? (r as { file: string }).file ?? '';
      onChange(url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-soft-gray text-xs uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex items-start gap-4">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-24 h-24 object-cover rounded-md border border-white/10" />
        )}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or /media/…"
            className="w-full bg-midnight border border-white/10 rounded-md px-3 py-2 text-sm text-white"
          />
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="text-soft-gray text-xs" />
          {uploading && <span className="text-cyan text-xs">Uploading…</span>}
        </div>
      </div>
      {help && <p className="text-soft-gray/70 text-xs mt-1">{help}</p>}
    </div>
  );
}
