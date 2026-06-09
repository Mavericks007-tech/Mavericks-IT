import { Download, FileText, BookOpen, CheckSquare, Shield, ShoppingCart } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Free Resources | Mavericks Tech Bangladesh',
  description: 'Free guides, checklists, and templates for Bangladesh businesses — website costs, e-commerce launch, ERP buyer guide, cybersecurity, restaurant POS.',
};

const RESOURCES = [
  { icon: BookOpen, title: 'Complete Guide to Building Your First Website in Bangladesh', pages: '25 pages', mail: 'website-guide' },
  { icon: CheckSquare, title: 'E-commerce Launch Checklist for Bangladeshi Sellers', pages: '12 pages', mail: 'ecommerce-checklist' },
  { icon: FileText, title: "How to Choose an ERP System: Buyer's Guide", pages: '30 pages', mail: 'erp-buyer-guide' },
  { icon: FileText, title: 'SEO Starter Pack: 50 Bangladesh Keywords That Convert', pages: 'Excel', mail: 'seo-keywords' },
  { icon: Shield, title: 'Cybersecurity Audit Checklist for BD Businesses', pages: '15 pages', mail: 'cybersecurity-checklist' },
  { icon: ShoppingCart, title: "Restaurant POS Buyer's Guide", pages: '18 pages', mail: 'pos-guide' },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free Resources"
        title="Free Resources For Bangladeshi Businesses"
        subtitle="Practical guides, checklists, and templates. No fluff. No paywall. Just useful."
      />

      <Section className="pt-0">
        <Container>
          <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {RESOURCES.map(({ icon: Icon, title, pages, mail }) => (
              <a
                key={mail}
                href={`mailto:hello@maverickstech.com.bd?subject=Request: ${encodeURIComponent(title)}`}
                className="group glass rounded-2xl p-6 transition-all hover:shadow-glow-cyan flex gap-4 items-start"
              >
                <div className="shrink-0 inline-flex w-12 h-12 rounded-xl items-center justify-center text-deep-space" style={{ background: 'rgba(0, 217, 255, 1)' }}>
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-electric-cyan transition-colors">{title}</h3>
                  <p className="text-xs text-soft-gray mb-3">{pages}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-electric-cyan">
                    <Download size={14} /> Request via email
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
