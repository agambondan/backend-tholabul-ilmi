# Kiblat Finder

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Arah kiblat dari lokasi user (angle + distance Haversine).

## Scope

- API: `/kiblat`
- Web: `/kiblat`
- Mobile: `IbadahScreen` (compass native)

## Evidence

- API controller: `services/api/app/controllers/kiblat_controller.go`
- Web page: `apps/web/src/app/kiblat/page.js`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.js`

## Source of Truth

- `services/api/app/controllers/kiblat_controller.go`
- `services/api/app/services/kiblat_service.go`
- `apps/web/src/app/kiblat/`
