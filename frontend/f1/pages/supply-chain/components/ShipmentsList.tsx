import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supplyChainService, ShipmentResponse, FacilityResponse } from "../../../services/supply-chain";
import StatusBadge from "../../../components/ui/StatusBadge";

const overlay: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  background: "rgba(3,7,18,0.85)", backdropFilter: "blur(6px)",
  zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const modal: React.CSSProperties = {
  background: "var(--card, #171717)", border: "1px solid var(--border, #2a2a2a)", borderRadius: 12,
  width: "100%", maxWidth: 520, maxHeight: "88vh",
  display: "flex", flexDirection: "column", overflow: "hidden",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "var(--input-bg, #171717)",
  border: "1px solid var(--input-border, #303030)", borderRadius: 6,
  color: "var(--foreground, #f5f5f5)", fontSize: "0.8125rem", outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: "0.72rem", fontWeight: 700,
  color: "var(--muted, #a3a3a3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em",
};

export default function ShipmentsList() {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [originId, setOriginId] = useState("");
  const [destId, setDestId] = useState("");
  const [tracking, setTracking] = useState("");

  useEffect(() => { load(); loadFacilities(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const d = await supplyChainService.listShipments();
      setShipments((d as any).items || (d as any) || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadFacilities = async () => {
    try {
      const d = await supplyChainService.listFacilities();
      const list: FacilityResponse[] = (d as any).items || (d as any) || [];
      setFacilities(list);
      if (list.length > 0) setOriginId(list[0].id); // Use database ID
      if (list.length > 1) setDestId(list[1].id); // Use database ID
    } catch (e) { console.error(e); }
  };

  const openModal = () => {
    setOriginId(facilities[0]?.id || ""); setDestId(facilities[1]?.id || "");
    setTracking(`TRK-${Date.now().toString(36).toUpperCase()}`);
    setStatus(null); setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originId) { setStatus({ type: "error", msg: "Please select an origin facility." }); return; }
    if (!destId) { setStatus({ type: "error", msg: "Please select a destination facility." }); return; }
    if (originId === destId) { setStatus({ type: "error", msg: "Origin and destination must be different." }); return; }
    setIsSubmitting(true); setStatus(null);
    try {
      await supplyChainService.createShipment({
        shipmentId: `SHP-${Date.now().toString(36).toUpperCase()}`,
        dispatchFacilityId: originId, // Use database ID
        receiveFacilityId: destId, // Use database ID
        trackingNumber: tracking.trim() || undefined,
      });
      setStatus({ type: "success", msg: "Shipment created successfully!" });
      await load();
      setTimeout(() => { setShowModal(false); setStatus(null); }, 1400);
    } catch (err: any) {
      setStatus({ type: "error", msg: err?.data?.message || err?.message || "Failed to create shipment." });
    } finally { setIsSubmitting(false); }
  };

  const handleDispatch = async (id: string) => {
    try {
      await supplyChainService.dispatchShipment(id);
      await load();
    } catch (err: any) {
      console.error("Failed to dispatch shipment:", err);
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await supplyChainService.receiveShipment(id);
      await load();
    } catch (err: any) {
      console.error("Failed to receive shipment:", err);
    }
  };

  const filtered = shipments.filter(s =>
    !search ||
    (s.shipment_id || "").toLowerCase().includes(search.toLowerCase()) ||
    ((s as any).shipmentId || "").toLowerCase().includes(search.toLowerCase()) ||
    ((s as any).dispatchFacility?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    ((s as any).receiveFacility?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const destFacilities = facilities.filter(f => f.id !== originId);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div className="sc-search-wrapper">
          <span className="sc-search-icon">🔍</span>
          <input
            type="text"
            className="sc-search-input"
            placeholder="Filter by shipment ID, lot, or destination…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="sc-action-btn" onClick={openModal}>
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
          <span>Dispatch Shipment</span>
        </button>
      </div>

      <div className="sc-table-wrapper internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Shipment ID", "Lot", "Origin", "Destination / Transit Route", "Tracking", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>Loading shipments…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>No shipments found. Click <strong>+ Dispatch Shipment</strong> to create one.</td></tr>
            ) : filtered.map((s, idx) => {
              const originName = s.origin_facility?.name || (s as any).dispatchFacility?.name || "Origin Site";
              const destName = s.destination_facility?.name || (s as any).receiveFacility?.name || "Destination Site";
              return (
                <tr
                  key={s.id}
                  className="interactive-row sc-table-row"
                  style={{ animationDelay: `${Math.min(idx, 12) * 45}ms` }}
                >
                  <td style={{ padding: "12px 14px" }}><span style={{ color: "#f59e0b", fontWeight: 600 }}>{s.shipment_id || (s as any).shipmentId || s.id}</span></td>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>{s.lot?.lot_id || (s as any).lotId || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--muted)" }}>{originName}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8rem" }}>
                    <div className="sc-shipment-track">
                      <span style={{ color: "var(--muted)" }}>{originName}</span>
                      <span className="sc-shipment-arrow">→</span>
                      <span style={{ fontWeight: 600 }}>{destName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "var(--muted)" }}>{s.tracking_number || (s as any).trackingNumber || "—"}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={(s as any).status || "PENDING"} size="sm" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && createPortal(
        <div className="sc-modal-overlay" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="sc-modal-box" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sc-modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid #1e3a60", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#0a1727" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>Dispatch Shipment</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" }}>Create a custody transfer between registered facilities.</p>
              </div>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem", padding: "4px 8px" }}>✕</button>
            </div>
            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {status && (
                <div style={{
                  marginBottom: 16, padding: "10px 14px", borderRadius: 6, fontSize: "0.8125rem",
                  background: status.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${status.type === "success" ? "#22c55e" : "#ef4444"}`,
                  color: status.type === "success" ? "#4ade80" : "#f87171"
                }}>
                  {status.type === "success" ? "✓ " : "⚠ "}{status.msg}
                </div>
              )}
              {facilities.length < 2 && (
                <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 6, fontSize: "0.8125rem", background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b", color: "#fbbf24" }}>
                  ⚠ At least 2 facilities required. Please add facilities first.
                </div>
              )}
              <form id="dispatch-shipment-form" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lbl}>Origin Facility <span style={{ color: "#ef4444" }}>*</span></label>
                  <select style={{ ...inp, cursor: "pointer" }} value={originId} onChange={e => { setOriginId(e.target.value); setDestId(""); }} required>
                    <option value="">— Select origin —</option>
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name} [{f.facility_id || (f as any).facilityId}]</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Destination Facility <span style={{ color: "#ef4444" }}>*</span></label>
                  <select style={{ ...inp, cursor: "pointer" }} value={destId} onChange={e => setDestId(e.target.value)} required>
                    <option value="">— Select destination —</option>
                    {destFacilities.map(f => <option key={f.id} value={f.id}>{f.name} [{f.facility_id || (f as any).facilityId}]</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Tracking Number</label>
                  <input style={inp} type="text" placeholder="Auto-generated" value={tracking} onChange={e => setTracking(e.target.value)} />
                </div>
              </form>
            </div>
            {/* Footer */}
            <div className="sc-modal-footer" style={{ padding: "14px 24px", borderTop: "1px solid #1e3a60", background: "#0a1727", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
                style={{ padding: "8px 18px", borderRadius: 6, border: "1px solid #1e3a60", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "0.875rem" }}>Cancel</button>
              <button type="submit" form="dispatch-shipment-form" className="btn-primary" disabled={isSubmitting || facilities.length < 2}
                style={{ padding: "8px 22px", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Dispatching…" : "Dispatch Shipment"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
