import { test, expect } from '@playwright/test';

test.describe('LIST USERS', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('List all users with System Admin token', async ({ request }) => {
    console.log('\n=== LISTING USERS ===\n');

    // Login as System Admin
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get users
    const usersRes = await request.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Users status:', usersRes.status());

    if (usersRes.ok()) {
      const usersData = await usersRes.json();
      console.log('Users total:', usersData.total);
      console.log('Users items:', usersData.items?.length);

      if (usersData.items && usersData.items.length > 0) {
        console.log('\nUsers:');
        usersData.items.forEach((user: any) => {
          console.log(`  ${user.email} - ${user.name} - ${user.status} - ${user.role}`);
        });
      }
    } else {
      const error = await usersRes.json();
      console.log('Error:', error.message || error.detail);
    }
  });
});
