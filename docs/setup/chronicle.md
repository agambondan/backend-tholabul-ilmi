# Chronicle Setup

Chronicle is bound at the monorepo root:

```text
/home/firman/works/me/thollabul-ilmi
```

Project config lives in `.chronicle/config.json`. Backend and frontend should not keep separate Chronicle bindings unless they intentionally become independent projects again.

For repo-wide work, run retrieval and sync from the monorepo root so Chronicle indexes `apps/backend`, `apps/frontend`, and `docs` together.
