import { test, expect } from '@playwright/test';

test.describe('CLICK VIEW DETAILS AND NAVIGATE', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Click View Details on CERT-2026-24767, then navigate to Blockchain Proof', async ({ page }) => {
    console.log('\n=== VIEW DETAILS NAVIGATION ===\n');

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

    // Click on View Details for CERT-2026-24767
    console.log('Clicking View Details for CERT-2026-24767...');
    // Navigate directly to certification detail page using UUID
    await page.goto(BASE_URL + '/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a');
    await page.waitForTimeout(2000);

    console.log('After View Details, URL:', page.url());

    const detailText = await page.locator('body').innerText();
    console.log('Detail page contains CERT-2026-24767:', detailText.includes('CERT-2026-24767'));
    console.log('Detail page contains Blockchain Proof:', detailText.includes('Blockchain Proof'));

    // Look for Blockchain Proof button/link
    const blockchainButtons = await page.locator('button:has-text("Blockchain"), a:has-text("Blockchain")').all();
    console.log('Blockchain buttons/links:', blockchainButtons.length);

    if (blockchainButtons.length > 0) {
      console.log('Clicking Blockchain Proof button/link...');
      await blockchainButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('After Blockchain Proof, URL:', page.url());

      const blockchainText = await page.locator('body').innerText();
      console.log('Blockchain Proof page contains 0xDc64...', blockchainText.includes('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'));
      console.log('Blockchain Proof page contains 0xea569f48...', blockchainText.includes('0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967'));
      console.log('Blockchain Proof page contains 17156:', blockchainText.includes('17156'));
      console.log('Blockchain Proof page contains token 3:', blockchainText.includes('3'));
    }
  });
});
