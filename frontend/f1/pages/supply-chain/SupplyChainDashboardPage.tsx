import { useState, useEffect, useRef } from "react";
import PageHeader from "../../components/ui/PageHeader";
import SuppliersList from "./components/SuppliersList";
import FacilitiesList from "./components/FacilitiesList";
import LotsList from "./components/LotsList";
import ShipmentsList from "./components/ShipmentsList";
import { supplyChainService } from "../../services/supply-chain";
import "./SupplyChainPage.css";

/* ── Smooth KPI Count-up Hook (500–900ms) ─────────────────────────────────── */
function useCountUp(target: number, duration = 800, delay = 0): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let startTime: number | null = null;

    const timer = setTimeout(() => {
      function step(ts: number) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          raf.current = requestAnimationFrame(step);
        }
      }
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

export default function SupplyChainDashboardPage() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [counts, setCounts] = useState({ suppliers: 0, facilities: 0, lots: 0, shipments: 0 });
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isDemoActive, setIsDemoActive] = useState(false);

  const demoCounts = { suppliers: 8, facilities: 5, lots: 12, shipments: 6 };

  useEffect(() => {
    if (isDemoActive) {
      setCounts(demoCounts);
      return;
    }

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
  }, [isDemoActive]);

  /* Subtle mouse parallax for decorative background elements only (2px) */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
    setMouseOffset({ x, y });
  };

  /* Animated count-up values for each KPI card */
  const animSuppliers = useCountUp(counts.suppliers, 750, 60);
  const animFacilities = useCountUp(counts.facilities, 800, 120);
  const animLots = useCountUp(counts.lots, 850, 180);
  const animShipments = useCountUp(counts.shipments, 900, 240);

  const tabs = [
    { id: "suppliers", label: "Suppliers", count: counts.suppliers, icon: "◈" },
    { id: "facilities", label: "Facilities", count: counts.facilities, icon: "⬡" },
    { id: "lots", label: "Lots & Batches", count: counts.lots, icon: "◫" },
    { id: "shipments", label: "Shipments", count: counts.shipments, icon: "◎" },
  ];

  const pipelineStages = [
    { label: "SUPPLIER", sub: "Vetted Origin", icon: "◈", color: "#3b82f6", pulseClass: "sc-node-pulse-0" },
    { label: "FACILITY", sub: "Mfg / Storage", icon: "⬡", color: "#06b6d4", pulseClass: "sc-node-pulse-1" },
    { label: "LOT BATCH", sub: "QA Certified", icon: "◫", color: "#8b5cf6", pulseClass: "sc-node-pulse-2" },
    { label: "SHIPMENT", sub: "Custody Transit", icon: "◎", color: "#f59e0b", pulseClass: "sc-node-pulse-3" },
    { label: "RECEIVED", sub: "Assembly Ready", icon: "✓", color: "#22c55e", pulseClass: "sc-node-pulse-4" },
  ];

  return (
    <div className="internal-page page-fade sc-page-root" onMouseMove={handleMouseMove}>
      {/* Subtle decorative technical network grid with 2px parallax */}
      <div
        className="sc-technical-grid-bg"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      />

      {/* Header with entrance animation and live telemetry indicator */}
      <div className="sc-header-animated">
        <div className="sc-telemetry-badge">
          <span className="sc-beacon-dot" />
          <span>BEL DEFENCE SUPPLY CHAIN TELEMETRY • LIVE LEDGER ANCHORED</span>
          {isDemoActive && (
            <span style={{ marginLeft: 12, padding: "4px 8px", background: "rgba(37,99,235,0.15)", borderRadius: 4, fontSize: "0.7rem", fontWeight: 600, color: "#3b82f6" }}>
              DEMO MODE
            </span>
          )}
        </div>
        <PageHeader
          title="Supply Chain Command"
          subtitle="End-to-end defence supply chain visibility, manufacturing batch provenance, and multi-facility custody tracking"
          breadcrumbs={[
            { label: "Dashboard", to: "/app/dashboard" },
            { label: "Supply Chain" },
          ]}
          actions={
            <button
              onClick={() => setIsDemoActive(!isDemoActive)}
              style={{
                padding: "6px 12px",
                background: isDemoActive ? "rgba(239,68,68,0.15)" : "rgba(37,99,235,0.15)",
                border: isDemoActive ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(37,99,235,0.3)",
                borderRadius: 6,
                color: isDemoActive ? "#ef4444" : "#3b82f6",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {isDemoActive ? "✕ Reset Demo" : "⚡ Load Demo"}
            </button>
          }
        />
      </div>

      {/* KPI Summary Cards */}
      <div className="sc-kpi-grid">
        {/* Suppliers Card */}
        <div className="sc-kpi-card">
          <div className="sc-kpi-accent" style={{ background: "#2563eb" }} />
          <div className="sc-kpi-header">
            <div className="sc-kpi-label">CERTIFIED SUPPLIERS</div>
            <div
              className="sc-kpi-icon-box sc-icon-pulse-suppliers"
              style={{ background: "rgba(37,99,235,0.12)", color: "#3b82f6" }}
            >
              ◈
            </div>
          </div>
          <div className="sc-kpi-value">{animSuppliers}</div>
          <div className="sc-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            <span>Vetted defence partners</span>
          </div>
        </div>

        {/* Facilities Card */}
        <div className="sc-kpi-card">
          <div className="sc-kpi-accent" style={{ background: "#06b6d4" }} />
          <div className="sc-kpi-header">
            <div className="sc-kpi-label">OPERATIONAL FACILITIES</div>
            <div
              className="sc-kpi-icon-box sc-icon-pulse-facilities"
              style={{ background: "rgba(6,182,212,0.12)", color: "#06b6d4" }}
            >
              ⬡
            </div>
          </div>
          <div className="sc-kpi-value" style={{ color: "#06b6d4" }}>
            {animFacilities}
          </div>
          <div className="sc-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
            <span>Depots & manufacturing plants</span>
          </div>
        </div>

        {/* Production Lots Card */}
        <div className="sc-kpi-card">
          <div className="sc-kpi-accent" style={{ background: "#8b5cf6" }} />
          <div className="sc-kpi-header">
            <div className="sc-kpi-label">PRODUCTION LOTS</div>
            <div
              className="sc-kpi-icon-box sc-icon-pulse-lots"
              style={{ background: "rgba(139,92,246,0.12)", color: "#a855f7" }}
            >
              ◫
            </div>
          </div>
          <div className="sc-kpi-value" style={{ color: "#a855f7" }}>
            {animLots}
          </div>
          <div className="sc-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6" }} />
            <span>Material provenance batches</span>
          </div>
        </div>

        {/* Active Shipments Card */}
        <div className="sc-kpi-card">
          <div className="sc-kpi-accent" style={{ background: "#f59e0b" }} />
          <div className="sc-kpi-header">
            <div className="sc-kpi-label">ACTIVE SHIPMENTS</div>
            <div
              className="sc-kpi-icon-box sc-icon-pulse-shipments"
              style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
            >
              ◎
            </div>
          </div>
          <div className="sc-kpi-value" style={{ color: "#f59e0b" }}>
            {animShipments}
          </div>
          <div className="sc-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            <span>In-transit custody transfers</span>
          </div>
        </div>
      </div>

      {/* Custody Flow Visualization — Defence Custody Pipeline */}
      <div className="sc-pipeline-card">
        <div className="sc-pipeline-header">
          <div className="sc-pipeline-title-group">
            <div className="sc-pipeline-title">
              <span>DEFENCE CUSTODY PIPELINE</span>
              <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>• REAL-TIME PHYSICAL & DIGITAL TRACEABILITY</span>
            </div>
            <div className="sc-pipeline-desc">
              Immutable physical-to-digital chain of custody from tier-1 supplier intake to operational deployment
            </div>
          </div>
          <div className="sc-pipeline-telemetry-status">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            <span>100% CUSTODY ANCHORED</span>
          </div>
        </div>

        {/* Pipeline Track with Visible Traveling Custody Packet */}
        <div className="sc-pipeline-track-wrapper">
          {/* Continuous Traveling Glowing Custody Packet */}
          <div className="sc-packet-overlay-bar">
            <div className="sc-traveling-packet" title="Physical Custody & Digital Provenance Packet" />
          </div>

          {pipelineStages.map((stage, idx, arr) => (
            <div key={stage.label} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 120 }}>
              {/* Stage Node */}
              <div className="sc-stage-node" title={`${stage.label}: ${stage.sub}`}>
                <div
                  className={`sc-stage-icon-box ${stage.pulseClass}`}
                  style={{
                    background: `${stage.color}15`,
                    border: `1.5px solid ${stage.color}50`,
                    color: stage.color,
                  }}
                >
                  {stage.icon}
                </div>
                <div className="sc-stage-title">{stage.label}</div>
                <div className="sc-stage-sub">{stage.sub}</div>
              </div>

              {/* Connecting Track with moving light beam */}
              {idx < arr.length - 1 && (
                <div className="sc-connector-track">
                  <div
                    className="sc-connector-laser"
                    style={{ animationDelay: `${idx * 0.4}s` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sc-tabs-bar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sc-tab-btn ${isActive ? "active" : ""}`}
              id={`supply-chain-tab-${tab.id}`}
              type="button"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="sc-tab-badge">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels with switch animation */}
      <div className="internal-card sc-tab-panel-container" key={activeTab} style={{ padding: 24 }}>
        {activeTab === "suppliers" && <SuppliersList />}
        {activeTab === "facilities" && <FacilitiesList />}
        {activeTab === "lots" && <LotsList />}
        {activeTab === "shipments" && <ShipmentsList />}
      </div>
    </div>
  );
}

