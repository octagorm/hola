import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import { emptyBank, newCard, withStart } from '../src/app/lib/bank'
import {
  ALPHABET,
  BLANKS,
  CENTER,
  DICT,
  LINES_SAID,
  PREMIUM,
  RACK,
  SAID,
  SIZE,
  TILES,
  TURNS,
  arrange,
  at,
  colOf,
  credit,
  emptyBoard,
  findMoves,
  hint,
  hisTurn,
  isOver,
  keyOf,
  lay,
  metEntries,
  newGame,
  pass,
  play,
  rowOf,
  swap,
  tilesFor,
  tilesOf,
  toMove,
  unknown,
} from '../src/app/lib/palabras'
import { HIM, PALABRAS_PICTURES } from '../src/app/data/palabras-prompts'
import {
  FACES,
  RELOJERO,
  SCENE_H,
  SCENE_W,
  TALLER,
  relojeroFace,
} from '../src/app/data/palabrasLayout'
import { plural } from '../src/app/lib/spanish'
import { speechItems } from '../src/app/lib/spoken'
import type { Board, Game, Placed, Tile } from '../src/app/lib/palabras'

const now = Date.UTC(2026, 9, 23, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const key = (s: string) => keyOf(tilesOf(s))

// A board with words laid on it, each from its first square
function boardWith(
  ...words: Array<[string, number, number, 'across' | 'down']>
): Board {
  const b = emptyBoard()
  let id = 1000
  for (const [w, r, c, dir] of words)
    tilesOf(w).forEach((l, k) => {
      const i = dir === 'across' ? at(r, c + k) : at(r + k, c)
      b[i] = { t: { id: id++, l }, by: 1 }
    })
  return b
}

const laid = (s: string, r: number, c: number, dir: 'across' | 'down') =>
  tilesOf(s).map((l, k): Placed => ({
    i: dir === 'across' ? at(r, c + k) : at(r + k, c),
    l,
    b: false,
  }))

const tilesIn = (g: Game) =>
  g.board.filter(Boolean).length +
  g.bag.length +
  g.racks[0].length +
  g.racks[1].length

describe('Palabras: the tiles', () => {
  it('are the Spanish edition’s hundred, with Ñ, CH, LL and RR and no K or W', () => {
    const n = (l: string) => TILES.find((t) => t.l === l)
    expect(TILES.reduce((s, t) => s + t.n, 0) + BLANKS).toBe(100)
    expect(BLANKS).toBe(2)
    expect(n('A')).toMatchObject({ n: 12, v: 1 })
    expect(n('E')).toMatchObject({ n: 12, v: 1 })
    expect(n('O')).toMatchObject({ n: 9, v: 1 })
    expect(n('Ñ')).toMatchObject({ n: 1, v: 8 })
    expect(n('CH')).toMatchObject({ n: 1, v: 5 })
    expect(n('LL')).toMatchObject({ n: 1, v: 8 })
    expect(n('RR')).toMatchObject({ n: 1, v: 8 })
    expect(n('Z')).toMatchObject({ n: 1, v: 10 })
    expect(n('K')).toBeUndefined()
    expect(n('W')).toBeUndefined()
  })

  it('lay a digraph as one tile, and carry no accents', () => {
    expect(tilesOf('calle')).toEqual(['C', 'A', 'LL', 'E'])
    expect(tilesOf('perro')).toEqual(['P', 'E', 'RR', 'O'])
    expect(tilesOf('la noche')).toEqual(['L', 'A', 'N', 'O', 'CH', 'E'])
    expect(tilesOf('año')).toEqual(['A', 'Ñ', 'O'])
    expect(tilesOf('árbol')).toEqual(['A', 'R', 'B', 'O', 'L'])
  })
})

describe('Palabras: the words', () => {
  it('are Hola’s, with their plurals and an adjective’s forms', () => {
    for (const s of ['casa', 'casas', 'gatos', 'buena', 'buenas', 'calle'])
      expect(DICT.has(key(s)), s).toBe(true)
    // (ten letters, too long for Letras but not for the board)
    expect(DICT.has(key('habitación'))).toBe(true)
    expect(DICT.get(key('gatos'))?.forms[0]).toMatchObject({
      form: 'pl',
      say: 'los gatos',
    })
  })

  it('never take two tiles for a digraph', () => {
    expect(DICT.has(keyOf(['C', 'A', 'LL', 'E']))).toBe(true)
    expect(DICT.has(keyOf(['C', 'A', 'L', 'L', 'E']))).toBe(false)
  })

  it('leave out names, and plurals that are not words', () => {
    expect(WORD['la Alhambra']).toBeTruthy()
    expect(DICT.has(key('alhambra'))).toBe(false)
    expect(DICT.has(key('luneses'))).toBe(false)
    expect(DICT.has(key('lunes'))).toBe(true)
  })

  it('leave out words with K or W, which no tile or blank stands for', () => {
    expect(WORD['el kilo']).toBeTruthy()
    expect(DICT.has(key('kilo'))).toBe(false)
    expect(ALPHABET).not.toContain('K')
    expect(ALPHABET).not.toContain('W')
    expect(ALPHABET).toHaveLength(TILES.length)
    for (const e of DICT.values())
      expect(
        e.tiles.every((t) => ALPHABET.includes(t)),
        e.key,
      ).toBe(true)
  })

  it('give a loanword in -t its plural in -s', () => {
    expect(plural('fuet')).toBe('fuets')
    expect(plural('vermut')).toBe('vermuts')
    expect(plural('reloj')).toBe('relojes')
    expect(DICT.has(key('ninots'))).toBe(true)
    expect(DICT.has(key('ninotes'))).toBe(false)
  })

  it('know a form that is two words as both', () => {
    const te = DICT.get(key('te'))!
    expect(te.forms.map((f) => f.w.id).sort()).toEqual(['el té', 'te'])
  })

  it('are said aloud as recorded, with El relojero’s lines', () => {
    const texts = new Set(speechItems().map((s) => s.text))
    for (const s of [...SAID, ...LINES_SAID]) expect(texts.has(s), s).toBe(true)
  })
})

describe('Palabras: the board', () => {
  it('is square, with the star in the middle and the premiums in symmetry', () => {
    expect(PREMIUM).toHaveLength(SIZE * SIZE)
    expect(PREMIUM[CENTER]).toBe('star')
    for (let i = 0; i < SIZE * SIZE; i++) {
      const r = rowOf(i)
      const c = colOf(i)
      expect(PREMIUM[at(c, r)]).toBe(PREMIUM[i])
      expect(PREMIUM[at(r, SIZE - 1 - c)]).toBe(PREMIUM[i])
    }
    expect(PREMIUM.filter((p) => p === 'TP')).toHaveLength(4)
  })

  it('has no triple word the first word could reach from the star', () => {
    for (let k = 0; k < SIZE; k++) {
      expect(PREMIUM[at(5, k)]).not.toBe('TP')
      expect(PREMIUM[at(k, 5)]).not.toBe('TP')
    }
  })
})

describe('Palabras: laying tiles', () => {
  it('puts the first word over the star, of two letters at least', () => {
    const b = emptyBoard()
    expect(lay(b, laid('casa', 0, 0, 'across'))).toEqual({
      ok: false,
      why: 'center',
    })
    expect(lay(b, laid('s', 5, 5, 'across'))).toEqual({
      ok: false,
      why: 'short',
    })
    expect(lay(b, [])).toEqual({ ok: false, why: 'none' })
    const r = lay(b, laid('casa', 5, 3, 'across'))
    expect(r.ok).toBe(true)
  })

  it('wants one line, no gaps, and something on the board touched', () => {
    const b = boardWith(['casa', 5, 3, 'across'])
    const odd: Array<Placed> = [
      { i: at(6, 3), l: 'O', b: false },
      { i: at(7, 4), l: 'S', b: false },
    ]
    expect(lay(b, odd)).toEqual({ ok: false, why: 'line' })
    const gap: Array<Placed> = [
      { i: at(6, 3), l: 'O', b: false },
      { i: at(8, 3), l: 'S', b: false },
    ]
    expect(lay(b, gap)).toEqual({ ok: false, why: 'gap' })
    expect(lay(b, laid('sol', 0, 0, 'across'))).toEqual({
      ok: false,
      why: 'touch',
    })
    expect(lay(b, laid('sol', 5, 3, 'across'))).toEqual({
      ok: false,
      why: 'taken',
    })
  })

  it('scores letters, premiums under new tiles only, and the words across', () => {
    // C on a double letter, the star doubling the word: (6 + 1 + 1 + 1) × 2
    const first = lay(emptyBoard(), laid('casa', 5, 3, 'across'))
    expect(first).toMatchObject({ ok: true, score: 18 })
    // CASAS: the old letters count plain, the S its own 1
    const b = boardWith(['casa', 5, 3, 'across'])
    const s = lay(b, [{ i: at(5, 7), l: 'S', b: false }])
    expect(s).toMatchObject({ ok: true, score: 3 + 1 + 1 + 1 + 1 * 2 })
    // OSO down from the A of CASA, the first O on a triple letter: 3 + 1 + 1
    const oso = lay(b, [
      { i: at(4, 4), l: 'O', b: false },
      { i: at(6, 4), l: 'O', b: false },
    ])
    expect(oso).toMatchObject({ ok: true })
    if (oso.ok) {
      expect(oso.words.map((w) => w.key)).toEqual([keyOf(['O', 'A', 'O'])])
      expect(oso.score).toBe(1 * 3 + 1 + 1 * 3)
      expect(unknown(oso.words)).toHaveLength(1)
    }
  })

  it('gives fifty more for all seven tiles, and nothing for a blank', () => {
    const tiles = laid('ventana', 5, 2, 'across')
    tiles[0] = { ...tiles[0], b: true }
    const r = lay(emptyBoard(), tiles)
    expect(r).toMatchObject({ ok: true, bingo: true })
    // V a blank, worth 0; E and the second N on double letters; the word
    // doubled by the star under the T, then fifty
    if (r.ok) expect(r.score).toBe((0 + 2 + 1 + 1 + 1 + 2 + 1) * 2 + 50)
  })
})

describe('Palabras: finding plays', () => {
  it('finds only plays the rules allow, scored as laying them would', () => {
    const random = seeded(3)
    const bank = withStart(emptyBank(), now)
    let g = newGame('hard', random)
    for (let turn = 0; turn < 8; turn++) {
      const all = [...DICT.values()]
      const moves = findMoves(
        g.board,
        g.racks[toMove(g)],
        all,
        new Set(DICT.keys()),
      )
      for (const m of moves.slice(0, 400)) {
        const r = lay(g.board, m.cells)
        expect(r.ok).toBe(true)
        if (r.ok) {
          expect(r.score).toBe(m.score)
          expect(unknown(r.words)).toEqual([])
        }
      }
      const a = hisTurn(g, bank, now, random)
      g =
        a.kind === 'play'
          ? play(g, a.placed, a.move)
          : a.kind === 'swap'
            ? swap(g, a.ids, random)
            : pass(g)
    }
  })

  it('lets El relojero lay only words she has met, at the easy level', () => {
    const random = seeded(5)
    const bank = withStart(emptyBank(), now)
    const met = new Set(metEntries(bank).map((e) => e.key))
    let g = newGame('easy', random)
    let plays = 0
    while (!isOver(g)) {
      const a = hisTurn(g, bank, now, random)
      if (a.kind === 'play') {
        plays++
        for (const w of a.move.words) expect(met.has(w.key), w.key).toBe(true)
        g = play(g, a.placed, a.move)
      } else g = a.kind === 'swap' ? swap(g, a.ids, random) : pass(g)
    }
    expect(plays).toBeGreaterThan(6)
  })

  it('suggests a play of hers, by a word she has met', () => {
    const bank = withStart(emptyBank(), now)
    const g = newGame('easy', seeded(11))
    const h = hint(g, bank, now)
    expect(h).not.toBeNull()
    if (h) {
      expect(h.met).toBe(true)
      expect(bank.cards[h.id]).toBeTruthy()
      expect(lay(g.board, h.move.cells).ok).toBe(true)
      expect(tilesFor(g.racks[0], h.move.cells)).toHaveLength(
        h.move.cells.length,
      )
    }
  })
})

describe('Palabras: a game', () => {
  it('deals seven each, draws back to seven, and loses no tile', () => {
    const random = seeded(9)
    let g = newGame('easy', random)
    expect(g.racks[0]).toHaveLength(RACK)
    expect(g.racks[1]).toHaveLength(RACK)
    expect(tilesIn(g)).toBe(100)
    expect(toMove(g)).toBe(0)
    const bank = withStart(emptyBank(), now)
    while (!isOver(g)) {
      const before = g.bag.length
      const a = hisTurn(g, bank, now, random)
      g =
        a.kind === 'play'
          ? play(g, a.placed, a.move)
          : a.kind === 'swap'
            ? swap(g, a.ids, random)
            : pass(g)
      expect(tilesIn(g)).toBe(100)
      if (a.kind === 'play') expect(g.bag.length).toBe(before - a.placed.length)
      for (const r of g.racks) expect(r).toHaveLength(RACK)
    }
    expect(g.log).toHaveLength(TURNS)
  })

  it('swaps tiles for as many new ones, a blank going back blank', () => {
    const g0 = newGame('easy', seeded(2))
    const blank: Tile = { id: 999, l: 'Q', b: 1 }
    const g = { ...g0, racks: [[...g0.racks[0].slice(1), blank], g0.racks[1]] }
    const after = swap(g as Game, [999, g.racks[0][0].id], seeded(4))
    expect(after.racks[0]).toHaveLength(RACK)
    expect(after.racks[0].some((t) => t.id === 999)).toBe(false)
    expect(after.bag.find((t) => t.id === 999)).toEqual({
      id: 999,
      l: '',
      b: 1,
    })
    expect(after.log.at(-1)).toMatchObject({ by: 0, kind: 'swap', n: 2 })
  })

  it('keeps the rack in the order she arranges it', () => {
    const g = newGame('easy', seeded(6))
    const ids = g.racks[0].map((t) => t.id).reverse()
    expect(arrange(g, ids).racks[0].map((t) => t.id)).toEqual(ids)
    expect(arrange(g, ids.slice(1))).toBe(g)
  })
})

describe('Palabras: what a play says of the words', () => {
  const casa = boardWith(['casa', 5, 3, 'across'])

  it('counts a word met as said, lightly, by the share of it laid now', () => {
    const r = lay(emptyBoard(), laid('casa', 5, 3, 'across'))
    if (!r.ok) throw new Error(r.why)
    const met = (id: string) => id === 'la casa'
    expect(credit(r.words, met).said).toEqual([{ id: 'la casa', weight: 0.3 }])
    // An S added says little of the word
    const s = lay(casa, [{ i: at(5, 7), l: 'S', b: false }])
    if (!s.ok) throw new Error(s.why)
    expect(credit(s.words, met).said).toEqual([{ id: 'la casa', weight: 0.1 }])
    // Once a game
    expect(credit(r.words, met, ['la casa']).said).toEqual([])
  })

  it('counts more after a hint by meaning, nothing after one laid out', () => {
    const r = lay(emptyBoard(), laid('casa', 5, 3, 'across'))
    if (!r.ok) throw new Error(r.why)
    const met = () => true
    expect(
      credit(r.words, met, [], { id: 'la casa', shown: false }).said,
    ).toEqual([{ id: 'la casa', weight: 0.5 }])
    expect(
      credit(r.words, met, [], { id: 'la casa', shown: true }).said,
    ).toEqual([])
  })

  it('meets a word not met, and splits a form between its words', () => {
    const r = lay(emptyBoard(), laid('casa', 5, 3, 'across'))
    if (!r.ok) throw new Error(r.why)
    expect(credit(r.words, () => false)).toEqual({
      said: [],
      meet: ['la casa'],
    })
    const te = lay(emptyBoard(), laid('te', 5, 4, 'across'))
    if (!te.ok) throw new Error(te.why)
    const both = credit(te.words, () => true).said
    expect(both.map((x) => x.id).sort()).toEqual(['el té', 'te'])
    for (const x of both) expect(x.weight).toBeCloseTo(0.15)
  })

  it('knows a card met from the bank', () => {
    const bank = emptyBank()
    bank.cards['la casa'] = newCard(now)
    expect(metEntries(bank).some((e) => e.key === key('casa'))).toBe(true)
    expect(metEntries(bank).some((e) => e.key === key('perro'))).toBe(false)
  })
})

describe('Palabras: the paintings of El relojero', () => {
  it('has his workshop and a sheet of four faces, and nothing else', () => {
    expect(Object.keys(PALABRAS_PICTURES)).toEqual([TALLER, RELOJERO])
    const sheet = PALABRAS_PICTURES[RELOJERO]
    expect(sheet.parts).toEqual(FACES)
    expect(sheet.cutout).toBe(true)
    expect(sheet.prompt).toContain(HIM)
    // the workshop is cut to the box he is shown in, not cut out
    const taller = PALABRAS_PICTURES[TALLER]
    expect(taller.cutout).toBeFalsy()
    expect(taller.size).toBe(`${SCENE_W * 4}x${SCENE_H * 4}`)
    expect(relojeroFace('think')).toBe('palabras/relojero-think')
  })

  it('has a face for each of his moods, and one to speak with', () => {
    for (const mood of ['calm', 'think', 'glad', 'talk'])
      expect(FACES, mood).toContain(mood)
  })

  it('is painted by the script, and the page never reads the prompts', () => {
    const script = readFileSync('scripts/pictures.mjs', 'utf8')
    expect(script).toContain('Object.assign(PICTURES, PALABRAS_PICTURES)')
    const page = readFileSync('src/app/games/palabras.tsx', 'utf8')
    expect(page).not.toMatch(/from '[^']*-prompts/)
  })
})
