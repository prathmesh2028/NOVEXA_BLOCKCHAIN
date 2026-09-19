# Security Forensic Audit

## Findings
1. **Demo Mode Risk**: `APP_ENV=demo` allows bypassing database checks. If deployed to production with this flag, authentication and wallet bindings are fundamentally compromised.
2. **MinIO Hardcoded Credentials**: Fallback defaults to `minioadmin/minioadmin`.
3. **Casbin**: RBAC is implemented via Casbin guards, which protect routes.
