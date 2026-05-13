# Tilawah Tracker

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Mencatat bacaan Quran harian (halaman, juz) dan menyediakan statistik tilawah untuk memantau konsistensi membaca Al-Quran setiap hari.

## Scope

- API: `/tilawah`
- Web: `/tilawah`, `/dashboard/tilawah`
- Mobile: Bagian dari `QuranScreen`

## Evidence

- Web: `apps/web/src/app/tilawah/page.js`, `apps/web/src/app/dashboard/tilawah/page.js`
- Mobile: `apps/mobile/src/screens/QuranScreen.js` (tilawah section)

- API: services/api/app/controllers/tilawah_controller.go

## Source of Truth

- services/api/app/controllers/tilawah_controller.go
- services/api/app/model/tilawah.go
- services/api/app/services/tilawah_service.go
