/**
 * Lightweight i18n scaffold.
 *
 * Phase A — single en dict + bn dict, no SSR route per locale. App reads
 * locale from cookie `NEXT_LOCALE` (set by LocaleSwitcher), falls back to en.
 *
 * Phase B (later) — convert to next-intl or @lingui/core, add `app/[locale]`
 * route group, statically generate both locales.
 */
export type Locale = 'en' | 'bn';
export const LOCALES: Locale[] = ['en', 'bn'];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

type Dict = Record<string, string>;

const en: Dict = {
  'nav.services':   'Services',
  'nav.industries': 'Industries',
  'nav.portfolio':  'Portfolio',
  'nav.about':      'About',
  'nav.process':    'Process',
  'nav.pricing':    'Pricing',
  'nav.blog':       'Blog',
  'nav.contact':    'Contact',
  'cta.consultation': 'Get Free Consultation',
  'common.search':  'Search',
  'common.loading': 'Loading…',
  'common.submit':  'Submit',
  'common.cancel':  'Cancel',
  'common.save':    'Save',
};

const bn: Dict = {
  'nav.services':   'সেবাসমূহ',
  'nav.industries': 'শিল্প খাত',
  'nav.portfolio':  'পোর্টফোলিও',
  'nav.about':      'আমাদের সম্পর্কে',
  'nav.process':    'প্রক্রিয়া',
  'nav.pricing':    'মূল্য',
  'nav.blog':       'ব্লগ',
  'nav.contact':    'যোগাযোগ',
  'cta.consultation': 'ফ্রি পরামর্শ নিন',
  'common.search':  'খুঁজুন',
  'common.loading': 'লোড হচ্ছে…',
  'common.submit':  'জমা দিন',
  'common.cancel':  'বাতিল',
  'common.save':    'সংরক্ষণ',
};

const DICTS: Record<Locale, Dict> = { en, bn };

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return DICTS[locale]?.[key] ?? DICTS[DEFAULT_LOCALE][key] ?? key;
}

export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  const v = m?.[1] as Locale | undefined;
  return v && LOCALES.includes(v) ? v : DEFAULT_LOCALE;
}

export function setLocaleCookie(l: Locale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
}
