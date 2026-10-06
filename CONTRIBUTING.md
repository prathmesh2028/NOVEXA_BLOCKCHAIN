# Contributing to KavachTrust

Thank you for your interest in contributing to **KavachTrust**! As a defense-grade asset traceability and cryptographic certification platform, we hold our codebase, security standards, and contribution processes to the highest level of rigor.

This document outlines the development workflow, coding standards, testing requirements, and pull request procedures.

---

## Code of Conduct

All contributors and maintainers are expected to uphold a professional, respectful, and inclusive environment. Harassment, derogatory comments, or unprofessional behavior will not be tolerated.

---

## Getting Started

### 1. Prerequisites
Ensure your local environment has the required toolchains installed:
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0` (`npm install -g pnpm`)
- **Docker Desktop**: With Docker Compose enabled
- **Git**: `>= 2.40.0`

### 2. Fork & Clone
1. Fork the repository to your GitHub account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/NOVEXA_BLOCKCHAIN.git
   cd NOVEXA_BLOCKCHAIN
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/prathmesh2028/NOVEXA_BLOCKCHAIN.git
   ```

### 3. Install Dependencies & Local Services
Install dependencies across all workspaces:
```bash
pnpm install
pnpm --dir backend install
pnpm --dir contracts install
```

Start the local backing services (PostgreSQL, MinIO, and Hyperledger Besu):
```bash
docker compose up -d
```

Initialize the database schema:
```bash
pnpm --dir backend prisma:generate
pnpm --dir backend prisma:migrate:deploy
pnpm --dir backend prisma:seed
```

---

## Branching Strategy & Git Workflow

We use a feature branch workflow based on **Conventional Commits**:

### Branch Naming Conventions
Create a descriptive branch for your work:

```bash
git checkout -b <type>/<short-description>
```

| Type | Purpose | Example |
| :--- | :--- | :--- |
| `feat` | New feature or capability | `feat/merkle-batch-witness` |
| `fix` | Bug fix or regression patch | `fix/outbox-retry-backoff` |
| `sec` | Security fix or hardening | `sec/sanitize-input-hash` |
| `docs` | Documentation updates | `docs/update-api-specs` |
| `test` | Adding or improving tests | `test/inspection-flow-e2e` |
| `refactor` | Code restructuring without logic change | `refactor/casbin-policy-guard` |

### Commit Message Guidelines
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short imperative description>

[optional longer body explaining why the change was made]

[optional footer(s) referencing issue numbers]
```

**Examples**:
- `feat(contracts): add IERC5192 locked view interface`
- `fix(backend): prevent duplicate outbox claims on concurrent workers`
- `docs(readme): add contributing guide and architecture walkthrough`

---

## Engineering Standards

### 1. Monorepo Organization
- **`backend/`**: NestJS 10 REST API, Prisma ORM, Casbin RBAC, MinIO integration, and Viem blockchain service.
- **`frontend/f1/`**: React 19 + Vite 8 single-page application with Tailwind CSS v4.
- **`contracts/`**: Hardhat EVM smart contract workspace (Solidity 0.8.20).
- **`docs/`**: Comprehensive system guides and historical archives.

### 2. TypeScript & Code Quality
- Enforce strict typing. Do not use `any` unless explicitly justified with an inline comment.
- Format all code before committing:
  ```bash
  pnpm format
  ```
- Run typechecking prior to submitting pull requests:
  ```bash
  pnpm --dir backend typecheck
  ```

### 3. Backend (NestJS) Best Practices
- **DTO Validation**: Every incoming payload must be validated via a `class-validator` DTO.
- **RBAC**: Guard all privileged endpoints with `@UseGuards(JwtAuthGuard, CasbinRbacGuard)` and specify required role policies.
- **Audit Logging**: Any state mutation (asset status, inspection result, certification) must write a corresponding audit event to PostgreSQL with SHA-256 hash chaining.
- **Outbox Pattern**: Never make synchronous blockchain calls inside HTTP request handlers. Always write to the `outbox_events` table within a Prisma transaction.

### 4. Frontend (React 19) Best Practices
- **Accessibility (WCAG 2.1 AA)**: Ensure all interactive components have visible focus rings, proper ARIA attributes, semantic HTML tags, and accessible contrast ratios. Review [ACCESSIBILITY.md](ACCESSIBILITY.md).
- **No Hardcoded API Endpoints**: Consume configuration strictly via `import.meta.env.VITE_*`.
- **Responsive Layout**: Verify pages render cleanly across both desktop and mobile/tablet breakpoints.

### 5. Smart Contracts (Solidity 0.8.20)
- Contracts must inherit from OpenZeppelin v5 verified standards.
- Invariants must be strictly maintained (e.g., Soulbound Tokens must never be transferable between non-zero addresses).
- Write comprehensive Hardhat tests for every new public/external contract method.

---

## Testing Requirements

All contributions must include appropriate automated tests:

```bash
# Backend unit & integration tests (Vitest)
pnpm --dir backend test

# Backend coverage report
pnpm --dir backend test:cov

# Smart contract tests (Hardhat)
pnpm --dir contracts test

# End-to-end integration tests (Playwright)
pnpm exec playwright test
```

A pull request will not be merged if any existing or new test fails.

---

## Security Invariants & Secret Protection

> [!CAUTION]
> Never commit sensitive credentials, private keys, `.env` files, production database connection strings, or cloud storage secrets to version control.

Before committing, verify that your changes do not expose:
1. Ethereum private keys or mnemonic seed phrases.
2. `JWT_SECRET` values or HMAC signing keys.
3. Database passwords or MinIO access credentials.

If you discover an accidental leak or vulnerability, immediately follow the disclosure protocol outlined in [SECURITY.md](SECURITY.md).

---

## Pull Request (PR) Checklist

Before opening a pull request, ensure you have completed the following checklist:

- [ ] My code follows the established coding standards and architecture of the project.
- [ ] I have run `pnpm format` and resolved any linting/formatting issues.
- [ ] I have executed `pnpm --dir backend test` and `pnpm --dir contracts test` and all tests pass.
- [ ] I have added automated unit/integration tests covering new or modified functionality.
- [ ] I have updated relevant documentation in `README.md`, `backend/docs/`, or sub-package READMEs.
- [ ] No secrets, `.env` files, or private keys are staged in git (`git status`).
- [ ] My commit messages adhere to the Conventional Commits specification.

---

## Pull Request Review & Merge Process

1. **Automated CI Checks**: All automated GitHub Actions workflows (linting, tests, build) must pass cleanly.
2. **Code Review**: At least one core maintainer review and approval is required.
3. **Squash and Merge**: PRs are typically squashed upon merge to maintain a clean linear commit history on `main`.

---

## Need Help?

If you have questions, encounter setup blockers, or want to discuss architectural changes before writing code:
- Open a GitHub Discussion or create an Issue with the tag `question`.
- Contact the maintainers or security team as specified in [SECURITY.md](SECURITY.md).
