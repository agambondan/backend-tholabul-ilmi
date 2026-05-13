# Kiblat Finder

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Arah kiblat dari lokasi user (angle + distance Haversine).

## Scope

- API: `/kiblat`
- Web: `/kiblat`
- Mobile: `IbadahScreen` (compass native)

## Evidence

- API controller: `services/api/src/controllers/kiblat.controller.ts`
- Web page: `apps/web/app/kiblat/page.tsx`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.tsx`

## Source of Truth

- `services/api/src/routes/kiblat.routes.ts`
- `services/api/src/services/kiblat.service.ts`
- `apps/web/app/kiblat/`
