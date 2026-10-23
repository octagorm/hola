import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Ear,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Snail,
  Volume2,
} from 'lucide-react'
import { WORD, gloss } from '../data/words'
import { SPEED, STEER, VOYAGES } from '../data/ictineo'
import { PICTURES } from '../data/pictures'
import {
  AIR,
  AIR_LOW,
  Dive,
  REVEAL,
  bestKey,
  isOpen,
  startBoat,
  voyageWords,
} from '../lib/ictineo'
import { recall } from '../lib/bank'
import { plain } from '../lib/text'
import { blip } from '../lib/sound'
import { stop as hush, say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { Es, Mixed, useFont, useMedia } from '../ui'
import {
  BOAT_SCALE,
  BOAT_X,
  BOW,
  Backdrop,
  Boat,
  CLAW,
  CORAL_TOP,
  Captain,
  CoralBed,
  DEPTH_Y,
  DangerArt,
  FarRocks,
  H,
  IctineoDefs,
  LANE_DY,
  LANE_SCALE,
  MastLayer,
  Pictogram,
  Quay,
  Sea,
  Seabed,
  SightArt,
  W,
  Waves,
} from './ictineoArt'
import type { RefObject } from 'react'
import type { PageProps } from '../registry'
import type { Action, Order, Voyage } from '../data/ictineo'
import type { Hud, Settled, Tick } from '../lib/ictineo'
import './ictineo.css'

// El Ictíneo: at the helm of Narciso Monturiol's wooden submarine, 1859.
// The captain gives his orders in Spanish; the helm is pictures and keys,
// named in Norwegian. A cadet sees each order in Spanish, with no Norwegian
// over it (a word tapped shows what it means, for half the points); an
// officer only hears it, for twice the points. The rules are in lib/ictineo.ts, the voyages and the
// orders in data/ictineo.ts, the pictures in ictineoArt.tsx.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Playfair+Display+SC:wght@400;700;900&display=swap'

// The helm's controls: what each is called, and its key
const LABEL: Record<Action, string> = {
  babor: 'babord',
  estribor: 'styrbord',
  arriba: 'opp',
  abajo: 'ned',
  rapido: 'fortere',
  despacio: 'sakte',
  alto: 'stopp',
  escotilla: 'luken',
  coral: 'korallen',
  ancla: 'ankeret',
  lampara: 'lampen',
}
const KEY: Partial<Record<Action, string>> = {
  babor: '←',
  estribor: '→',
  arriba: '↑',
  abajo: '↓',
  rapido: 'F',
  despacio: 'S',
  alto: 'X',
}
const BY_KEY: Partial<Record<string, Action>> = {
  ArrowLeft: 'babor',
  ArrowRight: 'estribor',
  ArrowUp: 'arriba',
  ArrowDown: 'abajo',
  f: 'rapido',
  s: 'despacio',
  x: 'alto',
}

// Where what comes at the boat waits, off the picture, until it is drawn
const OFF = `translate(${W + 400} 0)`

// Metres under the surface at each depth
const METRES = [0, 7, 13, 20]

const ROMAN = ['I', 'II', 'III', 'IV']
const COUNT = ['null', 'ett', 'to', 'tre']

// A painting from scripts/pictures.mjs, once it is made
function painted(name: string) {
  const path = `ictineo/${name}`
  return PICTURES.has(path) ? `/${path}.webp` : undefined
}
const CUTAWAY = painted('cutaway')

// The first voyage not yet brought home, or the one asked for in the
// address (#ictineo/creus), if it is open
function firstVoyage(best: Record<string, number | undefined>, arg?: string) {
  const asked = VOYAGES.findIndex((v) => v.id === arg)
  if (asked >= 0 && isOpen(best, asked)) return asked
  const next = VOYAGES.findIndex((v) => !best[bestKey(v.id)])
  return next < 0 ? 0 : next
}

export default function Ictineo({ arg }: PageProps) {
  useFont(FONTS)
  const { bank, meet, setBest, points, played } = useStore()
  const back = useBack('ictineo')
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready')
  const [at, setAt] = useState(() => firstVoyage(bank.best, arg))
  const [officer, setOfficer] = useState(false)
  const [end, setEnd] = useState<Hud | null>(null)
  const [before, setBefore] = useState(0)
  const [round, setRound] = useState(0)
  const voyage = VOYAGES[at]

  // The voyage's words not met yet: met as it begins
  const fresh = useMemo(
    () => voyageWords(voyage).filter((id) => !bank.cards[id]),
    [voyage, bank],
  )

  const start = (asOfficer: boolean) => {
    if (fresh.length) meet(fresh)
    setOfficer(asOfficer)
    setBefore(bank.best[bestKey(voyage.id)] ?? 0)
    setEnd(null)
    setRound((r) => r + 1)
    setPhase('play')
  }

  const over = (h: Hud) => {
    if (h.home) {
      setBest(bestKey(voyage.id), h.score)
      setBest('ictineo', h.score)
    }
    if (h.right) points(h.right)
    played('ictineo')
    blip(h.home ? 'win' : 'wrong')
    setEnd(h)
  }

  return (
    <div className="ic-game">
      <IctineoDefs />
      <div className="ic-col">
        <header className="ic-top">
          <a className="ic-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            El Ictíneo<small>Ubåten</small>
          </h1>
        </header>

        {phase === 'ready' && <Ready at={at} onPick={setAt} onStart={start} />}
        {phase === 'play' && (
          <Voyager
            key={round}
            voyage={voyage}
            officer={officer}
            end={end}
            onOver={over}
            onDone={() => setPhase('over')}
          />
        )}
        {phase === 'over' && end && (
          <End
            hud={end}
            officer={officer}
            before={before}
            onAgain={() => start(officer)}
            onNext={
              at + 1 < VOYAGES.length && end.home
                ? () => {
                    setAt(at + 1)
                    setPhase('ready')
                  }
                : null
            }
            onLog={() => setPhase('ready')}
          />
        )}
      </div>
    </div>
  )
}

// --- Before setting out: the logbook ---

function Ready({
  at,
  onPick,
  onStart,
}: {
  at: number
  onPick: (i: number) => void
  onStart: (officer: boolean) => void
}) {
  const { bank, levelOf } = useStore()
  const { hear } = useVoices()
  const voyage = VOYAGES[at]
  // The voyage's words not known yet, to look at before setting out: the
  // orders under way have no Norwegian over them
  const study = voyageWords(voyage).filter((id) => levelOf(id) < 2)
  // Enter sets out as a cadet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== 'Enter' || t?.closest('button, a, [role=button]')) return
      e.preventDefault()
      onStart(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <section className="ic-ready">
      <figure className="ic-plate still">
        <Harbour voyage={voyage} />
        <figcaption>
          <span lang="es">{voyage.caption}</span>
        </figcaption>
      </figure>
      <div className="ic-card ic-intro">
        {CUTAWAY && (
          <img
            className="ic-cutaway"
            src={CUTAWAY}
            alt="Ictíneo sett i snitt, med mannskapet ved sveiven og roret"
          />
        )}
        <p className="kick">Barcelona, 1859</p>
        <p>
          Du står ved roret i Ictíneo, ubåten av tre som Narciso Monturiol
          bygde. Kapteinen gir ordrer på spansk: styr unna klippene, dykk og kom
          opp igjen før faren er der. Under vann går lufta tom, og da tar han
          dere opp for å puste.
        </p>
        <p>
          Ordrene står bare på spansk. Trykk på et ord du ikke kan, så ser du
          hva det betyr, men da gir ordren halve poeng. Feil vei gir et smell i
          skroget, og tre smell sender dere hjem. Fem ordrer riktig på rad
          reparerer et smell.
        </p>
        <Controls voyage={voyage} />
      </div>
      <div className="ic-card ic-voyage">
        <p className="kick">Loggboken</p>
        <ol className="ic-log" aria-label="Loggboken">
          {VOYAGES.map((v, i) => {
            const open = isOpen(bank.best, i)
            const best = bank.best[bestKey(v.id)] ?? 0
            return (
              <li key={v.id}>
                <button
                  type="button"
                  className={`${i === at ? 'on' : ''} ${open ? '' : 'shut'}`}
                  aria-pressed={i === at}
                  disabled={!open}
                  onClick={() => onPick(i)}
                >
                  <span className="n">{ROMAN[i]}</span>
                  <span className="t">
                    <b lang="es">{v.es}</b>
                    <small>{v.no}</small>
                  </span>
                  <span className="s">
                    {open ? (
                      best > 0 ? (
                        `${best} poeng`
                      ) : (
                        'nytt tokt'
                      )
                    ) : (
                      <>
                        <Lock aria-hidden="true" /> etter tokt {ROMAN[i - 1]}
                      </>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="about">{voyage.about}</p>
        {study.length > 0 && (
          <p className="ic-fresh">
            <b>Ord å kunne på dette toktet:</b>{' '}
            {study.map((id, i) => {
              const w = WORD[id]
              if (!w) return null
              return (
                <span key={id}>
                  {i > 0 && ' · '}
                  <span lang="es">
                    <Es w={w} />
                  </span>{' '}
                  – <i>{gloss(w)}</i>
                </span>
              )
            })}
          </p>
        )}
        <div className="ic-go">
          <button
            type="button"
            className="ic-btn"
            onClick={() => onStart(false)}
          >
            Kadett <small>Se ordrene</small>
            <ArrowRight />
          </button>
          {hear !== false && (
            <button
              type="button"
              className="ic-btn ghost"
              onClick={() => onStart(true)}
            >
              <Ear aria-hidden="true" />
              Offiser <small>Bare hør · dobbel poengsum</small>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

// The controls of a voyage and their keys, where there is a keyboard (on
// a touch screen the helm's buttons say what they are)
function Controls({ voyage }: { voyage: Voyage }) {
  const wide = useMedia('(hover: hover) and (pointer: fine)')
  if (!wide) return null
  const all: Array<Action> = [...STEER, ...SPEED, ...voyage.tools]
  return (
    <div className="ic-legend">
      <p className="small">Roret, med tastene:</p>
      <ul>
        {all.map((a, i) => (
          <li key={a} className={a}>
            <Pictogram a={a} boat={startBoat(voyage)} />
            <span>{LABEL[a]}</span>
            <kbd>{KEY[a] ?? String(i - STEER.length - SPEED.length + 1)}</kbd>
          </li>
        ))}
      </ul>
      <p className="small">
        <kbd>Mellomrom</kbd> hør ordren igjen · <kbd>P</kbd> pause
      </p>
    </div>
  )
}

// The voyage's picture before setting out and at the end: painted once it
// is made, drawn until then
function Harbour({ voyage }: { voyage: Voyage }) {
  const img = painted(voyage.id)
  return img ? <img src={img} alt="" /> : <Still voyage={voyage} />
}

// The harbour before setting out, the boat at the surface
function Still({ voyage }: { voyage: Voyage }) {
  const boat = startBoat(voyage)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ictíneo i havna"
    >
      <Backdrop voyage={voyage.id} />
      <MastLayer voyage={voyage.id} />
      <Sea voyage={voyage.id} />
      <FarRocks />
      <g
        className="ic-boat-pos"
        style={{
          transform: `translate(${BOAT_X}px, ${DEPTH_Y[0]}px) scale(${BOAT_SCALE})`,
        }}
      >
        <Boat boat={boat} hits={0} tools={voyage.tools} coralAt={0} />
      </g>
      <Seabed voyage={voyage.id} />
      <Waves rough={voyage.id === 'alicante'} />
      {voyage.id === 'noche' && (
        <rect y="150" width={W} height={H - 150} className="ic-dark" />
      )}
    </svg>
  )
}

// --- A voyage under way ---

function Voyager({
  voyage,
  officer,
  end,
  onOver,
  onDone,
}: {
  voyage: Voyage
  officer: boolean
  end: Hud | null
  onOver: (h: Hud) => void
  onDone: () => void
}) {
  const { bank, record, levelOf } = useStore()
  const { hear } = useVoices()
  const [hud, setHud] = useState<Hud | null>(null)
  const [paused, setPaused] = useState(false)
  const [talking, setTalking] = useState(false)
  const dive = useRef<Dive | null>(null)
  const draw = useRef<((t: Tick, h: Hud | null) => void) | null>(null)
  const hudNow = useRef<Hud | null>(null)
  const pausedNow = useRef(false)
  const talk = useRef(0)
  // What the callbacks need of the latest render
  const latest = useRef({ record, levelOf, bank, onOver })
  useEffect(() => {
    latest.current = { record, levelOf, bank, onOver }
  })

  // Says a line of the captain's, and knows while it is being said
  const speak = async (line: string, slow = false) => {
    const me = ++talk.current
    setTalking(true)
    await say(plain(line), slow)
    if (talk.current === me) setTalking(false)
  }
  const speakRef = useRef(speak)
  useEffect(() => {
    speakRef.current = speak
  })

  useEffect(() => {
    const link = officer ? 'oir' : 'leer'
    // A cadet reads the order in Spanish alone and acts on it, a choice
    // among the helm's controls named in Norwegian: 0.4, on reading (a
    // word looked up records nothing). An officer only hears it: 0.6, on
    // hearing.
    const weight = officer ? 0.6 : 0.4
    const d = new Dive(voyage, {
      officer,
      speak: (line) => speakRef.current(line),
      onHud: (h) => {
        hudNow.current = h
        setHud(h)
      },
      onTick: (t) => draw.current?.(t, hudNow.current),
      onSettled: (s: Settled) => {
        const { record: rec, levelOf: lv } = latest.current
        for (const e of s.evidence)
          if (lv(e.id) > 0) rec(e.id, e.right, weight * e.share, link)
        if (s.how === 'right') blip('right')
      },
      onOver: (h) => latest.current.onOver(h),
      // Orders whose words have faded come oftener
      weigh: (o: Order) => {
        const now = Date.now()
        const cards = latest.current.bank.cards
        const r = Math.min(
          ...o.keys.flat().map((id) => {
            const c = cards[id]
            return c ? recall(c[link], now) : 0
          }),
        )
        return 0.6 + (1 - r)
      },
    })
    dive.current = d
    void d.sail()
    let raf = 0
    let last = performance.now()
    const frame = (t: number) => {
      const dt = Math.min(0.1, Math.max(0, (t - last) / 1000))
      last = t
      if (!pausedNow.current && !document.hidden) d.update(dt)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      d.stop()
      dive.current = null
      hush()
    }
  }, [voyage, officer])

  // A bump: the wrong knock; a plate mended: the voyage's fanfare
  const hits = hud?.hits ?? 0
  useEffect(() => {
    if (hits) blip('wrong')
  }, [hits])
  const mends = hud?.mends ?? 0
  useEffect(() => {
    if (mends) blip('win')
  }, [mends])

  const live = hud?.phase === 'order' && !paused
  const act = (a: Action) => {
    if (!live) return
    dive.current?.act(a)
  }

  const hearAgain = (slow = false) => {
    const line = hud?.order?.line ?? hud?.line?.line
    if (line) void speak(line, slow)
  }

  const togglePause = () => {
    const next = !pausedNow.current
    pausedNow.current = next
    setPaused(next)
    if (next) hush()
  }

  // The keys: arrows to steer, F, S and X for speed, 1 and 2 for the
  // tools, space to hear again, P to pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea')) return
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (k === 'p' || k === 'Escape') {
        e.preventDefault()
        if (hud?.phase !== 'over') togglePause()
        return
      }
      if (pausedNow.current) {
        if (k === 'Enter' || k === ' ') {
          e.preventDefault()
          togglePause()
        }
        return
      }
      if (k === ' ') {
        if (t?.closest('button, a')) return
        e.preventDefault()
        if (!e.repeat) hearAgain()
        return
      }
      const tool = Number(k) - 1
      const a =
        BY_KEY[k] ??
        (tool >= 0 && tool < voyage.tools.length ? voyage.tools[tool] : null)
      if (!a) return
      e.preventDefault()
      if (!e.repeat) act(a)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Once over, the end comes after the last line has been seen
  const done = hud?.phase === 'over' && !!end
  useEffect(() => {
    if (!done) return
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [done, onDone])

  if (!hud) return <div className="ic-play" />
  return (
    <main className={`ic-play ${paused ? 'paused' : ''}`}>
      <div className="ic-stage">
        <Plate hud={hud} draw={draw} />
        <div className="ic-bar">
          <span className="ic-score">
            <b>{hud.score}</b> poeng
          </span>
          <button
            type="button"
            className="ic-round small"
            onClick={togglePause}
            aria-label={paused ? 'Fortsett' : 'Pause'}
          >
            {paused ? <Play /> : <Pause />}
          </button>
        </div>
      </div>
      <div className="ic-deck">
        <Said
          hud={hud}
          officer={officer}
          talking={talking}
          hear={hear !== false}
          onHear={hearAgain}
          onLook={(id) => dive.current?.look(id)}
        />
        <Helm hud={hud} live={live} onAct={act} />
      </div>
      {paused && (
        <div className="ic-pause" role="dialog" aria-label="Pause">
          <div>
            <p className="kick">Pausa</p>
            <p>Klokka står stille til du fortsetter.</p>
            <button type="button" className="ic-btn" onClick={togglePause}>
              <Play aria-hidden="true" /> Fortsett
            </button>
            <a className="ic-link" href="#">
              Til forsiden
            </a>
          </div>
        </div>
      )}
    </main>
  )
}

// --- The plate: the picture of the voyage ---

function Plate({
  hud,
  draw,
}: {
  hud: Hud
  draw: RefObject<((t: Tick, h: Hud | null) => void) | null>
}) {
  const v = hud.voyage
  const b = hud.boat
  const fig = useRef<HTMLElement>(null)
  const far = useRef<SVGGElement>(null)
  const mid = useRef<SVGGElement>(null)
  const near = useRef<SVGGElement>(null)
  const waves = useRef<SVGGElement>(null)
  const back = useRef<SVGGElement>(null)
  const front = useRef<SVGGElement>(null)
  const quay = useRef<SVGGElement>(null)
  const bed = useRef<SVGGElement>(null)
  const timer = useRef<HTMLSpanElement>(null)
  const needle = useRef<SVGGElement>(null)
  const air = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // The right edge of what shows of the picture, where dangers come in
    let right = W
    const measure = () => {
      const r = fig.current?.querySelector('svg')?.getBoundingClientRect()
      if (!r || !r.width || !r.height) return
      const scale = Math.max(r.width / W, r.height / H)
      right = W / 2 + r.width / scale / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (fig.current) ro.observe(fig.current)
    // The quay and the coral bed keep their place between frames
    let quayX = -1
    let quayFrom = -1
    let quayGiven = -1
    let bedX = 1100
    let bedY = 0
    let bedOn = false
    let parked = false
    let released = false
    let lastRun = 0
    draw.current = (t, h) => {
      const dRun = t.run - lastRun
      lastRun = t.run
      const wrap = (k: number) => -((t.run * k) % W)
      far.current?.setAttribute(
        'transform',
        `translate(${wrap(0.35).toFixed(1)} 0)`,
      )
      mid.current?.setAttribute(
        'transform',
        `translate(${wrap(0.6).toFixed(1)} 0)`,
      )
      near.current?.setAttribute(
        'transform',
        `translate(${wrap(1).toFixed(1)} 0)`,
      )
      waves.current?.setAttribute(
        'transform',
        `translate(${wrap(1).toFixed(1)} 0)`,
      )
      if (!h) return
      // What comes at the boat: from the right edge to the bow, and past
      const lane = h.from.lane + 1
      const bow = BOAT_X + BOW * LANE_SCALE[lane]
      const startX = right + 30
      const p = t.p
      const x = p <= 1 ? startX + (bow - startX) * p : bow - (p - 1) * 1100
      const at = `translate(${x.toFixed(1)} 0)`
      back.current?.setAttribute('transform', at)
      front.current?.setAttribute('transform', at)
      const settled = h.phase !== 'order'
      const el = fig.current
      if (el) {
        const shown = settled || p >= REVEAL
        if (shown !== (el.dataset.shown === '1'))
          el.dataset.shown = shown ? '1' : ''
        const low = t.air < AIR_LOW && h.boat.depth > 0
        if (low !== (el.dataset.low === '1')) el.dataset.low = low ? '1' : ''
      }
      // The quay: nearer with "despacio", at the bow with "alto"
      if (h.danger === 'quay' && h.given !== quayGiven) {
        quayGiven = h.given
        quayFrom = quayX >= 0 ? quayX : startX
      }
      if (h.danger === 'quay' && h.order) {
        const to =
          h.order.do[0] === 'despacio' ? Math.min(startX - 60, 1180) : bow + 4
        const q = Math.min(1, p)
        quayX = quayFrom + (to - quayFrom) * q
      }
      if (quay.current) {
        quay.current.setAttribute(
          'transform',
          `translate(${quayX.toFixed(1)} 0)`,
        )
        quay.current.style.display = quayX >= 0 ? '' : 'none'
      }
      // The coral bed comes in as the boat slows, and settles under the
      // claw while it stands, as high as the boat is; it is left behind as
      // the boat sets off again
      const lane2 = h.boat.lane + 1
      const k = LANE_SCALE[lane2] * BOAT_SCALE
      const clawX = BOAT_X + CLAW.x * k - CORAL_TOP.x
      const clawY =
        DEPTH_Y[h.boat.depth] + LANE_DY[lane2] + CLAW.y * k - CORAL_TOP.y
      if (h.bed && !bedOn) {
        bedOn = true
        bedX = Math.min(1100, startX)
        bedY = clawY
      }
      if (bedOn) {
        if (h.boat.speed === 0) parked = true
        if (parked && h.boat.speed > 0) released = true
        if (released) bedX -= dRun
        else {
          bedX += (clawX - bedX) * 0.05
          bedY += (clawY - bedY) * 0.08
        }
        bed.current?.setAttribute(
          'transform',
          `translate(${bedX.toFixed(1)} ${bedY.toFixed(1)})`,
        )
      }
      timer.current?.style.setProperty('--left', t.left.toFixed(3))
      const share = t.air / AIR
      needle.current?.setAttribute(
        'transform',
        `rotate(${(-120 + share * 240).toFixed(1)} 30 30)`,
      )
      air.current?.style.setProperty('--air', share.toFixed(3))
    }
    return () => {
      ro.disconnect()
      draw.current = null
    }
  }, [draw])

  const y = DEPTH_Y[b.depth] + LANE_DY[b.lane + 1]
  const s = BOAT_SCALE * LANE_SCALE[b.lane + 1]
  const fromY = DEPTH_Y[hud.from.depth] + LANE_DY[hud.from.lane + 1]
  const night = v.id === 'noche'
  const dark = night && b.depth >= 0
  return (
    <figure
      ref={fig}
      className={`ic-plate v-${v.id} ${hud.sight ? `saw-${hud.sight}` : ''}`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Ictíneo, ${METRES[b.depth]} meter under overflaten`}
      >
        <Backdrop voyage={v.id} />
        <g ref={mid}>
          <MastLayer voyage={v.id} />
        </g>
        <Sea voyage={v.id} />
        <g ref={far}>
          <FarRocks />
        </g>
        {hud.bed && (
          <g ref={bed} transform={OFF}>
            <CoralBed />
          </g>
        )}
        <g ref={back} key={`b${hud.given}`} transform={OFF}>
          <DangerArt kind={hud.danger} y={fromY} layer="back" />
        </g>
        <g ref={quay} style={{ display: 'none' }}>
          <Quay />
        </g>
        {hud.sight && hud.sight !== 'faro' && hud.sight !== 'luna' && (
          <g key={`s${hud.sights}`} className={`ic-pass ${hud.sight}`}>
            <SightArt sight={hud.sight} />
          </g>
        )}
        <g
          className="ic-boat-pos"
          style={{ transform: `translate(${BOAT_X}px, ${y}px) scale(${s})` }}
        >
          <g key={`h${hud.hits}`} className={hud.hits ? 'ic-jolt' : ''}>
            <Boat boat={b} hits={hud.hits} tools={v.tools} coralAt={b.coral} />
          </g>
        </g>
        <g ref={front} key={`f${hud.given}`} transform={OFF}>
          <DangerArt kind={hud.danger} y={fromY} layer="front" />
        </g>
        <g ref={near}>
          <Seabed voyage={v.id} />
        </g>
        <g ref={waves}>
          <Waves rough={v.id === 'alicante'} />
        </g>
        {hud.murk && (
          <rect y="150" width={W} height={H - 150} className="ic-murk" />
        )}
        {dark && (
          <>
            <mask id="ic-lamp-mask">
              <rect width={W} height={H} fill="#fff" />
              {b.lamp && (
                <g
                  className="ic-boat-pos"
                  style={{
                    transform: `translate(${BOAT_X}px, ${y}px) scale(${s})`,
                  }}
                >
                  <path d="M150 -26L560 -200V170Z" fill="url(#ic-beam-m)" />
                  <circle cx="150" cy="-26" r="70" fill="#000" opacity=".8" />
                </g>
              )}
            </mask>
            <rect
              y="150"
              width={W}
              height={H - 150}
              className="ic-dark"
              mask="url(#ic-lamp-mask)"
            />
            {b.lamp && (
              <g
                className="ic-boat-pos"
                style={{
                  transform: `translate(${BOAT_X}px, ${y}px) scale(${s})`,
                }}
              >
                <path
                  d="M150 -26L560 -200V170Z"
                  fill="url(#ic-beam)"
                  opacity=".35"
                />
              </g>
            )}
          </>
        )}
      </svg>
      <Gauges hud={hud} needle={needle} air={air} />
      <span className="ic-timer" ref={timer} aria-hidden="true">
        <i />
      </span>
      <figcaption>
        <span lang="es">{v.caption}</span>
      </figcaption>
    </figure>
  )
}

// The hull, the air and the depth, on the plate's corner
function Gauges({
  hud,
  needle,
  air,
}: {
  hud: Hud
  needle: RefObject<SVGGElement | null>
  air: RefObject<HTMLSpanElement | null>
}) {
  const b = hud.boat
  return (
    <div className="ic-gauges">
      <span
        className="ic-hull"
        role="img"
        aria-label={`Skroget tåler ${hud.hull} smell til`}
        key={`m${hud.mends}`}
      >
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            className={`${i < hud.hull ? 'ok' : 'gone'} ${hud.mends && i === hud.hull - 1 ? 'mended' : ''}`}
          />
        ))}
      </span>
      <span className="ic-air" ref={air} role="img" aria-label="Luft">
        <svg viewBox="0 0 60 46" aria-hidden="true">
          <path d="M9.2 42A24 24 0 1 1 50.8 42Z" className="dial" />
          <path d="M9.2 42A24 24 0 0 1 15.9 10.6" className="red" />
          <g ref={needle}>
            <path d="M30 30L30 9" className="needle" />
          </g>
          <circle cx="30" cy="30" r="3.2" className="hub" />
        </svg>
        <small>luft</small>
      </span>
      <span className="ic-depth">
        <b>{METRES[b.depth]}</b> m
      </span>
      {hud.voyage.tools.includes('coral') && (
        <span className="ic-coral" aria-label={`${b.coral} koraller`}>
          <Pictogram a="coral" /> {b.coral}
        </span>
      )}
    </div>
  )
}

// What the captain says: the order, in Spanish alone (hidden from an
// officer until it is settled), or a line of his in mixed text
function Said({
  hud,
  officer,
  talking,
  hear,
  onHear,
  onLook,
}: {
  hud: Hud
  officer: boolean
  talking: boolean
  hear: boolean
  onHear: (slow?: boolean) => void
  onLook: (id: string) => void
}) {
  const o = hud.order
  const settled = hud.phase === 'result' || hud.phase === 'over'
  const line = o ? null : hud.line
  const hidden = !!o && officer && !settled
  // A long one a little smaller, to keep the card's height
  const text = o?.line ?? line?.line
  const long = !!text && plain(text).length > 22 ? 'long' : ''
  const verdict =
    hud.result === 'right'
      ? `Riktig! +${hud.gain}${hud.aid === 'looked' ? ' · halve poeng' : ''}${hud.mended ? ' · skroget er reparert' : ''}`
      : hud.result === 'wrong'
        ? 'Feil vei'
        : hud.result === 'late'
          ? 'For sent'
          : null
  return (
    <section
      className={`ic-say ${hud.result ?? ''} ${hud.phase}`}
      data-order={o?.id}
      data-n={hud.given}
      data-live={hud.phase === 'order' ? '1' : undefined}
      aria-live="polite"
    >
      <Captain talking={talking} />
      <div className="body">
        <p className="who">
          Kapteinen <small>Narciso Monturiol</small>
        </p>
        {o ? (
          hidden ? (
            <p className="listen">
              <Ear aria-hidden="true" /> Lytt …
            </p>
          ) : (
            <p className={`es ${long}`} lang="es" key={`${o.id}${hud.given}`}>
              <Mixed line={o.line} all={2} onPeek={onLook} />
            </p>
          )
        ) : line ? (
          <p className={`es line ${long}`} lang="es" key={line.id}>
            <Mixed line={line.line} />
          </p>
        ) : null}
        {o && settled && <p className="no">{o.no}</p>}
        {line && <p className="no">{line.no}</p>}
        {verdict && (
          <p className={`verdict ${hud.result}`}>
            {verdict}
            {hud.remark && (
              <span lang="es" className="remark">
                {' '}
                «{plain(hud.remark.line)}»
              </span>
            )}
          </p>
        )}
      </div>
      {hear && (o || line) && (
        <div className="tools">
          <button
            type="button"
            className="ic-icon"
            onClick={() => onHear(false)}
            aria-label="Hør igjen"
          >
            <Volume2 />
          </button>
          <button
            type="button"
            className="ic-icon"
            onClick={() => onHear(true)}
            aria-label="Hør det sakte"
          >
            <Snail />
          </button>
        </div>
      )}
    </section>
  )
}

// The helm: steering in a cross round the wheel, the speed beside it,
// and the voyage's tools
function Helm({
  hud,
  live,
  onAct,
}: {
  hud: Hud
  live: boolean
  onAct: (a: Action) => void
}) {
  const wide = useMedia('(hover: hover) and (pointer: fine)')
  const v = hud.voyage
  const o = hud.order
  const shown = hud.phase === 'result' && o
  const want = new Set(shown && hud.result !== 'right' ? o.do : [])
  const button = (a: Action, key?: string) => (
    <button
      key={a}
      type="button"
      className={`ic-key ${a} ${want.has(a) ? 'want' : ''} ${hud.wrong === a && shown ? 'wrong' : ''}`}
      aria-label={LABEL[a]}
      onClick={() => onAct(a)}
    >
      <Pictogram a={a} boat={hud.boat} />
      <span className="lb">{LABEL[a]}</span>
      {wide && key && <kbd aria-hidden="true">{key}</kbd>}
    </button>
  )
  return (
    <div className={`ic-helm ${live ? 'live' : ''}`}>
      <div className="cross">
        {button('arriba', '↑')}
        {button('babor', '←')}
        <span className="wheel" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="13" />
            <circle cx="24" cy="24" r="4" />
            <path d="M24 3V45M3 24H45M9 9L39 39M39 9L9 39" />
          </svg>
        </span>
        {button('estribor', '→')}
        {button('abajo', '↓')}
      </div>
      <div className="speed">
        {button('rapido', 'F')}
        {button('despacio', 'S')}
        {button('alto', 'X')}
      </div>
      {v.tools.length > 0 && (
        <div className="tools">
          {v.tools.map((a, i) => button(a, String(i + 1)))}
        </div>
      )}
    </div>
  )
}

// --- Home again ---

function End({
  hud,
  officer,
  before,
  onAgain,
  onNext,
  onLog,
}: {
  hud: Hud
  officer: boolean
  before: number
  onAgain: () => void
  onNext: (() => void) | null
  onLog: () => void
}) {
  const { hear } = useVoices()
  const v = hud.voyage
  const best = hud.home && hud.score > before
  // Enter sails again
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== 'Enter' || t?.closest('button, a')) return
      e.preventDefault()
      onAgain()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <section className="ic-over">
      <figure className="ic-plate still">
        <Harbour voyage={v} />
        <figcaption>
          <span lang="es">{v.caption}</span>
        </figcaption>
      </figure>
      <div className="ic-card ic-end">
        <p className="kick" lang="es">
          {hud.home ? '¡Hemos vuelto!' : 'Volvemos a casa'}
        </p>
        <h2>
          {hud.score} <span>poeng</span>
        </h2>
        <p className="sub">
          {hud.right} av {hud.given} ordrer fulgt i tide
          {officer ? ', som offiser' : ''}.{' '}
          {v.tools.includes('coral') && hud.home
            ? `${hud.boat.coral} ${hud.boat.coral === 1 ? 'korall' : 'koraller'} i kurven. `
            : ''}
          {hud.home
            ? best
              ? before
                ? 'Ditt beste på dette toktet!'
                : ''
              : `Ditt beste på dette toktet er ${before} poeng.`
            : ''}
        </p>
        {hud.home ? (
          hud.bonus > 0 && (
            <p className="small">
              Skroget tålte {COUNT[hud.hull] ?? hud.hull} smell til: {hud.bonus}{' '}
              poeng ekstra.
            </p>
          )
        ) : (
          <p className="ic-kind">
            Skroget tålte ikke flere smell i dag, så dere snudde. Prøv igjen –
            det går bedre for hver gang.
          </p>
        )}
        <div className="acts">
          <TodayNext page="ictineo" className="ic-btn" />
          <button type="button" className="ic-btn" onClick={onAgain}>
            <RotateCcw aria-hidden="true" /> Seil igjen
          </button>
          {onNext && (
            <button type="button" className="ic-btn ghost" onClick={onNext}>
              Neste tokt <ArrowRight aria-hidden="true" />
            </button>
          )}
          <button type="button" className="ic-link" onClick={onLog}>
            Loggboken
          </button>
          <a className="ic-link" href="#">
            Til forsiden
          </a>
        </div>
        {hud.missed.length > 0 && (
          <>
            <p className="small">Ordrene du bommet på:</p>
            <ul className="ic-missed">
              {hud.missed.map((o) => (
                <li key={o.id}>
                  <span lang="es" className="es">
                    {plain(o.line)}
                  </span>
                  <span className="no">{o.no}</span>
                  {hear !== false && (
                    <button
                      type="button"
                      className="ic-icon"
                      aria-label={`Hør «${plain(o.line)}»`}
                      onClick={() => void say(plain(o.line))}
                    >
                      <Volume2 />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
