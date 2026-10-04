import { test, expect } from '@playwright/test';

test.describe('PROCUREMENT COMPLETE FLOW', () => {
  const BASE_URL = 'http://localhost:8443';
  const API_URL = 'http://localhost:8000/api/v1';

  test('Procurement flow: Certifications → CERT-2026-24767 → View Details → Blockchain Proof', async ({ page, request }) => {
    console.log('\n=== PROCUREMENT FLOW ===\n');

    // Login via API
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'p.sharma@bel-defence.in', password: 'password' }
    });
    const loginData = await loginRes.json();

    // Set localStorage
    await page.goto(BASE_URL);
    await page.evaluate(({ token }) => {
      localStorage.setItem('kavach_token', token);
    }, { token: loginData.access_token });

    await page.evaluate(() => {
      localStorage.setItem('kavach_user', JSON.stringify({
        id: 'usr-002',
        email: 'p.sharma@bel-defence.in',
        name: 'Priya Sharma',
        roles: ['PROCUREMENT_SUPPLY_CHAIN_OFFICER']
      }));
    });

    // Navigate to Certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const certsText = await page.locator('body').innerText();
    console.log('Certifications page contains CERT-2026-24767:', certsText.includes('CERT-2026-24767'));

    // Look for Demo Data button
    const demoButton = page.locator('text=Demo Data').first();
    if (await demoButton.isVisible()) {
      console.log('Clicking Demo Data button');
      await demoButton.click();
      await page.waitForTimeout(3000);
    }

    // Navigate directly to blockchain page to verify real data
    await page.goto(BASE_URL + '/app/blockchain');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    const blockchainText = await page.locator('body').innerText();
    console.log('\nBlockchain page (Procurement):');
    console.log('Contains 0xDc64:', blockchainText.includes('0xDc64'));
    console.log('Contains 0xea569f48:', blockchainText.includes('0xea569f48'));
    console.log('Contains 17,156:', blockchainText.includes('17,156'));
    console.log('Contains token 3:', blockchainText.includes('token 3') || blockchainText.includes('Token 3') || blockchainText.includes('3'));
    console.log('Contains synthetic contract 0x742d35Cc:', blockchainText.includes('0x742d35Cc'));
    console.log('Contains SYNTHETIC DEMO NETWORK:', blockchainText.includes('SYNTHETIC DEMO NETWORK'));
  });
});
