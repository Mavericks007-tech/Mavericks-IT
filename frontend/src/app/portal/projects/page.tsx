'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { API_BASE } from '@/lib/api';

interface PortalProject {
  id: string;
  code: string;
  name: string;
  description: string;
  stage: string;
  progress_percent: number;
  start_date: string | null;
  due_date: string | null;
  contract_value: string;
  milestones: { id: string; title: string; due_date: string | null; is_completed: boolean }[];
}

export default function PortalProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) { router.push('/portal/login'); return; }
    fetch(`${API_BASE}/portal/projects/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setProjects(d.results ?? d ?? []))
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <PageHeader eyebrow="My Projects" title="Project Tracker">
        <a href="/portal/dashboard" className="text-soft-gray hover:text-electric-cyan inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
      </PageHeader>

      <Section className="pt-0">
        <Container>
          {loading ? (
            <p className="text-soft-gray text-center">Loading…</p>
          ) : projects.length === 0 ? (
            <p className="text-soft-gray text-center">No projects yet.</p>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {projects.map((p) => (
                <div key={p.id} className="glass rounded-2xl p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-mono text-electric-cyan">{p.code}</p>
                      <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase glass">{p.stage}</span>
                  </div>
                  {p.description && <p className="text-soft-gray text-sm mb-4">{p.description}</p>}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-soft-gray mb-1">
                      <span>Progress</span><span>{p.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-electric-cyan" style={{ width: `${p.progress_percent}%` }} />
                    </div>
                  </div>
                  {p.milestones && p.milestones.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-2">Milestones</p>
                      <ul className="space-y-1">
                        {p.milestones.map((m) => (
                          <li key={m.id} className="flex items-center gap-2 text-sm">
                            <span className={`inline-block w-2 h-2 rounded-full ${m.is_completed ? 'bg-aurora-green' : 'bg-white/20'}`} />
                            <span className={m.is_completed ? 'text-soft-gray line-through' : 'text-white'}>{m.title}</span>
                            {m.due_date && <span className="text-xs text-soft-gray ml-auto">{m.due_date}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
