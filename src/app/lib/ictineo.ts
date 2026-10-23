import {
  DODGE,
  LINE,
  LINES,
  ORDER,
  ORDERS,
  SPEED,
  STEER,
  VOYAGES,
} from '../data/ictineo.ts'
import type {
  Action,
  Danger,
  Line,
  Order,
  Sight,
  Voyage,
} from '../data/ictineo.ts'

// The rules of the Ictíneo and the course of a dive, apart from how it is
// drawn (games/ictineo.tsx). A voyage goes step by step (data/ictineo.ts):
// the captain's lines, his orders, and orders picked on the way, each with
// what comes at the boat. An order is followed by doing what it says before
// its time runs out, when its danger arrives: a rock, a reef, a net. Under
// water the air runs low, and the captain takes the boat up to breathe.
// A miss costs a little, a bump to the hull or a bit of air, and the third
// bump ends the dive.
//
// Time is the dive's own clock, moved on by the page every frame, so that
// it stands still while the game is paused or the page hidden.

export const CAPTAIN = 'Capitán'

export const HULL = 3
export const AIR = 100
// Below this the captain takes the boat up for air
export const AIR_LOW = 35
// Fresh air a second at the surface
const REFILL = 45
// What a miss under water costs in air, when it is not a bump
export const AIR_COST = 10
// The share of an order's time after which its danger shows the way out:
// a move made after that is seen in the picture rather than understood
export const REVEAL = 0.8
// How long a danger takes to pass the boat once the order is settled, and
// how far on it is by then
const PASS = 1.4
const PASSED = 1.6
// The depths under the surface: a dive goes to the middle one
export const DIVE_DEPTH = 2
export const DEEPEST = 3
// How fast the scenery goes by at each speed, units a second
const RUN = [0, 40, 90, 140]
// Points for each plate of the hull left at the end
const HULL_BONUS = 15

// Dangers that strike the boat when the order is missed
export const COLLISIONS: ReadonlySet<Danger> = new Set<Danger>([
  'rock-l',
  'rock-r',
  'reef',
  'bottom',
  'net',
  'keel',
  'wave',
  'quay',
])
// Dangers that show where the way out is only near the end
export const HIDDEN: ReadonlySet<Danger> = new Set<Danger>([
  'rock-l',
  'rock-r',
  'reef',
  'bottom',
  'net',
  'keel',
  'wave',
])
// Orders that take the boat all the way up
export const TOP: ReadonlySet<string> = new Set([
  'superficie',
  'aire-superficie',
  'aire-arriba',
])

export interface Boat {
  // 0 at the surface, 1–3 under water
  depth: number
  // −1 to port (further from the one looking), 0, 1 to starboard
  lane: number
  // 0 stopped, 1 slow, 2 ahead, 3 full ahead
  speed: number
  hatch: boolean
  lamp: boolean
  anchor: boolean
  coral: number
}

// At the surface and still, the hatch open where it has one to close
export const startBoat = (v: Voyage): Boat => ({
  depth: 0,
  lane: 0,
  speed: 0,
  hatch: v.tools.includes('escotilla'),
  lamp: false,
  anchor: false,
  coral: 0,
})

// The boat after a step of an order is done; `top` takes arriba to the
// surface
export function effect(b: Boat, a: Action, top = false): Boat {
  switch (a) {
    case 'babor':
      return { ...b, lane: Math.max(-1, b.lane - 1) }
    case 'estribor':
      return { ...b, lane: Math.min(1, b.lane + 1) }
    case 'arriba':
      if (top) return { ...b, depth: 0, lane: 0 }
      return b.depth === 0 ? b : { ...b, depth: Math.max(1, b.depth - 1) }
    case 'abajo':
      return {
        ...b,
        depth: b.depth === 0 ? DIVE_DEPTH : Math.min(DEEPEST, b.depth + 1),
      }
    case 'rapido':
      return { ...b, speed: b.speed === 0 ? 2 : Math.min(3, b.speed + 1) }
    case 'despacio':
      return { ...b, speed: 1 }
    case 'alto':
      return { ...b, speed: 0 }
    case 'escotilla':
      return { ...b, hatch: !b.hatch }
    case 'coral':
      return { ...b, coral: b.coral + 1 }
    case 'ancla':
      return { ...b, anchor: true }
    case 'lampara':
      return { ...b, lamp: !b.lamp }
  }
}

// Whether an order picked on the way makes sense where the boat is: a
// rock has its way out to a side the boat can still go to, a reef needs
// room above, a net room below, a ship's keel is near the surface; the
// speed can go up or down
export function fits(d: Danger, o: Order, b: Boat): boolean {
  if (b.depth === 0 || b.speed === 0) return false
  switch (d) {
    case 'rock-l':
      return b.lane > -1
    case 'rock-r':
      return b.lane < 1
    case 'reef':
      return b.depth >= 2
    case 'bottom':
      return b.depth === DEEPEST
    case 'net':
      return b.depth < DEEPEST
    case 'keel':
      return b.depth === 1
    case 'none':
      return o.do[0] === 'rapido' ? b.speed < 3 : b.speed >= 2
    default:
      return false
  }
}

// An order on the way, from the voyage's: one that fits, not the last one
// again, nor two about speed in a row, favouring those `weigh` says need
// practice
export function pickDodge(
  v: Voyage,
  b: Boat,
  last: Order | null,
  random: () => number,
  weigh?: (o: Order) => number,
): { order: Order; danger: Danger } {
  const afterSpeed = !!last && DODGE[last.id] === 'none'
  const fit = v.pool.flatMap((id) => {
    const o = ORDER[id]
    const d = DODGE[id]
    if (!o || !d || o === last) return []
    if (d === 'none' && afterSpeed) return []
    if (!fits(d, o, b)) return []
    return [{ o, d, w: (weigh?.(o) ?? 1) * (d === 'none' ? 0.4 : 1) }]
  })
  let r = random() * fit.reduce((s, f) => s + f.w, 0)
  for (const f of fit) {
    r -= f.w
    if (r <= 0) return { order: f.o, danger: f.d }
  }
  const f = fit[fit.length - 1]
  return { order: f.o, danger: f.d }
}

// How long an order gives, from how many have been given: shorter as the
// voyage goes on, longer for two steps
export function span(o: Order, given: number, v: Voyage): number {
  return Math.max(5, v.time - given * 0.08) * (o.do.length > 1 ? 1.5 : 1)
}

// The points an order earns: more the quicker, twice as many for an
// officer, who only hears it
export function gain(ok: boolean, left: number, officer: boolean): number {
  if (!ok) return 0
  return (officer ? 2 : 1) * (10 + Math.round(Math.max(0, left) * 10))
}

export type How = 'right' | 'wrong' | 'late'

export interface Evidence {
  id: string
  right: boolean
  // How much it says, as a share of what the page weighs an answer
  share: number
}

// What an order settled says of its words. A step done in time is right
// on its words; the step missed is wrong on them, fully for a wrong move
// and by half for time running out, which may be slowness as much as not
// knowing. A step done once the danger had shown the way out says
// nothing, the picture having told it.
export function evidence(
  o: Order,
  how: How,
  steps: Array<number>,
  danger: Danger,
): Array<Evidence> {
  const seen = HIDDEN.has(danger)
  const out = new Map<string, Evidence>()
  o.do.forEach((_, i) => {
    const at = steps.at(i)
    if (at !== undefined) {
      if (seen && at > REVEAL) return
      for (const id of o.keys[i]) out.set(id, { id, right: true, share: 1 })
    } else if (i === steps.length && how !== 'right') {
      const share = how === 'wrong' ? 1 : 0.5
      for (const id of o.keys[i]) out.set(id, { id, right: false, share })
    }
  })
  return [...out.values()]
}

// Every order a voyage can give, and the words they turn on
export function voyageOrders(v: Voyage): Array<Order> {
  const ids = [
    ...v.steps.flatMap((s) => (s.k === 'order' ? [s.order] : [])),
    ...v.pool,
    ...v.air,
    ...v.dive,
  ]
  return [...new Set(ids)].flatMap((id) => {
    const o = ORDER[id]
    return o ? [o] : []
  })
}

export const voyageWords = (v: Voyage): Array<string> => [
  ...new Set(voyageOrders(v).flatMap((o) => o.keys.flat())),
]

// The controls on the helm on a voyage
export const actionsOf = (v: Voyage): Array<Action> => [
  ...STEER,
  ...SPEED,
  ...v.tools,
]

// The best score of a voyage, kept with the others in bank.best
export const bestKey = (id: string) => `ictineo:${id}`

// A voyage can be sailed once the one before it has come home
export function isOpen(
  best: Record<string, number | undefined>,
  i: number,
): boolean {
  return i === 0 || (best[bestKey(VOYAGES[i - 1].id)] ?? 0) > 0
}

// Everything the captain says, for lib/spoken.ts
export function ictineoLines(): Array<{ voice: string; line: string }> {
  return [...ORDERS, ...LINES].map((x) => ({ voice: CAPTAIN, line: x.line }))
}

export interface Hud {
  phase: 'start' | 'line' | 'order' | 'result' | 'over'
  voyage: Voyage
  boat: Boat
  hull: number
  score: number
  // Orders given, and followed in time
  given: number
  right: number
  order: Order | null
  danger: Danger
  // Where the boat was when the order was given, for the danger's place
  from: Boat
  // Steps of the order done
  done: number
  result: How | null
  // What was pressed, when it was wrong
  wrong: Action | null
  gain: number
  // What the captain says that is not an order, and what he says of a bump
  line: Line | null
  remark: Line | null
  // Something seen on the way, counted so that each is shown anew
  sight: Sight | null
  sights: number
  // The water darker; the coral bed come into view
  murk: boolean
  bed: boolean
  // Bumps taken, for the scene to shake
  hits: number
  // Times up for air
  breaths: number
  missed: Array<Order>
  // Come home, and what the hull left was worth
  home: boolean
  bonus: number
}

// What changes every frame, for the page to draw without rendering
export interface Tick {
  air: number
  // The danger's way: 0 when the order is given, 1 when it reaches the
  // boat, and on past it once the order is settled
  p: number
  // The share of the order's time left; 0 when none is running
  left: number
  // How far the boat has gone, for the scenery
  run: number
}

export interface Settled {
  order: Order
  how: How
  gain: number
  evidence: Array<Evidence>
}

export interface DiveOptions {
  officer: boolean
  // Says a line of the captain's (its markup); resolves when it is said
  speak: (line: string) => Promise<void>
  onHud: (h: Hud) => void
  onTick?: (t: Tick) => void
  onSettled?: (s: Settled) => void
  onOver?: (h: Hud) => void
  random?: () => number
  // How much an order picked on the way is wanted: more for words that
  // need practice
  weigh?: (o: Order) => number
}

interface Outcome {
  how: How
  wrong?: Action
  // How far the danger had come, and the steps done (at how far each)
  p: number
  steps: Array<number>
}

interface Current {
  order: Order
  danger: Danger
  top: boolean
  t0: number
  span: number
  steps: Array<number>
  settle: (o: Outcome) => void
}

const STOP = Symbol('stop')
// The hull at an end
class Wreck extends Error {}

export class Dive {
  private now = 0
  private air = AIR
  private way = 0
  private waits: Array<{ at: number; resolve: () => void }> = []
  private current: Current | null = null
  private passing: { p0: number; t: number; hit: boolean } | null = null
  // What the crew does late, once a missed danger has struck
  private afterHit: (() => void) | null = null
  private last: Order | null = null
  private stopped = false
  private random: () => number
  private v: Voyage
  private opts: DiveOptions
  hud: Hud

  constructor(v: Voyage, opts: DiveOptions) {
    this.v = v
    this.opts = opts
    this.random = opts.random ?? Math.random
    this.hud = {
      phase: 'start',
      voyage: v,
      boat: startBoat(v),
      hull: HULL,
      score: 0,
      given: 0,
      right: 0,
      order: null,
      danger: 'none',
      from: startBoat(v),
      done: 0,
      result: null,
      wrong: null,
      gain: 0,
      line: null,
      remark: null,
      sight: null,
      sights: 0,
      murk: false,
      bed: false,
      hits: 0,
      breaths: 0,
      missed: [],
      home: false,
      bonus: 0,
    }
  }

  // Moves the clock on: the air, the way gone, the waits, and the order's
  // time
  update(dt: number) {
    if (this.stopped) return
    this.now += dt
    const b = this.hud.boat
    this.air =
      b.depth > 0
        ? Math.max(0, this.air - this.v.drain * dt)
        : Math.min(AIR, this.air + REFILL * dt)
    this.way += RUN[b.speed] * dt
    if (this.waits.length) {
      const due = this.waits.filter((w) => w.at <= this.now)
      this.waits = this.waits.filter((w) => w.at > this.now)
      for (const w of due) w.resolve()
    }
    let p = 0
    let left = 0
    const c = this.current
    if (c) {
      p = Math.max(0, (this.now - c.t0) / c.span)
      left = Math.min(1, 1 - p)
      if (p >= 1) this.settle({ how: 'late', p: 1, steps: c.steps })
    } else if (this.passing) {
      const s = this.passing
      s.t += dt
      p = s.p0 + (PASSED - s.p0) * Math.min(1, s.t / PASS)
      if (s.hit && p >= 1) {
        s.hit = false
        this.strike()
      }
    }
    this.opts.onTick?.({
      air: this.air,
      p,
      left: Math.max(0, left),
      run: this.way,
    })
  }

  // The helm: a button or a key
  act(a: Action) {
    const c = this.current
    if (!c || this.stopped) return
    const p = Math.max(0, (this.now - c.t0) / c.span)
    if (a !== c.order.do[c.steps.length]) {
      this.emit({ wrong: a })
      this.settle({ how: 'wrong', wrong: a, p, steps: c.steps })
      return
    }
    c.steps.push(p)
    this.emit({ done: c.steps.length, boat: effect(this.hud.boat, a, c.top) })
    if (c.steps.length === c.order.do.length)
      this.settle({ how: 'right', p, steps: c.steps })
  }

  stop() {
    this.stopped = true
    this.waits = []
    this.current = null
    this.passing = null
  }

  // The voyage, step by step, to its end
  async sail() {
    try {
      await this.wait(0.6)
      for (const step of this.v.steps) {
        if (step.k === 'say') {
          if (step.murk) this.emit({ murk: true })
          if (step.sight)
            this.emit({ sight: step.sight, sights: this.hud.sights + 1 })
          await this.say(step.line)
        } else if (step.k === 'order') {
          const o = ORDER[step.order]
          if (!o) continue
          if (step.bed) this.emit({ bed: true })
          const top = !!step.top || TOP.has(o.id)
          // (not on the way up, nor while diving)
          if (!top && this.hud.boat.depth > 0) await this.breathe()
          await this.give(o, step.danger ?? 'none', top)
        } else {
          for (let i = 0; i < step.n; i++) {
            await this.breathe()
            const { order, danger } = pickDodge(
              this.v,
              this.hud.boat,
              this.last,
              this.random,
              this.opts.weigh,
            )
            await this.give(order, danger, false)
          }
        }
      }
      await this.end(true)
    } catch (e) {
      if (e === STOP) return
      if (e instanceof Wreck) return await this.end(false)
      throw e
    }
  }

  // --- Within a dive ---

  private emit(patch: Partial<Hud>) {
    this.hud = { ...this.hud, ...patch }
    this.opts.onHud(this.hud)
  }

  private check() {
    if (this.stopped) throw STOP
  }

  private async wait(seconds: number): Promise<void> {
    await new Promise<void>((resolve) =>
      this.waits.push({ at: this.now + seconds, resolve }),
    )
    this.check()
  }

  // A line of the captain's, shown long enough to read even where nothing
  // is heard
  private async say(id: string, pause = 0.4) {
    const line = LINE[id]
    if (!line) return
    this.emit({
      phase: 'line',
      line,
      order: null,
      danger: 'none',
      result: null,
      remark: null,
    })
    await Promise.all([
      this.opts.speak(line.line),
      this.wait(1.2 + line.no.length * 0.04),
    ])
    this.check()
    await this.wait(pause)
  }

  // Up for air when it runs low: the captain's orders up, the fresh air,
  // and down again
  private async breathe() {
    if (this.hud.boat.depth === 0 || this.air >= AIR_LOW) return
    this.emit({ breaths: this.hud.breaths + 1 })
    for (const id of this.v.air) {
      const o = ORDER[id]
      if (o) await this.give(o, 'none', TOP.has(id))
    }
    await this.say('fresco', 0.2)
    while (this.air < AIR - 0.5) await this.wait(0.2)
    for (const id of this.v.dive) {
      const o = ORDER[id]
      if (o) await this.give(o, 'none', false)
    }
  }

  // An order, timed, with what comes at the boat
  private async give(o: Order, danger: Danger, top: boolean): Promise<boolean> {
    this.last = o
    const time = span(o, this.hud.given, this.v)
    const t0 = this.now + 0.4
    const out = await new Promise<Outcome>((settle) => {
      this.current = {
        order: o,
        danger,
        top,
        t0,
        span: time,
        steps: [],
        settle,
      }
      this.passing = null
      this.emit({
        phase: 'order',
        order: o,
        danger,
        from: this.hud.boat,
        done: 0,
        result: null,
        wrong: null,
        gain: 0,
        line: null,
        remark: null,
      })
      void this.opts.speak(o.line)
    })
    this.check()
    const ok = out.how === 'right'
    const g = gain(ok, 1 - out.p, this.opts.officer)
    this.opts.onSettled?.({
      order: o,
      how: out.how,
      gain: g,
      evidence: evidence(o, out.how, out.steps, danger),
    })
    // A miss: the danger strikes, or a bit of air is lost; then the crew
    // does late what was not done (but gathers no coral)
    const rest = o.do.slice(out.steps.length).filter((a) => a !== 'coral')
    const late = () => {
      let b = this.hud.boat
      for (const a of rest) b = effect(b, a, top)
      this.emit({ boat: b })
    }
    const strikes = !ok && COLLISIONS.has(danger)
    if (strikes) this.afterHit = late
    else if (!ok) {
      if (this.hud.boat.depth > 0) this.air = Math.max(0, this.air - AIR_COST)
      late()
    }
    this.passing = { p0: Math.min(1, out.p), t: 0, hit: strikes }
    this.emit({
      phase: 'result',
      result: out.how,
      gain: g,
      score: this.hud.score + g,
      given: this.hud.given + 1,
      right: this.hud.right + (ok ? 1 : 0),
      missed:
        ok || this.hud.missed.includes(o)
          ? this.hud.missed
          : [...this.hud.missed, o],
    })
    await this.wait(strikes ? 2 : ok ? 1.2 : 1.5)
    this.passing = null
    if (this.hud.hull <= 0) throw new Wreck()
    return ok
  }

  // A missed danger reaches the boat
  private strike() {
    const hull = this.hud.hull - 1
    const remark =
      hull > 0 ? (LINE[this.hud.hits % 2 ? 'casco' : 'ay'] ?? null) : null
    this.emit({ hull, hits: this.hud.hits + 1, remark })
    this.afterHit?.()
    this.afterHit = null
    if (remark) void this.opts.speak(remark.line)
  }

  private settle(o: Outcome) {
    const c = this.current
    if (!c) return
    this.current = null
    c.settle(o)
  }

  private async end(home: boolean) {
    this.current = null
    this.passing = null
    const bonus = home
      ? this.hud.hull * HULL_BONUS * (this.opts.officer ? 2 : 1)
      : 0
    const boat = home
      ? this.hud.boat
      : { ...this.hud.boat, depth: 0, lane: 0, speed: 1 }
    const line = home ? this.hud.line : (LINE['a-casa'] ?? null)
    this.emit({
      phase: 'over',
      home,
      bonus,
      score: this.hud.score + bonus,
      boat,
      order: null,
      danger: 'none',
      line,
      remark: null,
    })
    this.opts.onOver?.(this.hud)
    if (!home && line) await this.opts.speak(line.line)
  }
}
