# Bookmark System

Status: `DONE`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Bookmark multi-tipe (ayat, hadith, doa, artikel) dengan warna/label, sync lintas device. Memudahkan pengguna menandai dan mengorganisir konten favorit secara visual.

## Scope

- API: /bookmarks
- Web: /bookmarks, /dashboard/bookmarks
- Mobile: Semua screen + BookmarkButton komponen

## Evidence

- API: services/api/app/controllers/bookmark_controller.go
- Web: apps/web/src/app/bookmarks/page.js, apps/web/src/app/dashboard/bookmarks/page.js
- Mobile: components/BookmarkButton.js

## Source of Truth

- apps/web/src/lib/api/bookmarks.js
- services/api/app/controllers/bookmark_controller.go
