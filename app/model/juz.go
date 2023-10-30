package model

import (
	"github.com/agambondan/islamic-explorer/app/lib"

	// "github.com/jinzhu/gorm"
	"gorm.io/gorm"
)

var ayahCounts = map[int]int{}

type Juz struct {
	BaseID
	Number       *int       `json:"number,omitempty" gorm:"uniqueIndex;not null;"`
	TotalAyah    *int       `json:"total_ayah,omitempty"`
	StartSurahID *int       `json:"start_surah_id,omitempty"`
	EndSurahID   *int       `json:"end_surah_id,omitempty"`
	StartAyahID  *int       `json:"start_ayah_id,omitempty"`
	EndAyahID    *int       `json:"end_ayah_id,omitempty"`
	StartSurah   *Surah     `json:"start_surah,omitempty" gorm:"foreignKey:StartSurahID"`
	EndSurah     *Surah     `json:"end_surah,omitempty" gorm:"foreignKey:EndSurahID"`
	StartAyah    *Ayah      `json:"start_ayah,omitempty" gorm:"foreignKey:StartAyahID"`
	EndAyah      *Ayah      `json:"end_ayah,omitempty" gorm:"foreignKey:EndAyahID"`
	Ayahs        []*Ayah    `json:"ayahs,omitempty"`
	Media        []JuzAsset `json:"media,omitempty"`
}

type JuzAsset struct {
	BaseID
	JuzID        *int        `json:"juz_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Juz          *Juz        `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}

type SurahAyah struct {
	StartSurahNumber *int
	StartAyahNumber  *int
	EndSurahNumber   *int
	EndAyahNumber    *int
}

// CalculateTotalVersesInJuz menghitung total ayat dalam juz berdasarkan data SurahAyah.
func (sa *SurahAyah) CalculateTotalVersesInJuz(db *gorm.DB) *int {
	totalVerses := 0

	// Menghitung total ayat dalam juz berdasarkan data SurahAyah.
	for surah := *sa.StartSurahNumber; surah <= *sa.EndSurahNumber; surah++ {
		if surah == *sa.StartSurahNumber && surah == *sa.EndSurahNumber {
			// Hanya satu surah dalam juz.
			totalVerses += *sa.EndAyahNumber - *sa.StartAyahNumber + 1
		} else if surah == *sa.StartSurahNumber {
			// Surah pertama dalam juz.
			totalVerses += (totalAyahsInSurah(surah) - *sa.StartAyahNumber + 1)
		} else if surah == *sa.EndSurahNumber {
			// Surah terakhir dalam juz.
			totalVerses += *sa.EndAyahNumber
		} else {
			// Surah di tengah-tengah juz.
			totalVerses += totalAyahsInSurah(surah)
		}
	}

	return &totalVerses
}

// totalAyahsInSurah adalah fungsi yang mengembalikan total ayat dalam sebuah surah.
func totalAyahsInSurah(surah int) int {
	return ayahCounts[surah]
}

func (j *Juz) Seeder(db *gorm.DB) []*Juz {
	var surah []*Surah
	db.Find(&surah)
	for _, v := range surah {
		ayahCounts[*v.Number] = *v.NumberOfAyahs
	}
	var juz []*Juz
	for k, v := range JuzMapping {
		for i := *v.StartSurahNumber; i <= *v.EndSurahNumber; i++ {
			if *v.StartSurahNumber == *v.EndSurahNumber {
				db.Model(&Ayah{}).Where(`surah_id = ? AND number between ? AND ?`, i, v.StartAyahNumber, v.EndAyahNumber).Update("juz_id", k)
			} else {
				switch i {
				case *v.StartSurahNumber:
					db.Model(&Ayah{}).Where(`surah_id = ? AND number >= ?`, i, v.StartAyahNumber).Update("juz_id", k)
				case *v.EndSurahNumber:
					db.Model(&Ayah{}).Where(`surah_id = ? AND number <= ?`, i, v.EndAyahNumber).Update("juz_id", k)
				default:
					db.Model(&Ayah{}).Where(`surah_id = ?`, i).Update("juz_id", k)
				}
			}
		}
		startAyah := new(Ayah)
		endAyah := new(Ayah)
		db.First(&startAyah, `number = ? AND surah_id = ?`, v.StartAyahNumber, v.StartSurahNumber)
		db.First(&endAyah, `number = ? AND surah_id = ?`, v.EndAyahNumber, v.EndSurahNumber)
		mod := new(Juz)
		mod.BaseID.ID = lib.Intptr(k)
		mod.Number = lib.Intptr(k)
		mod.StartSurahID = v.StartSurahNumber
		mod.EndSurahID = v.EndSurahNumber
		mod.StartAyahID = startAyah.ID
		mod.EndAyahID = endAyah.ID
		mod.TotalAyah = v.CalculateTotalVersesInJuz(db)
		juz = append(juz, mod)
	}
	return juz
}

var JuzMapping = map[int]SurahAyah{
	1: {
		StartSurahNumber: lib.Intptr(1),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(2),
		EndAyahNumber:    lib.Intptr(141),
	},
	2: {
		StartSurahNumber: lib.Intptr(2),
		StartAyahNumber:  lib.Intptr(142),
		EndSurahNumber:   lib.Intptr(2),
		EndAyahNumber:    lib.Intptr(252),
	},
	3: {
		StartSurahNumber: lib.Intptr(2),
		StartAyahNumber:  lib.Intptr(253),
		EndSurahNumber:   lib.Intptr(3),
		EndAyahNumber:    lib.Intptr(92),
	},
	4: {
		StartSurahNumber: lib.Intptr(3),
		StartAyahNumber:  lib.Intptr(93),
		EndSurahNumber:   lib.Intptr(4),
		EndAyahNumber:    lib.Intptr(23),
	},
	5: {
		StartSurahNumber: lib.Intptr(4),
		StartAyahNumber:  lib.Intptr(24),
		EndSurahNumber:   lib.Intptr(4),
		EndAyahNumber:    lib.Intptr(147),
	},
	6: {
		StartSurahNumber: lib.Intptr(4),
		StartAyahNumber:  lib.Intptr(148),
		EndSurahNumber:   lib.Intptr(5),
		EndAyahNumber:    lib.Intptr(82),
	},
	7: {
		StartSurahNumber: lib.Intptr(5),
		StartAyahNumber:  lib.Intptr(83),
		EndSurahNumber:   lib.Intptr(6),
		EndAyahNumber:    lib.Intptr(110),
	},
	8: {
		StartSurahNumber: lib.Intptr(6),
		StartAyahNumber:  lib.Intptr(111),
		EndSurahNumber:   lib.Intptr(7),
		EndAyahNumber:    lib.Intptr(87),
	},
	9: {
		StartSurahNumber: lib.Intptr(7),
		StartAyahNumber:  lib.Intptr(88),
		EndSurahNumber:   lib.Intptr(8),
		EndAyahNumber:    lib.Intptr(40),
	},
	10: {
		StartSurahNumber: lib.Intptr(8),
		StartAyahNumber:  lib.Intptr(41),
		EndSurahNumber:   lib.Intptr(9),
		EndAyahNumber:    lib.Intptr(93),
	},
	11: {
		StartSurahNumber: lib.Intptr(9),
		StartAyahNumber:  lib.Intptr(94),
		EndSurahNumber:   lib.Intptr(11),
		EndAyahNumber:    lib.Intptr(5),
	},
	12: {
		StartSurahNumber: lib.Intptr(11),
		StartAyahNumber:  lib.Intptr(6),
		EndSurahNumber:   lib.Intptr(12),
		EndAyahNumber:    lib.Intptr(52),
	},
	13: {
		StartSurahNumber: lib.Intptr(12),
		StartAyahNumber:  lib.Intptr(53),
		EndSurahNumber:   lib.Intptr(15),
		EndAyahNumber:    lib.Intptr(1),
	},
	14: {
		StartSurahNumber: lib.Intptr(15),
		StartAyahNumber:  lib.Intptr(2),
		EndSurahNumber:   lib.Intptr(16),
		EndAyahNumber:    lib.Intptr(128),
	},
	15: {
		StartSurahNumber: lib.Intptr(17),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(18),
		EndAyahNumber:    lib.Intptr(74),
	},
	16: {
		StartSurahNumber: lib.Intptr(18),
		StartAyahNumber:  lib.Intptr(75),
		EndSurahNumber:   lib.Intptr(20),
		EndAyahNumber:    lib.Intptr(135),
	},
	17: {
		StartSurahNumber: lib.Intptr(21),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(22),
		EndAyahNumber:    lib.Intptr(78),
	},
	18: {
		StartSurahNumber: lib.Intptr(23),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(25),
		EndAyahNumber:    lib.Intptr(20),
	},
	19: {
		StartSurahNumber: lib.Intptr(25),
		StartAyahNumber:  lib.Intptr(21),
		EndSurahNumber:   lib.Intptr(27),
		EndAyahNumber:    lib.Intptr(59),
	},
	20: {
		StartSurahNumber: lib.Intptr(27),
		StartAyahNumber:  lib.Intptr(60),
		EndSurahNumber:   lib.Intptr(29),
		EndAyahNumber:    lib.Intptr(44),
	},
	21: {
		StartSurahNumber: lib.Intptr(29),
		StartAyahNumber:  lib.Intptr(45),
		EndSurahNumber:   lib.Intptr(33),
		EndAyahNumber:    lib.Intptr(30),
	},
	22: {
		StartSurahNumber: lib.Intptr(33),
		StartAyahNumber:  lib.Intptr(31),
		EndSurahNumber:   lib.Intptr(36),
		EndAyahNumber:    lib.Intptr(21),
	},
	23: {
		StartSurahNumber: lib.Intptr(36),
		StartAyahNumber:  lib.Intptr(22),
		EndSurahNumber:   lib.Intptr(39),
		EndAyahNumber:    lib.Intptr(31),
	},
	24: {
		StartSurahNumber: lib.Intptr(39),
		StartAyahNumber:  lib.Intptr(32),
		EndSurahNumber:   lib.Intptr(41),
		EndAyahNumber:    lib.Intptr(46),
	},
	25: {
		StartSurahNumber: lib.Intptr(41),
		StartAyahNumber:  lib.Intptr(47),
		EndSurahNumber:   lib.Intptr(45),
		EndAyahNumber:    lib.Intptr(37),
	},
	26: {
		StartSurahNumber: lib.Intptr(46),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(51),
		EndAyahNumber:    lib.Intptr(30),
	},
	27: {
		StartSurahNumber: lib.Intptr(51),
		StartAyahNumber:  lib.Intptr(31),
		EndSurahNumber:   lib.Intptr(57),
		EndAyahNumber:    lib.Intptr(29),
	},
	28: {
		StartSurahNumber: lib.Intptr(58),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(66),
		EndAyahNumber:    lib.Intptr(12),
	},
	29: {
		StartSurahNumber: lib.Intptr(67),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(77),
		EndAyahNumber:    lib.Intptr(50),
	},
	30: {
		StartSurahNumber: lib.Intptr(78),
		StartAyahNumber:  lib.Intptr(1),
		EndSurahNumber:   lib.Intptr(114),
		EndAyahNumber:    lib.Intptr(6),
	},
}

// // Constraint CHECK untuk memastikan startAyatID <= endAyatID.
// func (j *Juz) ConfigureCheckConstraint(db *gorm.DB) {
// 	db.Exec("ALTER TABLE juz ADD CONSTRAINT juz_surah_ayat_check CHECK (start_ayat_id <= end_ayat_id)")
// }
