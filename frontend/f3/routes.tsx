// F3 — independent workspace: Evidence + Verification + Blockchain + Audit
import { createBrowserRouter, Navigate } from "react-router";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import EvidencePage from "./pages/evidence/EvidencePage";
import EvidenceDetailPage from "./pages/evidence/EvidenceDetailPage";
import VerificationCenterPage from "./pages/verification/VerificationCenterPage";
import BlockchainPage from "./pages/blockchain/BlockchainPage";
import AuditPage from "./pages/audit/AuditPage";
import NotFoundPage from "./pages/NotFoundPage";
import StubPage from "./pages/StubPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/login", Component: LoginPage },
  {
    path: "/app",
    Component: AppShell,
    children: [
      { index: true, Component: () => <Navigate to="/app/evidence" replace /> },
      { path: "dashboard", Component: DashboardPage },
      { path: "evidence", Component: EvidencePage },
      { path: "evidence/:id", Component: EvidenceDetailPage },
      { path: "verification", Component: VerificationCenterPage },
      { path: "blockchain", Component: BlockchainPage },
      { path: "audit", Component: AuditPage },
      { path: "audit-trail", Component: AuditPage },
      { path: "*", Component: () => <StubPage title="Coming Soon" icon="◈" description="This page belongs to another team workspace." /> },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);
