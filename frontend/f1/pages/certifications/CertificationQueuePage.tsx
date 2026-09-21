import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";

export default function CertificationQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>("/certifications/queue");
      setQueue(data.items || []);
      if (data.items && data.items.length > 0 && !selectedAssetId) {
        setSelectedAssetId(data.items[0].asset_id || data.items[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch certification queue");
    } finally {
      setLoading(false);
    }
  };

  const handleMintCertification = async (assetId: string) => {
    if (!confirm(`Initiate NFT certification creation for asset ${assetId}?`)) return;
    
    setIsSubmitting(true);
    try {
      await api.post("/certifications", { asset_id: assetId });
      alert("NFT certification created successfully");
      setShowCreateModal(false);
      fetchQueue();
    } catch (err: any) {
      alert(`Failed to create NFT certification: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
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
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + NFT Create
            </button>
            <button className="btn-ghost" onClick={fetchQueue}>
              ↻ Refresh
            </button>
          </div>
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
                          NFT Create
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

      {/* NFT Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="panel" style={{ width: "100%", maxWidth: 460, padding: 24, border: "1px solid #1e3a60" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>NFT Create · Mint Certification</div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedAssetId) handleMintCertification(selectedAssetId);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Select Asset from Queue
                </label>
                {queue.length > 0 ? (
                  <select
                    className="input"
                    style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    required
                  >
                    {queue.map((a: any) => (
                      <option key={a.id} value={a.asset_id || a.id}>
                        {a.asset_id || a.id} — {a.model || a.type} ({a.lifecycle_state})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    placeholder="Enter Asset ID (e.g. EF-2026-00421)"
                    required
                  />
                )}
              </div>

              <div style={{ padding: "10px 12px", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 4, fontSize: "0.75rem", color: "#94a3b8" }}>
                Minting creates a non-transferable ERC-5192 Soulbound Token on BEL-TRUST-CHAIN representing verified defence certification.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !selectedAssetId}
                >
                  {isSubmitting ? "Creating NFT..." : "Create NFT Certification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
