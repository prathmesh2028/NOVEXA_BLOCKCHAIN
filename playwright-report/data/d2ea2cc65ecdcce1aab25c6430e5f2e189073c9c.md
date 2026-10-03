# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> KavachTrust E2E Flow >> UI: Frontend starts
- Location: e2e\api.spec.ts:71:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('body')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" locator('body') with timeout 5000ms
  - waiting for locator('body')
    14 × locator resolved to <body>…</body>
       - unexpected value "hidden"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('KavachTrust E2E Flow', () => {
  4   |   let systemAdminToken: string;
  5   |   let qualityInspectorToken: string;
  6   |   let procurementOfficerToken: string;
  7   |   let auditorToken: string;
  8   | 
  9   |   test.beforeAll(async ({ request }) => {
  10  |     // Use real database-backed test users
  11  |     const systemAdminRes = await request.post('http://localhost:8000/api/v1/auth/login', {
  12  |       data: { email: 'admin@kavachtrust.dev', password: 'admin123' }
  13  |     });
  14  |     if (systemAdminRes.ok()) systemAdminToken = (await systemAdminRes.json()).access_token;
  15  | 
  16  |     const qualityInspectorRes = await request.post('http://localhost:8000/api/v1/auth/login', {
  17  |       data: { email: 'inspector@kavachtrust.dev', password: 'inspector123' }
  18  |     });
  19  |     if (qualityInspectorRes.ok()) qualityInspectorToken = (await qualityInspectorRes.json()).access_token;
  20  | 
  21  |     const procurementOfficerRes = await request.post('http://localhost:8000/api/v1/auth/login', {
  22  |       data: { email: 'procurement@kavachtrust.dev', password: 'procurement123' }
  23  |     });
  24  |     if (procurementOfficerRes.ok()) procurementOfficerToken = (await procurementOfficerRes.json()).access_token;
  25  | 
  26  |     // Auditor role - create if needed or use existing
  27  |     const auditorRes = await request.post('http://localhost:8000/api/v1/auth/login', {
  28  |       data: { email: 'auditor@kavachtrust.dev', password: 'auditor123' }
  29  |     });
  30  |     if (auditorRes.ok()) auditorToken = (await auditorRes.json()).access_token;
  31  |   });
  32  | 
  33  |   test('AUTH: Reject invalid credentials', async ({ request }) => {
  34  |     const res = await request.post('http://localhost:8000/api/v1/auth/login', {
  35  |       data: { email: 'a.mehta@bel-defence.in', password: 'wrongpassword' }
  36  |     });
  37  |     expect(res.status()).toBe(401);
  38  |   });
  39  | 
  40  |   test('AUTHORIZATION: Quality Inspector denied certification action', async ({ request }) => {
  41  |     test.skip(!qualityInspectorToken, 'No token available');
  42  |     const res = await request.post('http://localhost:8000/api/v1/certifications', {
  43  |       headers: { Authorization: `Bearer ${qualityInspectorToken}` },
  44  |       data: { assetId: 'SOME-ID' }
  45  |     });
  46  |     // Quality Inspector should not be able to create certifications
  47  |     // Either 403 (forbidden) or 400 (bad request due to missing fields) is acceptable
  48  |     expect([400, 403]).toContain(res.status());
  49  |   });
  50  | 
  51  |   test('QUALITY_INSPECTOR: Can view assets', async ({ request }) => {
  52  |     test.skip(!qualityInspectorToken, 'No token available');
  53  |     const res = await request.get('http://localhost:8000/api/v1/assets', {
  54  |       headers: { Authorization: `Bearer ${qualityInspectorToken}` }
  55  |     });
  56  |     expect(res.ok()).toBeTruthy();
  57  |     const body = await res.json();
  58  |     expect(Array.isArray(body.items)).toBe(true);
  59  |   });
  60  | 
  61  |   test('SYSTEM_ADMIN: Can view users', async ({ request }) => {
  62  |     test.skip(!systemAdminToken, 'No token available');
  63  |     const res = await request.get('http://localhost:8000/api/v1/users', {
  64  |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  65  |     });
  66  |     expect(res.ok()).toBeTruthy();
  67  |     const body = await res.json();
  68  |     expect(Array.isArray(body.items)).toBe(true);
  69  |   });
  70  | 
  71  |   test('UI: Frontend starts', async ({ page }) => {
  72  |     await page.goto('http://localhost:8443');
> 73  |     await expect(page.locator('body')).toBeVisible();
      |                                        ^ Error: expect(locator).toBeVisible() failed
  74  |   });
  75  | 
  76  |   test('E2E: Create asset with real API', async ({ request }) => {
  77  |     test.skip(!procurementOfficerToken, 'No procurement token available');
  78  |     
  79  |     const assetId = `E2E-TEST-${Date.now()}`;
  80  |     const res = await request.post('http://localhost:8000/api/v1/assets', {
  81  |       headers: { Authorization: `Bearer ${procurementOfficerToken}` },
  82  |       data: {
  83  |         assetId,
  84  |         type: 'Test Component',
  85  |         model: 'E2E-TEST-MODEL',
  86  |         serialNumber: `SN-E2E-${Date.now()}`,
  87  |         supplier: 'E2E Test Supplier',
  88  |         batchId: 'E2E-BATCH-001',
  89  |         description: 'E2E test asset for Phase 4 verification'
  90  |       }
  91  |     });
  92  |     
  93  |     expect(res.ok()).toBeTruthy();
  94  |     const created = await res.json();
  95  |     expect(created.asset_id).toBe(assetId);
  96  |     
  97  |     // Verify asset persists by reading it back
  98  |     const getRes = await request.get(`http://localhost:8000/api/v1/assets/${created.id}`, {
  99  |       headers: { Authorization: `Bearer ${procurementOfficerToken}` }
  100 |     });
  101 |     expect(getRes.ok()).toBeTruthy();
  102 |     const fetched = await getRes.json();
  103 |     expect(fetched.asset_id).toBe(assetId);
  104 |   });
  105 | 
  106 |   test('E2E: Create supplier and facility', async ({ request }) => {
  107 |     test.skip(!procurementOfficerToken, 'No procurement token available');
  108 |     
  109 |     const supplierRes = await request.post('http://localhost:8000/api/v1/supply-chain/suppliers', {
  110 |       headers: { Authorization: `Bearer ${procurementOfficerToken}` },
  111 |       data: {
  112 |         supplierId: `E2E-SUPP-${Date.now()}`,
  113 |         name: 'E2E Test Supplier',
  114 |         contactInfo: {
  115 |           type: 'Test Supplier',
  116 |           address: 'Test Location',
  117 |           contactEmail: 'e2e@test.com',
  118 |           contactPhone: '+1234567890',
  119 |           contactPerson: 'E2E Tester'
  120 |         }
  121 |       }
  122 |     });
  123 |     
  124 |     expect(supplierRes.ok()).toBeTruthy();
  125 |     const supplier = await supplierRes.json();
  126 |     expect(supplier.supplierId).toBeDefined();
  127 |     
  128 |     // Create facility linked to supplier
  129 |     const facilityRes = await request.post('http://localhost:8000/api/v1/supply-chain/facilities', {
  130 |       headers: { Authorization: `Bearer ${procurementOfficerToken}` },
  131 |       data: {
  132 |         facilityId: `E2E-FAC-${Date.now()}`,
  133 |         supplierId: supplier.id,
  134 |         name: 'E2E Test Facility',
  135 |         location: 'Test Warehouse',
  136 |         type: 'Warehouse'
  137 |       }
  138 |     });
  139 |     
  140 |     expect(facilityRes.ok()).toBeTruthy();
  141 |   });
  142 | 
  143 |   test('E2E: Create lot', async ({ request }) => {
  144 |     test.skip(!procurementOfficerToken, 'No procurement token available');
  145 |     
  146 |     const lotRes = await request.post('http://localhost:8000/api/v1/supply-chain/lots', {
  147 |       headers: { Authorization: `Bearer ${procurementOfficerToken}` },
  148 |       data: {
  149 |         lotId: `E2E-LOT-${Date.now()}`,
  150 |         supplierId: 'E2E-SUPP-TEST', // Use existing or create first
  151 |         materialType: 'Test Material',
  152 |         quantity: 100
  153 |       }
  154 |     });
  155 |     
  156 |     // May fail if supplier doesn't exist, but test verifies API endpoint
  157 |     expect([200, 201, 400, 404]).toContain(lotRes.status());
  158 |   });
  159 | 
  160 |   test('E2E: Auth reject demo-token in REAL mode', async ({ request }) => {
  161 |     const res = await request.get('http://localhost:8000/api/v1/assets', {
  162 |       headers: { Authorization: 'Bearer demo-token' }
  163 |     });
  164 |     expect(res.status()).toBe(401);
  165 |   });
  166 | 
  167 |   test('E2E: Auth reject missing token', async ({ request }) => {
  168 |     const res = await request.get('http://localhost:8000/api/v1/assets');
  169 |     expect(res.status()).toBe(401);
  170 |   });
  171 | 
  172 |   test('VERIFICATION: Valid asset ID returns real verification result', async ({ request }) => {
  173 |     test.skip(!systemAdminToken, 'No admin token available');
```