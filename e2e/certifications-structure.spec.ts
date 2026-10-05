import { test, expect } from '@playwright/test';

test.describe('CERTIFICATIONS PAGE STRUCTURE', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Inspect actual certifications list structure', async ({ page }) => {
    console.log('\n=== CERTIFICATIONS STRUCTURE ===\n');

    // Login as Procurement
    await page.goto(BASE_URL + '/login');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Go to certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Get all buttons
    const buttons = await page.locator('button').all();
    console.log('Total buttons:', buttons.length);

    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const btn = buttons[i];
      const text = await btn.innerText();
      console.log(`Button ${i}: "${text.trim()}"`);
    }

    // Get all links
    const links = await page.locator('a').all();
    console.log('\nTotal links:', links.length);

    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const link = links[i];
      const text = await link.innerText();
      const href = await link.getAttribute('href');
      console.log(`Link ${i}: "${text.trim()}" -> ${href}`);
    }

    // Look for table rows
    const tableRows = await page.locator('tr').all();
    console.log('\nTotal table rows:', tableRows.length);

    // Look for cards/divs
    const cards = await page.locator('div').all();
    console.log('Total divs:', cards.length);

    // Check for "View Details" text
    const bodyText = await page.locator('body').innerText();
    console.log('\nPage contains "View Details":', bodyText.includes('View Details'));
    console.log('Page contains "CERT-2026-24767":', bodyText.includes('CERT-2026-24767'));
    console.log('Page contains "1":', bodyText.includes('1'));
  });
});
