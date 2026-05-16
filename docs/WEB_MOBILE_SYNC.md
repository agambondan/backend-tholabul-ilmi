# Web ↔ Mobile Sync Documentation

> **Tujuan:** Dokumen ini memetakan hubungan antara web app (Next.js) dan mobile app (Expo React Native)
> agar agen masa depan bisa port fitur secara konsisten tanpa bolak-balik eksplorasi.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                  Backend (Go/Fiber)               │
│  ~230 endpoints, auth JWT, Redis cache, DB pool   │
│  services/api                                     │
└──────┬────────────────────────────────┬───────────┘
       │ HTTP                            │ HTTP
       ▼                                 ▼
┌──────────────┐                 ┌────────────────┐
│  Web (Next.js) │                 │  Mobile (Expo) │
│  apps/web/     │                 │  apps/mobile/   │
│  App Router    │                 │  React Native   │
│  60+ pages     │                 │  9 screens      │
│  535 tests     │                 │  530 tests      │
└────────────────┘                 └────────────────┘
```

**Poin kunci:**
- Kedua client pakai **API backend yang sama persis** — tidak ada endpoint khusus mobile/web.
- Auth: JWT Bearer token via `Authorization` header, disimpan di `localStorage` (web) / `SecureStore` (mobile).
- Web pakai `src/lib/api.js` → `fetch()` langsung.
- Mobile pakai `src/api/client.js` → `fetch()` via `NativeModules` auto-resolve URL.

---

## Feature Parity Matrix

| Feature | Web Page(s) | Mobile Screen | API Module (Mobile) | Status |
|---------|------------|---------------|---------------------|--------|
| **Quran Reader** | `/quran/[...slug]` | `QuranScreen` | `client.js` | ✅ Sync |
| **Hadis** | `/hadis/**` | `HadithScreen` | `client.js` | ✅ Sync |
| **Jadwal Sholat** | `/jadwal-sholat` | `PrayerScreen` (via `IbadahScreen`) | `client.js` | ⚠️ Web punya adzan audio, mobile belum |
| **Kiblat** | `/kiblat` | `QiblaScreen` (via `IbadahScreen`) | `client.js` | ✅ Sync |
| **Doa** | through Explore | through Explore + Ibadah hub | `explore.js` | ✅ Sync |
| **Dzikir** | through Explore | through Explore + Ibadah hub | `explore.js` | ✅ Sync |
| **Tasbih** | through Explore | through Explore (`localTools`) | local | ✅ Sync |
| **Asmaul Husna** | `/asmaul-husna`, `/asmaul-husna/wirid` | through Explore | `explore.js` | ⚠️ Web punya wirid counter, mobile hanya list |
| **Tafsir** | `/tafsir/[slug]` | through Explore (`surah-content`) | `explore.js` | ⚠️ Web punya side-by-side comparison, mobile single view |
| **Zakat** | `/zakat` (6 tab + history) | through Explore (`localTools`) | `explore.js` | ⚠️ Web punya 6 jenis + save/history, mobile hanya calculator sederhana |
| **Faraidh** | `/faraidh` (print + save + musytarakah) | through Explore (`localTools`) | `explore.js` | ⚠️ Web punya dual-sync save/history + musytarakah, mobile hanya calculator |
| **Siroh** | through Explore | through Explore | `explore.js` | ✅ Sync |
| **Tokoh Tarikh** | `/tokoh` (search, era filter, modal) | ❌ | ❌ | ❌ Missing |
| **Peta Interaktif** | `/peta` (Leaflet + 11 markers) | ❌ | ❌ | ❌ Missing |
| **Kajian** | `/kajian` (YouTube embed) | through Explore | `explore.js` | ✅ Sync |
| **Forum Q&A** | `/forum`, `/forum/ask`, `/forum/[slug]` | ❌ | ❌ | ❌ Missing |
| **Achievements** | `/dashboard/achievements` | `ProfileScreen` (section) | `personal.js` | ⚠️ Web punya dedicated page dengan recharts, mobile hanya section kecil |
| **Stats** | `/dashboard/stats` (recharts) | `ProfileScreen` (section) | `personal.js` | ⚠️ Web lebih rich dengan activity chart |
| **Notifikasi** | `/dashboard/notifications` | `NotificationCenter` (via Explore) | `personal.js` | ✅ Sync |
| **Munasabah** | in AyahPage (toggle) | ❌ | ❌ | ❌ Missing |
| **Hadis-Ayah** | in AyahPage + `/hadis/[slug]` | ❌ | ❌ | ❌ Missing |

---

## How Mobile Renders Features

Mobile app punya **2 mekanisme render fitur**:

### 1. Screen-level (hardcoded)
Fitur utama punya screen sendiri:
- `QuranScreen.js` — full Quran reader
- `HadithScreen.js` — full hadis reader
- `PrayerScreen.js` — jadwal sholat + log
- `QiblaScreen.js` — kompas kiblat

Di-render via `App.js` → TabBar (5 tab: home, quran, hadith, ibadah, belajar). Sub-view via `navigator.current.view`.

### 2. Feature-level (dynamic via `mobileFeatures.js`)
Fitur lain dirender melalui `ExploreScreen.js` (tab Belajar) berdasarkan definisi di `src/data/mobileFeatures.js`:

| `type` | Behavior | Local/API |
|--------|----------|-----------|
| `list` | List paginated (dari endpoint) | API via `getFeatureItemPage()` |
| `protected-list` | Sama, tapi dengan auth | API |
| `feed` | Feed komunitas dengan komentar | API via `social.js` |
| `kamus` | Search dictionary | API via `searchDictionary()` |
| `quiz` | Quiz 5 soal | API via `getQuizQuestions()` |
| `hijri` | Hijri date + events | API via `getHijriOverview()` |
| `tasbih` | Counter lokal | **Local** (`localTools`) |
| `zakat` | Zakat kalkulator | **Local** (`localTools`) |
| `faraidh` | Faraidh calculator | **Local** (`localTools`) |
| `sholat-tracker` | Log sholat | API + local |
| `notifications` | Notification center | API via `personal.js` |
| `surah-content` | Tafsir/asbab by surah | API via `client.js` |
| `user-wird` | CRUD wirid pribadi | API via `personal.js` |
| `bookmarks` | Bookmark list | API via `personal.js` |
| `notes` | Notes list | API via `explore.js` |

Semua `localTools` hanya jalan 100% lokal tanpa komunikasi backend.

---

## Feature Gap Detail (11 Fitur Web yg Belum di Mobile)

### 1. Forum Q&A
- **Web:** 4 pages + 8 endpoints + model `ForumQuestion/ForumAnswer/ForumVote`
- **Mobile:** Nothing. Tidak ada screen, API module, atau entry di `mobileFeatures.js`
- **Action:** Buat screen baru (`ForumScreen` via tab Belajar) atau tambah `type: 'forum'` ke `mobileFeatures.js` dengan endpoint `GET /api/v1/forum/questions`
- **Component reuse:** 0% — harus dari scratch

### 2. Tokoh Tarikh
- **Web:** `/tokoh` page dengan search, era filter (pre-islam/makkah/madinah/abbasiyah/umawiyah/ottoman/modern), detail modal
- **Mobile:** Tidak ada
- **Action:** Nambah `{ key: 'tokoh', type: 'list', endpoint: '/api/v1/tokoh-tarikh' }` ke `mobileFeatures.js`, render detail via modal popup (existing pattern)
- **Component reuse:** High — API sama, FE tinggal adapter ExploreScreen pattern

### 3. Peta Interaktif
- **Web:** `/peta` page pakai Leaflet + OpenStreetMap + 11 marker popup
- **Mobile:** Tidak ada
- **Action:** Butuh `react-native-maps` (library baru) + `expo-location` (udah ada). Bisa di-trigger via Ibadah hub row atau Belajar catalog.
- **Component reuse:** Low — Leaflet != react-native-maps, tapi data markers sama

### 4. Wirid Asmaul Husna
- **Web:** `/asmaul-husna/wirid` page — 99 names counter, prev/next, localStorage, progress bar, vibrate
- **Mobile:** Hanya `{ type: 'list', endpoint: '/api/v1/asmaul-husna' }` — list nama doang
- **Action:** Nambah `type: 'wirid-asmaul'` ke `localTools` di ExploreScreen, render counter component mirip tasbih pattern
- **Component reuse:** Medium — logic counter mirip tasbih, UI RN dari scratch

### 5. Zakat Riwayat
- **Web:** 6 jenis zakat (maal, penghasilan, emas, perak, pertanian, ternak) + save ke BE + history page `/zakat/history`
- **Mobile:** Hanya zakat maal calculator sederhana tanpa save
- **Action:** Ekstensi `type: 'zakat'` di ExploreScreen jadi multi-tab + API save via `kalkulasiZakatApi`. Tambah API calls ke `personal.js` atau `explore.js`
- **Component reuse:** Medium — API sama, UI tab/carousel dari scratch

### 6. Faraidh Dual-Sync
- **Web:** Calculator + localStorage + BE sync + cloud icon + print + Musytarakah case
- **Mobile:** Calculator sederhana tanpa save, tanpa special case
- **Action:** Upgrade `type: 'faraidh'` di ExploreScreen: tambah lokal AsyncStorage + API ke `POST /api/v1/faraidh/simpan`. Import logic faraidh (`lib/faraidh.js`) ke mobile.
- **Component reuse:** Medium — API sama, logic faraidh perlu di-port ke JS/RN

### 7. Munasabah
- **Web:** Toggle di AyahPage — `BsLink45Deg` button → purple expandable card showing related ayahs
- **Mobile:** Tidak ada di Quran reader
- **Action:** Nambah button di `QuranScreen` → fetch `GET /api/v1/munasabah/:ayahId` → show bottom-sheet
- **Component reuse:** Low — RN bottom-sheet pattern berbeda, tapi endpoint sama

### 8. Hadis-Ayah Cross-Reference
- **Web:** `GET /hadiths/:hadithId/ayahs` + `GET /ayahs/:ayahId/hadiths` — dipajang di kedua detail page
- **Mobile:** Tidak ada di HadithScreen atau QuranScreen
- **Action:** Tambah section "Ayat Terkait" di HadithScreen detail + "Hadis Terkait" di QuranScreen
- **Component reuse:** High — data API aja, tinggal render di detail component

### 9. Tafsir Side-by-Side
- **Web:** Toggle "Bandingkan" → 2-column grid: Kemenag kiri, Al-Mishbah kanan
- **Mobile:** Single view aja (nampilin kitab default)
- **Action:** Tambah toggle button di ExploreScreen `surah-content` detail view. Atau buka di modal popup dengan tab/segmented control.
- **Component reuse:** Medium — tafsir data sudah sama, layout RN perlu 2-column scroll

### 10. Adzan Audio
- **Web:** Di `/jadwal-sholat` — countdown ke next prayer → play adzan audio via `Audio` + browser Notification API
- **Mobile:** `PrayerScreen` cuma nampilin jadwal + notif reminder lokal tanpa audio adzan
- **Action:** Tambah `expo-av` audio player di PrayerScreen saat waktu masuk + schedule background task. Atau integrate dengan local notification sound.
- **Component reuse:** Low — RN pakai `expo-av`, web pakai browser `Audio` API

### 11. Streak Risk Notification
- **Web:** `streak_risk` notification type + web push service worker
- **Mobile:** NotificationCenter sudah ada, tapi belum handle `streak_risk`
- **Action:** Pastiin `DispatchDueReminders` di backend handle streak_risk → Expo push token udah registered. FE mobile tinggal render notification dengan tipe streak_risk di NotificationCenter.
- **Component reuse:** High — BE fully handles, mobile tinggal render inbox item

---

## Pattern Reference: Porting Feature to Mobile

### Flow: List Feature (paling umum)

**Web:**
```js
// app/foo/page.js
import { api } from '@/lib/api';
export default async function FooPage() {
  const data = await api.get('/api/v1/foo');
  return <div>{data.items.map(item => <Card>{item.title}</Card>)}</div>;
}
```

**Mobile:**
```js
// src/api/foo.js
import { requestJson } from './client';
import { normalizeExploreItem } from './explore';
export const getFooItems = async () => {
  const payload = await requestJson('/api/v1/foo');
  return pickItems(payload).map(normalizeExploreItem);
};
```

Lalu cukup tambah ke `mobileFeatures.js`:
```js
{ key: 'foo', title: 'Foo', subtitle: '...', type: 'list', endpoint: '/api/v1/foo' }
```

ExploreScreen otomatis handle loading, pagination, list render, dan detail modal.

### Flow: Local Tool Feature

**Web:**
```js
// client-side only, useState-based
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c+1)}>{count}</button>;
}
```

**Mobile:**
```js
// masuk ke ExploreScreen renderFeatureContent
if (activeFeature.type === 'counter') {
  return (
    <Card>
      <CardTitle>{activeFeature.title}</CardTitle>
      <Pressable onPress={() => setCount(c => c+1)}>
        <Text>{count}</Text>
      </Pressable>
    </Card>
  );
}
```

Tambahin `'counter'` ke `localTools` array + daftarkan di `mobileFeatures.js` tanpa `endpoint`.

### Flow: Screen-level Feature (kompleks)

- Buat screen baru di `src/screens/`
- Tambah rendering logic di `App.js` atau ExploreScreen
- Register deep link di `src/utils/deepLinks.js`
- Tambah entry di `mobileFeatures.js` dengan `type` khusus (gt `list`/`protected-list`)

---

## Shared API Surface (Mobile Consumption)

API yang sudah dikonsumsi mobile:

| API Path | Mobile File | Method |
|----------|------------|--------|
| `/api/v1/surah?size=114` | `client.js` | `getSurahs()` |
| `/api/v1/surah/:id` | `client.js` | `getSurahById()` |
| `/api/v1/ayah/:id` | `client.js` | `getAyahById()` |
| `/api/v1/tafsir/surah/:number` | `explore.js` | via `getFeatureItemPage()` |
| `/api/v1/sholat/today` | `client.js` | `getPrayerTimes()` |
| `/api/v1/doa` | `explore.js` | via `getFeatureItemPage()` |
| `/api/v1/dzikir` | `explore.js` | via `getFeatureItemPage()` |
| `/api/v1/asmaul-husna` | `explore.js` | via `getFeatureItemPage()` |
| `/api/v1/hadiths/keyset` | `client.js` | `getHadithKeyset()` |
| `/api/v1/bookmarks` | `personal.js` | `getBookmarks()` |
| `/api/v1/notes` | `personal.js` / `explore.js` | `getNotes()` / `getAllNotes()` |
| `/api/v1/notifications/settings` | `personal.js` | `getNotificationSettings()` |
| `/api/v1/notifications/push-token` | `personal.js` | `registerPushToken()` |
| `/api/v1/notifications/inbox` | `personal.js` | `getNotificationInbox()` |
| `/api/v1/achievements` | `personal.js` | `getAchievements()` |
| `/api/v1/achievements/mine` | `personal.js` | `getMyAchievements()` |
| `/api/v1/achievements/points` | `personal.js` | `getMyPoints()` |
| `/api/v1/streak` | `personal.js` | `getMyStreak()` |
| `/api/v1/feed` | `social.js` | `getFeedPosts()` |
| `/api/v1/comments` | `social.js` | `getCommentsByRef()` / `createComment()` |
| `/api/v1/dictionary` | `explore.js` | `searchDictionary()` |
| `/api/v1/global/search` | `client.js` | `globalSearch()` |
| `/api/v1/kiblat` | `client.js` | `getQibla()` |

**Yang belum tapi perlu di-port:**
| API Path | Purpose | Priority |
|----------|---------|----------|
| `/api/v1/forum/questions` | Forum Q&A list | High |
| `/api/v1/forum/questions/:id` | Forum detail | High |
| `/api/v1/forum/questions` (POST) | Ask question | High |
| `/api/v1/forum/questions/:id/answers` | Submit answer | High |
| `/api/v1/forum/questions/:id/vote` | Vote | High |
| `/api/v1/forum/questions/:id/accept` | Accept answer | High |
| `/api/v1/tokoh-tarikh` | Tokoh list | Medium |
| `/api/v1/munasabah/:ayahId` | Related ayahs | Medium |
| `/api/v1/hadiths/:id/ayahs` | Hadith-ayah | Medium |
| `/api/v1/ayahs/:id/hadiths` | Ayah-hadith | Medium |
| `/api/v1/zakat/kalkulasi` | Zakat save | Medium |
| `/api/v1/zakat/gold-price` | Gold price | Medium |
| `/api/v1/faraidh/simpan` | Faraidh save | Medium |

---

## Design Pattern Differences

| Aspect | Web (Next.js) | Mobile (Expo RN) |
|--------|--------------|-------------------|
| Routing | File-based `/app/**/page.js` | State-based `navigation.current.view` |
| Navigation | `<Link>`, `router.push()` | `onOpenTab()`, `navigation.open()` |
| Detail view | Separate page | Modal popup / bottom-sheet |
| Back gesture | Browser default | `SwipeBackView` + `setBack()`/`clearBack()` |
| Storage | `localStorage` | `AsyncStorage` + `SecureStore` + SQLite |
| Offline | Online-first | SQLite offline packs |
| Styling | Tailwind CSS | `StyleSheet.create()` |
| API client | `src/lib/api.js` | `src/api/client.js` |
| Auth token | `localStorage` | `SecureStore` native |
| Icon library | `react-icons/bs` | `lucide-react-native` |
| Maps | Leaflet + OpenStreetMap | ❌ (butuh `react-native-maps`) |
| Chart | recharts | ❌ (butuh `react-native-chart-kit` atau `victory-native`) |
| Audio | Browser `Audio` API | `expo-av` |
| Push notification | Web Push API + Service Worker | Expo Push Notifications + `expo-notifications` |

---

## Color/Label Convention

Web dan mobile pakai palet yang **tidak identik** tapi konsisten secara semantik:

| Semantic | Web (Tailwind) | Mobile (theme.js) |
|----------|---------------|-------------------|
| Primary | `emerald-600` | `colors.primary` |
| Background | `white` / `gray-50` | `colors.bg` |
| Surface | `white` | `colors.surface` |
| Text | `gray-900` | `colors.text` |
| Muted | `gray-500` | `colors.muted` |
| Faint | `gray-200` | `colors.faint` |
| Danger | `red-600` | `colors.danger` |
| On Primary | `white` | `colors.onPrimary` |

---

## File Mapping

| Layer | Web | Mobile |
|-------|-----|--------|
| API client | `src/lib/api.js` | `src/api/client.js` |
| Auth | `src/lib/auth.js` | `src/context/SessionContext.js` + `src/storage/session.js` |
| Quran | `src/app/quran/**` | `src/screens/QuranScreen.js` |
| Hadis | `src/app/hadis/**` | `src/screens/HadithScreen.js` |
| Prayer | `src/app/jadwal-sholat/**` | `src/screens/PrayerScreen.js` |
| Qibla | `src/app/kiblat/**` | `src/screens/QiblaScreen.js` |
| Explore | — | `src/screens/ExploreScreen.js` |
| Profile | — | `src/screens/ProfileScreen.js` |
| Feature catalog | — | `src/data/mobileFeatures.js` |
| Navigation | `src/lib/const.js` | `src/navigation/appNavigation.js` |
| Quran font | `src/lib/useQuranFont.js` | `src/constants/quranFonts.js` |
| i18n | `src/lib/i18n.js` | same `src/lib/i18n.js` (shared build) |
| Theme | `tailwind.config.js` | `src/theme.js` |

---

## Quick Reference: Adding New Feature to Mobile

1. **Cek endpoint API** sudah ada di `services/api/app/http/routes.go`
2. **Tambah API call** di `src/api/` (ikut pattern `requestJson`)
3. **Daftar feature** di `src/data/mobileFeatures.js`
4. **Pilih tipe render:**
   - `list` / `protected-list` → otomatis (pagination + detail popup)
   - `localTools` → tambah `case` di `renderFeatureContent()`
   - Screen → buat file baru di `src/screens/`
5. **Tambah i18n key** (shared di `src/lib/i18n.js`) kalo butuh
6. **Register deep link** di `src/utils/deepLinks.js` kalao perlu navigasi langsung
