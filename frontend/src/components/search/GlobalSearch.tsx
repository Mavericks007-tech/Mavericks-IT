'use client';

import { Search, X, FileText, Briefcase, Newspaper, Globe } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { api } from '@/lib/api';

interface Result {
  kind: 'service' | 'industry' | 'blog' | 'page';
  title: string;
  slug: string;
  excerpt?: string;
}

const KIND_META = {
  service:  { label: 'Service',   icon: Briefcase,  hrefBase: '/services' },
  industry: { label: 'Industry',  icon: Globe,      hrefBase: '/industries' },
  blog:     { label: 'Blog',      icon: Newspaper,  hrefBase: '/blog' },
  page:     { label: 'Page',      icon: FileText,   hrefBase: '' },
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [corpus, setCorpus] = useState<Result[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Lazy-load corpus the first time it's opened
  useEffect(() => {
    if (!open || loaded) return;
    Promise.all([api.services(), api.industries(), api.blog()])
      .then(([s, i, b]) => {
        const all: Result[] = [];
        for (const r of s?.results ?? []) all.push({ kind: 'service', title: r.title, slug: r.slug, excerpt: r.subtitle });
        for (const r of i?.results ?? []) all.push({ kind: 'industry', title: r.name, slug: r.slug, excerpt: r.description });
        for (const r of b?.results ?? []) all.push({ kind: 'blog', title: r.title, slug: r.slug, excerpt: r.excerpt });
        setCorpus(all);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return corpus.slice(0, 8);
    return corpus
      .filter((r) =>
        r.title.toLowerCase().includes(needle) ||
        (r.excerpt ?? '').toLowerCase().includes(needle))
      .slice(0, 12);
  }, [q, corpus]);

  useEffect(() => { setActive(0); }, [q, open]);

  function hrefOf(r: Result): string {
    return `${KIND_META[r.kind].hrefBase}/${r.slug}`;
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[active];
      if (r) { window.location.href = hrefOf(r); setOpen(false); }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-md text-soft-gray hover:text-white hover:border-white/30 text-sm transition-colors"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">⌘K</kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-midnight-navy border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={18} className="text-soft-gray" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search services, industries, articles…"
                className="flex-1 bg-transparent text-white placeholder:text-soft-gray/60 focus:outline-none"
              />
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-soft-gray hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!loaded && (
                <p className="text-soft-gray text-sm text-center py-10">Loading…</p>
              )}
              {loaded && results.length === 0 && (
                <p className="text-soft-gray text-sm text-center py-10">No matches.</p>
              )}
              {results.map((r, i) => {
                const Icon = KIND_META[r.kind].icon;
                const isActive = i === active;
                return (
                  <Link
                    key={`${r.kind}-${r.slug}`}
                    href={hrefOf(r)}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive ? 'bg-electric-cyan/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} className="mt-0.5 text-electric-cyan flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.title}</p>
                      {r.excerpt && <p className="text-soft-gray text-xs truncate">{r.excerpt}</p>}
                    </div>
                    <span className="text-soft-gray text-[10px] uppercase tracking-wider mt-0.5">{KIND_META[r.kind].label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="px-4 py-2 text-xs text-soft-gray/70 border-t border-white/10 flex items-center justify-between">
              <span><kbd className="font-mono">↑↓</kbd> navigate · <kbd className="font-mono">Enter</kbd> open</span>
              <span><kbd className="font-mono">Esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
