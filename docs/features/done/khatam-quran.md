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

- API: `routes/readingProgress.js`, `controllers/ReadingProgressController.js`
- Web: `pages/khatam/index.tsx`, `pages/dashboard/khatam.tsx`
- Mobile: `screens/QuranScreen.tsx` (khatam section)

## Source of Truth

- `docs/api/reading-progress.md`
- `docs/mobile/IA.md`
