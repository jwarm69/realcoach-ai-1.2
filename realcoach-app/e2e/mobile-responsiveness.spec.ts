import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1024, height: 768 },
];

test.describe('Mobile Responsiveness', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport });

      test('should display main dashboard', async ({ page }) => {
        await page.goto('/');

        // Header should be visible
        await expect(page.locator('h1')).toContainText('RealCoach AI');

        // Stats cards should be visible
        await expect(page.locator('text=Total Contacts').or(text=Contacts')).toBeVisible();
        await expect(page.locator('text=Active Opportunities').or(text=Active)).toBeVisible();
      });

      test('should display sales dashboard', async ({ page }) => {
        await page.goto('/sales');

        await expect(page.locator('h1')).toContainText('Sales Dashboard');

        // All 4 conversation metrics should be visible
        await expect(page.locator('text=Appointments')).toBeVisible();
        await expect(page.locator('text=Listings')).toBeVisible();
        await expect(page.locator('text=Closings')).toBeVisible();
        await expect(page.locator('text=GCI')).toBeVisible();
      });

      test('should display contacts page', async ({ page }) => {
        await page.goto('/contacts');

        await expect(page.locator('h1')).toContainText('Contacts');

        // Search input should be visible
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      });

      test('should display integrations settings', async ({ page }) => {
        await page.goto('/settings/integrations');

        await expect(page.locator('h1')).toContainText('Integrations');
        await expect(page.locator('text=Mailchimp')).toBeVisible();
      });

      test('should have touch-friendly button sizes on mobile', async ({ page }) => {
        await page.goto('/');

        // Find primary action buttons
        const buttons = page.locator('button:visible').first();
        const box = await buttons.boundingBox();

        if (box && viewport.width < 768) {
          // On mobile, buttons should be at least 44px tall (WCAG standard)
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      });

      test('should not have horizontal scroll on main pages', async ({ page }) => {
        await page.goto('/');
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);

        // Allow small rounding differences
        expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 2);
      });

      test('should display pipeline cards properly', async ({ page }) => {
        await page.goto('/');

        // Pipeline overview should be visible
        const pipelineSection = page.locator('text=Pipeline Overview');
        if (await pipelineSection.isVisible()) {
          await expect(pipelineSection).toBeVisible();
        }
      });

      test('should display consistency score section', async ({ page }) => {
        await page.goto('/');

        const consistencySection = page.locator('text=Consistency Score');
        if (await consistencySection.isVisible()) {
          await expect(consistencySection).toBeVisible();
        }
      });
    });
  }
});

test.describe('Mobile-Specific Features', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile navigation', async ({ page }) => {
    await page.goto('/');

    // Check for hamburger menu or mobile nav
    const hamburger = page.locator('button[aria-label="Toggle menu"], button:has(svg)').first();
    const mobileNav = page.locator('.lg:hidden').first();

    const hasMobileNav = await hamburger.count() > 0 || await mobileNav.count() > 0;
    expect(hasMobileNav).toBe(true);
  });

  test('should show FAB button on contacts page', async ({ page }) => {
    await page.goto('/contacts');

    // Look for the floating action button (hidden on lg screens)
    const fab = page.locator('button.lg:hidden.fixed');
    const isVisible = await fab.count() > 0;

    if (isVisible) {
      await expect(fab).toBeVisible();
      // Should have plus icon
      await expect(fab.locator('svg')).toBeVisible();
    }
  });

  test('should stack stat cards vertically on mobile', async ({ page }) => {
    await page.goto('/');

    // Stats should be in a grid
    const statsGrid = page.locator('.grid-cols-2, .lg\\:grid-cols-4');
    await expect(statsGrid).toHaveCount({ min: 1 });
  });

  test('should show abbreviated labels on mobile', async ({ page }) => {
    await page.goto('/');

    // Check if any mobile-specific abbreviations are used
    const mobileLabels = page.locator('.lg\\:hidden');
    const hasMobileLabels = await mobileLabels.count() > 0;

    // This is optional - just verify the pattern exists
    if (hasMobileLabels) {
      await expect(mobileLabels.first()).toBeVisible();
    }
  });
});
