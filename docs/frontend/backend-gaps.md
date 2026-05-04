# Backend Gaps from the Frontend Contract

Dokumen ini merangkum pekerjaan backend yang masih dibutuhkan supaya frontend yang sudah ada benar-benar penuh data dan tidak hanya bergantung pada empty state atau fallback lokal.

Untuk daftar yang lebih granular per endpoint dan route, lihat `docs/backend-endpoint-gaps.md`.

## Prioritas Tinggi

### 1) Hadith browsing and reader stack

Frontend sudah punya alur:
- `src/app/hadith/byBook.js`
- `src/app/hadith/byTheme.js`
- `src/app/hadith/byChapter.js`
- `src/app/hadith/byHadith.js`
- `src/app/hadith/theme/[slug]/page.js`
- `src/app/hadith/[slug]/HadithPage.js`

Backend perlu memastikan data berikut tersedia dan konsisten:
- daftar kitab hadith
- daftar theme lintas kitab
- daftar chapter per kitab + theme
- daftar hadith per kitab dengan pagination
- daftar hadith per theme slug
- detail hadith yang memuat nomor, teks Arab, terjemahan, dan metadata bab/theme
- mapping `book_slug`, `theme_id`, dan `chapter_id` yang stabil

### 2) Quran enrichment stack

Frontend sudah menyiapkan reader dan pencarian untuk:
- `src/app/quran/page.js`
- `src/app/quran/[...slug]/InfiniteScrollAyahPage.js`
- `src/app/quran/[...slug]/AyahPage.js`
- `src/app/search/SearchClient.js`

Backend perlu memastikan:
- pencarian lintas ayah/hadith mengembalikan nested translation dengan struktur yang konsisten
- tafsir per surah dan per ayah tersedia
- mufrodat per ayah dan per root word tersedia
- audio surah dan audio ayah tersedia bila fitur audio ingin tetap aktif
- data pagination ayah mendukung navigasi prev/next dan deep-link reader

### 3) Content catalogs yang masih bergantung data backend

Frontend sudah punya halaman browsing/filtering untuk:
- `amalan`
- `asbabun-nuzul`
- `asmaul-husna`
- `doa`
- `dzikir`
- `fiqh`
- `hijri`
- `kajian`
- `leaderboard`
- `stats`
- `tafsir`

Backend perlu menutup gap data berikut:
- katalog doa dan dzikir lengkap beserta kategori
- daftar asmaul husna yang konsisten
- daftar fiqh dengan topik, dalil, dan penjelasan
- data kajian dengan title, ustadz, kategori, duration, source
- data hijri hari penting dan event bulanan
- leaderboard streak dan hafalan
- statistik summary, weekly, monthly, yearly
- tafsir surah dan tafsir ayah yang lengkap
- asbabun-nuzul per surah dan per ayah

## Persisted User Data

Frontend sudah siap untuk data yang harus tersimpan per user, tapi backend masih harus memastikan persistence dan sinkronisasinya:

- `notes` → simpan, update, hapus, dan fallback lokal hanya sebagai cadangan
- `goals` → daftar, create, update, delete
- `muhasabah` → daftar, create, update, delete
- `bookmarks` → daftar, add, remove
- `progress` → progress Quran dan hadith
- `hafalan` → list, summary, dan update status
- `tilawah` → input log, list rentang tanggal, summary
- `sholat-tracker` → update status harian dan history
- `quiz` → pertanyaan dan submit jawaban

## Notifications and Automation

Frontend settings sudah ada, tetapi backend masih perlu:
- menyimpan notification settings user
- menjalankan scheduler/worker untuk reminder
- mengirim notifikasi browser ketika user mengizinkan
- menyediakan response yang konsisten saat setting disimpan atau dibaca ulang

## Admin, Sharing, and Developer Tools

Frontend sudah memakai endpoint berikut dan backend perlu memastikan semuanya aktif:

- `blog` public list/detail dan admin CRUD kategori/tag/post
- `siroh` public list/detail dan admin CRUD kategori/content
- `developer` API key list/create/revoke
- `share` payload untuk ayah dan hadith
- `users` admin list/update/delete
- `auth` login/register/password change

## Urutan Kerja yang Disarankan

1. Selesaikan hadith browsing dan reader stack.
2. Lengkapi Quran enrichment: tafsir, mufrodat, audio, dan pencarian.
3. Isi katalog konten yang masih data-dependent.
4. Pastikan persistence user data dan notification worker stabil.
5. Tutup admin/share/developer endpoints yang masih gap.
