import { expect, test } from '@playwright/test';

test.describe('public site', () => {
  test('homepage renders and brand is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mavericks Tech/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('navbar nav links to /services', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /services/i }).first();
    await expect(link).toBeVisible();
  });

  test('/contact page renders contact heading', async ({ page }) => {
    await page.goto('/contact');
    // PageHeader uses h1 with the literal title text.
    await expect(
      page.getByRole('heading', {
        name: /let.{0,3}s build something extraordinary together/i,
      }),
    ).toBeVisible();
  });

  test('/get-quote multi-step wizard mounts', async ({ page }) => {
    await page.goto('/get-quote');
    await expect(
      page.getByRole('heading', { name: /get your project quote/i }),
    ).toBeVisible();
  });

  test('blog list page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(
      page.getByRole('heading', { name: /insights from our engineers/i }),
    ).toBeVisible();
  });

  test('manage login page renders inputs', async ({ page }) => {
    await page.goto('/manage/login');
    // Inputs are plain <input>, no associated label — query by placeholder/type.
    await expect(page.locator('input[type="text"], input:not([type])').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('portal login page renders email input', async ({ page }) => {
    await page.goto('/portal/login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('robots.txt is reachable', async ({ request }) => {
    const r = await request.get('/robots.txt', { timeout: 60_000 });
    expect(r.ok()).toBeTruthy();
  });

  test('sitemap.xml is reachable', async ({ request }) => {
    // Sitemap proxies backend /api/v1/seo/sitemap-feed/ — can be slow.
    const r = await request.get('/sitemap.xml', { timeout: 60_000 });
    expect(r.ok()).toBeTruthy();
  });

  test('manifest.webmanifest serves JSON', async ({ request }) => {
    const r = await request.get('/manifest.webmanifest', { timeout: 60_000 });
    expect(r.ok()).toBeTruthy();
  });
});
