import { test, expect } from '@playwright/test';

test.describe('DEMO DATA DROPDOWN', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Open demo data dropdown and check options', async ({ page }) => {
    console.log('\n=== DEMO DATA DROPDOWN ===\n');

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
    await page.waitForTimeout(2000);

    // Load demo data
    await page.click('text=LOAD DEMO DATA');
    await page.waitForTimeout(3000);

    // Click demo data dropdown
    console.log('Clicking Demo Data dropdown...');
    await page.click('text=Demo Data');
    await page.waitForTimeout(1000);

    const bodyText = await page.locator('body').innerText();
    console.log('After opening dropdown:');
    console.log('Page contains CERT-2026-24767:', bodyText.includes('CERT-2026-24767'));
    console.log('Page contains RBAC-TEST-001:', bodyText.includes('RBAC-TEST-001'));

    // Get all dropdown options
    const dropdownItems = await page.locator('[role="option"], li, [class*="dropdown"] div').all();
    console.log('Dropdown items found:', dropdownItems.length);

    for (let i = 0; i < Math.min(dropdownItems.length, 10); i++) {
      const item = dropdownItems[i];
      const text = await item.innerText();
      if (text.trim().length > 0 && text.trim().length < 100) {
        console.log(`Option ${i}: "${text.trim()}"`);
      }
    }
  });
});
