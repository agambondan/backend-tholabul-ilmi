package migrations

import (
	"fmt"

	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

// PreMigrateAsbabunNuzul drops the legacy 1:1 `ayah_id` column on
// `asbabun_nuzul` so AutoMigrate can install the m2m relation cleanly.
//
// The pre-existing schema modeled one asbab per ayah via a unique
// `ayah_id` column; reality is many-to-many (e.g. peristiwa Al-Ifk turun
// untuk QS 24:11-21, dan satu ayat bisa punya banyak riwayat). We migrate
// to a junction table `asbabun_nuzul_ayahs` and drop the old column.
//
// Idempotent: skips if the column is already gone.
func PreMigrateAsbabunNuzul(db *gorm.DB) {
	m := db.Migrator()
	if !m.HasTable(&model.AsbabunNuzul{}) {
		return
	}
	if !m.HasColumn(&model.AsbabunNuzul{}, "ayah_id") {
		return
	}

	fmt.Println("[asbabun_nuzul] dropping legacy ayah_id column for m2m migration")
	if err := m.DropColumn(&model.AsbabunNuzul{}, "ayah_id"); err != nil {
		fmt.Printf("[asbabun_nuzul] drop column failed (non-fatal): %v\n", err)
	}
}
