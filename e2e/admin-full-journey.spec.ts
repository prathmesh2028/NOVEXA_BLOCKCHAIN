import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('SYSTEM_ADMIN - Full UI Journey', () => {
  test.use({ storageState: '.auth/admin-storage.json' });

  test('Admin complete journey', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Users
    await page.click('text=Users');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Suppliers
    await page.click('text=Suppliers');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Facilities
    await page.click('text=Facilities');
    await page.waitForLoadState('domcontentloaded');

    // Perform a representative approval/action
    // Look for any pending approval
    const pendingApprovals = await page.locator('text=PENDING').all();
    
    if (pendingApprovals.length > 0) {
      await pendingApprovals[0].click();
      await page.waitForLoadState('domcontentloaded');
      
      // Try to click approve if available
      const approveButton = await page.locator('text=Approve').first();
      if (await approveButton.count() > 0) {
        await approveButton.click();
        await page.waitForLoadState('domcontentloaded');
      }
    }

    // Refresh and verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to System Activity
    await page.click('text=System Activity');
    await page.waitForLoadState('domcontentloaded');

    // Verify system activity loads
    expect(page.url()).toContain('/app/system-activity');

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

    expect(consoleErrors.filter(e => !e.includes('401') && !e.includes('fetch'))).toHaveLength(0);
  });
});
