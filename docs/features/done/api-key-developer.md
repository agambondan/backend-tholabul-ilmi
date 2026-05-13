# API Key & Developer Portal

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Portal developer untuk integrasi eksternal: register sebagai developer, membuat dan mencabut API keys, serta mengakses content API dengan rate limiting.

## Scope

- API: `/developer/*`
- Web: `/dev`
- Mobile: -

## Evidence

- API: `services/api/src/routes/developer.ts`
- Web: `apps/web/src/app/dev/`

## Source of Truth

- `services/api/src/middleware/apiKey.ts`
- `services/api/src/models/ApiKey.ts`
