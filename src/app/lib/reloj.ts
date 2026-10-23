import { WORDS, isClue } from '../data/words.ts'
import { due } from './bank.ts'
import { letters, unaccent } from './spanish.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// El reloj blando: hangman with a soft clock. A word met is shown as
// blanks, with its meaning in Norwegian as the clue, so guessing it is
// recalling the Spanish (decir). Each letter not in the word makes the
// clock melt a little more over the edge of its ledge; at the seventh the
// word is lost. A round has five words, easier first.

// Wrong letters before the clock has melted away
export const MISSES = 7
export const ROUND = 5

// A word to play: one word of three to ten letters that can be a clue
export function playable(w: Word): boolean {
  const n = letters(w.bare).length
  return isClue(w) && n >= 3 && n <= 10
}

// The key a letter is guessed by: accents do not matter (A shows Á too),
// but Ñ is a letter of its own
export const keyOf = (c: string) => unaccent(c).toUpperCase()

// The word's letters, as written and as guessed
export const spelling = (w: Word) =>
  [...w.bare].map((c) => ({ shown: c.toUpperCase(), key: keyOf(c) }))

export interface Progress {
  // The letters guessed that are not in the word
  wrong: Array<string>
  solved: boolean
  lost: boolean
}

export function progress(w: Word, guessed: Array<string>): Progress {
  const keys = new Set(spelling(w).map((l) => l.key))
  const wrong = guessed.filter((g) => !keys.has(g))
  const solved = [...keys].every((k) => guessed.includes(k))
  return { wrong, solved, lost: !solved && wrong.length >= MISSES }
}

// What a word saved scores: one for the word, and one more for each
// stage of the clock still firm
export const scoreOf = (misses: number) => MISSES - misses

// How far the clock has melted after some wrong letters, from 0 to 1
export const meltOf = (misses: number) =>
  Math.max(0, Math.min(1, misses / MISSES))

// How hard a word is to recall and spell: its length, and how faded its
// saying is
const hardness = (w: Word, r: number) => letters(w.bare).length + 3 * (1 - r)

// The round's words: of the ten or so whose saying has faded most (with a
// little chance, so that two rounds differ), five spread from the easiest
// to the hardest, in that order
export function round(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Array<Word> {
  const seen = new Set<string>()
  const top: Array<{ w: Word; h: number }> = []
  const pool = due(bank, now, WORDS, 'decir')
    .filter((d) => playable(d.w))
    .map((d) => ({ ...d, k: d.r + random() * 0.3 }))
    .sort((a, b) => a.k - b.k)
  for (const d of pool) {
    const l = letters(d.w.bare)
    if (seen.has(l)) continue
    seen.add(l)
    top.push({ w: d.w, h: hardness(d.w, d.r) })
    if (top.length >= ROUND * 2) break
  }
  top.sort((a, b) => a.h - b.h)
  if (top.length <= ROUND) return top.map((x) => x.w)
  return Array.from(
    { length: ROUND },
    (_, i) => top[Math.round((i * (top.length - 1)) / (ROUND - 1))].w,
  )
}

// --- The soft clock ---
//
// The clock is drawn by bending a round one. A point of it is given by
// `u`, across from its middle, and `s`, down from its top (0) to its
// bottom (2r). Stood on the ledge it is round; as it melts (m from 0 to
// 1) it slumps, its lower part flows over the front edge and hangs down
// the face of the ledge, stretching and narrowing to a drip. Everything
// on it, the rim, the face, the marks and the hands, is bent the same
// way. A little below 0 the clock stands taller than round, as it does
// for a moment when it springs back.

export interface Ledge {
  // The clock's middle across, the front edge of the ledge it stands on,
  // and the clock's radius
  x: number
  edge: number
  r: number
}

export interface Melt {
  // How far the part on top has slumped (1 is round), how much has
  // flowed over the edge, how much longer the part hanging grows, evenly
  // and towards its end, and how much wider it all is
  slump: number
  over: number
  long: number
  grow: number
  wide: number
  m: number
}

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x))
// Quick at first, then slower
const out = (x: number) => 1 - (1 - clamp(x)) ** 2
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

// The clock's shape at a melt; `wobble` jiggles it as a jelly does
export function meltAt(m: number, r: number, wobble = 0): Melt {
  const mm = clamp(m)
  const slump = m < 0 ? 1 - 0.9 * m : 1 - 0.5 * out(m / 0.8)
  return {
    slump: slump * (1 + wobble),
    over: 1.15 * r * mm ** 1.15,
    long: 0.75 * mm * mm,
    grow: 0.15 * mm * mm,
    wide: (m < 0 ? 1 + 0.45 * m : 1 + 0.22 * out(m / 0.8)) * (1 - wobble),
    m: mm,
  }
}

// Where a point of the clock comes to be
export function bend(
  k: Melt,
  g: Ledge,
  u: number,
  s: number,
): [number, number] {
  const over = 2 * g.r - k.over
  if (s <= over) return [g.x + u * k.wide, g.edge - (over - s) * k.slump]
  // Past the edge: hanging down, stretched, bellied and a little narrower
  // towards its end, the left side running further than the right, and
  // leaning a little
  const p = s - over
  const along = k.over > 0 ? p / k.over : 0
  const narrow =
    1 - 0.3 * k.m * along ** 2 + 0.08 * k.m * Math.sin(Math.PI * along)
  const skew = 1 - 0.14 * k.m * (u / g.r)
  return [
    g.x + u * k.wide * narrow + 0.1 * g.r * k.m * (p / g.r) ** 2,
    g.edge + p * (1 + k.long + (k.grow * p) / g.r) * skew,
  ]
}

// A point of the clock by its angle from twelve o'clock, clockwise, and
// its distance from the middle
const polar = (deg: number, rho: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [rho * Math.sin(a), rho * (1 - Math.cos(a))]
}

const f = (n: number) => Math.round(n * 10) / 10

// A smooth closed path through points (Catmull-Rom, as cubic curves)
export function closed(pts: Array<[number, number]>): string {
  const n = pts.length
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return `${d}Z`
}

// A ring of the clock, `rho` of its radius from the middle
export function ring(k: Melt, g: Ledge, rho: number, steps = 72): string {
  return closed(
    Array.from({ length: steps }, (_, i) => {
      const [u, v] = polar((i * 360) / steps, rho * g.r)
      return bend(k, g, u, v + (1 - rho) * g.r)
    }),
  )
}

// A point on the face by its angle and distance from the middle
const onFace = (k: Melt, g: Ledge, deg: number, rho: number) => {
  const [u, v] = polar(deg, rho * g.r)
  return bend(k, g, u, v + (1 - rho) * g.r)
}

// The marks of the hours: longer at twelve, three, six and nine
export function marks(k: Melt, g: Ledge): string {
  return Array.from({ length: 12 }, (_, h) => {
    const a = onFace(k, g, h * 30, h % 3 ? 0.66 : 0.6)
    const b = onFace(k, g, h * 30, 0.76)
    return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`
  }).join('')
}

// A hand, pointing at `deg`, `length` and `width` in parts of the radius:
// a narrow spear, bent with the face
export function hand(
  k: Melt,
  g: Ledge,
  deg: number,
  length: number,
  width: number,
): string {
  const steps = 8
  const side = (sign: number) =>
    Array.from({ length: steps }, (_, i) => {
      const t = i / steps
      const along = t * length
      const half = width * (1 - 0.75 * t) * sign
      // across the hand, at right angles to it
      const a = (deg * Math.PI) / 180
      const x = along * Math.sin(a) + half * Math.cos(a)
      const y = -along * Math.cos(a) + half * Math.sin(a)
      return bend(k, g, x * g.r, g.r + y * g.r)
    })
  const a = (deg * Math.PI) / 180
  const tip = bend(
    k,
    g,
    length * Math.sin(a) * g.r,
    g.r - length * Math.cos(a) * g.r,
  )
  const back = bend(
    k,
    g,
    -0.12 * Math.sin(a) * g.r,
    g.r + 0.12 * Math.cos(a) * g.r,
  )
  const pts = [back, ...side(1), tip, ...side(-1).reverse()]
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`
}

// The middle of the face
export const middle = (k: Melt, g: Ledge) => bend(k, g, 0, g.r)

// The lowest point of the clock
export const tip = (k: Melt, g: Ledge) => bend(k, g, 0, 2 * g.r)

// Drips of gold running from its lower rim as it melts: across from the
// middle, the melt they start at, and their length and width, in radii
const DRIPS = [
  [0.04, 0.25, 0.6, 0.11],
  [-0.5, 0.45, 0.42, 0.085],
  [0.46, 0.6, 0.3, 0.075],
]

export interface Drip {
  x: number
  y: number
  long: number
  wide: number
}

export function drips(k: Melt, g: Ledge): Array<Drip> {
  return DRIPS.map(([u, from, long, wide]) => {
    const uu = u * g.r
    // On the lower rim, a little inside it
    const s = g.r + Math.sqrt(g.r * g.r - uu * uu) - 0.06 * g.r
    const [x, y] = bend(k, g, uu, s)
    return { x, y, long: long * g.r * smooth(from, 1, k.m), wide: wide * g.r }
  })
}

// A drip as a path: a finger of gold with a round end
export function drip({ x, y, long: l, wide: w }: Drip): string {
  const e = w * 0.62
  return `M${f(x - w)} ${f(y - w)}C${f(x - w)} ${f(y + l * 0.45)} ${f(x - w * 0.55)} ${f(y + l * 0.7)} ${f(x - e)} ${f(y + l)}A${f(e)} ${f(e)} 0 0 0 ${f(x + e)} ${f(y + l)}C${f(x + w * 0.55)} ${f(y + l * 0.7)} ${f(x + w)} ${f(y + l * 0.45)} ${f(x + w)} ${f(y - w)}Z`
}

// Where a drop falls from: the end of the longest drip
export function dropFrom(k: Melt, g: Ledge): [number, number] {
  const d = drips(k, g)[0]
  return [d.x, d.y + d.long + d.wide * 0.62]
}

// The crown on top: a short stem and the ring of a pocket watch
export function crown(k: Melt, g: Ledge): { stem: string; bow: string } {
  const stem = [
    bend(k, g, -0.08 * g.r, 0.02 * g.r),
    bend(k, g, -0.08 * g.r, -0.13 * g.r),
    bend(k, g, 0.08 * g.r, -0.13 * g.r),
    bend(k, g, 0.08 * g.r, 0.02 * g.r),
  ]
  const bow = closed(
    Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8
      return bend(
        k,
        g,
        0.14 * g.r * Math.sin(a),
        -0.26 * g.r - 0.12 * g.r * Math.cos(a),
      )
    }),
  )
  return {
    stem: `M${stem.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`,
    bow,
  }
}

// The fold where it bends over the edge, if it has reached it: a line
// across the clock along the edge
export function fold(k: Melt, g: Ledge): string | null {
  if (k.over < 0.04 * g.r) return null
  const s = 2 * g.r - k.over
  const half = Math.sqrt(Math.max(0, g.r * g.r - (s - g.r) ** 2))
  const a = bend(k, g, -half * 0.97, s)
  const b = bend(k, g, half * 0.97, s)
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`
}
