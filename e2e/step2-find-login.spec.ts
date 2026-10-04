import { test, expect } from '@playwright/test';

test.describe('STEP 2: Find Login Elements', () => {
  test('Find login button or route', async ({ page }) => {
    await page.goto('http://localhost:8443');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('='.repeat(80));
    console.log('STEP 2: FINDING LOGIN ELEMENTS');
    console.log('='.repeat(80));
    
    // Check for login button or link
    const loginLinks = await page.locator('a').all();
    console.log('Found', loginLinks.length, 'links');
    
    for (let i = 0; i < Math.min(5, loginLinks.length); i++) {
      const link = loginLinks[i];
      const text = await link.innerText();
      const href = await link.getAttribute('href');
      console.log(`Link ${i}: text="${text.trim()}" href="${href}"`);
    }
    
    // Check for login button
    const buttons = await page.locator('button').all();
    console.log('Found', buttons.length, 'buttons');
    
    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const btn = buttons[i];
      const text = await btn.innerText();
      console.log(`Button ${i}: text="${text.trim()}"`);
    }
    
    // Try to navigate to /login
    await page.goto('http://localhost:8443/login');
    await page.waitForLoadState('domcontentloaded');
    
    const loginTitle = await page.title();
    const loginUrl = page.url();
    const loginBody = await page.locator('body').innerText();
    
    console.log('Login URL:', loginUrl);
    console.log('Login Title:', loginTitle);
    console.log('Login Body (first 1000 chars):');
    console.log(loginBody.substring(0, 1000));
    console.log('='.repeat(80));
  });
});
