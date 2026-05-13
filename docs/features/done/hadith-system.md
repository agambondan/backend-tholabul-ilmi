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

- API controller: services/api/app/controllers/hadith_controller.go
- Web page: apps/web/src/app/hadith/page.js
- Mobile screen: apps/mobile/src/screens/HadithScreen.js

## Source of Truth

- Model: services/api/app/model/hadith.go
- Controller: services/api/app/controllers/hadith_controller.go
- Service: services/api/app/service/hadith_service.go
