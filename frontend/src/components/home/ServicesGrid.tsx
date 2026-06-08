'use client';

import { motion } from 'framer-motion';
import { useRef, MouseEvent } from 'react';
import {
  Code2, Globe, ShoppingCart, Smartphone, Cloud, TrendingUp,
  PenTool, Shield, Server, ShoppingBag, Globe2, Heart, Rocket,
} from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import type { Service } from '@/lib/api';

const ICON_MAP: Record<string, any> = {
  Code2, Globe, ShoppingCart, Smartphone, Cloud, TrendingUp,
  PenTool, Shield, Server, ShoppingBag, Globe2, Heart,
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = ICON_MAP[service.icon_name] || Rocket;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
    ref.current.style.setProperty('--mouse-x', `${(x + 0.5) * 100}%`);
    ref.current.style.setProperty('--mouse-y', `${(y + 0.5) * 100}%`);
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: 0.05 * (index % 4), ease: 'easeOut' }}
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group relative h-full glass rounded-2xl p-6 transition-shadow duration-500 hover:shadow-glow-cyan will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl text-electric-cyan group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(0, 217, 255, 0.15)' }}>
          <Icon size={24} />
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">
          {service.title}
        </h3>
        <p className="text-sm text-soft-gray leading-relaxed">
          {service.subtitle}
        </p>
        <div className="absolute inset-x-6 bottom-6 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0, 217, 255, 0.4)' }} />
      </div>
    </motion.div>
  );
}

export function ServicesGrid({ services }: { services: Service[] }) {
  if (!services?.length) return null;

  return (
    <Section>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan mb-4 inline-block">
            What We Build
          </span>
          <h2 className="font-display text-h2 text-white mb-4">
            Full-Stack Technology Solutions{' '}
            <span className="text-gradient">Under One Roof</span>
          </h2>
          <p className="text-body-lg text-soft-gray">
            From a single landing page to enterprise software ecosystems —
            we engineer every digital asset your business needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
