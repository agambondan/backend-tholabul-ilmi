# Feature Docs

Folder ini memisahkan status feature agar roadmap, tasklist, dan closure tidak
tercampur.

## Bedanya dengan dokumen lain

- `docs/MOBILE_IA_FINAL_APPROACH.md` menyimpan keputusan IA mobile yang
  mengikat.
- `docs/MOBILE_DESIGN_PATTERNS.md` menyimpan aturan UI mobile yang mengikat.
- `docs/api/FEATURE_ROADMAP.md` dan `docs/api/roadmap-status.md` menyimpan
  status backend/API.
- `docs/features/` menyimpan status implementasi per feature atau milestone
  lintas mobile, web, dan API.

## Struktur

- `todo/`: feature yang sudah cukup jelas untuk dikerjakan, tetapi belum mulai.
- `progress/`: feature yang sedang aktif dikerjakan atau masih bergerak.
- `done/`: feature yang sudah ditutup dengan scope dan evidence yang jelas.
- `onhold/`: feature yang ditunda karena dependency, keputusan produk, atau data.

## Rule

- feature baru dipecah dulu ke `todo/`.
- setiap feature di `todo/` wajib punya priority `P0`, `P1`, atau `P2`.
- ketika implementasi aktif dimulai, pindahkan dokumennya dari `todo/` ke
  `progress/`.
- ketika sudah closed, pindahkan atau tulis versi final ke `done/` dan ubah
  status menjadi `DONE`.
- jika feature menyentuh mobile dan backend, catat keduanya secara eksplisit.
- jika masih belum sempat diverifikasi di device/API/web, jangan tulis `DONE`.
- gunakan [TEMPLATE.md](./TEMPLATE.md) untuk feature baru.

## Priority Labels

- `P0`: fondasi atau blocker untuk milestone dekat.
- `P1`: penting dan bernilai tinggi, tetapi tidak memblokir core path.
- `P2`: enhancement, ekspansi, atau eksplorasi.

## Status Labels

- `TODO`: belum mulai.
- `IN_PROGRESS`: sedang dikerjakan.
- `VERIFIED`: implementasi sudah hijau, tetapi masih mungkin ikut bergerak.
- `DONE`: feature sudah ditutup.
- `ON_HOLD`: ditunda dengan alasan eksplisit.

