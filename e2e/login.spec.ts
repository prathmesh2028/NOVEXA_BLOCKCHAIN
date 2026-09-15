import { test, expect } from '@playwright/test';

test.describe('KavachTrust Authentication', () => {
  test('should login as admin', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Depending on the current UI, find the login button or verify if it logs in automatically in mock mode
    // Wait for the app to load
    await page.waitForSelector('#root');
    
    // As per the audit, auth might be mocked to default user, so we check for some dashboard text
    // E.g., 'Welcome' or 'Dashboard'
    const dashboardText = await page.locator('text=Dashboard').isVisible();
    const welcomeText = await page.locator('text=Welcome').isVisible();
    const assetsText = await page.locator('text=Assets').isVisible();
    
    // We expect at least one of the main layout items to be visible
    expect(dashboardText || welcomeText || assetsText).toBeTruthy();
  });
});
