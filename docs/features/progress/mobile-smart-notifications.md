# Mobile Smart Notifications

Status: `IN_PROGRESS`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Membuat notifikasi mobile lebih bernilai dari sekadar on/off: user bisa
mengatur kategori, waktu tenang, reminder, dan inbox notifikasi.

## Scope

- Mobile:
  - notification center
  - pengaturan reminder
  - kategori notifikasi
  - quiet hours
  - local cache/inbox
- API:
  - registrasi Expo push token
  - dispatch push untuk reminder harian
- Data:
  - state notifikasi user harus tetap personal

## Current Baseline

- Notification Center sudah tercatat di `docs/MOBILE_FEATURE_REFERENCE.md`.
- Smart notification utility sudah ada di mobile dan masih bergerak.

## Task List

1. Polish copy agar tidak memakai istilah teknis.
2. Seragamkan state dari backend dan storage mobile.
3. Validasi retry/offline behavior.
4. Smoke reminder di device.

## Acceptance Criteria

- user memahami kategori notifikasi tanpa membaca istilah backend
- quiet hours jelas dan tidak bentrok dengan reminder ibadah
- inbox bisa mark read dan tetap stabil ketika offline
- push token registration tidak memblok UI

## Evidence

- Device smoke masih wajib sebelum status dinaikkan ke `DONE`.

## Source of Truth

- `docs/MOBILE_FEATURE_REFERENCE.md`
- `apps/mobile/src/components/NotificationCenter.js`
- `apps/mobile/src/utils/smartNotifications.js`

