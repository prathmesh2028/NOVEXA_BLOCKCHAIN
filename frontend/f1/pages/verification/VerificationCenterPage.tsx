import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import VerificationPanel from "../../components/ui/VerificationPanel";
import { verificationService } from "../../services/verification";
import { assetService } from "../../services/assets";
import { evidenceService } from "../../services/evidence";
import { certificationService } from "../../services/certifications";
import { blockchainService } from "../../services/blockchain";

type CheckResult = 'VALID' | 'INVALID' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'NOT_APPLICABLE' | 'BLOCKCHAIN_UNAVAILABLE';

export default function VerificationCenterPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState<{
    asset: any;
    ran: boolean;
    backendVerif?: any;
    evidence: any[];
    cert: any;
    txs: any[];
  }>({ asset: null, ran: false, evidence: [], cert: null, txs: [] });

  const runVerification = useCallback(async (searchQuery?: string | Event) => {
    // Explicitly handle both string and potential event object
    let rawValue: string;
    if (typeof searchQuery === 'string') {
      rawValue = searchQuery;
    } else if (searchQuery && 'target' in searchQuery) {
      // This is an event, extract the value
      rawValue = (searchQuery.target as HTMLInputElement).value;
    } else {
      rawValue = query;
    }

    const q = String(rawValue || "").trim().toUpperCase();
    if (!q) return;

    let foundAsset: any = null;
    let backendVerif: any = null;
    let evidence: any[] = [];
    let cert: any = null;
    let txs: any[] = [];

    try {
      // 1. Try real backend verification API
      backendVerif = await verificationService.verifyAsset(q);
    } catch (e) {
      console.warn("Backend verification API failed:", e);
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
      console.warn("Backend asset API failed:", e);
    }

    if (foundAsset) {
      try {
        const evidenceRes = await evidenceService.listEvidence({ assetId: foundAsset.id });
        evidence = evidenceRes.items || [];
      } catch (e) {
        console.warn("Backend evidence API failed:", e);
        evidence = [];
      }

      try {
        if (foundAsset.certId) {
          cert = await certificationService.getCertification(foundAsset.certId);
        }
      } catch (e) {
        console.warn("Backend certification API failed:", e);
      }

      try {
        const txList = await blockchainService.listTransactions({ assetId: foundAsset.id });
        txs = txList.items || [];
      } catch (e) {
        console.warn("Backend blockchain API failed:", e);
      }
    }

    if (!foundAsset) {
      setResult({ asset: null, ran: true, backendVerif, evidence: [], cert: null, txs: [] });
      return;
    }

    setResult({ asset: foundAsset, ran: true, backendVerif, evidence, cert, txs });
  }, [query]);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setQuery(idParam);
      runVerification(idParam);
    }
  }, [searchParams, runVerification]);

  // Build items using real backend checks if available, with graceful fallback
  let verItems: any[] = [];
  let overall: any = "UNAVAILABLE";

  if (result.asset) {
    if (result.backendVerif && result.backendVerif.checks?.length > 0) {
      const checkMap = new Map<string, any>(result.backendVerif.checks.map((c: any) => [c.domain, c]));
      const statusToUi = (s: string) => {
        if (s === 'VALID') return 'VERIFIED';
        if (s === 'MISMATCH' || s === 'INVALID') return 'FAILED';
        if (s === 'BLOCKCHAIN_UNAVAILABLE') return 'UNAVAILABLE';
        return 'PENDING';
      };

      verItems = [
        {
          label: "Identity & Supplier",
          status: statusToUi(checkMap.get('identity')?.status || 'VALID'),
          detail: checkMap.get('identity')?.reason || `Supplier: ${result.asset.supplier}`,
        },
        {
          label: "Evidence Integrity",
          status: statusToUi(checkMap.get('evidence')?.status || 'VALID'),
          detail: checkMap.get('evidence')?.reason || `${result.evidence.filter((e) => e.integrityVerified).length}/${result.evidence.length} files fingerprint-verified`,
        },
        {
          label: "Lifecycle Sequence",
          status: statusToUi(checkMap.get('lifecycle')?.status || 'VALID'),
          detail: checkMap.get('lifecycle')?.reason || `Current: ${result.asset.lifecycle}`,
        },
        {
          label: "Certification",
          status: statusToUi(checkMap.get('certification')?.status || (result.cert?.status === 'CONFIRMED' ? 'VALID' : 'UNVERIFIED')),
          detail: checkMap.get('certification')?.reason || (result.cert ? `Token: ${result.cert.tokenId}` : "No certification record"),
        },
        {
          label: "Blockchain Proof",
          status: statusToUi(checkMap.get('blockchain')?.status || 'BLOCKCHAIN_UNAVAILABLE'),
          detail: checkMap.get('blockchain')?.reason || (result.txs.length > 0 ? `${result.txs.filter((t) => t.status === 'CONFIRMED').length} confirmed transaction(s)` : "No on-chain records"),
        },
        {
          label: "Audit Trail Integrity",
          status: checkMap.get('audit') || checkMap.get('audit_trail')
            ? statusToUi((checkMap.get('audit') || checkMap.get('audit_trail')).status)
            : ("REVIEW" as const),
          detail: (checkMap.get('audit') || checkMap.get('audit_trail'))?.reason || "Audit chain verification pending audit event confirmation",
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
          status: (result.evidence.length > 0 && result.evidence.every((e) => e.integrityVerified) ? "VERIFIED" : result.evidence.some((e) => !e.integrityVerified && e.status === "Complete") ? "FAILED" : "PENDING") as any,
          detail: `${result.evidence.filter((e) => e.integrityVerified).length}/${result.evidence.length} files fingerprint-verified`,
        },
        {
          label: "Lifecycle Sequence",
          status: (result.asset.lifecycle === "REJECTED_QUARANTINED" ? "FAILED" : result.asset.lifecycle === "ACCEPTED_FOR_ASSEMBLY" ? "VERIFIED" : "PENDING") as any,
          detail: `Current: ${result.asset.lifecycle}`,
        },
        {
          label: "Certification",
          status: (result.cert?.status === "CONFIRMED" ? "VERIFIED" : result.cert?.status === "PENDING" ? "PENDING" : "UNAVAILABLE") as any,
          detail: result.cert ? `Token: ${result.cert.tokenId}` : "No certification record",
        },
        {
          label: "Blockchain Proof",
          status: "UNAVAILABLE" as const,
          detail: "Blockchain RPC offline — on-chain verification not available",
        },
        {
          label: "Audit Trail Integrity",
          status: "REVIEW" as const,
          detail: "Audit chain verification pending backend log integrity check",
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
          <button className="btn-primary" onClick={() => runVerification()} style={{ padding: "10px 20px", fontSize: "0.9375rem" }}>
            Verify →
          </button>
        </div>

        {/* Quick examples */}
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.6875rem", color: "#475569" }}>Try:</span>
          {["EF-2026-00421", "EF-2026-00423", "EF-BATCH-2026-017"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); runVerification(ex); }}
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
