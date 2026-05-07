package migrations

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// SeedIlmuRijal seeds Perawi, JarhTadil, Sanad, MataSanad, and Takhrij.
// Must be called after DataSeeds (books already have IDs).
func SeedIlmuRijal(db *gorm.DB) {
	seedPerawi(db)
	seedJarhTadil(db)
	seedSanadHadith(db)
}

// ─── Perawi ──────────────────────────────────────────────────────────────────

func seedPerawi(db *gorm.DB) {
	var count int64
	db.Model(&model.Perawi{}).Count(&count)
	if count > 0 {
		return
	}

	hijriTrue := true

	perawi := []model.Perawi{
		// ── Nabi ──────────────────────────────────────────────────────────────
		{
			NamaArab:    lib.Strptr("مُحَمَّدٌ رَسُولُ اللَّهِ ﷺ"),
			NamaLatin:   lib.Strptr("Muhammad Rasulullah ﷺ"),
			NamaLengkap: lib.Strptr("Muhammad bin Abdillah bin Abdul Muththalib bin Hasyim"),
			Kunyah:      lib.Strptr("Abul Qasim"),
			Nisbah:      lib.Strptr("al-Qurasyi al-Hasyimi"),
			TahunLahir:  lib.Intptr(-53),
			TahunWafat:  lib.Intptr(11),
			TahunHijri:  &hijriTrue,
			TempatLahir: lib.Strptr("Makkah Al-Mukarramah"),
			TempatWafat: lib.Strptr("Madinah Al-Munawwarah"),
			Tabaqah:     lib.Strptr("nabi"),
			Status:      lib.Strptr("nabi"),
			Biografis:   lib.Strptr("Rasulullah Muhammad ﷺ, Nabi dan Rasul terakhir, sumber seluruh hadith. Dilahirkan di Makkah, wafat di Madinah pada 11 H."),
		},
		// ── Sahabat ───────────────────────────────────────────────────────────
		{
			NamaArab:    lib.Strptr("أَبُو هُرَيْرَةَ"),
			NamaLatin:   lib.Strptr("Abu Hurairah"),
			NamaLengkap: lib.Strptr("Abdurrahman bin Shakhr al-Dawsi"),
			Kunyah:      lib.Strptr("Abu Hurairah"),
			Nisbah:      lib.Strptr("al-Dawsi al-Yamani"),
			TahunWafat:  lib.Intptr(57),
			TahunHijri:  &hijriTrue,
			TempatWafat: lib.Strptr("Madinah"),
			Tabaqah:     lib.Strptr(string(model.TabaqahSahabat)),
			Status:      lib.Strptr(string(model.StatusTsiqah)),
			Biografis:   lib.Strptr("Sahabat yang paling banyak meriwayatkan hadith (± 5.374 hadith). Masuk Islam tahun 7 H, selalu mendampingi Nabi ﷺ di akhir masa hidupnya."),
		},
		{
			NamaArab:    lib.Strptr("عَبْدُ اللَّهِ بْنُ عُمَرَ"),
			NamaLatin:   lib.Strptr("Abdullah bin Umar"),
			NamaLengkap: lib.Strptr("Abdullah bin Umar bin al-Khaththab al-Adawi al-Qurasyi"),
			Kunyah:      lib.Strptr("Abu Abdirrahman"),
			Nisbah:      lib.Strptr("al-Adawi al-Qurasyi"),
			TahunWafat:  lib.Intptr(73),
			TahunHijri:  &hijriTrue,
			TempatWafat: lib.Strptr("Makkah"),
			Tabaqah:     lib.Strptr(string(model.TabaqahSahabat)),
			Status:      lib.Strptr(string(model.StatusTsiqah)),
			Biografis:   lib.Strptr("Putra Umar bin Khaththab. Terkenal sangat ketat mengikuti sunnah Nabi ﷺ. Meriwayatkan sekitar 2.630 hadith."),
		},
		{
			NamaArab:    lib.Strptr("أَنَسُ بْنُ مَالِكٍ"),
			NamaLatin:   lib.Strptr("Anas bin Malik"),
			NamaLengkap: lib.Strptr("Anas bin Malik bin an-Nadhr al-Anshari al-Khazraji"),
			Kunyah:      lib.Strptr("Abu Hamzah"),
			Nisbah:      lib.Strptr("al-Anshari al-Khazraji"),
			TahunWafat:  lib.Intptr(93),
			TahunHijri:  &hijriTrue,
			TempatWafat: lib.Strptr("Bashrah"),
			Tabaqah:     lib.Strptr(string(model.TabaqahSahabat)),
			Status:      lib.Strptr(string(model.StatusTsiqah)),
			Biografis:   lib.Strptr("Pelayan Nabi ﷺ selama 10 tahun. Salah satu sahabat paling produktif dalam periwayatan hadith (± 2.286 hadith). Wafat di Bashrah."),
		},
		{
			NamaArab:    lib.Strptr("عَائِشَةُ أُمُّ الْمُؤْمِنِينَ"),
			NamaLatin:   lib.Strptr("Aisyah Ummul Mukminin"),
			NamaLengkap: lib.Strptr("Aisyah binti Abi Bakr ash-Shiddiq al-Qurasyi at-Taimiyah"),
			Kunyah:      lib.Strptr("Umm Abdillah"),
			Laqab:       lib.Strptr("Ummul Mukminin, ash-Shiddiqah"),
			Nisbah:      lib.Strptr("at-Taimiyah al-Qurasyi"),
			TahunWafat:  lib.Intptr(58),
			TahunHijri:  &hijriTrue,
			TempatWafat: lib.Strptr("Madinah"),
			Tabaqah:     lib.Strptr(string(model.TabaqahSahabat)),
			Status:      lib.Strptr(string(model.StatusTsiqah)),
			Biografis:   lib.Strptr("Istri Nabi ﷺ dan putri Abu Bakar ash-Shiddiq. Rujukan utama hadith seputar kehidupan rumah tangga dan ibadah khusus Nabi ﷺ. Meriwayatkan ± 2.210 hadith."),
		},
		// ── Tabi'in ───────────────────────────────────────────────────────────
		{
			NamaArab:    lib.Strptr("نَافِعٌ"),
			NamaLatin:   lib.Strptr("Nafi'"),
			NamaLengkap: lib.Strptr("Nafi' al-Adawi, mawla Ibni Umar"),
			Kunyah:      lib.Strptr("Abu Abdillah"),
			Nisbah:      lib.Strptr("al-Madani"),
			TahunWafat:  lib.Intptr(117),
			TahunHijri:  &hijriTrue,
			TempatWafat: lib.Strptr("Madinah"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabiin)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Hamba sahaya (mawla) milik Abdullah bin Umar. Imam Malik menyebut sanad 'Malik – Nafi' – Ibn Umar' sebagai sanad paling shahih (silsilah dzahabiyyah)."),
		},
		{
			NamaArab:    lib.Strptr("مُحَمَّدُ بْنُ مُسْلِمٍ الزُّهْرِيُّ"),
			NamaLatin:   lib.Strptr("Muhammad bin Muslim az-Zuhri (Ibnu Syihab)"),
			NamaLengkap: lib.Strptr("Muhammad bin Muslim bin Ubaidillah bin Abdillah bin Syihab al-Qurasyi az-Zuhri"),
			Kunyah:      lib.Strptr("Abu Bakr"),
			Laqab:       lib.Strptr("Ibnu Syihab"),
			Nisbah:      lib.Strptr("az-Zuhri al-Qurasyi"),
			TahunWafat:  lib.Intptr(124),
			TahunHijri:  &hijriTrue,
			TempatLahir: lib.Strptr("Madinah"),
			TempatWafat: lib.Strptr("Syam"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabiin)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Imam tabi'in terkemuka, penghimpun sunnah dan hadith pertama secara resmi atas perintah Khalifah Umar bin Abdul Aziz. Guru Imam Malik."),
		},
		// ── Tabi'ut Tabi'in / Imam ────────────────────────────────────────────
		{
			NamaArab:    lib.Strptr("مَالِكُ بْنُ أَنَسٍ"),
			NamaLatin:   lib.Strptr("Malik bin Anas"),
			NamaLengkap: lib.Strptr("Malik bin Anas bin Malik bin Abi Amir al-Asbahi"),
			Kunyah:      lib.Strptr("Abu Abdillah"),
			Laqab:       lib.Strptr("Imam Darul Hijrah"),
			Nisbah:      lib.Strptr("al-Asbahi al-Madani"),
			TahunLahir:  lib.Intptr(93),
			TahunWafat:  lib.Intptr(179),
			TahunHijri:  &hijriTrue,
			TempatLahir: lib.Strptr("Madinah"),
			TempatWafat: lib.Strptr("Madinah"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabiutTabiin)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Imam madzhab Maliki. Ulama hadith terkemuka Madinah. Karyanya Al-Muwaththa' adalah kitab hadith yang tersusun paling awal. Guru dari Imam Syafi'i."),
		},
		{
			NamaArab:    lib.Strptr("مُحَمَّدُ بْنُ إِسْمَاعِيلَ الْبُخَارِيُّ"),
			NamaLatin:   lib.Strptr("Muhammad bin Ismail al-Bukhari"),
			NamaLengkap: lib.Strptr("Muhammad bin Ismail bin Ibrahim bin al-Mughirah al-Ju'fi al-Bukhari"),
			Kunyah:      lib.Strptr("Abu Abdillah"),
			Laqab:       lib.Strptr("Amirul Mukminin fil Hadith"),
			Nisbah:      lib.Strptr("al-Bukhari al-Ju'fi"),
			TahunLahir:  lib.Intptr(194),
			TahunWafat:  lib.Intptr(256),
			TahunHijri:  &hijriTrue,
			TempatLahir: lib.Strptr("Bukhara (Uzbekistan)"),
			TempatWafat: lib.Strptr("Khartank, dekat Samarkand"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabaqahKelima)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Imam al-Bukhari, penyusun Shahih Bukhari — kitab paling shahih setelah Al-Quran. Menghafal 100.000 hadith shahih dan 200.000 hadith. Mulai belajar hadith sejak usia 11 tahun."),
		},
		{
			NamaArab:    lib.Strptr("مُسْلِمُ بْنُ الْحَجَّاجِ"),
			NamaLatin:   lib.Strptr("Muslim bin al-Hajjaj"),
			NamaLengkap: lib.Strptr("Muslim bin al-Hajjaj bin Muslim al-Qusyairi an-Naisaburi"),
			Kunyah:      lib.Strptr("Abu al-Husain"),
			Nisbah:      lib.Strptr("al-Qusyairi an-Naisaburi"),
			TahunLahir:  lib.Intptr(204),
			TahunWafat:  lib.Intptr(261),
			TahunHijri:  &hijriTrue,
			TempatLahir: lib.Strptr("Naisabur (Iran)"),
			TempatWafat: lib.Strptr("Naisabur (Iran)"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabaqahKelima)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Penyusun Shahih Muslim, kitab hadith paling shahih kedua. Murid Imam al-Bukhari. Menyaring 300.000 hadith untuk menghasilkan ± 7.500 hadith shahih."),
		},
		{
			NamaArab:    lib.Strptr("أَبُو دَاوُدَ السِّجِسْتَانِيُّ"),
			NamaLatin:   lib.Strptr("Abu Dawud as-Sijistani"),
			NamaLengkap: lib.Strptr("Sulaiman bin al-Asy'ats bin Ishaq al-Azdi as-Sijistani"),
			Kunyah:      lib.Strptr("Abu Dawud"),
			Nisbah:      lib.Strptr("al-Azdi as-Sijistani"),
			TahunLahir:  lib.Intptr(202),
			TahunWafat:  lib.Intptr(275),
			TahunHijri:  &hijriTrue,
			TempatLahir: lib.Strptr("Sijistan (Afghanistan/Iran)"),
			TempatWafat: lib.Strptr("Bashrah"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabaqahKelima)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Penyusun Sunan Abu Dawud. Murid Imam al-Bukhari dan Imam Ahmad. Menyaring 500.000 hadith untuk menghasilkan 4.800 hadith dalam kitabnya."),
		},
		{
			NamaArab:    lib.Strptr("مُحَمَّدُ بْنُ عِيسَى التِّرْمِذِيُّ"),
			NamaLatin:   lib.Strptr("Muhammad bin Isa at-Tirmidzi"),
			NamaLengkap: lib.Strptr("Muhammad bin Isa bin Saurah bin Musa ad-Dhahhak as-Sulami at-Tirmidzi"),
			Kunyah:      lib.Strptr("Abu Isa"),
			Nisbah:      lib.Strptr("at-Tirmidzi as-Sulami"),
			TahunLahir:  lib.Intptr(209),
			TahunWafat:  lib.Intptr(279),
			TahunHijri:  &hijriTrue,
			TempatLahir: lib.Strptr("Tirmidz (Uzbekistan)"),
			TempatWafat: lib.Strptr("Tirmidz"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabaqahKelima)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Penyusun Al-Jami' (Sunan Tirmidzi). Murid Imam al-Bukhari dan Imam Abu Dawud. Dikenal dengan inovasi menggolongkan derajat hadith di tiap bab."),
		},
		{
			NamaArab:    lib.Strptr("قُتَيْبَةُ بْنُ سَعِيدٍ"),
			NamaLatin:   lib.Strptr("Qutaibah bin Sa'id"),
			NamaLengkap: lib.Strptr("Qutaibah bin Sa'id bin Jamil al-Tsaqafi al-Baghawi"),
			Kunyah:      lib.Strptr("Abu Raja'"),
			Nisbah:      lib.Strptr("al-Tsaqafi al-Baghawi"),
			TahunWafat:  lib.Intptr(240),
			TahunHijri:  &hijriTrue,
			TempatWafat: lib.Strptr("Baghlan"),
			Tabaqah:     lib.Strptr(string(model.TabaqahTabaqahKelima)),
			Status:      lib.Strptr(string(model.StatusTsiqahTsiqah)),
			Biografis:   lib.Strptr("Perawi thiqah, guru Imam al-Bukhari, Imam Muslim, dan Abu Dawud. Dikenal sebagai penghubung penting antara generasi tabi'ut tabi'in dengan imam hadith."),
		},
	}

	db.Clauses(clause.OnConflict{DoNothing: true}).Create(&perawi)
}

// ─── Jarh wa Ta'dil ──────────────────────────────────────────────────────────

func seedJarhTadil(db *gorm.DB) {
	var count int64
	db.Model(&model.JarhTadil{}).Count(&count)
	if count > 0 {
		return
	}

	// Resolve perawi IDs by name
	getID := func(namaLatin string) *int {
		var p model.Perawi
		if err := db.Where("nama_latin = ?", namaLatin).First(&p).Error; err != nil {
			return nil
		}
		return p.ID
	}

	tadil := model.JarhTadilJenis(model.JenisTadil)
	tingkat1 := 1
	tingkat2 := 2
	tingkat3 := 3

	abuHurairahID := getID("Abu Hurairah")
	ibnUmarID := getID("Abdullah bin Umar")
	anasID := getID("Anas bin Malik")
	aisyahID := getID("Aisyah Ummul Mukminin")
	nafiID := getID("Nafi'")
	zuhriID := getID("Muhammad bin Muslim az-Zuhri (Ibnu Syihab)")
	malikID := getID("Malik bin Anas")
	bukhariID := getID("Muhammad bin Ismail al-Bukhari")
	muslimID := getID("Muslim bin al-Hajjaj")
	qutaibahID := getID("Qutaibah bin Sa'id")

	if abuHurairahID == nil || bukhariID == nil {
		return
	}

	penilaian := []model.JarhTadil{
		// Penilaian terhadap Abu Hurairah
		{
			PerawiID:   abuHurairahID,
			PenilaiID:  bukhariID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("tsiqah huffazh as-shahabah"),
			Sumber:     lib.Strptr("At-Tarikh Al-Kabir"),
			Catatan:    lib.Strptr("Imam Bukhari menetapkan Abu Hurairah sebagai perawi paling tsiqah di kalangan sahabat dalam hal hafalan"),
		},
		{
			PerawiID:   abuHurairahID,
			PenilaiID:  muslimID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("min kibaril huffazh was-siqat"),
			Sumber:     lib.Strptr("Rijal Shahih Muslim"),
			Catatan:    lib.Strptr("Imam Muslim memasukkan Abu Hurairah sebagai sahabat paling produktif dan tsiqah"),
		},
		// Penilaian terhadap Abdullah bin Umar
		{
			PerawiID:   ibnUmarID,
			PenilaiID:  bukhariID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("sahabatun thiqatun huffazh"),
			Sumber:     lib.Strptr("At-Tarikh Al-Kabir"),
			Catatan:    lib.Strptr("Abdullah bin Umar dikenal sangat ketat mengikuti sunnah hingga detail kecil"),
		},
		// Penilaian terhadap Anas bin Malik
		{
			PerawiID:   anasID,
			PenilaiID:  bukhariID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("khadimun Nabi ﷺ, tsiqah"),
			Sumber:     lib.Strptr("At-Tarikh Al-Kabir"),
			Catatan:    lib.Strptr("Pelayan Nabi ﷺ selama 10 tahun, hafalan kuat"),
		},
		// Penilaian terhadap Aisyah
		{
			PerawiID:   aisyahID,
			PenilaiID:  bukhariID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("Ummul Mukminin, hafizhatun faqihah"),
			Sumber:     lib.Strptr("At-Tarikh Al-Kabir"),
			Catatan:    lib.Strptr("Paling faqih di antara Ummahatul Mukminin, sering mengoreksi hadith sahabat lain"),
		},
		// Penilaian terhadap Nafi'
		{
			PerawiID:   nafiID,
			PenilaiID:  malikID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("Nafi'un thiqatun tsiqah, imamun fi al-hadith"),
			Sumber:     lib.Strptr("Al-Jarh wat Ta'dil oleh Ibn Abi Hatim"),
			Halaman:    lib.Strptr("VIII/449"),
			Catatan:    lib.Strptr("Imam Malik menyebut sanad Malik-Nafi-Ibn Umar sebagai silsilah dzahabiyyah (rantai emas)"),
		},
		// Penilaian terhadap Az-Zuhri
		{
			PerawiID:   zuhriID,
			PenilaiID:  malikID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("az-Zuhri awtsaqun nas wa ahfazunum fil hadith"),
			Sumber:     lib.Strptr("Tahdzib al-Kamal, Al-Mizzi"),
			Catatan:    lib.Strptr("Imam Malik menilai Az-Zuhri sebagai manusia paling tsiqah dan paling hafal hadith"),
		},
		// Penilaian terhadap Malik
		{
			PerawiID:   malikID,
			PenilaiID:  bukhariID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("asahhu al-asanid: Malik an Nafi' an Ibn Umar"),
			Sumber:     lib.Strptr("Shahih al-Bukhari, muqaddimah"),
			Catatan:    lib.Strptr("Imam Bukhari menyebut sanad Malik sebagai yang paling shahih"),
		},
		// Penilaian terhadap al-Bukhari
		{
			PerawiID:   bukhariID,
			PenilaiID:  muslimID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat1,
			TeksNilai:  lib.Strptr("laisa fi ad-dunya mitsluhu"),
			Sumber:     lib.Strptr("Siyar A'lam an-Nubala', adz-Dzahabi XII/434"),
			Catatan:    lib.Strptr("Imam Muslim sujud syukur kepada al-Bukhari sambil berkata: tidak ada di dunia ini orang yang menyamaimu dalam ilmu hadith"),
		},
		// Penilaian terhadap Qutaibah bin Sa'id
		{
			PerawiID:   qutaibahID,
			PenilaiID:  bukhariID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat2,
			TeksNilai:  lib.Strptr("tsiqah tsabtun"),
			Sumber:     lib.Strptr("At-Tarikh Al-Kabir"),
			Catatan:    lib.Strptr("Imam Bukhari menilai Qutaibah sebagai guru tsiqah dan tsabt"),
		},
		{
			PerawiID:   qutaibahID,
			PenilaiID:  muslimID,
			JenisNilai: &tadil,
			Tingkat:    &tingkat3,
			TeksNilai:  lib.Strptr("tsiqah"),
			Sumber:     lib.Strptr("Rijal Shahih Muslim"),
			Catatan:    lib.Strptr("Imam Muslim meriwayatkan darinya banyak hadith dalam Shahih-nya"),
		},
	}

	db.Clauses(clause.OnConflict{DoNothing: true}).Create(&penilaian)
}

// ─── Sanad & MataSanad ───────────────────────────────────────────────────────
// Menyeed sanad untuk hadith terkenal "Innamal a'malu binniyyat" (HR. Bukhari No. 1)
// jika hadith dengan nomor tersebut ada di database.

func seedSanadHadith(db *gorm.DB) {
	var count int64
	db.Model(&model.Sanad{}).Count(&count)
	if count > 0 {
		return
	}

	// Cari hadith nomor 1 dari kitab Bukhari
	var hadith model.Hadith
	if err := db.Joins("Book").
		Where(`"Book".slug = ? AND hadith.number = ?`, "bukhari", 1).
		First(&hadith).Error; err != nil {
		// Jika tidak ada, ambil hadith pertama yang ada
		if err2 := db.First(&hadith).Error; err2 != nil {
			return
		}
	}

	// Resolve perawi IDs
	getID := func(namaLatin string) *int {
		var p model.Perawi
		if err := db.Where("nama_latin = ?", namaLatin).First(&p).Error; err != nil {
			return nil
		}
		return p.ID
	}

	bukhariID := getID("Muhammad bin Ismail al-Bukhari")
	qutaibahID := getID("Qutaibah bin Sa'id")
	malikID := getID("Malik bin Anas")
	nafiID := getID("Nafi'")
	ibnUmarID := getID("Abdullah bin Umar")

	if bukhariID == nil || ibnUmarID == nil {
		return
	}

	musnad := model.SanadJenis(model.SanadMusnad)
	muttashil := model.SanadStatus(model.SanadMuttashil)
	jalur1 := 1

	sanad := model.Sanad{
		HadithID:    hadith.ID,
		NomorJalur:  &jalur1,
		Jenis:       &musnad,
		StatusSanad: &muttashil,
		Catatan:     lib.Strptr("Jalur utama: Bukhari ← Qutaibah ← Malik ← Nafi' ← Ibn Umar"),
	}

	if err := db.Create(&sanad).Error; err != nil {
		return
	}

	// Mata sanad (urutan dari perawi penerima → Nabi ﷺ)
	haddatsana := model.MetodePeriwayatan(model.MetodeHaddatsana)
	ananah := model.MetodePeriwayatan(model.MetodeAnanah)

	urutan := []struct {
		perawiID *int
		urutan   int
		metode   model.MetodePeriwayatan
	}{
		{bukhariID, 1, haddatsana},
		{qutaibahID, 2, haddatsana},
		{malikID, 3, ananah},
		{nafiID, 4, ananah},
		{ibnUmarID, 5, ananah},
	}

	for _, u := range urutan {
		if u.perawiID == nil {
			continue
		}
		m := model.MataSanad{
			SanadID:  sanad.ID,
			PerawiID: u.perawiID,
			Urutan:   lib.Intptr(u.urutan),
			Metode:   (*model.MetodePeriwayatan)(lib.Strptr(string(u.metode))),
		}
		db.Create(&m)
	}

	// Takhrij: hadith yang sama ada di Shahih Muslim
	seedTakhrijHadith(db, hadith.ID)
}

// ─── Takhrij ─────────────────────────────────────────────────────────────────

func seedTakhrijHadith(db *gorm.DB, hadithID *int) {
	if hadithID == nil {
		return
	}

	var count int64
	db.Model(&model.Takhrij{}).Where("hadith_id = ?", hadithID).Count(&count)
	if count > 0 {
		return
	}

	// Cari book_id untuk masing-masing kitab
	getBookID := func(slug string) *int {
		var book model.Book
		if err := db.Where("slug = ?", slug).First(&book).Error; err != nil {
			return nil
		}
		return book.ID
	}

	muslimID := getBookID("muslim")
	abudaudID := getBookID("abudaud")
	tirmidziID := getBookID("tirmidzi")
	nasaiID := getBookID("nasai")
	ibnumajahID := getBookID("ibnumajah")

	takhrijData := []struct {
		bookID          *int
		nomorHadisKitab string
		jilid           string
		halaman         string
		catatan         string
	}{
		{muslimID, "1907", "6", "48", "HR. Muslim, Kitab Al-Imarah"},
		{abudaudID, "2201", "3", "69", "HR. Abu Dawud, Kitab Ath-Thalaq"},
		{tirmidziID, "1647", "4", "179", "HR. Tirmidzi, Kitab Fadha'il Al-Jihad; status: hasan shahih"},
		{nasaiID, "75", "1", "59", "HR. An-Nasa'i, Kitab Ath-Thaharah"},
		{ibnumajahID, "4227", "5", "3422", "HR. Ibnu Majah, Kitab Az-Zuhd"},
	}

	for _, t := range takhrijData {
		if t.bookID == nil {
			continue
		}
		takhrij := model.Takhrij{
			HadithID:        hadithID,
			BookID:          t.bookID,
			NomorHadisKitab: lib.Strptr(t.nomorHadisKitab),
			Jilid:           lib.Strptr(t.jilid),
			Halaman:         lib.Strptr(t.halaman),
			Catatan:         lib.Strptr(t.catatan),
		}
		db.Clauses(clause.OnConflict{DoNothing: true}).Create(&takhrij)
	}
}
