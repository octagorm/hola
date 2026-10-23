import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import { GAPS, RULES } from '../src/app/data/porpara'
import { LINE_VOICE } from '../src/app/data/voices'
import {
  ROUND,
  atStart,
  remember,
  round,
  whole,
  why,
} from '../src/app/lib/porpara'
import { emptyBank, newCard } from '../src/app/lib/bank'
import { speechItems } from '../src/app/lib/spoken'

const now = Date.UTC(2026, 9, 22, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('the sentences of Por o para', () => {
  it('are about sixty, each once, with one gap and an end', () => {
    expect(GAPS.length).toBeGreaterThanOrEqual(55)
    expect(new Set(GAPS.map((g) => g.es)).size).toBe(GAPS.length)
    for (const g of GAPS) {
      expect(g.es.split('_'), g.es).toHaveLength(2)
      expect(g.es, g.es).toMatch(/[.!?]$/)
      expect(g.no, g.es).toMatch(/[.!?]$/)
    }
  })

  it('use words that are in the bank', () => {
    expect(WORD.por).toBeTruthy()
    expect(WORD.para).toBeTruthy()
    for (const g of GAPS)
      for (const id of g.words) expect(WORD[id], `${id} (${g.es})`).toBeTruthy()
  })

  it('take the word their rule takes, about as often por as para', () => {
    for (const g of GAPS) {
      const w = RULES[g.rule].word
      if (w) expect(g.a, g.es).toBe(w)
      else expect(g.expr, g.es).toBeTruthy()
    }
    const paras = GAPS.filter((g) => g.a === 'para').length
    expect(paras).toBeGreaterThan(GAPS.length / 3)
    expect(paras).toBeLessThan((GAPS.length * 2) / 3)
    for (const rule of Object.keys(RULES))
      expect(
        GAPS.some((g) => g.rule === rule),
        rule,
      ).toBe(true)
  })

  it('hold each fixed expression whole', () => {
    for (const g of GAPS.filter((x) => x.expr)) {
      const [expr] = g.expr!
      expect(expr.split(' ')[0]).toBe(g.a)
      expect(whole(g).toLowerCase(), g.es).toContain(expr)
    }
  })

  it('are written whole with a capital where the gap starts a sentence', () => {
    const find = (es: string) => GAPS.find((g) => g.es === es)!
    expect(whole(find('Gracias _ todo.'))).toBe('Gracias por todo.')
    expect(whole(find('¡_ fin llega el verano!'))).toBe(
      '¡Por fin llega el verano!',
    )
    expect(whole(find('Hace frío. _ eso, no salimos.'))).toBe(
      'Hace frío. Por eso, no salimos.',
    )
    expect(whole(find('_ la tarde, tomo un café.'))).toBe(
      'Por la tarde, tomo un café.',
    )
    expect(atStart(find('Este regalo es _ ti.'))).toBe(false)
  })

  it('say why in a line', () => {
    for (const g of GAPS) expect(why(g).length, g.es).toBeGreaterThan(10)
    expect(why(GAPS.find((g) => g.es === '¡_ fin llega el verano!')!)).toBe(
      '«Por fin» betyr «endelig».',
    )
  })

  it('are each said aloud by the narrator', () => {
    const items = new Map(speechItems().map((i) => [i.text, i.voice]))
    for (const g of GAPS) expect(items.get(whole(g)), whole(g)).toBe(LINE_VOICE)
  })
})

describe('a round of Por o para', () => {
  it('is ten sentences, four to six of them para, no rule more than twice', () => {
    for (let seed = 1; seed < 40; seed++) {
      const r = round(emptyBank(), seeded(seed))
      expect(r).toHaveLength(ROUND)
      expect(new Set(r).size).toBe(ROUND)
      const paras = r.filter((g) => g.a === 'para').length
      expect(paras).toBeGreaterThanOrEqual(4)
      expect(paras).toBeLessThanOrEqual(6)
      const rules = new Map<string, number>()
      for (const g of r) rules.set(g.rule, (rules.get(g.rule) ?? 0) + 1)
      for (const n of rules.values()) expect(n).toBeLessThanOrEqual(2)
    }
  })

  it('takes sentences whose words are met first', () => {
    const b = emptyBank()
    const easy = GAPS.filter((g) => g.words.length <= 2)
    for (const g of easy) for (const id of g.words) b.cards[id] = newCard(now)
    const allMet = (g: (typeof GAPS)[number]) =>
      g.words.every((id) => b.cards[id])
    let met = 0
    for (let seed = 1; seed < 21; seed++)
      met += round(b, seeded(seed)).filter(allMet).length
    expect(met / 20).toBeGreaterThan(8)
  })

  it('leaves the sentences of the last rounds to last', () => {
    const first = round(emptyBank(), seeded(3))
    const recent = remember([], first)
    expect(recent).toHaveLength(ROUND)
    const next = round(emptyBank(), seeded(4), recent)
    expect(next.filter((g) => recent.includes(g.es))).toEqual([])
    const many = remember(
      remember(remember(recent, next), round(emptyBank(), seeded(5))),
      round(emptyBank(), seeded(6)),
    )
    expect(many.length).toBeLessThanOrEqual(30)
  })
})
