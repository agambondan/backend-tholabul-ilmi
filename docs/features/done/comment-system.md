# Comment System

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Sistem komentar untuk blog, hadith, dan konten lainnya dengan threading, likes, dan moderasi.

## Scope

- API: `/comments`
- Web: bagian dari `/blog`, `/hadith`
- Mobile: `ExploreScreen`

## Evidence

- API: `services/api/src/routes/comments.ts`
- Web: `apps/web/src/components/CommentSection.tsx`
- Mobile: `apps/mobile/src/screens/ExploreScreen.tsx`

## Source of Truth

- `services/api/src/models/Comment.ts`
- `services/api/src/middleware/commentModeration.ts`
