# Sholat Tracker

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Catat sholat 5 waktu per hari, lihat history & statistik.

## Scope

- API: `/sholat`
- Web: `/sholat-tracker`, `/dashboard/sholat-tracker`
- Mobile: `IbadahScreen`

## Evidence

- API controller: `services/api/src/controllers/sholat.controller.ts`
- Web page: `apps/web/app/sholat-tracker/page.tsx`, `apps/web/app/dashboard/sholat-tracker/page.tsx`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.tsx`

## Source of Truth

- `services/api/src/routes/sholat.routes.ts`
- `services/api/src/services/sholat.service.ts`
- `apps/web/app/sholat-tracker/`
