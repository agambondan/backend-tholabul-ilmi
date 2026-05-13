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

- API controller: services/api/internal/controller/search_controller.go
- Web page: apps/web/app/(main)/search/page.tsx
- Mobile screen: apps/mobile/src/screens/GlobalSearchScreen.tsx

## Source of Truth

- Model: services/api/internal/model/search.go
- Controller: services/api/internal/controller/search_controller.go
- Service: services/api/internal/service/search_service.go
