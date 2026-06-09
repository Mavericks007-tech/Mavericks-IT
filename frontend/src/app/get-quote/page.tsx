'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api, type Industry, type Service } from '@/lib/api';

const STEPS = ['About', 'Requirements', 'Contact', 'Review'];

export default function GetQuotePage() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    project_type: '',
    industry: '',
    description: '',
    service_interest: [] as string[],
    budget_min: '',
    timeline: '',
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    api.services().then((d) => setServices(d?.results ?? []));
    api.industries().then((d) => setIndustries(d?.results ?? []));
  }, []);

  const submit = async () => {
    setStatus('submitting');
    try {
      const res = await api.submitLead({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        company_name: form.company_name,
        industry: form.industry,
        service_interest: form.service_interest,
        notes: `Project: ${form.project_type}\nBudget: ${form.budget_min}\nTimeline: ${form.timeline}\n\n${form.description}`,
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Free Custom Quote"
        title="Get Your Project Quote In 24 Hours"
        subtitle="Tell us about your project. We'll respond with a detailed proposal within 24 hours."
      />

      <Section className="pt-0">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1 flex items-center">
                  <div className={`inline-flex w-9 h-9 rounded-full items-center justify-center text-sm font-bold ${
                    i <= step ? 'text-deep-space' : 'text-soft-gray bg-white/10'
                  }`} style={i <= step ? { background: 'rgba(0, 217, 255, 1)' } : {}}>
                    {i < step ? <CheckCircle2 size={18} /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-electric-cyan' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 sm:p-8 space-y-5"
            >
              {status === 'success' ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto text-aurora-green mb-4" size={56} />
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Thanks!</h3>
                  <p className="text-soft-gray">Expect a detailed quote within 24 hours at {form.email}.</p>
                </div>
              ) : (
                <>
                  {step === 0 && (
                    <>
                      <h2 className="font-display text-h3 text-white mb-2">About Your Project</h2>
                      <Field label="Project Type *">
                        <select required value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} className="input">
                          <option value="">Select…</option>
                          <option>Website</option>
                          <option>Custom Software</option>
                          <option>Mobile App</option>
                          <option>E-commerce</option>
                          <option>SEO / Marketing</option>
                          <option>Cybersecurity</option>
                          <option>Cloud Infrastructure</option>
                          <option>Other</option>
                        </select>
                      </Field>
                      <Field label="Industry">
                        <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input">
                          <option value="">Select…</option>
                          {industries.map((i) => <option key={i.id}>{i.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Brief Description">
                        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
                      </Field>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h2 className="font-display text-h3 text-white mb-2">Requirements</h2>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-soft-gray mb-3">Services Needed</p>
                        <div className="grid grid-cols-2 gap-2">
                          {services.slice(0, 8).map((s) => {
                            const selected = form.service_interest.includes(s.slug);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    service_interest: selected
                                      ? form.service_interest.filter((x) => x !== s.slug)
                                      : [...form.service_interest, s.slug],
                                  })
                                }
                                className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                                  selected ? 'border-electric-cyan text-electric-cyan' : 'border-white/10 text-soft-gray'
                                }`}
                              >
                                {s.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Field label="Budget Range">
                        <select value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} className="input">
                          <option value="">Select…</option>
                          <option>Under ৳100,000</option>
                          <option>৳100,000 - ৳500,000</option>
                          <option>৳500,000 - ৳1,500,000</option>
                          <option>৳1,500,000 - ৳5,000,000</option>
                          <option>৳5,000,000+</option>
                        </select>
                      </Field>
                      <Field label="Timeline">
                        <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="input">
                          <option value="">Select…</option>
                          <option>ASAP</option>
                          <option>Within 1 month</option>
                          <option>1-3 months</option>
                          <option>3-6 months</option>
                          <option>6+ months</option>
                        </select>
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="font-display text-h3 text-white mb-2">Your Details</h2>
                      <Field label="Full Name *">
                        <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" />
                      </Field>
                      <Field label="Company">
                        <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="input" />
                      </Field>
                      <Field label="Email *">
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
                      </Field>
                      <Field label="Phone (WhatsApp preferred)">
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
                      </Field>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h2 className="font-display text-h3 text-white mb-4">Review & Submit</h2>
                      <Row k="Project" v={form.project_type} />
                      <Row k="Industry" v={form.industry} />
                      <Row k="Services" v={form.service_interest.join(', ')} />
                      <Row k="Budget" v={form.budget_min} />
                      <Row k="Timeline" v={form.timeline} />
                      <Row k="Name" v={form.full_name} />
                      <Row k="Email" v={form.email} />
                    </>
                  )}

                  {status === 'error' && (
                    <p className="text-crimson-red text-sm">Submit failed. Try again or email us directly.</p>
                  )}

                  <div className="flex gap-3 pt-4">
                    {step > 0 && (
                      <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
                        ← Back
                      </Button>
                    )}
                    {step < STEPS.length - 1 ? (
                      <Button type="button" onClick={() => setStep(step + 1)} className="flex-1">
                        Next <ArrowRight size={18} />
                      </Button>
                    ) : (
                      <Button type="button" onClick={submit} disabled={status === 'submitting'} className="flex-1">
                        {status === 'submitting' ? 'Sending...' : 'Submit'} <ArrowRight size={18} />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </Container>
      </Section>

      <style jsx global>{`
        .input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .input:focus {
          border-color: #00D9FF;
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-soft-gray mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-soft-gray text-sm">{k}</span>
      <span className="text-white text-sm font-medium text-right">{v || '—'}</span>
    </div>
  );
}
