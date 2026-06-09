'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageCircle, Phone, Calendar, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api, type SiteSettings } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Form = { full_name: string; email: string; phone: string; company_name: string; industry: string; notes: string };
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.full_name.trim() || f.full_name.trim().length < 2) e.full_name = 'Name must be at least 2 characters.';
  if (!f.email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(f.email)) e.email = 'Enter a valid email.';
  if (f.phone && f.phone.replace(/[^0-9]/g, '').length < 6) e.phone = 'Phone looks too short.';
  return e;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<Form>({
    full_name: '', email: '', phone: '', company_name: '', industry: '', notes: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const toast = useToast();

  useEffect(() => {
    api.site().then((d) => setSettings(d?.settings ?? null));
  }, []);

  const setField = (k: keyof Form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (touched[k]) setErrors(validate({ ...form, [k]: v }));
  };
  const touch = (k: keyof Form) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(form));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({ full_name: true, email: true, phone: true });
    if (Object.keys(errs).length > 0) {
      toast.warning('Check the form', 'Some fields need attention.');
      return;
    }
    setStatus('submitting');
    try {
      const res = await api.submitLead(form);
      if (res.ok) {
        setStatus('success');
        toast.success('Message sent', "We'll reply within 4 business hours.");
      } else {
        setStatus('error');
        toast.error('Could not send', 'Please try again or email us directly.');
      }
    } catch (err) {
      setStatus('error');
      toast.error('Network error', (err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Let's Build Something Extraordinary Together."
        subtitle="Free 30-minute consultation. No commitment. No pressure."
      />

      <Section className="pt-0">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {settings?.contact_phone && (
                <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="glass rounded-2xl p-6 flex items-center gap-4 hover:shadow-glow-cyan transition-shadow block">
                  <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-deep-space" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-white">Call Us</p>
                    <p className="text-soft-gray text-sm">{settings.contact_phone}</p>
                  </div>
                </a>
              )}
              {settings?.whatsapp_number && (
                <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="glass rounded-2xl p-6 flex items-center gap-4 hover:shadow-glow-cyan transition-shadow block">
                  <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-deep-space" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-white">WhatsApp</p>
                    <p className="text-soft-gray text-sm">Quick chat — usually replies within 30 minutes.</p>
                  </div>
                </a>
              )}
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="glass rounded-2xl p-6 flex items-center gap-4 hover:shadow-glow-cyan transition-shadow block">
                  <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-deep-space" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-white">Email</p>
                    <p className="text-soft-gray text-sm">{settings.contact_email}</p>
                  </div>
                </a>
              )}
              <div className="glass rounded-2xl p-6 flex items-center gap-4">
                <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-deep-space" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="font-display font-bold text-white">Office Hours</p>
                  <p className="text-soft-gray text-sm">{settings?.office_hours || 'Sun-Thu, 9 AM - 6 PM (BD Time)'}</p>
                </div>
              </div>
              {settings?.office_address && (
                <div className="glass rounded-2xl p-6">
                  <p className="font-display font-bold text-white mb-2">Office</p>
                  <p className="text-soft-gray text-sm whitespace-pre-line">{settings.office_address}</p>
                </div>
              )}
            </motion.div>

            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              onSubmit={submit}
              className="glass rounded-2xl p-6 sm:p-8 space-y-4"
            >
              {status === 'success' ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto text-aurora-green mb-4" size={56} />
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Got it!</h3>
                  <p className="text-soft-gray">We&apos;ll reply within 4 hours during business hours, 24h guaranteed.</p>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-h3 text-white mb-2">Send Us A Message</h2>
                  <p className="text-soft-gray text-sm mb-6">All fields needed except phone & notes.</p>

                  <Input label="Your Name *" value={form.full_name} onChange={setField('full_name')} onBlur={touch('full_name')} required error={errors.full_name} />
                  <Input label="Email *" type="email" value={form.email} onChange={setField('email')} onBlur={touch('email')} required error={errors.email} />
                  <Input label="Phone (WhatsApp preferred)" value={form.phone} onChange={setField('phone')} onBlur={touch('phone')} error={errors.phone} />
                  <Input label="Company" value={form.company_name} onChange={setField('company_name')} />
                  <Input label="Industry" value={form.industry} onChange={setField('industry')} />

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-soft-gray mb-1.5">
                      Tell us about your project
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-soft-gray/50 focus:outline-none focus:border-electric-cyan focus:shadow-glow-cyan transition-all"
                      placeholder="Brief description, timeline, budget range..."
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-crimson-red text-sm">Something went wrong. Please try again or email us directly.</p>
                  )}

                  <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full">
                    {status === 'submitting' ? 'Sending...' : 'Send Message'} <ArrowRight size={18} />
                  </Button>
                </>
              )}
            </motion.form>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Input({
  label, value, onChange, onBlur, type = 'text', required, error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-soft-gray mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-soft-gray/50 focus:outline-none transition-all ${
          error
            ? 'border-crimson-red focus:border-crimson-red'
            : 'border-white/10 focus:border-electric-cyan focus:shadow-glow-cyan'
        }`}
      />
      {error && <p role="alert" className="text-crimson-red text-xs mt-1">{error}</p>}
    </div>
  );
}
