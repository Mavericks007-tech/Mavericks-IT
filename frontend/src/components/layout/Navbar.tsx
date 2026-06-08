'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

const NAV_ITEMS = [
  { label: 'Services', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <Container>
          <nav
            className={`flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6 transition-all duration-500 ${
              scrolled ? 'glass-strong' : 'bg-transparent'
            }`}
          >
            <a href="/" aria-label="Mavericks Tech home" data-magnetic>
              <Logo size={36} showText />
            </a>

            <ul className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    data-magnetic
                    className="relative px-4 py-2 text-sm font-medium text-soft-gray transition-colors hover:text-white"
                  >
                    {item.label}
                    <span className="absolute inset-x-4 bottom-1 h-px scale-x-0 origin-left bg-electric-cyan transition-transform duration-300 group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden lg:block">
              <Button href="/contact" size="sm">
                Get Free Consultation →
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="lg:hidden text-white p-2"
              aria-label="Open menu"
            >
              <Menu size={28} />
            </button>
          </nav>
        </Container>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="absolute inset-y-0 right-0 w-full max-w-sm glass-strong p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size={36} showText />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-white p-2"
                  aria-label="Close menu"
                >
                  <X size={28} />
                </button>
              </div>
              <ul className="flex flex-col gap-1 mb-8">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 text-xl font-display font-semibold text-white hover:text-electric-cyan transition-colors"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <Button href="/contact" size="lg" className="w-full">
                Get Free Consultation →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
