import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import DemoDataDropdown from "../../components/ui/DemoDataDropdown";
import { formatDate } from "../../data/utils";
import type { CertificationResponse } from "../../services/certifications";
import { certificationService } from "../../services/certifications";
import { api } from "../../services/api";
import {
  CERTIFICATION_TYPES,
  CERTIFICATION_STATUSES,
  VERIFICATION_STATUSES,
} from "./certificationData";
import { useAuth } from "../../context/AuthContext";
import CertificateImageUpload, { PRESET_CERTIFICATE_SEALS } from "../../components/certifications/CertificateImageUpload";
import { DemoRecord } from "../../data/demoData";
import "./CertificationsPage.css";


export default function CertificationsPage() {
  const { role } = useAuth();
  const isAuditor = role === "auditor";
  /* ============================================================
     API STATE
     ============================================================ */

  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [confirmed, setConfirmed] = useState(0);

  /* ============================================================
     FRONTEND DEMO STATE
     ============================================================ */

  /* ============================================================
     SEARCH / FILTER STATE
     ============================================================ */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");

  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  /* ============================================================
     CREATE CERTIFICATION STATE
     ============================================================ */

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [assetIdInput, setAssetIdInput] = useState("");
  const [batchIdInput, setBatchIdInput] = useState("");
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [certificateImageName, setCertificateImageName] = useState<string | null>(null);
  const [modalDemoLoaded, setModalDemoLoaded] = useState(false);
  const [eligibleAssets, setEligibleAssets] = useState<any[]>([]);

  const handleModalLoadDemoData = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const eligibleAsset = eligibleAssets[0];
    if (!eligibleAsset) {
      setCreateStatus({ type: "error", message: "No current eligible asset is available. Refresh eligible assets." });
      return;
    }
    setAssetIdInput(eligibleAsset.id);
    setBatchIdInput(eligibleAsset.batch_id || "");
    if (PRESET_CERTIFICATE_SEALS && PRESET_CERTIFICATE_SEALS.length > 0) {
      const demoSeal = PRESET_CERTIFICATE_SEALS[0];
      setCertificateImage(demoSeal.dataUrl);
      setCertificateImageName(`${demoSeal.name.toLowerCase().replace(/\s+/g, "_")}.svg`);
    }
    setCreateStatus(null);
    setModalDemoLoaded(true);
    setTimeout(() => {
      setModalDemoLoaded(false);
    }, 2500);
  };

  const handleDemoDataSelect = (record: DemoRecord) => {
    if (record.type === 'asset') {
      const eligibleAsset = eligibleAssets.find(
        (asset) => asset.id === record.data.asset_id || asset.asset_id === record.data.asset_id,
      );
      if (eligibleAsset) {
        setAssetIdInput(eligibleAsset.id);
        setBatchIdInput(eligibleAsset.batch_id || '');
      } else {
        setCreateStatus({ type: "error", message: "That demo asset is not currently eligible. Use Load Demo Data to select a live asset." });
      }
    } else if (record.type === 'certification') {
      // If selecting a certification, navigate to its detail page
      window.location.href = `/app/certifications/${record.data.cert_id}`;
    }
  };

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
      const listRes = await certificationService.listCertifications({ page_size: 100 });
      const eligibleRes = await api.get<any>("/assets/eligible?page_size=100");

      setCerts(listRes.items);
      setEligibleAssets(eligibleRes.items || []);
      setTotal(listRes.total);

      setPending(
        listRes.items.filter(
          (c: CertificationResponse) =>
            c.status === "PENDING"
        ).length
      );

      setConfirmed(
        listRes.items.filter(
          (c: CertificationResponse) =>
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

  const handleRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* Viewport scroll lock for Create Certification modal */
  useEffect(() => {
    if (!showCreateModal) return;

    const windowScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const mainEl = document.querySelector(".app-main-content") as HTMLElement | null;
    const mainScrollTop = mainEl ? mainEl.scrollTop : 0;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalMainOverflow = mainEl ? mainEl.style.overflow : undefined;

    // Compensate for scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (mainEl) {
      mainEl.style.overflow = "hidden";
      if (mainEl.scrollTop !== mainScrollTop) {
        mainEl.scrollTop = mainScrollTop;
      }
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (mainEl && originalMainOverflow !== undefined) {
        mainEl.style.overflow = originalMainOverflow;
        mainEl.scrollTop = mainScrollTop;
      }
      window.scrollTo(0, windowScrollY);
    };
  }, [showCreateModal]);

  /* Close modal on Escape key */
  useEffect(() => {
    if (!showCreateModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowCreateModal(false);
        setCreateStatus(null);
        setCertificateImage(null);
        setCertificateImageName(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCreateModal]);

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
      const eligibleRes = await api.get<any>("/assets/eligible?page_size=100");
      const selectedAsset = (eligibleRes.items || []).find(
        (asset: any) => asset.id === assetIdInput.trim() || asset.asset_id === assetIdInput.trim(),
      );
      if (!selectedAsset) {
        setEligibleAssets(eligibleRes.items || []);
        setCreateStatus({ type: "error", message: "Selected asset is no longer available. Refresh eligible assets." });
        return;
      }
      await certificationService.createCertification({
        asset_id: selectedAsset.id,
        batch_id: batchIdInput.trim() || undefined,
        certificate_image: certificateImage || undefined,
        image_name: certificateImageName || undefined,
      });

      setCreateStatus({
        type: "success",
        message: "Certification created successfully with verified cryptographic seal",
      });

      setAssetIdInput("");
      setBatchIdInput("");
      setCertificateImage(null);
      setCertificateImageName(null);
      fetchData();
      // Close the modal after a brief success display
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateStatus(null);
      }, 1500);
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "Failed to create certification";
      setCreateStatus({
        type: "error",
        message: err?.status === 409
          ? "This asset already has a certification."
          : err?.status === 400 && /not found/i.test(message)
            ? "Selected asset is no longer available. Refresh eligible assets."
            : message,
      });
      fetchData();
    } finally {
      setIsSubmitting(false);
    }

  };

  const getVerificationStatus = (cert: any) =>
    cert.verificationStatus ||
    cert.verification_status ||
    (cert.status === "CONFIRMED"
      ? "Verified"
      : "Pending Verification");

  /* ============================================================
     FRONTEND FILTERING
     ============================================================ */

  const filteredCerts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return certs.filter((cert: any) => {
      const id = String(cert.id ?? cert.cert_id ?? "").toLowerCase();
      const certNum = String(cert.certificateNumber ?? "").toLowerCase();
      const assetId = String(cert.asset?.assetId ?? cert.asset_id ?? "").toLowerCase();
      const assetName = String(cert.asset?.assetName ?? cert.asset_name ?? "").toLowerCase();
      const authority = String(cert.authority?.name ?? cert.issued_by ?? cert.issuedBy ?? "").toLowerCase();
      const txHash = String(cert.proof?.txHash ?? cert.tx_hash ?? "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        id.includes(normalizedSearch) ||
        certNum.includes(normalizedSearch) ||
        assetId.includes(normalizedSearch) ||
        assetName.includes(normalizedSearch) ||
        authority.includes(normalizedSearch) ||
        txHash.includes(normalizedSearch);

      const statusVal = cert.status || "Valid";
      const matchesStatus =
        statusFilter === "ALL" || statusVal === statusFilter;

      const typeVal = cert.type;
      const matchesType =
        typeFilter === "ALL" || (typeVal && typeVal === typeFilter);

      const vStatus = getVerificationStatus(cert);
      const matchesVerification =
        verificationFilter === "ALL" ||
        vStatus === verificationFilter;

      return matchesSearch && matchesStatus && matchesType && matchesVerification;
    });
  }, [
    certs,
    search,
    statusFilter,
    typeFilter,
    verificationFilter,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    verificationFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
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
      (c: any) => c.status === "Expiring" || c.status === "EXPIRING"
    ).length;

    const verified = certs.filter(
      (c: any) =>
        c.status === "CONFIRMED" ||
        c.verificationStatus === "Verified" ||
        c.verification_status === "Verified" ||
        c.proof?.verificationStatus === "Verified"
    ).length;

    return {
      total: certs.length,
      valid,
      expiring,
      verified,
    };
  }, [certs]);

  /* ============================================================
     STATUS BADGE
     ============================================================ */

  const renderStatusBadge = (status: string) => {
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
        bg: "rgba(34, 197, 94, 0.08)",
        text: "#4ade80",
        border: "rgba(34, 197, 94, 0.25)",
        dot: "#22c55e",
      },

      VALID: {
        bg: "rgba(34, 197, 94, 0.08)",
        text: "#4ade80",
        border: "rgba(34, 197, 94, 0.25)",
        dot: "#22c55e",
      },

      CONFIRMED: {
        bg: "rgba(34, 197, 94, 0.08)",
        text: "#4ade80",
        border: "rgba(34, 197, 94, 0.25)",
        dot: "#22c55e",
      },

      Expiring: {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.25)",
        dot: "#f59e0b",
      },

      Expired: {
        bg: "rgba(239, 68, 68, 0.08)",
        text: "#f87171",
        border: "rgba(239, 68, 68, 0.25)",
        dot: "#ef4444",
      },

      PENDING: {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.25)",
        dot: "#f59e0b",
      },

      Pending: {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.25)",
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
    vStatus: string
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
        bg: "rgba(34, 197, 94, 0.08)",
        text: "#4ade80",
        border: "rgba(34, 197, 94, 0.25)",
        icon: "✓",
      },

      "Pending Verification": {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.25)",
        icon: "◷",
      },

      "Verification Required": {
        bg: "rgba(239, 68, 68, 0.08)",
        text: "#f87171",
        border: "rgba(239, 68, 68, 0.25)",
        icon: "⚠",
      },

      CONFIRMED: {
        bg: "rgba(34, 197, 94, 0.08)",
        text: "#4ade80",
        border: "rgba(34, 197, 94, 0.25)",
        icon: "✓",
      },

      PENDING: {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.25)",
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

  const renderTypeTag = (type: string) => {
    const colorMap: Record<
      string,
      { text: string; bg: string }
    > = {
      "Safety Certification": {
        text: "#d4d4d4",
        bg: "#242424",
      },

      "Operational Certification": {
        text: "#d4d4d4",
        bg: "#242424",
      },

      "Maintenance Certification": {
        text: "#d4d4d4",
        bg: "#242424",
      },

      "Quality Certification": {
        text: "#d4d4d4",
        bg: "#242424",
      },

      "Compliance Certification": {
        text: "#d4d4d4",
        bg: "#242424",
      },
    };

    const c =
      colorMap[String(type)] || {
        text: "#a3a3a3",
        bg: "#202020",
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

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div
      className="certifications-page-root"
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
              flexWrap: "wrap",
            }}
          >
            <button
              id="cert-refresh-btn"
              className="cert-load-demo-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Refetch persisted certification records"
            >
              <span className="cert-demo-spark-icon">↻</span>
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>

            {!isAuditor && (
              <>
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
              </>
            )}

            <button
              className="btn-ghost"
              onClick={handleRefresh}
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
          accent="#f5f5f5"
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
          accent="#e5e5e5"
          sub="Cryptographically anchored"
        />
      </div>

      {/* ======================================================
          SEARCH / FILTER BAR
      ====================================================== */}

      <div
        className="cert-toolbar"
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* SEARCH */}

          <div
            className="cert-search-wrap"
            style={{ display: "flex", gap: 8 }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <span
                className="cert-search-icon"
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
                className="cert-search-input"
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
            <DemoDataDropdown type="certification" onSelect={handleDemoDataSelect} />
          </div>

          {/* FILTERS */}

          <div
            className="cert-filters-group"
          >
            {/* TYPE */}

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
              className="cert-select"
            >
              <option value="ALL">
                All Certification Types
              </option>

              {["Safety Certification", "Operational Certification", "Maintenance Certification", "Quality Certification", "Compliance Certification"].map((t) => (
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
              className="cert-select"
            >
              <option value="ALL">
                All Statuses
              </option>

              {["Valid", "Expiring", "Expired"].map((s) => (
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
              className="cert-select"
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

            <div className="cert-view-toggle">
              <button
                onClick={() =>
                  setViewMode("table")
                }
                className={`cert-view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              >
                ☰ Table
              </button>

              <button
                onClick={() =>
                  setViewMode("cards")
                }
                className={`cert-view-toggle-btn ${viewMode === "cards" ? "active" : ""}`}
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
            background: "#181818",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
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
            background: "#181818",
            border: "1px dashed #2a2a2a",
            borderRadius: "12px",
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
          className="cert-table-container"
        >
          <div style={{ overflowX: "auto" }}>
            <table
              className="cert-table"
            >
              <thead>
                <tr>
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
                            "1px solid #222222",
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
                                color: "#f5f5f5",
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
                  className="cert-card"
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
                            color: "#f5f5f5",
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
                          "#141414",
                        border:
                          "1px solid #262626",
                        borderRadius: 8,
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

      {showCreateModal && typeof document !== "undefined" && createPortal(
        <div
          className="cert-modal-overlay"
          onClick={() => {
            setShowCreateModal(false);
            setCreateStatus(null);
            setCertificateImage(null);
            setCertificateImageName(null);
          }}
        >
          <div
            className="cert-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="cert-modal-header">
              <div className="cert-modal-header-title">
                <span style={{ color: "#38bdf8", fontSize: "1.1rem" }}>🛡</span>
                <span>Create Certification</span>
              </div>

              <button
                className="cert-modal-close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateStatus(null);
                  setCertificateImage(null);
                  setCertificateImageName(null);
                }}
                title="Close modal"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY / FORM */}
            <form
              onSubmit={handleCreateSubmit}
              className="cert-modal-body"
            >
              {/* STATUS */}
              {createStatus && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: "0.8125rem",
                    background:
                      createStatus.type === "success"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                    border:
                      createStatus.type === "success"
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(239,68,68,0.3)",
                    color:
                      createStatus.type === "success"
                        ? "#22c55e"
                        : "#ef4444",
                  }}
                >
                  {createStatus.message}
                </div>
              )}

              {/* DEMO DATA QUICK FILL BAR */}
              <div className="cert-modal-demo-bar">
                <div className="cert-modal-demo-bar-info">
                  <span className="cert-modal-demo-badge">SIH DEMO</span>
                  <span className="cert-modal-demo-text">Pre-fill realistic certification data</span>
                </div>
                <button
                  type="button"
                  id="cert-modal-load-demo-btn"
                  className={`cert-modal-load-demo-btn ${modalDemoLoaded ? "loaded" : ""}`}
                  onClick={handleModalLoadDemoData}
                  title="Automatically fill form with realistic demo values"
                >
                  <span>{modalDemoLoaded ? "✓" : "⚡"}</span>
                  <span>{modalDemoLoaded ? "DEMO DATA LOADED" : "LOAD DEMO DATA"}</span>
                </button>
              </div>

              {/* ASSET ID */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--muted, #4A4A4A)",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Asset ID *
                </label>

                <input
                  type="text"
                  className="input-field cert-form-input"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    boxSizing: "border-box",
                  }}
                  value={assetIdInput}
                  onChange={(e) => setAssetIdInput(e.target.value)}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              {/* BATCH */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--muted, #4A4A4A)",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Batch ID (Optional)
                </label>

                <input
                  type="text"
                  className="input-field cert-form-input"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    boxSizing: "border-box",
                  }}
                  value={batchIdInput}
                  onChange={(e) => setBatchIdInput(e.target.value)}
                  placeholder="e.g. BATCH-2026-Q1"
                />
              </div>

              {/* CERTIFICATE IMAGE / SEAL UPLOAD */}
              <CertificateImageUpload
                value={certificateImage}
                fileName={certificateImageName}
                onChange={(val, name) => {
                  setCertificateImage(val);
                  setCertificateImageName(name || null);
                }}
              />

              {/* INFORMATION */}
              <div className="cert-modal-info-panel">
                Creating a certification initiates cryptographic verification, soulbound token generation, and anchors the uploaded seal to BEL-TRUST-CHAIN.
              </div>

              {/* ACTIONS */}
              <div className="cert-modal-footer-actions">
                <button
                  type="button"
                  id="cert-modal-load-demo-footer-btn"
                  className={`cert-modal-load-demo-footer-btn ${modalDemoLoaded ? "loaded" : ""}`}
                  onClick={handleModalLoadDemoData}
                  title="Populate demo data"
                >
                  <span>{modalDemoLoaded ? "✓" : "⚡"}</span>
                  <span>{modalDemoLoaded ? "Demo Filled" : "Use Dummy Data"}</span>
                </button>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateStatus(null);
                      setCertificateImage(null);
                      setCertificateImageName(null);
                      setModalDemoLoaded(false);
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
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}