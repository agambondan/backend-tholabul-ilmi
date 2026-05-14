# Custom Wirid

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Wirid kustom user: CRUD preset pribadi, membaca wirid, dan menghitung tasbih interaktif.

## Scope

- API: `/user-wird`
- Web: `/wirid-custom`, `/dashboard/wirid-custom`
- Mobile: `IbadahScreen` navigation dan `ExploreScreen` detail/form

## Evidence

- API: `services/api/app/controllers/user_wird_controller.go`
- Web: `apps/web/src/app/wirid-custom/`, `apps/web/src/app/dashboard/wirid-custom/`
- Mobile: `apps/mobile/src/screens/IbadahScreen.js`, `apps/mobile/src/screens/ExploreScreen.js`

## Source of Truth

- `services/api/app/controllers/user_wird_controller.go`
- `services/api/app/services/user_wird_service.go`
- `services/api/app/model/user_wird.go`
