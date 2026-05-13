# Panduan Sholat

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Panduan sholat step-by-step: syarat, rukun, sunnah, baca'an, gerakan.

## Scope

- API: `/panduan-sholat` (dari `/sholat` controller)
- Web: `/panduan-sholat`, `/dashboard/panduan-sholat`
- Mobile: `IbadahScreen`

## Evidence

- API controller: `services/api/app/controllers/sholat_controller.go`
- Web page: `apps/web/src/app/panduan-sholat/page.js`, `apps/web/src/app/dashboard/panduan-sholat/page.js`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.js`

## Source of Truth

- `services/api/app/controllers/sholat_controller.go`
- `services/api/app/services/panduan-sholat_service.go`
- `apps/web/src/app/panduan-sholat/`
