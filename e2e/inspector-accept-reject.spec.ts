import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';
const API_URL = 'http://localhost:8000/api/v1';

// Helper to get an inspector API token
async function getInspectorToken(request: any): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: 'r.kumar@bel-defence.in', password: 'password' },
  });
  const body = await res.json();
  return body.access_token;
}

test.describe('INSPECTOR - ACCEPT/REJECT WORKFLOWS', () => {
  test.use({ storageState: '.auth/inspector-storage.json' });

  test('Inspector ACCEPT workflow - register → inspect → accept', async ({ page, request }) => {
    const token = await getInspectorToken(request);
    const ts = Date.now();

    // 1. Register a fresh asset (SUPPLIER_DECLARED state — valid for inspection)
    const regRes = await request.post(`${API_URL}/assets`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        assetId: `E2E-ACCEPT-${ts}`,
        batchId: `E2E-BATCH-${ts}`,
        type: 'Electronic Fuze',
        model: 'EF-E2E-ACCEPT',
        serialNumber: `SN-E2E-ACC-${ts}`,
        supplier: 'BEL E2E Test Div.',
        description: 'E2E test asset for ACCEPT workflow',
      },
    });
    expect(regRes.ok()).toBeTruthy();
    const newAsset = await regRes.json();
    const assetId = newAsset.asset_id;
    console.log('Registered asset for ACCEPT:', assetId, '| state:', newAsset.lifecycle_state);

    // 2. Record inspection via API
    const inspRes = await request.post(`${API_URL}/inspections/record`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        asset_id: assetId,
        result: 'PASS',
        notes: `E2E-ACCEPT-${ts}: All QA checks passed.`,
      },
    });
    expect(inspRes.ok()).toBeTruthy();
    const inspection = await inspRes.json();
    console.log('Recorded inspection:', inspection.id, '| result:', inspection.result);

    // 3. Navigate to inspections page — row should appear with ACCEPT button
    await page.goto(`${BASE_URL}/app/inspections`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 4. The asset is in INSPECTION_RECORDED state after recordInspection,
    //    so ACCEPT button should be visible in the row
    const row = page.locator('tr').filter({ hasText: `E2E-ACCEPT-${ts}` }).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row.locator('button', { hasText: 'ACCEPT' })).toBeVisible({ timeout: 5000 });

    // 5. Click ACCEPT
    await row.locator('button', { hasText: 'ACCEPT' }).click();

    // 6. Verify button disappears (asset transitioned to ACCEPTED_FOR_ASSEMBLY)
    await expect(row.locator('button', { hasText: 'ACCEPT' })).toBeHidden({ timeout: 10000 });
    console.log('ACCEPT workflow PASSED — asset is now ACCEPTED_FOR_ASSEMBLY');
  });

  test('Inspector REJECT workflow - register → inspect → reject', async ({ page, request }) => {
    const token = await getInspectorToken(request);
    const ts = Date.now();

    // 1. Register a fresh asset (SUPPLIER_DECLARED state — valid for inspection)
    const regRes = await request.post(`${API_URL}/assets`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        assetId: `E2E-REJECT-${ts}`,
        batchId: `E2E-BATCH-${ts}`,
        type: 'Pressure Transducer',
        model: 'PT-E2E-REJECT',
        serialNumber: `SN-E2E-REJ-${ts}`,
        supplier: 'BEL E2E Test Div.',
        description: 'E2E test asset for REJECT workflow',
      },
    });
    expect(regRes.ok()).toBeTruthy();
    const newAsset = await regRes.json();
    const assetId = newAsset.asset_id;
    console.log('Registered asset for REJECT:', assetId, '| state:', newAsset.lifecycle_state);

    // 2. Record inspection via API
    const inspRes = await request.post(`${API_URL}/inspections/record`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        asset_id: assetId,
        result: 'FAIL',
        notes: `E2E-REJECT-${ts}: Critical defect detected.`,
      },
    });
    expect(inspRes.ok()).toBeTruthy();
    const inspection = await inspRes.json();
    console.log('Recorded inspection:', inspection.id, '| result:', inspection.result);

    // 3. Navigate to inspections page — row should appear with REJECT button
    await page.goto(`${BASE_URL}/app/inspections`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 4. The asset is in INSPECTION_RECORDED state after recordInspection,
    //    so REJECT button should be visible in the row
    const row = page.locator('tr').filter({ hasText: `E2E-REJECT-${ts}` }).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row.locator('button', { hasText: 'REJECT' })).toBeVisible({ timeout: 5000 });

    // 5. Click REJECT
    await row.locator('button', { hasText: 'REJECT' }).click();

    // 6. Verify button disappears (asset transitioned to REJECTED_QUARANTINED)
    await expect(row.locator('button', { hasText: 'REJECT' })).toBeHidden({ timeout: 10000 });
    console.log('REJECT workflow PASSED — asset is now REJECTED_QUARANTINED');
  });
});
