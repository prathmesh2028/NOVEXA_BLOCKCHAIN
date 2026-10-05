import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';

test.describe('ALL ROLE JOURNEYS', () => {
  test.describe('PROCUREMENT', () => {
    test.use({ storageState: '.auth/procurement-storage.json' });

    test('Procurement certification journey', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);

      expect(page.url()).toContain('/app/certifications/');
      const certId = await page.textContent('text=CERT-2026-24767');
      expect(certId).toContain('CERT-2026-24767');

      const pageContent = await page.content();
      expect(pageContent).toContain('Blockchain Information');
      expect(pageContent).toContain('Token ID');
      expect(pageContent).toContain('3');
    });
  });

  test.describe('AUDITOR', () => {
    test.use({ storageState: '.auth/auditor-storage.json' });

    test('Auditor certification journey', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);

      expect(page.url()).toContain('/app/certifications/');
      const certId = await page.textContent('text=CERT-2026-24767');
      expect(certId).toContain('CERT-2026-24767');

      const pageContent = await page.content();
      expect(pageContent).toContain('Blockchain Information');
      expect(pageContent).toContain('Token ID');
      expect(pageContent).toContain('3');
    });
  });

  test.describe('INSPECTOR', () => {
    test.use({ storageState: '.auth/inspector-storage.json' });

    test('Inspector certification journey', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);

      expect(page.url()).toContain('/app/certifications/');
      const certId = await page.textContent('text=CERT-2026-24767');
      expect(certId).toContain('CERT-2026-24767');

      const pageContent = await page.content();
      expect(pageContent).toContain('Blockchain Information');
      expect(pageContent).toContain('Token ID');
      expect(pageContent).toContain('3');
    });
  });

  test.describe('SYSTEM ADMIN', () => {
    test.use({ storageState: '.auth/admin-storage.json' });

    test('Admin certification journey', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);

      expect(page.url()).toContain('/app/certifications/');
      const certId = await page.textContent('text=CERT-2026-24767');
      expect(certId).toContain('CERT-2026-24767');

      const pageContent = await page.content();
      expect(pageContent).toContain('Blockchain Information');
      expect(pageContent).toContain('Token ID');
      expect(pageContent).toContain('3');
    });
  });
});
