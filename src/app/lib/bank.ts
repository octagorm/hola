import { TAUGHT, WORDS } from '../data/words.ts'
import { LEVELS, START, THEMES_AT_START } from '../data/start.ts'
import type { StartLevel } from '../data/start.ts'
import type { Word } from '../data/words.ts'

// The word bank: what the player knows, shared by every game. A word is
// two things to remember, learnt apart, input and output:
//   leer   understanding it (Entender): the word, read or heard, brings
//          back its meaning
//   decir  coming up with it (Recordar): the meaning brings back the
//          Spanish, with its article
// Spanish is written as it sounds, so a word read and a word heard are one
// thing to remember: the ear games and the reading both practise `leer`.
// (Hearing was once a link of its own, `oir`; a card saved with it is read
// with the better of the two as `leer`, in merge.) The names are the
// links' first ones, kept so that every bank saved still reads.
//
// Each link of a word met has a memory, in the manner of FSRS: the
// stability `s` is how many days until the chance of remembering it falls
// to 90 %. A right answer makes it last longer, by more the more it had
// faded (practice spaced out counts for more than practice crammed); a
// wrong one cuts it down. Games weigh their evidence: typing a word says
// more than picking its meaning from four.
//
// How a word is shown in mixed text follows from reading it: not met yet,
// in Norwegian; met, in Spanish with the Norwegian over it; known (read
// with ease for a day and a half or more, and not faded much), in Spanish
// alone.

export type Link = 'leer' | 'decir'

export const LINKS: Array<Link> = ['leer', 'decir']

export interface Memory {
  // Stability, in days
  s: number
  // Last answered, ms
  t: number
}

export interface Card {
  leer: Memory
  decir: Memory
  // Last seen, ms
  t: number
  // Times answered, and of those wrong
  n: number
  x: number
  // Met, ms
  i: number
  // Given by the starting point and never answered since (withStart): it
  // says nothing of what the player remembers, so in a merge a card with
  // answers wins over it, however old
  z?: 1
}

export interface Bank {
  cards: Record<string, Card | undefined>
  // Points by day, "2026-10-15" → points
  days: Record<string, number | undefined>
  // Days whose chapter (Today) was finished, "2026-10-16" → 1: each is a
  // stage of the Camino in the credential
  daily: Record<string, number | undefined>
  // Best scores, by game
  best: Record<string, number | undefined>
  // The day's word in La palabra, by day: the guesses it took, 0 if lost
  palabra: Record<string, number | undefined>
  // Chapters of the stories read, by id: the questions got right, of three
  read: Record<string, number | undefined>
  // Today's chapter (lib/today.ts): the plan for one day, and how far it
  // has got
  path: Path | null
  // The version of the starting point given (data/start.ts), 0 for none
  start: number
  // The starting point chosen (LEVELS in data/start.ts), and when; 1, at
  // 0, is the one given to begin with
  base: { l: StartLevel; t: number }
  // Notices shown once and put away, by name → when (the starting point's
  // on the home page: 'start')
  seen: Record<string, number | undefined>
  // The lessons chosen as themes (data/themes.ts), as many as wanted, in
  // the order chosen, each with its priority (1–3), whose words today's
  // chapter meets before the rest, and when the choice was last changed
  theme: { on: Array<ThemeChoice>; t: number }
  // Lessons finished (lib/colecciones.ts), by id → when first finished: a
  // picture hung stays so, whatever comes after
  kept: Record<string, number | undefined>
  // How far each text in the library (data/biblioteca.ts) is read, by id
  place: Record<string, Place | undefined>
  // Words put off when they came up as new («Utsett til senere»), by id → when.
  // They are met last, after every other word, for LATER days (toMeet)
  later: Record<string, number | undefined>
}

export interface ThemeChoice {
  id: string
  p: 1 | 2 | 3
}

export interface Place {
  // The paragraph read up to, from 0
  p: number
  // The word in it, from 0
  w?: number
  // When, ms
  t: number
  // Read to the end, ms: once
  done?: number
}

export type StepKind = 'review' | 'new' | 'game' | 'story' | 'listen'

// One day's session: made on the day's first visit to Today, kept so it
// can be taken up again where it was left
export interface Path {
  // The day, "2026-10-16"
  d: string
  // Started, ms
  t: number
  steps: Array<PathStep>
  // Words met and known when it started, and the stability of each link
  // of the words it practises ("el gato leer"), for the summary
  met: number
  known: number
  s0: Record<string, number | undefined>
}

export interface PathStep {
  k: StepKind
  // The words it is about (review, new)
  ids?: Array<string>
  // A game or a chapter, by id
  arg?: string
  // What a step played in Today itself has had answered so far, so it
  // can be left at any point and taken up again
  got?: Array<string>
  // Done or skipped, ms
  done?: number
  skip?: boolean
}

export const emptyBank = (): Bank => ({
  cards: {},
  days: {},
  daily: {},
  best: {},
  palabra: {},
  read: {},
  path: null,
  start: 0,
  base: { l: 1, t: 0 },
  seen: {},
  theme: { on: [], t: 0 },
  kept: {},
  place: {},
  later: {},
})

export const DAY = 86_400_000
const FIRST = 0.05 // about an hour
const MIN = 0.02
export const KNOWN = 1.5

export type Level = 0 | 1 | 2

// The chance of remembering, now
export function recall(m: Memory, now: number): number {
  const days = Math.max(0, now - m.t) / DAY
  return 1 / (1 + days / (9 * m.s))
}

// A link known: lasting a day and a half or more, and not faded much
export const holds = (m: Memory, now: number) =>
  m.s >= KNOWN && recall(m, now) >= 0.8

// Spanish alone once the written word brings back its meaning
export function level(card: Card | undefined, now: number): Level {
  if (!card) return 0
  return holds(card.leer, now) ? 2 : 1
}

// A memory after an answer. `weight` (0–1] is how much the answer says.
export function answer(
  m: Memory,
  right: boolean,
  now: number,
  weight = 1,
): Memory {
  const r = recall(m, now)
  if (right) {
    const gain = Math.min(8, 1.1 + 15 * (1 - r))
    return { s: m.s * (1 + (gain - 1) * weight), t: now }
  }
  // A real slip (not a weak hint of one) also takes a known link back
  // below known, until it has been got right again
  const cut = m.s * (1 - 0.7 * weight)
  return {
    s: Math.max(MIN, weight >= 0.5 ? Math.min(cut, KNOWN * 0.6) : cut),
    t: now,
  }
}

export const newCard = (now: number, s = FIRST): Card => ({
  leer: { s, t: now },
  decir: { s, t: now },
  t: now,
  n: 0,
  x: 0,
  i: now,
})

// A card after an answer about some of its links
export function answerCard(
  card: Card | undefined,
  links: Array<Link>,
  right: boolean,
  now: number,
  weight = 1,
): Card {
  const c = { ...(card ?? newCard(now)), t: now, n: (card?.n ?? 0) + 1 }
  delete c.z
  if (!right) c.x++
  for (const l of links) c[l] = answer(c[l], right, now, weight)
  return c
}

// Words the player says they know already: straight to known
export const known = (now: number): Card => ({ ...newCard(now, 4), n: 1 })

// A number from 0 to 1 for a word, the same every time (FNV-1a)
function spread(id: string): number {
  let h = 0x811c9dc5
  for (const ch of id) h = Math.imul(h ^ (ch.codePointAt(0) ?? 0), 0x01000193)
  return (h >>> 0) / 2 ** 32
}

// A card from the starting point, never seen: each link lasting `s` days
// from `t`, given at `i`
const seeded = (t: number, s: Record<Link, number>, i = t): Card => ({
  leer: { s: s.leer, t },
  decir: { s: s.decir, t },
  t: 0,
  n: 0,
  x: 0,
  i,
  z: 1,
})

// A known word from the starting point lasts for weeks
const seedKnown = (now: number) => seeded(now, { leer: 20, decir: 8 })

// A word being practised is understood for a week or so, so read without
// the Norwegian, but coming up with it lasts only half a day or so, spread
// so that they do not all fade on the same day, and as if last practised
// half a day ago, so that they come before the known ones from the first
// day
const seedPractised = (id: string, now: number) =>
  seeded(
    now - DAY / 2,
    { leer: 3 + 3 * spread(id), decir: 0.25 + 0.45 * spread(id) },
    now,
  )

// What a starting point gives each of its words
function startOf(l: StartLevel): Map<string, 'known' | 'practised'> {
  const start = LEVELS.find((x) => x.level === l) ?? LEVELS[1]
  const out = new Map<string, 'known' | 'practised'>()
  for (const id of start.practised) out.set(id, 'practised')
  for (const id of start.known) out.set(id, 'known')
  return out
}

// The starting point chosen (data/start.ts), for a bank that has not had
// this version of it: cards for its words where the bank has none, so
// nothing learnt is touched. A bank given the first starting point, when
// the words practised were not yet understood, has those never answered
// since understood from now.
export function withStart(bank: Bank, now: number): Bank {
  if (bank.start >= START) return bank
  const cards = { ...bank.cards }
  for (const [id, as] of startOf(bank.base.l)) {
    const c = cards[id]
    if (as === 'known') cards[id] ??= seedKnown(now)
    else if (!c) cards[id] = seedPractised(id, now)
    else if (c.z && c.leer.s < KNOWN)
      cards[id] = { ...c, leer: { s: seedPractised(id, now).leer.s, t: now } }
  }
  // Themes never chosen (t is 0) are the starting ones, still at 0, so
  // that any choice made since wins in a merge
  const theme =
    bank.theme.t || bank.theme.on.length
      ? bank.theme
      : { on: THEMES_AT_START.map((x) => ({ ...x })), t: 0 }
  return { ...bank, cards, theme, start: START }
}

// A word given by a starting point and never answered: only these does
// another starting point change
const fromStart = (card: Card | undefined) => !card || !!card.z

// Another starting point chosen, in a bank already in use: the words
// never answered take what it gives them, or are not met if it gives them
// nothing, while every word answered, or marked as known, stays as it is
export function startAt(bank: Bank, l: StartLevel, now: number): Bank {
  const start = startOf(l)
  const cards = { ...bank.cards }
  for (const w of WORDS) {
    if (!fromStart(cards[w.id])) continue
    const as = start.get(w.id)
    if (as === 'known') cards[w.id] = seedKnown(now)
    else if (as === 'practised') cards[w.id] = seedPractised(w.id, now)
    else delete cards[w.id]
  }
  return { ...bank, cards, base: { l, t: now }, start: START }
}

// What choosing a starting point would do: the words it would make known
// and practised, and those answered that it leaves alone
export function startPreview(bank: Bank, l: StartLevel) {
  const start = startOf(l)
  let made = 0
  let practised = 0
  let kept = 0
  for (const w of WORDS) {
    const c = bank.cards[w.id]
    if (!fromStart(c)) {
      kept++
      continue
    }
    const as = start.get(w.id)
    if (as === 'known') made++
    else if (as === 'practised') practised++
  }
  return { known: made, practised, kept }
}

// The chance of remembering a word's weakest link, now
export const recallOf = (card: Card, now: number) =>
  Math.min(...LINKS.map((l) => recall(card[l], now)))

// The link of a word that most needs practice: the most faded, or of
// links about as faded, any of them. `links` leaves some out.
export function weakest(
  card: Card,
  now: number,
  random: () => number = Math.random,
  links: Array<Link> = LINKS,
): Link {
  const by = links.map((l) => ({ l, r: recall(card[l], now) + random() * 0.1 }))
  return by.reduce((a, b) => (b.r < a.r ? b : a)).l
}

export const dayKey = (now: number) => {
  const d = new Date(now)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Days in a row with points, up to today (or yesterday, if today has none
// yet)
export function streak(bank: Bank, now: number): number {
  let n = 0
  let t = now
  if (!bank.days[dayKey(t)]) t -= DAY
  while (bank.days[dayKey(t)]) {
    n++
    t -= DAY
  }
  return n
}

// The words met, by how much they need practice: the faded first. By how
// faded one of their links is, or else the weakest.
export function due(
  bank: Bank,
  now: number,
  words: Array<Word> = WORDS,
  link?: Link,
) {
  return words
    .filter((w) => bank.cards[w.id])
    .map((w) => {
      const c = bank.cards[w.id] as Card
      return { w, r: link ? recall(c[link], now) : recallOf(c, now), c }
    })
    .sort((a, b) => a.r - b.r)
}

// The next words to meet, in lesson order
export const unmet = (bank: Bank, words: Array<Word> = WORDS) =>
  words.filter((w) => !bank.cards[w.id])

// How many words are learnt at a time: once this many met are not yet
// known, Hola brings no new ones by itself (today's new words, and the
// games' words found by chance), until some of them hold. What the
// player picks to learn (a word's «Øv på det») is let through, and so
// are the words a game cannot be played without (El Rastro's list, the
// taxi's way). The starting point's words count only once answered. The
// player sets it under Innstillinger (`cap`); the store passes it on
// here, so that every game asks the same. Tian does the same.
export const CAPS = [30, 50, 80]
let cap = 50
export const setCap = (n: number) => {
  cap = n
}

// Words met and answered, and not yet known
export function inWork(bank: Bank, now: number): number {
  let n = 0
  for (const c of Object.values(bank.cards))
    if (c && !c.z && level(c, now) < 2) n++
  return n
}

// How many new words may be met now
export const room = (bank: Bank, now: number, of = cap) =>
  Math.max(0, of - inWork(bank, now))

// Words put off come back to their place after this many days
const LATER = 30

// The words to meet in order (byTheme), those put off lately last
export function toMeet(bank: Bank, now = Date.now()): Array<Word> {
  const put = (w: Word) => now - (bank.later[w.id] ?? -Infinity) < LATER * DAY
  const order = byTheme(bank)
  return [...order.filter((w) => !put(w)), ...order.filter(put)]
}

// The words in the order today's chapter meets them: those not met of the
// chosen themes first, in rounds of as many from each as its priority, so
// that a day's new words come from all of them, then the rest in lesson
// order
function byTheme(bank: Bank): Array<Word> {
  const on = bank.theme.on
  if (!on.length) return TAUGHT
  const lists = on.map((x) => ({
    p: x.p,
    ws: TAUGHT.filter((w) => w.lesson === x.id && !bank.cards[w.id]),
    at: 0,
  }))
  const first: Array<Word> = []
  while (lists.some((l) => l.at < l.ws.length))
    for (const l of lists)
      for (let n = 0; n < l.p && l.at < l.ws.length; n++)
        first.push(l.ws[l.at++])
  const ids = on.map((x) => x.id)
  return [...first, ...TAUGHT.filter((w) => !ids.includes(w.lesson))]
}

// The themes chosen in a bank as saved: before priorities they were a list
// of ids, and before several could be chosen one, as { id, t }; each of
// those is read as priority 1
function themesOf(x: unknown): Bank['theme'] | null {
  if (!x || typeof x !== 'object') return null
  const o = x as { on?: unknown; ids?: unknown; id?: unknown; t?: unknown }
  const t = typeof o.t === 'number' ? o.t : 0
  const one = (id: unknown): Array<ThemeChoice> =>
    typeof id === 'string' && id ? [{ id, p: 1 }] : []
  if (Array.isArray(o.on))
    return {
      on: o.on.flatMap((c: { id?: unknown; p?: unknown } | null) =>
        c && typeof c.id === 'string' && [1, 2, 3].includes(c.p as number)
          ? [{ id: c.id, p: c.p as ThemeChoice['p'] }]
          : [],
      ),
      t,
    }
  if (Array.isArray(o.ids)) return { on: o.ids.flatMap(one), t }
  return { on: one(o.id), t }
}

// Words for a round of a game: up to `n` of them, weighted towards those
// that need practice (in the `link` the game asks about, if it asks about
// one), among the words met that `fit`. Words seen in the last minute are
// left to last.
export function pick(
  bank: Bank,
  n: number,
  now: number,
  {
    fit = () => true,
    link,
    random = Math.random,
  }: {
    fit?: (w: Word) => boolean
    link?: Link
    random?: () => number
  } = {},
): Array<Word> {
  return due(bank, now, WORDS, link)
    .filter(({ w }) => fit(w))
    .map(({ w, r, c }) => ({
      w,
      score: 1 - r + random() * 0.35 - (now - c.t < 60_000 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((s) => s.w)
}

// JSON with each object's keys in order, so that two tabs or devices
// holding the same bank write the same text
export const stable = (value: unknown): string =>
  JSON.stringify(value, (_, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
        )
      : v,
  )

// Whether two banks hold the same, whatever the order of their keys
export const same = (a: Partial<Bank>, b: Partial<Bank>) =>
  stable(merge(a, emptyBank())) === stable(merge(b, emptyBank()))

// The keys of records that may be missing, as in a bank saved before
// they were added
const keysOf = (...rs: Array<object | undefined>) =>
  new Set(rs.flatMap((r) => (r ? Object.keys(r) : [])))

// Two banks made one, as when a backup is read in: for each link of a word
// the memory answered last (but never a card from the starting point over
// one with answers), for days, scores and lessons finished the larger, and
// of two days' sessions the later day's, or of the same day's the one
// further on, and of two choices of themes the one made last. A bank saved before a
// field existed is read as having it empty. Of two places in a text, the
// later is kept, and a text once read to the end stays so. Of two as late
// as each other, the same one is kept whichever bank is merged into which,
// so that two devices merging each other's copy agree, and do not save
// their own over the other's for ever.
export function merge(a: Partial<Bank>, b: Partial<Bank>): Bank {
  const out = emptyBank()
  for (const id of keysOf(a.cards, b.cards)) {
    const x = a.cards?.[id]
    const y = b.cards?.[id]
    out.cards[id] = !x
      ? y && heard(y)
      : !y
        ? heard(x)
        : both(heard(x), heard(y))
  }
  for (const k of [
    'days',
    'daily',
    'best',
    'palabra',
    'read',
    'kept',
    'seen',
    'later',
  ] as const) {
    for (const id of keysOf(a[k], b[k]))
      out[k][id] = Math.max(a[k]?.[id] ?? 0, b[k]?.[id] ?? 0)
  }
  // A word put off, on either device, since it was last seen is not met
  for (const id of keysOf(out.later)) {
    const c = out.cards[id]
    if (c && (out.later[id] ?? 0) >= c.t) delete out.cards[id]
  }
  out.path = laterPath(a.path ?? null, b.path ?? null)
  out.start = Math.max(a.start ?? 0, b.start ?? 0)
  out.base = later(baseOf(a.base), baseOf(b.base))
  // A word the starting point gave before another was chosen, and the new
  // one does not give, is not met (as it was taken out where it was chosen)
  if (out.base.t) {
    const start = startOf(out.base.l)
    for (const [id, c] of Object.entries(out.cards))
      if (c?.z && c.i < out.base.t && !start.has(id)) delete out.cards[id]
  }
  for (const id of keysOf(a.place, b.place)) {
    const x = a.place?.[id]
    const y = b.place?.[id]
    const last = !x ? y : !y ? x : later(x, y, (l) => [l.p, l.w ?? -1])
    const done = Math.max(x?.done ?? 0, y?.done ?? 0)
    if (last) out.place[id] = done ? { ...last, done } : last
  }
  const ta = themesOf(a.theme) ?? out.theme
  const tb = themesOf(b.theme) ?? out.theme
  out.theme = later(ta, tb)
  return out
}

function baseOf(x: unknown): Bank['base'] {
  const o = (x ?? {}) as { l?: unknown; t?: unknown }
  return [0, 1, 2, 3].includes(o.l as number) && typeof o.t === 'number'
    ? { l: o.l as StartLevel, t: o.t }
    : { l: 1, t: 0 }
}

// Of two things, the one answered or changed later, and of two as late,
// the one whose text (of what `by` takes from it) sorts last
function later<T extends { t: number }>(
  x: T,
  y: T,
  by: (v: T) => unknown = (v) => v,
): T {
  if (x.t !== y.t) return x.t > y.t ? x : y
  return stable(by(x)) >= stable(by(y)) ? x : y
}

// A card saved when hearing was a link of its own: understanding is the
// better of reading and hearing, the one that would hold better a week
// after the later of them was answered
function heard(card: Card & { oir?: Memory }): Card {
  const { oir, ...c } = card
  if (!oir) return card
  const t = Math.max(oir.t, c.leer.t) + 7 * DAY
  return recall(oir, t) > recall(c.leer, t) ? { ...c, leer: oir } : c
}

function both(x: Card, y: Card): Card {
  if (x.z && !y.z) return y
  if (y.z && !x.z) return x
  // of two from starting points, the one given last
  if (x.z && y.z && x.i !== y.i) return x.i > y.i ? x : y
  const last = later(x, y, (c) => [c.n, c.x])
  return {
    ...last,
    leer: later(x.leer, y.leer),
    decir: later(x.decir, y.decir),
    i: Math.min(x.i, y.i),
  }
}

// How far a session has got: its steps done, then the answers in the rest
const progress = (p: Path) =>
  p.steps.reduce((n, s) => n + (s.done ? 1000 : (s.got?.length ?? 0)), 0)

function laterPath(a: Path | null, b: Path | null): Path | null {
  if (!a || !b) return a ?? b
  if (a.d !== b.d) return a.d > b.d ? a : b
  if (progress(a) !== progress(b)) return progress(a) > progress(b) ? a : b
  return stable(a) >= stable(b) ? a : b
}

// Words met and known, of all
export function counts(bank: Bank, now: number) {
  let met = 0
  let held = 0
  for (const w of WORDS) {
    const lv = level(bank.cards[w.id], now)
    if (lv > 0) met++
    if (lv === 2) held++
  }
  return { met, known: held, all: WORDS.length }
}

// How well each link holds over the words met: the mean chance of
// remembering, 0–1, or null with none met
export function linkShares(
  bank: Bank,
  now: number,
): Record<Link, number | null> {
  const cards = WORDS.flatMap((w) => {
    const c = bank.cards[w.id]
    return c ? [c] : []
  })
  const mean = (l: Link) =>
    cards.length
      ? cards.reduce((sum, c) => sum + recall(c[l], now), 0) / cards.length
      : null
  return { leer: mean('leer'), decir: mean('decir') }
}
