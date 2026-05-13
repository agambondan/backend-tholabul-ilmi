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

- API controller: services/api/app/controllers/quran_controller.go
- Web page: apps/web/src/app/quran/page.js
- Mobile screen: apps/mobile/src/screens/QuranScreen.js

## Source of Truth

- Model: services/api/app/model/quran.go
- Controller: services/api/app/controllers/quran_controller.go
- Service: services/api/app/service/quran_service.go
