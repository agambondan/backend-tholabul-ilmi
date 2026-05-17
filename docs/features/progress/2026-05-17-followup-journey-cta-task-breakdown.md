# Follow-up Journey CTA Sync Task Breakdown

Status: `IN_PROGRESS`
Tanggal: `2026-05-17`
Source Review: `docs/reviews/2026-05-17-followup-journey-cta-sync-review.md`

## Objective

Menutup edge-case journey/CTA yang masih tertinggal setelah sync performance
task 1-11, khususnya route public yang belum punya dashboard wrapper, CTA yang
keluar konteks, dan dokumentasi parity yang sudah stale.

## Task 12 - Dashboard Wrapper Tokoh Dan Peta

Priority: `P1`
Area: `apps/web`, `docs/features/feature-manifest.json`
Status: `VERIFIED`

### Scope

- Tambah `/dashboard/tokoh` dengan reuse `TokohListContent`.
- Tambah `/dashboard/peta` dengan reuse `PetaContent`.
- Tambah link sidebar dashboard untuk `Tokoh Tarikh` dan `Peta Islam`.
- Update `feature-manifest.json`.

### Verification

- PASS: `cd apps/web && npm run build`
- PASS: Browser smoke `/dashboard/tokoh`
- PASS: Browser smoke `/dashboard/peta`
- PASS: `/dashboard/peta` no longer renders raw `peta.title` or
  `peta.subtitle` i18n keys.

## Task 13 - Dashboard Brand Link Stay In Dashboard

Priority: `P1`
Area: `apps/web`
Status: `VERIFIED`

### Scope

- Ubah brand/logo link dashboard dari `/` ke `/dashboard`.

### Verification

- PASS: `cd apps/web && npm run build`
- PASS: Dashboard layout brand link now targets `/dashboard`.
- PASS: Browser smoke click logo from `/dashboard/peta` lands on `/dashboard`.

## Task 14 - Mobile Ibadah Jadwal Copy

Priority: `P2`
Area: `apps/mobile`
Status: `VERIFIED`

### Scope

- Ubah subtitle `Jadwal Sholat` agar tidak menyebut `log harian`.
- Pastikan `Log Sholat` tetap menjadi entry terpisah.

### Verification

- PASS: `cd apps/mobile && npm test -- --runInBand`

## Task 15 - Refresh Sync Documentation

Priority: `P2`
Area: `docs`
Status: `TODO`

### Scope

- Refresh `docs/WEB_MOBILE_SYNC.md` agar tidak lagi menyebut fitur yang sudah
  selesai sebagai missing.
- Pisahkan historical baseline dari status current.
- Link ke:
  - `docs/reviews/2026-05-17-web-mobile-performance-sync-deep-review.md`
  - `docs/reviews/2026-05-17-followup-journey-cta-sync-review.md`
  - `docs/features/progress/2026-05-17-sync-performance-task-breakdown.md`

### Verification

- Route/feature matrix cocok dengan `docs/features/feature-manifest.json`.

## Task 16 - Route Parity Smoke Script

Priority: `P2`
Area: `apps/web`, `docs`
Status: `TODO`

### Scope

- Tambah script atau test kecil yang membandingkan route web dengan manifest.
- Route utility seperti `/contact`, `/profile`, dan `/dashboard/profile` harus
  punya kategori eksplisit agar tidak muncul sebagai false positive.
- Fail jika active feature punya public route tetapi dashboard wrapper yang
  diwajibkan tidak ada.

### Verification

- Script/test route parity lulus di CI lokal.

## Task 17 - Manifest Utility Surfaces

Priority: `P3`
Area: `docs/features/feature-manifest.json`
Status: `TODO`

### Scope

- Tambahkan `surfaces` atau `utilityRoutes` untuk route non-feature:
  - `/`
  - `/contact`
  - `/profile`
  - `/dashboard`
  - `/dashboard/profile`
- Dokumentasikan apakah route tersebut public, dashboard, admin, atau auth
  handoff.

### Verification

- Parity script tidak perlu hardcode exception route utility.
