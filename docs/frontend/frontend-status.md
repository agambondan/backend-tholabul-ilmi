# Frontend Status

## Implemented

- Core app shell, navigation, auth, profile, and shared UI components are in place.
- `blog`, `search`, `hadith`, and `quran` pages now have usable browsing, filtering, and safer reader flows.
- `dev` includes API key management for listing, creating, and revoking keys.
- Content discovery pages are no longer bare shells:
  - `asbabun-nuzul`
  - `asmaul-husna`
  - `doa`
  - `dzikir`
  - `fiqh`
  - `goals`
  - `hijri`
  - `kajian`
  - `leaderboard`
  - `muhasabah`
  - `notifications`
  - `stats`
  - `tafsir`
- `notifications` now supports bulk enable/disable and bulk save actions.
- Reader pages handle empty states and partial backend data more gracefully instead of exposing placeholder copy.

## Backend-dependent

- Some pages still render empty states when their backend datasets are empty or incomplete.
- That is expected fallback behavior, not a missing frontend route.
- Remaining feature completeness is mostly a backend data/content issue rather than a missing UI shell.
- The backend backlog that matches this frontend contract is documented in `docs/backend-gaps.md`.
