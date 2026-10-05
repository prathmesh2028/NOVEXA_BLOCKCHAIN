import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('SEARCH WORKFLOW', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Search functionality', async ({ page }) => {
    // Navigate to certifications
    await page.goto(`${BASE_URL}/app/certifications`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Look for search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      // Search for CERT-2026-24767
      await searchInput.fill('CERT-2026-24767');
      await page.waitForTimeout(2000);

      // Verify search results
      const searchResults = await page.content();
      console.log('Search results contain CERT-2026-24767:', searchResults.includes('CERT-2026-24767'));
      expect(searchResults).toContain('CERT-2026-24767');
    } else {
      console.log('Search input not found');
    }
  });
});
