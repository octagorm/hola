# /// script
# requires-python = ">=3.11"
# dependencies = ["google-genai>=2.25"]
# ///
"""Make Hola's recordings with Gemini TTS.

    mkdir -p .cache && node scripts/speech.ts > .cache/speech.json
    uv run scripts/audio.py .cache/speech.json --dry-run
    uv run scripts/audio.py .cache/speech.json --job

The list holds everything the page says aloud, with the voice that says
it, and the cast (src/app/data/voices.ts): the Gemini voice behind each
name, and how it speaks. Voices designed from a description are made
once; their ids are kept in scripts/voices.json (delete one to design it
again, and --remake its name to read its items again).

Each item is asked for on its own, in its voice: a word as a teacher says
it to a beginner, a line in its voice's manner. With --job, everything
missing goes to Gemini's batch mode, at half the price and outside the
daily cap on requests, answered within a day and often within minutes;
the jobs are noted in .cache, so a run cut short picks them up again.
Without it, a few are asked for directly, to try a voice: up to --max of
them, or those named with --only, which are made again if they are made.
--voice keeps to one voice's items. --remake <names> makes those voices'
items again, or every word or line with `words` or `lines`, as after a
change in the cast. --dry-run says what would be asked for and removed,
and asks for and changes nothing.

Each answer is trimmed of the silence around it and becomes
public/audio/<id>.mp3, with <id> from a hash of the file itself, so that
a recording made again has a new name (the site lets browsers keep a
recording for a year), and src/app/data/audio.json maps "voice|text" to
it; files no item uses any more are removed. Only items without a file
are asked for, so a run cut short picks up where it stopped. The raw
sound of each answer is kept in .cache/tts/, and --retrim trims every
item again from it.

Needs GEMINI_API_KEY (from the environment, .env.local here or the macOS
Keychain: see load_env), and ffmpeg.
"""

import argparse
import base64
import concurrent.futures
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
MANIFEST = ROOT / "src" / "app" / "data" / "audio.json"
CACHE = ROOT / ".cache" / "tts"
VOICE_IDS = ROOT / "scripts" / "voices.json"
JOBS = ROOT / ".cache" / "jobs.json"
MODEL = "gemini-3.8-flash-tts"
# Requests in one batch job
PER_JOB = 50
# How a word is said, and a line when its voice has no manner of its own
WORD_STYLE = "Castilian Spanish, as a patient teacher says a word to a beginner: clear and a little slow, every sound exact"
LINE_STYLE = "natural and warm, at a calm pace a learner can follow"


def load_env():
    """GEMINI_API_KEY from the environment, else .env.local here, else the
    macOS Keychain, where the one key for every project is kept:
    security add-generic-password -a "$USER" -s GEMINI_API_KEY -w"""
    if os.environ.get("GEMINI_API_KEY"):
        return
    env = ROOT / ".env.local"
    for line in env.read_text().splitlines() if env.exists() else []:
        if line.startswith("GEMINI_API_KEY="):
            os.environ["GEMINI_API_KEY"] = line.split("=", 1)[1].strip().strip('"')
            return
    found = subprocess.run(
        ["security", "find-generic-password", "-a", os.environ.get("USER", ""), "-s", "GEMINI_API_KEY", "-w"],
        capture_output=True, text=True,
    ) if sys.platform == "darwin" else None
    if not found or found.returncode or not found.stdout.strip():
        sys.exit("No GEMINI_API_KEY: set it, or keep it in the Keychain (see load_env)")
    os.environ["GEMINI_API_KEY"] = found.stdout.strip()


def key_of(it) -> str:
    return f"{it['voice']}|{it['text']}"


def item_id(it) -> str:
    """An item's own name, for its raw sound in .cache"""
    return hashlib.sha1(key_of(it).encode()).hexdigest()[:12]


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *map(str, args)], check=True)


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(out)


def gaps(wav: Path, noise: int = -38, least: float = 0.25):
    """The silences in the sound: quieter than `noise` dB for `least` s"""
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", wav, "-af", f"silencedetect=noise={noise}dB:d={least}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(starts, ends))


def load_list(path: Path):
    """The items, the cast and the voices to design"""
    data = json.loads(path.read_text())
    return data["items"], data.get("voices", {}), data.get("designed", {})


def designed_ids(client, designed: dict[str, str]) -> dict[str, str]:
    """The ids of the designed voices, designing those not made yet"""
    ids = json.loads(VOICE_IDS.read_text()) if VOICE_IDS.exists() else {}
    for name, description in designed.items():
        if name in ids:
            continue
        # The design service fails now and then (500); it does on a retry
        for attempt in range(4):
            try:
                v = client.voices.create(
                    voice={"type": "prompted", "display_name": name, "prompted": {"input": description}},
                    store=True,
                )
                break
            except Exception as error:
                if attempt == 3 or "500" not in str(error):
                    raise
                print(f"  designing {name} failed ({str(error)[:60]}…); trying again", flush=True)
                time.sleep(20 * (attempt + 1))
        ids[name] = v.id
        VOICE_IDS.write_text(json.dumps(ids, ensure_ascii=False, indent=1) + "\n")
        print(f"  designed a voice for {name}: {v.id}", flush=True)
    return ids


def casting(cast, designed, ids):
    """For an item, the voice that reads it and how"""

    def voice_of(it):
        base = cast[it["voice"]]["base"] if it["voice"] in cast else it["voice"]
        return ids[base] if base in designed else base

    def style_of(it):
        if it["kind"] == "word":
            # Said alone, a word of one letter may be named as the letter
            # instead: y as «i griega»
            if len(re.sub(r"\W", "", it["text"])) == 1:
                return f"{WORD_STYLE}; it is a word of one letter, said as the word it is, never named as a letter"
            return WORD_STYLE
        # Without "every word as written" a voice in character now and
        # then adds a word of its own (as Tian's do)
        manner = cast[it["voice"]]["style"] if it["voice"] in cast else LINE_STYLE
        return f"Castilian Spanish, {manner}, every word as written"

    return voice_of, style_of


def ask(it, n: int, voice_of, style_of):
    """One request: an item on its own, in its voice"""
    return {
        "contents": [{"role": "user", "parts": [{"text": it["text"], "speech_metadata": {"style": style_of(it)}}]}],
        "config": {
            "response_modalities": ["AUDIO"],
            "speech_config": {"voice_config": {"voice": voice_of(it)}},
        },
        "metadata": {"key": str(n)},
    }


def sound_of(response) -> bytes | None:
    """The sound in an answer, as WAV, or None if there is none"""
    content = response.candidates[0].content if response and response.candidates else None
    part = content.parts[0] if content and content.parts else None
    if not part or not part.inline_data or not part.inline_data.data:
        return None
    data = part.inline_data.data
    if isinstance(data, str):
        data = base64.b64decode(data)
    if data[:4] == b"RIFF":
        return data
    # Raw 16-bit PCM, at the rate its type names
    rate = re.search(r"rate=(\d+)", part.inline_data.mime_type or "")
    out = io.BytesIO()
    with wave.open(out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(int(rate.group(1)) if rate else 24000)
        w.writeframes(data)
    return out.getvalue()


def widen(even: Path, a: float, b: float):
    """The stretch a–b widened to the quiet edges of its sound, which the
    loud threshold counts as silence: the hiss of s, z and f, and the
    breath of j, at either end of a word. Cut without them, libros loses
    its s."""
    total = duration(even)
    quiet = gaps(even, -55, 0.04)
    ends = [e for s, e in quiet if e <= a]
    starts = [s for s, e in quiet if b <= s]
    start = max(ends) if ends else max(0.0, a - 0.15)
    end = min(starts) if starts else min(total, b + 0.15)
    return start, end


def write_piece(even: Path, a: float, b: float) -> str:
    """The stretch a–b of the sound as a file named by a hash of itself,
    with a moment of lead and a short fade out. Returns the name."""
    start = max(0, a - 0.03)
    with tempfile.TemporaryDirectory() as tmp:
        piece = Path(tmp) / "piece.mp3"
        ffmpeg(
            "-ss", f"{start:.3f}", "-to", f"{b + 0.06:.3f}", "-i", even,
            "-af", "afade=t=out:st=%.3f:d=0.06" % max(0, b - start),
            "-ac", "1", "-ar", "24000", "-b:a", "40k", piece,
        )
        data = piece.read_bytes()
    fid = hashlib.sha1(data).hexdigest()[:12]
    (OUT / f"{fid}.mp3").write_bytes(data)
    return fid


def trim(raw: Path) -> tuple[str, float] | None:
    """A recording, its silence trimmed, as a file: its name and how long
    it is, or None where nothing is said"""
    with tempfile.TemporaryDirectory() as tmp:
        even = Path(tmp) / "even.wav"
        ffmpeg("-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "24000", "-ac", "1", even)
        total = duration(even)
        every = gaps(even)
        lead = next((e for s, e in every if s <= 0.05), 0.0)
        tail = next((s for s, e in every if e >= total - 0.05), total)
        if tail - lead < 0.05:
            return None
        a, b = widen(even, lead, tail)
        return write_piece(even, a, b), b - a


def doubtful(it, seconds: float) -> bool:
    """Whether a recording is far from the length of its text, as when a
    word is said twice or something is added. It is kept, but worth a
    listen."""
    letters = max(1, len(re.sub(r"[\W\d_]", "", it["text"])))
    return seconds > 1.0 + 0.15 * letters or (letters > 8 and seconds < 0.04 * letters)


def made(it, raw: Path, manifest, doubts) -> bool:
    """The item's file trimmed from its raw sound, and noted in the
    manifest"""
    trimmed = trim(raw)
    if trimmed is None:
        again = "" if key_of(it) in manifest else "; asked for again next time"
        print(f"  nothing said for {key_of(it)}{again}", flush=True)
        return False
    fid, seconds = trimmed
    manifest[key_of(it)] = fid
    if doubtful(it, seconds):
        doubts.append((it, seconds))
    return True


def keep(wav: bytes, it, manifest, doubts) -> bool:
    """An answer's sound as its item's file, the raw sound kept in .cache"""
    raw = CACHE / f"{item_id(it)}-{hashlib.sha1(wav).hexdigest()[:6]}.wav"
    raw.write_bytes(wav)
    return made(it, raw, manifest, doubts)


def save(manifest):
    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), ensure_ascii=False, indent=0) + "\n")


def collect(job, keys, by_key, manifest, doubts) -> int:
    """A finished job's answers, each made its item's file. Returns how many
    were made."""
    done = 0
    for i, r in enumerate(job.dest.inlined_responses or []):
        n = int((r.metadata or {}).get("key", i))
        it = by_key.get(keys[n]) if n < len(keys) else None
        if not it:
            # no longer on the list
            continue
        wav = None if r.error else sound_of(r.response)
        if not wav:
            print(f"  no sound for {key_of(it)}: {r.error or 'no audio'}", flush=True)
            continue
        done += keep(wav, it, manifest, doubts)
    return done


def pending_jobs():
    return json.loads(JOBS.read_text()) if JOBS.exists() else []


def run_jobs(client, todo, by_key, voice_of, style_of, manifest, doubts):
    """Asks for what is missing in batch jobs, a request per item, and waits
    for them, and for the jobs asked for before and not yet in"""
    jobs = pending_jobs()
    asked = {k for j in jobs for k in j["keys"]}
    new = [it for it in todo if key_of(it) not in asked]
    for i in range(0, len(new), PER_JOB):
        chunk = new[i : i + PER_JOB]
        job = client.batches.create(
            model=MODEL,
            src=[ask(it, n, voice_of, style_of) for n, it in enumerate(chunk)],
            config={"display_name": "hola-voices"},
        )
        jobs.append({"name": job.name, "keys": [key_of(it) for it in chunk]})
        JOBS.write_text(json.dumps(jobs, ensure_ascii=False, indent=1))
        print(f"  asked for {len(chunk)}, {job.name}", flush=True)
    start = told = time.time()
    while jobs:
        for j in list(jobs):
            job = client.batches.get(name=j["name"])
            state = job.state.name
            if state == "JOB_STATE_SUCCEEDED":
                done = collect(job, j["keys"], by_key, manifest, doubts)
                print(f"  {j['name']}: {done} of {len(j['keys'])} made", flush=True)
            elif state in ("JOB_STATE_FAILED", "JOB_STATE_CANCELLED", "JOB_STATE_EXPIRED"):
                print(f"  {j['name']}: {state.removeprefix('JOB_STATE_').lower()} – {job.error}", flush=True)
            else:
                continue
            jobs.remove(j)
            JOBS.write_text(json.dumps(jobs, ensure_ascii=False, indent=1))
            save(manifest)
        if jobs:
            if time.time() - told > 300:
                told = time.time()
                print(f"  waiting for {len(jobs)} job(s), {int(time.time() - start) // 60} min so far", flush=True)
            time.sleep(30)


def direct(client, todo, voice_of, style_of, manifest, doubts, wait: int) -> int:
    """Asks for items one at a time, as when trying a voice. Returns how
    many requests were made."""
    requests = 0
    pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    for it in todo:
        req = ask(it, 0, voice_of, style_of)
        # A request that hangs (as the free tier does when its quota is
        # spent) is given up after a while
        try:
            r = pool.submit(
                client.models.generate_content, model=MODEL, contents=req["contents"], config=req["config"]
            ).result(timeout=wait)
        except concurrent.futures.TimeoutError:
            print(f"No answer in {wait} s after {requests} request(s); try again later.", flush=True)
            break
        except Exception as error:
            if "429" in str(error) or "RESOURCE_EXHAUSTED" in str(error):
                print(f"Quota used up after {requests} request(s); run again later, or use --job.", flush=True)
                break
            raise
        requests += 1
        wav = sound_of(r)
        if not wav:
            print(f"  no sound for {key_of(it)}", flush=True)
        elif keep(wav, it, manifest, doubts):
            print(f"  public/audio/{manifest[key_of(it)]}.mp3  {key_of(it)}", flush=True)
        save(manifest)
    pool.shutdown(wait=False, cancel_futures=True)
    return requests


def unused(manifest):
    used = set(manifest.values())
    return [f for f in OUT.glob("*.mp3") if f.stem not in used] if OUT.exists() else []


def tidy(manifest):
    """Removes the files no item uses any more (as when a text changes, or
    its voice, or it is made again)"""
    gone = unused(manifest)
    for f in gone:
        f.unlink()
    if gone:
        print(f"removed {len(gone)} file(s) no longer used", flush=True)


def counted(items) -> str:
    """How many items there are of each voice and kind"""
    by: dict[str, int] = {}
    for it in items:
        by[f"{it['voice']} {it['kind']}"] = by.get(f"{it['voice']} {it['kind']}", 0) + 1
    return ", ".join(f"{n} {k}{'s' if n != 1 else ''}" for k, n in sorted(by.items())) or "none"


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("list", type=Path)
    parser.add_argument("--job", action="store_true", help="ask for everything missing in batch jobs, at half the price")
    parser.add_argument("--max", type=int, default=10, help="most requests without --job (default 10)")
    parser.add_argument("--voice", help="ask only for this voice's items")
    parser.add_argument("--only", action="append", default=[], metavar="TEXT", help="ask for the item with this text, again if it is made; may be given more than once")
    parser.add_argument("--remake", default="", help="voices to make again, by name, comma-separated, or `words` or `lines` for every one of them")
    parser.add_argument("--retrim", action="store_true", help="trim every item again from its recording in .cache")
    parser.add_argument("--dry-run", action="store_true", help="say what would be asked for and removed, and change nothing")
    parser.add_argument("--wait", type=int, default=120, help="seconds to wait for one request without --job")
    args = parser.parse_args()

    items, cast, designed = load_list(args.list)
    remake = set(filter(None, args.remake.split(",")))
    only = set(args.only)
    unknown = only - {it["text"] for it in items}
    if unknown:
        sys.exit(f"Not on the list: {', '.join(sorted(unknown))}")
    if args.voice and args.voice not in {it["voice"] for it in items}:
        sys.exit(f"No voice called {args.voice} on the list")
    # What is made: the items on the list whose file is there
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    wanted = {key_of(it) for it in items}
    for key in list(manifest):
        if key not in wanted or not (OUT / f"{manifest[key]}.mp3").exists():
            del manifest[key]
    if only:
        todo = [it for it in items if it["text"] in only]
    else:
        todo = [it for it in items if key_of(it) not in manifest or it["voice"] in remake or f"{it['kind']}s" in remake]
        if args.voice:
            todo = [it for it in todo if it["voice"] == args.voice]
        if not args.job:
            todo = todo[: args.max]
    by_key = {key_of(it): it for it in items}
    missing = [it for it in items if key_of(it) not in manifest]
    print(f"{len(items)} items ({counted(items)}), {len(items) - len(missing)} with a recording", flush=True)

    if args.dry_run:
        jobs = pending_jobs() if args.job else []
        out = {k for j in jobs for k in j["keys"]}
        asking = [] if args.retrim else [it for it in todo if key_of(it) not in out]
        for it in asking:
            print(f"  {it['voice']:<10} {it['kind']:<5} {it['text']}")
        ids = json.loads(VOICE_IDS.read_text()) if VOICE_IDS.exists() else {}
        for name in designed:
            if name not in ids:
                print(f"would design a voice for {name}")
        print(f"would ask for {len(asking)} ({counted(asking)})" + (" in batch jobs" if args.job else ", one request each"))
        if out:
            print(f"and wait for {len(out)} asked for before, in {len(jobs)} job(s)")
        if not args.job and len(missing) > len(todo):
            print(f"{len(missing)} are missing in all: --job asks for them")
        print(f"would remove {len(unused(manifest))} file(s) no longer used")
        return

    load_env()
    from google import genai

    client = genai.Client()
    OUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    voice_of, style_of = casting(cast, designed, designed_ids(client, designed) if designed else {})
    doubts = []
    requests = 0
    if args.retrim:
        # an item keeps its raw sound as <its own name>-<hash>.wav
        done = 0
        for it in items:
            raws = sorted(CACHE.glob(f"{item_id(it)}-*.wav"), key=lambda f: f.stat().st_mtime)
            if raws and key_of(it) in manifest:
                done += made(it, raws[-1], manifest, doubts)
        print(f"trimmed {done} again", flush=True)
        todo = []
    if args.job:
        run_jobs(client, todo, by_key, voice_of, style_of, manifest, doubts)
    elif todo:
        requests = direct(client, todo, voice_of, style_of, manifest, doubts, args.wait)
    save(manifest)
    tidy(manifest)
    if doubts:
        print(f"worth a listen, as far from the length of their text ({len(doubts)}):")
        for it, seconds in doubts:
            print(f"  {seconds:4.1f} s  public/audio/{manifest[key_of(it)]}.mp3  {it['text']}")
    missing = sum(key_of(it) not in manifest for it in items)
    print(f"done: {len(items) - missing} of {len(items)} have a recording" + (f", {requests} request(s)" if requests else ""))
    sys.stdout.flush()
    # a request given up on may still hold a thread
    os._exit(0)


if __name__ == "__main__":
    main()
