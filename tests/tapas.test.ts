import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import { VOICES } from '../src/app/data/voices'
import {
  BASIC,
  CARTA,
  DECK,
  FEWEST,
  GUESTS,
  GUESTS_A_DAY,
  ITEMS,
  THANKS,
  check,
  deck,
  makeDay,
  spoken,
  tapasLines,
  tipOf,
} from '../src/app/lib/tapas'
import { emptyBank, newCard, withStart } from '../src/app/lib/bank'
import { TAPAS_PICTURES } from '../src/app/data/tapas-prompts'
import {
  BAR,
  COUNTER_AT,
  FACES,
  guestSheet,
  itemPicture,
} from '../src/app/data/tapasLayout'
import { speechItems } from '../src/app/lib/spoken'
import { plain, tokens, wordIds } from '../src/app/lib/text'

const now = Date.UTC(2026, 9, 22, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('the bar in Tapas', () => {
  it('serves drinks and dishes of the bank, each ordered in words of it', () => {
    for (const item of ITEMS) {
      expect(WORD[item.id], item.id).toBeTruthy()
      expect(wordIds(item.one), item.id).toContain(item.id)
      if (item.many) expect(wordIds(item.many), item.id).toContain(item.id)
      for (const c of item.clash ?? []) expect(WORD[c], c).toBeTruthy()
    }
    // What every bank starts with makes a bar of its own
    expect(BASIC.length).toBeGreaterThanOrEqual(8)
  })

  it('has a fixed deck of orders, the same on every build, each said once', () => {
    expect(deck()).toEqual(DECK)
    expect(DECK.length).toBe(120)
    expect(new Set(DECK.map(spoken)).size).toBe(DECK.length)
    for (const o of DECK) {
      const ids = Object.keys(o.want)
      expect(ids.length).toBeGreaterThanOrEqual(1)
      expect(ids.length).toBeLessThanOrEqual(3)
      for (const id of ids) {
        expect(wordIds(o.line), o.line).toContain(id)
        expect(o.want[id]).toBeGreaterThanOrEqual(1)
        expect(o.want[id]).toBeLessThanOrEqual(3)
      }
      expect(GUESTS).toContain(o.voice)
      expect(spoken(o)).toMatch(/^[¿¡A-ZÁÉÍÓÚ].*[.?!]$/)
    }
    // Every guest orders about as often
    for (const g of GUESTS)
      expect(DECK.filter((o) => o.voice === g).length).toBe(30)
  })

  it('says each order as written', () => {
    const say = (want: string) => expect(DECK.map(spoken)).toContain(want)
    say('¿Me pones tres vinos y unas aceitunas?')
    say('Un zumo de naranja, por favor.')
    say('Hola. Dos vinos blancos y una de croquetas, por favor.')
  })

  it('lists every line for recording, in its guest’s voice', () => {
    const items = new Map(speechItems().map((i) => [i.text, i]))
    for (const { voice, line } of tapasLines()) {
      expect(VOICES[voice], voice).toBeTruthy()
      expect(items.get(plain(line))?.voice, plain(line)).toBe(voice)
      for (const t of tokens(line))
        if (t.id) expect(items.has(t.es), t.es).toBe(true)
    }
    for (const g of GUESTS) expect(THANKS[g], g).toBeTruthy()
  })
})

describe('the paintings of the bar', () => {
  it('has a picture for the bar, every guest and every drink and dish', () => {
    const names = Object.keys(TAPAS_PICTURES)
    expect(names).toContain(BAR)
    for (const g of GUESTS)
      expect(TAPAS_PICTURES[guestSheet(g)].parts, g).toEqual(FACES)
    for (const item of ITEMS)
      expect(TAPAS_PICTURES[itemPicture(item.id)].cutout, item.id).toBe(true)
    // each its own name, and nothing else
    expect(names.length).toBe(1 + GUESTS.length + ITEMS.length)
  })

  it('tells where the counter lies', () => {
    expect(TAPAS_PICTURES[BAR].prompt).toMatch(/about 77 per cent/)
    expect(COUNTER_AT).toBeCloseTo(0.784)
  })
})

describe('a day at the bar', () => {
  it('opens with what every bank starts with', () => {
    const bank = withStart(emptyBank(), now)
    const day = makeDay(bank, now, seeded())!
    expect(day).toBeTruthy()
    expect(day.orders).toHaveLength(GUESTS_A_DAY)
    const carta = new Set(day.carta.map((item) => item.id))
    expect(carta.size).toBeLessThanOrEqual(CARTA)
    for (const o of day.orders)
      for (const id of Object.keys(o.want)) {
        expect(bank.cards[id], id).toBeTruthy()
        expect(carta.has(id), id).toBe(true)
      }
    for (const item of day.carta)
      expect(bank.cards[item.id], item.id).toBeTruthy()
    // Two that would be taken for each other never stand together
    expect(carta.has('el vino') && carta.has('el vino tinto')).toBe(false)
    // The smaller orders first
    const size = (o: (typeof day.orders)[number]) =>
      Object.values(o.want).reduce((a, b) => a + b, 0)
    expect(size(day.orders[0])).toBeLessThanOrEqual(size(day.orders.at(-1)!))
  })

  it('brings each guest about twice, never twice in a row', () => {
    const bank = withStart(emptyBank(), now)
    for (let seed = 1; seed < 30; seed++) {
      const day = makeDay(bank, now, seeded(seed))!
      const voices = day.orders.map((o) => o.voice)
      for (const g of GUESTS)
        expect(voices.filter((v) => v === g).length).toBeLessThanOrEqual(2)
      for (let i = 1; i < voices.length; i++)
        expect(voices[i], voices.join()).not.toBe(voices[i - 1])
    }
  })

  it('takes the lessons’ dishes once they are met', () => {
    const bank = withStart(emptyBank(), now)
    for (const item of ITEMS) bank.cards[item.id] ??= newCard(now)
    const seen = new Set<string>()
    for (let seed = 1; seed < 20; seed++)
      for (const o of makeDay(bank, now, seeded(seed))!.orders)
        for (const id of Object.keys(o.want)) seen.add(id)
    expect(seen.size).toBeGreaterThan(BASIC.length + 6)
  })

  it('is not opened with too few drinks and dishes met', () => {
    expect(makeDay(emptyBank(), now, seeded())).toBeNull()
    expect(FEWEST).toBeLessThan(GUESTS_A_DAY)
  })
})

describe('serving', () => {
  const order = DECK.find(
    (o) =>
      Object.keys(o.want).length === 2 && Object.values(o.want).includes(2),
  )!
  const [a, b] = Object.keys(order.want)

  it('is right with all that was asked for, as many of each, and nothing more', () => {
    expect(check(order, { ...order.want }).right).toBe(true)
    const short = check(order, { ...order.want, [a]: order.want[a] - 1 || 0 })
    expect(short.right).toBe(false)
    const more = check(order, { ...order.want, 'el pulpo': 1 })
    if (!order.want['el pulpo']) {
      expect(more.right).toBe(false)
      expect(more.extra).toEqual(['el pulpo'])
    }
    const lines = check(order, { [b]: order.want[b] }).lines
    expect(lines.find((l) => l.id === a)?.got).toBe(0)
  })

  it('tips more for being quick, twice as much by ear, and never nothing', () => {
    expect(tipOf(2, false)).toBe(3)
    expect(tipOf(2, true)).toBe(6)
    expect(tipOf(20, false)).toBe(2)
    expect(tipOf(600, false)).toBe(1)
    expect(tipOf(600, true)).toBe(2)
  })
})
