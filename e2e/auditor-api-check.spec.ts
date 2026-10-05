import { test, expect } from '@playwright/test';

test.describe('AUDITOR API CHECK', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Check if auditor can access certifications and blockchain transactions', async ({ request }) => {
    console.log('\n=== AUDITOR API CHECK ===\n');

    // Login as Auditor
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'd.nair@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get certifications
    const certsRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Certifications status:', certsRes.status());
    const certsData = await certsRes.json();
    console.log('Certifications total:', certsData.total);
    console.log('Certifications items:', certsData.items?.length);

    if (certsData.items && certsData.items.length > 0) {
      console.log('\nFirst certification:');
      console.log('  cert_id:', certsData.items[0].cert_id);
      console.log('  status:', certsData.items[0].status);
    }

    // Get blockchain transactions
    const txRes = await request.get(`${API_URL}/blockchain/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\nBlockchain transactions status:', txRes.status());
    const txData = await txRes.json();
    console.log('Blockchain transactions total:', txData.total);
    console.log('Blockchain transactions items:', txData.items?.length);
  });
});
