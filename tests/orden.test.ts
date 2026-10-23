import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import { POINTS, SENTENCES } from '../src/app/data/orden'
import { emptyBank, newCard, withStart } from '../src/app/lib/bank'
import {
  ROUND,
  heap,
  hintOf,
  idsOf,
  linesOf,
  matchOf,
  outOfPlace,
  round,
  spanishOf,
  tilesOf,
  unmetIn,
} from '../src/app/lib/orden'
import { plain, tokens, wordIds } from '../src/app/lib/text'
import type { Sentence } from '../src/app/data/orden'

const now = Date.UTC(2026, 9, 22, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const words = (line: string) => tilesOf(line).map((t) => t.es)
const sorted = (xs: Array<string>) => [...xs].sort()

describe('the sentences of Orden', () => {
  it('are about sixty, each line once', () => {
    expect(SENTENCES.length).toBeGreaterThanOrEqual(55)
    expect(SENTENCES.length).toBeLessThanOrEqual(70)
    const lines = SENTENCES.flatMap(linesOf).map(plain)
    expect(new Set(lines).size).toBe(lines.length)
  })

  it('use words that are in the bank', () => {
    for (const s of SENTENCES)
      for (const line of linesOf(s)) {
        // tokens() throws on a word not in WORDS
        const toks = tokens(line)
        for (const t of toks)
          if (t.id) expect(WORD[t.id], `${t.id} in ${line}`).toBeDefined()
        expect(wordIds(line).length, line).toBeGreaterThan(0)
      }
  })

  it('have three to eight tiles, more for a higher level', () => {
    const span: Record<number, [number, number]> = {
      1: [3, 3],
      2: [4, 4],
      3: [5, 6],
      4: [6, 8],
    }
    for (const s of SENTENCES) {
      const n = tilesOf(s.line).length
      const [lo, hi] = span[s.level]
      expect(n, s.line).toBeGreaterThanOrEqual(lo)
      expect(n, s.line).toBeLessThanOrEqual(hi)
    }
    for (const level of [1, 2, 3, 4])
      expect(
        SENTENCES.filter((s) => s.level === level).length,
      ).toBeGreaterThanOrEqual(8)
  })

  it('give each other order the same tiles and words', () => {
    for (const s of SENTENCES)
      for (const line of s.also ?? []) {
        expect(sorted(words(line)), line).toEqual(sorted(words(s.line)))
        expect(sorted(wordIds(line)), line).toEqual(sorted(wordIds(s.line)))
        expect(words(line), line).not.toEqual(words(s.line))
      }
  })

  it('are written as Spanish is, with Norwegian of the same kind', () => {
    for (const s of SENTENCES)
      for (const line of linesOf(s)) {
        const es = plain(line)
        expect(es, line).toMatch(/^(¿)?[A-ZÁÉÍÓÚÑ]/)
        expect(es, line).toMatch(/[.?]$/)
        const question = es.endsWith('?')
        expect(es.startsWith('¿'), line).toBe(question)
        expect(s.no.endsWith('?'), s.no).toBe(question)
        expect(s.no, s.no).toMatch(/^[A-ZÆØÅ].*[.?]$/)
        expect(es, line).not.toMatch(/ [.,?]| {2}/)
      }
  })

  it('show every point, and say each once', () => {
    const used = new Set(SENTENCES.map((s) => s.point))
    for (const p of Object.keys(POINTS))
      expect(used.has(p as never), p).toBe(true)
    for (const text of Object.values(POINTS)) {
      expect(text).toMatch(/^[*A-ZÆØÅ«]/)
      expect(text).toMatch(/[.?]\*?$/)
      expect((text.match(/\*/g) ?? []).length % 2, text).toBe(0)
    }
  })
})

describe('setting the tiles', () => {
  const sol = SENTENCES.find((s) => s.line.startsWith('Hoy hace'))!
  const son = SENTENCES.find((s) => s.line.startsWith('No son'))!

  it('makes tiles in lower case, but for names', () => {
    expect(words(sol.line)).toEqual(['hoy', 'hace', 'sol'])
    const sancho = SENTENCES.find((s) => s.line.startsWith('^Sancho'))!
    expect(words(sancho.line)[0]).toBe('Sancho')
    const derecha = SENTENCES.find((s) => s.line.includes('a_la_derecha'))!
    expect(words(derecha.line)).toContain('a la derecha')
  })

  it('takes every right order, and only those', () => {
    expect(matchOf(sol, ['hoy', 'hace', 'sol'])).toBe(0)
    expect(matchOf(sol, ['hace', 'sol', 'hoy'])).toBe(1)
    expect(matchOf(sol, ['sol', 'hace', 'hoy'])).toBe(-1)
    expect(matchOf(sol, ['hoy', 'hace'])).toBe(-1)
    // two tiles of the same word may change places
    expect(matchOf(son, ['no', 'son', 'gigantes', 'son', 'molinos'])).toBe(0)
    for (const s of SENTENCES)
      linesOf(s).forEach((line, i) => {
        expect(matchOf(s, words(line)), line).toBe(i)
        expect(outOfPlace(s, words(line)), line).toEqual([])
      })
  })

  it('finds the tiles out of place, by the nearest right order', () => {
    expect(outOfPlace(sol, ['hoy', 'sol', 'hace'])).toEqual([1, 2])
    // as near to both: by the first
    expect(outOfPlace(sol, ['sol', 'hace', 'hoy'])).toEqual([0, 2])
    // nearest to «Como en casa hoy»
    const casa = SENTENCES.find((s) => s.line.startsWith('Hoy como'))!
    expect(outOfPlace(casa, ['como', 'en', 'hoy', 'casa'])).toEqual([2, 3])
    expect(outOfPlace(casa, ['hoy', 'en', 'como', 'casa'])).toEqual([1, 2])
  })

  it('never heaps the tiles in a right order', () => {
    const random = seeded()
    for (const s of SENTENCES)
      for (let i = 0; i < 5; i++) {
        const h = heap(s, random)
        expect(
          matchOf(
            s,
            h.map((t) => t.es),
          ),
          s.line,
        ).toBe(-1)
        expect(sorted(h.map((t) => t.es))).toEqual(sorted(words(s.line)))
        expect(new Set(h.map((t) => t.k)).size).toBe(h.length)
      }
  })

  it('shows and says each right order as Spanish is written', () => {
    expect(spanishOf(sol)).toBe('Hoy hace sol.')
    expect(spanishOf(sol, 1)).toBe('Hace sol hoy.')
    const cuenta = SENTENCES.find((s) => s.line.startsWith('La cuenta'))!
    expect(spanishOf(cuenta)).toBe('La cuenta, por favor.')
    const pregunta = SENTENCES.find((s) => s.line.startsWith('¿ Qué hora'))!
    expect(spanishOf(pregunta)).toBe('¿Qué hora es?')
  })
})

describe('a round of Orden', () => {
  it('has eight sentences met, two of each level, the easiest first', () => {
    const bank = withStart(emptyBank(), now)
    for (let seed = 1; seed < 20; seed++) {
      const r = round(bank, seeded(seed))
      expect(r.length).toBe(ROUND)
      expect(new Set(r).size).toBe(ROUND)
      expect(r.map((s) => s.level)).toEqual([1, 1, 2, 2, 3, 3, 4, 4])
      for (const s of r) expect(unmetIn(s, bank), s.line).toBe(0)
    }
  })

  it('has a picture of its own for each sentence', () => {
    const bank = withStart(emptyBank(), now)
    for (let seed = 1; seed < 20; seed++) {
      const r = round(bank, seeded(seed))
      expect(new Set(r.map((s) => s.pic)).size).toBe(ROUND)
    }
  })

  it('varies from round to round', () => {
    const bank = withStart(emptyBank(), now)
    const seen = new Set<Sentence>()
    for (let seed = 1; seed < 10; seed++)
      for (const s of round(bank, seeded(seed))) seen.add(s)
    expect(seen.size).toBeGreaterThan(30)
  })

  it('fills up from the nearest levels when a level has too few met', () => {
    const short = SENTENCES.filter((s) => s.level !== 4)
    const bank = emptyBank()
    for (const s of short)
      for (const id of idsOf(s)) bank.cards[id] = newCard(now)
    const r = round(bank, seeded(), short)
    expect(r.length).toBe(ROUND)
    expect(r.map((s) => s.level)).toEqual([1, 1, 2, 2, 3, 3, 3, 3])
  })

  it('takes sentences with the fewest words not met when few are met', () => {
    const bank = emptyBank()
    const r = round(bank, seeded())
    expect(r.length).toBe(ROUND)
    const gato = SENTENCES.find((s) => s.line.startsWith('El gato'))!
    for (const id of idsOf(gato)) bank.cards[id] = newCard(now)
    expect(round(bank, seeded())).toContain(gato)
    expect(round(bank, seeded())[0]).toBe(gato)
  })
})

describe('hintOf', () => {
  it('names the rule without the example', () => {
    const neg = SENTENCES.find((s) => s.line.startsWith('No entiendo'))!
    expect(hintOf(neg)).toBe('Spansk nekter to ganger.')
  })

  it('never gives a sentence away', () => {
    const bare = (x: string) =>
      x
        .toLowerCase()
        .replace(/[*¿?¡!.,]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    for (const s of SENTENCES) {
      const hint = bare(hintOf(s))
      for (let i = 0; i < linesOf(s).length; i++)
        expect(hint, s.line).not.toContain(bare(spanishOf(s, i)))
      expect(hintOf(s), s.point).toMatch(/[.?]$/)
      expect(hintOf(s).split('*').length % 2, s.point).toBe(1)
    }
  })
})
