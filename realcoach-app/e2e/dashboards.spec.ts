import { test, expect } from '@playwright/test';

test.describe('Dashboards', () => {
  test.describe('Main Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should display dashboard', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('RealCoach AI');
    });

    test('should display stats cards', async ({ page }) => {
      await expect(page.locator('text=Total Contacts')).toBeVisible();
      await expect(page.locator('text=Active Opportunities')).toBeVisible();
      await expect(page.locator('text=Today\'s Actions')).toBeVisible();
      await expect(page.locator('text=Current Streak')).toBeVisible();
    });

    test('should display consistency score', async ({ page }) => {
      await expect(page.locator('text=Consistency Score')).toBeVisible();
    });

    test('should display pipeline overview', async ({ page }) => {
      await expect(page.locator('text=Pipeline Overview')).toBeVisible();
      await expect(page.locator('text=Lead')).toBeVisible();
      await expect(page.locator('text=Closed')).toBeVisible();
    });
  });

  test.describe('Sales Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/sales');
    });

    test('should display sales dashboard', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Sales Dashboard');
    });

    test('should display 4 conversations metrics', async ({ page }) => {
      await expect(page.locator('text=Appointments')).toBeVisible();
      await expect(page.locator('text=Listings')).toBeVisible();
      await expect(page.locator('text=Closings')).toBeVisible();
      await expect(page.locator('text=GCI')).toBeVisible();
    });

    test('should display conversion funnel', async ({ page }) => {
      await expect(page.locator('text=Conversion Funnel')).toBeVisible();
    });

    test('should display lead sources', async ({ page }) => {
      await expect(page.locator('text=Lead Sources')).toBeVisible();
    });

    test('should switch time periods', async ({ page }) => {
      await page.click('a:has-text("Week")');
      await expect(page).toHaveURL(/.*period=week/);
    });
  });
});
