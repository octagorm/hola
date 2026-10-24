import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Copy,
  FileText,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
} from 'lucide-react'
import { AUDIOBOOKS } from '../data/lydbok'
import { BOOK, MADE, markAt, minutes } from '../lib/lydbok'
import { APPS, FEED } from '../lib/podcast'
import { stop } from '../lib/speech'
import { Mixed, Page } from '../ui'
import type { PageProps } from '../registry'
import type { Audiobook } from '../data/lydbok'
import type { Made } from '../lib/lydbok'

// An audiobook (data/lydbok.ts): one file to play, its chapters to jump
// to, and, for whoever wants to read along, the chapter heard (the hosts'
// talk as it is said, the story in mixed text) with the part heard marked
// and each part a place to jump to. The books are a podcast too
// (lib/podcast.ts), to follow in an app. Where it was left, and whether
// the text is shown, are kept in this browser.

const SPEEDS = [0.8, 0.9, 1]

const clock = (s: number) => {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const placeKey = (id: string) => `hola:lydbok:${id}`

function savedPlace(id: string): number {
  try {
    return Number(localStorage.getItem(placeKey(id))) || 0
  } catch {
    return 0
  }
}

const TEXT_KEY = 'hola:lydbok:tekst'

function savedText(): boolean {
  try {
    return localStorage.getItem(TEXT_KEY) === '1'
  } catch {
    return false
  }
}

function saveText(on: boolean) {
  try {
    localStorage.setItem(TEXT_KEY, on ? '1' : '0')
  } catch {
    // storage closed
  }
}

function savePlace(id: string, t: number) {
  try {
    localStorage.setItem(placeKey(id), String(Math.floor(t)))
  } catch {
    // storage closed
  }
}

export default function Lydbok({ arg }: PageProps) {
  const book =
    BOOK[arg ?? ''] ?? (AUDIOBOOKS.length === 1 ? AUDIOBOOKS[0] : undefined)
  if (book) return <Book book={book} made={MADE[book.id]} />
  return (
    <Page es="Audiolibros" title="Lydbøker">
      <ul className="q-books">
        {AUDIOBOOKS.map((b) => (
          <li key={b.id}>
            <a href={`#lydbok/${b.id}`}>
              <b>{b.es}</b>
              <span>{b.no}</span>
              {MADE[b.id] && <em>{minutes(MADE[b.id]?.seconds ?? 0)}</em>}
            </a>
          </li>
        ))}
      </ul>
    </Page>
  )
}

function Book({ book, made }: { book: Audiobook; made: Made | undefined }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(() => savedPlace(book.id))
  const [speed, setSpeed] = useState(1)
  // The chapter shown: the one heard, or one picked to read
  const [picked, setPicked] = useState<number | null>(null)
  const [reading, setReading] = useState(savedText)
  const [copied, setCopied] = useState(false)
  const now = made ? markAt(made, t) : null
  const shown = picked ?? now?.[0] ?? 0
  const chapter = book.chapters[shown]
  const lineRef = useRef<HTMLParagraphElement>(null)

  // Started where it was left
  useEffect(() => {
    const a = audio.current
    if (a && t) a.currentTime = t
    // (only on opening)
  }, [])

  // The line heard kept in view
  const heard = now && now[0] === shown ? now[1] : null
  useEffect(() => {
    if (playing && reading)
      lineRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [heard, playing, reading])

  // The phone's lock screen names the book
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: book.es,
      artist: 'Hola',
      album: book.no,
    })
  }, [book])

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      stop()
      setPicked(null)
      void a.play()
    } else a.pause()
  }

  const seek = (to: number) => {
    const a = audio.current
    if (!a) return
    a.currentTime = Math.max(0, Math.min(made?.seconds ?? 0, to))
    setT(a.currentTime)
    setPicked(null)
  }

  const startOf = (c: number, part = -1) =>
    made?.marks.find(([mc, mp]) => mc === c && mp === part)?.[2] ?? 0

  // A part of the text tapped: heard from there, unless a word was tapped
  // to see its card
  const jump = (e: React.MouseEvent, part: number) => {
    if (!made || (e.target as Element).closest('[data-peek]')) return
    seek(startOf(shown, part))
    const a = audio.current
    if (a?.paused) {
      stop()
      void a.play()
    }
  }

  const copy = () => {
    void navigator.clipboard.writeText(FEED).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Page es={book.es} title={book.no}>
      <div className="q-book">
        <p className="q-intro">{book.about}</p>
        <p className="q-muted for">Skrevet ut fra {book.for}.</p>

        {made ? (
          <section className="q-frame q-player">
            <audio
              ref={audio}
              src={`/${made.file}`}
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => {
                setPlaying(false)
                savePlace(book.id, audio.current?.currentTime ?? 0)
              }}
              onEnded={() => savePlace(book.id, 0)}
              onTimeUpdate={(e) => {
                const at = e.currentTarget.currentTime
                setT(at)
                if (Math.floor(at) % 5 === 0) savePlace(book.id, at)
              }}
            />
            <div className="row">
              <button
                type="button"
                className="q-round"
                aria-label="15 sekunder tilbake"
                onClick={() => seek(t - 15)}
              >
                <RotateCcw />
              </button>
              <button
                type="button"
                className="q-round big dark"
                aria-label={playing ? 'Pause' : 'Spill av'}
                onClick={toggle}
              >
                {playing ? <Pause /> : <Play />}
              </button>
              <button
                type="button"
                className="q-round"
                aria-label="15 sekunder fram"
                onClick={() => seek(t + 15)}
              >
                <RotateCw />
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={made.seconds}
              step={1}
              value={Math.min(t, made.seconds)}
              aria-label="Hvor i boken"
              onChange={(e) => seek(Number(e.target.value))}
            />
            <div className="times">
              <span>{clock(t)}</span>
              <span>{clock(made.seconds)}</span>
            </div>
            <div className="speeds" role="group" aria-label="Fart">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s === speed ? 'on' : ''}
                  aria-pressed={s === speed}
                  onClick={() => {
                    setSpeed(s)
                    if (audio.current) audio.current.playbackRate = s
                  }}
                >
                  {s === 1 ? 'Vanlig' : `${Math.round(s * 100)} %`}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="q-btn ghost small save"
              aria-pressed={reading}
              onClick={() => {
                setReading(!reading)
                saveText(!reading)
              }}
            >
              <FileText /> {reading ? 'Skjul teksten' : 'Les med'}
            </button>
          </section>
        ) : (
          <p className="q-frame q-player none">
            Lydboken er ikke lest inn ennå. Teksten kan leses her så lenge.
          </p>
        )}

        <ol className="q-book-chapters">
          {book.chapters.map((c, i) => (
            <li key={i} className={i === shown ? 'on' : ''}>
              <button
                type="button"
                onClick={() => {
                  if (made) seek(startOf(i))
                  setPicked(i)
                }}
              >
                <span className="n">{i + 1}</span>
                <b>{c.title}</b>
                <small>{c.no}</small>
              </button>
            </li>
          ))}
        </ol>

        {(reading || !made) && (
          <section className="q-text q-book-text">
            <h2
              className={heard === -1 ? 'now' : ''}
              ref={heard === -1 ? lineRef : undefined}
            >
              {chapter.title}
            </h2>
            {chapter.parts.map((p, i) => (
              <p
                key={`${shown}-${i}`}
                ref={heard === i ? lineRef : undefined}
                className={`${'host' in p ? 'host' : 'story'} ${heard === i ? 'now' : ''} ${made ? 'jump' : ''}`}
                onClick={(e) => jump(e, i)}
              >
                {'host' in p ? (
                  <>
                    <b>{p.host}</b> {p.text}
                  </>
                ) : (
                  <Mixed line={p.line} onPeek={() => audio.current?.pause()} />
                )}
              </p>
            ))}
          </section>
        )}

        <section className="q-follow">
          <h2>Følg i en podkastapp</h2>
          <p>
            Velg appen du bruker på telefonen, så kommer nye lydbøker dit av seg
            selv.
          </p>
          <div className="apps">
            {APPS.map((a) => (
              <a key={a.app} className="q-btn ghost small" href={a.href}>
                {a.app}
              </a>
            ))}
          </div>
          <p>I en annen app legger du til podkasten med adressen:</p>
          <div className="feed">
            <code>{FEED}</code>
            <button
              type="button"
              className="q-round"
              aria-label="Kopier adressen"
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </button>
          </div>
        </section>
      </div>
    </Page>
  )
}
