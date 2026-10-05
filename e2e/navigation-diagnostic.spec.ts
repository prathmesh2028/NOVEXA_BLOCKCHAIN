import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';

test.describe('Navigation Diagnostic', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Test navigation to certification detail', async ({ page }) => {
    test.setTimeout(60000);
    // Start at dashboard
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    console.log('Dashboard URL:', page.url());

    // Navigate to certifications list
    await page.goto(`${BASE_URL}/app/certifications`);
    await page.waitForLoadState('domcontentloaded');
    console.log('Certifications list URL:', page.url());

    // Wait for list to load
    await page.waitForTimeout(3000);

    // Check what's in the list
    const pageContent = await page.content();
    console.log('Has CERT-2026-24767 in list:', pageContent.includes('CERT-2026-24767'));
    console.log('Has View Details:', pageContent.includes('View Details'));

    // Click on View Details for the certification
    await page.click('text=View Details');
    await page.waitForLoadState('domcontentloaded');
    console.log('After clicking View Details URL:', page.url());

    // Wait a bit
    await page.waitForTimeout(3000);
    console.log('Final URL:', page.url());

    // Check if we're on the detail page
    const content = await page.content();
    console.log('Has CERT-2026-24767:', content.includes('CERT-2026-24767'));
    console.log('Has Blockchain Information:', content.includes('Blockchain Information'));

    await page.screenshot({ path: 'navigation-diagnostic.png', fullPage: true });
  });
});
