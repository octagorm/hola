import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  Repeat2,
  RotateCcw,
  Shuffle,
  SkipForward,
  Undo2,
  X,
} from 'lucide-react'
import { shuffle } from '../lib/choices'
import { glossOf } from '../lib/letras'
import {
  ALPHABET,
  CENTER,
  DICT,
  DIGRAPHS,
  LINES,
  PREMIUM,
  RACK,
  SIZE,
  TURNS,
  VALUE,
  arrange,
  colOf,
  credit,
  formsFor,
  hint,
  hisTurn,
  isOver,
  lay,
  newGame,
  pass,
  play,
  rowOf,
  spell,
  step,
  swap,
  tilesFor,
  toMove,
  unknown,
} from '../lib/palabras'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { Speak, useFont, useLetterKeys } from '../ui'
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react'
import type { Bank } from '../lib/bank'
import type {
  Dir,
  Game,
  Level,
  LineId,
  Move,
  Premium,
  Turn,
  Why,
} from '../lib/palabras'
import './palabras.css'

// Palabras: Scrabble in Spanish against El relojero, an old watchmaker
// with a loupe in his eye, on a well-loved wooden set on a walnut table.
// The rules, the words and his plays are in lib/palabras.ts. A game is
// twelve turns, six each, one round of the clock, kept in this browser so
// that it can be taken up again where it was left. Tiles are laid by a tap
// on a tile and a tap on a square, by dragging, or from the keyboard: a
// square tapped is where the word begins, and the word is typed.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap'

// The game as it stands, after each turn
const KEY = 'hola:palabras:v1'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

const isTile = (t: unknown) =>
  typeof t === 'object' &&
  t !== null &&
  typeof (t as { id?: unknown }).id === 'number' &&
  typeof (t as { l?: unknown }).l === 'string'

// A game read back is one this page could have kept: its hundred tiles,
// each once, on the board, in the bag or on a rack
function valid(x: unknown): x is Game {
  if (typeof x !== 'object' || x === null) return false
  const g = x as Record<string, unknown>
  const { board, bag, racks, score, log, rec } = g
  if (g.v !== 1 || (g.level !== 'easy' && g.level !== 'hard')) return false
  if (!Array.isArray(board) || board.length !== SIZE * SIZE) return false
  if (!Array.isArray(racks) || racks.length !== 2) return false
  if (!racks.every((r) => Array.isArray(r))) return false
  if (!Array.isArray(bag) || !Array.isArray(score) || score.length !== 2)
    return false
  if (!Array.isArray(log) || !Array.isArray(rec)) return false
  const cells: Array<unknown> = board.filter(Boolean)
  const tiles: Array<unknown> = [
    ...bag,
    ...(racks as Array<Array<unknown>>).flat(),
    ...cells.map((c) => (c as { t?: unknown }).t),
  ]
  if (tiles.length !== 100 || !tiles.every(isTile)) return false
  return new Set(tiles.map((t) => (t as { id: number }).id)).size === 100
}

function load(): Game | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const g: unknown = JSON.parse(raw)
    return valid(g) ? g : null
  } catch {
    return null
  }
}

function keep(g: Game) {
  try {
    localStorage.setItem(KEY, JSON.stringify(g))
  } catch {
    // the game is not kept, no more
  }
}

const LEVELS: Array<{ id: Level; no: string; note: string }> = [
  { id: 'easy', no: 'Rolig', note: 'Han legger bare ord du har møtt.' },
  {
    id: 'hard',
    no: 'Skarp',
    note: 'Han kan alle ordene i Hola, og legger de beste.',
  },
]

export default function Palabras() {
  useFont(FONTS)
  const back = useBack('palabras')
  const [kept] = useState(load)
  // A game left unfinished goes on; one finished begins anew
  const [game, setGame] = useState<Game | null>(() =>
    kept && !isOver(kept) ? kept : null,
  )
  const [level, setLevel] = useState<Level>(kept?.level ?? 'easy')
  const [n, setN] = useState(0)
  return (
    <div className="pz">
      {game ? (
        <Play
          key={n}
          first={game}
          back={back}
          onNew={() => {
            setLevel(game.level)
            setGame(null)
          }}
        />
      ) : (
        <Start
          back={back}
          level={level}
          setLevel={setLevel}
          onStart={() => {
            const g = newGame(level)
            keep(g)
            setGame(g)
            setN((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}

function Top({ back, tools }: { back: string; tools?: ReactNode }) {
  return (
    <header className="pz-top">
      <a className="pz-round" href={back} aria-label="Tilbake">
        <ArrowLeft />
      </a>
      <h1>
        Palabras<small>Ordbrett</small>
      </h1>
      {tools && <div className="pz-tools">{tools}</div>}
    </header>
  )
}

function Start({
  back,
  level,
  setLevel,
  onStart,
}: {
  back: string
  level: Level
  setLevel: (l: Level) => void
  onStart: () => void
}) {
  const { bank } = useStore()
  const best = bank.best.palabras ?? 0
  return (
    <div className="pz-start">
      <Top back={back} />
      <section className="pz-hello">
        <div className="pz-wall">
          <Relojero mood="glad" />
        </div>
        <div className="pz-bubble big" lang="es">
          <p>{LINES.hello.es}</p>
          <p className="no" lang="nb">
            {LINES.hello.no}
          </p>
        </div>
      </section>
      <section className="pz-sheet">
        <h2>Scrabble mot urmakeren</h2>
        <p>
          Legg spanske ord på brettet mot El relojero, den gamle urmakeren. Dere
          har seks trekk hver, én runde rundt urskiven, og den som har flest
          poeng da, vinner. Ordene er ordene i Hola, også i flertall.
        </p>
        <div className="pz-levels" role="radiogroup" aria-label="Motstanderen">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={level === l.id}
              className={level === l.id ? 'on' : ''}
              onClick={() => setLevel(l.id)}
            >
              <b>{l.no}</b>
              <span>{l.note}</span>
            </button>
          ))}
        </div>
        <div className="pz-acts">
          <button type="button" className="pz-btn" onClick={onStart}>
            Begynn
          </button>
        </div>
        {best > 0 && <p className="pz-best">Din beste: {best} poeng</p>}
      </section>
    </div>
  )
}

// --- A game ---

// A tile from the rack laid on a square this turn, a blank with its letter
interface Pend {
  id: number
  i: number
  l: string
}

interface Tip {
  id: string
  move: Move
  met: boolean
  shown: boolean
}

interface Grab {
  id: number
  from: 'rack' | 'board'
  x0: number
  y0: number
  moved: boolean
  size: number
}

const WHY: Record<Why, string> = {
  none: 'Legg noen brikker på brettet først.',
  taken: 'Den ruten er tatt.',
  line: 'Brikkene må ligge på én linje, bortover eller nedover.',
  gap: 'Det kan ikke være tomme ruter mellom brikkene.',
  center: 'Det første ordet må dekke stjernen i midten.',
  short: 'Et ord må ha minst to bokstaver.',
  touch: 'Ordet må henge sammen med brikkene på brettet.',
}

// How long he thinks at least
const THINK = 900

// What is said for a word on the board: its form as the player knows it,
// a noun with its article
const sayOf = (key: string, bank: Bank) => {
  const e = DICT.get(key)
  return e ? (formsFor(e, bank).at(0)?.say ?? '') : ''
}

const byIndex = (p: Array<Pend>) => new Map(p.map((x) => [x.i, x]))

function Play({
  first,
  back,
  onNew,
}: {
  first: Game
  back: string
  onNew: () => void
}) {
  const { bank, settings, record, meet, points, setBest, played } = useStore()
  const [g, setG] = useState(first)
  const bankNow = useRef(bank)
  useEffect(() => {
    bankNow.current = bank
  })
  const commit = (next: Game) => {
    setG(next)
    keep(next)
  }

  // Her tiles on the board this turn, and the cursor that typing lays at,
  // as of the last key, since keys come faster than the page is drawn
  const [pending, setPendingNow] = useState<Array<Pend>>([])
  const pend = useRef<Array<Pend>>([])
  const setPending = (p: Array<Pend>) => {
    pend.current = p
    setPendingNow(p)
  }
  const [cursor, setCursorNow] = useState<{ i: number; dir: Dir } | null>(() =>
    first.board.every((c) => !c) && toMove(first) === 0
      ? { i: CENTER, dir: 'across' }
      : null,
  )
  const cur = useRef(cursor)
  const setCursor = (c: { i: number; dir: Dir } | null) => {
    cur.current = c
    setCursorNow(c)
  }
  // The tile typed last, for a digraph typed as two letters (C, then H),
  // and a digraph on the board half typed over
  const typed = useRef<Pend | null>(null)
  const half = useRef<number | null>(null)
  const owe = useRef<{ i: number; rest: string } | null>(null)
  const forget = () => {
    typed.current = null
    half.current = null
    owe.current = null
  }

  const [sel, setSel] = useState<number | null>(null)
  const [note, setNote] = useState<{ text: string; bad?: boolean } | null>(null)
  const [shake, setShake] = useState(0)
  const [tip, setTip] = useState<Tip | null>(null)
  const [swapping, setSwapping] = useState<Array<number> | null>(null)
  const [blank, setBlank] = useState<{
    id: number
    i: number
    dir?: Dir
  } | null>(null)
  const [card, setCard] = useState<string | null>(null)
  const [line, setLine] = useState<LineId>(() =>
    !first.log.length ? 'hello' : toMove(first) === 0 ? 'yours' : 'think',
  )
  const [passing, setPassing] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [end, setEnd] = useState<{ before: number } | null>(null)

  // Dragging: the tile held, the square it is over, and the tile drawn
  // under the finger
  const grab = useRef<Grab | null>(null)
  const [held, setHeld] = useState<{
    id: number
    l: string
    size: number
    x: number
    y: number
  } | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const ghost = useRef<HTMLDivElement>(null)
  // A drag just ended, so that the click after it is not a tap
  const dragged = useRef(false)

  // What is said now; a new turn's words stop the last turn's
  const talks = useRef(0)
  const herWords = useRef<Promise<void>>(Promise.resolve())
  const talk = (texts: Array<string>): Promise<void> => {
    const n = ++talks.current
    if (!settings.autoplay) return Promise.resolve()
    return (async () => {
      for (const t of texts) {
        if (!t || talks.current !== n) continue
        await say(t)
      }
    })()
  }

  useEffect(() => {
    if (!first.log.length) herWords.current = talk([LINES.hello.es])
  }, [])

  const done = isOver(g)
  const mine = !done && toMove(g) === 0
  const rack = g.racks[0]
  const blanks = new Set(rack.filter((t) => t.b).map((t) => t.id))
  const pendAt = byIndex(pending)
  const out = new Set(pending.map((p) => p.id))
  const last = g.log.at(-1)
  const fresh = new Set(last?.kind === 'play' ? (last.cells ?? []) : [])

  // The next square from i on that has no tile, -1 off the board
  const nextFree = (i: number, dir: Dir, taken: Map<number, Pend>) => {
    let j = i
    while (j >= 0 && (g.board[j] || taken.has(j))) j = step(j, dir)
    return j
  }

  const finish = (fin: Game, said: Array<string> = []) => {
    setEnd({ before: bankNow.current.best.palabras ?? 0 })
    setBest('palabras', fin.score[0])
    const words = fin.log.reduce(
      (n, t) => n + (t.by === 0 ? (t.words?.length ?? 0) : 0),
      0,
    )
    if (words) points(words)
    played('palabras')
    const [me, him] = fin.score
    const res: LineId = me > him ? 'won' : me < him ? 'lost' : 'tie'
    setLine(res)
    if (res === 'won') setTimeout(() => blip('win'), 400)
    void talk([...said, LINES[res].es])
  }

  // El relojero's turn: once her words are said, he thinks, and plays
  useEffect(() => {
    if (isOver(g) || toMove(g) !== 1) return
    let on = true
    let timer = 0
    const move = () => {
      const b = bankNow.current
      const a = hisTurn(g, b, Date.now())
      let next: Game
      let said: Array<string>
      if (a.kind === 'play') {
        next = play(g, a.placed, a.move)
        said = a.move.words.map((w) => sayOf(w.key, b))
        setLine('yours')
      } else if (a.kind === 'swap') {
        next = swap(g, a.ids)
        said = [LINES.swap.es]
        setLine('swap')
      } else {
        next = pass(g)
        said = [LINES.pass.es]
        setLine('pass')
      }
      commit(next)
      blip('tap')
      if (isOver(next)) finish(next, said)
      else {
        void talk(said)
        if (next.board.every((c) => !c)) setCursor({ i: CENTER, dir: 'across' })
      }
    }
    void herWords.current.then(() => {
      if (!on) return
      setLine('think')
      timer = window.setTimeout(move, THINK)
    })
    return () => {
      on = false
      clearTimeout(timer)
    }
  }, [g])

  // --- Laying tiles ---

  const place = (x: Pend, dir?: Dir) => {
    const p = [...pend.current.filter((y) => y.id !== x.id), x]
    setPending(p)
    setSel(null)
    setNote(null)
    forget()
    if (dir) {
      const j = nextFree(step(x.i, dir), dir, byIndex(p))
      setCursor(j >= 0 ? { i: j, dir } : null)
    }
    blip('tap')
  }

  // A tile from the rack on square i: a blank asks for its letter first
  const put = (id: number, i: number, dir?: Dir) => {
    const t = rack.find((x) => x.id === id)
    if (!t) return
    if (t.b) {
      setBlank({ id, i, dir })
      return
    }
    place({ id, i, l: t.l }, dir)
  }

  const takeBack = () => {
    const p = pend.current
    const head = p.at(0)
    setPending([])
    forget()
    // Typing goes on from where the word began
    if (head && cur.current) setCursor({ i: head.i, dir: cur.current.dir })
  }

  const onSquare = (i: number) => {
    if (dragged.current || !mine || swapping) return
    const p = pendAt.get(i)
    if (p) {
      setPending(pend.current.filter((x) => x.id !== p.id))
      if (cur.current) setCursor({ i, dir: cur.current.dir })
      forget()
      blip('tap')
      return
    }
    if (sel !== null && !g.board[i]) {
      put(sel, i)
      return
    }
    // The cursor: across, then down, then off
    const c = cur.current
    setCursor(
      !c || c.i !== i
        ? { i, dir: 'across' }
        : c.dir === 'across'
          ? { i, dir: 'down' }
          : null,
    )
    forget()
    setSel(null)
  }

  const onRack = (id: number) => {
    if (dragged.current) return
    if (swapping) {
      setSwapping(
        swapping.includes(id)
          ? swapping.filter((x) => x !== id)
          : [...swapping, id],
      )
      blip('tap')
      return
    }
    if (!mine) return
    const c = cur.current
    if (c) {
      const i = nextFree(c.i, c.dir, byIndex(pend.current))
      if (i >= 0) {
        put(id, i, c.dir)
        return
      }
    }
    setSel(sel === id ? null : id)
    blip('tap')
  }

  const chooseBlank = (l: string) => {
    if (!blank) return
    place({ id: blank.id, i: blank.i, l }, blank.dir)
    setBlank(null)
  }

  // A letter typed: the rack's tile for it at the cursor, or a blank
  const typeKey = (k: string) => {
    if (blank) {
      if (ALPHABET.includes(k)) chooseBlank(k)
      return
    }
    if (!mine || swapping) return
    const c = cur.current
    if (!c) {
      setNote({ text: 'Trykk på ruten der ordet skal begynne, og skriv det.' })
      return
    }
    const p = pend.current
    const taken = byIndex(p)
    const used = new Set(p.map((x) => x.id))
    const free = rack.filter((t) => !used.has(t.id))
    // The second letter of a digraph tile laid for its first goes into it
    const o = owe.current
    owe.current = null
    if (o && taken.has(o.i) && k === o.rest) return
    // A digraph typed as its two letters is its one tile: C, H is CH, from
    // the rack's CH or else a blank
    const prev = typed.current
    if (prev && taken.get(prev.i)?.id === prev.id) {
      const two = prev.l + k
      if (DIGRAPHS.has(two)) {
        const id =
          free.find((t) => !t.b && t.l === two)?.id ??
          (blanks.has(prev.id) ? prev.id : free.find((t) => t.b)?.id)
        if (id !== undefined) {
          const now = { id, i: prev.i, l: two }
          setPending(p.map((x) => (x.id === prev.id ? now : x)))
          typed.current = now
          blip('tap')
          return
        }
      }
    }
    // Over a tile on the board, typing its letter goes on past it
    const there = g.board[c.i]?.t.l
    if (there) {
      if (there === k || (half.current === c.i && there === there[0] + k)) {
        forget()
        const j = nextFree(step(c.i, c.dir), c.dir, taken)
        setCursor(j >= 0 ? { i: j, dir: c.dir } : null)
        return
      }
      if (there.length > 1 && there.startsWith(k)) {
        half.current = c.i
        return
      }
    }
    const i = nextFree(c.i, c.dir, taken)
    if (i < 0) return
    // The letter's tile, else a blank, else a digraph that begins with it
    const t =
      free.find((x) => !x.b && x.l === k) ??
      free.find((x) => x.b) ??
      free.find((x) => x.l.length > 1 && x.l.startsWith(k))
    if (!t) {
      setNote({
        text:
          k === 'K' || k === 'W'
            ? 'K og W er ikke med i spansk Scrabble.'
            : `Du har ingen ${k} på holderen.`,
        bad: true,
      })
      return
    }
    const now = { id: t.id, i, l: t.b ? k : t.l }
    if (now.l.length > 1) owe.current = { i, rest: now.l.slice(1) }
    const next = [...p, now]
    setPending(next)
    typed.current = now
    half.current = null
    setNote(null)
    setSel(null)
    const j = nextFree(step(i, c.dir), c.dir, byIndex(next))
    setCursor(j >= 0 ? { i: j, dir: c.dir } : null)
    blip('tap')
  }

  const backspace = () => {
    if (!mine) return
    const p = pend.current
    const lastP = p.at(-1)
    if (!lastP) return
    setPending(p.slice(0, -1))
    setCursor({ i: lastP.i, dir: cur.current?.dir ?? 'across' })
    forget()
  }

  // --- Her turn ---

  const layWord = () => {
    if (!mine) return
    const p = pend.current
    if (!p.length) {
      setNote({ text: WHY.none })
      return
    }
    if (p.some((x) => !x.l)) return
    const placed = p.map((x) => ({ i: x.i, l: x.l, b: blanks.has(x.id) }))
    const r = lay(g.board, placed)
    if (!r.ok) {
      setNote({ text: WHY[r.why], bad: true })
      setShake((n) => n + 1)
      blip('wrong')
      return
    }
    const bad = unknown(r.words)
    if (bad.length) {
      // Kindly, and nothing lost: the tiles go back to try again
      const names = bad.map((w) => `«${spell(w.tiles)}»`).join(' og ')
      setNote({
        text:
          bad.length > 1
            ? `De ordene kjenner ikke Hola ennå: ${names}. Brikkene er tilbake på holderen.`
            : `Det ordet kjenner ikke Hola ennå: ${names}. Brikkene er tilbake på holderen.`,
        bad: true,
      })
      takeBack()
      setShake((n) => n + 1)
      blip('wrong')
      return
    }
    // Each word of hers laid is a word said, lightly (lib/palabras.ts)
    const c = credit(
      r.words,
      (id) => !!bank.cards[id],
      g.rec,
      tip ? { id: tip.id, shown: tip.shown } : undefined,
    )
    for (const s of c.said) record(s.id, true, s.weight, 'decir')
    if (c.meet.length) meet(c.meet)
    const next: Game = {
      ...play(g, p, r),
      rec: [...g.rec, ...c.said.map((s) => s.id), ...c.meet],
    }
    setPending([])
    setSel(null)
    setCursor(null)
    setTip(null)
    setNote(null)
    setPassing(false)
    forget()
    commit(next)
    blip('right')
    const words = r.words.map((w) => sayOf(w.key, bank))
    if (isOver(next)) {
      finish(next, words)
      return
    }
    const good = r.bingo || r.score >= 20
    setLine(good ? 'good' : 'think')
    herWords.current = talk(good ? [...words, LINES.good.es] : words)
  }

  const canSwap = g.bag.length >= RACK

  const startSwap = () => {
    if (!mine) return
    if (!canSwap) {
      setNote({ text: 'Posen har for få brikker igjen til å bytte.' })
      return
    }
    takeBack()
    setSel(null)
    setTip(null)
    setNote(null)
    setSwapping([])
  }

  const doSwap = () => {
    if (!mine || !swapping?.length) return
    const next = swap(g, swapping)
    setSwapping(null)
    setCursor(null)
    commit(next)
    blip('tap')
    herWords.current = Promise.resolve()
    if (isOver(next)) finish(next)
    else setLine('think')
  }

  const doPass = () => {
    if (!mine) return
    if (!passing) {
      setPassing(true)
      setTimeout(() => setPassing(false), 4000)
      return
    }
    setPassing(false)
    takeBack()
    setSel(null)
    setTip(null)
    setCursor(null)
    const next = pass(g)
    commit(next)
    herWords.current = Promise.resolve()
    if (isOver(next)) finish(next)
    else setLine('think')
  }

  const askTip = () => {
    if (!mine) return
    if (tip) {
      if (tip.shown) return
      setPending(tilesFor(rack, tip.move.cells))
      setTip({ ...tip, shown: true })
      setCursor(null)
      setSel(null)
      setNote(null)
      return
    }
    const h = hint(g, bank, Date.now())
    if (!h) {
      setNote({
        text: 'Ingen ord passer nå. Bytt noen brikker, eller stå over.',
      })
      return
    }
    setNote(null)
    setTip({ ...h, shown: false })
  }

  const shuffleRack = () => {
    if (!mine) return
    commit(arrange(g, shuffle(rack.map((t) => t.id))))
    blip('tap')
  }

  const stop = () => {
    commit({ ...g, stopped: true })
    onNew()
  }

  // --- Dragging ---

  // Where a tile is let go: a square, a place on the rack (-1 the rack
  // itself), or nowhere
  const targetAt = (
    x: number,
    y: number,
  ): { sq: number } | { slot: number } | null => {
    for (const el of document.elementsFromPoint(x, y)) {
      if (!(el instanceof HTMLElement)) continue
      if (el.dataset.sq) return { sq: Number(el.dataset.sq) }
      if (el.dataset.slot) return { slot: Number(el.dataset.slot) }
      if (el.dataset.rack !== undefined) return { slot: -1 }
    }
    return null
  }

  const onDown = (
    e: ReactPointerEvent<HTMLElement>,
    id: number,
    from: 'rack' | 'board',
  ) => {
    if (!mine || swapping || e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    grab.current = {
      id,
      from,
      x0: e.clientX,
      y0: e.clientY,
      moved: false,
      size: Math.max(r.width, 44),
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = grab.current
    if (!d) return
    const x = e.clientX
    const y = e.clientY
    if (!d.moved) {
      if (Math.hypot(x - d.x0, y - d.y0) < 7) return
      d.moved = true
      const l =
        d.from === 'board'
          ? (pend.current.find((p) => p.id === d.id)?.l ?? '')
          : (rack.find((t) => t.id === d.id)?.l ?? '')
      setHeld({ id: d.id, l, size: d.size, x, y })
    }
    const el = ghost.current
    if (el)
      el.style.transform = `translate(${x - d.size / 2}px, ${y - d.size / 2}px)`
    const t = targetAt(x, y)
    setOver(t && 'sq' in t ? t.sq : null)
  }

  const onUp = (e: ReactPointerEvent<HTMLElement>) => {
    const d = grab.current
    grab.current = null
    if (!d?.moved) return
    setHeld(null)
    setOver(null)
    dragged.current = true
    setTimeout(() => {
      dragged.current = false
    }, 0)
    const t = targetAt(e.clientX, e.clientY)
    const p = pend.current
    if (t && 'sq' in t) {
      const i = t.sq
      if (g.board[i] || p.some((x) => x.i === i && x.id !== d.id)) return
      if (d.from === 'board') {
        setPending(p.map((x) => (x.id === d.id ? { ...x, i } : x)))
        blip('tap')
      } else put(d.id, i)
      return
    }
    // Off the board, a tile laid goes back to the rack
    if (d.from === 'board') setPending(p.filter((x) => x.id !== d.id))
    if (t && 'slot' in t && t.slot >= 0) {
      const ids = rack.map((x) => x.id).filter((x) => x !== d.id)
      ids.splice(t.slot, 0, d.id)
      commit(arrange(g, ids))
    }
  }

  const onCancel = () => {
    grab.current = null
    setHeld(null)
    setOver(null)
  }

  const drag = (id: number, from: 'rack' | 'board') => ({
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => onDown(e, id, from),
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: onCancel,
  })

  // --- Keys ---

  useLetterKeys((k) => {
    if (card || stopping || done) return
    if (k === 'Enter') {
      if (swapping) doSwap()
      else layWord()
    } else if (k === 'Backspace') backspace()
    else typeKey(k)
  }, !done)

  const keys = useRef<(e: KeyboardEvent) => void>(() => {})
  useEffect(() => {
    keys.current = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Escape') {
        if (card) setCard(null)
        else if (blank) setBlank(null)
        else if (stopping) setStopping(false)
        else if (swapping) setSwapping(null)
        else if (pend.current.length) takeBack()
        else {
          setSel(null)
          setCursor(null)
          forget()
        }
        return
      }
      const arrow: Record<string, [Dir, 1 | -1] | undefined> = {
        ArrowRight: ['across', 1],
        ArrowLeft: ['across', -1],
        ArrowDown: ['down', 1],
        ArrowUp: ['down', -1],
      }
      const a = arrow[e.key]
      if (!a || !mine || card || blank || stopping) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select')) return
      e.preventDefault()
      const c = cur.current
      forget()
      if (!c) {
        setCursor({ i: CENTER, dir: a[0] })
        return
      }
      const j = step(c.i, a[0], a[1])
      setCursor({ i: j < 0 ? c.i : j, dir: a[0] })
    }
  })
  useEffect(() => {
    const on = (e: KeyboardEvent) => keys.current(e)
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  // --- The page ---

  const placed = pending.map((x) => ({ i: x.i, l: x.l, b: blanks.has(x.id) }))
  const preview =
    pending.length && pending.every((x) => x.l) ? lay(g.board, placed) : null
  const thinking = !done && toMove(g) === 1
  const mood = thinking
    ? 'think'
    : line === 'good' || line === 'won' || line === 'lost'
      ? 'glad'
      : 'calm'

  return (
    <div className={`pz-play ${done ? 'done' : ''}`}>
      <Top
        back={back}
        tools={
          <>
            <Dial g={g} />
            {!done && (
              <button
                type="button"
                className="pz-round small"
                aria-label="Avslutt partiet"
                onClick={() => setStopping(true)}
              >
                <RotateCcw />
              </button>
            )}
          </>
        }
      />
      <div className="pz-grid">
        <section className="pz-him" aria-label="El relojero">
          <div className="pz-wall">
            <Relojero mood={mood} />
          </div>
          <div className="pz-bubble" lang="es" aria-live="polite">
            <p>{LINES[line].es}</p>
            <p className="no" lang="nb">
              {LINES[line].no}
            </p>
          </div>
          <div className="pz-scores">
            <div className={`me ${mine ? 'on' : ''}`}>
              <span>Du</span>
              <b>{g.score[0]}</b>
            </div>
            <div className={`him ${thinking ? 'on' : ''}`}>
              <span>El relojero</span>
              <b>{g.score[1]}</b>
            </div>
          </div>
        </section>

        {done && end && (
          <End g={g} before={end.before} onNew={onNew} onOpen={setCard} />
        )}

        <section className="pz-table" aria-label="Brettet">
          <div className="pz-frame">
            <div
              className={`pz-board ${mine ? 'live' : ''} ${held ? 'dragging' : ''}`}
            >
              {range(SIZE * SIZE).map((i) => {
                const cell = g.board[i]
                const p = pendAt.get(i)
                const prem = PREMIUM[i]
                const here = cursor?.i === i && mine && !swapping
                const label = `${cell ? `${cell.t.l}, ` : p ? `${p.l}, lagt nå, ` : ''}rad ${rowOf(i) + 1}, kolonne ${colOf(i) + 1}${!cell && !p && prem ? `, ${PREMIUM_NAME[prem]}` : ''}`
                return (
                  <button
                    key={i}
                    type="button"
                    data-sq={i}
                    tabIndex={-1}
                    className={[
                      'pz-sq',
                      prem ? `p-${prem}` : '',
                      here ? 'cur' : '',
                      over === i && !cell ? 'over' : '',
                      p ? 'has' : '',
                    ].join(' ')}
                    aria-label={label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSquare(i)}
                    {...(p ? drag(p.id, 'board') : {})}
                  >
                    {cell ? (
                      <Face
                        l={cell.t.l}
                        blank={!!cell.t.b}
                        className={fresh.has(i) ? `fresh by${cell.by}` : ''}
                      />
                    ) : p ? (
                      <Face
                        l={p.l}
                        blank={blanks.has(p.id)}
                        className={`pending ${held?.id === p.id ? 'held' : ''}`}
                      />
                    ) : (
                      prem && <Mark p={prem} />
                    )}
                    {here && (
                      <i
                        className={`pz-arrow ${cursor.dir}`}
                        aria-hidden="true"
                      >
                        {cursor.dir === 'across' ? (
                          <ArrowRight />
                        ) : (
                          <ArrowDown />
                        )}
                      </i>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            key={shake}
            className={`pz-strip ${note?.bad ? 'bad' : ''} ${shake && note?.bad ? 'shake' : ''}`}
            aria-live="polite"
          >
            <Strip
              g={g}
              note={note?.text}
              tip={tip}
              preview={preview}
              mine={mine}
              onTip={askTip}
              onOpen={setCard}
            />
          </div>

          {!done && (
            <>
              <div
                className={`pz-rack ${swapping ? 'swapping' : ''}`}
                data-rack=""
                role="group"
                aria-label="Brikkene dine"
              >
                {rack.map((t, k) =>
                  out.has(t.id) ? (
                    <span key={t.id} className="pz-slot" data-slot={k} />
                  ) : (
                    <button
                      key={t.id}
                      type="button"
                      data-slot={k}
                      className={[
                        'pz-rtile',
                        sel === t.id ? 'sel' : '',
                        swapping?.includes(t.id) ? 'chosen' : '',
                        held?.id === t.id ? 'held' : '',
                      ].join(' ')}
                      aria-label={
                        t.b
                          ? 'Blank brikke'
                          : `${t.l}, ${VALUE[t.l] ?? 0} poeng`
                      }
                      aria-pressed={
                        swapping ? swapping.includes(t.id) : sel === t.id
                      }
                      disabled={!mine && !swapping}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onRack(t.id)}
                      {...drag(t.id, 'rack')}
                    >
                      <Face l={t.l} blank={!!t.b} />
                    </button>
                  ),
                )}
              </div>

              {swapping ? (
                <div className="pz-acts swap">
                  <p>Velg brikkene du vil bytte.</p>
                  <button
                    type="button"
                    className="pz-btn"
                    disabled={!swapping.length}
                    onClick={doSwap}
                  >
                    Bytt {swapping.length || ''}
                  </button>
                  <button
                    type="button"
                    className="pz-btn ghost"
                    onClick={() => setSwapping(null)}
                  >
                    Avbryt
                  </button>
                </div>
              ) : (
                <div className="pz-acts play">
                  {pending.length ? (
                    <Tool
                      icon={<Undo2 />}
                      label="Ta tilbake"
                      onClick={takeBack}
                      disabled={!mine}
                    />
                  ) : (
                    <Tool
                      icon={<Shuffle />}
                      label="Stokk"
                      onClick={shuffleRack}
                      disabled={!mine}
                    />
                  )}
                  <Tool
                    icon={<Repeat2 />}
                    label="Bytt"
                    onClick={startSwap}
                    disabled={!mine}
                  />
                  <Tool
                    icon={<SkipForward />}
                    label={passing ? 'Sikker?' : 'Stå over'}
                    onClick={doPass}
                    disabled={!mine}
                    className={passing ? 'warn' : ''}
                  />
                  <Tool
                    icon={<Lightbulb />}
                    label="Tips"
                    onClick={askTip}
                    disabled={!mine || !!tip?.shown}
                  />
                  <button
                    type="button"
                    className="pz-btn lay"
                    disabled={!mine || !pending.length}
                    onClick={layWord}
                  >
                    <Check /> Legg ordet
                  </button>
                </div>
              )}
              <p className="pz-help">
                {mine ? (
                  <>
                    Trykk på en brikke og så på en rute, eller dra den.{' '}
                    <span className="keys">
                      Med tastaturet: trykk på ruten der ordet begynner, og
                      skriv.
                    </span>
                  </>
                ) : (
                  'El relojero tenker …'
                )}
              </p>
            </>
          )}
        </section>

        <Log g={g} onOpen={setCard} />
        <Legend bag={g.bag.length} />
      </div>

      {card && <WordCard k={card} onClose={() => setCard(null)} />}
      {blank && (
        <BlankPicker onPick={chooseBlank} onCancel={() => setBlank(null)} />
      )}
      {stopping && (
        <Veil onClose={() => setStopping(false)} label="Avslutte partiet?">
          <h3>Avslutte partiet?</h3>
          <p>Det blir ikke regnet med. Ordene du har lagt, er øvd likevel.</p>
          <div className="pz-acts">
            <button type="button" className="pz-btn" onClick={stop}>
              Avslutt partiet
            </button>
            <button
              type="button"
              className="pz-btn ghost"
              onClick={() => setStopping(false)}
            >
              Spill videre
            </button>
          </div>
        </Veil>
      )}
      {held && (
        <div
          ref={ghost}
          className="pz-ghost"
          style={{
            width: held.size,
            height: held.size,
            fontSize: held.size * 0.62,
            transform: `translate(${held.x - held.size / 2}px, ${held.y - held.size / 2}px)`,
          }}
          aria-hidden="true"
        >
          <Face l={held.l} blank={blanks.has(held.id)} />
        </div>
      )}
    </div>
  )
}

function Tool({
  icon,
  label,
  onClick,
  disabled = false,
  className = '',
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      className={`pz-tool ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// --- The tiles and the squares ---

// A tile's face, cut like wood type: its letter, and its points
function Face({
  l,
  blank = false,
  className = '',
}: {
  l: string
  blank?: boolean
  className?: string
}) {
  return (
    <span
      className={`pz-tile ${blank ? 'blank' : ''} ${l.length > 1 ? 'two' : ''} ${className}`}
    >
      <b>{l}</b>
      {!blank && <small>{VALUE[l] ?? 0}</small>}
    </span>
  )
}

const PREMIUM_NAME: Record<NonNullable<Premium>, string> = {
  TP: 'triple palabra',
  DP: 'doble palabra',
  TL: 'triple letra',
  DL: 'doble letra',
  star: 'stjernen, doble palabra',
}

// A premium square's print, in Spanish: its initials, or its name where
// the board is large enough
function Mark({ p }: { p: NonNullable<Premium> }) {
  if (p === 'star')
    return (
      <span className="pz-mark star" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 2.5l2.7 6.2 6.8.6-5.2 4.5 1.6 6.6L12 16.9l-5.9 3.5 1.6-6.6-5.2-4.5 6.8-.6Z" />
        </svg>
      </span>
    )
  const [a, b] = PREMIUM_NAME[p].split(' ')
  return (
    <span className="pz-mark" aria-hidden="true">
      <span className="short">{p}</span>
      <span className="long">
        {a}
        <br />
        {b}
      </span>
    </span>
  )
}

// --- What the strip under the board says ---

function Strip({
  g,
  note,
  tip,
  preview,
  mine,
  onTip,
  onOpen,
}: {
  g: Game
  note?: string
  tip: Tip | null
  preview: ReturnType<typeof lay> | null
  mine: boolean
  onTip: () => void
  onOpen: (k: string) => void
}) {
  const { bank } = useStore()
  if (note) return <p className="pz-note">{note}</p>
  if (tip && mine) {
    const e = DICT.get(tip.move.words[0].key)
    const f = e?.forms.find((x) => x.w.id === tip.id) ?? e?.forms.at(0)
    const means = f ? glossOf(f) : ''
    if (tip.shown)
      return (
        <p className="pz-note">
          Der er det: <b lang="es">{f?.say}</b>, {means}. Trykk på «Legg ordet».
        </p>
      )
    return (
      <>
        <p className="pz-note">
          {tip.met
            ? `Du kan legge et ord som betyr «${means}».`
            : `Ingen av ordene dine passer, men Hola kjenner et som betyr «${means}».`}
        </p>
        <button type="button" className="pz-btn ghost small" onClick={onTip}>
          Vis ordet
        </button>
      </>
    )
  }
  if (preview && mine) {
    if (!preview.ok) return <p className="pz-note quiet">{WHY[preview.why]}</p>
    return (
      <p className="pz-note">
        <span className="pz-spell" lang="es">
          {preview.words.map((w) => spell(w.tiles)).join(' · ')}
        </span>{' '}
        <em>{preview.score} poeng</em>
        {preview.bingo && (
          <span className="pz-bingo"> Alle sju: 50 ekstra!</span>
        )}
      </p>
    )
  }
  const t = g.log.at(-1)
  if (!t)
    return (
      <p className="pz-note quiet">
        Det første ordet legges over stjernen i midten. Du begynner.
      </p>
    )
  return <TurnLine t={t} bank={bank} onOpen={onOpen} />
}

function TurnLine({
  t,
  bank,
  onOpen,
}: {
  t: Turn
  bank: Bank
  onOpen: (k: string) => void
}) {
  const who = t.by === 0 ? 'Du' : 'El relojero'
  if (t.kind !== 'play')
    return (
      <p className="pz-note quiet">
        {who} {t.kind === 'swap' ? `byttet ${t.n ?? 0} brikker.` : 'sto over.'}
      </p>
    )
  return (
    <div className="pz-turn">
      <span className={`who by${t.by}`}>{who}</span>
      {(t.words ?? []).map((w) => (
        <Chip key={w.key} k={w.key} bank={bank} onOpen={onOpen} />
      ))}
      <em>{t.score} poeng</em>
    </div>
  )
}

// A word played, in Spanish with its meaning: a tap says it and opens it
function Chip({
  k,
  bank,
  onOpen,
  score,
}: {
  k: string
  bank: Bank
  onOpen: (k: string) => void
  score?: number
}) {
  const e = DICT.get(k)
  const f = e ? formsFor(e, bank).at(0) : undefined
  if (!f) return <span className="pz-chip">{k.split('.').join('')}</span>
  return (
    <button
      type="button"
      className="pz-chip"
      onClick={() => {
        void say(f.say)
        onOpen(k)
      }}
    >
      <b lang="es">{f.say}</b>
      <span>{glossOf(f)}</span>
      {score !== undefined && <em>{score}</em>}
    </button>
  )
}

// --- The side of the page ---

function Log({ g, onOpen }: { g: Game; onOpen: (k: string) => void }) {
  const { bank } = useStore()
  const turns = g.log.map((t, k) => ({ t, k })).reverse()
  return (
    <section className="pz-log" aria-label="Trekkene">
      <h3>
        Trekkene{' '}
        <span>
          {Math.min(g.log.length, TURNS)} av {TURNS}
        </span>
      </h3>
      {turns.length ? (
        <ol>
          {turns.map(({ t, k }) => (
            <li key={k} className={`by${t.by}`}>
              <i>{k + 1}</i>
              <span className="who">{t.by === 0 ? 'Du' : 'El relojero'}</span>
              <span className="what">
                {t.kind === 'play' ? (
                  (t.words ?? []).map((w) => (
                    <Chip
                      key={w.key}
                      k={w.key}
                      bank={bank}
                      onOpen={onOpen}
                      score={w.score}
                    />
                  ))
                ) : (
                  <span className="none">
                    {t.kind === 'swap'
                      ? `byttet ${t.n ?? 0} brikker`
                      : 'sto over'}
                  </span>
                )}
              </span>
              <em>{t.score}</em>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty">Ingen trekk ennå.</p>
      )}
    </section>
  )
}

function Legend({ bag }: { bag: number }) {
  return (
    <section className="pz-legend" aria-label="Rutene">
      <ul>
        {(['TP', 'DP', 'TL', 'DL'] as const).map((p) => (
          <li key={p}>
            <i className={`p-${p}`}>{p}</i>
            <span>
              <b lang="es">{PREMIUM_NAME[p]}</b> ·{' '}
              {p === 'TP'
                ? 'ordet teller tre ganger'
                : p === 'DP'
                  ? 'ordet teller to ganger, også stjernen'
                  : p === 'TL'
                    ? 'bokstaven teller tre ganger'
                    : 'bokstaven teller to ganger'}
            </span>
          </li>
        ))}
      </ul>
      <p>
        Alle sju brikkene i ett trekk gir 50 ekstra. CH, LL og RR er én brikke
        hver, og to L-er blir aldri LL. Den blanke brikken kan være hvilken som
        helst av de andre brikkene, men er verdt null. {bag} brikker igjen i
        posen.
      </p>
    </section>
  )
}

function End({
  g,
  before,
  onNew,
  onOpen,
}: {
  g: Game
  before: number
  onNew: () => void
  onOpen: (k: string) => void
}) {
  const { bank } = useStore()
  // In sight, wherever the page was scrolled to
  const box = useRef<HTMLElement>(null)
  useEffect(() => {
    box.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])
  const [me, him] = g.score
  const res: LineId = me > him ? 'won' : me < him ? 'lost' : 'tie'
  const best = Math.max(before, me)
  const words = (by: 0 | 1) =>
    g.log.flatMap((t) =>
      t.by === by && t.kind === 'play' ? (t.words ?? []) : [],
    )
  return (
    <section ref={box} className="pz-end" aria-live="polite">
      <p className="kick" lang="es">
        Fin de la partida
      </p>
      <h2>
        <span>Du {me}</span> <i>–</i> <span>{him} El relojero</span>
      </h2>
      <p className="res">
        {res === 'won'
          ? 'Du vant!'
          : res === 'lost'
            ? 'El relojero vant denne gangen.'
            : 'Uavgjort.'}{' '}
        {me > before && before > 0
          ? `Ny rekord! Den forrige var ${before}.`
          : me >= best && me > 0
            ? 'Din beste hittil.'
            : `Din beste: ${best}.`}
      </p>
      <div className="pz-words">
        <div>
          <h3>Dine ord</h3>
          {words(0).map((w, k) => (
            <Chip
              key={k}
              k={w.key}
              bank={bank}
              onOpen={onOpen}
              score={w.score}
            />
          ))}
        </div>
        <div>
          <h3>Ordene til El relojero</h3>
          {words(1).map((w, k) => (
            <Chip
              key={k}
              k={w.key}
              bank={bank}
              onOpen={onOpen}
              score={w.score}
            />
          ))}
        </div>
      </div>
      <div className="pz-acts">
        <TodayNext page="palabras" className="pz-btn" />
        <button type="button" className="pz-btn" onClick={onNew}>
          Nytt parti
        </button>
        <a className="pz-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// --- Dialogs ---

function Veil({
  label,
  onClose,
  children,
  className = '',
}: {
  label: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className="pz-veil" onClick={onClose}>
      <div
        className={`pz-card ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="pz-x"
          aria-label="Lukk"
          onClick={onClose}
        >
          <X />
        </button>
        {children}
      </div>
    </div>
  )
}

// A word of the board, as Hola knows it: every word of the bank it can be
// (te, el té), said, with its meaning, and one not met yet to learn
function WordCard({ k, onClose }: { k: string; onClose: () => void }) {
  const { bank, levelOf, meet } = useStore()
  const e = DICT.get(k)
  if (!e) return null
  const forms = formsFor(e, bank)
  return (
    <Veil label={spell(e.tiles)} onClose={onClose} className="word">
      <div className="pz-card-tiles" aria-hidden="true">
        {e.tiles.map((l, i) => (
          <Face key={i} l={l} />
        ))}
      </div>
      {forms.map((f) => {
        const lv = levelOf(f.w.id)
        return (
          <div key={`${f.w.id}|${f.form}`} className="pz-form">
            <p className="es">
              <b lang="es">{f.say}</b>
              <Speak text={f.say} small label={`Hør ${f.say}`} />
            </p>
            <p className="gloss">{glossOf(f)}</p>
            {lv === 0 ? (
              <button
                type="button"
                className="pz-btn ghost small"
                onClick={() => meet([f.w.id])}
              >
                Lær dette ordet
              </button>
            ) : (
              <span className="lv">{lv === 1 ? 'Øver på' : 'Kjent'}</span>
            )}
          </div>
        )
      })}
    </Veil>
  )
}

function BlankPicker({
  onPick,
  onCancel,
}: {
  onPick: (l: string) => void
  onCancel: () => void
}) {
  return (
    <Veil label="Den blanke brikken" onClose={onCancel} className="blank">
      <h3>Hvilken bokstav skal den blanke brikken være?</h3>
      <div className="pz-letters">
        {ALPHABET.map((l) => (
          <button
            key={l}
            type="button"
            aria-label={l}
            onClick={() => onPick(l)}
          >
            <Face l={l} blank />
          </button>
        ))}
      </div>
    </Veil>
  )
}

// --- The clock and the watchmaker ---

// The bottom of a round rim gone a little soft, as if warm (a nod to
// Dalí's watches, none of them copied)
const SOFT =
  'M8 31C8 17 18 7 32 7C46 7 56 17 56 31C56 41 53 48 48 53C44 57 39 61 32 61C25 61 21 58 17 53C11 48 8 41 8 31Z'

// The twelve turns as the hours of a dial: each hour a turn played, in
// her colour or his, and the hand at the turn now
function Dial({ g }: { g: Game }) {
  const n = Math.min(g.log.length, TURNS)
  const at = (k: number, r: number) => {
    const a = ((k * 30 - 90) * Math.PI) / 180
    return [32 + r * Math.cos(a), 32 + r * Math.sin(a)]
  }
  const [hx, hy] = at(n, 17)
  return (
    <svg
      className="pz-dial"
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Trekk ${Math.min(n + 1, TURNS)} av ${TURNS}`}
    >
      <path d={SOFT} fill="#f6eedb" stroke="#221a14" strokeWidth="2.6" />
      {range(TURNS).map((k) => {
        const [x, y] = at(k + 1, 19)
        const t = g.log.at(k)
        return (
          <circle
            key={k}
            cx={x}
            cy={y + (k >= 3 && k <= 7 ? 1.4 : 0)}
            r={t ? 3.4 : 2}
            fill={t ? (t.by === 0 ? '#b4412f' : '#35628d') : '#221a14'}
            opacity={t ? 1 : 0.45}
          />
        )
      })}
      <path
        d={`M32 32L${hx.toFixed(1)} ${hy.toFixed(1)}`}
        stroke="#221a14"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="2.8" fill="#221a14" />
    </svg>
  )
}

// El relojero, in clean line: an old watchmaker, bald with white tufts and
// a white moustache, a loupe in one eye, a bow tie and a waistcoat with a
// watch chain, and a wall clock behind him gone soft at the bottom
function Relojero({ mood = 'calm' }: { mood?: 'calm' | 'think' | 'glad' }) {
  const line = {
    stroke: '#1c1714',
    strokeWidth: 2.4,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }
  return (
    <svg
      className={`pz-relojero ${mood}`}
      viewBox="0 0 200 200"
      aria-hidden="true"
    >
      <g {...line}>
        {/* The wall clock, its rim slack at the bottom */}
        <path
          d="M122 50C122 29 139 14 160 14C181 14 198 29 198 50C198 67 193 80 184 89C177 96 171 105 160 106C149 107 142 97 135 89C127 81 122 68 122 50Z"
          fill="#c99a3b"
        />
        <path
          d="M130 50C130 33 143 21 160 21C177 21 190 33 190 50C190 64 186 74 178 82C172 88 167 96 160 97C152 98 147 90 141 83C134 76 130 65 130 50Z"
          fill="#f7efd9"
        />
        <g strokeWidth="2">
          <path d="M160 25V30M186 50H181M134 50H139M160 92V87" />
          <path
            d="M173 28L171 32M183 38L179 40M147 28L149 32M137 38L141 40M178 70L174 68M142 70L146 68"
            strokeWidth="1.6"
          />
        </g>
        <path className="hand-h" d="M160 52L149 44" strokeWidth="3.2" />
        <path className="hand-m" d="M160 52L172 34" strokeWidth="2.4" />
        <circle cx="160" cy="52" r="2.8" fill="#1c1714" />

        {/* Shoulders: a waistcoat over a white shirt */}
        <path
          d="M26 200C28 170 48 155 80 149H120C152 155 172 170 174 200Z"
          fill="#9c6a36"
        />
        <path d="M82 149L100 182L118 149Z" fill="#fbf8f1" />
        <path d="M82 149L96 190M118 149L104 190" fill="none" />
        <circle cx="100" cy="190" r="2.4" fill="#1c1714" stroke="none" />
        <path
          d="M70 180C80 191 98 194 116 188"
          fill="none"
          stroke="#c99a3b"
          strokeWidth="3"
        />
        <path
          d="M114 186C114 181 118 178 123 178C128 178 131 181 131 186C131 190 129 193 126 194C124 196 121 196 119 195C116 193 114 190 114 186Z"
          fill="#e7c46a"
        />
        {/* Neck and bow tie */}
        <path d="M88 132V150H112V132Z" fill="#efc29c" />
        <path d="M100 151L84 143V159ZM100 151L116 143V159Z" fill="#b4412f" />
        <circle cx="100" cy="151" r="4.2" fill="#b4412f" />

        {/* Ears, head */}
        <ellipse cx="66" cy="101" rx="7" ry="10" fill="#efc29c" />
        <ellipse cx="134" cy="101" rx="7" ry="10" fill="#efc29c" />
        <ellipse cx="100" cy="97" rx="34" ry="39" fill="#f3cba6" />
        <path
          d="M83 66C89 61 96 60 102 61"
          fill="none"
          stroke="#fff6e8"
          strokeWidth="3.4"
        />
        {/* White tufts over the ears */}
        <path
          d="M68 96C59 93 56 82 61 75C64 70 71 69 76 73C72 79 72 88 68 96Z"
          fill="#f8f5ee"
        />
        <path
          d="M132 96C141 93 144 82 139 75C136 70 129 69 124 73C128 79 128 88 132 96Z"
          fill="#f8f5ee"
        />
        {/* Cheeks */}
        <circle
          cx="79"
          cy="113"
          r="6"
          fill="#ec9c88"
          opacity=".5"
          stroke="none"
        />
        <circle
          cx="121"
          cy="113"
          r="6"
          fill="#ec9c88"
          opacity=".5"
          stroke="none"
        />

        {/* Brows: the free one goes up when he thinks */}
        <path d="M72 84C76 76 88 75 95 80C89 81 81 82 72 84Z" fill="#f8f5ee" />
        <path
          className="brow"
          d="M128 84C124 76 112 75 105 80C111 81 119 82 128 84Z"
          fill="#f8f5ee"
        />
        {/* The loupe, and his eye large behind it */}
        <circle cx="86" cy="97" r="13.5" fill="#2b2622" />
        <circle cx="86" cy="97" r="9.5" fill="#cfe5ee" strokeWidth="1.6" />
        <circle
          className="eye-l"
          cx="87"
          cy="98"
          r="4.6"
          fill="#1c1714"
          stroke="none"
        />
        <circle cx="83.5" cy="94" r="1.8" fill="#fff" stroke="none" />
        {/* The other eye */}
        <ellipse
          className="eye-r"
          cx="114"
          cy="98"
          rx="2.8"
          ry="3.4"
          fill="#1c1714"
          stroke="none"
        />
        {/* Nose and moustache */}
        <ellipse cx="102" cy="111" rx="8" ry="7" fill="#eaa48c" />
        <path
          d="M75 126C79 115 92 114 101 119C110 114 123 115 127 126C129 132 122 134 117 130C111 126 106 127 101 127C96 127 91 126 85 130C80 134 73 132 75 126Z"
          fill="#f8f5ee"
        />
        <path
          className="mouth"
          d={
            mood === 'glad'
              ? 'M93 132C97 138 106 138 110 132'
              : 'M95 133C99 135 104 135 108 133'
          }
          fill="none"
        />
      </g>
    </svg>
  )
}
