import { test, expect } from '@playwright/test';

test.describe('BLOCKCHAIN PAGE WITH AUTH TOKEN', () => {
  const BASE_URL = 'http://localhost:8443';
  const API_URL = 'http://localhost:8000/api/v1';

  test('Use storage state to test blockchain page with auth', async ({ page, request }) => {
    console.log('\n=== BLOCKCHAIN PAGE WITH AUTH ===\n');

    // Login via API
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const loginData = await loginRes.json();

    // Set localStorage
    await page.goto(BASE_URL);
    await page.evaluate(({ token }) => {
      localStorage.setItem('kavach_token', token);
    }, { token: loginData.access_token });

    // Set user in localStorage (from previous test)
    await page.evaluate(() => {
      localStorage.setItem('kavach_user', JSON.stringify({
        id: 'usr-001',
        email: 'a.mehta@bel-defence.in',
        name: 'Arjun Mehta',
        roles: ['SYSTEM_ADMIN']
      }));
    });

    // Navigate to blockchain page
    await page.goto(BASE_URL + '/app/blockchain');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(10000);

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
    console.log('Contains 17,156:', fullText.includes('17,156'));
    console.log('Contains 17156:', fullText.includes('17156'));
    console.log('Contains Token 3:', fullText.includes('Token 3'));
    console.log('Contains token 3:', fullText.includes('token 3'));
  });
});
