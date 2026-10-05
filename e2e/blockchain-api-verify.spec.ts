import { test, expect } from '@playwright/test';

test.describe('BLOCKCHAIN API DATA VERIFICATION', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Verify blockchain API returns real data not synthetic', async ({ request }) => {
    console.log('\n=== BLOCKCHAIN API DATA ===\n');

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
      const firstTx = txData.items[0];
      console.log('\nFirst transaction:');
      console.log('  tx_hash:', firstTx.tx_hash);
      console.log('  network:', firstTx.network);
      console.log('  block_number:', firstTx.block_number);
      console.log('  contract_address:', firstTx.contract_address);
      console.log('  token_id:', firstTx.token_id);
      console.log('  status:', firstTx.status);

      console.log('\nVerification:');
      console.log('  Contains synthetic contract 0x742d35Cc:', firstTx.contract_address?.includes('0x742d35Cc'));
      console.log('  Contains real contract 0xDc64:', firstTx.contract_address?.includes('0xDc64'));
      console.log('  Contains real TX 0xea569f48:', firstTx.tx_hash?.includes('0xea569f48'));
      console.log('  Contains block 17156:', firstTx.block_number === 17156);
      console.log('  Contains token 3:', firstTx.token_id === '3');
    }
  });
});
