import { test, expect } from '@playwright/test';

test.describe('ROLE STATE FORENSIC TRACE', () => {
  const BASE_URL = 'http://localhost:8443';
  const API_URL = 'http://localhost:8000/api/v1';

  const USERS = {
    SYSTEM_ADMIN: { email: 'a.mehta@bel-defence.in', password: 'password' },
    PROCUREMENT: { email: 'p.sharma@bel-defence.in', password: 'password' },
    INSPECTOR: { email: 'r.kumar@bel-defence.in', password: 'password123' },
    AUDITOR: { email: 'd.nair@bel-defence.in', password: 'password123' }
  };

  test('TRACE: Procurement role state through entire flow', async ({ page, request }) => {
    console.log('\n=== PROCUREMENT ROLE STATE TRACE ===\n');

    // Step 1: Login API response
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: USERS.PROCUREMENT
    });
    const loginData = await loginRes.json();
    console.log('1. Login API response roles:', loginData.access_token ? 'token present' : 'no token');

    // Step 2: /me API response
    const meRes = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.access_token}` }
    });
    const meData = await meRes.json();
    console.log('2. /me API response roles:', meData.roles);
    console.log('   /me API first role:', meData.roles[0]);

    // Step 3: Frontend login
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Step 4: localStorage after login
    const localStorageUser = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    console.log('3. localStorage kavach_user roles:', localStorageUser?.roles);
    console.log('   localStorage kavach_user first role:', localStorageUser?.roles?.[0]);

    // Step 5: sessionStorage
    const sessionStorageData = await page.evaluate(() => {
      const data: any = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data[key] = sessionStorage.getItem(key);
      }
      return data;
    });
    console.log('4. sessionStorage keys:', Object.keys(sessionStorageData));

    // Step 6: Cookies
    const cookies = await page.context().cookies();
    console.log('5. Cookies:', cookies.map(c => ({ name: c.name, value: c.value ? 'present' : 'empty' })));

    // Step 7: Navigate to Certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('6. After navigating to /app/certifications, URL:', page.url());

    // Step 8: localStorage after navigation
    const localStorageUser2 = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    console.log('7. localStorage after navigation roles:', localStorageUser2?.roles);
    console.log('   localStorage after navigation first role:', localStorageUser2?.roles?.[0]);

    // Step 9: Navigate to Blockchain Proof
    await page.goto(BASE_URL + '/app/blockchain-proof');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('8. After navigating to /app/blockchain-proof, URL:', page.url());

    // Step 10: localStorage after blockchain-proof navigation
    const localStorageUser3 = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    console.log('9. localStorage after blockchain-proof roles:', localStorageUser3?.roles);
    console.log('   localStorage after blockchain-proof first role:', localStorageUser3?.roles?.[0]);

    // Step 11: Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('10. ERROR: Redirected to login on /app/blockchain-proof');
      console.log('   This means either:');
      console.log('   - isAuthenticated = false in RoleGuard');
      console.log('   - role = null/undefined in RoleGuard');
      console.log('   - role not in allowedRoles in RoleGuard');
    }
  });

  test('TRACE: Auditor role state through entire flow', async ({ page, request }) => {
    console.log('\n=== AUDITOR ROLE STATE TRACE ===\n');

    // Step 1: Login API response
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: USERS.AUDITOR
    });
    const loginData = await loginRes.json();
    console.log('1. Login API response roles:', loginData.access_token ? 'token present' : 'no token');

    // Step 2: /me API response
    const meRes = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.access_token}` }
    });
    const meData = await meRes.json();
    console.log('2. /me API response roles:', meData.roles);
    console.log('   /me API first role:', meData.roles[0]);

    // Step 3: Frontend login
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Deepa Nair');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Step 4: localStorage after login
    const localStorageUser = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    console.log('3. localStorage kavach_user roles:', localStorageUser?.roles);
    console.log('   localStorage kavach_user first role:', localStorageUser?.roles?.[0]);

    // Step 5: Navigate to System Activity
    await page.goto(BASE_URL + '/app/system-activity');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('4. After navigating to /app/system-activity, URL:', page.url());

    // Step 6: localStorage after system-activity navigation
    const localStorageUser2 = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    console.log('5. localStorage after system-activity roles:', localStorageUser2?.roles);
    console.log('   localStorage after system-activity first role:', localStorageUser2?.roles?.[0]);

    // Step 7: Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('6. ERROR: Redirected to login on /app/system-activity');
    }
  });

  test('TRACE: System Admin for comparison', async ({ page, request }) => {
    console.log('\n=== SYSTEM ADMIN ROLE STATE TRACE (COMPARISON) ===\n');

    // Step 1: Login API response
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: USERS.SYSTEM_ADMIN
    });
    const loginData = await loginRes.json();
    console.log('1. Login API response roles:', loginData.access_token ? 'token present' : 'no token');

    // Step 2: /me API response
    const meRes = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.access_token}` }
    });
    const meData = await meRes.json();
    console.log('2. /me API response roles:', meData.roles);
    console.log('   /me API first role:', meData.roles[0]);

    // Step 3: Frontend login
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Arjun Mehta');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Step 4: localStorage after login
    const localStorageUser = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    console.log('3. localStorage kavach_user roles:', localStorageUser?.roles);
    console.log('   localStorage kavach_user first role:', localStorageUser?.roles?.[0]);

    // Step 5: Navigate to System Activity (admin should have access)
    await page.goto(BASE_URL + '/app/system-activity');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('4. After navigating to /app/system-activity, URL:', page.url());

    // Step 6: localStorage after system-activity navigation
    const localStorageUser2 = await page.evaluate(() => {
      const user = localStorage.getItem('kavach_user');
      return user ? JSON.parse(user) : null;
    });
    console.log('5. localStorage after system-activity roles:', localStorageUser2?.roles);
    console.log('   localStorage after system-activity first role:', localStorageUser2?.roles?.[0]);

    // Step 7: Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('6. ERROR: System Admin redirected to login on /app/system-activity');
    } else {
      console.log('6. System Admin successfully accessed /app/system-activity');
    }
  });
});
