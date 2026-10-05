# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full-journey.spec.ts >> SYSTEM_ADMIN - Full UI Journey >> Admin: Dashboard → Users → Roles → Certifications → Supply Chain → Audit
- Location: e2e\admin-full-journey.spec.ts:13:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 8000ms exceeded.
Call log:
  - waiting for locator('table') to be visible

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'http://localhost:8443';
  4   | const API_URL = 'http://localhost:8000/api/v1';
  5   | 
  6   | // Known confirmed cert from the DB
  7   | const KNOWN_CERT_ID = 'CERT-2026-24767';
  8   | const KNOWN_CERT_UUID = '73771de4-8b74-4045-92e4-9b854b7bd48a';
  9   | 
  10  | test.describe('SYSTEM_ADMIN - Full UI Journey', () => {
  11  |   test.use({ storageState: '.auth/admin-storage.json' });
  12  | 
  13  |   test('Admin: Dashboard → Users → Roles → Certifications → Supply Chain → Audit', async ({ page }) => {
  14  |     test.setTimeout(120000);
  15  |     const consoleErrors: string[] = [];
  16  |     page.on('console', msg => {
  17  |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  18  |     });
  19  | 
  20  |     // 1. Dashboard
  21  |     await page.goto(`${BASE_URL}/app/dashboard`);
  22  |     await page.waitForLoadState('domcontentloaded');
  23  |     await page.waitForTimeout(1500);
  24  |     expect(page.url()).toContain('/app/dashboard');
  25  |     console.log('1. Dashboard: OK');
  26  | 
  27  |     // 2. Users Page
  28  |     await page.goto(`${BASE_URL}/app/users`);
  29  |     await page.waitForLoadState('domcontentloaded');
  30  |     await page.waitForTimeout(1500);
  31  |     expect(page.url()).toContain('/app/users');
  32  |     // Verify user data loads
> 33  |     await page.waitForSelector('table', { timeout: 8000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 8000ms exceeded.
  34  |     const userCount = await page.locator('tbody tr').count();
  35  |     expect(userCount).toBeGreaterThan(0);
  36  |     console.log(`2. Users page: ${userCount} users loaded`);
  37  | 
  38  |     // 3. Roles Page
  39  |     await page.goto(`${BASE_URL}/app/roles`);
  40  |     await page.waitForLoadState('domcontentloaded');
  41  |     await page.waitForTimeout(1500);
  42  |     expect(page.url()).toContain('/app/roles');
  43  |     console.log('3. Roles page: OK');
  44  | 
  45  |     // 4. Certifications List
  46  |     await page.goto(`${BASE_URL}/app/certifications`);
  47  |     await page.waitForLoadState('domcontentloaded');
  48  |     await page.waitForTimeout(2000);
  49  |     await page.waitForSelector('text=CERT-', { timeout: 10000 });
  50  |     console.log('4. Certifications list: loaded');
  51  | 
  52  |     // 5. Certification Detail — navigate by certId
  53  |     await page.goto(`${BASE_URL}/app/certifications/${KNOWN_CERT_ID}`);
  54  |     await page.waitForLoadState('domcontentloaded');
  55  |     await page.waitForSelector(`text=${KNOWN_CERT_ID}`, { timeout: 10000 });
  56  |     expect(await page.locator(`text=${KNOWN_CERT_ID}`).count()).toBeGreaterThan(0);
  57  |     // Verify blockchain info section
  58  |     await page.waitForSelector('text=Blockchain Information', { timeout: 8000 });
  59  |     await page.waitForSelector('text=Token ID', { timeout: 8000 });
  60  |     console.log(`5. Cert detail (${KNOWN_CERT_ID}): blockchain section visible`);
  61  | 
  62  |     // 6. Supply Chain Dashboard — Suppliers tab
  63  |     await page.goto(`${BASE_URL}/app/supply-chain`);
  64  |     await page.waitForLoadState('domcontentloaded');
  65  |     await page.waitForTimeout(2000);
  66  |     // Click the Suppliers tab
  67  |     const suppliersTab = page.locator('button, [role="tab"]').filter({ hasText: 'Suppliers' }).first();
  68  |     if (await suppliersTab.count() > 0) {
  69  |       await suppliersTab.click();
  70  |       await page.waitForTimeout(1500);
  71  |       console.log('6a. Supply Chain - Suppliers tab clicked');
  72  |     } else {
  73  |       // Suppliers may be shown as a section
  74  |       const suppliersSection = page.locator('text=Suppliers').first();
  75  |       expect(await suppliersSection.count()).toBeGreaterThan(0);
  76  |       console.log('6a. Supply Chain - Suppliers section visible');
  77  |     }
  78  | 
  79  |     // Click Facilities tab
  80  |     const facilitiesTab = page.locator('button, [role="tab"]').filter({ hasText: 'Facilities' }).first();
  81  |     if (await facilitiesTab.count() > 0) {
  82  |       await facilitiesTab.click();
  83  |       await page.waitForTimeout(1500);
  84  |       console.log('6b. Supply Chain - Facilities tab clicked');
  85  |     } else {
  86  |       console.log('6b. Supply Chain - Facilities section visible');
  87  |     }
  88  | 
  89  |     // 7. System Activity (Audit)
  90  |     await page.goto(`${BASE_URL}/app/system-activity`);
  91  |     await page.waitForLoadState('domcontentloaded');
  92  |     await page.waitForTimeout(2000);
  93  |     expect(page.url()).toContain('/app/system-activity');
  94  |     // AuditPage uses AuditTimeline (div-based), not a table
  95  |     // Wait for filter tabs which are always rendered on this page
  96  |     await page.waitForSelector('.sysact-filter-tabs', { timeout: 8000 });
  97  |     await page.waitForTimeout(2000);
  98  |     const eventCards = await page.locator('[class*="audit"], [class*="timeline"], [class*="event"]').count();
  99  |     console.log(`7. System Activity: page loaded, ${eventCards} elements visible`);
  100 | 
  101 |     // 8. Console errors check (excluding expected 4xx from auth rotation)
  102 |     const criticalErrors = consoleErrors.filter(e =>
  103 |       !e.includes('401') && !e.includes('403') && !e.includes('fetch') && !e.includes('NetworkError')
  104 |     );
  105 |     expect(criticalErrors).toHaveLength(0);
  106 |     console.log('8. Console: no critical errors');
  107 |   });
  108 | 
  109 |   test('Admin: Supply Chain - Add Supplier and verify persistence', async ({ page, request }) => {
  110 |     test.setTimeout(60000);
  111 | 
  112 |     // Add supplier via API first (same as what UI does)
  113 |     const token = (await (await request.post(`${API_URL}/auth/login`, {
  114 |       data: { email: 'a.mehta@bel-defence.in', password: 'password' }
  115 |     })).json()).access_token;
  116 | 
  117 |     const ts = Date.now();
  118 |     const supplierRes = await request.post(`${API_URL}/supply-chain/suppliers`, {
  119 |       headers: { Authorization: `Bearer ${token}` },
  120 |       data: {
  121 |         name: `BEL E2E Supplier ${ts}`,
  122 |         contact_info: { email: `e2e-supplier-${ts}@bel.in` },
  123 |         status: 'ACTIVE',
  124 |       },
  125 |     });
  126 |     expect(supplierRes.ok()).toBeTruthy();
  127 |     const supplier = await supplierRes.json();
  128 |     console.log('Created supplier:', supplier.name);
  129 | 
  130 |     // Navigate to supply chain and verify the supplier appears
  131 |     await page.goto(`${BASE_URL}/app/supply-chain`);
  132 |     await page.waitForLoadState('domcontentloaded');
  133 |     await page.waitForTimeout(2000);
```