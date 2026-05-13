# Quran Mufrodat

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Kosakata per-kata (mufrodat) untuk setiap ayat Al-Quran dengan terjemahan dan akar kata.

## Scope

- API: /mufrodat
- Web: bagian dari /quran
- Mobile: QuranScreen

## Evidence

- API controller: services/api/internal/controller/mufrodat_controller.go
- Web page: apps/web/app/(main)/quran/page.tsx
- Mobile screen: apps/mobile/src/screens/QuranScreen.tsx

## Source of Truth

- Model: services/api/internal/model/mufrodat.go
- Controller: services/api/internal/controller/mufrodat_controller.go
- Service: services/api/internal/service/mufrodat_service.go
