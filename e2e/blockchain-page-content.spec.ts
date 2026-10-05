import { test, expect } from '@playwright/test';

test.describe('BLOCKCHAIN PAGE FULL CONTENT', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Get full blockchain page content after navigation', async ({ page }) => {
    console.log('\n=== BLOCKCHAIN PAGE CONTENT ===\n');

    // Login as Procurement
    await page.goto(BASE_URL + '/login');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Navigate directly to certification detail
    await page.goto(BASE_URL + '/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a');
    await page.waitForTimeout(2000);

    // Click Blockchain
    await page.click('text=Blockchain');
    await page.waitForTimeout(2000);

    console.log('Blockchain page URL:', page.url());

    const fullText = await page.locator('body').innerText();
    console.log('Full blockchain page text (first 3000 chars):');
    console.log(fullText.substring(0, 3000));

    console.log('\nSearching for blockchain values:');
    console.log('Contains 0xDc64:', fullText.includes('0xDc64'));
    console.log('Contains 0xea569f48:', fullText.includes('0xea569f48'));
    console.log('Contains 17156:', fullText.includes('17156'));
    console.log('Contains Token 3:', fullText.includes('Token 3'));
    console.log('Contains token 3:', fullText.includes('token 3'));
  });
});
