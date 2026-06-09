'use client';

import { useEffect, useMemo, useState } from 'react';

import { KanbanBoard } from '@/components/manage/KanbanBoard';
import { ManageShell } from '@/components/manage/Shell';
import { useToast } from '@/components/ui/Toast';
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

const STAGES = [
  { key: 'discovery',   label: 'discovery' },
  { key: 'design',      label: 'design' },
  { key: 'development', label: 'development' },
  { key: 'testing',     label: 'testing' },
  { key: 'launching',   label: 'launching' },
  { key: 'completed',   label: 'completed' },
  { key: 'on_hold',     label: 'on hold' },
  { key: 'cancelled',   label: 'cancelled' },
];

export default function ProjectsPage() {
  const [byStage, setByStage] = useState<Record<string, Project[]>>({});
  const toast = useToast();

  useEffect(() => {
    manage.projectsKanban().then((d) => setByStage(d as Record<string, Project[]>)).catch(() => {});
  }, []);

  const flat = useMemo<Project[]>(() => Object.values(byStage).flat(), [byStage]);

  async function move(id: string, _from: string, to: string) {
    const snapshot = byStage;
    setByStage((cur) => {
      const next: Record<string, Project[]> = {};
      let moved: Project | undefined;
      for (const [stage, items] of Object.entries(cur)) {
        const keep: Project[] = [];
        for (const p of items) {
          if (p.id === id) moved = { ...p, stage: to };
          else keep.push(p);
        }
        next[stage] = keep;
      }
      if (moved) next[to] = [moved, ...(next[to] ?? [])];
      return next;
    });
    try {
      await manage.updateProject(id, { stage: to });
      toast.success('Project moved', `→ ${to}`);
    } catch (err) {
      setByStage(snapshot);
      toast.error('Move failed', (err as Error).message);
    }
  }

  return (
    <ManageShell>
      <div className="mb-6">
        <h1 className="font-display text-h2 text-white">Projects</h1>
        <p className="text-soft-gray text-sm">Kanban board by stage. Drag cards across columns.</p>
      </div>

      <KanbanBoard
        stages={STAGES}
        items={flat}
        onMove={move}
        renderCard={(p) => (
          <div className="glass rounded-lg p-3">
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
        )}
      />
    </ManageShell>
  );
}
