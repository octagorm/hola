import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import { VOICES } from '../src/app/data/voices'
import {
  ASK,
  MOVE,
  OFFER,
  PRICES,
  SELLER,
  SELLERS,
  STALLS_A_DAY,
  WARES,
  makeDay,
  num,
  numberWords,
  purseFor,
  rastroLines,
  respond,
  stars,
  startState,
  understood,
  visitWords,
} from '../src/app/lib/rastro'
import { emptyBank, newCard, withStart } from '../src/app/lib/bank'
import { speechItems } from '../src/app/lib/spoken'
import { plain, tokens, wordIds } from '../src/app/lib/text'
import type { HaggleState, Move, Ware } from '../src/app/lib/rastro'

const now = Date.UTC(2026, 9, 22, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const ware = (id: string) => WARES.find((w) => w.id === id)!

describe('the stalls of El Rastro', () => {
  it('sell things of the bank, from sellers with voices of their own', () => {
    expect(SELLERS).toHaveLength(STALLS_A_DAY)
    expect(new Set(SELLERS.map((s) => s.voice)).size).toBe(SELLERS.length)
    for (const s of SELLERS) expect(VOICES[s.voice], s.voice).toBeTruthy()
    for (const w of WARES) {
      expect(SELLER[w.seller], w.id).toBeTruthy()
      for (const id of w.words) expect(WORD[id], id).toBeTruthy()
      expect(wordIds(w.name), w.id).toEqual(expect.arrayContaining(w.words))
      expect(WORD[w.words[0]]?.g, w.id).toBe(w.g)
    }
    // Every seller has more than one thing, so the days differ
    for (const s of SELLERS)
      expect(WARES.filter((w) => w.seller === s.id).length).toBeGreaterThan(1)
  })

  it('come down ladders of prices said as Spaniards say them', () => {
    for (const w of WARES) {
      const [honest, ...rest] = w.ladders
      expect(honest[0], w.id).toBe(w.fair)
      for (const L of w.ladders) {
        for (let i = 1; i < L.length; i++) expect(L[i]).toBeLessThan(L[i - 1])
        expect(L.at(-1)!, w.id).toBeLessThan(w.fair)
        for (const n of L) expect(PRICES, `${w.id} ${n}`).toContain(n)
      }
      for (const L of rest) expect(L[0], w.id).toBeGreaterThan(w.fair)
      for (const n of w.offers) expect(PRICES, `${w.id} ${n}`).toContain(n)
    }
    expect(num(35)).toBe('treinta y cinco')
    expect(num(25, true)).toBe('Veinticinco')
    expect(numberWords(45)).toEqual(['cuarenta', 'cinco'])
    for (const n of PRICES)
      for (const id of numberWords(n)) expect(WORD[id], id).toBeTruthy()
  })

  it('agree with the thing: lo or la, caro or cara', () => {
    expect(plain(MOVE.dear('f'))).toBe('Es muy cara.')
    expect(plain(MOVE.cheaper('m'))).toBe('¿Me lo deja un poco más barato?')
    expect(plain(MOVE.buy('f'))).toBe('Me la llevo.')
    expect(plain(OFFER(15, 'f'))).toBe('¿Me la deja en quince euros?')
    expect(plain(ASK)).toBe('¿Cuánto cuesta?')
    expect(plain(SELLER.julian.lines.notDear('f'))).toBe(
      '¿Cara? No, señora. Es muy antigua.',
    )
  })

  it('lists every line for recording, each in its speaker’s voice', () => {
    const items = new Map(speechItems().map((i) => [i.text, i]))
    const lines = rastroLines()
    expect(new Set(lines.map((l) => plain(l.line))).size).toBe(lines.length)
    for (const { voice, line } of lines) {
      expect(VOICES[voice], voice).toBeTruthy()
      expect(items.get(plain(line))?.voice, plain(line)).toBe(voice)
      for (const t of tokens(line))
        if (t.id) expect(items.has(t.es), t.es).toBe(true)
    }
  })

  it('has a line for whatever is said in haggling', () => {
    const said = new Set(rastroLines().map((l) => l.line))
    const moves: Array<Move> = [
      { k: 'dear' },
      { k: 'cheaper' },
      { k: 'buy' },
      { k: 'leave' },
    ]
    const random = seeded(3)
    for (const w of WARES)
      for (const L of w.ladders) {
        // Every way through, a few moves deep
        const walk = (st: HaggleState, depth: number) => {
          if (depth > 6) return
          for (const m of [
            ...moves,
            ...w.offers.map((n): Move => ({ k: 'offer', n })),
          ]) {
            const r = respond(w, L, st, m, random)
            expect(said.has(r.line), `${w.id}: ${plain(r.line)}`).toBe(true)
            if (r.price !== undefined)
              expect(plain(r.line).toLowerCase(), w.id).toContain(num(r.price))
            if (r.paid === undefined && !r.gone) walk(r.state, depth + 1)
          }
        }
        walk(startState(w), 0)
        expect(said.has(SELLER[w.seller].lines.open(L[0])), w.id).toBe(true)
      }
  })
})

describe('haggling', () => {
  const abanico = ware('abanico')
  const greedy = abanico.ladders[2]
  const st = startState(abanico)

  it('comes down a step when asked, two when far over a fair price', () => {
    expect(respond(abanico, greedy, st, { k: 'cheaper' }).state.i).toBe(1)
    // 15 is more than half again over a fair 6
    expect(respond(abanico, greedy, st, { k: 'dear' }).state.i).toBe(2)
  })

  it('takes offer at its next step down, and is cross at a silly one', () => {
    const deal = respond(abanico, greedy, st, { k: 'offer', n: 12 })
    expect(deal.paid).toBe(12)
    const silly = respond(abanico, greedy, st, { k: 'offer', n: 3 })
    expect(silly.mood).toBe('cross')
    expect(silly.state.left).toBe(st.left - 2)
  })

  it('is not told a fair price is too dear', () => {
    const honest = abanico.ladders[0]
    const r = respond(abanico, honest, st, { k: 'dear' })
    expect(r.mood).toBe('cross')
    expect(r.state.i).toBe(0)
  })

  it('waves the player off pushed with no patience left', () => {
    const r = respond(abanico, greedy, { ...st, left: 0 }, { k: 'cheaper' })
    expect(r.gone).toBe('enough')
  })

  it('may call the player back at the lowest price', () => {
    const r = respond(abanico, greedy, { ...st, i: 1 }, { k: 'leave' }, () => 0)
    expect(r.state.i).toBe(greedy.length - 1)
    expect(r.price).toBe(5)
    const bye = respond(abanico, greedy, st, { k: 'leave' }, () => 0.99)
    expect(bye.gone).toBe('bye')
  })

  it('gives three stars at the lowest price, two at a fair one', () => {
    expect(stars(abanico, greedy, 5)).toBe(3)
    expect(stars(abanico, greedy, 6)).toBe(2)
    expect(stars(abanico, greedy, 8)).toBe(1)
  })

  it('tells by a move whether a price was understood', () => {
    expect(understood(abanico, 15, { k: 'dear' })).toBe(true)
    expect(understood(abanico, 5, { k: 'dear' })).toBe(false)
    expect(understood(abanico, 5, { k: 'buy' })).toBe(true)
    expect(understood(abanico, 15, { k: 'buy' })).toBe(false)
    expect(understood(abanico, 15, { k: 'offer', n: 8 })).toBe(true)
    expect(understood(abanico, 15, { k: 'cheaper' })).toBeNull()
  })
})

describe('a Sunday', () => {
  it('visits each seller once, at a thing of theirs', () => {
    const bank = withStart(emptyBank(), now)
    for (let seed = 1; seed < 20; seed++) {
      const day = makeDay(bank, seeded(seed))
      expect(day).toHaveLength(STALLS_A_DAY)
      expect(new Set(day.map((v) => v.seller.id)).size).toBe(STALLS_A_DAY)
      for (const v of day) {
        expect(v.ware.seller).toBe(v.seller.id)
        expect(v.ware.ladders).toContain(v.ladder)
      }
      expect(purseFor(day)).toBeGreaterThan(
        day.reduce((s, v) => s + v.ware.fair, 0),
      )
    }
  })

  it('brings few words not met, and none once all are', () => {
    const bank = withStart(emptyBank(), now)
    const fresh = (day: ReturnType<typeof makeDay>) =>
      new Set(day.flatMap(visitWords).filter((id) => !bank.cards[id])).size
    // (five at most, and the euro every price is said in)
    for (let seed = 1; seed < 20; seed++)
      expect(fresh(makeDay(bank, seeded(seed)))).toBeLessThanOrEqual(6)
    for (const w of WARES.flatMap((x: Ware) => x.words))
      bank.cards[w] ??= newCard(now)
    for (const n of PRICES)
      for (const id of numberWords(n)) bank.cards[id] ??= newCard(now)
    bank.cards['el euro'] ??= newCard(now)
    expect(fresh(makeDay(bank, seeded()))).toBe(0)
  })
})
