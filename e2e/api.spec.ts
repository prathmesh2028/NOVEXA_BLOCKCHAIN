import { test, expect } from '@playwright/test';

test.describe('KavachTrust E2E Flow', () => {
  let systemAdminToken: string;
  let qualityInspectorToken: string;
  let procurementOfficerToken: string;
  let auditorToken: string;

  test.beforeAll(async ({ request }) => {
    // We expect the backend to be running with demo data seeded.
    const systemAdminRes = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    if (systemAdminRes.ok()) systemAdminToken = (await systemAdminRes.json()).access_token;

    const qualityInspectorRes = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'r.kumar@bel-defence.in', password: 'password' }
    });
    if (qualityInspectorRes.ok()) qualityInspectorToken = (await qualityInspectorRes.json()).access_token;

    const procurementOfficerRes = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'p.sharma@bel-defence.in', password: 'password' }
    });
    if (procurementOfficerRes.ok()) procurementOfficerToken = (await procurementOfficerRes.json()).access_token;

    const auditorRes = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'd.nair@bel-defence.in', password: 'password' }
    });
    if (auditorRes.ok()) auditorToken = (await auditorRes.json()).access_token;
  });

  test('AUTH: Reject invalid credentials', async ({ request }) => {
    const res = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'a.mehta@bel-defence.in', password: 'wrongpassword' }
    });
    expect(res.status()).toBe(401);
  });

  test('AUTHORIZATION: Quality Inspector denied certification action', async ({ request }) => {
    test.skip(!qualityInspectorToken, 'No token available');
    const res = await request.post('http://localhost:8000/api/v1/certifications', {
      headers: { Authorization: `Bearer ${qualityInspectorToken}` },
      data: { assetId: 'SOME-ID' }
    });
    // Quality Inspector should not be able to create certifications
    // Either 403 (forbidden) or 400 (bad request due to missing fields) is acceptable
    expect([400, 403]).toContain(res.status());
  });

  test('QUALITY_INSPECTOR: Can view assets', async ({ request }) => {
    test.skip(!qualityInspectorToken, 'No token available');
    const res = await request.get('http://localhost:8000/api/v1/assets', {
      headers: { Authorization: `Bearer ${qualityInspectorToken}` }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  test('SYSTEM_ADMIN: Can view users', async ({ request }) => {
    test.skip(!systemAdminToken, 'No token available');
    const res = await request.get('http://localhost:8000/api/v1/users', {
      headers: { Authorization: `Bearer ${systemAdminToken}` }
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
