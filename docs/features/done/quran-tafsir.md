# Quran Tafsir

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Tafsir ayat dari berbagai mufassir, bisa diakses per ayat.

## Scope

- API: /tafsir
- Web: /tafsir
- Mobile: Detail dari QuranScreen

## Evidence

- API controller: services/api/internal/controller/tafsir_controller.go
- Web page: apps/web/app/(main)/tafsir/page.tsx
- Mobile screen: apps/mobile/src/screens/QuranScreen.tsx

## Source of Truth

- Model: services/api/internal/model/tafsir.go
- Controller: services/api/internal/controller/tafsir_controller.go
- Service: services/api/internal/service/tafsir_service.go
