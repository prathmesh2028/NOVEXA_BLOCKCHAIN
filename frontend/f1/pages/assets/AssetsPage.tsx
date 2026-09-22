import { useState, useMemo } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { formatDate } from "../../data/utils";
import {
  DefenceAsset,
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  VERIFICATION_STATUSES,
  getDefenceAssets,
  getDefenceAssetStats,
} from "./assetData";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const stats = useMemo(() => getDefenceAssetStats(), []);

  const filteredAssets = useMemo(() => {
    return getDefenceAssets({
      search,
      category: categoryFilter,
      status: statusFilter,
      verification: verificationFilter,
    });
  }, [search, categoryFilter, statusFilter, verificationFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    verificationFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setVerificationFilter("ALL");
  };

  // Professional defence status badge styling
  const renderStatusBadge = (status: DefenceAsset["status"]) => {
    const config: Record<
      DefenceAsset["status"],
      { bg: string; text: string; border: string; dot: string }
    > = {
      Active: {
        bg: "rgba(34, 197, 94, 0.12)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.3)",
        dot: "#22c55e",
      },
      "Under Maintenance": {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        dot: "#f59e0b",
      },
      Inactive: {
        bg: "rgba(148, 163, 184, 0.12)",
        text: "#94a3b8",
        border: "rgba(148, 163, 184, 0.25)",
        dot: "#94a3b8",
      },
      Decommissioned: {
        bg: "rgba(239, 68, 68, 0.12)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.3)",
        dot: "#ef4444",
      },
    };

    const c = config[status] || config["Active"];

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
        {status}
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
        bg: "rgba(34, 197, 94, 0.1)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.25)",
        icon: "✓",
      },
      "Pending Verification": {
        bg: "rgba(245, 158, 11, 0.1)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.25)",
        icon: "◐",
      },
      "Verification Required": {
        bg: "rgba(56, 189, 248, 0.1)",
        text: "#38bdf8",
        border: "rgba(56, 189, 248, 0.25)",
        icon: "⚠",
      },
    };

    const c = config[verification] || config["Verified"];

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
        {verification}
      </span>
    );
  };

  // Blockchain proof status badge
  const renderProofBadge = (proofStatus: DefenceAsset["proofStatus"], hash?: string) => {
    if (proofStatus === "Anchored") {
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
            Anchored
          </span>
          {hash && (
            <span
              className="font-mono-id"
              style={{ fontSize: "0.6875rem", color: "#64748b" }}
              title={hash}
            >
              {hash.slice(0, 8)}...{hash.slice(-4)}
            </span>
          )}
        </div>
      );
    }

    if (proofStatus === "Pending") {
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
          Proof Pending
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
        Anchor Required
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
          label="TOTAL DEFENCE ASSETS"
          value={stats.total}
          sub="Catalogued defence systems"
          accent="#60a5fa"
          icon="◈"
        />
        <StatCard
          label="ACTIVE / OPERATIONAL"
          value={stats.active}
          sub="Mission ready units"
          accent="#22c55e"
          icon="●"
        />
        <StatCard
          label="UNDER MAINTENANCE"
          value={stats.underMaintenance}
          sub="Depot & field servicing"
          accent="#f59e0b"
          icon="⚙"
        />
        <StatCard
          label="BLOCKCHAIN ANCHORED"
          value={stats.anchored}
          sub="Tamper-evident proof state"
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
              placeholder="Search by Asset ID, Name, Serial Number, Holder, Model..."
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

          {/* View toggle (Table / Cards) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#08131f",
              border: "1px solid #1e3a60",
              borderRadius: "5px",
              padding: "2px",
            }}
          >
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 12px",
                border: "none",
                background: viewMode === "table" ? "#1e3a60" : "transparent",
                color: viewMode === "table" ? "#e2e8f0" : "#64748b",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "3px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>☰</span> Table View
            </button>
            <button
              onClick={() => setViewMode("cards")}
              style={{
                padding: "6px 12px",
                border: "none",
                background: viewMode === "cards" ? "#1e3a60" : "transparent",
                color: viewMode === "cards" ? "#e2e8f0" : "#64748b",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "3px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>⊞</span> Card View
            </button>
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
          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
              style={{
                padding: "6px 10px",
                fontSize: "0.75rem",
                background: "#08131f",
                borderColor: categoryFilter !== "ALL" ? "#3b82f6" : "#1e3a60",
                color: categoryFilter !== "ALL" ? "#60a5fa" : "#94a3b8",
                minWidth: "160px",
              }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              Status:
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
                minWidth: "150px",
              }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              Verification:
            </span>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="input-field"
              style={{
                padding: "6px 10px",
                fontSize: "0.75rem",
                background: "#08131f",
                borderColor: verificationFilter !== "ALL" ? "#3b82f6" : "#1e3a60",
                color: verificationFilter !== "ALL" ? "#60a5fa" : "#94a3b8",
                minWidth: "170px",
              }}
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
      {filteredAssets.length === 0 ? (
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
            NO DEFENCE ASSETS FOUND
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
            No defence asset records match your current search query or filter selection. Adjust your
            parameters or reset filters to view all registered inventory.
          </p>
          <button onClick={clearFilters} className="btn-primary" style={{ fontSize: "0.8125rem" }}>
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* SCREEN 1 — ASSET LISTING: POLISHED TABLE VIEW */
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1040,
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #1e3a60",
                    background: "#08131f",
                  }}
                >
                  <th style={tableHeaderStyle}>Asset ID</th>
                  <th style={tableHeaderStyle}>Asset Name & Model</th>
                  <th style={tableHeaderStyle}>Category</th>
                  <th style={tableHeaderStyle}>Current Status</th>
                  <th style={tableHeaderStyle}>Holder / Department</th>
                  <th style={tableHeaderStyle}>Last Maintenance</th>
                  <th style={tableHeaderStyle}>Verification</th>
                  <th style={tableHeaderStyle}>Proof Status</th>
                  <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => (
                  <tr
                    key={asset.id}
                    className="table-row"
                    style={{
                      borderBottom:
                        idx === filteredAssets.length - 1 ? "none" : "1px solid #152b4a",
                      background: idx % 2 === 0 ? "transparent" : "rgba(8, 19, 31, 0.35)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Asset ID */}
                    <td style={{ padding: "14px 16px" }}>
                      <Link
                        to={`/app/assets/${asset.id}`}
                        style={{ textDecoration: "none" }}
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
                            display: "inline-block",
                          }}
                        >
                          {asset.id}
                        </span>
                      </Link>
                    </td>

                    {/* Asset Name & Model */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Link
                          to={`/app/assets/${asset.id}`}
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#e2e8f0",
                            textDecoration: "none",
                          }}
                          className="hover:text-blue-400"
                        >
                          {asset.name}
                        </Link>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {asset.model} · <span className="font-mono-id">{asset.serialNumber}</span>
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "#94a3b8",
                          background: "#132040",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid #1e3a60",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {asset.category}
                      </span>
                    </td>

                    {/* Current Status */}
                    <td style={{ padding: "14px 16px" }}>
                      {renderStatusBadge(asset.status)}
                    </td>

                    {/* Current Holder / Department */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: "0.8125rem", color: "#cbd5e1" }}>
                          {asset.department}
                        </span>
                        <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                          📍 {asset.location}
                        </span>
                      </div>
                    </td>

                    {/* Last Maintenance Date */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                        {formatDate(asset.lastMaintenanceDate)}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td style={{ padding: "14px 16px" }}>
                      {renderVerificationBadge(asset.verificationStatus)}
                    </td>

                    {/* Blockchain / Proof Status */}
                    <td style={{ padding: "14px 16px" }}>
                      {renderProofBadge(asset.proofStatus, asset.blockchainProof.assetHash)}
                    </td>

                    {/* View Details Action Button */}
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <Link
                        to={`/app/assets/${asset.id}`}
                        className="btn-secondary"
                        style={{
                          padding: "5px 12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
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

          {/* Table Footer */}
          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #152b4a",
              background: "#08131f",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            <span>
              Showing <strong style={{ color: "#94a3b8" }}>{filteredAssets.length}</strong> of{" "}
              <strong style={{ color: "#94a3b8" }}>{stats.total}</strong> defence asset records
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#22c55e" }}>●</span> NOVEXA Verified Asset Trust Network
            </span>
          </div>
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
                {/* Card Top: ID & Category */}
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
                    {asset.id}
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
                    {asset.category}
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
                    {asset.name}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {asset.model} · <span className="font-mono-id">{asset.serialNumber}</span>
                  </div>
                </div>

                {/* Status and Verification Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {renderStatusBadge(asset.status)}
                  {renderVerificationBadge(asset.verificationStatus)}
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
                    <span style={{ color: "#64748b" }}>Holder / Command:</span>
                    <span style={{ color: "#cbd5e1", textAlign: "right" }}>
                      {asset.department}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Base Location:</span>
                    <span style={{ color: "#94a3b8" }}>{asset.location}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Last Maintenance:</span>
                    <span style={{ color: "#94a3b8" }}>
                      {formatDate(asset.lastMaintenanceDate)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b" }}>Proof Status:</span>
                    {renderProofBadge(asset.proofStatus, asset.blockchainProof.assetHash)}
                  </div>
                </div>

                {/* Action button */}
                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  <Link
                    to={`/app/assets/${asset.id}`}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "8px 14px",
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

          <div
            style={{
              padding: "12px 18px",
              background: "#0c1828",
              border: "1px solid #1e3a60",
              borderRadius: "5px",
              fontSize: "0.75rem",
              color: "#64748b",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              Showing {filteredAssets.length} of {stats.total} defence assets
            </span>
            <span>NOVEXA Cryptographic Trust Registry</span>
          </div>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "0.6875rem",
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};
