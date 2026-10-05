import { test, expect } from '@playwright/test';

test.describe('TRY DEMO PASSWORD', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Try demo/demo login', async ({ request }) => {
    console.log('\n=== TRYING DEMO PASSWORD ===\n');

    const users = [
      { email: 'a.mehta@bel-defence.in', password: 'password' },
      { email: 'a.mehta@bel-defence.in', password: 'demo' },
      { email: 'p.sharma@bel-defence.in', password: 'password' },
      { email: 'p.sharma@bel-defence.in', password: 'demo' },
      { email: 'r.kumar@bel-defence.in', password: 'password' },
      { email: 'r.kumar@bel-defence.in', password: 'demo' },
      { email: 'd.nair@bel-defence.in', password: 'password' },
      { email: 'd.nair@bel-defence.in', password: 'demo' },
    ];

    for (const user of users) {
      const loginRes = await request.post(`${API_URL}/auth/login`, {
        data: { email: user.email, password: user.password }
      });
      console.log(`${user.email} with password '${user.password}': ${loginRes.status()}`);
      if (loginRes.ok()) {
        const data = await loginRes.json();
        console.log(`  SUCCESS - Token received`);
      }
    }
  });
});
