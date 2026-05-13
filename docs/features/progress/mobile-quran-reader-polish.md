# Mobile Quran Reader Polish

Status: `IN_PROGRESS`
Priority: `P0`
Tanggal: `2026-05-13`

## Objective

Merapikan pengalaman baca Al-Quran di mobile supaya terasa seperti reader
utama, bukan list data biasa.

## Scope

- Mobile:
  - mode baca Quran: normal, clean/line, grid/card, dan mushaf
  - font Quran yang relevan untuk Arab, bukan font generik seperti sans/mono
  - ukuran Arab yang bisa turun sampai ukuran kecil sesuai preferensi user
  - ayah marker yang rapi dan tidak keluar dari baris
  - gesture kanan/kiri:
    - mode mushaf untuk pindah halaman
    - mode selain mushaf untuk pindah surah
  - tab bar disembunyikan ketika reader Quran aktif agar tidak mengganggu
- API:
  - tetap memakai endpoint Quran existing seperti `GET /ayah/page/:page` dan
    `GET /ayah/surah/number/:number`
- Data:
  - tajweed color dan mapping mushaf page perlu tetap divalidasi dari dataset

## Current Baseline

- Quran sudah first-class tab.
- Reader sudah punya surah list, detail ayah, navigator, hafalan, murojaah,
  progress, bookmark, notes, tafsir/asbab/settings modal.
- Mode mushaf sudah dieksplor, tetapi layout mushaf asli punya batas teknis
  karena rendering text reflow tidak sama dengan image mushaf cetak.

## Task List

1. Rapikan marker ayah dan angka Arab pada mode non-mushaf.
2. Pastikan font selector hanya menawarkan font Arab yang masuk akal.
3. Validasi kembali tajweed color pada data dan renderer.
4. Jaga gesture tidak bentrok dengan back gesture Android.
5. Smoke test di device Expo yang aktif.

## Acceptance Criteria

- font Quran benar-benar berubah saat dipilih
- ukuran Arab bisa turun di bawah 22px
- marker ayah tidak keluar dari teks
- arti muncul saat mode hafalan `Normal`
- mode mushaf berpindah halaman dengan swipe, bukan scroll panjang
- mode selain mushaf berpindah surah dengan swipe

## Evidence

- Device smoke masih wajib sebelum status dinaikkan ke `DONE`.

## Source of Truth

- `docs/MOBILE_IA_FINAL_APPROACH.md`
- `docs/MOBILE_FEATURE_REFERENCE.md`
- `apps/mobile/src/screens/QuranScreen.js`

