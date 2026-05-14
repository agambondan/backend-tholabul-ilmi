# Personal Data Sync P0

Status: `IN_PROGRESS`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Menjadikan API sebagai source of truth untuk data personal lintas web dan
mobile, dengan `localStorage` hanya sebagai cache/fallback ketika user belum
login atau server sedang tidak tersedia.

## Scope Slice Ini

- Web dashboard hafalan memakai enum API:
  - `not_started`
  - `in_progress`
  - `memorized`
- Web dashboard sholat mengirim satu log per prayer:
  - `{ date, prayer, status }`
- Web dashboard tilawah memuat daftar dari `/api/v1/tilawah` saat login.
- `tilawahApi.add` mengirim `date`, sesuai kontrak backend.
- Cache lokal tetap dipakai sebagai fallback dan diberi warning
  `Belum tersinkron` ketika request gagal.

## Task List

1. `DONE` Seragamkan status hafalan dashboard web ke enum API/mobile.
2. `DONE` Jadikan API hafalan sebagai source utama saat user login.
3. `DONE` Ubah toggle sholat dashboard web menjadi payload satu prayer.
4. `DONE` Normalisasi key `Shubuh` web ke `subuh` API.
5. `DONE` Jadikan tilawah dashboard web memuat data dari API saat login.
6. `DONE` Tambahkan `date` ke payload create tilawah.
7. `TODO` Perluas API-first policy ke dashboard summary/profile/stats.
8. `TODO` Audit `goals`, `muhasabah`, dan `notes` agar tidak silent fallback
   tanpa badge sync.

## Evidence

- `node --check apps/web/src/lib/api.js`
- `node --check apps/web/src/app/dashboard/hafalan/page.js`
- `node --check apps/web/src/app/dashboard/sholat-tracker/page.js`
- `node --check apps/web/src/app/dashboard/tilawah/page.js`
- `npm --prefix apps/web run lint`

## Notes

- Lint web masih pass dengan warning lama di halaman public non-dashboard.
- Runtime smoke login dashboard belum dilakukan di browser karena slice ini
  baru contract/data-flow level.
