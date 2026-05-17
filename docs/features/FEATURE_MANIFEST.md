# Feature Manifest And Parity Check

`docs/features/feature-manifest.json` adalah source of truth lintas web,
dashboard, dan mobile untuk feature discovery.

## Required Fields

Setiap feature wajib punya field berikut:

- `key`
- `title`
- `publicWebRoute`
- `dashboardWebRoute`
- `mobileRoute`
- `authRequired`
- `ctaLabel`
- `searchable`
- `status`

Gunakan `null` untuk route yang memang belum ada. Jangan isi route palsu hanya
agar check hijau.

## Mobile Route Format

- `tab:quran` untuk tab utama mobile.
- `feature:tafsir` untuk key di `apps/mobile/src/data/mobileFeatures.js`.
- `ibadah:qibla` untuk internal view tab Ibadah.
- `internal:global-search` untuk internal view yang bukan feature catalog.
- `profile:achievements` untuk sub-view profile.

Jika nama web dan mobile berbeda, tulis di `aliases`. Contoh: web `/peta`
dipetakan ke mobile key `historical-map`.

## Workflow Wajib Saat Menambah Feature

1. Tambahkan atau update entry di `docs/features/feature-manifest.json`.
2. Tambahkan route web public dan dashboard jika feature tersedia di web.
3. Tambahkan key mobile di `apps/mobile/src/data/mobileFeatures.js` jika
   feature tersedia di mobile.
4. Pastikan CTA personal memakai dashboard intent atau login/register `next`
   route yang benar.
5. Jalankan:

```bash
node scripts/check-feature-parity.js
```

Script akan gagal jika:

- field manifest wajib belum lengkap;
- route web public/dashboard tidak punya `page.js`;
- `mobileRoute` mengarah ke key mobile atau internal route yang tidak dikenal;
- ada key mobile baru yang belum dicatat di manifest.
