import { WORDS, gloss, isClue } from '../data/words.ts'
import { due } from './bank.ts'
import { letters } from './spanish.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// Sopa de letras: a word search of the words met, those whose saying has
// faded most. Each word is listed by its meaning, so finding it is
// recalling its Spanish (decir). The words are written as Spanish word
// searches write them, in capitals without accents but with Ñ, and read
// the friendly way only: rightwards, downwards, or slanting down to the
// right. They may cross where their letters agree. The rest of the square
// is filled with letters as often as Spanish uses them, with the hidden
// words' own letters among them, so that no rare letter gives a word away;
// and no word can be read twice, in any direction.

// Nine squares a side: room for six to eight words, and squares big
// enough for a finger on a phone
export const SIZE = 9
export const COUNT = 7
// Fewer words than this make no grid
export const LEAST = 6

export type Cell = [number, number]
export type Dir = 'r' | 'd' | 'x'

export const STEP: Record<Dir, Cell> = { r: [0, 1], d: [1, 0], x: [1, 1] }

export interface Hidden {
  word: Word
  answer: string
  row: number
  col: number
  dir: Dir
}

export interface Grid {
  size: number
  // Each square's letter
  cells: Array<Array<string>>
  hidden: Array<Hidden>
}

// A word that can be hidden: one word of three letters or more that fits
// in the square, and that can be a clue
export function hideable(w: Word, size = SIZE): boolean {
  const n = letters(w.bare).length
  return isClue(w) && n >= 3 && n <= size
}

export const cellsOf = (h: Hidden): Array<Cell> => {
  const [dr, dc] = STEP[h.dir]
  return [...h.answer].map((_, i) => [h.row + dr * i, h.col + dc * i])
}

const reversed = (s: string) => [...s].reverse().join('')

// Two words that would muddle one grid: the same letters or the same
// meaning, or one inside the other either way round (MES in MESA), which
// could then be read twice
export function clash(a: Word, b: Word): boolean {
  const x = letters(a.bare)
  const y = letters(b.bare)
  return (
    gloss(a) === gloss(b) ||
    x.includes(y) ||
    y.includes(x) ||
    x.includes(reversed(y)) ||
    y.includes(reversed(x))
  )
}

// The words met that can be hidden, those whose saying has faded most
// first, with a little chance so that two grids differ
export function candidates(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Array<Word> {
  return due(bank, now, WORDS, 'decir')
    .filter((d) => hideable(d.w))
    .map((d) => ({ w: d.w, k: d.r + random() * 0.3 }))
    .sort((a, b) => a.k - b.k)
    .map((d) => d.w)
}

// How often each letter comes in Spanish, per thousand letters, accented
// vowels counted with their own; K and W, which only loanwords have, are
// left out, and Q, which never stands without a U, is made rarer
const FREQ: Record<string, number> = {
  E: 137,
  A: 125,
  O: 87,
  S: 80,
  R: 69,
  N: 67,
  I: 63,
  D: 59,
  L: 50,
  C: 47,
  T: 46,
  U: 39,
  M: 32,
  P: 25,
  B: 14,
  G: 10,
  V: 9,
  Y: 9,
  H: 7,
  F: 7,
  Z: 5,
  Q: 4,
  J: 4,
  Ñ: 3,
  X: 2,
}

// The letters to fill with and how likely each is: mostly as Spanish has
// them, partly as the hidden words do
export function fillWeights(hidden: Array<string>): Array<[string, number]> {
  const all = Object.values(FREQ).reduce((a, b) => a + b, 0)
  const own: Record<string, number> = {}
  let n = 0
  for (const w of hidden)
    for (const c of w) {
      own[c] = (own[c] ?? 0) + 1
      n++
    }
  const keys = [...new Set([...Object.keys(FREQ), ...Object.keys(own)])]
  return keys.map((k) => [
    k,
    0.75 * ((FREQ[k] ?? 0) / all) + 0.25 * (n ? (own[k] ?? 0) / n : 0),
  ])
}

function draw(weights: Array<[string, number]>, random: () => number) {
  const total = weights.reduce((a, [, w]) => a + w, 0)
  let x = random() * total
  for (const [k, w] of weights) {
    x -= w
    if (x < 0) return k
  }
  return weights[0][0]
}

const EIGHT: Array<Cell> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [-1, 1],
]

const keyOf = (cells: Array<Cell>) =>
  cells
    .map(([r, c]) => `${r},${c}`)
    .sort()
    .join(' ')

// Every place a word can be read in the grid, in any of the eight
// directions, each as the squares it covers
export function readings(
  cells: Array<Array<string>>,
  answer: string,
): Array<Array<Cell>> {
  const n = cells.length
  const len = answer.length
  const out: Array<Array<Cell>> = []
  for (const [dr, dc] of EIGHT)
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        const er = r + dr * (len - 1)
        const ec = c + dc * (len - 1)
        if (er < 0 || er >= n || ec < 0 || ec >= n) continue
        let ok = true
        for (let i = 0; i < len && ok; i++)
          if (cells[r + dr * i][c + dc * i] !== answer[i]) ok = false
        if (ok)
          out.push(
            Array.from({ length: len }, (_, i) => [r + dr * i, c + dc * i]),
          )
      }
  return out
}

// The places a hidden word can be read other than where it was hidden
export function strays(g: Grid): Array<Array<Cell>> {
  return g.hidden.flatMap((h) => {
    const own = keyOf(cellsOf(h))
    return readings(g.cells, h.answer).filter((x) => keyOf(x) !== own)
  })
}

interface Layout {
  cells: Array<Array<string>>
  dirs: Array<Array<Array<Dir>>>
  hidden: Array<Hidden>
}

// How often each way is chosen, before the ways already taken make it
// rarer (so that a grid has words going every way), and at most how many
// words slant, which are the hardest to see
const WAYS: Array<[Dir, number]> = [
  ['r', 1.2],
  ['d', 1],
  ['x', 0.7],
]
const MAX_SLANTING = 2

function weighted<T>(
  xs: Array<{ x: T; weight: number }>,
  random: () => number,
) {
  let left = random() * xs.reduce((a, o) => a + o.weight, 0)
  for (const o of xs) {
    left -= o.weight
    if (left < 0) return o.x
  }
  return xs[xs.length - 1].x
}

// A place for a word: where every square is empty or has its letter from
// a word going another way. The way is chosen first, the less taken the
// likelier, then the place, preferring places where it crosses others.
function place(
  l: Layout,
  w: Word,
  size: number,
  random: () => number,
): Hidden | null {
  const answer = letters(w.bare)
  const len = answer.length
  const ways = WAYS.flatMap(([dir, way]) => {
    const taken = l.hidden.filter((h) => h.dir === dir).length
    if (dir === 'x' && taken >= MAX_SLANTING) return []
    const [dr, dc] = STEP[dir]
    const options: Array<{ x: Hidden; weight: number }> = []
    for (let row = 0; row + dr * (len - 1) < size; row++)
      for (let col = 0; col + dc * (len - 1) < size; col++) {
        let crossings = 0
        let ok = true
        for (let i = 0; i < len && ok; i++) {
          const r = row + dr * i
          const c = col + dc * i
          const at = l.cells[r][c]
          if (!at) continue
          if (at !== answer[i] || l.dirs[r][c].includes(dir)) ok = false
          else crossings++
        }
        if (ok && crossings < len)
          options.push({
            x: { word: w, answer, row, col, dir },
            weight: 1 + 2 * crossings,
          })
      }
    return options.length
      ? [{ x: options, weight: way / (1 + 2 * taken) ** 2 }]
      : []
  })
  return ways.length ? weighted(weighted(ways, random), random) : null
}

// The words laid in an empty square, in the order given, up to `count`,
// leaving out any that clash with one already laid or find no place
function layout(
  words: Array<Word>,
  size: number,
  count: number,
  random: () => number,
): Layout {
  const l: Layout = {
    cells: Array.from({ length: size }, () => Array<string>(size).fill('')),
    dirs: Array.from({ length: size }, () =>
      Array.from({ length: size }, () => [] as Array<Dir>),
    ),
    hidden: [],
  }
  // Short words are easy to find by chance and hard to find on purpose:
  // a few of them only
  let short = 0
  for (const w of words) {
    if (l.hidden.length >= count) break
    if (l.hidden.some((h) => clash(h.word, w))) continue
    const isShort = letters(w.bare).length <= 3
    if (isShort && short >= 2) continue
    const h = place(l, w, size, random)
    if (!h) continue
    if (isShort) short++
    l.hidden.push(h)
    cellsOf(h).forEach(([r, c], i) => {
      l.cells[r][c] = h.answer[i]
      l.dirs[r][c].push(h.dir)
    })
  }
  return l
}

// A grid of up to `count` of the words, taken in the order given (the
// most faded first), or null if fewer than LEAST of them can be hidden
export function build(
  words: Array<Word>,
  {
    size = SIZE,
    count = COUNT,
    random = Math.random,
  }: { size?: number; count?: number; random?: () => number } = {},
): Grid | null {
  for (let attempt = 0; attempt < 30; attempt++) {
    const l = layout(words, size, count, random)
    if (l.hidden.length < Math.min(LEAST, count)) continue
    const fixed = l.cells.map((row) => row.map((c) => c !== ''))
    const weights = fillWeights(l.hidden.map((h) => h.answer))
    const g: Grid = {
      size,
      cells: l.cells.map((row) => row.map((c) => c || draw(weights, random))),
      hidden: l.hidden,
    }
    // Letters drawn again where they spell a hidden word a second time
    for (let i = 0; i < 300; i++) {
      const extra = strays(g)
      if (!extra.length) return g
      const free = extra[0].filter(([r, c]) => !fixed[r][c])
      // Spelt by the hidden words alone: lay them out again
      if (!free.length) break
      const [r, c] = free[Math.floor(random() * free.length)]
      g.cells[r][c] = draw(weights, random)
    }
  }
  return null
}

// A grid for a round, from the bank
export const make = (
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Grid | null => build(candidates(bank, now, random), { random })

// --- Picking out a word ---

export const sameCell = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1]

// The squares from one to another, both included, if they lie in a
// straight line in any of the eight directions
export function line(a: Cell, b: Cell): Array<Cell> | null {
  const dr = b[0] - a[0]
  const dc = b[1] - a[1]
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null
  const n = Math.max(Math.abs(dr), Math.abs(dc))
  const sr = Math.sign(dr)
  const sc = Math.sign(dc)
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + sr * i, a[1] + sc * i])
}

// Where a line dragged from `a` ends with the finger at `p` (in squares,
// fractions and all): along the nearest of the eight directions, as far
// as the finger has gone, and within the square
export function snap(a: Cell, p: [number, number], size: number): Cell {
  const dr = p[0] - a[0]
  const dc = p[1] - a[1]
  if (Math.abs(dr) < 0.5 && Math.abs(dc) < 0.5) return a
  const k = Math.round(Math.atan2(dr, dc) / (Math.PI / 4))
  const sr = Math.round(Math.sin((k * Math.PI) / 4))
  const sc = Math.round(Math.cos((k * Math.PI) / 4))
  let n = Math.round(
    sr && sc ? (Math.abs(dr) + Math.abs(dc)) / 2 : Math.abs(sr ? dr : dc),
  )
  for (; n > 0; n--) {
    const r = a[0] + sr * n
    const c = a[1] + sc * n
    if (r >= 0 && r < size && c >= 0 && c < size) break
  }
  return [a[0] + sr * n, a[1] + sc * n]
}

// The hidden word a line of squares picks out, read either way, or -1
export function match(g: Grid, sel: Array<Cell>): number {
  if (sel.length < 2) return -1
  const k = keyOf(sel)
  return g.hidden.findIndex((h) => keyOf(cellsOf(h)) === k)
}
