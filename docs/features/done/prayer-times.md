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

- API controller: `services/api/src/controllers/sholat-times.controller.ts`, `services/api/src/controllers/kiblat.controller.ts`
- Web page: `apps/web/app/jadwal-sholat/page.tsx`, `apps/web/app/kiblat/page.tsx`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.tsx`, `apps/mobile/src/screens/PrayerScreen.tsx`

## Source of Truth

- `services/api/src/routes/sholat-times.routes.ts`
- `services/api/src/routes/kiblat.routes.ts`
- `services/api/src/services/prayer-times.service.ts`
- `apps/web/app/jadwal-sholat/`
- `apps/web/app/kiblat/`
