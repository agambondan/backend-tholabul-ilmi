# Mobile Shared Component System

Status: `IN_PROGRESS`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Menyatukan UI route mobile lewat shared component yang bisa di-custom agar
screen tidak punya chrome, card, modal, dan header yang beda-beda.

## Scope

- Mobile:
  - shared modal/bottom sheet
  - shared content card
  - shared action sheet
  - shared detail header
  - screen tetap boleh override style, field, icon, dan action sesuai konteks
- Web/API:
  - tidak termasuk scope kecuali perlu menyesuaikan contract data

## Current Baseline

- Refactor sudah bergerak di `apps/mobile/src/components/`.
- Screen prioritas yang tersentuh: Quran, Hadis, Ibadah, Belajar/Explore,
  Home, Global Search.

## Task List

1. Audit screen yang masih punya modal/card/header custom lokal.
2. Migrasikan pattern yang berulang ke shared component.
3. Pastikan shared component menerima override style dan render field tambahan.
4. Jalankan parse/export mobile setelah migrasi besar.
5. Smoke test device untuk route utama.

## Acceptance Criteria

- detail modal punya header/close behavior konsisten
- card list punya spacing, border, dan metadata yang seragam
- screen masih bisa memberi field tambahan tanpa fork komponen
- tidak ada regresi route utama mobile

## Evidence

- Device smoke masih wajib sebelum status dinaikkan ke `DONE`.

## Source of Truth

- `docs/MOBILE_DESIGN_PATTERNS.md`
- `docs/INDEX.md`
- `apps/mobile/src/components/`

