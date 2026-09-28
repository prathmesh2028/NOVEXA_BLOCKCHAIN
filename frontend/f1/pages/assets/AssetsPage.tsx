import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { formatDate } from "../../data/utils";
import { assetService, AssetResponse } from "../../services/assets";

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

  // Professional defence status badge styling
  const renderStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; dot: string }> = {
      "ACCEPTED_FOR_ASSEMBLY": {
        bg: "rgba(34, 197, 94, 0.12)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.3)",
        dot: "#22c55e",
      },
      "INSPECTION_RECORDED": {
        bg: "rgba(59, 130, 246, 0.12)",
        text: "#3b82f6",
        border: "rgba(59, 130, 246, 0.3)",
        dot: "#3b82f6",
      },
      "RECEIVED": {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        dot: "#f59e0b",
      },
      "SUPPLIER_DECLARED": {
        bg: "rgba(139, 92, 246, 0.12)",
        text: "#8b5cf6",
        border: "rgba(139, 92, 246, 0.3)",
        dot: "#8b5cf6",
      },
      "REJECTED_QUARANTINED": {
        bg: "rgba(239, 68, 68, 0.12)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.3)",
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
          borderRadius: "4px",
          fontSize: "0.75rem",
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
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: c.dot,
          }}
        />
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  // Verification status badge
  const renderVerificationBadge = (verification: string) => {
    const config: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      "VERIFIED": {
        bg: "rgba(34, 197, 94, 0.1)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.25)",
        icon: "✓",
      },
      "PENDING": {
        bg: "rgba(245, 158, 11, 0.1)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.25)",
        icon: "◐",
      },
      "FAILED": {
        bg: "rgba(239, 68, 68, 0.1)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.25)",
        icon: "✕",
      },
      "REVIEW_REQUIRED": {
        bg: "rgba(56, 189, 248, 0.1)",
        text: "#38bdf8",
        border: "rgba(56, 189, 248, 0.25)",
        icon: "⚠",
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
          borderRadius: "4px",
          fontSize: "0.75rem",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 7px",
              borderRadius: "3px",
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: "rgba(59, 130, 246, 0.12)",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.28)",
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
        </div>
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
            borderRadius: "3px",
            fontSize: "0.6875rem",
            fontWeight: 600,
            background: "rgba(245, 158, 11, 0.1)",
            color: "#f59e0b",
            border: "1px solid rgba(245, 158, 11, 0.25)",
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
          borderRadius: "3px",
          fontSize: "0.6875rem",
          fontWeight: 600,
          background: "rgba(148, 163, 184, 0.1)",
          color: "#94a3b8",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          width: "fit-content",
        }}
      >
        <span style={{ fontSize: "0.65rem" }}>○</span>
        Not Certified
      </span>
    );
  };

  return (
    <div className="page-fade" style={{ maxWidth: "1440px", margin: "0 auto" }}>
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
              borderRadius: "3px",
              background: "rgba(37, 99, 235, 0.18)",
              color: "#60a5fa",
              border: "1px solid rgba(37, 99, 235, 0.35)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            IMMUTABLE LEDGER REGISTER
          </span>
        }
      />

      {/* Metric Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          label="TOTAL ASSETS"
          value={assets.length}
          sub="Registered in system"
          accent="#60a5fa"
          icon="◈"
        />
        <StatCard
          label="ACCEPTED FOR ASSEMBLY"
          value={assets.filter(a => a.lifecycle_state === "ACCEPTED_FOR_ASSEMBLY").length}
          sub="Production ready"
          accent="#22c55e"
          icon="●"
        />
        <StatCard
          label="PENDING INSPECTION"
          value={assets.filter(a => a.lifecycle_state === "RECEIVED").length}
          sub="Awaiting quality check"
          accent="#f59e0b"
          icon="⚙"
        />
        <StatCard
          label="CERTIFIED"
          value={assets.filter(a => a.cert_status === "CONFIRMED").length}
          sub="Blockchain anchored"
          accent="#38bdf8"
          icon="⬡"
        />
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div
        className="panel"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {/* Search bar */}
          <div style={{ position: "relative", flex: "1 1 320px", minWidth: 260 }}>
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
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Asset ID, Serial Number, Type..."
              style={{
                paddingLeft: 34,
                width: "100%",
                background: "#08131f",
                borderColor: "#1e3a60",
                color: "#e2e8f0",
                fontSize: "0.8125rem",
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
                  color: "#64748b",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            paddingTop: "4px",
            borderTop: "1px solid #152b4a",
          }}
        >
          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              Lifecycle:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
              style={{
                padding: "6px 10px",
                fontSize: "0.75rem",
                background: "#08131f",
                borderColor: statusFilter !== "ALL" ? "#3b82f6" : "#1e3a60",
                color: statusFilter !== "ALL" ? "#60a5fa" : "#94a3b8",
                minWidth: "180px",
              }}
            >
              <option value="ALL">All Lifecycle States</option>
              <option value="UNREGISTERED">Unregistered</option>
              <option value="SUPPLIER_DECLARED">Supplier Declared</option>
              <option value="RECEIVED">Received</option>
              <option value="INSPECTION_RECORDED">Inspection Recorded</option>
              <option value="ACCEPTED_FOR_ASSEMBLY">Accepted for Assembly</option>
              <option value="REJECTED_QUARANTINED">Rejected/Quarantined</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-secondary"
              style={{
                padding: "5px 12px",
                fontSize: "0.75rem",
                marginLeft: "auto",
                borderColor: "#ef444455",
                color: "#f87171",
              }}
            >
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
            NO ASSETS FOUND
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
            No asset records match your current search query or filter selection. Adjust your
            parameters or reset filters to view all registered inventory.
          </p>
          <button onClick={clearFilters} className="btn-primary" style={{ fontSize: "0.8125rem" }}>
            Reset All Filters
          </button>
        </div>
      ) : (

        /* SCREEN 1 — ASSET LISTING: RESPONSIVE CARDS VIEW */
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="panel"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  position: "relative",
                  transition: "border-color 0.15s ease",
                }}
              >
                {/* Card Top: ID & Type */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span
                    className="font-mono-id"
                    style={{
                      color: "#60a5fa",
                      fontWeight: 600,
                      padding: "2px 6px",
                      background: "rgba(37, 99, 235, 0.12)",
                      borderRadius: "3px",
                      border: "1px solid rgba(37, 99, 235, 0.25)",
                    }}
                  >
                    {asset.asset_id}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      background: "#132040",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      border: "1px solid #1e3a60",
                    }}
                  >
                    {asset.type}
                  </span>
                </div>

                {/* Card Title & Model */}
                <div>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    {asset.model}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    <span className="font-mono-id">{asset.serial_number}</span>
                  </div>
                </div>

                {/* Status and Verification Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {renderStatusBadge(asset.lifecycle_state)}
                  {renderVerificationBadge(asset.verification_status)}
                </div>

                {/* Key metadata grid */}
                <div
                  style={{
                    padding: "10px 12px",
                    background: "#08131f",
                    borderRadius: "4px",
                    border: "1px solid #152b4a",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
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
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Evidence:</span>
                    <span style={{ color: "#cbd5e1", textAlign: "right" }}>
                      {asset.evidence_count}
                    </span>
                  </div>
                </div>

                {/* Blockchain proof status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {renderProofBadge(asset.cert_status, asset.cert_id)}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  <Link
                    to={`/app/assets/${asset.id}`}
                    className="btn-primary"
                    style={{ flex: 1, textAlign: "center", fontSize: "0.8125rem" }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}