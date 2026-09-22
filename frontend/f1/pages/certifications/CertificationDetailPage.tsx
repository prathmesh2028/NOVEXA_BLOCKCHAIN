import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import { formatDateTime, shortHash } from "../../data/utils";
import { certificationService, CertificationResponse } from "../../services/certifications";

export default function CertificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [cert, setCert] = useState<CertificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    certificationService.getCertification(id)
      .then(setCert)
      .catch((err) => {
        console.error("Failed to load certification:", err);
        setError(err.message || "Failed to load certification");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-fade" style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}>
        <div className="panel" style={{ padding: "60px 32px", background: "#0a1320", border: "1px solid #1e3a60", borderRadius: "8px" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Loading certification...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-fade" style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}>
        <div className="panel" style={{ padding: "60px 32px", background: "#0a1320", border: "1px solid #1e3a60", borderRadius: "8px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              color: "#ef4444",
              margin: "0 auto 20px",
            }}
          >
            ✕
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 10,
              letterSpacing: "0.02em",
            }}
          >
            ERROR LOADING CERTIFICATION
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>
          <Link
            to="/app/certifications"
            className="btn-primary"
            style={{ padding: "10px 20px", textDecoration: "none" }}
          >
            Back to Certifications
          </Link>
        </div>
      </div>
    );
  }

  // If certificate not found (after successful load but null result)
  if (!cert) {
    return (
      <div
        className="page-fade"
        style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}
      >
        <div className="panel" style={{ padding: "60px 32px", background: "#0a1320", border: "1px solid #1e3a60", borderRadius: "8px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              color: "#ef4444",
              margin: "0 auto 20px",
            }}
          >
            ✕
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 10,
              letterSpacing: "0.02em",
            }}
          >
            CERTIFICATION RECORD NOT FOUND
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            No sovereign defence certificate or airworthiness record exists for identifier:{" "}
            <span className="font-mono-id" style={{ color: "#f87171" }}>
              {id}
            </span>
            . Please check your certificate identifier or consult the certification registry.
          </p>
          <Link
            to="/app/certifications"
            className="btn-primary"
            style={{ padding: "10px 20px", textDecoration: "none" }}
          >
            ← Back to Certifications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader
        title={cert.cert_id}
        subtitle={`Asset: ${cert.asset_id}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certifications", to: "/app/certifications" },
          { label: cert.cert_id },
        ]}
        actions={
          <Link
            to="/app/certifications"
            className="btn-ghost"
            style={{
              fontSize: "0.8125rem",
              padding: "6px 14px",
              textDecoration: "none",
            }}
          >
            ← Back to Certifications
          </Link>
        }
      />

      <div className="panel" style={{ padding: "24px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Certification ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.cert_id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Asset ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.asset_id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Batch ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.batch_id || "N/A"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Status
            </div>
            <div style={{ fontSize: "0.9375rem", color: cert.status === "CONFIRMED" ? "#22c55e" : cert.status === "PENDING" ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>
              {cert.status}
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: "24px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "16px" }}>
          Blockchain Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Token ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.token_id || "Pending"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Transaction Hash
            </div>
            <div style={{ fontSize: "0.875rem", color: "#e2e8f0", fontWeight: 500, fontFamily: "monospace" }}>
              {cert.tx_hash ? (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => copyToClipboard(cert.tx_hash!, "txHash")}
                >
                  {shortHash(cert.tx_hash)}
                  {copiedField === "txHash" && " ✓"}
                </span>
              ) : (
                "Pending"
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Block Number
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.block_number || "Pending"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Network
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.network || "BEL-TRUST-CHAIN"}
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: "24px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "16px" }}>
          Issuance Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Issued By
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.issued_by || "N/A"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Issued At
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {formatDateTime(cert.issued_at)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Confirmed At
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.confirmed_at ? formatDateTime(cert.confirmed_at) : "Pending"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Confirmations
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.confirmations}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
                display: "inline-block",
                padding: "3px 8px",
                borderRadius: "3px",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38bdf8",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                marginBottom: 8,
              }}
            >
              {cert.type}
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#f8fafc",
                margin: "0 0 8px 0",
                letterSpacing: "0.01em",
              }}
            >
              {cert.standard}
            </h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.8125rem",
                color: "#94a3b8",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                Certificate ID:
                <span
                  className="meta-id"
                  style={{ color: "#38bdf8", fontWeight: 700 }}
                >
                  {cert.id}
                </span>
                <button
                  onClick={() => copyToClipboard(cert.id, "certId")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: copiedField === "certId" ? "#22c55e" : "#64748b",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    padding: "0 2px",
                  }}
                  title="Copy Certificate ID"
                >
                  {copiedField === "certId" ? "✓" : "📋"}
                </button>
              </span>
              <span>•</span>
              <span>
                Document Ref:{" "}
                <span className="meta-id" style={{ color: "#cbd5e1" }}>
                  {cert.certificateNumber}
                </span>
              </span>
            </div>
          </div>

          {/* Badges & Actions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {renderStatusBadge(cert.status)}
            {renderVerificationBadge(cert.verificationStatus)}
          </div>
        </div>

        {/* Telemetry Tiles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #1e3a60",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              background: "#060d17",
              borderRadius: "6px",
              border: "1px solid #152b4a",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Validity Duration
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8", marginTop: "4px" }}>
              {cert.validityDuration}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
              Valid until {formatDate(cert.expiryDate)}
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              background: "#060d17",
              borderRadius: "6px",
              border: "1px solid #152b4a",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Target Asset
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e2e8f0", marginTop: "4px" }}>
              {cert.asset.assetName}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#60a5fa", marginTop: "2px" }}>
              {cert.asset.assetId} • {cert.asset.category}
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              background: "#060d17",
              borderRadius: "6px",
              border: "1px solid #152b4a",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Issuing Body
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e2e8f0", marginTop: "4px" }}>
              {cert.authority.code}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
              {cert.authority.signatoryOfficer.split(",")[0]}
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              background: "#060d17",
              borderRadius: "6px",
              border: "1px solid #152b4a",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Blockchain Anchor
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
              Block #{cert.proof.blockNumber.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
              {cert.proof.confirmations} confirmations
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          borderBottom: "1px solid #1e3a60",
          paddingBottom: "8px",
        }}
      >
        {[
          { id: "all", label: "Complete Dossier" },
          { id: "asset_authority", label: "Associated Asset & Authority" },
          { id: "proof", label: "Cryptographic Proof & Document" },
          { id: "timeline", label: "Verification Timeline" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: activeTab === tab.id ? "#1e3a60" : "transparent",
              color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: CERTIFICATE INFORMATION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "asset_authority") && (
        <div
          className="panel"
          style={{
            padding: "24px",
            marginBottom: "24px",
            background: "#0a1320",
            border: "1px solid #1e3a60",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#38bdf8",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>📋</span> CERTIFICATE SPECIFICATION & COMPLIANCE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Column 1 */}
            <div>
              {[
                { label: "Certificate ID", value: cert.id, mono: true },
                { label: "Certificate Number", value: cert.certificateNumber, mono: true },
                { label: "Certification Type", value: cert.type },
                { label: "Regulatory Standard", value: cert.standard },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #152b4a",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: item.mono ? "#60a5fa" : "#e2e8f0",
                      fontWeight: 600,
                      fontFamily: item.mono ? "monospace" : "inherit",
                      textAlign: "right",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div>
              {[
                { label: "Issue Date", value: formatDate(cert.issueDate) },
                { label: "Expiry Date", value: formatDate(cert.expiryDate) },
                { label: "Validity Duration", value: cert.validityDuration },
                { label: "Status", value: cert.status, badge: true },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #152b4a",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.label}</span>
                  {item.badge ? (
                    renderStatusBadge(cert.status)
                  ) : (
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: "#e2e8f0",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Scope Box */}
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              background: "#060d17",
              border: "1px solid #152b4a",
              borderRadius: "6px",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Compliance Scope & Operational Authorization
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#cbd5e1", lineHeight: 1.6 }}>
              {cert.complianceScope}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 8, fontStyle: "italic" }}>
              Summary: {cert.summary}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ASSOCIATED ASSET & SECTION 4: ISSUING AUTHORITY */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "asset_authority") && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* SECTION 3: ASSOCIATED ASSET */}
          <div
            className="panel"
            style={{
              padding: "24px",
              background: "#0a1320",
              border: "1px solid #1e3a60",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#38bdf8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🛡</span> ASSOCIATED DEFENCE ASSET
              </span>
              <Link
                to={`/app/assets/${cert.asset.assetId}`}
                style={{
                  fontSize: "0.75rem",
                  color: "#60a5fa",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                View Asset Dossier →
              </Link>
            </div>

            <div
              style={{
                padding: "14px 16px",
                background: "#060d17",
                border: "1px solid #152b4a",
                borderRadius: "6px",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}>
                {cert.asset.assetName}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "0.75rem", color: "#94a3b8" }}>
                <span className="meta-id" style={{ color: "#60a5fa" }}>{cert.asset.assetId}</span>
                <span>•</span>
                <span>{cert.asset.category}</span>
                <span>•</span>
                <span style={{ color: "#22c55e", fontWeight: 600 }}>{cert.asset.status}</span>
              </div>
            </div>

            <div>
              {[
                { label: "Serial Number", value: cert.asset.serialNumber, mono: true },
                { label: "Assigned Department", value: cert.asset.department },
                { label: "Deployment Location", value: cert.asset.location },
                { label: "Operational Status", value: cert.asset.status },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #152b4a",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: item.mono ? "#94a3b8" : "#cbd5e1",
                      fontWeight: 500,
                      fontFamily: item.mono ? "monospace" : "inherit",
                      textAlign: "right",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <Link
                to={`/app/assets/${cert.asset.assetId}`}
                className="btn-secondary"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "8px 14px",
                  fontSize: "0.75rem",
                  textDecoration: "none",
                }}
              >
                Open Full Asset Dossier for {cert.asset.assetId} →
              </Link>
            </div>
          </div>

          {/* SECTION 4: ISSUING AUTHORITY */}
          <div
            className="panel"
            style={{
              padding: "24px",
              background: "#0a1320",
              border: "1px solid #1e3a60",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#38bdf8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🏛</span> ISSUING CERTIFICATION AUTHORITY
            </div>

            <div
              style={{
                padding: "14px 16px",
                background: "#060d17",
                border: "1px solid #152b4a",
                borderRadius: "6px",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}>
                {cert.authority.name}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "0.75rem", color: "#94a3b8" }}>
                <span className="meta-id" style={{ color: "#38bdf8" }}>{cert.authority.code}</span>
                <span>•</span>
                <span>{cert.authority.accreditation}</span>
              </div>
            </div>

            <div>
              {[
                { label: "Signatory Officer", value: cert.authority.signatoryOfficer },
                { label: "Official Rank & Role", value: cert.authority.rank },
                { label: "Office & Location", value: cert.authority.office },
                { label: "Accreditation Body", value: cert.authority.accreditation },
                { label: "Authority Seal Code", value: cert.authority.sealCode, mono: true },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #152b4a",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#64748b", flexShrink: 0 }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: item.mono ? "#a855f7" : "#cbd5e1",
                      fontWeight: 500,
                      fontFamily: item.mono ? "monospace" : "inherit",
                      textAlign: "right",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "10px 12px",
                background: "rgba(34, 197, 94, 0.06)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                borderRadius: "6px",
                fontSize: "0.75rem",
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>✓</span> Sovereign Defence Accreditation Verified by Department of Defence Production
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: DOCUMENT / CERTIFICATE REFERENCE */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "proof") && (
        <div
          className="panel"
          style={{
            padding: "24px",
            marginBottom: "24px",
            background: "#0a1320",
            border: "1px solid #1e3a60",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#38bdf8",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>📑</span> DOCUMENT & CREDENTIAL REFERENCE
            </span>
            <button
              onClick={() => setShowDocModal(true)}
              className="btn-primary"
              style={{ padding: "6px 14px", fontSize: "0.75rem" }}
            >
              Preview Official Military Credential →
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {[
              { label: "Document ID", value: cert.document.documentId, mono: true },
              { label: "Reference Archive Number", value: cert.document.referenceNumber, mono: true },
              { label: "File Format & Standard", value: cert.document.format },
              { label: "Archive Size", value: cert.document.fileSize },
              { label: "Classification Level", value: cert.document.classification },
              { label: "Sealed Timestamp", value: formatDateTime(cert.document.sealedAt) },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "10px 12px",
                  background: "#060d17",
                  border: "1px solid #152b4a",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: item.mono ? "#60a5fa" : "#e2e8f0",
                    fontFamily: item.mono ? "monospace" : "inherit",
                    marginTop: 4,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Document Checksum */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: 6 }}>
              DOCUMENT INTEGRITY SHA-256 CHECKSUM
            </div>
            <div
              style={{
                background: "#060d17",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #152b4a",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span className="meta-id" style={{ color: "#38bdf8", wordBreak: "break-all", fontSize: "0.75rem" }}>
                {cert.document.checksum}
              </span>
              <button
                onClick={() => copyToClipboard(cert.document.checksum, "docChecksum")}
                className="btn-ghost"
                style={{ fontSize: "0.7rem", padding: "3px 8px" }}
              >
                {copiedField === "docChecksum" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: HASH / PROOF INFORMATION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "proof") && (
        <div
          className="panel"
          style={{
            padding: "24px",
            marginBottom: "24px",
            background: "#0a1320",
            border: "1px solid #1e3a60",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#a855f7",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⬡</span> BLOCKCHAIN & CRYPTOGRAPHIC PROOF REFERENCE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                background: "#060d17",
                border: "1px solid #152b4a",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>
                Ledger Status
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#10b981", marginTop: 4 }}>
                {cert.proof.verificationStatus}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "#060d17",
                border: "1px solid #152b4a",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>
                Ledger Network
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginTop: 4 }}>
                {cert.proof.network}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "#060d17",
                border: "1px solid #152b4a",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>
                Smart Contract Registry
              </div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#c084fc", fontFamily: "monospace", marginTop: 4 }}>
                {shortHash(cert.proof.contractAddress, 10)}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "#060d17",
                border: "1px solid #152b4a",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>
                Block Number & Confirmations
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#38bdf8", marginTop: 4 }}>
                #{cert.proof.blockNumber.toLocaleString()} ({cert.proof.confirmations} confirms)
              </div>
            </div>
          </div>

          {/* Hashes List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: 4 }}>
                CERTIFICATE STATE SHA-256 HASH
              </div>
              <div
                style={{
                  background: "#060d17",
                  padding: "9px 12px",
                  borderRadius: "4px",
                  border: "1px solid #152b4a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span className="meta-id" style={{ color: "#38bdf8", fontSize: "0.75rem", wordBreak: "break-all" }}>
                  {cert.proof.certificateHash}
                </span>
                <button
                  onClick={() => copyToClipboard(cert.proof.certificateHash, "certHash")}
                  className="btn-ghost"
                  style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                >
                  {copiedField === "certHash" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: 4 }}>
                MERKLE ROOT PROOF HASH
              </div>
              <div
                style={{
                  background: "#060d17",
                  padding: "9px 12px",
                  borderRadius: "4px",
                  border: "1px solid #152b4a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span className="meta-id" style={{ color: "#c084fc", fontSize: "0.75rem", wordBreak: "break-all" }}>
                  {cert.proof.proofHash}
                </span>
                <button
                  onClick={() => copyToClipboard(cert.proof.proofHash, "proofHash")}
                  className="btn-ghost"
                  style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                >
                  {copiedField === "proofHash" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: 4 }}>
                TRANSACTION REFERENCE HASH
              </div>
              <div
                style={{
                  background: "#060d17",
                  padding: "9px 12px",
                  borderRadius: "4px",
                  border: "1px solid #152b4a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span className="meta-id" style={{ color: "#94a3b8", fontSize: "0.75rem", wordBreak: "break-all" }}>
                  {cert.proof.txHash}
                </span>
                <button
                  onClick={() => copyToClipboard(cert.proof.txHash, "txHash")}
                  className="btn-ghost"
                  style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                >
                  {copiedField === "txHash" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: VERIFICATION HISTORY / TIMELINE */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "timeline") && (
        <div
          className="panel"
          style={{
            padding: "24px",
            marginBottom: "24px",
            background: "#0a1320",
            border: "1px solid #1e3a60",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#38bdf8",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⏱</span> VERIFICATION AUDIT TRAIL & TIMELINE
          </div>

          <div style={{ position: "relative", paddingLeft: "24px" }}>
            {/* Vertical connecting line */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                bottom: "10px",
                left: "7px",
                width: "2px",
                background: "#1e3a60",
              }}
            />

            {cert.timeline.map((event, index) => (
              <div
                key={event.id}
                style={{
                  position: "relative",
                  marginBottom: index === cert.timeline.length - 1 ? 0 : "24px",
                }}
              >
                {/* Timeline node */}
                <div
                  style={{
                    position: "absolute",
                    left: "-21px",
                    top: "4px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background:
                      event.status === "Anchored"
                        ? "#a855f7"
                        : event.status === "Authorized"
                        ? "#22c55e"
                        : event.status === "Expired"
                        ? "#ef4444"
                        : "#38bdf8",
                    border: "2px solid #0a1320",
                  }}
                />

                <div
                  style={{
                    padding: "14px 16px",
                    background: "#060d17",
                    border: "1px solid #152b4a",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "3px",
                          background: "rgba(56, 189, 248, 0.12)",
                          color: "#38bdf8",
                        }}
                      >
                        {event.badge}
                      </span>
                      <strong style={{ color: "#f1f5f9", fontSize: "0.875rem" }}>
                        {event.title}
                      </strong>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>

                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.8125rem",
                      margin: "0 0 8px 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {event.description}
                  </p>

                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    Verified by: <span style={{ color: "#cbd5e1" }}>{event.performedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL SEALED CERTIFICATE PREVIEW */}
      {/* ========================================================================= */}
      {showDocModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowDocModal(false)}
        >
          <div
            style={{
              background: "#08101d",
              border: "2px solid #38bdf8",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #1e3a60",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#060d17",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem" }}>🇮🇳</span>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#f8fafc" }}>
                    OFFICIAL MILITARY DEFENCE CERTIFICATE
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    Novexa Defence Trust • Verified Sovereign Archive Record
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Certificate Body (Formal Military Parchment Styling) */}
            <div style={{ padding: "32px 36px" }}>
              <div
                style={{
                  border: "2px double #1e3a60",
                  padding: "28px",
                  background: "linear-gradient(180deg, #091322 0%, #060c16 100%)",
                  borderRadius: "6px",
                  position: "relative",
                }}
              >
                {/* Watermark Crest */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "10rem",
                    opacity: 0.03,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  ⚔
                </div>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#38bdf8", fontWeight: 700 }}>
                    GOVERNMENT OF INDIA • MINISTRY OF DEFENCE
                  </div>
                  <h2
                    className="font-display"
                    style={{
                      fontSize: "1.5rem",
                      color: "#f8fafc",
                      margin: "8px 0 4px 0",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    CERTIFICATE OF MILITARY COMPLIANCE
                  </h2>
                  <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {cert.authority.name}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    padding: "16px 0",
                    borderTop: "1px solid #1e3a60",
                    borderBottom: "1px solid #1e3a60",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>CERTIFICATE NUMBER:</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#38bdf8", fontFamily: "monospace" }}>
                      {cert.certificateNumber}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>SECURITY CLASSIFICATION:</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#f87171" }}>
                      {cert.document.classification}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "0.875rem", color: "#cbd5e1", lineHeight: 1.7, marginBottom: 18 }}>
                  This certifies that the defence asset designated as{" "}
                  <strong style={{ color: "#f8fafc" }}>{cert.asset.assetName}</strong> (Identifier:{" "}
                  <span className="meta-id" style={{ color: "#60a5fa" }}>{cert.asset.assetId}</span>, Serial:{" "}
                  <span className="meta-id">{cert.asset.serialNumber}</span>), currently under custody of{" "}
                  <strong style={{ color: "#f8fafc" }}>{cert.asset.department}</strong>, has undergone formal military testing and evaluation under standard:
                </p>

                <div
                  style={{
                    padding: "12px 16px",
                    background: "#081322",
                    border: "1px solid #1e3a60",
                    borderRadius: "4px",
                    color: "#38bdf8",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textAlign: "center",
                    marginBottom: 18,
                  }}
                >
                  {cert.standard}
                </div>

                <div style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: 24 }}>
                  {cert.complianceScope}
                </div>

                {/* Signatory & Authority Stamp Box */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    paddingTop: 16,
                    borderTop: "1px solid #1e3a60",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>ISSUED BY:</div>
                    <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.875rem" }}>
                      {cert.authority.signatoryOfficer}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {cert.authority.rank}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Seal Code: {cert.authority.sealCode}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        border: "2px solid #22c55e",
                        borderRadius: "6px",
                        color: "#22c55e",
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        letterSpacing: "0.06em",
                        marginBottom: 4,
                      }}
                    >
                      SEALED & VALIDATED
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Valid: {formatDate(cert.issueDate)} &rarr; {formatDate(cert.expiryDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div style={{ marginTop: 20, textAlign: "right" }}>
                <button
                  onClick={() => setShowDocModal(false)}
                  className="btn-primary"
                  style={{ padding: "8px 24px" }}
                >
                  Close Document Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
