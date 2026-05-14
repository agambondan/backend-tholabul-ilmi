# Social Feed Moderation Hardening

Status: `TODO`
Priority: `P2`
Tanggal: `2026-05-14`

## Objective

Melanjutkan Social Feed yang sudah MVP dengan guardrail moderasi ringan, tanpa
mengubah aplikasi menjadi sosial media penuh.

## Scope

- Mobile:
  - report/hide minimal pada post atau komentar.
  - state empty/error yang jelas saat konten disembunyikan.
- API:
  - endpoint report/hide atau status moderasi minimal.
  - pembatasan agar user hanya menghapus/mengubah konten miliknya sendiri.
- Data:
  - konten user tetap personal/komunitas dan tidak bercampur dengan konten ilmu
    global.

## Current Baseline

MVP feed sudah tersedia melalui `/feed`, `/comments`, like, dan komentar. Mobile
menampilkan feed di `ExploreScreen`, sedangkan API sudah punya controller,
service, repository, dan model feed/comment.

## Task List

1. Desain kontrak report/hide minimal.
2. Tambah API moderation baseline.
3. Tambah aksi report/hide pada mobile feed detail.
4. Verifikasi hak akses delete/report.

## Acceptance Criteria

- user bisa report atau hide konten yang mengganggu.
- feed tetap tidak mengganggu jalur utama Quran, Hadis, dan Ibadah.
- moderation baseline tersedia sebelum feed diperluas.

## Evidence

- Pending.

## Source of Truth

- `docs/features/done/feed-social.md`
- `apps/mobile/src/screens/ExploreScreen.js`
- `apps/mobile/src/api/social.js`
- `services/api/app/controllers/feed_controller.go`
- `services/api/app/controllers/comment_controller.go`
