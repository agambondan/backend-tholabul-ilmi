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

- API: routes/bookmarks.ts
- Web: app/(main)/bookmarks/page.tsx, app/(main)/dashboard/bookmarks/page.tsx
- Mobile: components/BookmarkButton.tsx

## Source of Truth

- docs/features/done/bookmark-system.md
- apps/web/src/lib/api/bookmarks.ts
- services/api/src/routes/bookmarks.ts
