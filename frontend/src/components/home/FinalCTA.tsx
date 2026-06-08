'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageCircle, Phone } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import type { CTAData, SiteSettings } from '@/lib/api';

interface Props {
  cta: CTAData | null;
  settings?: SiteSettings | null;
}

export function FinalCTA({ cta, settings }: Props) {
  if (!cta) return null;

  const whatsappHref = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`
    : '#';

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'rgba(0, 102, 255, 0.08)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[120px] animate-glow-pulse" style={{ background: 'rgba(0, 217, 255, 0.1)' }} />
      </div>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-h2 text-white mb-6">
            {cta.headline.split(' ').map((w, i) => (
              <span key={i} className={i === cta.headline.split(' ').length - 1 ? 'text-gradient' : ''}>
                {w}{' '}
              </span>
            ))}
          </h2>
          <p className="text-body-lg text-soft-gray mb-10">
            {cta.subtext}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href={cta.primary_cta_link} size="lg">
              {cta.primary_cta_text} <ArrowRight size={18} />
            </Button>
            <Button href={settings?.whatsapp_number ? whatsappHref : cta.secondary_cta_link} variant="secondary" size="lg">
              <MessageCircle size={18} /> {cta.secondary_cta_text}
            </Button>
          </div>
          {(settings?.contact_phone || settings?.contact_email) && (
            <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-soft-gray">
              {settings?.contact_phone && (
                <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-electric-cyan transition">
                  <Phone size={16} /> {settings.contact_phone}
                </a>
              )}
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 hover:text-electric-cyan transition">
                  <Mail size={16} /> {settings.contact_email}
                </a>
              )}
            </div>
          )}
        </motion.div>
      </Container>
    </Section>
  );
}
