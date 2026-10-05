import { test, expect } from '@playwright/test';

test.describe('ROLE GUARD DEBUG', () => {
  const BASE_URL = 'http://localhost:8443';

  test('DEBUG: Procurement role in AuthContext', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get the actual role from AuthContext via console
    const role = await page.evaluate(() => {
      // Access the React context if possible, or check window
      return (window as any).__KAVACH_ROLE__ || 'NOT_FOUND';
    });
    
    console.log('Procurement - Role from window:', role);

    // Try to navigate to blockchain-proof
    await page.goto(BASE_URL + '/app/blockchain-proof');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    console.log('Procurement - After navigation to blockchain-proof:', currentURL);
  });

  test('DEBUG: Auditor role in AuthContext', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Deepa Nair');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to navigate to system-activity
    await page.goto(BASE_URL + '/app/system-activity');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    console.log('Auditor - After navigation to system-activity:', currentURL);
  });
});
