import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";

export default function CertificationQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>("/certifications/queue");
      setQueue(data.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch certification queue");
    } finally {
      setLoading(false);
    }
  };

  const handleMintCertification = async (assetId: string) => {
    if (!confirm(`Initiate certification minting for asset ${assetId}?`)) return;
    
    try {
      await api.post("/certifications", { asset_id: assetId });
      alert("Certification request submitted successfully");
      fetchQueue();
    } catch (err: any) {
      alert(`Failed to mint certification: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Certification Queue"
        subtitle="Assets ready for NFT minting"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certification Queue" },
        ]}
        actions={
          <button className="btn-ghost" onClick={fetchQueue}>
            ↻ Refresh
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          Loading certification queue...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchQueue}>Retry</button>
        </div>
      ) : queue.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          No assets in certification queue. Assets must be in ACCEPTED_FOR_ASSEMBLY state with verified evidence.
        </div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Type</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Evidence</th>
                <th>Lifecycle</th>
                <th>Cert Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((asset: any) => (
                <tr key={asset.id}>
                  <td>
                    <Link to={`/app/assets/${asset.asset_id || asset.id}`} className="meta-id" style={{ color: "#60a5fa" }}>
                      {asset.asset_id || asset.id}
                    </Link>
                  </td>
                  <td>{asset.type}</td>
                  <td style={{ color: "#94a3b8" }}>{asset.model}</td>
                  <td className="meta-id" style={{ color: "#94a3b8" }}>{asset.serial_number}</td>
                  <td>
                    <span style={{ fontSize: "0.8125rem", color: "#22c55e" }}>
                      {asset.verified_evidence_count || 0}/{asset.total_evidence_count || 0} verified
                    </span>
                  </td>
                  <td><StatusBadge status={asset.lifecycle_state} /></td>
                  <td><StatusBadge status={asset.cert_status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link to={`/app/assets/${asset.asset_id || asset.id}`} className="btn-ghost" style={{ fontSize: "0.75rem" }}>
                        Review
                      </Link>
                      {asset.cert_status !== "CONFIRMED" && (
                        <button
                          className="btn-primary"
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => handleMintCertification(asset.asset_id || asset.id)}
                        >
                          Mint NFT
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: 16, textAlign: "center", color: "#64748b", fontSize: "0.8125rem" }}>
            {queue.length} asset{queue.length !== 1 ? "s" : ""} in queue
          </div>
        </div>
      )}
    </div>
  );
}
