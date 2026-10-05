import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';

test.describe('Certifications Page Diagnostic', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Check certifications page rendering', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Certifications
    await page.click('text=Certifications');
    await page.waitForLoadState('domcontentloaded');

    // Wait a bit for data to load
    await page.waitForTimeout(5000);

    // Capture page content
    const content = await page.content();
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());

    // Check for various elements
    const hasLoading = content.includes('LOADING') || content.includes('Loading');
    const hasNoData = content.includes('NO CERTIFICATION RECORDS FOUND');
    const hasCards = content.includes('cert-card');
    const hasTable = content.includes('cert-table');
    const hasCertId = content.includes('CERT-2026-24767');
    const hasDemoButton = content.includes('LOAD DEMO DATA');

    console.log('Has loading indicator:', hasLoading);
    console.log('Has no data message:', hasNoData);
    console.log('Has cards:', hasCards);
    console.log('Has table:', hasTable);
    console.log('Has CERT-2026-24767:', hasCertId);
    console.log('Has Demo Data button:', hasDemoButton);

    // If demo data button exists, click it
    if (hasDemoButton) {
      console.log('Clicking Demo Data button...');
      await page.click('text=LOAD DEMO DATA');
      await page.waitForTimeout(3000);

      const contentAfterDemo = await page.content();
      const hasCertIdAfterDemo = contentAfterDemo.includes('CERT-2026-24767');
      console.log('Has CERT-2026-24767 after loading demo:', hasCertIdAfterDemo);

      await page.screenshot({ path: 'cert-page-after-demo.png', fullPage: true });
    }

    // Take screenshot
    await page.screenshot({ path: 'cert-page-diagnostic.png', fullPage: true });

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
