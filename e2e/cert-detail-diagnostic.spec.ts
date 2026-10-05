import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';

test.describe('Certification Detail Diagnostic', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Check certification detail page rendering', async ({ page }) => {
    // Navigate directly to the certification detail page
    await page.goto(`${BASE_URL}/app/certifications/CERT-2026-24767`);
    await page.waitForLoadState('domcontentloaded');

    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());

    // Wait a bit for data to load
    await page.waitForTimeout(5000);

    // Capture page content
    const content = await page.content();

    // Check for various elements
    const hasCertId = content.includes('CERT-2026-24767');
    const hasBlockchain = content.includes('Blockchain') || content.includes('blockchain');
    const has404 = content.includes('404');
    const hasFailed = content.includes('Failed to load');
    const hasLoading = content.includes('Loading') || content.includes('LOADING');

    console.log('Has CERT-2026-24767:', hasCertId);
    console.log('Has Blockchain:', hasBlockchain);
    console.log('Has 404:', has404);
    console.log('Has Failed to load:', hasFailed);
    console.log('Has Loading:', hasLoading);

    // Check if there's a blockchain tab or link
    const blockchainLinks = await page.locator('text=Blockchain Proof').all();
    console.log('Blockchain Proof links found:', blockchainLinks.length);

    // Check for blockchain tab in navigation
    const tabs = await page.locator('[role="tab"], .tab, .nav-item').allTextContents();
    console.log('Tabs:', tabs);

    // Take screenshot
    await page.screenshot({ path: 'cert-detail-diagnostic.png', fullPage: true });

    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit more to capture any errors
    await page.waitForTimeout(2000);

    console.log('Console errors:', consoleErrors);
  });
});
