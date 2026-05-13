# Prayer Times

Status: `DONE`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Jadwal sholat harian berdasarkan lokasi (koordinat), dengan 7 metode perhitungan + madhhab.

## Scope

- API: `/sholat-times`, `/kiblat`
- Web: `/jadwal-sholat`, `/kiblat`
- Mobile: `IbadahScreen` → `PrayerScreen`

## Evidence

- API controller: `services/api/app/controllers/prayer_times_controller.go`, `services/api/app/controllers/kiblat_controller.go`
- Web page: `apps/web/src/app/jadwal-sholat/page.js`, `apps/web/src/app/kiblat/page.js`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.js`, `apps/mobile/src/screens/PrayerScreen.js`

## Source of Truth

- `services/api/app/controllers/prayer_times_controller.go`
- `services/api/app/controllers/kiblat_controller.go`
- `services/api/app/services/prayer-times_service.go`
- `apps/web/src/app/jadwal-sholat/`
- `apps/web/src/app/kiblat/`
