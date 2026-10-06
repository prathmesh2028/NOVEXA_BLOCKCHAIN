# KavachTrust — Documentation Directory

This directory provides operational references, architecture blueprints, deployment guides, and provenance records for the **KavachTrust** platform.

---

## Core System Documentation

| Document | Description | Location |
| :--- | :--- | :--- |
| **System README** | Main platform overview, quickstart & architecture | [README.md](../README.md) |
| **Security Policy & Architecture** | Vulnerability disclosure SLA, zero-trust model, data classification | [SECURITY.md](../SECURITY.md) |
| **Accessibility Conformance** | WCAG 2.1 AA compliance, keyboard navigation, screen reader guide | [ACCESSIBILITY.md](../ACCESSIBILITY.md) |
| **Backend API Reference** | Detailed REST endpoint parameters and request/response schemas | [backend/docs/api.md](../backend/docs/api.md) |
| **Backend Architecture** | Domain model, module design, and transaction outbox pattern | [backend/docs/architecture.md](../backend/docs/architecture.md) |
| **Backend Deployment** | Production configuration, containerization, and environment variables | [backend/docs/deployment.md](../backend/docs/deployment.md) |
| **Frontend Documentation** | React 19 architecture, routing, design tokens, and components | [frontend/f1/README.md](../frontend/f1/README.md) |
| **Smart Contracts Guide** | ERC-721 + IERC5192 Soulbound Token specifications and Hardhat | [contracts/README.md](../contracts/README.md) |
| **Cloud Deployment** | Vercel (Frontend) + Render (Backend & DB) operations guide | [deployment-vercel-render.md](deployment-vercel-render.md) |
| **Contributing Guidelines** | Development workflow, coding standards, and PR checklist | [CONTRIBUTING.md](../CONTRIBUTING.md) |

---

## Historical & Forensic Records

Historical audit snapshots and prior architecture drafts are retained under specialized directories for forensic provenance:

- `archive/` — Historical handoffs, early design iterations, and legacy system blueprints.
- `forensic_audit/` — Detailed forensic reports from previous codebase audits.
- `project_xray/` — Architectural component snapshots from earlier development milestones.

> **Note**: Historical documents are preserved for auditability and compliance trails. When historical notes diverge from current source code or database migrations, current repository code represents the single source of truth.
