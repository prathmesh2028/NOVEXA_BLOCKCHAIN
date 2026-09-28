# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> KavachTrust E2E Flow >> VERIFICATION: Browser UI handles verification flow
- Location: e2e\api.spec.ts:261:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#login-email')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - link "NX BEL DEFENCE TRUST" [ref=e6] [cursor=pointer]:
        - /url: /
        - generic [ref=e7]: NX
        - generic [ref=e8]:
          - generic [ref=e9]: BEL
          - generic [ref=e10]: DEFENCE TRUST
      - button "Switch to light theme" [ref=e12] [cursor=pointer]
  - generic:
    - generic:
      - img:
        - generic: New Delhi
        - generic: Ladakh
        - generic: Mumbai
        - generic: Pune
        - generic: Bengaluru
        - generic: Hyderabad
        - generic: Visakhapatnam
        - generic: Kolkata
        - generic: Kochi
        - generic: Chennai
  - generic [ref=e20]:
    - generic [ref=e21]:
      - generic [ref=e22]: BEL • DEFENCE TECHNOLOGY • SECURE DIGITAL TRUST
      - generic [ref=e23]: BEL DEFENCE TRUST • PS 26125 • INDIA
      - heading "BEL DEFENCE TRUST BLOCKCHAIN-SECURED PLATFORM FOR INDIA'S DEFENCE ASSETS" [level=1] [ref=e26]:
        - generic [ref=e27]: BEL DEFENCE TRUST
        - generic [ref=e28]: BLOCKCHAIN-SECURED PLATFORM
        - generic [ref=e29]: FOR INDIA'S DEFENCE ASSETS
      - paragraph [ref=e30]: Secure, traceable and verifiable digital trust for mission-critical defence assets.
      - generic [ref=e31]:
        - link "Access Platform →" [ref=e32] [cursor=pointer]:
          - /url: /login
          - generic [ref=e33]: Access Platform
          - generic [ref=e34]: →
        - button "Watch Overview" [ref=e35] [cursor=pointer]
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]: ◈
          - generic [ref=e40]:
            - generic [ref=e41]: TRUST
            - generic [ref=e42]: Immutable Records
        - generic [ref=e43]:
          - generic [ref=e44]: ◎
          - generic [ref=e45]:
            - generic [ref=e46]: TRANSPARENCY
            - generic [ref=e47]: End-to-End Visibility
        - generic [ref=e48]:
          - generic [ref=e49]: ◫
          - generic [ref=e50]:
            - generic [ref=e51]: SECURITY
            - generic [ref=e52]: Role-Based Access
        - generic [ref=e53]:
          - generic [ref=e54]: ◆
          - generic [ref=e55]:
            - generic [ref=e56]: SOVEREIGN
            - generic [ref=e57]: Built for Bharat
    - generic [ref=e59]:
      - generic [ref=e60]:
        - generic [ref=e62]:
          - generic [ref=e63]: "NODE: NOVEXA-01 • ENCRYPTED • LIVE"
          - generic [ref=e66]: SIH 2026 • PS 26125
        - generic [ref=e68]:
          - 'generic "Sector 1: Alpha Contact (28.6° N)" [ref=e76]'
          - 'generic "Sector 3: Sensor Array (19.1° N)" [ref=e77]'
          - 'generic "Sector 4: Communications Relay" [ref=e78]'
          - generic "Target Lock Engaged · Sector 1"
        - generic [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]: LAT
            - generic [ref=e83]: 28.6139° N
          - generic [ref=e84]:
            - generic [ref=e85]: LON
            - generic [ref=e86]: 77.2090° E
          - generic [ref=e87]:
            - generic [ref=e88]: ALT
            - generic [ref=e89]: 11,400 M
          - generic [ref=e90]:
            - generic [ref=e91]: SPD
            - generic [ref=e92]: MACH 1.8
          - generic [ref=e93]:
            - generic [ref=e94]: HDG
            - generic [ref=e95]: 042°
        - generic [ref=e96]:
          - generic [ref=e97]: ✓ SYSTEMS ONLINE
          - generic [ref=e98]: ✓ BLOCKCHAIN SYNCED
          - generic [ref=e99]: ✓ DATA ENCRYPTED
          - generic [ref=e100]: ✓ THREAT MONITORING
        - generic [ref=e101]:
          - generic [ref=e102]: "STATUS: ACTIVE"
          - generic [ref=e105]: "AZ: 078°"
      - generic [ref=e108]:
        - generic [ref=e109]:
          - generic [ref=e110]: TRUST VERIFICATION CHAIN
          - generic [ref=e111]: ON-CHAIN CONSENSUS
        - generic [ref=e112]:
          - generic [ref=e115]:
            - generic [ref=e118]: ASSET
            - generic [ref=e119]: Registered
          - generic [ref=e120]:
            - generic [ref=e123]: VERIFY
            - generic [ref=e124]: SHA-256
          - generic [ref=e125]:
            - generic [ref=e128]: BLOCKCHAIN
            - generic [ref=e129]: Minted
          - generic [ref=e130]:
            - generic [ref=e133]: AUDIT
            - generic [ref=e134]: Logged
          - generic [ref=e135]:
            - generic [ref=e138]: TRUST
            - generic [ref=e139]: Certified
      - generic [ref=e142]:
        - generic [ref=e143]:
          - generic [ref=e144]: LIVE SYSTEM MONITOR
          - generic [ref=e145]: OPERATIONAL • SECURE
        - generic [ref=e148]:
          - generic [ref=e149]:
            - generic [ref=e150]:
              - generic [ref=e151]: ⊞
              - generic [ref=e152]:
                - generic [ref=e153]: Platform Core
                - generic [ref=e154]: "Latency: 13 ms"
            - generic [ref=e155]: Operational
          - generic [ref=e158]:
            - generic [ref=e159]:
              - generic [ref=e160]: ◉
              - generic [ref=e161]:
                - generic [ref=e162]: Identity Service (DID)
                - generic [ref=e163]: Gov Credential OK
            - generic [ref=e164]: Verified
          - generic [ref=e167]:
            - generic [ref=e168]:
              - generic [ref=e169]: ⬡
              - generic [ref=e170]:
                - generic [ref=e171]: Blockchain Trust Chain
                - generic [ref=e172]: "Block #4,892,114"
            - generic [ref=e173]: Synced
          - generic [ref=e176]:
            - generic [ref=e177]:
              - generic [ref=e178]: ◫
              - generic [ref=e179]:
                - generic [ref=e180]: Evidence Store
                - generic [ref=e181]: 1,096 Anchored
            - generic [ref=e182]: Healthy
      - generic [ref=e193]:
        - generic [ref=e194]: DEFENCE INNOVATION FOR A SELF-RELIANT INDIA
        - generic [ref=e195]: BHARAT • SURAKSHIT • SAMPANN • SASHAKT
  - generic [ref=e198]:
    - generic [ref=e199]:
      - generic [ref=e200]: "847"
      - generic [ref=e201]: Assets Registered
      - generic [ref=e202]: Hardware & Component Registry
    - generic [ref=e203]:
      - generic [ref=e204]: "312"
      - generic [ref=e205]: Certifications Issued
      - generic [ref=e206]: Non-Transferable NFT Proofs
    - generic [ref=e207]:
      - generic [ref=e208]: 2,411
      - generic [ref=e209]: Blockchain Transactions
      - generic [ref=e210]: NOVEXA Distributed Trust Chain
    - generic [ref=e211]:
      - generic [ref=e212]: 1,096
      - generic [ref=e213]: Evidence Records Verified
      - generic [ref=e214]: SHA-256 Tamper-Proof Fingerprints
  - generic [ref=e215]:
    - generic [ref=e216]: NOVEXA DEFENCE TRUST | DIGITAL INDIA | ATMANIRBHAR BHARAT
    - generic [ref=e217]: SECURE • VERIFIABLE • ACCOUNTABLE • FOR A SAFER TOMORROW
  - contentinfo [ref=e218]:
    - generic [ref=e219]:
      - generic [ref=e220]:
        - generic [ref=e221]:
          - generic [ref=e222]: NOVEXA DEFENCE TRUST
          - generic [ref=e223]: Blockchain-based secure platform for identity, access control, and digital asset management. SIH 2026 PS 26125.
          - generic [ref=e224]: SYNTHETIC DEMONSTRATION DATA
        - generic [ref=e225]:
          - generic [ref=e226]: Platform
          - generic [ref=e227]: Asset Management
          - generic [ref=e228]: Evidence Integrity
          - generic [ref=e229]: Certification
          - generic [ref=e230]: Blockchain
          - generic [ref=e231]: Audit
        - generic [ref=e232]:
          - generic [ref=e233]: Roles
          - generic [ref=e234]: Administrator
          - generic [ref=e235]: NFT Creator
          - generic [ref=e236]: Technician
          - generic [ref=e237]: Auditor
        - generic [ref=e238]:
          - generic [ref=e239]: Trust Chain
          - generic [ref=e240]:
            - generic [ref=e241]:
              - generic [ref=e242]: ↓
              - text: Identity
            - generic [ref=e243]:
              - generic [ref=e244]: ↓
              - text: Role
            - generic [ref=e245]:
              - generic [ref=e246]: ↓
              - text: Permission
            - generic [ref=e247]:
              - generic [ref=e248]: ↓
              - text: Asset
            - generic [ref=e249]:
              - generic [ref=e250]: ↓
              - text: Evidence
            - generic [ref=e251]:
              - generic [ref=e252]: ↓
              - text: Lifecycle
            - generic [ref=e253]:
              - generic [ref=e254]: ↓
              - text: Certification
            - generic [ref=e255]:
              - generic [ref=e256]: ↓
              - text: Blockchain
            - generic [ref=e257]:
              - generic [ref=e258]: ↓
              - text: Audit
            - generic [ref=e259]:
              - generic [ref=e260]: ↓
              - text: Verification
      - generic [ref=e261]:
        - generic [ref=e262]: © 2026 NOVEXA Defence Trust. Synthetic demonstration prototype. Non-classified.
        - generic [ref=e263]: SIH 2026 · PS 26125 · Blockchain-Based Secure Platform
```

# Test source

```ts
  172 |   test('VERIFICATION: Valid asset ID returns real verification result', async ({ request }) => {
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
  262 |     // Get a real asset ID from API first
  263 |     const assetsRes = await request.get('http://localhost:8000/api/v1/assets', {
  264 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  265 |     });
  266 |     const assets = await assetsRes.json();
  267 |     const assetId = assets.items[0]?.asset_id;
  268 |     test.skip(!assetId, 'No assets in database');
  269 | 
  270 |     // Login via UI using correct selectors
  271 |     await page.goto('http://localhost:8443');
> 272 |     await page.fill('#login-email', 'admin@kavachtrust.dev');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  273 |     await page.fill('#login-password', 'admin123');
  274 |     await page.click('.cmd-submit-btn');
  275 | 
  276 |     // Wait for navigation to dashboard
  277 |     await page.waitForURL('**/dashboard', { timeout: 5000 });
  278 | 
  279 |     // Navigate to Verification Center
  280 |     await page.click('text=Verification Center');
  281 |     await page.waitForURL('**/verification', { timeout: 5000 });
  282 | 
  283 |     // Verify no console errors initially
  284 |     const errors: string[] = [];
  285 |     page.on('console', msg => {
  286 |       if (msg.type() === 'error') {
  287 |         errors.push(msg.text());
  288 |       }
  289 |     });
  290 | 
  291 |     // Enter asset ID and verify
  292 |     await page.fill('input[placeholder*="EF-2026"]', assetId);
  293 |     await page.click('button:has-text("Verify")');
  294 | 
  295 |     // Wait for verification result to appear
  296 |     await page.waitForSelector('.panel', { timeout: 5000 });
  297 | 
  298 |     // Check that no trim errors or [object Object] errors occurred
  299 |     expect(errors.filter(e => e.includes('trim') || e.includes('is not a function') || e.includes('[object Object]'))).toHaveLength(0);
  300 |   });
  301 | 
  302 |   test('VERIFICATION: Regression - identifier must be string not [object Object]', async ({ request }) => {
  303 |     test.skip(!systemAdminToken, 'No admin token available');
  304 | 
  305 |     // Get a real asset ID
  306 |     const assetsRes = await request.get('http://localhost:8000/api/v1/assets', {
  307 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  308 |     });
  309 |     const assets = await assetsRes.json();
  310 |     const assetId = assets.items[0]?.asset_id;
  311 |     test.skip(!assetId, 'No assets in database');
  312 | 
  313 |     // Verify the identifier is a valid string
  314 |     expect(typeof assetId).toBe('string');
  315 |     expect(assetId).not.toContain('[object Object]');
  316 | 
  317 |     // Verify API call with the actual identifier
  318 |     const verifRes = await request.get(`http://localhost:8000/api/v1/verification/asset/${assetId}`, {
  319 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  320 |     });
  321 |     expect(verifRes.ok()).toBeTruthy();
  322 | 
  323 |     // Verify asset API call with the actual identifier
  324 |     const assetRes = await request.get(`http://localhost:8000/api/v1/assets/${assetId}`, {
  325 |       headers: { Authorization: `Bearer ${systemAdminToken}` }
  326 |     });
  327 |     expect(assetRes.ok()).toBeTruthy();
  328 |   });
  329 | });
  330 | 
```