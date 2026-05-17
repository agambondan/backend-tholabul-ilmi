# Perpustakaan Ilmu

Status: done, MVP synced web and mobile
Last updated: 2026-05-17

## Scope

- Added `LibraryBook` as a separate catalog model from hadith `Book`, so book collections for learning resources do not collide with hadith book metadata.
- Added public API:
  - `GET /api/v1/library/books`
  - `GET /api/v1/library/books/:slug`
- Added seed catalog entries for Riyadhus Shalihin, Arbain Nawawiyah, Bulughul Maram, and a Bahasa Arab learning placeholder.
- Added web public routes:
  - `/library`
  - `/library/:slug`
- Added dashboard routes:
  - `/dashboard/library`
  - `/dashboard/library/:slug`
- Added admin management:
  - `/admin/library`
  - `POST /api/v1/library/books`
  - `PUT /api/v1/library/books/:id`
  - `DELETE /api/v1/library/books/:id`
- Added mobile Explore feature key `library` that reads the same backend catalog.
- Added `library_book` references for notes and bookmarks so users can keep study notes from library detail journeys.
- Added study progress:
  - `GET /api/v1/library/progress`
  - `GET /api/v1/library/progress/:bookId`
  - `PUT /api/v1/library/progress/:bookId`
  - Web and mobile detail surfaces can save status, last page, and a short progress note.
- Added personal progress discovery:
  - Dashboard `/dashboard/library` shows a `Progress Saya` panel for signed-in users.
  - Mobile Perpustakaan list shows saved status/page badges for books already tracked by the user.

## Journey Notes

- Public users can browse the same catalog without login.
- Dashboard users stay inside `/dashboard/library` for list and detail flows.
- Mobile uses the existing feature-level list/detail pattern and opens external source URLs from the detail action.
- Admins can create draft/published resources, edit metadata, attach source/cover URLs, and remove outdated entries.
- Logged-in users can track `planned`, `reading`, `paused`, and `completed` states per book without changing the public catalog layout.
- Dashboard users can resume active books directly from the personal progress panel before browsing the full catalog.
- PDF files are not mirrored yet. The current MVP stores external source URLs and license notes so uploaded PDFs can be added later only after source/license verification.

## Sync Contract

- Feature manifest key: `library`
- Public web route: `/library`
- Dashboard web route: `/dashboard/library`
- Mobile route: `feature:library`
- Note/bookmark ref type: `library_book`
- Progress endpoint family: `/api/v1/library/progress`
