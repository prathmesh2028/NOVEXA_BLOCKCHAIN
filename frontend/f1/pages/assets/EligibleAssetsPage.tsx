import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";

export default function EligibleAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<any>(null);

  useEffect(() => {
    fetchEligibleAssets();
  }, []);

  const fetchEligibleAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>("/assets/eligible");
      setAssets(data.items || []);
      setCriteria(data.eligibility_criteria);
    } catch (err: any) {
      setError(err.message || "Failed to fetch eligible assets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Eligible Assets"
        subtitle="Assets ready for NFT certification"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Eligible Assets" },
        ]}
      />

      {criteria && (
        <div className="panel" style={{ padding: 16, marginBottom: 20, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>
            ELIGIBILITY CRITERIA
          </div>
          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
            • Lifecycle State: <strong>{criteria.lifecycle_state}</strong><br />
            • Requires Verified Evidence: <strong>{criteria.requires_verified_evidence ? "Yes" : "No"}</strong><br />
            • Excludes Already Certified: <strong>{criteria.excludes_already_certified ? "Yes" : "No"}</strong>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          Loading eligible assets...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchEligibleAssets}>Retry</button>
        </div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          No eligible assets found. Assets must be in ACCEPTED_FOR_ASSEMBLY state with verified evidence.
        </div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Type</th>
                <th>Model</th>
                <th>Batch</th>
                <th>Evidence</th>
                <th>Lifecycle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset: any) => (
                <tr key={asset.id}>
                  <td>
                    <Link to={`/app/assets/${asset.asset_id || asset.id}`} className="meta-id" style={{ color: "#60a5fa" }}>
                      {asset.asset_id || asset.id}
                    </Link>
                  </td>
                  <td>{asset.type}</td>
                  <td style={{ color: "#94a3b8" }}>{asset.model}</td>
                  <td className="meta-id" style={{ color: "#94a3b8" }}>{asset.batch_id}</td>
                  <td>
                    <span style={{ fontSize: "0.8125rem", color: "#22c55e" }}>
                      {asset.verified_evidence_count || 0}/{asset.total_evidence_count || 0} verified
                    </span>
                  </td>
                  <td><StatusBadge status={asset.lifecycle_state} /></td>
                  <td><StatusBadge status={asset.cert_status} /></td>
                  <td>
                    <Link to={`/app/assets/${asset.asset_id || asset.id}`} className="btn-ghost" style={{ fontSize: "0.75rem" }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: 16, textAlign: "center", color: "#64748b", fontSize: "0.8125rem" }}>
            {assets.length} eligible asset{assets.length !== 1 ? "s" : ""} found
          </div>
        </div>
      )}
    </div>
  );
}
