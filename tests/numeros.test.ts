import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import { LOTTERY_VOICE, NUMBER_VOICES, VOICES } from '../src/app/data/voices'
import {
  BONUS,
  COUNT,
  DECK,
  LOTTERY,
  PRIZES,
  ROUND,
  bankId,
  bankWords,
  deal,
  deck,
  heard,
  isRight,
  lotteryDeck,
  norwegianTime,
  ofKind,
  roundKinds,
  shown,
  slots,
  spoken,
  terms,
  type,
  worth,
} from '../src/app/lib/numeros'
import { speechItems } from '../src/app/lib/spoken'
import {
  NUMEROS_PICTURES,
  SPEAKER_LOOKS,
} from '../src/app/data/numeros-prompts'
import {
  FACES,
  MADRID,
  SORTEO,
  SPEAKERS,
  placeOf,
  speakerSheet,
} from '../src/app/data/numerosLayout'
import type { Item, Kind } from '../src/app/lib/numeros'

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// What a player types for an item's answer, keys one by one
const keys = (item: Item) => {
  let t = ''
  for (const k of item.answer.replace(/ /g, '')) t = type(t, k, item.kind)
  return t
}

// An item with only what judging needs
const fake = (kind: Item['kind'], over: Partial<Item>): Item => ({
  id: 'x',
  kind,
  voice: 'Lola',
  say: '',
  number: '',
  answer: '',
  values: [],
  no: '',
  parts: [],
  ...over,
})

const sorted = (xs: Array<{ id: string; right: boolean }>) =>
  [...xs].sort((a, b) => a.id.localeCompare(b.id))

describe('numbers in words', () => {
  it('says them as Spain does', () => {
    expect(spoken(0)).toBe('cero')
    expect(spoken(16)).toBe('dieciséis')
    expect(spoken(21)).toBe('veintiuno')
    expect(spoken(21, 'm')).toBe('veintiún')
    expect(spoken(21, 'f')).toBe('veintiuna')
    expect(spoken(22)).toBe('veintidós')
    expect(spoken(23)).toBe('veintitrés')
    expect(spoken(26)).toBe('veintiséis')
    expect(spoken(30)).toBe('treinta')
    expect(spoken(31, 'm')).toBe('treinta y un')
    expect(spoken(45)).toBe('cuarenta y cinco')
    expect(spoken(100)).toBe('cien')
    expect(spoken(101, 'm')).toBe('ciento un')
    expect(spoken(115)).toBe('ciento quince')
    expect(spoken(200, 'f')).toBe('doscientas')
    expect(spoken(500)).toBe('quinientos')
    expect(spoken(700)).toBe('setecientos')
    expect(spoken(900)).toBe('novecientos')
    expect(spoken(1100)).toBe('mil cien')
    expect(spoken(1975)).toBe('mil novecientos setenta y cinco')
    expect(spoken(2001)).toBe('dos mil uno')
    expect(spoken(2026)).toBe('dos mil veintiséis')
    expect(spoken(21_000)).toBe('veintiún mil')
    expect(spoken(45_607)).toBe('cuarenta y cinco mil seiscientos siete')
    expect(spoken(101_000)).toBe('ciento un mil')
    expect(spoken(1_000_000)).toBe('un millón')
    expect(spoken(1_250_000)).toBe('un millón doscientos cincuenta mil')
    expect(spoken(2_000_000)).toBe('dos millones')
    expect(spoken(21_000_000)).toBe('veintiún millones')
  })

  it('knows the digits each word stands for', () => {
    const at = (n: number) =>
      Object.fromEntries(slots(n).map((s) => [s.es, s.at]))
    expect(at(1975)).toEqual({
      mil: [3],
      novecientos: [2],
      setenta: [1],
      y: [],
      cinco: [0],
    })
    expect(at(50)).toEqual({ cincuenta: [0, 1] })
    expect(at(12)).toEqual({ doce: [0, 1] })
    expect(at(45_000)).toEqual({ cuarenta: [4], y: [], cinco: [3], mil: [] })
    // Every number up to a few thousand, and some far bigger: the words
    // are the number said, and stand for digits it has
    const r = seeded(3)
    const ns = [
      ...Array.from({ length: 3000 }, (_, i) => i),
      ...Array.from({ length: 300 }, () => Math.floor(r() * 99_999_999)),
    ]
    for (const n of ns) {
      const s = slots(n)
      expect(s.map((x) => x.es).join(' ')).toBe(spoken(n))
      for (const x of s)
        for (const a of x.at) expect(a).toBeLessThan(String(n).length)
    }
  })

  it('takes a number apart as it is said', () => {
    const t = (n: number) => terms(n).map((p) => [p.es, p.value])
    expect(t(1975)).toEqual([
      ['mil', '1 000'],
      ['novecientos', '900'],
      ['setenta y cinco', '75'],
    ])
    expect(t(175)).toEqual([
      ['ciento', '100'],
      ['setenta y cinco', '75'],
    ])
    expect(t(100)).toEqual([['cien', '100']])
    expect(t(45_607)).toEqual([
      ['cuarenta y cinco mil', '45 000'],
      ['seiscientos', '600'],
      ['siete', '7'],
    ])
    expect(t(1_250_000)).toEqual([
      ['un millón', '1 000 000'],
      ['doscientos cincuenta mil', '250 000'],
    ])
  })

  it('tells the time in Norwegian', () => {
    expect(norwegianTime(8, 0)).toBe('åtte')
    expect(norwegianTime(3, 15)).toBe('kvart over tre')
    expect(norwegianTime(8, 20)).toBe('ti på halv ni')
    expect(norwegianTime(12, 30)).toBe('halv ett')
    expect(norwegianTime(8, 50)).toBe('ti på ni')
    expect(norwegianTime(11, 45)).toBe('kvart på tolv')
  })
})

describe('the deck of Números', () => {
  it('is the same every time, each sentence once', () => {
    const all = Object.values(COUNT).reduce((a, b) => a + b, 0)
    expect(all).toBeGreaterThanOrEqual(240)
    expect(DECK).toHaveLength(all)
    expect(new Set(DECK.map((x) => x.say)).size).toBe(all)
    expect(new Set(DECK.map((x) => x.id)).size).toBe(all)
    for (const k of Object.keys(COUNT) as Array<Kind>)
      expect(ofKind(k)).toHaveLength(COUNT[k])
    // (made without Math.random, so a build cannot change it)
    const random = Math.random
    Math.random = () => 0.5
    try {
      expect(deck().map((x) => x.say)).toEqual(DECK.map((x) => x.say))
      expect(lotteryDeck().map((x) => x.say)).toEqual(LOTTERY.map((x) => x.say))
    } finally {
      Math.random = random
    }
  })

  it('has sentences that say their number, in two voices', () => {
    for (const x of DECK) {
      expect(x.say.toLowerCase(), x.id).toContain(x.number)
      expect(x.say, x.id).toMatch(/^[A-ZÁÉÍÓÚ¿¡].*[.!?]$/)
      expect(x.no, x.id).toMatch(/[.!?]$/)
      expect(NUMBER_VOICES).toContain(x.voice)
      expect(x.parts.length, x.id).toBeGreaterThan(0)
    }
    for (const v of NUMBER_VOICES)
      expect(DECK.filter((x) => x.voice === v).length).toBeGreaterThan(100)
  })

  it('has every kind of price, time and phone number', () => {
    const said = DECK.map((x) => x.number)
    // Prices in full and as at the till
    expect(said.some((s) => /euros con \w+$/.test(s))).toBe(true)
    expect(
      said.some((s) => /^\w+ con \w+/.test(s) && !s.includes('euro')),
    ).toBe(true)
    expect(said.some((s) => s.endsWith('céntimos'))).toBe(true)
    // Times past, to, the half and quarter hours, and a station's clock
    for (const t of [
      'y cuarto',
      'y media',
      'menos cuarto',
      'menos',
      'en punto',
    ])
      expect(
        said.some((s) => s.includes(t)),
        t,
      ).toBe(true)
    expect(ofKind('time').some((x) => x.clock?.h24)).toBe(true)
    expect(said.some((s) => s.startsWith('la una'))).toBe(true)
    // Phone numbers in all three readings
    const phones = ofKind('phone')
    for (const shape of ['3,2,2,2', '3,3,3', '2,3,2,2'])
      expect(
        phones.some((x) => x.groups?.map((g) => g.n).join(',') === shape),
        shape,
      ).toBe(true)
  })

  it('takes its own answer as right', () => {
    for (const x of [...DECK, ...LOTTERY]) {
      expect(isRight(keys(x), x), `${x.id}: ${x.answer}`).toBe(true)
      expect(isRight('', x), x.id).toBe(false)
    }
  })

  it('takes a time without its part of the day morning or evening', () => {
    for (const x of ofKind('time')) {
      const c = x.clock!
      expect(x.values, x.id).toContain(c.h * 60 + c.m)
      const part = /de la|del mediodía/.test(x.number)
      if (!c.h24 && !part)
        expect(x.values, x.id).toContain((c.h * 60 + c.m + 720) % 1440)
      if (c.h24 || x.number.includes('de la mañana'))
        expect(x.values, x.id).toHaveLength(1)
    }
    const at = (values: Array<number>, typed: string) =>
      isRight(typed, fake('time', { values }))
    // «las nueve menos diez»: 8:50 or 20:50
    expect(at([530, 1250], '8:50')).toBe(true)
    expect(at([530, 1250], '2050')).toBe(true)
    expect(at([530, 1250], '9:50')).toBe(false)
  })

  it('reads phone numbers in groups of nine digits', () => {
    for (const x of ofKind('phone')) {
      const d = String(x.values[0])
      expect(d, x.id).toMatch(/^[679]\d{8}$/)
      expect(x.groups!.reduce((n, g) => n + g.n, 0)).toBe(9)
      expect(x.number.split(', ')).toHaveLength(x.groups!.length)
      expect(x.answer.replace(/ /g, '')).toBe(d)
    }
    const lead = ofKind('phone').find((x) => x.groups![0].read === 'lead')!
    const [first] = lead.number.split(', ')
    expect(first.split(' ')[0]).toMatch(/^(seis|siete)$/)
  })

  it('sings the lottery with its prizes', () => {
    expect(LOTTERY).toHaveLength(PRIZES.reduce((n, p) => n + p.n, 0))
    expect(new Set(LOTTERY.map((x) => x.values[0])).size).toBe(LOTTERY.length)
    for (const x of LOTTERY) {
      expect(x.voice).toBe(LOTTERY_VOICE)
      expect(x.values[0]).toBeGreaterThanOrEqual(10_000)
      expect(x.values[0]).toBeLessThan(100_000)
      expect(x.say.toLowerCase()).toBe(`${x.number}. ${x.prize!.es}.`)
    }
    expect(BONUS).toBeLessThanOrEqual(LOTTERY.length)
  })

  it('is listed to be said aloud, each in its voice', () => {
    const items = new Map(speechItems().map((s) => [s.text, s.voice]))
    for (const x of [...DECK, ...LOTTERY])
      expect(items.get(x.say), x.say).toBe(x.voice)
    for (const v of [...NUMBER_VOICES, LOTTERY_VOICE])
      expect(VOICES[v]).toBeTruthy()
  })
})

describe('typing a number', () => {
  const typing = (kind: Item['kind'], ks: string) => {
    let t = ''
    for (const k of ks) t = type(t, k, kind)
    return t
  }

  it('takes digits and the one separator the kind has', () => {
    expect(typing('price', '2,500')).toBe('2,50')
    expect(typing('price', ',5')).toBe('0,5')
    expect(typing('price', '2.5')).toBe('2,5')
    expect(typing('price', '05')).toBe('5')
    expect(typing('time', '8:50')).toBe('8:50')
    expect(typing('time', '8,50')).toBe('8:50')
    expect(typing('time', ':')).toBe('')
    expect(typing('time', '18405')).toBe('1840')
    expect(typing('time', '184:')).toBe('184')
    expect(typing('phone', '6453217889')).toBe('645321788')
    expect(typing('year', '1,975')).toBe('1975')
    expect(typing('lottery', '456071')).toBe('45607')
  })

  it('shows what is typed as the number is written', () => {
    const phone = ofKind('phone').find(
      (x) => x.groups![0].n === 3 && x.groups!.length === 4,
    )!
    expect(shown('64532', phone)).toBe('645 32')
    expect(shown('245000', fake('big', {}))).toBe('245 000')
    expect(shown('1840', fake('time', {}))).toBe('18:40')
    expect(shown('8:5', fake('time', {}))).toBe('8:5')
  })

  it('reads what is typed', () => {
    expect(worth('2,5', 'price')).toBe(250)
    expect(worth('2,', 'price')).toBe(200)
    expect(worth('0,05', 'price')).toBe(5)
    expect(worth('8:50', 'time')).toBe(530)
    expect(worth('850', 'time')).toBe(530)
    expect(worth('20', 'time')).toBe(1200)
    expect(worth('9:', 'time')).toBe(540)
    expect(worth('25:00', 'time')).toBe(null)
    expect(worth('8:5', 'time')).toBe(null)
    expect(worth('', 'year')).toBe(null)
    expect(worth('1975', 'year')).toBe(1975)
  })
})

describe('what an answer says about the words in the bank', () => {
  it('counts only number words in the bank', () => {
    expect(bankId('una')).toBe('uno')
    expect(bankId('un')).toBe('uno')
    expect(bankId('ciento')).toBe('cien')
    expect(bankId('media')).toBe('medio')
    expect(bankId('cero')).toBe(null)
    expect(bankId('euros')).toBe(null)
    expect(bankId('y')).toBe(null)
    for (const x of [...DECK, ...LOTTERY])
      for (const id of bankWords(x)) expect(WORD[id], id).toBeTruthy()
    // Most numbers have a word from the bank in them
    const some = DECK.filter((x) => bankWords(x).length).length
    expect(some / DECK.length).toBeGreaterThan(0.8)
  })

  it('weighs each word by the digits typed for it', () => {
    const year = (n: number, typed: string) =>
      sorted(heard(fake('year', { values: [n] }), typed))
    expect(year(1975, '1975')).toEqual([
      { id: 'cinco', right: true },
      { id: 'mil', right: true },
    ])
    // The seventy missed, the five heard
    expect(year(1975, '1965')).toEqual([
      { id: 'cinco', right: true },
      { id: 'mil', right: true },
    ])
    expect(year(1950, '1960')).toEqual([
      { id: 'cincuenta', right: false },
      { id: 'mil', right: true },
    ])
    // Digits that cannot be lined up say nothing
    expect(year(1950, '950')).toEqual([])
  })

  it('weighs a price by its euros and its cents', () => {
    const price = (cents: number, typed: string) =>
      sorted(heard(fake('price', { values: [cents] }), typed))
    expect(price(250, '2,50')).toEqual([
      { id: 'cincuenta', right: true },
      { id: 'dos', right: true },
    ])
    expect(price(250, '2,15')).toEqual([
      { id: 'cincuenta', right: false },
      { id: 'dos', right: true },
    ])
    expect(price(250, '12,50')).toEqual([{ id: 'cincuenta', right: true }])
    expect(price(105, '1,05')).toEqual([
      { id: 'cinco', right: true },
      { id: 'uno', right: true },
    ])
  })

  it('weighs a time by its hour and its minutes', () => {
    const time = (h: number, m: number, typed: string, h24 = false) =>
      sorted(heard(fake('time', { clock: { h, m, h24 } }), typed))
    // «las nueve menos diez»
    expect(time(20, 50, '8:50')).toEqual([
      { id: 'diez', right: true },
      { id: 'nueve', right: true },
    ])
    // the nine and the ten heard, «menos» missed
    expect(time(20, 50, '9:10')).toEqual([
      { id: 'diez', right: true },
      { id: 'nueve', right: true },
    ])
    expect(time(20, 50, '7:50')).toEqual([
      { id: 'diez', right: true },
      { id: 'nueve', right: false },
    ])
    expect(time(20, 50, '8:40')).toEqual([
      { id: 'diez', right: false },
      { id: 'nueve', right: true },
    ])
    // «las doce y media», «la una y cinco»
    expect(time(12, 30, '12:15')).toEqual([
      { id: 'doce', right: true },
      { id: 'medio', right: false },
    ])
    expect(time(13, 5, '1:05')).toEqual([
      { id: 'cinco', right: true },
      { id: 'uno', right: true },
    ])
    // «las veinte cero cinco», on a station's clock
    expect(time(20, 5, '20:05', true)).toEqual([
      { id: 'cinco', right: true },
      { id: 'veinte', right: true },
    ])
    expect(time(20, 5, '8:05', true)).toEqual([{ id: 'cinco', right: true }])
  })

  it('weighs a phone number group by group', () => {
    const groups = [
      { n: 3, read: 'lead' as const },
      { n: 2, read: 'pair' as const },
      { n: 2, read: 'pair' as const },
      { n: 2, read: 'pair' as const },
    ]
    const item = fake('phone', { values: [645_321_708], groups })
    // seis cuarenta y cinco, treinta y dos, diecisiete, cero ocho
    expect(sorted(heard(item, '645321708'))).toEqual([
      { id: 'cinco', right: true },
      { id: 'cuarenta', right: true },
      { id: 'dos', right: true },
      { id: 'ocho', right: true },
      { id: 'seis', right: true },
      { id: 'treinta', right: true },
    ])
    expect(sorted(heard(item, '645321709'))).toEqual([
      { id: 'cinco', right: true },
      { id: 'cuarenta', right: true },
      { id: 'dos', right: true },
      { id: 'ocho', right: false },
      { id: 'seis', right: true },
      { id: 'treinta', right: true },
    ])
    expect(heard(item, '64532170')).toEqual([])
  })
})

describe('dealing', () => {
  it('deals a kind like a shuffled deck, none twice before all are heard', () => {
    const r = seeded(11)
    let had: Array<string> = []
    const seen = new Set<string>()
    for (let i = 0; i < COUNT.year; i++) {
      const d = deal('year', had, r)
      expect(seen.has(d.item.id)).toBe(false)
      seen.add(d.item.id)
      had = d.heard
    }
    expect(seen.size).toBe(COUNT.year)
    // A new pass, without the one just played
    const last = had[had.length - 1]
    const next = deal('year', had, r, [last])
    expect(next.item.id).not.toBe(last)
    expect(next.heard.filter((id) => id.startsWith('a'))).toEqual([
      next.item.id,
    ])
  })

  it('keeps what was heard of other kinds', () => {
    const d = deal('price', ['a1', 'l2'], seeded(2))
    expect(d.heard).toContain('a1')
    expect(d.heard).toContain('l2')
    expect(deal('lottery', [], seeded(2)).item.kind).toBe('lottery')
  })

  it('makes a round of six, mixed or of one kind', () => {
    expect(roundKinds('time')).toEqual(Array(ROUND).fill('time'))
    const mixed = roundKinds('all', seeded(4))
    expect(mixed).toHaveLength(ROUND)
    expect(new Set(mixed).size).toBeGreaterThanOrEqual(4)
  })
})

describe('the paintings of Números', () => {
  it('has a place and a sheet of faces for everyone who speaks', () => {
    const names = Object.keys(NUMEROS_PICTURES)
    expect(names).toContain(MADRID)
    expect(names).toContain(SORTEO)
    const voices = new Set([...DECK, ...LOTTERY].map((x) => x.voice))
    expect([...voices].sort()).toEqual([...SPEAKERS].sort())
    for (const who of SPEAKERS) {
      const p = NUMEROS_PICTURES[speakerSheet(who)]
      expect(p.parts, who).toEqual(FACES)
      expect(p.cutout, who).toBe(true)
      expect(SPEAKER_LOOKS[who].faces, who).toHaveLength(FACES.length)
      expect(names, who).toContain(placeOf(who))
    }
    expect(placeOf(LOTTERY_VOICE)).toBe(SORTEO)
    for (const who of NUMBER_VOICES) expect(placeOf(who)).toBe(MADRID)
    // each its own name, and nothing else
    expect(names.length).toBe(2 + SPEAKERS.length)
    expect(new Set(names.map((n) => n.split('-')[0])).size).toBe(names.length)
  })

  it('keeps the prompts out of the page', () => {
    for (const file of [
      'src/app/games/numeros.tsx',
      'src/app/data/numerosLayout.ts',
    ])
      expect(readFileSync(file, 'utf8'), file).not.toMatch(
        /from '[^']*-prompts/,
      )
  })
})
