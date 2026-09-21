import { useState, useMemo } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { formatDate } from "../../data/utils";
import {
  CertificationRecord,
  CertificationType,
  CertificationStatus,
  CertVerificationStatus,
  CERTIFICATION_TYPES,
  CERTIFICATION_STATUSES,
  VERIFICATION_STATUSES,
  getCertifications,
  getCertificationStats,
} from "./certificationData";

export default function CertificationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const stats = useMemo(() => getCertificationStats(), []);

  const filteredCerts = useMemo(() => {
    return getCertifications({
      search,
      type: typeFilter,
      status: statusFilter,
      verification: verificationFilter,
    });
  }, [search, typeFilter, statusFilter, verificationFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    verificationFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setVerificationFilter("ALL");
  };

  // Status badge helper
  const renderStatusBadge = (status: CertificationStatus) => {
    const config: Record<
      CertificationStatus,
      { bg: string; text: string; border: string; dot: string }
    > = {
      Valid: {
        bg: "rgba(34, 197, 94, 0.12)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.3)",
        dot: "#22c55e",
      },
      Expiring: {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        dot: "#f59e0b",
      },
      Expired: {
        bg: "rgba(239, 68, 68, 0.12)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.3)",
        dot: "#ef4444",
      },
    };

    const c = config[status] || config["Valid"];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 9px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: c.dot,
          }}
        />
        {status}
      </span>
    );
  };

  // Verification status badge helper
  const renderVerificationBadge = (vStatus: CertVerificationStatus) => {
    const config: Record<
      CertVerificationStatus,
      { bg: string; text: string; border: string; icon: string }
    > = {
      Verified: {
        bg: "rgba(16, 185, 129, 0.12)",
        text: "#10b981",
        border: "rgba(16, 185, 129, 0.3)",
        icon: "✓",
      },
      "Pending Verification": {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        icon: "◷",
      },
      "Verification Required": {
        bg: "rgba(239, 68, 68, 0.12)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.3)",
        icon: "⚠",
      },
    };

    const c = config[vStatus] || config["Verified"];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 9px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          whiteSpace: "nowrap",
        }}
      >
        <span>{c.icon}</span>
        {vStatus}
      </span>
    );
  };

  // Certification Type styling
  const renderTypeTag = (type: CertificationType) => {
    const colorMap: Record<CertificationType, { text: string; bg: string }> = {
      "Safety Certification": { text: "#38bdf8", bg: "rgba(56, 189, 248, 0.1)" },
      "Operational Certification": { text: "#a78bfa", bg: "rgba(167, 139, 250, 0.1)" },
      "Maintenance Certification": { text: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
      "Quality Certification": { text: "#34d399", bg: "rgba(52, 211, 153, 0.1)" },
      "Compliance Certification": { text: "#f472b6", bg: "rgba(244, 114, 182, 0.1)" },
    };

    const c = colorMap[type] || { text: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)" };

    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "3px",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: c.text,
          background: c.bg,
          border: `1px solid ${c.text}26`,
          whiteSpace: "nowrap",
        }}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="page-fade" style={{ maxWidth: "1600px", margin: "0 auto" }}>
      {/* Header Section */}
      <PageHeader
        title="Certifications"
        subtitle="Manage sovereign certification, military airworthiness, and cryptographic proof records associated with defence assets."
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certifications" },
        ]}
        actions={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              to="/app/certification-queue"
              className="btn-secondary"
              style={{ fontSize: "0.8125rem", padding: "6px 14px" }}
            >
              Certification Queue →
            </Link>
          </div>
        }
      />

      {/* KPI Metric Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Issued"
          value={stats.total.toString()}
          icon="◆"
          accent="#38bdf8"
          sub="Sovereign military records"
        />
        <StatCard
          label="Active & Valid"
          value={stats.valid.toString()}
          icon="✓"
          accent="#22c55e"
          sub="Current regulatory clearance"
        />
        <StatCard
          label="Expiring Soon"
          value={stats.expiring.toString()}
          icon="◷"
          accent="#f59e0b"
          sub="Recertification required <60d"
        />
        <StatCard
          label="Confirmed On-Chain"
          value={stats.verified.toString()}
          icon="⬡"
          accent="#a855f7"
          sub="Cryptographically anchored"
        />
      </div>

      {/* Search, Filters, and Controls Bar */}
      <div
        className="panel"
        style={{
          padding: "16px 20px",
          marginBottom: 20,
          background: "#0a1320",
          border: "1px solid #1e3a60",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Search bar */}
          <div style={{ flex: "1 1 300px", minWidth: "260px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                fontSize: "0.875rem",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by Certificate ID, Asset Name, Asset ID, Authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                background: "#060d17",
                border: "1px solid #1e3a60",
                borderRadius: "6px",
                color: "#e2e8f0",
                fontSize: "0.8125rem",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
              onBlur={(e) => (e.target.style.borderColor = "#1e3a60")}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  padding: "4px",
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Toggle */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {/* Certification Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "#060d17",
                border: "1px solid #1e3a60",
                borderRadius: "6px",
                color: "#cbd5e1",
                fontSize: "0.75rem",
                fontWeight: 500,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Certification Types</option>
              {CERTIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "#060d17",
                border: "1px solid #1e3a60",
                borderRadius: "6px",
                color: "#cbd5e1",
                fontSize: "0.75rem",
                fontWeight: 500,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Statuses</option>
              {CERTIFICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>

            {/* Verification Status Filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "#060d17",
                border: "1px solid #1e3a60",
                borderRadius: "6px",
                color: "#cbd5e1",
                fontSize: "0.75rem",
                fontWeight: 500,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Verification</option>
              {VERIFICATION_STATUSES.map((v) => (
                <option key={v} value={v}>
                  Proof: {v}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-ghost"
                style={{
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  background: "rgba(239, 68, 68, 0.08)",
                  borderRadius: "6px",
                }}
              >
                ✕ Reset
              </button>
            )}

            {/* View Mode Switcher */}
            <div
              style={{
                display: "inline-flex",
                background: "#060d17",
                border: "1px solid #1e3a60",
                borderRadius: "6px",
                padding: "2px",
              }}
            >
              <button
                onClick={() => setViewMode("table")}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  background: viewMode === "table" ? "#1e3a60" : "transparent",
                  color: viewMode === "table" ? "#ffffff" : "#64748b",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                title="Table View"
              >
                <span>☰</span> Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  background: viewMode === "cards" ? "#1e3a60" : "transparent",
                  color: viewMode === "cards" ? "#ffffff" : "#64748b",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                title="Card View"
              >
                <span>⊞</span> Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredCerts.length === 0 ? (
        /* Empty State */
        <div
          className="panel"
          style={{
            padding: "60px 24px",
            textAlign: "center",
            background: "#0a1320",
            border: "1px dashed #1e3a60",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 12, opacity: 0.35 }}>
            🛡
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#cbd5e1",
              marginBottom: 8,
              letterSpacing: "0.02em",
            }}
          >
            NO CERTIFICATION RECORDS FOUND
          </h3>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              maxWidth: "480px",
              margin: "0 auto 20px",
              lineHeight: 1.5,
            }}
          >
            No active defence certification or proof entries match your current search and filter parameters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "0.8125rem" }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div
          className="panel"
          style={{
            overflow: "hidden",
            background: "#0a1320",
            border: "1px solid #1e3a60",
            borderRadius: "8px",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1050,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #1e3a60",
                    background: "#060d17",
                  }}
                >
                  {[
                    "Certificate ID",
                    "Associated Asset",
                    "Certification Type",
                    "Issuing Authority",
                    "Issue Date",
                    "Expiry Date",
                    "Status",
                    "Verification Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        fontSize: "0.6875rem",
                        color: "#64748b",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map((cert) => (
                  <tr
                    key={cert.id}
                    className="table-row"
                    style={{
                      borderBottom: "1px solid #132438",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Certificate ID */}
                    <td style={{ padding: "14px", whiteSpace: "nowrap" }}>
                      <Link
                        to={`/app/certifications/${cert.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <span
                          className="meta-id"
                          style={{
                            color: "#38bdf8",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            fontSize: "0.8125rem",
                            display: "inline-block",
                          }}
                        >
                          {cert.id}
                        </span>
                      </Link>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "#64748b",
                          marginTop: "2px",
                          fontFamily: "monospace",
                        }}
                      >
                        {cert.certificateNumber}
                      </div>
                    </td>

                    {/* Associated Asset */}
                    <td style={{ padding: "14px" }}>
                      <Link
                        to={`/app/assets/${cert.asset.assetId}`}
                        style={{
                          textDecoration: "none",
                          color: "#e2e8f0",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                        }}
                      >
                        {cert.asset.assetName}
                      </Link>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "3px" }}>
                        <span
                          className="meta-id"
                          style={{ color: "#60a5fa", fontSize: "0.6875rem" }}
                        >
                          {cert.asset.assetId}
                        </span>
                        <span style={{ color: "#475569", fontSize: "0.6875rem" }}>•</span>
                        <span style={{ color: "#94a3b8", fontSize: "0.6875rem" }}>
                          {cert.asset.department}
                        </span>
                      </div>
                    </td>

                    {/* Certification Type */}
                    <td style={{ padding: "14px" }}>
                      {renderTypeTag(cert.type)}
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "#64748b",
                          marginTop: "4px",
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={cert.standard}
                      >
                        {cert.standard}
                      </div>
                    </td>

                    {/* Issuing Authority */}
                    <td style={{ padding: "14px" }}>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "#e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        {cert.authority.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        {cert.authority.code} • {cert.authority.signatoryOfficer.split(",")[0]}
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td
                      style={{
                        padding: "14px",
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(cert.issueDate)}
                    </td>

                    {/* Expiry Date */}
                    <td
                      style={{
                        padding: "14px",
                        fontSize: "0.75rem",
                        color: cert.status === "Expired" ? "#ef4444" : cert.status === "Expiring" ? "#f59e0b" : "#94a3b8",
                        fontWeight: cert.status !== "Valid" ? 600 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(cert.expiryDate)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px" }}>
                      {renderStatusBadge(cert.status)}
                    </td>

                    {/* Verification Status */}
                    <td style={{ padding: "14px" }}>
                      {renderVerificationBadge(cert.verificationStatus)}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "14px", whiteSpace: "nowrap" }}>
                      <Link
                        to={`/app/certifications/${cert.id}`}
                        className="btn-ghost"
                        style={{
                          padding: "5px 12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          background: "rgba(56, 189, 248, 0.06)",
                          borderRadius: "4px",
                          textDecoration: "none",
                        }}
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Count */}
          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #1e3a60",
              background: "#060d17",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            <div>
              Showing <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{filteredCerts.length}</span> of{" "}
              <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{stats.total}</span> military certification dossiers
            </div>
            <div style={{ fontSize: "0.7rem", color: "#475569" }}>
              Novexa Defence Sovereign Registry • SHA-256 Validated
            </div>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="panel"
              style={{
                padding: "20px",
                background: "#0a1320",
                border: "1px solid #1e3a60",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                {/* Top badges bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                    gap: 8,
                  }}
                >
                  <div>
                    <span
                      className="meta-id"
                      style={{
                        color: "#38bdf8",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        display: "block",
                      }}
                    >
                      {cert.id}
                    </span>
                    <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {cert.certificateNumber}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {renderStatusBadge(cert.status)}
                  </div>
                </div>

                {/* Certificate Type */}
                <div style={{ marginBottom: 12 }}>
                  {renderTypeTag(cert.type)}
                </div>

                {/* Associated Asset Info Box */}
                <div
                  style={{
                    padding: "10px 12px",
                    background: "#060d17",
                    border: "1px solid #152b4a",
                    borderRadius: "6px",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                    Associated Defence Asset
                  </div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.8125rem", marginBottom: 2 }}>
                    {cert.asset.assetName}
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: "0.7rem", color: "#94a3b8" }}>
                    <span className="meta-id" style={{ color: "#60a5fa" }}>{cert.asset.assetId}</span>
                    <span>•</span>
                    <span>{cert.asset.department}</span>
                  </div>
                </div>

                {/* Issuing Authority */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Issuing Authority
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#cbd5e1", fontWeight: 500, marginTop: 2 }}>
                    {cert.authority.name}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 1 }}>
                    Signatory: {cert.authority.signatoryOfficer}
                  </div>
                </div>

                {/* Validity Dates */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    padding: "8px 0",
                    borderTop: "1px solid #152b4a",
                    borderBottom: "1px solid #152b4a",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Issued:</span>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
                      {formatDate(cert.issueDate)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Expires:</span>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: cert.status === "Expired" ? "#ef4444" : cert.status === "Expiring" ? "#f59e0b" : "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {formatDate(cert.expiryDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "6px",
                }}
              >
                <div>{renderVerificationBadge(cert.verificationStatus)}</div>
                <Link
                  to={`/app/certifications/${cert.id}`}
                  className="btn-primary"
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.75rem",
                    textDecoration: "none",
                  }}
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Non-transferable State Notice Banner */}
      <div
        style={{
          marginTop: 24,
          padding: "14px 20px",
          background: "rgba(139, 92, 246, 0.07)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ color: "#a855f7", fontSize: "1.3rem" }}>⊠</span>
        <div style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6 }}>
          <strong style={{ color: "#c084fc", letterSpacing: "0.02em" }}>
            NON-TRANSFERABLE DEFENCE CERTIFICATIONS:
          </strong>{" "}
          All military certificates and airworthiness credentials issued through NOVEXA are non-transferable state attestations permanently bound to specific asset serial numbers and issuing defence authorities.
        </div>
      </div>
    </div>
  );
}
