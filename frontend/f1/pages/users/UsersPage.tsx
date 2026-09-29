import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { formatDateTime } from "../../data/utils";
import { usersService, UserResponse } from "../../services/users";
import "./UsersPage.css";

/* ── Count-up Hook for KPI Numbers ─────────────────────────────────── */
function useCountUp(target: number, duration = 750, delay = 0): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
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

/* ── Mini Sparkline Visualization for KPI Cards ─────────────────────── */
function KpiMiniSparkline({ color = "#3b82f6", variant = 1 }: { color?: string; variant?: number }) {
  const paths: Record<number, string> = {
    1: "M 0,16 Q 14,8 28,12 T 56,4",
    2: "M 0,18 Q 14,14 28,6 T 56,3",
    3: "M 0,15 Q 16,18 32,8 T 56,4",
    4: "M 0,17 Q 15,12 30,14 T 56,5",
    5: "M 0,18 Q 14,8 28,12 T 56,3",
    6: "M 0,16 Q 16,14 32,6 T 56,4",
  };
  const pathD = paths[variant] || paths[1];

  return (
    <svg className="users-kpi-sparkline" viewBox="0 0 58 20" fill="none">
      <defs>
        <linearGradient id={`userSparkGrad-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L 58,20 L 0,20 Z`} fill={`url(#userSparkGrad-${variant})`} />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        className="users-sparkline-path"
      />
    </svg>
  );
}

/* ── Reference-Style Role Pill Component ────────────────────────────── */
function RolePill({ roleStr }: { roleStr: string }) {
  const r = (roleStr || "").toLowerCase();

  if (r.includes("system") && r.includes("admin")) {
    return <span className="role-pill role-pill-admin">SYSTEM_ADMIN</span>;
  }
  if (r.includes("supply") || r.includes("creator") || r.includes("procurement") || r.includes("nft")) {
    return <span className="role-pill role-pill-creator">PROCUREMENT_SUPPLY_CHAIN_OFFICER</span>;
  }
  if (r.includes("inspect") || r.includes("tech") || r.includes("quality")) {
    return <span className="role-pill role-pill-tech">QUALITY_INSPECTOR</span>;
  }
  if (r.includes("audit")) {
    return <span className="role-pill role-pill-auditor">AUDITOR</span>;
  }

  return (
    <span
      className="role-pill"
      style={{ background: "#334155", color: "#e2e8f0", border: "1px solid #475569" }}
    >
      {roleStr.toUpperCase()}
    </span>
  );
}

/* ── Background Identity Network Atmosphere for Header ──────────────── */
function HeroIdentityBackground() {
  return (
    <svg className="users-header-bg-visual" viewBox="0 0 500 160" fill="none">
      <defs>
        <radialGradient id="userIdentityGlow" cx="60%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#08131f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient radar circular arcs */}
      <circle cx="340" cy="80" r="110" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" strokeDasharray="4 6" fill="url(#userIdentityGlow)" />
      <circle cx="340" cy="80" r="75" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
      <circle cx="340" cy="80" r="40" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1" strokeDasharray="2 4" />

      {/* Axis guidelines */}
      <line x1="230" y1="80" x2="450" y2="80" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
      <line x1="340" y1="0" x2="340" y2="160" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />

      {/* Connecting mesh lines */}
      <path d="M 210,100 L 290,50 L 340,80 L 410,40 L 440,110 L 340,80" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Cyan pulsing nodes */}
      <circle cx="210" cy="100" r="3" fill="#38bdf8" className="users-node-pulse-cyan" />
      <circle cx="290" cy="50" r="3.5" fill="#60a5fa" className="users-node-pulse-blue" />
      <circle cx="410" cy="40" r="3" fill="#38bdf8" className="users-node-pulse-cyan" />
      <circle cx="440" cy="110" r="3.5" fill="#22c55e" className="users-node-pulse-green" />

      {/* Central Identity Shield emblem */}
      <g transform="translate(340, 80)">
        <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="rgba(14, 165, 233, 0.15)" stroke="#38bdf8" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="3" fill="#38bdf8" />
      </g>
    </svg>
  );
}

/* ── User Ecosystem Interactive Visualization ───────────────────────── */
function UserEcosystemGraphic() {
  return (
    <div className="users-ecosystem-svg-box">
      <svg className="users-ecosystem-svg" viewBox="0 0 280 240" fill="none">
        <defs>
          <radialGradient id="ecoShieldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="ecoStreamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Outer concentric orbit ring (Clockwise 34s) */}
        <g className="users-orbit-ring-outer">
          <ellipse cx="140" cy="120" rx="120" ry="85" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="140" cy="35" r="3" fill="#38bdf8" />
          <circle cx="260" cy="120" r="2.5" fill="#3b82f6" />
        </g>

        {/* Traveling node on outer ring (12s orbit) */}
        <g className="users-orbit-traveler">
          <circle cx="140" cy="35" r="4.5" fill="#22c55e" style={{ filter: "drop-shadow(0 0 6px #22c55e)" }} />
        </g>

        {/* Inner concentric orbit ring (Counter-clockwise 26s) */}
        <g className="users-orbit-ring-inner">
          <ellipse cx="140" cy="120" rx="90" ry="60" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="140" cy="60" r="2" fill="#93c5fd" />
          <circle cx="230" cy="120" r="2" fill="#93c5fd" />
        </g>

        {/* Central Vertical Telemetry Line with Traveling Data Packet */}
        <line x1="140" y1="52" x2="140" y2="205" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1.5" />
        <line x1="140" y1="52" x2="140" y2="205" stroke="url(#ecoStreamGrad)" strokeWidth="2.5" className="users-packet-stream" strokeLinecap="round" />

        {/* Top Central Shield with Breathing Glow */}
        <g className="users-shield-center" transform="translate(140, 36)">
          <circle cx="0" cy="0" r="22" fill="url(#ecoShieldGlow)" />
          <path
            d="M 0,-14 L 12,-6 L 12,5 Q 12,14 0,18 Q -12,14 -12,5 L -12,-6 Z"
            fill="rgba(14, 165, 233, 0.25)"
            stroke="#38bdf8"
            strokeWidth="1.6"
          />
          <path d="M -4,2 L -1,5 L 5,-2" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* ── Tier 1: IDENTITY (Cyan) ──────────────── */}
        <g transform="translate(140, 82)">
          <ellipse cx="0" cy="0" rx="56" ry="12" fill="rgba(14, 165, 233, 0.12)" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="-56" cy="0" r="3" fill="#38bdf8" className="users-node-pulse-cyan" />
          <circle cx="56" cy="0" r="3" fill="#38bdf8" className="users-node-pulse-cyan" />
          <text x="0" y="3.5" fill="#38bdf8" fontSize="8.5" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">
            IDENTITY
          </text>
        </g>

        {/* ── Tier 2: ROLE (Blue) ──────────────────── */}
        <g transform="translate(140, 122)">
          <ellipse cx="0" cy="0" rx="52" ry="11" fill="rgba(37, 99, 235, 0.12)" stroke="#3b82f6" strokeWidth="1.2" />
          <circle cx="-52" cy="0" r="3" fill="#3b82f6" className="users-node-pulse-blue" />
          <circle cx="52" cy="0" r="3" fill="#3b82f6" className="users-node-pulse-blue" />
          <text x="0" y="3.5" fill="#60a5fa" fontSize="8.5" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">
            ROLE
          </text>
        </g>

        {/* ── Tier 3: ACCESS (Indigo) ──────────────── */}
        <g transform="translate(140, 162)">
          <ellipse cx="0" cy="0" rx="48" ry="10" fill="rgba(99, 102, 241, 0.12)" stroke="#6366f1" strokeWidth="1.2" />
          <circle cx="-48" cy="0" r="3" fill="#6366f1" className="users-node-pulse-indigo" />
          <circle cx="48" cy="0" r="3" fill="#6366f1" className="users-node-pulse-indigo" />
          <text x="0" y="3.5" fill="#818cf8" fontSize="8.5" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">
            ACCESS
          </text>
        </g>

        {/* ── Tier 4: TRUST (Green / Emerald) ──────── */}
        <g transform="translate(140, 202)">
          <ellipse cx="0" cy="0" rx="44" ry="10" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="1.4" style={{ filter: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.45))" }} />
          <circle cx="-44" cy="0" r="3.5" fill="#22c55e" className="users-node-pulse-green" />
          <circle cx="44" cy="0" r="3.5" fill="#22c55e" className="users-node-pulse-green" />
          <text x="0" y="3.5" fill="#22c55e" fontSize="8.5" fontWeight="800" textAnchor="middle" letterSpacing="0.12em">
            TRUST
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN USERS PAGE COMPONENT
   ════════════════════════════════════════════════════════════════════ */
export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "quality-inspector" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* Search & Multi-Filter States */
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [identityFilter, setIdentityFilter] = useState("ALL");

  /* Copy feedback state */
  const [copiedDid, setCopiedDid] = useState<string | null>(null);

  /* Contextual three-dot action popover */
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  /* User Identity Details Modal */
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserResponse | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await usersService.listUsers({ page_size: 100 });
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* Viewport scroll lock for Invite New User modal */
  useEffect(() => {
    if (!showInviteModal) return;

    const windowScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const mainEl = document.querySelector(".app-main-content") as HTMLElement | null;
    const mainScrollTop = mainEl ? mainEl.scrollTop : 0;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalMainOverflow = mainEl ? mainEl.style.overflow : undefined;

    // Compensate for scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (mainEl) {
      mainEl.style.overflow = "hidden";
      if (mainEl.scrollTop !== mainScrollTop) {
        mainEl.scrollTop = mainScrollTop;
      }
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (mainEl && originalMainOverflow !== undefined) {
        mainEl.style.overflow = originalMainOverflow;
        mainEl.scrollTop = mainScrollTop;
      }
      window.scrollTo(0, windowScrollY);
    };
  }, [showInviteModal]);

  /* Close action popover on click outside or Escape key */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActionMenuOpenId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActionMenuOpenId(null);
        setSelectedUserDetail(null);
        setShowInviteModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleCopyDid = (did: string) => {
    if (!did) return;
    navigator.clipboard?.writeText(did);
    setCopiedDid(did);
    setTimeout(() => setCopiedDid(null), 1800);
  };

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.name || !inviteForm.role) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await usersService.inviteUser(inviteForm);
      setShowInviteModal(false);
      setInviteForm({ email: "", name: "", role: "quality-inspector" });
      fetchUsers();
    } catch (err: any) {
      setError(err?.message || "Failed to invite user");
    } finally {
      setSubmitting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setIdentityFilter("ALL");
  };

  /* ── Filtered Users Calculation (Multi-Filter + Search Combined) ─── */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query (name, email, did, roles)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (u.name || "").toLowerCase().includes(q);
        const matchesEmail = (u.email || "").toLowerCase().includes(q);
        const matchesDid = (u.did || "").toLowerCase().includes(q);
        const matchesRole = (u.roles || []).some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesDid && !matchesRole) return false;
      }

      // 2. Role Filter
      if (roleFilter !== "ALL") {
        const userRoles = (u.roles || []).map((r) => r.toLowerCase());
        if (roleFilter === "ADMIN" && !userRoles.some((r) => r.includes("system") && r.includes("admin"))) return false;
        if (roleFilter === "CREATOR" && !userRoles.some((r) => r.includes("supply") || r.includes("creator") || r.includes("procurement") || r.includes("nft"))) return false;
        if (roleFilter === "TECH" && !userRoles.some((r) => r.includes("inspect") || r.includes("tech") || r.includes("quality"))) return false;
        if (roleFilter === "AUDITOR" && !userRoles.some((r) => r.includes("audit"))) return false;
      }

      // 3. Status Filter
      if (statusFilter !== "ALL") {
        const s = (u.status || "ACTIVE").toUpperCase();
        if (statusFilter === "ACTIVE" && s !== "ACTIVE") return false;
        if (statusFilter === "INACTIVE" && (s === "ACTIVE")) return false;
      }

      // 4. Identity Filter
      if (identityFilter !== "ALL") {
        const idStatus = (u.identity_status || "VERIFIED").toUpperCase();
        if (identityFilter === "VERIFIED" && idStatus !== "VERIFIED") return false;
        if (identityFilter === "UNVERIFIED" && idStatus === "VERIFIED") return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter, identityFilter]);

  /* ── Dynamic KPI Stats from Real User Data ───────────────────────── */
  const totalCount = users.length;
  const activeCount = users.filter((u) => (u.status || "ACTIVE").toUpperCase() === "ACTIVE").length;
  const adminCount = users.filter((u) => u.roles?.some((r) => r.toLowerCase().includes("admin"))).length;
  const techCount = users.filter((u) => u.roles?.some((r) => r.toLowerCase().includes("inspect") || r.toLowerCase().includes("tech") || r.toLowerCase().includes("quality"))).length;
  const creatorCount = users.filter((u) => u.roles?.some((r) => r.toLowerCase().includes("supply") || r.toLowerCase().includes("creator") || r.toLowerCase().includes("procurement") || r.toLowerCase().includes("nft"))).length;
  const auditorCount = users.filter((u) => u.roles?.some((r) => r.toLowerCase().includes("audit"))).length;

  const adminPct = totalCount > 0 ? Math.round((adminCount / totalCount) * 100) : 0;
  const techPct = totalCount > 0 ? Math.round((techCount / totalCount) * 100) : 0;
  const creatorPct = totalCount > 0 ? Math.round((creatorCount / totalCount) * 100) : 0;
  const auditorPct = totalCount > 0 ? Math.round((auditorCount / totalCount) * 100) : 0;

  /* Animated KPI count-up values */
  const animatedTotal   = useCountUp(totalCount, 600, 50);
  const animatedActive  = useCountUp(activeCount, 600, 100);
  const animatedAdmin   = useCountUp(adminCount, 600, 150);
  const animatedTech    = useCountUp(techCount, 600, 200);
  const animatedCreator = useCountUp(creatorCount, 600, 250);
  const animatedAuditor = useCountUp(auditorCount, 600, 300);

  const hasActiveFilters = searchQuery.trim() !== "" || roleFilter !== "ALL" || statusFilter !== "ALL" || identityFilter !== "ALL";

  return (
    <div className="users-page-container page-fade">
      {/* ── 1. USERS HEADER SECTION ────────────────────────────────── */}
      <div className="users-header-card">
        <HeroIdentityBackground />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="users-breadcrumb">
            <Link to="/app/dashboard" className="users-breadcrumb-link">Dashboard</Link>
            <span>›</span>
            <span>Users</span>
          </div>

          <div className="users-title-group">
            <div className="users-title-icon-badge">
              <span>👥</span>
            </div>
            <div>
              <h1 className="users-page-title">Users</h1>
              <p className="users-page-subtitle">
                Manage platform users, identities, and role assignments
              </p>
            </div>
          </div>
        </div>

        <div className="users-header-actions">
          <div className="users-rbac-badge">
            <span style={{ fontSize: "0.9rem", color: "#38bdf8" }}>🛡</span>
            <span>
              IDENTITY MANAGEMENT · <span className="users-rbac-strong">SECURE RBAC</span>
            </span>
          </div>

          <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
            + Invite User
          </button>
        </div>
      </div>

      {/* ── 2. 6-CARD IDENTITY KPI STRIP ───────────────────────────── */}
      <div className="users-kpi-grid">
        {/* 1. Total Users */}
        <div className="users-kpi-card">
          <div className="users-kpi-header">
            <div className="users-kpi-icon-bubble" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
              👤
            </div>
            <span className="users-kpi-label">TOTAL USERS</span>
          </div>
          <div className="users-kpi-main">
            <span className="users-kpi-val">{animatedTotal}</span>
            <span className="users-kpi-badge" style={{ color: "#22c55e" }}>
              ↑ 0%
            </span>
          </div>
          <div className="users-kpi-bottom">
            <span className="users-kpi-sub">Platform identities</span>
            <KpiMiniSparkline color="#3b82f6" variant={1} />
          </div>
        </div>

        {/* 2. Active Users */}
        <div className="users-kpi-card">
          <div className="users-kpi-header">
            <div className="users-kpi-icon-bubble" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
              👤
            </div>
            <span className="users-kpi-label">ACTIVE USERS</span>
          </div>
          <div className="users-kpi-main">
            <span className="users-kpi-val">{animatedActive}</span>
            <span className="users-kpi-badge" style={{ color: "#22c55e" }}>
              ↑ 0%
            </span>
          </div>
          <div className="users-kpi-bottom">
            <span className="users-kpi-sub">Currently enabled</span>
            <KpiMiniSparkline color="#22c55e" variant={2} />
          </div>
        </div>

        {/* 3. Administrators */}
        <div className="users-kpi-card">
          <div className="users-kpi-header">
            <div className="users-kpi-icon-bubble" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
              👤
            </div>
            <span className="users-kpi-label">ADMINISTRATORS</span>
          </div>
          <div className="users-kpi-main">
            <span className="users-kpi-val">{animatedAdmin}</span>
            <span className="users-kpi-badge" style={{ color: "#ef4444" }}>
              {adminPct}%
            </span>
          </div>
          <div className="users-kpi-bottom">
            <span className="users-kpi-sub">Full access</span>
            <KpiMiniSparkline color="#ef4444" variant={3} />
          </div>
        </div>

        {/* 4. Technicians */}
        <div className="users-kpi-card">
          <div className="users-kpi-header">
            <div className="users-kpi-icon-bubble" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
              👤
            </div>
            <span className="users-kpi-label">TECHNICIANS</span>
          </div>
          <div className="users-kpi-main">
            <span className="users-kpi-val">{animatedTech}</span>
            <span className="users-kpi-badge" style={{ color: "#f59e0b" }}>
              {techPct}%
            </span>
          </div>
          <div className="users-kpi-bottom">
            <span className="users-kpi-sub">Technical access</span>
            <KpiMiniSparkline color="#f59e0b" variant={4} />
          </div>
        </div>

        {/* 5. Creators */}
        <div className="users-kpi-card">
          <div className="users-kpi-header">
            <div className="users-kpi-icon-bubble" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
              👤
            </div>
            <span className="users-kpi-label">CREATORS</span>
          </div>
          <div className="users-kpi-main">
            <span className="users-kpi-val">{animatedCreator}</span>
            <span className="users-kpi-badge" style={{ color: "#8b5cf6" }}>
              {creatorPct}%
            </span>
          </div>
          <div className="users-kpi-bottom">
            <span className="users-kpi-sub">Asset & NFT</span>
            <KpiMiniSparkline color="#8b5cf6" variant={5} />
          </div>
        </div>

        {/* 6. Auditors */}
        <div className="users-kpi-card">
          <div className="users-kpi-header">
            <div className="users-kpi-icon-bubble" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
              👤
            </div>
            <span className="users-kpi-label">AUDITORS</span>
          </div>
          <div className="users-kpi-main">
            <span className="users-kpi-val">{animatedAuditor}</span>
            <span className="users-kpi-badge" style={{ color: "#06b6d4" }}>
              {auditorPct}%
            </span>
          </div>
          <div className="users-kpi-bottom">
            <span className="users-kpi-sub">Compliance & audit</span>
            <KpiMiniSparkline color="#06b6d4" variant={6} />
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & FILTER TOOLBAR ─────────────────────────────── */}
      <div className="users-toolbar">
        <div className="users-search-box">
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>🔍</span>
          <input
            type="text"
            className="users-search-input"
            placeholder="Search users, DID, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.75rem" }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="users-filter-group">
          {/* Role Filter */}
          <select
            className="users-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">SYSTEM_ADMIN</option>
            <option value="CREATOR">PROCUREMENT_SUPPLY_CHAIN_OFFICER</option>
            <option value="TECH">QUALITY_INSPECTOR</option>
            <option value="AUDITOR">AUDITOR</option>
          </select>

          {/* Status Filter */}
          <select
            className="users-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Identity Filter */}
          <select
            className="users-select"
            value={identityFilter}
            onChange={(e) => setIdentityFilter(e.target.value)}
            aria-label="Filter by identity"
          >
            <option value="ALL">All Identity</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>

          {/* Refresh Action Button */}
          <button
            className={`users-refresh-btn ${isRefreshing ? "spinning" : ""}`}
            onClick={fetchUsers}
            disabled={loading || isRefreshing}
            title="Refresh user directory"
          >
            <span className="users-refresh-icon">↻</span>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── 3B. ACTIVE FILTER CHIPS (IF ANY FILTER IS ACTIVE) ──────── */}
      {hasActiveFilters && (
        <div className="users-filter-chips">
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Active Filters:
          </span>

          {searchQuery.trim() && (
            <span className="users-filter-chip">
              <span>Query: "{searchQuery}"</span>
              <button className="users-chip-remove" onClick={() => setSearchQuery("")} title="Remove search filter">✕</button>
            </span>
          )}

          {roleFilter !== "ALL" && (
            <span className="users-filter-chip">
              <span>Role: {roleFilter === "CREATOR" ? "Creator / NFT" : roleFilter}</span>
              <button className="users-chip-remove" onClick={() => setRoleFilter("ALL")} title="Remove role filter">✕</button>
            </span>
          )}

          {statusFilter !== "ALL" && (
            <span className="users-filter-chip">
              <span>Status: {statusFilter}</span>
              <button className="users-chip-remove" onClick={() => setStatusFilter("ALL")} title="Remove status filter">✕</button>
            </span>
          )}

          {identityFilter !== "ALL" && (
            <span className="users-filter-chip">
              <span>Identity: {identityFilter}</span>
              <button className="users-chip-remove" onClick={() => setIdentityFilter("ALL")} title="Remove identity filter">✕</button>
            </span>
          )}

          <button className="users-clear-all-btn" onClick={clearAllFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* ── 4. MAIN SPLIT: TABLE (74%) + USER ECOSYSTEM (26%) ──────── */}
      <div className="users-main-split">
        {/* Left Column: User Directory Table */}
        <div className="users-table-card">
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  {["User", "DID", "Role", "Identity", "Status", "Last Active", "Action"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px 0", textAlign: "center", color: "#64748b" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span className="users-refresh-icon" style={{ animation: "usersSpin 0.8s linear infinite", display: "inline-block" }}>↻</span>
                        <span>Loading user directory from blockchain node...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "50px 0", textAlign: "center" }}>
                      <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>🛡</div>
                      {hasActiveFilters ? (
                        <>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)" }}>
                            NO USERS MATCH THE CURRENT FILTERS
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
                            Try adjusting your search terms, role selection, or status filters.
                          </div>
                          <button
                            className="btn-primary"
                            onClick={clearAllFilters}
                            style={{ marginTop: 14, fontSize: "0.75rem", padding: "6px 16px" }}
                          >
                            Clear Filters
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)" }}>
                            IDENTITY DIRECTORY EMPTY
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
                            No platform users are currently available on this node.
                          </div>
                          <button
                            className="btn-primary"
                            onClick={() => setShowInviteModal(true)}
                            style={{ marginTop: 14, fontSize: "0.75rem", padding: "6px 16px" }}
                          >
                            + Invite User
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => {
                    const initials = u.name
                      ? u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                      : "U";
                    const roleLabel = u.roles?.[0] || "User";
                    const isVerified = (u.identity_status || "VERIFIED").toUpperCase() === "VERIFIED";
                    const isActive = (u.status || "ACTIVE").toUpperCase() === "ACTIVE";
                    const isMenuOpen = actionMenuOpenId === u.id;
                    const didValue = u.did || "did:bel:actor:001";

                    return (
                      <tr key={u.id || idx} className="users-table-row">
                        {/* USER */}
                        <td>
                          <div className="users-user-cell">
                            <div className="users-avatar">
                              {initials}
                            </div>
                            <div>
                              <div className="users-name-text">{u.name}</div>
                              <div className="users-email-text">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* DID */}
                        <td>
                          <div className="users-did-box">
                            <span>{didValue}</span>
                            <button
                              className="users-copy-btn"
                              onClick={() => handleCopyDid(didValue)}
                              title={copiedDid === didValue ? "Copied!" : "Copy DID"}
                              aria-label="Copy DID"
                            >
                              {copiedDid === didValue ? "✓" : "❐"}
                            </button>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td>
                          <RolePill roleStr={roleLabel} />
                        </td>

                        {/* IDENTITY */}
                        <td>
                          {isVerified ? (
                            <span className="users-verified-badge">
                              <span style={{ fontSize: "0.8rem" }}>🛡</span>
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="users-unverified-badge">
                              <span style={{ fontSize: "0.8rem" }}>⏳</span>
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td>
                          <div className="users-status-cell">
                            {isActive ? (
                              <>
                                <span className="users-dot-pulse" />
                                <span style={{ color: "#22c55e" }}>Active</span>
                              </>
                            ) : (
                              <>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#64748b", display: "inline-block" }} />
                                <span style={{ color: "#64748b" }}>Inactive</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* LAST ACTIVE */}
                        <td style={{ fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                          {formatDateTime(u.last_active)}
                        </td>

                        {/* ACTION */}
                        <td style={{ position: "relative" }}>
                          <button
                            className="users-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenId(isMenuOpen ? null : u.id);
                            }}
                            title="Open contextual action menu"
                            aria-label={`Actions for ${u.name}`}
                          >
                            ···
                          </button>

                          {/* Interactive Contextual Three-Dot Popover */}
                          {isMenuOpen && (
                            <div
                              ref={popoverRef}
                              className="users-popover-menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* 1. View User Details */}
                              <button
                                className="users-popover-item"
                                onClick={() => {
                                  setSelectedUserDetail(u);
                                  setActionMenuOpenId(null);
                                }}
                              >
                                <span style={{ color: "#38bdf8" }}>👁</span>
                                <span>View Details</span>
                              </button>

                              {/* 2. Copy DID */}
                              <button
                                className="users-popover-item"
                                onClick={() => {
                                  handleCopyDid(didValue);
                                  setActionMenuOpenId(null);
                                }}
                              >
                                <span>❐</span>
                                <span>{copiedDid === didValue ? "Copied!" : "Copy DID"}</span>
                              </button>

                              {/* 3. Contact User */}
                              <a
                                href={`mailto:${u.email}`}
                                className="users-popover-item"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <span>✉</span>
                                <span>Contact User</span>
                              </a>

                              <div className="users-popover-divider" />

                              {/* 4. Close */}
                              <button
                                className="users-popover-item"
                                onClick={() => setActionMenuOpenId(null)}
                                style={{ color: "#64748b" }}
                              >
                                <span>✕</span>
                                <span>Close</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="users-table-footer">
            <span>
              Showing {filteredUsers.length} of {totalCount} users (Powered by Backend API)
            </span>
            <div className="users-pagination">
              <button className="users-page-btn" disabled>‹</button>
              <button className="users-page-btn active">1</button>
              <button className="users-page-btn" disabled>›</button>
            </div>
          </div>
        </div>

        {/* Right Column: User Ecosystem + Trust Quote Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* USER ECOSYSTEM CARD */}
          <div className="users-ecosystem-card">
            <div className="users-ecosystem-title">USER ECOSYSTEM</div>
            <div className="users-ecosystem-sub">IDENTITY → ROLE → ACCESS → TRUST</div>

            <UserEcosystemGraphic />

            <div className="users-ecosystem-caption">
              A SECURE DEFENCE WORKFORCE BUILDS A STRONGER NATION
            </div>
          </div>

          {/* TRUST QUOTE CARD */}
          <div className="users-quote-card">
            <span className="users-quote-icon">“</span>
            <div>
              <p className="users-quote-text">
                Trusted people. Trusted infrastructure. A safer tomorrow.
              </p>
              <div className="users-quote-author">
                — NOVEXA DEFENCE TRUST
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. SYSTEM FOOTER / STATUS STRIP ────────────────────────── */}
      <div className="users-footer-bar">
        <div className="users-footer-left">
          <span style={{ fontWeight: 800, color: "#38bdf8" }}>NOVEXA DEFENCE TRUST</span>
          <span>·</span>
          <span>BLOCKCHAIN</span>
          <span>·</span>
          <span>INTEGRITY</span>
          <span>·</span>
          <span>TRANSPARENCY</span>
          <span>·</span>
          <span>SECURITY</span>
          <span>·</span>
          <span>SOVEREIGNTY</span>
        </div>

        <div className="users-footer-right">
          <span className="users-system-op">
            <span className="users-dot-pulse" />
            SYSTEM OPERATIONAL
          </span>
          <span>v2.4.0</span>
        </div>
      </div>

      {/* ── 6. USER IDENTITY DETAILS MODAL ─────────────────────────── */}
      {selectedUserDetail && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedUserDetail(null)}
        >
          <div
            className="users-table-card"
            style={{ width: 520, maxWidth: "92%", padding: 0, animation: "usersCardEntrance 0.25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-subtle, #152b4a)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#38bdf8", fontSize: "1.2rem" }}>🛡</span>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)", margin: 0 }}>
                  User Identity Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Header profile info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div className="users-avatar" style={{ width: 48, height: 48, fontSize: "1rem" }}>
                  {selectedUserDetail.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)" }}>
                    {selectedUserDetail.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {selectedUserDetail.email}
                  </div>
                </div>
              </div>

              {/* Identity Telemetry Matrix */}
              <div className="users-details-modal-grid">
                <div className="users-detail-item">
                  <div className="users-detail-label">DECENTRALIZED ID (DID)</div>
                  <div className="users-detail-value" style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#38bdf8" }}>
                    {selectedUserDetail.did || "did:bel:actor:001"}
                  </div>
                </div>

                <div className="users-detail-item">
                  <div className="users-detail-label">RBAC ROLE</div>
                  <div className="users-detail-value" style={{ marginTop: 6 }}>
                    <RolePill roleStr={selectedUserDetail.roles?.[0] || "User"} />
                  </div>
                </div>

                <div className="users-detail-item">
                  <div className="users-detail-label">IDENTITY VERIFICATION</div>
                  <div className="users-detail-value" style={{ marginTop: 6 }}>
                    {(selectedUserDetail.identity_status || "VERIFIED").toUpperCase() === "VERIFIED" ? (
                      <span className="users-verified-badge">
                        <span>🛡</span>
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="users-unverified-badge">
                        <span>⏳</span>
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="users-detail-item">
                  <div className="users-detail-label">ACCOUNT STATUS</div>
                  <div className="users-detail-value" style={{ marginTop: 6 }}>
                    {(selectedUserDetail.status || "ACTIVE").toUpperCase() === "ACTIVE" ? (
                      <div className="users-status-cell">
                        <span className="users-dot-pulse" />
                        <span style={{ color: "#22c55e" }}>Active</span>
                      </div>
                    ) : (
                      <div className="users-status-cell">
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#64748b", display: "inline-block" }} />
                        <span style={{ color: "#64748b" }}>Inactive</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="users-detail-item">
                  <div className="users-detail-label">LAST ACTIVE</div>
                  <div className="users-detail-value" style={{ fontSize: "0.78rem" }}>
                    {formatDateTime(selectedUserDetail.last_active)}
                  </div>
                </div>

                <div className="users-detail-item">
                  <div className="users-detail-label">CREATED AT</div>
                  <div className="users-detail-value" style={{ fontSize: "0.78rem" }}>
                    {formatDateTime(selectedUserDetail.created_at)}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleCopyDid(selectedUserDetail.did || "did:bel:actor:001")}
                >
                  {copiedDid === (selectedUserDetail.did || "did:bel:actor:001") ? "✓ DID Copied" : "Copy DID"}
                </button>
                <a
                  href={`mailto:${selectedUserDetail.email}`}
                  className="btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  Contact User →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. INVITE USER MODAL ────────────────────────────────────── */}
      {showInviteModal && typeof document !== "undefined" && createPortal(
        <div
          className="users-invite-modal-overlay"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="users-table-card users-invite-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="users-invite-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#38bdf8", fontSize: "1.1rem" }}>👤</span>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)", margin: 0 }}>
                  Invite New User
                </h2>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <div className="users-invite-modal-body">
              {error && (
                <div style={{ padding: 12, background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", borderRadius: 8, marginBottom: 16, color: "#fca5a5", fontSize: "0.8125rem" }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Vikram Batra"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Official Defence Email
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="e.g. v.batra@bel-defence.in"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Assigned RBAC Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "#0c1828",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                >
                  <option value="system-admin">System Administrator</option>
                  <option value="procurement-supply-chain-officer">Procurement & Supply Chain Officer</option>
                  <option value="quality-inspector">Quality Inspector</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn-secondary" onClick={() => setShowInviteModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleInvite} disabled={submitting}>
                  {submitting ? "Inviting..." : "Send Invitation"}
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
