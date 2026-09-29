import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { supplyChainService, LotResponse, SupplierResponse } from "../../../services/supply-chain";
import StatusBadge from "../../../components/ui/StatusBadge";
import { useAuth, normalizeRole } from "../../../context/AuthContext";

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

export default function LotsList() {
  const { role, user } = useAuth();

  const isApproverRole = useMemo(() => {
    const normalized = normalizeRole(role);
    if (normalized === "system-admin" || normalized === "quality-inspector") {
      return true;
    }
    const userRoles = (user?.roles || []).map((r) =>
      r.toLowerCase().replaceAll("_", "-").trim()
    );
    return userRoles.some(
      (r) =>
        r === "system-admin" ||
        r === "admin" ||
        r === "administrator" ||
        r === "quality-inspector" ||
        r === "inspector" ||
        r === "tech" ||
        r === "technician"
    );
  }, [role, user]);

  const [approvalStatus, setApprovalStatus] = useState<Record<string, "approved" | "disapproved">>({});

  const handleApprove = (id: string) => {
    setApprovalStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "approved" ? ("" as any) : "approved",
    }));
  };

  const handleDisapprove = (id: string) => {
    setApprovalStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "disapproved" ? ("" as any) : "disapproved",
    }));
  };

  const [lots, setLots] = useState<LotResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [materialType, setMaterialType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [supplierId, setSupplierId] = useState("");
  const [batchRef, setBatchRef] = useState("");
  const [mfgDate, setMfgDate] = useState("");

  useEffect(() => { load(); loadSuppliers(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const d = await supplyChainService.listLots();
      setLots((d as any).items || (d as any) || []);
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
    setMaterialType(""); setQuantity("1");
    setSupplierId(suppliers[0]?.id || "");
    setBatchRef(`BATCH-${Date.now().toString(36).toUpperCase()}`);
    setMfgDate(new Date().toISOString().split("T")[0]);
    setStatus(null); setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialType.trim()) { setStatus({ type: "error", msg: "Material type is required." }); return; }
    if (!supplierId) { setStatus({ type: "error", msg: "Please select the originating supplier." }); return; }
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) { setStatus({ type: "error", msg: "Quantity must be a positive number." }); return; }
    setIsSubmitting(true); setStatus(null);
    try {
      await supplyChainService.createLot({
        lotId: `LOT-${Date.now().toString(36).toUpperCase()}`,
        supplierId: supplierId, // Use database ID
        batchId: batchRef.trim() || undefined,
        description: materialType.trim(),
        quantity: qty, unit: "units",
        manufacturedDate: mfgDate || undefined,
      });
      setStatus({ type: "success", msg: `Lot for "${materialType.trim()}" created!` });
      await load();
      setTimeout(() => { setShowModal(false); setStatus(null); }, 1400);
    } catch (err: any) {
      setStatus({ type: "error", msg: err?.data?.message || err?.message || "Failed to create material lot." });
    } finally { setIsSubmitting(false); }
  };

  const filtered = lots.filter(l =>
    !search ||
    (l.lot_id || "").toLowerCase().includes(search.toLowerCase()) ||
    ((l as any).lotId || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.batch_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.supplier?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div className="sc-search-wrapper">
          <span className="sc-search-icon">🔍</span>
          <input
            type="text"
            className="sc-search-input"
            placeholder="Filter by lot ID, batch, or facility…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="sc-action-btn" onClick={openModal}>
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
          <span>Create Material Lot</span>
        </button>
      </div>

      <div className="sc-table-wrapper internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Lot ID", "Batch Reference", "Material / Type", "Supplier", "Qty", "Mfg Date", "Status", ...(isApproverRole ? ["Actions"] : [])].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.6875rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isApproverRole ? 8 : 7} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>Loading lots…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={isApproverRole ? 8 : 7} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>No lots found. Click <strong>+ Create Material Lot</strong> to add one.</td></tr>
            ) : filtered.map((l, idx) => (
              <tr
                key={l.id}
                className="interactive-row sc-table-row"
                style={{ animationDelay: `${Math.min(idx, 12) * 45}ms` }}
              >
                <td style={{ padding: "12px 14px" }}><span style={{ color: "#8b5cf6", fontWeight: 600 }}>{l.lot_id || (l as any).lotId || l.id}</span></td>
                <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                  <span className="sc-lot-hash-tag">
                    <span>◫</span>
                    <span>{l.batch_id || (l as any).batchId || "—"}</span>
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--muted)" }}>{l.description || (l as any).materialType || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--muted)" }}>{l.supplier?.name || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: "0.85rem", fontWeight: 500 }}>{l.quantity ?? 0} {l.unit || "units"}</td>
                <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "var(--muted)" }}>{l.manufactured_date || (l as any).manufacturedAt?.split?.("T")[0] || "—"}</td>
                <td style={{ padding: "12px 14px" }}><StatusBadge status={(l as any).status || "CREATED"} size="sm" /></td>
                {isApproverRole && (
                  <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      <button
                        type="button"
                        className={`sc-btn-approve ${approvalStatus[l.id] === "approved" ? "is-approved" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(l.id);
                        }}
                        title="Mark lot as Approved"
                      >
                        ✓ APPROVED
                      </button>
                      <button
                        type="button"
                        className={`sc-btn-disapprove ${approvalStatus[l.id] === "disapproved" ? "is-disapproved" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisapprove(l.id);
                        }}
                        title="Mark lot as Disapproved"
                      >
                        ✕ DISAPPROVED
                      </button>
                    </div>
                  </td>
                )}
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
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>Create Material Lot</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" }}>Register a new production batch for supply chain tracking.</p>
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
              <form id="create-lot-form" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lbl}>Material / Component Type <span style={{ color: "#ef4444" }}>*</span></label>
                  <input style={inp} type="text" required placeholder="e.g. Radar Waveguide Assembly, PCB Rev-3.1" value={materialType} onChange={e => setMaterialType(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Originating Supplier <span style={{ color: "#ef4444" }}>*</span></label>
                  <select style={{ ...inp, cursor: "pointer" }} value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                    <option value="">— Select supplier —</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.supplier_id || (s as any).supplierId})</option>)}
                  </select>
                  {suppliers.length === 0 && <p style={{ margin: "4px 0 0", fontSize: "0.73rem", color: "#f59e0b" }}>⚠ Add a supplier first.</p>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Batch Reference</label>
                    <input style={inp} type="text" placeholder="e.g. BATCH-2026-Q3-001" value={batchRef} onChange={e => setBatchRef(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Quantity (units) <span style={{ color: "#ef4444" }}>*</span></label>
                    <input style={inp} type="number" min="1" required placeholder="e.g. 250" value={quantity} onChange={e => setQuantity(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Date of Manufacture</label>
                  <input style={inp} type="date" value={mfgDate} onChange={e => setMfgDate(e.target.value)} />
                </div>
              </form>
            </div>
            {/* Footer */}
            <div className="sc-modal-footer" style={{ padding: "14px 24px", borderTop: "1px solid #1e3a60", background: "#0a1727", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
                style={{ padding: "8px 18px", borderRadius: 6, border: "1px solid #1e3a60", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "0.875rem" }}>Cancel</button>
              <button type="submit" form="create-lot-form" className="btn-primary" disabled={isSubmitting || suppliers.length === 0}
                style={{ padding: "8px 22px", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Creating…" : "Create Lot"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
