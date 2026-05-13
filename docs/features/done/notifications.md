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

- API: routes/notifications.ts
- Web: app/(main)/notifications/page.tsx, app/(main)/dashboard/notifications/page.tsx
- Mobile: components/NotificationCenter.tsx

## Source of Truth

- docs/features/done/notifications.md
- services/api/src/routes/notifications.ts
- apps/web/src/app/(main)/notifications/page.tsx
