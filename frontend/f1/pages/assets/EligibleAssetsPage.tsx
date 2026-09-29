import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";
import { certificationService } from "../../services/certifications";
import CertificateImageUpload from "../../components/certifications/CertificateImageUpload";

export default function EligibleAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<any>(null);

  // Mint modal state
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [batchIdInput, setBatchIdInput] = useState("");
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [certificateImageName, setCertificateImageName] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const openMintModal = (assetId: string, batchId?: string) => {
    setSelectedAssetId(assetId);
    setBatchIdInput(batchId || "");
    setCertificateImage(null);
    setCertificateImageName(null);
    setMintStatus(null);
    setShowMintModal(true);
  };

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    setMinting(true);
    setMintStatus(null);
    try {
      await certificationService.createCertification({
        asset_id: selectedAssetId,
        batch_id: batchIdInput.trim() || undefined,
        certificate_image: certificateImage || undefined,
        image_name: certificateImageName || undefined,
      });

      setMintStatus({
        type: "success",
        message: `NFT Certification successfully minted for ${selectedAssetId}!`,
      });
      fetchEligibleAssets();
      setTimeout(() => {
        setShowMintModal(false);
        setMintStatus(null);
        setCertificateImage(null);
        setCertificateImageName(null);
      }, 1500);
    } catch (err: any) {
      setMintStatus({
        type: "error",
        message: err.data?.message || err.message || "Failed to mint NFT certification",
      });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Eligible Assets"
        subtitle="Defence assets cleared for soulbound NFT certification on BEL-TRUST-CHAIN"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Eligible Assets" },
        ]}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            {assets.length > 0 && (
              <button
                className="btn-primary"
                onClick={() => openMintModal(assets[0].asset_id || assets[0].id, assets[0].batch_id)}
              >
                + Mint Certification
              </button>
            )}
            <button className="btn-secondary" onClick={fetchEligibleAssets}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {criteria && (
        <div
          className="panel"
          style={{
            padding: 16,
            marginBottom: 20,
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
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
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        className="btn-primary"
                        style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                        onClick={() => openMintModal(asset.asset_id || asset.id, asset.batch_id)}
                      >
                        Mint NFT
                      </button>
                      <Link to={`/app/assets/${asset.asset_id || asset.id}`} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                        View
                      </Link>
                    </div>
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

      {/* Mint Certification Modal with Image Upload */}
      {showMintModal && (
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
            padding: 20,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 540,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>Mint NFT Certification</div>
                <div style={{ fontSize: "0.75rem", color: "var(--subtle-text)" }}>Issue soulbound certificate on BEL-TRUST-CHAIN</div>
              </div>
              <button
                onClick={() => {
                  setShowMintModal(false);
                  setMintStatus(null);
                  setCertificateImage(null);
                  setCertificateImageName(null);
                }}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {mintStatus && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 4,
                  fontSize: "0.8125rem",
                  marginBottom: 14,
                  background: mintStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${mintStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: mintStatus.type === "success" ? "#22c55e" : "#ef4444",
                }}
              >
                {mintStatus.message}
              </div>
            )}

            <form onSubmit={handleMintSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>
                  Target Asset ID *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>
                  Batch / Assembly ID (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
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

              <div style={{ padding: "10px 12px", background: "var(--hover-bg, rgba(255,255,255,0.04))", border: "1px solid var(--border)", borderRadius: 4, fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--foreground)", fontWeight: 600 }}>ERC-5192 Soulbound Token: </span>
                Cryptographically bound certificate seal will be anchored to the BEL-TRUST-CHAIN ledger.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowMintModal(false);
                    setMintStatus(null);
                    setCertificateImage(null);
                    setCertificateImageName(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={minting || !selectedAssetId}
                >
                  {minting ? "Minting NFT..." : "Mint NFT Certification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
