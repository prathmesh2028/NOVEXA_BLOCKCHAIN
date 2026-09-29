# Critical Findings

| ID | Severity | Title | Impact |
|---|---|---|---|
| F-01 | P0 | Supply Chain Missing | A core feature of the SIH problem statement is completely absent. |
| F-02 | P1 | Blockchain Simulated | The project claims blockchain integration but runs no actual node, heavily relying on demo simulation. |
| F-03 | P1 | Frontend Duplication | `f2` and `f3` are complete duplicates of the `f1` codebase, wasting space and causing confusion. |
| F-04 | P2 | Demo Mode Security | If `APP_ENV=demo` leaks into production, security checks are bypassed. |
