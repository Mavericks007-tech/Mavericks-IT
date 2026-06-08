'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageCircle, Phone } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';

export function FinalCTA() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-plasma-blue/20 via-electric-cyan/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-electric-cyan/10 blur-[120px] animate-glow-pulse" />
      </div>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-h2 text-white mb-6">
            Ready To Build Something{' '}
            <span className="text-gradient">Extraordinary?</span>
          </h2>
          <p className="text-body-lg text-soft-gray mb-10">
            Let&apos;s discuss your project. Free 30-minute strategy call. No commitment. No pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" size="lg">
              Schedule Free Consultation <ArrowRight size={18} />
            </Button>
            <Button href="https://wa.me/8801XXXXXXXXX" variant="secondary" size="lg">
              <MessageCircle size={18} /> WhatsApp Us
            </Button>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-soft-gray">
            <a href="tel:+8801XXXXXXXXX" className="inline-flex items-center gap-2 hover:text-electric-cyan transition">
              <Phone size={16} /> +880 1XXX XXX XXX
            </a>
            <a href="mailto:hello@maverickstech.com.bd" className="inline-flex items-center gap-2 hover:text-electric-cyan transition">
              <Mail size={16} /> hello@maverickstech.com.bd
            </a>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
