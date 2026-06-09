import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maverickstech.com.bd';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

type Feed = {
  services: { slug: string; lastmod: string | null }[];
  industries: { slug: string; lastmod: string | null }[];
  blog: { slug: string; lastmod: string | null }[];
  pages: { slug: string; lastmod: string | null }[];
};

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',                     priority: 1.0, changeFrequency: 'weekly' },
  { path: 'about',                priority: 0.8, changeFrequency: 'monthly' },
  { path: 'process',              priority: 0.7, changeFrequency: 'monthly' },
  { path: 'services',             priority: 0.9, changeFrequency: 'weekly' },
  { path: 'industries',           priority: 0.9, changeFrequency: 'weekly' },
  { path: 'portfolio',            priority: 0.8, changeFrequency: 'weekly' },
  { path: 'pricing',              priority: 0.8, changeFrequency: 'monthly' },
  { path: 'blog',                 priority: 0.8, changeFrequency: 'daily' },
  { path: 'contact',              priority: 0.7, changeFrequency: 'yearly' },
  { path: 'get-quote',            priority: 0.7, changeFrequency: 'yearly' },
  { path: 'careers',              priority: 0.6, changeFrequency: 'weekly' },
  { path: 'faq',                  priority: 0.6, changeFrequency: 'monthly' },
  { path: 'resources',            priority: 0.5, changeFrequency: 'monthly' },
  { path: 'legal/privacy',        priority: 0.3, changeFrequency: 'yearly' },
  { path: 'legal/terms',          priority: 0.3, changeFrequency: 'yearly' },
  { path: 'legal/cookie',         priority: 0.3, changeFrequency: 'yearly' },
  { path: 'legal/refund',         priority: 0.3, changeFrequency: 'yearly' },
];

async function loadFeed(): Promise<Feed | null> {
  try {
    const res = await fetch(`${API_BASE}/seo/sitemap-feed/`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const feed = await loadFeed();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}/${path}`.replace(/\/$/, '') || SITE_URL,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [];

  if (feed) {
    for (const s of feed.services) {
      dynamicEntries.push({
        url: `${SITE_URL}/services/${s.slug}`,
        lastModified: s.lastmod ? new Date(s.lastmod) : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
    for (const i of feed.industries) {
      dynamicEntries.push({
        url: `${SITE_URL}/industries/${i.slug}`,
        lastModified: i.lastmod ? new Date(i.lastmod) : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
    for (const b of feed.blog) {
      dynamicEntries.push({
        url: `${SITE_URL}/blog/${b.slug}`,
        lastModified: b.lastmod ? new Date(b.lastmod) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
    for (const p of feed.pages) {
      dynamicEntries.push({
        url: `${SITE_URL}/${p.slug}`,
        lastModified: p.lastmod ? new Date(p.lastmod) : now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return [...staticEntries, ...dynamicEntries];
}
