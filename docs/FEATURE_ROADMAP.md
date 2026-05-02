# Feature Roadmap — Thalabul Ilmi

Aplikasi Islamic knowledge untuk penuntut ilmu. Backend: Go/Fiber + PostgreSQL.

---

## Status Saat Ini (Done)

| Feature | Endpoint | Catatan |
|---------|----------|---------|
| Al-Quran | `/surah`, `/ayah`, `/juz` | Data 114 surah + 6.236 ayah (Arab, ID, EN) |
| Hadith | `/books`, `/themes`, `/chapters`, `/hadiths` | Multi-kitab (Bukhari, Muslim, dll) |
| Auth & Users | `/auth/*`, `/users` | Register, login JWT, me, update password |

---

## Tier 1 — Prioritas Tinggi (Fondasi sudah siap)

### 1. Bookmark
Simpan ayah & hadith favorit per user.

**Model:**
```
Bookmark { ID, UserID, RefType (ayah|hadith), RefID, CreatedAt }
```

**Endpoint:**
- `POST /bookmarks` — tambah bookmark
- `GET /bookmarks` — list bookmark milik user (JWT)
- `DELETE /bookmarks/:id` — hapus bookmark (JWT)

**Dependency:** User ✅

---

### 2. Search
Full-text search lintas Quran dan Hadith.

**Endpoint:**
- `GET /search?q=&type=ayah|hadith|all&lang=id|ar|en`

**Teknis:** PostgreSQL `ILIKE` atau Full-Text Search (`tsvector`). Data sudah lengkap, tinggal query.

---

### 3. Reading Progress
Catat posisi baca terakhir per user per konten.

**Model:**
```
ReadingProgress {
  ID, UserID, ContentType (quran|hadith),
  SurahNumber, AyahNumber, BookSlug, HadithID, LastReadAt
}
```

**Endpoint:**
- `PUT /progress/quran` — update posisi quran (JWT)
- `GET /progress/quran` — ambil posisi terakhir (JWT)
- `PUT /progress/hadith` — update posisi hadith (JWT)
- `GET /progress/hadith` — ambil posisi terakhir (JWT)

---

### 4. Hafalan Tracker
Catat progress hafalan surah per user. Berbeda dari reading progress — ini untuk menandai surah yang sudah hafal.

**Model:**
```
HafalanProgress {
  ID, UserID, SurahID, Status (not_started|in_progress|memorized),
  StartedAt, CompletedAt
}
```

**Endpoint:**
- `PUT /hafalan/surah/:id` — update status hafalan (JWT)
- `GET /hafalan` — list semua surah + status hafalan user (JWT)
- `GET /hafalan/summary` — ringkasan (total hafal, in progress, dll) (JWT)

**Dependency:** User ✅, Surah ✅

---

### 5. Streak & Daily Habit
Hitung berapa hari berturut-turut user aktif membaca. Motivasi konsistensi.

**Model:**
```
UserActivity {
  ID, UserID, ActivityDate, Type (quran|hadith|doa), Count
}
```

**Logika:** Streak dihitung dari `UserActivity` — cek apakah kemarin juga ada aktivitas.

**Endpoint:**
- `POST /activity` — catat aktivitas harian (JWT, dipanggil otomatis dari reading progress)
- `GET /streak` — current streak + longest streak (JWT)

---

## Tier 2 — Nilai Tinggi (Butuh data tambahan)

### 6. Tafsir
Model `Tafsir` sudah ada di migration tapi belum ada service/controller/data.

**Endpoint:**
- `GET /tafsir/ayah/:id` — tafsir untuk satu ayah
- `GET /tafsir/surah/:number` — semua tafsir dalam surah

**Data:** Scrape dari sumber tafsir (Ibnu Katsir, Jalalayn, Al-Muyassar, dll).

---

### 7. Doa (Supplication)
Koleksi doa harian + doa situasional.

**Model:**
```
Doa {
  ID, Category (pagi|petang|makan|tidur|safar|...), Title,
  Arabic, Transliteration, Translation, Source
}
```

**Endpoint:**
- `GET /doa` — list semua doa
- `GET /doa/:id` — detail doa
- `GET /doa/category/:category` — filter by kategori

**Data:** Statis, seed dari file JSON.

---

### 8. Asmaul Husna
99 nama Allah beserta arti dan penjelasan.

**Model:**
```
AsmaUlHusna { ID, Number (1-99), Arabic, Transliteration, Indonesian, English, Meaning }
```

**Endpoint:**
- `GET /asmaul-husna` — semua 99 nama
- `GET /asmaul-husna/:number` — per nomor

**Data:** Statis, seed sekali.

---

### 9. Mufrodat / Kosakata Quran
Arti per kata dalam ayah. Berguna untuk belajar bahasa Arab dari Quran.

**Model:**
```
Mufrodat {
  ID, AyahID, WordIndex, Arabic, Transliteration,
  Indonesian, RootWord, PartOfSpeech
}
```

**Endpoint:**
- `GET /mufrodat/ayah/:id` — semua kata dalam satu ayah
- `GET /mufrodat/root/:word` — cari berdasarkan kata dasar

**Data:** Butuh scraping / dataset (e.g. Quranic Arabic Corpus).

---

### 10. Audio Murotal
Link audio recitation per ayah dan surah. Tidak perlu hosting sendiri, cukup simpan URL eksternal.

**Teknis:** Tambah field `audio_url` di model `Surah` dan `Ayah`, atau tabel `SurahAudio` untuk support multi-qari.

**Model:**
```
SurahAudio { ID, SurahID, QariName, QariSlug, AudioURL }
AyahAudio  { ID, AyahID,  QariName, QariSlug, AudioURL }
```

**Endpoint:**
- `GET /audio/surah/:number` — list audio surah by qari
- `GET /audio/ayah/:id` — audio ayah by qari

**Data:** URL dari sumber publik (e.g. everyayah.com, quran.com CDN).

---

### 11. Siroh Nabawiyah
Biografi Nabi Muhammad SAW dalam format bab-bab. Strukturnya identik dengan Hadith (Book → Chapter → Content).

**Teknis:** Bisa reuse model `Book` + `Chapter` + konten baru `SirohContent`, atau dedicated model.

**Endpoint:**
- `GET /siroh` — list bab siroh
- `GET /siroh/:id` — detail konten siroh

**Data:** Butuh scraping / konten manual.

---

### 12. Statistik Pribadi
Ringkasan aktivitas belajar user.

**Endpoint:**
- `GET /stats` — total ayah dibaca, total hadith dibaca, streak, hafalan summary (JWT)
- `GET /stats/weekly` — aktivitas per hari dalam 7 hari terakhir (JWT)

**Dependency:** Reading Progress ✅, Hafalan Tracker ✅, Streak ✅

---

### 13. Notifikasi / Reminder
Jadwal pengingat baca harian.

**Model:**
```
NotificationSetting {
  ID, UserID, Type (daily_quran|daily_hadith|doa),
  Time (HH:MM), IsActive, CreatedAt
}
```

**Endpoint:**
- `PUT /notifications/settings` — atur jadwal reminder (JWT)
- `GET /notifications/settings` — ambil setting (JWT)

**Teknis:** Butuh job scheduler (cron) + push notification service (FCM) atau email.

---

## Tier 3 — Kompleks / Fase Berikutnya

### 14. Jadwal Sholat
Waktu sholat berdasarkan koordinat GPS.

- Integrasi API eksternal (e.g. aladhan.com) atau library kalkulasi astronomi
- Endpoint: `GET /prayer-times?lat=&lng=&date=`

---

### 15. Quiz / Flashcard
Gamifikasi hafalan ayah atau hadith.

- Model: `Quiz`, `QuizQuestion`, `UserQuizResult`
- Mode: pilihan ganda, tebak ayah, tebak hadith
- Butuh desain gamifikasi lebih matang

---

### 16. Notes & Annotation
Catatan pribadi per ayah / hadith.

- Model: `Note { UserID, RefType, RefID, Content, UpdatedAt }`
- Private by default, opsional bisa di-share

---

### 17. Kamus Islami
Glosarium istilah Islam (fiqh, aqidah, tazkiyah, dll). Berguna untuk pemula.

- Model: `IslamicTerm { ID, Term, Category, Definition, Example, Reference }`
- Endpoint: `GET /dictionary`, `GET /dictionary/:term`, `GET /dictionary/category/:cat`

---

### 18. Diskusi / Komentar
Diskusi per ayah atau hadith antar pengguna.

- Model: `Comment { UserID, RefType, RefID, Content, ParentID (reply) }`
- Butuh moderasi konten

---

### 19. Share to Feed
Share konten ke sesama pengguna app, seperti mini social feed.

- Model: `Post { UserID, RefType, RefID, Caption, Likes, CreatedAt }`
- Dependency: Diskusi ✅

---

## Urutan Pengerjaan yang Disarankan

```
[Tier 1]
Bookmark → Search → Reading Progress → Hafalan Tracker → Streak

[Tier 2]
Doa → Asmaul Husna → Audio Murotal → Tafsir → Mufrodat → Siroh
→ Statistik Pribadi → Notifikasi

[Tier 3]
Jadwal Sholat → Quiz → Notes → Kamus → Diskusi → Feed
```
