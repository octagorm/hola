import { describe, expect, it } from 'vitest'
import { WORD, WORDS, gloss } from '../src/app/data/words'
import { DAY, emptyBank, known, newCard } from '../src/app/lib/bank'
import { letters } from '../src/app/lib/spanish'
import {
  COUNT,
  LEAST,
  SIZE,
  build,
  candidates,
  cellsOf,
  clash,
  hideable,
  line,
  make,
  match,
  readings,
  snap,
} from '../src/app/lib/sopa'

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

describe('Sopa de letras', () => {
  it('hides six to eight words in a square of nine, each once', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const g = make(everyWordKnown(), now, seeded(seed))
      expect(g, `seed ${seed}`).not.toBeNull()
      expect(g!.size).toBe(SIZE)
      expect(g!.cells).toHaveLength(SIZE)
      for (const row of g!.cells) {
        expect(row).toHaveLength(SIZE)
        for (const c of row) expect(c).toMatch(/^[A-ZÑ]$/)
      }
      expect(g!.hidden.length).toBeGreaterThanOrEqual(LEAST)
      expect(g!.hidden.length).toBeLessThanOrEqual(8)
      for (const h of g!.hidden) {
        // Laid where it says, rightwards, downwards or slanting down
        expect(['r', 'd', 'x']).toContain(h.dir)
        expect(h.answer).toBe(letters(h.word.bare))
        expect(h.answer.length).toBeGreaterThanOrEqual(3)
        expect(h.answer.length).toBeLessThanOrEqual(SIZE)
        cellsOf(h).forEach(([r, c], i) => {
          expect(r).toBeLessThan(SIZE)
          expect(c).toBeLessThan(SIZE)
          expect(g!.cells[r][c]).toBe(h.answer[i])
        })
        // and nowhere else, in any direction (a palindrome reads twice
        // over the same squares)
        const places = new Set(
          readings(g!.cells, h.answer).map((x) =>
            x
              .map(([r, c]) => `${r},${c}`)
              .sort()
              .join(' '),
          ),
        )
        expect(places.size, `${h.answer}, seed ${seed}`).toBe(1)
      }
      // No two alike, nor one inside another
      for (const a of g!.hidden)
        for (const b of g!.hidden)
          if (a !== b) expect(clash(a.word, b.word)).toBe(false)
    }
  })

  it('writes words as Spanish word searches do, with Ñ but no accents', () => {
    expect(letters(WORD['el año']!.bare)).toBe('AÑO')
    expect(letters(WORD['el árbol']!.bare)).toBe('ARBOL')
    expect(hideable(WORD['la habitación']!)).toBe(false)
    expect(hideable(WORD['el pez']!)).toBe(true)
    // Not one word, too short, or no clue
    expect(hideable(WORD['buenos días']!)).toBe(false)
    expect(hideable(WORD['el té']!)).toBe(false)
    expect(hideable(WORD['hola']!)).toBe(false)
  })

  it('keeps apart words that are alike or one inside the other', () => {
    expect(clash(WORD['el mes']!, WORD['la mesa']!)).toBe(true)
    expect(clash(WORD['frío']!, WORD['el frío']!)).toBe(true)
    expect(clash(WORD['raro']!, WORD['el gato']!)).toBe(false)
    // The same meaning, as the list would show it
    const rar = WORDS.filter((w) => gloss(w) === 'rar')
    expect(rar.length).toBeGreaterThan(0)
  })

  it('hides the words whose saying has faded most', () => {
    const b = emptyBank()
    // All words met long ago and kept fresh, but for ten whose saying faded
    for (const w of WORDS) b.cards[w.id] = known(now)
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
    const first = candidates(b, now, seeded()).slice(0, 10)
    expect(new Set(first)).toEqual(new Set(faded))
    const g = build(first.concat(candidates(b, now, seeded()).slice(10)), {
      random: seeded(2),
    })!
    for (const h of g.hidden)
      expect(faded.some((w) => w.id === h.word.id)).toBe(true)
  })

  it('makes no grid of too few words', () => {
    const b = emptyBank()
    for (const w of WORDS.filter((x) => hideable(x)).slice(0, 3))
      b.cards[w.id] = known(now)
    expect(make(b, now, seeded())).toBeNull()
  })

  it('picks out a word dragged either way, and nothing else', () => {
    const g = make(everyWordKnown(), now, seeded(11))!
    const h = g.hidden[0]
    const cells = cellsOf(h)
    expect(match(g, cells)).toBe(0)
    expect(match(g, [...cells].reverse())).toBe(0)
    expect(match(g, cells.slice(0, -1))).toBe(-1)
    expect(match(g, cells.slice(0, 1))).toBe(-1)
    // From the first letter to the last, in a line
    expect(line(cells[0], cells[cells.length - 1])).toEqual(cells)
    expect(line([0, 0], [1, 2])).toBeNull()
  })

  it('follows a drag along the nearest of eight directions', () => {
    expect(snap([4, 4], [4.2, 7.6], SIZE)).toEqual([4, 8])
    expect(snap([4, 4], [6.8, 7.1], SIZE)).toEqual([7, 7])
    expect(snap([4, 4], [1.2, 4.3], SIZE)).toEqual([1, 4])
    expect(snap([4, 4], [4.2, 4.1], SIZE)).toEqual([4, 4])
    // Never past the edge
    expect(snap([0, 6], [0.1, 14], SIZE)).toEqual([0, 8])
    expect(snap([7, 7], [11, 11], SIZE)).toEqual([8, 8])
  })

  it('lists words enough for a grid from the very start', () => {
    expect(COUNT).toBeGreaterThanOrEqual(LEAST)
    expect(WORDS.filter((w) => hideable(w)).length).toBeGreaterThan(200)
  })
})
