import { createBrowserRouter, Navigate } from "react-router";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AssetsPage from "./pages/assets/AssetsPage";
import AssetDetailPage from "./pages/assets/AssetDetailPage";
import CertificationsPage from "./pages/certifications/CertificationsPage";
import CertificationDetailPage from "./pages/certifications/CertificationDetailPage";
import BlockchainPage from "./pages/blockchain/BlockchainPage";
import AuditPage from "./pages/audit/AuditPage";
import UsersPage from "./pages/users/UsersPage";
import RolesPage from "./pages/roles/RolesPage";
import EvidencePage from "./pages/evidence/EvidencePage";
import EvidenceDetailPage from "./pages/evidence/EvidenceDetailPage";
import VerificationCenterPage from "./pages/verification/VerificationCenterPage";
import SearchPage from "./pages/search/SearchPage";
import SettingsPage from "./pages/settings/SettingsPage";
import InspectionsPage from "./pages/inspections/InspectionsPage";
import InspectionDetailPage from "./pages/inspections/InspectionDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import StubPage from "./pages/StubPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/app",
    Component: AppShell,
    children: [
      { index: true, Component: () => <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", Component: DashboardPage },
      { path: "assets", Component: AssetsPage },
      { path: "assets/:id", Component: AssetDetailPage },
      { path: "certifications", Component: CertificationsPage },
      { path: "certifications/:id", Component: CertificationDetailPage },
      { path: "blockchain", Component: BlockchainPage },
      { path: "audit", Component: AuditPage },
      { path: "users", Component: UsersPage },
      { path: "roles", Component: RolesPage },
      { path: "evidence", Component: EvidencePage },
      { path: "evidence/:id", Component: EvidenceDetailPage },
      { path: "verification", Component: VerificationCenterPage },
      { path: "search", Component: SearchPage },
      { path: "settings", Component: SettingsPage },
      {
        path: "system-activity",
        Component: () => <StubPage title="System Activity" icon="◎" description="Chronological feed of all system-level events across the platform. Filter by date, actor, role, and action type." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "eligible-assets",
        Component: () => <StubPage title="Eligible Assets" icon="◈" description="Assets meeting the criteria for NFT certification — verified evidence, completed lifecycle, active identity permissions." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "certification-queue",
        Component: () => <StubPage title="Certification Queue" icon="◆" description="Queue of assets eligible for certification. Review evidence, verify lifecycle state, and initiate minting." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "history",
        Component: () => <StubPage title="History" icon="◷" description="Timeline of all platform activities including asset registration, evidence uploads, lifecycle changes, and certification events." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "my-assets",
        Component: () => <StubPage title="My Assets" icon="◈" description="Your assigned assets with quick access to registration updates, lifecycle tracking, and evidence management." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "register",
        Component: () => <StubPage title="Register / Update Asset" icon="⊕" description="Register a new defence asset or update an existing asset record with technical data, evidence, and lifecycle information." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "technical-records",
        Component: () => <StubPage title="Technical Records" icon="☰" description="All technical data records associated with assets under your purview. View, filter, and update technical specifications." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "inspections",
        Component: InspectionsPage,
      },
      {
        path: "inspections/:id",
        Component: InspectionDetailPage,
      },
      {
        path: "lifecycle",
        Component: () => <StubPage title="Lifecycle Management" icon="◷" description="Asset lifecycle progression from UNREGISTERED through SUPPLIER_DECLARED, RECEIVED, INSPECTION_RECORDED to terminal state." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "evidence-integrity",
        Component: () => <StubPage title="Evidence Integrity" icon="◫" description="Verify evidence integrity across all assets. Check SHA-256 fingerprint matching and blockchain anchoring status." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "blockchain-proof",
        Component: () => <StubPage title="Blockchain Proof" icon="⬡" description="Verify blockchain proof for assets and certifications. Check transaction confirmation, block number, and on-chain status." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "audit-trail",
        Component: AuditPage,
      },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);
