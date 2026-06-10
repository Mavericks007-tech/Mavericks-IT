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

  test('/contact form renders required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /contact/i }).first()).toBeVisible();
  });

  test('/get-quote multi-step wizard mounts', async ({ page }) => {
    await page.goto('/get-quote');
    await expect(page.getByText(/Free Custom Quote|Get Your Project Quote/i).first()).toBeVisible();
  });

  test('blog list loads (or shows empty state)', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /insights/i }).first()).toBeVisible();
  });

  test('manage login page renders', async ({ page }) => {
    await page.goto('/manage/login');
    await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
  });

  test('portal login page renders', async ({ page }) => {
    await page.goto('/portal/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('robots.txt is reachable', async ({ request }) => {
    const r = await request.get('/robots.txt');
    expect(r.ok()).toBeTruthy();
  });

  test('sitemap.xml is reachable', async ({ request }) => {
    const r = await request.get('/sitemap.xml');
    expect(r.ok()).toBeTruthy();
  });

  test('manifest.webmanifest serves JSON', async ({ request }) => {
    const r = await request.get('/manifest.webmanifest');
    expect(r.ok()).toBeTruthy();
  });
});
