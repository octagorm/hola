import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import { PICTURES } from '../data/pictures'
import { WORD, gloss } from '../data/words'
import { blip } from '../lib/sound'
import { stop as hush, say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { plain, tokens } from '../lib/text'
import {
  MAP,
  PITCH,
  ahead,
  crossingXY,
  endOf,
  euros,
  judge,
  movesAt,
  pathOf,
  plan,
  spotAt,
  standing,
} from '../lib/taxi'
import { TodayNext, useBack } from '../daily'
import { Mixed, useFont, usePeek } from '../ui'
import { Cab, FlatMap, Roads, lotMiddle } from './taxiMap'
import type { Move, Path, Point, Ride, Spot } from '../lib/taxi'
import type { Level } from '../lib/bank'
import './taxi.css'

// Taxi: a passenger gets in and says where to, then how to get there, one
// instruction at a time and by ear: «Todo recto», «En la próxima, a la
// derecha», «En la segunda calle, a la izquierda», «Pare delante del cine,
// por favor». The town is a map seen from straight above, a travel poster's
// town plan (taxiMap.tsx, or the painting taxi/map once it is made), and it
// turns under the taxi, which always points up the screen, so that left
// and right are the player's own. Steer with four big buttons, one move for
// each crossing (and, on the last stretch, one for each place passed on
// the right, until the one asked for); a move that cannot be made there
// is greyed out. A wrong move gets a polite complaint and the instruction
// again. A shift is five rides; each passenger gives up to five stars, one
// fewer for each wrong move and one fewer if the words were shown rather
// than heard, and shows under their portrait what they would give as the
// ride goes.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=Josefin+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap'

const SHIFT = 5
// The passengers, by the hat they wear
const PASSENGERS = 5
// The painted map, once it is made
const PAINTED = PICTURES.has('taxi/map') ? '/taxi/map.webp' : null
// The taxi waits this far short of a crossing, behind the zebra
const HOLD = 12
// Speeds in the town's units (about half a metre) a second, and how fast
// they change
const CRUISE = 34
const TURNING = 20
const ACCEL = 45
const DECEL = 70
// The taxi's size on the map, and where it stands on the screen: in the
// middle, two thirds of the way down, so that more of the way ahead shows
const CAR_W = 8
const CAR_L = 15
const CAR_Y = 0.68
// What a move says about the words of the instruction it follows. There
// are four moves to choose from (left, straight on, right, stop), so a move
// made right on an instruction heard says what a word picked from a few
// says: understood (leer, 0.6). With the words shown, it says what
// reading them does, and a choice among four read is no more than a
// hint's worth (0.3).
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

// A point of a ride, with how far along the path it is and whose it is
interface Flat extends Point {
  s: number
  // the instruction it belongs to, and its place in it
  ii: number
  pi: number
}

// The passenger walking between the pavement and the taxi
interface Rider {
  from: { x: number; y: number }
  to: { x: number; y: number }
  t0: number
  ms: number
  who: number
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
  // the passenger, by hat; -1 before the first
  who: number
  rider: Rider | null
  // the way the map is turned, following the taxi's heading
  turn: number | null
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

// The passenger walking from the pavement on the right into the taxi, or
// out of it
function walk(path: Path, s: number, out: boolean, who: number): Rider {
  const p = path.at(s)
  const at = (d: number) => ({
    x: p.x + Math.cos(p.a) * d,
    y: p.y + Math.sin(p.a) * d,
  })
  return {
    from: at(out ? 1 : 8),
    to: at(out ? 9 : 1),
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

// The shortest way round from one angle to another
const toward = (from: number, to: number) => {
  let d = (to - from) % (2 * Math.PI)
  if (d > Math.PI) d -= 2 * Math.PI
  if (d < -Math.PI) d += 2 * Math.PI
  return d
}

// A word on a button as the player knows it: in Norwegian until met, in
// Spanish with the Norwegian under it while learnt, then Spanish
function Word({ id, es, level }: { id: string; es: string; level: Level }) {
  if (level === 0) return <span className="tx-w no">{glossOf(id)}</span>
  return (
    <span className="tx-w">
      <b lang="es">{es}</b>
      {level === 1 && <small>{glossOf(id)}</small>}
    </span>
  )
}

const HATS = ['#3b4a7a', '#8a4e36', '#4d6a52', '#6a4a72', '#6e6252']

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
  // the moves the point ahead can take, while one is asked for: from an
  // instruction told until it is followed to its end
  const [allowed, setAllowed] = useState<Array<Move>>([])
  const [shown, setShown] = useState(false)
  const [complaint, setComplaint] = useState<string | null>(null)
  const [thanks, setThanks] = useState<string | null>(null)
  const [results, setResults] = useState<Array<Result>>([])
  const [before, setBefore] = useState(0)
  const [talking, setTalking] = useState(false)
  const [nudge, setNudge] = useState(0)
  // the stars this passenger would give, as it stands
  const [rating, setRating] = useState(5)
  const [blink, setBlink] = useState<'left' | 'right' | null>(null)
  // the map's scale, CSS pixels to the town's unit, and the stage's size
  const [view, setView] = useState({ k: 2, w: 360, h: 420 })

  const box = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const car = useRef<HTMLDivElement>(null)
  const markEl = useRef<HTMLSpanElement>(null)
  const riderEl = useRef<HTMLSpanElement>(null)
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
    who: -1,
    rider: null,
    turn: null,
  })
  // Without a Spanish voice the lines are shown, and cost nothing
  const mute = hear === false
  // The latest of everything the loop and the timers call back into
  const latest = useRef({ store, phase, rideNo, results, mute, view, blink })
  latest.current = { store, phase, rideNo, results, mute, view, blink }

  // Five, one fewer for each wrong move and one if the words were read,
  // never none
  const starsNow = () => {
    const s = st.current
    const read = s.read && !latest.current.mute
    return Math.max(1, 5 - s.mistakes - (read ? 1 : 0))
  }

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

  // The moves the next point can take, if it belongs to the instruction
  // being told
  const pending = () => {
    const s = st.current
    const p = s.flat[s.cleared] as Flat | undefined
    if (!s.ride || !p || p.ii !== s.at) return null
    return p
  }
  const ask = () => {
    const p = pending()
    const r = st.current.ride
    setAllowed(p && r ? movesAt(r.route, p) : [])
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
    ask()
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
    // a new passenger, in another hat
    s.who =
      s.who < 0
        ? Math.floor(Math.random() * PASSENGERS)
        : (s.who + 1 + Math.floor(Math.random() * 2)) % PASSENGERS
    s.rider = walk(s.path, 0, false, s.who)
    const me = s.rider
    later(() => {
      if (st.current.rider === me) st.current.rider = null
    }, me.ms)
    setWho(s.who)
    setRide(r)
    setRideNo(no)
    setAt(-1)
    setAllowed([])
    setShown(s.shown)
    setComplaint(null)
    setThanks(null)
    setRating(5)
    setPhase('ride')
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
    const stars = starsNow()
    s.spot = endOf(r)
    s.rider = walk(s.path, s.path.len, true, s.who)
    const me = s.rider
    later(() => {
      if (st.current.rider === me) st.current.rider = null
    }, me.ms + 400)
    const line = SAY.thanks[Math.floor(Math.random() * SAY.thanks.length)]
    setThanks(line)
    setComplaint(null)
    setAllowed([])
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
    const p = pending()
    // nothing asked for yet, or a move that cannot be made here
    if (!p || !movesAt(s.ride.route, p).includes(m)) {
      blip('tap')
      return
    }
    const ins = s.ride.instructions[s.at]
    const verdict = judge(ins, p.pi, m)
    const { record, levelOf: lv } = latest.current.store
    if (verdict.ok) {
      s.cleared++
      setComplaint(null)
      blip('right')
      ask()
      // the instruction followed: its words understood, but for any
      // already missed in it
      if (p.pi === ins.points.length - 1)
        for (const id of ins.words)
          if (!s.missed.has(id) && lv(id) > 0)
            record(id, true, s.shown ? READ : HEARD, 'leer')
      return
    }
    s.mistakes++
    setRating(starsNow())
    s.quietUntil = performance.now() + 700
    blip('wrong')
    setNudge((n) => n + 1)
    for (const id of verdict.missed)
      if (!s.missed.has(id)) {
        s.missed.add(id)
        if (lv(id) > 0) record(id, false, s.shown ? READ : HEARD, 'leer')
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
    setRating(starsNow())
  }

  // --- The loop: the taxi moves, the map turns and slides under it ---

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

  // Everything that moves, placed: the map under the taxi, the ring where
  // the next move is asked for, the passenger walking
  const place = (dt: number, now: number) => {
    const s = st.current
    const { k, w, h } = latest.current.view
    const pose = s.path.at(s.s)
    // the map turns after the taxi, a little behind it through a bend
    s.turn =
      s.turn === null
        ? pose.a
        : s.turn + toward(s.turn, pose.a) * Math.min(1, dt * 7)
    const turn = s.turn
    const el = world.current
    if (el) {
      el.style.transform = `translate(${w / 2}px, ${h * CAR_Y}px) rotate(${-turn}rad) translate(${-pose.x * k}px, ${-pose.y * k}px)`
      el.style.setProperty('--turn', `${turn}rad`)
    }
    if (car.current)
      car.current.style.transform = `translate(-50%, -50%) rotate(${pose.a - turn}rad)`
    // the ring
    const ph = latest.current.phase
    const m = markEl.current
    const next = s.flat[s.cleared] as Flat | undefined
    if (m) {
      if (ph === 'ride' && s.ride && next && next.ii === s.at) {
        let x: number
        let y: number
        let r: number
        if (next.lot) {
          const p = s.path.at(next.s)
          x = p.x + Math.cos(p.a) * 6.5
          y = p.y + Math.sin(p.a) * 6.5
          r = 4
        } else {
          const c = crossingXY(
            ahead(s.ride.route.edges[next.edge]).i,
            ahead(s.ride.route.edges[next.edge]).j,
          )
          x = c.x
          y = c.y
          r = 9.5
        }
        m.style.display = 'block'
        m.style.left = `${x * k}px`
        m.style.top = `${y * k}px`
        m.style.width = m.style.height = `${2 * r * k}px`
      } else m.style.display = 'none'
    }
    // the passenger walking
    const re = riderEl.current
    if (re) {
      const rd = s.rider
      if (rd) {
        const t = Math.min(1, (now - rd.t0) / rd.ms)
        const e = t * t * (3 - 2 * t)
        re.style.display = 'block'
        re.style.left = `${(rd.from.x + (rd.to.x - rd.from.x) * e) * k}px`
        re.style.top = `${(rd.from.y + (rd.to.y - rd.from.y) * e) * k}px`
        re.style.setProperty('--hat', HATS[rd.who % HATS.length])
      } else re.style.display = 'none'
    }
    // the indicator for a turn already taken, coming up
    const coming = s.flat.find(
      (p, n) => n < s.cleared && p.s + 4 > s.s && !p.lot,
    )
    const b =
      ph === 'ride' &&
      coming &&
      coming.expect !== 'straight' &&
      coming.s - s.s < 60
        ? (coming.expect as 'left' | 'right')
        : null
    if (b !== latest.current.blink) {
      latest.current.blink = b
      setBlink(b)
    }
  }

  // The stage's size, and the scale: about two blocks across the narrower
  // side
  useLayoutEffect(() => {
    const b = box.current
    if (!b) return
    const measure = () => {
      const w = b.clientWidth
      const h = b.clientHeight
      const k = Math.max(1.6, Math.min(3, Math.min(w, h) / (2.1 * PITCH)))
      setView((v) => (v.w === w && v.h === h && v.k === k ? v : { k, w, h }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(b)
    return () => ro.disconnect()
  }, [])

  // the map placed again at once when the stage changes size
  useLayoutEffect(() => {
    place(0, performance.now())
  })

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (document.hidden) return
      stepTaxi(dt)
      place(dt, now)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // the loop reads everything through refs
  }, [])

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
      if (el && !el.hasAttribute('disabled')) {
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
  const { k } = view

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
          )}
        </header>

        {(phase === 'ride' || phase === 'paid') && ride && (
          <div className="tx-bubble" key={rideNo}>
            <div className="tx-who">
              <Portrait who={who} talking={talking} />
              {phase === 'ride' && <Stars n={rating} tiny />}
            </div>
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
                <button type="button" className="tx-show" onClick={show}>
                  <Eye /> Vis teksten
                </button>
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
                className="tx-icon slow"
                onClick={() => hearAgain(true)}
                aria-label="Hør det sakte"
                title="Hør det sakte"
              >
                <Snail />
              </button>
            </div>
          </div>
        )}

        <div
          ref={box}
          className={`tx-stage ${nudge % 2 ? 'jolt-a' : nudge ? 'jolt-b' : ''}`}
          role="group"
          aria-label="Kartet over byen"
        >
          <div
            ref={world}
            className="tx-world"
            style={{ width: MAP * k, height: MAP * k }}
          >
            {PAINTED ? (
              <>
                <img className="tx-flat" src={PAINTED} alt="" />
                <Roads />
              </>
            ) : (
              <FlatMap />
            )}
            <span ref={markEl} className="tx-mark" />
            <span ref={riderEl} className="tx-rider" />
            {PLACES.map((p) => {
              const c = lotMiddle(p.lot)
              return (
                <button
                  key={p.id}
                  type="button"
                  className="tx-sign"
                  data-peek=""
                  data-place={p.id}
                  style={{ left: c.x * k, top: c.y * k }}
                  onClick={(e) => peek(tokenOf(p.id), e.currentTarget)}
                >
                  <b lang="es">{p.sign}</b>
                  {levelOf(p.id) < 2 && <small>{glossOf(p.id)}</small>}
                </button>
              )
            })}
          </div>
          <div
            ref={car}
            className="tx-car"
            style={{
              left: view.w / 2,
              top: view.h * CAR_Y,
              width: CAR_W * k,
              height: CAR_L * k,
            }}
          >
            <Cab blink={blink} />
          </div>
        </div>

        {/* what is done under the map: the start, the controls, a fare
            paid, the shift's end */}
        <div className="tx-dock">
          {phase === 'ready' && (
            <section className="tx-card tx-intro">
              <p>
                Du kjører taxi i en liten spansk by. Passasjeren sier på spansk
                hvor turen går, og så veien dit, litt om gangen. Lytt, og trykk
                i hvert kryss: til venstre, rett fram eller til høyre. Til slutt
                stopper du foran stedet du ble bedt om.
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
                  disabled={!allowed.includes(c.move)}
                  aria-label={glossOf(c.id)}
                  aria-keyshortcuts={c.key}
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
                  <c.Icon className="ic" />
                  <Word id={c.id} es={c.es} level={levelOf(c.id)} />
                </button>
              ))}
            </div>
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

function Stars({
  n,
  small = false,
  tiny = false,
}: {
  n: number
  small?: boolean
  tiny?: boolean
}) {
  return (
    <span
      className={`tx-stars ${small ? 'small' : ''} ${tiny ? 'tiny' : ''}`}
      aria-label={`${n} av 5 stjerner`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={i < n ? 'on' : ''} />
      ))}
    </span>
  )
}

// The passenger, as a silhouette against a poster's evening sky in a round
// frame, in their hat
function Portrait({ who, talking }: { who: number; talking: boolean }) {
  const hat = who % PASSENGERS
  const ink = '#24323f'
  return (
    <span className={`tx-face ${talking ? 'talking' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <defs>
          <linearGradient id="tx-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fb3a4" />
            <stop offset="0.65" stopColor="#e8c79a" />
            <stop offset="1" stopColor="#e39a68" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#tx-sky)" />
        <path d="M9 64C11 49 21 44.5 32 44.5S53 49 55 64Z" fill={HATS[hat]} />
        <path
          d="M9 64C11 49 21 44.5 32 44.5S53 49 55 64Z"
          fill={ink}
          opacity=".45"
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
            <rect x="23" y="18.5" width="18" height="2.4" fill="#c9583a" />
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
            <ellipse cx="32" cy="22" rx="15" ry="2.8" fill="#e6d3a3" />
            <rect
              x="23"
              y="14.5"
              width="18"
              height="7.5"
              rx="1"
              fill="#e6d3a3"
            />
            <rect x="23" y="18.6" width="18" height="2.2" fill={ink} />
          </>
        )}
      </svg>
    </span>
  )
}
