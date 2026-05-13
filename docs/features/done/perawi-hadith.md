# Perawi Hadith

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Database perawi/narrator hadith dengan biografi, tabaqah, guru-murid, dan status jarh wa ta'dil.

## Scope

- API: /perawi, /jarh-tadil
- Web: /perawi
- Mobile: HadithScreen (tab perawi)

## Evidence

- API controller: services/api/internal/controller/perawi_controller.go
- Web page: apps/web/app/(main)/perawi/page.tsx
- Mobile screen: apps/mobile/src/screens/HadithScreen.tsx

## Source of Truth

- Model: services/api/internal/model/perawi.go
- Controller: services/api/internal/controller/perawi_controller.go
- Service: services/api/internal/service/perawi_service.go
