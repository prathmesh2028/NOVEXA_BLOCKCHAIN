import { test, expect } from '@playwright/test';

test.describe('BLOCKCHAIN PAGE REAL DATA VERIFICATION', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Login then navigate to blockchain page and verify real data', async ({ page }) => {
    console.log('\n=== BLOCKCHAIN PAGE REAL DATA ===\n');

    // Login as Procurement
    await page.goto(BASE_URL + '/login');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Navigate to blockchain page
    await page.goto(BASE_URL + '/app/blockchain');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const fullText = await page.locator('body').innerText();
    console.log('Blockchain page text (first 2000 chars):');
    console.log(fullText.substring(0, 2000));

    console.log('\nChecking for synthetic data:');
    console.log('Contains 0x742d35Cc:', fullText.includes('0x742d35Cc'));
    console.log('Contains SYNTHETIC DEMO NETWORK:', fullText.includes('SYNTHETIC DEMO NETWORK'));
    console.log('Contains SYNTHETIC DEMO NETWORK (case insensitive):', fullText.toLowerCase().includes('synthetic demo network'));

    console.log('\nChecking for real data:');
    console.log('Contains 0xDc64:', fullText.includes('0xDc64'));
    console.log('Contains 0xea569f48:', fullText.includes('0xea569f48'));
    console.log('Contains 17156:', fullText.includes('17156'));
    console.log('Contains Token 3:', fullText.includes('Token 3'));
    console.log('Contains token 3:', fullText.includes('token 3'));
  });
});
