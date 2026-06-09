import { test, expect } from '@playwright/test';

test.describe('Stock Screener', () => {
  test('loads screener with stocks', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /stock screener/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('grid', { name: /stock screener results/i })).toBeVisible();
  });

  test('can search stocks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="grid"]', { timeout: 30000 });
    const search = page.getByLabel('Search stocks');
    await search.fill('A');
    await expect(page.getByText(/results/i)).toBeVisible();
  });

  test('can add filter', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add filter/i }).click();
    await expect(page.getByLabel('Filter field')).toBeVisible();
  });

  test('navigates to watchlist', async ({ page }) => {
    await page.goto('/watchlist');
    await expect(page.getByRole('heading', { name: /watchlist/i })).toBeVisible();
  });

  test('keyboard navigation on grid', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="grid"]', { timeout: 30000 });
    const grid = page.locator('[role="grid"] [tabindex="0"]').first();
    await grid.focus();
    await page.keyboard.press('Enter');
  });
});
