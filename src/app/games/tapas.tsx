import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  RotateCcw,
  Snail,
  Volume2,
  X,
} from 'lucide-react'
import { WORD } from '../data/words'
import {
  BEST_DAY,
  GUESTS_A_DAY,
  PATIENCE,
  THANKS,
  check,
  coins,
  makeDay,
  numberOf,
  spoken,
  tipOf,
} from '../lib/tapas'
import { plain } from '../lib/text'
import { blip } from '../lib/sound'
import { stop as hush, say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { Es, Mixed, useFont } from '../ui'
import { BarScene, GuestFace, ItemPic } from './tapasArt'
import type { Mood } from './tapasArt'
import type { Order, Served, TapasDay } from '../lib/tapas'
import './tapas.css'

// Tapas: a bar in the clean lines of a comic, and one guest at a time at
// the counter, ordering aloud. Put what they ask for on the tray, from the
// day's drinks and dishes, and serve it: a quick serve brings a bigger
// tip, an order served by ear alone twice as much, and a slow one is
// never wrong. Eight guests make a day; the tips go in the jar.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,600&display=swap'

interface Result {
  order: Order
  // Served right the first time
  first: boolean
  tip: number
  // Served without reading the order
  ear: boolean
}

export default function Tapas() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('tapas')
  const [day, setDay] = useState<TapasDay | null>(() =>
    makeDay(bank, Date.now()),
  )
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready')
  const [results, setResults] = useState<Array<Result>>([])
  const [before, setBefore] = useState(0)

  const start = () => {
    setResults([])
    setPhase('play')
  }
  const again = () => {
    setDay(makeDay(bank, Date.now()))
    setResults([])
    setPhase('play')
  }

  return (
    <div className="tp">
      <div className="tp-col">
        <header className="tp-top">
          <a className="tp-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            Tapas<small>Baren</small>
          </h1>
          {phase === 'play' && day && (
            <Jar
              total={results.reduce((s, r) => s + r.tip, 0)}
              done={results.length}
              of={day.orders.length}
            />
          )}
        </header>

        {!day ? (
          <TooFew />
        ) : phase === 'ready' ? (
          <Ready onStart={start} best={bank.best.tapas ?? 0} />
        ) : phase === 'play' ? (
          <Bar
            day={day}
            onServed={(r) => setResults((rs) => [...rs, r])}
            onClose={() => {
              setBefore(bank.best.tapas ?? 0)
              setPhase('over')
            }}
          />
        ) : (
          <End results={results} before={before} onAgain={again} />
        )}
      </div>
    </div>
  )
}

// The tips so far, and how many guests have been
function Jar({ total, done, of }: { total: number; done: number; of: number }) {
  return (
    <div
      className="tp-jar"
      aria-label={`${total} euro i tips, gjest ${done + 1} av ${of}`}
    >
      <span className="dots" aria-hidden="true">
        {Array.from({ length: of }, (_, i) => (
          <i key={i} className={i < done ? 'done' : i === done ? 'now' : ''} />
        ))}
      </span>
      <b key={total} className="sum">
        {total} €
      </b>
    </div>
  )
}

function Ready({ onStart, best }: { onStart: () => void; best: number }) {
  return (
    <section className="tp-ready">
      <div className="tp-frame">
        <BarScene guest={null} mood="wait" tray={[]} />
      </div>
      <div className="tp-card">
        <p className="kick">¡Abrimos!</p>
        <p>
          Gjestene kommer til disken én om gangen og bestiller høyt. Legg det de
          ber om på brettet, og server.
        </p>
        <p className="small">
          Jo raskere, jo mer tips. Serverer du uten å lese bestillingen, blir
          tipset dobbelt. Bestillingen kan høres så mange ganger du vil.
        </p>
        <button type="button" className="tp-btn" onClick={onStart}>
          Åpne baren <ArrowRight />
        </button>
        {best > 0 && (
          <p className="small">
            Den beste dagen så langt: {best} € av {BEST_DAY} mulige
          </p>
        )}
      </div>
    </section>
  )
}

function TooFew() {
  return (
    <section className="tp-card">
      <p className="kick">Cerrado</p>
      <p>
        Baren trenger flere ord for mat og drikke før den kan åpne. Møt dem i
        dagens økt, eller velg baren som tema.
      </p>
      <a className="tp-btn" href="#tema/tapeo">
        Ordene ved bardisken <ArrowRight />
      </a>
    </section>
  )
}

// The bar while it is open: the guest at the counter, what they said, the
// carta, and the tray
function Bar({
  day,
  onServed,
  onClose,
}: {
  day: TapasDay
  onServed: (r: Result) => void
  onClose: () => void
}) {
  const { record, levelOf, points, setBest, played } = useStore()
  const { hear } = useVoices()
  const [at, setAt] = useState(0)
  const [tray, setTray] = useState<Array<string>>([])
  const [shown, setShown] = useState(hear === false)
  const [talking, setTalking] = useState(false)
  const [verdict, setVerdict] = useState<Served | null>(null)
  const [tries, setTries] = useState(0)
  const [done, setDone] = useState(false)
  const [, tick] = useState(0)
  const t0 = useRef<number | null>(null)
  const turn = useRef(0)
  const tips = useRef<Array<Result>>([])
  const timers = useRef<Array<number>>([])

  const order = day.orders[at]
  const later = (f: () => void, ms: number) => {
    timers.current.push(window.setTimeout(f, ms))
  }
  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t)
      turn.current++
      hush()
    },
    [],
  )

  // What a guest says, while their mouth moves
  const talk = async (text: string, slow = false) => {
    const me = ++turn.current
    setTalking(true)
    await say(text, slow)
    if (turn.current === me) setTalking(false)
  }

  // A guest comes to the counter and orders; their patience runs from
  // when they have said it
  useEffect(() => {
    t0.current = null
    const id = window.setTimeout(async () => {
      await talk(spoken(order))
      t0.current ??= Date.now()
    }, 700)
    return () => clearTimeout(id)
  }, [at])

  // The coins fade as the guest waits
  useEffect(() => {
    if (done) return
    const id = window.setInterval(() => tick((n) => n + 1), 500)
    return () => clearInterval(id)
  }, [done])

  const waited = () =>
    t0.current === null ? 0 : (Date.now() - t0.current) / 1000
  const byEar = !shown
  const right = verdict?.right === true

  const add = (id: string) => {
    if (right || done) return
    blip('tap')
    setTray((t) => [...t, id])
  }
  const take = (i: number) => {
    if (right || done) return
    setTray((t) => t.filter((_, k) => k !== i))
  }

  const serve = () => {
    if (right || done || !tray.length) return
    const counts: Record<string, number> = {}
    for (const id of tray) counts[id] = (counts[id] ?? 0) + 1
    const s = check(order, counts)
    if (tries === 0) remember(s)
    setTries((n) => n + 1)
    setVerdict(s)
    if (!s.right) {
      blip('wrong')
      setShown(true)
      return
    }
    blip('right')
    const first = tries === 0
    const tip = first ? tipOf(waited(), byEar) : 1
    const r: Result = { order, first, tip, ear: first && byEar }
    tips.current = [...tips.current, r]
    onServed(r)
    later(async () => {
      await talk(plain(THANKS[order.voice]))
      later(next, 500)
    }, 350)
  }

  // The first serve says how the order was understood: each thing asked
  // for, and how many of it, by ear if the order was not read. Read, it
  // is reading, and only of the words shown in Spanish alone.
  const remember = (s: Served) => {
    const note = (id: string, ok: boolean) => {
      if (!WORD[id]) return
      const lv = levelOf(id)
      if (lv === 0) return
      if (byEar) record(id, ok, 0.6, 'leer')
      else if (lv === 2) record(id, ok, 0.3, 'leer')
    }
    for (const l of s.lines) {
      note(l.id, l.got > 0)
      const n = numberOf(l.want)
      if (n && l.got > 0) note(n, l.got === l.want)
    }
  }

  const next = () => {
    if (at + 1 >= day.orders.length) {
      const all = tips.current
      const total = all.reduce((sum, r) => sum + r.tip, 0)
      setDone(true)
      setBest('tapas', total)
      const firsts = all.filter((r) => r.first).length
      if (firsts) points(firsts)
      played('tapas')
      blip('win')
      onClose()
      return
    }
    setAt(at + 1)
    setTray([])
    setShown(hear === false)
    setVerdict(null)
    setTries(0)
    setTalking(false)
  }

  const hearAgain = (slow = false) => {
    if (right) return
    void talk(spoken(order), slow)
  }

  // 1–9 and 0 put the carta's things on the tray, Backspace takes the last
  // off, Space says the order again, Enter serves
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea')) return
      if (/^[0-9]$/.test(e.key)) {
        const k = e.key === '0' ? 9 : Number(e.key) - 1
        if (day.carta[k]) {
          e.preventDefault()
          add(day.carta[k].id)
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        take(tray.length - 1)
      } else if (e.key === ' ') {
        if (t?.closest('button, a')) return
        e.preventDefault()
        hearAgain()
      } else if (e.key === 'Enter') {
        if (t?.closest('button, a')) return
        e.preventDefault()
        serve()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const mood: Mood = right
    ? 'happy'
    : verdict
      ? 'hmm'
      : talking
        ? 'talk'
        : 'wait'
  const onTray: Record<string, number> = {}
  for (const id of tray) onTray[id] = (onTray[id] ?? 0) + 1
  const left = right ? 0 : coins(waited())

  return (
    <main className="tp-play">
      <div className="tp-frame">
        <BarScene
          key={at}
          guest={order.voice}
          mood={mood}
          tray={tray}
          onTake={take}
          serving={right}
          talking={talking}
        />
        {!right && <Tip left={left} ear={byEar && tries === 0} />}
      </div>

      <section
        className={`tp-bubble ${verdict && !right ? 'miss' : ''}`}
        aria-live="polite"
      >
        <div className="tp-said">
          {right ? (
            <Mixed line={THANKS[order.voice]} />
          ) : shown ? (
            <Mixed line={order.line} />
          ) : (
            <span className={`tp-listen ${talking ? 'on' : ''}`}>
              <Volume2 /> {talking ? 'Hør …' : 'Hva vil gjesten ha?'}
            </span>
          )}
        </div>
        {verdict && !right && <Marks served={verdict} />}
        {!right && (
          <div className="tp-tools">
            <button
              type="button"
              className="tp-round small"
              aria-label="Hør bestillingen igjen"
              onClick={() => hearAgain()}
            >
              <Volume2 />
            </button>
            <button
              type="button"
              className="tp-round small"
              aria-label="Hør den sakte"
              onClick={() => hearAgain(true)}
            >
              <Snail />
            </button>
            {!shown && (
              <button
                type="button"
                className="tp-pill"
                aria-label="Les bestillingen"
                onClick={() => setShown(true)}
              >
                <Eye /> Les
              </button>
            )}
          </div>
        )}
        {right && (
          <p className="tp-paid">
            +{tips.current.at(-1)?.tip ?? 0} € i tips
            {tips.current.at(-1)?.ear ? ' · dobbelt, på gehør' : ''}
          </p>
        )}
      </section>

      <ol className="tp-carta" aria-label="Kartet">
        {day.carta.map((it, k) => {
          const w = WORD[it.id]
          if (!w) return null
          const n = onTray[it.id] ?? 0
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => add(it.id)}
                disabled={right}
                data-id={it.id}
                aria-label={`${w.es}${n ? `, ${n} på brettet` : ''}`}
              >
                <ItemPic id={it.id} className="pic" />
                <span className="nm">
                  <span lang="es">
                    <Es w={w} />
                  </span>
                </span>
                <kbd aria-hidden="true">{(k + 1) % 10}</kbd>
                {n > 0 && <span className="n">{n}</span>}
              </button>
            </li>
          )
        })}
      </ol>

      <div className="tp-acts">
        <button
          type="button"
          className="tp-btn ghost"
          onClick={() => setTray([])}
          disabled={!tray.length || right}
          aria-label="Tøm brettet"
        >
          <RotateCcw /> Tøm
        </button>
        <button
          type="button"
          className="tp-btn"
          onClick={serve}
          disabled={!tray.length || right}
        >
          <Check /> Server
        </button>
      </div>
      <p className="tp-keys">
        <kbd>1</kbd>–<kbd>0</kbd> på brettet · <kbd>⌫</kbd> av igjen ·{' '}
        <kbd>Mellomrom</kbd> hør igjen · <kbd>Enter</kbd> server
      </p>
    </main>
  )
}

// The tip still to be had: three coins, one fading every quarter minute,
// and never fewer than one
function Tip({ left, ear }: { left: number; ear: boolean }) {
  return (
    <span
      className="tp-tip"
      title={`Tipset synker hvert ${PATIENCE}. sekund, men aldri under én euro`}
    >
      <span className="coins" aria-label={`${left} av 3 mynter`}>
        {[0, 1, 2].map((i) => (
          <i key={i} className={i < left ? 'on' : ''} />
        ))}
      </span>
      {ear && <b className="x2">×2 på gehør</b>}
    </span>
  )
}

// A drink or a dish by its name in the bank, the article in its colour
function Name({ id }: { id: string }) {
  const w = WORD[id]
  return <span lang="es">{w ? <Es w={w} /> : id}</span>
}

// What was asked for beside what was served, once a serve was not right
function Marks({ served }: { served: Served }) {
  return (
    <ul className="tp-marks">
      {served.lines.map((l) => {
        const ok = l.got === l.want
        return (
          <li
            key={l.id}
            className={ok ? 'ok' : 'no'}
            data-id={l.id}
            data-want={l.want}
          >
            <ItemPic id={l.id} className="pic" />
            <span>
              {l.want} × <Name id={l.id} />
            </span>
            <span className="had">
              {ok ? <Check aria-label="riktig" /> : `du ga ${l.got}`}
            </span>
          </li>
        )
      })}
      {served.extra.map((id) => (
        <li key={id} className="no">
          <ItemPic id={id} className="pic" />
          <span>
            <Name id={id} />
          </span>
          <span className="had">ikke bestilt</span>
        </li>
      ))}
    </ul>
  )
}

function End({
  results,
  before,
  onAgain,
}: {
  results: Array<Result>
  // The best day before this one
  before: number
  onAgain: () => void
}) {
  const { hear } = useVoices()
  const total = results.reduce((s, r) => s + r.tip, 0)
  const firsts = results.filter((r) => r.first).length
  const ears = results.filter((r) => r.ear).length
  return (
    <section className="tp-card tp-end">
      <p className="kick">¡Cerramos!</p>
      <h2>{total} € i tips</h2>
      <p className="sub">
        {firsts} av {results.length || GUESTS_A_DAY} servert riktig med en gang
        {ears ? `, ${ears} av dem på gehør` : ''}.{' '}
        {before === 0
          ? ''
          : total > before
            ? 'Den beste dagen så langt.'
            : `Den beste dagen er ${before} €.`}
      </p>
      <div className="acts">
        <TodayNext page="tapas" className="tp-btn" />
        <button type="button" className="tp-btn ghost" onClick={onAgain}>
          En dag til
        </button>
        <a className="tp-link" href="#">
          Til forsiden
        </a>
      </div>
      <ol className="tp-day">
        {results.map((r, i) => (
          <li key={i} className={r.first ? '' : 'miss'}>
            <GuestFace who={r.order.voice} className="face" />
            <span className="line">
              <Mixed line={r.order.line} />
            </span>
            <span className="after">
              <span className="got">
                {r.first ? (
                  <Check aria-label="riktig med en gang" />
                ) : (
                  <X aria-label="rettet opp" />
                )}
                <b>+{r.tip} €</b>
              </span>
              {hear !== false && (
                <button
                  type="button"
                  className="tp-round small"
                  aria-label="Hør bestillingen"
                  onClick={() => void say(spoken(r.order))}
                >
                  <Volume2 />
                </button>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
