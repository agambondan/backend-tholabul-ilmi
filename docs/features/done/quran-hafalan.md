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

- API: `routes/hafalan.js`, `controllers/HafalanController.js`
- Web: `pages/hafalan/index.tsx`, `pages/muroja-ah/index.tsx`, `pages/dashboard/hafalan.tsx`, `pages/dashboard/muroja-ah.tsx`
- Mobile: `screens/QuranScreen.tsx`

## Source of Truth

- `docs/api/hafalan.md`
- `docs/mobile/IA.md`
