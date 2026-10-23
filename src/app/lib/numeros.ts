import { WORD, WORDS } from '../data/words.ts'
import { LOTTERY_VOICE, NUMBER_VOICES } from '../data/voices.ts'

// Números: numbers by ear, as they are said in Spain, each in an everyday
// sentence: a price at the till («Son dos euros con cincuenta», «Dos
// cincuenta, por favor»), a time («Quedamos a las nueve menos diez»), a
// phone number read out in pairs or threes, a year and a big number. The
// player types the number in digits, with a decimal comma as in Norway,
// and the answer is taken apart, each number with its Spanish words.
//
// Everything said is recorded ahead (lib/spoken.ts), so the sentences are
// a fixed deck, made with a seeded generator and the same on every build;
// a game deals from it like a shuffled deck, so none comes again before
// all of its kind have been heard. The bonus is Spain's Christmas lottery,
// whose winning numbers and prizes the children of the San Ildefonso
// school in Madrid sing out: a deck of its own, sung in its chant.

export type Kind = 'price' | 'time' | 'phone' | 'year' | 'big'

// One piece of the number, as the answer is taken apart: its Spanish words
// and what they stand for
export interface Part {
  es: string
  // In digits: '2 €', '0,50 €', '−10 min', '1 000'
  value: string
  // What it is, in Norwegian, where the digits do not say: 'om kvelden'
  no?: string
}

// How a phone number's group of digits is read: 645 as «seiscientos
// cuarenta y cinco» (whole), or as «seis cuarenta y cinco» (lead); 07 as
// «cero siete» (pair)
export type Reading = 'whole' | 'lead' | 'pair' | 'triple'

export interface Item {
  // Unique in its deck, and the same on every build: 'p0', 't12', 'l3'
  id: string
  kind: Kind | 'lottery'
  // Who says it (data/voices.ts)
  voice: string
  // The sentence said, and shown after
  say: string
  // The number in it, as said: 'dos euros con cincuenta'
  number: string
  // The answer as shown: '2,50', '8:50', '645 32 17 88', '1975', '245 000'
  answer: string
  // What the answer is worth, and any other worth that counts as right:
  // cents for a price, minutes from midnight for a time (las nueve menos
  // diez is 8:50 or 20:50), the number itself for the rest
  values: Array<number>
  // The sentence in Norwegian
  no: string
  parts: Array<Part>
  // A time: the hour on the twenty-four-hour clock and the minutes, and
  // whether it was said so («las dieciocho cuarenta»)
  clock?: { h: number; m: number; h24?: boolean }
  // A phone number's groups of digits, as they are said
  groups?: Array<{ n: number; read: Reading }>
  // The lottery's prize, sung after the number
  prize?: Prize
}

export interface Prize {
  es: string
  euros: number
  // Its name in Norwegian
  no: string
}

// --- Numbers in words ---

const SMALL = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
]
const TENS = [
  '',
  '',
  '',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
]
const HUNDREDS = [
  '',
  'ciento',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos',
]

// How a number ending in one is said: on its own (veintiuno), before a
// masculine noun and before mil and millón (veintiún euros, veintiún mil),
// or before a feminine noun (la una, las veintiuna horas, doscientas)
export type Ending = 'alone' | 'm' | 'f'

// A word of a number as it is said, and the digits it stands for, counted
// from the right: in 1975, «mil» stands for the 1, «novecientos» for the
// 9, «setenta» for the 7, «y» for none and «cinco» for the 5. A word for
// 10 to 29, or a ten on its own, stands for two digits.
export interface Slot {
  es: string
  at: Array<number>
}

const slot = (es: string, at: Array<number>, shift: number): Slot => ({
  es,
  at: at.map((a) => a + shift),
})

function under100(n: number, end: Ending, shift = 0): Array<Slot> {
  if (n < 30) {
    let es = SMALL[n]
    if (n === 1 || n === 21) {
      if (end === 'm') es = n === 1 ? 'un' : 'veintiún'
      if (end === 'f') es = n === 1 ? 'una' : 'veintiuna'
    }
    return [slot(es, n < 10 ? [0] : [0, 1], shift)]
  }
  const u = n % 10
  const t = TENS[Math.floor(n / 10)]
  if (!u) return [slot(t, [0, 1], shift)]
  return [slot(t, [1], shift), slot('y', [], shift), ...under100(u, end, shift)]
}

function under1000(n: number, end: Ending, shift = 0): Array<Slot> {
  if (n < 100) return under100(n, end, shift)
  if (n === 100) return [slot('cien', [2], shift)]
  const h = Math.floor(n / 100)
  const rest = n % 100
  const head =
    end === 'f' && h > 1 ? HUNDREDS[h].replace(/os$/, 'as') : HUNDREDS[h]
  return [slot(head, [2], shift), ...(rest ? under100(rest, end, shift) : [])]
}

// A whole number word by word, as Spain says it: 1975 is «mil novecientos
// setenta y cinco», 21 000 «veintiún mil», 1 250 000 «un millón
// doscientos cincuenta mil»
export function slots(n: number, end: Ending = 'alone'): Array<Slot> {
  if (n < 1000) return under1000(n, end)
  if (n < 1_000_000) {
    const th = Math.floor(n / 1000)
    const rest = n % 1000
    const head =
      th === 1
        ? [slot('mil', [3], 0)]
        : [...under1000(th, end === 'f' ? 'f' : 'm', 3), slot('mil', [], 0)]
    return [...head, ...(rest ? under1000(rest, end) : [])]
  }
  const m = Math.floor(n / 1_000_000)
  const rest = n % 1_000_000
  const head =
    m === 1
      ? [slot('un', [6], 0), slot('millón', [], 0)]
      : [...under1000(m, 'm', 6), slot('millones', [], 0)]
  return [...head, ...(rest ? slots(rest, end) : [])]
}

const words = (s: Array<Slot>) => s.map((x) => x.es).join(' ')

export const spoken = (n: number, end: Ending = 'alone') => words(slots(n, end))

// A number taken apart as it is said: millions, thousands, hundreds and
// the rest, each with its words
export function terms(n: number, end: Ending = 'alone'): Array<Part> {
  const out: Array<Part> = []
  const m = Math.floor(n / 1_000_000)
  const th = Math.floor(n / 1000) % 1000
  const h = Math.floor(n / 100) % 10
  const rest = n % 100
  if (m)
    out.push({
      es: m === 1 ? 'un millón' : `${spoken(m, 'm')} millones`,
      value: group(m * 1_000_000),
    })
  if (th)
    out.push({
      es: th === 1 ? 'mil' : `${spoken(th, end === 'f' ? 'f' : 'm')} mil`,
      value: group(th * 1000),
    })
  if (h)
    out.push({
      es: words(under1000(h * 100 + (rest ? 1 : 0), end).slice(0, 1)),
      value: String(h * 100),
    })
  if (rest || !out.length)
    out.push({ es: spoken(rest, end), value: String(rest) })
  return out
}

// Thousands apart with a space, as in Norway: 245 000
export const group = (n: number) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const two = (n: number) => String(n).padStart(2, '0')

// --- Prices ---

// Euros and cents as shown: 2,50 and 3
export const money = (cents: number) =>
  cents % 100
    ? `${group(Math.floor(cents / 100))},${two(cents % 100)}`
    : group(cents / 100)

// --- Times ---

const NO_HOUR = [
  'tolv',
  'ett',
  'to',
  'tre',
  'fire',
  'fem',
  'seks',
  'sju',
  'åtte',
  'ni',
  'ti',
  'elleve',
  'tolv',
]

const NO_MINUTES = [
  '',
  'ett',
  'to',
  'tre',
  'fire',
  'fem',
  'seks',
  'sju',
  'åtte',
  'ni',
  'ti',
]

// A time of the clock in Norwegian, as said: «kvart over tre», «ti på
// halv ni», «halv ett»
export function norwegianTime(h: number, m: number): string {
  const now = NO_HOUR[h % 12]
  const next = NO_HOUR[(h + 1) % 12]
  switch (m) {
    case 0:
      return now
    case 15:
      return `kvart over ${now}`
    case 20:
      return `ti på halv ${next}`
    case 25:
      return `fem på halv ${next}`
    case 30:
      return `halv ${next}`
    case 35:
      return `fem over halv ${next}`
    case 40:
      return `ti over halv ${next}`
    case 45:
      return `kvart på ${next}`
    default:
      return m < 30
        ? `${NO_MINUTES[m] ?? m} over ${now}`
        : `${NO_MINUTES[60 - m] ?? 60 - m} på ${next}`
  }
}

// A time as shown: 8:50, 20:05
export const clockText = (h: number, m: number) => `${h}:${two(m)}`

// The hour as Spain says it: la una, las tres
const hourWord = (h: number) => (h === 1 ? 'la una' : `las ${spoken(h, 'f')}`)

// The part of the day said after a time on the twelve-hour clock, by the
// hour on the twenty-four-hour one and the hour named
function dayPart(H: number, named: number): { es: string; no: string } {
  if (H < 12)
    return {
      es: 'de la mañana',
      no: H < 10 ? 'om morgenen' : 'om formiddagen',
    }
  if (H === 12 && named === 12)
    return { es: 'del mediodía', no: 'midt på dagen' }
  if (H < 21)
    return {
      es: 'de la tarde',
      no: H < 18 ? 'om ettermiddagen' : 'om kvelden',
    }
  return { es: 'de la noche', no: 'om kvelden' }
}

// --- The lottery ---

// Spain's Christmas lottery, «el sorteo de Navidad», as drawn since 2011:
// each prize in euros for a whole ticket of ten décimos, as the children
// sing it. The pedrea, a thousand euros, is the prize most often sung.
export const PRIZES: Array<Prize & { n: number }> = [
  { es: 'mil euros', euros: 1000, no: 'en småpremie', n: 20 },
  { es: 'sesenta mil euros', euros: 60_000, no: 'en femtepremie', n: 4 },
  { es: 'doscientos mil euros', euros: 200_000, no: 'en fjerdepremie', n: 2 },
  { es: 'quinientos mil euros', euros: 500_000, no: 'tredjepremien', n: 1 },
  {
    es: 'un millón doscientos cincuenta mil euros',
    euros: 1_250_000,
    no: 'andrepremien',
    n: 1,
  },
  {
    es: 'cuatro millones de euros',
    euros: 4_000_000,
    no: 'El Gordo, hovedpremien',
    n: 2,
  },
]

// --- The deck ---

// The same numbers every time (Park and Miller's generator, as in
// lib/cadaver.ts)
function seeded(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

type Random = () => number

const int = (a: number, b: number, r: Random) =>
  a + Math.floor(r() * (b - a + 1))

const one = <T>(xs: Array<T>, r: Random): T => xs[Math.floor(r() * xs.length)]

// An item before it has its id and voice
type Draft = Omit<Item, 'id' | 'voice' | 'kind'>

// Cents a price ends in: mostly round, now and then 99 or five
const CENTS = [
  10, 20, 25, 30, 40, 45, 50, 50, 60, 65, 70, 75, 80, 85, 90, 95, 99, 15, 35,
  55, 5,
]

function price(r: Random): Draft {
  const band = r()
  let euros = 0
  let cents = 0
  if (band < 0.06) cents = one([50, 60, 70, 75, 80, 85, 90, 95], r)
  else if (band < 0.46) {
    euros = int(1, 9, r)
    if (r() < 0.8) cents = one(CENTS, r)
  } else if (band < 0.8) {
    euros = int(10, 99, r)
    if (r() < 0.55) cents = one(CENTS, r)
  } else if (band < 0.95) {
    euros = int(20, 199, r) * 5
    if (r() < 0.25) cents = one([50, 99], r)
  } else euros = int(10, 25, r) * 100

  const euroPart = euros === 1 ? 'un euro' : `${spoken(euros, 'm')} euros`
  let number: string
  const parts: Array<Part> = []
  const centValue = `0,${two(cents)} €`
  if (!cents) {
    number = euroPart
    parts.push({ es: euroPart, value: `${group(euros)} €` })
  } else if (!euros) {
    number = `${spoken(cents, 'm')} céntimos`
    parts.push({ es: number, value: centValue })
  } else {
    // Said in full, «dos euros con cincuenta», or as at the till, «dos
    // con cincuenta», «dos cincuenta»; cents under ten always with their
    // name, «dos euros con cinco céntimos»
    const style =
      cents < 10
        ? 'full'
        : euros >= 100
          ? one(['euros', 'full'] as const, r)
          : one(['euros', 'euros', 'con', 'bare', 'full'] as const, r)
    const alone = spoken(euros)
    const [es1, es2] =
      style === 'euros'
        ? [euroPart, `con ${spoken(cents)}`]
        : style === 'con'
          ? [alone, `con ${spoken(cents)}`]
          : style === 'bare'
            ? [alone, spoken(cents)]
            : [euroPart, `con ${spoken(cents, 'm')} céntimos`]
    number = `${es1} ${es2}`
    parts.push({ es: es1, value: `${group(euros)} €` })
    parts.push({ es: es2, value: centValue })
  }

  const total = euros * 100 + cents
  const x = `${money(total)} euro`
  const frames: Array<{ es: string; no: string }> = [
    {
      // «Es un euro», «Son dos euros»
      es: `${euros === 1 ? 'Es' : 'Son'} ${number}.`,
      no: `Det blir ${x}.`,
    },
    { es: `Cuesta ${number}.`, no: `Det koster ${x}.` },
    { es: `${capital(number)}, por favor.`, no: `${x}, takk.` },
  ]
  // At the market, by the kilo
  if (euros < 20)
    frames.push({ es: `A ${number} el kilo.`, no: `${x} kiloen.` })
  const f = one(frames, r)
  return {
    say: f.es,
    number,
    answer: money(total),
    values: [total],
    no: f.no,
    parts,
  }
}

function time(r: Random): Draft {
  // The twenty-four-hour clock of stations: «a las dieciocho cuarenta»
  if (r() < 0.22) {
    const H = int(13, 23, r)
    const m = int(0, 11, r) * 5
    const hour = `las ${spoken(H, 'f')}`
    const mins = m === 0 ? 'horas' : m < 10 ? `cero ${spoken(m)}` : spoken(m)
    const number = `${hour} ${mins}`
    const [what, hva] = one(
      [
        ['El tren', 'Toget'],
        ['El autobús', 'Bussen'],
      ],
      r,
    )
    return {
      say: `${what} sale a ${number}.`,
      number,
      answer: clockText(H, m),
      values: [H * 60 + m],
      no: `${hva} går kl. ${H}.${two(m)}.`,
      parts: [
        { es: hour, value: String(H) },
        m === 0
          ? { es: 'horas', value: ':00', no: 'presis' }
          : { es: mins, value: `:${two(m)}` },
      ],
      clock: { h: H, m, h24: true },
    }
  }

  // The twelve-hour clock of everyday talk, in one of a few sentences,
  // each at the hours it is said at
  const frame = one(
    [
      'son',
      'son',
      'quedamos',
      'quedamos',
      'cena',
      'abrimos',
      'cerramos',
    ] as const,
    r,
  )
  let H: number
  let m: number
  if (frame === 'cena') {
    H = int(20, 22, r)
    m = one([0, 15, 30, 30, 45], r)
    if (H === 22 && m > 30) m = 30
  } else if (frame === 'abrimos') {
    ;[H, m] = one(
      [
        [9, 0],
        [9, 30],
        [10, 0],
        [10, 0],
        [10, 30],
        [17, 0],
        [17, 30],
      ],
      r,
    )
  } else if (frame === 'cerramos') {
    ;[H, m] = one(
      [
        [14, 0],
        [14, 30],
        [20, 0],
        [20, 30],
        [21, 0],
        [21, 30],
      ],
      r,
    )
  } else {
    // (one o'clock now and then, for «es la una»)
    H = r() < 0.12 ? 13 : int(7, 23, r)
    m = one([0, 0, 15, 30, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55], r)
  }
  // The hour on a twelve-hour clock, and the hour named: past the half
  // hour, the next one, less the minutes (8:50 is «las nueve menos diez»)
  const h = H % 12 || 12
  const named = m > 30 ? (h % 12) + 1 : h
  // The part of the day now and then, and always where a shop opening
  // later in the day would be taken for the morning
  const part =
    frame === 'abrimos' || frame === 'cerramos'
      ? H >= 17 || r() < 0.3
        ? dayPart(H, named)
        : null
      : frame !== 'cena' && r() < 0.3
        ? dayPart(H, named)
        : null

  const hour = hourWord(named)
  let tail = ''
  let minutePart: Part | null = null
  if (m === 0) {
    if (frame === 'son' && !part && r() < 0.4) {
      tail = ' en punto'
      minutePart = { es: 'en punto', value: ':00', no: 'presis' }
    }
  } else if (m === 15) {
    tail = ' y cuarto'
    minutePart = { es: 'y cuarto', value: '+15 min', no: 'kvart over' }
  } else if (m === 30) {
    tail = ' y media'
    minutePart = { es: 'y media', value: '+30 min', no: 'halv' }
  } else if (m === 45) {
    tail = ' menos cuarto'
    minutePart = { es: 'menos cuarto', value: '−15 min', no: 'kvart på' }
  } else if (m < 30) {
    tail = ` y ${spoken(m)}`
    minutePart = { es: `y ${spoken(m)}`, value: `+${m} min` }
  } else {
    tail = ` menos ${spoken(60 - m)}`
    minutePart = { es: `menos ${spoken(60 - m)}`, value: `−${60 - m} min` }
  }
  const number = `${hour}${tail}${part ? ` ${part.es}` : ''}`
  const parts: Array<Part> = [{ es: hour, value: String(named), no: 'klokka' }]
  if (minutePart) parts.push(minutePart)
  if (part)
    parts.push({ es: part.es, value: H >= 13 ? '+12 t' : '', no: part.no })

  const said = `${norwegianTime(h, m)}${tail === ' en punto' ? ' presis' : ''}${part ? ` ${part.no}` : ''}`
  const sentences = {
    son: [`${named === 1 ? 'Es' : 'Son'} ${number}.`, `Klokka er ${said}.`],
    quedamos: [`Quedamos a ${number}.`, `Vi møtes klokka ${said}.`],
    cena: [`La cena es a ${number}.`, `Middagen er klokka ${said}.`],
    abrimos: [`Abrimos a ${number}.`, `Vi åpner klokka ${said}.`],
    cerramos: [`Cerramos a ${number}.`, `Vi stenger klokka ${said}.`],
  }
  const [say, no] = sentences[frame]
  // Without the part of the day the twelve-hour clock says no more than
  // the hour, morning or evening; with «de la mañana» it is the morning,
  // and with «de la tarde» or «de la noche» the afternoon or evening,
  // written either way
  const base = (h % 12) * 60 + m
  const values = !part
    ? [base, base + 12 * 60]
    : H < 12
      ? [base]
      : [...new Set([H * 60 + m, h * 60 + m])]
  return {
    say,
    number,
    answer: clockText(part && H >= 12 ? H : h, m),
    values,
    no,
    parts,
    clock: { h: H, m },
  }
}

// A phone number's group of digits as it is read: 32 «treinta y dos», 07
// «cero siete», 078 «cero setenta y ocho», and the first three of a mobile
// as a digit and a pair, 645 «seis cuarenta y cinco»
function reading(d: string, read: Reading): Array<Slot> {
  switch (read) {
    case 'pair':
      return d[0] === '0'
        ? [slot('cero', [1], 0), slot(SMALL[Number(d[1])], [0], 0)]
        : slots(Number(d))
    case 'triple':
      return d[0] === '0'
        ? [slot('cero', [2], 0), ...reading(d.slice(1), 'pair')]
        : slots(Number(d))
    case 'lead':
      return [slot(SMALL[Number(d[0])], [2], 0), ...reading(d.slice(1), 'pair')]
    case 'whole':
      return slots(Number(d))
  }
}

// The digits of a phone number in its groups
function chunks(d: string, groups: Array<{ n: number }>): Array<string> {
  const out: Array<string> = []
  let at = 0
  for (const g of groups) {
    out.push(d.slice(at, at + g.n))
    at += g.n
  }
  return out
}

function phone(r: Random): Draft {
  const digits = (n: number) =>
    Array.from({ length: n }, () => String(int(0, 9, r))).join('')
  const style = r()
  let d: string
  let groups: Array<{ n: number; read: Reading }>
  if (style < 0.65) {
    // A mobile in a three and pairs: 645 32 17 88
    d = (r() < 0.85 ? '6' : '7') + digits(8)
    groups = [
      { n: 3, read: 'lead' },
      { n: 2, read: 'pair' },
      { n: 2, read: 'pair' },
      { n: 2, read: 'pair' },
    ]
  } else if (style < 0.85) {
    // A mobile in threes: 645 321 788
    d = (r() < 0.85 ? '6' : '7') + digits(8)
    groups = [
      { n: 3, read: 'triple' },
      { n: 3, read: 'triple' },
      { n: 3, read: 'triple' },
    ]
  } else {
    // A landline in Madrid or Barcelona: 91 234 56 78
    d = (r() < 0.7 ? '91' : '93') + digits(7)
    groups = [
      { n: 2, read: 'whole' },
      { n: 3, read: 'triple' },
      { n: 2, read: 'pair' },
      { n: 2, read: 'pair' },
    ]
  }
  const ds = chunks(d, groups)
  const said = ds.map((c, i) => words(reading(c, groups[i].read)))
  const number = said.join(', ')
  const spaced = ds.join(' ')
  const f = one(
    [
      [`Mi número es el ${number}.`, `Nummeret mitt er ${spaced}.`],
      [`Llámame al ${number}.`, `Ring meg på ${spaced}.`],
      [`Apunta: ${number}.`, `Skriv opp: ${spaced}.`],
      [`El teléfono es el ${number}.`, `Telefonnummeret er ${spaced}.`],
    ],
    r,
  )
  return {
    say: f[0],
    number,
    answer: spaced,
    values: [Number(d)],
    no: f[1],
    parts: said.map((es, i) => ({ es, value: ds[i] })),
    groups,
  }
}

function year(r: Random): Draft {
  const band = r()
  const y =
    band < 0.42
      ? int(1950, 2026, r)
      : band < 0.6
        ? int(1900, 1949, r)
        : band < 0.78
          ? int(1800, 1899, r)
          : int(1400, 1799, r)
  const number = spoken(y)
  const f = one(
    [
      [`Fue en ${number}.`, `Det var i ${y}.`],
      [`Nació en ${number}.`, `Født i ${y}.`],
      [`Es de ${number}.`, `Den er fra ${y}.`],
      [`Desde ${number}.`, `Siden ${y}.`],
    ],
    r,
  )
  return {
    say: f[0],
    number,
    answer: String(y),
    values: [y],
    no: f[1],
    parts: terms(y),
  }
}

function big(r: Random): Draft {
  const kinds = [
    {
      es: (n: string) => `El piso cuesta ${n} euros.`,
      no: (x: string) => `Leiligheten koster ${x} euro.`,
      make: () => int(85, 650, r) * 1000,
    },
    {
      es: (n: string) => `El coche cuesta ${n} euros.`,
      no: (x: string) => `Bilen koster ${x} euro.`,
      make: () => int(60, 450, r) * 100,
    },
    {
      es: (n: string) => `La ciudad tiene ${n} habitantes.`,
      no: (x: string) => `Byen har ${x} innbyggere.`,
      make: () =>
        r() < 0.35 ? int(100, 340, r) * 10_000 : int(500, 9900, r) * 100,
    },
    {
      es: (n: string) => `El pueblo tiene ${n} habitantes.`,
      no: (x: string) => `Landsbyen har ${x} innbyggere.`,
      make: () => int(1000, 9999, r),
    },
    {
      es: (n: string) => `En el estadio hay ${n} aficionados.`,
      no: (x: string) => `Det er ${x} tilskuere på stadion.`,
      make: () => int(15_000, 85_000, r),
    },
    {
      es: (n: string) => `Son ${n} kilómetros.`,
      no: (x: string) => `Det er ${x} kilometer.`,
      make: () => int(100, 950, r) * 10,
    },
  ]
  const k = one(kinds, r)
  const n = k.make()
  // A million on the dot takes «de» before its noun: dos millones de
  // habitantes
  const number = `${spoken(n, 'm')}${n % 1_000_000 === 0 ? ' de' : ''}`
  return {
    say: k.es(number),
    number,
    answer: group(n),
    values: [n],
    no: k.no(group(n)),
    parts: terms(n, 'm'),
  }
}

const MAKE: Record<Kind, (r: Random) => Draft> = {
  price,
  time,
  phone,
  year,
  big,
}

// How many of each kind the deck holds
export const COUNT: Record<Kind, number> = {
  price: 60,
  time: 60,
  phone: 35,
  year: 45,
  big: 50,
}

const LETTER: Record<Kind | 'lottery', string> = {
  price: 'p',
  time: 't',
  phone: 'f',
  year: 'a',
  big: 'g',
  lottery: 'l',
}

// The deck: each kind made in turn from one seed, none said twice, the
// two voices taking turns. A change here means new recordings.
export function deck(seed = 2026): Array<Item> {
  const r = seeded(seed)
  const out: Array<Item> = []
  const seen = new Set<string>()
  for (const kind of Object.keys(COUNT) as Array<Kind>) {
    let n = 0
    while (n < COUNT[kind]) {
      const d = MAKE[kind](r)
      if (seen.has(d.say)) continue
      seen.add(d.say)
      out.push({
        ...d,
        id: `${LETTER[kind]}${n}`,
        kind,
        voice: NUMBER_VOICES[n % NUMBER_VOICES.length],
      })
      n++
    }
  }
  return out
}

// The lottery's deck: numbers of five figures, each with its prize, the
// small ones most often, as in the draw
export function lotteryDeck(seed = 1812): Array<Item> {
  const r = seeded(seed)
  const out: Array<Item> = []
  const seen = new Set<number>()
  const prizes = PRIZES.flatMap((p) => Array.from({ length: p.n }, () => p))
  for (const p of prizes) {
    let n = int(10_000, 99_999, r)
    while (seen.has(n)) n = int(10_000, 99_999, r)
    seen.add(n)
    const number = spoken(n)
    out.push({
      id: `${LETTER.lottery}${out.length}`,
      kind: 'lottery',
      voice: LOTTERY_VOICE,
      say: `${capital(number)}. ${capital(p.es)}.`,
      number,
      answer: String(n),
      values: [n],
      no: `${group(n)}: ${p.no}, ${group(p.euros)} euro.`,
      parts: terms(n),
      prize: { es: p.es, euros: p.euros, no: p.no },
    })
  }
  return out
}

export const DECK: Array<Item> = deck()
export const LOTTERY: Array<Item> = lotteryDeck()

// --- Typing, and judging what is typed ---

// What can be typed for a kind: digits, and for a price its comma, for a
// time the colon; how many digits at most
export const TYPING: Record<
  Kind | 'lottery',
  { sep: ',' | ':' | null; most: number }
> = {
  price: { sep: ',', most: 7 },
  time: { sep: ':', most: 4 },
  phone: { sep: null, most: 9 },
  year: { sep: null, most: 4 },
  big: { sep: null, most: 8 },
  lottery: { sep: null, most: 5 },
}

// A key pressed, added to what is typed: a digit, or the separator (a
// comma, a point or a colon each type it), once, and for a time only after
// the hour; no more digits than the kind takes, and two after the
// separator
export function type(
  typed: string,
  key: string,
  kind: Kind | 'lottery',
): string {
  const { sep, most } = TYPING[kind]
  const digits = typed.replace(/\D/g, '').length
  if (/^[.,:]$/.test(key)) {
    if (!sep || typed.includes(sep)) return typed
    if (sep === ':') return digits >= 1 && digits <= 2 ? typed + sep : typed
    return `${typed || '0'}${sep}`
  }
  if (!/^\d$/.test(key)) return typed
  if (digits >= most) return typed
  if (sep && typed.includes(sep) && typed.split(sep)[1].length >= 2)
    return typed
  // A first nought gives way to the digit after it, except in a time
  if (typed === '0' && sep !== ':') return key
  return typed + key
}

// The last digit or separator taken away
export const unType = (typed: string) => typed.slice(0, -1)

// What is typed as it is shown while typing: a big number in groups of
// three, a phone number in the groups it is said in, a time with its colon
// before the last two digits when none is typed
export function shown(typed: string, item: Item): string {
  if (item.kind === 'big') return typed ? group(Number(typed)) : ''
  if (item.kind === 'phone' && item.groups)
    return chunks(typed, item.groups).filter(Boolean).join(' ')
  if (item.kind === 'time' && !typed.includes(':') && typed.length >= 3)
    return `${typed.slice(0, -2)}:${typed.slice(-2)}`
  return typed
}

// A time typed, as hours and minutes; null if it cannot be read
function hm(typed: string): { h: number; m: number } | null {
  const t = typed.trim()
  const s = t.includes(':')
    ? t
    : t.length >= 3
      ? `${t.slice(0, -2)}:${t.slice(-2)}`
      : `${t}:`
  const m = /^(\d{1,2}):(\d{2})?$/.exec(s)
  if (!m) return null
  const h = Number(m[1])
  const min = Number((m[2] as string | undefined) ?? '0')
  if (h > 24 || min > 59) return null
  return { h: h % 24, m: min }
}

// A price typed, as euros and cents; null if it cannot be read
function eurosOf(typed: string): { e: number; c: number } | null {
  const m = /^(\d+)(?:,(\d{0,2}))?$/.exec(typed.trim())
  if (!m) return null
  return {
    e: Number(m[1]),
    c: Number(((m[2] as string | undefined) ?? '').padEnd(2, '0')),
  }
}

// What is typed, as a worth to compare with the item's: cents for a
// price, minutes from midnight for a time, else the number; null if it
// cannot be read
export function worth(typed: string, kind: Kind | 'lottery'): number | null {
  if (!typed.trim()) return null
  if (kind === 'price') {
    const p = eurosOf(typed)
    return p && p.e * 100 + p.c
  }
  if (kind === 'time') {
    const t = hm(typed)
    return t && t.h * 60 + t.m
  }
  const digits = typed.replace(/\D/g, '')
  return digits ? Number(digits) : null
}

export const isRight = (typed: string, item: Item) => {
  const w = worth(typed, item.kind)
  return w !== null && item.values.includes(w)
}

// --- What an answer says about the words in the bank ---

// The bank's word for a number word as said: «un» and «una» are uno,
// «ciento» is cien, «doscientas» doscientos, the half hour's «media» is
// medio. Only number words count (and medio), for the answer is a number
// heard and typed.
const LEMMA: Record<string, string> = {
  un: 'uno',
  una: 'uno',
  ciento: 'cien',
  media: 'medio',
  veintiún: 'veintiuno',
  veintiuna: 'veintiuno',
}
const COUNTED = new Set([
  ...WORDS.filter((w) => w.pos === 'num').map((w) => w.id),
  'medio',
])

export function bankId(es: string): string | null {
  const id = LEMMA[es] ?? es.replace(/ientas$/, 'ientos')
  return COUNTED.has(id) && WORD[id] ? id : null
}

// Each word of a number heard, and whether it was heard right, from the
// digits typed for it: a word is right when every digit it stands for is,
// and unknown (null) when what is typed has another count of digits, so
// that they cannot be lined up
function judged(
  said: Array<Slot>,
  digits: string,
  typed: string | null,
): Array<[string, boolean | null]> {
  const lined = typed !== null && typed.length === digits.length
  const at = (s: string, i: number) => s[s.length - 1 - i]
  return said.map((x) => [
    x.es,
    lined ? x.at.every((i) => at(digits, i) === at(typed, i)) : null,
  ])
}

// Every word of an item's number that was heard, with whether it was
// heard right, by what was typed
function verdicts(item: Item, typed: string): Array<[string, boolean | null]> {
  switch (item.kind) {
    case 'price': {
      const total = item.values[0]
      const e = Math.floor(total / 100)
      const c = total % 100
      const p = eurosOf(typed)
      return [
        ...(e ? judged(slots(e, 'm'), String(e), p && String(p.e)) : []),
        ...(c ? judged(slots(c), two(c), p && two(p.c)) : []),
      ]
    }
    case 'time': {
      const { h: H, m, h24 } = item.clock ?? { h: 0, m: 0 }
      const t = hm(typed)
      if (h24)
        return [
          ...judged(slots(H, 'f'), String(H), t && String(t.h)),
          ...(m ? judged(slots(m), two(m), t && two(t.m)) : []),
        ]
      // The hour named is heard right when it is typed, or the hour
      // before it for a time «menos» (8:50 for «las nueve menos diez»)
      const h = H % 12 || 12
      const named = m > 30 ? (h % 12) + 1 : h
      const hourRight =
        t && (t.h % 12 === named % 12 || (m > 30 && t.h % 12 === h % 12))
      const out: Array<[string, boolean | null]> = slots(named, 'f').map(
        (x) => [x.es, t ? !!hourRight : null],
      )
      if (m === 30) out.push(['media', t ? t.m === 30 : null])
      else if (m && m !== 15 && m !== 45) {
        // «y diez» is the minutes; «menos diez» the minutes left, though
        // :10 typed for it is diez heard and menos missed
        const n = m < 30 ? m : 60 - m
        const said = slots(n)
        const as = (x: number) => judged(said, two(n), two(x))
        const left = t && as(m < 30 ? t.m : 60 - t.m)
        const plain = t && m > 30 ? as(t.m) : null
        said.forEach((x, i) =>
          out.push([
            x.es,
            !left ? null : !!(left[i][1] || (plain && plain[i][1])),
          ]),
        )
      }
      return out
    }
    case 'phone': {
      const d = String(item.values[0])
      const typedDigits = typed.replace(/\D/g, '')
      const groups = item.groups ?? []
      const mine = chunks(d, groups)
      const theirs =
        typedDigits.length === d.length ? chunks(typedDigits, groups) : null
      return groups.flatMap((g, i) =>
        judged(reading(mine[i], g.read), mine[i], theirs && theirs[i]),
      )
    }
    default: {
      const n = item.values[0]
      const typedDigits = typed.replace(/\D/g, '')
      return judged(
        slots(n, item.kind === 'big' ? 'm' : 'alone'),
        String(n),
        typedDigits || null,
      )
    }
  }
}

// The bank's words heard in an item's number (not in the sentence around
// it, which the answer says nothing about), each once, with whether it was
// heard right: wrong if any time it is said was missed. Words that cannot
// be judged from what was typed are left out.
export function heard(
  item: Item,
  typed: string,
): Array<{ id: string; right: boolean }> {
  const out = new Map<string, boolean>()
  for (const [es, right] of verdicts(item, typed)) {
    const id = bankId(es)
    if (!id || right === null) continue
    out.set(id, (out.get(id) ?? true) && right)
  }
  return [...out].map(([id, right]) => ({ id, right }))
}

// The bank's words in an item's number, each once
export const bankWords = (item: Item): Array<string> => [
  ...new Set(
    item.number.split(/[\s,]+/).flatMap((w) => {
      const id = bankId(w)
      return id ? [id] : []
    }),
  ),
]

// --- Dealing ---

// The items of a kind, or of the lottery
export const ofKind = (kind: Kind | 'lottery') =>
  kind === 'lottery' ? LOTTERY : DECK.filter((x) => x.kind === kind)

// The next item of a kind, dealt as from a shuffled deck: one not heard
// yet, or once all have been, any but those just played. Returns the item
// and the ids heard, with it.
export function deal(
  kind: Kind | 'lottery',
  heardIds: Array<string>,
  random: Random = Math.random,
  not: Array<string> = [],
): { item: Item; heard: Array<string> } {
  const all = ofKind(kind)
  const mine = new Set(all.map((x) => x.id))
  let had = heardIds.filter((id) => mine.has(id))
  let left = all.filter((x) => !had.includes(x.id) && !not.includes(x.id))
  if (!left.length) {
    // A new pass of the deck, without those just played
    had = []
    left = all.filter((x) => !not.includes(x.id))
  }
  const item = left[Math.floor(random() * left.length)]
  return {
    item,
    heard: [...heardIds.filter((id) => !mine.has(id)), ...had, item.id],
  }
}

// A round: six numbers of one kind, or of all of them mixed, prices and
// times most, ending with a phone number or a big number; then the
// lottery's three
export const ROUND = 6
export const BONUS = 3

export function roundKinds(
  kind: Kind | 'all',
  random: Random = Math.random,
): Array<Kind> {
  if (kind !== 'all') return Array.from({ length: ROUND }, () => kind)
  return [
    'price',
    'time',
    'year',
    'time',
    'price',
    random() < 0.5 ? 'big' : 'phone',
  ]
}
