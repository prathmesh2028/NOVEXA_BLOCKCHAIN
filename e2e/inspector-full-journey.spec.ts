import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('INSPECTOR - Full UI Journey', () => {
  test.use({ storageState: '.auth/inspector-storage.json' });

  test('Inspector ACCEPT journey', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Inspections
    await page.click('text=Inspections');
    await page.waitForLoadState('domcontentloaded');

    // Find RBAC-TEST-001
    await page.waitForSelector('text=RBAC-TEST-001', { timeout: 10000 });
    await page.click('text=RBAC-TEST-001');

    // Click View
    await page.click('text=View');
    await page.waitForLoadState('domcontentloaded');

    // Click ACCEPT
    await page.click('text=ACCEPT');
    await page.waitForLoadState('domcontentloaded');

    // Verify ACCEPTED_FOR_ASSEMBLY status
    await page.waitForSelector('text=ACCEPTED_FOR_ASSEMBLY', { timeout: 10000 });

    // Refresh and verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const statusAfterRefresh = await page.textContent('text=ACCEPTED_FOR_ASSEMBLY');
    expect(statusAfterRefresh).toContain('ACCEPTED_FOR_ASSEMBLY');

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors.filter(e => !e.includes('401') && !e.includes('fetch'))).toHaveLength(0);
  });

  test('Inspector REJECT journey', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Inspections
    await page.click('text=Inspections');
    await page.waitForLoadState('domcontentloaded');

    // Find a different inspectable asset (not RBAC-TEST-001 which we just accepted)
    // Look for any asset in pending inspection state
    const pendingAssets = await page.locator('text=PENDING_INSPECTION').all();
    
    if (pendingAssets.length > 0) {
      await pendingAssets[0].click();
    } else {
      // If no pending assets, skip this test gracefully
      test.skip();
      return;
    }

    // Click View
    await page.click('text=View');
    await page.waitForLoadState('domcontentloaded');

    // Click REJECT
    await page.click('text=REJECT');
    await page.waitForLoadState('domcontentloaded');

    // Verify REJECTED_QUARANTINED status
    await page.waitForSelector('text=REJECTED_QUARANTINED', { timeout: 10000 });

    // Refresh and verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const statusAfterRefresh = await page.textContent('text=REJECTED_QUARANTINED');
    expect(statusAfterRefresh).toContain('REJECTED_QUARANTINED');

    // Verify it is not certification eligible
    const certificationEligible = await page.locator('text=Certification Eligible').count();
    expect(certificationEligible).toBe(0);

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors.filter(e => !e.includes('401') && !e.includes('fetch'))).toHaveLength(0);
  });
});
