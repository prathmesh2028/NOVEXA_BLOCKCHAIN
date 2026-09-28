import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import { formatDate } from "../../data/utils";
import {
  DefenceAsset,
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  VERIFICATION_STATUSES,
  getDefenceAssets,
  getDefenceAssetStats,
} from "./assetData";
import "./AssetsPage.css";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await assetService.listAssets({
        search: search || undefined,
        lifecycle: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setAssets(response.items);
    } catch (err: any) {
      setError(err.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [search, statusFilter]);

  const filteredAssets = useMemo(() => {
    return assets;
  }, [assets]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  // Professional defence status badge styling (ChatGPT Minimal Palette)
  const renderStatusBadge = (status: DefenceAsset["status"]) => {
    const config: Record<
      DefenceAsset["status"],
      { bg: string; text: string; border: string; dot: string }
    > = {
      Active: {
        bg: "rgba(16, 185, 129, 0.08)",
        text: "#34d399",
        border: "rgba(16, 185, 129, 0.25)",
        dot: "#10b981",
      },
      "Under Maintenance": {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.25)",
        dot: "#f59e0b",
      },
      Inactive: {
        bg: "rgba(255, 255, 255, 0.05)",
        text: "#a3a3a3",
        border: "rgba(255, 255, 255, 0.1)",
        dot: "#737373",
      },
      Decommissioned: {
        bg: "rgba(239, 68, 68, 0.08)",
        text: "#f87171",
        border: "rgba(239, 68, 68, 0.25)",
        dot: "#ef4444",
      },
    };

    const c = config[status] || config["SUPPLIER_DECLARED"];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 9px",
          borderRadius: "9999px",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: c.dot,
          }}
        />
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  // Verification status badge
  const renderVerificationBadge = (verification: DefenceAsset["verificationStatus"]) => {
    const config: Record<
      DefenceAsset["verificationStatus"],
      { bg: string; text: string; border: string; icon: string }
    > = {
      Verified: {
        bg: "rgba(16, 185, 129, 0.08)",
        text: "#34d399",
        border: "rgba(16, 185, 129, 0.2)",
        icon: "✓",
      },
      "Pending Verification": {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.2)",
        icon: "◐",
      },
      "Verification Required": {
        bg: "rgba(255, 255, 255, 0.05)",
        text: "#a3a3a3",
        border: "rgba(255, 255, 255, 0.12)",
        icon: "○",
      },
    };

    const c = config[verification] || config["PENDING"];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 8px",
          borderRadius: "9999px",
          fontSize: "0.72rem",
          fontWeight: 600,
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "0.7rem" }}>{c.icon}</span>
        {verification.replace(/_/g, " ")}
      </span>
    );
  };

  // Blockchain proof status badge
  const renderProofBadge = (certStatus: string, certId?: string | null) => {
    if (certStatus === "CONFIRMED" && certId) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 7px",
              borderRadius: "4px",
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.06)",
              color: "#e5e5e5",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: "0.65rem" }}>⬡</span>
            Certified
          </span>
          <span
            className="font-mono-id"
            style={{ fontSize: "0.6875rem", color: "#64748b" }}
          >
            {certId}
          </span>
          {
            hash && (
              <span
                className="font-mono-id"
                style={{ fontSize: "0.6875rem", color: "#737373" }}
                title={hash}
              >
                {hash.slice(0, 8)}...{hash.slice(-4)}
              </span>
            )
          }
        </div >
      );
    }

    if (certStatus === "PENDING") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "2px 7px",
            borderRadius: "4px",
            fontSize: "0.6875rem",
            fontWeight: 600,
            background: "rgba(245, 158, 11, 0.08)",
            color: "#fbbf24",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            width: "fit-content",
          }}
        >
          <span style={{ fontSize: "0.65rem" }}>◷</span>
          Certification Pending
        </span>
      );
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 7px",
          borderRadius: "4px",
          fontSize: "0.6875rem",
          fontWeight: 600,
          background: "rgba(255, 255, 255, 0.04)",
          color: "#737373",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          width: "fit-content",
        }}
      >
        <span style={{ fontSize: "0.65rem" }}>○</span>
        Not Certified
      </span>
    );
  };

  return (
    <div className="page-fade assets-page-root">
      {/* Header section */}
      <PageHeader
        title="Defence Assets"
        subtitle="Manage verified defence assets and their cryptographic lifecycle records for NOVEXA Defence Asset Trust."
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Defence Assets" },
        ]}
        badge={
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.06)",
              color: "#a3a3a3",
              border: "1px solid #303030",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            IMMUTABLE LEDGER REGISTER
          </span>
        }
      />

      {/* Metric Summary Cards */}
      <div className="ast-stats-grid">
        <div className="ast-stat-card">
          <div className="ast-stat-top">
            <span className="ast-stat-label">TOTAL DEFENCE ASSETS</span>
            <div className="ast-stat-icon">◈</div>
          </div>
          <div className="ast-stat-value">{stats.total}</div>
          <div className="ast-stat-sub">Catalogued defence systems</div>
        </div>

        <div className="ast-stat-card">
          <div className="ast-stat-top">
            <span className="ast-stat-label">ACTIVE / OPERATIONAL</span>
            <div className="ast-stat-icon" style={{ color: "#10b981" }}>●</div>
          </div>
          <div className="ast-stat-value" style={{ color: "#34d399" }}>{stats.active}</div>
          <div className="ast-stat-sub">Mission ready units</div>
        </div>

        <div className="ast-stat-card">
          <div className="ast-stat-top">
            <span className="ast-stat-label">UNDER MAINTENANCE</span>
            <div className="ast-stat-icon" style={{ color: "#f59e0b" }}>⚙</div>
          </div>
          <div className="ast-stat-value" style={{ color: "#fbbf24" }}>{stats.underMaintenance}</div>
          <div className="ast-stat-sub">Depot & field servicing</div>
        </div>

        <div className="ast-stat-card">
          <div className="ast-stat-top">
            <span className="ast-stat-label">BLOCKCHAIN ANCHORED</span>
            <div className="ast-stat-icon">⬡</div>
          </div>
          <div className="ast-stat-value">{stats.anchored}</div>
          <div className="ast-stat-sub">Tamper-evident proof state</div>
        </div>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="ast-toolbar">
        <div className="ast-search-row">
          {/* Search bar */}
          <div className="ast-search-wrapper">
            <span className="ast-search-icon">🔍</span>
            <input
              type="text"
              className="ast-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Asset ID, Name, Serial Number, Holder, Model..."
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
                  color: "#737373",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter selectors row */}
        <div className="ast-filters-row">
          {/* Category Filter */}
          <div className="ast-filter-group">
            <span className="ast-filter-label">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="ast-select"
            >
              <option value="ALL">All Categories ({stats.total})</option>
              {ASSET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="ast-filter-group">
            <span className="ast-filter-label">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ast-select"
            >
              <option value="ALL">All Statuses</option>
              {ASSET_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Filter */}
          <div className="ast-filter-group">
            <span className="ast-filter-label">Verification:</span>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="ast-select"
            >
              <option value="ALL">All Verification States</option>
              {VERIFICATION_STATUSES.map((vs) => (
                <option key={vs} value={vs}>
                  {vs}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="ast-clear-btn">
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Asset Listing Content */}
      {loading ? (
        <div
          className="panel"
          style={{
            padding: "60px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(30, 58, 96, 0.4)",
              border: "1px solid #1e3a60",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              color: "#64748b",
              marginBottom: 16,
            }}
          >
            ◈
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 8,
              letterSpacing: "0.02em",
            }}
          >
            LOADING ASSETS
          </h3>
        </div>
      ) : error ? (
        <div
          className="panel"
          style={{
            padding: "60px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid #ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              color: "#ef4444",
              marginBottom: 16,
            }}
          >
            ✕
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 8,
              letterSpacing: "0.02em",
            }}
          >
            ERROR LOADING ASSETS
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              maxWidth: 420,
              margin: "0 auto 20px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
          <button onClick={loadAssets} className="btn-primary" style={{ fontSize: "0.8125rem" }}>
            Retry
          </button>
        </div>
      ) : filteredAssets.length === 0 ? (
        /* Empty State */
        <div
          className="ast-toolbar"
          style={{
            padding: "60px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#242424",
              border: "1px solid #333333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              color: "#737373",
              marginBottom: 16,
            }}
          >
            ◈
          </div>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#f5f5f5",
              marginBottom: 8,
              letterSpacing: "0.02em",
            }}
          >
            NO ASSETS FOUND
          </h3>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#737373",
              maxWidth: 420,
              margin: "0 auto 20px",
              lineHeight: 1.5,
            }}
          >
            No asset records match your current search query or filter selection. Adjust your
            parameters or reset filters to view all registered inventory.
          </p>
          <button onClick={clearFilters} className="ast-view-btn" style={{ maxWidth: 160 }}>
            Reset All Filters
          </button>
        </div>
      ) : (
        /* SCREEN 1 — ASSET LISTING: RESPONSIVE CARDS VIEW */
        <div>
          <div className="ast-cards-grid">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="ast-card">
                {/* Card Top: ID & Category */}
                <div className="ast-card-top">
                  <span className="ast-id-badge">{asset.id}</span>
                  <span className="ast-cat-badge">{asset.category}</span>
                </div>

                {/* Card Title & Model */}
                <div>
                  <h3 className="ast-card-title">{asset.name}</h3>
                  <div className="ast-card-model">
                    {asset.model} · <span className="font-mono-id">{asset.serialNumber}</span>
                  </div>
                </div>

                {/* Status and Verification Badges */}
<<<<<<< HEAD
  <div className="ast-badges-row">
    {renderStatusBadge(asset.status)}
    {renderVerificationBadge(asset.verificationStatus)}
  </div>

  {/* Key metadata grid */ }
  <div className="ast-meta-box">
    <div className="ast-meta-row">
      <span className="ast-meta-label">Holder / Command:</span>
      <span className="ast-meta-value">{asset.department}</span>
    </div>
    <div className="ast-meta-row">
      <span className="ast-meta-label">Base Location:</span>
      <span style={{ color: "#a3a3a3" }}>{asset.location}</span>
      <div className="ast-meta-row">
        <span className="ast-meta-label">Last Maintenance:</span>
        <span style={{ color: "#a3a3a3" }}>{formatDate(asset.lastMaintenanceDate)}</span>
      </div>
      <div className="ast-meta-row">
        <span className="ast-meta-label">Proof Status:</span>
        {renderProofBadge(asset.proofStatus, asset.blockchainProof.assetHash)}
      </div>
    </div>

    {/* Action button */}
    <div style={{ marginTop: "auto", paddingTop: 4 }}>
      View Details →
=======
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        fontSize: "0.75rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#64748b" }}>Supplier:</span>
        <span style={{ color: "#cbd5e1", textAlign: "right" }}>
          {asset.supplier || "—"}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#64748b" }}>Batch ID:</span>
        <span className="font-mono-id" style={{ color: "#cbd5e1", textAlign: "right" }}>
          {asset.batch_id || "—"}
        </div >
      )}
    </div >
  );
}