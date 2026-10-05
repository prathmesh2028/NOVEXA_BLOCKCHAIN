import { test, expect } from '@playwright/test';

test.describe('PRISMA DIRECT DIAGNOSTIC', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Compare API response with Prisma field names', async ({ request }) => {
    console.log('\n=== API RESPONSE FIELD INVESTIGATION ===\n');

    // Login
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get assets
    const assetsRes = await request.get(`${API_URL}/assets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const assetsData = await assetsRes.json();

    console.log('ASSET API RESPONSE KEYS:');
    if (assetsData.items && assetsData.items.length > 0) {
      const firstAsset = assetsData.items[0];
      console.log('All keys:', Object.keys(firstAsset));
      console.log('\nField values:');
      for (const [key, value] of Object.entries(firstAsset)) {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Get certifications
    const certsRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const certsData = await certsRes.json();

    console.log('\nCERTIFICATION API RESPONSE KEYS:');
    if (certsData.items && certsData.items.length > 0) {
      const firstCert = certsData.items[0];
      console.log('All keys:', Object.keys(firstCert));
      console.log('\nField values:');
      for (const [key, value] of Object.entries(firstCert)) {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Get blockchain transactions
    const txRes = await request.get(`${API_URL}/blockchain/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const txData = await txRes.json();

    console.log('\nBLOCKCHAIN TRANSACTION API RESPONSE KEYS:');
    if (txData.items && txData.items.length > 0) {
      const firstTx = txData.items[0];
      console.log('All keys:', Object.keys(firstTx));
      console.log('\nField values:');
      for (const [key, value] of Object.entries(firstTx)) {
        console.log(`  ${key}: ${value}`);
      }
    }
  });
});
