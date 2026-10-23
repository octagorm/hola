import { KNOWN_AT_START, PRACTISED_AT_START } from '../data/start.ts'
import { recall } from './bank.ts'
import { shuffle } from './choices.ts'
import { plain } from './text.ts'
import type { Bank } from './bank.ts'

// Tapas: a bar, and one guest at a time at the counter, ordering aloud.
// The player puts what they ask for on the tray, from the day's carta of
// drinks and dishes, and serves it. A day is eight guests. The orders are
// a fixed deck of sentences (DECK), each in the voice of one of the four
// guests (data/voices.ts), so that every one can be recorded; a day takes
// those whose drinks and dishes the player has met, the ones whose sound
// has faded most first.

export interface Item {
  // The word in the bank
  id: string
  drink?: boolean
  // How one is ordered, in mixed text (lib/text.ts): «una caña»
  one: string
  // How two or three are, after the number: «(dos) cañas». None for a
  // dish, or for a drink ordered one at a time.
  many?: string
  // Others ordered so alike that they never stand on the carta together:
  // «un vino» beside «un vino tinto»
  clash?: Array<string>
}

// The bar's drinks and dishes, in the carta's order
export const ITEMS: Array<Item> = [
  {
    id: 'el café',
    drink: true,
    one: 'un>un=en café>el_café=kaffe',
    many: 'cafés>el_café=kaffe',
  },
  {
    id: 'el café con leche',
    drink: true,
    one: 'un>un=en café_con_leche>el_café_con_leche=kaffe_med_melk',
    many: 'cafés_con_leche>el_café_con_leche=kaffe_med_melk',
  },
  { id: 'el té', drink: true, one: 'un>un=en té>el_té=te' },
  {
    id: 'el agua',
    drink: true,
    one: 'un>un=et agua>el_agua=vann',
    many: 'aguas>el_agua=vann',
  },
  {
    id: 'el zumo',
    drink: true,
    one: 'un>un=en zumo>el_zumo=juice de=av naranja>la_naranja=appelsin',
    many: 'zumos>el_zumo=juice de=av naranja>la_naranja=appelsin',
  },
  {
    id: 'la cerveza',
    drink: true,
    one: 'una>una=en cerveza>la_cerveza=øl',
    many: 'cervezas>la_cerveza=øl',
  },
  {
    id: 'la caña',
    drink: true,
    one: 'una>una=en caña>la_caña=liten_fatøl',
    many: 'cañas>la_caña=små_fatøl',
  },
  {
    id: 'el vino',
    drink: true,
    one: 'un>un=en vino>el_vino=vin',
    many: 'vinos>el_vino=vin',
    clash: ['el vino tinto', 'el vino blanco'],
  },
  {
    id: 'el vino tinto',
    drink: true,
    one: 'un>un=en vino_tinto>el_vino_tinto=rødvin',
    many: 'vinos_tintos>el_vino_tinto=rødvin',
    clash: ['el vino'],
  },
  {
    id: 'el vino blanco',
    drink: true,
    one: 'un>un=en vino_blanco>el_vino_blanco=hvitvin',
    many: 'vinos_blancos>el_vino_blanco=hvitvin',
    clash: ['el vino'],
  },
  {
    id: 'el tinto de verano',
    drink: true,
    one: 'un>un=en tinto_de_verano>el_tinto_de_verano=rødvin_med_brus',
    many: 'tintos_de_verano>el_tinto_de_verano=rødvin_med_brus',
  },
  { id: 'el vermut', drink: true, one: 'un>un=en vermut>el_vermut=vermut' },
  {
    id: 'el refresco',
    drink: true,
    one: 'un>un=en refresco>el_refresco=brus',
    many: 'refrescos>el_refresco=brus',
  },
  {
    id: 'la tortilla',
    one: 'una>una=en tapa>la_tapa=smårett de=med tortilla>la_tortilla=omelett',
  },
  {
    id: 'el jamón',
    one: 'una>una=en ración>la_ración=porsjon de=med jamón>el_jamón=skinke',
  },
  {
    id: 'el queso',
    one: 'una>una=en ración>la_ración=porsjon de=med queso>el_queso=ost',
  },
  { id: 'la aceituna', one: 'unas>una=noen aceitunas>la_aceituna=oliven' },
  { id: 'la ensalada', one: 'una>una=en ensalada>la_ensalada=salat' },
  {
    id: 'las patatas bravas',
    one: 'unas>una=noen patatas_bravas>las_patatas_bravas=poteter_med_sterk_saus',
  },
  {
    id: 'los calamares',
    one: 'una>una=en_porsjon de=med calamares>los_calamares=blekksprutringer',
  },
  {
    id: 'las croquetas',
    one: 'una>una=en_porsjon de=med croquetas>las_croquetas=kroketter',
  },
  {
    id: 'las albóndigas',
    one: 'unas>una=noen albóndigas>las_albóndigas=kjøttboller',
  },
  {
    id: 'las gambas al ajillo',
    one: 'unas>una=noen gambas_al_ajillo>las_gambas_al_ajillo=hvitløksreker',
  },
  {
    id: 'los pimientos de Padrón',
    one: 'unos>un=noen pimientos_de_Padrón>los_pimientos_de_Padrón=små_grønne_paprikaer',
  },
  {
    id: 'el chorizo',
    one: 'una>una=en ración>la_ración=porsjon de=med chorizo>el_chorizo=paprikapølse',
  },
  {
    id: 'el pulpo',
    one: 'una>una=en ración>la_ración=porsjon de=med pulpo>el_pulpo=blekksprut',
  },
]

export const ITEM: Record<string, Item | undefined> = Object.fromEntries(
  ITEMS.map((it) => [it.id, it]),
)

// The drinks and dishes every bank starts with (data/start.ts), so that a
// new player's bar has orders enough from the first day
const STARTING = new Set([...KNOWN_AT_START, ...PRACTISED_AT_START])
export const BASIC = ITEMS.filter((it) => STARTING.has(it.id))

// The guests, by their voices (data/voices.ts): two women, two men
export const GUESTS = ['Lucía', 'Manolo', 'Carmen', 'Javi']
export const WOMEN = new Set(['Lucía', 'Carmen'])

export interface Order {
  // What is said, in mixed text
  line: string
  // What is wanted: how many of each, by the item's id
  want: Record<string, number>
  // Who says it
  voice: string
}

// An order as it is said, for the recording
export const spoken = (o: Order) => plain(o.line)

// A guest's thanks when served, in their own voice
export const THANKS: Record<string, string> = {
  Lucía: '¡ Muchas_gracias>muchas_gracias !',
  Manolo: 'Gracias>gracias . ¡ Qué_rico>¡qué_rico! !',
  Carmen: '¡ Qué>qué=så bien , gracias !',
  Javi: '¡ Vale>vale , gracias !',
}

const NUMBER = ['', '', 'dos', 'tres']

// One or more of an item, as ordered: «una caña», «dos cañas»
export const phrase = (it: Item, n: number) =>
  n > 1 && it.many ? `${NUMBER[n]} ${it.many}` : it.one

// The number word an order says for an item, if more than one
export const numberOf = (n: number): string | undefined =>
  n > 1 ? NUMBER[n] : undefined

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// The ways an order is put, for one, two or three things
const FRAMES: Array<Array<(xs: Array<string>) => string>> = [
  [],
  [
    ([a]) => `${cap(a)} , por_favor .`,
    ([a]) => `¿ Me_pones>poner=kan_du_gi_meg ${a} ?`,
    ([a]) => `Ponme>poner=gi_meg ${a} , por_favor .`,
    ([a]) => `Hola , ${a} , por_favor .`,
    ([a]) => `Para>para=til mí>yo=meg , ${a} .`,
    ([a]) => `Quería>querer=jeg_vil_gjerne_ha ${a} .`,
  ],
  [
    ([a, b]) => `${cap(a)} y ${b} , por_favor .`,
    ([a, b]) => `¿ Me_pones>poner=kan_du_gi_meg ${a} y ${b} ?`,
    ([a, b]) => `Ponme>poner=gi_meg ${a} y ${b} .`,
    ([a, b]) => `Quería>querer=jeg_vil_gjerne_ha ${a} y ${b} .`,
    ([a, b]) => `Hola . ${cap(a)} y ${b} , por_favor .`,
    ([a, b]) => `Para>para=til mí>yo=meg , ${a} y ${b} .`,
  ],
  [
    ([a, b, c]) => `${cap(a)} , ${b} y ${c} , por_favor .`,
    ([a, b, c]) => `¿ Me_pones>poner=kan_du_gi_meg ${a} , ${b} y ${c} ?`,
    ([a, b, c]) => `Para>para=til mí>yo=meg , ${a} , ${b} y ${c} .`,
  ],
]

// The same numbers every time (Park and Miller's generator)
function seeded(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const clashes = (a: string, b: string) =>
  a === b || !!ITEM[a]?.clash?.includes(b) || !!ITEM[b]?.clash?.includes(a)

// The orders the guests can give: a fixed deck, the same on every build,
// so that each has a recording (lib/spoken.ts lists them). A share of it
// asks only for what every bank starts with; the rest has something from
// the lessons on tapas and drinks in each order. Drinks and dishes come
// from bags filled again when empty, so each comes round about as often
// as the others. A change here means new recordings.
export function deck(size = 120, basic = 48, seed = 1984): Array<Order> {
  const random = seeded(seed)
  const out: Array<Order> = []
  const seen = new Set<string>()
  const bag = (xs: Array<Item>) => {
    let left: Array<Item> = []
    return (): Item => {
      if (!left.length) left = shuffle(xs, random)
      return left.pop() as Item
    }
  }
  const pools = (items: Array<Item>) => ({
    drink: bag(items.filter((it) => it.drink)),
    dish: bag(items.filter((it) => !it.drink)),
  })
  const plainPools = pools(BASIC)
  const allPools = pools(ITEMS)
  while (out.length < size) {
    const p = out.length < basic ? plainPools : allPools
    const r = random()
    const k = r < 0.38 ? 1 : r < 0.85 ? 2 : 3
    const s = random()
    // What kinds of thing: a drink and a dish most often
    const kinds: Array<'drink' | 'dish'> =
      k === 1
        ? [s < 0.55 ? 'drink' : 'dish']
        : k === 2
          ? s < 0.7
            ? ['drink', 'dish']
            : s < 0.85
              ? ['drink', 'drink']
              : ['dish', 'dish']
          : s < 0.5
            ? ['drink', 'dish', 'dish']
            : ['drink', 'drink', 'dish']
    const items: Array<Item> = []
    for (const kind of kinds) {
      for (let tries = 0; tries < 8; tries++) {
        const it = p[kind]()
        if (items.some((x) => clashes(x.id, it.id))) continue
        items.push(it)
        break
      }
    }
    if (items.length !== k) continue
    // Past the plain share, each order has something beyond them
    if (out.length >= basic && items.every((it) => STARTING.has(it.id)))
      continue
    // Drinks first, as they are asked for, then the dishes
    items.sort((a, b) => Number(!a.drink) - Number(!b.drink))
    const want: Record<string, number> = {}
    const parts = items.map((it) => {
      const c = random()
      const n = it.many ? (c < 0.62 ? 1 : c < 0.88 ? 2 : 3) : 1
      want[it.id] = n
      return phrase(it, n)
    })
    const frames = FRAMES[k]
    const line = frames[Math.floor(random() * frames.length)](parts)
    const text = plain(line)
    if (seen.has(text)) continue
    seen.add(text)
    out.push({ line, want, voice: GUESTS[out.length % GUESTS.length] })
  }
  return out
}

export const DECK: Array<Order> = deck()

// Everything a guest says, with their voice: the orders and the thanks
export function tapasLines(): Array<{ voice: string; line: string }> {
  return [
    ...DECK.map((o) => ({ voice: o.voice, line: o.line })),
    ...GUESTS.map((voice) => ({ voice, line: THANKS[voice] })),
  ]
}

// --- A day at the bar ---

// Guests in a day, and drinks and dishes on its carta at most
export const GUESTS_A_DAY = 8
export const CARTA = 10
// A day with fewer guests than this is not opened
export const FEWEST = 4
// No drink or dish in more of a day's orders than this
const MOST = 3

export interface TapasDay {
  orders: Array<Order>
  // The carta: every drink and dish the orders ask for, and some more,
  // in the carta's order
  carta: Array<Item>
}

const things = (o: Order) => Object.keys(o.want)
const size = (o: Order) =>
  Object.values(o.want).reduce((sum, n) => sum + n, 0) + things(o).length

// The day's guests and carta, from the orders whose drinks and dishes
// have all been met, those whose sound has faded most first; or null
// with too few met
export function makeDay(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): TapasDay | null {
  const card = (id: string) => bank.cards[id]
  const faded = (id: string) => {
    const c = card(id)
    return c ? 1 - recall(c.oir, now) : 0
  }
  const open = DECK.filter((o) => things(o).every((id) => card(id)))
  const ranked = open
    .map((o) => {
      const ids = things(o)
      const fade = ids.reduce((sum, id) => sum + faded(id), 0) / ids.length
      return { o, score: fade + random() * 0.6 }
    })
    .sort((a, b) => b.score - a.score)
  const chosen: Array<Order> = []
  const on = new Set<string>()
  const used: Record<string, number> = {}
  const comes: Record<string, number> = {}
  // Each guest twice at most, if there are orders enough for it
  for (const twice of [true, false])
    for (const { o } of ranked) {
      if (chosen.length >= GUESTS_A_DAY) break
      if (chosen.includes(o)) continue
      if (twice && (comes[o.voice] ?? 0) >= 2) continue
      const ids = things(o)
      if (ids.some((id) => (used[id] ?? 0) >= MOST)) continue
      if (ids.some((id) => [...on].some((x) => x !== id && clashes(x, id))))
        continue
      const next = new Set([...on, ...ids])
      if (next.size > CARTA) continue
      chosen.push(o)
      comes[o.voice] = (comes[o.voice] ?? 0) + 1
      for (const id of ids) {
        on.add(id)
        used[id] = (used[id] ?? 0) + 1
      }
    }
  if (chosen.length < FEWEST) return null
  // More on the carta than is ordered, so that there is something to tell
  // apart: other drinks and dishes met, the faded first
  const more = ITEMS.filter((it) => card(it.id) && !on.has(it.id))
    .map((it) => ({ it, score: faded(it.id) + random() * 0.6 }))
    .sort((a, b) => b.score - a.score)
  for (const { it } of more) {
    if (on.size >= CARTA) break
    if ([...on].some((x) => clashes(x, it.id))) continue
    on.add(it.id)
  }
  // The smaller orders first, so a day starts gently, and no guest twice
  // in a row
  const orders = inTurn(
    shuffle(chosen, random).sort((a, b) => size(a) - size(b)),
  )
  return { orders, carta: ITEMS.filter((it) => on.has(it.id)) }
}

// Whether orders can follow each other with no guest twice in a row, the
// first not by `before`
function canFollow(orders: Array<Order>, before?: string): boolean {
  const n = orders.length
  const count: Record<string, number> = {}
  for (const o of orders) count[o.voice] = (count[o.voice] ?? 0) + 1
  return Object.entries(count).every(([v, c]) =>
    v === before ? c <= Math.floor(n / 2) : c <= Math.ceil(n / 2),
  )
}

// The orders as near their order as can be with no guest twice in a row
function inTurn(orders: Array<Order>): Array<Order> {
  const out: Array<Order> = []
  const rest = [...orders]
  while (rest.length) {
    const before = out.at(-1)?.voice
    let i = rest.findIndex(
      (o, j) =>
        o.voice !== before &&
        canFollow(
          rest.filter((_, k) => k !== j),
          o.voice,
        ),
    )
    // (with no way to keep them apart, the next as it comes)
    if (i < 0) i = 0
    out.push(...rest.splice(i, 1))
  }
  return out
}

// --- Serving ---

export interface Served {
  // Each thing asked for: how many were wanted, and how many are on the
  // tray
  lines: Array<{ id: string; want: number; got: number }>
  // Things on the tray that were not asked for
  extra: Array<string>
  right: boolean
}

export function check(o: Order, tray: Record<string, number>): Served {
  const lines = things(o).map((id) => ({
    id,
    want: o.want[id],
    got: tray[id] ?? 0,
  }))
  const extra = Object.keys(tray).filter((id) => !o.want[id] && tray[id])
  return {
    lines,
    extra,
    right: !extra.length && lines.every((l) => l.got === l.want),
  }
}

// Seconds a guest waits before the tip they leave goes down: three euros
// within the first, two within the second, one after, and never nothing.
// Twice as much for an order served by ear, without reading it.
export const PATIENCE = 15

export const coins = (seconds: number) =>
  seconds < PATIENCE ? 3 : seconds < 2 * PATIENCE ? 2 : 1

export const tipOf = (seconds: number, byEar: boolean) =>
  coins(seconds) * (byEar ? 2 : 1)

// The most a day can bring in tips
export const BEST_DAY = GUESTS_A_DAY * 3 * 2
