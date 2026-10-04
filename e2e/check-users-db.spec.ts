import { test, expect } from '@playwright/test';

test.describe('CHECK USERS IN DATABASE', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Get all users and find specific ones', async ({ request }) => {
    console.log('\n=== CHECKING ALL USERS IN DB ===\n');

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
      console.log(`Total users: ${data.total}`);

      // Find specific users
      const rKumar = data.items?.find((u: any) => u.email === 'r.kumar@bel-defence.in');
      const dNair = data.items?.find((u: any) => u.email === 'd.nair@bel-defence.in');

      console.log('\nRajesh Kumar:');
      console.log(`  Found: ${!!rKumar}`);
      if (rKumar) {
        console.log(`  Name: ${rKumar.name}`);
        console.log(`  Status: ${rKumar.status}`);
        console.log(`  ID: ${rKumar.id}`);
      }

      console.log('\nDeepa Nair:');
      console.log(`  Found: ${!!dNair}`);
      if (dNair) {
        console.log(`  Name: ${dNair.name}`);
        console.log(`  Status: ${dNair.status}`);
        console.log(`  ID: ${dNair.id}`);
      }
    }
  });
});
