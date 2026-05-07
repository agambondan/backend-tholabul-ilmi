# Tholabul Ilmi

Monorepo for the Tholabul Ilmi API service and web application.

## Layout

- `services/api` - Go/Fiber API service.
- `apps/web` - Next.js website.
- `apps/mobile` - React Native / Expo mobile app.
- `docs` - Project documentation, setup notes, and task handoffs. Start at [`docs/INDEX.md`](docs/INDEX.md).
- `.chronicle` - Chronicle project binding for the monorepo root.

## Key Docs (Acuan)

- [`docs/INDEX.md`](docs/INDEX.md) — index semua dokumen project
- [`docs/MOBILE_IA_FINAL_APPROACH.md`](docs/MOBILE_IA_FINAL_APPROACH.md) — arsitektur navigasi mobile
- [`docs/MOBILE_DESIGN_PATTERNS.md`](docs/MOBILE_DESIGN_PATTERNS.md) — pola desain mobile mengikat (modal vs page detail, anti-expand-inline)
- [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) — instruksi untuk agent yang bekerja di repo ini

## Local Development

Run the full stack with Docker:

```bash
make docker-up
```

Run API service only:

```bash
make run-local
```

Run web app only:

```bash
make web-dev
```
