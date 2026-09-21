import { useState, useEffect } from "react";
import { supplyChainService, ShipmentResponse } from "../../../services/supply-chain";
import StatusBadge from "../../../components/ui/StatusBadge";

export default function ShipmentsList() {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listShipments();
      setShipments(data.items || (data as any));
    } catch (error) {
      console.error("Failed to fetch shipments", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = shipments.filter(
    (s) =>
      !search ||
      (s.shipment_id && s.shipment_id.toLowerCase().includes(search.toLowerCase())) ||
      (s.lot?.lot_id && s.lot.lot_id.toLowerCase().includes(search.toLowerCase())) ||
      (s.destination_facility?.name && s.destination_facility.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <input
          type="text"
          className="internal-search-input"
          placeholder="Filter shipments by shipment ID, lot, or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <button className="btn-primary">+ Dispatch Shipment</button>
      </div>

      <div className="internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Shipment ID", "Production Lot", "Origin Facility", "Destination Facility", "Custody Status"].map((h) => (
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
                <td colSpan={5} style={{ padding: "36px", textAlign: "center", color: "var(--muted)" }}>
                  Loading custody transfers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "36px", textAlign: "center", color: "var(--muted)" }}>
                  No shipments found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((shipment) => (
                <tr key={shipment.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="meta-id" style={{ color: "#f59e0b", fontWeight: 600 }}>
                      {shipment.shipment_id || shipment.id}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--foreground)" }}>
                    {shipment.lot?.lot_id || "LOT-PROV-001"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {shipment.origin_facility?.name || "Manufacturing Plant 01"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--foreground)" }}>
                    {shipment.destination_facility?.name || "Depot Command Central"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <StatusBadge status={shipment.status || "PENDING"} size="sm" />
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
