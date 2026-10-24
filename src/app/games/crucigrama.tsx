import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Delete,
  Timer,
} from 'lucide-react'
import { WORDS, article, isClue, meaning } from '../data/words'
import { due } from '../lib/bank'
import { build, squares } from '../lib/crossword'
import { blip } from '../lib/sound'
import { useStore } from '../lib/store'
import { NEEDS, clueCount } from '../lib/today'
import { TodayNext, useBack } from '../daily'
import { Es, KEY_ROWS, LinkIcon, Speak, useFont, useLetterKeys } from '../ui'
import type { Bank } from '../lib/bank'
import type { Dir, Entry, Puzzle } from '../lib/crossword'
import './crucigrama.css'

// Mini crucigrama: a small crossword of the words met, those whose saying
// has faded most. The clues are their meanings in Norwegian, so filling it
// in is saying the Spanish (decir). In the dusk of Dalí's Destino.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Italiana&family=Nunito:wght@400;600;700;800&display=swap'

const make = (bank: Bank): Puzzle | null => {
  const words = due(bank, Date.now(), WORDS, 'decir')
    .map((d) => d.w)
    .filter(isClue)
  return words.length >= NEEDS.crucigrama ? build(words) : null
}

export default function Crucigrama() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('crucigrama')
  const [round, setRound] = useState(() => ({ n: 0, p: make(bank) }))

  return (
    <div className="d4">
      <div className="d4-col">
        {round.p ? (
          <Board
            key={round.n}
            p={round.p}
            back={back}
            onAgain={() => setRound((r) => ({ n: r.n + 1, p: make(bank) }))}
          />
        ) : (
          <TooFew back={back} />
        )}
      </div>
    </div>
  )
}

function Top({ back, time }: { back: string; time?: string }) {
  return (
    <header className="d4-top">
      <a className="d4-round" href={back} aria-label="Tilbake">
        <ArrowLeft />
      </a>
      <h1>
        Crucigrama<small>Kryssord av ordene dine</small>
      </h1>
      {time && (
        <span className="d4-time" aria-label="Tid">
          <Timer aria-hidden="true" />
          {time}
        </span>
      )}
    </header>
  )
}

function TooFew({ back }: { back: string }) {
  const { bank } = useStore()
  const clues = clueCount(bank)
  return (
    <>
      <Top back={back} />
      <section className="d4-glass d4-card">
        <p className="kick">Ikke ennå</p>
        <h2>Ordene trengs først</h2>
        <p>
          Kryssordet lages av ordene du har møtt, og det trengs minst{' '}
          {NEEDS.crucigrama} som kan stå i et kryssord for at de skal krysse
          hverandre. Hilsener og uttrykk kan ikke det. Du har {clues}.
        </p>
        <div className="acts">
          <a className="d4-btn" href="#nuevas">
            Lær nye ord
          </a>
          <a className="d4-link" href="#">
            Til forsiden
          </a>
        </div>
      </section>
    </>
  )
}

const cellKey = (r: number, c: number) => `${r},${c}`

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function Board({
  p,
  back,
  onAgain,
}: {
  p: Puzzle
  back: string
  onAgain: () => void
}) {
  const { record, played, points } = useStore()
  const entries = p.entries
  // The entries each square is part of, across and down
  const byCell = useMemo(() => {
    const m = new Map<string, Partial<Record<Dir, number>>>()
    entries.forEach((e, i) => {
      for (const [r, c] of squares(e)) {
        const k = cellKey(r, c)
        m.set(k, { ...m.get(k), [e.dir]: i })
      }
    })
    return m
  }, [entries])
  const order = useMemo(
    () => [
      ...entries.flatMap((e, i) => (e.dir === 'a' ? [i] : [])),
      ...entries.flatMap((e, i) => (e.dir === 'd' ? [i] : [])),
    ],
    [entries],
  )

  const first = entries[order[0]]
  const [fill, setFill] = useState<Record<string, string>>({})
  const [at, setAt] = useState<[number, number]>([first.row, first.col])
  const [dir, setDir] = useState<Dir>(first.dir)
  const [solved, setSolved] = useState<Array<number>>([])
  // Entries helped with a letter, and got wrong once
  const [hinted, setHinted] = useState<Array<number>>([])
  const [missed, setMissed] = useState<Array<number>>([])
  // Squares shown by a hint, or by giving up
  const [shown, setShown] = useState<Array<string>>([])
  const [shake, setShake] = useState<number | null>(null)
  const [start] = useState(() => Date.now())
  const [end, setEnd] = useState<number | null>(null)
  const [gaveUp, setGaveUp] = useState(false)
  const [tick, setTick] = useState(() => Date.now())

  useEffect(() => {
    if (end) return
    const t = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(t)
  }, [end])

  useEffect(() => {
    if (shake === null) return
    const t = setTimeout(() => setShake(null), 450)
    return () => clearTimeout(t)
  }, [shake])

  const here = byCell.get(cellKey(...at)) ?? {}
  const cur = here[dir] ?? here[dir === 'a' ? 'd' : 'a'] ?? order[0]
  const e = entries[cur]
  const curCells = new Set(squares(e).map(([r, c]) => cellKey(r, c)))

  const locked = (k: string, solvedNow = solved) =>
    shown.includes(k) ||
    Object.values(byCell.get(k) ?? {}).some((i) => solvedNow.includes(i))

  const select = (i: number, f = fill) => {
    const x = entries[i]
    const cells = squares(x)
    const empty = cells.find(([r, c]) => !f[cellKey(r, c)]) ?? cells[0]
    setDir(x.dir)
    setAt(empty)
  }

  // The next entry not yet solved, after this one
  const nextOpen = (from: number, solvedNow: Array<number>, step = 1) => {
    const j = order.indexOf(from)
    for (let k = 1; k <= order.length; k++) {
      const i = order[(j + step * k + order.length * 2) % order.length]
      if (!solvedNow.includes(i)) return i
    }
    return null
  }

  const finish = (solvedNow: Array<number>, quit: boolean) => {
    setEnd(Date.now())
    played('crucigrama')
    if (!quit) {
      points(solvedNow.length)
      setTimeout(() => blip('win'), 300)
    }
  }

  // The letters filled in checked: entries now full and right are solved,
  // and the one being written, if full and wrong, is wrong
  const check = (f: Record<string, string>, typed: string, writing: number) => {
    let got = solved
    for (const i of Object.values(byCell.get(typed) ?? {})) {
      if (got.includes(i)) continue
      const x = entries[i]
      const word = squares(x)
        .map(([r, c]) => f[cellKey(r, c)] ?? '')
        .join('')
      if (word.length < x.answer.length) continue
      if (word === x.answer) {
        got = [...got, i]
        const weight = hinted.includes(i) ? 0.3 : missed.includes(i) ? 0.5 : 0.9
        record(x.word.id, true, weight, 'decir')
      } else if (i === writing) {
        setShake(i)
        blip('wrong')
        if (!missed.includes(i)) {
          setMissed([...missed, i])
          record(x.word.id, false, 0.5, 'decir')
        }
      }
    }
    if (got === solved) return null
    setSolved(got)
    if (got.length === entries.length) finish(got, false)
    else blip('right')
    return got
  }

  const type = (k: string) => {
    const cells = squares(e).map(([r, c]) => cellKey(r, c))
    const from = Math.max(0, cells.indexOf(cellKey(...at)))
    const target = [...cells.slice(from), ...cells.slice(0, from)].find(
      (x) => !locked(x),
    )
    if (!target) return
    const f = { ...fill, [target]: k }
    setFill(f)
    const got = check(f, target, cur)
    if (got?.includes(cur)) {
      const next = nextOpen(cur, got)
      if (next !== null) select(next, f)
      return
    }
    // On to the next square still empty in the entry, or else the next
    const t = cells.indexOf(target)
    const rest = cells.slice(t + 1).filter((x) => !locked(x, got ?? solved))
    const go = rest.find((x) => !f[x]) ?? rest.at(0)
    if (go) setAt(go.split(',').map(Number) as [number, number])
  }

  const erase = () => {
    const cells = squares(e).map(([r, c]) => cellKey(r, c))
    const k = cellKey(...at)
    if (!locked(k) && fill[k]) {
      setFill({ ...fill, [k]: '' })
      return
    }
    const i = cells.indexOf(k)
    const prev = cells
      .slice(0, Math.max(0, i))
      .reverse()
      .find((x) => !locked(x))
    if (!prev) return
    setFill({ ...fill, [prev]: '' })
    setAt(prev.split(',').map(Number) as [number, number])
  }

  // A letter of the entry given: the first square empty or wrong
  const hint = () => {
    if (end || solved.includes(cur)) return
    const cells = squares(e)
    const n = cells.findIndex(([r, c], i) => {
      const k = cellKey(r, c)
      return !locked(k) && fill[k] !== e.answer[i]
    })
    if (n < 0) return
    const k = cellKey(...cells[n])
    const f = { ...fill, [k]: e.answer[n] }
    blip('tap')
    setFill(f)
    setShown([...shown, k])
    if (!hinted.includes(cur)) setHinted([...hinted, cur])
    const got = check(f, k, -1)
    if (got?.includes(cur)) {
      const next = nextOpen(cur, got)
      if (next !== null) select(next, f)
    } else setAt(cells[n])
  }

  // Every answer shown; those not solved count as not said
  const giveUp = () => {
    const f = { ...fill }
    for (const x of entries)
      squares(x).forEach(([r, c], n) => {
        f[cellKey(r, c)] = x.answer[n]
      })
    entries.forEach((x, i) => {
      if (!solved.includes(i) && !missed.includes(i))
        record(x.word.id, false, 0.5, 'decir')
    })
    setFill(f)
    setShown([...shown, ...Object.keys(f).filter((k) => !locked(k))])
    setGaveUp(true)
    finish(solved, true)
  }

  const onKey = (k: string) => {
    if (end) return
    if (k === 'Backspace') erase()
    else if (k === 'Enter') {
      const next = nextOpen(cur, solved)
      if (next !== null) select(next)
    } else type(k)
  }
  useLetterKeys(onKey, !end)

  // Arrows move between squares, Tab between clues, ? gives a letter
  useEffect(() => {
    if (end) return
    const move: Record<string, [number, number, Dir]> = {
      ArrowLeft: [0, -1, 'a'],
      ArrowRight: [0, 1, 'a'],
      ArrowUp: [-1, 0, 'd'],
      ArrowDown: [1, 0, 'd'],
    }
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return
      if (ev.key === '?') {
        ev.preventDefault()
        hint()
        return
      }
      if (ev.key === 'Tab') {
        ev.preventDefault()
        const next = nextOpen(cur, solved, ev.shiftKey ? -1 : 1)
        if (next !== null) select(next)
        return
      }
      const m = move[ev.key] as [number, number, Dir] | undefined
      if (!m) return
      ev.preventDefault()
      const [dr, dc, d] = m
      let [r, c] = at
      let found: [number, number] = at
      for (;;) {
        r += dr
        c += dc
        if (r < 0 || c < 0 || r >= p.rows || c >= p.cols) break
        if (p.cells[r][c]) {
          found = [r, c]
          break
        }
      }
      setAt(found)
      if (byCell.get(cellKey(...found))?.[d] !== undefined) setDir(d)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const tap = (r: number, c: number) => {
    if (end) return
    const k = cellKey(r, c)
    const has = byCell.get(k) ?? {}
    if (k === cellKey(...at)) {
      const other = dir === 'a' ? 'd' : 'a'
      if (has[other] !== undefined) setDir(other)
      return
    }
    setAt([r, c])
    if (has[dir] === undefined) setDir(dir === 'a' ? 'd' : 'a')
  }

  const numbers = new Map(entries.map((x) => [cellKey(x.row, x.col), x.n]))
  const time = clock((end ?? tick) - start)
  const done = end !== null

  return (
    <>
      <Top back={back} time={time} />
      <div className="d4-play">
        <div className="d4-left">
          <div
            className="d4-grid"
            style={{
              gridTemplateColumns: `repeat(${p.cols}, minmax(0, 1fr))`,
              ['--c' as string]: p.cols,
              ['--r' as string]: p.rows,
            }}
            role="grid"
            aria-label={`Kryssord, ${p.rows} ganger ${p.cols}`}
          >
            {p.cells.flatMap((row, r) =>
              row.map((letter, c) => {
                const k = cellKey(r, c)
                if (!letter) return <span key={k} className="k" />
                const ids = Object.values(byCell.get(k) ?? {})
                const ok = ids.some((i) => solved.includes(i))
                const cls = [
                  !done && curCells.has(k) ? 'w' : '',
                  !done && k === cellKey(...at) ? 'at' : '',
                  ok ? 'done' : '',
                  shown.includes(k) ? 'shown' : '',
                  shake !== null &&
                  squares(entries[shake]).some(([a, b]) => cellKey(a, b) === k)
                    ? 'bad'
                    : '',
                ].join(' ')
                return (
                  <button
                    key={k}
                    type="button"
                    className={cls}
                    onClick={() => tap(r, c)}
                    aria-label={`Rute ${r + 1}, ${c + 1}${fill[k] ? `: ${fill[k]}` : ''}`}
                  >
                    {numbers.has(k) && <sup>{numbers.get(k)}</sup>}
                    {fill[k]}
                  </button>
                )
              }),
            )}
          </div>
          {!done && <Keys onKey={onKey} onHint={hint} />}
        </div>

        <div className="d4-right">
          {done ? (
            <Result
              p={p}
              solved={solved}
              gaveUp={gaveUp}
              time={time}
              onAgain={onAgain}
            />
          ) : (
            <>
              <Clue
                e={e}
                onPrev={() => {
                  const i = nextOpen(cur, solved, -1)
                  if (i !== null) select(i)
                }}
                onNext={() => {
                  const i = nextOpen(cur, solved)
                  if (i !== null) select(i)
                }}
              />
              <div className="d4-list">
                {(['a', 'd'] as const).map((d) => (
                  <div key={d}>
                    <h2>{d === 'a' ? 'Vannrett' : 'Loddrett'}</h2>
                    {order
                      .filter((i) => entries[i].dir === d)
                      .map((i) => (
                        <button
                          key={i}
                          type="button"
                          className={`${solved.includes(i) ? 'ok' : ''} ${i === cur ? 'on' : ''}`}
                          onClick={() => select(i)}
                        >
                          <b>{entries[i].n}</b>
                          {meaning(entries[i].word)}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
              <p className="d4-help">
                Skriv på spansk, uten aksenter. Trykk på en rute to ganger for å
                snu retningen, og på <b>?</b> for en bokstav.{' '}
                <button type="button" className="d4-link" onClick={giveUp}>
                  Vis svarene
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// The clue being answered, with the way to the one before and after
function Clue({
  e,
  onPrev,
  onNext,
}: {
  e: Entry
  onPrev: () => void
  onNext: () => void
}) {
  const a = article(e.word)
  return (
    <div className="d4-glass d4-clue">
      <button type="button" onClick={onPrev} aria-label="Forrige ledetråd">
        <ChevronLeft />
      </button>
      <div>
        <b>
          {e.n} {e.dir === 'a' ? 'vannrett' : 'loddrett'} · {e.answer.length}{' '}
          bokstaver
        </b>
        <span className="mean">
          {meaning(e.word)}
          {a && (
            <em>
              {' '}
              (<span className={e.word.g === 'f' ? 'g-f' : 'g-m'}>
                {a.art}
              </span>{' '}
              …)
            </em>
          )}
        </span>
        <i>
          <LinkIcon link="decir" color="var(--plum)" />å skrive ordet øver decir
        </i>
      </div>
      <button type="button" onClick={onNext} aria-label="Neste ledetråd">
        <ChevronRight />
      </button>
    </div>
  )
}

function Keys({
  onKey,
  onHint,
}: {
  onKey: (k: string) => void
  onHint: () => void
}) {
  return (
    <div className="d4-keys" aria-label="Tastatur">
      {KEY_ROWS.map((row, i) => (
        <div key={i}>
          {i === 2 && (
            <button
              type="button"
              className="wide"
              aria-label="Slett"
              onClick={() => onKey('Backspace')}
            >
              <Delete />
            </button>
          )}
          {row.map((k) => (
            <button
              key={k}
              type="button"
              className={k === 'Ñ' ? 'n' : ''}
              onClick={() => onKey(k)}
            >
              {k}
            </button>
          ))}
          {i === 2 && (
            <button
              type="button"
              className="wide"
              aria-label="En bokstav"
              onClick={onHint}
            >
              ?
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function Result({
  p,
  solved,
  gaveUp,
  time,
  onAgain,
}: {
  p: Puzzle
  solved: Array<number>
  gaveUp: boolean
  time: string
  onAgain: () => void
}) {
  return (
    <section className="d4-glass d4-card d4-result">
      <p className="kick">{gaveUp ? 'Svarene' : '¡Resuelto!'}</p>
      <h2>
        {gaveUp
          ? `${solved.length} av ${p.entries.length} ord`
          : `${p.entries.length} ord på ${time}`}
      </h2>
      <ul>
        {p.entries.map((x, i) => (
          <li key={i} className={solved.includes(i) ? '' : 'miss'}>
            <b lang="es">
              <Es w={x.word} peek />
            </b>
            <span>{meaning(x.word)}</span>
            <Speak
              text={x.word.es}
              small
              label={`Hør ${x.word.es}`}
              className="d4-speak"
            />
          </li>
        ))}
      </ul>
      <div className="acts">
        <TodayNext page="crucigrama" className="d4-btn" />
        <button type="button" className="d4-btn ghost" onClick={onAgain}>
          Et kryssord til
        </button>
        <a className="d4-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}
