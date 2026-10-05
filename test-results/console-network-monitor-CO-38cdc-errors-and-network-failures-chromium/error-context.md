# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: console-network-monitor.spec.ts >> CONSOLE + NETWORK MONITORING >> Monitor console errors and network failures
- Location: e2e\console-network-monitor.spec.ts:8:3

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 8
Received array:  ["Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.", "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.", "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.", "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.", "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.", "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.", "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.", "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:8443';
  4  | 
  5  | test.describe('CONSOLE + NETWORK MONITORING', () => {
  6  |   test.use({ storageState: '.auth/procurement-storage.json' });
  7  | 
  8  |   test('Monitor console errors and network failures', async ({ page }) => {
  9  |     const consoleErrors: string[] = [];
  10 |     const networkErrors: string[] = [];
  11 | 
  12 |     // Capture console errors
  13 |     page.on('console', msg => {
  14 |       if (msg.type() === 'error') {
  15 |         consoleErrors.push(msg.text());
  16 |       }
  17 |     });
  18 | 
  19 |     // Capture network failures
  20 |     page.on('response', response => {
  21 |       if (response.status() >= 400) {
  22 |         networkErrors.push(`${response.status()} - ${response.url()}`);
  23 |       }
  24 |     });
  25 | 
  26 |     // Navigate through key pages
  27 |     await page.goto(`${BASE_URL}/app/certifications`);
  28 |     await page.waitForLoadState('domcontentloaded');
  29 |     await page.waitForTimeout(3000);
  30 | 
  31 |     await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
  32 |     await page.waitForLoadState('domcontentloaded');
  33 |     await page.waitForTimeout(3000);
  34 | 
  35 |     await page.goto(`${BASE_URL}/app/blockchain`);
  36 |     await page.waitForLoadState('domcontentloaded');
  37 |     await page.waitForTimeout(3000);
  38 | 
  39 |     await page.goto(`${BASE_URL}/app/system-activity`);
  40 |     await page.waitForLoadState('domcontentloaded');
  41 |     await page.waitForTimeout(3000);
  42 | 
  43 |     // Check for critical errors (filter out known harmless ones)
  44 |     const criticalErrors = consoleErrors.filter(e =>
  45 |       !e.includes('401') &&
  46 |       !e.includes('DevTools') &&
  47 |       !e.includes('Download the React DevTools')
  48 |     );
  49 | 
  50 |     const criticalNetworkErrors = networkErrors.filter(e =>
  51 |       !e.includes('401') &&
  52 |       !e.includes('CORS')
  53 |     );
  54 | 
  55 |     console.log('Console errors:', consoleErrors);
  56 |     console.log('Network errors:', networkErrors);
  57 | 
> 58 |     expect(criticalErrors).toHaveLength(0);
     |                            ^ Error: expect(received).toHaveLength(expected)
  59 |     expect(criticalNetworkErrors).toHaveLength(0);
  60 |   });
  61 | });
  62 | 
```