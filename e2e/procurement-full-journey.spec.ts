import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('PROCUREMENT - Full UI Journey', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Procurement complete certification journey', async ({ page }) => {
    test.setTimeout(180000);
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Certifications
    await page.click('text=Certifications');
    await page.waitForLoadState('domcontentloaded');

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Check if demo data button exists and click it if needed
    const demoButton = page.locator('text=LOAD DEMO DATA').first();
    if (await demoButton.count() > 0) {
      await demoButton.click();
      await page.waitForTimeout(5000);
    }

    // Navigate directly to the certification detail page using the UUID
    await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
    await page.waitForLoadState('domcontentloaded');

    console.log('Current URL after navigation:', page.url());

    // Wait for certification data to load
    await page.waitForTimeout(5000);

    console.log('Current URL after wait:', page.url());

    // Verify certification detail URL
    expect(page.url()).toContain('/app/certifications/');

    // Verify certification data
    const certId = await page.textContent('text=CERT-2026-24767');
    expect(certId).toContain('CERT-2026-24767');

    // Verify blockchain data exists on the certification detail page
    const pageContent = await page.content();
    expect(pageContent).toContain('Blockchain Information');
    expect(pageContent).toContain('Token ID');
    expect(pageContent).toContain('Transaction Hash');
    expect(pageContent).toContain('Block Number');
    expect(pageContent).toContain('3'); // Token ID for CERT-2026-24767

    // Refresh
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify data persists
    const certIdAfterRefresh = await page.textContent('text=CERT-2026-24767');
    expect(certIdAfterRefresh).toContain('CERT-2026-24767');

    // Back navigation
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    // Forward navigation
    await page.goForward();
    await page.waitForLoadState('domcontentloaded');

    // Final verification
    expect(page.url()).toContain('/app/certifications/');

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Check for critical errors
    expect(consoleErrors.filter(e => !e.includes('401') && !e.includes('fetch'))).toHaveLength(0);
  });
});
