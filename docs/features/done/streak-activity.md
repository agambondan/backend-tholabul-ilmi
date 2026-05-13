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

- API: services/api/app/controllers/streak_controller.go, services/api/app/controllers/streak_controller.go
- Web: apps/web/src/app/dashboard/page.js, apps/web/src/app/profile/page.js
- Mobile: apps/mobile/src/screens/HomeScreen.js, apps/mobile/src/screens/ProfileScreen.js

## Source of Truth

- services/api/app/controllers/streak_controller.go
- apps/web/src/components/StreakWidget.js
