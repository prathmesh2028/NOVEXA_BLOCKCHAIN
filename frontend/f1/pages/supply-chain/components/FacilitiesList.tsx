import { useState, useEffect } from "react";
import { supplyChainService, FacilityResponse } from "../../../services/supply-chain";
import StatusBadge from "../../../components/ui/StatusBadge";

export default function FacilitiesList() {
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listFacilities();
      setFacilities(data.items || (data as any));
    } catch (error) {
      console.error("Failed to fetch facilities", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = facilities.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.facility_id && f.facility_id.toLowerCase().includes(search.toLowerCase())) ||
      (f.location && f.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <input
          type="text"
          className="internal-search-input"
          placeholder="Filter facilities by name, ID, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <button className="btn-primary">+ Add Facility</button>
      </div>

      <div className="internal-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
              {["Facility ID", "Facility Name", "Managing Supplier", "Geo Location", "Type", "Operational Status"].map((h) => (
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
                  Loading facilities...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--muted)" }}>
                  No facilities found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((facility) => (
                <tr key={facility.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="meta-id" style={{ color: "#06b6d4", fontWeight: 600 }}>
                      {facility.facility_id || facility.id}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--foreground)" }}>
                    {facility.name}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {facility.supplier?.name || "Independent Depot"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {facility.location || "Secure Site"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "var(--muted)" }}>
                    {facility.type || "Manufacturing"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <StatusBadge status={facility.status || "OPERATIONAL"} size="sm" />
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
