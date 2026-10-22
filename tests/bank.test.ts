import { describe, expect, it } from 'vitest'
import {
  DAY,
  KNOWN,
  answer,
  answerCard,
  emptyBank,
  known,
  level,
  merge,
  newCard,
  recall,
  weakest,
} from '../src/app/lib/bank'
import { DAILY_GAMES, clueCount, plan, ready } from '../src/app/lib/today'
import { WORDS } from '../src/app/data/words'

const now = Date.UTC(2026, 9, 22, 12)

describe('memory', () => {
  it('fades to 90 % after its stability in days', () => {
    expect(recall({ s: 2, t: now }, now + 2 * DAY)).toBeCloseTo(0.9, 2)
  })

  it('grows more from practice spaced out than crammed', () => {
    const m = { s: 1, t: now }
    const soon = answer(m, true, now + DAY / 24)
    const later = answer(m, true, now + 3 * DAY)
    expect(later.s).toBeGreaterThan(soon.s)
  })

  it('falls below known on a real slip', () => {
    expect(answer({ s: 10, t: now }, false, now + DAY).s).toBeLessThan(KNOWN)
  })
})

describe('a card', () => {
  it('shows a word in Spanish alone once reading it holds', () => {
    expect(level(undefined, now)).toBe(0)
    expect(level(newCard(now), now)).toBe(1)
    expect(level(known(now), now)).toBe(2)
  })

  it('learns only the links asked about', () => {
    const c = answerCard(newCard(now), ['decir'], true, now + DAY)
    expect(c.decir.s).toBeGreaterThan(c.leer.s)
    expect(c.oir.s).toBe(c.leer.s)
  })

  it('has its most faded link practised', () => {
    const c = { ...known(now), oir: { s: 0.05, t: now } }
    expect(weakest(c, now + DAY, () => 0)).toBe('oir')
    expect(weakest(c, now + DAY, () => 0, ['leer', 'decir'])).not.toBe('oir')
  })
})

describe('two banks merged', () => {
  it('keep each link answered last and the larger points', () => {
    const a = emptyBank()
    const b = emptyBank()
    a.cards['el gato'] = { ...newCard(now), leer: { s: 3, t: now + 5 } }
    b.cards['el gato'] = { ...newCard(now), decir: { s: 4, t: now + 9 } }
    a.days['2026-10-22'] = 5
    b.days['2026-10-22'] = 9
    const m = merge(a, b)
    expect(m.cards['el gato']?.leer.s).toBe(3)
    expect(m.cards['el gato']?.decir.s).toBe(4)
    expect(m.days['2026-10-22']).toBe(9)
  })

  it('read a bank saved before a field existed', () => {
    const m = merge({ cards: {} }, emptyBank())
    expect(m.palabra).toEqual({})
  })
})

describe('the day’s chapter', () => {
  it('starts a new player on new words and a game', () => {
    const p = plan(emptyBank(), now)
    expect(p.steps.map((s) => s.k)).toEqual(['new', 'game', 'listen'])
    expect(p.steps[0].ids).toHaveLength(5)
  })

  it('reviews fading words first, and leaves listening out without a voice', () => {
    const b = emptyBank()
    for (const w of WORDS.slice(0, 30)) b.cards[w.id] = newCard(now - 5 * DAY)
    const p = plan(b, now, { hear: false })
    expect(p.steps[0].k).toBe('review')
    expect(p.steps[0].ids).toHaveLength(8)
    expect(p.steps.some((s) => s.k === 'listen')).toBe(false)
  })

  it('waits for words that make clues before the crossword and the ring', () => {
    // The first lesson is greetings, which make no clues
    const b = emptyBank()
    for (const w of WORDS.slice(0, 25)) b.cards[w.id] = newCard(now)
    const clues = clueCount(b)
    expect(clues).toBeLessThan(12)
    const games = DAILY_GAMES.filter((g) => ready(g, 25, clues))
    expect(games).toEqual(['palabra', 'cadaver'])
    for (const w of WORDS.slice(0, 60)) b.cards[w.id] = newCard(now)
    expect(DAILY_GAMES.every((g) => ready(g, 60, clueCount(b)))).toBe(true)
  })
})
