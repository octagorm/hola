import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Podcast } from 'lucide-react'
import { AUDIOBOOKS } from '../data/lydbok'
import { BOOK, MADE, minutes } from '../lib/lydbok'
import { APPS, FEED } from '../lib/podcast'
import { stop } from '../lib/speech'
import { Page } from '../ui'
import type { PageProps } from '../registry'
import type { Audiobook } from '../data/lydbok'
import type { Made } from '../lib/lydbok'

// An audiobook (data/lydbok.ts), heard best as the podcast it is
// (lib/podcast.ts): its page says what it is, how to follow it in a
// podcast app on the phone, where its chapters come as chapters, and
// offers the browser's own player for whoever would rather hear it here.
// Where it was left there is kept in this browser.

const placeKey = (id: string) => `hola:lydbok:${id}`

function savedPlace(id: string): number {
  try {
    return Number(localStorage.getItem(placeKey(id))) || 0
  } catch {
    return 0
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
  const [copied, setCopied] = useState(false)

  // The phone's lock screen names the book
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: book.es,
      artist: 'Hola',
      album: book.no,
    })
  }, [book])

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
        <p className="q-muted for">
          {made
            ? `${minutes(made.seconds)} i ${book.chapters.length} kapitler. `
            : ''}
          Skrevet ut fra {book.for}.
        </p>

        <section className="q-follow">
          <Podcast className="sign" aria-hidden="true" />
          <h2>Lytt i podkastappen</h2>
          <p>
            Lydboken er en podkast. Trykk på appen du har på telefonen, så
            legges den til der, med kapitlene, og nye lydbøker kommer av seg
            selv.
          </p>
          <div className="apps">
            {APPS.map((a) => (
              <a key={a.app} className="q-btn" href={a.href}>
                {a.app}
              </a>
            ))}
          </div>
          <p className="other">
            Bruker du en annen app? Kopier adressen, åpne appen, og lim den inn
            der du søker etter podkaster:
          </p>
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

        {made && (
          <section className="q-here">
            <h2>Eller lytt her</h2>
            <audio
              ref={audio}
              controls
              src={`/${made.file}`}
              preload="metadata"
              onLoadedMetadata={(e) => {
                const t = savedPlace(book.id)
                if (t) e.currentTarget.currentTime = t
              }}
              onPlay={() => stop()}
              onPause={(e) => savePlace(book.id, e.currentTarget.currentTime)}
              onEnded={() => savePlace(book.id, 0)}
              onTimeUpdate={(e) => {
                const at = e.currentTarget.currentTime
                if (Math.floor(at) % 5 === 0) savePlace(book.id, at)
              }}
            />
          </section>
        )}

        <section className="q-here">
          <h2>Kapitlene</h2>
          <ol className="q-book-chapters">
            {book.chapters.map((c, i) => (
              <li key={i}>
                <span className="n">{i + 1}</span>
                <b>{c.title}</b>
                <small>{c.no}</small>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Page>
  )
}
