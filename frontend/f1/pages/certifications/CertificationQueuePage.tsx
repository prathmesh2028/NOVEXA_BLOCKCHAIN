import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";
import { certificationService } from "../../services/certifications";
import CertificateImageUpload, { PRESET_CERTIFICATE_SEALS } from "../../components/certifications/CertificateImageUpload";
import "./CertificationQueuePage.css";

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
  const [demoLoaded, setDemoLoaded] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  /* Viewport scroll lock for NFT Create modal */
  useEffect(() => {
    if (!showCreateModal) return;

    const windowScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const mainEl = document.querySelector(".app-main-content") as HTMLElement | null;
    const mainScrollTop = mainEl ? mainEl.scrollTop : 0;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalMainOverflow = mainEl ? mainEl.style.overflow : undefined;

    // Compensate for scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (mainEl) {
      mainEl.style.overflow = "hidden";
      if (mainEl.scrollTop !== mainScrollTop) {
        mainEl.scrollTop = mainScrollTop;
      }
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (mainEl && originalMainOverflow !== undefined) {
        mainEl.style.overflow = originalMainOverflow;
        mainEl.scrollTop = mainScrollTop;
      }
      window.scrollTo(0, windowScrollY);
    };
  }, [showCreateModal]);

  /* Close modal on Escape key */
  useEffect(() => {
    if (!showCreateModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCreateModal(false);
        setModalStatus(null);
        setCertificateImage(null);
        setCertificateImageName(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCreateModal]);

  const handleLoadDemoData = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedAssetId("EF-2026-001");
    setBatchIdInput("FUZE-BATCH-2026-001");
    if (PRESET_CERTIFICATE_SEALS && PRESET_CERTIFICATE_SEALS.length > 0) {
      const demoSeal = PRESET_CERTIFICATE_SEALS[0];
      setCertificateImage(demoSeal.dataUrl);
      setCertificateImageName(`${demoSeal.name.toLowerCase().replace(/\s+/g, "_")}.svg`);
    }
    setModalStatus(null);
    setDemoLoaded(true);
    setTimeout(() => {
      setDemoLoaded(false);
    }, 2500);
  };

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
    <div className="cert-queue-page-root">
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
      <div className="queue-toolbar">
        <div className="queue-tabs-group">
          {[
            { key: "ALL", label: `All Queue (${queue.length})` },
            { key: "PENDING", label: `Pending Mint (${queue.filter((q) => q.cert_status !== "CONFIRMED").length})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`queue-tab-btn ${statusFilter === f.key ? "active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            className="queue-search-input"
            placeholder="Search asset, model, or serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px", background: "#181818", border: "1px solid #2a2a2a", borderRadius: "12px", color: "#737373" }}>
          Loading certification queue...
        </div>
      ) : error ? (
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px", background: "#181818", border: "1px solid #2a2a2a", borderRadius: "12px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchQueue}>Retry</button>
        </div>
      ) : queue.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px", background: "#181818", border: "1px solid #2a2a2a", borderRadius: "12px", color: "#737373" }}>
          No assets currently in certification queue. Assets must be in ACCEPTED_FOR_ASSEMBLY state with verified evidence before minting.
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "40px 20px", background: "#181818", border: "1px solid #2a2a2a", borderRadius: "12px", color: "#737373" }}>
          No assets match the search criteria.
        </div>
      ) : (
        <div className="queue-table-wrap">
          <table className="queue-table">
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
                    <Link to={`/app/assets/${asset.asset_id || asset.id}`} className="queue-asset-link">
                      {asset.asset_id || asset.id}
                    </Link>
                  </td>
                  <td>{asset.type}</td>
                  <td style={{ color: "#a3a3a3" }}>{asset.model}</td>
                  <td className="meta-id" style={{ color: "#a3a3a3" }}>{asset.serial_number}</td>
                  <td>
                    <span style={{ fontSize: "0.8125rem", color: "#4ade80", fontWeight: 500 }}>
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
          <div className="queue-table-footer">
            <span>Showing {filteredQueue.length} of {queue.length} queue items</span>
            <span>Soulbound ERC-5192 Token Generation</span>
          </div>
        </div>
      )}

      {/* NFT Create Modal (Viewport-Fixed Portal) */}
      {showCreateModal && typeof document !== "undefined" && createPortal(
        <div
          className="queue-modal-backdrop"
          onClick={() => {
            setShowCreateModal(false);
            setModalStatus(null);
            setCertificateImage(null);
            setCertificateImageName(null);
          }}
        >
          <div
            className="queue-modal-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-queue-title"
          >
            <div className="queue-modal-header">
              <div className="queue-modal-title-wrap">
                <div id="modal-queue-title" className="queue-modal-title">
                  <span style={{ color: "#3b82f6", fontSize: "1.1rem" }}>🪙</span>
                  NFT Create · Mint Certification
                </div>
                <div className="queue-modal-subtitle">
                  Issue immutable cryptographic token on BEL-TRUST-CHAIN
                </div>
              </div>
              <button
                type="button"
                className="queue-modal-close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  setModalStatus(null);
                  setCertificateImage(null);
                  setCertificateImageName(null);
                }}
                aria-label="Close modal"
                title="Close modal (Esc)"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleMintCertification}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <div className="queue-modal-body">
                {modalStatus && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: "0.8125rem",
                      background: modalStatus.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      border: `1px solid ${modalStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                      color: modalStatus.type === "success" ? "#4ade80" : "#f87171",
                      fontWeight: 500,
                    }}
                  >
                    {modalStatus.message}
                  </div>
                )}

                {/* DEMO DATA QUICK FILL BAR */}
                <div className="queue-demo-bar">
                  <div className="queue-demo-bar-info">
                    <span className="queue-demo-badge">SIH DEMO</span>
                    <span className="queue-demo-text">Pre-fill fictional defence certification</span>
                  </div>
                  <button
                    type="button"
                    id="queue-load-demo-btn"
                    className={`queue-load-demo-btn ${demoLoaded ? "loaded" : ""}`}
                    onClick={handleLoadDemoData}
                    title="Automatically fill form with realistic demo values"
                  >
                    <span>{demoLoaded ? "✓" : "⚡"}</span>
                    <span>{demoLoaded ? "DEMO DATA LOADED" : "LOAD DEMO DATA"}</span>
                  </button>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#a3a3a3", marginBottom: 6, fontWeight: 600 }}>
                    Target Asset ID *
                  </label>
                  {queue.length > 0 ? (
                    <select
                      className="queue-form-select"
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
                      {selectedAssetId && !queue.some((a) => (a.asset_id || a.id) === selectedAssetId) && (
                        <option value={selectedAssetId}>
                          {selectedAssetId} — Electronic Fuze Assembly (ACCEPTED_FOR_ASSEMBLY) [Demo]
                        </option>
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="queue-form-input"
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      placeholder="e.g. EF-2026-00421"
                      required
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#a3a3a3", marginBottom: 6, fontWeight: 600 }}>
                    Batch / Assembly ID (Optional)
                  </label>
                  <input
                    type="text"
                    className="queue-form-input"
                    value={batchIdInput}
                    onChange={(e) => setBatchIdInput(e.target.value)}
                    placeholder="e.g. FUZE-BATCH-2026-001"
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

                <div
                  className="queue-info-box"
                  style={{
                    padding: "10px 12px",
                    background: "#1f1f1f",
                    border: "1px solid #303030",
                    borderRadius: 8,
                    fontSize: "0.75rem",
                    color: "#a3a3a3",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "#f5f5f5", fontWeight: 600 }}>ERC-5192 Soulbound Token: </strong>
                  Generates a non-transferable on-chain certification token bound to the selected defence asset with attached verification seal.
                </div>
              </div>

              {/* PINNED MODAL FOOTER */}
              <div className="queue-modal-footer">
                <button
                  type="button"
                  id="queue-load-demo-footer-btn"
                  className={`queue-load-demo-footer-btn ${demoLoaded ? "loaded" : ""}`}
                  onClick={handleLoadDemoData}
                  title="Populate demo data"
                >
                  <span>{demoLoaded ? "✓" : "⚡"}</span>
                  <span>{demoLoaded ? "Demo Filled" : "Use Dummy Data"}</span>
                </button>

                <div className="queue-modal-footer-actions">
                  <button
                    type="button"
                    className="btn-secondary"
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
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
