# /// script
# requires-python = ">=3.11"
# ///
"""Put Hola's audiobooks together from their recordings.

    mkdir -p .cache && node scripts/lydbok.ts > .cache/lydbok.json
    uv run scripts/lydbok.py .cache/lydbok.json

Each book (src/app/data/lydbok.ts) is its recordings one after another
(public/audio/, found by their text in src/app/data/audio.json, so make
them first with scripts/audio.py), with the pause after each that
scripts/lydbok.ts gives, in one file: public/lydbok/<id>-<hash>.mp3, named
by a hash of the file so that a book put together again gets a new name.
src/app/data/lydbok-times.json notes the file, its length and when each
part begins, for the page to follow; files no book uses any more are
removed. A book with a recording missing is left as it was, and the
missing texts are named.

Needs ffmpeg.
"""

import hashlib
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public" / "audio"
OUT = ROOT / "public" / "lydbok"
MANIFEST = ROOT / "src" / "app" / "data" / "audio.json"
TIMES = ROOT / "src" / "app" / "data" / "lydbok-times.json"
RATE = 24000


def pcm(mp3: Path, tmp: Path) -> bytes:
    """A recording as 16-bit mono samples at RATE"""
    wav = tmp / "piece.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-ar", str(RATE), "-ac", "1", "-sample_fmt", "s16", str(wav)],
        check=True,
    )
    with wave.open(str(wav)) as w:
        return w.readframes(w.getnframes())


def build(book, by_text: dict[str, str], tmp: Path):
    """The book's sound and its marks, or the texts with no recording"""
    missing = [p["text"] for p in book["parts"] if p["text"] not in by_text]
    if missing:
        return None, missing
    sound = bytearray()
    marks = []
    for p in book["parts"]:
        marks.append([p["chapter"], p["line"], round(len(sound) / 2 / RATE, 2)])
        sound += pcm(AUDIO / f"{by_text[p['text']]}.mp3", tmp)
        sound += bytes(2 * int(RATE * p["pause"]))
    return (bytes(sound), marks), []


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    books = json.loads(Path(sys.argv[1]).read_text())
    manifest = json.loads(MANIFEST.read_text())
    # The page finds a recording by its text alone, whatever its voice
    by_text = {key.split("|", 1)[1]: fid for key, fid in manifest.items()}
    times = json.loads(TIMES.read_text()) if TIMES.exists() else {}
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        for book in books:
            made, missing = build(book, by_text, tmp)
            if missing:
                print(f"{book['id']}: {len(missing)} recordings missing, left as it was:")
                for text in missing[:20]:
                    print(f"  {text}")
                continue
            sound, marks = made
            wav = tmp / "book.wav"
            with wave.open(str(wav), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(RATE)
                w.writeframes(sound)
            mp3 = tmp / "book.mp3"
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1", str(mp3)],
                check=True,
            )
            data = mp3.read_bytes()
            name = f"{book['id']}-{hashlib.sha256(data).hexdigest()[:10]}.mp3"
            (OUT / name).write_bytes(data)
            seconds = round(len(sound) / 2 / RATE, 1)
            times[book["id"]] = {"file": f"lydbok/{name}", "seconds": seconds, "marks": marks}
            print(f"{book['id']}: {seconds / 60:.1f} min, public/lydbok/{name}")
    ids = {b["id"] for b in books}
    times = {k: v for k, v in times.items() if k in ids}
    used = {Path(v["file"]).name for v in times.values()}
    for f in OUT.glob("*.mp3"):
        if f.name not in used:
            f.unlink()
            print(f"removed {f.name}")
    TIMES.write_text(json.dumps(times, indent=1, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
