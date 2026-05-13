# Hadith System

Status: `DONE`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Baca, cari, dan eksplorasi hadith dari multi-kitab dengan detail sanad, takhrij, perawi, dan jarh wa ta'dil.

## Scope

- API: /hadiths, /books, /themes, /chapters, /perawi, /sanad, /takhrij, /jarh-tadil
- Web: /hadith, /perawi
- Mobile: HadithScreen

## Evidence

- API controller: services/api/internal/controller/hadith_controller.go
- Web page: apps/web/app/(main)/hadith/page.tsx
- Mobile screen: apps/mobile/src/screens/HadithScreen.tsx

## Source of Truth

- Model: services/api/internal/model/hadith.go
- Controller: services/api/internal/controller/hadith_controller.go
- Service: services/api/internal/service/hadith_service.go
