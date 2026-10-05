import { test, expect } from '@playwright/test';

test.describe('RESET PASSWORDS VIA API', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Reset Inspector and Auditor passwords', async ({ request }) => {
    console.log('\n=== RESETTING PASSWORDS ===\n');

    // Reset Rajesh Kumar
    const rKumarRes = await request.post(`${API_URL}/auth/reset-password`, {
      data: { email: 'r.kumar@bel-defence.in', new_password: 'password' }
    });
    console.log(`Rajesh Kumar reset: ${rKumarRes.status()}`);
    if (rKumarRes.ok()) {
      console.log(`  ${(await rKumarRes.json()).message}`);
    }

    // Reset Deepa Nair
    const dNairRes = await request.post(`${API_URL}/auth/reset-password`, {
      data: { email: 'd.nair@bel-defence.in', new_password: 'password' }
    });
    console.log(`Deepa Nair reset: ${dNairRes.status()}`);
    if (dNairRes.ok()) {
      console.log(`  ${(await dNairRes.json()).message}`);
    }

    // Verify login works
    console.log('\n=== VERIFYING LOGIN ===\n');

    const rKumarLogin = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'r.kumar@bel-defence.in', password: 'password' }
    });
    console.log(`Rajesh Kumar login: ${rKumarLogin.status()}`);

    const dNairLogin = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'd.nair@bel-defence.in', password: 'password' }
    });
    console.log(`Deepa Nair login: ${dNairLogin.status()}`);
  });
});
