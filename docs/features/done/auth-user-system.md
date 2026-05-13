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

- API: `services/api/app/controllers/user_controller.go`, `services/api/app/controllers/user_controller.go`
- Web: `apps/web/src/app/auth/`, `apps/web/src/app/profile/`
- Mobile: `apps/mobile/src/contexts/SessionContext.js`, `apps/mobile/src/screens/ProfileScreen.js`

## Source of Truth

- `services/api/app/controllers/auth_controller.go`
- `services/api/app/controllers/rbac_controller.go`
- `services/api/app/model/User.go`
