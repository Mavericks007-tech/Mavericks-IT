'use client';

import { Send, Trash2, AtSign } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useToast } from '@/components/ui/Toast';
import { manage } from '@/lib/manage-api';

interface Comment {
  id: string;
  body: string;
  author_name: string | null;
  mention_names: string[];
  created_at: string;
}

interface Props {
  /** Pass exactly one parent id key. */
  scope: { lead?: string; client?: string; project?: string; quote?: string; invoice?: string };
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function CommentThread({ scope }: Props) {
  const [items, setItems] = useState<Comment[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const toast = useToast();

  const filters = Object.fromEntries(Object.entries(scope).filter(([, v]) => v)) as Record<string, string>;

  function reload() {
    setLoading(true);
    manage.comments(filters)
      .then((d) => {
        const arr = Array.isArray(d) ? d : (d as { results: Comment[] }).results;
        setItems(arr);
      })
      .catch((e: Error) => toast.error('Could not load comments', e.message))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    try {
      await manage.postComment({ body: draft, ...filters });
      setDraft('');
      toast.success('Comment posted');
      reload();
    } catch (err) {
      toast.error('Could not post', (err as Error).message);
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this comment?')) return;
    try {
      await manage.deleteComment(id);
      reload();
    } catch (err) {
      toast.error('Could not delete', (err as Error).message);
    }
  }

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-white">Comments</h3>
        <span className="text-soft-gray text-xs flex items-center gap-1">
          <AtSign size={12} /> @username notifies via email
        </span>
      </header>

      <form onSubmit={submit} className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Add a comment… use @username to mention a teammate"
          className="w-full bg-midnight border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-soft-gray/60 focus:outline-none focus:border-cyan/60"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={posting || !draft.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan text-deep-space rounded-md text-sm font-semibold hover:bg-cyan/90 disabled:opacity-50"
          >
            <Send size={14} /> {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {loading && <p className="text-soft-gray text-sm">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="text-soft-gray text-sm">No comments yet.</p>
        )}
        {items.map((c) => (
          <article key={c.id} className="border-l-2 border-white/10 pl-4 py-1">
            <header className="flex items-baseline justify-between gap-2">
              <span className="text-white text-sm font-medium">
                {c.author_name ?? 'unknown'}
                {c.mention_names.length > 0 && (
                  <span className="text-cyan text-xs ml-2">→ {c.mention_names.map((m) => `@${m}`).join(' ')}</span>
                )}
              </span>
              <span className="text-soft-gray/70 text-xs">{fmtTime(c.created_at)}</span>
            </header>
            <p className="text-soft-gray text-sm whitespace-pre-wrap mt-1">{c.body}</p>
            <button onClick={() => remove(c.id)} className="text-crimson text-xs hover:underline mt-1 inline-flex items-center gap-1">
              <Trash2 size={11} /> delete
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
