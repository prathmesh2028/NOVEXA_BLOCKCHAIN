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
