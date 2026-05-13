# Panduan Sholat

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Panduan sholat step-by-step: syarat, rukun, sunnah, baca'an, gerakan.

## Scope

- API: `/panduan-sholat` (dari `/sholat` controller)
- Web: `/panduan-sholat`, `/dashboard/panduan-sholat`
- Mobile: `IbadahScreen`

## Evidence

- API controller: `services/api/src/controllers/sholat.controller.ts`
- Web page: `apps/web/app/panduan-sholat/page.tsx`, `apps/web/app/dashboard/panduan-sholat/page.tsx`
- Mobile screen: `apps/mobile/src/screens/IbadahScreen.tsx`

## Source of Truth

- `services/api/src/routes/sholat.routes.ts`
- `services/api/src/services/panduan-sholat.service.ts`
- `apps/web/app/panduan-sholat/`
