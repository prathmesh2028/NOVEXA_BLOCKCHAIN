import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import DemoDataDropdown from "../../components/ui/DemoDataDropdown";
import { assetService, AssetResponse } from "../../services/assets";
import { DemoRecord } from "../../data/demoData";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [total, setTotal] = useState(0);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assetService.listAssets({
        search: search || undefined,
        lifecycle: lifecycleFilter === "ALL" ? undefined : lifecycleFilter,
      });
      setAssets(response.items);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || "Failed to load assets");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [search, lifecycleFilter]);

  const handleDemoDataSelect = (record: DemoRecord) => {
    if (record.type === 'asset') {
      setSearch(record.data.asset_id);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets; // Filtering is done server-side
  }, [assets]);

  const clearFilters = () => {
    setSearch("");
    setLifecycleFilter("ALL");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAssets();
  };

  // Lifecycle state badge
  const renderLifecycleBadge = (state: string) => {
    const config: Record<string, { bg: string; text: string; border: string; dot: string }> = {
      ACCEPTED_FOR_ASSEMBLY: {
        bg: "rgba(16, 185, 129, 0.08)",
        text: "#34d399",
        border: "rgba(16, 185, 129, 0.25)",
        dot: "#10b981",
      },
      SUPPLIER_DECLARED: {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.25)",
        dot: "#f59e0b",
      },
      RECEIVED: {
        bg: "rgba(59, 130, 246, 0.08)",
        text: "#60a5fa",
        border: "rgba(59, 130, 246, 0.25)",
        dot: "#3b82f6",
      },
      INSPECTION_RECORDED: {
        bg: "rgba(168, 85, 247, 0.08)",
        text: "#a78bfa",
        border: "rgba(168, 85, 247, 0.25)",
        dot: "#a855f7",
      },
      REJECTED_QUARANTINED: {
        bg: "rgba(239, 68, 68, 0.08)",
        text: "#f87171",
        border: "rgba(239, 68, 68, 0.25)",
        dot: "#ef4444",
      },
      UNREGISTERED: {
        bg: "rgba(255, 255, 255, 0.05)",
        text: "#a3a3a3",
        border: "rgba(255, 255, 255, 0.1)",
        dot: "#737373",
      },
    };

    const c = config[state] || config["UNREGISTERED"];

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
        {state.replace(/_/g, " ")}
      </span>
    );
  };

  // Verification status badge
  const renderVerificationBadge = (verification: string) => {
    const config: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      VERIFIED: {
        bg: "rgba(16, 185, 129, 0.08)",
        text: "#34d399",
        border: "rgba(16, 185, 129, 0.2)",
        icon: "✓",
      },
      PENDING: {
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.2)",
        icon: "◐",
      },
      FAILED: {
        bg: "rgba(239, 68, 68, 0.08)",
        text: "#f87171",
        border: "rgba(239, 68, 68, 0.2)",
        icon: "✕",
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

  return (
    <div className="page-fade">
      <PageHeader
        title="Assets"
        subtitle="Track defence assets through their cryptographic lifecycle"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Assets" },
        ]}
      />

      {/* Search and Filters */}
      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Asset ID, Batch ID, Serial Number..."
              style={{ fontSize: "0.9375rem" }}
            />
          </div>
          <DemoDataDropdown type="asset" onSelect={handleDemoDataSelect} />
          <select
            className="input-field"
            value={lifecycleFilter}
            onChange={(e) => setLifecycleFilter(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="ALL">All States</option>
            <option value="SUPPLIER_DECLARED">Supplier Declared</option>
            <option value="RECEIVED">Received</option>
            <option value="INSPECTION_RECORDED">Inspection Recorded</option>
            <option value="ACCEPTED_FOR_ASSEMBLY">Accepted for Assembly</option>
            <option value="REJECTED_QUARANTINED">Rejected/Quarantined</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </div>
      </form>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading assets...
        </div>
      )}

      {error && (
        <div className="panel" style={{ padding: "24px", textAlign: "center", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: 16, fontSize: "0.8125rem", color: "#64748b" }}>
            {total} asset{total !== 1 ? "s" : ""} found
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredAssets.map((asset) => (
              <Link key={asset.id} to={`/app/assets/${asset.id}`} style={{ textDecoration: "none" }}>
                <div className="panel" style={{ padding: "16px 20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span className="meta-id" style={{ color: "#60a5fa", fontWeight: 600 }}>
                          {asset.asset_id}
                        </span>
                        {renderLifecycleBadge(asset.lifecycle_state)}
                        {renderVerificationBadge(asset.verification_status)}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "#94a3b8", marginBottom: 4 }}>
                        {asset.type} · {asset.model}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Batch: {asset.batch_id} · Supplier: {asset.supplier}
                      </div>
                    </div>
                    {asset.cert_id && (
                      <div style={{ marginLeft: 16 }}>
                        <div style={{ fontSize: "0.6875rem", color: "#22c55e", fontWeight: 600 }}>
                          ✓ {asset.cert_id}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
