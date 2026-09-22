import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { formatDate } from "../../data/utils";

import {
  CertificationType,
  CertificationStatus,
  CertVerificationStatus,
  CERTIFICATION_TYPES,
  CERTIFICATION_STATUSES,
  VERIFICATION_STATUSES,
  getCertifications,
} from "./certificationData";

/*
 * IMPORTANT:
 * Keep the EXACT import paths used by your project for these 3 items.
 *
 * CertificationResponse
 * certificationService
 * dashboardService
 *
 * Your conflict file did not contain those imports, so their original
 * paths cannot be determined safely from the uploaded file alone.
 */

// import type { CertificationResponse } from "../../services/certificationService";
// import { certificationService } from "../../services/certificationService";
// import { dashboardService } from "../../services/dashboardService";


export default function CertificationsPage() {
  /* ============================================================
     API STATE
     ============================================================ */

  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [confirmed, setConfirmed] = useState(0);

  /* ============================================================
     SEARCH / FILTER STATE
     ============================================================ */

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  /* ============================================================
     CREATE CERTIFICATION STATE
     ============================================================ */

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [assetIdInput, setAssetIdInput] = useState("");
  const [batchIdInput, setBatchIdInput] = useState("");

  const [createStatus, setCreateStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ============================================================
     FETCH DATA
     ============================================================ */

  const fetchData = async () => {
    setLoading(true);

    try {
      /*
       * If your project has certificationService/dashboardService,
       * use the original implementation from the test branch here.
       *
       * Example:
       *
       * const [listRes, summaryRes] = await Promise.all([
       *   certificationService.listCertifications({ page_size: 100 }),
       *   dashboardService.getSummary(),
       * ]);
       *
       * setCerts(listRes.items);
       * setTotal(listRes.total);
       * setPending(summaryRes.pending_certifications);
       * setConfirmed(summaryRes.confirmed_certifications);
       */

      const localCertifications = getCertifications();

      setCerts(localCertifications as any[]);
      setTotal(localCertifications.length);

      setPending(
        localCertifications.filter(
          (c: any) =>
            c.status === "Pending" ||
            c.status === "PENDING" ||
            c.verificationStatus === "Pending Verification"
        ).length
      );

      setConfirmed(
        localCertifications.filter(
          (c: any) =>
            c.verificationStatus === "Verified" ||
            c.status === "CONFIRMED"
        ).length
      );
    } catch (err) {
      console.error("Failed to load certifications:", err);
      setCerts([]);
      setTotal(0);
      setPending(0);
      setConfirmed(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ============================================================
     CREATE CERTIFICATION
     ============================================================ */

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetIdInput.trim()) {
      return;
    }

    setIsSubmitting(true);
    setCreateStatus(null);

    try {
      /*
       * RESTORE YOUR EXISTING TEST-BRANCH API CALL HERE:
       *
       * await certificationService.createCertification({
       *   asset_id: assetIdInput.trim(),
       *   batch_id: batchIdInput.trim() || undefined,
       * });
       *
       * The conflict file confirms this was the test branch's
       * original implementation.
       */

      throw new Error(
        "Connect certificationService.createCertification() here."
      );
    } catch (err: any) {
      setCreateStatus({
        type: "error",
        message:
          err?.data?.message ||
          err?.message ||
          "Failed to create certification",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     FRONTEND FILTERING
     ============================================================ */

  const filteredCerts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return certs.filter((cert: any) => {
      const matchesSearch =
        !normalizedSearch ||
        String(cert.id ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(cert.cert_id ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(cert.certificateNumber ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(cert.asset_id ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(cert.asset?.assetId ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(cert.asset?.assetName ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(cert.authority?.name ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesType =
        typeFilter === "ALL" || cert.type === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" || cert.status === statusFilter;

      const matchesVerification =
        verificationFilter === "ALL" ||
        cert.verificationStatus === verificationFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesVerification
      );
    });
  }, [
    certs,
    search,
    typeFilter,
    statusFilter,
    verificationFilter,
  ]);

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

  /* ============================================================
     STATISTICS
     ============================================================ */

  const stats = useMemo(() => {
    const valid = certs.filter(
      (c: any) =>
        c.status === "Valid" ||
        c.status === "VALID" ||
        c.status === "CONFIRMED"
    ).length;

    const expiring = certs.filter(
      (c: any) => c.status === "Expiring"
    ).length;

    const verified = certs.filter(
      (c: any) =>
        c.verificationStatus === "Verified" ||
        c.status === "CONFIRMED"
    ).length;

    return {
      total: total || certs.length,
      valid,
      expiring,
      verified,
    };
  }, [certs, total]);

  /* ============================================================
     STATUS BADGE
     ============================================================ */

  const renderStatusBadge = (status: CertificationStatus | string) => {
    const config: Record<
      string,
      {
        bg: string;
        text: string;
        border: string;
        dot: string;
      }
    > = {
      Valid: {
        bg: "rgba(34, 197, 94, 0.12)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.3)",
        dot: "#22c55e",
      },

      VALID: {
        bg: "rgba(34, 197, 94, 0.12)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.3)",
        dot: "#22c55e",
      },

      CONFIRMED: {
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

      PENDING: {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        dot: "#f59e0b",
      },

      Pending: {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        dot: "#f59e0b",
      },
    };

    const c =
      config[String(status)] ||
      config["Valid"];

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

  /* ============================================================
     VERIFICATION BADGE
     ============================================================ */

  const renderVerificationBadge = (
    vStatus: CertVerificationStatus | string
  ) => {
    const config: Record<
      string,
      {
        bg: string;
        text: string;
        border: string;
        icon: string;
      }
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

      CONFIRMED: {
        bg: "rgba(16, 185, 129, 0.12)",
        text: "#10b981",
        border: "rgba(16, 185, 129, 0.3)",
        icon: "✓",
      },

      PENDING: {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        icon: "◷",
      },
    };

    const c =
      config[String(vStatus)] ||
      config["Verified"];

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

  /* ============================================================
     TYPE TAG
     ============================================================ */

  const renderTypeTag = (type: CertificationType | string) => {
    const colorMap: Record<
      string,
      { text: string; bg: string }
    > = {
      "Safety Certification": {
        text: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.1)",
      },

      "Operational Certification": {
        text: "#a78bfa",
        bg: "rgba(167, 139, 250, 0.1)",
      },

      "Maintenance Certification": {
        text: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.1)",
      },

      "Quality Certification": {
        text: "#34d399",
        bg: "rgba(52, 211, 153, 0.1)",
      },

      "Compliance Certification": {
        text: "#f472b6",
        bg: "rgba(244, 114, 182, 0.1)",
      },
    };

    const c =
      colorMap[String(type)] || {
        text: "#94a3b8",
        bg: "rgba(148, 163, 184, 0.1)",
      };

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

  /* ============================================================
     SAFE DATA HELPERS
     ============================================================ */

  const getId = (cert: any) =>
    cert.id || cert.cert_id || "UNKNOWN";

  const getCertificateNumber = (cert: any) =>
    cert.certificateNumber ||
    cert.cert_id ||
    cert.id ||
    "—";

  const getAssetId = (cert: any) =>
    cert.asset?.assetId ||
    cert.asset_id ||
    "—";

  const getAssetName = (cert: any) =>
    cert.asset?.assetName ||
    cert.asset_name ||
    "Unknown Asset";

  const getDepartment = (cert: any) =>
    cert.asset?.department ||
    cert.department ||
    "—";

  const getAuthorityName = (cert: any) =>
    cert.authority?.name ||
    cert.issued_by ||
    cert.issuedBy ||
    "—";

  const getAuthorityCode = (cert: any) =>
    cert.authority?.code ||
    cert.authority_code ||
    "—";

  const getSignatory = (cert: any) =>
    cert.authority?.signatoryOfficer ||
    cert.signatoryOfficer ||
    "—";

  const getType = (cert: any) =>
    cert.type ||
    "Certification";

  const getStandard = (cert: any) =>
    cert.standard ||
    "—";

  const getIssueDate = (cert: any) =>
    cert.issueDate ||
    cert.issued_at ||
    cert.issuedAt;

  const getExpiryDate = (cert: any) =>
    cert.expiryDate ||
    cert.expires_at ||
    cert.expiresAt;

  const getStatus = (cert: any) =>
    cert.status || "Valid";

  const getVerificationStatus = (cert: any) =>
    cert.verificationStatus ||
    (cert.status === "CONFIRMED"
      ? "Verified"
      : "Pending Verification");

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div
      className="page-fade"
      style={{
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        title="Certifications"
        subtitle="Manage sovereign certification, military airworthiness, and cryptographic proof records associated with defence assets."
        breadcrumbs={[
          {
            label: "Dashboard",
            to: "/app/dashboard",
          },
          {
            label: "Certifications",
          },
        ]}
        actions={
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <Link
              to="/app/certification-queue"
              className="btn-secondary"
              style={{
                fontSize: "0.8125rem",
                padding: "6px 14px",
                textDecoration: "none",
              }}
            >
              Certification Queue →
            </Link>

            <button
              className="btn-primary"
              onClick={() => {
                setShowCreateModal(true);
                setCreateStatus(null);
              }}
            >
              + Create Certification
            </button>

            <button
              className="btn-ghost"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        }
      />

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
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

      {/* ======================================================
          SEARCH / FILTER BAR
      ====================================================== */}

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
          {/* SEARCH */}

          <div
            style={{
              flex: "1 1 300px",
              minWidth: "260px",
              position: "relative",
            }}
          >
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
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                width: "100%",
                padding: "9px 36px 9px 36px",
                background: "#060d17",
                border: "1px solid #1e3a60",
                borderRadius: "6px",
                color: "#e2e8f0",
                fontSize: "0.8125rem",
                outline: "none",
              }}
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

          {/* FILTERS */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {/* TYPE */}

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
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
              <option value="ALL">
                All Certification Types
              </option>

              {CERTIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
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
              <option value="ALL">
                All Statuses
              </option>

              {CERTIFICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>

            {/* VERIFICATION */}

            <select
              value={verificationFilter}
              onChange={(e) =>
                setVerificationFilter(e.target.value)
              }
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
              <option value="ALL">
                All Verification
              </option>

              {VERIFICATION_STATUSES.map((v) => (
                <option key={v} value={v}>
                  Proof: {v}
                </option>
              ))}
            </select>

            {/* CLEAR */}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-ghost"
                style={{
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  color: "#f87171",
                  border:
                    "1px solid rgba(239, 68, 68, 0.3)",
                  background:
                    "rgba(239, 68, 68, 0.08)",
                  borderRadius: "6px",
                }}
              >
                ✕ Reset
              </button>
            )}

            {/* VIEW TOGGLE */}

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
                onClick={() =>
                  setViewMode("table")
                }
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  background:
                    viewMode === "table"
                      ? "#1e3a60"
                      : "transparent",
                  color:
                    viewMode === "table"
                      ? "#ffffff"
                      : "#64748b",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ☰ Table
              </button>

              <button
                onClick={() =>
                  setViewMode("cards")
                }
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  background:
                    viewMode === "cards"
                      ? "#1e3a60"
                      : "transparent",
                  color:
                    viewMode === "cards"
                      ? "#ffffff"
                      : "#64748b",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ⊞ Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      {loading ? (
        <div
          className="panel"
          style={{
            padding: "60px 24px",
            textAlign: "center",
            background: "#0a1320",
            border: "1px solid #1e3a60",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              marginBottom: 12,
            }}
          >
            ◌
          </div>

          <h3
            className="font-display"
            style={{
              color: "#cbd5e1",
              marginBottom: 8,
            }}
          >
            LOADING CERTIFICATIONS
          </h3>

          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            Retrieving certification records...
          </p>
        </div>
      ) : filteredCerts.length === 0 ? (
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
          <div
            style={{
              fontSize: "2.5rem",
              marginBottom: 12,
              opacity: 0.35,
            }}
          >
            🛡
          </div>

          <h3
            className="font-display"
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#cbd5e1",
              marginBottom: 8,
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
            No active defence certification or proof
            entries match your current search and
            filter parameters.
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-primary"
              style={{
                padding: "8px 18px",
                fontSize: "0.8125rem",
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* ====================================================
           TABLE VIEW
        ==================================================== */

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
                    borderBottom:
                      "1px solid #1e3a60",
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
                {filteredCerts.map(
                  (cert: any) => {
                    const id = getId(cert);
                    const assetId =
                      getAssetId(cert);

                    return (
                      <tr
                        key={id}
                        className="table-row"
                        style={{
                          borderBottom:
                            "1px solid #132438",
                        }}
                      >
                        {/* CERTIFICATE ID */}

                        <td
                          style={{
                            padding: "14px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Link
                            to={`/app/certifications/${id}`}
                            style={{
                              textDecoration:
                                "none",
                            }}
                          >
                            <span
                              className="meta-id"
                              style={{
                                color: "#38bdf8",
                                fontWeight: 700,
                                letterSpacing:
                                  "0.04em",
                                fontSize:
                                  "0.8125rem",
                              }}
                            >
                              {id}
                            </span>
                          </Link>

                          <div
                            style={{
                              fontSize:
                                "0.6875rem",
                              color: "#64748b",
                              marginTop: 2,
                              fontFamily:
                                "monospace",
                            }}
                          >
                            {getCertificateNumber(
                              cert
                            )}
                          </div>
                        </td>

                        {/* ASSET */}

                        <td
                          style={{
                            padding: "14px",
                          }}
                        >
                          <Link
                            to={`/app/assets/${assetId}`}
                            style={{
                              textDecoration:
                                "none",
                              color: "#e2e8f0",
                              fontWeight: 600,
                              fontSize:
                                "0.8125rem",
                            }}
                          >
                            {getAssetName(cert)}
                          </Link>

                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              alignItems:
                                "center",
                              marginTop: 3,
                            }}
                          >
                            <span
                              className="meta-id"
                              style={{
                                color: "#60a5fa",
                                fontSize:
                                  "0.6875rem",
                              }}
                            >
                              {assetId}
                            </span>

                            <span
                              style={{
                                color: "#475569",
                                fontSize:
                                  "0.6875rem",
                              }}
                            >
                              •
                            </span>

                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize:
                                  "0.6875rem",
                              }}
                            >
                              {getDepartment(
                                cert
                              )}
                            </span>
                          </div>
                        </td>

                        {/* TYPE */}

                        <td
                          style={{
                            padding: "14px",
                          }}
                        >
                          {renderTypeTag(
                            getType(cert)
                          )}

                          <div
                            style={{
                              fontSize:
                                "0.6875rem",
                              color: "#64748b",
                              marginTop: 4,
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                            title={getStandard(
                              cert
                            )}
                          >
                            {getStandard(cert)}
                          </div>
                        </td>

                        {/* AUTHORITY */}

                        <td
                          style={{
                            padding: "14px",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "0.8125rem",
                              color: "#e2e8f0",
                              fontWeight: 600,
                            }}
                          >
                            {getAuthorityName(
                              cert
                            )}
                          </div>

                          <div
                            style={{
                              fontSize:
                                "0.6875rem",
                              color: "#64748b",
                              marginTop: 2,
                            }}
                          >
                            {getAuthorityCode(
                              cert
                            )}{" "}
                            •{" "}
                            {getSignatory(
                              cert
                            )
                              .split(",")[0]}
                          </div>
                        </td>

                        {/* ISSUE DATE */}

                        <td
                          style={{
                            padding: "14px",
                            fontSize:
                              "0.75rem",
                            color: "#94a3b8",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {getIssueDate(cert)
                            ? formatDate(
                                getIssueDate(
                                  cert
                                )
                              )
                            : "—"}
                        </td>

                        {/* EXPIRY DATE */}

                        <td
                          style={{
                            padding: "14px",
                            fontSize:
                              "0.75rem",
                            color:
                              getStatus(
                                cert
                              ) === "Expired"
                                ? "#ef4444"
                                : getStatus(
                                    cert
                                  ) ===
                                  "Expiring"
                                ? "#f59e0b"
                                : "#94a3b8",
                            fontWeight:
                              getStatus(
                                cert
                              ) !== "Valid"
                                ? 600
                                : 400,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {getExpiryDate(cert)
                            ? formatDate(
                                getExpiryDate(
                                  cert
                                )
                              )
                            : "—"}
                        </td>

                        {/* STATUS */}

                        <td
                          style={{
                            padding: "14px",
                          }}
                        >
                          {renderStatusBadge(
                            getStatus(cert)
                          )}
                        </td>

                        {/* VERIFICATION */}

                        <td
                          style={{
                            padding: "14px",
                          }}
                        >
                          {renderVerificationBadge(
                            getVerificationStatus(
                              cert
                            )
                          )}
                        </td>

                        {/* ACTION */}

                        <td
                          style={{
                            padding: "14px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <Link
                            to={`/app/certifications/${id}`}
                            className="btn-ghost"
                            style={{
                              padding:
                                "5px 12px",
                              fontSize:
                                "0.75rem",
                              fontWeight: 600,
                              color: "#38bdf8",
                              border:
                                "1px solid rgba(56,189,248,0.3)",
                              background:
                                "rgba(56,189,248,0.06)",
                              borderRadius: 4,
                              textDecoration:
                                "none",
                            }}
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}

          <div
            style={{
              padding: "12px 18px",
              borderTop:
                "1px solid #1e3a60",
              background: "#060d17",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            <div>
              Showing{" "}
              <span
                style={{
                  color: "#e2e8f0",
                  fontWeight: 600,
                }}
              >
                {filteredCerts.length}
              </span>{" "}
              of{" "}
              <span
                style={{
                  color: "#e2e8f0",
                  fontWeight: 600,
                }}
              >
                {stats.total}
              </span>{" "}
              military certification dossiers
            </div>

            <div
              style={{
                fontSize: "0.7rem",
                color: "#475569",
              }}
            >
              Novexa Defence Sovereign Registry •
              SHA-256 Validated
            </div>
          </div>
        </div>
      ) : (
        /* ====================================================
           CARD VIEW
        ==================================================== */

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 18,
          }}
        >
          {filteredCerts.map(
            (cert: any) => {
              const id = getId(cert);

              return (
                <div
                  key={id}
                  className="panel"
                  style={{
                    padding: 20,
                    background: "#0a1320",
                    border:
                      "1px solid #1e3a60",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <div>
                    {/* TOP */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
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
                            fontSize:
                              "0.875rem",
                            display: "block",
                          }}
                        >
                          {id}
                        </span>

                        <span
                          style={{
                            fontSize:
                              "0.6875rem",
                            color: "#64748b",
                          }}
                        >
                          {getCertificateNumber(
                            cert
                          )}
                        </span>
                      </div>

                      {renderStatusBadge(
                        getStatus(cert)
                      )}
                    </div>

                    {/* TYPE */}

                    <div
                      style={{
                        marginBottom: 12,
                      }}
                    >
                      {renderTypeTag(
                        getType(cert)
                      )}
                    </div>

                    {/* ASSET */}

                    <div
                      style={{
                        padding:
                          "10px 12px",
                        background:
                          "#060d17",
                        border:
                          "1px solid #152b4a",
                        borderRadius: 6,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "0.6875rem",
                          color: "#64748b",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.04em",
                          marginBottom: 3,
                        }}
                      >
                        Associated Defence
                        Asset
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          color: "#e2e8f0",
                          fontSize:
                            "0.8125rem",
                          marginBottom: 2,
                        }}
                      >
                        {getAssetName(
                          cert
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize:
                            "0.7rem",
                          color: "#94a3b8",
                        }}
                      >
                        <span
                          className="meta-id"
                          style={{
                            color: "#60a5fa",
                          }}
                        >
                          {getAssetId(
                            cert
                          )}
                        </span>

                        <span>•</span>

                        <span>
                          {getDepartment(
                            cert
                          )}
                        </span>
                      </div>
                    </div>

                    {/* AUTHORITY */}

                    <div
                      style={{
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "0.6875rem",
                          color: "#64748b",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.04em",
                        }}
                      >
                        Issuing Authority
                      </div>

                      <div
                        style={{
                          fontSize:
                            "0.8125rem",
                          color: "#cbd5e1",
                          fontWeight: 500,
                          marginTop: 2,
                        }}
                      >
                        {getAuthorityName(
                          cert
                        )}
                      </div>

                      <div
                        style={{
                          fontSize:
                            "0.7rem",
                          color: "#64748b",
                          marginTop: 1,
                        }}
                      >
                        Signatory:{" "}
                        {getSignatory(
                          cert
                        )}
                      </div>
                    </div>

                    {/* DATES */}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: 8,
                        padding:
                          "8px 0",
                        borderTop:
                          "1px solid #152b4a",
                        borderBottom:
                          "1px solid #152b4a",
                        marginBottom: 14,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize:
                              "0.6875rem",
                            color: "#64748b",
                          }}
                        >
                          Issued:
                        </span>

                        <div
                          style={{
                            fontSize:
                              "0.75rem",
                            color: "#94a3b8",
                            fontWeight: 500,
                          }}
                        >
                          {getIssueDate(
                            cert
                          )
                            ? formatDate(
                                getIssueDate(
                                  cert
                                )
                              )
                            : "—"}
                        </div>
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize:
                              "0.6875rem",
                            color: "#64748b",
                          }}
                        >
                          Expires:
                        </span>

                        <div
                          style={{
                            fontSize:
                              "0.75rem",
                            color:
                              getStatus(
                                cert
                              ) === "Expired"
                                ? "#ef4444"
                                : getStatus(
                                    cert
                                  ) ===
                                  "Expiring"
                                ? "#f59e0b"
                                : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          {getExpiryDate(
                            cert
                          )
                            ? formatDate(
                                getExpiryDate(
                                  cert
                                )
                              )
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      paddingTop: 6,
                    }}
                  >
                    {renderVerificationBadge(
                      getVerificationStatus(
                        cert
                      )
                    )}

                    <Link
                      to={`/app/certifications/${id}`}
                      className="btn-primary"
                      style={{
                        padding:
                          "6px 14px",
                        fontSize:
                          "0.75rem",
                        textDecoration:
                          "none",
                      }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ======================================================
          NON-TRANSFERABLE NOTICE
      ====================================================== */}

      <div
        style={{
          marginTop: 24,
          padding: "14px 20px",
          background:
            "rgba(139, 92, 246, 0.07)",
          border:
            "1px solid rgba(139, 92, 246, 0.25)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            color: "#a855f7",
            fontSize: "1.3rem",
          }}
        >
          ⊠
        </span>

        <div
          style={{
            fontSize: "0.8125rem",
            color: "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          <strong
            style={{
              color: "#c084fc",
              letterSpacing:
                "0.02em",
            }}
          >
            NON-TRANSFERABLE DEFENCE
            CERTIFICATIONS:
          </strong>{" "}
          All military certificates and
          airworthiness credentials issued
          through NOVEXA are non-transferable
          state attestations permanently bound
          to specific asset serial numbers and
          issuing defence authorities.
        </div>
      </div>

      {/* ======================================================
          CREATE CERTIFICATION MODAL
      ====================================================== */}

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "rgba(3, 7, 18, 0.75)",
            backdropFilter:
              "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 460,
              padding: 24,
              border:
                "1px solid #1e3a60",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                Create Certification
              </div>

              <button
                onClick={() => {
                  setShowCreateModal(
                    false
                  );
                  setCreateStatus(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={
                handleCreateSubmit
              }
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 14,
              }}
            >
              {/* STATUS */}

              {createStatus && (
                <div
                  style={{
                    padding:
                      "8px 12px",
                    borderRadius: 4,
                    fontSize:
                      "0.8125rem",
                    background:
                      createStatus.type ===
                      "success"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                    border:
                      createStatus.type ===
                      "success"
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(239,68,68,0.3)",
                    color:
                      createStatus.type ===
                      "success"
                        ? "#22c55e"
                        : "#ef4444",
                  }}
                >
                  {
                    createStatus.message
                  }
                </div>
              )}

              {/* ASSET ID */}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize:
                      "0.75rem",
                    color: "#94a3b8",
                    marginBottom: 4,
                  }}
                >
                  Asset ID *
                </label>

                <input
                  type="text"
                  className="input"
                  style={{
                    width: "100%",
                    padding:
                      "8px 12px",
                    background:
                      "#0c1828",
                    border:
                      "1px solid #1e3a60",
                    borderRadius: 4,
                    color: "#e2e8f0",
                  }}
                  value={
                    assetIdInput
                  }
                  onChange={(e) =>
                    setAssetIdInput(
                      e.target.value
                    )
                  }
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              {/* BATCH */}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize:
                      "0.75rem",
                    color: "#94a3b8",
                    marginBottom: 4,
                  }}
                >
                  Batch ID (Optional)
                </label>

                <input
                  type="text"
                  className="input"
                  style={{
                    width: "100%",
                    padding:
                      "8px 12px",
                    background:
                      "#0c1828",
                    border:
                      "1px solid #1e3a60",
                    borderRadius: 4,
                    color: "#e2e8f0",
                  }}
                  value={
                    batchIdInput
                  }
                  onChange={(e) =>
                    setBatchIdInput(
                      e.target.value
                    )
                  }
                  placeholder="e.g. BATCH-2026-Q1"
                />
              </div>

              {/* INFORMATION */}

              <div
                style={{
                  padding:
                    "10px 12px",
                  background:
                    "rgba(139,92,246,0.08)",
                  border:
                    "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 4,
                  fontSize:
                    "0.75rem",
                  color: "#94a3b8",
                }}
              >
                Creating a certification
                initiates cryptographic
                verification and Soulbound
                Token generation on
                BEL-TRUST-CHAIN.
              </div>

              {/* ACTIONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowCreateModal(
                      false
                    );
                    setCreateStatus(
                      null
                    );
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    isSubmitting ||
                    !assetIdInput.trim()
                  }
                >
                  {isSubmitting
                    ? "Creating..."
                    : "Create Certification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}