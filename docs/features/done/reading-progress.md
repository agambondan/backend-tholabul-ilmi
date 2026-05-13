# Reading Progress

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Progress baca Quran & Hadith: melacak posisi terakhir, persentase selesai, dan riwayat bacaan. Membantu pengguna melanjutkan bacaan dari tempat terakhir dan memonitor konsistensi tilawah.

## Scope

- API: /progress
- Web: bagian dari /quran dan /hadith
- Mobile: QuranScreen, HadithScreen

## Evidence

- API: services/api/app/controllers/reading_progress_controller.go
- Web: apps/web/src/app/quran/page.js, apps/web/src/app/hadith/page.js
- Mobile: apps/mobile/src/screens/QuranScreen.js, apps/mobile/src/screens/HadithScreen.js

## Source of Truth

- services/api/app/controllers/reading_progress_controller.go
- apps/web/src/lib/hooks/useReadingProgress.js
