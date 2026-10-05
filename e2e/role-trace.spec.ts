import { test, expect } from '@playwright/test';

test.describe('ROLE VALUE TRACE', () => {
  const API_URL = 'http://localhost:8000/api/v1';
  const BASE_URL = 'http://localhost:8443';

  const USERS = {
    SYSTEM_ADMIN: { email: 'a.mehta@bel-defence.in', password: 'password' },
    PROCUREMENT: { email: 'p.sharma@bel-defence.in', password: 'password' },
    INSPECTOR: { email: 'r.kumar@bel-defence.in', password: 'password123' },
    AUDITOR: { email: 'd.nair@bel-defence.in', password: 'password123' }
  };

  test('TRACE: System Admin role value', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: USERS.SYSTEM_ADMIN
    });
    const data = await res.json();
    console.log('SYSTEM_ADMIN - Login response:', JSON.stringify(data, null, 2));
    
    const meRes = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    const meData = await meRes.json();
    console.log('SYSTEM_ADMIN - /me response:', JSON.stringify(meData, null, 2));
    console.log('SYSTEM_ADMIN - roles array:', meData.roles);
    console.log('SYSTEM_ADMIN - first role:', meData.roles[0]);
  });

  test('TRACE: Procurement role value', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: USERS.PROCUREMENT
    });
    const data = await res.json();
    
    const meRes = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    const meData = await meRes.json();
    console.log('PROCUREMENT - /me response:', JSON.stringify(meData, null, 2));
    console.log('PROCUREMENT - roles array:', meData.roles);
    console.log('PROCUREMENT - first role:', meData.roles[0]);
  });

  test('TRACE: Inspector role value', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: USERS.INSPECTOR
    });
    const data = await res.json();
    
    const meRes = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    const meData = await meRes.json();
    console.log('INSPECTOR - /me response:', JSON.stringify(meData, null, 2));
    console.log('INSPECTOR - roles array:', meData.roles);
    console.log('INSPECTOR - first role:', meData.roles[0]);
  });

  test('TRACE: Auditor role value', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: USERS.AUDITOR
    });
    const data = await res.json();
    
    const meRes = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    const meData = await meRes.json();
    console.log('AUDITOR - /me response:', JSON.stringify(meData, null, 2));
    console.log('AUDITOR - roles array:', meData.roles);
    console.log('AUDITOR - first role:', meData.roles[0]);
  });

  test('TRACE: Frontend localStorage after login', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    const localStorage = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    
    console.log('FRONTEND - localStorage kavach_user:', JSON.stringify(localStorage, null, 2));
    console.log('FRONTEND - localStorage roles:', localStorage?.roles);
    console.log('FRONTEND - localStorage first role:', localStorage?.roles?.[0]);
  });
});
