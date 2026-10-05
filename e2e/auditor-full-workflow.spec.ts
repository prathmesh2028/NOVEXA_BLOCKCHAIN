import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('AUDITOR - FULL WORKFLOW', () => {
  test.use({ storageState: '.auth/auditor-storage.json' });

  test('Auditor complete verification workflow', async ({ page }) => {
    // Navigate directly to certification detail
    await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Verify certification detail loaded
    expect(page.url()).toContain('/app/certifications');
    const certId = await page.textContent('text=CERT-2026-24767');
    expect(certId).toContain('CERT-2026-24767');

    // Check for Evidence section
    const pageContent = await page.content();
    console.log('Has Evidence:', pageContent.includes('Evidence'));
    console.log('Has Blockchain Information:', pageContent.includes('Blockchain Information'));

    // Verify blockchain data
    expect(pageContent).toContain('Blockchain Information');
    expect(pageContent).toContain('Token ID');
    expect(pageContent).toContain('Transaction Hash');
    expect(pageContent).toContain('Block Number');

    // Check for Verification Center
    console.log('Has Verification:', pageContent.includes('Verification'));

    // Check for QR/Data Matrix
    console.log('Has QR:', pageContent.includes('QR') || pageContent.includes('Data Matrix'));
    expect(pageContent).toContain('QR');

    // Navigate to System Activity
    await page.goto(`${BASE_URL}/app/system-activity`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Verify System Activity loaded
    const activityContent = await page.content();
    console.log('Has System Activity:', activityContent.includes('System Activity'));
    console.log('Has View Details:', activityContent.includes('View Details'));

    // Try to click View Details if available
    const viewDetailsButton = page.locator('text=View Details').first();
    if (await viewDetailsButton.count() > 0) {
      await viewDetailsButton.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      console.log('View Details clicked successfully');
    }
  });
});
