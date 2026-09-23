import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";
import { certificationService } from "../../services/certifications";
import CertificateImageUpload from "../../components/certifications/CertificateImageUpload";

export default function CertificationQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [batchIdInput, setBatchIdInput] = useState("");
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [certificateImageName, setCertificateImageName] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>("/certifications/queue");
      const items = data.items || [];
      setQueue(items);
      if (items.length > 0 && !selectedAssetId) {
        setSelectedAssetId(items[0].asset_id || items[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch certification queue");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (assetId?: string) => {
    if (assetId) {
      setSelectedAssetId(assetId);
    } else if (queue.length > 0) {
      setSelectedAssetId(queue[0].asset_id || queue[0].id);
    }
    setBatchIdInput("");
    setCertificateImage(null);
    setCertificateImageName(null);
    setModalStatus(null);
    setShowCreateModal(true);
  };

  const handleMintCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    setIsSubmitting(true);
    setModalStatus(null);
    try {
      await certificationService.createCertification({
        asset_id: selectedAssetId,
        batch_id: batchIdInput.trim() || undefined,
        certificate_image: certificateImage || undefined,
        image_name: certificateImageName || undefined,
      });
      setModalStatus({
        type: "success",
        message: `NFT certification successfully minted for asset ${selectedAssetId}!`,
      });
      fetchQueue();
      setTimeout(() => {
        setShowCreateModal(false);
        setModalStatus(null);
        setCertificateImage(null);
        setCertificateImageName(null);
      }, 1500);
    } catch (err: any) {
      setModalStatus({
        type: "error",
        message: err.data?.message || err.message || "Failed to create NFT certification",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQueue = queue.filter((item) => {
    const id = (item.asset_id || item.id || "").toLowerCase();
    const model = (item.model || "").toLowerCase();
    const serial = (item.serial_number || "").toLowerCase();
    const matchesSearch = !searchTerm || id.includes(searchTerm.toLowerCase()) || model.includes(searchTerm.toLowerCase()) || serial.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "PENDING" && item.cert_status !== "CONFIRMED") || item.cert_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-fade">
      <PageHeader
        title="Certification Queue"
        subtitle="Defence assets verified and pending Soulbound NFT certification on BEL-TRUST-CHAIN"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certification Queue" },
        ]}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => openCreateModal()}>
              + NFT Create
            </button>
            <button className="btn-ghost" onClick={fetchQueue}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "ALL", label: `All Queue (${queue.length})` },
            { key: "PENDING", label: `Pending Mint (${queue.filter((q) => q.cert_status !== "CONFIRMED").length})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: "6px 14px",
                background: statusFilter === f.key ? "rgba(37,99,235,0.2)" : "transparent",
                border: `1px solid ${statusFilter === f.key ? "#2563eb" : "#1e3a60"}`,
                borderRadius: "4px",
                color: statusFilter === f.key ? "#e2e8f0" : "#64748b",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            className="input"
            style={{ width: "100%", padding: "6px 12px", fontSize: "0.8125rem", background: "#08131f", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
            placeholder="Search asset, model, or serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          Loading certification queue...
        </div>
      ) : error ? (
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchQueue}>Retry</button>
        </div>
      ) : queue.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          No assets currently in certification queue. Assets must be in ACCEPTED_FOR_ASSEMBLY state with verified evidence before minting.
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          No assets match the search criteria.
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
                <th>Evidence Status</th>
                <th>Lifecycle</th>
                <th>Cert Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((asset: any) => (
                <tr key={asset.id || asset.asset_id}>
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
                          onClick={() => openCreateModal(asset.asset_id || asset.id)}
                        >
                          + NFT Create
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#64748b", display: "flex", justifyContent: "space-between" }}>
            <span>Showing {filteredQueue.length} of {queue.length} queue items</span>
            <span>Soulbound ERC-5192 Token Generation</span>
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
          <div className="panel" style={{ width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", padding: 24, border: "1px solid #1e3a60" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>NFT Create · Mint Certification</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Issue immutable cryptographic token on BEL-TRUST-CHAIN</div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setModalStatus(null);
                  setCertificateImage(null);
                  setCertificateImageName(null);
                }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {modalStatus && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 4,
                  fontSize: "0.8125rem",
                  marginBottom: 14,
                  background: modalStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${modalStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: modalStatus.type === "success" ? "#22c55e" : "#ef4444",
                }}
              >
                {modalStatus.message}
              </div>
            )}

            <form onSubmit={handleMintCertification} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Target Asset ID *
                </label>
                {queue.length > 0 ? (
                  <select
                    className="input"
                    style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    required
                  >
                    {queue.map((a: any) => {
                      const id = a.asset_id || a.id;
                      return (
                        <option key={a.id || id} value={id}>
                          {id} — {a.model || a.type} ({a.lifecycle_state})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    placeholder="e.g. EF-2026-00421"
                    required
                  />
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Batch / Assembly ID (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                  value={batchIdInput}
                  onChange={(e) => setBatchIdInput(e.target.value)}
                  placeholder="e.g. BATCH-2026-Q1"
                />
              </div>

              {/* Certificate Image Upload */}
              <CertificateImageUpload
                value={certificateImage}
                fileName={certificateImageName}
                onChange={(val, name) => {
                  setCertificateImage(val);
                  setCertificateImageName(name || null);
                }}
              />

              <div style={{ padding: "10px 12px", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 4, fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.5 }}>
                <span style={{ color: "#60a5fa", fontWeight: 600 }}>ERC-5192 Soulbound Token: </span>
                Generates a non-transferable on-chain certification token bound to the selected defence asset with attached verification seal.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setModalStatus(null);
                    setCertificateImage(null);
                    setCertificateImageName(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !selectedAssetId}
                >
                  {isSubmitting ? "Minting NFT..." : "Mint NFT Certification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
