# Quran Audio Murotal

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Audio murotal per ayat dari multiple qori', streaming via API.

## Scope

- API: /audio
- Web: bagian dari /quran
- Mobile: audioPlayer utilitas

## Evidence

- API controller: services/api/internal/controller/audio_controller.go
- Web page: apps/web/app/(main)/quran/page.tsx
- Mobile screen: apps/mobile/src/utils/audioPlayer.ts

## Source of Truth

- Model: services/api/internal/model/audio.go
- Controller: services/api/internal/controller/audio_controller.go
- Service: services/api/internal/service/audio_service.go
