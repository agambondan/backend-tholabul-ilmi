# Faraidh Calculator

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Kalkulator waris (faraidh) dengan perhitungan Ashabul Furudh, Ashabah, Aul, dan Radd berdasarkan hukum faraidh Islam.

## Scope

- API: `/faraidh`
- Web: `/faraidh`, `/dashboard/faraidh`
- Mobile: `IbadahScreen`

## Evidence

- API: `services/api/app/controllers/faraidh_controller.go`
- Web: `apps/web/src/app/faraidh/`, `apps/web/src/app/dashboard/faraidh/`
- Mobile: `apps/mobile/src/screens/IbadahScreen.js`

## Source of Truth

- `services/api/app/services/faraidhCalculator_service.go`
- `services/api/app/model/Faraidh.go`
