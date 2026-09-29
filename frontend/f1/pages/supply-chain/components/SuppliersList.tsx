import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { supplyChainService, SupplierResponse } from "../../../services/supply-chain";
import StatusBadge from "../../../components/ui/StatusBadge";
import { useAuth, normalizeRole } from "../../../context/AuthContext";

/* ── Shared modal styles ─────────────────────────────────── */
const overlay: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  background: "rgba(3,7,18,0.85)", backdropFilter: "blur(6px)",
  zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const modal: React.CSSProperties = {
  background: "var(--card, #171717)", border: "1px solid var(--border, #2a2a2a)", borderRadius: 12,
  width: "100%", maxWidth: 540, maxHeight: "88vh",
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

export default function SuppliersList() {
  const { role, user } = useAuth();

  /* Role permission check: Approved & Disapproved visible ONLY for System Administrator and Quality Inspector / Technician */
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

  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalStatus, setModalStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [name, setName] = useState("");
  const [vendorType, setVendorType] = useState("Tier-1 OEM");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [certifications, setCertifications] = useState("ISO 9001 / AS9100");
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleLoadDemoData = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setName("Bharat Defence Components Pvt. Ltd.");
    setVendorType("Tier-1 OEM");
    setCertifications("ISO 9001 / AS9100");
    setContactPerson("Rajesh Kumar");
    setContactEmail("vendor@defence-demo.in");
    setContactPhone("+91 80 25039300");
    setAddress("Bengaluru Defence Complex, India");
    setModalStatus(null);
    setDemoLoaded(true);
    setTimeout(() => {
      setDemoLoaded(false);
    }, 2500);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const d = await supplyChainService.listSuppliers();
      setSuppliers((d as any).items || (d as any) || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openModal = () => {
    setName(""); setVendorType("Tier-1 OEM"); setContactPerson(""); setContactEmail("");
    setContactPhone(""); setAddress(""); setCertifications("ISO 9001 / AS9100");
    setModalStatus(null); setDemoLoaded(false); setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setModalStatus({ type: "error", message: "Company name is required." }); return; }
    setIsSubmitting(true); setModalStatus(null);
    try {
      await supplyChainService.createSupplier({
        supplierId: `SUP-${Date.now().toString(36).toUpperCase()}`,
        name: name.trim(), type: vendorType,
        contactPerson: contactPerson.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        address: address.trim() || undefined,
        certifications: certifications.trim() || undefined,
      });
      setModalStatus({ type: "success", message: `Supplier "${name.trim()}" registered successfully!` });
      await fetchSuppliers();
      setTimeout(() => { setShowModal(false); setModalStatus(null); }, 1400);
    } catch (err: any) {
      setModalStatus({ type: "error", message: err?.data?.message || err?.message || "Failed to register supplier." });
    } finally { setIsSubmitting(false); }
  };

  const filtered = suppliers.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    (s.supplier_id || "").toLowerCase().includes(search.toLowerCase()) ||
    ((s as any).supplierId || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div className="sc-search-wrapper">
          <span className="sc-search-icon">🔍</span>
          <input
            type="text"
            className="sc-search-input"
            placeholder="Filter suppliers by name, ID, or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="sc-action-btn" id="add-supplier-btn" onClick={openModal}>
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="sc-table-wrapper internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Supplier ID", "Company Name", "Vendor Type", "Contact", "Certifications", "Status", ...(isApproverRole ? ["Actions"] : [])].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.6875rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isApproverRole ? 7 : 6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>Loading suppliers…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={isApproverRole ? 7 : 6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>No suppliers found. Click <strong>+ Add Supplier</strong> to register one.</td></tr>
            ) : filtered.map((s, idx) => {
              const suppId = s.supplier_id || (s as any).supplierId || s.id;
              const type = s.type || (s as any).contactInfo?.type || "Tier-1 OEM";
              const contact = s.contact_email || (s as any).contactInfo?.contactEmail || s.contact_phone || "—";
              const certs = s.certifications || (s as any).contactInfo?.certifications || "ISO 9001";
              return (
                <tr
                  key={s.id}
                  className="interactive-row sc-table-row"
                  style={{ animationDelay: `${Math.min(idx, 12) * 45}ms` }}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      <span className="sc-supplier-verified-dot" title="Active Vetted Contractor" />
                      <span className="meta-id" style={{ color: "#3b82f6", fontWeight: 600 }}>{suppId}</span>
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--muted)" }}>{type}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--muted)" }}>{contact}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "var(--muted)" }}>{certs}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={s.status || "ACTIVE"} size="sm" /></td>
                  {isApproverRole && (
                    <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className={`sc-btn-approve ${approvalStatus[s.id || suppId] === "approved" ? "is-approved" : ""}`}
                          onClick={() => handleApprove(s.id || suppId)}
                          title="Approve supplier verification"
                          aria-label={`Approve ${s.name || suppId}`}
                        >
                          <span style={{ fontSize: "0.75rem" }}>✓</span>
                          <span>{approvalStatus[s.id || suppId] === "approved" ? "Approved" : "APPROVED"}</span>
                        </button>
                        <button
                          type="button"
                          className={`sc-btn-disapprove ${approvalStatus[s.id || suppId] === "disapproved" ? "is-disapproved" : ""}`}
                          onClick={() => handleDisapprove(s.id || suppId)}
                          title="Disapprove supplier verification"
                          aria-label={`Disapprove ${s.name || suppId}`}
                        >
                          <span style={{ fontSize: "0.75rem" }}>✕</span>
                          <span>{approvalStatus[s.id || suppId] === "disapproved" ? "Disapproved" : "DISAPPROVED"}</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MODAL via Portal (escapes transform/overflow of ancestors) ── */}
      {showModal && createPortal(
        <div className="sc-modal-overlay" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="sc-modal-box" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="sc-modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid #1e3a60", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#0a1727" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>Register New Supplier</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" }}>Enlist a qualified defence contractor onto KavachTrust supply chain ledger.</p>
              </div>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem", padding: "4px 8px" }}>✕</button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {modalStatus && (
                <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, fontSize: "0.8125rem",
                  background: modalStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${modalStatus.type === "success" ? "#22c55e" : "#ef4444"}`,
                  color: modalStatus.type === "success" ? "#4ade80" : "#f87171" }}>
                  {modalStatus.type === "success" ? "✓ " : "⚠ "}{modalStatus.message}
                </div>
              )}

              {/* Quick Fill Demo Data Bar */}
              <div className="sc-modal-demo-bar">
                <div className="sc-modal-demo-bar-info">
                  <span className="sc-modal-demo-badge">SIH DEMO</span>
                  <span className="sc-modal-demo-text">Pre-fill realistic supplier data</span>
                </div>
                <button
                  type="button"
                  id="supplier-load-demo-btn"
                  className={`sc-modal-load-demo-btn ${demoLoaded ? "loaded" : ""}`}
                  onClick={handleLoadDemoData}
                  title="Automatically populate fields with demo data"
                >
                  <span>{demoLoaded ? "✓" : "⚡"}</span>
                  <span>{demoLoaded ? "DEMO DATA LOADED" : "LOAD DEMO DATA"}</span>
                </button>
              </div>

              <form id="add-supplier-form" onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lbl}>Company Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input style={inp} type="text" required placeholder="e.g. Bharat Electronics Ltd (BEL)" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Vendor Type</label>
                    <select style={{ ...inp, cursor: "pointer" }} value={vendorType} onChange={e => setVendorType(e.target.value)}>
                      {["Tier-1 OEM", "Component Manufacturer", "Raw Materials Supplier", "Specialist Contractor", "Sub-Tier Supplier"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Quality Certifications</label>
                    <input style={inp} type="text" placeholder="ISO 9001 / AS9100D" value={certifications} onChange={e => setCertifications(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Contact Person</label>
                    <input style={inp} type="text" placeholder="e.g. Rajesh Kumar" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Contact Email</label>
                    <input style={inp} type="email" placeholder="vendor@bel.co.in" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Contact Phone</label>
                    <input style={inp} type="text" placeholder="+91 80 25039300" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Address / Location</label>
                    <input style={inp} type="text" placeholder="Bengaluru Complex, India" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer — always visible */}
            <div className="sc-modal-footer" style={{ padding: "14px 24px", borderTop: "1px solid #1e3a60", background: "#0a1727", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                id="supplier-load-demo-footer-btn"
                className={`sc-modal-load-demo-footer-btn ${demoLoaded ? "loaded" : ""}`}
                onClick={handleLoadDemoData}
                title="Populate demo data"
              >
                <span>{demoLoaded ? "✓" : "⚡"}</span>
                <span>{demoLoaded ? "Demo Filled" : "Use Dummy Data"}</span>
              </button>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
                  style={{ padding: "8px 18px", borderRadius: 6, border: "1px solid #1e3a60", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "0.875rem" }}>
                  Cancel
                </button>
                <button type="submit" form="add-supplier-form" className="btn-primary" disabled={isSubmitting}
                  id="submit-register-supplier-btn" style={{ padding: "8px 22px", opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Registering…" : "Register Supplier"}
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
