import type { Metadata, Viewport } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { MagneticCursor } from '@/components/effects/MagneticCursor';
import { SmoothScroll } from '@/components/effects/SmoothScroll';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://maverickstech.com.bd'),
  title: {
    default: 'Mavericks Tech | Best Software Company in Bangladesh',
    template: '%s | Mavericks Tech Bangladesh',
  },
  description:
    "Bangladesh's most trusted technology partner. Custom software, websites, e-commerce, cybersecurity & cloud solutions. 250+ projects delivered.",
  keywords: [
    'software company Bangladesh',
    'web development Dhaka',
    'custom software Bangladesh',
    'e-commerce Bangladesh',
    'mobile app development BD',
    'cybersecurity Bangladesh',
  ],
  authors: [{ name: 'Mavericks Tech Bangladesh' }],
  creator: 'Mavericks Tech Bangladesh',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://maverickstech.com.bd',
    siteName: 'Mavericks Tech Bangladesh',
    title: "Mavericks Tech | Bangladesh's Most Trusted Technology Partner",
    description: 'Custom software, websites, e-commerce, mobile apps, cybersecurity & cloud. 250+ projects delivered.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mavericks Tech | Bangladesh's Most Trusted Technology Partner",
    description: 'Custom software, websites, e-commerce, mobile apps, cybersecurity & cloud.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
