'use client';

import { Activity as ActivityIcon, StickyNote, CheckSquare, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useToast } from '@/components/ui/Toast';
import { manage } from '@/lib/manage-api';

interface Entry {
  kind: 'activity' | 'note' | 'task';
  id: string;
  body?: string;
  title?: string;
  description?: string;
  activity_type?: string;
  status?: string;
  occurred_at?: string;
  created_at?: string;
}

const ICON = {
  activity: ActivityIcon,
  note: StickyNote,
  task: CheckSquare,
};

const COLOR = {
  activity: 'text-cyan',
  note: 'text-aurora',
  task: 'text-sunset',
};

function ts(e: Entry): string {
  return e.occurred_at || e.created_at || '';
}
function fmt(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function Timeline({ scope }: { scope: { lead?: string; client?: string; project?: string } }) {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const key = JSON.stringify(scope);

  useEffect(() => {
    setLoading(true);
    manage.timeline(scope)
      .then((d) => setItems((d as { results: Entry[] }).results || []))
      .catch((e: Error) => toast.error('Could not load timeline', e.message))
      .finally(() => setLoading(false));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-display text-base font-bold text-white mb-4">Activity timeline</h3>
      {loading && <p className="text-soft-gray text-sm">Loading…</p>}
      {!loading && items.length === 0 && <p className="text-soft-gray text-sm">No activity yet.</p>}
      <ol className="space-y-3">
        {items.map((e) => {
          const Icon = ICON[e.kind];
          return (
            <li key={`${e.kind}-${e.id}`} className="flex items-start gap-3">
              <span className={`mt-0.5 ${COLOR[e.kind]}`}><Icon size={16} /></span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  {e.kind === 'note'     && (e.body || '(empty note)')}
                  {e.kind === 'activity' && `${e.activity_type ?? 'activity'}${e.description ? ' — ' + e.description : ''}`}
                  {e.kind === 'task'     && `${e.title ?? '(task)'} · ${e.status ?? ''}`}
                </p>
                <p className="text-soft-gray text-xs mt-0.5 inline-flex items-center gap-1">
                  <Clock size={10} /> {fmt(ts(e))} · {e.kind}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
