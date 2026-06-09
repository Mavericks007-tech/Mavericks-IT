'use client';

import { Calendar, Clock, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string;
  category: string;
  read_time: number;
  published_at: string;
  tags?: string[];
}

const PAGE_SIZE = 9;

export function BlogList({ posts }: { posts: Post[] }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.excerpt.toLowerCase().includes(needle) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(needle))
      );
    });
  }, [posts, q, cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function reset() {
    setQ(''); setCat(''); setPage(1);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-gray" />
          <input
            type="search"
            placeholder="Search by title, tag, or keyword…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-9 py-2.5 text-white placeholder:text-soft-gray/60 focus:outline-none focus:border-electric-cyan transition-colors"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-gray hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={cat}
          onChange={(e) => { setCat(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-electric-cyan"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(q || cat) && (
          <button type="button" onClick={reset} className="px-3 py-2.5 border border-white/10 rounded-lg text-soft-gray text-sm hover:text-white hover:border-white/30">
            Reset
          </button>
        )}
      </div>

      <p className="text-soft-gray text-sm text-center">
        {filtered.length} {filtered.length === 1 ? 'post' : 'posts'} {q || cat ? 'matching filters' : 'published'}
      </p>

      {visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-soft-gray">No posts match those filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {visible.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group glass rounded-2xl overflow-hidden transition-all hover:shadow-glow-cyan">
              {p.featured_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.featured_image} alt={p.title} loading="lazy" className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {p.category && (
                  <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan">{p.category}</span>
                )}
                <h3 className="font-display text-xl font-bold text-white mt-2 mb-2 group-hover:text-electric-cyan transition-colors">
                  {p.title}
                </h3>
                <p className="text-soft-gray text-sm mb-4 line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-soft-gray pt-4 border-t border-white/5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} /> {new Date(p.published_at).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {p.read_time} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1.5 border border-white/10 rounded-md text-soft-gray text-sm hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-soft-gray text-sm px-2">{safePage} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="px-3 py-1.5 border border-white/10 rounded-md text-soft-gray text-sm hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
