'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';

import { Logo } from '@/components/brand/Logo';
import { Container } from '@/components/ui/Container';

// Brand icons inline (lucide-react v1.x removed brand icons)
const Linkedin = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.339 18.337v-8.27H5.667v8.27zM7.003 8.91a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1m11.335 9.427v-4.535c0-2.401-.519-4.247-3.32-4.247-1.348 0-2.252.736-2.62 1.437h-.04v-1.213h-2.561v8.558h2.665v-4.235c0-1.117.213-2.196 1.595-2.196 1.36 0 1.382 1.272 1.382 2.268v4.163z"/></svg>
);
const Facebook = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94"/></svg>
);
const Instagram = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const Youtube = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.506 2.506 0 0 0-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418a2.506 2.506 0 0 0-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814a2.506 2.506 0 0 0 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814M10 15.464V8.536L16 12z"/></svg>
);
const Twitter = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const COLUMNS = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Process', href: '/process' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Custom Software', href: '/services/custom-software-development' },
      { label: 'Web Development', href: '/services/web-development' },
      { label: 'E-commerce', href: '/services/ecommerce-development' },
      { label: 'Mobile Apps', href: '/services/mobile-app-development' },
      { label: 'Cybersecurity', href: '/services/cybersecurity-penetration-testing' },
    ],
  },
  {
    heading: 'Industries',
    links: [
      { label: 'Corporate', href: '/industries/corporate' },
      { label: 'E-commerce', href: '/industries/ecommerce' },
      { label: 'Restaurants', href: '/industries/restaurants' },
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Garments', href: '/industries/garments-manufacturing' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/portfolio' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-midnight-navy/40 pt-20 pb-10">
      <div className="absolute inset-0 -z-10 bg-gradient-radial from-electric-cyan/5 via-transparent to-transparent" />
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 mb-16">
          <div className="col-span-2 md:col-span-1">
            <a href="/" aria-label="Mavericks Tech home" className="inline-block mb-6">
              <Logo size={44} showText />
            </a>
            <p className="text-sm text-soft-gray leading-relaxed max-w-xs">
              Bangladesh&apos;s Most Trusted Technology Partner. Engineered in Dhaka, trusted worldwide.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-sm text-soft-gray">
              <a href="mailto:hello@maverickstech.com.bd" className="flex items-center gap-2 hover:text-electric-cyan transition">
                <Mail size={16} /> hello@maverickstech.com.bd
              </a>
              <a href="tel:+8801XXXXXXXXX" className="flex items-center gap-2 hover:text-electric-cyan transition">
                <Phone size={16} /> +880 1XXX XXX XXX
              </a>
              <a href="https://wa.me/8801XXXXXXXXX" className="flex items-center gap-2 hover:text-electric-cyan transition">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-soft-gray hover:text-electric-cyan transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8 border-t border-white/5">
          <p className="text-sm text-soft-gray">
            © {new Date().getFullYear()} Mavericks Tech Bangladesh. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-soft-gray">
            <a href="/privacy-policy" className="hover:text-electric-cyan transition">Privacy</a>
            <span>·</span>
            <a href="/terms-conditions" className="hover:text-electric-cyan transition">Terms</a>
            <span>·</span>
            <a href="/cookie-policy" className="hover:text-electric-cyan transition">Cookies</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="LinkedIn" className="text-soft-gray hover:text-electric-cyan transition"><Linkedin size={18} /></a>
            <a href="#" aria-label="Facebook" className="text-soft-gray hover:text-electric-cyan transition"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="text-soft-gray hover:text-electric-cyan transition"><Instagram size={18} /></a>
            <a href="#" aria-label="YouTube" className="text-soft-gray hover:text-electric-cyan transition"><Youtube size={18} /></a>
            <a href="#" aria-label="Twitter" className="text-soft-gray hover:text-electric-cyan transition"><Twitter size={18} /></a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
