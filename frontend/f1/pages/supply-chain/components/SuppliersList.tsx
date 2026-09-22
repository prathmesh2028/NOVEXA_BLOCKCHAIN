import { useState, useEffect } from "react";
import { supplyChainService, SupplierResponse } from "../../../services/supply-chain";
import StatusBadge from "../../../components/ui/StatusBadge";

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listSuppliers();
      setSuppliers(data.items || (data as any));
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.supplier_id && s.supplier_id.toLowerCase().includes(search.toLowerCase())) ||
      (s.type && s.type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <input
          type="text"
          className="internal-search-input"
          placeholder="Filter suppliers by name, ID, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <button className="btn-primary">+ Add Supplier</button>
      </div>

      <div className="internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Supplier ID", "Company Name", "Vendor Type", "Contact Detail", "Certifications", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: "0.6875rem",
                    color: "var(--muted)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--muted)" }}>
                  Loading certified suppliers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--muted)" }}>
                  No suppliers found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((supplier) => (
                <tr key={supplier.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="meta-id" style={{ color: "#3b82f6", fontWeight: 600 }}>
                      {supplier.supplier_id || supplier.id}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--foreground)" }}>
                    {supplier.name}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {supplier.type || "Tier-1 OEM"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {supplier.contact_email || supplier.contact_phone || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "var(--muted)" }}>
                    {supplier.certifications || "ISO 9001 / AS9100"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <StatusBadge status={supplier.status || "ACTIVE"} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
