import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maverickstech.com.bd';

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/manage/',
          '/portal/',
          '/api/',
          '/admin/',
          '/_next/',
          '/get-quote/thank-you',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
