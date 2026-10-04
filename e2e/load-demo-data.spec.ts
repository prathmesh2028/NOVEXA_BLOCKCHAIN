import { test, expect } from '@playwright/test';

test.describe('LOAD DEMO DATA THEN VERIFY', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Load demo data then check for CERT-2026-24767', async ({ page }) => {
    console.log('\n=== LOAD DEMO DATA ===\n');

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

    // Click "LOAD DEMO DATA"
    console.log('Clicking LOAD DEMO DATA button...');
    await page.click('text=LOAD DEMO DATA');
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText();
    console.log('After loading demo data:');
    console.log('Page contains CERT-2026-24767:', bodyText.includes('CERT-2026-24767'));
    console.log('Page contains View Details:', bodyText.includes('View Details'));
    console.log('Page contains Blockchain Proof:', bodyText.includes('Blockchain Proof'));

    // Look for certification cards
    const certButtons = await page.locator('button').all();
    console.log('Total buttons after load:', certButtons.length);

    for (let i = 0; i < Math.min(certButtons.length, 15); i++) {
      const btn = certButtons[i];
      const text = await btn.innerText();
      if (text.trim().length > 0 && text.trim().length < 100) {
        console.log(`Button ${i}: "${text.trim()}"`);
      }
    }
  });
});
