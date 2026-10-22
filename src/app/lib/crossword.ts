import { letters } from './spanish.ts'
import type { Word } from '../data/words.ts'

// A small crossword made from the words met: the clues are their meanings
// in Norwegian, so filling it in is saying the Spanish (decir). Words are
// laid crossing one another, as compactly as a few tries can make them
// within a square of `size`.

export type Dir = 'a' | 'd'

export interface Entry {
  word: Word
  answer: string
  row: number
  col: number
  dir: Dir
  // The number at its first square
  n: number
}

export interface Puzzle {
  rows: number
  cols: number
  entries: Array<Entry>
  // Each square's letter, or null where there is none
  cells: Array<Array<string | null>>
}

interface Placed {
  word: Word
  answer: string
  row: number
  col: number
  dir: Dir
}

const key = (r: number, c: number) => `${r},${c}`
const step = (dir: Dir) => (dir === 'a' ? [0, 1] : [1, 0])

class Grid {
  letters = new Map<string, string>()
  dirs = new Map<string, Set<Dir>>()
  placed: Array<Placed> = []
  crossings = 0
  box = { r0: 0, r1: -1, c0: 0, c1: -1 }

  // The crossings a word would make there, or -1 where it does not fit
  fits(p: Placed, size: number): number {
    const [dr, dc] = step(p.dir)
    const len = p.answer.length
    const before = key(p.row - dr, p.col - dc)
    const after = key(p.row + dr * len, p.col + dc * len)
    if (this.letters.has(before) || this.letters.has(after)) return -1
    let crossings = 0
    for (let i = 0; i < len; i++) {
      const r = p.row + dr * i
      const c = p.col + dc * i
      const at = this.letters.get(key(r, c))
      if (at !== undefined) {
        if (at !== p.answer[i] || this.dirs.get(key(r, c))?.has(p.dir))
          return -1
        crossings++
      } else {
        // An empty square must have nothing beside it across the word,
        // or two words would touch side by side
        const side1 = key(r + dc, c + dr)
        const side2 = key(r - dc, c - dr)
        if (this.letters.has(side1) || this.letters.has(side2)) return -1
      }
    }
    const r0 = Math.min(this.box.r0, p.row)
    const c0 = Math.min(this.box.c0, p.col)
    const r1 = Math.max(this.box.r1, p.row + dr * (len - 1))
    const c1 = Math.max(this.box.c1, p.col + dc * (len - 1))
    if (this.placed.length && (r1 - r0 >= size || c1 - c0 >= size)) return -1
    return crossings
  }

  area(p: Placed): number {
    const [dr, dc] = step(p.dir)
    const len = p.answer.length
    const r0 = Math.min(this.box.r0, p.row)
    const c0 = Math.min(this.box.c0, p.col)
    const r1 = Math.max(this.box.r1, p.row + dr * (len - 1))
    const c1 = Math.max(this.box.c1, p.col + dc * (len - 1))
    return (r1 - r0 + 1) * (c1 - c0 + 1)
  }

  add(p: Placed, crossings: number) {
    const [dr, dc] = step(p.dir)
    const len = p.answer.length
    for (let i = 0; i < len; i++) {
      const k = key(p.row + dr * i, p.col + dc * i)
      this.letters.set(k, p.answer[i])
      const d = this.dirs.get(k) ?? new Set<Dir>()
      d.add(p.dir)
      this.dirs.set(k, d)
    }
    if (!this.placed.length)
      this.box = {
        r0: p.row,
        c0: p.col,
        r1: p.row + dr * (len - 1),
        c1: p.col + dc * (len - 1),
      }
    else
      this.box = {
        r0: Math.min(this.box.r0, p.row),
        c0: Math.min(this.box.c0, p.col),
        r1: Math.max(this.box.r1, p.row + dr * (len - 1)),
        c1: Math.max(this.box.c1, p.col + dc * (len - 1)),
      }
    this.placed.push(p)
    this.crossings += crossings
  }

  // Every place a word could cross the words there
  places(word: Word, answer: string, size: number) {
    const out: Array<{ p: Placed; crossings: number; area: number }> = []
    for (const [k, letter] of this.letters) {
      const [r, c] = k.split(',').map(Number)
      for (let i = 0; i < answer.length; i++) {
        if (answer[i] !== letter) continue
        for (const dir of ['a', 'd'] as const) {
          const [dr, dc] = step(dir)
          const p = { word, answer, dir, row: r - dr * i, col: c - dc * i }
          const crossings = this.fits(p, size)
          if (crossings > 0) out.push({ p, crossings, area: this.area(p) })
        }
      }
    }
    return out
  }
}

// One try: the words in the order given, each where it crosses most and
// grows the grid least
function attempt(
  words: Array<{ word: Word; answer: string }>,
  size: number,
  most: number,
): Grid {
  const g = new Grid()
  const [first, ...rest] = words
  g.add({ ...first, row: 0, col: 0, dir: 'a' }, 0)
  for (const w of rest) {
    if (g.placed.length >= most) break
    const best = g
      .places(w.word, w.answer, size)
      .sort((a, b) => b.crossings - a.crossings || a.area - b.area)
      .at(0)
    if (best) g.add(best.p, best.crossings)
  }
  return g
}

// A crossword from these words (those that need practice first), or null
// if too few of them cross
export function build(
  words: Array<Word>,
  {
    size = 7,
    most = 8,
    least = 4,
    tries = 40,
    random = Math.random,
  }: {
    size?: number
    most?: number
    least?: number
    tries?: number
    random?: () => number
  } = {},
): Puzzle | null {
  const seen = new Set<string>()
  const pool = words.flatMap((word) => {
    const answer = letters(word.bare)
    if (word.bare.includes(' ') || answer.length < 3 || answer.length > size)
      return []
    if (seen.has(answer)) return []
    seen.add(answer)
    return [{ word, answer }]
  })
  if (pool.length < least) return null
  let best: Grid | null = null
  for (let t = 0; t < tries; t++) {
    // Mostly the words needing practice, in a different order each try,
    // with a long word to start from
    const order = pool
      .slice(0, 24)
      .map((w, i) => ({ w, k: i / 24 + random() * 0.8 }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.w)
    const longest = order.reduce((a, b) =>
      b.answer.length > a.answer.length ? b : a,
    )
    const g = attempt(
      [longest, ...order.filter((x) => x !== longest)],
      size,
      most,
    )
    const score = (x: Grid) =>
      x.placed.length * 100 + x.crossings * 10 - x.area(x.placed[0]) / 10
    if (!best || score(g) > score(best)) best = g
  }
  if (!best || best.placed.length < least) return null
  return layout(best)
}

// The grid from 0,0 with its squares numbered, left to right and top to
// bottom, as crosswords are
function layout(g: Grid): Puzzle {
  const { r0, c0, r1, c1 } = g.box
  const rows = r1 - r0 + 1
  const cols = c1 - c0 + 1
  const cells: Array<Array<string | null>> = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null),
  )
  for (const [k, letter] of g.letters) {
    const [r, c] = k.split(',').map(Number)
    cells[r - r0][c - c0] = letter
  }
  const starts = [
    ...new Set(g.placed.map((p) => key(p.row - r0, p.col - c0))),
  ].sort((a, b) => {
    const [ar, ac] = a.split(',').map(Number)
    const [br, bc] = b.split(',').map(Number)
    return ar - br || ac - bc
  })
  const entries = g.placed
    .map((p) => {
      const row = p.row - r0
      const col = p.col - c0
      return { ...p, row, col, n: starts.indexOf(key(row, col)) + 1 }
    })
    .sort((a, b) => a.n - b.n || (a.dir === 'a' ? -1 : 1))
  return { rows, cols, entries, cells }
}

// The squares of an entry
export const squares = (e: Entry): Array<[number, number]> => {
  const [dr, dc] = step(e.dir)
  return [...e.answer].map((_, i) => [e.row + dr * i, e.col + dc * i])
}
