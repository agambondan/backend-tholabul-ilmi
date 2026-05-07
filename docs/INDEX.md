# Docs Index — Thollabul Ilmi

Panduan navigasi dokumen project. Baca ini sebelum mulai task supaya tidak salah acuan.

---

## Keputusan Aktif (Source of Truth)

| Dokumen | Topik | Status |
|---|---|---|
| [MOBILE_IA_FINAL_APPROACH.md](./MOBILE_IA_FINAL_APPROACH.md) | **Arsitektur navigasi mobile** — 5 tab final, feature placement, urutan implementasi | ✅ Aktif |
| [api/FEATURE_ROADMAP.md](./api/FEATURE_ROADMAP.md) | Roadmap fitur backend, tier, dan status pengerjaan | ✅ Aktif |
| [api/roadmap-status.md](./api/roadmap-status.md) | Status terkini tiap fitur backend | ✅ Aktif |
| [web/web-status.md](./web/web-status.md) | Status halaman dan komponen web (Next.js) | ✅ Aktif |

---

## Mobile

| Dokumen | Isi |
|---|---|
| **[MOBILE_IA_FINAL_APPROACH.md](./MOBILE_IA_FINAL_APPROACH.md)** | **← Acuan utama IA mobile. Baca ini dulu.** |
| [MOBILE_FEATURE_REFERENCE.md](./MOBILE_FEATURE_REFERENCE.md) | Daftar lengkap fitur mobile dan mapping ke backend |
| [MOBILE_UX_REVIEW.md](./MOBILE_UX_REVIEW.md) | Review UX dan daftar issue yang ditemukan |
| [MOBILE_DESIGN_REWORK_TASKLIST.md](./MOBILE_DESIGN_REWORK_TASKLIST.md) | Checklist design contract mobile (sudah selesai) |
| [MOBILE_IA_APPROACH_A.md](./MOBILE_IA_APPROACH_A.md) | Proposal pembanding (bukan acuan, sudah dilebur ke Final) |
| [MOBILE_INFORMATION_ARCHITECTURE_APPROACH_CODEX.md](./MOBILE_INFORMATION_ARCHITECTURE_APPROACH_CODEX.md) | Proposal pembanding Codex (bukan acuan, sudah dilebur ke Final) |
| [MOBILE_IA_FINAL.md](./MOBILE_IA_FINAL.md) | Alias → lihat MOBILE_IA_FINAL_APPROACH.md |

---

## API / Backend

| Dokumen | Isi |
|---|---|
| [api/FEATURE_ROADMAP.md](./api/FEATURE_ROADMAP.md) | Roadmap lengkap fitur backend per tier |
| [api/roadmap-status.md](./api/roadmap-status.md) | Status pengerjaan tiap fitur |
| [api/feature-gap-analysis.md](./api/feature-gap-analysis.md) | Gap antara spesifikasi dan implementasi |
| [api/spesifikasi-islamic-app.md](./api/spesifikasi-islamic-app.md) | Spesifikasi produk Islamic app |
| [api/spesifikasi-apps-hadis.md](./api/spesifikasi-apps-hadis.md) | Spesifikasi khusus fitur hadis |
| [api/integrasi-eksternal-opensource.md](./api/integrasi-eksternal-opensource.md) | Integrasi eksternal dan sumber data open source |

---

## Web (Next.js)

| Dokumen | Isi |
|---|---|
| [web/web-status.md](./web/web-status.md) | Status halaman web per fitur |
| [web/api-endpoint-gaps.md](./web/api-endpoint-gaps.md) | Halaman web yang belum terhubung ke API |
| [web/api-gaps.md](./web/api-gaps.md) | Endpoint API yang belum dikonsumsi web |

---

## Setup & Infrastruktur

| Dokumen | Isi |
|---|---|
| [setup/local-development.md](./setup/local-development.md) | Cara menjalankan stack lokal (Docker, API, Web) |
| [setup/chronicle.md](./setup/chronicle.md) | Setup Chronicle (memory & context system) |
| [setup/ai-providers.md](./setup/ai-providers.md) | Konfigurasi AI provider |

---

## Quick Decision Reference

**Navigasi mobile → [`MOBILE_IA_FINAL_APPROACH.md`](./MOBILE_IA_FINAL_APPROACH.md)**
- 5 tab: Beranda · Quran · Hadis · Ibadah · Belajar
- Profil bukan tab — diakses via avatar di header
- Hadis dedicated tab setara Quran
- Prayer → Ibadah hub (Harian / Alat / Rencana / Bacaan)
- Explore → Belajar hub (Ilmu + Personal ringkas)

**Feature backend → [`api/FEATURE_ROADMAP.md`](./api/FEATURE_ROADMAP.md)**

**Design pattern mobile → `apps/mobile/src/components/`**
- `Card`, `CardTitle` — container konten
- `Screen` — layout scrollable dengan header
- `Paper` — `SegmentedTabs`, `ActionPill`, `IconActionButton`, `EmptyState`
- `setBack`/`clearBack` — back navigation pattern (wajib di semua sub-navigation)
