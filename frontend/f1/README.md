# KavachTrust — Frontend Web Application

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Viem](https://img.shields.io/badge/Viem-2.x-black?style=flat-square&logo=ethereum&logoColor=white)](https://viem.sh/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-success?style=flat-square)](../../ACCESSIBILITY.md)

The **KavachTrust Frontend** is a modern, high-performance web interface engineered for sovereign defense asset traceability, cryptographic proof verification, quality inspection workflows, and non-transferable Soulbound Token (SBT) lifecycle tracking.

---

## Key Features

- **Role-Based Workspaces**: Tailored user interfaces and navigation guards for **System Administrators**, **Procurement Officers**, **Quality Inspectors**, and **Auditors**.
- **Cryptographic Evidence Vault**: Secure document upload with client-side SHA-256 pre-hashing, version history, and object storage integration.
- **Defence Asset Passports**: Comprehensive digital passports displaying specifications, physical bindings (QR/RFID), QA inspection history, and on-chain SBT credentials.
- **Audit Trail & Hash-Chain Visualizer**: Interactive audit log viewer capable of verifying sequential cryptographic hashes and detecting database tampering in real time.
- **Blockchain Verification Center**: Direct query and status validation against the Hyperledger Besu private EVM network using Viem.
- **Chain of Custody Tracking**: Visual supply chain tracking across suppliers, manufacturing facilities, lots, shipments, and custody handoffs.
- **Accessible & Responsive**: Fully compliant with WCAG 2.1 Level AA standards, featuring dark/light modes, keyboard-first navigation, and high-visibility focus indicators.

---

## Directory Architecture

```
frontend/f1/
├── components/          # Reusable UI, layout, and domain-specific components
│   ├── auth/            # RoleGuard, authentication barriers, login dialogs
│   ├── certifications/  # SBT passport views, token badges, verification cards
│   ├── layout/          # AppShell, Navigation Sidebar, Header, Breadcrumbs
│   └── ui/              # Buttons, inputs, modals, data tables, alert banners
├── context/             # Global React state (Auth, Theme, Notification context)
├── data/                # Static types, schema definitions, mock presets
├── features/            # Feature-centric modules and custom hooks
├── pages/               # Routed page views
│   ├── assets/          # Inventory, Asset Detail, Registration, My Assets
│   ├── audit/           # Cryptographic Audit Log & Chain Integrity check
│   ├── auth/            # Sign in, password reset, session management
│   ├── blockchain/      # Besu explorer, transaction tracking, proof verification
│   ├── certifications/  # Issued SBTs, certification queue, clearance approval
│   ├── dashboard/       # KPI widgets, compliance graphs, recent event feed
│   ├── evidence/        # Document repository, upload drawer, integrity check
│   ├── inspections/     # QA records, pass/fail logging, checklists
│   ├── lifecycle/       # Asset state machine transitions & invariants
│   ├── supply-chain/    # Suppliers, facilities, lots, shipments, custody
│   └── verification/    # Public & authenticated verification portal
├── services/            # Axios / Fetch API clients with JWT token injection
├── App.tsx              # Root React component with context providers
├── routes.tsx           # React Router v8 declarative route hierarchy with guards
├── index.css            # Tailwind CSS v4 design tokens and global styles
└── vite.config.ts       # Vite bundler configuration with React plugin
```

---

## Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- Running backend API instance (default: `http://localhost:10000`)

---

## Environment Variables

Create a `.env` file in `frontend/f1/` (refer to `.env.example`):

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:10000` | Backend API origin; `/api/v1` is added automatically |
| `VITE_BLOCKCHAIN_RPC_URL` | — | Optional browser-accessible Besu JSON-RPC endpoint |
| `VITE_SBT_CONTRACT_ADDRESS` | — | Optional deployed `KavachTrustSBT` address |
| `VITE_BLOCKCHAIN_CHAIN_ID` | `31337` | EVM Chain ID |

---

## Quick Start

### 1. Install Dependencies
From the repository root or within `frontend/f1/`:
```bash
pnpm install
```

### 2. Run Development Server
```bash
pnpm dev
# Or from the repository root:
pnpm dev:frontend
```
The application will be accessible at: **`http://localhost:5173`**

### 3. Production Build & Preview
```bash
pnpm build
pnpm preview
```

---

## Role Access Matrix

| Module / Page | Path | System Admin | Procurement Officer | Quality Inspector | Auditor |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | `/app/dashboard` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Asset Catalog** | `/app/assets` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Register Asset** | `/app/register` | :white_check_mark: | :x: | :white_check_mark: | :x: |
| **Record Inspection**| `/app/inspections` | :white_check_mark: | :x: | :white_check_mark: | :x: |
| **Certification Queue**| `/app/certification-queue`| :white_check_mark:| :white_check_mark: | :white_check_mark: | :x: |
| **Certifications & SBT**| `/app/certifications` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Blockchain Explorer**| `/app/blockchain` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Audit Log & Tamper Check**| `/app/audit` | :white_check_mark: | :x: | :x: | :white_check_mark: |
| **Verification Center**| `/app/verification` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Supply Chain & Custody**| `/app/supply-chain` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **User & Role Admin**| `/app/users` | :white_check_mark: | :x: | :x: | :x: |

---

## Accessibility & Design System

The frontend enforces strict accessibility and usability standards:
- **WCAG 2.1 Level AA**: Verified contrast ratios, semantic landmarks, and screen reader announcements.
- **Keyboard Navigation**: Full tab order traversal with visible `focus-visible` styling.
- **Reduced Motion**: Seamless fallback for users who prefer minimal UI movement.

For detailed guidelines, see [ACCESSIBILITY.md](../../ACCESSIBILITY.md).
