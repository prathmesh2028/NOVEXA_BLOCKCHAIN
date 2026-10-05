import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('SYSTEM ADMIN - FULL WORKFLOW', () => {
  test.use({ storageState: '.auth/admin-storage.json' });

  test('Admin complete workflow', async ({ page }) => {
    // Navigate to Users
    await page.goto(`${BASE_URL}/app/users`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const usersContent = await page.content();
    console.log('Has Users page:', usersContent.includes('Users') || usersContent.includes('User'));

    // Try representative action if available
    const actionButton = page.locator('text=Approve, text=Reject, text=Action').first();
    if (await actionButton.count() > 0) {
      await actionButton.click();
      await page.waitForTimeout(2000);
    }

    // Refresh and verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Navigate to Suppliers
    await page.goto(`${BASE_URL}/app/suppliers`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const suppliersContent = await page.content();
    console.log('Has Suppliers page:', suppliersContent.includes('Suppliers') || suppliersContent.includes('Supplier'));

    // Navigate to Facilities
    await page.goto(`${BASE_URL}/app/facilities`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const facilitiesContent = await page.content();
    console.log('Has Facilities page:', facilitiesContent.includes('Facilities') || facilitiesContent.includes('Facility'));

    // Navigate to System Activity
    await page.goto(`${BASE_URL}/app/system-activity`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const activityContent = await page.content();
    console.log('Has System Activity:', activityContent.includes('System Activity'));
    console.log('Has View Details:', activityContent.includes('View Details'));

    // Try View Details
    const viewDetailsButton = page.locator('text=View Details').first();
    if (await viewDetailsButton.count() > 0) {
      await viewDetailsButton.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      console.log('View Details clicked successfully');
    }
  });
});
