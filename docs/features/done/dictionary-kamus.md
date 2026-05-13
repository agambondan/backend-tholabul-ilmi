# Dictionary & Kamus Istilah Islami

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Kamus istilah Islami yang searchable per kategori, membantu pengguna memahami istilah-istilah Arab dan Islami yang sering muncul dalam konten aplikasi.

## Scope

- API: `/dictionary`
- Web: `/kamus`, `/dashboard/kamus`
- Mobile: `ExploreScreen`

## Evidence

- Web: `apps/web/src/app/kamus/page.js`, `apps/web/src/app/dashboard/kamus/page.js`
- Mobile: `apps/mobile/src/screens/ExploreScreen.js`

- API: services/api/app/controllers/dictionary_controller.go

## Source of Truth

- services/api/app/controllers/dictionary_controller.go
- services/api/app/model/dictionary.go
- services/api/app/services/dictionary_service.go
