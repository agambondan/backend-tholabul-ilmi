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

- API: routes/progress.ts
- Web: app/(main)/quran/page.tsx, app/(main)/hadith/page.tsx
- Mobile: screens/QuranScreen.tsx, screens/HadithScreen.tsx

## Source of Truth

- docs/features/done/reading-progress.md
- services/api/src/routes/progress.ts
- apps/web/src/lib/hooks/useReadingProgress.ts
