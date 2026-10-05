import { test, expect } from '@playwright/test';

test.describe('STEP 4: Dashboard Structure', () => {
  test('Capture dashboard after login', async ({ page }) => {
    await page.goto('http://localhost:8443/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Arjun Mehta');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/app\/dashboard/, { timeout: 60000 });
    await page.waitForTimeout(2000);
    
    console.log('='.repeat(80));
    console.log('STEP 4: DASHBOARD STRUCTURE');
    console.log('='.repeat(80));
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    
    // Capture all links
    const links = page.locator('a').all();
    console.log('Links found:', await links.length);
    for (let i = 0; i < Math.min(10, await links.length); i++) {
      const link = links[i];
      const text = await link.innerText();
      const href = await link.getAttribute('href');
      console.log(`  Link ${i}: "${text.trim()}" -> ${href}`);
    }
    
    // Capture all buttons
    const buttons = page.locator('button').all();
    console.log('Buttons found:', await buttons.length);
    for (let i = 0; i < Math.min(10, await buttons.length); i++) {
      const btn = buttons[i];
      const text = await btn.innerText();
      console.log(`  Button ${i}: "${text.trim()}"`);
    }
    
    // Capture all visible text
    const bodyText = await page.locator('body').innerText();
    console.log('Visible text (first 2000 chars):');
    console.log(bodyText.substring(0, 2000));
    console.log('='.repeat(80));
  });
});
