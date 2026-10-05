import { test, expect } from '@playwright/test';

test.describe('Diagnostic: Frontend Loading', () => {
  test('Frontend loads at localhost:8443', async ({ page }) => {
    await page.goto('http://localhost:8443');
    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    console.log('Page title:', title);
    expect(title).toContain('NOVEXA');
  });

  test('Login page elements exist', async ({ page }) => {
    await page.goto('http://localhost:8443');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check for demo account cards
    const adminCard = page.locator('text=Arjun Mehta');
    console.log('Admin card visible:', await adminCard.isVisible());
    
    const procurementCard = page.locator('text=Priya Sharma');
    console.log('Procurement card visible:', await procurementCard.isVisible());
    
    const inspectorCard = page.locator('text=Rajesh Kumar');
    console.log('Inspector card visible:', await inspectorCard.isVisible());
    
    const auditorCard = page.locator('text=Deepa Nair');
    console.log('Auditor card visible:', await auditorCard.isVisible());
    
    // Check for submit button
    const submitBtn = page.locator('button[type="submit"]');
    console.log('Submit button visible:', await submitBtn.isVisible());
  });

  test('Test admin login click', async ({ page }) => {
    await page.goto('http://localhost:8443');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click admin card
    await page.click('text=Arjun Mehta');
    await page.waitForTimeout(1000);
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Wait for navigation (up to 30 seconds)
    try {
      await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
      console.log('Successfully navigated to dashboard');
      console.log('Current URL:', page.url());
    } catch (e) {
      console.log('Navigation failed. Current URL:', page.url());
      console.log('Page content:', await page.content());
      throw e;
    }
  });
});
