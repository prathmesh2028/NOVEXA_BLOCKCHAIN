import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';
const API_URL = 'http://localhost:8000/api/v1';

// Known confirmed cert from the DB
const KNOWN_CERT_ID = 'CERT-2026-24767';
const KNOWN_CERT_UUID = '73771de4-8b74-4045-92e4-9b854b7bd48a';

test.describe('AUDITOR - Full UI Journey', () => {
  test.use({ storageState: '.auth/auditor-storage.json' });

  test('Auditor: Dashboard → System Activity → Evidence Integrity → Blockchain Proof → Cert Detail', async ({ page }) => {
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

    // 2. System Activity (Audit Trail)
    await page.goto(`${BASE_URL}/app/system-activity`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/app/system-activity');
    // AuditPage uses AuditTimeline (div-based), not a table
    await page.waitForSelector('.sysact-filter-tabs', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const eventCards = await page.locator('[class*="audit"], [class*="timeline"], [class*="event"]').count();
    console.log(`2. System Activity: page loaded, ${eventCards} elements visible`);

    // 3. Click "View Details" on first audit event
    const viewDetailsBtn = page.locator('button, a').filter({ hasText: 'View Details' }).first();
    if (await viewDetailsBtn.count() > 0) {
      await viewDetailsBtn.click();
      await page.waitForTimeout(1000);
      // Dismiss any modal/panel
      const closeBtn = page.locator('button').filter({ hasText: '✕' }).or(
        page.locator('button').filter({ hasText: 'Close' })
      ).first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      console.log('3. View Details on audit event: OK');
    } else {
      console.log('3. No View Details button found — skipping');
    }

    // 4. Verification Center
    await page.goto(`${BASE_URL}/app/verification`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/app/verification');
    console.log('4. Verification Center: OK');

    // 5. Evidence Integrity
    await page.goto(`${BASE_URL}/app/evidence-integrity`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/app/evidence-integrity');
    console.log('5. Evidence Integrity: OK');

    // 6. Certifications list — auditor can access
    await page.goto(`${BASE_URL}/app/certifications`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.waitForSelector('text=CERT-', { timeout: 10000 });
    console.log('6. Certifications list: visible');

    // 7. Cert Detail — navigate to known cert
    await page.goto(`${BASE_URL}/app/certifications/${KNOWN_CERT_ID}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(`text=${KNOWN_CERT_ID}`, { timeout: 10000 });
    // Verify blockchain section
    await page.waitForSelector('text=Blockchain Information', { timeout: 8000 });
    await page.waitForSelector('text=Token ID', { timeout: 8000 });
    // Verify QR code
    await page.waitForSelector('img[alt="Certificate QR Code"]', { timeout: 8000 });
    console.log(`7. Cert detail (${KNOWN_CERT_ID}): blockchain + QR visible`);

    // 8. Blockchain page
    await page.goto(`${BASE_URL}/app/blockchain`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/app/blockchain');
    console.log('8. Blockchain page: OK');

    // 9. Blockchain Proof page
    await page.goto(`${BASE_URL}/app/blockchain-proof`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/app/blockchain-proof');
    console.log('9. Blockchain Proof page: OK');

    // 10. Console error check
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('401') && !e.includes('403') && !e.includes('fetch') && !e.includes('NetworkError')
    );
    expect(criticalErrors).toHaveLength(0);
    console.log(`10. Console: no critical errors (${consoleErrors.length} non-critical)`);
  });

  test('Auditor: Verify Evidence Integrity check workflow', async ({ page, request }) => {
    test.setTimeout(60000);

    // Get a known evidence ID via API
    const token = (await (await request.post(`${API_URL}/auth/login`, {
      data: { email: 'd.nair@bel-defence.in', password: 'password' }
    })).json()).access_token;

    const evidenceRes = await request.get(`${API_URL}/evidence`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(evidenceRes.ok()).toBeTruthy();
    const evidence = await evidenceRes.json();
    const firstEvidence = evidence.items?.[0];
    expect(firstEvidence).toBeTruthy();
    console.log(`Found evidence: ${firstEvidence.evidenceId || firstEvidence.id}`);

    // Navigate to evidence integrity page and verify it loads
    await page.goto(`${BASE_URL}/app/evidence-integrity`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/app/evidence-integrity');

    // Verify the page has the verify button
    const verifyBtn = page.locator('button').filter({ hasText: /verify/i }).first();
    expect(await verifyBtn.count()).toBeGreaterThan(0);
    console.log('Evidence Integrity page: verify button present');
  });
});

