// seed_tajweed fetches tajweed-colored text from alquran.cloud and writes
// decoded HTML (<tajweed class="…">…</tajweed>) into the ar_html column of
// the translations table for every ayah in the database.
//
// Usage:
//
//	go run ./cmd/seed_tajweed/main.go [--env .env]
//
// The script is idempotent — re-running it safely overwrites ar_html.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/agambondan/islamic-explorer/app/config"
	appdb "github.com/agambondan/islamic-explorer/app/db"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/spf13/viper"
)

// ── alquran.cloud shortcode → CSS class mapping ───────────────────────────────
// Source: alquran.cloud quran-tajweed edition encoding.
// CSS classes live in apps/web/src/app/globals.css.
var shortcodeMap = map[string]string{
	"p": "madda_permissible", // 2-6 harakas, waqf-conditional
	"m": "madda_necessary",   // 6 harakas, always
	"o": "madda_obligatory",  // 4-5 harakas
	"n": "madda_normal",      // 2 harakas, always
	"q": "qlq",               // qalqalah: ب ج د ط ق
	"s": "slnt",              // silent letter
	"h": "ham_wasl",          // hamzah wasl ٱ
	"g": "ghn",               // ghunna (mim/noon mushaddad)
	"a": "idgh_ghn",          // idgham with ghunna (noon/tanwin + ي ن م و)
	"u": "idgh_w_ghn",        // idgham without ghunna (noon/tanwin + ل ر)
	"f": "ikhf",              // ikhfa (noon sakinah + 15 letters)
	"i": "iqlb",              // iqlab (noon/tanwin + ب)
	"c": "ikhf_shfw",         // ikhfa shafawi (mim sakinah + ب)
	"w": "idghm_shfw",        // idgham shafawi (mim sakinah + م)
	"e": "idgh_mus",          // idgham mutamasilain
	// "l" = lam shamsiyah — no dedicated CSS class, emit plain text
}

// ── alquran.cloud response types ─────────────────────────────────────────────

type cloudAyah struct {
	NumberInSurah int    `json:"numberInSurah"`
	Text          string `json:"text"` // bracket-encoded tajweed format
}

type cloudResponse struct {
	Code int `json:"code"`
	Data struct {
		Ayahs []cloudAyah `json:"ayahs"`
	} `json:"data"`
}

// ─────────────────────────────────────────────────────────────────────────────

const (
	totalSurahs  = 114
	cloudURL     = "https://api.alquran.cloud/v1/surah/%d/quran-tajweed"
	requestDelay = 600 * time.Millisecond // be polite to the public API
)

func main() {
	envFile := flag.String("env", ".env", "path to env file")
	startFrom := flag.Int("from", 1, "start from surah number (resume after interruption)")
	flag.Parse()

	viper.SetConfigFile(*envFile)
	viper.SetConfigType("env")
	viper.AutomaticEnv()
	if err := viper.ReadInConfig(); err != nil {
		log.Printf("warn: could not read %s — using env vars", *envFile)
	}

	env := config.Environment{}
	env.Init()
	database := appdb.NewPostgresql(&env)

	client := &http.Client{Timeout: 30 * time.Second}

	log.Printf("Starting tajweed seed (surahs %d–%d)…", *startFrom, totalSurahs)

	totalUpdated := 0
	totalErrors := 0

	for surahNum := *startFrom; surahNum <= totalSurahs; surahNum++ {
		log.Printf("[%d/%d] fetching surah %d…", surahNum, totalSurahs, surahNum)

		cloudAyahs, err := fetchTajweed(client, surahNum)
		if err != nil {
			log.Printf("  ERROR fetching: %v — skipping", err)
			totalErrors++
			continue
		}

		// Build map: ayah-number-within-surah → decoded HTML
		htmlMap := make(map[int]string, len(cloudAyahs))
		for _, a := range cloudAyahs {
			htmlMap[a.NumberInSurah] = decodeBrackets(a.Text)
		}

		// Fetch our DB ayahs for this surah
		var ayahs []model.Ayah
		err = database.
			Joins("JOIN surah ON surah.id = ayah.surah_id").
			Where("surah.number = ? AND ayah.deleted_at IS NULL", surahNum).
			Order("ayah.number").
			Find(&ayahs).Error
		if err != nil {
			log.Printf("  ERROR querying DB: %v — skipping", err)
			totalErrors++
			continue
		}

		if len(ayahs) == 0 {
			log.Printf("  WARN: no ayahs in DB for surah %d", surahNum)
			continue
		}

		updatedInSurah := 0
		for _, ayah := range ayahs {
			if ayah.Number == nil || ayah.TranslationID == nil {
				continue
			}
			html, ok := htmlMap[*ayah.Number]
			if !ok {
				log.Printf("  WARN: surah %d ayah %d not in cloud response", surahNum, *ayah.Number)
				continue
			}
			res := database.Model(&model.Translation{}).
				Where("id = ?", *ayah.TranslationID).
				Update("ar_html", html)
			if res.Error != nil {
				log.Printf("  ERROR updating translation %d: %v", *ayah.TranslationID, res.Error)
				totalErrors++
			} else {
				updatedInSurah++
				totalUpdated++
			}
		}

		log.Printf("  ✓ surah %d: %d/%d ayahs updated", surahNum, updatedInSurah, len(ayahs))
		time.Sleep(requestDelay)
	}

	log.Printf("\nFinished. updated=%d errors=%d", totalUpdated, totalErrors)
}

// fetchTajweed fetches the tajweed-encoded ayahs for one surah from alquran.cloud.
func fetchTajweed(client *http.Client, surahNum int) ([]cloudAyah, error) {
	url := fmt.Sprintf(cloudURL, surahNum)
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("GET %s: %w", url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d from %s", resp.StatusCode, url)
	}

	var cr cloudResponse
	if err := json.NewDecoder(resp.Body).Decode(&cr); err != nil {
		return nil, fmt.Errorf("decode: %w", err)
	}
	if cr.Code != 200 || len(cr.Data.Ayahs) == 0 {
		return nil, fmt.Errorf("unexpected response (code=%d, ayahs=%d)", cr.Code, len(cr.Data.Ayahs))
	}
	return cr.Data.Ayahs, nil
}

// decodeBrackets converts alquran.cloud bracket-encoded tajweed text to HTML.
//
// Input format: plain text interspersed with [shortcode[:N][content] tags.
// Example: "بِسْمِ [h:1[ٱ]للَّهِ [n[ـٰ]نِ"
// Output: "بِسْمِ <tajweed class="ham_wasl">ٱ</tajweed>للَّهِ <tajweed class="madda_normal">ـٰ</tajweed>نِ"
func decodeBrackets(text string) string {
	runes := []rune(text)
	n := len(runes)
	var buf strings.Builder
	buf.Grow(len(text) * 2)

	i := 0
	for i < n {
		if runes[i] != '[' {
			buf.WriteRune(runes[i])
			i++
			continue
		}

		// Scan shortcode until we hit the inner '['
		j := i + 1
		for j < n && runes[j] != '[' {
			j++
		}
		if j >= n {
			// Malformed: no inner '[', emit as-is
			buf.WriteRune(runes[i])
			i++
			continue
		}

		// shortcode may be "h:1", "l", "n", "p", etc.
		shortcode := string(runes[i+1 : j])
		if idx := strings.IndexByte(shortcode, ':'); idx != -1 {
			shortcode = shortcode[:idx] // strip ":N" suffix
		}

		// Content is between inner '[' and next ']'
		j++ // skip inner '['
		contentStart := j
		for j < n && runes[j] != ']' {
			j++
		}
		content := string(runes[contentStart:j])

		cssClass, known := shortcodeMap[shortcode]
		if known {
			buf.WriteString(`<tajweed class="`)
			buf.WriteString(cssClass)
			buf.WriteString(`">`)
			buf.WriteString(content)
			buf.WriteString(`</tajweed>`)
		} else {
			// Unknown shortcode (e.g. "l" = lam shamsiyah, no CSS class)
			// emit content without a wrapper tag
			buf.WriteString(content)
		}

		if j < n {
			j++ // skip closing ']'
		}
		i = j
	}

	return buf.String()
}
