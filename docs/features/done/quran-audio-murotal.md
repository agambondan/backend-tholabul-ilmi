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

- API controller: services/api/app/controllers/audio_controller.go
- Web page: apps/web/src/app/quran/page.js
- Mobile screen: apps/mobile/src/utils/audioPlayer.js

## Source of Truth

- Model: services/api/app/model/audio.go
- Controller: services/api/app/controllers/audio_controller.go
- Service: services/api/app/service/audio_service.go
