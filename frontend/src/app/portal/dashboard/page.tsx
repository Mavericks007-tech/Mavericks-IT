'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, FileText, Receipt, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { API_BASE } from '@/lib/api';

interface PortalMe {
  contact: { id: string; full_name: string; email: string; designation?: string };
  client: { id: string; company_name: string; industry: string; is_vip: boolean; logo?: string | null };
  summary: { projects: number; active_projects: number; invoices: number; total_billed: number; total_paid: number; open_quotes: number };
}

export default function PortalDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<PortalMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) { router.push('/portal/login'); return; }
    fetch(`${API_BASE}/portal/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setMe)
      .catch(() => { localStorage.removeItem('portal_token'); router.push('/portal/login'); })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem('portal_token');
    router.push('/portal/login');
  };

  if (loading) return <section className="min-h-screen flex items-center justify-center"><p className="text-soft-gray">Loading…</p></section>;
  if (!me) return null;

  return (
    <>
      <PageHeader eyebrow="Client Portal" title={`Welcome, ${me.contact.full_name.split(' ')[0]}`} subtitle={`${me.client.company_name}${me.client.is_vip ? ' · VIP' : ''}`}>
        <Button onClick={logout} variant="secondary">
          <LogOut size={16} /> Sign Out
        </Button>
      </PageHeader>

      <Section className="pt-0">
        <Container>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <Stat label="Active Projects" value={me.summary.active_projects} icon={<Briefcase size={20} />} />
            <Stat label="Open Quotes" value={me.summary.open_quotes} icon={<FileText size={20} />} />
            <Stat label="Total Billed" value={`৳${me.summary.total_billed.toLocaleString()}`} icon={<Receipt size={20} />} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/portal/projects" className="group glass rounded-2xl p-6 hover:shadow-glow-cyan transition-all">
              <Briefcase className="text-electric-cyan mb-4" size={28} />
              <h3 className="font-display text-lg font-bold text-white mb-1">Projects</h3>
              <p className="text-soft-gray text-xs">Progress + milestones.</p>
              <p className="text-2xl font-display font-bold text-gradient mt-3">{me.summary.projects}</p>
            </a>
            <a href="/portal/invoices" className="group glass rounded-2xl p-6 hover:shadow-glow-cyan transition-all">
              <Receipt className="text-electric-cyan mb-4" size={28} />
              <h3 className="font-display text-lg font-bold text-white mb-1">Invoices</h3>
              <p className="text-soft-gray text-xs">Bills, balances, record paid.</p>
              <p className="text-2xl font-display font-bold text-gradient mt-3">{me.summary.invoices}</p>
            </a>
            <a href="/portal/quotes" className="group glass rounded-2xl p-6 hover:shadow-glow-cyan transition-all">
              <FileText className="text-electric-cyan mb-4" size={28} />
              <h3 className="font-display text-lg font-bold text-white mb-1">Quotes</h3>
              <p className="text-soft-gray text-xs">Review and accept.</p>
              <p className="text-2xl font-display font-bold text-gradient mt-3">{me.summary.open_quotes}</p>
            </a>
            <a href="/portal/files" className="group glass rounded-2xl p-6 hover:shadow-glow-cyan transition-all">
              <Briefcase className="text-electric-cyan mb-4" size={28} />
              <h3 className="font-display text-lg font-bold text-white mb-1">Files</h3>
              <p className="text-soft-gray text-xs">Project documents.</p>
              <p className="text-2xl font-display font-bold text-gradient mt-3">—</p>
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-electric-cyan">{icon}</span>
      </div>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
      <p className="text-sm text-soft-gray">{label}</p>
    </div>
  );
}
