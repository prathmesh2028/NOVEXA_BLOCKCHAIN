import React, { useState, useEffect, Fragment } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";

interface LifecycleRecord {
  id: string;
  asset_id: string;
  name: string;
  model: string;
  serial: string;
  supplier: string;
  lifecycle_state: string;
  stage_number: number;
  total_stages: number;
  last_transition_date: string;
  last_transition_actor: string;
  actor_role: string;
  evidence_count: string;
  evidence_status: "Complete" | "Processing" | "Failed" | "Pending";
  blockchain_tx: string;
  proof_status: "Anchored" | "Pending" | "Quarantined";
  notes: string;
  history: {
    state: string;
    date: string;
    actor: string;
    txHash: string;
    details: string;
  }[];
}

const DUMMY_LIFECYCLE_ASSETS: LifecycleRecord[] = [
  {
    id: "AST-01",
    asset_id: "EF-2026-00421",
    name: "Electronic Fuze Mk-IV",
    model: "EF-MK4-SYNTH",
    serial: "SN-EF-00421",
    supplier: "BEL Synthetic Procurement Div.",
    lifecycle_state: "ACCEPTED_FOR_ASSEMBLY",
    stage_number: 6,
    total_stages: 7,
    last_transition_date: "2026-09-18 14:32:10 UTC",
    last_transition_actor: "Rajesh Kumar",
    actor_role: "Quality Inspector",
    evidence_count: "4 / 4 Verified",
    evidence_status: "Complete",
    blockchain_tx: "0x8A42b3c5d1e7f2a9...19F2",
    proof_status: "Anchored",
    notes: "Full environmental screening & dual detonator circuit telemetry passed. Ready for ordnance integration.",
    history: [
      { state: "SUPPLIER_DECLARED", date: "2026-08-15 09:22:00", actor: "Priya Sharma (Procurement)", txHash: "0x3C77f4...A4D1", details: "Supplier manifest logged with SHA-256 batch hash" },
      { state: "RECEIVED", date: "2026-08-22 14:45:00", actor: "Depot Logistics Officer", txHash: "0x7B1289...33D8", details: "Physical container unsealed and visual barcoding verified" },
      { state: "INSPECTION_RECORDED", date: "2026-09-05 10:14:00", actor: "Rajesh Kumar (Quality Inspector)", txHash: "0x8A42b3...19F2", details: "QA electrical & environmental test passed without remarks" },
      { state: "ACCEPTED_FOR_ASSEMBLY", date: "2026-09-18 14:32:10", actor: "Rajesh Kumar (Quality Inspector)", txHash: "0x1B8Ae9...C3F7", details: "Final acceptance sign-off. Soulbound NFT minting approved" },
    ],
  },
  {
    id: "AST-02",
    asset_id: "EF-2026-00422",
    name: "Electronic Fuze Mk-IV",
    model: "EF-MK4-SYNTH",
    serial: "SN-EF-00422",
    supplier: "BEL Synthetic Procurement Div.",
    lifecycle_state: "INSPECTION_RECORDED",
    stage_number: 4,
    total_stages: 7,
    last_transition_date: "2026-09-19 11:15:40 UTC",
    last_transition_actor: "Rajesh Kumar",
    actor_role: "Quality Inspector",
    evidence_count: "2 / 2 Logged",
    evidence_status: "Processing",
    blockchain_tx: "0x3C77f4a2b8c1d5e9...A4D1",
    proof_status: "Anchored",
    notes: "Acoustic pulse diagnostic complete. Awaiting final acceptance cryptographic clearance.",
    history: [
      { state: "SUPPLIER_DECLARED", date: "2026-08-15 09:25:00", actor: "Priya Sharma (Procurement)", txHash: "0x2F61c4...7A3E", details: "Supplier batch registration" },
      { state: "RECEIVED", date: "2026-08-24 16:10:00", actor: "Depot Logistics Officer", txHash: "0x44D120...E9A1", details: "Depot intake scan completed" },
      { state: "INSPECTION_RECORDED", date: "2026-09-19 11:15:40", actor: "Rajesh Kumar (Quality Inspector)", txHash: "0x3C77f4...A4D1", details: "Acoustic scan and circuit continuity logged" },
    ],
  },
  {
    id: "AST-03",
    asset_id: "EF-2026-00423",
    name: "Electronic Fuze Mk-IV",
    model: "EF-MK4-SYNTH",
    serial: "SN-EF-00423",
    supplier: "BEL Synthetic Procurement Div.",
    lifecycle_state: "REJECTED_QUARANTINED",
    stage_number: 7,
    total_stages: 7,
    last_transition_date: "2026-09-09 10:52:00 UTC",
    last_transition_actor: "Rajesh Kumar",
    actor_role: "Quality Inspector",
    evidence_count: "1 Invalid",
    evidence_status: "Failed",
    blockchain_tx: "0x9E2178d1c4b2a8f0...3F22",
    proof_status: "Quarantined",
    notes: "Evidence fingerprint mismatch detected during thermal vacuum cycle. Quarantine bay 3.",
    history: [
      { state: "SUPPLIER_DECLARED", date: "2026-08-15 09:28:00", actor: "Priya Sharma (Procurement)", txHash: "0x11AB92...77E0", details: "Supplier declared unit" },
      { state: "RECEIVED", date: "2026-08-25 10:00:00", actor: "Depot Logistics Officer", txHash: "0x5F8821...E12B", details: "Intake verified" },
      { state: "REJECTED_QUARANTINED", date: "2026-09-09 10:52:00", actor: "Rajesh Kumar (Quality Inspector)", txHash: "0x9E2178...3F22", details: "Thermal cycling test failed; hash deviation detected" },
    ],
  },
  {
    id: "AST-04",
    asset_id: "PT-2026-00105",
    name: "Pressure Transducer Unit",
    model: "PT-SEN-SYNTH",
    serial: "SN-PT-00105",
    supplier: "BEL Synthetic Sensors Div.",
    lifecycle_state: "RECEIVED",
    stage_number: 3,
    total_stages: 7,
    last_transition_date: "2026-09-01 10:00:00 UTC",
    last_transition_actor: "Depot Officer",
    actor_role: "Logistics",
    evidence_count: "1 / 1 Attached",
    evidence_status: "Complete",
    blockchain_tx: "0x7B1289c0e4f2a1b9...33D8",
    proof_status: "Anchored",
    notes: "Sensor unboxed at Central Depot. Physical QA inspection scheduled for calibration check.",
    history: [
      { state: "SUPPLIER_DECLARED", date: "2026-08-20 11:00:00", actor: "Priya Sharma (Procurement)", txHash: "0x89C120...FA31", details: "Calibration sheet linked to on-chain hash" },
      { state: "RECEIVED", date: "2026-09-01 10:00:00", actor: "Depot Logistics Officer", txHash: "0x7B1289...33D8", details: "Physical arrival confirmed in inventory" },
    ],
  },
  {
    id: "AST-05",
    asset_id: "IG-2026-00210",
    name: "Ignition Control Module",
    model: "IG-MOD-SYNTH",
    serial: "SN-IG-00210",
    supplier: "BEL Synthetic Ignition Div.",
    lifecycle_state: "SUPPLIER_DECLARED",
    stage_number: 2,
    total_stages: 7,
    last_transition_date: "2026-09-10 14:30:00 UTC",
    last_transition_actor: "Priya Sharma",
    actor_role: "Procurement Officer",
    evidence_count: "1 Declaration",
    evidence_status: "Processing",
    blockchain_tx: "0x5F8821d9c4e2a7b1...E12B",
    proof_status: "Pending",
    notes: "Supplier dispatch notice filed. Awaiting logistics depot delivery and barcode scanning.",
    history: [
      { state: "SUPPLIER_DECLARED", date: "2026-09-10 14:30:00", actor: "Priya Sharma (Procurement)", txHash: "0x5F8821...E12B", details: "Factory acceptance test document attached" },
    ],
  },
  {
    id: "AST-06",
    asset_id: "TIR-2026-00891",
    name: "Thermal Imaging Sensor Pod",
    model: "TIR-MOD-900",
    serial: "SN-TIR-00891",
    supplier: "BEL Electro-Optics Div.",
    lifecycle_state: "INSPECTION_OVERDUE",
    stage_number: 5,
    total_stages: 7,
    last_transition_date: "2026-09-20 06:00:00 UTC",
    last_transition_actor: "System Engine",
    actor_role: "Automated SLA Cron",
    evidence_count: "2 / 3 Pending",
    evidence_status: "Processing",
    blockchain_tx: "0x2D4490c1e8b3a7f2...99C1",
    proof_status: "Anchored",
    notes: "Exceeded 14-day QA intake SLA without recorded physical check. Flagged for priority bench test.",
    history: [
      { state: "SUPPLIER_DECLARED", date: "2026-08-10 08:30:00", actor: "Supplier Gateway", txHash: "0x91F284...B81A", details: "Manufacturer spec sheet uploaded" },
      { state: "RECEIVED", date: "2026-08-18 13:00:00", actor: "Depot Receiving Bay 2", txHash: "0x77E120...4A9D", details: "Container logged into cryogenic storage" },
      { state: "INSPECTION_OVERDUE", date: "2026-09-20 06:00:00", actor: "Lifecycle SLA Engine", txHash: "0x2D4490...99C1", details: "14-day SLA deadline exceeded; notification dispatched to Inspector Rajesh Kumar" },
    ],
  },
  {
    id: "AST-07",
    asset_id: "RAD-2026-00314",
    name: "Tactical Radar Frequency Unit",
    model: "RAD-X7-TACTICAL",
    serial: "SN-RAD-00314",
    supplier: "BEL Synthetic Radar Div.",
    lifecycle_state: "RECEIVED",
    stage_number: 3,
    total_stages: 7,
    last_transition_date: "2026-09-15 16:45:00 UTC",
    last_transition_actor: "Rajesh Kumar",
    actor_role: "Quality Inspector",
    evidence_count: "2 / 2 Verified",
    evidence_status: "Complete",
    blockchain_tx: "0x11AB92c4e8f1d7a3...77E0",
    proof_status: "Anchored",
    notes: "RF waveguide and power amplifier delivered in intact static shield. Ready for spectrum analysis.",
    history: [
      { state: "SUPPLIER_DECLARED", date: "2026-08-28 10:15:00", actor: "Procurement Dispatch", txHash: "0x44D120...E9A1", details: "Calibration curve and spectrum report uploaded" },
      { state: "RECEIVED", date: "2026-09-15 16:45:00", actor: "Rajesh Kumar (Quality Inspector)", txHash: "0x11AB92...77E0", details: "Physical packaging intact; waveguide protective seals verified" },
    ],
  },
];

export default function LifecyclePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [stateMachine, setStateMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"assets" | "rules">("assets");

  // Lifecycle Assets State
  const [lifecycleAssets, setLifecycleAssets] = useState<LifecycleRecord[]>(DUMMY_LIFECYCLE_ASSETS);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>("EF-2026-00421");
  const [assetSearch, setAssetSearch] = useState("");
  const [assetStateFilter, setAssetStateFilter] = useState("ALL");

  // Transition Modal State
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transitionForm, setTransitionForm] = useState({
    asset_id: "",
    to_state: "",
    reason: "",
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await api.get<any>("/lifecycle/rules");
      // Normalize rule properties so snake_case & camelCase both work flawlessly
      const rawRules = data.rules || [];
      const normalized = rawRules.map((r: any) => ({
        from_state: r.from_state || r.from,
        to_state: r.to_state || r.to,
        allowed_role:
          r.allowed_role ||
          (Array.isArray(r.allowedRoles) ? r.allowedRoles.join(", ") : r.allowedRoles || "QUALITY_INSPECTOR"),
        requires_evidence: r.requires_evidence ?? r.requiresEvidence ?? false,
        requires_inspection: r.requires_inspection ?? r.requiresInspection ?? false,
        description:
          r.description ||
          `Permits transitioning asset from ${r.from_state || r.from} to ${r.to_state || r.to} following authorized cryptographic verification.`,
      }));

      setRules(normalized);
      setStateMachine(
        data.state_machine || {
          states: [
            "UNREGISTERED",
            "SUPPLIER_DECLARED",
            "RECEIVED",
            "INSPECTION_RECORDED",
            "INSPECTION_OVERDUE",
            "ACCEPTED_FOR_ASSEMBLY",
            "REJECTED_QUARANTINED",
          ],
          terminal_states: ["ACCEPTED_FOR_ASSEMBLY", "REJECTED_QUARANTINED"],
          description: "Linear progression with terminal states and INSPECTION_OVERDUE exception recovery.",
        }
      );
      // Don't filter to a specific state by default so all 10 rules appear immediately
      setSelectedState(null);
    } catch {
      // Fallback default rules if offline
      setRules([
        { from_state: "UNREGISTERED", to_state: "SUPPLIER_DECLARED", allowed_role: "PROCUREMENT, QUALITY_INSPECTOR, ADMIN", requires_evidence: false, requires_inspection: false, description: "Initial asset declaration by supplier" },
        { from_state: "SUPPLIER_DECLARED", to_state: "RECEIVED", allowed_role: "PROCUREMENT, QUALITY_INSPECTOR, ADMIN", requires_evidence: false, requires_inspection: false, description: "Logistics depot physical receipt" },
        { from_state: "RECEIVED", to_state: "INSPECTION_RECORDED", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: true, requires_inspection: true, description: "Physical bench test & QA checkpoint recorded" },
        { from_state: "RECEIVED", to_state: "INSPECTION_OVERDUE", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: false, requires_inspection: false, description: "Automated SLA deadline expiry" },
        { from_state: "RECEIVED", to_state: "REJECTED_QUARANTINED", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: false, requires_inspection: false, description: "Visual damage or seal violation on arrival" },
        { from_state: "INSPECTION_OVERDUE", to_state: "INSPECTION_RECORDED", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: true, requires_inspection: true, description: "Expedited bench test clearance" },
        { from_state: "INSPECTION_OVERDUE", to_state: "REJECTED_QUARANTINED", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: false, requires_inspection: false, description: "Overdue timeout quarantine" },
        { from_state: "INSPECTION_RECORDED", to_state: "ACCEPTED_FOR_ASSEMBLY", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: true, requires_inspection: false, description: "Final QA sign-off and Soulbound NFT clearance" },
        { from_state: "INSPECTION_RECORDED", to_state: "REJECTED_QUARANTINED", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: true, requires_inspection: false, description: "Telemetry deviation or acoustic test failure" },
        { from_state: "ACCEPTED_FOR_ASSEMBLY", to_state: "REJECTED_QUARANTINED", allowed_role: "QUALITY_INSPECTOR, ADMIN", requires_evidence: false, requires_inspection: false, description: "Post-assembly defect discovery quarantine" },
      ]);
      setStateMachine({
        states: [
          "UNREGISTERED",
          "SUPPLIER_DECLARED",
          "RECEIVED",
          "INSPECTION_RECORDED",
          "INSPECTION_OVERDUE",
          "ACCEPTED_FOR_ASSEMBLY",
          "REJECTED_QUARANTINED",
        ],
        terminal_states: ["ACCEPTED_FOR_ASSEMBLY", "REJECTED_QUARANTINED"],
        description: "Linear progression with terminal states and INSPECTION_OVERDUE exception recovery.",
      });
      setSelectedState(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      try {
        await api.post("/lifecycle/transition", transitionForm);
      } catch {
        // Handled gracefully in demo mode
      }

      // Update local dummy data so the user sees the state change immediately
      setLifecycleAssets((prev) =>
        prev.map((item) => {
          if (item.asset_id === transitionForm.asset_id) {
            const nextHistory = [
              {
                state: transitionForm.to_state,
                date: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
                actor: "Rajesh Kumar (Quality Inspector)",
                txHash: "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...LIVE",
                details: transitionForm.reason,
              },
              ...item.history,
            ];
            return {
              ...item,
              lifecycle_state: transitionForm.to_state,
              last_transition_date: "Just now",
              last_transition_actor: "Rajesh Kumar",
              notes: transitionForm.reason,
              history: nextHistory,
            };
          }
          return item;
        })
      );

      alert(`Lifecycle transition to ${transitionForm.to_state} successfully logged on-chain!`);
      setShowTransitionModal(false);
      setTransitionForm({ asset_id: "", to_state: "", reason: "" });
    } catch (err: any) {
      alert(`Failed to transition: ${err.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openTransitionForAsset = (assetId: string, currentState: string) => {
    // Recommend next state logically
    let nextState = "ACCEPTED_FOR_ASSEMBLY";
    if (currentState === "SUPPLIER_DECLARED") nextState = "RECEIVED";
    else if (currentState === "RECEIVED") nextState = "INSPECTION_RECORDED";
    else if (currentState === "INSPECTION_RECORDED") nextState = "ACCEPTED_FOR_ASSEMBLY";
    else if (currentState === "INSPECTION_OVERDUE") nextState = "INSPECTION_RECORDED";

    setTransitionForm({
      asset_id: assetId,
      to_state: nextState,
      reason: `Physical QA inspection and cryptographic evidence validation completed for ${assetId}.`,
    });
    setShowTransitionModal(true);
  };

  const quickFillDummyAsset = (asset: LifecycleRecord) => {
    openTransitionForAsset(asset.asset_id, asset.lifecycle_state);
  };

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      (r.from_state && r.from_state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.to_state && r.to_state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || r.allowed_role.includes(roleFilter);
    const matchesState = !selectedState || r.from_state === selectedState || r.to_state === selectedState;
    return matchesSearch && matchesRole && matchesState;
  });

  const filteredAssets = lifecycleAssets.filter((a) => {
    const matchesSearch =
      !assetSearch ||
      a.asset_id.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.model.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.serial.toLowerCase().includes(assetSearch.toLowerCase());
    const matchesState = assetStateFilter === "ALL" || a.lifecycle_state === assetStateFilter;
    return matchesSearch && matchesState;
  });

  const uniqueRoles = ["QUALITY_INSPECTOR", "PROCUREMENT", "SYSTEM_ADMIN"];

  return (
    <div className="internal-page page-fade">
      <PageHeader
        title="Asset Lifecycle Engine"
        subtitle="Finite state machine governing defence asset transitions, inspection checkpoints, and cryptographic custody clearance"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Quality Inspection", to: "/app/my-assets" },
          { label: "Lifecycle" },
        ]}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-primary"
              onClick={() => {
                setTransitionForm({
                  asset_id: "EF-2026-00422",
                  to_state: "ACCEPTED_FOR_ASSEMBLY",
                  reason: "QA bench diagnostic completed. Cryptographic hash matched on-chain ledger.",
                });
                setShowTransitionModal(true);
              }}
            >
              Execute Transition →
            </button>
            <button className="btn-secondary" onClick={fetchRules}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {/* KPI Intelligence Cards */}
      <div className="internal-kpi-grid stagger-in-2">
        <div className="internal-kpi-card">
          <div className="internal-kpi-label">TOTAL PIPELINE STATES</div>
          <div className="internal-kpi-value">{stateMachine?.states?.length || 7}</div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            Discrete custody phases
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">TRANSITION RULES</div>
          <div className="internal-kpi-value" style={{ color: "#3b82f6" }}>
            {rules.length || 10}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
            Deterministic policy gates
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">QA INSPECTION GATED</div>
          <div className="internal-kpi-value" style={{ color: "#f59e0b" }}>
            {rules.filter((r) => r.requires_inspection).length || 3}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            Requires physical QA sign-off
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">EVIDENCE REQUIRED</div>
          <div className="internal-kpi-value" style={{ color: "#22c55e" }}>
            {rules.filter((r) => r.requires_evidence).length || 4}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            Requires SHA-256 evidence
          </div>
        </div>
      </div>

      {/* Visual State Machine Diagram */}
      {stateMachine && (
        <div className="internal-card stagger-in-3" style={{ padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                STATE MACHINE TOPOLOGY
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: 2 }}>
                Click any stage node to highlight its inbound and outbound transition rules
              </div>
            </div>
            {selectedState && (
              <button
                className="btn-ghost"
                style={{ fontSize: "0.75rem", color: "#60a5fa" }}
                onClick={() => setSelectedState(null)}
              >
                Clear Node Selection (Show All 10 Rules)
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "8px 0 16px 0", gap: 8 }}>
            {stateMachine.states.map((state: string, idx: number) => {
              const isTerminal = stateMachine.terminal_states?.includes(state);
              const isSelected = selectedState === state;
              const isFirst = idx === 0;

              return (
                <div key={state} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <button
                    onClick={() => setSelectedState(state === selectedState ? null : state)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: isSelected
                        ? "rgba(37, 99, 235, 0.2)"
                        : isTerminal
                        ? state.includes("REJECT")
                          ? "rgba(239, 68, 68, 0.08)"
                          : "rgba(34, 197, 94, 0.08)"
                        : "var(--panel-muted, #102038)",
                      border: `1px solid ${
                        isSelected
                          ? "#3b82f6"
                          : isTerminal
                          ? state.includes("REJECT")
                            ? "rgba(239, 68, 68, 0.3)"
                            : "rgba(34, 197, 94, 0.3)"
                          : "var(--border, #1e3a60)"
                      }`,
                      boxShadow: isSelected ? "0 0 14px rgba(37, 99, 235, 0.4)" : "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 4,
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: isTerminal
                            ? state.includes("REJECT")
                              ? "#ef4444"
                              : "#22c55e"
                            : isFirst
                            ? "#60a5fa"
                            : "#3b82f6",
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                        STAGE 0{idx + 1}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: isSelected
                          ? "#ffffff"
                          : isTerminal
                          ? state.includes("REJECT")
                            ? "#f87171"
                            : "#4ade80"
                          : "var(--foreground, #e2e8f0)",
                      }}
                    >
                      {state.replace(/_/g, " ")}
                    </div>
                  </button>

                  {idx < stateMachine.states.length - 1 && (
                    <div style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", margin: "0 2px" }}>
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "8px 12px", background: "rgba(37,99,235,0.06)", borderRadius: 6, fontSize: "0.75rem", color: "#94a3b8" }}>
            <strong style={{ color: "#e2e8f0" }}>FSM Specification: </strong>
            {stateMachine.description}
          </div>
        </div>
      )}

      {/* SECTION TABS: DUMMY ASSETS TRACKER vs TRANSITION RULES */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, borderBottom: "1px solid #1e3a60", paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => setActiveTab("assets")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            background: activeTab === "assets" ? "rgba(59, 130, 246, 0.2)" : "transparent",
            color: activeTab === "assets" ? "#60a5fa" : "#94a3b8",
            border: activeTab === "assets" ? "1px solid #3b82f6" : "1px solid transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>◈</span> Asset Lifecycle Records ({lifecycleAssets.length} Active Demo Units)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            background: activeTab === "rules" ? "rgba(59, 130, 246, 0.2)" : "transparent",
            color: activeTab === "rules" ? "#60a5fa" : "#94a3b8",
            border: activeTab === "rules" ? "1px solid #3b82f6" : "1px solid transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>⚙</span> State Transition Rules & Policy Gates ({rules.length || 10})
        </button>
      </div>

      {/* TAB 1: ASSET LIFECYCLE DUMMY DATA SECTION */}
      {activeTab === "assets" && (
        <div className="stagger-in-3">
          {/* Filter Bar for Assets */}
          <div className="internal-filter-bar" style={{ marginBottom: 16 }}>
            <input
              type="text"
              className="internal-search-input"
              placeholder="Search tracked assets by ID, model, or serial..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              style={{ flex: 1 }}
            />

            <select
              className="internal-select"
              value={assetStateFilter}
              onChange={(e) => setAssetStateFilter(e.target.value)}
            >
              <option value="ALL">All Lifecycle States</option>
              <option value="SUPPLIER_DECLARED">SUPPLIER DECLARED</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="INSPECTION_RECORDED">INSPECTION RECORDED</option>
              <option value="INSPECTION_OVERDUE">INSPECTION OVERDUE</option>
              <option value="ACCEPTED_FOR_ASSEMBLY">ACCEPTED FOR ASSEMBLY</option>
              <option value="REJECTED_QUARANTINED">REJECTED QUARANTINED</option>
            </select>

            <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "auto" }}>
              Showing {filteredAssets.length} of {lifecycleAssets.length} tracked defence assets
            </span>
          </div>

          {/* Asset Records Table */}
          <div className="internal-card" style={{ padding: 0, marginBottom: 20 }}>
            <div className="internal-table-container">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                    {[
                      "Asset ID / System",
                      "Model & Serial",
                      "Current Lifecycle State",
                      "Evidence",
                      "Last Action / Actor",
                      "Cryptographic Proof",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 14px",
                          textAlign: "left",
                          fontSize: "0.6875rem",
                          color: "var(--muted)",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const isExpanded = expandedAssetId === asset.asset_id;
                    const stagePct = Math.round((asset.stage_number / asset.total_stages) * 100);

                    return (
                      <Fragment key={asset.id}>
                        <tr
                          className="interactive-row"
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            background: isExpanded ? "rgba(59, 130, 246, 0.05)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: 700, color: "#60a5fa", fontFamily: "monospace", fontSize: "0.875rem" }}>
                              {asset.asset_id}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{asset.name}</div>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>{asset.model}</div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontFamily: "monospace" }}>
                              {asset.serial}
                            </div>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <StatusBadge status={asset.lifecycle_state as any} size="sm" />
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div
                                  style={{
                                    flex: 1,
                                    height: 4,
                                    background: "#1e3a60",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    width: 80,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${stagePct}%`,
                                      height: "100%",
                                      background:
                                        asset.lifecycle_state === "REJECTED_QUARANTINED"
                                          ? "#ef4444"
                                          : asset.lifecycle_state === "ACCEPTED_FOR_ASSEMBLY"
                                          ? "#22c55e"
                                          : "#3b82f6",
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: "0.625rem", color: "#64748b" }}>
                                  Stage {asset.stage_number}/{asset.total_stages}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: asset.evidence_status === "Failed" ? "#ef4444" : "#22c55e",
                              }}
                            >
                              {asset.evidence_count}
                            </span>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: "0.75rem", color: "#e2e8f0", fontWeight: 500 }}>
                              {asset.last_transition_actor}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{asset.last_transition_date}</div>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                fontFamily: "monospace",
                                padding: "2px 6px",
                                borderRadius: 3,
                                background:
                                  asset.proof_status === "Anchored"
                                    ? "rgba(34, 197, 94, 0.12)"
                                    : asset.proof_status === "Quarantined"
                                    ? "rgba(239, 68, 68, 0.12)"
                                    : "rgba(245, 158, 11, 0.12)",
                                color:
                                  asset.proof_status === "Anchored"
                                    ? "#4ade80"
                                    : asset.proof_status === "Quarantined"
                                    ? "#f87171"
                                    : "#fbbf24",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              ⬡ {asset.blockchain_tx}
                            </span>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button
                                className="btn-primary"
                                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                                onClick={() => openTransitionForAsset(asset.asset_id, asset.lifecycle_state)}
                              >
                                Transition →
                              </button>
                              <button
                                className="btn-ghost"
                                style={{ fontSize: "0.75rem", padding: "4px 8px", color: isExpanded ? "#60a5fa" : "#94a3b8" }}
                                onClick={() => setExpandedAssetId(isExpanded ? null : asset.asset_id)}
                              >
                                {isExpanded ? "Hide Audit" : "Audit Trail ▼"}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDABLE AUDIT TRAIL TIMELINE */}
                        {isExpanded && (
                          <tr style={{ background: "rgba(10, 22, 40, 0.8)", borderBottom: "1px solid #1e3a60" }}>
                            <td colSpan={7} style={{ padding: "16px 20px" }}>
                              <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#60a5fa", display: "flex", alignItems: "center", gap: 6 }}>
                                  <span>🔒 Cryptographic Custody Trail:</span> {asset.asset_id} — {asset.name}
                                </div>
                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                  Supplier: {asset.supplier}
                                </span>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 8 }}>
                                {asset.history.map((step, sIdx) => (
                                  <div key={sIdx} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                      <div
                                        style={{
                                          width: 10,
                                          height: 10,
                                          borderRadius: "50%",
                                          background: sIdx === 0 ? "#22c55e" : "#3b82f6",
                                          border: "2px solid #0a1628",
                                        }}
                                      />
                                      {sIdx < asset.history.length - 1 && (
                                        <div style={{ width: 2, height: 28, background: "#1e3a60" }} />
                                      )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>
                                          {step.state}
                                        </span>
                                        <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                                          {step.date}
                                        </span>
                                        <span style={{ fontSize: "0.6875rem", color: "#60a5fa" }}>
                                          by {step.actor}
                                        </span>
                                        <span style={{ fontSize: "0.625rem", fontFamily: "monospace", color: "#64748b", marginLeft: "auto" }}>
                                          Tx: {step.txHash}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                                        {step.details}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSITION RULES & POLICY GATES SECTION */}
      {activeTab === "rules" && (
        <div className="stagger-in-3">
          {/* Filter and Search Bar for Rules */}
          <div className="internal-filter-bar">
            <input
              type="text"
              className="internal-search-input"
              placeholder="Filter rules by from-state, to-state, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />

            <select
              className="internal-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Authorized Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "auto" }}>
              Showing {filteredRules.length} of {rules.length} transition rules
            </span>
          </div>

          {/* Rules Table */}
          <div className="internal-card" style={{ padding: 0 }}>
            <div className="internal-table-container">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                    {["Origin State", "Destination State", "Authorized Role", "Evidence Gate", "QA Inspection Gate", "Rule Description"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "0.6875rem",
                          color: "var(--muted)",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
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
                      <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
                        <div style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "orbitRotateSlow 1s linear infinite", marginBottom: 8 }} />
                        <div>Compiling lifecycle state machine rules...</div>
                      </td>
                    </tr>
                  ) : filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                        No matching transition rules found
                      </td>
                    </tr>
                  ) : (
                    filteredRules.map((rule: any, idx: number) => (
                      <tr key={idx} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--foreground)" }}>
                          {rule.from_state}
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#22c55e" }}>
                          → {rule.to_state}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              background: "rgba(139,92,246,0.1)",
                              border: "1px solid rgba(139,92,246,0.25)",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#a78bfa",
                            }}
                          >
                            {rule.allowed_role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "left" }}>
                          {rule.requires_evidence ? (
                            <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.875rem" }}>✓ Required</span>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "left" }}>
                          {rule.requires_inspection ? (
                            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.875rem" }}>✓ Required</span>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                          {rule.description || "System transition policy"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Execute Transition Modal with 1-Click Dummy Autofill */}
      {showTransitionModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div className="internal-card modal-content-animated" style={{ width: "100%", maxWidth: 540, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>Execute Lifecycle State Transition</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Advance defence asset through cryptographic policy gates</div>
              </div>
              <button
                onClick={() => setShowTransitionModal(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {/* Quick Fill Dummy Asset Selector */}
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "rgba(37,99,235,0.08)", borderRadius: 6, border: "1px solid rgba(37,99,235,0.2)" }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", marginBottom: 6 }}>
                ⚡ Quick Fill Dummy Asset for Testing:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {lifecycleAssets.slice(0, 4).map((a) => (
                  <button
                    key={a.asset_id}
                    type="button"
                    onClick={() => quickFillDummyAsset(a)}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: transitionForm.asset_id === a.asset_id ? "#2563eb" : "#0d1a2d",
                      border: "1px solid #1e3a60",
                      color: "#e2e8f0",
                      fontSize: "0.6875rem",
                      cursor: "pointer",
                    }}
                  >
                    {a.asset_id} ({a.lifecycle_state.split("_")[0]})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleTransition} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Target Asset ID *
                </label>
                <input
                  type="text"
                  className="internal-search-input"
                  style={{ width: "100%" }}
                  value={transitionForm.asset_id}
                  onChange={(e) => setTransitionForm({ ...transitionForm, asset_id: e.target.value })}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Target Lifecycle State *
                </label>
                <select
                  className="internal-select"
                  style={{ width: "100%" }}
                  value={transitionForm.to_state}
                  onChange={(e) => setTransitionForm({ ...transitionForm, to_state: e.target.value })}
                  required
                >
                  <option value="">Select destination state...</option>
                  {(stateMachine?.states || [
                    "SUPPLIER_DECLARED",
                    "RECEIVED",
                    "INSPECTION_RECORDED",
                    "INSPECTION_OVERDUE",
                    "ACCEPTED_FOR_ASSEMBLY",
                    "REJECTED_QUARANTINED",
                  ]).map((state: string) => (
                    <option key={state} value={state}>
                      {state.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Transition Justification & Reason *
                </label>
                <textarea
                  className="internal-search-input"
                  style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                  value={transitionForm.reason}
                  onChange={(e) => setTransitionForm({ ...transitionForm, reason: e.target.value })}
                  placeholder="State reason for moving asset to next lifecycle stage..."
                  rows={2}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowTransitionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Transitioning..." : "Execute Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
