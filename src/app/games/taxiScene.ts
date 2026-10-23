import { NX, NY, PLACES } from '../data/taxi'
import { LOT, ORIGIN, PITCH, STREET, WALK, crossingXY } from '../lib/taxi'
import type { Kind, Place } from '../data/taxi'
import type { Pose } from '../lib/taxi'

// Taxi's town at street level, as a poster of the Gran Vía at dusk: the
// camera rides behind the taxi, a little to its right, and the town is
// drawn round it each frame in flat colours. Far to near: the sky (the
// sunset in the west, so that the way the taxi faces can be told by it),
// the town's skyline, the streets with their zebras and the lamps' light
// on the wet asphalt, then the blocks, each with its lamps, trees and
// buildings in the order they stand from the camera, and last the taxi.
// The places have their signs at the corner where they stand, with a
// picture of what they are (a dome, a bell tower, a green cross …).
// Nothing in the town moves but the taxi, its passenger and its lights.

// --- Colours ---

const C = {
  fog: '#4a4583',
  skyline: '#3c3a76',
  asphalt: '#252948',
  asphaltNear: '#2c2f52',
  walk: '#55516f',
  kerb: '#8a85a5',
  zebra: '#d9d1dc',
  dash: '#d6c48c',
  lit: '#ffd27a',
  shop: '#ffbe62',
  dark: '#2a3058',
  iron: '#1f2238',
  shade: '#33366a',
  glow: '#ffb35c',
  post: '#151830',
  globe: '#fff3cc',
  tree: '#17302f',
  treeLit: '#2c4f47',
  gold: '#e0ac45',
  navy: '#1b2350',
  cream: '#f3ead6',
  red: '#c8372d',
  slate: '#2a2e55',
}

const FACADES = [
  '#efdcb4',
  '#e8cd9f',
  '#dfb781',
  '#cf9775',
  '#e9e1d0',
  '#d9c4a2',
  '#c9a98a',
  '#e4c8a8',
]

// Colours mixed, cached by a 32nd of the way
const MIXED = new Map<string, string>()
const channels = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]
function mix(a: string, b: string, t: number): string {
  const q = Math.max(0, Math.min(32, Math.round(t * 32)))
  if (q === 0) return a
  if (q === 32) return b
  const key = `${a}${b}${q}`
  let s = MIXED.get(key)
  if (!s) {
    const x = channels(a)
    const y = channels(b)
    s = `#${x
      .map((v, i) =>
        Math.round(v + ((y[i] - v) * q) / 32)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`
    MIXED.set(key, s)
  }
  return s
}

// --- The camera: behind the taxi, a little to its right, looking level ---

const CAMZ = 7.2
const SIDE = 1.8
const NEAR = 0.9
// Fog from here to there, and nothing drawn past it
const FOG0 = 60
const FOG1 = 330
const FAR = 345
// The sun has set in the west
const SUN = -Math.PI / 2

const fogOf = (d: number) =>
  d <= FOG0 ? 0 : d >= FOG1 ? 1 : ((d - FOG0) / (FOG1 - FOG0)) ** 0.85

const wrap = (a: number) => {
  let x = a % (2 * Math.PI)
  if (x > Math.PI) x -= 2 * Math.PI
  if (x <= -Math.PI) x += 2 * Math.PI
  return x
}

// --- The town: blocks of four buildings, a lot each ---

// Ground floor, and each floor above it
const GROUND = 9
const FLOOR = 6
// A window's bay along a facade, and the window in it
const BAY = 4.8
const WIN_W = 1.9
const WIN_H = 3.5

type Crown =
  | 'dome'
  | 'attic'
  | 'spire'
  | 'blade'
  | 'letters'
  | 'hplate'
  | 'cross'
  | 'clock'
  | null

type Facade = 'plain' | 'church' | 'glass' | 'columns' | 'arch'

interface Box {
  x0: number
  y0: number
  x1: number
  y1: number
  h: number
  base: string
  trim: string
  // Which way the lot's corner on the crossing lies
  ox: -1 | 1
  oy: -1 | 1
  seed: number
  // Shares of windows and shopfronts lit
  lit: number
  shops: number
  balconies: boolean
  crown: Crown
  facade: Facade
  // Awnings over the shopfronts, a marquee over the doors
  awning: boolean
  marquee: boolean
  place?: Place
}

interface Prop {
  kind: 'lamp' | 'tree'
  x: number
  y: number
  seed: number
}

interface Block {
  x0: number
  y0: number
  x1: number
  y1: number
  // The buildings' square inside the pavement
  ix0: number
  iy0: number
  ix1: number
  iy1: number
  cx: number
  cy: number
  boxes: Array<Box>
  props: Array<Prop>
  // The height of its highest point, crowns and all
  top: number
}

// The blocks drawn, round the grid of the game and well beyond it, kept
// column by column
const B0 = -5
const BX1 = NX + 3
const BY1 = NY + 3
const ROWS = BY1 - B0 + 1

// How far a crown rises over its roof (a church's spire from the ground)
const RISE: Record<NonNullable<Crown>, number> = {
  dome: 17,
  attic: 4.5,
  spire: 0,
  blade: 0,
  letters: 8,
  hplate: 0,
  cross: 0,
  clock: 8,
}
const SPIRE_TOP = 71

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A number from 0 to 1 that stays the same for the same four
function hash(a: number, b: number, c: number, d: number) {
  let h = Math.imul(a, 374761393) ^ Math.imul(b, 668265263)
  h = Math.imul(h ^ Math.imul(c, 2246822519), 3266489917) ^ (d * 97)
  h = Math.imul(h ^ (h >>> 15), 2246822519)
  h = Math.imul(h ^ (h >>> 13), 3266489917)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

// How each place is built
const LANDMARK: Record<
  Kind,
  Pick<Box, 'h' | 'base' | 'trim' | 'crown' | 'facade'> &
    Partial<Pick<Box, 'awning' | 'marquee' | 'lit' | 'shops'>>
> = {
  bank: {
    h: 47,
    base: '#f1e8d4',
    trim: '#e0ac45',
    crown: 'dome',
    facade: 'plain',
  },
  bar: {
    h: 29,
    base: '#dcb98a',
    trim: '#f3ead6',
    crown: null,
    facade: 'plain',
    awning: true,
    shops: 1,
  },
  church: {
    h: 24,
    base: '#c88a6a',
    trim: '#efdcb4',
    crown: 'spire',
    facade: 'church',
  },
  cinema: {
    h: 41,
    base: '#e6c999',
    trim: '#f3ead6',
    crown: 'blade',
    facade: 'plain',
    marquee: true,
    shops: 1,
  },
  hospital: {
    h: 35,
    base: '#eee9dc',
    trim: '#9fb6d8',
    crown: 'hplate',
    facade: 'plain',
  },
  hotel: {
    h: 59,
    base: '#dcc39b',
    trim: '#f3ead6',
    crown: 'letters',
    facade: 'plain',
    lit: 0.62,
  },
  market: {
    h: 21,
    base: '#7f8d84',
    trim: '#d8d2b8',
    crown: null,
    facade: 'glass',
  },
  museum: {
    h: 27,
    base: '#e3d7bf',
    trim: '#f6efe0',
    crown: null,
    facade: 'columns',
  },
  pharmacy: {
    h: 35,
    base: '#d8c19c',
    trim: '#f3ead6',
    crown: 'cross',
    facade: 'plain',
  },
  station: {
    h: 25,
    base: '#c7a685',
    trim: '#efe0bd',
    crown: 'clock',
    facade: 'arch',
  },
}

const placeAt = (bx: number, by: number, q: number) =>
  PLACES.find((p) => p.lot.bx === bx && p.lot.by === by && p.lot.q === q)

// The streets with trees along them: a paseo each way through the grid
const treeCol = (i: number) => ((i % 3) + 3) % 3 === 2
const treeRow = (j: number) => ((j % 4) + 4) % 4 === 0

function buildTown(): Array<Block> {
  const r = rng(1931)
  const blocks: Array<Block> = []
  for (let bx = B0; bx <= BX1; bx++)
    for (let by = B0; by <= BY1; by++) {
      const c = crossingXY(bx, by)
      const x0 = c.x + STREET / 2
      const y0 = c.y + STREET / 2
      const x1 = x0 + PITCH - STREET
      const y1 = y0 + PITCH - STREET
      const ix0 = x0 + WALK
      const iy0 = y0 + WALK
      const boxes: Array<Box> = []
      for (const q of [0, 1, 2, 3] as const) {
        const lx = ix0 + (q & 1 ? LOT : 0)
        const ly = iy0 + (q & 2 ? LOT : 0)
        const place = placeAt(bx, by, q)
        const floors = 3 + Math.floor(r() * 5)
        const box: Box = {
          x0: lx,
          y0: ly,
          x1: lx + LOT,
          y1: ly + LOT,
          h: GROUND + floors * FLOOR + 2,
          base: FACADES[Math.floor(r() * FACADES.length)],
          trim: '',
          ox: q & 1 ? 1 : -1,
          oy: q & 2 ? 1 : -1,
          seed: Math.floor(r() * 1e9),
          lit: 0.26 + r() * 0.24,
          shops: 0.5 + r() * 0.4,
          balconies: r() < 0.65,
          crown: null,
          facade: 'plain',
          awning: false,
          marquee: false,
        }
        const roll = r()
        box.crown =
          floors >= 5 && roll < 0.2 ? 'dome' : roll > 0.68 ? 'attic' : null
        box.trim = mix(box.base, '#fff8ea', 0.55)
        if (place) Object.assign(box, LANDMARK[place.kind], { place })
        boxes.push(box)
      }
      const props: Array<Prop> = []
      const prop = (kind: Prop['kind'], x: number, y: number) =>
        props.push({ kind, x, y, seed: Math.floor(r() * 1e9) })
      const at = 1.5
      // a lamp on each corner, but where a place has its sign
      ;[
        [x0 + at, y0 + at],
        [x1 - at, y0 + at],
        [x0 + at, y1 - at],
        [x1 - at, y1 - at],
      ].forEach(([px, py], q) => {
        if (!boxes[q].place) prop('lamp', px, py)
      })
      const mx = (x0 + x1) / 2
      const my = (y0 + y1) / 2
      // Each side: trees at its lots' middles on a paseo (not in front of
      // a place), else a lamp half way
      const sides: Array<{
        trees: boolean
        x: (u: number) => number
        y: (u: number) => number
        lots: [number, number]
      }> = [
        {
          trees: treeRow(by),
          x: (u) => ix0 + u,
          y: () => y0 + at,
          lots: [0, 1],
        },
        {
          trees: treeRow(by + 1),
          x: (u) => ix0 + u,
          y: () => y1 - at,
          lots: [2, 3],
        },
        {
          trees: treeCol(bx),
          x: () => x0 + at,
          y: (u) => iy0 + u,
          lots: [0, 2],
        },
        {
          trees: treeCol(bx + 1),
          x: () => x1 - at,
          y: (u) => iy0 + u,
          lots: [1, 3],
        },
      ]
      for (const s of sides) {
        if (!s.trees) {
          prop('lamp', s.x(LOT), s.y(LOT))
          continue
        }
        s.lots.forEach((q, k) => {
          if (boxes[q].place) return
          const u = LOT / 2 + k * LOT
          prop('tree', s.x(u), s.y(u))
        })
      }
      blocks.push({
        x0,
        y0,
        x1,
        y1,
        top: Math.max(
          ...boxes.map((b) =>
            b.crown === 'spire'
              ? SPIRE_TOP
              : b.h + (b.crown ? RISE[b.crown] : 0),
          ),
        ),
        ix0,
        iy0,
        ix1: x1 - WALK,
        iy1: y1 - WALK,
        cx: mx,
        cy: my,
        boxes,
        props,
      })
    }
  return blocks
}

// --- The sky beyond: the skyline, clouds and stars, by their bearing ---

interface Sil {
  a0: number
  a1: number
  el: number
}
interface Shape {
  a: number
  el: number
  w: number
  kind: 'dome' | 'spire' | 'tower'
}
interface Cloud {
  a: number
  el: number
  w: number
  h: number
}

function buildSky() {
  const r = rng(1936)
  const roofs: Array<Sil> = []
  for (let a = -Math.PI; a < Math.PI;) {
    const w = 0.014 + r() * 0.04
    roofs.push({ a0: a, a1: a + w, el: 0.035 + r() * 0.05 })
    a += w
  }
  const shapes: Array<Shape> = []
  for (let k = 0; k < 9; k++)
    shapes.push({
      a: -Math.PI + r() * 2 * Math.PI,
      el: 0.07 + r() * 0.04,
      w: 0.028 + r() * 0.02,
      kind: 'dome',
    })
  for (let k = 0; k < 6; k++)
    shapes.push({
      a: -Math.PI + r() * 2 * Math.PI,
      el: 0.1 + r() * 0.05,
      w: 0.012 + r() * 0.006,
      kind: k % 2 ? 'spire' : 'tower',
    })
  const lights: Array<{ a: number; el: number }> = []
  for (let k = 0; k < 160; k++) {
    const a = -Math.PI + r() * 2 * Math.PI
    const roof = roofs.find((x) => a >= x.a0 && a < x.a1)
    if (roof) lights.push({ a, el: 0.008 + r() * (roof.el - 0.016) })
  }
  const clouds: Array<Cloud> = []
  for (let k = 0; k < 11; k++)
    clouds.push({
      a: -Math.PI + r() * 2 * Math.PI,
      el: 0.16 + r() * 0.3,
      w: 0.18 + r() * 0.3,
      h: 0.014 + r() * 0.014,
    })
  // more of them, and lower, over the sunset
  for (let k = 0; k < 5; k++)
    clouds.push({
      a: SUN - 0.5 + r(),
      el: 0.09 + r() * 0.16,
      w: 0.2 + r() * 0.3,
      h: 0.012 + r() * 0.01,
    })
  const stars: Array<{ a: number; el: number; s: number }> = []
  for (let k = 0; k < 90; k++)
    stars.push({
      a: -Math.PI + r() * 2 * Math.PI,
      el: 0.35 + r() * 0.75,
      s: 0.5 + r() * 0.8,
    })
  return { roofs, shapes, lights, clouds, stars }
}

// --- Pictures made once ---

function sprite(
  w: number,
  h: number,
  paint: (g: CanvasRenderingContext2D) => void,
) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  if (g) paint(g)
  return c
}

const radial = (rgb: string, stops: Array<[number, number]>) =>
  sprite(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    for (const [at, a] of stops) gr.addColorStop(at, `rgba(${rgb},${a})`)
    g.fillStyle = gr
    g.fillRect(0, 0, 128, 128)
  })

function sprites() {
  const streak = sprite(32, 128, (g) => {
    const v = g.createLinearGradient(0, 0, 0, 128)
    v.addColorStop(0, 'rgba(255,196,120,0.9)')
    v.addColorStop(0.35, 'rgba(255,170,90,0.45)')
    v.addColorStop(1, 'rgba(255,150,80,0)')
    g.fillStyle = v
    g.fillRect(0, 0, 32, 128)
    g.globalCompositeOperation = 'destination-in'
    const h = g.createLinearGradient(0, 0, 32, 0)
    h.addColorStop(0, 'rgba(0,0,0,0)')
    h.addColorStop(0.5, 'rgba(0,0,0,1)')
    h.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = h
    g.fillRect(0, 0, 32, 128)
  })
  const redStreak = sprite(32, 128, (g) => {
    g.drawImage(streak, 0, 0)
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = 'rgb(255,70,50)'
    g.fillRect(0, 0, 32, 128)
  })
  const moon = sprite(64, 64, (g) => {
    g.fillStyle = '#f7ecd0'
    g.beginPath()
    g.arc(32, 32, 26, 0, Math.PI * 2)
    g.fill()
    g.globalCompositeOperation = 'destination-out'
    g.beginPath()
    g.arc(44, 26, 24, 0, Math.PI * 2)
    g.fill()
  })
  return {
    glow: radial('255,214,140', [
      [0, 0.95],
      [0.18, 0.55],
      [0.45, 0.16],
      [1, 0],
    ]),
    pool: radial('255,184,104', [
      [0, 0.55],
      [0.5, 0.2],
      [1, 0],
    ]),
    red: radial('255,72,48', [
      [0, 0.95],
      [0.3, 0.4],
      [1, 0],
    ]),
    amber: radial('255,176,56', [
      [0, 1],
      [0.3, 0.45],
      [1, 0],
    ]),
    green: radial('90,230,150', [
      [0, 0.8],
      [0.4, 0.25],
      [1, 0],
    ]),
    sun: radial('255,150,70', [
      [0, 0.85],
      [0.35, 0.42],
      [0.7, 0.12],
      [1, 0],
    ]),
    streak,
    redStreak,
    moon,
  }
}

// --- The taxi: a white saloon of the fifties with the red stripe ---

type V3 = [number, number, number]

interface Part {
  verts: Array<V3>
  faces: Array<{ idx: Array<number>; role: string }>
}

// Along the taxi (forward), across it (right), and up, from its middle on
// the ground. The body is a box with its corners cut and its top drawn in,
// the cabin a box narrower at the roof.
function carParts(): { body: Part; cabin: Part } {
  const plan: Array<[number, number]> = [
    [-4.55, -1.15],
    [-4.55, 1.15],
    [-4.15, 1.72],
    [3.9, 1.72],
    [4.55, 1.2],
    [4.55, -1.2],
    [3.9, -1.72],
    [-4.15, -1.72],
  ]
  const roles = [
    'rear',
    'rearR',
    'right',
    'frontR',
    'front',
    'frontL',
    'left',
    'rearL',
  ]
  const lo = 0.62
  const hi = 1.98
  const body: Part = {
    verts: [
      ...plan.map(([u, v]): V3 => [u, v, lo]),
      ...plan.map(([u, v]): V3 => [u * 0.975, v * 0.88, hi]),
    ],
    faces: [
      ...plan.map((_, i) => ({
        idx: [i, (i + 1) % 8, 8 + ((i + 1) % 8), 8 + i],
        role: roles[i],
      })),
      { idx: [8, 9, 10, 11, 12, 13, 14, 15], role: 'top' },
    ],
  }
  const b = [-2.7, 1.32]
  const t = [-1.45, 0.42]
  const cabin: Part = {
    verts: [
      [b[0], -1.42, hi],
      [b[0], 1.42, hi],
      [b[1], 1.42, hi],
      [b[1], -1.42, hi],
      [t[0], -1.17, 3.1],
      [t[0], 1.17, 3.1],
      [t[1], 1.17, 3.1],
      [t[1], -1.17, 3.1],
    ],
    faces: [
      { idx: [0, 1, 5, 4], role: 'rearGlass' },
      { idx: [1, 2, 6, 5], role: 'rightGlass' },
      { idx: [2, 3, 7, 6], role: 'frontGlass' },
      { idx: [3, 0, 4, 7], role: 'leftGlass' },
      { idx: [4, 5, 6, 7], role: 'roof' },
    ],
  }
  return { body, cabin }
}

// --- The scene ---

export interface Rider {
  from: { x: number; y: number }
  to: { x: number; y: number }
  t0: number
  ms: number
  // Which passenger: their hat and coat
  who: number
}

export interface TaxiView {
  pose: Pose
  // Indicators before a turn, brake lights, all four at the kerb
  blink: 'left' | 'right' | null
  brake: boolean
  hazard: boolean
  // Where the next move is asked for: a crossing, or in front of a place
  mark: { x: number; y: number; r: number } | null
  // The passenger walking to the taxi, or out of it
  rider: Rider | null
  // The passenger in the back, or none: the roof sign is lit
  aboard: number | null
  // The Norwegian under a place's sign, while its word is new
  captions: Partial<Record<string, string>>
}

// A sign as drawn, in CSS pixels on the canvas
export interface SignHit {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export interface TaxiScene {
  resize: (w: number, h: number) => void
  draw: (now: number, view: TaxiView) => void
  // The place whose sign is at a point on the canvas, if any
  signAt: (x: number, y: number) => SignHit | null
}

// The passengers' hats and coats
export const PASSENGERS = 5
const COATS = ['#3b4a7a', '#7a4b3a', '#4d5a4a', '#5a4a6e', '#6e6252']

const SIGN_FONT = '"Big Shoulders Display", "Josefin Sans", sans-serif'
const TEXT_FONT = '"Josefin Sans", sans-serif'

let TOWN: Array<Block> | null = null
let SKY: ReturnType<typeof buildSky> | null = null

export function taxiScene(
  canvas: HTMLCanvasElement,
  still: boolean,
): TaxiScene {
  const ctx = canvas.getContext('2d')
  const town = (TOWN ??= buildTown())
  const sky = (SKY ??= buildSky())
  const sp = sprites()
  const car = carParts()
  void document.fonts.load(`800 20px ${SIGN_FONT}`).catch(() => {})
  void document.fonts.load(`italic 400 14px ${TEXT_FONT}`).catch(() => {})

  let W = 320
  let H = 400
  let DPR = 1
  let F = 320
  let HOR = 160
  let CX = 160
  let BACK = 15
  let skyPic: HTMLCanvasElement | null = null
  let camA = Number.NaN
  let camX = 0
  let camY = 0
  let fx = 0
  let fy = -1
  let rx = 1
  let ry = 0
  let last = 0
  let hits: Array<SignHit> = []

  const depth = (x: number, y: number) => (x - camX) * fx + (y - camY) * fy
  const side = (x: number, y: number) => (x - camX) * rx + (y - camY) * ry
  const sy = (z: number, d: number) => HOR - ((z - CAMZ) / d) * F

  // A point on the canvas, with its depth and its pixels to a unit
  const at = (x: number, y: number, z: number) => {
    const d = depth(x, y)
    if (d < NEAR) return null
    return { x: CX + (side(x, y) / d) * F, y: sy(z, d), d, s: F / d }
  }

  // A polygon in the town, cut where it passes behind the camera, into
  // the path (false when nothing of it is in front)
  const buf: Array<number> = []
  function poly(path: Path2D | CanvasRenderingContext2D, pts: Array<number>) {
    const n = pts.length / 3
    buf.length = 0
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const ax = pts[3 * i]
      const ay = pts[3 * i + 1]
      const az = pts[3 * i + 2]
      const bx = pts[3 * j]
      const by = pts[3 * j + 1]
      const bz = pts[3 * j + 2]
      const da = depth(ax, ay)
      const db = depth(bx, by)
      if (da >= NEAR) buf.push(ax, ay, az, da)
      if (da >= NEAR !== db >= NEAR) {
        const t = (NEAR - da) / (db - da)
        buf.push(
          ax + (bx - ax) * t,
          ay + (by - ay) * t,
          az + (bz - az) * t,
          NEAR,
        )
      }
    }
    if (buf.length < 12) return false
    for (let k = 0; k < buf.length; k += 4) {
      const d = buf[k + 3]
      const px = CX + (side(buf[k], buf[k + 1]) / d) * F
      const py = sy(buf[k + 2], d)
      if (k === 0) path.moveTo(px, py)
      else path.lineTo(px, py)
    }
    path.closePath()
    return true
  }

  const fill = (pts: Array<number>, color: string | CanvasGradient) => {
    if (!ctx) return
    ctx.beginPath()
    if (poly(ctx, pts)) {
      ctx.fillStyle = color
      ctx.fill()
    }
  }

  const resize = (w: number, h: number) => {
    W = Math.max(16, w)
    H = Math.max(16, h)
    DPR = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(W * DPR)
    canvas.height = Math.round(H * DPR)
    // the horizon a little lower in a tall picture, for more of the sky
    const tall = Math.max(0, Math.min(1, (H / W - 1) / 0.7))
    HOR = H * (0.4 + 0.08 * tall)
    CX = W / 2
    // as wide a view as the picture is wide; a tall one sees more of the
    // sky and the street, not less of the sides
    F = Math.max(W * 0.6, Math.min(H * 0.86, W * 1.1))
    // the bumper's foot this far down the picture, whatever its shape
    BACK = 4.5 + ((CAMZ - 0.6) * F) / (0.93 * H - HOR)
    skyPic = sprite(Math.ceil(W * DPR), Math.ceil((HOR + 2) * DPR), (g) => {
      const gr = g.createLinearGradient(0, 0, 0, (HOR + 2) * DPR)
      gr.addColorStop(0, '#111a4a')
      gr.addColorStop(0.4, '#22307a')
      gr.addColorStop(0.68, '#3f3f8c')
      gr.addColorStop(0.84, '#77508f')
      gr.addColorStop(0.94, '#c5657a')
      gr.addColorStop(1, '#e98d64')
      g.fillStyle = gr
      g.fillRect(0, 0, W * DPR, (HOR + 2) * DPR)
    })
  }

  // --- The sky ---

  const bearingX = (a: number) => {
    const d = wrap(a - camA)
    if (Math.abs(d) > 1.35) return null
    return { x: CX + Math.tan(d) * F, c: Math.cos(d) }
  }

  function drawSky(now: number) {
    if (!ctx) return
    if (skyPic) ctx.drawImage(skyPic, 0, 0, W, HOR + 2)
    // the glow where the sun has gone down
    const sun = bearingX(SUN)
    if (sun) {
      const gw = F * 2.6
      const gh = HOR * 1.1
      ctx.drawImage(sp.sun, sun.x - gw / 2, HOR - gh / 2, gw, gh)
    }
    // stars, high up
    ctx.fillStyle = '#fff4d8'
    for (const s of sky.stars) {
      const b = bearingX(s.a)
      if (!b) continue
      const y = HOR - (Math.tan(s.el) / b.c) * F
      if (y < 0 || y > HOR * 0.7) continue
      const twinkle = still ? 1 : 0.75 + 0.25 * Math.sin(now / 700 + s.a * 40)
      ctx.globalAlpha = Math.min(1, (1 - y / (HOR * 0.7)) * 1.4) * twinkle * 0.8
      ctx.fillRect(b.x, y, s.s * 1.3, s.s * 1.3)
    }
    ctx.globalAlpha = 1
    // a new moon over the south-west
    const m = bearingX(SUN - 0.55)
    if (m) {
      const y = HOR - (Math.tan(0.42) / m.c) * F
      const r = F * 0.03
      ctx.drawImage(sp.moon, m.x - r, y - r, r * 2, r * 2)
    }
    // clouds in long streaks, lit pink toward the sunset
    for (const c of sky.clouds) {
      const b = bearingX(c.a)
      if (!b) continue
      const w = c.w * F
      const h = Math.max(2, c.h * F)
      const y = HOR - (Math.tan(c.el) / b.c) * F
      const near = 1 - Math.min(1, Math.abs(wrap(c.a - SUN)) / 1.8)
      ctx.fillStyle = mix('#4f4f98', '#f08a6c', near)
      ctx.globalAlpha = 0.55 + 0.35 * near
      ctx.beginPath()
      ctx.roundRect(b.x - w / 2, y, w, h, h / 2)
      ctx.roundRect(b.x - w * 0.32, y - h * 0.8, w * 0.5, h * 1.1, h / 2)
      ctx.roundRect(b.x - w * 0.05, y + h * 0.9, w * 0.62, h * 0.7, h / 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  function drawSkyline() {
    if (!ctx) return
    ctx.fillStyle = C.skyline
    ctx.beginPath()
    for (const s of sky.roofs) {
      const d0 = wrap(s.a0 - camA)
      const d1 = d0 + (s.a1 - s.a0)
      if (d1 < -1.3 || d0 > 1.3) continue
      const x0 = CX + Math.tan(d0) * F
      const x1 = CX + Math.tan(d1) * F
      const y = HOR - (Math.tan(s.el) / Math.cos((d0 + d1) / 2)) * F
      ctx.rect(x0, y, x1 - x0 + 0.6, HOR - y + 3)
    }
    for (const s of sky.shapes) {
      const b = bearingX(s.a)
      if (!b) continue
      const w = (s.w * F) / b.c
      const top = HOR - (Math.tan(s.el) / b.c) * F
      const x = b.x
      if (s.kind === 'dome') {
        const drum = (HOR - top) * 0.55
        ctx.rect(x - w / 2, HOR - drum, w, drum + 3)
        ctx.moveTo(x - w * 0.42, HOR - drum)
        ctx.ellipse(x, HOR - drum, w * 0.42, w * 0.5, 0, Math.PI, 0)
        ctx.rect(x - w * 0.06, HOR - drum - w * 0.72, w * 0.12, w * 0.25)
      } else if (s.kind === 'spire') {
        ctx.rect(x - w / 2, HOR - (HOR - top) * 0.55, w, (HOR - top) * 0.55 + 3)
        ctx.moveTo(x - w / 2, HOR - (HOR - top) * 0.55)
        ctx.lineTo(x, top)
        ctx.lineTo(x + w / 2, HOR - (HOR - top) * 0.55)
      } else {
        ctx.rect(x - w / 2, top + w * 0.6, w, HOR - top)
        ctx.moveTo(x - w * 0.6, top + w * 0.6)
        ctx.lineTo(x, top)
        ctx.lineTo(x + w * 0.6, top + w * 0.6)
      }
    }
    ctx.fill()
    // a few windows lit far off
    ctx.fillStyle = '#f6c36b'
    ctx.globalAlpha = 0.55
    for (const l of sky.lights) {
      const b = bearingX(l.a)
      if (!b) continue
      ctx.fillRect(b.x, HOR - (Math.tan(l.el) / b.c) * F, 1.3, 1.3)
    }
    ctx.globalAlpha = 1
  }

  // --- The ground ---

  function drawGround(
    view: TaxiView,
    blocks: Array<Block>,
    lamps: Array<Prop>,
    now: number,
  ) {
    if (!ctx) return
    const gr = ctx.createLinearGradient(0, HOR, 0, H)
    const span = H - HOR
    gr.addColorStop(0, C.fog)
    gr.addColorStop(
      Math.min(1, (CAMZ * F) / FOG1 / span),
      mix(C.asphalt, C.fog, 0.85),
    )
    gr.addColorStop(Math.min(1, (CAMZ * F) / 90 / span), C.asphalt)
    gr.addColorStop(1, C.asphaltNear)
    ctx.fillStyle = gr
    ctx.fillRect(0, HOR, W, span)

    // pavements, each with its kerb
    for (const b of blocks) {
      const t = fogOf(Math.max(NEAR, depth(b.cx, b.cy)))
      fill(
        [b.x0, b.y0, 0, b.x1, b.y0, 0, b.x1, b.y1, 0, b.x0, b.y1, 0],
        mix(C.kerb, C.fog, t),
      )
      const k = 0.55
      fill(
        [
          b.x0 + k,
          b.y0 + k,
          0,
          b.x1 - k,
          b.y0 + k,
          0,
          b.x1 - k,
          b.y1 - k,
          0,
          b.x0 + k,
          b.y1 - k,
          0,
        ],
        mix(C.walk, C.fog, t),
      )
    }

    // zebras at the crossings near enough, and the dashes down the middle
    for (let i = B0; i <= BX1 + 1; i++)
      for (let j = B0; j <= BY1 + 1; j++) {
        const c = crossingXY(i, j)
        const d = depth(c.x, c.y)
        if (d < -40 || d > 230) continue
        const sd = side(c.x, c.y)
        if (d > 0 && Math.abs(sd / d) * F > W * 0.5 + (40 * F) / d) continue
        const t = fogOf(Math.max(NEAR, d))
        const zebra = new Path2D()
        const dash = new Path2D()
        const bar = (x0: number, y0: number, x1: number, y1: number) =>
          poly(zebra, [x0, y0, 0, x1, y0, 0, x1, y1, 0, x0, y1, 0])
        const a0 = STREET / 2 + 1
        const a1 = a0 + 3.4
        for (let k = 0; k < 6; k++) {
          const o = -7.2 + k * 2.6
          bar(c.x + o, c.y - a1, c.x + o + 1.45, c.y - a0)
          bar(c.x + o, c.y + a0, c.x + o + 1.45, c.y + a1)
          bar(c.x - a1, c.y + o, c.x - a0, c.y + o + 1.45)
          bar(c.x + a0, c.y + o, c.x + a1, c.y + o + 1.45)
        }
        // down the streets to the east and the south
        for (let u = a1 + 3; u < PITCH - a1 - 3; u += 7) {
          poly(dash, [
            c.x + u,
            c.y - 0.22,
            0,
            c.x + u + 3.2,
            c.y - 0.22,
            0,
            c.x + u + 3.2,
            c.y + 0.22,
            0,
            c.x + u,
            c.y + 0.22,
            0,
          ])
          poly(dash, [
            c.x - 0.22,
            c.y + u,
            0,
            c.x + 0.22,
            c.y + u,
            0,
            c.x + 0.22,
            c.y + u + 3.2,
            0,
            c.x - 0.22,
            c.y + u + 3.2,
            0,
          ])
        }
        ctx.fillStyle = mix(C.zebra, C.fog, t)
        ctx.globalAlpha = 0.82
        ctx.fill(zebra)
        ctx.fillStyle = mix(C.dash, C.fog, t)
        ctx.globalAlpha = 0.7
        ctx.fill(dash)
        ctx.globalAlpha = 1
      }

    // the lamps' light on the wet ground, and their reflections
    ctx.globalCompositeOperation = 'lighter'
    for (const l of lamps) {
      const p = at(l.x, l.y, 0)
      if (!p || p.d > 220) continue
      const k = 1 - fogOf(p.d)
      const rx2 = 7 * p.s
      const ry2 = (7 * p.s * CAMZ) / p.d
      ctx.globalAlpha = 0.5 * k
      ctx.drawImage(sp.pool, p.x - rx2, p.y - ry2, rx2 * 2, ry2 * 2)
      const w = 1.1 * p.s
      const len = (16 * F) / p.d
      ctx.globalAlpha = 0.36 * k
      ctx.drawImage(sp.streak, p.x - w / 2, p.y, w, len)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    // where the next move is asked for: a gold ring that breathes
    if (view.mark) {
      const m = view.mark
      const k = still ? 0.6 : (Math.sin(now / 280) + 1) / 2
      const ring = (r: number) => {
        const pts: Array<number> = []
        for (let n = 0; n < 32; n++) {
          const a = (n / 32) * Math.PI * 2
          pts.push(m.x + Math.cos(a) * r, m.y + Math.sin(a) * r, 0.02)
        }
        return pts
      }
      const r = m.r * (0.92 + 0.12 * k)
      ctx.beginPath()
      const outer = poly(ctx, ring(r))
      const inner = poly(ctx, ring(r * 0.8))
      if (outer && inner) {
        ctx.fillStyle = '#f5c75a'
        ctx.globalAlpha = 0.6 + 0.35 * k
        ctx.fill('evenodd')
      }
      ctx.beginPath()
      if (poly(ctx, ring(r * 0.8))) {
        ctx.fillStyle = '#ffd98a'
        ctx.globalAlpha = 0.1 + 0.08 * k
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  }

  // --- The blocks ---

  const cornerSeen = (b: Box) =>
    (b.ox < 0 ? camX < b.x0 : camX > b.x1) ||
    (b.oy < 0 ? camY < b.y0 : camY > b.y1)

  // The corner of a lot on its crossing
  const cornerOf = (b: Box) => ({
    x: b.ox < 0 ? b.x0 : b.x1,
    y: b.oy < 0 ? b.y0 : b.y1,
  })

  // One wall: from a to b along the ground, seen from outside
  function wall(
    b: Box,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    nx: number,
    ny: number,
    face: number,
    outer: boolean,
    top = b.h,
  ) {
    if (!ctx) return
    const L = Math.hypot(bx - ax, by - ay)
    const ux = (bx - ax) / L
    const uy = (by - ay) / L
    const d0 = depth(ax, ay)
    const dd = ux * fx + uy * fy
    const s0 = side(ax, ay)
    const ds = ux * rx + uy * ry
    let u0 = 0
    let u1 = L
    const dEnd = d0 + L * dd
    if (d0 < NEAR && dEnd < NEAR) return
    if (d0 < NEAR) u0 = (NEAR - d0) / dd
    else if (dEnd < NEAR) u1 = (NEAR - d0) / dd
    const da = d0 + u0 * dd
    const db = d0 + u1 * dd
    const xa = CX + ((s0 + u0 * ds) / da) * F
    const xb = CX + ((s0 + u1 * ds) / db) * F
    if (Math.max(xa, xb) < -4 || Math.min(xa, xb) > W + 4) return
    const dm = (da + db) / 2
    const t = fogOf(dm)
    // lit from the west, where the sky is still light
    const light = Math.max(0, -nx * 0.8 - ny * 0.6)
    const color = mix(mix(b.base, C.shade, 0.52 * (1 - light)), C.fog, t)
    const ya = (z: number) => sy(z, da)
    const yb = (z: number) => sy(z, db)
    const quad = (
      p: Path2D | CanvasRenderingContext2D,
      z0: number,
      z1: number,
    ) => {
      p.moveTo(xa, ya(z0))
      p.lineTo(xb, yb(z0))
      p.lineTo(xb, yb(z1))
      p.lineTo(xa, ya(z1))
      p.closePath()
    }
    ctx.beginPath()
    quad(ctx, 0, top)
    if (dm < 150 && outer) {
      // warm from the shops and the lamps, low down
      const mid = (xa + xb) / 2
      const g = ctx.createLinearGradient(
        mid,
        sy(0, dm),
        mid,
        sy(Math.min(top, 18), dm),
      )
      g.addColorStop(0, mix(color, C.glow, 0.42 * (1 - t)))
      g.addColorStop(1, color)
      ctx.fillStyle = g
    } else ctx.fillStyle = color
    ctx.fill()
    if (!outer) return
    const bayPx = (BAY * F) / dm
    if (bayPx < 1.6) return

    // a span of the wall, between two places along it, as a quad
    const span = (
      p: Path2D | CanvasRenderingContext2D,
      ul: number,
      ur: number,
      z0: number,
      z1: number,
    ) => {
      if (ul < u0 || ur > u1) return false
      const dl = d0 + ul * dd
      const dr = d0 + ur * dd
      const xl = CX + ((s0 + ul * ds) / dl) * F
      const xr = CX + ((s0 + ur * ds) / dr) * F
      if ((xl < 0 && xr < 0) || (xl > W && xr > W)) return false
      p.moveTo(xl, sy(z0, dl))
      p.lineTo(xr, sy(z0, dr))
      p.lineTo(xr, sy(z1, dr))
      p.lineTo(xl, sy(z1, dl))
      p.closePath()
      return true
    }

    const n = Math.max(1, Math.round(L / BAY))
    const bw = L / n
    const lit = new Path2D()
    const dark = new Path2D()
    const iron = new Path2D()
    const near = bayPx > 22
    // (far off, or deep in the haze, a dark window is the wall's colour)
    const far = bayPx < 7 || t > 0.5
    const litColor = mix(C.lit, C.fog, t * 0.55)
    const shopColor = mix(C.shop, C.fog, t * 0.5)
    const darkColor = mix(C.dark, C.fog, t)
    const ironColor = mix(C.iron, C.fog, t)

    // the band over the shops, and the cornice
    ctx.beginPath()
    quad(ctx, top - 1.5, top)
    ctx.fillStyle = mix(b.trim, C.fog, t)
    ctx.fill()

    if (b.facade === 'glass') {
      // a market of iron and glass: panes from the ground to the eaves
      for (let k = 0; k < n * 2; k++)
        for (let z = 1; z + 3.2 < top - 1.6; z += 3.9)
          span(
            hash(b.seed, face, k, Math.round(z)) < 0.86 ? lit : dark,
            k * (bw / 2) + 0.35,
            (k + 1) * (bw / 2) - 0.35,
            z,
            z + 3.2,
          )
      ctx.fillStyle = shopColor
      ctx.fill(lit)
      ctx.fillStyle = darkColor
      ctx.fill(dark)
      return
    }

    if (b.facade === 'columns') {
      // a museum: columns before a shaded wall, and a frieze over them
      const wallBack = new Path2D()
      span(wallBack, 0.6, L - 0.6, 0, 17)
      ctx.fillStyle = mix(mix(b.base, C.shade, 0.6), C.fog, t)
      ctx.fill(wallBack)
      const cols = new Path2D()
      for (let u = 1.2; u + 1.5 < L; u += 3.05) span(cols, u, u + 1.5, 1, 17)
      span(cols, 0, L, 0, 1)
      span(cols, 0, L, 17, 19.5)
      ctx.fillStyle = mix(b.trim, C.fog, t)
      ctx.fill(cols)
      const doors = new Path2D()
      span(doors, L / 2 - 1.6, L / 2 + 1.6, 1, 8)
      ctx.fillStyle = shopColor
      ctx.fill(doors)
      return
    }

    if (b.facade === 'church') {
      // a church: two tall windows, faintly lit
      for (let k = 0; k < 2; k++) {
        const um = (k + 0.5) * (L / 2)
        span(lit, um - 1.4, um + 1.4, 6, 17)
      }
      ctx.fillStyle = mix('#e9a95e', C.fog, t * 0.6)
      ctx.globalAlpha = 0.85
      ctx.fill(lit)
      ctx.globalAlpha = 1
      return
    }

    if (b.facade === 'arch') {
      // a station: one great arched window over its doors, in a stone
      // frame, its glazing fanned out from the middle like a sunburst
      const um = L / 2
      const zs = 9
      const r = Math.min(L * 0.3, top - 4.5 - zs)
      // a shape on the wall, by its points along it and up
      const onWall = (p: Path2D, uz: Array<number>) => {
        const pts: Array<number> = []
        for (let k = 0; k < uz.length; k += 2)
          pts.push(
            ax + ux * uz[k] + nx * 0.05,
            ay + uy * uz[k] + ny * 0.05,
            uz[k + 1],
          )
        return poly(p, pts)
      }
      // the arch's curve, from the right round to the left
      const arc = (rad: number, steps = 18) => {
        const uz: Array<number> = []
        for (let k = 0; k <= steps; k++) {
          const a = (k / steps) * Math.PI
          uz.push(um + Math.cos(a) * rad, zs + Math.sin(a) * rad)
        }
        return uz
      }
      const opening = (rad: number, z0: number) => [
        um + rad,
        z0,
        ...arc(rad),
        um - rad,
        z0,
      ]
      const frame = new Path2D()
      onWall(frame, opening(r + 0.9, 0))
      onWall(frame, [
        um - 0.75,
        zs + r - 0.3,
        um + 0.75,
        zs + r - 0.3,
        um + 0.55,
        zs + r + 1.5,
        um - 0.55,
        zs + r + 1.5,
      ])
      ctx.fillStyle = mix(b.trim, C.fog, t)
      ctx.fill(frame)
      const doors = new Path2D()
      onWall(doors, opening(r, 0.6))
      ctx.fillStyle = shopColor
      ctx.fill(doors)
      const fan = new Path2D()
      onWall(fan, arc(r))
      ctx.fillStyle = litColor
      ctx.fill(fan)
      // the iron: a hub, spokes out to the rim, a ring half way, the
      // transom and the doors' frames
      const bars = new Path2D()
      const hub = r * 0.2
      onWall(bars, arc(hub, 8))
      for (let k = 1; k < 8; k++) {
        const a = (k / 8) * Math.PI
        const c = Math.cos(a)
        const s = Math.sin(a)
        const w = 0.14
        onWall(bars, [
          um + c * hub - s * w,
          zs + s * hub + c * w,
          um + c * r - s * w,
          zs + s * r + c * w,
          um + c * r + s * w,
          zs + s * r - c * w,
          um + c * hub + s * w,
          zs + s * hub - c * w,
        ])
      }
      const ring = arc(r * 0.62 + 0.12)
      const inner = arc(r * 0.62 - 0.12)
      for (let k = inner.length - 2; k >= 0; k -= 2)
        ring.push(inner[k], inner[k + 1])
      onWall(bars, ring)
      onWall(bars, [
        um - r,
        zs - 0.25,
        um + r,
        zs - 0.25,
        um + r,
        zs + 0.25,
        um - r,
        zs + 0.25,
      ])
      for (const k of [-2, -1, 0, 1, 2]) {
        const u = um + (k * r) / 3
        onWall(bars, [u - 0.15, 0.6, u + 0.15, 0.6, u + 0.15, zs, u - 0.15, zs])
      }
      ctx.fillStyle = ironColor
      ctx.fill(bars)
      return
    }

    // shopfronts on the ground floor
    for (let k = 0; k < n; k++)
      span(
        hash(b.seed, face, k, 99) < b.shops ? lit : dark,
        k * bw + 0.55,
        (k + 1) * bw - 0.55,
        0.4,
        6.6,
      )
    ctx.fillStyle = shopColor
    ctx.fill(lit)
    ctx.fillStyle = darkColor
    ctx.fill(dark)

    // windows, floor by floor, with iron balconies under them near by
    const lit2 = new Path2D()
    const dark2 = new Path2D()
    let row = 0
    for (let z = GROUND + 1.2; z + WIN_H <= top - 2.4; z += FLOOR, row++)
      for (let k = 0; k < n; k++) {
        const um = (k + 0.5) * bw
        const on = hash(b.seed, face, k, row) < b.lit
        if (far && !on) continue
        span(on ? lit2 : dark2, um - WIN_W / 2, um + WIN_W / 2, z, z + WIN_H)
        if (near && b.balconies && row % 2 === 0)
          span(iron, um - WIN_W / 2 - 0.4, um + WIN_W / 2 + 0.4, z - 0.6, z)
      }
    ctx.fillStyle = litColor
    ctx.fill(lit2)
    ctx.fillStyle = darkColor
    ctx.fill(dark2)
    ctx.fillStyle = ironColor
    ctx.fill(iron)

    // the bar's awnings, striped, and the cinema's lights over its doors
    if (b.awning && bayPx > 3) {
      const stripes = [new Path2D(), new Path2D()]
      for (let k = 0; k < n; k++)
        for (let s = 0; s < 6; s++) {
          const ul = k * bw + 0.4 + (s * (bw - 0.8)) / 6
          const ur = ul + (bw - 0.8) / 6
          if (ul < u0 || ur > u1) continue
          const out = 2.4
          poly(stripes[s % 2], [
            ax + ux * ul,
            ay + uy * ul,
            7.6,
            ax + ux * ur,
            ay + uy * ur,
            7.6,
            ax + ux * ur + nx * out,
            ay + uy * ur + ny * out,
            5.7,
            ax + ux * ul + nx * out,
            ay + uy * ul + ny * out,
            5.7,
          ])
        }
      ctx.fillStyle = mix(C.red, C.fog, t)
      ctx.fill(stripes[0])
      ctx.fillStyle = mix(C.cream, C.fog, t)
      ctx.fill(stripes[1])
    }
    if (b.marquee) {
      const band = new Path2D()
      span(band, u0, u1, 6.9, 9.3)
      ctx.fillStyle = mix('#8e2324', C.fog, t)
      ctx.fill(band)
      ctx.fillStyle = mix('#ffe9a6', C.fog, t * 0.4)
      for (let u = Math.ceil(u0) + 0.5; u < u1; u += 1.4)
        for (const z of [7.3, 8.9]) {
          const p = at(ax + ux * u + nx * 0.06, ay + uy * u + ny * 0.06, z)
          if (!p) continue
          const r = Math.max(0.7, 0.22 * p.s)
          ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r)
        }
    }
  }

  // A box's walls seen from the camera
  function walls(b: Box, outerOnly = false) {
    const inside = (x: number) => x
    void inside
    const out = (o: -1 | 1, axis: 'x' | 'y') =>
      axis === 'x' ? b.ox === o : b.oy === o
    if (camY < b.y0 && !(outerOnly && !out(-1, 'y')))
      wall(b, b.x1, b.y0, b.x0, b.y0, 0, -1, 0, out(-1, 'y'))
    if (camX > b.x1 && !(outerOnly && !out(1, 'x')))
      wall(b, b.x1, b.y1, b.x1, b.y0, 1, 0, 1, out(1, 'x'))
    if (camY > b.y1 && !(outerOnly && !out(1, 'y')))
      wall(b, b.x0, b.y1, b.x1, b.y1, 0, 1, 2, out(1, 'y'))
    if (camX < b.x0 && !(outerOnly && !out(-1, 'x')))
      wall(b, b.x0, b.y0, b.x0, b.y1, -1, 0, 3, out(-1, 'x'))
  }

  // A plain box, as for a tower: walls without windows, up to its top
  function tower(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    z0: number,
    z1: number,
    color: string,
  ) {
    const t = fogOf(Math.max(NEAR, depth((x0 + x1) / 2, (y0 + y1) / 2)))
    const face = (nx: number, ny: number, pts: Array<number>) => {
      const light = Math.max(0, -nx * 0.8 - ny * 0.6)
      fill(pts, mix(mix(color, C.shade, 0.5 * (1 - light)), C.fog, t))
    }
    const q = (ax: number, ay: number, bx: number, by: number) => [
      ax,
      ay,
      z0,
      bx,
      by,
      z0,
      bx,
      by,
      z1,
      ax,
      ay,
      z1,
    ]
    if (camY < y0) face(0, -1, q(x1, y0, x0, y0))
    if (camX > x1) face(1, 0, q(x1, y1, x1, y0))
    if (camY > y1) face(0, 1, q(x0, y1, x1, y1))
    if (camX < x0) face(-1, 0, q(x0, y0, x0, y1))
  }

  // What stands on a building's corner or roof, drawn before its walls if
  // the corner is turned away, after them if it is in sight
  function crown(b: Box, now: number) {
    if (!ctx || !b.crown) return
    const c = cornerOf(b)
    // a point inward from the corner along the diagonal
    const inward = (k: number) => ({ x: c.x - b.ox * k, y: c.y - b.oy * k })
    const out = (k: number) => ({ x: c.x + b.ox * k, y: c.y + b.oy * k })
    switch (b.crown) {
      case 'attic': {
        const k = 3
        tower(
          b.x0 + k,
          b.y0 + k,
          b.x1 - k,
          b.y1 - k,
          b.h,
          b.h + 4.2,
          mix(b.base, C.slate, 0.45),
        )
        return
      }
      case 'dome': {
        const m = inward(5.5)
        rotunda(m.x, m.y, b.h, 5.2, b.base, b.place ? C.gold : '#c99a52')
        return
      }
      case 'spire': {
        const s = 8.5
        const x0 = b.ox < 0 ? b.x0 : b.x1 - s
        const y0 = b.oy < 0 ? b.y0 : b.y1 - s
        tower(x0, y0, x0 + s, y0 + s, 0, 50, '#c07c5c')
        belfry(x0, y0, s, 50)
        return
      }
      case 'blade': {
        const p = out(1.6)
        blade(p.x, p.y, now)
        return
      }
      case 'letters': {
        const m = inward(7)
        letters(m.x, m.y, b.h)
        return
      }
      case 'hplate': {
        const p = out(1.4)
        board(p.x, p.y, 14.5, 'h')
        return
      }
      case 'cross': {
        const p = out(1.6)
        board(p.x, p.y, 14.5, 'cross')
        return
      }
      case 'clock': {
        const m = inward(3)
        clock(m.x, m.y, b.h + 3.4)
        return
      }
    }
  }

  // A corner tower with a dome: a drum, the dome with its ribs, a lantern
  // and a finial, like the Gran Vía's
  function rotunda(
    x: number,
    y: number,
    z: number,
    r: number,
    base: string,
    gold: string,
  ) {
    if (!ctx) return
    const p = at(x, y, z)
    if (!p || p.d > FAR) return
    const t = fogOf(p.d)
    const s = p.s
    const R = r * s
    const drum = 5.2 * s
    const x0 = p.x
    const y0 = p.y
    ctx.fillStyle = mix(base, C.fog, t)
    ctx.fillRect(x0 - R, y0 - drum, R * 2, drum + 0.5)
    // columns round the drum, in shade at its sides
    ctx.fillStyle = mix(mix(base, C.shade, 0.5), C.fog, t)
    ctx.fillRect(x0 - R, y0 - drum, R * 0.28, drum)
    ctx.fillRect(x0 + R * 0.72, y0 - drum, R * 0.28, drum)
    ctx.fillStyle = mix(C.dark, C.fog, t)
    for (const k of [-0.42, 0, 0.42])
      ctx.fillRect(x0 + k * R - R * 0.1, y0 - drum * 0.78, R * 0.2, drum * 0.5)
    ctx.fillStyle = mix(mix(base, '#ffffff', 0.4), C.fog, t)
    ctx.fillRect(x0 - R * 1.08, y0 - drum - 0.6 * s, R * 2.16, 0.7 * s)
    // the dome
    const dy = y0 - drum - 0.6 * s
    ctx.fillStyle = mix(C.slate, C.fog, t)
    ctx.beginPath()
    ctx.ellipse(x0, dy, R * 0.98, R * 1.12, 0, Math.PI, 0)
    ctx.fill()
    ctx.strokeStyle = mix(gold, C.fog, t)
    ctx.lineWidth = Math.max(0.6, 0.22 * s)
    ctx.beginPath()
    for (const k of [-0.55, 0, 0.55]) {
      ctx.moveTo(x0 + k * R * 0.98, dy)
      ctx.quadraticCurveTo(x0 + k * R * 0.75, dy - R * 0.95, x0, dy - R * 1.12)
    }
    ctx.stroke()
    // a lantern and a finial
    ctx.fillStyle = mix(base, C.fog, t)
    ctx.fillRect(x0 - R * 0.2, dy - R * 1.12 - 1.8 * s, R * 0.4, 1.8 * s)
    ctx.fillStyle = mix(gold, C.fog, t)
    ctx.beginPath()
    ctx.arc(x0, dy - R * 1.12 - 2.4 * s, 0.6 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(x0 - 0.12 * s, dy - R * 1.12 - 4.4 * s, 0.24 * s, 2 * s)
  }

  // The church's tower: open arches near the top, and a spire with a cross
  function belfry(x0: number, y0: number, s: number, z: number) {
    if (!ctx) return
    const cx = x0 + s / 2
    const cy = y0 + s / 2
    const t = fogOf(Math.max(NEAR, depth(cx, cy)))
    // the arches, on the faces in sight
    const arch = new Path2D()
    const face = (ax: number, ay: number, bx: number, by: number) => {
      for (const k of [0.3, 0.7]) {
        const u0 = k - 0.11
        const u1 = k + 0.11
        poly(arch, [
          ax + (bx - ax) * u0,
          ay + (by - ay) * u0,
          z - 9,
          ax + (bx - ax) * u1,
          ay + (by - ay) * u1,
          z - 9,
          ax + (bx - ax) * u1,
          ay + (by - ay) * u1,
          z - 3.5,
          ax + (bx - ax) * k,
          ay + (by - ay) * k,
          z - 2.6,
          ax + (bx - ax) * u0,
          ay + (by - ay) * u0,
          z - 3.5,
        ])
      }
    }
    const e = 0.05
    if (camY < y0) face(x0 + s, y0 - e, x0, y0 - e)
    if (camX > x0 + s) face(x0 + s + e, y0 + s, x0 + s + e, y0)
    if (camY > y0 + s) face(x0, y0 + s + e, x0 + s, y0 + s + e)
    if (camX < x0) face(x0 - e, y0, x0 - e, y0 + s)
    ctx.fillStyle = mix('#1b1e3c', C.fog, t)
    ctx.fill(arch)
    // the spire: four faces to a point
    const apex = [cx, cy, z + 17]
    const corners = [
      [x0, y0],
      [x0 + s, y0],
      [x0 + s, y0 + s],
      [x0, y0 + s],
    ]
    const faces = corners
      .map((p, k) => {
        const q = corners[(k + 1) % 4]
        const mx = (p[0] + q[0]) / 2
        const my = (p[1] + q[1]) / 2
        return { p, q, d: depth(mx, my), nx: mx - cx, ny: my - cy }
      })
      .sort((a, b) => b.d - a.d)
    for (const f of faces) {
      const towards =
        (camX - (f.p[0] + f.q[0]) / 2) * f.nx +
        (camY - (f.p[1] + f.q[1]) / 2) * f.ny
      if (towards <= 0) continue
      const light = Math.max(
        0,
        (-f.nx / (s / 2)) * 0.8 - (f.ny / (s / 2)) * 0.6,
      )
      fill(
        [f.p[0], f.p[1], z, f.q[0], f.q[1], z, apex[0], apex[1], apex[2]],
        mix(mix('#3a3f6e', '#1e2244', 1 - light), C.fog, t),
      )
    }
    const top = at(cx, cy, z + 17)
    if (top) {
      ctx.strokeStyle = mix(C.gold, C.fog, t)
      ctx.lineWidth = Math.max(0.8, 0.3 * top.s)
      ctx.beginPath()
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(top.x, top.y - 3.2 * top.s)
      ctx.moveTo(top.x - 1 * top.s, top.y - 2.3 * top.s)
      ctx.lineTo(top.x + 1 * top.s, top.y - 2.3 * top.s)
      ctx.stroke()
    }
  }

  // The cinema's sign down its corner: CINE in lights
  function blade(x: number, y: number, now: number) {
    if (!ctx) return
    const p = at(x, y, 11)
    if (!p || p.d > FAR) return
    const t = fogOf(p.d)
    const s = p.s
    const w = 3.6 * s
    const h = 17 * s
    const x0 = p.x - w / 2
    const y0 = p.y - h
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.5 * (1 - t)
    ctx.drawImage(sp.glow, p.x - w * 2.2, y0 - w * 0.5, w * 4.4, h + w)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = mix('#8e2324', C.fog, t)
    ctx.fillRect(x0, y0, w, h)
    ctx.strokeStyle = mix(C.cream, C.fog, t)
    ctx.lineWidth = Math.max(0.7, 0.25 * s)
    ctx.strokeRect(x0 + 0.4 * s, y0 + 0.4 * s, w - 0.8 * s, h - 0.8 * s)
    // bulbs round its edge, chasing
    ctx.fillStyle = mix('#ffe9a6', C.fog, t * 0.4)
    const n = 12
    const step = still ? 0 : Math.floor(now / 160) % 3
    for (let k = 0; k < n; k++) {
      if ((k + step) % 3 === 0) continue
      const by = y0 + ((k + 0.5) / n) * h
      const r = Math.max(0.8, 0.28 * s)
      ctx.fillRect(x0 - r * 0.2, by, r, r)
      ctx.fillRect(x0 + w - r * 0.8, by, r, r)
    }
    if (h > 24) {
      ctx.fillStyle = mix('#ffe08a', C.fog, t * 0.5)
      ctx.font = `800 ${Math.round(2.9 * s)}px ${SIGN_FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ;[...'CINE'].forEach((ch, k) =>
        ctx.fillText(ch, p.x, y0 + h * (0.17 + k * 0.22)),
      )
    }
  }

  // The hotel's name in lights on its roof
  function letters(x: number, y: number, z: number) {
    if (!ctx) return
    const p = at(x, y, z)
    if (!p || p.d > FAR) return
    const t = fogOf(p.d)
    const s = p.s
    const size = Math.round(4.6 * s)
    if (size < 4) return
    ctx.font = `800 ${size}px ${SIGN_FONT}`
    const w = ctx.measureText('HOTEL').width
    // the frame it stands on
    ctx.strokeStyle = mix(C.post, C.fog, t)
    ctx.lineWidth = Math.max(0.6, 0.2 * s)
    ctx.beginPath()
    for (let k = 0; k <= 4; k++) {
      const lx = p.x - w / 2 + (k / 4) * w
      ctx.moveTo(lx, p.y)
      ctx.lineTo(lx, p.y - 1.4 * s)
    }
    ctx.moveTo(p.x - w / 2, p.y - 1.2 * s)
    ctx.lineTo(p.x + w / 2, p.y - 1.2 * s)
    ctx.stroke()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.45 * (1 - t)
    ctx.drawImage(
      sp.glow,
      p.x - w,
      p.y - 6 * s - w * 0.4,
      w * 2,
      w * 0.8 + 4 * s,
    )
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = mix('#ffe7a8', C.fog, t * 0.45)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('HOTEL', p.x, p.y - 1.5 * s)
  }

  // A board on a corner: the hospital's H, the chemist's green cross
  function board(x: number, y: number, z: number, kind: 'h' | 'cross') {
    if (!ctx) return
    const p = at(x, y, z)
    if (!p || p.d > FAR) return
    const t = fogOf(p.d)
    const s = p.s
    const r = 2.1 * s
    if (kind === 'h') {
      ctx.fillStyle = mix('#2f58a8', C.fog, t)
      ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2)
      ctx.strokeStyle = mix(C.cream, C.fog, t)
      ctx.lineWidth = Math.max(0.6, 0.2 * s)
      ctx.strokeRect(p.x - r * 0.86, p.y - r * 0.86, r * 1.72, r * 1.72)
      ctx.fillStyle = mix('#ffffff', C.fog, t)
      ctx.fillRect(p.x - r * 0.5, p.y - r * 0.55, r * 0.25, r * 1.1)
      ctx.fillRect(p.x + r * 0.25, p.y - r * 0.55, r * 0.25, r * 1.1)
      ctx.fillRect(p.x - r * 0.3, p.y - r * 0.12, r * 0.6, r * 0.24)
      return
    }
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.7 * (1 - t)
    ctx.drawImage(sp.green, p.x - r * 2.4, p.y - r * 2.4, r * 4.8, r * 4.8)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    const arm = r * 0.36
    const plus = (k: number, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(p.x - r * k, p.y - arm * k, r * 2 * k, arm * 2 * k)
      ctx.fillRect(p.x - arm * k, p.y - r * k, arm * 2 * k, r * 2 * k)
    }
    plus(1, mix('#1f7a45', C.fog, t))
    plus(0.72, mix('#58d98c', C.fog, t * 0.5))
  }

  // The station's clock over its roof
  function clock(x: number, y: number, z: number) {
    if (!ctx) return
    const p = at(x, y, z)
    if (!p || p.d > FAR) return
    const t = fogOf(p.d)
    const r = 3.3 * p.s
    ctx.fillStyle = mix(C.gold, C.fog, t)
    ctx.beginPath()
    ctx.arc(p.x, p.y, r * 1.12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = mix('#f6efd9', C.fog, t * 0.6)
    ctx.beginPath()
    ctx.arc(p.x, p.y, r * 0.95, 0, Math.PI * 2)
    ctx.fill()
    if (r < 5) return
    ctx.strokeStyle = mix(C.navy, C.fog, t)
    ctx.lineCap = 'round'
    ctx.lineWidth = Math.max(0.8, r * 0.1)
    ctx.beginPath()
    // a quarter to seven
    const hand = (a: number, k: number) => {
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + Math.sin(a) * r * k, p.y - Math.cos(a) * r * k)
    }
    hand(((6 + 45 / 60) / 12) * Math.PI * 2, 0.5)
    hand((45 / 60) * Math.PI * 2, 0.78)
    ctx.stroke()
    ctx.lineCap = 'butt'
    ctx.fillStyle = mix(C.navy, C.fog, t)
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      ctx.fillRect(
        p.x + Math.sin(a) * r * 0.8 - 0.5,
        p.y - Math.cos(a) * r * 0.8 - 0.5,
        1,
        1,
      )
    }
  }

  // A place's name on an enamel plate at its corner, and the Norwegian
  // under it while the word is new
  function plate(b: Box, caption: string | undefined) {
    if (!ctx || !b.place) return
    const c = cornerOf(b)
    const p = at(c.x + b.ox * 1.9, c.y + b.oy * 1.9, 9.6)
    if (!p || p.d > 260) return
    const fade = p.d < 170 ? 1 : 1 - (p.d - 170) / 90
    const size = Math.max(12, Math.min(30, 2 * p.s))
    ctx.font = `800 ${size}px ${SIGN_FONT}`
    const text = b.place.sign
    const tw = ctx.measureText(text).width + size * 0.08 * text.length
    const w = tw + size * 1.1
    const h = size * 1.5
    const x = p.x - w / 2
    const y = p.y - h / 2
    ctx.globalAlpha = fade
    ctx.fillStyle = 'rgba(10,12,30,0.45)'
    ctx.fillRect(x + 2, y + 3, w, h)
    ctx.fillStyle = C.navy
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = C.gold
    ctx.lineWidth = Math.max(1, size * 0.08)
    ctx.strokeRect(
      x + size * 0.16,
      y + size * 0.16,
      w - size * 0.32,
      h - size * 0.32,
    )
    ctx.fillStyle = C.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.08}px`
    ctx.fillText(text, p.x + size * 0.04, p.y + size * 0.05)
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    let hh = h
    if (caption) {
      const cs = Math.max(11, size * 0.62)
      ctx.font = `italic 400 ${cs}px ${TEXT_FONT}`
      const cw = ctx.measureText(caption).width + cs
      const cy = y + h + cs * 0.15
      ctx.fillStyle = C.cream
      ctx.fillRect(p.x - cw / 2, cy, cw, cs * 1.45)
      ctx.fillStyle = C.navy
      ctx.fillText(caption, p.x, cy + cs * 0.8)
      hh = cy + cs * 1.45 - y
    }
    ctx.globalAlpha = 1
    hits.push({ id: b.place.id, x, y, w, h: hh })
  }

  // A street lamp: a post, a cross-bar and a globe that glows. Near the
  // camera it is gone, so as not to stand in the way (quickly, so that it
  // is never seen half there)
  function lamp(l: Prop) {
    if (!ctx) return
    const p = at(l.x, l.y, 0)
    if (!p || p.d > FAR) return
    const t = fogOf(p.d)
    const s = p.s
    const fade = p.d < 12 ? Math.max(0, (p.d - 10) / 2) : 1
    if (fade <= 0) return
    ctx.globalAlpha = fade
    const top = p.y - 9.4 * s
    ctx.fillStyle = mix(C.post, C.fog, t)
    ctx.fillRect(p.x - 0.17 * s, top, 0.34 * s, 9.4 * s)
    ctx.fillRect(p.x - 0.45 * s, p.y - 1.5 * s, 0.9 * s, 1.5 * s)
    ctx.fillRect(p.x - 0.8 * s, p.y - 7.9 * s, 1.6 * s, 0.25 * s)
    ctx.beginPath()
    ctx.moveTo(p.x - 0.5 * s, top)
    ctx.lineTo(p.x + 0.5 * s, top)
    ctx.lineTo(p.x, top - 0.6 * s)
    ctx.fill()
    const gy = top - 1.2 * s
    ctx.fillStyle = C.globe
    ctx.beginPath()
    ctx.arc(p.x, gy, Math.max(0.8, 0.72 * s), 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = mix(C.post, C.fog, t)
    ctx.fillRect(p.x - 0.4 * s, gy - 1.05 * s, 0.8 * s, 0.35 * s)
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.85 * fade * (1 - t * 0.7)
    const R = 4.4 * s
    ctx.drawImage(sp.glow, p.x - R, gy - R, R * 2, R * 2)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }

  // A plane tree: a trunk and a dark crown, lit on its lamp side; gone
  // before its crown would fill the view
  function tree(l: Prop) {
    if (!ctx) return
    const p = at(l.x, l.y, 0)
    if (!p || p.d > FAR) return
    const fade = p.d < 16 ? Math.max(0, (p.d - 14) / 2) : 1
    if (fade <= 0) return
    const t = fogOf(p.d)
    const s = p.s
    ctx.globalAlpha = fade
    ctx.fillStyle = mix(C.post, C.fog, t)
    ctx.fillRect(p.x - 0.3 * s, p.y - 6 * s, 0.6 * s, 6 * s)
    const r = rng(l.seed)
    const blobs: Array<[number, number, number]> = []
    for (let k = 0; k < 6; k++)
      blobs.push([(r() - 0.5) * 5.2, 7 + (r() - 0.5) * 3.6, 2 + r() * 1.6])
    ctx.fillStyle = mix(C.tree, C.fog, t)
    ctx.beginPath()
    for (const [bx, bz, br] of blobs) {
      ctx.moveTo(p.x + bx * s + br * s, p.y - bz * s)
      ctx.arc(p.x + bx * s, p.y - bz * s, br * s, 0, Math.PI * 2)
    }
    ctx.fill()
    ctx.fillStyle = mix(C.treeLit, C.fog, t)
    ctx.beginPath()
    for (const [bx, bz, br] of blobs.slice(0, 3)) {
      ctx.moveTo(
        p.x + bx * s + br * 0.6 * s - br * 0.3 * s,
        p.y - bz * s + br * 0.3 * s,
      )
      ctx.arc(
        p.x + bx * s - br * 0.3 * s,
        p.y - bz * s + br * 0.3 * s,
        br * 0.6 * s,
        0,
        Math.PI * 2,
      )
    }
    ctx.fill()
    ctx.globalAlpha = 1
  }

  function drawBlocks(blocks: Array<Block>, view: TaxiView, now: number) {
    for (const bl of blocks) {
      // what stands on the pavement in front of the buildings, as seen
      const front = (p: Prop) =>
        (p.x < bl.ix0 && camX < bl.ix0) ||
        (p.x > bl.ix1 && camX > bl.ix1) ||
        (p.y < bl.iy0 && camY < bl.iy0) ||
        (p.y > bl.iy1 && camY > bl.iy1)
      const props = bl.props
        .map((p) => ({ p, d: depth(p.x, p.y) }))
        .filter((x) => x.d > NEAR && x.d < FAR)
        .sort((a, b) => b.d - a.d)
      const prop = (p: Prop) => (p.kind === 'lamp' ? lamp(p) : tree(p))
      for (const x of props) if (!front(x.p)) prop(x.p)
      const boxes = bl.boxes
        .map((b) => {
          const dx = (b.x0 + b.x1) / 2 - camX
          const dy = (b.y0 + b.y1) / 2 - camY
          return { b, d: dx * dx + dy * dy }
        })
        .sort((a, b) => b.d - a.d)
      for (const { b } of boxes) {
        const seen = cornerSeen(b)
        if (b.crown && (!seen || b.crown === 'attic')) crown(b, now)
        walls(b)
        if (b.crown && seen && b.crown !== 'attic') crown(b, now)
        if (b.place && seen) plate(b, view.captions[b.place.id])
      }
      for (const x of props) if (front(x.p)) prop(x.p)
    }
  }

  // --- The taxi ---

  function drawTaxi(view: TaxiView, now: number) {
    if (!ctx) return
    const { pose } = view
    const sa = Math.sin(pose.a)
    const ca = Math.cos(pose.a)
    // forward (sin a, -cos a), right (cos a, sin a)
    const wx = (u: number, v: number) => pose.x + sa * u + ca * v
    const wy = (u: number, v: number) => pose.y - ca * u + sa * v
    const flat = (vs: Array<V3>) =>
      vs.flatMap(([u, v, z]) => [wx(u, v), wy(u, v), z])
    const blinkOn = still || Math.floor(now / 380) % 2 === 0

    // its shadow, and the headlamps' light on the road ahead
    const shadow: Array<V3> = []
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2
      shadow.push([Math.cos(a) * 5.2, Math.sin(a) * 2.3, 0.01])
    }
    ctx.globalAlpha = 0.5
    fill(flat(shadow), '#0b0d24')
    ctx.globalAlpha = 1
    const beam = flat([
      [4.6, -1.4, 0.01],
      [4.6, 1.4, 0.01],
      [28, 6.5, 0.01],
      [28, -6.5, 0.01],
    ])
    const near = at(wx(5, 0), wy(5, 0), 0)
    const far = at(wx(26, 0), wy(26, 0), 0)
    if (near && far) {
      const g = ctx.createLinearGradient(near.x, near.y, far.x, far.y)
      g.addColorStop(0, 'rgba(255,226,160,0.32)')
      g.addColorStop(1, 'rgba(255,226,160,0)')
      ctx.globalCompositeOperation = 'lighter'
      fill(beam, g)
      ctx.globalCompositeOperation = 'source-over'
    }

    // the wheels, then the body, the stripe, the lights, the cabin
    const cam: V3 = [camX, camY, CAMZ]
    const part = (
      p: Part,
      paint: (role: string, pts: Array<number>, n: V3) => void,
    ) => {
      const w = p.verts.map(([u, v, z]): V3 => [wx(u, v), wy(u, v), z])
      const c = w.reduce<V3>(
        (s, x) => [
          s[0] + x[0] / w.length,
          s[1] + x[1] / w.length,
          s[2] + x[2] / w.length,
        ],
        [0, 0, 0],
      )
      for (const f of p.faces) {
        const pts = f.idx.map((i) => w[i])
        const [a, b2, c2] = pts
        let n: V3 = [
          (b2[1] - a[1]) * (c2[2] - a[2]) - (b2[2] - a[2]) * (c2[1] - a[1]),
          (b2[2] - a[2]) * (c2[0] - a[0]) - (b2[0] - a[0]) * (c2[2] - a[2]),
          (b2[0] - a[0]) * (c2[1] - a[1]) - (b2[1] - a[1]) * (c2[0] - a[0]),
        ]
        const m = pts.reduce<V3>(
          (s, x) => [
            s[0] + x[0] / pts.length,
            s[1] + x[1] / pts.length,
            s[2] + x[2] / pts.length,
          ],
          [0, 0, 0],
        )
        if (
          n[0] * (m[0] - c[0]) + n[1] * (m[1] - c[1]) + n[2] * (m[2] - c[2]) <
          0
        )
          n = [-n[0], -n[1], -n[2]]
        const len = Math.hypot(n[0], n[1], n[2]) || 1
        n = [n[0] / len, n[1] / len, n[2] / len]
        const towards =
          (cam[0] - m[0]) * n[0] +
          (cam[1] - m[1]) * n[1] +
          (cam[2] - m[2]) * n[2]
        if (towards <= 0) continue
        paint(f.role, pts.flat(), n)
      }
    }
    const shadeOf = (n: V3) =>
      Math.max(0, -n[0] * 0.55 - n[1] * 0.35 + n[2] * 0.75)
    const body = (n: V3) =>
      mix(mix(C.cream, '#59588a', 0.42), '#fff8e8', shadeOf(n))

    // wheels: dark blocks under the body
    for (const [u, sgn] of [
      [-2.85, 1],
      [-2.85, -1],
      [2.95, 1],
      [2.95, -1],
    ] as const) {
      const v0 = sgn * 1.26
      const v1 = sgn * 1.74
      const wheel: Part = {
        verts: [
          [u - 1.25, v0, 0],
          [u + 1.25, v0, 0],
          [u + 1.25, v1, 0],
          [u - 1.25, v1, 0],
          [u - 1.25, v0, 1.3],
          [u + 1.25, v0, 1.3],
          [u + 1.25, v1, 1.3],
          [u - 1.25, v1, 1.3],
        ],
        faces: [
          { idx: [0, 1, 5, 4], role: 'w' },
          { idx: [1, 2, 6, 5], role: 'w' },
          { idx: [2, 3, 7, 6], role: 'w' },
          { idx: [3, 0, 4, 7], role: 'w' },
        ],
      }
      part(wheel, (_, pts) => fill(pts, '#101226'))
    }

    const pane = { rear: null as Array<number> | null }
    part(car.body, (role, pts, n) => {
      fill(pts, role === 'top' ? '#fbf3e2' : body(n))
      if (role === 'right' || role === 'left') {
        // the red stripe across the doors, from low behind to high in front
        const v = role === 'right' ? 1 : -1
        const onSide = (u: number, z: number): Array<number> => {
          const k = (z - 0.62) / (1.98 - 0.62)
          const vv = v * (1.72 + (1.72 * 0.88 - 1.72) * k + 0.02)
          return [wx(u, vv), wy(u, vv), z]
        }
        fill(
          [
            ...onSide(-0.55, 0.7),
            ...onSide(0.55, 0.7),
            ...onSide(1.85, 1.9),
            ...onSide(0.75, 1.9),
          ],
          mix(C.red, '#3a1a3a', 0.25 * (1 - shadeOf(n))),
        )
        // the doors' seams
        ctx.strokeStyle = 'rgba(40,40,80,0.45)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (const u of [-1.9, 0.0, 1.7]) {
          const a = at(...(onSide(u, 0.7) as V3))
          const b2 = at(...(onSide(u, 1.94) as V3))
          if (a && b2) {
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b2.x, b2.y)
          }
        }
        ctx.stroke()
      }
      if (role === 'rear') {
        const rear = (v: number, z: number): Array<number> => {
          const k = (z - 0.62) / (1.98 - 0.62)
          const u = -4.55 + (-4.55 * 0.975 + 4.55) * k - 0.03
          return [wx(u, v), wy(u, v), z]
        }
        const rect = (v0: number, v1: number, z0: number, z1: number) => [
          ...rear(v0, z0),
          ...rear(v1, z0),
          ...rear(v1, z1),
          ...rear(v0, z1),
        ]
        // the number plate, the tail lights and the indicators
        fill(rect(-0.52, 0.52, 0.9, 1.28), '#efe9da')
        fill(rect(-0.46, 0.46, 0.96, 1.22), '#f8f5ec')
        for (const sgn of [-1, 1]) {
          const brake = view.brake
          fill(
            rect(sgn * 0.82, sgn * 1.08, 1.22, 1.68),
            brake ? '#ff5a3c' : '#9a2a26',
          )
          const blinking =
            blinkOn &&
            (view.hazard ||
              (view.blink === 'right' && sgn > 0) ||
              (view.blink === 'left' && sgn < 0))
          fill(
            rect(sgn * 0.82, sgn * 1.08, 0.98, 1.17),
            blinking ? '#ffc04a' : '#8a5a1e',
          )
        }
      }
    })

    // the chrome bumper behind
    const bumper: Part = {
      verts: [
        [-4.78, -1.45, 0.56],
        [-4.78, 1.45, 0.56],
        [-4.5, 1.45, 0.56],
        [-4.5, -1.45, 0.56],
        [-4.78, -1.45, 0.92],
        [-4.78, 1.45, 0.92],
        [-4.5, 1.45, 0.92],
        [-4.5, -1.45, 0.92],
      ],
      faces: [
        { idx: [0, 1, 5, 4], role: 'b' },
        { idx: [1, 2, 6, 5], role: 'b' },
        { idx: [3, 0, 4, 7], role: 'b' },
        { idx: [4, 5, 6, 7], role: 'top' },
      ],
    }
    part(bumper, (role, pts) =>
      fill(pts, role === 'top' ? '#eef0f6' : '#a9acbe'),
    )

    part(car.cabin, (role, pts, n) => {
      if (role === 'roof') {
        fill(pts, '#fbf3e2')
        return
      }
      fill(pts, body(n))
      // glass within the frame
      const k = role === 'rearGlass' ? 0.2 : 0.16
      const cx = (pts[0] + pts[3] + pts[6] + pts[9]) / 4
      const cy = (pts[1] + pts[4] + pts[7] + pts[10]) / 4
      const cz = (pts[2] + pts[5] + pts[8] + pts[11]) / 4
      const glass = pts.map((x, i) =>
        i % 3 === 0
          ? x + (cx - x) * k
          : i % 3 === 1
            ? x + (cy - x) * k
            : x + (cz - x) * k,
      )
      fill(glass, '#1b2246')
      if (role === 'rearGlass') pane.rear = glass
      if (role === 'rightGlass' || role === 'leftGlass') {
        // the pillar between the doors
        const mid = (a: number, b2: number) => pts[a] + (pts[b2] - pts[a]) * 0.5
        const p0 = at(mid(0, 3), mid(1, 4), mid(2, 5))
        const p1 = at(mid(9, 6), mid(10, 7), mid(11, 8))
        if (p0 && p1) {
          ctx.strokeStyle = body(n)
          ctx.lineWidth = Math.max(1.5, 0.3 * p0.s)
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.stroke()
        }
      }
    })

    // the passenger in the back, seen through the rear window
    if (view.aboard !== null && pane.rear) {
      const head = at(wx(-1.1, 0.55), wy(-1.1, 0.55), 2.62)
      if (head) {
        ctx.save()
        ctx.beginPath()
        poly(ctx, pane.rear)
        ctx.clip()
        figure(head.x, head.y, head.s, view.aboard, true)
        ctx.restore()
      }
    }

    // the roof sign, lit while the taxi is free
    const sign: Part = {
      verts: [
        [-0.55, -0.55, 3.1],
        [-0.55, 0.55, 3.1],
        [0.2, 0.55, 3.1],
        [0.2, -0.55, 3.1],
        [-0.5, -0.5, 3.6],
        [-0.5, 0.5, 3.6],
        [0.15, 0.5, 3.6],
        [0.15, -0.5, 3.6],
      ],
      faces: [
        { idx: [0, 1, 5, 4], role: 's' },
        { idx: [1, 2, 6, 5], role: 's' },
        { idx: [2, 3, 7, 6], role: 's' },
        { idx: [3, 0, 4, 7], role: 's' },
        { idx: [4, 5, 6, 7], role: 'top' },
      ],
    }
    const free = view.aboard === null
    part(sign, (role, pts) =>
      fill(pts, role === 'top' ? '#e8dcc0' : free ? '#ffd27a' : '#8a7a5c'),
    )
    if (free) {
      const p = at(wx(-0.2, 0), wy(-0.2, 0), 3.35)
      if (p) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.5
        const R = 2.2 * p.s
        ctx.drawImage(sp.glow, p.x - R, p.y - R, R * 2, R * 2)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }
    }

    // the lights' glow, and their red on the wet road
    for (const sgn of [-1, 1]) {
      const p = at(wx(-4.6, sgn * 0.95), wy(-4.6, sgn * 0.95), 1.45)
      if (!p) continue
      ctx.globalCompositeOperation = 'lighter'
      if (view.brake) {
        const R = 1.35 * p.s
        ctx.globalAlpha = 0.75
        ctx.drawImage(sp.red, p.x - R, p.y - R, R * 2, R * 2)
        ctx.globalAlpha = 0.5
        const g = at(wx(-4.6, sgn * 0.95), wy(-4.6, sgn * 0.95), 0)
        if (g) ctx.drawImage(sp.redStreak, p.x - 0.5 * p.s, g.y, p.s, 5 * p.s)
      }
      const blinking =
        blinkOn &&
        (view.hazard ||
          (view.blink === 'right' && sgn > 0) ||
          (view.blink === 'left' && sgn < 0))
      if (blinking) {
        const R = 1.6 * p.s
        ctx.globalAlpha = 0.95
        ctx.drawImage(sp.amber, p.x - R, p.y + 0.25 * p.s - R, R * 2, R * 2)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  // A passenger: their head and shoulders, or all of them walking
  function figure(
    x: number,
    y: number,
    s: number,
    who: number,
    seated: boolean,
    step = 0,
  ) {
    if (!ctx) return
    const ink = '#0d1029'
    const coat = COATS[who % COATS.length]
    if (!seated) {
      // legs, swinging
      ctx.strokeStyle = ink
      ctx.lineWidth = Math.max(1, 0.32 * s)
      ctx.beginPath()
      const sw = Math.sin(step) * 0.35 * s
      ctx.moveTo(x - 0.15 * s, y - 1.5 * s)
      ctx.lineTo(x - 0.15 * s + sw, y)
      ctx.moveTo(x + 0.15 * s, y - 1.5 * s)
      ctx.lineTo(x + 0.15 * s - sw, y)
      ctx.stroke()
      ctx.fillStyle = coat
      ctx.beginPath()
      ctx.moveTo(x - 0.62 * s, y - 1.3 * s)
      ctx.lineTo(x + 0.62 * s, y - 1.3 * s)
      ctx.lineTo(x + 0.48 * s, y - 2.95 * s)
      ctx.lineTo(x - 0.48 * s, y - 2.95 * s)
      ctx.fill()
      y -= 3.25 * s
    } else {
      ctx.fillStyle = mix(coat, ink, 0.55)
      ctx.beginPath()
      ctx.ellipse(x, y + 0.75 * s, 0.75 * s, 0.5 * s, 0, Math.PI, 0)
      ctx.fill()
    }
    ctx.fillStyle = ink
    ctx.beginPath()
    ctx.arc(x, y, 0.3 * s, 0, Math.PI * 2)
    ctx.fill()
    // the hat: a homburg, a flat cap, a bowler, a beret, a boater
    const hat = who % PASSENGERS
    ctx.fillStyle = hat === 4 ? '#d9c79a' : '#141733'
    ctx.beginPath()
    if (hat === 0) {
      ctx.ellipse(x, y - 0.2 * s, 0.55 * s, 0.11 * s, 0, 0, Math.PI * 2)
      ctx.rect(x - 0.3 * s, y - 0.62 * s, 0.6 * s, 0.42 * s)
    } else if (hat === 1) {
      ctx.ellipse(
        x + 0.08 * s,
        y - 0.2 * s,
        0.42 * s,
        0.17 * s,
        -0.15,
        0,
        Math.PI * 2,
      )
    } else if (hat === 2) {
      ctx.ellipse(x, y - 0.2 * s, 0.5 * s, 0.1 * s, 0, 0, Math.PI * 2)
      ctx.ellipse(x, y - 0.28 * s, 0.3 * s, 0.32 * s, 0, Math.PI, 0)
    } else if (hat === 3) {
      ctx.ellipse(
        x + 0.05 * s,
        y - 0.25 * s,
        0.38 * s,
        0.15 * s,
        0.2,
        0,
        Math.PI * 2,
      )
    } else {
      ctx.ellipse(x, y - 0.2 * s, 0.56 * s, 0.1 * s, 0, 0, Math.PI * 2)
      ctx.rect(x - 0.3 * s, y - 0.48 * s, 0.6 * s, 0.28 * s)
    }
    ctx.fill()
  }

  function drawRider(view: TaxiView, now: number, behind: boolean) {
    const rd = view.rider
    if (!rd) return
    const k = (now - rd.t0) / rd.ms
    if (k < 0 || k >= 1) return
    const x = rd.from.x + (rd.to.x - rd.from.x) * k
    const y = rd.from.y + (rd.to.y - rd.from.y) * k
    const p = at(x, y, 0)
    if (!p) return
    if (behind !== p.d > depth(view.pose.x, view.pose.y)) return
    figure(p.x, p.y, p.s, rd.who, false, still ? 0 : now / 90)
  }

  // --- What is hidden: the blocks behind the streets' walls ---

  // The first building a line along the ground from the camera meets, by
  // stepping through the grid's cells: how far, and how high it stands
  const cell = (i: number, j: number) =>
    i < B0 || j < B0 || i > BX1 || j > BY1
      ? undefined
      : town[(i - B0) * ROWS + (j - B0)]
  function cast(ux: number, uy: number) {
    const dx = Math.abs(ux) < 1e-9 ? 1e-9 : ux
    const dy = Math.abs(uy) < 1e-9 ? 1e-9 : uy
    let i = Math.floor((camX - ORIGIN) / PITCH)
    let j = Math.floor((camY - ORIGIN) / PITCH)
    const si = dx > 0 ? 1 : -1
    const sj = dy > 0 ? 1 : -1
    let tx = (ORIGIN + (i + (dx > 0 ? 1 : 0)) * PITCH - camX) / dx
    let ty = (ORIGIN + (j + (dy > 0 ? 1 : 0)) * PITCH - camY) / dy
    const ddx = PITCH / Math.abs(dx)
    const ddy = PITCH / Math.abs(dy)
    let t = 0
    while (t < FAR) {
      const b = cell(i, j)
      if (b) {
        const ax = (b.ix0 - camX) / dx
        const bx = (b.ix1 - camX) / dx
        const ay = (b.iy0 - camY) / dy
        const by = (b.iy1 - camY) / dy
        const t0 = Math.max(Math.min(ax, bx), Math.min(ay, by))
        const t1 = Math.min(Math.max(ax, bx), Math.max(ay, by))
        // (a square the camera has swung into hides nothing)
        if (t0 <= t1 && t0 > 0) {
          const q =
            (camX + dx * t0 > b.ix0 + LOT ? 1 : 0) +
            (camY + dy * t0 > b.iy0 + LOT ? 2 : 0)
          return { t: t0, h: b.boxes[q].h }
        }
      }
      if (tx < ty) {
        t = tx
        tx += ddx
        i += si
      } else {
        t = ty
        ty += ddy
        j += sj
      }
    }
    return null
  }

  // A line cast every few pixels across the picture; a block is hidden
  // where each line across it meets a building nearer than the block that
  // stands higher in sight than all of the block
  const STEP = 4
  const reach: Array<number> = []
  const steep: Array<number> = []
  function castAll() {
    const n = Math.floor(W / STEP) + 1
    reach.length = n
    steep.length = n
    for (let k = 0; k < n; k++) {
      const off = (k * STEP - CX) / F
      const ux = fx + rx * off
      const uy = fy + ry * off
      const len = Math.hypot(ux, uy)
      const hit = cast(ux / len, uy / len)
      reach[k] = hit ? hit.t : Infinity
      steep[k] = hit ? (hit.h - CAMZ) / hit.t : 0
    }
  }
  function hidden(b: Block) {
    let lo = Infinity
    let hi = -Infinity
    for (const [x, y] of [
      [b.x0, b.y0],
      [b.x1, b.y0],
      [b.x0, b.y1],
      [b.x1, b.y1],
    ]) {
      const d = depth(x, y)
      if (d < NEAR) return false
      const sx = CX + (side(x, y) / d) * F
      lo = Math.min(lo, sx)
      hi = Math.max(hi, sx)
    }
    const k0 = Math.max(0, Math.floor(lo / STEP))
    const k1 = Math.min(reach.length - 1, Math.ceil(hi / STEP))
    if (k0 > k1) return false
    const near = Math.hypot(
      Math.max(b.x0 - camX, 0, camX - b.x1),
      Math.max(b.y0 - camY, 0, camY - b.y1),
    )
    const rise = (b.top - CAMZ) / near
    for (let k = k0; k <= k1; k++)
      if (!(reach[k] < near - 0.5 && steep[k] >= rise)) return false
    return true
  }

  const draw = (now: number, view: TaxiView) => {
    if (!ctx) return
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
    last = now
    const { pose } = view
    if (Number.isNaN(camA) || still) camA = pose.a
    else camA = wrap(camA + wrap(pose.a - camA) * (1 - Math.exp(-dt * 3.2)))
    fx = Math.sin(camA)
    fy = -Math.cos(camA)
    rx = Math.cos(camA)
    ry = Math.sin(camA)
    camX = pose.x - fx * BACK + rx * SIDE
    camY = pose.y - fy * BACK + ry * SIDE
    hits = []

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx.imageSmoothingEnabled = true
    drawSky(now)
    drawSkyline()

    // the blocks in sight, far to near
    const margin = W * 0.3
    const blocks: Array<{ b: Block; d: number }> = []
    for (const b of town) {
      let ahead = 0
      let left = 0
      let right = 0
      let nearest = Infinity
      for (const [x, y] of [
        [b.x0, b.y0],
        [b.x1, b.y0],
        [b.x0, b.y1],
        [b.x1, b.y1],
      ]) {
        const d = depth(x, y)
        nearest = Math.min(nearest, d)
        if (d < NEAR) continue
        ahead++
        const sx = CX + (side(x, y) / d) * F
        if (sx < -margin) left++
        if (sx > W + margin) right++
      }
      if (!ahead || nearest > FAR) continue
      if (ahead === 4 && (left === 4 || right === 4)) continue
      const dx = b.cx - camX
      const dy = b.cy - camY
      blocks.push({ b, d: dx * dx + dy * dy })
    }
    blocks.sort((a, b) => b.d - a.d)
    castAll()
    const inSight = blocks.map((x) => x.b).filter((b) => !hidden(b))
    const lamps = inSight.flatMap((b) =>
      b.props.filter((p) => p.kind === 'lamp'),
    )
    drawGround(view, inSight, lamps, now)
    drawBlocks(inSight, view, now)
    drawRider(view, now, true)
    drawTaxi(view, now)
    drawRider(view, now, false)
  }

  const signAt = (x: number, y: number) => {
    for (let k = hits.length - 1; k >= 0; k--) {
      const h = hits[k]
      if (
        x >= h.x - 6 &&
        x <= h.x + h.w + 6 &&
        y >= h.y - 6 &&
        y <= h.y + h.h + 6
      )
        return h
    }
    return null
  }

  return { resize, draw, signAt }
}
