import { test, expect } from '@playwright/test';

test.describe('KavachTrust E2E Flow', () => {
  let adminToken: string;
  let techToken: string;
  let creatorToken: string;
  
  test.beforeAll(async ({ request }) => {
    // We expect the backend to be running with demo data seeded.
    const adminRes = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'admin@bel.in', password: 'password' }
    });
    if (adminRes.ok()) adminToken = (await adminRes.json()).access_token;

    const techRes = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'tech@bel.in', password: 'password' }
    });
    if (techRes.ok()) techToken = (await techRes.json()).access_token;
    
    const creatorRes = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'creator@bel.in', password: 'password' }
    });
    if (creatorRes.ok()) creatorToken = (await creatorRes.json()).access_token;
  });

  test('AUTH: Reject invalid credentials', async ({ request }) => {
    const res = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'admin@bel.in', password: 'wrongpassword' }
    });
    expect(res.status()).toBe(401);
  });

  test('AUTHORIZATION: Technician denied NFT action', async ({ request }) => {
    test.skip(!techToken, 'No token available');
    const res = await request.post('http://localhost:8000/api/v1/certifications', {
      headers: { Authorization: `Bearer ${techToken}` },
      data: { assetId: 'SOME-ID' }
    });
    expect(res.status()).toBe(403);
  });

  test('TECHNICIAN: Can view assets', async ({ request }) => {
    test.skip(!techToken, 'No token available');
    const res = await request.get('http://localhost:8000/api/v1/assets', {
      headers: { Authorization: `Bearer ${techToken}` }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
  });
  
  test('UI: Frontend starts', async ({ page }) => {
    await page.goto('http://localhost:8443');
    await expect(page.locator('body')).toBeVisible();
  });
});
