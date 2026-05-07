# Mobile IA Revamp Task List

> Created: 2026-05-07
> Scope: `apps/mobile`
> IA source of truth: `docs/MOBILE_IA_FINAL_APPROACH.md`
> Related baseline: `docs/MOBILE_DESIGN_REWORK_TASKLIST.md`

## Goal

Revamp arsitektur navigasi mobile agar mengikuti keputusan final IA:

- Bottom tab tetap 5 item: Beranda, Quran, Hadis, Ibadah, Belajar.
- Quran dan Hadis tetap first-class.
- Prayer tab menjadi Ibadah hub.
- Explore menjadi Belajar hub.
- Profil turun dari bottom tab menjadi account/settings surface yang diakses dari avatar/header dan Personal section.
- Fitur backend long-tail tetap terdeliver lewat grouping, search, shortcut, recently opened, badges, dan deep link alias.

## Design Contract

- [ ] Semua perubahan mengikuti `docs/MOBILE_IA_FINAL_APPROACH.md`.
- [ ] Bottom tab tidak lebih dari 5 item.
- [ ] Tidak ada hub yang tampil sebagai flat grid panjang tanpa grouping.
- [ ] Setiap fitur backend punya minimal satu entry point yang jelas.
- [ ] Fitur yang muncul di dua intent tetap punya satu source screen/detail.
- [ ] Deep link lama tetap kompatibel melalui alias.
- [ ] Loading, empty, error, offline, auth, disabled, dan permission state tetap eksplisit.
- [ ] Semua list panjang memakai virtualization atau pagination.
- [ ] Web export, Expo Doctor, screenshot smoke, dan native smoke dijalankan sebelum revamp dianggap selesai.

---

## Phase 0 - IA Contract & Inventory

- [x] Tetapkan dokumen IA utama.
  - File: `docs/MOBILE_IA_FINAL_APPROACH.md`
- [x] Tandai proposal IA lain sebagai pembanding saja.
  - File: `docs/MOBILE_IA_APPROACH_A.md`, `docs/MOBILE_INFORMATION_ARCHITECTURE_APPROACH_CODEX.md`
- [x] Buat alias dokumen IA lama ke dokumen utama.
  - File: `docs/MOBILE_IA_FINAL.md`
- [x] Audit tab/screen mobile aktif sebelum refactor.
  - File: `apps/mobile/App.js`, `apps/mobile/src/components/TabBar.js`
  - Result: shell canonical sekarang memakai `home/quran/hadith/ibadah/belajar`; `profile` tetap hidden account surface.
- [x] Audit deep link lama dan route alias yang wajib dipertahankan.
  - File: `apps/mobile/src/utils/deepLinks.js`
  - Result: alias ditambahkan pada Phase 1 di sesi yang sama
- [x] Audit feature registry dan mapping feature ke hub final.
  - File: `apps/mobile/src/data/mobileFeatures.js`
- [x] Buat mapping final feature key -> hub -> source screen.
  - Output: `belajarFeatureGroups` menjadi mapping Belajar; Ibadah mapping ada di `apps/mobile/src/screens/IbadahScreen.js`.

## Phase 1 - Routing Compatibility & Tab Contract

- [x] Ubah kontrak tab final menjadi:
  - Beranda (`home`)
  - Quran (`quran`)
  - Hadis (`hadith`) ← ditambahkan sebagai first-class tab
  - Ibadah (`ibadah`) ← gantikan `prayer`
  - Belajar (`belajar`) ← gantikan `explore`
  - File: `apps/mobile/src/components/TabBar.js`
- [x] Pastikan `Hadis` tetap first-class tab, bukan feature di Belajar.
  - Icon: `ScrollText`; key: `hadith`; label: `Hadis`
- [x] Ubah tab `Prayer` menjadi `Ibadah` tanpa memutus state/back navigation.
  - `isActive={activeTab === 'ibadah'}` di App.js; `setBack`/`clearBack` tetap lewat props
- [x] Ubah tab `Explore` menjadi `Belajar` tanpa memutus feature detail.
  - Screen pane dan `deepLinkTarget` di App.js diupdate ke key `belajar`
- [x] Pindahkan `Profil` dari bottom tab ke account/settings surface.
  - Dihapus dari `tabs[]` di TabBar.js; ProfileScreen tetap ada di App.js sebagai hidden screen
- [x] Tambahkan route alias:
  - `prayer`, `sholat` -> `ibadah`
  - `explore`, `ilmu` -> `belajar`
  - `profile` -> tetap di `knownTabs`, accessible via deep link
  - `qibla`, `kiblat` -> `ibadah` view `qibla`
  - File: `apps/mobile/src/utils/deepLinks.js`
- [x] Update caller screens: `HomeScreen.js`, `ProfileScreen.js` — semua `onOpenTab('explore', ...)` → `onOpenTab('belajar', ...)`
- [x] Pastikan web hash deep link tetap bekerja untuk smoke test.
  - Checked: `#/prayer`, `#/prayer/settings`, `#/ibadah/jadwal-sholat`, `#/ibadah/qibla`, `#/qibla`, `#/explore/quiz`, `#/profile/storage`
- [x] Pastikan native scheme `thullaabulilmi://` tetap kompatibel.
  - Checked: `thullaabulilmi://kiblat` -> `ibadah` view `qibla`

## Phase 2 - Ibadah Hub

- [x] Refactor `PrayerScreen` atau buat `IbadahScreen` sebagai hub baru.
  - File: `apps/mobile/src/screens/IbadahScreen.js`
- [x] Jadikan Jadwal Sholat sebagai primary card di Ibadah.
- [x] Group section Ibadah:
  - Harian
  - Arah & Waktu
  - Dzikir & Bacaan
  - Alat
  - Rencana
- [x] Pindahkan/ekspos feature berikut ke Ibadah:
  - Jadwal Sholat
  - Log Sholat
  - Qibla
  - Doa
  - Dzikir
  - Wirid
  - Tahlil
  - Tasbih
  - Zakat
  - Faraidh
  - Khatam
  - Imsakiyah
  - Kalender Hijriah
  - Manasik
  - Asmaul Husna sebagai bacaan/dzikir entry
- [x] Pastikan feature detail lama tetap bisa dibuka dari hub Ibadah.
  - Jadwal Sholat dan Qibla memakai sub-view internal Ibadah.
  - Fitur ibadah lain masih membuka detail existing lewat `Belajar` sebagai transisi agar logic tidak diduplikasi.
- [x] Pastikan permission/location/compass states tetap jelas.
  - Reuse `PrayerScreen` dan `QiblaScreen` existing states.
- [x] Pastikan no long-scroll dump; gunakan section card/rows dan detail navigation.

## Phase 3 - Belajar Hub

- [x] Refactor `ExploreScreen` menjadi `BelajarScreen` atau rename konsep UI-nya.
  - Title diubah dari "Ilmu" → "Belajar"; grup tab + feature grid dihapus; hub grouped menggantikan.
  - File: `apps/mobile/src/screens/ExploreScreen.js`
- [x] Tambahkan search/filter feature katalog di Belajar.
  - `PaperSearchInput` + `catalogSections` useMemo dengan `matchesCatalogQuery` dan empty state.
- [x] Group section Belajar:
  - Kajian & Artikel
  - Siroh & Sejarah
  - Fiqh & Panduan
  - Referensi
  - Evaluasi
  - Personal Ringkas
- [x] Pindahkan/ekspos feature berikut ke Belajar:
  - Kajian, Blog/Artikel, Siroh, Sejarah, Fiqh, Manasik, Kamus, Quiz, Tafsir, Asbabun Nuzul, Perawi, Asmaul Husna
  - Jarh wa Ta'dil: belum ada feature entry di `mobileFeatures.js`
- [x] Tambahkan Personal Ringkas lengkap:
  - Goals, Stats, Leaderboard, Bookmarks, Notes
- [x] Pastikan Hadis tetap primary tab; Belajar hanya boleh menampilkan shortcut ilmu hadis/perawi.
  - Perawi ada di Referensi section; HadithScreen tetap dedicated tab.
- [x] Hindari flat grid panjang; gunakan grouped rows/card compact.
  - Menggunakan `SectionHeader` + `CompactRow` dalam `belajarCard` container.

## Phase 4 - Hadis First-Class Preservation

- [x] Pastikan tab Hadis tetap ada di bottom tab.
  - Ditambahkan di Phase 1: key `hadith`, icon `ScrollText`, label `Hadis`
- [ ] Pastikan Hadis punya search/filter kitab horizontal.
- [ ] Pastikan Hadis detail tabs tetap utuh:
  - Teks
  - Sanad
  - Perawi
  - Takhrij
  - Catatan
- [ ] Pastikan saved hadith, notes, dan bookmarks tetap bekerja.
- [ ] Pastikan shortcut Perawi/Jarh/Takhrij dari Belajar mengarah ke source screen Hadis/detail yang sama.
- [ ] Pastikan deep link `hadith/:id` tidak berubah.

## Phase 5 - Profile Surface

- [x] Buat account/profile entry dari avatar Beranda.
  - Existing: avatar Beranda membuka `profile`.
- [x] Buat account/profile entry dari Belajar header atau Personal section.
  - Added: action icon `Buka Profil` di header Belajar.
- [x] Pindahkan Profil dari bottom tab tanpa menghapus screen/settings yang sudah ada.
  - Existing: ProfileScreen tetap hidden route di App.js.
- [x] Pastikan auth-required empty states masih punya CTA jelas ke Profil.
  - Updated copy: tidak lagi menyebut "tab Profil" setelah Profil keluar dari bottom tab.
- [ ] Pastikan Profile settings detail tetap tersedia:
  - Account
  - Notifications
  - Offline
  - Cache/data sementara
  - Security
  - Appearance/language jika tersedia
- [ ] Pastikan personal summary tetap bisa ditemukan di Belajar/Profil:
  - Streak
  - Points
  - Tilawah
  - Hafalan
  - Sholat log
  - Goals
  - Achievements

## Phase 6 - Discovery Layer

- [ ] Tambahkan atau rapikan global search untuk fitur dan konten.
- [ ] Tambahkan recently opened di Beranda.
- [ ] Tambahkan pinned shortcuts/favorites di Beranda.
- [ ] Tambahkan contextual shortcuts berdasarkan waktu/aktivitas:
  - Dzikir pagi/petang
  - Sholat berikutnya
  - Qibla saat lokasi aktif
  - Tafsir/asbab setelah membaca Quran
- [ ] Tambahkan badge kecil di feature rows/cards:
  - Butuh akun
  - Offline
  - Baru
  - Terakhir dibuka
- [ ] Pastikan Home tetap ringkas dan tidak menjadi katalog semua fitur.

## Phase 7 - Documentation Updates

- [ ] Update `docs/MOBILE_DESIGN_REWORK_TASKLIST.md` agar phase baru mengacu ke tasklist ini.
- [ ] Update `docs/MOBILE_FEATURE_REFERENCE.md` status navigasi mobile setelah IA revamp.
- [ ] Tambahkan catatan migration/deep link compatibility.
- [ ] Catat screenshot/native evidence path setelah QA.
- [ ] Jalankan `chronicle.sync` setelah perubahan signifikan.

## Phase 8 - QA & Verification

- [x] `npx expo export --platform web` pass.
  - Last checked: 2026-05-07 after Phase 3 Belajar hub slice.
- [x] `npx expo-doctor` pass.
  - Last checked: 2026-05-07, 17/17 checks passed.
- [x] `git diff --check -- apps/mobile docs` clean untuk file terkait.
  - Last checked: 2026-05-07 for `ExploreScreen.js`, `mobileFeatures.js`, and `MOBILE_IA_REVAMP_TASKLIST.md`.
- [ ] Screenshot smoke web desktop/mobile untuk:
  - Beranda
  - Quran
  - Hadis
  - Ibadah hub
  - Ibadah detail Jadwal Sholat
  - Ibadah detail Qibla
  - Belajar hub
  - Belajar feature detail
  - Profile/account surface
- [ ] Deep link smoke untuk:
  - `#/profile`
  - `#/prayer`
  - `#/qibla`
  - `#/explore/:featureKey`
  - route baru Ibadah/Belajar
- [ ] Native Expo Go smoke Android untuk:
  - Bottom tab final
  - Avatar -> Profile surface
  - Ibadah hub
  - Belajar hub
  - Hadis tab
  - Qibla
- [ ] Manual native check jika ADB input masih diblok:
  - Keyboard behavior
  - Native time picker
  - Permission prompts
  - Offline pack confirmation

## Suggested Implementation Order

1. Phase 0 + Phase 1: contract, route aliases, and tab shell.
2. Phase 2: Ibadah hub because it replaces the narrow Prayer tab.
3. Phase 3: Belajar hub because it absorbs Explore.
4. Phase 5: Profile surface after bottom tab no longer owns Profil.
5. Phase 6: discovery layer.
6. Phase 8: full smoke and native verification.

## Current Blockers / Risks

- ADB input injection on the Xiaomi device may still be blocked by `INJECT_EVENTS`; native manual checks may require direct physical taps.
- Moving Profil out of bottom tab requires careful auth CTA and deep link compatibility.
- `ExploreScreen` currently carries many feature detail behaviors; refactor should preserve source screen/state instead of duplicating logic.
- Hadis must remain first-class and should not be visually buried inside Belajar.
