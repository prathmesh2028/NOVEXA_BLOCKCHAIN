import { useState, useEffect } from "react";
import { supplyChainService, LotResponse } from "../../../services/supply-chain";
import StatusBadge from "../../../components/ui/StatusBadge";

export default function LotsList() {
  const [lots, setLots] = useState<LotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listLots();
      setLots(data.items || (data as any));
    } catch (error) {
      console.error("Failed to fetch lots", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = lots.filter(
    (l) =>
      !search ||
      (l.lot_id && l.lot_id.toLowerCase().includes(search.toLowerCase())) ||
      (l.batch_id && l.batch_id.toLowerCase().includes(search.toLowerCase())) ||
      (l.facility?.name && l.facility.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <input
          type="text"
          className="internal-search-input"
          placeholder="Filter production lots by lot ID, batch, or facility..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <button className="btn-primary">+ Create Material Lot</button>
      </div>

      <div className="internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Lot ID", "Batch Reference", "Facility Origin", "Volume / Qty", "Mfg Date", "Batch Status"].map((h) => (
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
                  Loading production lots...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--muted)" }}>
                  No production lots found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((lot) => (
                <tr key={lot.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="meta-id" style={{ color: "#8b5cf6", fontWeight: 600 }}>
                      {lot.lot_id || lot.id}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--foreground)" }}>
                    {lot.batch_id || "BATCH-DEF-01"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {lot.facility?.name || "Depot Alpha"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--foreground)", fontWeight: 500 }}>
                    {lot.quantity ?? 100} {lot.unit || "units"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "var(--muted)" }}>
                    {lot.manufactured_date || "2026-03-15"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <StatusBadge status={lot.status || "CREATED"} size="sm" />
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
