import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/about', '/services', '/contact', '/blog', '/manage/login'];

for (const path of PAGES) {
  test(`a11y: ${path} has no serious or critical violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // brand is dark-mode; contrast tuned separately
      .analyze();
    const blocking = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );
    expect(blocking, JSON.stringify(blocking.map((v) => v.id), null, 2)).toEqual([]);
  });
}
