'use client';

import Link from 'next/link';

import { ManageShell } from '@/components/manage/Shell';

type LinkRow = { label: string; desc: string; path: string; external?: boolean };

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

const SECTIONS: { title: string; items: LinkRow[] }[] = [
  {
    title: 'Site & branding',
    items: [
      { label: 'Site Settings',  desc: 'Logo, contact, social, analytics, GSC verification', path: '/manage/cms-site' },
      { label: 'Hero Sections',  desc: 'Homepage hero copy + CTAs',                          path: '/manage/cms-hero' },
      { label: 'CTA Sections',   desc: 'Final CTA copy',                                     path: '/manage/cms-cta' },
      { label: 'Pages',          desc: 'About, Privacy, Terms, etc.',                        path: '/manage/cms-pages' },
      { label: 'Media Library',  desc: 'Images & videos uploaded by admin',                  path: '/manage/cms-media' },
      { label: 'Redirects',      desc: '301/302 URL redirects (RedirectMiddleware)',         path: '/manage/cms-redirects' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Services',       desc: '12 service lines + pricing + descriptions',          path: '/manage/cms-services' },
      { label: 'Industries',     desc: '16 sectors served',                                  path: '/manage/cms-industries' },
      { label: 'Testimonials',   desc: 'Client testimonial quotes',                          path: '/manage/cms-testimonials' },
      { label: 'Blog Posts',     desc: 'Articles with rich content + tags',                  path: '/manage/cms-blog' },
      { label: 'Trust Stats',    desc: 'Animated counter numbers',                           path: '/admin/cms/truststat/', external: true },
      { label: 'Differentiators', desc: 'Why-choose-us cards',                               path: '/admin/cms/differentiator/', external: true },
      { label: 'Process Steps',  desc: '5-step process content',                             path: '/admin/cms/processstep/', external: true },
      { label: 'Case Studies',   desc: 'Portfolio entries (challenge / solution / metric / testimonial)', path: '/manage/cms-case-studies' },
    ],
  },
  {
    title: 'SEO',
    items: [
      { label: 'Meta Tags',      desc: 'Per-path title, description, OG, Twitter',          path: '/manage/cms-meta' },
      { label: 'JSON-LD Schemas', desc: 'Structured data blocks (legacy admin)',            path: '/admin/seo/schemaorg/', external: true },
    ],
  },
  {
    title: 'Email',
    items: [
      { label: 'Email Settings', desc: 'SMTP host, port, credentials',                       path: '/manage/cms-email-settings' },
      { label: 'Email Templates', desc: 'Lead welcome, invoice receipts, etc.',              path: '/manage/cms-email-templates' },
      { label: 'Campaigns',      desc: 'Bulk campaigns + audience builder (legacy admin)',  path: '/admin/comms/emailcampaign/', external: true },
    ],
  },
  {
    title: 'Access & audit',
    items: [
      { label: 'Users & Roles',  desc: 'Toggle RBAC group membership',                       path: '/manage/cms-users' },
      { label: 'Audit Log',      desc: 'Every change tracked by django-simple-history',     path: '/manage/audit' },
      { label: 'Portal Tokens',  desc: 'Client portal access (legacy admin)',                path: '/admin/portal/portaltoken/', external: true },
    ],
  },
];

export default function SettingsIndex() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-10">
        <header>
          <h1 className="font-display text-h2 text-white">Settings</h1>
          <p className="text-soft-gray text-sm mt-1">
            Every entity managed inline below. A few rarely-edited models still link to the legacy Django admin (marked <em>legacy</em>).
          </p>
        </header>

        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-soft-gray text-xs uppercase tracking-wider">{section.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((item) => (
                item.external ? (
                  <a
                    key={item.path}
                    href={BACKEND_BASE + item.path}
                    target="_blank"
                    rel="noreferrer"
                    className="glass rounded-xl p-4 hover:border-cyan/40 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="text-soft-gray/70 text-xs">legacy ↗</span>
                    </div>
                    <p className="text-soft-gray text-xs mt-1">{item.desc}</p>
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="glass rounded-xl p-4 hover:border-cyan/40 hover:bg-cyan/[0.04] transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="text-cyan text-xs">→</span>
                    </div>
                    <p className="text-soft-gray text-xs mt-1">{item.desc}</p>
                  </Link>
                )
              ))}
            </div>
          </section>
        ))}
      </div>
    </ManageShell>
  );
}
