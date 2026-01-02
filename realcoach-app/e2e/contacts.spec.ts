import { test, expect } from '@playwright/test';

test.describe('Contacts CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts');
  });

  test('should display contacts page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Contacts');
  });

  test('should navigate to new contact form', async ({ page }) => {
    await page.click('text=Add Contact');
    await expect(page).toHaveURL(/.*contacts\/new/);
    await expect(page.locator('h1')).toContainText('New Contact');
  });

  test('should create a new contact', async ({ page }) => {
    await page.click('text=Add Contact');

    await page.fill('input[name="name"]', 'Test Contact');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');

    await page.click('button:has-text("Save")');

    await expect(page).toHaveURL(/.*contacts/);
    await expect(page.locator('text=Test Contact')).toBeVisible();
  });

  test('should filter contacts by pipeline stage', async ({ page }) => {
    const stageFilter = page.locator('select[name="stage"]');
    if (await stageFilter.isVisible()) {
      await stageFilter.selectOption('Lead');
      await expect(page).toHaveURL(/.*stage=Lead/);
    }
  });
});
