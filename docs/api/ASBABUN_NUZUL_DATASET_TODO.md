# Asbabun Nuzul Dataset — Tracker

> Last updated: 2026-05-08
> Schema: `services/api/app/model/asbabun_nuzul.go` (m2m → Ayah)
> Dataset file: `services/api/app/db/migrations/seeder_asbabun_nuzul_data.go`
> Acuan aturan: `MEMORY.md "Islamic data seeding harus shahih"`

## Status saat ini

| Metric | Angka |
|---|---|
| Entri ter-seed | **44** |
| Ayat ter-cover (range expanded) | ~75 |
| Surat ter-cover (sebagian) | 19 |
| Coverage vs total Quran (6,236 ayat) | ~1.2% |
| Coverage vs estimasi total asbab shahih (~270) | ~16% |

## Target final (MVP shahih)

**~250-350 entri** total — setara dengan dataset:
- *Shahih Asbabun Nuzul* karya Syaikh Muqbil Al-Wadi'i (~270 riwayat shahih)
- atau *Lubabun Nuqul* As-Suyuthi setelah filter shahih (~300-400 riwayat)

## Rules wajib

Tiap entri baru WAJIB memenuhi:

1. **Source spesifik**: nama kitab + nomor hadis/halaman + grade. Tidak boleh kabur.
2. **Sumber shahih**: Bukhari, Muslim, atau Sunan dengan tashih ulama mu'tabar (Al-Albani, Syu'aib Al-Arnauth, Muqbil Al-Wadi'i). Lubabun Nuqul boleh kalau jalur shahih sudah dikonfirmasi.
3. **JANGAN** masukkan riwayat dha'if/maudhu' walaupun populer.
4. **JANGAN** auto-scrape situs umum tanpa review manual.
5. **Title** unik (jadi natural key idempotent untuk seeder).
6. **Range AyahFrom..AyahTo** harus akurat — kalau ragu, set keduanya sama (single ayah).

## Backlog per surat (target prioritas tinggi)

Surat-surat berikut paling sering dibuka di mobile app + paling banyak riwayat shahih-nya. Diurutkan dari yang paling kurang coverage-nya.

### Tier 1 — Surat panjang utama

#### Al-Baqarah (2) — covered: 5/286
Sudah ada: 115, 144, 158, 187, 189, 196, 222.
Gap target (semua punya riwayat shahih):
- [ ] **2:1-7** — Pembagian manusia (mukmin/kafir/munafik) — Tafsir Ibnu Katsir
- [ ] **2:97-98** — Jibril musuh Yahudi — Bukhari (Anas)
- [ ] **2:104** — "Ra'ina" — Tafsir; cek shahih
- [ ] **2:142-143** — Pemindahan kiblat (lengkap) — Bukhari
- [ ] **2:178** — Qishash — Bukhari (Ibnu Abbas)
- [ ] **2:219** — Khamr & maisir tahap 1 — Tirmidzi (Umar)
- [ ] **2:223** — Wanita ladang — Bukhari/Muslim (Jabir)
- [ ] **2:238** — Shalat wustha — Muslim (Zaid bin Tsabit)
- [ ] **2:255** — Ayat Kursi (asbab tafsir Ubay) — Muslim
- [ ] **2:284-286** — Akhir Al-Baqarah, doa para sahabat — Muslim (Abu Hurairah)

#### An-Nisa' (4) — covered: 4/176
Sudah ada: 11, 43, 59, 65, 95.
Gap target:
- [ ] **4:7** — Hak waris perempuan — Tirmidzi
- [ ] **4:19** — Larangan mewarisi istri — Bukhari (Ibnu Abbas)
- [ ] **4:24** — Mut'ah dilarang setelah Khaibar — Muslim (Sabrah Al-Juhani)
- [ ] **4:32** — Wanita ingin perang — Tirmidzi (Ummu Salamah)
- [ ] **4:34** — Kepemimpinan suami — Tafsir Ath-Thabari
- [ ] **4:48** — Tidak diampuni syirik — Bukhari
- [ ] **4:88** — Munafik — Bukhari/Muslim (Zaid bin Tsabit)
- [ ] **4:97** — Yang aniaya diri sendiri — Bukhari (Ibnu Abbas)
- [ ] **4:127** — Wanita yatim — Bukhari (Aisyah)
- [ ] **4:176** — Kalalah — Bukhari/Muslim (Jabir)

#### Ali 'Imran (3) — covered: 1/200
Sudah ada: 122.
Gap target:
- [ ] **3:7** — Muhkam & mutasyabih — Bukhari/Muslim (Aisyah)
- [ ] **3:33-34** — Keluarga 'Imran — Tafsir
- [ ] **3:73** — Yahudi & cara dakwah — Bukhari (Anas)
- [ ] **3:128** — "Tidak ada urusan" setelah Uhud — Bukhari/Muslim
- [ ] **3:140-144** — Muhammad sebagai Rasul (post-Uhud) — Bukhari (Anas)
- [ ] **3:154** — Mengantuk saat Uhud — Bukhari (Anas)
- [ ] **3:172-173** — Hamra'ul Asad — Bukhari (Aisyah)
- [ ] **3:186-188** — Ujian harta & kemunafikan Yahudi — Bukhari/Muslim
- [ ] **3:190-191** — Penciptaan langit & doa malam — Bukhari (Ibnu Abbas)
- [ ] **3:200** — Ribath — Tirmidzi

#### Al-Maidah (5) — covered: 3/120
Sudah ada: 3, 6, 90-91.
Gap target:
- [ ] **5:5** — Wanita Ahli Kitab halal dinikahi — Tafsir
- [ ] **5:31** — Dua putra Adam — Tafsir Ibnu Katsir
- [ ] **5:38** — Hukuman pencuri — Tirmidzi
- [ ] **5:41** — Yahudi & rajam — Bukhari/Muslim
- [ ] **5:67** — Perintah menyampaikan — Tirmidzi (hasan)
- [ ] **5:93** — Sebelum khamr diharamkan, sahabat sudah wafat — Tirmidzi
- [ ] **5:101** — Jangan banyak tanya (haji) — Bukhari/Muslim
- [ ] **5:103** — Bahirah, sa'ibah — Bukhari

### Tier 2 — Surat sedang

#### At-Taubah (9) — covered: 2/129
Sudah ada: 84, 113.
Target tambah: 9:25 (Hunain), 9:38-41 (Tabuk), 9:79 (sedekah), 9:117-118 (tobat tiga sahabat — Ka'b bin Malik, Bukhari).

#### An-Nur (24) — covered: 4/64
Sudah ada: 6-9, 11-21, 31, 33.
Tambah: 24:23 (qadzaf), 24:27-28 (izin masuk).

#### Al-Anfal (8) — covered: 1/75
Sudah ada: 1.
Tambah: 8:5-9 (Badar), 8:67-68 (tawanan Badar — Muslim).

#### Al-Ahzab (33) — covered: 4/73
Sudah ada: 35, 37, 53, 56.
Tambah: 33:6 (auliya), 33:23 (sahabat yang menepati janji), 33:33 (ahlul bait — Muslim Aisyah), 33:50.

#### Al-Hujurat (49) — covered: 2/18
Sudah ada: 1, 2-3.
Tambah: 49:6 (Walid bin Uqbah — Tafsir), 49:11 (Bani Tamim — Tirmidzi), 49:13 (Bilal — Tafsir).

### Tier 3 — Surat pendek (Juz Amma)

Banyak surat pendek punya asbab nuzul yang ada di Bukhari/Muslim:

- [ ] **Al-Falaq + An-Nas (113-114)** — sihir Labid bin A'sham — Bukhari (Aisyah)
- [ ] **Al-Ikhlas (112)** — Quraisy bertanya nasab Tuhan — Tirmidzi (Ubay)
- [ ] **Al-Fil (105)** — Pasukan Abrahah — Tafsir
- [ ] **Al-'Ashr (103)** — Tafsir umum
- [ ] **At-Takatsur (102)** — Saling berbangga — Tirmidzi
- [ ] **Al-Qari'ah (101)** — Tafsir
- [ ] **Az-Zalzalah (99)** — Tafsir
- [ ] **Al-Qadr (97)** — Tafsir umum
- [ ] **Al-Bayyinah (98)** — Tafsir umum
- [ ] **Al-Qiyamah (75)** — sudah ada 16-19, tambah lain
- [ ] **Al-Insan (76)** — Ali, Fatimah, Hasan, Husain — Tafsir
- [ ] **Al-Mursalat (77)** — Bukhari (ular di Mina) — Ibnu Mas'ud
- [ ] **An-Naba' (78)** — Tafsir
- [ ] **'Abasa (80)** — sudah ada 1-10, mungkin tambah lain
- [ ] **At-Takwir (81)** — Tafsir
- [ ] **Al-Infithar (82)** — Tafsir
- [ ] **Al-Muthaffifin (83)** — Madinah, pedagang curang — Nasai (Ibnu Abbas)
- [ ] **Al-Insyiqaq (84)** — Tafsir
- [ ] **Al-Buruj (85)** — Ashabul Ukhdud — Muslim (Shuhaib)

### Tier 4 — Mekah klasik

- [ ] **Al-An'am (6)** — sudah ada 52, tambah 6:151-153, 6:162-163
- [ ] **Al-A'raf (7)** — 7:31 (telanjang thawaf), 7:172-173 (mitsaq)
- [ ] **Yusuf (12)** — Tafsir umum (sebab nuzul jarang)
- [ ] **Al-Isra' (17)** — sudah ada 85, tambah 17:1 (Isra Mi'raj), 17:23-24
- [ ] **Al-Kahf (18)** — 18:23-24 (Insya Allah)
- [ ] **Maryam (19)** — 19:64 (Jibril datang lambat — Bukhari)
- [ ] **Thaha (20)** — 20:1-2 (Nabi shalat malam — Tafsir)

## Workflow tambah batch

Setiap batch:

1. Ambil 25-40 entri dari satu/dua tier prioritas.
2. Cross-check tiap riwayat di:
   - Maktabah Syamilah (kitab digital ulama)
   - Sahih Bukhari/Muslim numbering (cek nomor hadis)
   - Tashih ulama: cek di Maktabah Asy-Syamilah atau dorar.net
3. Append ke `verifiedAsbabunNuzulDataset()` di `seeder_asbabun_nuzul_data.go`.
4. Update angka di section "Status saat ini" doc ini.
5. `go build ./...` → harus hijau.
6. Commit per batch dengan pesan: `feat(api): seed asbabun nuzul batch <N> (<topik>, +<count> entri)`

## Sumber digital yang sudah dikonfirmasi terpercaya

- Maktabah Asy-Syamilah (kitab digital lengkap, manhaj klasik)
- dorar.net (mausu'ah dorar — derajat hadis)
- almanhaj.or.id (rujukan jelas, manhaj salaf, perlu re-verify per entri)
- shamela.ws (kitab digital, cross-check dengan teks asli)

**Hindari** auto-scrape situs umum (kompasiana, dakwatuna, blog umum) — manhaj-nya tidak konsisten.

## Catatan derajat hadis

Saat menulis field `Source`:
- **Shahih (Muttafaq 'alaih)**: ada di Bukhari + Muslim
- **Shahih (Bukhari)** atau **Shahih (Muslim)**: hanya di salah satu
- **Hasan Shahih**: derajat di bawah shahih lighairih
- **Hasan**: hadis hasan
- **Shahih oleh Al-Albani**: Sunan dengan tashih Al-Albani di Sahih At-Targhib atau Silsilah As-Sahihah
- **Shahih oleh Muqbil**: yang dipilih di Shahih Asbabun Nuzul

JANGAN tulis "Shahih" tanpa attribution kalau bukan dari Shahihain.
