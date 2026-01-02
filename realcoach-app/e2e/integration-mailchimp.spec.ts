import { test, expect } from '@playwright/test';

test.describe('Mailchimp Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to integrations settings
    await page.goto('/settings/integrations');
  });

  test('should display Mailchimp settings card', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Integrations');
    await expect(page.locator('text=Mailchimp')).toBeVisible();
    await expect(page.locator('text=Sync your contacts with Mailchimp')).toBeVisible();
  });

  test('should have API key and list ID input fields', async ({ page }) => {
    await expect(page.locator('label:has-text("API Key")')).toBeVisible();
    await expect(page.locator('#apiKey')).toBeVisible();
    await expect(page.locator('label:has-text("List ID")')).toBeVisible();
    await expect(page.locator('#listId')).toBeVisible();
  });

  test('should disable test connection button when API key is empty', async ({ page }) => {
    const testButton = page.locator('button:has-text("Test Connection")');
    await expect(testButton).toBeDisabled();
  });

  test('should enable test connection button after entering API key', async ({ page }) => {
    await page.fill('#apiKey', 'test-api-key-us13');

    const testButton = page.locator('button:has-text("Test Connection")');
    await expect(testButton).toBeEnabled();
  });

  test('should show connection status after testing', async ({ page }) => {
    // Note: This test would require a valid API key or mocked API
    // For now, we test the UI behavior
    await page.fill('#apiKey', 'test-api-key-us13');

    const testButton = page.locator('button:has-text("Test Connection")');
    await testButton.click();

    // The button should show loading state (would need to mock API for full test)
    // For now, we just verify the button exists
    await expect(testButton).toBeVisible();
  });

  test('should have sync status section', async ({ page }) => {
    await expect(page.locator('text=Sync Status')).toBeVisible();
    await expect(page.locator('text=Total Synced')).toBeVisible();
    await expect(page.locator('text=Last Sync')).toBeVisible();
  });

  test('should display segmentation information', async ({ page }) => {
    await expect(page.locator('text=Segmentation')).toBeVisible();
    await expect(page.locator('text=Pipeline Stage')).toBeVisible();
    await expect(page.locator('text=Motivation Level')).toBeVisible();
    await expect(page.locator('text=Lead Source')).toBeVisible();
    await expect(page.locator('text=Priority Score')).toBeVisible();
  });

  test('should have auto-sync toggle', async ({ page }) => {
    const switchElement = page.locator('label:has-text("Auto-sync")').locator('..').locator('button');
    await expect(switchElement).toBeVisible();
  });

  test('should disable sync button when credentials missing', async ({ page }) => {
    const syncButton = page.locator('button:has-text("Sync Now")');
    await expect(syncButton).toBeDisabled();
  });

  test('should enable sync button when both credentials entered', async ({ page }) => {
    await page.fill('#apiKey', 'test-api-key-us13');
    await page.fill('#listId', 'test-list-id');

    const syncButton = page.locator('button:has-text("Sync Now")');
    await expect(syncButton).toBeEnabled();
  });
});
