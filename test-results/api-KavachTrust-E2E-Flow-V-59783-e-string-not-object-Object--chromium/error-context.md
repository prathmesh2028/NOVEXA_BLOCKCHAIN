# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> KavachTrust E2E Flow >> VERIFICATION: Regression - identifier must be string not [object Object]
- Location: e2e\api.spec.ts:265:3

# Error details

```
TypeError: Cannot read properties of undefined (reading '0')
```

# Test source

```ts
  173 |     test.skip(!systemAdminToken, 'No admin token available');
  174 | 
  175 |     // First get a real asset ID from the database
  176 |     const assetsRes = await request.get('http://localhost:8000/api/v1/assets', {
  177 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  178 |     });
  179 |     expect(assetsRes.ok()).toBeTruthy();
  180 |     const assets = await assetsRes.json();
  181 |     const assetId = assets.items[0]?.asset_id;
  182 |     test.skip(!assetId, 'No assets in database');
  183 | 
  184 |     // Verify the asset
  185 |     const verifRes = await request.get(`http://localhost:8000/api/v1/verification/asset/${assetId}`, {
  186 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  187 |     });
  188 |     expect(verifRes.ok()).toBeTruthy();
  189 |     const verif = await verifRes.json();
  190 | 
  191 |     // Verify response structure
  192 |     expect(verif.asset_id).toBe(assetId);
  193 |     expect(Array.isArray(verif.checks)).toBe(true);
  194 |     expect(verif.overall).toBeDefined();
  195 | 
  196 |     // Verify each check has required fields
  197 |     verif.checks.forEach((check: any) => {
  198 |       expect(check.domain).toBeDefined();
  199 |       expect(check.status).toBeDefined();
  200 |       expect(check.reason).toBeDefined();
  201 |     });
  202 |   });
  203 | 
  204 |   test('VERIFICATION: Invalid ID returns MISSING status', async ({ request }) => {
  205 |     test.skip(!systemAdminToken, 'No admin token available');
  206 | 
  207 |     const verifRes = await request.get('http://localhost:8000/api/v1/verification/asset/INVALID-ID-99999', {
  208 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  209 |     });
  210 |     expect(verifRes.ok()).toBeTruthy();
  211 |     const verif = await verifRes.json();
  212 | 
  213 |     expect(verif.overall).toBe('MISSING');
  214 |     expect(verif.checks).toHaveLength(1);
  215 |     expect(verif.checks[0].domain).toBe('asset');
  216 |     expect(verif.checks[0].status).toBe('MISSING');
  217 |   });
  218 | 
  219 |   test('VERIFICATION: Blockchain offline state is truthful', async ({ request }) => {
  220 |     test.skip(!systemAdminToken, 'No admin token available');
  221 | 
  222 |     // Get a real asset ID
  223 |     const assetsRes = await request.get('http://localhost:8000/api/v1/assets', {
  224 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  225 |     });
  226 |     expect(assetsRes.ok()).toBeTruthy();
  227 |     const assets = await assetsRes.json();
  228 |     const assetId = assets.items[0]?.asset_id;
  229 |     test.skip(!assetId, 'No assets in database');
  230 | 
  231 |     const verifRes = await request.get(`http://localhost:8000/api/v1/verification/asset/${assetId}`, {
  232 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  233 |     });
  234 |     expect(verifRes.ok()).toBeTruthy();
  235 |     const verif = await verifRes.json();
  236 | 
  237 |     // Find blockchain check
  238 |     const blockchainCheck = verif.checks.find((c: any) => c.domain === 'blockchain');
  239 |     expect(blockchainCheck).toBeDefined();
  240 | 
  241 |     // In offline mode, should show BLOCKCHAIN_UNAVAILABLE or UNVERIFIED with truthful message
  242 |     if (blockchainCheck.status === 'BLOCKCHAIN_UNAVAILABLE') {
  243 |       expect(blockchainCheck.reason).toContain('offline');
  244 |     } else if (blockchainCheck.status === 'UNVERIFIED') {
  245 |       expect(blockchainCheck.reason).not.toContain('On-chain');
  246 |     }
  247 |   });
  248 | 
  249 |   test('VERIFICATION: Requires authentication', async ({ request }) => {
  250 |     const verifRes = await request.get('http://localhost:8000/api/v1/verification/asset/SOME-ID');
  251 |     expect(verifRes.status()).toBe(401);
  252 |   });
  253 | 
  254 |   test('VERIFICATION: Rejects demo-token', async ({ request }) => {
  255 |     const verifRes = await request.get('http://localhost:8000/api/v1/verification/asset/SOME-ID', {
  256 |       headers: { Authorization: 'Bearer demo-token' }
  257 |     });
  258 |     expect(verifRes.status()).toBe(401);
  259 |   });
  260 | 
  261 |   test('VERIFICATION: Browser UI handles verification flow', async ({ page, request }) => {
  262 |     test.skip(true, 'Skipping browser UI test - login selector timing issue, API-level verification verified in Phase 4.1/4.2/4.3');
  263 |   });
  264 | 
  265 |   test('VERIFICATION: Regression - identifier must be string not [object Object]', async ({ request }) => {
  266 |     test.skip(!systemAdminToken, 'No admin token available');
  267 | 
  268 |     // Get a real asset ID
  269 |     const assetsRes = await request.get('http://localhost:8000/api/v1/assets', {
  270 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  271 |     });
  272 |     const assets = await assetsRes.json();
> 273 |     const assetId = assets.items[0]?.asset_id;
      |                                 ^ TypeError: Cannot read properties of undefined (reading '0')
  274 |     test.skip(!assetId, 'No assets in database');
  275 | 
  276 |     // Verify the identifier is a valid string
  277 |     expect(typeof assetId).toBe('string');
  278 |     expect(assetId).not.toContain('[object Object]');
  279 | 
  280 |     // Verify API call with the actual identifier
  281 |     const verifRes = await request.get(`http://localhost:8000/api/v1/verification/asset/${assetId}`, {
  282 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  283 |     });
  284 |     expect(verifRes.ok()).toBeTruthy();
  285 | 
  286 |     // Verify asset API call with the actual identifier
  287 |     const assetRes = await request.get(`http://localhost:8000/api/v1/assets/${assetId}`, {
  288 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  289 |     });
  290 |     expect(assetRes.ok()).toBeTruthy();
  291 |   });
  292 | });
  293 | 
```