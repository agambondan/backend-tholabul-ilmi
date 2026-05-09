package migrations

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// mufrodatAyahSeed groups per-kata data for one ayah identified by (surahNumber, ayahNumber).
// Sumber: Al-Qur'an dan Terjemahannya (Kemenag), morfologi Quran Corpus (corpus.quran.com),
// dan terjemahan per kata dari Mushaf Tafsir Per Kata (Pustaka Al-Mubin).
type mufrodatAyahSeed struct {
	surahNumber int
	ayahNumber  int
	items       []model.Mufrodat
}

func mufrodatSeedData() []mufrodatAyahSeed {
	return []mufrodatAyahSeed{
		// ── Al-Fatihah (1) ─────────────────────────────────────────────────
		{
			surahNumber: 1, ayahNumber: 1,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "بِسْمِ", Transliteration: "bismi", Indonesian: "dengan nama", RootWord: "smw", PartOfSpeech: "isim"},
				{WordIndex: 2, Arabic: "اللَّهِ", Transliteration: "allāhi", Indonesian: "Allah", RootWord: "alh", PartOfSpeech: "isim"},
				{WordIndex: 3, Arabic: "الرَّحْمَٰنِ", Transliteration: "ar-raḥmāni", Indonesian: "Yang Maha Pengasih", RootWord: "rḥm", PartOfSpeech: "sifat"},
				{WordIndex: 4, Arabic: "الرَّحِيمِ", Transliteration: "ar-raḥīmi", Indonesian: "Yang Maha Penyayang", RootWord: "rḥm", PartOfSpeech: "sifat"},
			},
		},
		{
			surahNumber: 1, ayahNumber: 2,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "الْحَمْدُ", Transliteration: "al-ḥamdu", Indonesian: "segala puji", RootWord: "ḥmd", PartOfSpeech: "isim"},
				{WordIndex: 2, Arabic: "لِلَّهِ", Transliteration: "lillāhi", Indonesian: "bagi Allah", RootWord: "alh", PartOfSpeech: "jar-majrur"},
				{WordIndex: 3, Arabic: "رَبِّ", Transliteration: "rabbi", Indonesian: "Rabb", RootWord: "rbb", PartOfSpeech: "isim"},
				{WordIndex: 4, Arabic: "الْعَالَمِينَ", Transliteration: "al-‘ālamīna", Indonesian: "seluruh alam", RootWord: "alm", PartOfSpeech: "isim"},
			},
		},
		{
			surahNumber: 1, ayahNumber: 3,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "الرَّحْمَٰنِ", Transliteration: "ar-raḥmāni", Indonesian: "Yang Maha Pengasih", RootWord: "rḥm", PartOfSpeech: "sifat"},
				{WordIndex: 2, Arabic: "الرَّحِيمِ", Transliteration: "ar-raḥīmi", Indonesian: "Yang Maha Penyayang", RootWord: "rḥm", PartOfSpeech: "sifat"},
			},
		},
		{
			surahNumber: 1, ayahNumber: 4,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "مَالِكِ", Transliteration: "māliki", Indonesian: "Yang menguasai", RootWord: "mlk", PartOfSpeech: "isim"},
				{WordIndex: 2, Arabic: "يَوْمِ", Transliteration: "yaumi", Indonesian: "hari", RootWord: "ywm", PartOfSpeech: "isim"},
				{WordIndex: 3, Arabic: "الدِّينِ", Transliteration: "ad-dīni", Indonesian: "pembalasan", RootWord: "dyn", PartOfSpeech: "isim"},
			},
		},
		{
			surahNumber: 1, ayahNumber: 5,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "إِيَّاكَ", Transliteration: "iyyāka", Indonesian: "hanya kepada-Mu", RootWord: "ayy", PartOfSpeech: "dhomir"},
				{WordIndex: 2, Arabic: "نَعْبُدُ", Transliteration: "na‘budu", Indonesian: "kami menyembah", RootWord: "‘bd", PartOfSpeech: "fi'il"},
				{WordIndex: 3, Arabic: "وَإِيَّاكَ", Transliteration: "wa-iyyāka", Indonesian: "dan hanya kepada-Mu", RootWord: "ayy", PartOfSpeech: "dhomir"},
				{WordIndex: 4, Arabic: "نَسْتَعِينُ", Transliteration: "nasta‘īnu", Indonesian: "kami memohon pertolongan", RootWord: "‘wn", PartOfSpeech: "fi'il"},
			},
		},
		{
			surahNumber: 1, ayahNumber: 6,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "اهْدِنَا", Transliteration: "ihdinā", Indonesian: "tunjukilah kami", RootWord: "hdy", PartOfSpeech: "fi'il"},
				{WordIndex: 2, Arabic: "الصِّرَاطَ", Transliteration: "aṣ-ṣirāṭa", Indonesian: "jalan", RootWord: "ṣrṭ", PartOfSpeech: "isim"},
				{WordIndex: 3, Arabic: "الْمُسْتَقِيمَ", Transliteration: "al-mustaqīma", Indonesian: "yang lurus", RootWord: "qwm", PartOfSpeech: "sifat"},
			},
		},
		{
			surahNumber: 1, ayahNumber: 7,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "صِرَاطَ", Transliteration: "ṣirāṭa", Indonesian: "jalan", RootWord: "ṣrṭ", PartOfSpeech: "isim"},
				{WordIndex: 2, Arabic: "الَّذِينَ", Transliteration: "alladhīna", Indonesian: "orang-orang yang", RootWord: "lly", PartOfSpeech: "isim-mausul"},
				{WordIndex: 3, Arabic: "أَنْعَمْتَ", Transliteration: "an‘amta", Indonesian: "telah Engkau beri nikmat", RootWord: "n‘m", PartOfSpeech: "fi'il"},
				{WordIndex: 4, Arabic: "عَلَيْهِمْ", Transliteration: "‘alaihim", Indonesian: "atas mereka", RootWord: "‘ly", PartOfSpeech: "jar-majrur"},
				{WordIndex: 5, Arabic: "غَيْرِ", Transliteration: "ghairi", Indonesian: "bukan", RootWord: "ghyr", PartOfSpeech: "isim"},
				{WordIndex: 6, Arabic: "الْمَغْضُوبِ", Transliteration: "al-maghḍūbi", Indonesian: "yang dimurkai", RootWord: "ghḍb", PartOfSpeech: "isim"},
				{WordIndex: 7, Arabic: "عَلَيْهِمْ", Transliteration: "‘alaihim", Indonesian: "atas mereka", RootWord: "‘ly", PartOfSpeech: "jar-majrur"},
				{WordIndex: 8, Arabic: "وَلَا", Transliteration: "wa-lā", Indonesian: "dan bukan", RootWord: "lā", PartOfSpeech: "huruf"},
				{WordIndex: 9, Arabic: "الضَّالِّينَ", Transliteration: "aḍ-ḍāllīna", Indonesian: "orang-orang yang sesat", RootWord: "ḍll", PartOfSpeech: "isim"},
			},
		},
		// ── Al-Baqarah (2) ────────────────────────────────────────────────
		{
			surahNumber: 2, ayahNumber: 1,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "الم", Transliteration: "alif lām mīm", Indonesian: "Alif Lām Mīm", RootWord: "", PartOfSpeech: "huruf-muqattha'ah"},
			},
		},
		{
			surahNumber: 2, ayahNumber: 2,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "ذَٰلِكَ", Transliteration: "dhālika", Indonesian: "itulah", RootWord: "dhā", PartOfSpeech: "isim-isyarah"},
				{WordIndex: 2, Arabic: "الْكِتَابُ", Transliteration: "al-kitābu", Indonesian: "Kitab", RootWord: "ktb", PartOfSpeech: "isim"},
				{WordIndex: 3, Arabic: "لَا", Transliteration: "lā", Indonesian: "tidak ada", RootWord: "lā", PartOfSpeech: "huruf"},
				{WordIndex: 4, Arabic: "رَيْبَ", Transliteration: "raiba", Indonesian: "keraguan", RootWord: "ryb", PartOfSpeech: "isim"},
				{WordIndex: 5, Arabic: "فِيهِ", Transliteration: "fīhi", Indonesian: "padanya", RootWord: "fy", PartOfSpeech: "jar-majrur"},
				{WordIndex: 6, Arabic: "هُدًى", Transliteration: "hudan", Indonesian: "petunjuk", RootWord: "hdy", PartOfSpeech: "isim"},
				{WordIndex: 7, Arabic: "لِلْمُتَّقِينَ", Transliteration: "lil-muttaqīna", Indonesian: "bagi orang-orang bertakwa", RootWord: "wqy", PartOfSpeech: "jar-majrur"},
			},
		},
		{
			surahNumber: 2, ayahNumber: 3,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "الَّذِينَ", Transliteration: "alladhīna", Indonesian: "orang-orang yang", RootWord: "lly", PartOfSpeech: "isim-mausul"},
				{WordIndex: 2, Arabic: "يُؤْمِنُونَ", Transliteration: "yu’minūna", Indonesian: "mereka beriman", RootWord: "amn", PartOfSpeech: "fi'il"},
				{WordIndex: 3, Arabic: "بِالْغَيْبِ", Transliteration: "bil-ghaibi", Indonesian: "kepada yang gaib", RootWord: "ghyb", PartOfSpeech: "jar-majrur"},
				{WordIndex: 4, Arabic: "وَيُقِيمُونَ", Transliteration: "wa-yuqīmūna", Indonesian: "dan mereka mendirikan", RootWord: "qwm", PartOfSpeech: "fi'il"},
				{WordIndex: 5, Arabic: "الصَّلَاةَ", Transliteration: "aṣ-ṣalāta", Indonesian: "shalat", RootWord: "ṣlw", PartOfSpeech: "isim"},
				{WordIndex: 6, Arabic: "وَمِمَّا", Transliteration: "wa-mimmā", Indonesian: "dan dari sebagian", RootWord: "min", PartOfSpeech: "huruf"},
				{WordIndex: 7, Arabic: "رَزَقْنَاهُمْ", Transliteration: "razaqnāhum", Indonesian: "Kami rizkikan kepada mereka", RootWord: "rzq", PartOfSpeech: "fi'il"},
				{WordIndex: 8, Arabic: "يُنْفِقُونَ", Transliteration: "yunfiqūna", Indonesian: "mereka menafkahkan", RootWord: "nfq", PartOfSpeech: "fi'il"},
			},
		},
		{
			surahNumber: 2, ayahNumber: 4,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "وَالَّذِينَ", Transliteration: "wa-alladhīna", Indonesian: "dan orang-orang yang", RootWord: "lly", PartOfSpeech: "isim-mausul"},
				{WordIndex: 2, Arabic: "يُؤْمِنُونَ", Transliteration: "yu’minūna", Indonesian: "mereka beriman", RootWord: "amn", PartOfSpeech: "fi'il"},
				{WordIndex: 3, Arabic: "بِمَا", Transliteration: "bimā", Indonesian: "kepada apa yang", RootWord: "mā", PartOfSpeech: "jar-majrur"},
				{WordIndex: 4, Arabic: "أُنْزِلَ", Transliteration: "unzila", Indonesian: "diturunkan", RootWord: "nzl", PartOfSpeech: "fi'il"},
				{WordIndex: 5, Arabic: "إِلَيْكَ", Transliteration: "ilaika", Indonesian: "kepadamu", RootWord: "ila", PartOfSpeech: "jar-majrur"},
				{WordIndex: 6, Arabic: "وَمَا", Transliteration: "wa-mā", Indonesian: "dan apa yang", RootWord: "mā", PartOfSpeech: "isim-mausul"},
				{WordIndex: 7, Arabic: "أُنْزِلَ", Transliteration: "unzila", Indonesian: "diturunkan", RootWord: "nzl", PartOfSpeech: "fi'il"},
				{WordIndex: 8, Arabic: "مِنْ", Transliteration: "min", Indonesian: "dari", RootWord: "min", PartOfSpeech: "huruf-jar"},
				{WordIndex: 9, Arabic: "قَبْلِكَ", Transliteration: "qablika", Indonesian: "sebelummu", RootWord: "qbl", PartOfSpeech: "jar-majrur"},
				{WordIndex: 10, Arabic: "وَبِالْآخِرَةِ", Transliteration: "wa-bil-ākhirati", Indonesian: "dan kepada akhirat", RootWord: "akhr", PartOfSpeech: "jar-majrur"},
				{WordIndex: 11, Arabic: "هُمْ", Transliteration: "hum", Indonesian: "mereka", RootWord: "huw", PartOfSpeech: "dhomir"},
				{WordIndex: 12, Arabic: "يُوقِنُونَ", Transliteration: "yūqinūna", Indonesian: "mereka yakin", RootWord: "yqn", PartOfSpeech: "fi'il"},
			},
		},
		{
			surahNumber: 2, ayahNumber: 5,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "أُولَٰئِكَ", Transliteration: "ulā’ika", Indonesian: "mereka itulah", RootWord: "ulā", PartOfSpeech: "isim-isyarah"},
				{WordIndex: 2, Arabic: "عَلَىٰ", Transliteration: "‘alā", Indonesian: "atas", RootWord: "‘ly", PartOfSpeech: "huruf-jar"},
				{WordIndex: 3, Arabic: "هُدًى", Transliteration: "hudan", Indonesian: "petunjuk", RootWord: "hdy", PartOfSpeech: "isim"},
				{WordIndex: 4, Arabic: "مِنْ", Transliteration: "min", Indonesian: "dari", RootWord: "min", PartOfSpeech: "huruf-jar"},
				{WordIndex: 5, Arabic: "رَبِّهِمْ", Transliteration: "rabbihim", Indonesian: "Tuhan mereka", RootWord: "rbb", PartOfSpeech: "jar-majrur"},
				{WordIndex: 6, Arabic: "وَأُولَٰئِكَ", Transliteration: "wa-ulā’ika", Indonesian: "dan mereka itulah", RootWord: "ulā", PartOfSpeech: "isim-isyarah"},
				{WordIndex: 7, Arabic: "هُمُ", Transliteration: "humu", Indonesian: "mereka", RootWord: "huw", PartOfSpeech: "dhomir"},
				{WordIndex: 8, Arabic: "الْمُفْلِحُونَ", Transliteration: "al-mufliḥūna", Indonesian: "orang-orang yang beruntung", RootWord: "flḥ", PartOfSpeech: "isim"},
			},
		},
		// ── An-Nas (114) ──────────────────────────────────────────────────
		{
			surahNumber: 114, ayahNumber: 1,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "قُلْ", Transliteration: "qul", Indonesian: "katakanlah", RootWord: "qwl", PartOfSpeech: "fi'il"},
				{WordIndex: 2, Arabic: "أَعُوذُ", Transliteration: "a‘ūdhu", Indonesian: "aku berlindung", RootWord: "‘wdh", PartOfSpeech: "fi'il"},
				{WordIndex: 3, Arabic: "بِرَبِّ", Transliteration: "bi-rabbi", Indonesian: "kepada Tuhan", RootWord: "rbb", PartOfSpeech: "jar-majrur"},
				{WordIndex: 4, Arabic: "النَّاسِ", Transliteration: "an-nāsi", Indonesian: "manusia", RootWord: "nws", PartOfSpeech: "isim"},
			},
		},
		{
			surahNumber: 114, ayahNumber: 2,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "مَلِكِ", Transliteration: "maliki", Indonesian: "Raja", RootWord: "mlk", PartOfSpeech: "isim"},
				{WordIndex: 2, Arabic: "النَّاسِ", Transliteration: "an-nāsi", Indonesian: "manusia", RootWord: "nws", PartOfSpeech: "isim"},
			},
		},
		{
			surahNumber: 114, ayahNumber: 3,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "إِلَٰهِ", Transliteration: "ilāhi", Indonesian: "Sesembahan", RootWord: "alh", PartOfSpeech: "isim"},
				{WordIndex: 2, Arabic: "النَّاسِ", Transliteration: "an-nāsi", Indonesian: "manusia", RootWord: "nws", PartOfSpeech: "isim"},
			},
		},
		{
			surahNumber: 114, ayahNumber: 4,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "مِنْ", Transliteration: "min", Indonesian: "dari", RootWord: "min", PartOfSpeech: "huruf-jar"},
				{WordIndex: 2, Arabic: "شَرِّ", Transliteration: "sharri", Indonesian: "kejahatan", RootWord: "shrr", PartOfSpeech: "isim"},
				{WordIndex: 3, Arabic: "الْوَسْوَاسِ", Transliteration: "al-waswāsi", Indonesian: "(setan) pembisik", RootWord: "wsws", PartOfSpeech: "isim"},
				{WordIndex: 4, Arabic: "الْخَنَّاسِ", Transliteration: "al-khannāsi", Indonesian: "yang bersembunyi", RootWord: "khns", PartOfSpeech: "isim"},
			},
		},
		{
			surahNumber: 114, ayahNumber: 5,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "الَّذِي", Transliteration: "alladhī", Indonesian: "yang", RootWord: "lly", PartOfSpeech: "isim-mausul"},
				{WordIndex: 2, Arabic: "يُوَسْوِسُ", Transliteration: "yuwaswisu", Indonesian: "membisikkan", RootWord: "wsws", PartOfSpeech: "fi'il"},
				{WordIndex: 3, Arabic: "فِي", Transliteration: "fī", Indonesian: "di dalam", RootWord: "fy", PartOfSpeech: "huruf-jar"},
				{WordIndex: 4, Arabic: "صُدُورِ", Transliteration: "ṣudūri", Indonesian: "dada", RootWord: "ṣdr", PartOfSpeech: "isim"},
				{WordIndex: 5, Arabic: "النَّاسِ", Transliteration: "an-nāsi", Indonesian: "manusia", RootWord: "nws", PartOfSpeech: "isim"},
			},
		},
		{
			surahNumber: 114, ayahNumber: 6,
			items: []model.Mufrodat{
				{WordIndex: 1, Arabic: "مِنَ", Transliteration: "mina", Indonesian: "dari (golongan)", RootWord: "min", PartOfSpeech: "huruf-jar"},
				{WordIndex: 2, Arabic: "الْجِنَّةِ", Transliteration: "al-jinnati", Indonesian: "jin", RootWord: "jnn", PartOfSpeech: "isim"},
				{WordIndex: 3, Arabic: "وَالنَّاسِ", Transliteration: "wa-n-nāsi", Indonesian: "dan manusia", RootWord: "nws", PartOfSpeech: "isim"},
			},
		},
	}
}

// seedMufrodatData seeds per-kata (mufrodat) data for selected ayahs.
// Lookup ayah by composite (surah_number, ayah_number) so it is not ambiguous.
// Idempotent via ON CONFLICT (ayah_id, word_index).
func seedMufrodatData(db *gorm.DB) {
	for _, group := range mufrodatSeedData() {
		var ayah model.Ayah
		err := db.
			Joins("JOIN surah ON surah.id = ayah.surah_id").
			Where("surah.number = ? AND ayah.number = ?", group.surahNumber, group.ayahNumber).
			First(&ayah).Error
		if err != nil || ayah.ID == nil {
			continue
		}
		for i := range group.items {
			group.items[i].AyahID = lib.Intptr(*ayah.ID)
			db.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "ayah_id"}, {Name: "word_index"}},
				DoUpdates: clause.AssignmentColumns([]string{"arabic", "transliteration", "indonesian", "root_word", "part_of_speech"}),
			}).Create(&group.items[i])
		}
	}
}
