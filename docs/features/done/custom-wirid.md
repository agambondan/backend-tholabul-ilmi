# Custom Wirid

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Wirid kustom user: CRUD preset pribadi, membaca wirid, dan menghitung tasbih interaktif.

## Scope

- API: `/user-wird`
- Web: `/wirid-custom`, `/dashboard/wirid-custom`
- Mobile: `IbadahScreen`

## Evidence

- API: `services/api/src/routes/userWird.ts`
- Web: `apps/web/src/app/wirid-custom/`, `apps/web/src/app/dashboard/wirid-custom/`
- Mobile: `apps/mobile/src/screens/IbadahScreen.tsx`

## Source of Truth

- `services/api/src/services/wiridService.ts`
- `services/api/src/models/UserWird.ts`
