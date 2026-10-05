import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';

test.describe('Certification Detail Content Diagnostic', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Check what links/buttons exist on certification detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/certifications/CERT-2026-24767`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Get all links
    const links = await page.locator('a').all();
    console.log('Total links found:', links.length);

    for (let i = 0; i < Math.min(links.length, 20); i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      console.log(`Link ${i}: text="${text?.trim()}" href="${href}"`);
    }

    // Get all buttons
    const buttons = await page.locator('button').all();
    console.log('Total buttons found:', buttons.length);

    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const text = await buttons[i].textContent();
      console.log(`Button ${i}: "${text?.trim()}"`);
    }

    // Get all text containing "blockchain" (case insensitive)
    const blockchainTexts = await page.locator('text=/blockchain/i').all();
    console.log('Blockchain text elements:', blockchainTexts.length);

    for (let i = 0; i < Math.min(blockchainTexts.length, 10); i++) {
      const text = await blockchainTexts[i].textContent();
      console.log(`Blockchain text ${i}: "${text?.trim()}"`);
    }

    // Take screenshot
    await page.screenshot({ path: 'cert-detail-content.png', fullPage: true });
  });
});
