# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auditor-full-journey.spec.ts >> AUDITOR - Full UI Journey >> Auditor: Dashboard → System Activity → Evidence Integrity → Blockchain Proof → Cert Detail
- Location: e2e\auditor-full-journey.spec.ts:13:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('.sysact-filter-tabs') to be visible

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
  10  | test.describe('AUDITOR - Full UI Journey', () => {
  11  |   test.use({ storageState: '.auth/auditor-storage.json' });
  12  | 
  13  |   test('Auditor: Dashboard → System Activity → Evidence Integrity → Blockchain Proof → Cert Detail', async ({ page }) => {
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
  27  |     // 2. System Activity (Audit Trail)
  28  |     await page.goto(`${BASE_URL}/app/system-activity`);
  29  |     await page.waitForLoadState('domcontentloaded');
  30  |     await page.waitForTimeout(2000);
  31  |     expect(page.url()).toContain('/app/system-activity');
  32  |     // AuditPage uses AuditTimeline (div-based), not a table
> 33  |     await page.waitForSelector('.sysact-filter-tabs', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  34  |     await page.waitForTimeout(2000);
  35  |     const eventCards = await page.locator('[class*="audit"], [class*="timeline"], [class*="event"]').count();
  36  |     console.log(`2. System Activity: page loaded, ${eventCards} elements visible`);
  37  | 
  38  |     // 3. Click "View Details" on first audit event
  39  |     const viewDetailsBtn = page.locator('button, a').filter({ hasText: 'View Details' }).first();
  40  |     if (await viewDetailsBtn.count() > 0) {
  41  |       await viewDetailsBtn.click();
  42  |       await page.waitForTimeout(1000);
  43  |       // Dismiss any modal/panel
  44  |       const closeBtn = page.locator('button').filter({ hasText: '✕' }).or(
  45  |         page.locator('button').filter({ hasText: 'Close' })
  46  |       ).first();
  47  |       if (await closeBtn.count() > 0) await closeBtn.click();
  48  |       console.log('3. View Details on audit event: OK');
  49  |     } else {
  50  |       console.log('3. No View Details button found — skipping');
  51  |     }
  52  | 
  53  |     // 4. Verification Center
  54  |     await page.goto(`${BASE_URL}/app/verification`);
  55  |     await page.waitForLoadState('domcontentloaded');
  56  |     await page.waitForTimeout(2000);
  57  |     expect(page.url()).toContain('/app/verification');
  58  |     console.log('4. Verification Center: OK');
  59  | 
  60  |     // 5. Evidence Integrity
  61  |     await page.goto(`${BASE_URL}/app/evidence-integrity`);
  62  |     await page.waitForLoadState('domcontentloaded');
  63  |     await page.waitForTimeout(2000);
  64  |     expect(page.url()).toContain('/app/evidence-integrity');
  65  |     console.log('5. Evidence Integrity: OK');
  66  | 
  67  |     // 6. Certifications list — auditor can access
  68  |     await page.goto(`${BASE_URL}/app/certifications`);
  69  |     await page.waitForLoadState('domcontentloaded');
  70  |     await page.waitForTimeout(2000);
  71  |     await page.waitForSelector('text=CERT-', { timeout: 10000 });
  72  |     console.log('6. Certifications list: visible');
  73  | 
  74  |     // 7. Cert Detail — navigate to known cert
  75  |     await page.goto(`${BASE_URL}/app/certifications/${KNOWN_CERT_ID}`);
  76  |     await page.waitForLoadState('domcontentloaded');
  77  |     await page.waitForSelector(`text=${KNOWN_CERT_ID}`, { timeout: 10000 });
  78  |     // Verify blockchain section
  79  |     await page.waitForSelector('text=Blockchain Information', { timeout: 8000 });
  80  |     await page.waitForSelector('text=Token ID', { timeout: 8000 });
  81  |     // Verify QR code
  82  |     await page.waitForSelector('img[alt="Certificate QR Code"]', { timeout: 8000 });
  83  |     console.log(`7. Cert detail (${KNOWN_CERT_ID}): blockchain + QR visible`);
  84  | 
  85  |     // 8. Blockchain page
  86  |     await page.goto(`${BASE_URL}/app/blockchain`);
  87  |     await page.waitForLoadState('domcontentloaded');
  88  |     await page.waitForTimeout(2000);
  89  |     expect(page.url()).toContain('/app/blockchain');
  90  |     console.log('8. Blockchain page: OK');
  91  | 
  92  |     // 9. Blockchain Proof page
  93  |     await page.goto(`${BASE_URL}/app/blockchain-proof`);
  94  |     await page.waitForLoadState('domcontentloaded');
  95  |     await page.waitForTimeout(1500);
  96  |     expect(page.url()).toContain('/app/blockchain-proof');
  97  |     console.log('9. Blockchain Proof page: OK');
  98  | 
  99  |     // 10. Console error check
  100 |     const criticalErrors = consoleErrors.filter(e =>
  101 |       !e.includes('401') && !e.includes('403') && !e.includes('fetch') && !e.includes('NetworkError')
  102 |     );
  103 |     expect(criticalErrors).toHaveLength(0);
  104 |     console.log(`10. Console: no critical errors (${consoleErrors.length} non-critical)`);
  105 |   });
  106 | 
  107 |   test('Auditor: Verify Evidence Integrity check workflow', async ({ page, request }) => {
  108 |     test.setTimeout(60000);
  109 | 
  110 |     // Get a known evidence ID via API
  111 |     const token = (await (await request.post(`${API_URL}/auth/login`, {
  112 |       data: { email: 'd.nair@bel-defence.in', password: 'password' }
  113 |     })).json()).access_token;
  114 | 
  115 |     const evidenceRes = await request.get(`${API_URL}/evidence`, {
  116 |       headers: { Authorization: `Bearer ${token}` },
  117 |     });
  118 |     expect(evidenceRes.ok()).toBeTruthy();
  119 |     const evidence = await evidenceRes.json();
  120 |     const firstEvidence = evidence.items?.[0];
  121 |     expect(firstEvidence).toBeTruthy();
  122 |     console.log(`Found evidence: ${firstEvidence.evidenceId || firstEvidence.id}`);
  123 | 
  124 |     // Navigate to evidence integrity page and verify it loads
  125 |     await page.goto(`${BASE_URL}/app/evidence-integrity`);
  126 |     await page.waitForLoadState('domcontentloaded');
  127 |     await page.waitForTimeout(2000);
  128 |     expect(page.url()).toContain('/app/evidence-integrity');
  129 | 
  130 |     // Verify the page has the verify button
  131 |     const verifyBtn = page.locator('button').filter({ hasText: /verify/i }).first();
  132 |     expect(await verifyBtn.count()).toBeGreaterThan(0);
  133 |     console.log('Evidence Integrity page: verify button present');
```