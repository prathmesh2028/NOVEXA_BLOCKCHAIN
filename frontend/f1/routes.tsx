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
        Component: AuditPage,
      },
      {
        path: "eligible-assets",
        Component: EligibleAssetsPage,
      },
      {
        path: "certification-queue",
        Component: CertificationQueuePage,
      },
      {
        path: "history",
        Component: () => <StubPage title="History" icon="◷" description="Timeline of all platform activities including asset registration, evidence uploads, lifecycle changes, and certification events." parent={{ label: "Dashboard", to: "/app/dashboard" }} />,
      },
      {
        path: "my-assets",
        Component: MyAssetsPage,
      },
      {
        path: "register",
        Component: RegisterAssetPage,
      },
      {
        path: "technical-records",
        Component: TechnicalRecordsPage,
      },
      {
        path: "inspections",
        Component: InspectionsPage,
      },
      {
        path: "lifecycle",
        Component: LifecyclePage,
      },
      {
        path: "evidence-integrity",
        Component: EvidenceIntegrityPage,
      },
      {
        path: "blockchain-proof",
        Component: BlockchainProofPage,
      },
      {
        path: "audit-trail",
        Component: AuditPage,
      },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);
