import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supplyChainService, FacilityResponse, SupplierResponse } from "../../../services/supply-chain";
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

export default function FacilitiesList() {
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("Manufacturing");
  const [location, setLocation] = useState("");
  const [supplierId, setSupplierId] = useState("");

  useEffect(() => { load(); loadSuppliers(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const d = await supplyChainService.listFacilities();
      setFacilities((d as any).items || (d as any) || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadSuppliers = async () => {
    try {
      const d = await supplyChainService.listSuppliers();
      const list: SupplierResponse[] = (d as any).items || (d as any) || [];
      setSuppliers(list);
      if (list.length) setSupplierId(list[0].id); // Use database ID
    } catch (e) { console.error(e); }
  };

  const openModal = () => {
    setName(""); setType("Manufacturing"); setLocation("");
    setSupplierId(suppliers[0]?.id || "");
    setStatus(null); setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setStatus({ type: "error", msg: "Facility name is required." }); return; }
    if (!supplierId) { setStatus({ type: "error", msg: "Please select a managing supplier." }); return; }
    setIsSubmitting(true); setStatus(null);
    try {
      await supplyChainService.createFacility({
        facilityId: `FAC-${Date.now().toString(36).toUpperCase()}`,
        name: name.trim(), supplierId, type, location: location.trim() || undefined,
      });
      setStatus({ type: "success", msg: `Facility "${name.trim()}" registered!` });
      await load();
      setTimeout(() => { setShowModal(false); setStatus(null); }, 1400);
    } catch (err: any) {
      setStatus({ type: "error", msg: err?.data?.message || err?.message || "Failed to register facility." });
    } finally { setIsSubmitting(false); }
  };

  const filtered = facilities.filter(f =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    (f.facility_id || "").toLowerCase().includes(search.toLowerCase()) ||
    ((f as any).facilityId || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.location || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div className="sc-search-wrapper">
          <span className="sc-search-icon">🔍</span>
          <input
            type="text"
            className="sc-search-input"
            placeholder="Filter by name, ID, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="sc-action-btn" onClick={openModal}>
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
          <span>Add Facility</span>
        </button>
      </div>

      <div className="sc-table-wrapper internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Facility ID", "Facility Name", "Managing Supplier", "Location", "Type", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>Loading facilities…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>No facilities found. Click <strong>+ Add Facility</strong> to register one.</td></tr>
            ) : filtered.map((f, idx) => (
              <tr
                key={f.id}
                className="interactive-row sc-table-row"
                style={{ animationDelay: `${Math.min(idx, 12) * 45}ms` }}
              >
                <td style={{ padding: "12px 14px" }}><span style={{ color: "#06b6d4", fontWeight: 600 }}>{f.facility_id || (f as any).facilityId || f.id}</span></td>
                <td style={{ padding: "12px 14px", fontWeight: 600 }}>{f.name}</td>
                <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--muted)" }}>{f.supplier?.name || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: "0.8rem" }}>
                  <span className="sc-facility-radar-tag">
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#06b6d4" }} />
                    {f.location || "Secure Site"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "var(--muted)" }}>{f.type || "Manufacturing"}</td>
                <td style={{ padding: "12px 14px" }}><StatusBadge status={(f as any).status || "OPERATIONAL"} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && createPortal(
        <div className="sc-modal-overlay" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="sc-modal-box" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sc-modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid #1e3a60", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#0a1727" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>Register New Facility</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" }}>Associate a production or testing facility with a registered supplier.</p>
              </div>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem", padding: "4px 8px" }}>✕</button>
            </div>
            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {status && (
                <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, fontSize: "0.8125rem",
                  background: status.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${status.type === "success" ? "#22c55e" : "#ef4444"}`,
                  color: status.type === "success" ? "#4ade80" : "#f87171" }}>
                  {status.type === "success" ? "✓ " : "⚠ "}{status.msg}
                </div>
              )}
              <form id="add-facility-form" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lbl}>Facility Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input style={inp} type="text" required placeholder="e.g. Radar Assembly Plant — Hyderabad" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Managing Supplier <span style={{ color: "#ef4444" }}>*</span></label>
                  <select style={{ ...inp, cursor: "pointer" }} value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                    <option value="">— Select supplier —</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.supplier_id || (s as any).supplierId})</option>)}
                  </select>
                  {suppliers.length === 0 && <p style={{ margin: "4px 0 0", fontSize: "0.73rem", color: "#f59e0b" }}>⚠ Add a supplier first.</p>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Facility Type</label>
                    <select style={{ ...inp, cursor: "pointer" }} value={type} onChange={e => setType(e.target.value)}>
                      {["Manufacturing", "Testing", "Warehouse", "Depot", "Research", "Maintenance", "Assembly"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Geo Location</label>
                    <input style={inp} type="text" placeholder="e.g. Hyderabad, Telangana" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                </div>
              </form>
            </div>
            {/* Footer */}
            <div className="sc-modal-footer" style={{ padding: "14px 24px", borderTop: "1px solid #1e3a60", background: "#0a1727", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
                style={{ padding: "8px 18px", borderRadius: 6, border: "1px solid #1e3a60", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "0.875rem" }}>Cancel</button>
              <button type="submit" form="add-facility-form" className="btn-primary" disabled={isSubmitting || suppliers.length === 0}
                style={{ padding: "8px 22px", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Registering…" : "Register Facility"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
