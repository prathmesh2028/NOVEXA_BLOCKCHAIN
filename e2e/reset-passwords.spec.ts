import { test, expect } from '@playwright/test';

test.describe('RESET USER PASSWORDS', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Update Inspector and Auditor passwords', async ({ request }) => {
    console.log('\n=== RESETTING PASSWORDS ===\n');

    // Login as System Admin
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get all users
    const usersRes = await request.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (usersRes.ok()) {
      const data = await usersRes.json();

      // Find specific users
      const rKumar = data.items?.find((u: any) => u.email === 'r.kumar@bel-defence.in');
      const dNair = data.items?.find((u: any) => u.email === 'd.nair@bel-defence.in');

      if (rKumar) {
        console.log(`Updating Rajesh Kumar (ID: ${rKumar.id}) password to 'password'`);
        // Note: This will only work if the API supports password updates
        const updateRes = await request.patch(`${API_URL}/users/${rKumar.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { password: 'password' }
        });
        console.log(`Update result: ${updateRes.status()}`);
      }

      if (dNair) {
        console.log(`Updating Deepa Nair (ID: ${dNair.id}) password to 'password'`);
        const updateRes = await request.patch(`${API_URL}/users/${dNair.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { password: 'password' }
        });
        console.log(`Update result: ${updateRes.status()}`);
      }
    }
  });
});
