'use client';

import { useEffect, useState } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { manage } from '@/lib/manage-api';

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
const SCORE_COLOR: Record<string, string> = { hot: '#FF3366', warm: '#FF6B35', cold: '#94A3B8' };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    manage.leads('?page_size=200')
      .then((d) => setLeads(((d as { results?: Lead[] }).results) ?? (d as Lead[])))
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  return (
    <ManageShell>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-h2 text-white mb-1">Leads</h1>
          <p className="text-soft-gray text-sm">{leads.length} total — manage the sales pipeline.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === 'kanban' ? 'bg-electric-cyan text-deep-space' : 'glass text-soft-gray'}`}
          >Kanban</button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === 'list' ? 'bg-electric-cyan text-deep-space' : 'glass text-soft-gray'}`}
          >List</button>
        </div>
      </div>

      {view === 'list' && (
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-4 glass px-3 py-2 rounded-lg text-sm text-white">
          <option value="all">All Statuses</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.status === stage);
            return (
              <div key={stage} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-soft-gray">{stage.replace('_', ' ')}</span>
                  <span className="text-xs text-electric-cyan font-mono">{items.length}</span>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {items.map((l) => (
                    <a key={l.id} href={`/manage/leads/${l.id}`} className="block glass rounded-lg p-3 hover:border-electric-cyan/40 transition-colors">
                      <p className="text-sm font-semibold text-white truncate">{l.full_name}</p>
                      <p className="text-xs text-soft-gray truncate">{l.company_name || l.email}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs px-1.5 py-0.5 rounded uppercase font-mono" style={{ color: SCORE_COLOR[l.score], background: SCORE_COLOR[l.score] + '20' }}>
                          {l.score}
                        </span>
                        {l.budget_max && <span className="text-xs text-electric-cyan font-mono">৳{Number(l.budget_max).toLocaleString()}</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/5 text-left">
              <tr className="text-xs font-mono uppercase tracking-wider text-soft-gray">
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
      )}
    </ManageShell>
  );
}
