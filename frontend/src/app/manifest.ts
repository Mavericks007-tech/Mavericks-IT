import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mavericks Tech Bangladesh',
    short_name: 'Mavericks Tech',
    description: "Bangladesh's Most Trusted Technology Partner",
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0F',
    theme_color: '#535378',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['business', 'technology', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png',          sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
