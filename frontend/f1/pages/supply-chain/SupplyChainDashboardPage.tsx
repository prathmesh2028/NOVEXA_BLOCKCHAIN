import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import SuppliersList from "./components/SuppliersList";
import FacilitiesList from "./components/FacilitiesList";
import LotsList from "./components/LotsList";
import ShipmentsList from "./components/ShipmentsList";
import { supplyChainService } from "../../services/supply-chain";

export default function SupplyChainDashboardPage() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [counts, setCounts] = useState({ suppliers: 0, facilities: 0, lots: 0, shipments: 0 });

  useEffect(() => {
    Promise.allSettled([
      supplyChainService.listSuppliers(),
      supplyChainService.listFacilities(),
      supplyChainService.listLots(),
      supplyChainService.listShipments(),
    ]).then(([supRes, facRes, lotRes, shpRes]) => {
      setCounts({
        suppliers: supRes.status === "fulfilled" ? (supRes.value.items?.length ?? 0) : 0,
        facilities: facRes.status === "fulfilled" ? (facRes.value.items?.length ?? 0) : 0,
        lots: lotRes.status === "fulfilled" ? (lotRes.value.items?.length ?? 0) : 0,
        shipments: shpRes.status === "fulfilled" ? (shpRes.value.items?.length ?? 0) : 0,
      });
    });
  }, []);

  const tabs = [
    { id: "suppliers", label: "Suppliers", count: counts.suppliers, icon: "◈" },
    { id: "facilities", label: "Facilities", count: counts.facilities, icon: "⬡" },
    { id: "lots", label: "Lots & Batches", count: counts.lots, icon: "◫" },
    { id: "shipments", label: "Shipments", count: counts.shipments, icon: "◎" },
  ];

  return (
    <div className="internal-page page-fade">
      <PageHeader
        title="Supply Chain Command"
        subtitle="End-to-end defence supply chain visibility, manufacturing batch provenance, and multi-facility custody tracking"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Supply Chain" },
        ]}
      />

      {/* KPI Summary Cards */}
      <div className="internal-kpi-grid stagger-in-2">
        <div className="internal-kpi-card">
          <div className="internal-kpi-label">CERTIFIED SUPPLIERS</div>
          <div className="internal-kpi-value">{counts.suppliers}</div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            Vetted defence partners
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">OPERATIONAL FACILITIES</div>
          <div className="internal-kpi-value" style={{ color: "#3b82f6" }}>
            {counts.facilities}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
            Depots & manufacturing plants
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">PRODUCTION LOTS</div>
          <div className="internal-kpi-value" style={{ color: "#22c55e" }}>
            {counts.lots}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            Material provenance batches
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">ACTIVE SHIPMENTS</div>
          <div className="internal-kpi-value" style={{ color: "#f59e0b" }}>
            {counts.shipments}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            In-transit custody transfers
          </div>
        </div>
      </div>

      {/* Custody Flow Visualization */}
      <div
        className="internal-card stagger-in-3"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(15,32,64,0.4) 0%, rgba(12,24,40,0.9) 100%)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
            DEFENCE CUSTODY PIPELINE
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: 4 }}>
            Immutable physical-to-digital chain of custody from tier-1 supplier intake to operational deployment
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "10px 0" }}>
          {[
            { label: "SUPPLIER", sub: "Vetted Origin", icon: "◈", color: "#3b82f6" },
            { label: "FACILITY", sub: "Mfg / Storage", icon: "⬡", color: "#06b6d4" },
            { label: "LOT BATCH", sub: "QA Certified", icon: "◫", color: "#8b5cf6" },
            { label: "SHIPMENT", sub: "Custody Transit", icon: "◎", color: "#f59e0b" },
            { label: "RECEIVED", sub: "Assembly Ready", icon: "✓", color: "#22c55e" },
          ].map((stage, idx, arr) => (
            <div key={stage.label} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 140 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center", minWidth: 90 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "8px",
                    background: `${stage.color}18`,
                    border: `1px solid ${stage.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    color: stage.color,
                  }}
                >
                  {stage.icon}
                </div>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--foreground)" }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>{stage.sub}</div>
              </div>

              {idx < arr.length - 1 && (
                <div className="custody-flow-line" style={{ minWidth: 32, margin: "0 8px" }}>
                  <div className="custody-flow-pulse" style={{ animationDelay: `${idx * 0.8}s` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 2 }} className="stagger-in-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="tab-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                fontSize: "0.875rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--primary)" : "var(--muted)",
                borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontSize: "0.6875rem",
                  background: isActive ? "rgba(37,99,235,0.15)" : "var(--hover-bg)",
                  color: isActive ? "var(--primary)" : "var(--muted)",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="internal-card stagger-in-4" style={{ padding: 24 }}>
        {activeTab === "suppliers" && <SuppliersList />}
        {activeTab === "facilities" && <FacilitiesList />}
        {activeTab === "lots" && <LotsList />}
        {activeTab === "shipments" && <ShipmentsList />}
      </div>
    </div>
  );
}
