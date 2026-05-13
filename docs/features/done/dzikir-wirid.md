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

- API controller: `services/api/src/controllers/dzikir.controller.ts`, `services/api/src/controllers/wirid.controller.ts`
- Web page: `apps/web/app/dzikir/page.tsx`, `apps/web/app/wirid/page.tsx`, `apps/web/app/dashboard/dzikir/page.tsx`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.tsx`

## Source of Truth

- `services/api/src/routes/dzikir.routes.ts`
- `services/api/src/routes/wirid.routes.ts`
- `services/api/src/services/dzikir.service.ts`
- `apps/web/app/dzikir/`
- `apps/web/app/wirid/`
