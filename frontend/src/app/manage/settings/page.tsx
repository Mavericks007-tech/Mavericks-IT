'use client';

import { ExternalLink } from 'lucide-react';

import { ManageShell } from '@/components/manage/Shell';

const LINKS = [
  { label: 'Site Settings', desc: 'Logo, contact, social, analytics', path: '/admin/site_content/sitesettings/' },
  { label: 'Navigation', desc: 'Header / Footer / Mobile menus', path: '/admin/site_content/navmenu/' },
  { label: 'Footer Columns', desc: 'Footer column headings + links', path: '/admin/site_content/footercolumn/' },
  { label: 'Pages', desc: 'About, Privacy, Terms etc.', path: '/admin/site_content/page/' },
  { label: 'Media Library', desc: 'Images & videos uploaded', path: '/admin/site_content/mediaasset/' },
  { label: 'Redirects', desc: '301/302 URL redirects', path: '/admin/site_content/redirect/' },
  { label: 'SEO Meta', desc: 'Per-path title/description/OG', path: '/admin/seo/metatag/' },
  { label: 'JSON-LD Schemas', desc: 'Structured data blocks', path: '/admin/seo/schemaorg/' },
  { label: 'Hero Section', desc: 'Homepage hero copy + CTAs', path: '/admin/cms/herosection/' },
  { label: 'Services', desc: 'Services + slug + pricing', path: '/admin/cms/service/' },
  { label: 'Industries', desc: 'Industry list + descriptions', path: '/admin/cms/industry/' },
  { label: 'Testimonials', desc: 'Client testimonials', path: '/admin/cms/testimonial/' },
  { label: 'Trust Stats', desc: 'Animated counter numbers', path: '/admin/cms/truststat/' },
  { label: 'Differentiators', desc: 'Why-choose-us cards', path: '/admin/cms/differentiator/' },
  { label: 'Process Steps', desc: '5-step process content', path: '/admin/cms/processstep/' },
  { label: 'Case Studies', desc: 'Portfolio entries', path: '/admin/cms/casestudy/' },
  { label: 'Blog Posts', desc: 'Articles + rich text editor', path: '/admin/cms/blogpost/' },
  { label: 'CTA Section', desc: 'Final CTA copy', path: '/admin/cms/ctasection/' },
  { label: 'Email Settings', desc: 'SMTP credentials', path: '/admin/comms/emailsettings/' },
  { label: 'Email Templates', desc: 'Template editor', path: '/admin/comms/emailtemplate/' },
  { label: 'Users & Groups', desc: 'RBAC + permissions', path: '/admin/auth/user/' },
  { label: 'Portal Tokens', desc: 'Client portal access', path: '/admin/portal/portaltoken/' },
];

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

export default function ManageSettingsPage() {
  return (
    <ManageShell>
      <div className="mb-6">
        <h1 className="font-display text-h2 text-white">Settings</h1>
        <p className="text-soft-gray text-sm">
          Quick links to the underlying Django admin for content editing. Custom screens for these are planned in P3.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {LINKS.map((l) => (
          <a
            key={l.path}
            href={BACKEND + l.path}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass rounded-xl p-4 hover:border-electric-cyan/40 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-bold text-white group-hover:text-electric-cyan transition-colors">{l.label}</p>
                <p className="text-xs text-soft-gray mt-1">{l.desc}</p>
              </div>
              <ExternalLink size={14} className="text-soft-gray shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </ManageShell>
  );
}
