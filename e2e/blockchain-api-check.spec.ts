import { test, expect } from '@playwright/test';

test.describe('BLOCKCHAIN API WITH AUTH CHECK', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Get blockchain transactions with auth and check response', async ({ request }) => {
    console.log('\n=== BLOCKCHAIN API CHECK ===\n');

    // Login
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get blockchain transactions
    const txRes = await request.get(`${API_URL}/blockchain/transactions?page_size=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Blockchain transactions status:', txRes.status());
    console.log('Blockchain transactions total:', (await txRes.json()).total);
    console.log('Blockchain transactions items:', (await txRes.json()).items?.length);

    const txData = await txRes.json();
    if (txData.items && txData.items.length > 0) {
      console.log('\nFirst 3 transactions:');
      txData.items.slice(0, 3).forEach((tx: any, idx: number) => {
        console.log(`  ${idx + 1}. tx_hash: ${tx.tx_hash}`);
        console.log(`     contract_address: ${tx.contract_address}`);
        console.log(`     block_number: ${tx.block_number}`);
        console.log(`     token_id: ${tx.token_id}`);
        console.log(`     status: ${tx.status}`);
      });
    }
  });
});
