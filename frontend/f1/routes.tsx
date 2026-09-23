import { createBrowserRouter, Navigate } from "react-router";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AssetsPage from "./pages/assets/AssetsPage";
import AssetDetailPage from "./pages/assets/AssetDetailPage";
import EligibleAssetsPage from "./pages/assets/EligibleAssetsPage";
import RegisterAssetPage from "./pages/assets/RegisterAssetPage";
import MyAssetsPage from "./pages/assets/MyAssetsPage";
import CertificationsPage from "./pages/certifications/CertificationsPage";
import CertificationDetailPage from "./pages/certifications/CertificationDetailPage";
import CertificationQueuePage from "./pages/certifications/CertificationQueuePage";
import BlockchainPage from "./pages/blockchain/BlockchainPage";
import BlockchainProofPage from "./pages/blockchain/BlockchainProofPage";
import AuditPage from "./pages/audit/AuditPage";
import UsersPage from "./pages/users/UsersPage";
import RolesPage from "./pages/roles/RolesPage";
import EvidencePage from "./pages/evidence/EvidencePage";
import EvidenceDetailPage from "./pages/evidence/EvidenceDetailPage";
import EvidenceIntegrityPage from "./pages/evidence/EvidenceIntegrityPage";
import InspectionsPage from "./pages/inspections/InspectionsPage";
import LifecyclePage from "./pages/lifecycle/LifecyclePage";
import TechnicalRecordsPage from "./pages/technical-records/TechnicalRecordsPage";
import VerificationCenterPage from "./pages/verification/VerificationCenterPage";
import SearchPage from "./pages/search/SearchPage";
import SettingsPage from "./pages/settings/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RoleGuard from "./components/auth/RoleGuard";
import SupplyChainDashboardPage from "./pages/supply-chain/SupplyChainDashboardPage";
import HistoryPage from "./pages/history/HistoryPage";

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
      { path: "evidence", Component: EvidencePage },
      { path: "evidence/:id", Component: EvidenceDetailPage },
      { path: "search", Component: SearchPage },
      { path: "settings", Component: SettingsPage },
      { path: "my-assets", Component: MyAssetsPage },
      { path: "supply-chain", Component: SupplyChainDashboardPage },

      // System Admin Only
      {
        path: "",
        Component: () => <RoleGuard allowedRoles={["system-admin"]} />,
        children: [
          { path: "users", Component: UsersPage },
          { path: "roles", Component: RolesPage },
        ]
      },

      // Certifications & Blockchain — accessible by System Admin, Procurement, Quality Inspector, and Auditor
      {
        path: "",
        Component: () => <RoleGuard allowedRoles={["system-admin", "procurement-supply-chain-officer", "quality-inspector", "auditor"]} />,
        children: [
          { path: "certifications", Component: CertificationsPage },
          { path: "certifications/:id", Component: CertificationDetailPage },
          { path: "blockchain", Component: BlockchainPage },
          { path: "blockchain-proof", Component: BlockchainProofPage },
        ]
      },

      // Certification Queue & Eligible Assets — Quality Inspector and Procurement Officer
      {
        path: "",
        Component: () => <RoleGuard allowedRoles={["quality-inspector", "procurement-supply-chain-officer"]} />,
        children: [
          { path: "certification-queue", Component: CertificationQueuePage },
          { path: "eligible-assets", Component: EligibleAssetsPage },
        ]
      },

      // Quality Inspector & System Admin
      {
        path: "",
        Component: () => <RoleGuard allowedRoles={["system-admin", "quality-inspector"]} />,
        children: [
          { path: "register", Component: RegisterAssetPage },
          { path: "inspections", Component: InspectionsPage },
          { path: "lifecycle", Component: LifecyclePage },
          { path: "technical-records", Component: TechnicalRecordsPage },
        ]
      },

      // Auditor & System Admin
      {
        path: "",
        Component: () => <RoleGuard allowedRoles={["system-admin", "auditor"]} />,
        children: [
          // Canonical System Activity route — audit and audit-trail redirect or alias here
          { path: "system-activity", Component: AuditPage },
          { path: "audit", Component: AuditPage },
          { path: "audit-trail", Component: () => <Navigate to="/app/system-activity" replace /> },
          { path: "verification", Component: VerificationCenterPage },
          { path: "evidence-integrity", Component: EvidenceIntegrityPage },
        ]
      },

      // History — platform event history
      { path: "history", Component: HistoryPage },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);
