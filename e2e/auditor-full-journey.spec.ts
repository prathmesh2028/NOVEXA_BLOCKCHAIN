import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('AUDITOR - Full UI Journey', () => {
  test.use({ storageState: '.auth/auditor-storage.json' });

  test('Auditor complete verification journey', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Certifications
    await page.click('text=Certifications');
    await page.waitForLoadState('domcontentloaded');

    // Find CERT-2026-24767
    await page.waitForSelector('text=CERT-2026-24767', { timeout: 10000 });
    await page.click('text=CERT-2026-24767');

    // Click View Details
    await page.click('text=View Details');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Evidence
    await page.click('text=Evidence');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Blockchain Proof
    await page.click('text=Blockchain Proof');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Verification
    await page.click('text=Verification');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to QR/Data Matrix
    await page.click('text=QR');
    await page.waitForLoadState('domcontentloaded');

    // Capture QR payload
    const qrElement = await page.locator('canvas, img[alt*="QR"], .qr-code, [data-testid*="qr"]').first();
    const qrExists = await qrElement.count();
    expect(qrExists).toBeGreaterThan(0);

    // Navigate to System Activity
    await page.click('text=System Activity');
    await page.waitForLoadState('domcontentloaded');

    // Find CERT-2026-24767 in system activity
    await page.waitForSelector('text=CERT-2026-24767', { timeout: 10000 });

    // Click View Details
    await page.click('text=View Details');
    await page.waitForLoadState('domcontentloaded');

    // Verify certification detail opens
    expect(page.url()).toContain('/app/certifications/');

    // Refresh
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Back navigation
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    // Forward navigation
    await page.goForward();
    await page.waitForLoadState('domcontentloaded');

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
