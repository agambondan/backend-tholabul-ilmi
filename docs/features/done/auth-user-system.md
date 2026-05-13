# Auth & User System

Status: `DONE`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Registrasi, login JWT, forgot/reset password, role-based access control (admin/editor/author/user), dan preferred language per user. Fondasi otentikasi dan otorisasi semua fitur lain.

## Scope

- API: `/auth/*`, `/users/*`
- Web: `/auth`, `/profile`
- Mobile: `SessionContext`, `ProfileScreen`

## Evidence

- API: `services/api/src/routes/auth.ts`, `services/api/src/routes/users.ts`
- Web: `apps/web/src/app/auth/`, `apps/web/src/app/profile/`
- Mobile: `apps/mobile/src/contexts/SessionContext.tsx`, `apps/mobile/src/screens/ProfileScreen.tsx`

## Source of Truth

- `services/api/src/middleware/auth.ts`
- `services/api/src/middleware/rbac.ts`
- `services/api/src/models/User.ts`
