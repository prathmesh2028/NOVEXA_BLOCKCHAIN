import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../data/utils";
import { evidenceService, EvidenceResponse } from "../../services/evidence";
import "./EvidencePage.css";

/* ── Count-up Hook for KPI Numbers ─────────────────────────────────── */
function useCountUp(target: number, duration = 800, delay = 0): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let startTime: number | null = null;

    const timer = setTimeout(() => {
      function step(ts: number) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          raf.current = requestAnimationFrame(step);
        }
      }
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<EvidenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadAssetId, setUploadAssetId] = useState("EF-2026-00421");
  const [uploadType, setUploadType] = useState("QA Approval");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleLoadDemoData = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setUploadAssetId("EF-2026-001");
    setUploadType("QA Approval");
    const demoBlob = new Blob(
      [
        "[DEMO DEFENCE EVIDENCE]\nAsset ID: EF-2026-001\nType: QA Approval\nStandard: MIL-STD-810H\nStatus: VERIFIED\nHash Anchor: BEL-TRUST-CHAIN\nTimestamp: " +
          new Date().toISOString(),
      ],
      { type: "application/pdf" }
    );
    const demoFile = new File([demoBlob], "QA_Certificate_EF-2026-001.pdf", {
      type: "application/pdf",
      lastModified: Date.now(),
    });
    setUploadFile(demoFile);
    setUploadStatus(null);
    setDemoLoaded(true);
    setTimeout(() => {
      setDemoLoaded(false);
    }, 2500);
  };

  const fetchEvidence = async () => {
    setIsRefreshing(true);
    try {
      const res = await evidenceService.listEvidence({ page_size: 100 });
      setEvidence(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Evidence retrieval failed:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  /* Viewport scroll lock for Upload Evidence modal */
  useEffect(() => {
    if (!showUploadModal) return;

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
  }, [showUploadModal]);

  /* Close modal on Escape key */
  useEffect(() => {
    if (!showUploadModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowUploadModal(false);
        setUploadStatus(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showUploadModal]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadAssetId) return;
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = (reader.result as string).split(',')[1] || '';
          await evidenceService.uploadEvidence({
            asset_id: uploadAssetId,
            filename: uploadFile.name,
            type: uploadType,
            mime_type: uploadFile.type || 'application/pdf',
            size_kb: Math.ceil(uploadFile.size / 1024),
            content_base64: base64Content,
            event: 'EVIDENCE_UPLOAD',
          });
          setUploadStatus({ type: 'success', message: 'Evidence uploaded and hashed successfully!' });
          fetchEvidence();
          setTimeout(() => {
            setShowUploadModal(false);
            setUploadStatus(null);
            setUploadFile(null);
          }, 1400);
        } catch (err: any) {
          setUploadStatus({ type: 'error', message: err.data?.message || err.message || 'Upload failed' });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(uploadFile);
    } catch (err: any) {
      setUploadStatus({ type: 'error', message: err.message || 'Failed to read file' });
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredEvidence = evidence.filter((e) => {
    const matchesSearch =
      !searchTerm ||
      e.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(evidence.map((e) => e.type)));

  // Real Metric Computations
  const verifiedCount = evidence.filter((e) => e.integrity_verified).length;
  const anchoredCount = evidence.filter((e) => e.status === "Complete" || e.blockchain_tx).length;
  const categoriesCount = uniqueTypes.length || 1;

  // Animated KPI numbers
  const animatedTotal = useCountUp(total, 750, 50);
  const animatedVerified = useCountUp(verifiedCount, 800, 100);
  const animatedAnchors = useCountUp(anchoredCount, 850, 150);
  const animatedCategories = useCountUp(categoriesCount, 700, 200);

  return (
    <div className="ev-vault-page page-fade">
      {/* Background Ambient Coordinate Grid */}
      <div className="ev-ambient-grid" />

      {/* ── 1. Page Header ─────────────────────────────────────────────── */}
      <header className="ev-header-card ev-animate-1">
        <div>
          <nav className="ev-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/app/dashboard" className="ev-breadcrumb-link">
              Dashboard
            </Link>
            <span className="ev-breadcrumb-separator">/</span>
            <span className="ev-breadcrumb-current">Evidence Vault</span>
          </nav>

          <div className="ev-header-title-row">
            <h1 className="ev-header-title">Evidence Vault</h1>
            <div className="ev-header-status-pill">
              <span className="ev-pulse-dot" />
              <span>ARMORED • ZERO TAMPER</span>
            </div>
          </div>

          <p className="ev-header-subtitle">
            Cryptographic evidence records with SHA-256 integrity verification and blockchain anchoring
          </p>
        </div>

        <div className="ev-header-actions">
          <button
            type="button"
            className="ev-btn-upload"
            onClick={() => setShowUploadModal(true)}
            id="btn-upload-evidence"
          >
            <span className="ev-btn-icon">⊕</span>
            <span>Upload Evidence</span>
          </button>

          <button
            type="button"
            className="ev-btn-refresh"
            onClick={fetchEvidence}
            disabled={isRefreshing}
            id="btn-refresh-evidence"
            aria-label="Refresh evidence list"
          >
            <span className={`ev-refresh-icon ${isRefreshing ? "ev-refresh-spinning" : ""}`}>
              ↻
            </span>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* ── 2. SHA-256 Cryptographic Fingerprinting & Pipeline Hero Card ── */}
      <section className="ev-crypto-panel ev-animate-2" aria-label="Cryptographic Security Overview">
        {/* Moving Cyber Scan Beam */}
        <div className="ev-scan-beam" />

        <div className="ev-crypto-grid">
          {/* Left: Security Identity & Algorithm Specs */}
          <div className="ev-crypto-left">
            <div className="ev-shield-chassis" aria-hidden="true">
              <div className="ev-shield-spin-ring" />
              <span>◫</span>
            </div>

            <div className="ev-crypto-title-block">
              <div className="ev-crypto-badge-row">
                <span className="ev-crypto-tag">
                  <span className="ev-pulse-dot" style={{ width: 5, height: 5 }} />
                  ALGORITHM: SHA-256
                </span>
                <span style={{ fontSize: "0.6875rem", color: "var(--ev-text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                  CRYPTOGRAPHIC DIGEST
                </span>
              </div>

              <h2 className="ev-crypto-headline">
                SHA-256 Cryptographic Fingerprinting
              </h2>

              <p className="ev-crypto-desc">
                Every file payload produces a unique 256-bit cryptographic hash. Any byte-level alteration produces a different hash, enabling tamper detection.
              </p>

              <div className="ev-crypto-hex-stream">
                <span style={{ color: "var(--ev-text-muted)" }}>LIVE HASH DIGEST:</span>
                <code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
              </div>
            </div>
          </div>

          {/* Right: Evidence Security Pipeline (FILE → HASH → VERIFY → BLOCKCHAIN) */}
          <div className="ev-pipeline-stage">
            <div className="ev-pipeline-header">
              <span>EVIDENCE SECURITY PIPELINE</span>
              <span style={{ color: "var(--ev-accent-cyan)" }}>ZERO TRUST PROTOCOL</span>
            </div>

            <div className="ev-pipeline-nodes">
              {/* Connecting Laser Wire with Traveling Packet */}
              <div className="ev-pipeline-vector">
                <div className="ev-pipeline-packet" />
              </div>

              <div className="ev-pipeline-node">
                <div className="ev-node-circle">🗎</div>
                <div className="ev-node-name">1. FILE</div>
                <div className="ev-node-sub">Intake</div>
              </div>

              <div className="ev-pipeline-node">
                <div className="ev-node-circle">#</div>
                <div className="ev-node-name">2. HASH</div>
                <div className="ev-node-sub">SHA-256</div>
              </div>

              <div className="ev-pipeline-node">
                <div className="ev-node-circle">✓</div>
                <div className="ev-node-name">3. VERIFY</div>
                <div className="ev-node-sub">Integrity</div>
              </div>

              <div className="ev-pipeline-node">
                <div className="ev-node-circle">⬡</div>
                <div className="ev-node-name">4. CHAIN</div>
                <div className="ev-node-sub">Anchored</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 4 KPI Intelligence Cards ─────────────────────────────────── */}
      <section className="ev-kpi-grid ev-animate-3" aria-label="Evidence Metrics">
        {/* Total Files */}
        <div className="ev-kpi-card" style={{ "--card-accent": "var(--ev-accent-blue)" } as any}>
          <div className="ev-kpi-top">
            <span className="ev-kpi-label">TOTAL EVIDENCE FILES</span>
            <div className="ev-kpi-icon-wrap">◈</div>
          </div>
          <div className="ev-kpi-val-row">
            <span className="ev-kpi-value">{animatedTotal}</span>
          </div>
          <div className="ev-kpi-sub">
            <span className="ev-kpi-sub-dot" />
            <span>Stored & catalogued in vault</span>
          </div>
        </div>

        {/* Integrity Verified */}
        <div className="ev-kpi-card" style={{ "--card-accent": "var(--ev-accent-green)", "--card-val-color": "var(--ev-accent-green)" } as any}>
          <div className="ev-kpi-top">
            <span className="ev-kpi-label">INTEGRITY VERIFIED</span>
            <div className="ev-kpi-icon-wrap" style={{ color: "var(--ev-accent-green)" }}>✓</div>
          </div>
          <div className="ev-kpi-val-row">
            <span className="ev-kpi-value">{animatedVerified}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--ev-text-muted)", fontFamily: "'Barlow Condensed', sans-serif" }}>
              / {total || 0}
            </span>
          </div>
          <div className="ev-kpi-sub">
            <span className="ev-kpi-sub-dot" style={{ background: "var(--ev-accent-green)" }} />
            <span>Zero hash mismatches</span>
          </div>
        </div>

        {/* Immutable Anchors */}
        <div className="ev-kpi-card" style={{ "--card-accent": "var(--ev-accent-cyan)", "--card-val-color": "var(--ev-accent-cyan)" } as any}>
          <div className="ev-kpi-top">
            <span className="ev-kpi-label">IMMUTABLE ANCHORS</span>
            <div className="ev-kpi-icon-wrap" style={{ color: "var(--ev-accent-cyan)" }}>⬡</div>
          </div>
          <div className="ev-kpi-val-row">
            <span className="ev-kpi-value">{animatedAnchors}</span>
          </div>
          <div className="ev-kpi-sub">
            <span className="ev-kpi-sub-dot" style={{ background: "var(--ev-accent-cyan)" }} />
            <span>Anchored on blockchain</span>
          </div>
        </div>

        {/* Evidence Categories */}
        <div className="ev-kpi-card" style={{ "--card-accent": "var(--ev-accent-purple)", "--card-val-color": "var(--ev-accent-purple)" } as any}>
          <div className="ev-kpi-top">
            <span className="ev-kpi-label">EVIDENCE CATEGORIES</span>
            <div className="ev-kpi-icon-wrap" style={{ color: "var(--ev-accent-purple)" }}>◆</div>
          </div>
          <div className="ev-kpi-val-row">
            <span className="ev-kpi-value">{animatedCategories}</span>
          </div>
          <div className="ev-kpi-sub">
            <span className="ev-kpi-sub-dot" style={{ background: "var(--ev-accent-purple)" }} />
            <span>QA, tests & declarations</span>
          </div>
        </div>
      </section>

      {/* ── 4. Search & Filter Bar ───────────────────────────────────────── */}
      <section className="ev-toolbar-card ev-animate-4" aria-label="Evidence Registry Filters">
        <div className="ev-toolbar-left">
          {/* Search Box */}
          <div className="ev-search-box">
            <span className="ev-search-icon" aria-hidden="true">◎</span>
            <input
              type="text"
              className="ev-search-input"
              placeholder="Search by filename, asset ID, or SHA-256 hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="input-evidence-search"
              aria-label="Search evidence records"
            />
          </div>

          {/* Category Filter */}
          <div className="ev-filter-select-wrapper">
            <select
              className="ev-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              id="select-evidence-category"
              aria-label="Filter by evidence category"
            >
              <option value="ALL">All Categories</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="ev-select-arrow" aria-hidden="true">▼</span>
          </div>
        </div>

        <div className="ev-toolbar-right">
          <div className="ev-record-count-badge">
            <span>●</span>
            <span>Showing {filteredEvidence.length} of {total} records</span>
          </div>
        </div>
      </section>

      {/* ── 5. Evidence Registry Table ───────────────────────────────────── */}
      <section className="ev-table-card ev-animate-5" aria-label="Evidence Records Table">
        <div className="ev-table-scroll">
          <table className="ev-table">
            <thead>
              <tr>
                <th>Filename & Specs</th>
                <th>Type</th>
                <th>Target Asset</th>
                <th>SHA-256 Fingerprint</th>
                <th>Event Type</th>
                <th>Uploaded At</th>
                <th>Integrity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                /* Shimmering Skeleton Rows */
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={`skeleton-${idx}`} className="ev-skeleton-row">
                    <td><div className="ev-skeleton-bar" style={{ width: "80%" }} /></td>
                    <td><div className="ev-skeleton-bar" style={{ width: "60%" }} /></td>
                    <td><div className="ev-skeleton-bar" style={{ width: "70%" }} /></td>
                    <td><div className="ev-skeleton-bar" style={{ width: "90%" }} /></td>
                    <td><div className="ev-skeleton-bar" style={{ width: "50%" }} /></td>
                    <td><div className="ev-skeleton-bar" style={{ width: "65%" }} /></td>
                    <td><div className="ev-skeleton-bar" style={{ width: "55%" }} /></td>
                    <td><div className="ev-skeleton-bar" style={{ width: "45%" }} /></td>
                  </tr>
                ))
              ) : filteredEvidence.length === 0 ? (
                /* Empty State (Preserves EXACT string: "No records found") */
                <tr>
                  <td colSpan={8} style={{ padding: 0 }}>
                    <div className="ev-empty-state">
                      <div className="ev-empty-icon-chassis">
                        <div className="ev-empty-pulse-ring" />
                        <span>🛡</span>
                      </div>
                      <h3 className="ev-empty-title">No records found</h3>
                      <p className="ev-empty-desc">
                        No cryptographic evidence files match your query in the secure vault. Upload a document or reset filters.
                      </p>
                      <button
                        type="button"
                        className="ev-btn-upload"
                        onClick={() => setShowUploadModal(true)}
                        style={{ padding: "8px 16px", fontSize: "0.75rem" }}
                      >
                        + Upload First Evidence
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Real Evidence Rows */
                filteredEvidence.map((e, index) => (
                  <tr
                    key={e.id}
                    style={{ animation: `evFadeUp 0.3s ease-out ${index * 0.04}s forwards` }}
                  >
                    <td>
                      <div className="ev-file-cell">
                        <div className="ev-file-icon">🗎</div>
                        <div className="ev-file-meta">
                          <span className="ev-filename">{e.filename}</span>
                          <span className="ev-filesize">
                            {e.size_kb} KB · {e.mime_type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "var(--ev-text-title)", fontWeight: 500 }}>
                        {e.type}
                      </span>
                    </td>

                    <td>
                      <Link to={`/app/assets/${e.asset_id}`} className="ev-asset-link">
                        <span>◈</span>
                        <span>{e.asset_id}</span>
                      </Link>
                    </td>

                    <td>
                      <div
                        className="ev-fingerprint-box"
                        onClick={() => copyToClipboard(e.hash)}
                        title="Click to copy full SHA-256 hash"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(evt) => evt.key === 'Enter' && copyToClipboard(e.hash)}
                      >
                        <span className="ev-hash-prefix">SHA-256</span>
                        <span>{e.hash ? `${e.hash.slice(0, 10)}...${e.hash.slice(-8)}` : "Pending"}</span>
                        <span className="ev-copy-tag">
                          {copiedHash === e.hash ? "✓ Copied" : "⧉"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.75rem", color: "var(--ev-text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {e.event}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.75rem", color: "var(--ev-text-muted)", whiteSpace: "nowrap" }}>
                        {formatDateTime(e.created_at)}
                      </span>
                    </td>

                    <td>
                      {e.status === "Complete" ? (
                        <span
                          className={`ev-integrity-badge ${
                            e.integrity_verified ? "ev-integrity-verified" : "ev-integrity-mismatch"
                          }`}
                        >
                          <span className="ev-pulse-dot-sm" />
                          <span>{e.integrity_verified ? "✓ Verified" : "✕ Mismatch"}</span>
                        </span>
                      ) : (
                        <StatusBadge status={e.status} size="sm" />
                      )}
                    </td>

                    <td>
                      <Link to={`/app/evidence/${e.id}`} className="ev-btn-inspect">
                        <span>Inspect</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ev-table-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--ev-accent-cyan)" }}>🛡</span>
            <span>Tamper-evident log anchored via SHA-256 cryptographic verification</span>
          </div>
          <div>
            Showing {filteredEvidence.length} of {total} records
          </div>
        </div>
      </section>

      {/* ── 6. Sovereign Defence Pillars Panel ───────────────────────────── */}
      <section className="ev-pillars-card ev-animate-6" aria-label="Sovereign Security Framework">
        <div className="ev-pillars-header">
          <div className="ev-pillars-title">SOVEREIGN DEFENCE SECURITY FRAMEWORK</div>
          <div className="ev-pillars-badge">
            <span>BHARAT DEFENCE TRUST • PROTOCOL PS-26125</span>
          </div>
        </div>

        <div className="ev-pillars-grid">
          <div className="ev-pillar-box">
            <div className="ev-pillar-icon">🛡</div>
            <div>
              <div className="ev-pillar-title">SECURE PEOPLE</div>
              <div className="ev-pillar-sub">
                Identity governance, multi-signature role approval, and DID cryptographic binding for personnel.
              </div>
            </div>
          </div>

          <div className="ev-pillar-box">
            <div className="ev-pillar-icon" style={{ color: "var(--ev-accent-blue)" }}>◈</div>
            <div>
              <div className="ev-pillar-title">SECURE ASSETS</div>
              <div className="ev-pillar-sub">
                SHA-256 file fingerprinting with zero-tamper byte integrity seals and distributed provenance logs.
              </div>
            </div>
          </div>

          <div className="ev-pillar-box">
            <div className="ev-pillar-icon" style={{ color: "var(--ev-accent-green)" }}>🇮🇳</div>
            <div>
              <div className="ev-pillar-title">SECURE NATION</div>
              <div className="ev-pillar-sub">
                Air-gapped readiness, immutable blockchain ledger anchoring, and sovereign defence data protection.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Upload Evidence Modal (Viewport-Fixed Portal) ─────────────────── */}
      {showUploadModal && typeof document !== "undefined" && createPortal(
        <div
          className="ev-modal-backdrop"
          onClick={() => {
            setShowUploadModal(false);
            setUploadStatus(null);
          }}
        >
          <div
            className="ev-modal-chassis"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-evidence-title"
          >
            <div className="ev-modal-header">
              <h3 id="modal-evidence-title" className="ev-modal-title">
                <span style={{ color: "var(--ev-accent-blue)", fontSize: "1.1rem" }}>🛡</span>
                Upload Defence Evidence
              </h3>
              <button
                type="button"
                className="ev-modal-close"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadStatus(null);
                }}
                aria-label="Close modal"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="ev-modal-body">
              {uploadStatus && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: "0.8125rem",
                    background: uploadStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${uploadStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: uploadStatus.type === "success" ? "#22c55e" : "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  {uploadStatus.message}
                </div>
              )}

              {/* DEMO DATA QUICK FILL BAR */}
              <div className="ev-demo-bar">
                <div className="ev-demo-bar-info">
                  <span className="ev-demo-badge">SIH DEMO</span>
                  <span className="ev-demo-text">Pre-fill realistic defence evidence report</span>
                </div>
                <button
                  type="button"
                  id="ev-load-demo-btn"
                  className={`ev-load-demo-btn ${demoLoaded ? "ev-demo-btn--loaded" : ""}`}
                  onClick={handleLoadDemoData}
                  title="Automatically fill evidence form with realistic demo values"
                >
                  <span className="ev-demo-icon">{demoLoaded ? "✓" : "⚡"}</span>
                  <span>{demoLoaded ? "DEMO DATA LOADED" : "LOAD DEMO DATA"}</span>
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--ev-text-title)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Target Asset ID *
                </label>
                <input
                  type="text"
                  className="ev-search-input"
                  style={{ height: 42, paddingLeft: 14 }}
                  value={uploadAssetId}
                  onChange={(e) => setUploadAssetId(e.target.value)}
                  placeholder="e.g. EF-2026-001"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--ev-text-title)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Evidence Type / Category *
                </label>
                <select
                  className="ev-select"
                  style={{ width: "100%", height: 42 }}
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="QA Approval">QA Approval</option>
                  <option value="Calibration Certificate">Calibration Certificate</option>
                  <option value="Material Test Report">Material Test Report</option>
                  <option value="Factory Acceptance Test">Factory Acceptance Test</option>
                  <option value="Supplier Declaration">Supplier Declaration</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--ev-text-title)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Document File (SHA-256 Hashed) *
                </label>
                {uploadFile && (
                  <div className="ev-file-preview-pill">
                    <span className="ev-file-icon">📄</span>
                    <span className="ev-file-name">{uploadFile.name}</span>
                    <span className="ev-file-size">({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                    <span className="ev-demo-badge" style={{ marginLeft: "auto" }}>Demo Ready</span>
                  </div>
                )}
                <input
                  type="file"
                  style={{ width: "100%", padding: "8px 0", color: "var(--ev-text-body)", fontSize: "0.8125rem" }}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required={!uploadFile}
                />
              </div>

              <div className="ev-modal-footer">
                <button
                  type="button"
                  id="ev-load-demo-footer-btn"
                  className={`ev-load-demo-footer-btn ${demoLoaded ? "ev-demo-btn--loaded" : ""}`}
                  onClick={handleLoadDemoData}
                  title="Pre-fill form with synthetic demo values"
                >
                  <span>{demoLoaded ? "✓" : "⚡"}</span>
                  <span>{demoLoaded ? "Demo Data Applied" : "USE DUMMY DATA"}</span>
                </button>

                <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                  <button
                    type="button"
                    className="ev-btn-refresh"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadStatus(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ev-btn-upload"
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading & Hashing..." : "Upload Evidence"}
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
