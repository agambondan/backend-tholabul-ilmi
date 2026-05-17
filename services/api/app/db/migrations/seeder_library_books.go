package migrations

import "github.com/agambondan/islamic-explorer/app/model"

func seedLibraryBooks() []model.LibraryBook {
	return []model.LibraryBook{
		{
			Title:       "Riyadhus Shalihin",
			Slug:        "riyadhus-shalihin",
			Author:      "Imam An-Nawawi",
			Description: "Kumpulan hadith tematik tentang adab, ibadah, akhlak, dan penyucian jiwa. Disediakan sebagai rujukan belajar; sumber eksternal dibuka di luar aplikasi.",
			Category:    "Hadis",
			Level:       "Menengah",
			Language:    "Arab dan terjemah",
			Format:      model.LibraryBookFormatLink,
			SourceURL:   "https://sunnah.com/riyadussalihin",
			License:     "External public resource; verify license before mirroring files.",
			Tags:        "hadis,adab,akhlak,nawawi",
			Status:      model.LibraryBookStatusPublished,
		},
		{
			Title:       "Arbain Nawawiyah",
			Slug:        "arbain-nawawiyah",
			Author:      "Imam An-Nawawi",
			Description: "Empat puluh hadith pokok yang sering menjadi pengantar memahami dasar agama, niat, amal, halal-haram, dan akhlak.",
			Category:    "Hadis",
			Level:       "Pemula",
			Language:    "Arab dan terjemah",
			Format:      model.LibraryBookFormatLink,
			SourceURL:   "https://sunnah.com/nawawi40",
			License:     "External public resource; verify license before mirroring files.",
			Tags:        "hadis,pemula,nawawi,arbain",
			Status:      model.LibraryBookStatusPublished,
		},
		{
			Title:       "Bulughul Maram",
			Slug:        "bulughul-maram",
			Author:      "Ibnu Hajar Al-Asqalani",
			Description: "Kumpulan hadith ahkam untuk pengantar fikih ibadah dan muamalah. Cocok sebagai jalur belajar setelah hadith dasar.",
			Category:    "Fikih",
			Level:       "Menengah",
			Language:    "Arab dan terjemah",
			Format:      model.LibraryBookFormatLink,
			SourceURL:   "https://sunnah.com/bulugh",
			License:     "External public resource; verify license before mirroring files.",
			Tags:        "fikih,hadis,ahkam,ibadah",
			Status:      model.LibraryBookStatusPublished,
		},
		{
			Title:       "Panduan Dasar Bahasa Arab",
			Slug:        "panduan-dasar-bahasa-arab",
			Author:      "Tim Thullaabul Ilmi",
			Description: "Ruang katalog untuk materi nahwu, sharaf, mufrodat, dan latihan membaca teks Arab. File PDF dapat ditambahkan saat sumber resmi sudah dipilih.",
			Category:    "Bahasa Arab",
			Level:       "Pemula",
			Language:    "Indonesia",
			Format:      model.LibraryBookFormatLink,
			License:     "Internal learning placeholder; attach verified resources before distribution.",
			Tags:        "bahasa-arab,nahwu,sharaf,mufrodat",
			Status:      model.LibraryBookStatusPublished,
		},
	}
}
