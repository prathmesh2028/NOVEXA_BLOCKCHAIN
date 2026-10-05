import { test, expect } from '@playwright/test';

test.describe('UI Debug - Step by Step', () => {
  const BASE_URL = 'http://localhost:8443';
  
  test('Step 1: Load login page', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    
    const bodyText = await page.locator('body').innerText();
    console.log('Body text (first 500 chars):', bodyText.substring(0, 500));
    
    // Verify demo accounts exist
    const arjun = page.locator('text=Arjun Mehta');
    expect(await arjun.isVisible()).toBeTruthy();
  });
  
  test('Step 2: Click Arjun Mehta', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    
    await page.click('text=Arjun Mehta');
    await page.waitForTimeout(1000);
    
    console.log('After clicking Arjun Mehta - URL:', page.url());
    
    // Check if submit button is enabled
    const submitBtn = page.locator('button[type="submit"]');
    console.log('Submit button visible:', await submitBtn.isVisible());
    console.log('Submit button disabled:', await submitBtn.isDisabled());
  });
  
  test('Step 3: Submit login', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    
    await page.click('text=Arjun Mehta');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    
    console.log('After submit - URL:', page.url());
    
    // Wait for URL change with generous timeout
    try {
      await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
      console.log('Successfully navigated to dashboard');
    } catch (e) {
      console.log('Failed to navigate to dashboard within 30s');
      console.log('Current URL:', page.url());
      console.log('Current title:', await page.title());
      
      const bodyText = await page.locator('body').innerText();
      console.log('Body text (first 1000 chars):', bodyText.substring(0, 1000));
      
      throw e;
    }
  });
  
  test('Step 4: Check dashboard content', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    
    await page.click('text=Arjun Mehta');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('Dashboard URL:', page.url());
    
    const bodyText = await page.locator('body').innerText();
    console.log('Dashboard body text (first 1000 chars):', bodyText.substring(0, 1000));
    
    // Check for specific navigation elements
    const exploreRegistry = page.locator('text=Explore Registry');
    console.log('Explore Registry visible:', await exploreRegistry.isVisible());
    
    const viewCertifications = page.locator('text=View Certifications');
    console.log('View Certifications visible:', await viewCertifications.isVisible());
  });
});
