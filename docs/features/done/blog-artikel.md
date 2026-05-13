# Blog & Artikel

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Blog dengan sistem posting, kategori, tags, dan related posts untuk menyediakan artikel-artikel keislaman yang terstruktur dan mudah ditemukan.

## Scope

- API: `/blog`
- Web: `/blog`, `/dashboard/blog`
- Mobile: `ExploreScreen`

## Evidence

- Web: `apps/web/src/app/blog/page.js`, `apps/web/src/app/dashboard/blog/page.js`
- Mobile: `apps/mobile/src/screens/ExploreScreen.js`

- API: services/api/app/controllers/blog_controller.go

## Source of Truth

- services/api/app/controllers/blog_controller.go
- services/api/app/model/blog.go
- services/api/app/services/blog_service.go
