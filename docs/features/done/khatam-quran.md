# Khatam Quran

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Target khatam 6236 ayat dengan progress per juz dan rekomendasi bacaan harian, membantu pengguna mencapai target khatam dalam jangka waktu tertentu.

## Scope

- API: `/reading-progress`
- Web: `/khatam`, `/dashboard/khatam`
- Mobile: Bagian dari `QuranScreen`

## Evidence

- Web: `apps/web/src/app/khatam/page.js`, `apps/web/src/app/dashboard/khatam/page.js`
- Mobile: `apps/mobile/src/screens/QuranScreen.js` (khatam section)

- API: services/api/app/controllers/reading_progress_controller.go

## Source of Truth

- services/api/app/controllers/reading_progress_controller.go
- services/api/app/model/reading_progress.go
- services/api/app/services/reading_progress_service.go
