# Mobile Search and Discovery

Status: `IN_PROGRESS`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Membuat discovery lintas modul terasa konsisten sehingga user bisa menemukan
Quran, Hadis, Doa, Kajian, dan feature tanpa pindah-pindah tab.

## Scope

- Mobile:
  - global search
  - pinned shortcut
  - recently opened
  - contextual shortcut di Beranda
  - deep link dari hasil search ke detail yang benar
- API:
  - endpoint search existing tetap jadi sumber data utama
- Data:
  - metadata hasil search perlu cukup untuk routing detail

## Current Baseline

- Discovery layer adalah bagian wajib dari IA final.
- Beranda sudah menjadi delivery surface untuk shortcut, pinned, dan recently
  opened.
- Global Search screen sudah ada di mobile dan masih perlu smoke detail route.

## Task List

1. Pastikan hasil Quran dari search masuk ke detail ayah/surah tanpa glitch.
2. Smoke hasil dari source lain: Hadis, Doa/Dzikir, Kajian, dan feature.
3. Seragamkan empty state dan loading state.
4. Pastikan recent item terisi dari open detail yang valid.

## Acceptance Criteria

- klik hasil Quran tidak menimbulkan glitch navigasi
- hasil dari modul lain membuka detail yang sesuai
- metadata source terlihat natural untuk user, bukan istilah teknis backend
- user bisa lanjut dari recent item tanpa kehilangan konteks

## Evidence

- Device smoke masih wajib sebelum status dinaikkan ke `DONE`.

## Source of Truth

- `docs/MOBILE_IA_FINAL_APPROACH.md`
- `docs/MOBILE_FEATURE_REFERENCE.md`
- `apps/mobile/src/screens/GlobalSearchScreen.js`

