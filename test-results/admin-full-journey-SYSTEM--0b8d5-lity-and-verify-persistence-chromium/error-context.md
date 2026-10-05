# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full-journey.spec.ts >> SYSTEM_ADMIN - Full UI Journey >> Admin: Supply Chain - Add Facility and verify persistence
- Location: e2e\admin-full-journey.spec.ts:148:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=BEL E2E Facility 1791179179027') to be visible

```

# Test source

```ts
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
  134 | 
  135 |     // Switch to suppliers tab or scroll to find it
  136 |     const suppliersTab = page.locator('button, [role="tab"]').filter({ hasText: 'Suppliers' }).first();
  137 |     if (await suppliersTab.count() > 0) {
  138 |       await suppliersTab.click();
  139 |       await page.waitForTimeout(1500);
  140 |     }
  141 | 
  142 |     await page.waitForSelector(`text=BEL E2E Supplier ${ts}`, { timeout: 10000 });
  143 |     const found = await page.locator(`text=BEL E2E Supplier ${ts}`).count();
  144 |     expect(found).toBeGreaterThan(0);
  145 |     console.log(`Supplier "BEL E2E Supplier ${ts}" persisted and visible in UI`);
  146 |   });
  147 | 
  148 |   test('Admin: Supply Chain - Add Facility and verify persistence', async ({ page, request }) => {
  149 |     test.setTimeout(60000);
  150 | 
  151 |     // Add facility via API
  152 |     const token = (await (await request.post(`${API_URL}/auth/login`, {
  153 |       data: { email: 'a.mehta@bel-defence.in', password: 'password' }
  154 |     })).json()).access_token;
  155 | 
  156 |     const ts = Date.now();
  157 |     // Facility requires an existing supplierId
  158 |     const supplierForFacility = await request.post(`${API_URL}/supply-chain/suppliers`, {
  159 |       headers: { Authorization: `Bearer ${token}` },
  160 |       data: { name: `BEL E2E Sup For Fac ${ts}`, contact_info: { email: `sup-fac-${ts}@bel.in` }, status: 'ACTIVE' },
  161 |     });
  162 |     const supplierData = await supplierForFacility.json();
  163 |     const supplierId = supplierData.id;
  164 | 
  165 |     const facilityRes = await request.post(`${API_URL}/supply-chain/facilities`, {
  166 |       headers: { Authorization: `Bearer ${token}` },
  167 |       data: {
  168 |         name: `BEL E2E Facility ${ts}`,
  169 |         location: `Test Location ${ts}`,
  170 |         type: 'MANUFACTURING',
  171 |         status: 'OPERATIONAL',
  172 |         supplierId,
  173 |       },
  174 |     });
  175 |     expect(facilityRes.ok()).toBeTruthy();
  176 |     const facility = await facilityRes.json();
  177 |     console.log('Created facility:', facility.name);
  178 | 
  179 |     // Navigate to supply chain and verify the facility appears
  180 |     await page.goto(`${BASE_URL}/app/supply-chain`);
  181 |     await page.waitForLoadState('domcontentloaded');
  182 |     await page.waitForTimeout(2000);
  183 | 
  184 |     // Switch to facilities tab
  185 |     const facilitiesTab = page.locator('button, [role="tab"]').filter({ hasText: 'Facilities' }).first();
  186 |     if (await facilitiesTab.count() > 0) {
  187 |       await facilitiesTab.click();
  188 |       await page.waitForTimeout(1500);
  189 |     }
  190 | 
> 191 |     await page.waitForSelector(`text=BEL E2E Facility ${ts}`, { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  192 |     const found = await page.locator(`text=BEL E2E Facility ${ts}`).count();
  193 |     expect(found).toBeGreaterThan(0);
  194 |     console.log(`Facility "BEL E2E Facility ${ts}" persisted and visible in UI`);
  195 |   });
  196 | });
  197 | 
```