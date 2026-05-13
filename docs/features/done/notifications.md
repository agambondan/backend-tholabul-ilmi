# Notifications

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Notifikasi inbox, push token, reminder email, preferensi notifikasi. Mengirim pengingat sholat, jadwal mengaji, aktivitas teman, dan pencapaian pribadi secara real-time.

## Scope

- API: /notifications
- Web: /notifications, /dashboard/notifications
- Mobile: NotificationCenter komponen

## Evidence

- API: services/api/app/controllers/notification_controller.go
- Web: apps/web/src/app/notifications/page.js, apps/web/src/app/dashboard/notifications/page.js
- Mobile: apps/mobile/src/components/NotificationCenter.js

## Source of Truth

- services/api/app/controllers/notification_controller.go
- apps/web/src/app/notifications/page.js
