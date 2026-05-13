# Doa Collections

Status: `DONE`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Baca & cari kumpulan doa sehari-hari per kategori (pagi, petang, makan, tidur, safar, dll).

## Scope

- API: `/doa`
- Web: `/doa`, `/dashboard/doa`
- Mobile: `IbadahScreen` → sub-view

## Evidence

- API controller: `services/api/src/controllers/doa.controller.ts`
- Web page: `apps/web/app/doa/page.tsx`, `apps/web/app/dashboard/doa/page.tsx`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.tsx`

## Source of Truth

- `services/api/src/routes/doa.routes.ts`
- `services/api/src/services/doa.service.ts`
- `apps/web/app/doa/`
- `apps/mobile/src/screens/`
