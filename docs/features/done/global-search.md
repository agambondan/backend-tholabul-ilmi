# Global Search

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Pencarian full-text di seluruh konten (Quran, Hadith, Doa, dll) dengan filter.

## Scope

- API: /search endpoint (built-in via controller logic)
- Web: /search
- Mobile: GlobalSearchScreen

## Evidence

- API controller: services/api/app/controllers/search_controller.go
- Web page: apps/web/src/app/search/page.js
- Mobile screen: apps/mobile/src/screens/GlobalSearchScreen.js

## Source of Truth

- Model: services/api/app/model/search.go
- Controller: services/api/app/controllers/search_controller.go
- Service: services/api/app/service/search_service.go
