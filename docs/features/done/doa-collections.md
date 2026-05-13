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

- API controller: `services/api/app/controllers/doa_controller.go`
- Web page: `apps/web/src/app/doa/page.js`, `apps/web/src/app/dashboard/doa/page.js`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.js`

## Source of Truth

- `services/api/app/controllers/doa_controller.go`
- `services/api/app/services/doa_service.go`
- `apps/web/src/app/doa/`
- `apps/mobile/src/screens/`
