import { WORDS } from '../data/words.ts'
import { recall } from './bank.ts'
import { shuffle } from './choices.ts'
import { formsOf } from './letras.ts'
import { letters } from './spanish.ts'
import type { Bank } from './bank.ts'
import type { Form } from './letras.ts'

// Palabras: Scrabble in Spanish against El relojero, the watchmaker.
//
// The tiles are the Spanish edition's, as sold outside North America: a
// hundred, with Ñ, and the digraphs CH, LL and RR as tiles of their own, and
// no K or W, which by the rules of the FISE (the Federación Internacional de
// Scrabble en Español) a blank may not stand for either, so that words with
// them are not laid. A digraph is always its one tile, as the rules have it:
// CALLE is laid C A LL E, and two L tiles side by side never make LL. Tiles
// carry no accents.
//
// The board is 11 × 11 rather than 15 × 15, so that its squares are big
// enough to read and tap on a phone. Its premium squares are where a player
// expects them, the triple words in the corners, the double words along the
// diagonals and the letter squares in rings around the star, but there is
// no triple word in the middle of an edge, as on the usual board: from the
// star of a board this size, the first word could reach it. A game is twelve
// turns, six each, one round of the clock's hand: some ten minutes, where
// playing until the bag is empty would take more than half an hour.
//
// The words are Letras' forms of Hola's words (lib/letras.ts): each word
// that is one word, its plural, and an adjective's feminine, of two tiles
// up to the board's eleven, and not a name, which Scrabble does not allow,
// nor one with a K or a W.
// Verb forms are left out: too many of the verbs are irregular to make them
// by rule.

// --- The tiles ---

// Letter, how many, points
const SET: Array<[string, number, number]> = [
  ['A', 12, 1],
  ['E', 12, 1],
  ['O', 9, 1],
  ['I', 6, 1],
  ['S', 6, 1],
  ['N', 5, 1],
  ['L', 4, 1],
  ['R', 5, 1],
  ['U', 5, 1],
  ['T', 4, 1],
  ['D', 5, 2],
  ['G', 2, 2],
  ['C', 4, 3],
  ['B', 2, 3],
  ['M', 2, 3],
  ['P', 2, 3],
  ['H', 2, 4],
  ['F', 1, 4],
  ['V', 1, 4],
  ['Y', 1, 4],
  ['CH', 1, 5],
  ['Q', 1, 5],
  ['J', 1, 8],
  ['LL', 1, 8],
  ['Ñ', 1, 8],
  ['RR', 1, 8],
  ['X', 1, 8],
  ['Z', 1, 10],
]

export const TILES = SET.map(([l, n, v]) => ({ l, n, v }))
export const BLANKS = 2
export const RACK = 7
// For laying all seven tiles at once
export const BINGO = 50

export const VALUE: Record<string, number | undefined> = Object.fromEntries(
  SET.map(([l, , v]) => [l, v]),
)

// What a blank can be: a letter of the tiles, in the order of the Spanish
// alphabet as Scrabble keeps it
export const ALPHABET = [
  'A',
  'B',
  'C',
  'CH',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'L',
  'LL',
  'M',
  'N',
  'Ñ',
  'O',
  'P',
  'Q',
  'R',
  'RR',
  'S',
  'T',
  'U',
  'V',
  'X',
  'Y',
  'Z',
]

export interface Tile {
  // Each of the hundred has its own, to follow it from the bag to the board
  id: number
  // A blank's letter is '' until it is laid
  l: string
  b?: 1
}

export const valueOf = (t: Tile) => (t.b ? 0 : (VALUE[t.l] ?? 0))

export const DIGRAPHS = new Set(['CH', 'LL', 'RR'])

// A word's letters as the tiles that lay it: CALLE is C A LL E
export function tilesOf(s: string): Array<string> {
  const l = letters(s)
  const out: Array<string> = []
  for (let i = 0; i < l.length; i++) {
    const two = l.slice(i, i + 2)
    if (DIGRAPHS.has(two)) {
      out.push(two)
      i++
    } else out.push(l.charAt(i))
  }
  return out
}

export const keyOf = (tiles: Array<string>) => tiles.join('.')

// A form as it reads on the board: CALLE
export const spell = (tiles: Array<string>) => tiles.join('')

// --- The board ---

export const SIZE = 11
const MID = 5
export const CENTER = MID * SIZE + MID

// T triple word, D double word, t triple letter, d double letter, * the
// star in the middle, which doubles the word laid over it
const LAYOUT = [
  'T..d...d..T',
  '.D...t...D.',
  '..D.....D..',
  'd..D.d.D..d',
  '....t.t....',
  '.t.d.*.d.t.',
  '....t.t....',
  'd..D.d.D..d',
  '..D.....D..',
  '.D...t...D.',
  'T..d...d..T',
]

// As a Spanish board names them: triple palabra, doble palabra, triple
// letra, doble letra
export type Premium = 'TP' | 'DP' | 'TL' | 'DL' | 'star' | null

const PREMIUM_OF: Record<string, Premium | undefined> = {
  T: 'TP',
  D: 'DP',
  t: 'TL',
  d: 'DL',
  '*': 'star',
}

export const PREMIUM: Array<Premium> = [...LAYOUT.join('')].map(
  (c) => PREMIUM_OF[c] ?? null,
)

// 0 the player, 1 El relojero
export type Side = 0 | 1

export interface Cell {
  t: Tile
  by: Side
}

export type Board = Array<Cell | null>

export const rowOf = (i: number) => Math.floor(i / SIZE)
export const colOf = (i: number) => i % SIZE
export const at = (r: number, c: number) => r * SIZE + c

export const emptyBoard = (): Board =>
  Array.from({ length: SIZE * SIZE }, () => null)

export function neighbours(i: number): Array<number> {
  const r = rowOf(i)
  const c = colOf(i)
  const out: Array<number> = []
  if (r > 0) out.push(i - SIZE)
  if (r < SIZE - 1) out.push(i + SIZE)
  if (c > 0) out.push(i - 1)
  if (c < SIZE - 1) out.push(i + 1)
  return out
}

export type Dir = 'across' | 'down'
const DIRS: Array<Dir> = ['across', 'down']
const other = (d: Dir): Dir => (d === 'across' ? 'down' : 'across')

// The square after i in a direction (or before it, with -1); -1 off the
// board
export function step(i: number, dir: Dir, by: 1 | -1 = 1): number {
  if (dir === 'across') {
    const c = colOf(i) + by
    return c < 0 || c >= SIZE ? -1 : i + by
  }
  const r = rowOf(i) + by
  return r < 0 || r >= SIZE ? -1 : i + by * SIZE
}

// --- The words ---

// A form as tiles, and what it is a form of: one or more words of the bank
// (te, el té), each as Letras has it, with its meaning and what to say
export interface Entry {
  tiles: Array<string>
  key: string
  forms: Array<Form>
}

// A name, which Scrabble does not take: la Alhambra, el NIE
const isName = (bare: string) => /[A-ZÁÉÍÓÚÑ]/.test(bare)

// Every form that can be laid, by its key
export const DICT: Map<string, Entry> = (() => {
  const m = new Map<string, Entry>()
  for (const w of WORDS) {
    if (isName(w.bare)) continue
    for (const f of formsOf(w)) {
      const tiles = tilesOf(f.key)
      if (tiles.length < 2 || tiles.length > SIZE) continue
      // (kilo, euskera: no tile, and no blank, is a K or a W)
      if (tiles.some((t) => VALUE[t] === undefined)) continue
      const key = keyOf(tiles)
      const e = m.get(key) ?? { tiles, key, forms: [] }
      e.forms.push(f)
      m.set(key, e)
    }
  }
  return m
})()

// The words of the bank a form is of, each once
export const idsOf = (e: Entry | undefined) => [
  ...new Set((e?.forms ?? []).map((f) => f.w.id)),
]

// A form's words as the player knows them: those met first
export const formsFor = (e: Entry, bank: Bank) =>
  [...e.forms].sort(
    (a, b) => Number(!bank.cards[a.w.id]) - Number(!bank.cards[b.w.id]),
  )

// The forms said aloud that are not words of the bank (plurals, an
// adjective's forms), for lib/spoken.ts; most are Letras' already
export const SAID = [
  ...new Set(
    [...DICT.values()].flatMap((e) =>
      e.forms.filter((f) => f.form !== 'word').map((f) => f.say),
    ),
  ),
]

// The forms of the words met: El relojero lays only these at the easy level
export const metEntries = (bank: Bank): Array<Entry> =>
  [...DICT.values()].filter((e) => e.forms.some((f) => bank.cards[f.w.id]))

export type Level = 'easy' | 'hard'

export const entriesFor = (level: Level, bank: Bank): Array<Entry> =>
  level === 'hard' ? [...DICT.values()] : metEntries(bank)

// --- Laying tiles ---

// A tile laid on a square this turn: its letter, and whether it is a blank
export interface Placed {
  i: number
  l: string
  b: boolean
}

export interface Square extends Placed {
  // Laid this turn, so that its premium counts
  fresh: boolean
}

export interface Formed {
  key: string
  tiles: Array<string>
  squares: Array<Square>
  score: number
}

export interface Laid {
  // The word along the tiles first, then the words across it
  words: Array<Formed>
  score: number
  bingo: boolean
}

export interface Move extends Laid {
  cells: Array<Placed>
}

// Why tiles cannot be laid as they are: none laid, one on a full square,
// not in one line, a gap between them, the first word off the star, a word
// of one letter, or nothing on the board touched
export type Why =
  'none' | 'taken' | 'line' | 'gap' | 'center' | 'short' | 'touch'

// A word's points: its letters, a letter square counting only for a tile
// laid on it now, and each word square laid on now multiplying the whole
export function scoreOf(squares: Array<Square>): number {
  let sum = 0
  let times = 1
  for (const s of squares) {
    let v = s.b ? 0 : (VALUE[s.l] ?? 0)
    if (s.fresh) {
      const p = PREMIUM[s.i]
      if (p === 'DL') v *= 2
      else if (p === 'TL') v *= 3
      else if (p === 'DP' || p === 'star') times *= 2
      else if (p === 'TP') times *= 3
    }
    sum += v
  }
  return sum * times
}

function formed(squares: Array<Square>): Formed {
  const tiles = squares.map((s) => s.l)
  return { key: keyOf(tiles), tiles, squares, score: scoreOf(squares) }
}

type Look = (i: number) => Omit<Square, 'i'> | null

// The run of tiles through square i in a direction
function runAt(i: number, dir: Dir, look: Look): Array<Square> {
  let start = i
  for (let j = step(i, dir, -1); j >= 0 && look(j); j = step(j, dir, -1))
    start = j
  const out: Array<Square> = []
  for (let j = start; j >= 0; j = step(j, dir)) {
    const s = look(j)
    if (!s) break
    out.push({ i: j, ...s })
  }
  return out
}

const onBoard =
  (board: Board): Look =>
  (j) => {
    const c = board[j]
    return c ? { l: c.t.l, b: !!c.t.b, fresh: false } : null
  }

// Tiles laid this turn, checked as the rules have it, and the words they
// make with their points. Whether the words are words is for the caller.
export function lay(
  board: Board,
  placed: Array<Placed>,
): ({ ok: true } & Laid) | { ok: false; why: Why } {
  if (!placed.length) return { ok: false, why: 'none' }
  if (placed.some((p) => board[p.i])) return { ok: false, why: 'taken' }
  const rows = new Set(placed.map((p) => rowOf(p.i)))
  const cols = new Set(placed.map((p) => colOf(p.i)))
  if (rows.size > 1 && cols.size > 1) return { ok: false, why: 'line' }
  const fresh = new Map(placed.map((p) => [p.i, p]))
  const old = onBoard(board)
  const look: Look = (j) => {
    const p = fresh.get(j)
    return p ? { l: p.l, b: p.b, fresh: true } : old(j)
  }
  const first = placed[0].i
  // Along the tiles laid; for one tile, the way it makes a word, across if
  // it makes one both ways
  const dir: Dir =
    placed.length > 1
      ? rows.size === 1
        ? 'across'
        : 'down'
      : runAt(first, 'across', look).length > 1
        ? 'across'
        : 'down'
  const ends = placed.map((p) => p.i).sort((a, b) => a - b)
  const last = ends[ends.length - 1]
  for (let j = ends[0]; j >= 0 && j !== last; j = step(j, dir))
    if (!look(j)) return { ok: false, why: 'gap' }
  if (board.every((c) => !c)) {
    if (!fresh.has(CENTER)) return { ok: false, why: 'center' }
    if (placed.length < 2) return { ok: false, why: 'short' }
  } else if (!placed.some((p) => neighbours(p.i).some((n) => board[n])))
    return { ok: false, why: 'touch' }
  const words: Array<Formed> = []
  const main = runAt(first, dir, look)
  if (main.length > 1) words.push(formed(main))
  for (const p of placed) {
    const cross = runAt(p.i, other(dir), look)
    if (cross.length > 1) words.push(formed(cross))
  }
  if (!words.length) return { ok: false, why: 'short' }
  const bingo = placed.length >= RACK
  const score = words.reduce((n, w) => n + w.score, 0) + (bingo ? BINGO : 0)
  return { ok: true, words, score, bingo }
}

// The words of a play not in the dictionary
export const unknown = (words: Array<Formed>) =>
  words.filter((w) => !DICT.has(w.key))

// Every play a rack can make with the given words, each of them, and every
// word it makes across, among `allowed`. A word is tried at each place it
// fits, with tiles from the rack where the board has none, a blank for a
// letter the rack lacks.
export function findMoves(
  board: Board,
  rack: Array<Tile>,
  words: Array<Entry>,
  allowed: Set<string>,
): Array<Move> {
  const have = new Map<string, number>()
  let blanks = 0
  for (const t of rack) {
    if (t.b) blanks++
    else have.set(t.l, (have.get(t.l) ?? 0) + 1)
  }
  const empty = board.every((c) => !c)
  // Squares a word must cover one of: a tile, or a square beside one
  const near = board.map((c, i) => !!c || neighbours(i).some((n) => board[n]))
  const old = onBoard(board)
  const out: Array<Move> = []
  for (const e of words) {
    const len = e.tiles.length
    if (len > SIZE) continue
    for (const dir of DIRS) {
      const by = dir === 'across' ? 1 : SIZE
      for (let line = 0; line < SIZE; line++) {
        // The first word lies through the star
        if (empty && line !== MID) continue
        for (let s = 0; s + len <= SIZE; s++) {
          if (empty && (s > MID || s + len <= MID)) continue
          const start = dir === 'across' ? at(line, s) : at(s, line)
          // Nothing just before the word or just after it
          if (s > 0 && board[start - by]) continue
          if (s + len < SIZE && board[start + len * by]) continue
          const squares: Array<Square> = []
          const cells: Array<Placed> = []
          const taken: Array<string> = []
          let used = 0
          let touches = empty
          let fits = true
          for (let k = 0; k < len; k++) {
            const i = start + k * by
            const want = e.tiles[k]
            const c = board[i]
            if (c) {
              if (c.t.l !== want) {
                fits = false
                break
              }
              touches = true
              squares.push({ i, l: want, b: !!c.t.b, fresh: false })
              continue
            }
            if (near[i]) touches = true
            const n = have.get(want) ?? 0
            let b = false
            if (n > 0) {
              have.set(want, n - 1)
              taken.push(want)
            } else if (used < blanks) {
              used++
              b = true
            } else {
              fits = false
              break
            }
            cells.push({ i, l: want, b })
            squares.push({ i, l: want, b, fresh: true })
          }
          for (const l of taken) have.set(l, (have.get(l) ?? 0) + 1)
          if (!fits || !cells.length || !touches) continue
          const made: Array<Formed> = [formed(squares)]
          for (const p of cells) {
            const mine = { l: p.l, b: p.b, fresh: true }
            const run = runAt(p.i, other(dir), (j) =>
              j === p.i ? mine : old(j),
            )
            if (run.length < 2) continue
            const f = formed(run)
            if (!allowed.has(f.key)) {
              fits = false
              break
            }
            made.push(f)
          }
          if (!fits) continue
          const bingo = cells.length >= RACK
          out.push({
            cells,
            words: made,
            score: made.reduce((n, w) => n + w.score, 0) + (bingo ? BINGO : 0),
            bingo,
          })
        }
      }
    }
  }
  return out
}

// The rack's tiles for a play: a blank where the play has one
export function tilesFor(
  rack: Array<Tile>,
  cells: Array<Placed>,
): Array<{ id: number; i: number; l: string }> {
  const free = [...rack]
  return cells.map((c) => {
    const k = free.findIndex((t) => (c.b ? t.b : !t.b && t.l === c.l))
    if (k < 0) throw new Error(`No ${c.b ? 'blank' : c.l} on the rack`)
    const [t] = free.splice(k, 1)
    return { id: t.id, i: c.i, l: c.l }
  })
}

// --- A game ---

export const TURNS = 12

export interface Turn {
  by: Side
  kind: 'play' | 'swap' | 'pass'
  // A play's squares, and the words it made with the points of each
  cells?: Array<number>
  words?: Array<{ key: string; score: number }>
  score: number
  // Tiles swapped
  n?: number
}

export interface Game {
  v: 1
  level: Level
  board: Board
  bag: Array<Tile>
  racks: [Array<Tile>, Array<Tile>]
  score: [number, number]
  log: Array<Turn>
  // The words of the player's play recorded in the bank, each once a game
  rec: Array<string>
  // Ended before its twelve turns
  stopped?: boolean
}

// The player begins, so that the star's double word is hers
export const toMove = (g: Game): Side => (g.log.length % 2 === 0 ? 0 : 1)

export const isOver = (g: Game) =>
  !!g.stopped ||
  g.log.length >= TURNS ||
  (!g.bag.length && g.racks.some((r) => !r.length))

// Turns each side has had
export const turnsOf = (g: Game, by: Side) =>
  g.log.filter((t) => t.by === by).length

// A full rack from the bag, which is drawn from its end
function refill(rack: Array<Tile>, bag: Array<Tile>) {
  const n = Math.min(bag.length, Math.max(0, RACK - rack.length))
  if (!n) return { rack, bag }
  return {
    rack: [...rack, ...bag.slice(bag.length - n)],
    bag: bag.slice(0, bag.length - n),
  }
}

export function newGame(level: Level, random: () => number = Math.random) {
  const tiles: Array<Tile> = []
  for (const t of TILES)
    for (let k = 0; k < t.n; k++) tiles.push({ id: tiles.length, l: t.l })
  for (let k = 0; k < BLANKS; k++) tiles.push({ id: tiles.length, l: '', b: 1 })
  const bag = shuffle(tiles, random)
  const game: Game = {
    v: 1,
    level,
    board: emptyBoard(),
    bag: bag.slice(0, bag.length - 2 * RACK),
    racks: [bag.slice(-RACK), bag.slice(-2 * RACK, -RACK)],
    score: [0, 0],
    log: [],
    rec: [],
  }
  return game
}

function withSide<T>(pair: [T, T], by: Side, value: T): [T, T] {
  return by === 0 ? [value, pair[1]] : [pair[0], value]
}

// A play by whoever is to move: tiles from the rack (by id) on squares,
// a blank with the letter it is given
export function play(
  g: Game,
  placed: Array<{ id: number; i: number; l: string }>,
  laid: Laid,
): Game {
  const by = toMove(g)
  const rack = g.racks[by]
  const board = [...g.board]
  for (const p of placed) {
    const t = rack.find((x) => x.id === p.id)
    if (!t) throw new Error(`No tile ${p.id} on the rack`)
    board[p.i] = { t: t.b ? { ...t, l: p.l } : t, by }
  }
  const ids = new Set(placed.map((p) => p.id))
  const next = refill(
    rack.filter((t) => !ids.has(t.id)),
    g.bag,
  )
  return {
    ...g,
    board,
    bag: next.bag,
    racks: withSide(g.racks, by, next.rack),
    score: withSide(g.score, by, g.score[by] + laid.score),
    log: [
      ...g.log,
      {
        by,
        kind: 'play',
        cells: placed.map((p) => p.i),
        words: laid.words.map((w) => ({ key: w.key, score: w.score })),
        score: laid.score,
      },
    ],
  }
}

// Tiles back in the bag and as many new ones, for the turn: the new ones
// are drawn first, as the rules have it, so none comes straight back
export function swap(
  g: Game,
  ids: Array<number>,
  random: () => number = Math.random,
): Game {
  const by = toMove(g)
  const rack = g.racks[by]
  const out = rack.filter((t) => ids.includes(t.id))
  if (!out.length || out.length > g.bag.length) return pass(g)
  const drawn = g.bag.slice(g.bag.length - out.length)
  const back = out.map((t): Tile => (t.b ? { id: t.id, l: '', b: 1 } : t))
  const bag = shuffle(
    [...g.bag.slice(0, g.bag.length - out.length), ...back],
    random,
  )
  return {
    ...g,
    bag,
    racks: withSide(g.racks, by, [
      ...rack.filter((t) => !ids.includes(t.id)),
      ...drawn,
    ]),
    log: [...g.log, { by, kind: 'swap', score: 0, n: out.length }],
  }
}

export const pass = (g: Game): Game => ({
  ...g,
  log: [...g.log, { by: toMove(g), kind: 'pass', score: 0 }],
})

// The player's rack in a new order, as she arranges or shuffles it
export function arrange(g: Game, ids: Array<number>): Game {
  const rack = g.racks[0]
  const order = ids.flatMap((id) => rack.filter((t) => t.id === id))
  if (order.length !== rack.length) return g
  return { ...g, racks: [order, g.racks[1]] }
}

// --- El relojero ---

export type Action =
  | {
      kind: 'play'
      placed: Array<{ id: number; i: number; l: string }>
      move: Move
    }
  | { kind: 'swap'; ids: Array<number> }
  | { kind: 'pass' }

// How much the player needs to see a word again: how far its saying has
// faded, 0–1, or 0 for a word not met
function need(e: Entry | undefined, bank: Bank, now: number): number {
  const cards = idsOf(e).flatMap((id) => {
    const c = bank.cards[id]
    return c ? [c] : []
  })
  if (!cards.length) return 0
  return 1 - Math.max(...cards.map((c) => recall(c.decir, now)))
}

// His choice of play. At the hard level, mostly the best there is, else
// one of the next few. At the easy level a modest one, from the middle of
// what he could lay, without a blank where he can, and a word of three
// tiles or more where there is one, since el and en teach little; and
// among those the word the player most needs to see again, so that his
// plays are practice for her too.
export function choose(
  moves: Array<Move>,
  level: Level,
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Move | null {
  if (!moves.length) return null
  const best = [...moves].sort((a, b) => b.score - a.score)
  if (level === 'hard')
    return random() < 0.7
      ? best[0]
      : best[Math.min(best.length - 1, 1 + Math.floor(random() * 3))]
  const keep = (xs: Array<Move>, ok: (m: Move) => boolean) => {
    const some = xs.filter(ok)
    return some.length ? some : xs
  }
  const pool = keep(
    keep(best, (m) => m.cells.every((c) => !c.b)),
    (m) => m.words[0].tiles.length >= 3,
  )
  const from = Math.floor(pool.length * 0.3)
  const band = pool.slice(
    from,
    Math.max(from + 1, Math.floor(pool.length * 0.7)),
  )
  let pick = band[0]
  let top = -1
  for (const m of band) {
    const k = need(DICT.get(m.words[0].key), bank, now) + random() * 0.6
    if (k > top) {
      top = k
      pick = m
    }
  }
  return pick
}

// What El relojero does on his turn: a play if he has one, else he swaps
// the tiles he has no use for, or passes when the bag is too low. (It plays
// whichever side is to move, so that tests can let him play both.)
export function hisTurn(
  g: Game,
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Action {
  const entries = entriesFor(g.level, bank)
  const allowed = new Set(entries.map((e) => e.key))
  const rack = g.racks[toMove(g)]
  const move = choose(
    findMoves(g.board, rack, entries, allowed),
    g.level,
    bank,
    now,
    random,
  )
  if (move) return { kind: 'play', placed: tilesFor(rack, move.cells), move }
  const ids = rack.filter((t) => !t.b).map((t) => t.id)
  if (ids.length && g.bag.length >= ids.length) return { kind: 'swap', ids }
  return { kind: 'pass' }
}

// --- The player ---

// A play to suggest to the player, and the word to suggest it by: one of
// hers that is good for points and that she most needs to say again; or,
// with none of hers fitting, the best play of any word Hola has
export function hint(
  g: Game,
  bank: Bank,
  now: number,
): { move: Move; id: string; met: boolean } | null {
  const allowed = new Set(DICT.keys())
  const rack = g.racks[0]
  const mine = findMoves(g.board, rack, metEntries(bank), allowed)
  if (mine.length) {
    const best = [...mine].sort((a, b) => b.score - a.score)
    const top = best.slice(0, Math.max(1, Math.ceil(best.length / 2)))
    const most = top[0].score || 1
    const ranked = top
      .map((m) => ({
        m,
        k: need(DICT.get(m.words[0].key), bank, now) + (0.5 * m.score) / most,
      }))
      .sort((a, b) => b.k - a.k)
    const move = ranked[0].m
    const ids = idsOf(DICT.get(move.words[0].key))
    const id = ids.find((x) => bank.cards[x]) ?? ids.at(0) ?? ''
    return { move, id, met: true }
  }
  const any = findMoves(g.board, rack, [...DICT.values()], allowed)
  if (!any.length) return null
  const move = any.reduce((a, b) => (b.score > a.score ? b : a))
  const id = idsOf(DICT.get(move.words[0].key)).at(0) ?? ''
  return { move, id, met: false }
}

// Laying a word is producing the Spanish (decir), though from the letters
// in hand rather than from its meaning, and with tries that cost nothing:
// so each word met that a play makes counts as said at a light weight, by
// the share of its tiles laid now (adding an S to a word on the board says
// little of the word), at least 0.1, and split between the words a form
// could be (te, el té). A word laid after a hint gave only its meaning was
// said from its meaning, among the letters in hand, as when picking from a
// few; a word the hint laid out for her says nothing. A word not met yet is
// met instead. Each word once a game (`done`).
export const LAID = 0.3
export const HINTED = 0.5

export function credit(
  words: Array<Formed>,
  met: (id: string) => boolean,
  done: Array<string> = [],
  hinted?: { id: string; shown: boolean },
): { said: Array<{ id: string; weight: number }>; meet: Array<string> } {
  const said = new Map<string, number>()
  const meet = new Set<string>()
  for (const w of words) {
    const ids = idsOf(DICT.get(w.key)).filter((id) => !done.includes(id))
    const known = ids.filter(met)
    if (!known.length) {
      for (const id of ids) meet.add(id)
      continue
    }
    const share = w.squares.filter((s) => s.fresh).length / w.squares.length
    for (const id of known) {
      if (id === hinted?.id && hinted.shown) continue
      const weight =
        id === hinted?.id ? HINTED : Math.max(0.1, LAID * share) / known.length
      said.set(id, Math.max(said.get(id) ?? 0, weight))
    }
  }
  return {
    said: [...said].map(([id, weight]) => ({ id, weight })),
    meet: [...meet],
  }
}

// --- What El relojero says ---

// In the narrator's voice, with the Norwegian under it in his bubble. Only
// those `said` are said aloud (lib/spoken.ts lists them); the others are
// shown while he thinks or waits.
export const LINES = {
  hello: { es: '¡Hola! ¿Jugamos?', no: 'Hei! Skal vi spille?', said: true },
  think: { es: 'A ver…', no: 'La meg se …', said: false },
  yours: { es: 'Tu turno.', no: 'Din tur.', said: false },
  good: { es: '¡Buena jugada!', no: 'Godt trekk!', said: true },
  swap: {
    es: 'Cambio unas fichas.',
    no: 'Jeg bytter noen brikker.',
    said: true,
  },
  pass: { es: 'Paso.', no: 'Jeg står over.', said: true },
  won: {
    es: '¡Enhorabuena! Has ganado.',
    no: 'Gratulerer! Du vant.',
    said: true,
  },
  lost: {
    es: 'Esta vez he ganado yo.',
    no: 'Denne gangen vant jeg.',
    said: true,
  },
  tie: {
    es: '¡Empate! Muy bien jugado.',
    no: 'Uavgjort! Godt spilt.',
    said: true,
  },
}

export type LineId = keyof typeof LINES

export const LINES_SAID = Object.values(LINES)
  .filter((l) => l.said)
  .map((l) => l.es)
