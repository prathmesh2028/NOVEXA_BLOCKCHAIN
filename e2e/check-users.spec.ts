import { test, expect } from '@playwright/test';

test.describe('CHECK ALL USERS', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Check which users can login', async ({ request }) => {
    console.log('\n=== CHECKING ALL USERS ===\n');

    const users = [
      { email: 'a.mehta@bel-defence.in', name: 'System Admin' },
      { email: 'p.sharma@bel-defence.in', name: 'Procurement' },
      { email: 'r.kumar@bel-defence.in', name: 'Inspector' },
      { email: 'd.nair@bel-defence.in', name: 'Auditor' },
    ];

    for (const user of users) {
      const loginRes = await request.post(`${API_URL}/auth/login`, {
        data: { email: user.email, password: 'password' }
      });
      console.log(`${user.name} (${user.email}): ${loginRes.status()}`);
      if (loginRes.ok()) {
        const data = await loginRes.json();
        console.log(`  Token received: ${!!data.access_token}`);
      } else {
        const error = await loginRes.json();
        console.log(`  Error: ${error.message || error.detail}`);
      }
    }
  });
});
