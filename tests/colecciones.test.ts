import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LESSONS, WORD, WORDS } from '../src/app/data/words'
import { THEME, THEME_GROUPS } from '../src/app/data/themes'
import { KEEPSAKE, KEEPSAKES, keepsakeOf } from '../src/app/data/cajones'
import { MUSEO, PICTURE } from '../src/app/data/museo'
import { MUSEO_PICTURES, SCENES } from '../src/app/data/museo-prompts'
import { DAY, emptyBank, newCard } from '../src/app/lib/bank'
import {
  chests,
  howFar,
  progressOf,
  rooms,
  tally,
} from '../src/app/lib/colecciones'
import { speechItems } from '../src/app/lib/spoken'
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

  it('is begun, its keepsake wrapped, once a word is met', () => {
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
})

describe('the chests of drawers', () => {
  it('hold every lesson once', () => {
    const ids = chests().flatMap((c) => c.lessons)
    expect(ids.sort()).toEqual(LESSONS.map((l) => l.id).sort())
  })

  it('give every lesson a keepsake of its own', () => {
    for (const l of LESSONS) expect(KEEPSAKE[l.id], l.id).toBeDefined()
    const lessons = KEEPSAKES.map((k) => k.lesson)
    expect(new Set(lessons).size).toBe(lessons.length)
    for (const id of lessons)
      expect(LESSONS.some((l) => l.id === id)).toBe(true)
    const arts = KEEPSAKES.map((k) => k.art)
    expect(new Set(arts).size).toBe(arts.length)
  })

  it('name a keepsake by its word in the bank, where it is one', () => {
    for (const k of KEEPSAKES) {
      if (k.word) expect(WORD[k.word]?.es, k.lesson).toBe(k.es)
      else expect(WORD[k.es], `${k.es} is in the bank`).toBeUndefined()
      expect(k.line.length, k.lesson).toBeGreaterThan(20)
    }
  })

  it('have a little box for a lesson with no keepsake yet', () => {
    expect(keepsakeOf('ningunsitio').art).toBe('box')
  })

  it('say each keepsake aloud', () => {
    const said = new Set(speechItems().map((s) => s.text))
    for (const k of KEEPSAKES) expect(said.has(k.es), k.es).toBe(true)
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
