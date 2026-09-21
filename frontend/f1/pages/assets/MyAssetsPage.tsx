import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import RoleBadge from "../../components/ui/RoleBadge";
import { assetService, AssetResponse } from "../../services/assets";
import { formatDateTime } from "../../data/utils";

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would filter by current user
        // For now, we'll just fetch all assets
        const res = await assetService.listAssets({ page_size: 100 });
        setAssets(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  return (
    <div className="page-fade">
      <PageHeader
        title="My Assets"
        subtitle="Your assigned assets with quick access to registration updates, lifecycle tracking, and evidence management"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "My Assets" },
        ]}
        actions={
          <Link to="/app/register">
            <button className="btn-primary">+ Register New Asset</button>
          </Link>
        }
      />

      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 900,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #1e3a60",
                  background: "#08131f",
                }}
              >
                {[
                  "Asset ID",
                  "Type",
                  "Model",
                  "Serial Number",
                  "Lifecycle",
                  "Verification",
                  "Evidence",
                  "Cert Status",
                  "Registered",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: "0.6875rem",
                      color: "#475569",
                      fontWeight: 600,
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
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#475569",
                    }}
                  >
                    Loading your assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#475569",
                    }}
                  >
                    No assets found. Register your first asset to get started.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    style={{ borderBottom: "1px solid #152b4a" }}
                    className="table-row"
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <Link
                        to={`/app/assets/${asset.id}`}
                        className="meta-id"
                        style={{
                          color: "#60a5fa",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        {asset.asset_id}
                      </Link>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: "0.8125rem",
                        color: "#94a3b8",
                      }}
                    >
                      {asset.type}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: "0.8125rem",
                        color: "#e2e8f0",
                      }}
                    >
                      {asset.model}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="meta-id">{asset.serial_number}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge
                        status={asset.lifecycle_state}
                        size="sm"
                      />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge
                        status={asset.verification_status}
                        size="sm"
                      />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "#60a5fa",
                          }}
                        >
                          {asset.evidence_count}
                        </span>
                        <StatusBadge
                          status={asset.evidence_status}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={asset.cert_status} size="sm" />
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      {formatDateTime(asset.created_at)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${asset.id}`}>
                        <button
                          className="btn-ghost"
                          style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                        >
                          View →
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid #152b4a",
            fontSize: "0.75rem",
            color: "#475569",
          }}
        >
          Showing {assets.length} of {total} assets (Powered by Backend API)
        </div>
      </div>
    </div>
  );
}
