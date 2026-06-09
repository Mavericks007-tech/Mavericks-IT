'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import { ManageShell } from '@/components/manage/Shell';
import { manage } from '@/lib/manage-api';

const COLORS = ['#00D9FF', '#0066FF', '#00FF88', '#FF6B35', '#FF3366', '#FFA500', '#94A3B8'];

export default function ReportsPage() {
  const [revMonth, setRevMonth] = useState<Array<{ month: string; revenue: number }>>([]);
  const [revClient, setRevClient] = useState<Array<{ client_name: string; revenue: number }>>([]);
  const [revService, setRevService] = useState<Array<{ service: string; revenue: number }>>([]);
  const [team, setTeam] = useState<Array<{ username: string; full_name: string; leads_assigned: number; leads_won: number; pipeline_value: number }>>([]);
  const [sources, setSources] = useState<Array<{ source: string; total: number; conversion_rate: number }>>([]);

  useEffect(() => {
    manage.revenueByMonth().then((d) => setRevMonth(d as typeof revMonth)).catch(() => {});
    manage.revenueByClient().then((d) => setRevClient(d as typeof revClient)).catch(() => {});
    manage.revenueByService().then((d) => setRevService(d as typeof revService)).catch(() => {});
    manage.teamPerformance().then((d) => setTeam(d as typeof team)).catch(() => {});
    manage.leadSources().then((d) => setSources(d as typeof sources)).catch(() => {});
  }, []);

  return (
    <ManageShell>
      <div className="mb-6">
        <h1 className="font-display text-h2 text-white">Reports & Analytics</h1>
        <p className="text-soft-gray text-sm">Business intelligence powered by your CRM data.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Panel title="Revenue Trend (12 months)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => v?.slice(0, 7)} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#00D9FF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Lead Sources Conversion">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sources}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="source" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="total" fill="#00D9FF" radius={[6, 6, 0, 0]} name="Total Leads" />
              <Bar dataKey="conversion_rate" fill="#00FF88" radius={[6, 6, 0, 0]} name="Conv %" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top Clients by Revenue">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart layout="vertical" data={revClient.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="client_name" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} width={130} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#00D9FF" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Revenue by Service">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={revService} dataKey="revenue" nameKey="service" cx="50%" cy="50%" outerRadius={90} label={(entry: unknown) => `${(entry as { service: string }).service}`}>
                {revService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Team Performance">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-mono uppercase text-soft-gray border-b border-white/5">
            <tr>
              <th className="p-2">User</th>
              <th className="p-2 text-right">Leads</th>
              <th className="p-2 text-right">Won</th>
              <th className="p-2 text-right">Pipeline Value</th>
            </tr>
          </thead>
          <tbody>
            {team.map((t) => (
              <tr key={t.username} className="border-b border-white/5 last:border-0">
                <td className="p-2 text-white">{t.full_name || t.username}</td>
                <td className="p-2 text-right text-soft-gray">{t.leads_assigned}</td>
                <td className="p-2 text-right text-aurora-green">{t.leads_won}</td>
                <td className="p-2 text-right text-electric-cyan font-mono">৳{Math.round(t.pipeline_value).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </ManageShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-lg font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
