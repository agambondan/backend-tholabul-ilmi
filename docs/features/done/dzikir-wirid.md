# Dzikir & Wirid

Status: `DONE`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Baca & amalkan dzikir pagi/petang dan wirid based on occasion, dengan dzikir log harian.

## Scope

- API: `/dzikir`, `/dzikir/log`, `/wirid/occasion/:occasion`
- Web: `/dzikir`, `/wirid`, `/dashboard/dzikir`
- Mobile: `IbadahScreen`

## Evidence

- API controller: `services/api/app/controllers/dzikir_controller.go`, `services/api/app/controllers/wirid_controller.go`
- Web page: `apps/web/src/app/dzikir/page.js`, `apps/web/src/app/wirid/page.js`, `apps/web/src/app/dashboard/dzikir/page.js`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.js`

## Source of Truth

- `services/api/app/controllers/dzikir_controller.go`
- `services/api/app/controllers/dzikir_controller.go`
- `services/api/app/services/dzikir_service.go`
- `apps/web/src/app/dzikir/`
- `apps/web/src/app/wirid/`
