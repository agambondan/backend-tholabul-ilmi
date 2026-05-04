#!/usr/bin/env python3
"""
Scraper for hadits.in (Ensiklopedi Hadits - Kitab 9 Imam by Saltanera Teknologi)
Outputs JSON files per book ke folder data/, sesuai schema tholabul-ilmi.

Usage:
    pip install requests
    python3 scripts/scrape_hadits.py
    python3 scripts/scrape_hadits.py --imam bukhari       # hanya satu kitab
    python3 scripts/scrape_hadits.py --workers 20         # concurrent workers
    python3 scripts/scrape_hadits.py --resume             # skip yg sudah ada
"""

import re
import json
import time
import argparse
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://hadits.in"

BOOKS = [
    {"imam": "bukhari",   "slug": "bukhari",   "name": "Shahih Bukhari",   "jumlah": 7008},
    {"imam": "muslim",    "slug": "muslim",    "name": "Shahih Muslim",     "jumlah": 5362},
    {"imam": "abudaud",   "slug": "abudaud",   "name": "Sunan Abu Daud",    "jumlah": 4590},
    {"imam": "tirmidzi",  "slug": "tirmidzi",  "name": "Sunan Tirmidzi",    "jumlah": 3891},
    {"imam": "nasai",     "slug": "nasai",     "name": "Sunan Nasa'i",      "jumlah": 5662},
    {"imam": "ibnumajah", "slug": "ibnumajah", "name": "Sunan Ibnu Majah",  "jumlah": 4332},
    {"imam": "malik",     "slug": "malik",     "name": "Muwatha' Malik",    "jumlah": 1594},
    {"imam": "ahmad",     "slug": "ahmad",     "name": "Musnad Ahmad",      "jumlah": 26363},
    {"imam": "darimi",    "slug": "darimi",    "name": "Sunan Darimi",      "jumlah": 3367},
]

# Regex patterns
RE_KITAB = re.compile(r"kitab\s*:\s*'([^']*)'")
RE_BAB   = re.compile(r"bab\s*:\s*'([^']*)'")
RE_IMAM  = re.compile(r"window\.imam\s*=\s*'([^']+)'")
RE_NO    = re.compile(r"window\.noHadits\s*=\s*'([^']+)'")
RE_TERJEMAH = re.compile(r"id=['\"]terjemah_container['\"]>(.*?)</p>", re.DOTALL)


def make_session():
    session = requests.Session()
    retry = Retry(total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        "Accept": "text/html",
    })
    return session


def parse_hadith(html: str, imam: str, number: int) -> dict | None:
    kitab_m = RE_KITAB.search(html)
    bab_m   = RE_BAB.search(html)
    terjemah_m = RE_TERJEMAH.search(html)

    if not (kitab_m and bab_m and terjemah_m):
        return None

    terjemah = terjemah_m.group(1).strip()
    terjemah = re.sub(r"<[^>]+>", "", terjemah).strip()

    return {
        "number":    number,
        "imam":      imam,
        "kitab":     kitab_m.group(1).strip(),
        "bab":       bab_m.group(1).strip(),
        "terjemah":  terjemah,
    }


def fetch_one(session: requests.Session, imam: str, number: int) -> dict | None:
    url = f"{BASE_URL}/{imam}/{number}"
    try:
        resp = session.get(url, timeout=15)
        resp.raise_for_status()
        return parse_hadith(resp.text, imam, number)
    except Exception as e:
        print(f"  ERROR {url}: {e}")
        return None


def scrape_book(book: dict, workers: int, out_dir: Path, resume: bool):
    imam   = book["imam"]
    jumlah = book["jumlah"]
    out_file = out_dir / f"hadits_{imam}.json"

    # Resume: load existing data
    existing = {}
    if resume and out_file.exists():
        with open(out_file) as f:
            existing_list = json.load(f)
        existing = {h["number"]: h for h in existing_list}
        print(f"[{imam}] Resume: {len(existing)}/{jumlah} sudah ada")

    numbers_todo = [n for n in range(1, jumlah + 1) if n not in existing]
    if not numbers_todo:
        print(f"[{imam}] Sudah lengkap, skip.")
        return

    print(f"[{imam}] Scraping {len(numbers_todo)} hadits dengan {workers} workers...")

    session = make_session()
    results = dict(existing)
    done = len(existing)
    start = time.time()

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(fetch_one, session, imam, n): n for n in numbers_todo}
        for future in as_completed(futures):
            n = futures[future]
            data = future.result()
            if data:
                results[n] = data
            done += 1
            if done % 100 == 0:
                elapsed = time.time() - start
                rate = done / elapsed if elapsed > 0 else 0
                eta = (jumlah - done) / rate if rate > 0 else 0
                print(f"  [{imam}] {done}/{jumlah} ({rate:.1f}/s, ETA {eta:.0f}s)")

    # Save sorted by number
    sorted_hadiths = [results[n] for n in sorted(results.keys())]
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(sorted_hadiths, f, ensure_ascii=False, indent=2)

    print(f"[{imam}] Selesai: {len(sorted_hadiths)} hadits -> {out_file}")


def main():
    parser = argparse.ArgumentParser(description="Scraper hadits.in")
    parser.add_argument("--imam",    help="Hanya scrape satu imam (bukhari, muslim, dll)")
    parser.add_argument("--workers", type=int, default=15, help="Jumlah concurrent workers (default: 15)")
    parser.add_argument("--resume",  action="store_true",  help="Skip hadits yang sudah discrap")
    args = parser.parse_args()

    out_dir = Path(__file__).parent.parent / "data"
    out_dir.mkdir(exist_ok=True)

    books = [b for b in BOOKS if b["imam"] == args.imam] if args.imam else BOOKS
    if not books:
        print(f"Imam '{args.imam}' tidak ditemukan. Pilihan: {[b['imam'] for b in BOOKS]}")
        return

    print(f"Target: {sum(b['jumlah'] for b in books):,} hadits dari {len(books)} kitab")
    print(f"Output: {out_dir}/\n")

    for book in books:
        scrape_book(book, workers=args.workers, out_dir=out_dir, resume=args.resume)

    print("\nSelesai semua!")


if __name__ == "__main__":
    main()
