import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import { DAY, emptyBank, known, newCard } from '../src/app/lib/bank'
import { letters } from '../src/app/lib/spanish'
import {
  MISSES,
  ROUND,
  bend,
  closed,
  crown,
  drip,
  drips,
  dropFrom,
  fold,
  hand,
  keyOf,
  marks,
  meltAt,
  meltOf,
  playable,
  progress,
  ring,
  round,
  scoreOf,
  spelling,
  tip,
} from '../src/app/lib/reloj'

const now = Date.UTC(2026, 9, 22, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const everyWordKnown = () => {
  const b = emptyBank()
  for (const w of WORDS) b.cards[w.id] = known(now)
  return b
}

describe('El reloj blando: the words', () => {
  it('plays five words met, easier first', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const ws = round(everyWordKnown(), now, seeded(seed))
      expect(ws).toHaveLength(ROUND)
      for (const w of ws) expect(playable(w)).toBe(true)
      // No two spelt alike
      expect(new Set(ws.map((w) => letters(w.bare))).size).toBe(ROUND)
      // All as well known here, so shorter first
      const lengths = ws.map((w) => letters(w.bare).length)
      expect(lengths).toEqual([...lengths].sort((a, b) => a - b))
    }
  })

  it('plays the words whose saying has faded most', () => {
    const b = everyWordKnown()
    const faded = [
      'el gato',
      'la mesa',
      'el libro',
      'la cocina',
      'el jardín',
      'la llave',
      'el espejo',
      'la ventana',
      'el queso',
      'la puerta',
    ].map((id) => WORD[id]!)
    for (const w of faded) {
      const c = newCard(now - 30 * DAY)
      b.cards[w.id] = { ...c, leer: { s: 20, t: now }, oir: { s: 20, t: now } }
    }
    for (let seed = 1; seed <= 10; seed++) {
      const ws = round(b, now, seeded(seed))
      expect(ws).toHaveLength(ROUND)
      for (const w of ws) expect(faded).toContain(w)
    }
  })

  it('plays only words met, and as many as there are', () => {
    const b = emptyBank()
    const few = WORDS.filter((w) => playable(w)).slice(0, 3)
    for (const w of few) b.cards[w.id] = known(now)
    expect(new Set(round(b, now, seeded()))).toEqual(new Set(few))
    expect(round(emptyBank(), now)).toEqual([])
  })

  it('takes one word of three to ten letters that can be a clue', () => {
    expect(playable(WORD['el gato']!)).toBe(true)
    expect(playable(WORD['el pez']!)).toBe(true)
    expect(playable(WORD['la habitación']!)).toBe(true)
    expect(playable(WORD['el restaurante']!)).toBe(false)
    expect(playable(WORD['el té']!)).toBe(false)
    expect(playable(WORD['buenos días']!)).toBe(false)
    expect(playable(WORD['hola']!)).toBe(false)
    expect(WORDS.filter((w) => playable(w)).length).toBeGreaterThan(200)
  })
})

describe('El reloj blando: guessing', () => {
  it('lets a letter without its accent show the letter with it', () => {
    const w = WORD['el árbol']!
    expect(spelling(w).map((l) => l.shown)).toEqual(['Á', 'R', 'B', 'O', 'L'])
    expect(spelling(w).map((l) => l.key)).toEqual(['A', 'R', 'B', 'O', 'L'])
    expect(progress(w, ['A', 'R', 'B', 'O', 'L']).solved).toBe(true)
    expect(keyOf('ü')).toBe('U')
    expect(keyOf('é')).toBe('E')
  })

  it('keeps Ñ a letter of its own', () => {
    const w = WORD['el año']!
    expect(progress(w, ['A', 'N', 'O'])).toEqual({
      wrong: ['N'],
      solved: false,
      lost: false,
    })
    expect(progress(w, ['A', 'N', 'O', 'Ñ']).solved).toBe(true)
  })

  it('loses the word at the seventh wrong letter', () => {
    const w = WORD['el gato']!
    const wrong = ['E', 'I', 'U', 'S', 'R', 'N', 'L']
    expect(MISSES).toBe(7)
    expect(progress(w, wrong.slice(0, 6)).lost).toBe(false)
    expect(progress(w, wrong).lost).toBe(true)
    expect(progress(w, wrong).wrong).toEqual(wrong)
    // Solved before that, it is saved
    const saved = progress(w, ['G', 'E', 'A', 'I', 'T', 'U', 'S', 'O'])
    expect(saved).toEqual({
      wrong: ['E', 'I', 'U', 'S'],
      solved: true,
      lost: false,
    })
  })

  it('scores more for a word saved with fewer wrong letters', () => {
    expect(scoreOf(0)).toBe(7)
    expect(scoreOf(3)).toBe(4)
    expect(scoreOf(6)).toBe(1)
    expect(meltOf(0)).toBe(0)
    expect(meltOf(7)).toBe(1)
    expect(meltOf(9)).toBe(1)
  })
})

describe('El reloj blando: the clock', () => {
  const g = { x: 300, edge: 400, r: 60 }
  const near = (a: number, b: number) => expect(a).toBeCloseTo(b, 6)

  it('stands round on the edge before it melts', () => {
    const k = meltAt(0, g.r)
    for (let deg = 0; deg < 360; deg += 15) {
      const a = (deg * Math.PI) / 180
      const [x, y] = bend(k, g, g.r * Math.sin(a), g.r * (1 - Math.cos(a)))
      near(Math.hypot(x - g.x, y - (g.edge - g.r)), g.r)
    }
    near(tip(k, g)[1], g.edge)
    expect(fold(k, g)).toBeNull()
  })

  it('flows down over the edge as it melts, never more than 2.5r', () => {
    let last = g.edge
    for (let m = 0.1; m <= 1.0001; m += 0.1) {
      const y = tip(meltAt(m, g.r), g)[1]
      expect(y).toBeGreaterThan(last)
      last = y
    }
    expect(last).toBeGreaterThan(g.edge + 2 * g.r)
    expect(last).toBeLessThan(g.edge + 2.5 * g.r)
    // with drips below it, the longest not much more than half a radius
    const ds = drips(meltAt(1, g.r), g)
    expect(ds[0].long).toBeCloseTo(0.6 * g.r)
    expect(dropFrom(meltAt(1, g.r), g)[1]).toBeLessThan(g.edge + 3 * g.r)
    expect(drips(meltAt(0.2, g.r), g).every((d) => d.long === 0)).toBe(true)
    // and what is left on top has slumped low
    const top = bend(meltAt(1, g.r), g, 0, 0)[1]
    expect(top).toBeGreaterThan(g.edge - 0.5 * g.r)
    expect(fold(meltAt(0.6, g.r), g)).toMatch(/^M[\d.]+ [\d.]+L[\d.]+ [\d.]+$/)
  })

  it('springs up taller and narrower for a moment', () => {
    const k = meltAt(-0.1, g.r)
    expect(k.slump).toBeGreaterThan(1)
    expect(k.wide).toBeLessThan(1)
    expect(bend(k, g, 0, 0)[1]).toBeLessThan(g.edge - 2 * g.r)
  })

  it('draws every part as a path', () => {
    for (const m of [-0.15, 0, 0.3, 0.7, 1]) {
      const k = meltAt(m, g.r, 0.04)
      const paths = [
        ring(k, g, 1),
        ring(k, g, 0.84),
        marks(k, g),
        hand(k, g, 60, 0.62, 0.07),
        hand(k, g, 300, 0.42, 0.09),
        crown(k, g).stem,
        crown(k, g).bow,
        ...drips(k, g).map(drip),
      ]
      for (const d of paths) {
        expect(d).toMatch(/^M/)
        expect(d).not.toMatch(/NaN|Infinity/)
      }
    }
    expect(
      closed([
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ]),
    ).toMatch(/^M0 0(C[-\d. ]+){4}Z$/)
  })
})
