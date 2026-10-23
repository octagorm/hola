import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { meaning } from '../data/words'
import { cellsOf, line, make, match, sameCell, snap } from '../lib/sopa'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { NEEDS, clueCount } from '../lib/today'
import { TodayNext, useBack } from '../daily'
import { Es, useFont } from '../ui'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Cell, Grid } from '../lib/sopa'
import './sopa.css'

// Sopa de letras: a word search on a panel of azulejos, the blue and white
// glazed tiles of Seville and Lisbon, with lemons in the border. Words met
// are hidden in the letters (lib/sopa.ts) and listed by their meaning, so
// finding one is recalling its Spanish: the saying of it (decir). A word
// is picked out by dragging across it, or by tapping its first letter and
// then its last; it is glazed in a colour of its own and said. Tapping a
// word in the list lights up its first letter.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500..800,100&family=Figtree:wght@400;500;600;700;800&display=swap'

// What an answer says (lib/bank.ts): a word recalled and found in the
// letters is about as good as picking it from a few; found with its first
// letter shown, a hint; given up, a weak slip, since it may only have
// been hard to see
const FOUND = 0.6
const HINTED = 0.3
const GIVEN = 0.3

// The glaze each word takes when found, and its letters' colour
const GLAZE: Array<[string, string]> = [
  ['#f1c232', '#1c2f73'],
  ['#4e8a45', '#fffaf0'],
  ['#d0643a', '#fffaf0'],
  ['#28909d', '#fffaf0'],
  ['#87569a', '#fffaf0'],
  ['#e39a2d', '#1c2f73'],
  ['#c5486a', '#fffaf0'],
  ['#5f86cf', '#fffaf0'],
]

const glaze = (i: number) => GLAZE[i % GLAZE.length]

// A line of squares as a stroke from the middle of the first to the
// middle of the last, in squares
const stroke = (cells: Array<Cell>) => {
  const [r0, c0] = cells[0]
  const [r1, c1] = cells[cells.length - 1]
  return `M${c0 + 0.5} ${r0 + 0.5}L${c1 + 0.5} ${r1 + 0.5}`
}

export default function Sopa() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('sopa')
  const [round, setRound] = useState(() => ({
    n: 0,
    g: make(bank, Date.now()),
  }))
  const enough = !!round.g && clueCount(bank) >= NEEDS.sopa

  return (
    <div className="sl">
      <Branch />
      <div className="sl-col">
        {enough && round.g ? (
          <Board
            key={round.n}
            g={round.g}
            back={back}
            onAgain={() =>
              setRound((r) => ({ n: r.n + 1, g: make(bank, Date.now()) }))
            }
          />
        ) : (
          <TooFew back={back} />
        )}
      </div>
    </div>
  )
}

function Top({ back, count }: { back: string; count?: [number, number] }) {
  return (
    <header className="sl-top">
      <a className="sl-round" href={back} aria-label="Tilbake">
        <ArrowLeft />
      </a>
      <h1>
        Sopa de letras<small>Ordleting</small>
      </h1>
      {count && (
        <span className="sl-count" aria-label={`${count[0]} av ${count[1]}`}>
          <b>{count[0]}</b>/{count[1]}
        </span>
      )}
    </header>
  )
}

function TooFew({ back }: { back: string }) {
  const { bank } = useStore()
  return (
    <>
      <Top back={back} />
      <section className="sl-card">
        <p className="kick">Ikke ennå</p>
        <h2>Flisene trenger flere ord</h2>
        <p>
          Ordene som gjemmes, er ord du har møtt, og det trengs minst{' '}
          {NEEDS.sopa} som kan stå alene med en betydning. Hilsener og uttrykk
          kan ikke det. Du har {clueCount(bank)}.
        </p>
        <div className="acts">
          <a className="sl-btn" href="#nuevas">
            Lær nye ord
          </a>
          <a className="sl-link" href="#">
            Til forsiden
          </a>
        </div>
      </section>
    </>
  )
}

const ARROWS: Record<string, Cell | undefined> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

function Board({
  g,
  back,
  onAgain,
}: {
  g: Grid
  back: string
  onAgain: () => void
}) {
  const { record, points, played, settings } = useStore()
  const n = g.size
  const [found, setFound] = useState<Array<number>>([])
  const [hinted, setHinted] = useState<Array<number>>([])
  const [given, setGiven] = useState(false)
  // The line being dragged, the first letter tapped, and the last line
  // that was no word, fading
  const [sel, setSel] = useState<Array<Cell> | null>(null)
  const [anchor, setAnchor] = useState<Cell | null>(null)
  const [miss, setMiss] = useState<{ cells: Array<Cell>; n: number } | null>(
    null,
  )
  // The square chosen with the arrow keys
  const [cursor, setCursor] = useState<Cell | null>(null)
  const drag = useRef<{ a: Cell; b: Cell; id: number } | null>(null)
  const field = useRef<HTMLDivElement>(null)

  const all = g.hidden.length
  const won = !given && found.length === all
  const done = won || given

  // The words over each square, by their place in the list
  const over = useMemo(() => {
    const m = new Map<string, Array<number>>()
    g.hidden.forEach((h, i) =>
      cellsOf(h).forEach(([r, c]) => {
        const k = `${r},${c}`
        m.set(k, [...(m.get(k) ?? []), i])
      }),
    )
    return m
  }, [g])

  // A miss fades away by itself
  useEffect(() => {
    if (!miss) return
    const t = setTimeout(() => setMiss(null), 700)
    return () => clearTimeout(t)
  }, [miss])

  const finish = (got: Array<number>, quit: boolean) => {
    if (got.length) points(got.length)
    played('sopa')
    if (!quit) setTimeout(() => blip('win'), 450)
  }

  const pick = (cells: Array<Cell>) => {
    const i = match(g, cells)
    if (i < 0 || found.includes(i)) {
      setMiss((m) => ({ cells, n: (m?.n ?? 0) + 1 }))
      return
    }
    const h = g.hidden[i]
    const got = [...found, i]
    setFound(got)
    record(h.word.id, true, hinted.includes(i) ? HINTED : FOUND, 'decir')
    if (settings.autoplay) void say(h.word.es)
    if (got.length === all) finish(got, false)
    else blip('right')
  }

  // A tap: the first letter, then the last
  const tap = (c: Cell) => {
    if (!anchor) {
      setAnchor(c)
      return
    }
    if (sameCell(anchor, c)) {
      setAnchor(null)
      return
    }
    const l = line(anchor, c)
    // Not in a line with it: a new first letter
    if (!l) {
      setAnchor(c)
      return
    }
    setAnchor(null)
    pick(l)
  }

  // Where the pointer is over the letters, in squares
  const at = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = (field.current as HTMLDivElement).getBoundingClientRect()
    return [
      ((e.clientY - r.top) / r.height) * n - 0.5,
      ((e.clientX - r.left) / r.width) * n - 0.5,
    ]
  }
  const square = ([y, x]: [number, number]): Cell => [
    Math.max(0, Math.min(n - 1, Math.round(y))),
    Math.max(0, Math.min(n - 1, Math.round(x))),
  ]

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (done || e.button > 0 || drag.current) return
    e.preventDefault()
    const a = square(at(e))
    drag.current = { a, b: a, id: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
    setCursor(null)
    setSel([a])
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const b = snap(d.a, at(e), n)
    if (sameCell(b, d.b)) return
    d.b = b
    setSel(line(d.a, b))
  }

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    setSel(null)
    if (sameCell(d.a, d.b)) tap(d.a)
    else {
      setAnchor(null)
      pick(line(d.a, d.b) ?? [d.a])
    }
  }

  const onCancel = () => {
    drag.current = null
    setSel(null)
  }

  // A word's first letter lit, or a word found said again
  const hint = (i: number) => {
    const h = g.hidden[i]
    if (found.includes(i) || given) {
      void say(h.word.es)
      return
    }
    if (hinted.includes(i)) return
    setHinted([...hinted, i])
    blip('tap')
  }

  // The rest shown: each a slip, if a weak one
  const giveUp = () => {
    if (done) return
    g.hidden.forEach((h, i) => {
      if (!found.includes(i)) record(h.word.id, false, GIVEN, 'decir')
    })
    setGiven(true)
    setAnchor(null)
    finish(found, true)
  }

  // The arrow keys move a square, Enter or the space bar taps it
  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select')) return
      const step = ARROWS[e.key]
      if (step) {
        e.preventDefault()
        setCursor((c) => {
          if (!c) return anchor ?? [0, 0]
          return [
            Math.max(0, Math.min(n - 1, c[0] + step[0])),
            Math.max(0, Math.min(n - 1, c[1] + step[1])),
          ]
        })
        return
      }
      if (e.key === 'Escape') {
        setAnchor(null)
        return
      }
      if ((e.key === 'Enter' || e.key === ' ') && cursor) {
        if (t?.closest('button, a')) return
        e.preventDefault()
        tap(cursor)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const inSel = new Set((sel ?? []).map(([r, c]) => `${r},${c}`))
  const firsts = new Set(
    hinted
      .filter((i) => !found.includes(i))
      .map((i) => `${g.hidden[i].row},${g.hidden[i].col}`),
  )

  return (
    <>
      <Top back={back} count={[found.length, all]} />
      <div className={`sl-play ${won ? 'won' : ''}`}>
        <div className="sl-board">
          <Frame />
          <div className="sl-field">
            <div
              ref={field}
              className="sl-grid"
              style={{ ['--n' as string]: n }}
              role="grid"
              aria-label={`Bokstaver, ${n} ganger ${n}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
              onLostPointerCapture={onCancel}
            >
              {g.cells.flatMap((row, r) =>
                row.map((letter, c) => {
                  const k = `${r},${c}`
                  const words = (over.get(k) ?? []).filter(
                    (i) => found.includes(i) || given,
                  )
                  const lit = words.filter((i) => found.includes(i))
                  const style: Record<string, string> = {}
                  if (words.length) {
                    const [c1, i1] = glaze(words[0])
                    style['--c1'] = c1
                    style['--i1'] = i1
                    style['--c2'] = glaze(words.at(1) ?? words[0])[0]
                  }
                  // The wave of the end, along the diagonals
                  style['--d'] = `${(r + c) * 55}ms`
                  const cls = [
                    'sl-tile',
                    lit.length ? 'f' : words.length ? 'shown' : '',
                    words.length > 1 ? 'two' : '',
                    inSel.has(k) ? 'sel' : '',
                    anchor && sameCell(anchor, [r, c]) ? 'anchor' : '',
                    firsts.has(k) && !done ? 'hint' : '',
                    cursor && sameCell(cursor, [r, c]) ? 'cur' : '',
                    won && !over.has(k) ? 'deco' : '',
                  ].join(' ')
                  return (
                    <span key={k} className={cls} style={style}>
                      <b className="l">{letter}</b>
                      {won && !over.has(k) && <i className="m" />}
                    </span>
                  )
                }),
              )}
            </div>
            {miss && miss.cells.length > 1 && (
              <svg
                key={miss.n}
                className="sl-miss"
                viewBox={`0 0 ${n} ${n}`}
                aria-hidden="true"
              >
                <path d={stroke(miss.cells)} />
              </svg>
            )}
          </div>
        </div>

        <div className="sl-side">
          {done && (
            <Result
              g={g}
              found={found}
              hinted={hinted}
              given={given}
              onAgain={onAgain}
            />
          )}
          <section className="sl-list" aria-label="Ordene">
            {!done && <h2>Finn ordene på spansk</h2>}
            <ul>
              {g.hidden.map((h, i) => {
                const got = found.includes(i)
                const shown = got || given
                const [c1, i1] = glaze(i)
                return (
                  <li key={h.word.id}>
                    <button
                      type="button"
                      className={`${got ? 'got' : ''} ${shown && !got ? 'missed' : ''} ${!shown && hinted.includes(i) ? 'hinted' : ''}`}
                      onClick={() => hint(i)}
                      aria-label={
                        shown
                          ? `${h.word.es}: ${meaning(h.word)}. Hør ordet`
                          : `${meaning(h.word)}: ${h.answer.length} bokstaver. Vis første bokstav`
                      }
                    >
                      <i
                        className="sw"
                        style={
                          shown
                            ? {
                                ['--c1' as string]: c1,
                                ['--i1' as string]: i1,
                              }
                            : undefined
                        }
                      >
                        {shown ? '' : hinted.includes(i) ? h.answer[0] : ''}
                      </i>
                      {shown ? (
                        <span className="txt">
                          <b lang="es">
                            <Es w={h.word} />
                          </b>
                          <small>{meaning(h.word)}</small>
                        </span>
                      ) : (
                        <span className="txt">
                          {meaning(h.word)}
                          <span className="len" aria-hidden="true">
                            {[...h.answer].map((_, j) => (
                              <i key={j} />
                            ))}
                          </span>
                        </span>
                      )}
                      {shown && <Volume2 className="say" aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}
            </ul>
            {!done && (
              <div className="sl-help">
                <p>
                  Dra over ordet, eller trykk på første og siste bokstav. Ordene
                  står bortover, nedover eller på skrå.
                </p>
                <p>
                  Står du fast? Trykk på ordet i lista, så lyser første bokstav.
                </p>
                <button type="button" className="sl-link" onClick={giveUp}>
                  Vis resten
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

function Result({
  g,
  found,
  hinted,
  given,
  onAgain,
}: {
  g: Grid
  found: Array<number>
  hinted: Array<number>
  given: boolean
  onAgain: () => void
}) {
  const helped = found.filter((i) => hinted.includes(i)).length
  return (
    <section className={`sl-card sl-result ${given ? '' : 'won'}`}>
      <Rosette />
      <p className="kick">{given ? 'Las que faltaban' : '¡Sopa completa!'}</p>
      <h2>
        {given
          ? `${found.length} av ${g.hidden.length} ord funnet`
          : `Alle ${g.hidden.length} ordene funnet`}
      </h2>
      <p>
        {given
          ? 'Ordene du ikke fant, står nå i flisene. De kommer igjen snart.'
          : helped
            ? `${helped} av dem med første bokstav vist.`
            : 'Uten et eneste hint.'}
      </p>
      <div className="acts">
        <TodayNext page="sopa" className="sl-btn" />
        <button type="button" className="sl-btn ghost" onClick={onAgain}>
          En ny sopa
        </button>
        <a className="sl-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// --- The tiles around the letters ---

const COBALT = '#1f3e9c'
const WHITE = '#fbf8f0'
const LEMON = '#f2c230'
const LEAF = '#4b8a43'

// A border tile with a lemon on its leaf, its inner edge at the bottom
function LemonTile() {
  return (
    <>
      <rect x="1" y="1" width="48" height="48" rx="1.5" fill={WHITE} />
      <path d="M1 6H49M1 44H49" stroke={COBALT} strokeWidth="2.6" />
      <path
        d="M9 31C9 23 15 18 23 17 22 25 17 30 9 31Z"
        fill={LEAF}
        stroke="#2f5f2b"
        strokeWidth="1"
      />
      <path d="M10.5 29.5 20 20" stroke="#2f5f2b" strokeWidth="1" />
      <ellipse
        cx="29"
        cy="26"
        rx="11"
        ry="8.4"
        transform="rotate(-18 29 26)"
        fill={LEMON}
        stroke="#b07a12"
        strokeWidth="1.2"
      />
      <path d="M39.6 21.6 42.5 19.8" stroke="#b07a12" strokeWidth="1.8" />
      <ellipse
        cx="26"
        cy="23.4"
        rx="3.6"
        ry="1.9"
        transform="rotate(-18 26 23.4)"
        fill="#fbe7a2"
      />
    </>
  )
}

// A border tile with a blue flower between two curls
function FlowerTile() {
  return (
    <>
      <rect x="1" y="1" width="48" height="48" rx="1.5" fill={WHITE} />
      <path d="M1 6H49M1 44H49" stroke={COBALT} strokeWidth="2.6" />
      <g fill={COBALT}>
        <ellipse cx="25" cy="18" rx="4" ry="6" />
        <ellipse cx="25" cy="32" rx="4" ry="6" />
        <ellipse cx="18" cy="25" rx="6" ry="4" />
        <ellipse cx="32" cy="25" rx="6" ry="4" />
      </g>
      <circle cx="25" cy="25" r="3.4" fill={LEMON} />
      <path
        d="M4 25C4 19 9 17 11 21M46 25C46 31 41 33 39 29"
        fill="none"
        stroke={COBALT}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  )
}

// A corner tile: a white star flower on cobalt
function CornerTile() {
  return (
    <>
      <rect x="1" y="1" width="48" height="48" rx="1.5" fill={COBALT} />
      <rect
        x="4.5"
        y="4.5"
        width="41"
        height="41"
        fill="none"
        stroke={LEMON}
        strokeWidth="1.6"
      />
      <g fill={WHITE}>
        {[0, 45, 90, 135].map((a) => (
          <ellipse
            key={a}
            cx="25"
            cy="25"
            rx="3.6"
            ry="14"
            transform={`rotate(${a} 25 25)`}
          />
        ))}
      </g>
      <circle cx="25" cy="25" r="5" fill={LEMON} />
      <circle cx="25" cy="25" r="2" fill={COBALT} />
    </>
  )
}

// The border: sixteen tiles a side, lemons and flowers in turn, a star at
// each corner, and a cobalt line and a yellow one inside it
function Frame() {
  const side = Array.from({ length: 16 }, (_, i) => i)
  const tile = (i: number) => (i % 2 ? <FlowerTile /> : <LemonTile />)
  return (
    <svg className="sl-frame" viewBox="0 0 900 900" aria-hidden="true">
      <rect width="900" height="900" rx="6" fill="#d9cfbd" />
      {side.map((i) => (
        <g key={`t${i}`} transform={`translate(${50 + i * 50} 0)`}>
          {tile(i)}
        </g>
      ))}
      {side.map((i) => (
        <g
          key={`b${i}`}
          transform={`translate(${100 + i * 50} 900) rotate(180)`}
        >
          {tile(i + 1)}
        </g>
      ))}
      {side.map((i) => (
        <g key={`l${i}`} transform={`translate(0 ${100 + i * 50}) rotate(-90)`}>
          {tile(i + 1)}
        </g>
      ))}
      {side.map((i) => (
        <g key={`r${i}`} transform={`translate(900 ${50 + i * 50}) rotate(90)`}>
          {tile(i)}
        </g>
      ))}
      {[
        [0, 0],
        [850, 0],
        [0, 850],
        [850, 850],
      ].map(([x, y]) => (
        <g key={`${x},${y}`} transform={`translate(${x} ${y})`}>
          <CornerTile />
        </g>
      ))}
      <rect
        x="53"
        y="53"
        width="794"
        height="794"
        fill="#e7dfcf"
        stroke={COBALT}
        strokeWidth="6"
      />
      <rect
        x="59.5"
        y="59.5"
        width="781"
        height="781"
        fill="none"
        stroke={LEMON}
        strokeWidth="3"
      />
    </svg>
  )
}

// A round tile of the end: the star flower in a ring of lemons
function Rosette() {
  return (
    <svg className="sl-rosette" viewBox="0 0 50 50" aria-hidden="true">
      <circle cx="25" cy="25" r="24" fill={COBALT} />
      <circle cx="25" cy="25" r="20.5" fill="none" stroke={LEMON} />
      <g fill={WHITE}>
        {[0, 45, 90, 135].map((a) => (
          <ellipse
            key={a}
            cx="25"
            cy="25"
            rx="3.4"
            ry="13"
            transform={`rotate(${a} 25 25)`}
          />
        ))}
      </g>
      <circle cx="25" cy="25" r="4.6" fill={LEMON} />
    </svg>
  )
}

// A sprig of lemons hanging over the wall from the top, and its shadow
function Branch() {
  return (
    <svg className="sl-branch" viewBox="0 0 160 300" aria-hidden="true">
      <defs>
        <filter id="sl-shade" x="-20%" y="-20%" width="140%" height="140%">
          <feFlood floodColor="#5a4a30" floodOpacity=".17" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <g id="sl-sprig">
          <path
            d="M168 -6C140 30 112 60 92 104 84 122 80 140 78 150"
            fill="none"
            stroke="#5b4a33"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M120 50C126 74 126 100 120 122"
            fill="none"
            stroke="#5b4a33"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <g fill={LEAF} stroke="#2f5f2b" strokeWidth="1.4">
            <path d="M138 20C118 8 92 12 78 24 98 38 122 36 138 20Z" />
            <path d="M126 44C146 56 156 80 152 100 132 88 124 66 126 44Z" />
            <path d="M104 74C82 66 58 74 48 90 70 100 92 94 104 74Z" />
            <path d="M94 100C112 112 118 134 112 152 96 140 90 120 94 100Z" />
            <path d="M84 132C66 132 50 146 46 162 64 166 80 154 84 132Z" />
          </g>
          <g fill="none" stroke="#2f5f2b" strokeWidth="1.2">
            <path d="M136 21C118 18 98 20 82 24M127 46C136 62 144 80 150 98M102 75C84 78 66 82 52 89M95 102C104 116 108 132 111 150M83 134C70 140 58 150 49 160" />
          </g>
          <g stroke="#b07a12" strokeWidth="1.6">
            <ellipse cx="78" cy="182" rx="22" ry="29" fill={LEMON} />
            <ellipse
              cx="124"
              cy="152"
              rx="17"
              ry="23"
              fill={LEMON}
              transform="rotate(-10 124 152)"
            />
          </g>
          <path
            d="M78 150V154M121 122V129M78 211 78 216M127 175 128 179"
            stroke="#5b4a33"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <g fill="#fbe7a2">
            <ellipse cx="70" cy="170" rx="5" ry="10" />
            <ellipse cx="118" cy="143" rx="4" ry="8" />
          </g>
        </g>
      </defs>
      <use
        href="#sl-sprig"
        transform="translate(-12 16)"
        filter="url(#sl-shade)"
      />
      <use href="#sl-sprig" />
    </svg>
  )
}
