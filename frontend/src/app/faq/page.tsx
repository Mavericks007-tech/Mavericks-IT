'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';

const FAQS = [
  {
    category: 'General',
    items: [
      ['What services does Mavericks Tech offer?', 'Custom software, websites, e-commerce, mobile apps, SaaS, ERP/CRM, POS, cybersecurity, cloud, domain/hosting, SEO, design.'],
      ['Where are you located?', 'Headquartered in Dhaka, Bangladesh. We serve clients across Bangladesh and globally.'],
      ['Do you work with international clients?', 'Yes. 30% of our clients are international (US, UK, UAE, Australia, Canada).'],
      ['How many projects have you delivered?', '250+ projects since 2020.'],
    ],
  },
  {
    category: 'Pricing & Payment',
    items: [
      ['How much does a project cost?', 'Depends on scope. Websites: ৳65k–৳6L+. Custom software: ৳2L–৳25L+. Free quote after consultation.'],
      ['What are your payment terms?', '40% upfront, 30% midway, 30% on delivery. Flexible for larger projects.'],
      ['Do you offer payment plans?', 'Yes, for projects over ৳5,00,000.'],
      ['Is there a money-back guarantee?', 'Yes, 14-day money-back guarantee for projects under ৳5,00,000.'],
    ],
  },
  {
    category: 'Process',
    items: [
      ['How long does a project take?', 'Website: 4–12 weeks. Software: 3–9 months. SaaS: 6–12 months.'],
      ['Will I be involved in the process?', 'Absolutely. Weekly demos, regular check-ins, complete transparency.'],
      ['Will I own the source code?', 'Yes, 100%. You own all code, designs, and documentation.'],
    ],
  },
  {
    category: 'Support',
    items: [
      ['Do you offer post-launch support?', 'Yes. Free support periods vary by package (3–24 months).'],
      ['What if I need changes later?', 'Minor changes covered in support period. Major features quoted separately.'],
      ['Do you provide training?', 'Yes. Complete training included for all systems we build.'],
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
      >
        <span className="font-display text-base sm:text-lg font-semibold text-white">{q}</span>
        <ChevronDown className={`shrink-0 text-electric-cyan transition-transform ${open ? 'rotate-180' : ''}`} size={20} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-soft-gray leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <PageHeader
        eyebrow="Frequently Asked Questions"
        title="Got Questions? We've Got Answers."
        subtitle="Everything you need to know about working with Mavericks Tech."
      />

      <Section>
        <Container>
          <div className="max-w-3xl mx-auto space-y-12">
            {FAQS.map((group) => (
              <div key={group.category}>
                <h2 className="font-display text-h3 text-white mb-6">{group.category}</h2>
                <div className="space-y-3">
                  {group.items.map(([q, a]) => (
                    <FAQItem key={q} q={q} a={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
