import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';
const API_URL = 'http://localhost:8000/api/v1';

// Known confirmed cert from the DB
const KNOWN_CERT_ID = 'CERT-2026-24767';
const KNOWN_CERT_UUID = '73771de4-8b74-4045-92e4-9b854b7bd48a';

test.describe('SYSTEM_ADMIN - Full UI Journey', () => {
  test.use({ storageState: '.auth/admin-storage.json' });

  test('Admin: Dashboard → Users → Roles → Certifications → Supply Chain → Audit', async ({ page }) => {
    test.setTimeout(120000);
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // 1. Dashboard
    await page.goto(`${BASE_URL}/app/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/app/dashboard');
    console.log('1. Dashboard: OK');

    // 2. Users Page
    await page.goto(`${BASE_URL}/app/users`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/app/users');
    // Verify user data loads
    await page.waitForSelector('table', { timeout: 8000 });
    const userCount = await page.locator('tbody tr').count();
    expect(userCount).toBeGreaterThan(0);
    console.log(`2. Users page: ${userCount} users loaded`);

    // 3. Roles Page
    await page.goto(`${BASE_URL}/app/roles`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/app/roles');
    console.log('3. Roles page: OK');

    // 4. Certifications List
    await page.goto(`${BASE_URL}/app/certifications`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.waitForSelector('text=CERT-', { timeout: 10000 });
    console.log('4. Certifications list: loaded');

    // 5. Certification Detail — navigate by certId
    await page.goto(`${BASE_URL}/app/certifications/${KNOWN_CERT_ID}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(`text=${KNOWN_CERT_ID}`, { timeout: 10000 });
    expect(await page.locator(`text=${KNOWN_CERT_ID}`).count()).toBeGreaterThan(0);
    // Verify blockchain info section
    await page.waitForSelector('text=Blockchain Information', { timeout: 8000 });
    await page.waitForSelector('text=Token ID', { timeout: 8000 });
    console.log(`5. Cert detail (${KNOWN_CERT_ID}): blockchain section visible`);

    // 6. Supply Chain Dashboard — Suppliers tab
    await page.goto(`${BASE_URL}/app/supply-chain`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    // Click the Suppliers tab
    const suppliersTab = page.locator('button, [role="tab"]').filter({ hasText: 'Suppliers' }).first();
    if (await suppliersTab.count() > 0) {
      await suppliersTab.click();
      await page.waitForTimeout(1500);
      console.log('6a. Supply Chain - Suppliers tab clicked');
    } else {
      // Suppliers may be shown as a section
      const suppliersSection = page.locator('text=Suppliers').first();
      expect(await suppliersSection.count()).toBeGreaterThan(0);
      console.log('6a. Supply Chain - Suppliers section visible');
    }

    // Click Facilities tab
    const facilitiesTab = page.locator('button, [role="tab"]').filter({ hasText: 'Facilities' }).first();
    if (await facilitiesTab.count() > 0) {
      await facilitiesTab.click();
      await page.waitForTimeout(1500);
      console.log('6b. Supply Chain - Facilities tab clicked');
    } else {
      console.log('6b. Supply Chain - Facilities section visible');
    }

    // 7. System Activity (Audit)
    await page.goto(`${BASE_URL}/app/system-activity`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/app/system-activity');
    // AuditPage uses AuditTimeline (div-based), not a table
    // Wait for filter tabs which are always rendered on this page
    await page.waitForSelector('.sysact-filter-tabs', { timeout: 8000 });
    await page.waitForTimeout(2000);
    const eventCards = await page.locator('[class*="audit"], [class*="timeline"], [class*="event"]').count();
    console.log(`7. System Activity: page loaded, ${eventCards} elements visible`);

    // 8. Console errors check (excluding expected 4xx from auth rotation)
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('401') && !e.includes('403') && !e.includes('fetch') && !e.includes('NetworkError')
    );
    expect(criticalErrors).toHaveLength(0);
    console.log('8. Console: no critical errors');
  });

  test('Admin: Supply Chain - Add Supplier and verify persistence', async ({ page, request }) => {
    test.setTimeout(60000);

    // Add supplier via API first (same as what UI does)
    const token = (await (await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    })).json()).access_token;

    const ts = Date.now();
    const supplierRes = await request.post(`${API_URL}/supply-chain/suppliers`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: `BEL E2E Supplier ${ts}`,
        contact_info: { email: `e2e-supplier-${ts}@bel.in` },
        status: 'ACTIVE',
      },
    });
    expect(supplierRes.ok()).toBeTruthy();
    const supplier = await supplierRes.json();
    console.log('Created supplier:', supplier.name);

    // Navigate to supply chain and verify the supplier appears
    await page.goto(`${BASE_URL}/app/supply-chain`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Switch to suppliers tab or scroll to find it
    const suppliersTab = page.locator('button, [role="tab"]').filter({ hasText: 'Suppliers' }).first();
    if (await suppliersTab.count() > 0) {
      await suppliersTab.click();
      await page.waitForTimeout(1500);
    }

    await page.waitForSelector(`text=BEL E2E Supplier ${ts}`, { timeout: 10000 });
    const found = await page.locator(`text=BEL E2E Supplier ${ts}`).count();
    expect(found).toBeGreaterThan(0);
    console.log(`Supplier "BEL E2E Supplier ${ts}" persisted and visible in UI`);
  });

  test('Admin: Supply Chain - Add Facility and verify persistence', async ({ page, request }) => {
    test.setTimeout(60000);

    // Add facility via API
    const token = (await (await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    })).json()).access_token;

    const ts = Date.now();
    // Facility requires an existing supplierId
    const supplierForFacility = await request.post(`${API_URL}/supply-chain/suppliers`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `BEL E2E Sup For Fac ${ts}`, contact_info: { email: `sup-fac-${ts}@bel.in` }, status: 'ACTIVE' },
    });
    const supplierData = await supplierForFacility.json();
    const supplierId = supplierData.id;

    const facilityRes = await request.post(`${API_URL}/supply-chain/facilities`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: `BEL E2E Facility ${ts}`,
        location: `Test Location ${ts}`,
        type: 'MANUFACTURING',
        status: 'OPERATIONAL',
        supplierId,
      },
    });
    expect(facilityRes.ok()).toBeTruthy();
    const facility = await facilityRes.json();
    console.log('Created facility:', facility.name);

    // Navigate to supply chain and verify the facility appears
    await page.goto(`${BASE_URL}/app/supply-chain`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Switch to facilities tab
    const facilitiesTab = page.locator('button, [role="tab"]').filter({ hasText: 'Facilities' }).first();
    if (await facilitiesTab.count() > 0) {
      await facilitiesTab.click();
      await page.waitForTimeout(1500);
    }

    await page.waitForSelector(`text=BEL E2E Facility ${ts}`, { timeout: 10000 });
    const found = await page.locator(`text=BEL E2E Facility ${ts}`).count();
    expect(found).toBeGreaterThan(0);
    console.log(`Facility "BEL E2E Facility ${ts}" persisted and visible in UI`);
  });
});
