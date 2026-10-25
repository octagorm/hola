import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { WORDS } from '../src/app/data/words'
import { THEME, THEME_GROUPS } from '../src/app/data/themes'
import { MUSEO, PICTURE } from '../src/app/data/museo'
import { MUSEO_PICTURES, SCENES } from '../src/app/data/museo-prompts'
import { DAY, answerCard, emptyBank, merge, newCard } from '../src/app/lib/bank'
import {
  howFar,
  keep,
  progressOf,
  rooms,
  tally,
} from '../src/app/lib/colecciones'
import type { Bank, Card } from '../src/app/lib/bank'

const NOW = Date.parse('2026-10-23T12:00:00')

// A bank with the lesson's first `met` words met, the first `learnt` of
// them learnt (reading lasting six days), answered `ago` days back
function bankWith(lesson: string, met: number, learnt: number, ago = 0) {
  const bank: Bank = emptyBank()
  const t = NOW - ago * DAY
  WORDS.filter((w) => w.lesson === lesson)
    .slice(0, met)
    .forEach((w, i) => {
      const c: Card = newCard(t, i < learnt ? 6 : 0.3)
      bank.cards[w.id] = c
    })
  return bank
}

const sizeOf = (lesson: string) =>
  WORDS.filter((w) => w.lesson === lesson).length

describe('the rule for a lesson', () => {
  it('is untouched with nothing met', () => {
    const p = progressOf(emptyBank(), 'tapeo')
    expect(p.stage).toBe(0)
    expect(p.toward).toBe(0)
    expect(howFar(p)).toMatch(/Ingen av de/)
  })

  it('is begun once a word is met', () => {
    expect(progressOf(bankWith('tapeo', 1, 0), 'tapeo').stage).toBe(1)
  })

  it('is finished with every word met and four in five learnt', () => {
    const n = sizeOf('tapeo')
    const need = Math.ceil(0.8 * n)
    expect(progressOf(bankWith('tapeo', n, need), 'tapeo').stage).toBe(2)
    expect(progressOf(bankWith('tapeo', n, need - 1), 'tapeo').stage).toBe(1)
    expect(progressOf(bankWith('tapeo', n - 1, n - 1), 'tapeo').stage).toBe(1)
  })

  it('does not fade while the player is away', () => {
    const n = sizeOf('clima')
    const p = progressOf(bankWith('clima', n, n, 60), 'clima')
    expect(p.stage).toBe(2)
    expect(howFar(p)).toMatch(/Alle de/)
  })

  it('tells how far, and goes up towards finished', () => {
    const n = sizeOf('compras')
    const a = progressOf(bankWith('compras', 5, 0), 'compras')
    const b = progressOf(bankWith('compras', n, 5), 'compras')
    expect(a.toward).toBeLessThan(b.toward)
    expect(b.toward).toBeLessThan(1)
    expect(howFar(b)).toMatch(/til, så er emnet fullført/)
  })

  it('counts lessons begun and finished', () => {
    const n = sizeOf('tapeo')
    const t = tally(bankWith('tapeo', n, n), ['tapeo', 'clima'])
    expect(t).toEqual({ begun: 1, done: 1, all: 2 })
  })

  it('stays finished after a slip, or a word forgotten', () => {
    const n = sizeOf('tapeo')
    const bank = keep(bankWith('tapeo', n, Math.ceil(0.8 * n)), NOW)
    expect(bank.kept.tapeo).toBe(NOW)
    const [first, second] = WORDS.filter((w) => w.lesson === 'tapeo')
    const cards = { ...bank.cards }
    cards[first.id] = answerCard(cards[first.id], ['leer'], false, NOW + DAY)
    delete cards[second.id]
    const after = { ...bank, cards }
    expect(progressOf({ ...after, kept: {} }, 'tapeo').stage).toBe(1)
    const p = progressOf(after, 'tapeo')
    expect(p.stage).toBe(2)
    expect(howFar(p)).toMatch(/^Fullført/)
  })

  it('is noted as finished only once it is, and kept in a merge', () => {
    const n = sizeOf('tapeo')
    const begun = bankWith('tapeo', n, 1)
    expect(keep(begun, NOW)).toBe(begun)
    const done = keep(bankWith('tapeo', n, n), NOW)
    expect(merge(emptyBank(), done).kept).toEqual({ tapeo: NOW })
    expect(merge(done, emptyBank()).kept).toEqual({ tapeo: NOW })
  })
})

describe('the museum', () => {
  it('has a room for each group of themes, and a picture for each theme', () => {
    expect(rooms().length).toBe(
      THEME_GROUPS.filter((g) => g.themes.length).length,
    )
    for (const g of THEME_GROUPS)
      for (const t of g.themes)
        expect(PICTURE[t.lesson], t.lesson).toBeDefined()
    for (const p of MUSEO) expect(THEME[p.lesson], p.lesson).toBeDefined()
    expect(new Set(MUSEO.map((p) => p.lesson)).size).toBe(MUSEO.length)
  })

  it('has a prompt for each picture, to paint it', () => {
    for (const p of MUSEO) {
      expect(SCENES[p.lesson].length, p.lesson).toBeGreaterThan(100)
      const m = MUSEO_PICTURES[`museo/${p.lesson}`]
      expect(m.shape).toBe(p.shape)
      expect(m.size).toMatch(/^\d+x\d+$/)
      if (m.ref) expect(existsSync(m.ref), m.ref).toBe(true)
      expect(m.prompt).toMatch(/No lettering/)
    }
    expect(Object.keys(SCENES).sort()).toEqual(
      MUSEO.map((p) => p.lesson).sort(),
    )
  })
})
