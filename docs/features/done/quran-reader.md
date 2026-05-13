# Quran Reader

Status: `DONE`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Baca Quran dengan choice display mode, multi font, tajweed, audio murotal per ayat, bookmark, tafsir, asbabun nuzul, mufrodat.

## Scope

- API: /surah, /ayah, /juz, /tafsir, /asbabun-nuzul, /audio, /mufrodat
- Web: /quran, /quran/page-mushaf, /tafsir, /asbabun-nuzul
- Mobile: QuranScreen

## Evidence

- API controller: services/api/internal/controller/quran_controller.go
- Web page: apps/web/app/(main)/quran/page.tsx
- Mobile screen: apps/mobile/src/screens/QuranScreen.tsx

## Source of Truth

- Model: services/api/internal/model/quran.go
- Controller: services/api/internal/controller/quran_controller.go
- Service: services/api/internal/service/quran_service.go
