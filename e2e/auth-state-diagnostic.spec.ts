import { test, expect } from '@playwright/test';

test.describe('AUTHENTICATION STATE DIAGNOSTIC', () => {
  const API_URL = 'http://localhost:8000/api/v1';
  const targetUsers = [
    'a.mehta@bel-defence.in',
    'p.sharma@bel-defence.in',
    'r.kumar@bel-defence.in',
    'd.nair@bel-defence.in'
  ];

  test('Verify complete authentication state for all users', async ({ request }) => {
    console.log('\n=== AUTHENTICATION STATE DIAGNOSTIC ===\n');

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
      console.log(`Total users in DB: ${data.total}`);

      for (const email of targetUsers) {
        const user = data.items?.find((u: any) => u.email === email);
        console.log(`\n${email}:`);
        console.log(`  Exists: ${!!user}`);
        if (user) {
          console.log(`  Name: ${user.name}`);
          console.log(`  Status: ${user.status}`);
          console.log(`  ID: ${user.id}`);
          console.log(`  Has passwordHash: ${!!user.passwordHash}`);
          console.log(`  CreatedAt: ${user.createdAt}`);
        }
      }
    }

    // Check roles for each user
    console.log('\n=== ROLE MAPPINGS ===\n');
    const rolesRes = await request.get(`${API_URL}/users/roles`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (rolesRes.ok()) {
      const rolesData = await rolesRes.json();
      console.log('Role mappings:', JSON.stringify(rolesData, null, 2));
    }

    // Test actual login for each user
    console.log('\n=== ACTUAL LOGIN TESTS ===\n');
    for (const email of targetUsers) {
      const testLogin = await request.post(`${API_URL}/auth/login`, {
        data: { email, password: 'password' }
      });
      console.log(`${email} with 'password': ${testLogin.status()}`);
      if (testLogin.ok()) {
        console.log(`  SUCCESS - Token received`);
      } else {
        const error = await testLogin.json();
        console.log(`  FAILED: ${error.message || error.detail}`);
      }
    }
  });
});
