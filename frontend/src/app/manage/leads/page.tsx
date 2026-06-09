'use client';

import { Download, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { KanbanBoard } from '@/components/manage/KanbanBoard';
import { ManageShell } from '@/components/manage/Shell';
import { useToast } from '@/components/ui/Toast';
import { API_BASE } from '@/lib/api';
import type { DRFPage } from '@/lib/manage-api';
import { cmsAdmin, manage } from '@/lib/manage-api';

interface AssignableUser { id: number; username: string; first_name: string; last_name: string }

interface Lead {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  source: string;
  status: string;
  score: string;
  priority: string;
  budget_min: string | null;
  budget_max: string | null;
  next_follow_up: string | null;
  created_at: string;
}

const STAGES = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost'];
const SCORES = ['hot', 'warm', 'cold'];
const SCORE_COLOR: Record<string, string> = { hot: '#FF3366', warm: '#FF6B35', cold: '#94A3B8' };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    manage.leads('?page_size=200')
      .then((d) => setLeads(((d as { results?: Lead[] }).results) ?? (d as Lead[])))
      .catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    cmsAdmin.list<AssignableUser>('users', '?page_size=200')
      .then((d) => {
        const arr = Array.isArray(d) ? d : (d as DRFPage<AssignableUser>).results;
        setUsers(arr);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  }

  async function bulk(action: string, value?: unknown) {
    if (selected.size === 0) { toast.warning('Select leads first'); return; }
    try {
      const r = await manage.leadBulk([...selected], action, value);
      toast.success('Bulk action complete', `${(r as { affected: number }).affected} affected`);
      setSelected(new Set());
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error('Bulk failed', (err as Error).message);
    }
  }

  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const r = await manage.leadsImport(f) as { created: number; updated: number; errors: unknown[] };
      toast.success('CSV imported', `${r.created} created, ${r.updated} updated, ${r.errors.length} errors`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error('Import failed', (err as Error).message);
    } finally {
      e.target.value = '';
    }
  }

  return (
    <ManageShell>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-h2 text-white mb-1">Leads</h1>
          <p className="text-soft-gray text-sm">{leads.length} total — manage the sales pipeline.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${API_BASE}/crm/leads/export.csv/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-md text-sm text-soft-gray hover:text-white hover:border-white/30"
          >
            <Download size={14} /> Export CSV
          </a>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-md text-sm text-soft-gray hover:text-white hover:border-white/30"
          >
            <Upload size={14} /> Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importFile} />
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'kanban' ? 'bg-electric-cyan text-deep-space' : 'glass text-soft-gray'}`}>Kanban</button>
          <button onClick={() => setView('list')}   className={`px-3 py-1.5 rounded-lg text-sm ${view === 'list'   ? 'bg-electric-cyan text-deep-space' : 'glass text-soft-gray'}`}>List</button>
        </div>
      </div>

      {view === 'list' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="glass px-3 py-2 rounded-lg text-sm text-white">
              <option value="all">All Statuses</option>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {selected.size > 0 && (
              <div className="ml-auto flex flex-wrap items-center gap-2 glass rounded-lg px-3 py-2">
                <span className="text-soft-gray text-xs">{selected.size} selected</span>
                <select onChange={(e) => { if (e.target.value) bulk('status', e.target.value); e.target.value = ''; }}
                        className="bg-midnight border border-white/10 rounded-md px-2 py-1 text-xs text-white">
                  <option value="">Set status →</option>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select onChange={(e) => { if (e.target.value) bulk('score', e.target.value); e.target.value = ''; }}
                        className="bg-midnight border border-white/10 rounded-md px-2 py-1 text-xs text-white">
                  <option value="">Set score →</option>
                  {SCORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select onChange={(e) => { if (e.target.value) bulk('assign', Number(e.target.value)); e.target.value = ''; }}
                        className="bg-midnight border border-white/10 rounded-md px-2 py-1 text-xs text-white">
                  <option value="">Assign to →</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                    </option>
                  ))}
                </select>
                <button onClick={() => { if (confirm(`Delete ${selected.size} leads?`)) bulk('delete'); }}
                        className="text-xs px-2 py-1 border border-crimson/40 text-crimson rounded-md hover:bg-crimson/10">
                  Delete
                </button>
                <button onClick={() => setSelected(new Set())} className="text-soft-gray text-xs hover:text-white">Clear</button>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/5 text-left">
                <tr className="text-xs font-mono uppercase tracking-wider text-soft-gray">
                  <th className="p-3 w-8">
                    <input type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="accent-cyan" />
                  </th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="p-3"><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="accent-cyan" /></td>
                    <td className="p-3">
                      <a href={`/manage/leads/${l.id}`} className="text-white font-semibold hover:text-electric-cyan">{l.full_name}</a>
                      <p className="text-xs text-soft-gray">{l.email}</p>
                    </td>
                    <td className="p-3 text-soft-gray text-sm">{l.company_name || '—'}</td>
                    <td className="p-3"><span className="text-xs font-mono uppercase">{l.status}</span></td>
                    <td className="p-3"><span className="text-xs font-mono uppercase" style={{ color: SCORE_COLOR[l.score] }}>{l.score}</span></td>
                    <td className="p-3 text-soft-gray text-sm">{l.source}</td>
                    <td className="p-3 text-soft-gray text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'kanban' && (
        <KanbanBoard
          stages={STAGES.map((s) => ({ key: s, label: s.replace('_', ' ') }))}
          items={leads.map((l) => ({ ...l, stage: l.status }))}
          onMove={async (id, _from, toStage) => {
            const prev = leads;
            setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, status: toStage } : l)));
            try {
              await manage.leadBulk([id], 'status', toStage);
              toast.success('Status updated', `→ ${toStage}`);
            } catch (err) {
              setLeads(prev);
              toast.error('Move failed', (err as Error).message);
            }
          }}
          renderCard={(l) => (
            <a href={`/manage/leads/${l.id}`} onClick={(e) => e.stopPropagation()} className="block glass rounded-lg p-3 hover:border-electric-cyan/40 transition-colors">
              <p className="text-sm font-semibold text-white truncate">{l.full_name}</p>
              <p className="text-xs text-soft-gray truncate">{l.company_name || l.email}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs px-1.5 py-0.5 rounded uppercase font-mono"
                      style={{ color: SCORE_COLOR[l.score], background: SCORE_COLOR[l.score] + '20' }}>
                  {l.score}
                </span>
                {l.budget_max && <span className="text-xs text-electric-cyan font-mono">৳{Number(l.budget_max).toLocaleString()}</span>}
              </div>
            </a>
          )}
        />
      )}
    </ManageShell>
  );
}
