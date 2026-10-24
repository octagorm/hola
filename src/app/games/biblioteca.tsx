import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Check } from 'lucide-react'
import { BOOK, BOOKS, sentencesOf } from '../data/biblioteca'
import { plain, wordIds } from '../lib/text'
import { TEXT_SIZES, useStore } from '../lib/store'
import { blip } from '../lib/sound'
import { Mixed, MixedKey, Page } from '../ui'
import type { CSSProperties } from 'react'
import type { Book } from '../data/biblioteca'
import type { Token } from '../lib/text'
import type { PageProps } from '../registry'

// The library (data/biblioteca.ts): /#biblioteca lists the texts, and
// /#biblioteca/testamento reads one, the whole text on one page in mixed
// text, with room between the lines for the Norwegian over the words not
// known yet. A tapped word's card says what its form is and, where the text
// has one, a note on it, and can be told the word is known (the Norwegian
// over it goes) or to be practised. The place read to is kept in the bank,
// and the page opens there again. Once read to the end, the words met and read without being looked up count as read.

export default function BibliotecaPage({ arg }: PageProps) {
  const book = arg ? BOOK[arg] : undefined
  return book ? <Reader key={book.id} book={book} /> : <Shelf />
}

// How far a text is read, in a few words
function progress(book: Book, p: number | undefined, done?: number) {
  if (done) return 'Lest'
  if (!p) return 'Ulest'
  return `${Math.round((100 * (p + 1)) / book.text.length)} % lest`
}

const wordCount = (b: Book) =>
  sentencesOf(b).reduce(
    (n, s) =>
      n +
      plain(s)
        .split(' ')
        .filter((w) => /\p{L}/u.test(w)).length,
    0,
  )

function Shelf() {
  const { bank, levelOf } = useStore()
  return (
    <Page es="Biblioteca" title="Biblioteket">
      <div className="q-read">
        <p className="q-intro">
          Korte tekster slik de ble skrevet, ikke gjenfortalt. Ordene du ikke
          kan ennå, har norsk over seg. Trykk på et ord for å se hva det er, og
          si fra om du kan det, så forsvinner norsken, eller om du vil øve på
          det. Stedet du kom til, blir husket.
        </p>
        <ol className="q-chapters">
          {BOOKS.map((b) => {
            const place = bank.place[b.id]
            const ids = new Set(sentencesOf(b).flatMap(wordIds))
            const unknown = [...ids].filter((id) => levelOf(id) < 2).length
            return (
              <li key={b.id} className={place && !place.done ? 'next' : ''}>
                <a href={`#biblioteca/${b.id}`}>
                  <i>
                    <BookOpen aria-hidden="true" />
                  </i>
                  <span>
                    <b>{b.es}</b>
                    <small>
                      {b.no} · {b.by} · {wordCount(b)} ord, {unknown} du ikke
                      kan ennå
                    </small>
                  </span>
                  <em>
                    {place?.done && <Check aria-hidden="true" />}{' '}
                    {progress(b, place?.p, place?.done)}
                  </em>
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </Page>
  )
}

function Reader({ book }: { book: Book }) {
  const { bank, settings, setSettings, setPlace, record, played, levelOf } =
    useStore()
  const place = bank.place[book.id]
  const sentences = useMemo(() => sentencesOf(book), [book])
  const paras = useRef<Array<HTMLParagraphElement | null>>([])
  const tapped = useRef(new Set<string>())
  // The paragraph at the top of the screen, as it is read
  const at = useRef(place?.p ?? 0)
  // Opened where it was left, if that was not the start
  const [resumed, setResumed] = useState(
    () => !!place && !place.done && place.p > 0,
  )
  // Read to the end, with the words counted as read
  const [credited, setCredited] = useState<number | null>(null)

  const explain = (t: Token) => ({
    form: book.forms[t.es.toLowerCase()],
    note: t.note ? book.notes[t.note] : undefined,
  })

  // To where it was left
  useLayoutEffect(() => {
    if (resumed) paras.current[at.current]?.scrollIntoView({ block: 'start' })
    // (once, as it opens)
  }, [])

  // The paragraph at the top, kept a moment after scrolling stops
  useEffect(() => {
    let timer = 0
    const onScroll = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const top = 90
        let p = 0
        paras.current.forEach((el, i) => {
          if (el && el.getBoundingClientRect().top <= top) p = i
        })
        if (p !== at.current) {
          at.current = p
          setPlace(book.id, p)
        }
      }, 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
    }
  }, [book, setPlace])

  const finish = () => {
    setPlace(book.id, book.text.length - 1, true)
    // Words met and read without being looked up: read, a little
    const ids = new Set(sentences.flatMap(wordIds))
    let n = 0
    for (const id of ids)
      if (levelOf(id) > 0 && !tapped.current.has(id)) {
        record(id, true, 0.3, 'leer')
        n++
      }
    setCredited(n)
    played(book.id)
    blip('win')
  }

  const next = BOOKS.at(BOOKS.indexOf(book) + 1)
  const size = TEXT_SIZES[settings.textSize] ?? TEXT_SIZES[2]
  const sizeBy = (d: number) =>
    setSettings({
      textSize: Math.max(
        0,
        Math.min(TEXT_SIZES.length - 1, settings.textSize + d),
      ),
    })

  return (
    <Page
      es={book.es}
      title={book.no}
      back="#biblioteca"
      tools={
        <>
          <button
            type="button"
            className="q-round bk-size"
            aria-label="Mindre tekst"
            disabled={settings.textSize <= 0}
            onClick={() => sizeBy(-1)}
          >
            <span aria-hidden="true">A</span>
          </button>
          <button
            type="button"
            className="q-round bk-size big"
            aria-label="Større tekst"
            disabled={settings.textSize >= TEXT_SIZES.length - 1}
            onClick={() => sizeBy(1)}
          >
            <span aria-hidden="true">A</span>
          </button>
        </>
      }
    >
      <div className="q-read bk-read">
        <header className="bk-head">
          <p className="bk-by">{book.by}</p>
          <p className="q-intro">{book.about}</p>
          <MixedKey />
        </header>

        <div
          className="bk-text"
          style={{ '--bk-size': `${size}px` } as CSSProperties}
        >
          {book.text.map((para, i) => (
            <p
              key={i}
              ref={(el) => {
                paras.current[i] = el
              }}
            >
              {resumed && i === place?.p && (
                <span className="bk-resumed">
                  Her slapp du sist.{' '}
                  <button
                    type="button"
                    className="q-link"
                    onClick={() => {
                      setResumed(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Til begynnelsen
                  </button>
                </span>
              )}
              {para.map((s, j) => (
                <span key={j}>
                  {j > 0 && ' '}
                  <Mixed
                    line={s}
                    explain={explain}
                    onPeek={(id) => tapped.current.add(id)}
                  />
                </span>
              ))}
            </p>
          ))}
        </div>

        <section className="q-frame q-card bk-end">
          <div className="q-label">
            Fin <span>· slutt</span>
          </div>
          {credited === null ? (
            <>
              <p className="q-muted mt-1">
                Ordene du har møtt og leste uten å slå dem opp, blir regnet som
                lest når du er ferdig.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" className="q-btn" onClick={finish}>
                  <Check aria-hidden="true" /> Ferdig lest
                </button>
                <a className="q-link" href="#biblioteca">
                  Alle tekstene
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="q-muted mt-1">
                {credited
                  ? `${credited} ord er regnet som lest.`
                  : 'Teksten er lest.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {next && (
                  <a className="q-btn" href={`#biblioteca/${next.id}`}>
                    Neste: {next.es}
                  </a>
                )}
                <a className="q-link" href="#biblioteca">
                  Alle tekstene
                </a>
              </div>
            </>
          )}
          <p className="bk-source">
            Kilde:{' '}
            <a href={book.source.url} target="_blank" rel="noreferrer">
              {book.source.label}
            </a>
            . Teksten er fri for opphavsrett; bare stavemåten er gjort moderne.
          </p>
        </section>
      </div>
    </Page>
  )
}
