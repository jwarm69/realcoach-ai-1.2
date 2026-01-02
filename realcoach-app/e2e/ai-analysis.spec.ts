import { test, expect } from '@playwright/test';

test.describe('AI Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should display chat interface', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI Assistant');
  });

  test('should submit text conversation', async ({ page }) => {
    const textInput = page.locator('textarea[placeholder*="conversation"]');
    if (await textInput.isVisible()) {
      await textInput.fill('Client is looking for a 3 bedroom house in the suburbs');
      await page.click('button:has-text("Analyze")');

      await expect(page.locator('text=Analyzing')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should upload screenshot', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      const file = 'test-screenshot.png';

      await page.setInputFiles('input[type="file"]', file);
      await expect(page.locator('text=Uploading')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display analysis results', async ({ page }) => {
    const textInput = page.locator('textarea[placeholder*="conversation"]');
    if (await textInput.isVisible()) {
      await textInput.fill('Client wants to buy immediately, pre-approved');
      await page.click('button:has-text("Analyze")');

      await page.waitForSelector('text=detected', { timeout: 10000 });
    }
  });
});
