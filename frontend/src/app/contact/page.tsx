'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageCircle, Phone, Calendar, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { api, type SiteSettings } from '@/lib/api';

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', company_name: '', industry: '', notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    api.site().then((d) => setSettings(d?.settings ?? null));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await api.submitLead(form);
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
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

                  <Input label="Your Name *" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
                  <Input label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                  <Input label="Phone (WhatsApp preferred)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Input label="Company" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} />
                  <Input label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />

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
  label, value, onChange, type = 'text', required,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-soft-gray mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-soft-gray/50 focus:outline-none focus:border-electric-cyan focus:shadow-glow-cyan transition-all"
      />
    </div>
  );
}
