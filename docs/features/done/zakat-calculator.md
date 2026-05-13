# Zakat Calculator

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Kalkulator zakat (maal, fitrah, nishab) dengan perhitungan otomatis berdasarkan jenis harta, harga emas terkini, dan haul.

## Scope

- API: `/zakat`
- Web: `/zakat`, `/dashboard/zakat`
- Mobile: `IbadahScreen`

## Evidence

- API: `services/api/app/controllers/zakat_controller.go`
- Web: `apps/web/src/app/zakat/`, `apps/web/src/app/dashboard/zakat/`
- Mobile: `apps/mobile/src/screens/IbadahScreen.js`

## Source of Truth

- `services/api/app/services/zakat_service.go`
- `services/api/app/model/Zakat.go`
