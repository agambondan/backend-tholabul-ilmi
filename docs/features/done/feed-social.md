# Feed Sosial

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Feed aktivitas: postingan refleksi berbasis ayat/hadis, likes, dan komentar
sederhana. MVP ini membangun engagement komunitas tanpa mengubah aplikasi
menjadi sosial media penuh.

## Scope

- API: `/feed`, `/comments`
- Web: bagian dari `/dashboard`
- Mobile: `ExploreScreen`

## Evidence

- API routes tersedia untuk list/detail/create/like/delete feed dan
  list/create/delete komentar.
- Mobile `ExploreScreen` menampilkan feed, like, panel komentar, dan form
  komentar.
- Moderation hardening lanjutan dipindah ke
  `docs/features/todo/social-feed-moderation-hardening.md`.

## Source of Truth

- `apps/mobile/src/api/social.js`
- `apps/mobile/src/screens/ExploreScreen.js`
- `services/api/app/controllers/feed_controller.go`
- `services/api/app/controllers/comment_controller.go`
