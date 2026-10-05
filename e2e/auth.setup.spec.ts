import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';
const API_URL = 'http://localhost:8000/api/v1';

test.describe('Auth Setup', () => {
  test('SYSTEM_ADMIN auth setup', async ({ browser }) => {
    const context = await browser.newContext();
    
    // Get JWT via API
    let loginRes;
    let responseBody;
    let access_token;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      loginRes = await context.request.post(`${API_URL}/auth/login`, {
        data: { email: 'a.mehta@bel-defence.in', password: 'password' }
      });
      responseBody = await loginRes.json();
      console.log(`Admin login response (attempt ${attempts + 1}):`, JSON.stringify(responseBody));
      access_token = responseBody.access_token;

      if (access_token) {
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Retrying admin login in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!access_token) {
      throw new Error(`No access_token in admin login response after ${maxAttempts} attempts. Last response: ${JSON.stringify(responseBody)}`);
    }

    // Set token in cookies/localStorage
    await context.addCookies([{ name: 'kavach_token', value: access_token, domain: 'localhost', path: '/' }]);
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.evaluate(({ token }) => {
      localStorage.setItem('kavach_token', token);
      localStorage.setItem('kavach_user', JSON.stringify({
        id: 'usr-001',
        email: 'a.mehta@bel-defence.in',
        name: 'Arjun Mehta',
        roles: ['SYSTEM_ADMIN']
      }));
    }, { token: access_token });

    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Verify we're not redirected to login
    expect(page.url()).toContain('/app/dashboard');

    await context.storageState({ path: '.auth/admin-storage.json' });

    await page.close();
    await context.close();
  });

  test('PROCUREMENT auth setup', async ({ browser }) => {
    const context = await browser.newContext();
    
    let loginRes;
    let responseBody;
    let access_token;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      loginRes = await context.request.post(`${API_URL}/auth/login`, {
        data: { email: 'p.sharma@bel-defence.in', password: 'password' }
      });
      responseBody = await loginRes.json();
      console.log(`Procurement login response (attempt ${attempts + 1}):`, JSON.stringify(responseBody));
      access_token = responseBody.access_token;

      if (access_token) {
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Retrying procurement login in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!access_token) {
      throw new Error(`No access_token in procurement login response after ${maxAttempts} attempts. Last response: ${JSON.stringify(responseBody)}`);
    }

    await context.addCookies([{ name: 'kavach_token', value: access_token, domain: 'localhost', path: '/' }]);
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.evaluate(({ token }) => {
      localStorage.setItem('kavach_token', token);
      localStorage.setItem('kavach_user', JSON.stringify({
        id: 'usr-002',
        email: 'p.sharma@bel-defence.in',
        name: 'Priya Sharma',
        roles: ['PROCUREMENT_SUPPLY_CHAIN_OFFICER']
      }));
    }, { token: access_token });

    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/app/dashboard');
    await context.storageState({ path: '.auth/procurement-storage.json' });

    await page.close();
    await context.close();
  });

  test('INSPECTOR auth setup', async ({ browser }) => {
    const context = await browser.newContext();
    
    let loginRes;
    let responseBody;
    let access_token;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      loginRes = await context.request.post(`${API_URL}/auth/login`, {
        data: { email: 'r.kumar@bel-defence.in', password: 'password' }
      });
      responseBody = await loginRes.json();
      console.log(`Inspector login response (attempt ${attempts + 1}):`, JSON.stringify(responseBody));
      access_token = responseBody.access_token;

      if (access_token) {
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Retrying inspector login in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!access_token) {
      throw new Error(`No access_token in inspector login response after ${maxAttempts} attempts. Last response: ${JSON.stringify(responseBody)}`);
    }

    await context.addCookies([{ name: 'kavach_token', value: access_token, domain: 'localhost', path: '/' }]);
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.evaluate(({ token }) => {
      localStorage.setItem('kavach_token', token);
      localStorage.setItem('kavach_user', JSON.stringify({
        id: 'usr-003',
        email: 'r.kumar@bel-defence.in',
        name: 'Rajesh Kumar',
        roles: ['QUALITY_INSPECTOR']
      }));
    }, { token: access_token });

    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/app/dashboard');
    await context.storageState({ path: '.auth/inspector-storage.json' });

    await page.close();
    await context.close();
  });

  test('AUDITOR auth setup', async ({ browser }) => {
    const context = await browser.newContext();
    
    let loginRes;
    let responseBody;
    let access_token;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      loginRes = await context.request.post(`${API_URL}/auth/login`, {
        data: { email: 'd.nair@bel-defence.in', password: 'password' }
      });
      responseBody = await loginRes.json();
      console.log(`Auditor login response (attempt ${attempts + 1}):`, JSON.stringify(responseBody));
      access_token = responseBody.access_token;

      if (access_token) {
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Retrying auditor login in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!access_token) {
      throw new Error(`No access_token in auditor login response after ${maxAttempts} attempts. Last response: ${JSON.stringify(responseBody)}`);
    }

    await context.addCookies([{ name: 'kavach_token', value: access_token, domain: 'localhost', path: '/' }]);
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.evaluate(({ token }) => {
      localStorage.setItem('kavach_token', token);
      localStorage.setItem('kavach_user', JSON.stringify({
        id: 'usr-004',
        email: 'd.nair@bel-defence.in',
        name: 'Deepa Nair',
        roles: ['AUDITOR']
      }));
    }, { token: access_token });

    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/app/dashboard');
    await context.storageState({ path: '.auth/auditor-storage.json' });

    await page.close();
    await context.close();
  });
});
