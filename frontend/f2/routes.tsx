// F2 — independent workspace: Assets + Certifications
import { createBrowserRouter, Navigate } from "react-router";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AssetsPage from "./pages/assets/AssetsPage";
import AssetDetailPage from "./pages/assets/AssetDetailPage";
import CertificationsPage from "./pages/certifications/CertificationsPage";
import CertificationDetailPage from "./pages/certifications/CertificationDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import StubPage from "./pages/StubPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/login", Component: LoginPage },
  {
    path: "/app",
    Component: AppShell,
    children: [
      { index: true, Component: () => <Navigate to="/app/assets" replace /> },
      { path: "dashboard", Component: DashboardPage },
      { path: "assets", Component: AssetsPage },
      { path: "assets/:id", Component: AssetDetailPage },
      { path: "certifications", Component: CertificationsPage },
      { path: "certifications/:id", Component: CertificationDetailPage },
      { path: "*", Component: () => <StubPage title="Coming Soon" icon="◈" description="This page belongs to another team workspace." /> },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);
