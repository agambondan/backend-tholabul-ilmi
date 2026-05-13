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

- API controller: services/api/app/controllers/perawi_controller.go
- Web page: apps/web/src/app/perawi/page.js
- Mobile screen: apps/mobile/src/screens/HadithScreen.js

## Source of Truth

- Model: services/api/app/model/perawi.go
- Controller: services/api/app/controllers/perawi_controller.go
- Service: services/api/app/service/perawi_service.go
