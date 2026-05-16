# Multilingual Content Wiring

Status: `IN_PROGRESS`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Merapikan konten static dan seeded agar bisa dilayani dalam lebih dari satu
bahasa tanpa field plain string yang terkunci ke satu bahasa.

## Scope

- API:
  - content fields yang masih plain string dipindahkan ke translation-aware
    model jika diperlukan
  - controller melayani bahasa yang dipilih user
- Data/Seeder:
  - file JSON static menjadi sumber staging sebelum migration/seed insert
  - konten EN/ID dipopulasi bertahap
- Mobile/Web:
  - menggunakan bahasa dari user setting atau fallback app locale

## Current Baseline

- Quran, Surah, Tafsir, Hadis, Book/Chapter, dan Theme sudah punya wiring
  translation yang lebih matang.
- Beberapa model konten static masih perlu dipindahkan dari plain string ke
  translation-aware content.
- History event sudah memakai `TranslationID` dan controller memfilter payload
  berdasarkan `lib.GetPreferredLang(ctx)`.

## Progress

- 2026-05-16:
  - `HistoryRepository.Create` sekarang meng-upsert row `translation` dari
    `title`/`description`, lalu menyimpan `translation_id` saat create maupun
    upsert berdasarkan slug.
  - `HistoryRepository.Update` sekarang mempertahankan row translation existing
    dan memperbarui `idn`/`description_idn`, bukan hanya mengubah plain field
    `title`/`description`.
  - Response create/update history dikembalikan dengan `Translation` ter-preload
    supaya API admin tidak drift dari public/detail endpoint yang sudah
    translation-aware.

## Acceptance Criteria

- endpoint tidak memaksa satu bahasa untuk konten yang seharusnya i18n
- seed awal production tetap seamless
- fallback bahasa jelas jika translation belum lengkap

## Remaining

- Isi `en`/`description_en` untuk dataset static yang sekarang baru punya IDN.
- Audit model konten plain string lain seperti `TokohTarikh` sebelum dipindahkan
  ke schema translation-aware.
- Update seeder static lanjutan jika sumber JSON mulai membawa field multi
  bahasa eksplisit.

## Source of Truth

- `docs/api/FEATURE_ROADMAP.md`
- `docs/api/roadmap-status.md`
- `services/api/data/static/`
- `services/api/app/model/translation.go`
