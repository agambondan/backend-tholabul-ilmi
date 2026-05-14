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

## Details

### API Response Shape

**`GET /audio?bySurah=1&qari=misyari`**
```json
{
  "surah_audio": {
    "id": 1,
    "surah_id": 1,
    "qari_name": "Misyari Rasyid",
    "qari_slug": "misyari",
    "audio_url": "https://.../001.mp3",
    "surah": { "id": 1, "number": 1 }
  }
}
```

**`GET /audio?byAyah=1&qari=misyari`**
```json
{
  "ayah_audio": {
    "id": 1,
    "ayah_id": 1,
    "qari_name": "Misyari Rasyid",
    "qari_slug": "misyari",
    "audio_url": "https://.../001001.mp3",
    "ayah": { "id": 1, "number": 1 }
  }
}
```

### Database Model

**`SurahAudio`** (`model/audio.go`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | int64 (BaseID) | Primary key |
| `surah_id` | *int | FK to Surah; unique with qari_slug |
| `qari_name` | string | Qari display name |
| `qari_slug` | string | URL-safe qari identifier |
| `audio_url` | string | Full surah audio URL |

**`AyahAudio`** (`model/audio.go`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | int64 (BaseID) | Primary key |
| `ayah_id` | *int | FK to Ayah; unique with qari_slug |
| `qari_name` | string | Qari display name |
| `qari_slug` | string | URL-safe qari identifier |
| `audio_url` | string | Per-ayah audio URL |

### Key Frontend Components

- **Web** (bagian dari `/quran`): Qari selector dropdown → play/pause per ayah with progress bar; continuous play mode for full surah
- **Mobile** (`audioPlayer` utility): Background audio service; qari picker; per-ayah playlist queue; playback speed control
