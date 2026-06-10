'use client';

import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, getLocaleFromCookie, setLocaleCookie, type Locale } from '@/lib/i18n';

export function LocaleSwitcher() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => { setLocale(getLocaleFromCookie()); }, []);

  function pick(l: Locale) {
    setLocale(l);
    setLocaleCookie(l);
    // Force reload so server components see updated cookie. Replace w/ router.refresh()
    // once content is dict-driven via SSR.
    window.location.reload();
  }

  return (
    <div className="inline-flex items-center gap-1 text-xs text-soft-gray">
      <Globe size={12} />
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={locale === l}
          className={`px-2 py-1 rounded-md transition-colors ${
            locale === l ? 'bg-electric-cyan/15 text-electric-cyan' : 'hover:text-white'
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
