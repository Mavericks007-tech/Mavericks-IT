'use client';

import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface CaseRow {
  id: string;
  title: string;
  client_name: string;
  industry: string;
  metric: string;
  metric_description: string;
  image_url?: string;
  technologies?: string[];
}

export function PortfolioGrid({ cases }: { cases: CaseRow[] }) {
  const [industry, setIndustry] = useState('');
  const [tech, setTech] = useState('');

  const industries = useMemo(() => Array.from(new Set(cases.map((c) => c.industry).filter(Boolean))).sort(), [cases]);
  const techs = useMemo(() => Array.from(new Set(cases.flatMap((c) => c.technologies ?? []))).sort(), [cases]);

  const filtered = useMemo(() => cases.filter((c) => {
    if (industry && c.industry !== industry) return false;
    if (tech && !(c.technologies ?? []).includes(tech)) return false;
    return true;
  }), [cases, industry, tech]);

  return (
    <div className="space-y-8">
      <div className="space-y-3 max-w-4xl mx-auto">
        <Chips label="Industry" active={industry} onChange={setIndustry} options={industries} />
        {techs.length > 0 && <Chips label="Tech" active={tech} onChange={setTech} options={techs} />}
      </div>

      <p className="text-soft-gray text-sm text-center">
        {filtered.length} of {cases.length} case {cases.length === 1 ? 'study' : 'studies'}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-soft-gray">No projects match those filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filtered.map((c) => (
            <Link key={c.id} href={`/portfolio/${c.id}`} className="group glass rounded-2xl overflow-hidden transition-all hover:shadow-glow-cyan">
              {c.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt={c.title} loading="lazy" className="w-full h-64 object-cover" />
              )}
              <div className="p-6">
                <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan">{c.industry}</span>
                <h3 className="font-display text-xl font-bold text-white mt-2 mb-3 group-hover:text-electric-cyan transition-colors">
                  {c.title}
                </h3>
                <p className="text-soft-gray text-sm mb-4">{c.client_name}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <TrendingUp size={20} className="text-aurora-green" />
                  <div>
                    <p className="font-display font-bold text-white">{c.metric}</p>
                    <p className="text-xs text-soft-gray">{c.metric_description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Chips({ label, active, onChange, options }: { label: string; active: string; onChange: (v: string) => void; options: string[] }) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-soft-gray mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        <Chip label="All" active={!active} onClick={() => onChange('')} />
        {options.map((o) => (
          <Chip key={o} label={o} active={active === o} onClick={() => onChange(o)} />
        ))}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-electric-cyan text-deep-space border-electric-cyan'
          : 'bg-white/5 text-soft-gray border-white/10 hover:text-white hover:border-white/30'
      }`}
    >
      {label}
    </button>
  );
}
