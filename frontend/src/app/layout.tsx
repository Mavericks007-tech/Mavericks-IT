import type { Metadata, Viewport } from 'next';

import { Analytics, GtmNoscript } from '@/components/analytics/Analytics';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CursorTrail } from '@/components/effects/CursorTrail';
import { LoadingScreen } from '@/components/effects/LoadingScreen';
import { MagneticCursor } from '@/components/effects/MagneticCursor';
import { PageTransition } from '@/components/effects/PageTransition';
import { ServiceWorkerRegister } from '@/components/effects/ServiceWorkerRegister';
import { SmoothScroll } from '@/components/effects/SmoothScroll';
import { ChromeWrapper } from '@/components/layout/ChromeWrapper';
import { ToastProvider } from '@/components/ui/Toast';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { fetchSeo, fetchSite } from '@/lib/api';

import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maverickstech.com.bd';
const OG_DEFAULT = '/og-default.png';

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([fetchSeo('/'), fetchSite()]);
  const meta = seo?.meta;
  const settings = site?.settings;
  const ogFallback = settings?.og_default_image ?? OG_DEFAULT;

  const verification: Metadata['verification'] = {};
  if (settings?.verification?.google) verification.google = settings.verification.google;
  if (settings?.verification?.bing) verification.other = { 'msvalidate.01': settings.verification.bing };

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta?.title ?? settings?.site_name ?? 'Mavericks Tech | Best Software Company in Bangladesh',
      template: `%s | ${settings?.site_name ?? 'Mavericks Tech Bangladesh'}`,
    },
    description: meta?.description ?? settings?.tagline ?? "Bangladesh's most trusted technology partner.",
    keywords: meta?.primary_keywords && meta.primary_keywords.length > 0 ? meta.primary_keywords : undefined,
    authors: [{ name: settings?.site_name ?? 'Mavericks Tech Bangladesh' }],
    creator: settings?.site_name ?? 'Mavericks Tech Bangladesh',
    manifest: '/manifest.webmanifest',
    applicationName: settings?.site_name ?? 'Mavericks Tech Bangladesh',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: settings?.site_name ?? 'Mavericks Tech Bangladesh',
      title: meta?.og_title ?? meta?.title ?? "Mavericks Tech | Bangladesh's Most Trusted Technology Partner",
      description: meta?.og_description ?? meta?.description ?? settings?.tagline ?? '',
      images: [meta?.og_image ?? ogFallback],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.twitter_title ?? meta?.title ?? '',
      description: meta?.twitter_description ?? meta?.description ?? '',
      images: [meta?.twitter_image ?? ogFallback],
    },
    robots: meta?.robots
      ? {
          index: meta.robots.includes('index') && !meta.robots.includes('noindex'),
          follow: meta.robots.includes('follow') && !meta.robots.includes('nofollow'),
        }
      : undefined,
    verification: Object.keys(verification).length ? verification : undefined,
    icons: {
      icon: [
        { url: settings?.favicon ?? '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
      other: [
        { rel: 'mask-icon', url: '/favicon.svg', color: '#00D9FF' },
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
  const [seo, site] = await Promise.all([fetchSeo('/'), fetchSite()]);
  const schemas = seo?.schemas ?? [];
  const a = site?.settings?.analytics;

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
        <Analytics
          ga4={a?.google_analytics_id || undefined}
          gtm={a?.google_tag_manager_id || undefined}
          pixel={a?.facebook_pixel_id || undefined}
        />
      </head>
      <body className="bg-deep-space text-white font-body antialiased">
        <GtmNoscript gtm={a?.google_tag_manager_id || undefined} />
        <ToastProvider>
          <ToastBridge />
          <LoadingScreen />
          <MagneticCursor />
          <CursorTrail />
          <SmoothScroll>
            <ChromeWrapper navbar={<Navbar />} footer={<Footer />}>
              <PageTransition>
                {children}
              </PageTransition>
            </ChromeWrapper>
          </SmoothScroll>
          <ServiceWorkerRegister />
        </ToastProvider>
      </body>
    </html>
  );
}
