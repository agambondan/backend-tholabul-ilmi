# Streak & Activity

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Daily streak & aktivitas harian untuk motivasi konsistensi. Melacak hari-hari aktif pengguna, aktivitas ibadah, dan memberikan visualisasi untuk menjaga semangat belajar.

## Scope

- API: /streak, /activity
- Web: bagian dari /dashboard, /profile
- Mobile: HomeScreen, ProfileScreen

## Evidence

- API: routes/streak.ts, routes/activity.ts
- Web: app/(main)/dashboard/page.tsx, app/(main)/profile/page.tsx
- Mobile: screens/HomeScreen.tsx, screens/ProfileScreen.tsx

## Source of Truth

- docs/features/done/streak-activity.md
- services/api/src/routes/streak.ts
- apps/web/src/components/StreakWidget.tsx
