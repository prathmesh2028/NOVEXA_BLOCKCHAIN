import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";
import "./LifecyclePage.css";

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

function useCountUp(endValue: number, durationMs: number = 700, delayMs: number = 0) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animId: number;

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / durationMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(ease * endValue));

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else {
          setDisplayValue(endValue);
        }
      };
      animId = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animId);
    };
  }, [endValue, durationMs, delayMs]);

  return displayValue;
}

export default function LifecyclePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [stateMachine, setStateMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    setIsRefreshing(true);
    try {
      const data = await api.get<any>("/lifecycle/rules");
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
      setTimeout(() => setIsRefreshing(false), 500);
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

      setShowTransitionModal(false);
      setTransitionForm({ asset_id: "", to_state: "", reason: "" });
    } catch (err: any) {
      alert(`Failed to transition: ${err.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openTransitionForAsset = (assetId: string, currentState: string) => {
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

  // Real KPI Computations with animated numbers
  const totalStates = stateMachine?.states?.length || 7;
  const totalRules = rules.length || 10;
  const gatedQACount = rules.filter((r) => r.requires_inspection).length || 3;
  const gatedEvidenceCount = rules.filter((r) => r.requires_evidence).length || 4;

  const animTotalStates = useCountUp(totalStates, 600, 50);
  const animTotalRules = useCountUp(totalRules, 700, 100);
  const animGatedQA = useCountUp(gatedQACount, 650, 150);
  const animGatedEvidence = useCountUp(gatedEvidenceCount, 750, 200);

  return (
    <div className="internal-page lc-engine-page">
      {/* ─── HEADER ─── */}
      <div className="lc-header-wrapper">
        <div>
          <div className="lc-breadcrumbs">
            <Link to="/app/dashboard">Dashboard</Link>
            <span className="lc-breadcrumbs-sep">/</span>
            <Link to="/app/assets">Quality Inspection</Link>
            <span className="lc-breadcrumbs-sep">/</span>
            <span style={{ color: "var(--lc-text-highlight)" }}>Lifecycle</span>
          </div>

          <div className="lc-header-title-row">
            <h1 className="lc-header-title">
              Asset Lifecycle Engine
            </h1>
            <div className="lc-header-status-pill">
              <span className="lc-header-status-dot" />
              <span>DETERMINISTIC FSM • KAVACH CLEARED</span>
            </div>
          </div>

          <p className="lc-header-sub">
            Finite state machine governing defence asset transitions, inspection checkpoints, and cryptographic custody clearance
          </p>
        </div>

        <div className="lc-header-actions">
          <button
            id="btn-execute-transition"
            className="lc-btn-primary"
            onClick={() => {
              setTransitionForm({
                asset_id: "EF-2026-00422",
                to_state: "ACCEPTED_FOR_ASSEMBLY",
                reason: "QA bench diagnostic completed. Cryptographic hash matched on-chain ledger.",
              });
              setShowTransitionModal(true);
            }}
          >
            <span>Execute Transition</span>
            <span className="lc-btn-arrow">→</span>
          </button>

          <button
            id="btn-refresh-lifecycle"
            className="lc-btn-secondary"
            onClick={fetchRules}
            disabled={isRefreshing}
            aria-label="Refresh Lifecycle Data"
          >
            <span className={`lc-refresh-icon ${isRefreshing ? "spinning" : ""}`}>↻</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── 4 KPI METRIC CARDS ─── */}
      <div className="lc-kpi-grid">
        {/* Card 1: Total Pipeline States */}
        <div className="lc-kpi-card blue">
          <div className="lc-kpi-top">
            <span className="lc-kpi-label">TOTAL PIPELINE STATES</span>
            <div className="lc-kpi-icon-box">◈</div>
          </div>
          <div className="lc-kpi-value">{animTotalStates}</div>
          <div className="lc-kpi-sub">
            <span className="lc-kpi-dot" />
            <span>Discrete custody phases</span>
          </div>
        </div>

        {/* Card 2: Transition Rules */}
        <div className="lc-kpi-card cyan">
          <div className="lc-kpi-top">
            <span className="lc-kpi-label">TRANSITION RULES</span>
            <div className="lc-kpi-icon-box">⚙</div>
          </div>
          <div className="lc-kpi-value">{animTotalRules}</div>
          <div className="lc-kpi-sub">
            <span className="lc-kpi-dot" />
            <span>Deterministic policy gates</span>
          </div>
        </div>

        {/* Card 3: QA Inspection Gated */}
        <div className="lc-kpi-card amber">
          <div className="lc-kpi-top">
            <span className="lc-kpi-label">QA INSPECTION GATED</span>
            <div className="lc-kpi-icon-box">🔬</div>
          </div>
          <div className="lc-kpi-value">{animGatedQA}</div>
          <div className="lc-kpi-sub">
            <span className="lc-kpi-dot" />
            <span>Requires physical QA sign-off</span>
          </div>
        </div>

        {/* Card 4: Evidence Required */}
        <div className="lc-kpi-card green">
          <div className="lc-kpi-top">
            <span className="lc-kpi-label">EVIDENCE REQUIRED</span>
            <div className="lc-kpi-icon-box">🛡</div>
          </div>
          <div className="lc-kpi-value">{animGatedEvidence}</div>
          <div className="lc-kpi-sub">
            <span className="lc-kpi-dot" />
            <span>Requires SHA-256 evidence</span>
          </div>
        </div>
      </div>

      {/* ─── STATE MACHINE TOPOLOGY (HERO FEATURE) ─── */}
      {stateMachine && (
        <div className="lc-topo-card">
          <div className="lc-topo-header">
            <div className="lc-topo-title-group">
              <div className="lc-topo-headline">
                <span className="lc-topo-live-beacon" />
                <span>STATE MACHINE TOPOLOGY</span>
              </div>
              <div className="lc-topo-desc">
                Click any stage node to highlight its inbound and outbound transition policy gates
              </div>
            </div>

            {selectedState && (
              <button
                className="lc-topo-clear-btn"
                onClick={() => setSelectedState(null)}
              >
                Clear Node Selection (Show All {rules.length || 10} Rules)
              </button>
            )}
          </div>

          {/* Connected Pipeline Track with Moving Telemetry Packet */}
          <div className="lc-topo-pipeline">
            {stateMachine.states.map((state: string, idx: number) => {
              const isTerminal = stateMachine.terminal_states?.includes(state);
              const isSelected = selectedState === state;
              const isOverdue = state === "INSPECTION_OVERDUE";
              const isAccepted = state === "ACCEPTED_FOR_ASSEMBLY";
              const isRejected = state.includes("REJECT");

              let nodeClass = "lc-topo-node";
              if (isSelected) nodeClass += " selected";
              if (isOverdue) nodeClass += " state-overdue";
              else if (isAccepted) nodeClass += " state-accepted";
              else if (isRejected) nodeClass += " state-rejected";

              return (
                <div key={state} className="lc-topo-stage-wrapper">
                  <button
                    className={nodeClass}
                    onClick={() => setSelectedState(state === selectedState ? null : state)}
                    type="button"
                    aria-pressed={isSelected}
                    title={`Click to filter rules for ${state.replace(/_/g, " ")}`}
                  >
                    <div className="lc-node-header">
                      <span className="lc-node-marker" />
                      <span className="lc-node-stage-num">
                        STAGE 0{idx + 1}
                      </span>
                    </div>

                    <div className="lc-node-name">
                      {state.replace(/_/g, " ")}
                    </div>
                  </button>

                  {idx < stateMachine.states.length - 1 && (
                    <div className="lc-topo-connector" title="Deterministic State Transition Vector" />
                  )}
                </div>
              );
            })}
          </div>

          {/* FSM Specification Bar with Shimmer Beam */}
          <div className="lc-fsm-spec-bar">
            <strong>FSM Specification:</strong>
            <span>{stateMachine.description}</span>
          </div>
        </div>
      )}

      {/* ─── SECTION TABS: ASSETS TRACKER vs TRANSITION RULES ─── */}
      <div className="lc-tabs-bar">
        <button
          type="button"
          className={`lc-tab-btn ${activeTab === "assets" ? "active" : ""}`}
          onClick={() => setActiveTab("assets")}
        >
          <span>◈</span>
          <span>Asset Lifecycle Records ({lifecycleAssets.length} Active Demo Units)</span>
        </button>

        <button
          type="button"
          className={`lc-tab-btn ${activeTab === "rules" ? "active" : ""}`}
          onClick={() => setActiveTab("rules")}
        >
          <span>⚙</span>
          <span>State Transition Rules & Policy Gates ({rules.length || 10})</span>
        </button>
      </div>

      {/* ─── TAB 1: ASSET LIFECYCLE RECORDS ─── */}
      {activeTab === "assets" && (
        <div>
          {/* Filter Bar */}
          <div className="lc-filter-bar">
            <div className="lc-search-box">
              <span className="lc-search-icon">🔍</span>
              <input
                id="input-asset-search"
                type="text"
                className="lc-search-input"
                placeholder="Search tracked assets by ID, model, or serial..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
              />
            </div>

            <select
              id="select-asset-state"
              className="lc-select"
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

            <span className="lc-count-badge">
              ● Showing {filteredAssets.length} of {lifecycleAssets.length} tracked defence assets
            </span>
          </div>

          {/* Asset Records Table */}
          <div className="lc-table-card">
            <div className="lc-table-container">
              <table className="lc-table">
                <thead className="lc-table-head">
                  <tr>
                    {[
                      "Asset ID / System",
                      "Model & Serial",
                      "Current Lifecycle State",
                      "Evidence",
                      "Last Action / Actor",
                      "Cryptographic Proof",
                      "Action",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--lc-text-muted)" }}>
                        No matching defence assets found
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => {
                      const isExpanded = expandedAssetId === asset.asset_id;
                      const stagePct = Math.round((asset.stage_number / asset.total_stages) * 100);

                      return (
                        <Fragment key={asset.id}>
                          <tr className={`lc-table-row ${isExpanded ? "expanded" : ""}`}>
                            <td>
                              <div className="lc-asset-id-cell">
                                {asset.asset_id}
                              </div>
                              <div className="lc-asset-name-sub">{asset.name}</div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: "var(--lc-text-title)" }}>{asset.model}</div>
                              <div style={{ fontSize: "0.6875rem", color: "var(--lc-text-muted)", fontFamily: "monospace" }}>
                                {asset.serial}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <StatusBadge status={asset.lifecycle_state as any} size="sm" />
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <div className="lc-progress-track">
                                    <div
                                      className="lc-progress-bar"
                                      style={{
                                        width: `${stagePct}%`,
                                        background:
                                          asset.lifecycle_state === "REJECTED_QUARANTINED"
                                            ? "#ef4444"
                                            : asset.lifecycle_state === "ACCEPTED_FOR_ASSEMBLY"
                                            ? "#22c55e"
                                            : asset.lifecycle_state === "INSPECTION_OVERDUE"
                                            ? "#f59e0b"
                                            : "#3b82f6",
                                      }}
                                    />
                                  </div>
                                  <span style={{ fontSize: "0.625rem", color: "var(--lc-text-muted)" }}>
                                    {asset.stage_number}/{asset.total_stages}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  color: asset.evidence_status === "Failed" ? "#ef4444" : "#22c55e",
                                }}
                              >
                                {asset.evidence_count}
                              </span>
                            </td>

                            <td>
                              <div style={{ fontSize: "0.75rem", color: "var(--lc-text-title)", fontWeight: 600 }}>
                                {asset.last_transition_actor}
                              </div>
                              <div style={{ fontSize: "0.6875rem", color: "var(--lc-text-muted)" }}>
                                {asset.last_transition_date}
                              </div>
                            </td>

                            <td>
                              <span
                                className={`lc-proof-pill ${
                                  asset.proof_status === "Anchored"
                                    ? "anchored"
                                    : asset.proof_status === "Quarantined"
                                    ? "quarantined"
                                    : "pending"
                                }`}
                              >
                                ⬡ {asset.blockchain_tx}
                              </span>
                            </td>

                            <td>
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <button
                                  className="lc-btn-primary"
                                  style={{ fontSize: "0.6875rem", padding: "5px 10px" }}
                                  onClick={() => openTransitionForAsset(asset.asset_id, asset.lifecycle_state)}
                                >
                                  Transition →
                                </button>
                                <button
                                  className="lc-btn-secondary"
                                  style={{
                                    fontSize: "0.6875rem",
                                    padding: "5px 10px",
                                    color: isExpanded ? "#60a5fa" : "var(--lc-text-muted)",
                                    borderColor: isExpanded ? "#3b82f6" : "var(--lc-border)",
                                  }}
                                  onClick={() => setExpandedAssetId(isExpanded ? null : asset.asset_id)}
                                >
                                  {isExpanded ? "Hide Audit" : "Audit Trail ▼"}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* EXPANDABLE AUDIT TRAIL TIMELINE */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} style={{ padding: 0 }}>
                                <div className="lc-audit-trail-container">
                                  <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#60a5fa", display: "flex", alignItems: "center", gap: 6 }}>
                                      <span>🔒 Cryptographic Custody Trail:</span>
                                      <span style={{ color: "var(--lc-text-title)" }}>{asset.asset_id} — {asset.name}</span>
                                    </div>
                                    <span style={{ fontSize: "0.75rem", color: "var(--lc-text-muted)" }}>
                                      Supplier: {asset.supplier}
                                    </span>
                                  </div>

                                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginLeft: 6 }}>
                                    {asset.history.map((step, sIdx) => (
                                      <div key={sIdx} className="lc-audit-step">
                                        <div className={`lc-audit-node-dot ${sIdx === 0 ? "start" : ""}`} />
                                        {sIdx < asset.history.length - 1 && <div className="lc-audit-line" />}
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--lc-text-title)" }}>
                                              {step.state}
                                            </span>
                                            <span style={{ fontSize: "0.6875rem", color: "var(--lc-text-muted)" }}>
                                              {step.date}
                                            </span>
                                            <span style={{ fontSize: "0.6875rem", color: "#60a5fa" }}>
                                              by {step.actor}
                                            </span>
                                            <span style={{ fontSize: "0.625rem", fontFamily: "monospace", color: "var(--lc-text-muted)", marginLeft: "auto" }}>
                                              Tx: {step.txHash}
                                            </span>
                                          </div>
                                          <div style={{ fontSize: "0.75rem", color: "var(--lc-text-body)", marginTop: 2 }}>
                                            {step.details}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TRANSITION RULES & POLICY GATES ─── */}
      {activeTab === "rules" && (
        <div>
          {/* Filter Bar */}
          <div className="lc-filter-bar">
            <div className="lc-search-box">
              <span className="lc-search-icon">🔍</span>
              <input
                id="input-rule-search"
                type="text"
                className="lc-search-input"
                placeholder="Filter rules by origin, destination, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              id="select-rule-role"
              className="lc-select"
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

            <span className="lc-count-badge">
              ● Showing {filteredRules.length} of {rules.length} transition rules
            </span>
          </div>

          {/* Rules Table */}
          <div className="lc-table-card">
            <div className="lc-table-container">
              <table className="lc-table">
                <thead className="lc-table-head">
                  <tr>
                    {["Origin State", "Destination State", "Authorized Role", "Evidence Gate", "QA Inspection Gate", "Rule Description"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center", color: "var(--lc-text-muted)" }}>
                        <div style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "lcSpin 1s linear infinite", marginBottom: 8 }} />
                        <div>Compiling lifecycle state machine rules...</div>
                      </td>
                    </tr>
                  ) : filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--lc-text-muted)" }}>
                        No matching transition rules found
                      </td>
                    </tr>
                  ) : (
                    filteredRules.map((rule: any, idx: number) => (
                      <tr key={idx} className="lc-table-row">
                        <td style={{ fontWeight: 700, color: "var(--lc-text-title)" }}>
                          {rule.from_state}
                        </td>
                        <td style={{ fontWeight: 700, color: "#22c55e" }}>
                          → {rule.to_state}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "3px 10px",
                              background: "rgba(168, 85, 247, 0.12)",
                              border: "1px solid rgba(168, 85, 247, 0.3)",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#c084fc",
                            }}
                          >
                            {rule.allowed_role}
                          </span>
                        </td>
                        <td>
                          {rule.requires_evidence ? (
                            <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.8125rem" }}>✓ Required</span>
                          ) : (
                            <span style={{ color: "var(--lc-text-muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {rule.requires_inspection ? (
                            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.8125rem" }}>✓ Required</span>
                          ) : (
                            <span style={{ color: "var(--lc-text-muted)" }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: "0.8125rem", color: "var(--lc-text-body)" }}>
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

      {/* ─── EXECUTE TRANSITION MODAL ─── */}
      {showTransitionModal && (
        <div
          className="lc-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTransitionModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-transition-title"
        >
          <div className="lc-modal-card">
            <div className="lc-modal-header">
              <div>
                <h3 id="modal-transition-title" className="lc-modal-title">
                  Execute Lifecycle State Transition
                </h3>
                <div style={{ fontSize: "0.75rem", color: "var(--lc-text-muted)", marginTop: 2 }}>
                  Advance defence asset through cryptographic policy gates
                </div>
              </div>
              <button
                type="button"
                className="lc-modal-close"
                onClick={() => setShowTransitionModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Quick Fill Dummy Asset Selector for Testing */}
            <div className="lc-quick-fill-box">
              <div className="lc-quick-fill-label">
                ⚡ Quick Fill Asset for Testing:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {lifecycleAssets.slice(0, 4).map((a) => (
                  <button
                    key={a.asset_id}
                    type="button"
                    className={`lc-quick-btn ${transitionForm.asset_id === a.asset_id ? "active" : ""}`}
                    onClick={() => quickFillDummyAsset(a)}
                  >
                    {a.asset_id} ({a.lifecycle_state.split("_")[0]})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleTransition} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--lc-text-title)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Target Asset ID *
                </label>
                <input
                  type="text"
                  className="lc-search-input"
                  style={{ height: 42, paddingLeft: 14 }}
                  value={transitionForm.asset_id}
                  onChange={(e) => setTransitionForm({ ...transitionForm, asset_id: e.target.value })}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--lc-text-title)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Target Lifecycle State *
                </label>
                <select
                  className="lc-select"
                  style={{ width: "100%", height: 42 }}
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
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--lc-text-title)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Transition Justification & Reason *
                </label>
                <textarea
                  className="lc-search-input"
                  style={{ width: "100%", height: 80, padding: "10px 14px", resize: "vertical" }}
                  value={transitionForm.reason}
                  onChange={(e) => setTransitionForm({ ...transitionForm, reason: e.target.value })}
                  placeholder="State reason for advancing asset to next lifecycle stage..."
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="lc-btn-secondary"
                  onClick={() => setShowTransitionModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lc-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="lc-refresh-icon spinning">↻</span>
                      Transitioning...
                    </>
                  ) : (
                    "Execute Transition"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
