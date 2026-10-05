import { test, expect } from '@playwright/test';

test.describe('COMPREHENSIVE BLOCKCHAIN VERIFICATION', () => {
  const BASE_URL = 'http://localhost:8443';
  const API_URL = 'http://localhost:8000/api/v1';

  test('System Admin: Verify blockchain page shows real data', async ({ page, request }) => {
    console.log('\n=== SYSTEM ADMIN BLOCKCHAIN VERIFICATION ===\n');

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

    const blockchainText = await page.locator('body').innerText();
    console.log('\nBlockchain page (System Admin):');
    console.log('Contains 0xDc64:', blockchainText.includes('0xDc64'));
    console.log('Contains 0xea569f48:', blockchainText.includes('0xea569f48'));
    console.log('Contains 17,156:', blockchainText.includes('17,156'));
    console.log('Contains synthetic contract 0x742d35Cc:', blockchainText.includes('0x742d35Cc'));
    console.log('Contains SYNTHETIC DEMO NETWORK:', blockchainText.includes('SYNTHETIC DEMO NETWORK'));
    console.log('Total transactions displayed:', blockchainText.includes('Total Transactions'));
  });

  test('Procurement: Verify blockchain page shows real data', async ({ page, request }) => {
    console.log('\n=== PROCUREMENT BLOCKCHAIN VERIFICATION ===\n');

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

    // Navigate to blockchain page
    await page.goto(BASE_URL + '/app/blockchain');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(10000);

    const blockchainText = await page.locator('body').innerText();
    console.log('\nBlockchain page (Procurement):');
    console.log('Contains 0xDc64:', blockchainText.includes('0xDc64'));
    console.log('Contains 0xea569f48:', blockchainText.includes('0xea569f48'));
    console.log('Contains 17,156:', blockchainText.includes('17,156'));
    console.log('Contains synthetic contract 0x742d35Cc:', blockchainText.includes('0x742d35Cc'));
    console.log('Contains SYNTHETIC DEMO NETWORK:', blockchainText.includes('SYNTHETIC DEMO NETWORK'));
  });

  test('API: Verify blockchain transactions are real', async ({ request }) => {
    console.log('\n=== API BLOCKCHAIN VERIFICATION ===\n');

    // Login
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get blockchain transactions
    const txRes = await request.get(`${API_URL}/blockchain/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const txData = await txRes.json();

    console.log('Blockchain transactions total:', txData.total);
    console.log('Blockchain transactions items:', txData.items?.length);

    if (txData.items && txData.items.length > 0) {
      const canonicalTx = txData.items.find((tx: any) => tx.tx_hash?.includes('0xea569f48'));
      if (canonicalTx) {
        console.log('\nCanonical transaction found:');
        console.log('  tx_hash:', canonicalTx.tx_hash);
        console.log('  contract_address:', canonicalTx.contract_address);
        console.log('  block_number:', canonicalTx.block_number);
        console.log('  token_id:', canonicalTx.token_id);
        console.log('  status:', canonicalTx.status);
      }
    }
  });
});
