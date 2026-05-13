# Multilingual Content Wiring

Status: `TODO`
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

## Acceptance Criteria

- endpoint tidak memaksa satu bahasa untuk konten yang seharusnya i18n
- seed awal production tetap seamless
- fallback bahasa jelas jika translation belum lengkap

## Source of Truth

- `docs/api/FEATURE_ROADMAP.md`
- `docs/api/roadmap-status.md`
- `services/api/data/static/`
- `services/api/app/model/translation.go`

