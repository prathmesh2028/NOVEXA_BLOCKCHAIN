import { test, expect } from '@playwright/test';

test.describe('CERTIFICATION CARDS CONTENT', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Check actual certification card content after loading demo data', async ({ page }) => {
    console.log('\n=== CERTIFICATION CARDS ===\n');

    // Login as Procurement
    await page.goto(BASE_URL + '/login');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Go to certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Load demo data
    await page.click('text=LOAD DEMO DATA');
    await page.waitForTimeout(3000);

    // Get the full page content
    const bodyText = await page.locator('body').innerText();
    console.log('Full page text (first 2000 chars):');
    console.log(bodyText.substring(0, 2000));

    // Look for any certification-like patterns
    console.log('\nSearching for patterns:');
    console.log('Contains "CERT":', bodyText.includes('CERT'));
    console.log('Contains "2026":', bodyText.includes('2026'));
    console.log('Contains "24767":', bodyText.includes('24767'));
    console.log('Contains "CONFIRMED":', bodyText.includes('CONFIRMED'));
    console.log('Contains "PENDING":', bodyText.includes('PENDING'));

    // Look for the View Details button and what's near it
    const viewDetailsBtn = page.locator('button:has-text("View Details")');
    const viewDetailsCount = await viewDetailsBtn.count();
    console.log('\nView Details buttons:', viewDetailsCount);

    if (viewDetailsCount > 0) {
      // Get parent element to see context
      const parent = await viewDetailsBtn.first().evaluateHandle(el => el.parentElement);
      const parentText = await parent.evaluate(el => el.textContent);
      console.log('View Details button context:', parentText?.substring(0, 500));
    }
  });
});
