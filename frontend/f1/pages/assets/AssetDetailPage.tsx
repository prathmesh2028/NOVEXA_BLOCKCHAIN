import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import LifecycleStepper from "../../components/ui/LifecycleStepper";
import AuditTimeline from "../../components/ui/AuditTimeline";
import VerificationPanel from "../../components/ui/VerificationPanel";
import { formatDateTime, shortHash } from "../../data/utils";
import { assetService } from "../../services/assets";
import { api } from "../../services/api";

const TABS = ["Overview", "Technical", "Evidence", "Lifecycle", "Certification", "Blockchain", "Audit Trail"];

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const [backendAsset, setBackendAsset] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  
  const [evidence, setEvidence] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [certification, setCertification] = useState<any>(null);
  const [blockchainTxs, setBlockchainTxs] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    assetService.getAsset(id)
      .then(res => setBackendAsset(res))
      .catch(err => console.warn("Could not fetch asset from backend:", err));

    api.get<any>(`/assets/${id}/qr`)
      .then(res => setQrData(res))
      .catch(err => console.warn("Could not fetch QR code:", err));
      
    api.get<any>(`/evidence?asset_id=${id}`)
      .then(res => setEvidence(res.items || []))
      .catch(err => { console.warn('Evidence fetch failed', err); setEvidence([]); });

    api.get<any>(`/audit/events?resource_id=${id}`)
      .then(res => setAuditEvents(res.items || []))
      .catch(err => { console.warn('Audit fetch failed', err); setAuditEvents([]); });

    api.get<any>(`/certifications?asset_id=${id}`)
      .then(res => setCertification(res.items?.[0] || null))
      .catch(err => { console.warn('Cert fetch failed', err); setCertification(null); });

    api.get<any>(`/blockchain/transactions?asset_id=${id}`)
      .then(res => setBlockchainTxs(res.items || []))
      .catch(err => { console.warn('Blockchain fetch failed', err); setBlockchainTxs([]); });
  }, [id]);

  const asset = backendAsset ? {
    id: backendAsset.asset_id || backendAsset.id,
    batchId: backendAsset.batch_id,
    type: backendAsset.type,
    model: backendAsset.model,
    serialNumber: backendAsset.serial_number,
    supplier: backendAsset.supplier,
    lifecycle: backendAsset.lifecycle_state,
    verification: backendAsset.verification_status,
    evidenceCount: backendAsset.evidence_count ?? 0,
    certId: backendAsset.cert_id,
    certStatus: backendAsset.cert_status,
    registeredBy: backendAsset.registered_by_name,
    registeredAt: backendAsset.created_at,
    updatedAt: backendAsset.updated_at,
    description: backendAsset.description,
  } : null;

  if (!asset) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "2rem", marginBottom: 16, opacity: 0.3 }}>◈</div>
        <h2 className="font-display" style={{ color: "#e2e8f0", marginBottom: 8 }}>ASSET NOT FOUND</h2>
        <p style={{ color: "#64748b", marginBottom: 20 }}>No asset record for ID: {id}</p>
        <Link to="/app/assets" className="btn-secondary">← Back to Assets</Link>
      </div>
    );
  }

  const verItems = [
    { label: "Identity & Supplier", status: (asset.verification === "VERIFIED" ? "VERIFIED" : "PENDING") as any, detail: "Supplier declaration on file" },
    { label: "Evidence Integrity", status: (asset.verification === "VERIFIED" ? "VERIFIED" : asset.verification === "FAILED" ? "FAILED" : "REVIEW") as any, detail: evidence.some((e) => !e.integrityVerified) ? "Fingerprint mismatch detected" : `${evidence.filter((e) => e.integrityVerified).length} / ${evidence.length} files verified` },
    { label: "Lifecycle Sequence", status: (asset.lifecycle === "REJECTED_QUARANTINED" ? "FAILED" : asset.verification === "VERIFIED" ? "VERIFIED" : "PENDING") as any, detail: `Current state: ${asset.lifecycle}` },
    { label: "Certification Status", status: (asset.certStatus === "CONFIRMED" ? "VERIFIED" : asset.certStatus === "PENDING" ? "PENDING" : "UNAVAILABLE") as any, detail: asset.certId ? `Token: TKN-${asset.certId?.replace("CERT-2026-", "")}` : "Not certified" },
    { label: "Blockchain Record", status: (blockchainTxs.some((t) => t.status === "CONFIRMED") ? "VERIFIED" : blockchainTxs.length > 0 ? "PENDING" : "UNAVAILABLE") as any, detail: blockchainTxs.length > 0 ? `${blockchainTxs.filter((t) => t.status === "CONFIRMED").length} confirmed transactions` : "No on-chain records" },
  ];

  return (
    <div className="page-fade">
      <PageHeader
        title={asset.id}
        subtitle={`${asset.type} · ${asset.batchId}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Assets", to: "/app/assets" },
          { label: asset.id },
        ]}
        badge={<StatusBadge status={asset.lifecycle} />}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <StatusBadge status={asset.verification} />
            <Link to="/app/assets" className="btn-ghost" style={{ fontSize: "0.75rem" }}>← Back</Link>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1e3a60", marginBottom: 24, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn${activeTab === tab ? " active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {activeTab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>ASSET IDENTITY</div>
              {[
                { label: "Asset ID", value: asset.id, mono: true },
                { label: "Batch ID", value: asset.batchId, mono: true },
                { label: "Type", value: asset.type },
                { label: "Model", value: asset.model },
                { label: "Serial Number", value: asset.serialNumber, mono: true },
                { label: "Supplier", value: asset.supplier },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a" }}>
                  <span style={{ fontSize: "0.6875rem", color: "#475569", width: 110, flexShrink: 0, paddingTop: 1 }}>{row.label}</span>
                  {row.mono ? (
                    <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span>
                  ) : (
                    <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>RECORD HISTORY</div>
              {[
                { label: "Registered by", value: asset.registeredBy },
                { label: "Registered at", value: formatDateTime(asset.registeredAt) },
                { label: "Last updated", value: formatDateTime(asset.updatedAt) },
                { label: "Evidence count", value: `${asset.evidenceCount} files` },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a" }}>
                  <span style={{ fontSize: "0.6875rem", color: "#475569", width: 110, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {qrData?.qr_data_url && (
              <div className="panel" style={{ padding: 16, marginTop: 16, display: "flex", alignItems: "center", gap: 16 }}>
                <img
                  src={qrData.qr_data_url}
                  alt={`QR for ${asset.id}`}
                  style={{ width: 90, height: 90, borderRadius: 4, border: "1px solid #1e3a60", background: "#fff", padding: 2 }}
                />
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>PHYSICAL VERIFICATION QR</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Scan with mobile or inspection terminal to verify on-chain integrity.</div>
                  <a
                    href={qrData.verification_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "0.6875rem", color: "#3b82f6", display: "inline-block", marginTop: 4 }}
                  >
                    Open verification link ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>VERIFICATION STATUS</div>
              <VerificationPanel items={verItems} overall={asset.verification === "VERIFIED" ? "VERIFIED" : asset.verification === "FAILED" ? "FAILED" : asset.verification === "REVIEW_REQUIRED" ? "REVIEW" : "UNAVAILABLE"} assetId={asset.id} />
            </div>
            <div style={{ padding: "12px 16px", background: "#0c1828", border: "1px solid #152b4a", borderRadius: "5px", fontSize: "0.75rem", color: "#475569" }}>
              <strong style={{ color: "#64748b", display: "block", marginBottom: 4 }}>Synthetic Demonstration Record</strong>
              {asset.description}
            </div>
          </div>
        </div>
      )}

      {/* Technical tab */}
      {activeTab === "Technical" && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>TECHNICAL SPECIFICATIONS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { group: "Identification", fields: [{ k: "Asset ID", v: asset.id }, { k: "Model Number", v: asset.model }, { k: "Serial Number", v: asset.serialNumber }, { k: "Batch Reference", v: asset.batchId }] },
              { group: "Classification", fields: [{ k: "Asset Type", v: asset.type }, { k: "Supplier", v: asset.supplier }, { k: "Lifecycle State", v: asset.lifecycle }, { k: "Certification State", v: asset.certStatus }] },
            ].map((grp) => (
              <div key={grp.group}>
                <div className="section-label" style={{ marginBottom: 10 }}>{grp.group}</div>
                {grp.fields.map((f) => (
                  <div key={f.k} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #152b4a" }}>
                    <span style={{ fontSize: "0.75rem", color: "#475569", width: 130, flexShrink: 0 }}>{f.k}</span>
                    <span className="meta-id" style={{ color: "#94a3b8" }}>{f.v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: "14px", background: "#070f1d", borderRadius: "5px", border: "1px solid #152b4a" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>DESCRIPTION</div>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{asset.description}</p>
          </div>
        </div>
      )}

      {/* Evidence tab */}
      {activeTab === "Evidence" && (
        <div>
          {evidence.length === 0 ? (
            <div className="panel" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", opacity: 0.3, marginBottom: 8 }}>◫</div>
              <div style={{ color: "#475569" }}>No evidence records linked to this asset</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {evidence.map((e) => (
                <div key={e.id} className="panel" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: "1rem", opacity: 0.7 }}>◫</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0" }}>{e.filename}</span>
                        <StatusBadge status={e.status} size="sm" />
                        {e.integrityVerified && (
                          <span style={{ fontSize: "0.6875rem", color: "#22c55e", fontWeight: 600 }}>✓ Fingerprint Matched</span>
                        )}
                        {!e.integrityVerified && e.status !== "Processing" && (
                          <span style={{ fontSize: "0.6875rem", color: "#ef4444", fontWeight: 600 }}>✕ Fingerprint Mismatch</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div>
                          <span className="section-label">Type</span>
                          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{e.type}</div>
                        </div>
                        <div>
                          <span className="section-label">Uploaded by</span>
                          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{e.uploadedBy} · {e.uploadedByRole}</div>
                        </div>
                        <div>
                          <span className="section-label">Date</span>
                          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{formatDateTime(e.uploadedAt)}</div>
                        </div>
                        <div>
                          <span className="section-label">Size</span>
                          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{e.sizeKb} KB</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <span className="section-label">Evidence Fingerprint (SHA-256)</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                          <span className="meta-id">{e.hash}</span>
                          <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Used to detect changes to this file later</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <Link to={`/app/evidence/${e.id}`} className="btn-secondary" style={{ fontSize: "0.75rem" }}>
                        View Detail →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lifecycle tab */}
      {activeTab === "Lifecycle" && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>LIFECYCLE TIMELINE</div>
          <LifecycleStepper current={asset.lifecycle} />
          <div style={{ marginTop: 24, padding: "14px 16px", background: "#070f1d", borderRadius: "5px", border: "1px solid #152b4a" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>CURRENT STATE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge status={asset.lifecycle} />
              <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>Last updated {formatDateTime(asset.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Certification tab */}
      {activeTab === "Certification" && (
        <div>
          {!certification ? (
            <div className="panel" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", opacity: 0.3, marginBottom: 8 }}>◆</div>
              <div style={{ color: "#94a3b8", marginBottom: 4 }}>No certification record for this asset</div>
              <div style={{ fontSize: "0.8125rem", color: "#475569" }}>Current status: {asset.certStatus}</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="panel" style={{ padding: 20 }}>
                <div className="section-label" style={{ marginBottom: 14 }}>CERTIFICATION RECORD</div>
                {[
                  { label: "Certification ID", value: certification.id, mono: true },
                  { label: "Token ID", value: certification.tokenId, mono: true },
                  { label: "Status", value: <StatusBadge status={certification.status} size="sm" /> },
                  { label: "Issued by", value: certification.issuedBy },
                  { label: "Issuer DID", value: certification.issuedByDid, mono: true },
                  { label: "Issued at", value: formatDateTime(certification.issuedAt) },
                  { label: "Confirmed at", value: certification.confirmedAt ? formatDateTime(certification.confirmedAt) : "—" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a", alignItems: "center" }}>
                    <span style={{ fontSize: "0.6875rem", color: "#475569", width: 110, flexShrink: 0 }}>{row.label}</span>
                    {typeof row.value === "string" ? (
                      row.mono ? <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span> : <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
                    ) : row.value}
                  </div>
                ))}
              </div>
              <div>
                <div
                  style={{
                    padding: "20px",
                    background: "rgba(139,92,246,0.06)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "6px",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ color: "#8b5cf6", fontSize: "1rem" }}>⊠</span>
                    <span className="font-display" style={{ fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.06em", fontSize: "0.9rem" }}>
                      NON-TRANSFERABLE CERTIFICATION
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                    This digital certification represents the recorded certification state of this asset/batch.
                    It is a state record, not a physical ownership record. Transfer is locked.
                  </p>
                </div>
                <Link to={`/app/certifications/${certification.id}`} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  View Full Certification →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blockchain tab */}
      {activeTab === "Blockchain" && (
        <div>
          {blockchainTxs.length === 0 ? (
            <div className="panel" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", opacity: 0.3, marginBottom: 8 }}>⬡</div>
              <div style={{ color: "#475569" }}>No blockchain transactions for this asset</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {blockchainTxs.map((tx) => (
                <div key={tx.hash} className="panel" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div>
                      <div className="font-display" style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em", marginBottom: 4 }}>
                        {tx.action}
                      </div>
                      <span className="meta-id">{shortHash(tx.hash, 10)}</span>
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                    {[
                      { label: "Network", value: tx.network },
                      { label: "Block", value: tx.blockNumber > 0 ? tx.blockNumber.toLocaleString() : "Pending" },
                      { label: "Confirmations", value: tx.confirmations.toString() },
                      { label: "Gas Used", value: tx.gasUsed > 0 ? tx.gasUsed.toLocaleString() : "—" },
                    ].map((f) => (
                      <div key={f.label}>
                        <div className="section-label" style={{ marginBottom: 2 }}>{f.label}</div>
                        <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Trail tab */}
      {activeTab === "Audit Trail" && (
        <div>
          <div className="section-label" style={{ marginBottom: 16 }}>AUDIT TRAIL FOR {asset.id}</div>
          {auditEvents.length === 0 ? (
            <div className="panel" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ color: "#475569" }}>No audit events for this asset</div>
            </div>
          ) : (
            <AuditTimeline events={auditEvents} />
          )}
        </div>
      )}
    </div>
  );
}
