'use client';

import { Briefcase, Receipt, TrendingUp, Users, AlertTriangle, CheckSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

import { ManageShell } from '@/components/manage/Shell';
import { manage } from '@/lib/manage-api';

interface DashboardData {
  leads: { new_this_week: number; open: number; total: number };
  projects: { active: number; completed: number; total: number };
  clients: { total: number; vip: number };
  revenue: {
    last_30_days: number;
    total_billed: number;
    total_paid: number;
    overdue_amount: number;
    overdue_count: number;
  };
  tasks: { open: number; overdue: number };
}

const COLORS = ['#00D9FF', '#0066FF', '#00FF88', '#FF6B35', '#FF3366', '#94A3B8', '#FFA500'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [funnel, setFunnel] = useState<Record<string, number>>({});
  const [revMonth, setRevMonth] = useState<Array<{ month: string; revenue: number }>>([]);
  const [sources, setSources] = useState<Array<{ source: string; total: number; won: number; conversion_rate: number }>>([]);

  useEffect(() => {
    Promise.all([
      manage.dashboard().then((d) => setData(d as DashboardData)),
      manage.salesFunnel().then((d) => setFunnel(d as Record<string, number>)),
      manage.revenueByMonth().then((d) => setRevMonth(d as Array<{ month: string; revenue: number }>)),
      manage.leadSources().then((d) => setSources(d as Array<{ source: string; total: number; won: number; conversion_rate: number }>)),
    ]).catch(() => {});
  }, []);

  return (
    <ManageShell>
      <h1 className="font-display text-h2 text-white mb-2">Dashboard</h1>
      <p className="text-soft-gray mb-8">Real-time overview.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card label="New Leads (7d)" value={data?.leads.new_this_week ?? '—'} icon={<Users size={18} />} />
        <Card label="Active Projects" value={data?.projects.active ?? '—'} icon={<Briefcase size={18} />} />
        <Card label="Revenue (30d)" value={data ? `৳${Math.round(data.revenue.last_30_days).toLocaleString()}` : '—'} icon={<TrendingUp size={18} />} />
        <Card label="Overdue" value={data ? `৳${Math.round(data.revenue.overdue_amount).toLocaleString()}` : '—'} icon={<AlertTriangle size={18} />} accent="crimson" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card label="Total Clients" value={data?.clients.total ?? '—'} icon={<Users size={18} />} />
        <Card label="VIP Clients" value={data?.clients.vip ?? '—'} icon={<Users size={18} />} />
        <Card label="Total Billed" value={data ? `৳${Math.round(data.revenue.total_billed).toLocaleString()}` : '—'} icon={<Receipt size={18} />} />
        <Card label="Open Tasks" value={data?.tasks.open ?? '—'} icon={<CheckSquare size={18} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Revenue Trend (last 12 months)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => v?.slice(0, 7)} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#00D9FF" strokeWidth={2} dot={{ fill: '#00D9FF', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lead Pipeline">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={Object.entries(funnel).map(([status, count]) => ({ status, count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="status" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#00D9FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Lead Sources">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={sources}
              dataKey="total"
              nameKey="source"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry: unknown) => `${(entry as { source: string }).source}`}
            >
              {sources.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </ManageShell>
  );
}

function Card({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-soft-gray">{label}</span>
        <span className={accent === 'crimson' ? 'text-crimson-red' : 'text-electric-cyan'}>{icon}</span>
      </div>
      <p className={`text-2xl font-display font-bold ${accent === 'crimson' ? 'text-crimson-red' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-lg font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
