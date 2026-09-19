import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { EVIDENCE_LIST, ASSETS, formatDateTime, formatDate, shortHash } from "../../data/mockData";
import { certificationService } from "../../services/certifications";
import { useAuth } from "../../context/AuthContext";
import type { Certification } from "../../data/mockData";

export default function CertificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [cert, setCert] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  const fetchCert = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await certificationService.getCertification(id);
      setCert(data);
      if (data?.reviewNotes) {
        setReviewNotes(data.reviewNotes);
      }
    } catch (err) {
      console.error("Error loading certification detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCert();
    const unsub = certificationService.subscribe(() => {
      fetchCert();
    });
    return unsub;
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: "1.125rem", color: "#e2e8f0" }}>Loading Certification Record...</div>
        <div className="meta-id" style={{ marginTop: 4 }}>
          {id}
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="page-fade" style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 16, opacity: 0.3 }}>◆</div>
        <h2 className="font-display" style={{ color: "#e2e8f0", fontSize: "1.75rem", marginBottom: 8 }}>
          CERTIFICATION NOT FOUND
        </h2>
        <p style={{ color: "#64748b", marginBottom: 24, fontSize: "0.875rem" }}>
          No digital certification record exists for ID: <strong style={{ color: "#94a3b8" }}>{id}</strong>
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/app/certification-queue" className="btn-primary">
            ← Back to Queue
          </Link>
          <Link to="/app/certifications" className="btn-secondary">
            All Certifications
          </Link>
        </div>
      </div>
    );
  }

  const asset = ASSETS.find((a) => a.id === cert.assetId);
  const evidence = EVIDENCE_LIST.filter((e) => e.assetId === cert.assetId);
  const isPending = cert.status === "PENDING";

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const res = await certificationService.approveCertification(
        cert.id,
        reviewNotes,
        user?.name || "Priya Sharma",
        user?.id || "did:bel:actor:002"
      );
      if (res.success) {
        setCert(res.certification);
        setFeedback({ type: "success", text: res.message });
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Approval failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      alert("A rejection reason or review note is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await certificationService.rejectCertification(
        cert.id,
        reviewNotes,
        user?.name || "Priya Sharma",
        user?.id || "did:bel:actor:002"
      );
      if (res.success) {
        setCert(res.certification);
        setFeedback({ type: "warning", text: res.message });
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Rejection failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title={cert.id}
        subtitle={`${cert.certType || "Digital certification"} for asset ${cert.assetId}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certification Queue", to: "/app/certification-queue" },
          { label: cert.id },
        ]}
        badge={<StatusBadge status={cert.status} />}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/app/certification-queue" className="btn-secondary" style={{ fontSize: "0.75rem" }}>
              ← Queue
            </Link>
            <Link to="/app/certifications" className="btn-ghost" style={{ fontSize: "0.75rem" }}>
              All Certifications
            </Link>
          </div>
        }
      />

      {/* Non-transferable notice */}
      <div
        style={{
          padding: "12px 18px",
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "6px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#8b5cf6", fontSize: "1.2rem" }}>⊠</span>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.04em" }}>
              NON-TRANSFERABLE DEFENCE CERTIFICATION
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
              This digital certification represents the immutable recorded certification state of this asset. It cannot be sold or transferred.
            </div>
          </div>
        </div>

        <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#8b5cf6" }}>
          LOCKED ON-CHAIN
        </span>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8125rem",
            border:
              feedback.type === "success"
                ? "1px solid rgba(34, 197, 94, 0.4)"
                : feedback.type === "warning"
                ? "1px solid rgba(245, 158, 11, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
            background:
              feedback.type === "success"
                ? "rgba(34, 197, 94, 0.12)"
                : feedback.type === "warning"
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(239, 68, 68, 0.12)",
            color:
              feedback.type === "success"
                ? "#4ade80"
                : feedback.type === "warning"
                ? "#fbbf24"
                : "#f87171",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{feedback.type === "success" ? "✓" : feedback.type === "warning" ? "⚠" : "✕"}</span>
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Review Workflow Panel for Pending Certifications */}
      {isPending && (
        <div
          className="panel-elevated"
          style={{
            padding: 20,
            marginBottom: 24,
            border: "1px solid #f59e0b55",
            background: "rgba(245,158,11,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#f59e0b", fontSize: "1rem" }}>◐</span>
                <span className="section-label" style={{ margin: 0, color: "#f59e0b" }}>
                  AWAITING CERTIFICATION REVIEW & SIGN-OFF
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "#94a3b8" }}>
                Verify lifecycle compliance and SHA-256 evidence integrity before authorizing non-transferable token minting.
              </p>
            </div>

            <span
              style={{
                fontSize: "0.6875rem",
                color: "#f59e0b",
                background: "rgba(245,158,11,0.15)",
                padding: "4px 10px",
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              PENDING CONFIRMATION
            </span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#cbd5e1", marginBottom: 6, fontWeight: 600 }}>
              REVIEW NOTES / AUDIT OBSERVATIONS
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter authorization notes, evidence verification checks, or rejection reason…"
              style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={handleReject}
              disabled={isSubmitting}
              className="btn-danger"
              style={{ fontSize: "0.8125rem" }}
            >
              {isSubmitting ? "Processing..." : "✕ Reject Certification"}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="btn-primary"
              style={{ fontSize: "0.8125rem", background: "#22c55e" }}
            >
              {isSubmitting ? "Authorizing..." : "✓ Authorize & Mint NFT"}
            </button>
          </div>
        </div>
      )}

      {/* Grid Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Certification Overview Panel */}
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>CERTIFICATION OVERVIEW</div>
          {[
            { label: "Certification ID", value: cert.id, mono: true },
            { label: "Certificate Type", value: cert.certType || "Quality Compliance NFT" },
            { label: "Token ID", value: cert.tokenId, mono: true },
            { label: "Asset ID", value: cert.assetId, mono: true, link: `/app/assets/${cert.assetId}` },
            { label: "Asset Name", value: cert.assetName || "Defence Asset" },
            { label: "Batch ID", value: cert.batchId, mono: true },
            { label: "Status", value: cert.status, badge: true },
            { label: "Issued by", value: `${cert.issuedBy} (NFT Creator)` },
            { label: "Issuer DID", value: cert.issuedByDid, mono: true },
            { label: "Issued at", value: formatDateTime(cert.issuedAt) },
            { label: "Confirmed at", value: cert.confirmedAt ? formatDateTime(cert.confirmedAt) : "Awaiting confirmation" },
            { label: "Confirmations", value: cert.confirmations.toString() },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a", alignItems: "center" }}>
              <span style={{ fontSize: "0.6875rem", color: "#475569", width: 110, flexShrink: 0 }}>{row.label}</span>
              {row.badge ? (
                <StatusBadge status={row.value} size="sm" />
              ) : row.link ? (
                <Link to={row.link} style={{ textDecoration: "none" }}>
                  <span className="meta-id" style={{ color: "#60a5fa" }}>{row.value}</span>
                </Link>
              ) : row.mono ? (
                <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span>
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
              )}
            </div>
          ))}

          {/* Review Notes or Rejection Reason if recorded */}
          {cert.reviewNotes && (
            <div style={{ marginTop: 14, padding: "10px 12px", background: "#08131f", borderRadius: "4px", border: "1px solid #152b4a" }}>
              <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
                Review Notes & Authorization Sign-off
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                "{cert.reviewNotes}"
              </div>
              {cert.reviewedBy && (
                <div className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 4 }}>
                  Reviewed by: {cert.reviewedBy} {cert.reviewedAt ? `on ${formatDate(cert.reviewedAt)}` : ""}
                </div>
              )}
            </div>
          )}

          {cert.rejectionReason && (
            <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "4px", border: "1px solid rgba(239,68,68,0.25)" }}>
              <div style={{ fontSize: "0.6875rem", color: "#ef4444", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
                Rejection Non-Conformance Record
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#fca5a5", lineHeight: 1.4 }}>
                "{cert.rejectionReason}"
              </div>
              {cert.reviewedBy && (
                <div className="meta-id" style={{ fontSize: "0.6875rem", color: "#f87171", marginTop: 4 }}>
                  Rejected by: {cert.reviewedBy} {cert.reviewedAt ? `on ${formatDate(cert.reviewedAt)}` : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Blockchain Proof & Evidence */}
        <div>
          <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>BLOCKCHAIN PROOF</div>
            {[
              { label: "Network", value: cert.network },
              { label: "Contract", value: shortHash(cert.contractAddress, 10), mono: true },
              { label: "Transaction", value: shortHash(cert.txHash, 10), mono: true },
              { label: "Block Number", value: cert.blockNumber > 0 ? cert.blockNumber.toLocaleString() : "Pending Minting" },
              { label: "Confirmations", value: cert.confirmations.toString() },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a", alignItems: "center" }}>
                <span style={{ fontSize: "0.6875rem", color: "#475569", width: 110, flexShrink: 0 }}>{row.label}</span>
                {row.mono ? (
                  <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span>
                ) : (
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
                )}
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>TRANSACTION DIGEST</div>
              <div style={{ background: "#070f1d", padding: "10px 12px", borderRadius: "4px", border: "1px solid #152b4a" }}>
                <span className="meta-id" style={{ color: "#64748b", wordBreak: "break-all", fontSize: "0.7rem" }}>{cert.txHash}</span>
              </div>
            </div>
          </div>

          {/* Evidence Summary Linked to Certification */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>EVIDENCE LINKED TO CERTIFICATION</div>
            {evidence.length === 0 ? (
              <div style={{ fontSize: "0.8125rem", color: "#475569" }}>No evidence records linked to this asset</div>
            ) : evidence.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #152b4a" }}>
                <div>
                  <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{e.filename}</div>
                  <div className="meta-id" style={{ color: "#475569" }}>{e.hash}</div>
                </div>
                <StatusBadge status={e.integrityVerified ? "VERIFIED" : "FAILED"} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        {asset && <Link to={`/app/assets/${asset.id}`} className="btn-secondary">View Asset Specification →</Link>}
        <Link to="/app/certification-queue" className="btn-secondary">Certification Queue →</Link>
        <Link to="/app/blockchain" className="btn-ghost">Blockchain Ledger →</Link>
      </div>
    </div>
  );
}
