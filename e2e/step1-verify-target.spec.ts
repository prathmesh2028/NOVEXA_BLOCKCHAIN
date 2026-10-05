import { test, expect } from '@playwright/test';

test.describe('STEP 1: Verify Playwright Target', () => {
  test('Capture page state before any interaction', async ({ page }) => {
    await page.goto('http://localhost:8443');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Capture basic info
    const url = page.url();
    const title = await page.title();
    const bodyText = await page.locator('body').innerText();
    
    console.log('='.repeat(80));
    console.log('STEP 1: PAGE STATE CAPTURE');
    console.log('='.repeat(80));
    console.log('URL:', url);
    console.log('Title:', title);
    console.log('Body Text (first 2000 chars):');
    console.log(bodyText.substring(0, 2000));
    console.log('='.repeat(80));
    
    // Verify it's KavachTrust, not Figma Make
    expect(title).toContain('NOVEXA');
    expect(title).toContain('Defence');
  });
});
