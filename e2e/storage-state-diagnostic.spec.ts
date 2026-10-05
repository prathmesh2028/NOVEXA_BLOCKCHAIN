import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';

test.describe('Storage State Diagnostic', () => {
  test('Check if storage state auth works', async ({ browser }) => {
    // Load the storage state
    const context = await browser.newContext({
      storageState: '.auth/procurement-storage.json'
    });

    const page = await context.newPage();

    // Go directly to dashboard
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());

    // Check if we're on dashboard or redirected to login
    const isDashboard = page.url().includes('/app/dashboard');
    const isLogin = page.url().includes('/login');

    console.log('Is on dashboard:', isDashboard);
    console.log('Is on login:', isLogin);

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return {
        kavach_token: localStorage.getItem('kavach_token'),
        kavach_user: localStorage.getItem('kavach_user'),
      };
    });

    console.log('localStorage:', JSON.stringify(localStorage));

    // Take screenshot
    await page.screenshot({ path: 'storage-state-diagnostic.png', fullPage: true });

    await page.close();
    await context.close();

    expect(isDashboard).toBe(true);
    expect(isLogin).toBe(false);
  });
});
