import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BookOpen, Check, ScrollText } from 'lucide-react'
import { BOOK, BOOKS, sentencesOf } from '../data/biblioteca'
import { plain, wordIds } from '../lib/text'
import { TEXT_SIZES, TEXT_WIDTHS, useStore } from '../lib/store'
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
// and the page opens there again. «Bare spansk» leaves the Norwegian out
// and sets the lines close, as in a book, with every word still to tap.
// The panel behind «Aa» has the text's size, its width, and the choice
// between scrolling and pages turned sideways, as in Kulturuke's reader:
// turned by a swipe, the arrow keys or a tap in the margin beside it. The
// title and «Aa» go once reading goes on, and a tap on the page brings them
// back.
// Once read to the end, the words met and read without being looked up
// count as read.

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

// The space kept under a page for its number, and between pages
const NAV = 36

// The choices for the Norwegian over the words
const GLOSSES = [
  ['none', 'Bare spansk'],
  ['new', 'Ukjente ord'],
  ['all', 'Alle ord'],
] as const
const GAP = 48

function Reader({ book }: { book: Book }) {
  const { bank, settings, setSettings, setPlace, record, played, levelOf } =
    useStore()
  const place = bank.place[book.id]
  const sentences = useMemo(() => sentencesOf(book), [book])
  const paras = useRef<Array<HTMLParagraphElement | null>>([])
  const view = useRef<HTMLDivElement>(null)
  const flow = useRef<HTMLDivElement>(null)
  const end = useRef<HTMLSpanElement>(null)
  const tapped = useRef(new Set<string>())
  // The paragraph at the top of the screen, as it is read
  const at = useRef(place?.p ?? 0)
  const atWord = useRef(place?.w ?? 0)
  // The first word in view, kept while the text reflows, so that a new size
  // or a word made known keeps the page where it is
  const anchor = useRef<Element | null>(null)
  // Turned a page at a time: which, of how many, and how far apart
  const pager = useRef({ index: 0, count: 1, stride: 0 })
  const [pages, setPages] = useState({ index: 0, count: 1 })
  const [panel, setPanel] = useState(false)
  // The title and «Aa» over the text, out of the way once reading goes on
  const [controls, setControls] = useState(true)
  // Opened where it was left, if that was not the start
  const [resumed, setResumed] = useState(
    () => !!place && !place.done && (place.p > 0 || !!place.w),
  )
  // Read to the end, with the words counted as read
  const [credited, setCredited] = useState<number | null>(null)

  const paged = settings.paged
  const gloss = settings.gloss
  const bare = gloss === 'none'
  const size = TEXT_SIZES[settings.textSize] ?? TEXT_SIZES[1]
  const width = TEXT_WIDTHS[settings.textWidth] ?? TEXT_WIDTHS[0]

  const explain = (t: Token) => ({
    form: book.forms[t.es.toLowerCase()],
    note: t.note ? book.notes[t.note] : undefined,
  })

  // The first word in a box: on the page shown, or under the top of the
  // screen
  const firstIn = useCallback(
    (box: DOMRect) => {
      for (const el of flow.current?.querySelectorAll('.mx > span') ?? []) {
        const r = el.getBoundingClientRect()
        if (r.width === 0) continue
        if (
          paged
            ? r.left >= box.left - 1 && r.left < box.right
            : r.top >= box.top
        )
          return el
      }
      return null
    },
    [paged],
  )

  // The word read to kept as the place in the text: its paragraph, and
  // where in it
  const keep = useCallback(
    (el: Element | null) => {
      if (!el) return
      anchor.current = el
      const p = paras.current.findIndex((x) => x?.contains(el))
      if (p < 0) return
      const w = Array.from(
        paras.current[p]!.querySelectorAll('.mx > span'),
      ).indexOf(el)
      if (p !== at.current || w !== atWord.current) {
        at.current = p
        atWord.current = Math.max(0, w)
        setPlace(book.id, p, false, atWord.current)
      }
    },
    [book, setPlace],
  )

  // The word the text was left at, or its paragraph
  const leftAt = () =>
    paras.current[at.current]?.querySelectorAll('.mx > span')[atWord.current] ??
    paras.current[at.current]

  const turnTo = useCallback(
    (index: number, remember = true) => {
      const pg = pager.current
      pg.index = Math.max(0, Math.min(pg.count - 1, index))
      const shift = pg.index * pg.stride
      if (flow.current)
        flow.current.style.transform = shift ? `translateX(${-shift}px)` : ''
      setPages({ index: pg.index, count: pg.count })
      if (remember && view.current)
        keep(firstIn(view.current.getBoundingClientRect()))
    },
    [firstIn, keep],
  )

  // The page an element stands on
  const pageOf = (el: Element) => {
    const v = view.current!.getBoundingClientRect()
    const shift = pager.current.index * pager.current.stride
    const rects = el.getClientRects()
    const r = rects.length ? rects[0] : el.getBoundingClientRect()
    return Math.floor((r.left - v.left + shift + 1) / pager.current.stride)
  }

  // A page at a time: the text in columns as wide as the page and as tall as
  // the screen allows, moved sideways a page at a time
  const wasPaged = useRef(false)
  useLayoutEffect(() => {
    const v = view.current!
    const f = flow.current!
    if (!paged) {
      v.style.height = ''
      f.style.cssText = ''
      // From pages to the scroll: to the word that was read
      if (wasPaged.current && anchor.current?.isConnected)
        window.scrollTo(
          0,
          anchor.current.getBoundingClientRect().top + window.scrollY - 100,
        )
      else if (!wasPaged.current && resumed) {
        const el = leftAt()
        if (el)
          window.scrollTo(
            0,
            el.getBoundingClientRect().top + window.scrollY - 100,
          )
      }
      wasPaged.current = false
      return
    }
    wasPaged.current = true
    window.scrollTo(0, 0)
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    let frame = 0
    const layout = () => {
      const h = Math.max(
        220,
        window.innerHeight - v.getBoundingClientRect().top - NAV,
      )
      v.style.height = `${h}px`
      const w = v.clientWidth
      const stride = w + GAP
      f.style.height = `${h}px`
      f.style.columnWidth = `${w}px`
      f.style.columnGap = `${GAP}px`
      const shift = pager.current.index * pager.current.stride
      const last =
        end.current!.getBoundingClientRect().left -
        v.getBoundingClientRect().left +
        shift
      const count = Math.max(1, Math.floor((last + 1) / stride) + 1)
      // (as wide as every page, so that no column lies outside its box)
      f.style.width = `${count * stride - GAP}px`
      pager.current = { ...pager.current, count, stride }
      let index = 0
      if (anchor.current?.isConnected) index = pageOf(anchor.current)
      else if (resumed) {
        const el = leftAt()
        if (el) index = pageOf(el)
      }
      turnTo(index, false)
      if (!anchor.current?.isConnected)
        anchor.current = firstIn(v.getBoundingClientRect())
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(layout)
    }
    layout()
    window.addEventListener('resize', schedule)
    const changes = new MutationObserver(schedule)
    changes.observe(f, { childList: true, subtree: true, characterData: true })
    void document.fonts.ready.then(schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', schedule)
      changes.disconnect()
      root.style.overflow = overflow
    }
    // (the place to open at is read as it is laid out, not followed)
  }, [paged, size, width.px, gloss, turnTo, firstIn])

  // The word at the top, kept a moment after scrolling stops; the title
  // gone while scrolling on, and back on scrolling up
  useEffect(() => {
    if (paged) return
    let timer = 0
    let last = window.scrollY
    let way = 0
    const onScroll = () => {
      const d = window.scrollY - last
      last = window.scrollY
      way = Math.sign(d) === Math.sign(way) ? way + d : d
      if (window.scrollY < 8 || way < -12) setControls(true)
      else if (way > 12) setControls(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(
        () =>
          keep(
            firstIn(new DOMRect(0, 70, window.innerWidth, window.innerHeight)),
          ),
        600,
      )
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
    }
  }, [paged, keep, firstIn])

  const turn = useCallback(
    (step: number) => {
      turnTo(pager.current.index + step)
      setControls(false)
      // (a word's card left open would point at the page turned away)
      window.dispatchEvent(new Event('scroll'))
    },
    [turnTo],
  )

  // The arrow keys turn the page
  useEffect(() => {
    if (!paged) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if ((e.target as Element | null)?.closest('input, select, textarea'))
        return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') turn(1)
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') turn(-1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paged, turn])

  // A tap in the margin beside the page turns it, back on the left and on
  // on the right; a tap on the page, not on a word, shows the title and
  // «Aa» or hides them
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (
        target?.closest(
          'a, button, input, label, [data-peek], .q-peek, .bk-panel',
        )
      )
        return
      const v = view.current?.getBoundingClientRect()
      if (!v || e.clientY < v.top || e.clientY > v.bottom) return
      if (paged && e.clientX < v.left) turn(-1)
      else if (paged && e.clientX > v.right) turn(1)
      else if (e.clientX >= v.left && e.clientX <= v.right)
        setControls((shown) => !shown)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [paged, turn])

  // A swipe turns the page
  const from = useRef<{ x: number; y: number } | null>(null)
  const swipe = (e: React.PointerEvent) => {
    const start = from.current
    from.current = null
    if (!paged || !start || e.pointerType === 'mouse') return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    turn(dx < 0 ? 1 : -1)
  }

  // The panel of choices closes on a tap outside it, or Escape
  useEffect(() => {
    if (!panel) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest('.bk-panel, .bk-panel-open'))
        setPanel(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(false)
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [panel])

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
      className={`bk-page${paged ? ' paged' : ''}${controls || panel ? '' : ' bk-hidden'}`}
      style={
        {
          '--bk-size': `${size}px`,
          '--bk-width': `${width.px}px`,
        } as CSSProperties
      }
      tools={
        <button
          type="button"
          className="q-round bk-panel-open"
          aria-label="Visning"
          aria-expanded={panel}
          onClick={() => setPanel((o) => !o)}
        >
          <span aria-hidden="true">Aa</span>
        </button>
      }
    >
      {panel && (
        <div
          className="q-frame q-card bk-panel"
          role="group"
          aria-label="Visning"
        >
          <div className="bk-row">
            <span>Tekststørrelse</span>
            <div className="q-stepper">
              <button
                type="button"
                aria-label="Mindre tekst"
                disabled={settings.textSize <= 0}
                onClick={() => sizeBy(-1)}
              >
                −
              </button>
              <button
                type="button"
                aria-label="Større tekst"
                disabled={settings.textSize >= TEXT_SIZES.length - 1}
                onClick={() => sizeBy(1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="bk-row">
            <span>Visning</span>
            <div className="bk-seg">
              <button
                type="button"
                aria-pressed={!paged}
                onClick={() => setSettings({ paged: false })}
              >
                <ScrollText aria-hidden="true" /> Rull
              </button>
              <button
                type="button"
                aria-pressed={paged}
                onClick={() => setSettings({ paged: true })}
              >
                <BookOpen aria-hidden="true" /> Sider
              </button>
            </div>
          </div>
          <div className="bk-row bk-wide">
            <span>Tekstbredde</span>
            <div className="bk-seg">
              {TEXT_WIDTHS.map((w, i) => (
                <button
                  key={w.name}
                  type="button"
                  aria-pressed={i === settings.textWidth}
                  onClick={() => setSettings({ textWidth: i })}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
          <div className="bk-row">
            <span>Norsk over ordene</span>
            <div className="bk-seg">
              {GLOSSES.map(([g, name]) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={g === gloss}
                  onClick={() => setSettings({ gloss: g })}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bk-read">
        <div
          ref={view}
          className="bk-view"
          onPointerDown={(e) => {
            from.current = { x: e.clientX, y: e.clientY }
          }}
          onPointerUp={swipe}
        >
          <div ref={flow} className="bk-flow">
            <header className="bk-head">
              <p className="bk-by">{book.by}</p>
              <p className="q-intro">{book.about}</p>
              {bare ? (
                <p className="bk-hint">
                  Trykk på et ord for å se hva det betyr.
                </p>
              ) : (
                <MixedKey faint={gloss === 'all'} />
              )}
            </header>

            <div className={`bk-text${bare ? ' plain' : ''}`}>
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
                          if (paged) turn(-pager.current.index)
                          else window.scrollTo({ top: 0, behavior: 'smooth' })
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
                        all={bare ? 2 : undefined}
                        glossAll={gloss === 'all'}
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
                    Ordene du har møtt og leste uten å slå dem opp, blir regnet
                    som lest når du er ferdig.
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
                . Teksten er fri for opphavsrett; bare stavemåten er gjort
                moderne.
              </p>
            </section>
            <span ref={end} className="bk-flow-end" aria-hidden="true" />
          </div>
        </div>

        {paged && (
          <div className="bk-pages" aria-live="polite">
            {pages.index + 1} av {pages.count}
          </div>
        )}
      </div>
    </Page>
  )
}
