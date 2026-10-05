# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: create-demo-chain.spec.ts >> CREATE NEW DETERMINISTIC DEMO CHAIN >> Execute complete lifecycle: Asset → Inspection → Evidence → ACCEPT → Certification
- Location: e2e\create-demo-chain.spec.ts:6:3

# Error details

```
Error: Asset creation failed
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('CREATE NEW DETERMINISTIC DEMO CHAIN', () => {
  4   |   const API_URL = 'http://localhost:8000/api/v1';
  5   | 
  6   |   test('Execute complete lifecycle: Asset → Inspection → Evidence → ACCEPT → Certification', async ({ request }) => {
  7   |     console.log('\n=== CREATING NEW DEMO CHAIN ===\n');
  8   | 
  9   |     // Login as System Admin
  10  |     const loginRes = await request.post(`${API_URL}/auth/login`, {
  11  |       data: { email: 'a.mehta@bel-defence.in', password: 'password' }
  12  |     });
  13  |     const token = (await loginRes.json()).access_token;
  14  |     console.log('1. Logged in as System Admin');
  15  | 
  16  |     // Step 1: Create a new Asset
  17  |     const assetRes = await request.post(`${API_URL}/assets`, {
  18  |       headers: { Authorization: `Bearer ${token}` },
  19  |       data: {
  20  |         id: 'RBAC-DEMO-001',
  21  |         name: 'RBAC Demo Asset for Final Verification',
  22  |         description: 'Deterministic demo asset created for final verification',
  23  |         status: 'ACTIVE',
  24  |         lifecycleState: 'CREATED',
  25  |         type: 'EQUIPMENT',
  26  |         category: 'RADAR',
  27  |         serialNumber: 'DEMO-001',
  28  |         manufacturer: 'BEL',
  29  |         manufacturingDate: new Date().toISOString(),
  30  |         location: 'Bangalore'
  31  |       }
  32  |     });
  33  | 
  34  |     if (assetRes.ok()) {
  35  |       const asset = await assetRes.json();
  36  |       console.log('2. Asset created:', asset.id);
  37  |       console.log('   Asset UUID:', asset.id);
  38  |     } else {
  39  |       // Asset might already exist, try to get it
  40  |       const getAssetRes = await request.get(`${API_URL}/assets/RBAC-DEMO-001`, {
  41  |         headers: { Authorization: `Bearer ${token}` }
  42  |       });
  43  |       if (getAssetRes.ok()) {
  44  |         const asset = await getAssetRes.json();
  45  |         console.log('2. Asset already exists:', asset.id);
  46  |       } else {
  47  |         console.log('2. Asset creation failed:', await assetRes.text());
> 48  |         throw new Error('Asset creation failed');
      |               ^ Error: Asset creation failed
  49  |       }
  50  |     }
  51  | 
  52  |     // Step 2: Create Inspection
  53  |     const inspectRes = await request.post(`${API_URL}/inspections`, {
  54  |       headers: { Authorization: `Bearer ${token}` },
  55  |       data: {
  56  |         assetId: 'RBAC-DEMO-001',
  57  |         inspectorId: 'r.kumar@bel-defence.in',
  58  |         status: 'PENDING',
  59  |         type: 'QUALITY',
  60  |         scheduledDate: new Date().toISOString()
  61  |       }
  62  |     });
  63  | 
  64  |     if (inspectRes.ok()) {
  65  |       const inspection = await inspectRes.json();
  66  |       console.log('3. Inspection created:', inspection.id);
  67  |     } else {
  68  |       console.log('3. Inspection creation failed:', await inspectRes.text());
  69  |     }
  70  | 
  71  |     // Step 3: Upload Evidence
  72  |     const evidenceRes = await request.post(`${API_URL}/evidence`, {
  73  |       headers: { Authorization: `Bearer ${token}` },
  74  |       multipart: {
  75  |         assetId: 'RBAC-DEMO-001',
  76  |         file: {
  77  |           name: 'demo-evidence.pdf',
  78  |           mimeType: 'application/pdf',
  79  |           buffer: Buffer.from('Demo evidence content for RBAC verification')
  80  |         },
  81  |         type: 'INSPECTION_REPORT',
  82  |         description: 'Demo evidence for final verification'
  83  |       }
  84  |     });
  85  | 
  86  |     if (evidenceRes.ok()) {
  87  |       const evidence = await evidenceRes.json();
  88  |       console.log('4. Evidence uploaded:', evidence.id);
  89  |     } else {
  90  |       console.log('4. Evidence upload failed:', await evidenceRes.text());
  91  |     }
  92  | 
  93  |     // Step 4: Accept Inspection (using Inspector role)
  94  |     const inspectorLoginRes = await request.post(`${API_URL}/auth/login`, {
  95  |       data: { email: 'r.kumar@bel-defence.in', password: 'password123' }
  96  |     });
  97  |     const inspectorToken = (await inspectorLoginRes.json()).access_token;
  98  | 
  99  |     // Get inspections to find the inspection ID
  100 |     const inspectionsRes = await request.get(`${API_URL}/inspections`, {
  101 |       headers: { Authorization: `Bearer ${inspectorToken}` }
  102 |     });
  103 |     const inspectionsData = await inspectionsRes.json();
  104 |     const demoInspection = inspectionsData.items?.find((i: any) => i.assetId === 'RBAC-DEMO-001');
  105 | 
  106 |     if (demoInspection) {
  107 |       const acceptRes = await request.patch(`${API_URL}/inspections/${demoInspection.id}/accept`, {
  108 |         headers: { Authorization: `Bearer ${inspectorToken}` }
  109 |       });
  110 | 
  111 |       if (acceptRes.ok()) {
  112 |         console.log('5. Inspection ACCEPTED');
  113 |       } else {
  114 |         console.log('5. Inspection accept failed:', await acceptRes.text());
  115 |       }
  116 |     } else {
  117 |       console.log('5. Demo inspection not found');
  118 |     }
  119 | 
  120 |     // Step 5: Request Certification
  121 |     const certRes = await request.post(`${API_URL}/certifications`, {
  122 |       headers: { Authorization: `Bearer ${token}` },
  123 |       data: {
  124 |         assetId: 'RBAC-DEMO-001',
  125 |         batchId: 'BATCH-DEMO-001',
  126 |         type: 'QUALITY_CERTIFICATE',
  127 |         status: 'PENDING'
  128 |       }
  129 |     });
  130 | 
  131 |     if (certRes.ok()) {
  132 |       const cert = await certRes.json();
  133 |       console.log('6. Certification requested:', cert.id);
  134 |       console.log('   Certification UUID:', cert.id);
  135 |     } else {
  136 |       console.log('6. Certification request failed:', await certRes.text());
  137 |     }
  138 | 
  139 |     // Step 6: Wait for worker to process (check blockchain transactions)
  140 |     await new Promise(resolve => setTimeout(resolve, 5000));
  141 | 
  142 |     const txRes = await request.get(`${API_URL}/blockchain/transactions`, {
  143 |       headers: { Authorization: `Bearer ${token}` }
  144 |     });
  145 |     const txData = await txRes.json();
  146 |     console.log('7. Blockchain transactions count:', txData.total);
  147 | 
  148 |     // Step 7: Check certifications status
```