# Quran Hafalan Tracker

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Tracker menghafal Quran per surah dengan progress status dan muroja'ah mode untuk memudahkan pengguna memantau hafalan harian dan mengulang ayat-ayat yang sudah dihafal.

## Scope

- API: `/hafalan`, `/murojaah`
- Web: `/hafalan`, `/muroja-ah`, `/dashboard/hafalan`, `/dashboard/muroja-ah`
- Mobile: `QuranScreen` (4 hafalan modes)

## Evidence

- Web: `apps/web/src/app/hafalan/page.js`, `apps/web/src/app/muroja-ah/page.js`, `apps/web/src/app/dashboard/hafalan/page.js`, `apps/web/src/app/dashboard/muroja-ah/page.js`
- Mobile: `apps/mobile/src/screens/QuranScreen.js`

- API: services/api/app/controllers/hafalan_controller.go, services/api/app/controllers/murojaah_controller.go

## Source of Truth

- services/api/app/controllers/hafalan_controller.go, services/api/app/controllers/murojaah_controller.go
- services/api/app/model/hafalan.go
- services/api/app/services/hafalan_service.go
