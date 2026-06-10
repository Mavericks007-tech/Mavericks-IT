import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/about', '/services', '/contact', '/blog', '/manage/login'];

/**
 * Phase-A a11y gate: block on serious/critical violations EXCEPT the rules
 * tracked separately (form labels + color contrast). Those are fixed
 * incrementally — see issue list in CLAUDE.md.
 */
const ALLOWED_RULES = new Set([
  'color-contrast',  // dark-mode brand — audited separately
  'label',           // form inputs need explicit <label htmlFor> wiring — tracked
]);

test.describe.configure({ timeout: 90_000 });

for (const path of PAGES) {
  test(`a11y: ${path} has no blocking serious/critical violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    // Settle 3D scenes + lazy components before axe scans.
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const blocking = results.violations
      .filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
      .filter((v) => !ALLOWED_RULES.has(v.id));

    expect(
      blocking,
      JSON.stringify(blocking.map((v) => ({ id: v.id, count: v.nodes.length })), null, 2),
    ).toEqual([]);
  });
}
