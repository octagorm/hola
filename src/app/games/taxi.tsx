import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Eye,
  Hand,
  Snail,
  Star,
  Volume2,
} from 'lucide-react'
import { FIRST_STOP, FIRST_WORDS, PLACES, SAY } from '../data/taxi'
import { WORD, gloss } from '../data/words'
import { blip } from '../lib/sound'
import { stop as hush, say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { plain, tokens } from '../lib/text'
import {
  ahead,
  crossingXY,
  endOf,
  euros,
  fare,
  judge,
  pathOf,
  plan,
  spotAt,
  standing,
} from '../lib/taxi'
import { TodayNext, useBack } from '../daily'
import { Mixed, useFont, usePeek } from '../ui'
import { PASSENGERS, taxiScene } from './taxiScene'
import type { Move, Path, Point, Ride, Spot } from '../lib/taxi'
import type { Rider, TaxiScene, TaxiView } from './taxiScene'
import type { Level } from '../lib/bank'
import './taxi.css'

// Taxi: a passenger gets in and says where to, then how to get there, one
// instruction at a time and by ear: «Todo recto», «En la próxima, a la
// derecha», «En la segunda calle, a la izquierda», «Pare delante del cine,
// por favor». Steer with the arrows, one move for each crossing (and, on
// the last stretch, one for each place passed on the right, until the one
// asked for). A wrong move gets a polite complaint and the instruction
// again. A shift is five rides; each passenger gives up to five stars, one
// fewer for each wrong move and one fewer if the words were shown rather
// than heard. The town is lib/taxi.ts, its drawing taxiScene.ts: the Gran
// Vía at dusk, as on a poster of the thirties.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=Josefin+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap'

const SHIFT = 5
// The taxi waits this far short of a crossing, behind the zebra
const HOLD = 10
// Speeds in the town's units (about half a metre) a second, and how fast
// they change
const CRUISE = 34
const TURNING = 20
const ACCEL = 45
const DECEL = 70
// What a move says about the words of the instruction it follows. There
// are four moves to choose from (left, straight on, right, stop), so a move
// made right on an instruction heard says what a word picked from a few
// says: heard and understood (oír, 0.6). With the words shown, it says
// what reading them does, and a choice among four read is no more than a
// hint's worth (leer, 0.3).
const HEARD = 0.6
const READ = 0.3

const CONTROLS: Array<{
  move: Move
  key: string
  digit: string
  // The word in the bank, and the form on the button
  id: string
  es: string
  Icon: typeof ArrowLeft
}> = [
  {
    move: 'left',
    key: 'ArrowLeft',
    digit: '1',
    id: 'a la izquierda',
    es: 'izquierda',
    Icon: CornerUpLeft,
  },
  {
    move: 'straight',
    key: 'ArrowUp',
    digit: '2',
    id: 'todo recto',
    es: 'todo recto',
    Icon: ArrowUp,
  },
  {
    move: 'right',
    key: 'ArrowRight',
    digit: '3',
    id: 'a la derecha',
    es: 'derecha',
    Icon: CornerUpRight,
  },
  {
    move: 'stop',
    key: 'ArrowDown',
    digit: '4',
    id: 'parar',
    es: 'pare',
    Icon: Hand,
  },
]

const ARROWS: Record<string, string> = {
  ArrowLeft: '←',
  ArrowUp: '↑',
  ArrowRight: '→',
  ArrowDown: '↓',
}

// A point of a ride, with how far along the path it is and whose it is
interface Flat extends Point {
  s: number
  // the instruction it belongs to, and its place in it
  ii: number
  pi: number
}

interface RideState {
  ride: Ride | null
  path: Path
  flat: Array<Flat>
  s: number
  v: number
  // points answered right, in order
  cleared: number
  // the instruction being told; -1 while the passenger says where to
  at: number
  mistakes: number
  // the words shown, this instruction and this ride
  shown: boolean
  read: boolean
  // words missed in this instruction, recorded once
  missed: Set<string>
  quietUntil: number
  arrived: boolean
  spot: Spot
  recent: Array<string>
  meter: number
  // the passenger, by hat; -1 before the first
  who: number
  aboard: number | null
  rider: Rider | null
}

interface Result {
  place: string
  fare: number
  stars: number
}

const flatten = (ride: Ride, path: Path): Array<Flat> =>
  ride.instructions.flatMap((ins, ii) =>
    ins.points.map((p, pi) => ({ ...p, s: path.sOf(p), ii, pi })),
  )

// The passenger walking between the pavement and the taxi's right side
function walk(path: Path, s: number, out: boolean, who: number): Rider {
  const p = path.at(s)
  const at = (d: number) => ({
    x: p.x - Math.sin(p.a) * 1.2 + Math.cos(p.a) * d,
    y: p.y + Math.cos(p.a) * 1.2 + Math.sin(p.a) * d,
  })
  return {
    from: at(out ? 2.4 : 7),
    to: at(out ? 7.5 : 2.4),
    t0: performance.now(),
    ms: out ? 1100 : 800,
    who,
  }
}

const tokenOf = (id: string) => tokens(id.replaceAll(' ', '_'))[0]

// A word's Norwegian, its first sense
const glossOf = (id: string) => {
  const w = WORD[id]
  return w ? gloss(w) : id
}

// A word on a button or a card as the player knows it: in Norwegian until
// met, in Spanish with the Norwegian under it while learnt, then Spanish
function Word({ id, es, level }: { id: string; es: string; level: Level }) {
  if (level === 0) return <span className="tx-w no">{glossOf(id)}</span>
  return (
    <span className="tx-w">
      <b lang="es">{es}</b>
      {level === 1 && <small>{glossOf(id)}</small>}
    </span>
  )
}

export default function Taxi() {
  useFont(FONTS)
  const store = useStore()
  const { bank, levelOf } = store
  const { hear } = useVoices()
  const back = useBack('taxi')
  const peek = usePeek()
  const [phase, setPhase] = useState<'ready' | 'ride' | 'paid' | 'over'>(
    'ready',
  )
  const [ride, setRide] = useState<Ride | null>(null)
  const [rideNo, setRideNo] = useState(0)
  const [who, setWho] = useState(0)
  const [at, setAt] = useState(-1)
  // whether a move is asked for: from an instruction told until it is
  // followed to its end
  const [asked, setAsked] = useState(false)
  const [shown, setShown] = useState(false)
  const [complaint, setComplaint] = useState<string | null>(null)
  const [thanks, setThanks] = useState<string | null>(null)
  const [results, setResults] = useState<Array<Result>>([])
  const [before, setBefore] = useState(0)
  const [talking, setTalking] = useState(false)
  const [nudge, setNudge] = useState(0)

  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const anchor = useRef<HTMLSpanElement>(null)
  const meterEl = useRef<HTMLSpanElement>(null)
  const scene = useRef<TaxiScene | null>(null)
  const timers = useRef<Array<number>>([])
  const talkTurn = useRef(0)
  const first = spotAt(FIRST_STOP)
  const st = useRef<RideState>({
    ride: null,
    path: standing(first),
    flat: [],
    s: 0,
    v: 0,
    cleared: 0,
    at: -1,
    mistakes: 0,
    shown: false,
    read: false,
    missed: new Set(),
    quietUntil: 0,
    arrived: false,
    spot: first,
    recent: [],
    meter: 0,
    who: -1,
    aboard: null,
    rider: null,
  })
  // Without a Spanish voice the lines are shown, and cost nothing
  const mute = hear === false
  // The Norwegian under a sign while its word is new
  const captions: Partial<Record<string, string>> = {}
  for (const p of PLACES) if (levelOf(p.id) < 2) captions[p.id] = glossOf(p.id)
  // The latest of everything the loop and the timers call back into
  const latest = useRef({ store, phase, rideNo, results, captions, mute })
  latest.current = { store, phase, rideNo, results, captions, mute }

  const later = (f: () => void, ms: number) => {
    timers.current.push(window.setTimeout(f, ms))
  }
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      talkTurn.current++
      hush()
    },
    [],
  )

  // The passenger says lines one after another; something new said cuts
  // off what was being said
  const talk = async (lines: Array<string>, slow = false) => {
    const me = ++talkTurn.current
    setTalking(true)
    for (const line of lines) {
      if (talkTurn.current !== me) return false
      await say(plain(line), slow)
      if (talkTurn.current !== me) return false
      await new Promise((r) => setTimeout(r, 220))
    }
    if (talkTurn.current === me) setTalking(false)
    return talkTurn.current === me
  }

  // --- A ride ---

  const nextInstruction = () => {
    const s = st.current
    if (!s.ride) return
    s.at++
    s.missed = new Set()
    s.shown = latest.current.mute
    const ins = s.ride.instructions[s.at]
    const { bank: b, meet } = latest.current.store
    meet(ins.words.filter((id) => !b.cards[id]))
    setAt(s.at)
    setAsked(true)
    setShown(s.shown)
    setComplaint(null)
    void talk([ins.line])
  }

  // They get in and say where to; then the first instruction, and off
  const open = (r: Ride) =>
    talk([r.opener]).then((done) => {
      if (done && st.current.ride === r && st.current.at === -1)
        nextInstruction()
    })

  const begin = (no: number) => {
    const s = st.current
    const r = plan(s.spot, Math.random, s.recent)
    s.recent = [...s.recent, r.to.id].slice(-3)
    s.ride = r
    s.path = pathOf(r.route)
    s.flat = flatten(r, s.path)
    s.s = 0
    s.v = 0
    s.cleared = 0
    s.at = -1
    s.mistakes = 0
    s.shown = latest.current.mute
    s.read = false
    s.missed = new Set()
    s.arrived = false
    s.meter = 0
    // a new passenger, in another hat
    s.who =
      s.who < 0
        ? Math.floor(Math.random() * PASSENGERS)
        : (s.who + 1 + Math.floor(Math.random() * 2)) % PASSENGERS
    s.aboard = null
    s.rider = walk(s.path, 0, false, s.who)
    const me = s.rider
    later(() => {
      if (st.current.rider === me) st.current.aboard = me.who
    }, me.ms)
    setWho(s.who)
    setRide(r)
    setRideNo(no)
    setAt(-1)
    setAsked(false)
    setShown(s.shown)
    setComplaint(null)
    setThanks(null)
    setPhase('ride')
    if (meterEl.current) meterEl.current.textContent = euros(fare(1))
    later(() => void open(r), me.ms + 250)
  }

  const startShift = () => {
    const { bank: b, meet } = latest.current.store
    meet(FIRST_WORDS.filter((id) => !b.cards[id]))
    setResults([])
    latest.current.results = []
    setBefore(b.best.taxi ?? 0)
    begin(0)
  }

  const arrive = () => {
    const s = st.current
    const r = s.ride
    if (!r) return
    const read = s.read && !latest.current.mute
    const stars = Math.max(1, 5 - s.mistakes - (read ? 1 : 0))
    s.spot = endOf(r)
    s.aboard = null
    s.rider = walk(s.path, s.path.len, true, s.who)
    const line = SAY.thanks[Math.floor(Math.random() * SAY.thanks.length)]
    setThanks(line)
    setComplaint(null)
    setResults((rs) => [...rs, { place: r.to.id, fare: r.fare, stars }])
    setPhase('paid')
    blip('win')
    void talk([line])
  }

  const onward = () => {
    const { rideNo: no, results: rs, store: s } = latest.current
    if (no + 1 < SHIFT) {
      begin(no + 1)
      return
    }
    // the shift's stars, and a point for each passenger who gave four,
    // two for five
    const stars = rs.reduce((t, x) => t + x.stars, 0)
    s.setBest('taxi', stars)
    const pts = rs.reduce((t, x) => t + Math.max(0, x.stars - 3), 0)
    if (pts) s.points(pts)
    s.played('taxi')
    setPhase('over')
  }

  // A move, from a button or a key
  const steer = (m: Move) => {
    const s = st.current
    if (latest.current.phase !== 'ride' || !s.ride || s.at < 0) return
    if (performance.now() < s.quietUntil) return
    const p = s.flat[s.cleared] as Flat | undefined
    // nothing asked for yet: the next instruction is still to come
    if (!p || p.ii !== s.at) {
      blip('tap')
      return
    }
    const ins = s.ride.instructions[s.at]
    const verdict = judge(ins, p.pi, m)
    const { record, levelOf: lv } = latest.current.store
    const link = s.shown ? 'leer' : 'oir'
    if (verdict.ok) {
      s.cleared++
      setComplaint(null)
      blip('right')
      // the instruction followed: its words understood, but for any
      // already missed in it
      if (p.pi === ins.points.length - 1) {
        setAsked(false)
        for (const id of ins.words)
          if (!s.missed.has(id) && lv(id) > 0)
            record(id, true, s.shown ? READ : HEARD, link)
      }
      return
    }
    s.mistakes++
    s.quietUntil = performance.now() + 700
    blip('wrong')
    setNudge((n) => n + 1)
    for (const id of verdict.missed)
      if (!s.missed.has(id)) {
        s.missed.add(id)
        if (lv(id) > 0) record(id, false, s.shown ? READ : HEARD, link)
      }
    const line =
      verdict.complaint === 'early'
        ? SAY.early
        : verdict.complaint === 'notHere'
          ? SAY.notHere
          : SAY.wrong[Math.floor(Math.random() * SAY.wrong.length)]
    setComplaint(line)
    void talk([line, ins.line])
  }

  const hearAgain = (slow = false) => {
    const s = st.current
    if (!s.ride) return
    if (latest.current.phase === 'paid' && thanks) void talk([thanks], slow)
    else if (s.at < 0) {
      const r = s.ride
      void talk([r.opener], slow).then((done) => {
        if (done && st.current.ride === r && st.current.at === -1)
          nextInstruction()
      })
    } else void talk([s.ride.instructions[s.at].line], slow)
  }

  const show = () => {
    st.current.shown = true
    st.current.read = true
    setShown(true)
  }

  // --- The loop: the taxi moves, the town is drawn round it ---

  const stepTaxi = (dt: number) => {
    const s = st.current
    if (!s.ride || s.at < 0 || latest.current.phase !== 'ride') return
    const next = s.flat[s.cleared] as Flat | undefined
    const target = next ? next.s - (next.lot ? 0 : HOLD) : s.path.len
    // slower through a turn, from a little before it to a little after
    const turning = s.flat.some(
      (p, k) =>
        k < s.cleared &&
        !p.lot &&
        p.expect !== 'straight' &&
        p.s - s.s < 14 &&
        s.s - p.s < 18,
    )
    const vmax = turning ? TURNING : CRUISE
    const dist = target - s.s
    if (dist <= 0.01) s.v = 0
    else {
      s.v = Math.min(vmax, Math.sqrt(2 * DECEL * dist), s.v + ACCEL * dt)
      s.s = Math.min(target, s.s + s.v * dt)
    }
    // the instruction behind: on to the next
    const ins = s.ride.instructions
    if (s.at < ins.length - 1) {
      const mine = s.flat.filter((p) => p.ii === s.at)
      const last = mine[mine.length - 1]
      const done = s.flat.indexOf(last) < s.cleared
      if (done && s.s >= last.s + 6) nextInstruction()
    }
    if (!next && s.s >= s.path.len - 0.01 && !s.arrived) {
      s.arrived = true
      arrive()
    }
  }

  const viewOf = (): TaxiView => {
    const s = st.current
    const pose = s.path.at(s.s)
    const ph = latest.current.phase
    const next = s.flat[s.cleared] as Flat | undefined
    // the next turn already answered, coming up
    const coming = s.flat.find(
      (p, k) => k < s.cleared && p.s + 4 > s.s && !p.lot,
    )
    const blink =
      coming && coming.expect !== 'straight' && coming.s - s.s < 60
        ? (coming.expect as 'left' | 'right')
        : null
    let mark: TaxiView['mark'] = null
    if (ph === 'ride' && s.ride && next && next.ii === s.at) {
      if (next.lot) {
        const p = s.path.at(next.s)
        mark = {
          x: p.x + Math.cos(p.a) * 5.6,
          y: p.y + Math.sin(p.a) * 5.6,
          r: 2.6,
        }
      } else {
        const c = ahead(s.ride.route.edges[next.edge])
        mark = { ...crossingXY(c.i, c.j), r: 6.2 }
      }
    }
    const riding = ph === 'ride' && s.at >= 0
    const waiting = riding && s.v < 1 && !!next
    return {
      pose,
      blink: riding ? blink : null,
      brake:
        waiting ||
        (riding &&
          s.v > 0 &&
          !!next &&
          next.s - (next.lot ? 0 : HOLD) - s.s < 14),
      hazard: !riding,
      mark,
      rider: s.rider,
      aboard: s.aboard,
      captions: latest.current.captions,
    }
  }

  useEffect(() => {
    const c = canvas.current
    const b = box.current
    if (!c || !b) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sc = taxiScene(c, still)
    scene.current = sc
    let drawn = false
    // (a canvas resized is blank until drawn again: at once, before it is
    // seen)
    const measure = () => {
      sc.resize(b.clientWidth, b.clientHeight)
      if (drawn) sc.draw(performance.now(), viewOf())
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(b)
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(b)
    let raf = 0
    let last = performance.now()
    // A taxi that has stood still a while, with nobody walking, is drawn
    // half as often: what moves then (a ring, the lights) moves slowly
    let movedAt = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const s = st.current
      if (s.v > 0.01 || (s.rider && now - s.rider.t0 < s.rider.ms + 300))
        movedAt = now
      const gap = now - movedAt > 1500 ? 32 : 15
      if (now - last < gap && drawn) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if ((!visible || document.hidden) && drawn) return
      stepTaxi(dt)
      // the meter, a street at a time
      if (s.ride && latest.current.phase === 'ride') {
        const streets = s.path.starts.filter((x) => x <= s.s + 0.01).length
        if (streets !== s.meter) {
          s.meter = streets
          if (meterEl.current)
            meterEl.current.textContent = euros(fare(streets))
        }
      }
      sc.draw(now, viewOf())
      drawn = true
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
    // the loop reads everything through refs
  }, [])

  // A sign tapped in the town: its word's card
  const onTown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const sc = scene.current
    const a = anchor.current
    if (!sc || !a) return
    const r = e.currentTarget.getBoundingClientRect()
    const hit = sc.signAt(e.clientX - r.left, e.clientY - r.top)
    if (!hit) return
    a.style.left = `${hit.x}px`
    a.style.top = `${hit.y}px`
    a.style.width = `${hit.w}px`
    a.style.height = `${hit.h}px`
    peek(tokenOf(hit.id), a)
  }

  // Arrows and 1–4 steer, Space says it again, Enter starts and goes on
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select')) return
      const onButton = !!t?.closest('button, a')
      if (phase === 'ready' || phase === 'over' || phase === 'paid') {
        if (e.key !== 'Enter' || onButton) return
        e.preventDefault()
        if (phase === 'paid') onward()
        else startShift()
        return
      }
      if (e.key === ' ') {
        if (onButton) return
        e.preventDefault()
        hearAgain()
        return
      }
      const c = CONTROLS.find((x) => x.key === e.key || x.digit === e.key)
      if (!c) return
      e.preventDefault()
      steer(c.move)
      const el = document.querySelector<HTMLElement>(`[data-move="${c.move}"]`)
      if (el) {
        el.classList.remove('pressed')
        void el.offsetWidth
        el.classList.add('pressed')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const ins = ride && at >= 0 ? ride.instructions[at] : null
  const line =
    phase === 'paid' || phase === 'over'
      ? thanks
      : ins
        ? ins.line
        : ride?.opener
  const lineShown = phase !== 'ride' || shown
  const total = results.reduce((t, x) => t + x.fare, 0)
  const stars = results.reduce((t, x) => t + x.stars, 0)
  const lastResult = results[results.length - 1] as Result | undefined

  return (
    <div className="tx">
      <div className="tx-col">
        <header className="tx-top">
          <a className="tx-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            Taxi<small>Taxi</small>
          </h1>
          {phase !== 'ready' && (
            <div className="tx-tally">
              <span
                className="tx-dots"
                aria-label={`Passasjer ${Math.min(rideNo + 1, SHIFT)} av ${SHIFT}`}
              >
                {Array.from({ length: SHIFT }, (_, i) => (
                  <i
                    key={i}
                    className={
                      i < results.length ? 'done' : i === rideNo ? 'now' : ''
                    }
                  />
                ))}
              </span>
              <span className="tx-total" aria-label="Tjent så langt">
                {euros(total)}
              </span>
            </div>
          )}
        </header>

        <div
          ref={box}
          className={`tx-stage ${nudge % 2 ? 'jolt-a' : nudge ? 'jolt-b' : ''}`}
        >
          <canvas
            ref={canvas}
            className="tx-town"
            onClick={onTown}
            aria-label="Byen sett bakfra taxien"
            role="img"
          />
          <span ref={anchor} className="tx-anchor" data-peek="" />
          <div className="tx-grain" aria-hidden="true" />

          {(phase === 'ride' || phase === 'paid') && ride && (
            <div className="tx-bubble" key={rideNo}>
              <Portrait who={who} talking={talking} />
              <div className="tx-say">
                {complaint && phase === 'ride' && (
                  <p className="tx-complaint" lang="es">
                    <Mixed line={complaint} />
                  </p>
                )}
                {line && lineShown ? (
                  <p className="tx-line" lang="es">
                    <Mixed line={line} />
                  </p>
                ) : (
                  <p className="tx-listen">
                    <span>Lytt, og styr.</span>
                    <button type="button" className="tx-show" onClick={show}>
                      <Eye /> Vis teksten
                    </button>
                  </p>
                )}
              </div>
              <div className="tx-hear">
                <button
                  type="button"
                  className={`tx-icon ${talking ? 'on' : ''}`}
                  onClick={() => hearAgain()}
                  aria-label="Hør igjen"
                  title="Hør igjen (mellomrom)"
                >
                  <Volume2 />
                </button>
                <button
                  type="button"
                  className="tx-icon"
                  onClick={() => hearAgain(true)}
                  aria-label="Hør det sakte"
                  title="Hør det sakte"
                >
                  <Snail />
                </button>
              </div>
            </div>
          )}

          {(phase === 'ride' || phase === 'paid') && (
            <div className="tx-meter" aria-label="Taksameteret">
              <small>Tarifa</small>
              <span ref={meterEl}>{euros(fare(1))}</span>
            </div>
          )}
        </div>

        {/* what is done under the town: the start, the controls, a fare
            paid, the shift's end */}
        <div className="tx-dock">
          {phase === 'ready' && (
            <section className="tx-card tx-intro">
              <p>
                Du kjører taxi i en by som Madrid. Passasjeren sier på spansk
                hvor turen går, og så veien dit, litt om gangen: lytt, og styr
                med pilene i hvert kryss. Til slutt stopper du foran stedet du
                ble bedt om.
              </p>
              <p className="soft">
                Fem passasjerer på en vakt, og opptil fem stjerner fra hver: én
                mindre for hvert feil valg, og én mindre om du viser teksten.
              </p>
              <div className="tx-acts">
                <button type="button" className="tx-btn" onClick={startShift}>
                  Start vakten <ArrowRight />
                </button>
              </div>
              {bank.best.taxi ? (
                <p className="tx-best">
                  Beste vakt: {bank.best.taxi} av {SHIFT * 5} stjerner
                </p>
              ) : null}
            </section>
          )}

          {phase === 'ride' && (
            <div className="tx-controls">
              {CONTROLS.map((c) => (
                <button
                  key={c.move}
                  type="button"
                  data-move={c.move}
                  className={`tx-move ${c.move}`}
                  disabled={!asked}
                  aria-label={glossOf(c.id)}
                  onPointerDown={(e) => {
                    // at once on a touch, without waiting for the click
                    if (e.pointerType === 'mouse' && e.button !== 0) return
                    e.preventDefault()
                    steer(c.move)
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return
                    e.preventDefault()
                    e.stopPropagation()
                    steer(c.move)
                  }}
                >
                  <kbd>{ARROWS[c.key]}</kbd>
                  <c.Icon className="ic" />
                  <Word id={c.id} es={c.es} level={levelOf(c.id)} />
                </button>
              ))}
            </div>
          )}

          {phase === 'ride' && (
            <p className="tx-keys">
              <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> svinger eller kjører rett
              fram i neste kryss, <kbd>↓</kbd> stopper, og <kbd>mellomrom</kbd>{' '}
              sier det igjen. Den gylne ringen viser hvor neste valg gjelder.
            </p>
          )}

          {phase === 'paid' && lastResult && (
            <section className="tx-card tx-paid">
              <div className="fare">
                <small>Å betale</small>
                <b>{euros(lastResult.fare)}</b>
              </div>
              <Stars n={lastResult.stars} />
              <button type="button" className="tx-btn" onClick={onward}>
                {rideNo + 1 < SHIFT ? 'Neste passasjer' : 'Avslutt vakten'}{' '}
                <ArrowRight />
              </button>
            </section>
          )}

          {phase === 'over' && (
            <section className="tx-card tx-over">
              <small className="kicker">Vakten er over</small>
              <b className="sum">{euros(total)}</b>
              <p className="soft">
                {stars} av {SHIFT * 5} stjerner
                {stars > before && before > 0 ? ' · ny rekord' : ''}
              </p>
              <ul className="tx-rides">
                {results.map((r, i) => (
                  <li key={i}>
                    <span className="where" lang="es">
                      <Mixed line={r.place.replaceAll(' ', '_')} />
                    </span>
                    <span className="cost">{euros(r.fare)}</span>
                    <Stars n={r.stars} small />
                  </li>
                ))}
              </ul>
              <div className="tx-acts">
                <TodayNext page="taxi" className="tx-btn" />
                <button
                  type="button"
                  className="tx-btn ghost"
                  onClick={startShift}
                >
                  Ny vakt
                </button>
                <a className="tx-btn ghost" href="#">
                  Til forsiden
                </a>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Stars({ n, small = false }: { n: number; small?: boolean }) {
  return (
    <span
      className={`tx-stars ${small ? 'small' : ''}`}
      aria-label={`${n} av 5 stjerner`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={i < n ? 'on' : ''} />
      ))}
    </span>
  )
}

// The passenger, as a silhouette against the dusk in a round frame, in
// the hat drawn in the back of the taxi
function Portrait({ who, talking }: { who: number; talking: boolean }) {
  const hat = who % PASSENGERS
  const ink = '#141a3f'
  return (
    <span className={`tx-face ${talking ? 'talking' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <defs>
          <linearGradient id="tx-dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f3f8c" />
            <stop offset="0.6" stopColor="#c5657a" />
            <stop offset="1" stopColor="#f39a52" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#tx-dusk)" />
        <path
          d="M9 64C11 49 21 44.5 32 44.5S53 49 55 64Z"
          fill={['#3b4a7a', '#7a4b3a', '#4d5a4a', '#5a4a6e', '#6e6252'][hat]}
        />
        <path
          d="M9 64C11 49 21 44.5 32 44.5S53 49 55 64Z"
          fill={ink}
          opacity=".55"
        />
        <rect x="28" y="35" width="8" height="11" fill={ink} />
        <ellipse cx="32" cy="30" rx="8.5" ry="10" fill={ink} />
        {hat === 0 && (
          <>
            <ellipse cx="32" cy="22" rx="14" ry="3" fill={ink} />
            <path
              d="M23 22V14Q23 10.5 27 10.5L32 12.5 37 10.5Q41 10.5 41 14V22Z"
              fill={ink}
            />
            <rect x="23" y="18.5" width="18" height="2.4" fill="#e0ac45" />
          </>
        )}
        {hat === 1 && (
          <path
            d="M21.5 23.5Q22.5 13 33 12.8Q43.5 13.4 44 20.5L51 23Q40 25.6 21.5 23.5Z"
            fill={ink}
          />
        )}
        {hat === 2 && (
          <>
            <ellipse cx="32" cy="22.5" rx="13" ry="2.6" fill={ink} />
            <path d="M22.5 22.5A9.5 10.5 0 0 1 41.5 22.5Z" fill={ink} />
          </>
        )}
        {hat === 3 && (
          <ellipse
            cx="33.5"
            cy="20"
            rx="12"
            ry="5"
            transform="rotate(-9 33.5 20)"
            fill={ink}
          />
        )}
        {hat === 4 && (
          <>
            <ellipse cx="32" cy="22" rx="15" ry="2.8" fill="#d9c79a" />
            <rect
              x="23"
              y="14.5"
              width="18"
              height="7.5"
              rx="1"
              fill="#d9c79a"
            />
            <rect x="23" y="18.6" width="18" height="2.2" fill={ink} />
          </>
        )}
      </svg>
    </span>
  )
}
