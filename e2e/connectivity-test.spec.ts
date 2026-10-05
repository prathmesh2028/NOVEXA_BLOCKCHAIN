import { test, expect } from '@playwright/test';

test.describe('SUPABASE CONNECTIVITY TEST', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Test backend health and DB connectivity', async ({ request }) => {
    console.log('\n=== SUPABASE CONNECTIVITY TEST ===\n');

    // Test 1: Health endpoint
    const healthRes = await request.get(`${API_URL}/health`);
    console.log('1. Health endpoint status:', healthRes.status());
    const healthData = await healthRes.json();
    console.log('   Health data:', healthData);

    // Test 2: Login (requires DB)
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'a.mehta@bel-defence.in',
        password: 'password'
      }
    });
    console.log('2. Login status:', loginRes.status());
    if (loginRes.ok()) {
      const loginData = await loginRes.json();
      console.log('   Login successful, token present:', !!loginData.access_token);

      // Test 3: /me endpoint (requires DB)
      const meRes = await request.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` }
      });
      console.log('3. /me endpoint status:', meRes.status());
      if (meRes.ok()) {
        const meData = await meRes.json();
        console.log('   /me successful, user:', meData.email);
        console.log('   /me roles:', meData.roles);
      } else {
        console.log('   /me failed:', await meRes.text());
      }
    } else {
      console.log('   Login failed:', await loginRes.text());
    }

    // Test 4: Certifications endpoint (requires DB)
    const certsRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${(await loginRes.json()).access_token}` }
    });
    console.log('4. Certifications endpoint status:', certsRes.status());
    if (certsRes.ok()) {
      const certsData = await certsRes.json();
      console.log('   Certifications count:', certsData.total);
    } else {
      console.log('   Certifications failed:', await certsRes.text());
    }
  });
});
