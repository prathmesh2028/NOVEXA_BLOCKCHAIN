import { test, expect } from '@playwright/test';

test.describe('CREATE NEW DETERMINISTIC DEMO CHAIN', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Execute complete lifecycle: Asset → Inspection → Evidence → ACCEPT → Certification', async ({ request }) => {
    console.log('\n=== CREATING NEW DEMO CHAIN ===\n');

    // Login as System Admin
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;
    console.log('1. Logged in as System Admin');

    // Step 1: Create a new Asset
    const assetRes = await request.post(`${API_URL}/assets`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        id: 'RBAC-DEMO-001',
        name: 'RBAC Demo Asset for Final Verification',
        description: 'Deterministic demo asset created for final verification',
        status: 'ACTIVE',
        lifecycleState: 'CREATED',
        type: 'EQUIPMENT',
        category: 'RADAR',
        serialNumber: 'DEMO-001',
        manufacturer: 'BEL',
        manufacturingDate: new Date().toISOString(),
        location: 'Bangalore'
      }
    });

    if (assetRes.ok()) {
      const asset = await assetRes.json();
      console.log('2. Asset created:', asset.id);
      console.log('   Asset UUID:', asset.id);
    } else {
      // Asset might already exist, try to get it
      const getAssetRes = await request.get(`${API_URL}/assets/RBAC-DEMO-001`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (getAssetRes.ok()) {
        const asset = await getAssetRes.json();
        console.log('2. Asset already exists:', asset.id);
      } else {
        console.log('2. Asset creation failed:', await assetRes.text());
        throw new Error('Asset creation failed');
      }
    }

    // Step 2: Create Inspection
    const inspectRes = await request.post(`${API_URL}/inspections`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        assetId: 'RBAC-DEMO-001',
        inspectorId: 'r.kumar@bel-defence.in',
        status: 'PENDING',
        type: 'QUALITY',
        scheduledDate: new Date().toISOString()
      }
    });

    if (inspectRes.ok()) {
      const inspection = await inspectRes.json();
      console.log('3. Inspection created:', inspection.id);
    } else {
      console.log('3. Inspection creation failed:', await inspectRes.text());
    }

    // Step 3: Upload Evidence
    const evidenceRes = await request.post(`${API_URL}/evidence`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        assetId: 'RBAC-DEMO-001',
        file: {
          name: 'demo-evidence.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('Demo evidence content for RBAC verification')
        },
        type: 'INSPECTION_REPORT',
        description: 'Demo evidence for final verification'
      }
    });

    if (evidenceRes.ok()) {
      const evidence = await evidenceRes.json();
      console.log('4. Evidence uploaded:', evidence.id);
    } else {
      console.log('4. Evidence upload failed:', await evidenceRes.text());
    }

    // Step 4: Accept Inspection (using Inspector role)
    const inspectorLoginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'r.kumar@bel-defence.in', password: 'password123' }
    });
    const inspectorToken = (await inspectorLoginRes.json()).access_token;

    // Get inspections to find the inspection ID
    const inspectionsRes = await request.get(`${API_URL}/inspections`, {
      headers: { Authorization: `Bearer ${inspectorToken}` }
    });
    const inspectionsData = await inspectionsRes.json();
    const demoInspection = inspectionsData.items?.find((i: any) => i.assetId === 'RBAC-DEMO-001');

    if (demoInspection) {
      const acceptRes = await request.patch(`${API_URL}/inspections/${demoInspection.id}/accept`, {
        headers: { Authorization: `Bearer ${inspectorToken}` }
      });

      if (acceptRes.ok()) {
        console.log('5. Inspection ACCEPTED');
      } else {
        console.log('5. Inspection accept failed:', await acceptRes.text());
      }
    } else {
      console.log('5. Demo inspection not found');
    }

    // Step 5: Request Certification
    const certRes = await request.post(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        assetId: 'RBAC-DEMO-001',
        batchId: 'BATCH-DEMO-001',
        type: 'QUALITY_CERTIFICATE',
        status: 'PENDING'
      }
    });

    if (certRes.ok()) {
      const cert = await certRes.json();
      console.log('6. Certification requested:', cert.id);
      console.log('   Certification UUID:', cert.id);
    } else {
      console.log('6. Certification request failed:', await certRes.text());
    }

    // Step 6: Wait for worker to process (check blockchain transactions)
    await new Promise(resolve => setTimeout(resolve, 5000));

    const txRes = await request.get(`${API_URL}/blockchain/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const txData = await txRes.json();
    console.log('7. Blockchain transactions count:', txData.total);

    // Step 7: Check certifications status
    const certsRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const certsData = await certsRes.json();
    const demoCert = certsData.items?.find((c: any) => c.assetId === 'RBAC-DEMO-001');

    if (demoCert) {
      console.log('8. Demo certification status:', demoCert.status);
      console.log('   Token ID:', demoCert.tokenId);
      console.log('   Transaction:', demoCert.transactionHash);
      console.log('   Block:', demoCert.blockNumber);
    } else {
      console.log('8. Demo certification not found yet');
    }

    console.log('\n=== DEMO CHAIN CREATION COMPLETE ===\n');
    console.log('Asset ID: RBAC-DEMO-001');
    console.log('Certification ID:', demoCert?.id || 'Pending...');
  });
});
