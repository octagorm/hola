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
  withStart,
} from '../src/app/lib/bank'
import {
  DAILY_GAMES,
  NEEDS,
  chapterLine,
  clueCount,
  plan,
  ready,
  retheme,
} from '../src/app/lib/today'
import { WORD, WORDS } from '../src/app/data/words'
import {
  KNOWN_AT_START,
  PRACTISED_AT_START,
  START,
} from '../src/app/data/start'
import type { Bank } from '../src/app/lib/bank'

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

describe('the starting point', () => {
  it('lists words of the bank, each once', () => {
    const all = [...KNOWN_AT_START, ...PRACTISED_AT_START]
    for (const id of all) expect(WORD[id], id).toBeDefined()
    expect(new Set(all).size).toBe(all.length)
  })

  it('starts the simplest words known and the easy ones practised', () => {
    const b = withStart(emptyBank(), now)
    expect(b.start).toBe(START)
    for (const id of KNOWN_AT_START)
      expect(level(b.cards[id], now + 14 * DAY), id).toBe(2)
    for (const id of PRACTISED_AT_START)
      expect(level(b.cards[id], now), id).toBe(1)
    // spread, so that they do not all fade on the same day
    const s = new Set(PRACTISED_AT_START.map((id) => b.cards[id]?.leer.s))
    expect(s.size).toBeGreaterThan(PRACTISED_AT_START.length / 2)
    // and the first warm-up is of words being practised
    const warm = plan(b, now).steps[0]
    expect(warm.k).toBe('review')
    for (const id of warm.ids ?? []) expect(PRACTISED_AT_START).toContain(id)
  })

  it('touches nothing learnt, and is given once', () => {
    const b = emptyBank()
    b.cards.hola = newCard(now)
    b.cards['el gato'] = answerCard(newCard(now), ['leer'], false, now)
    const s = withStart(b, now + DAY)
    expect(s.cards.hola).toBe(b.cards.hola)
    expect(s.cards['el gato']).toBe(b.cards['el gato'])
    expect(s.cards.adiós?.z).toBe(1)
    delete s.cards.adiós
    expect(withStart(s, now + 2 * DAY).cards.adiós).toBeUndefined()
  })

  it('gives way in a merge to a card with answers, however old', () => {
    const old = emptyBank()
    old.cards.hola = answerCard(newCard(now), ['leer'], true, now)
    const fresh = withStart(emptyBank(), now + 30 * DAY)
    const m = merge(fresh, old)
    expect(m.cards.hola).toEqual(old.cards.hola)
    expect(m.cards.hola?.z).toBeUndefined()
    expect(m.cards.adiós?.z).toBe(1)
    expect(m.start).toBe(START)
  })

  it('is no longer a seed once answered', () => {
    const b = withStart(emptyBank(), now)
    const c = answerCard(b.cards.hola, ['oir'], true, now + DAY)
    expect(c.z).toBeUndefined()
    expect(c.leer).toEqual(b.cards.hola?.leer)
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

  it('waits for words that make clues before the crossword, the ring and the chain', () => {
    // The first lesson is greetings, which make no clues
    const b = emptyBank()
    for (const w of WORDS.slice(0, 25)) b.cards[w.id] = newCard(now)
    const clues = clueCount(b)
    expect(clues).toBeLessThan(12)
    const games = DAILY_GAMES.filter((g) => ready(g, 25, clues))
    expect(games).toEqual(DAILY_GAMES.filter((g) => !NEEDS[g]))
    for (const w of WORDS.slice(0, 60)) b.cards[w.id] = newCard(now)
    // The chain waits for words enough to make a chain of eight
    expect(DAILY_GAMES.filter((g) => !ready(g, 60, clueCount(b)))).toEqual([
      'cadena',
    ])
    for (const w of WORDS.slice(0, 260)) b.cards[w.id] = newCard(now)
    expect(DAILY_GAMES.every((g) => ready(g, 260, clueCount(b)))).toBe(true)
  })

  it('gives every game its turn, on the days between the chapters too', () => {
    const b = emptyBank()
    for (const w of WORDS.slice(0, 300)) b.cards[w.id] = newCard(now)
    const seen = new Set<string>()
    let stories = 0
    for (let d = 0; d < 2 * DAILY_GAMES.length; d++) {
      const p = plan(b, now + d * DAY)
      if (p.steps.some((s) => s.k === 'story')) stories++
      for (const s of p.steps) if (s.k === 'game' && s.arg) seen.add(s.arg)
    }
    expect(stories).toBe(DAILY_GAMES.length)
    expect([...seen].sort()).toEqual([...DAILY_GAMES].sort())
  })
})

describe('a theme', () => {
  const theme = (id: string, t = now) => ({ ...emptyBank(), theme: { id, t } })

  it('has today’s chapter meet its words before the rest', () => {
    const p = plan(theme('mancha'), now)
    const fresh = p.steps.find((s) => s.k === 'new')?.ids ?? []
    expect(fresh).toHaveLength(5)
    for (const id of fresh) expect(WORD[id]?.lesson).toBe('mancha')
    expect(chapterLine(p)).toContain('fra «Don Quijotes ord»')
    // without one, in lesson order
    const plain = plan(emptyBank(), now).steps[0].ids ?? []
    expect(WORD[plain[0]]?.lesson).toBe(WORDS[0].lesson)
    expect(chapterLine(plan(emptyBank(), now))).not.toContain('fra «')
  })

  it('goes on in lesson order once its words are all met', () => {
    const b = theme('mancha')
    for (const w of WORDS.filter((x) => x.lesson === 'mancha'))
      b.cards[w.id] = newCard(now - DAY)
    const fresh = plan(b, now).steps.find((s) => s.k === 'new')?.ids ?? []
    expect(fresh.length).toBeGreaterThan(0)
    for (const id of fresh) expect(WORD[id]?.lesson).not.toBe('mancha')
  })

  it('takes over today’s new words if none of them is begun', () => {
    const p = plan(emptyBank(), now)
    const b = theme('suenos')
    const q = retheme(p, b)
    const fresh = q.steps.find((s) => s.k === 'new')?.ids ?? []
    expect(fresh).toHaveLength(5)
    for (const id of fresh) expect(WORD[id]?.lesson).toBe('suenos')
    // a step begun keeps its words
    const begun = {
      ...p,
      steps: p.steps.map((s) =>
        s.k === 'new' ? { ...s, got: [`${s.ids?.[0]} met`] } : s,
      ),
    }
    expect(retheme(begun, b)).toEqual(begun)
  })

  it('is the one chosen last when two banks are merged', () => {
    const a = theme('mancha', now)
    const b = theme('suenos', now + 1000)
    expect(merge(a, b).theme.id).toBe('suenos')
    expect(merge(b, a).theme.id).toBe('suenos')
    // leaving a theme is a choice too
    expect(merge(theme('', now + 2000), b).theme.id).toBe('')
    // a bank saved before themes has none
    const old: Partial<Bank> = { cards: {} }
    expect(merge(old, emptyBank()).theme).toEqual({ id: '', t: 0 })
    expect(merge(old, a).theme.id).toBe('mancha')
  })
})
