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

- API: `services/api/app/controllers/comment_controller.go`
- Web: `apps/web/src/components/CommentSection.js`
- Mobile: `apps/mobile/src/screens/ExploreScreen.js`

## Source of Truth

- `services/api/app/model/Comment.go`
- `services/api/app/controllers/comment_controller.go`
