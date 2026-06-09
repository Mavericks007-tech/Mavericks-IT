'use client';

import { ArrowLeft, Mail, Phone, Building2, DollarSign, Calendar, UserCheck } from 'lucide-react';
import { useEffect, useState, use } from 'react';

import { CommentThread } from '@/components/manage/CommentThread';
import { ManageShell } from '@/components/manage/Shell';
import { Timeline } from '@/components/manage/Timeline';
import { Button } from '@/components/ui/Button';
import { manage } from '@/lib/manage-api';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  designation: string;
  industry: string;
  source: string;
  status: string;
  score: string;
  priority: string;
  budget_min: string | null;
  budget_max: string | null;
  timeline: string;
  notes: string;
  service_interest: string[];
  created_at: string;
  next_follow_up: string | null;
  converted_to_client: string | null;
}

const STAGES = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost'];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    manage.lead(id).then((l) => setLead(l as Lead)).catch(() => {});
  }, [id]);

  const update = async (field: string, value: string) => {
    setSaving(true);
    try {
      const updated = await manage.updateLead(id, { [field]: value });
      setLead(updated as Lead);
      setMsg('Saved');
      setTimeout(() => setMsg(''), 1500);
    } catch {
      setMsg('Error');
    } finally {
      setSaving(false);
    }
  };

  const convert = async () => {
    if (!confirm('Convert this lead to a Client?')) return;
    try {
      await manage.convertLead(id);
      const updated = await manage.lead(id);
      setLead(updated as Lead);
      setMsg('Converted to Client');
    } catch {
      setMsg('Convert failed');
    }
  };

  if (!lead) return <ManageShell><p className="text-soft-gray">Loading…</p></ManageShell>;

  return (
    <ManageShell>
      <a href="/manage/leads" className="inline-flex items-center gap-2 text-soft-gray hover:text-electric-cyan mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Leads
      </a>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="font-display text-h3 text-white">{lead.full_name}</h1>
                <p className="text-soft-gray">{lead.designation && `${lead.designation} · `}{lead.company_name || '—'}</p>
              </div>
              {!lead.converted_to_client && lead.status === 'qualified' && (
                <Button onClick={convert} size="sm">Convert to Client</Button>
              )}
            </div>

            <dl className="grid sm:grid-cols-2 gap-4">
              <Field icon={<Mail size={14} />} label="Email" value={lead.email} />
              <Field icon={<Phone size={14} />} label="Phone" value={lead.phone || '—'} />
              <Field icon={<Building2 size={14} />} label="Industry" value={lead.industry || '—'} />
              <Field icon={<UserCheck size={14} />} label="Source" value={lead.source} />
              <Field icon={<DollarSign size={14} />} label="Budget" value={lead.budget_min ? `৳${Number(lead.budget_min).toLocaleString()}—৳${Number(lead.budget_max).toLocaleString()}` : '—'} />
              <Field icon={<Calendar size={14} />} label="Timeline" value={lead.timeline || '—'} />
            </dl>

            {lead.service_interest?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-2">Service Interest</p>
                <div className="flex flex-wrap gap-2">
                  {lead.service_interest.map((s) => (
                    <span key={s} className="px-2 py-1 rounded-full text-xs glass text-soft-gray">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-2">Notes</p>
                <p className="text-soft-gray whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-2">Status</p>
            <select
              value={lead.status}
              onChange={(e) => update('status', e.target.value)}
              disabled={saving}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-2">Score</p>
            <select
              value={lead.score}
              onChange={(e) => update('score', e.target.value)}
              disabled={saving}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-2">Priority</p>
            <select
              value={lead.priority}
              onChange={(e) => update('priority', e.target.value)}
              disabled={saving}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {msg && <p className="text-sm text-electric-cyan">{msg}</p>}
        </div>

        <div className="lg:col-span-2 mt-8 grid lg:grid-cols-2 gap-6">
          <Timeline scope={{ lead: id }} />
          <CommentThread scope={{ lead: id }} />
        </div>
      </div>
    </ManageShell>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-white text-sm">{value}</p>
    </div>
  );
}
