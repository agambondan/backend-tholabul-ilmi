# Web Mobile Sync And Performance Deep Review

Status: `REVIEWED`
Tanggal: `2026-05-17`
Scope: `apps/web`, `apps/mobile`, `services/api`

## Ringkasan Verdict

Web, mobile, dan backend belum bisa disebut 100% sync. Banyak gap besar dari
review sebelumnya sudah tertutup, terutama katalog mobile, forum, peta, tokoh,
tafsir, cross-reference hadis-ayah, dan beberapa fitur personal. Namun masih
ada gap low-impact sampai high-impact yang mempengaruhi journey, CTA, dan
persepsi user bahwa fitur web dan mobile setara.

Verdict teknis saat review ini:

| Area | Status | Catatan |
|---|---|---|
| Web build | `PASS` | `cd apps/web && npm run build` berhasil, tetapi ada warning root lockfile/Turbopack. |
| Mobile unit/integration test | `PASS_WITH_WARNINGS` | `cd apps/mobile && npm test -- --runInBand` lulus 537 test, tetapi banyak warning `act(...)`. |
| Backend test | `FAIL` | `cd services/api/app && go test ./...` gagal di tafsir mock, route test nil repo, dan query dzikir ambiguous column. |
| Feature parity web/mobile | `PARTIAL` | Fitur utama sudah banyak sync, tetapi beberapa CTA/entrypoint dan fitur turunan belum sejajar. |
| Performance readiness | `PARTIAL` | Mobile list utama sudah memakai `FlatList`, tetapi ada hotspot Quran deep-load, web client bundle, dan cache middleware backend. |

## Evidence Review

- Web route audit dilakukan dari `apps/web/src/app`.
- Mobile feature registry diaudit dari `apps/mobile/src/data/mobileFeatures.js`.
- Mobile journey aktif diaudit dari `HomeScreen`, `ExploreScreen`,
  `QuranScreen`, `IbadahScreen`, dan `ProfileScreen`.
- Backend cache dan route behavior diaudit dari `services/api/app/lib/cache.go`,
  `services/api/app/http/middlewares/cache.go`, dan
  `services/api/app/http/routes.go`.
- Existing review yang masih relevan:
  `docs/reviews/2026-05-15-public-dashboard-parity-review.md` dan
  `docs/reviews/2026-05-15-web-journey-cta-review.md`.

## Feature Sync Findings

### P0 - Mobile Khatam CTA Belum Menjadi Fitur Khatam

Web sudah punya route public `/khatam` dan dashboard `/dashboard/khatam`.
Mobile menampilkan item `Khatam` di tab Ibadah, tetapi item tersebut hanya
mengarahkan user ke tab Quran. Ini membuat CTA terdengar seperti tracker
khatam, padahal journey mobile tidak membuka pengalaman khatam.

Impact:

- User mengira fitur khatam tersedia di mobile.
- Web dan mobile tidak sync untuk fitur personal Quran completion.
- CTA di mobile tidak sesuai fungsi sebenarnya.

Rekomendasi:

- Implement mobile Khatam tracker setara web/dashboard, atau ubah CTA menjadi
  shortcut Quran yang jelas sampai tracker mobile tersedia.

### P1 - Asmaul Husna Flashcard Belum Sync Ke Mobile

Web punya route flashcard public dan dashboard:

- `/asmaul-husna/flashcard`
- `/dashboard/asmaul-husna/flashcard`

Mobile punya Asmaul Husna sebagai katalog, tetapi belum ada entrypoint khusus
untuk mode flashcard. Ini gap kecil secara data, tetapi cukup terasa untuk
journey belajar karena mode flashcard adalah cara pakai yang berbeda, bukan
sekadar detail halaman biasa.

Rekomendasi:

- Tambahkan mode `Flashcard` di fitur Asmaul Husna mobile.
- Jika belum dibuat penuh, tambahkan badge `Segera` dan jangan arahkan CTA ke
  list biasa.

### P1 - Achievements Belum Punya Journey Mobile Penuh

Web dashboard punya dedicated route `/dashboard/achievements`. Mobile
`ProfileScreen` menampilkan ringkasan poin/achievement, tetapi belum ada
halaman atau modal detail untuk daftar achievement, progress, dan reward.

Impact:

- Personal motivation loop tidak setara antara web dashboard dan mobile.
- User mobile tidak punya tempat eksplisit untuk melihat apa yang sudah dan
  belum dicapai.

Rekomendasi:

- Tambahkan `Achievements` sebagai screen/modal detail dari Profile.
- Sinkronkan label, progress, dan empty state dengan web dashboard.

### P1 - Landing Web Belum Mengekspos Semua Fitur Baru

Home web saat ini sudah mengarah ke banyak fitur core, tetapi belum terlihat
mengekspos beberapa fitur yang sudah ada atau sudah ditambahkan belakangan,
seperti:

- Forum
- Tokoh Tarikh
- Peta Sejarah
- Asmaul Husna Flashcard
- Jarh wa Ta'dil
- Wirid personal/custom

Impact:

- User public tidak mudah menemukan fitur baru.
- Mobile terlihat lebih lengkap dibanding landing web untuk discovery.
- CTA discovery di landing belum menjadi source of truth fitur publik.

Rekomendasi:

- Update feature grid landing web agar mencakup fitur baru.
- Pisahkan fitur public dan personal dengan label yang jelas.
- CTA personal dari landing sebaiknya menuju dashboard/login intent, bukan
  route publik yang membuat user kehilangan konteks.

### P1 - Nama Fitur Dan Route Alias Belum Konsisten

Beberapa fitur punya perbedaan penamaan antara web route, mobile registry, dan
copy UI:

| Domain | Web / API | Mobile | Risiko |
|---|---|---|---|
| Peta Sejarah | `/peta` | `historical-map` | Search, deep link, dan analytics sulit dibaca konsisten. |
| Wirid Custom | `/wirid-custom` | `user-wird` | Ada typo/alias yang rawan salah mapping. |
| Murojaah | `/dashboard/muroja-ah` | `murojaah` | Deep link dan docs mudah drift. |
| Jadwal Sholat | `/jadwal-sholat` | Tab/fitur Prayer | Bisa muncul sebagai duplikat atau hilang dari manifest. |
| Kiblat | `/kiblat` | Tab/fitur Qibla | Sama seperti jadwal sholat. |

Rekomendasi:

- Buat manifest feature bersama atau minimal tabel alias resmi.
- Tambahkan test/skrip parity sederhana untuk route web vs feature key mobile.

### P2 - Fitur Ada, Tetapi Entry Point Journey Belum Merata

Beberapa fitur sudah ada di salah satu permukaan, tetapi entrypoint belum
sekuat fitur lain:

- Forum sudah tersedia di mobile, tetapi landing web belum jelas mengangkatnya.
- Peta sudah tersedia di web dan mobile, tetapi naming discovery berbeda.
- Tokoh Tarikh sudah tersedia, tetapi perlu dipastikan masuk ke semua katalog
  discovery yang relevan.
- Jarh wa Ta'dil ada di mobile catalog, tetapi web landing belum menonjolkannya.
- Daily/personal widgets di dashboard dan mobile perlu punya CTA yang tetap
  berada di konteks dashboard saat user sudah login.

## CTA And Journey Findings

### P1 - CTA Mobile Harus Menjelaskan Destination

CTA seperti `Khatam` yang membuka Quran tab adalah mismatch. Pola yang sama
perlu dicek untuk semua item katalog:

- Jika CTA membuka fitur penuh, label boleh pakai nama fitur.
- Jika CTA hanya shortcut ke tab induk, copy harus menyebut konteks, misalnya
  `Buka Quran`.
- Jika fitur belum tersedia, gunakan disabled state atau badge `Segera`, bukan
  redirect ke fitur lain.

### P1 - Dashboard Journey Jangan Bocor Ke Public Route

Review sebelumnya menemukan banyak risiko CTA dashboard yang mengarah ke route
public. Belum semua area diverifikasi ulang pada review ini, jadi statusnya
tetap perlu dijaga sebagai risiko aktif sampai ada smoke test dashboard
menyeluruh.

Area yang perlu dicek ulang:

- Dashboard search dan result detail.
- Dashboard forum/community detail.
- Dashboard daily ayah/hadith/tafsir card.
- Dashboard bookmark dan reading history.
- Dashboard zakat, asbabun nuzul, dan Asmaul Husna.
- Navbar/footer/settings saat user berada di dashboard.

Rule yang harus dipakai:

- Public feature boleh dipakai tanpa login.
- Dashboard boleh memakai data/fitur public, tetapi detail dan CTA-nya tetap
  harus berada di layout dashboard jika user memulai dari dashboard.

### P2 - Discovery Mobile Dan Web Perlu Source Of Truth

Mobile punya `mobileFeatures.js`, web punya route dan landing grid sendiri.
Tanpa source of truth, fitur baru mudah masuk ke mobile tapi lupa di landing
web, atau sebaliknya.

Rekomendasi:

- Buat dokumen/manifest `feature-catalog` lintas platform.
- Setiap penambahan fitur wajib mengisi:
  - public web route
  - dashboard web route jika ada
  - mobile route/screen
  - auth requirement
  - CTA label
  - empty state
  - search/discovery inclusion

## Performance Findings

### P0 - Backend Cache Middleware Bisa Memberi Header Public Terlalu Dini

`CacheByType` di `services/api/app/http/middlewares/cache.go` mengatur header
sebelum `c.Next()` selesai. Karena status response dicek sebelum route handler
berjalan, middleware berpotensi memasang `Cache-Control: public` pada response
GET yang ternyata error, personal, atau authenticated.

Impact:

- Risiko cache policy salah untuk route private/personal.
- Sulit memastikan behavior cache benar saat route memakai auth middleware.
- Bisa membuat debug data stale lebih sulit.

Rekomendasi:

- Jalankan `c.Next()` dulu.
- Setelah handler selesai, set cache header hanya jika method GET, status
  sukses, path public/cacheable, dan response belum punya cache policy khusus.
- Skip path auth, dashboard/personal, user profile, bookmarks, notes, goals,
  notifications, achievements, stats, dan semua endpoint mutable.

### P0 - Backend Test Suite Belum Hijau

`go test ./...` di `services/api/app` gagal pada tiga area:

- `tafsir_service_test.go`: fake repo belum mengikuti interface terbaru yang
  sekarang membutuhkan `Search`.
- `http/routes_test.go`: route setup test panic karena repo nil dipakai oleh
  pool protection.
- `static_content_repository_test.go`: query dzikir `find by occasion` memakai
  kolom `id` ambigu.

Impact:

- Backend belum bisa disebut stabil setelah penambahan fitur.
- Risiko regresi endpoint/cache tidak tertangkap.

### P1 - Web Build Warning Root Lockfile/Turbopack

Build web berhasil, tetapi Next.js mendeteksi workspace root dari
`/home/firman/package-lock.json` dan memberi warning karena ada lockfile lain
di `apps/web/package-lock.json`.

Impact:

- Build cache dan file tracing bisa tidak konsisten.
- Warning ini akan terus muncul di CI/dev sampai root diset eksplisit.

Rekomendasi:

- Set `turbopack.root` di `apps/web/next.config.*`, atau rapikan lockfile root
  jika memang tidak dipakai.

### P1 - Landing Web Masih Full Client Component

`apps/web/src/app/page.js` memakai `'use client'`. Untuk landing page yang
banyak berisi content, CTA, dan widget terbatas, full client component membuat
bundle awal lebih berat dari yang diperlukan.

Rekomendasi:

- Jadikan page utama sebagai server component.
- Pindahkan hanya bagian interaktif ke client islands.
- Pastikan hero, feature grid, dan static content tetap render server-side.

### P1 - Quran Web Mengimpor `html2canvas` Di Top-Level

`apps/web/src/app/quran/[...slug]/AyahPage.js` mengimpor `html2canvas` di
top-level. Di route hadis detail, pola yang lebih ringan sudah dipakai dengan
dynamic import saat action dibutuhkan.

Rekomendasi:

- Ubah `html2canvas` di Quran detail menjadi dynamic import di handler share/
  export.
- Hindari memasukkan library screenshot ke initial bundle pembaca Quran.

### P1 - Mobile Quran Deep Target Bisa Fan-Out Banyak Request

`QuranScreen` punya pola load target ayah yang mengambil page 0 sampai target
page sekaligus. Untuk ayah yang jauh di akhir surah, ini bisa membuat banyak
request paralel hanya untuk membuka target tertentu.

Rekomendasi:

- Fetch target page langsung berdasarkan ayah/page metadata.
- Prefetch page sekitar target secukupnya.
- Hindari memuat semua page sebelumnya hanya untuk positioning awal.

### P1 - ExploreScreen Mobile Masih Menjadi Hotspot Besar

Explore sudah lebih baik karena active list memakai `FlatList` lewat shared
`Screen`, tetapi `ExploreScreen` masih memegang banyak state, handler, dan
mode fitur dalam satu file.

Impact:

- Sulit menjaga performa render saat katalog bertambah.
- Risiko regresi antar fitur tinggi karena satu screen mengatur terlalu banyak
  behavior.

Rekomendasi:

- Split handler per domain fitur: catalog list, social/forum, local tools,
  static content detail.
- Memoize row renderer dan action handler yang sering dipakai.
- Pertahankan `FlatList`; jangan kembali ke `items.map` di `ScrollView`.

### P2 - Mobile Test Lulus Tetapi Banyak Warning `act(...)`

Test mobile lulus 537 test, tetapi warning `act(...)` masih banyak muncul dari
beberapa screen. Ini bukan blocker release langsung, tetapi membuat signal test
lebih bising dan bisa menutupi warning baru.

Rekomendasi:

- Rapikan async test HomeScreen, PrayerScreen, QuranScreen, GlobalSearch, dan
  session-related tests.
- Jadikan warning baru sebagai indikator regresi setelah baseline dibersihkan.

### P2 - Backend Cache Key Coverage Belum Merata

`services/api/app/lib/cache.go` sudah punya TTL prefix untuk banyak domain,
tetapi fitur baru dan public catalog belum semuanya terlihat setara, seperti:

- asbabun-nuzul
- history/sejarah
- tokoh-tarikh
- jarh-tadil
- public forum reads jika memang boleh cache pendek

Rekomendasi:

- Standarkan cache key per domain dengan format jelas.
- Tambahkan invalidation/TTL sesuai jenis data.
- Hindari cache personal data di key publik.

## Priority Order

1. Fix backend cache middleware dan test suite backend.
2. Rapikan feature parity yang punya CTA mismatch: Khatam, Asmaul Flashcard,
   Achievements.
3. Update landing web agar feature discovery sinkron dengan mobile/public.
4. Tambahkan manifest atau task parity check lintas web/mobile/API.
5. Optimasi web bundle dan mobile Quran deep-load.
6. Bersihkan warning test mobile dan cache key coverage.

## Done Criteria Untuk Menutup Review Ini

- Backend `go test ./...` di `services/api/app` hijau.
- Mobile Khatam tidak lagi misleading.
- Asmaul Flashcard dan Achievements punya journey mobile atau status UI yang
  eksplisit.
- Landing web mengekspos fitur public baru yang sudah tersedia.
- Dashboard CTA tidak keluar dari layout dashboard saat user mulai dari
  dashboard.
- Ada manifest/checklist parity yang dipakai saat menambah fitur baru.
