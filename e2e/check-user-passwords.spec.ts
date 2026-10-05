import { test, expect } from '@playwright/test';

test.describe('CHECK USER PASSWORDS', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Check user data via admin API', async ({ request }) => {
    console.log('\n=== CHECKING USER DATA ===\n');

    // Login as System Admin
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get specific users
    const users = ['r.kumar@bel-defence.in', 'd.nair@bel-defence.in'];

    for (const email of users) {
      const userRes = await request.get(`${API_URL}/users?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`${email}: ${userRes.status()}`);
      if (userRes.ok()) {
        const data = await userRes.json();
        console.log(`  Found: ${data.items?.length} users`);
        if (data.items && data.items.length > 0) {
          console.log(`  Name: ${data.items[0].name}`);
          console.log(`  Status: ${data.items[0].status}`);
          console.log(`  Has passwordHash: ${!!data.items[0].passwordHash}`);
        }
      }
    }
  });
});
