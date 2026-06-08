import type { Metadata, Viewport } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { MagneticCursor } from '@/components/effects/MagneticCursor';
import { SmoothScroll } from '@/components/effects/SmoothScroll';
import { fetchSeo, fetchSite } from '@/lib/api';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([fetchSeo('/'), fetchSite()]);
  const meta = seo?.meta;
  const settings = site?.settings;

  return {
    metadataBase: new URL('https://maverickstech.com.bd'),
    title: {
      default: meta?.title ?? settings?.site_name ?? 'Mavericks Tech | Best Software Company in Bangladesh',
      template: `%s | ${settings?.site_name ?? 'Mavericks Tech Bangladesh'}`,
    },
    description: meta?.description ?? settings?.tagline ?? "Bangladesh's most trusted technology partner.",
    keywords: meta?.primary_keywords && meta.primary_keywords.length > 0 ? meta.primary_keywords : undefined,
    authors: [{ name: settings?.site_name ?? 'Mavericks Tech Bangladesh' }],
    creator: settings?.site_name ?? 'Mavericks Tech Bangladesh',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://maverickstech.com.bd',
      siteName: settings?.site_name ?? 'Mavericks Tech Bangladesh',
      title: meta?.og_title ?? meta?.title ?? "Mavericks Tech | Bangladesh's Most Trusted Technology Partner",
      description: meta?.og_description ?? meta?.description ?? settings?.tagline ?? '',
      images: meta?.og_image ? [meta.og_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.twitter_title ?? meta?.title ?? '',
      description: meta?.twitter_description ?? meta?.description ?? '',
      images: meta?.twitter_image ? [meta.twitter_image] : undefined,
    },
    robots: meta?.robots
      ? {
          index: meta.robots.includes('index') && !meta.robots.includes('noindex'),
          follow: meta.robots.includes('follow') && !meta.robots.includes('nofollow'),
        }
      : undefined,
    icons: {
      icon: [
        { url: settings?.favicon ?? '/favicon.svg', type: 'image/svg+xml' },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#535378',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const seo = await fetchSeo('/');
  const schemas = seo?.schemas ?? [];

  return (
    <html lang="en" className="dark">
      <head>
        {schemas.map((s, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': s.schema_type,
                ...s.data,
              }),
            }}
          />
        ))}
      </head>
      <body className="bg-deep-space text-white font-body antialiased">
        <MagneticCursor />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
