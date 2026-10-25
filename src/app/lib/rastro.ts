import { WORD_VOICE } from '../data/voices.ts'
import { shuffle } from './choices.ts'
import type { Bank } from './bank.ts'

// El Rastro: Madrid's flea market on a Sunday morning, and a list of four
// things to buy at four stalls. The player asks the price, and the seller
// names it aloud; she haggles by ear: too dear, a little cheaper, an offer,
// buy, or walk on. What the seller said is written only once she has
// answered it, or looked. A deal at the lowest price the seller would take
// is three stars, a fair price two. After the market in Tian
// (tian.ymse.land).
//
// Every line is written here, in mixed text (lib/text.ts), from the
// sellers' ladders of prices, so that each has a recording in its
// speaker's voice (lib/spoken.ts). Each seller has a way of speaking of
// their own, and no line of one is a line of another, since a recording is
// found by its text alone. A change here means new recordings.

export type Gender = 'm' | 'f'

// --- The prices, as said ---

// The numbers a price may be, as Spaniards say them, word by word as in
// the bank: treinta y cinco
const NUMBER: Record<number, string> = {
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  12: 'doce',
  15: 'quince',
  20: 'veinte',
  25: 'veinticinco',
  30: 'treinta',
  35: 'treinta y cinco',
  40: 'cuarenta',
  45: 'cuarenta y cinco',
  50: 'cincuenta',
  60: 'sesenta',
  80: 'ochenta',
  100: 'cien',
}

export const PRICES = Object.keys(NUMBER).map(Number)

// A price in mixed text: «treinta y cinco», capitalised to begin a sentence
export function num(n: number, cap = false): string {
  const s = NUMBER[n]
  if (!s) throw new Error(`No way to say ${n}`)
  return cap ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// The words of the bank a price is said with (not the y between them)
export const numberWords = (n: number) =>
  num(n)
    .split(' ')
    .filter((w) => w !== 'y')

const EUROS = 'euros>el_euro=euro'
const SENORA = 'señora>la_señora=frue'
const SENORA_ = 'Señora>la_señora=frue'

// --- The sellers ---

// What a seller says: the first price, coming down when asked, coming
// down a little against an offer too low, the lowest and saying so, and
// calling the player back as she walks on; and what needs no price. A
// line on the thing itself agrees with it: «¿Cara?» of a lamp.
export interface Lines {
  open: (n: number) => string
  down: (n: number) => string
  counter: (n: number) => string
  lowest: (n: number) => string
  back: (n: number) => string
  // Sold, at an offer
  deal: string
  // Sold, at the price asked
  thanks: string
  // An offer far too low
  insult: string
  // Told a fair price is too dear
  notDear: (g: Gender) => string
  // Asked to come down from the lowest
  noLower: string
  // Let go
  bye: string
  // Pushed once too often
  enough: string
}

export interface Seller {
  id: string
  name: string
  // The voice in data/voices.ts
  voice: string
  lines: Lines
}

const caro = (g: Gender, cap = false) =>
  g === 'f' ? `${cap ? 'Cara' : 'cara'}>caro=dyr` : cap ? 'Caro' : 'caro'

export const SELLERS: Array<Seller> = [
  {
    // An old bookseller in a beret, gruff but kind: books, maps and records
    id: 'paco',
    name: 'Paco',
    voice: 'Paco',
    lines: {
      open: (n) => `${num(n, true)} ${EUROS} , ${SENORA} .`,
      down: (n) =>
        `Bueno=vel , se_lo_dejo>dejar=jeg_lar_Dem_få_den en=for ${num(n)} .`,
      counter: (n) =>
        `No=ikke puedo>poder=kan_jeg . ${num(n, true)} ${EUROS} .`,
      lowest: (n) =>
        `${num(n, true)} , y no=ikke bajo>bajar=går_jeg_ned más=mer .`,
      back: (n) =>
        `¡ Espere>esperar=vent , ${SENORA} ! Se_lo_dejo>dejar=jeg_lar_Dem_få_den en=for ${num(n)} .`,
      deal: '¡ Trato_hecho>¡trato_hecho!=avtale !',
      thanks: `Muchas_gracias>muchas_gracias , ${SENORA} .`,
      insult: '¡ No , no ! Es>ser=det_er muy poco .',
      notDear: (g) =>
        `¿ ${caro(g, true)} ? ¡ Es>ser=det_er un buen>bueno=god precio>el_precio=pris !`,
      noLower: 'No=ikke puedo>poder=kan_jeg bajar=gå_ned más=mer .',
      bye: `Vale . Adiós , ${SENORA} .`,
      enough: 'No , no , no . ¡ Hasta_luego>hasta_luego !',
    },
  },
  {
    // A lively woman under a striped awning: fans, hats and music boxes
    id: 'rosa',
    name: 'Rosa',
    voice: 'Rosa',
    lines: {
      open: (n) => `Son>ser=det_er ${num(n)} ${EUROS} .`,
      down: (n) => `Venga>venir=greit , para=til usted=Dem , ${num(n)} .`,
      counter: (n) => `No , no . ${num(n, true)} ${EUROS} .`,
      lowest: (n) =>
        `${num(n, true)} ${EUROS} . Es>ser=det_er mi último=siste precio>el_precio=pris .`,
      back: (n) =>
        `¡ Oiga>oír=hør_her , ${SENORA} ! ${num(n, true)} ${EUROS} , ¿ vale ?`,
      deal: '¡ Vale , trato_hecho>¡trato_hecho!=avtale !',
      thanks: `¡ Gracias , ${SENORA} ! ¡ Hasta_luego>hasta_luego !`,
      insult: '¿ Cómo ? ¡ Es>ser=det_er muy poco !',
      notDear: () =>
        '¡ No , no ! Es>ser=det_er un precio>el_precio=pris muy bueno .',
      noLower: 'Más=mer barato no=ikke puedo>poder=kan_jeg .',
      bye: 'Bueno=vel , hasta_luego>hasta_luego .',
      enough: 'No , no . ¡ Adiós !',
    },
  },
  {
    // An antique dealer in a waistcoat, courteous: lamps and mirrors
    id: 'julian',
    name: 'Julián',
    voice: 'Julián',
    lines: {
      open: (n) => `Cuesta>costar=den_koster ${num(n)} ${EUROS} .`,
      down: (n) => `Está>estar=det_er bien=greit . ${num(n, true)} ${EUROS} .`,
      counter: (n) => `Lo_siento>lo_siento . ${num(n, true)} ${EUROS} .`,
      lowest: (n) =>
        `${num(n, true)} ${EUROS} . No=ikke puedo>poder=kan_jeg bajar=gå_ned más=mer .`,
      back: (n) =>
        `¡ ${SENORA_} , espere>esperar=vent ! Para=til usted=Dem , ${num(n)} ${EUROS} .`,
      deal: 'Muy bien . ¡ Trato_hecho>¡trato_hecho!=avtale !',
      thanks: `Gracias , ${SENORA} . ¡ Buenos_días>buenos_días=ha_en_fin_dag !`,
      insult: `${SENORA_} , es>ser=det_er muy poco .`,
      notDear: (g) =>
        `¿ ${caro(g, true)} ? No , ${SENORA} . Es>ser=den_er muy ${g === 'f' ? 'antigua>antiguo' : 'antiguo'} .`,
      noLower:
        'Lo_siento>lo_siento , no=ikke puedo>poder=kan_jeg bajar=gå_ned más=mer .',
      bye: `Muy bien . Adiós , ${SENORA} .`,
      enough: `Lo_siento>lo_siento , ${SENORA} . ¡ Adiós !`,
    },
  },
  {
    // An older woman among clocks and radios, brisk and warm
    id: 'pilar',
    name: 'Pilar',
    voice: 'Pilar',
    lines: {
      open: (n) => `${num(n, true)} ${EUROS} . ¡ Y va>ir=den_går muy bien !`,
      down: (n) => `Vale , ${num(n)} ${EUROS} .`,
      counter: (n) => `No , ${SENORA} . ${num(n, true)} ${EUROS} .`,
      lowest: (n) => `${num(n, true)} ${EUROS} . Por=for menos , no=ikke .`,
      back: (n) => `¡ ${SENORA_} ! ¡ ${SENORA_} ! ${num(n, true)} ${EUROS} .`,
      deal: '¡ Trato_hecho>¡trato_hecho!=avtale , guapa>guapo=vennen !',
      thanks: '¡ Gracias , guapa>guapo=vennen ! ¡ Hasta_luego>hasta_luego !',
      insult: '¡ Qué_va>¡qué_va!=slett_ikke ! Es>ser=det_er muy poco .',
      notDear: (g) =>
        `¿ ${caro(g, true)} ? ¡ Qué_va>¡qué_va!=slett_ikke ! Es>ser=den_er muy ${g === 'f' ? 'barata>barato' : 'barato'} .`,
      noLower: `No=ikke puedo>poder=kan_jeg , ${SENORA} .`,
      bye: 'Vale , vale . Adiós .',
      enough: 'Bueno=vel , bueno=vel . ¡ Adiós !',
    },
  },
]

export const SELLER: Record<string, Seller> = Object.fromEntries(
  SELLERS.map((s) => [s.id, s]),
)

// --- What is for sale ---

export interface Ware {
  id: string
  // As the list names it, in mixed text: «un abanico»
  name: string
  // The words of the bank it is named with
  words: Array<string>
  g: Gender
  // A fair price, as the list has it
  fair: number
  seller: string
  // What the seller asks first, and each step down to the lowest they
  // will go: honest, asking a fair price; middling; and greedy
  ladders: [Array<number>, Array<number>, Array<number>]
  // What the player can offer
  offers: Array<number>
  // How many pushes the seller takes before waving her off
  patience: number
}

export const WARES: Array<Ware> = [
  {
    id: 'libro',
    name: 'un>un=en libro>el_libro=bok viejo=gammel',
    words: ['el libro', 'viejo'],
    g: 'm',
    fair: 4,
    seller: 'paco',
    ladders: [
      [4, 3],
      [6, 5, 4, 3],
      [10, 8, 6, 5, 3],
    ],
    offers: [2, 3, 4, 5, 6],
    patience: 5,
  },
  {
    id: 'mapa',
    name: 'un>un=et mapa>el_mapa=kart',
    words: ['el mapa'],
    g: 'm',
    fair: 8,
    seller: 'paco',
    ladders: [
      [8, 6],
      [12, 10, 8, 6],
      [20, 15, 12, 10, 6],
    ],
    offers: [4, 5, 6, 8, 10],
    patience: 4,
  },
  {
    id: 'disco',
    name: 'un>un=en disco>el_disco=plate',
    words: ['el disco'],
    g: 'm',
    fair: 10,
    seller: 'paco',
    ladders: [
      [10, 8],
      [15, 12, 10, 8],
      [25, 20, 15, 12, 8],
    ],
    offers: [5, 6, 8, 10, 12],
    patience: 4,
  },
  {
    id: 'abanico',
    name: 'un>un=en abanico>el_abanico=vifte',
    words: ['el abanico'],
    g: 'm',
    fair: 6,
    seller: 'rosa',
    ladders: [
      [6, 5],
      [10, 8, 6, 5],
      [15, 12, 10, 8, 5],
    ],
    offers: [3, 4, 5, 6, 8],
    patience: 4,
  },
  {
    id: 'sombrero',
    name: 'un>un=en sombrero>el_sombrero=hatt',
    words: ['el sombrero'],
    g: 'm',
    fair: 12,
    seller: 'rosa',
    ladders: [
      [12, 10],
      [20, 15, 12, 10],
      [30, 25, 20, 15, 10],
    ],
    offers: [6, 8, 10, 12, 15],
    patience: 4,
  },
  {
    id: 'caja',
    name: 'una>una=en caja_de_música>la_caja_de_música=spilledåse',
    words: ['la caja de música'],
    g: 'f',
    fair: 20,
    seller: 'rosa',
    ladders: [
      [20, 15],
      [30, 25, 20, 15],
      [50, 40, 30, 25, 15],
    ],
    offers: [10, 12, 15, 20, 25],
    patience: 3,
  },
  {
    id: 'lampara',
    name: 'una>una=en lámpara>la_lámpara=lampe',
    words: ['la lámpara'],
    g: 'f',
    fair: 30,
    seller: 'julian',
    ladders: [
      [30, 25],
      [45, 40, 35, 30, 25],
      [80, 60, 50, 40, 25],
    ],
    offers: [15, 20, 25, 30, 35],
    patience: 3,
  },
  {
    id: 'espejo',
    name: 'un>un=et espejo>el_espejo=speil',
    words: ['el espejo'],
    g: 'm',
    fair: 25,
    seller: 'julian',
    ladders: [
      [25, 20],
      [40, 35, 30, 25, 20],
      [60, 50, 40, 30, 20],
    ],
    offers: [12, 15, 20, 25, 30],
    patience: 4,
  },
  {
    id: 'reloj',
    name: 'un>un=en reloj>el_reloj=klokke',
    words: ['el reloj'],
    g: 'm',
    fair: 35,
    seller: 'pilar',
    ladders: [
      [35, 30],
      [50, 45, 40, 35, 30],
      [100, 80, 60, 45, 30],
    ],
    offers: [20, 25, 30, 35, 40],
    patience: 3,
  },
  {
    id: 'radio',
    name: 'una>una=en radio>la_radio=radio',
    words: ['la radio'],
    g: 'f',
    fair: 25,
    seller: 'pilar',
    ladders: [
      [25, 20],
      [40, 35, 30, 25, 20],
      [60, 50, 40, 30, 20],
    ],
    offers: [12, 15, 20, 25, 30],
    patience: 4,
  },
]

export const WARE: Record<string, Ware> = Object.fromEntries(
  WARES.map((w) => [w.id, w]),
)

// --- What the player says, in the teacher's voice ---

export const PLAYER_VOICE = WORD_VOICE

const lo = (g: Gender, cap = false) =>
  `${cap ? 'M' : 'm'}e_${g === 'f' ? 'la' : 'lo'}`

export const ASK = '¿ Cuánto_cuesta>¿cuánto_cuesta?=hva_koster_den ?'

export type MoveKind = 'dear' | 'cheaper' | 'offer' | 'buy' | 'leave'

export const MOVE: Record<Exclude<MoveKind, 'offer'>, (g: Gender) => string> = {
  dear: (g) => `Es>ser=den_er muy ${caro(g)} .`,
  cheaper: (g) =>
    `¿ ${lo(g, true)}_deja>dejar=lar_De_meg_få_den un_poco_más ${g === 'f' ? 'barata>barato' : 'barato'} ?`,
  buy: (g) => `${lo(g, true)}_llevo>me_lo_llevo=jeg_tar_den .`,
  leave: () => 'No , gracias .',
}

export const OFFER = (n: number, g: Gender) =>
  `¿ ${lo(g, true)}_deja>dejar=lar_De_meg_få_den en=for ${num(n)} ${EUROS} ?`

// --- Haggling ---

export interface HaggleState {
  // Where on the ladder the seller is
  i: number
  // Pushes they will still take
  left: number
  // They have called the player back once already
  back: boolean
}

export type Move =
  | { k: 'dear' }
  | { k: 'cheaper' }
  | { k: 'offer'; n: number }
  | { k: 'buy' }
  | { k: 'leave' }

export interface Reply {
  // What the seller says, in mixed text
  line: string
  // The price named in it, if any
  price?: number
  state: HaggleState
  // Sold, for this much
  paid?: number
  // Gone without a deal: let go, or waved off
  gone?: 'bye' | 'enough'
  mood?: 'good' | 'cross'
}

export const startState = (w: Ware): HaggleState => ({
  i: 0,
  left: w.patience,
  back: false,
})

// An offer under this share of the lowest price is an insult
const SILLY = 0.7
// The chance of being called back on walking on: low before any haggling,
// better once the price has come down
const CALL_BACK = [0.25, 0.6]

// How the seller answers a move. They stand somewhere on their ladder and
// come down it: a step when asked nicely, two when told a price far over a
// fair one is too dear, part of the way to an offer that is low but not
// silly. Each push costs some of their patience; pushed once more with
// none left, they wave the player off. An offer at or over what they ask,
// or at least their next step down, is a deal. Walking on may bring them
// calling after her with their lowest price, or may not.
export function respond(
  w: Ware,
  ladder: Array<number>,
  st: HaggleState,
  move: Move,
  random: () => number = Math.random,
): Reply {
  const lines = SELLER[w.seller].lines
  const L = ladder
  const last = L.length - 1
  const price = L[st.i]
  const low = L[last]
  const at = (j: number): Pick<Reply, 'line' | 'price'> => ({
    line: j === last ? lines.lowest(L[j]) : lines.down(L[j]),
    price: L[j],
  })

  const push = (
    cost: number,
    i: number,
    said: Pick<Reply, 'line' | 'price'>,
    cross = false,
  ): Reply =>
    st.left <= 0
      ? { line: lines.enough, state: st, gone: 'enough', mood: 'cross' }
      : {
          ...said,
          state: { ...st, i, left: Math.max(0, st.left - cost) },
          ...(cross ? { mood: 'cross' as const } : {}),
        }
  const deal = (paid: number, line: string): Reply => ({
    line,
    state: st,
    paid,
    mood: 'good',
  })

  switch (move.k) {
    case 'buy':
      return deal(price, lines.thanks)
    case 'cheaper':
      return st.i === last
        ? push(1, st.i, { line: lines.noLower })
        : push(1, st.i + 1, at(st.i + 1))
    case 'dear': {
      if (price <= w.fair)
        return push(2, st.i, { line: lines.notDear(w.g) }, true)
      const j = Math.min(last, st.i + (price > w.fair * 1.5 ? 2 : 1))
      return push(1, j, at(j))
    }
    case 'offer': {
      const n = move.n
      if (n >= price) return deal(n, lines.deal)
      if (n >= low && n >= L[Math.min(last, st.i + 1)])
        return deal(n, lines.deal)
      if (n < low * SILLY) return push(2, st.i, { line: lines.insult }, true)
      if (st.i === last) return push(1, st.i, { line: lines.noLower })
      // Part of the way down to the offer: the lowest step still above
      // halfway, and at least one
      const half = (price + n) / 2
      let j = st.i + 1
      while (j < last && L[j + 1] >= half) j++
      return push(1, j, {
        line: j === last ? lines.lowest(L[j]) : lines.counter(L[j]),
        price: L[j],
      })
    }
    case 'leave': {
      const chance = CALL_BACK[st.i > 0 ? 1 : 0]
      if (!st.back && st.i < last && st.left > 0 && random() < chance)
        return {
          line: lines.back(low),
          price: low,
          state: { ...st, i: last, back: true },
        }
      return { line: lines.bye, state: st, gone: 'bye' }
    }
  }
}

// Three stars for the lowest the seller would go, two for a fair price,
// one for paying over it
export const stars = (w: Ware, ladder: Array<number>, paid: number) =>
  paid <= ladder[ladder.length - 1] ? 3 : paid <= w.fair ? 2 : 1

// Whether a move on a price just heard shows it was understood: too dear
// is right of a price over a fair one, buying of one at or under it, and
// an offer of one under the price. Asking for it cheaper, or walking on,
// says nothing either way.
export function understood(w: Ware, price: number, move: Move): boolean | null {
  switch (move.k) {
    case 'dear':
      return price > w.fair
    case 'buy':
      return price <= w.fair
    case 'offer':
      return move.n < price
    default:
      return null
  }
}

// --- A Sunday ---

export const STALLS_A_DAY = 4

export interface Visit {
  ware: Ware
  seller: Seller
  // 0 honest, 1 middling, 2 greedy
  mood: number
  ladder: Array<number>
}

// The words a day is played in: what is on the list, and the prices the
// sellers will say, in euros
export const visitWords = (v: Visit) => [
  ...v.ware.words,
  ...new Set(v.ladder.flatMap(numberWords)),
  'el euro',
]

// Four stalls, one for each seller, in an order of their own: at each a
// thing the player has met if there is one, and a mood. Of the ways a day
// can go, one with few words not met yet is taken, so that a day brings
// three new ones at most where it can.
export function makeDay(
  bank: Bank,
  random: () => number = Math.random,
): Array<Visit> {
  const met = (id: string) => !!bank.cards[id]
  let best: { day: Array<Visit>; score: number } | null = null
  for (let tries = 0; tries < 60; tries++) {
    const day = shuffle(SELLERS, random).map((seller): Visit => {
      const wares = WARES.filter((w) => w.seller === seller.id)
      const ware = wares[Math.floor(random() * wares.length)]
      const r = random()
      const mood = r < 0.25 ? 0 : r < 0.65 ? 1 : 2
      return { ware, seller, mood, ladder: ware.ladders[mood] }
    })
    const fresh = new Set(day.flatMap(visitWords).filter((id) => !met(id))).size
    const score = Math.max(0, fresh - 3) * 10 + fresh * 0.5 + random()
    if (!best || score < best.score) best = { day, score }
  }
  return best!.day
}

// What the purse holds for a day: enough for everything at a fair price,
// and a little over
export const purseFor = (day: Array<Visit>) =>
  day.reduce((sum, v) => sum + v.ware.fair, 0) + 20

// --- Everything said ---

// Every line of the market, each in its speaker's voice: the player's
// moves for each thing, and each seller's lines for their own things
export function rastroLines(): Array<{ voice: string; line: string }> {
  const out: Array<{ voice: string; line: string }> = []
  const seen = new Set<string>()
  const add = (voice: string, line: string) => {
    if (seen.has(line)) return
    seen.add(line)
    out.push({ voice, line })
  }
  add(PLAYER_VOICE, ASK)
  for (const g of ['m', 'f'] as const)
    for (const k of ['dear', 'cheaper', 'buy', 'leave'] as const)
      add(PLAYER_VOICE, MOVE[k](g))
  for (const w of WARES)
    for (const n of w.offers) add(PLAYER_VOICE, OFFER(n, w.g))
  for (const s of SELLERS) {
    const lines = s.lines
    for (const w of WARES.filter((x) => x.seller === s.id)) {
      for (const L of w.ladders) {
        const low = L[L.length - 1]
        add(s.voice, lines.open(L[0]))
        for (const n of L.slice(1, -1)) {
          add(s.voice, lines.down(n))
          add(s.voice, lines.counter(n))
        }
        add(s.voice, lines.lowest(low))
        add(s.voice, lines.back(low))
      }
      add(s.voice, lines.notDear(w.g))
    }
    for (const line of [
      lines.deal,
      lines.thanks,
      lines.insult,
      lines.noLower,
      lines.bye,
      lines.enough,
    ])
      add(s.voice, line)
  }
  return out
}
