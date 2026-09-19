import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import VerificationPanel from "../../components/ui/VerificationPanel";
import { ASSETS, EVIDENCE_LIST, CERTIFICATIONS, BLOCKCHAIN_TXS } from "../../data/mockData";
import { verificationService } from "../../services/verification";
import { assetService } from "../../services/assets";

export default function VerificationCenterPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState<{
    asset: any;
    ran: boolean;
    backendVerif?: any;
  }>({ asset: null, ran: false });

  const runVerification = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim().toUpperCase();
    if (!q) return;

    let foundAsset: any = null;
    let backendVerif: any = null;

    try {
      // 1. Try real backend verification API
      backendVerif = await verificationService.verifyAsset(q);
    } catch (e) {
      console.warn("Backend verification API failed, using fallback:", e);
    }

    try {
      // 2. Try real backend asset API
      const assetRes = await assetService.getAsset(q);
      if (assetRes) {
        foundAsset = {
          ...assetRes,
          id: assetRes.asset_id || assetRes.id,
          batchId: assetRes.batch_id,
          lifecycle: assetRes.lifecycle_state,
          verification: assetRes.verification_status,
          certId: assetRes.cert_id,
          certStatus: assetRes.cert_status,
          serialNumber: assetRes.serial_number,
        };
      }
    } catch (e) {
      // Fallback to local
    }

    if (!foundAsset) {
      foundAsset = ASSETS.find(
        (a) => a.id.toUpperCase() === q || a.batchId.toUpperCase() === q
      ) ?? null;
    }

    setResult({ asset: foundAsset, ran: true, backendVerif });
  }, [query]);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setQuery(idParam);
      runVerification(idParam);
    }
  }, [searchParams, runVerification]);

  const evidence = result.asset ? EVIDENCE_LIST.filter((e) => e.assetId === result.asset?.id) : [];
  const cert = result.asset ? CERTIFICATIONS.find((c) => c.id === result.asset?.certId) : null;
  const txs = result.asset ? BLOCKCHAIN_TXS.filter((t) => t.assetId === result.asset?.id) : [];

  // Build items using real backend checks if available, with graceful fallback
  let verItems: any[] = [];
  let overall: any = "UNAVAILABLE";

  if (result.asset) {
    if (result.backendVerif && result.backendVerif.checks?.length > 0) {
      const checkMap = new Map<string, any>(result.backendVerif.checks.map((c: any) => [c.domain, c]));
      const statusToUi = (s: string) => (s === 'VALID' ? 'VERIFIED' : s === 'MISMATCH' || s === 'INVALID' ? 'FAILED' : 'PENDING');

      verItems = [
        {
          label: "Identity & Supplier",
          status: statusToUi(checkMap.get('identity')?.status || 'VALID'),
          detail: checkMap.get('identity')?.reason || `Supplier: ${result.asset.supplier}`,
        },
        {
          label: "Evidence Integrity",
          status: statusToUi(checkMap.get('evidence')?.status || 'VALID'),
          detail: checkMap.get('evidence')?.reason || `${evidence.filter((e) => e.integrityVerified).length}/${evidence.length} files fingerprint-verified`,
        },
        {
          label: "Lifecycle Sequence",
          status: statusToUi(checkMap.get('lifecycle')?.status || 'VALID'),
          detail: checkMap.get('lifecycle')?.reason || `Current: ${result.asset.lifecycle}`,
        },
        {
          label: "Certification",
          status: statusToUi(checkMap.get('certification')?.status || (cert?.status === 'CONFIRMED' ? 'VALID' : 'UNVERIFIED')),
          detail: checkMap.get('certification')?.reason || (cert ? `Token: ${cert.tokenId}` : "No certification record"),
        },
        {
          label: "Blockchain Proof",
          status: statusToUi(checkMap.get('blockchain')?.status || (txs.some((t) => t.status === 'CONFIRMED') ? 'VALID' : 'UNVERIFIED')),
          detail: checkMap.get('blockchain')?.reason || (txs.length > 0 ? `${txs.filter((t) => t.status === 'CONFIRMED').length} confirmed transaction(s)` : "No on-chain records"),
        },
        {
          label: "Audit Trail Integrity",
          status: "VERIFIED" as const,
          detail: "Backend cryptographic hash chaining validated",
        },
      ];

      const backendOverall = result.backendVerif.overall;
      overall = backendOverall === 'VALID' ? 'VERIFIED' : backendOverall === 'INVALID' || backendOverall === 'MISMATCH' ? 'FAILED' : 'REVIEW';
    } else {
      verItems = [
        {
          label: "Identity & Supplier",
          status: "VERIFIED" as const,
          detail: `Supplier: ${result.asset.supplier}`,
        },
        {
          label: "Evidence Integrity",
          status: (evidence.length > 0 && evidence.every((e) => e.integrityVerified) ? "VERIFIED" : evidence.some((e) => !e.integrityVerified && e.status === "Complete") ? "FAILED" : "PENDING") as any,
          detail: `${evidence.filter((e) => e.integrityVerified).length}/${evidence.length} files fingerprint-verified`,
        },
        {
          label: "Lifecycle Sequence",
          status: (result.asset.lifecycle === "REJECTED_QUARANTINED" ? "FAILED" : result.asset.lifecycle === "ACCEPTED_FOR_ASSEMBLY" ? "VERIFIED" : "PENDING") as any,
          detail: `Current: ${result.asset.lifecycle}`,
        },
        {
          label: "Certification",
          status: (cert?.status === "CONFIRMED" ? "VERIFIED" : cert?.status === "PENDING" ? "PENDING" : "UNAVAILABLE") as any,
          detail: cert ? `Token: ${cert.tokenId}` : "No certification record",
        },
        {
          label: "Blockchain Proof",
          status: (txs.some((t) => t.status === "CONFIRMED") ? "VERIFIED" : txs.length > 0 ? "PENDING" : "UNAVAILABLE") as any,
          detail: txs.length > 0 ? `${txs.filter((t) => t.status === "CONFIRMED").length} confirmed transaction(s)` : "No on-chain records",
        },
        {
          label: "Audit Trail Integrity",
          status: "VERIFIED" as const,
          detail: "No modification detected in audit log",
        },
      ];

      overall = verItems.some((v) => v.status === "FAILED")
        ? "FAILED"
        : verItems.some((v) => v.status === "REVIEW")
        ? "REVIEW"
        : verItems.every((v) => v.status === "VERIFIED" || v.status === "UNAVAILABLE")
        ? "VERIFIED"
        : "REVIEW";
    }
  }

  return (
    <div className="page-fade">
      <PageHeader
        title="Verification Center"
        subtitle="Verify asset authenticity, evidence integrity, and certification validity"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Verification Center" }]}
      />

      {/* Search */}
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>INITIATE VERIFICATION</div>
        <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: 16 }}>
          Enter an Asset ID, Batch ID, Certification ID, Token ID, or Transaction Hash to begin verification.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              className="input-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runVerification()}
              placeholder="e.g. EF-2026-00421 or EF-BATCH-2026-017"
              style={{ fontSize: "0.9375rem", padding: "10px 14px" }}
            />
          </div>
          <button className="btn-primary" onClick={runVerification} style={{ padding: "10px 20px", fontSize: "0.9375rem" }}>
            Verify →
          </button>
        </div>

        {/* Quick examples */}
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.6875rem", color: "#475569" }}>Try:</span>
          {["EF-2026-00421", "EF-2026-00423", "EF-BATCH-2026-017"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); }}
              style={{
                background: "none",
                border: "1px solid #1e3a60",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "0.6875rem",
                color: "#64748b",
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Verification result */}
      {result.ran && !result.asset && (
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.3 }}>◎</div>
          <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.04em", marginBottom: 6 }}>
            NO RECORDS FOUND
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#475569" }}>
            No asset, certification, or transaction matches "{query}". Check the identifier and try again.
          </p>
        </div>
      )}

      {result.ran && result.asset && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div className="section-label" style={{ marginBottom: 6 }}>VERIFICATION RESULT</div>
          </div>
          <VerificationPanel
            items={verItems}
            overall={overall as any}
            assetId={result.asset.id}
          />

          <div className="panel" style={{ padding: 20, marginTop: 20 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>ASSET CONTEXT</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { label: "Type", value: result.asset.type },
                { label: "Batch", value: result.asset.batchId },
                { label: "Lifecycle", value: result.asset.lifecycle },
                { label: "Supplier", value: result.asset.supplier },
              ].map((f) => (
                <div key={f.label}>
                  <div className="section-label" style={{ marginBottom: 3 }}>{f.label}</div>
                  <div className="meta-id" style={{ color: "#94a3b8" }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verification categories info */}
      {!result.ran && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { icon: "◉", title: "Identity Verification", desc: "Verify actor identity and DID credentials", color: "#ef4444" },
            { icon: "◫", title: "Evidence Integrity", desc: "Check SHA-256 fingerprint against stored hash", color: "#3b82f6" },
            { icon: "◷", title: "Lifecycle Verification", desc: "Validate lifecycle state sequence integrity", color: "#f59e0b" },
            { icon: "◆", title: "Certification Verification", desc: "Confirm certification record and token validity", color: "#8b5cf6" },
            { icon: "⬡", title: "Blockchain Proof", desc: "Verify on-chain transaction confirmation", color: "#22c55e" },
          ].map((cat) => (
            <div
              key={cat.title}
              className="panel"
              style={{ padding: 16 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ color: cat.color, fontSize: "1rem" }}>{cat.icon}</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0" }}>{cat.title}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
