'use client';

import { useEffect, useState } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import { manage } from '@/lib/manage-api';

interface Project {
  id: string;
  code: string;
  name: string;
  client_name: string;
  stage: string;
  priority: string;
  progress_percent: number;
  contract_value: string;
  due_date: string | null;
}

const STAGES = ['discovery', 'design', 'development', 'testing', 'launching', 'completed', 'on_hold', 'cancelled'];

export default function ProjectsPage() {
  const [byStage, setByStage] = useState<Record<string, Project[]>>({});

  useEffect(() => {
    manage.projectsKanban().then((d) => setByStage(d as Record<string, Project[]>)).catch(() => {});
  }, []);

  return (
    <ManageShell>
      <div className="mb-6">
        <h1 className="font-display text-h2 text-white">Projects</h1>
        <p className="text-soft-gray text-sm">Kanban board by stage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGES.map((stage) => {
          const items = byStage[stage] || [];
          return (
            <div key={stage} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-mono uppercase tracking-wider text-soft-gray">{stage.replace('_', ' ')}</span>
                <span className="text-xs text-electric-cyan font-mono">{items.length}</span>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {items.map((p) => (
                  <div key={p.id} className="glass rounded-lg p-3">
                    <p className="text-xs text-electric-cyan font-mono">{p.code}</p>
                    <p className="text-sm font-semibold text-white truncate mt-1">{p.name}</p>
                    <p className="text-xs text-soft-gray truncate">{p.client_name}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-soft-gray mb-1">
                        <span>{p.progress_percent}%</span>
                        {p.contract_value && <span className="text-electric-cyan">৳{Math.round(Number(p.contract_value) / 1000)}k</span>}
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="h-full bg-electric-cyan" style={{ width: `${p.progress_percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ManageShell>
  );
}
