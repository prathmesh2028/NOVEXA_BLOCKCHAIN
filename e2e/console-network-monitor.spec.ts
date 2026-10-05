import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('CONSOLE + NETWORK MONITORING', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Monitor console errors and network failures', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture network failures
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });

    // Navigate through key pages
    await page.goto(`${BASE_URL}/app/certifications`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/app/blockchain`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/app/system-activity`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for critical errors (filter out known harmless ones)
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('401') &&
      !e.includes('DevTools') &&
      !e.includes('Download the React DevTools')
    );

    const criticalNetworkErrors = networkErrors.filter(e =>
      !e.includes('401') &&
      !e.includes('CORS')
    );

    console.log('Console errors:', consoleErrors);
    console.log('Network errors:', networkErrors);

    expect(criticalErrors).toHaveLength(0);
    expect(criticalNetworkErrors).toHaveLength(0);
  });
});
