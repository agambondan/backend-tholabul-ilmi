# Deep Review Summary

Tanggal: `2026-05-13`
Scope: `apps/mobile`, `apps/web`, `services/api`, `docs`
Status: `REVIEWED`

## Executive Summary

Codebase secara umum sudah bisa dibuild untuk mobile dan test API hijau, tetapi
ada beberapa risiko produk yang cukup besar:

1. **P0 - contract drift web/mobile/API.** Beberapa endpoint yang dipakai web
   admin dan mobile tidak ada di API route, atau payload/status-nya tidak sama.
2. **P0 - sync data personal belum konsisten.** Web dashboard masih banyak
   memakai `localStorage`, sedangkan mobile lebih sering memakai backend JWT.
   Akibatnya hafalan, sholat, tilawah, goals, muhasabah, dan notes bisa beda
   antar platform.
3. **P1 - mobile reader/search masih rawan glitch UX.** Quran reader sudah
   punya gesture dan mode baca, tetapi target dari search masih diberi preview
   tambahan di header dan reader menggunakan beberapa gesture layer sekaligus.
4. **P1 - admin CMS terlihat lebih lengkap dari API.** UI admin punya CRUD
   untuk beberapa konten static, tetapi API hanya menyediakan read route untuk
   sebagian modul.
5. **P2 - lint web masih punya hook dependency warning.** Tidak memblok build,
   tetapi rawan stale translation/function reference.

## Prioritas Perbaikan

### 1. Contract Sync Hardening

Selesaikan dulu endpoint/payload yang mismatch:

- tambah atau ubah endpoint backend agar sesuai dengan web/mobile
- atau ubah web/mobile agar memakai endpoint backend yang benar
- tambahkan route contract test untuk path yang dipakai frontend

Dokumen detail: [contract sync review](./2026-05-13-contract-sync-review.md).

### 2. Personal Data Sync

Pilih source of truth per fitur personal:

- hafalan: API enum `not_started`, `in_progress`, `memorized`
- sholat: API payload `{ date, prayer, status }`
- tilawah: API `/tilawah`
- notes/bookmarks/goals/muhasabah: jangan bercampur antara local-only dan
  server-only tanpa sync policy

Dokumen detail: [web dashboard review](./2026-05-13-web-dashboard-review.md).

### 3. Mobile Runtime QA

Setelah kontrak API aman, lakukan smoke di device untuk:

- Home daily ayah
- Global Search -> Quran detail
- Quran gesture non-mushaf dan mushaf
- Hadis list/detail/offline fallback
- Sholat tracker dari Ibadah dan Prayer screen

Dokumen detail: [mobile UI/UX review](./2026-05-13-mobile-ui-ux-review.md).

## Evidence

- `npm --prefix apps/web run lint`: passed dengan warning hook dependency.
- `go test ./...` di `services/api`: passed.
- `npx expo export --platform android --dev --output-dir /tmp/thollabul-review-mobile-export`: passed.

Detail command: [verification log](./2026-05-13-verification-log.md).

## Catatan Worktree

Saat review dimulai, worktree sudah dirty pada beberapa file mobile dan docs.
Review ini tidak mengubah source runtime. Perubahan yang dibuat hanya dokumen
review dan index docs.
