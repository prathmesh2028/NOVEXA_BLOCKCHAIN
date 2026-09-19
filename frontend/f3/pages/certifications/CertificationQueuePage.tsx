import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import { formatDateTime, formatDate, ASSETS } from "../../data/mockData";
import {
  certificationService,
  CertificationResponse,
  CertificationQueueStats,
} from "../../services/certifications";
import { useAuth } from "../../context/AuthContext";

export default function CertificationQueuePage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "id" | "status">("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CertificationQueueStats>(() => certificationService.getStats());

  // Review Modal state
  const [selectedCert, setSelectedCert] = useState<CertificationResponse | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await certificationService.listCertifications({
        search: search || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        sort_by: sortBy,
        page,
        page_size: pageSize,
      });
      setCertifications(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages || 1);
      setStats(certificationService.getStats());
    } catch (err) {
      console.error("Failed to load certifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = certificationService.subscribe(() => {
      setStats(certificationService.getStats());
      loadData();
    });
    return unsub;
  }, [search, filterStatus, sortBy, page]);

  useEffect(() => {
    const timer = setTimeout(loadData, 120);
    return () => clearTimeout(timer);
  }, [search, filterStatus, sortBy, page]);

  const hasActiveFilters = search.trim() !== "" || filterStatus !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setFilterStatus("ALL");
    setSortBy("date-desc");
    setPage(1);
  };

  const handleResetDemoData = () => {
    if (window.confirm("Reset all certification mock records back to original baseline state?")) {
      certificationService.resetToDefault();
      handleResetFilters();
      setFeedbackMessage({
        type: "success",
        text: "Certification mock session data reset to baseline.",
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  // Open Review Dialog
  const handleOpenReview = (cert: CertificationResponse) => {
    setSelectedCert(cert);
    setReviewNotes(cert.review_notes || "");
    setFeedbackMessage(null);
  };

  // Execute Approval
  const handleApprove = async () => {
    if (!selectedCert) return;
    setIsSubmitting(true);
    try {
      const result = await certificationService.approveCertification(
        selectedCert.id,
        reviewNotes,
        user?.name || "Priya Sharma",
        user?.id || "did:bel:actor:002"
      );

      if (result.success) {
        setFeedbackMessage({
          type: "success",
          text: result.message,
        });
        setSelectedCert(null);
      } else {
        setFeedbackMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Approval failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Rejection
  const handleReject = async () => {
    if (!selectedCert) return;
    if (!reviewNotes.trim()) {
      alert("A specific rejection reason or non-conformance note is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await certificationService.rejectCertification(
        selectedCert.id,
        reviewNotes,
        user?.name || "Priya Sharma",
        user?.id || "did:bel:actor:002"
      );

      if (result.success) {
        setFeedbackMessage({
          type: "warning",
          text: result.message,
        });
        setSelectedCert(null);
      } else {
        setFeedbackMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Rejection failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade">
      {/* Page Header */}
      <PageHeader
        title="Certification Queue"
        subtitle="Review eligible defence assets, verify lifecycle compliance, and authorize non-transferable NFT minting."
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certification Queue" },
        ]}
        badge={
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(59,130,246,0.35)",
              borderRadius: "4px",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "#60a5fa",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span>◆</span>
            <span>DEMO DATA · SIMULATED SESSION</span>
          </div>
        }
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              to="/app/certifications"
              className="btn-ghost"
              style={{ fontSize: "0.75rem", border: "1px solid #1e3a60" }}
            >
              All Certifications →
            </Link>
            <button
              onClick={handleResetDemoData}
              className="btn-ghost"
              style={{ fontSize: "0.75rem", border: "1px solid #1e3a60" }}
              title="Reset mock session data"
            >
              ↺ Reset Demo Data
            </button>
          </div>
        }
      />

      {/* BEL Authority Notice Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(15, 23, 42, 0.65)",
          border: "1px solid #1e3a60",
          borderRadius: "6px",
          marginBottom: 20,
          fontSize: "0.8125rem",
          color: "#94a3b8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#38bdf8", fontSize: "1.1rem" }}>ℹ</span>
          <span>
            <strong style={{ color: "#e2e8f0" }}>BEL Defence Certification Authority (Simulated Workstation):</strong>{" "}
            Review queue evaluates asset lifecycle readiness, SHA-256 evidence integrity, and cryptographic credentials before issuing non-transferable tokens.
          </span>
        </div>
        <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
          QUEUE ACTIVE · {stats.total} TOTAL RECORDS
        </span>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
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
              feedbackMessage.type === "success"
                ? "1px solid rgba(34, 197, 94, 0.4)"
                : feedbackMessage.type === "warning"
                ? "1px solid rgba(245, 158, 11, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
            background:
              feedbackMessage.type === "success"
                ? "rgba(34, 197, 94, 0.12)"
                : feedbackMessage.type === "warning"
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(239, 68, 68, 0.12)",
            color:
              feedbackMessage.type === "success"
                ? "#4ade80"
                : feedbackMessage.type === "warning"
                ? "#fbbf24"
                : "#f87171",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{feedbackMessage.type === "success" ? "✓" : feedbackMessage.type === "warning" ? "⚠" : "✕"}</span>
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Dynamic Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          onClick={() => { setFilterStatus("ALL"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Total in Queue"
            value={stats.total}
            sub="All certification records"
            accent="#e2e8f0"
            icon="📋"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("PENDING"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Pending Review"
            value={stats.pending}
            sub="Awaiting NFT Creator sign-off"
            accent="#f59e0b"
            icon="◐"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("CONFIRMED"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Confirmed / Minted"
            value={stats.confirmed}
            sub="Anchored on BEL-TRUST-CHAIN"
            accent="#22c55e"
            icon="✓"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("FAILED"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Rejected / Failed"
            value={stats.failed}
            sub="Non-conformance / Quarantined"
            accent="#ef4444"
            icon="✕"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("REVOKED"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Revoked"
            value={stats.revoked}
            sub="Superseded standard / Expired"
            accent="#8b5cf6"
            icon="⊘"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="panel"
        style={{
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Search Input */}
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: "0.8125rem",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            className="input-field"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Certification ID, Asset ID, Name, or Issuer…"
            style={{ paddingLeft: 34 }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Status:
          </span>
          {[
            { key: "ALL", label: "All" },
            { key: "PENDING", label: "Pending" },
            { key: "CONFIRMED", label: "Confirmed" },
            { key: "FAILED", label: "Failed" },
            { key: "REVOKED", label: "Revoked" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setFilterStatus(s.key);
                setPage(1);
              }}
              style={{
                padding: "5px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "1px solid",
                borderColor: filterStatus === s.key ? "#2563eb" : "#1e3a60",
                background: filterStatus === s.key ? "rgba(37,99,235,0.2)" : "#0c1828",
                color: filterStatus === s.key ? "#e2e8f0" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sorting and Clear Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ width: "auto", minWidth: 140, padding: "7px 10px", fontSize: "0.75rem" }}
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="id">Certification ID</option>
            <option value="status">Status</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn-ghost"
              style={{ padding: "6px 12px", fontSize: "0.75rem", color: "#f87171" }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Certification Records Table */}
      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
                {[
                  "Certification ID",
                  "Asset Reference",
                  "Certification Type & Token",
                  "Issuer / Authorizer",
                  "Issued Date",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: "0.6875rem",
                      color: "#64748b",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: 6 }}>⏳</div>
                    Loading certification queue...
                  </td>
                </tr>
              ) : certifications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.5 }}>◆</div>
                    <div style={{ fontSize: "1rem", color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>
                      No Certification Records in Queue
                    </div>
                    <p style={{ margin: "0 0 16px", fontSize: "0.8125rem", color: "#64748b" }}>
                      No queue items match the current search query and filters.
                    </p>
                    {hasActiveFilters && (
                      <button onClick={handleResetFilters} className="btn-secondary" style={{ fontSize: "0.75rem" }}>
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                certifications.map((c) => {
                  const isPending = c.status === "PENDING";
                  return (
                    <tr
                      key={c.id}
                      className="table-row"
                      style={{
                        borderBottom: "1px solid #152b4a",
                        cursor: "pointer",
                      }}
                    >
                      {/* Certification ID */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <Link
                          to={`/app/certifications/${c.id}`}
                          style={{ textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span
                            className="meta-id"
                            style={{
                              color: "#60a5fa",
                              fontWeight: 600,
                              fontSize: "0.8125rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>◆</span> {c.cert_id}
                          </span>
                        </Link>
                        <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: 2 }}>
                          {c.network?.split(" ")[0] || "BEL-TRUST-CHAIN"}
                        </div>
                      </td>

                      {/* Associated Asset */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <Link
                          to={`/app/assets/${c.asset_id}`}
                          style={{
                            fontSize: "0.8125rem",
                            color: "#e2e8f0",
                            fontWeight: 600,
                            textDecoration: "none",
                            display: "block",
                          }}
                          className="hover:text-[#60a5fa]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.asset_name || c.asset_id}
                        </Link>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                          <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                            {c.asset_id}
                          </span>
                          <span style={{ color: "#1e3a60", fontSize: "0.6875rem" }}>•</span>
                          <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#475569" }}>
                            {c.batch_id}
                          </span>
                        </div>
                      </td>

                      {/* Cert Type & Token */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <div style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>
                          {c.cert_type || "Defence Quality NFT Certificate"}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                          <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#38bdf8" }}>
                            Token: {c.token_id || "Awaiting Minting"}
                          </span>
                          {c.confirmations > 0 && (
                            <span style={{ fontSize: "0.6875rem", color: "#22c55e" }}>
                              ({c.confirmations} conf)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Issuer */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>
                          {c.issued_by || "Priya Sharma"}
                        </div>
                        <div className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                          NFT Creator
                        </div>
                      </td>

                      {/* Issued Date */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                          {formatDate(c.issued_at)}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "#475569" }}>
                          {c.confirmed_at ? `Minted ${formatDate(c.confirmed_at)}` : "Awaiting Sign-off"}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {isPending ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReview(c);
                              }}
                              className="btn-primary"
                              style={{
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                background: "#2563eb",
                              }}
                            >
                              Review & Sign →
                            </button>
                          ) : null}

                          <Link
                            to={`/app/certifications/${c.id}`}
                            className="btn-ghost"
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.75rem",
                              border: "1px solid #1e3a60",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Details →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #152b4a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: "0.75rem",
            color: "#64748b",
          }}
        >
          <div>
            Showing <strong style={{ color: "#e2e8f0" }}>{certifications.length}</strong> of{" "}
            <strong style={{ color: "#e2e8f0" }}>{total}</strong> certification queue items
            {hasActiveFilters && " (Filtered)"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-ghost"
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
            >
              ← Previous
            </button>

            <span style={{ color: "#94a3b8", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-ghost"
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Review & Approval Modal Dialog */}
      {selectedCert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 15, 29, 0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            className="panel-elevated"
            style={{
              maxWidth: 580,
              width: "100%",
              padding: 24,
              border: "1px solid #1e3a60",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    background: "rgba(37,99,235,0.15)",
                    border: "1px solid #2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    color: "#60a5fa",
                  }}
                >
                  ◆
                </div>
                <div>
                  <h3 className="font-display" style={{ margin: 0, fontSize: "1.25rem", color: "#e2e8f0" }}>
                    Review & Authorize Certification
                  </h3>
                  <span className="meta-id" style={{ color: "#64748b", fontSize: "0.75rem" }}>
                    {selectedCert.id} · Asset {selectedCert.asset_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: "1.25rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Asset Details Grid */}
            <div
              style={{
                background: "#08131f",
                border: "1px solid #152b4a",
                borderRadius: "6px",
                padding: "14px 16px",
                marginBottom: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                fontSize: "0.8125rem",
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontSize: "0.6875rem", display: "block" }}>ASSET NAME</span>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{selectedCert.asset_name || "Defence Asset"}</span>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.6875rem", display: "block" }}>BATCH IDENTIFIER</span>
                <span className="meta-id" style={{ color: "#94a3b8" }}>{selectedCert.batch_id}</span>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.6875rem", display: "block" }}>TOKEN ALLOCATION</span>
                <span className="meta-id" style={{ color: "#38bdf8" }}>{selectedCert.token_id || "TKN-READY"}</span>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.6875rem", display: "block" }}>BLOCKCHAIN TARGET</span>
                <span style={{ color: "#cbd5e1" }}>BEL-TRUST-CHAIN</span>
              </div>
            </div>

            {/* Review Notes Form */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                REVIEW NOTES & NON-CONFORMANCE LOGS
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter authorization notes, evidence verification confirmation, or non-conformance rejection reason…"
                style={{ fontSize: "0.875rem", lineHeight: 1.5 }}
              />
              <span style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 4, display: "block" }}>
                Mandatory when rejecting. Recorded immutably in the certification audit trail.
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="btn-danger"
                style={{ fontSize: "0.8125rem", padding: "8px 16px" }}
              >
                {isSubmitting ? "Processing..." : "Reject Certification"}
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="btn-secondary"
                  style={{ fontSize: "0.8125rem" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    fontSize: "0.8125rem",
                    padding: "8px 18px",
                    background: "#22c55e",
                  }}
                >
                  {isSubmitting ? "Authorizing..." : "✓ Approve & Mint NFT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
