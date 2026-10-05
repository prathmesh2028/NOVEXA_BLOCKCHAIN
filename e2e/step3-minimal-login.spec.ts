import { test, expect } from '@playwright/test';

test.describe('STEP 3: Minimal Login Test', () => {
  test('Admin login with full capture', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('CONSOLE ERROR:', msg.text());
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
        console.log('CONSOLE WARNING:', msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('PAGE ERROR:', error.message);
    });
    
    // Capture network failures
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    console.log('='.repeat(80));
    console.log('STEP 3: MINIMAL LOGIN TEST');
    console.log('='.repeat(80));
    
    // Navigate to login
    await page.goto('http://localhost:8443/login');
    await page.waitForLoadState('domcontentloaded');
    console.log('✓ Login page loaded');
    
    // Wait for demo cards to be visible
    await page.waitForTimeout(2000);
    
    // Find and click admin card
    console.log('Clicking admin card...');
    const adminCard = page.locator('text=Arjun Mehta');
    await adminCard.click();
    console.log('✓ Admin card clicked');
    
    await page.waitForTimeout(500);
    
    // Click submit button
    console.log('Clicking submit button...');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    console.log('✓ Submit button clicked');
    
    // Wait for navigation - but don't timeout immediately
    console.log('Waiting for navigation...');
    
    try {
      // Wait for URL to change or dashboard to appear
      await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
      console.log('✓ Navigation successful');
      console.log('Current URL:', page.url());
    } catch (e) {
      console.log('✗ Navigation failed or timeout');
      console.log('Current URL:', page.url());
      console.log('Current title:', await page.title());
      
      // Capture page state
      const bodyText = await page.locator('body').innerText();
      console.log('Page body (first 500 chars):');
      console.log(bodyText.substring(0, 500));
      
      // Check for error messages
      const errorBanner = page.locator('.cmd-error-banner, [role="alert"]');
      if (await errorBanner.isVisible()) {
        console.log('Error banner visible:', await errorBanner.innerText());
      }
      
      throw e;
    }
    
    // Report errors
    console.log('='.repeat(80));
    console.log('CONSOLE ERRORS:', errors.length);
    console.log('CONSOLE WARNINGS:', warnings.length);
    console.log('='.repeat(80));
    
    expect(errors.length).toBe(0);
  });
});
