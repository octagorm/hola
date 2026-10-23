import { WORDS } from '../data/words.ts'
import { KNOWN_AT_START, PRACTISED_AT_START, START } from '../data/start.ts'
import type { Word } from '../data/words.ts'

// The word bank: what the player knows, shared by every game. A word is
// three things to remember, learnt apart:
//   leer   reading it: the written word brings back its meaning
//   oír    hearing it: the word said brings back its meaning
//   decir  saying it: the meaning brings back the Spanish, with its article
// Spanish is written as it sounds, so the link between the written word and
// its sound is rules, practised by ear and by reading, not a link of its
// own.
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

export type Link = 'leer' | 'oir' | 'decir'

export const LINKS: Array<Link> = ['leer', 'oir', 'decir']

export interface Memory {
  // Stability, in days
  s: number
  // Last answered, ms
  t: number
}

export interface Card {
  leer: Memory
  oir: Memory
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
  // The lesson chosen as the theme (data/themes.ts), whose words today's
  // chapter meets before the rest, and when it was chosen; '' for none
  theme: { id: string; t: number }
  // Lessons finished (lib/colecciones.ts), by id → when first finished: a
  // keepsake unwrapped and a picture hung stay so, whatever comes after
  kept: Record<string, number | undefined>
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
  theme: { id: '', t: 0 },
  kept: {},
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
  oir: { s, t: now },
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
// from `t`
const seeded = (t: number, s: Record<Link, number>): Card => ({
  leer: { s: s.leer, t },
  oir: { s: s.oir, t },
  decir: { s: s.decir, t },
  t: 0,
  n: 0,
  x: 0,
  i: t,
  z: 1,
})

// The starting point (data/start.ts), for a bank that has not had this
// version of it: cards for its words where the bank has none, so nothing
// learnt is touched. The known words last for weeks; those being practised
// a day or so, spread so that they do not all fade on the same day, with
// hearing and saying weaker than reading, and as if last practised half a
// day ago, so that they come before the known ones from the first day.
export function withStart(bank: Bank, now: number): Bank {
  if (bank.start >= START) return bank
  const cards = { ...bank.cards }
  for (const id of KNOWN_AT_START)
    cards[id] ??= seeded(now, { leer: 20, oir: 14, decir: 8 })
  for (const id of PRACTISED_AT_START) {
    const s = 0.5 + 0.9 * spread(id)
    cards[id] ??= seeded(now - DAY / 2, {
      leer: s,
      oir: s * 0.8,
      decir: s * 0.5,
    })
  }
  return { ...bank, cards, start: START }
}

// The chance of remembering a word's weakest link, now
export const recallOf = (card: Card, now: number) =>
  Math.min(...LINKS.map((l) => recall(card[l], now)))

// The link of a word that most needs practice: the most faded, or of
// links about as faded, any of them. `links` leaves some out, as hearing
// where the browser has no Spanish voice.
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

// The words in the order today's chapter meets them: the chosen theme's
// first, then the rest in lesson order
export function toMeet(bank: Bank): Array<Word> {
  const id = bank.theme.id
  if (!id) return WORDS
  return [
    ...WORDS.filter((w) => w.lesson === id),
    ...WORDS.filter((w) => w.lesson !== id),
  ]
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

// The keys of records that may be missing, as in a bank saved before
// they were added
const keysOf = (...rs: Array<object | undefined>) =>
  new Set(rs.flatMap((r) => (r ? Object.keys(r) : [])))

// Two banks made one, as when a backup is read in: for each link of a word
// the memory answered last (but never a card from the starting point over
// one with answers), for days, scores and lessons finished the larger, and
// of two days' sessions the later day's, or of the same day's the one
// further on, and of two themes the one chosen last. A bank saved before a
// field existed is read as having it empty.
export function merge(a: Partial<Bank>, b: Partial<Bank>): Bank {
  const out = emptyBank()
  for (const id of keysOf(a.cards, b.cards)) {
    const x = a.cards?.[id]
    const y = b.cards?.[id]
    out.cards[id] = !x ? y : !y ? x : both(x, y)
  }
  for (const k of [
    'days',
    'daily',
    'best',
    'palabra',
    'read',
    'kept',
  ] as const) {
    for (const id of keysOf(a[k], b[k]))
      out[k][id] = Math.max(a[k]?.[id] ?? 0, b[k]?.[id] ?? 0)
  }
  out.path = laterPath(a.path ?? null, b.path ?? null)
  out.start = Math.max(a.start ?? 0, b.start ?? 0)
  const ta = a.theme ?? out.theme
  const tb = b.theme ?? out.theme
  out.theme = tb.t > ta.t ? tb : ta
  return out
}

const later = (a: Memory, b: Memory) => (a.t >= b.t ? a : b)

function both(x: Card, y: Card): Card {
  if (x.z && !y.z) return y
  if (y.z && !x.z) return x
  const last = x.t >= y.t ? x : y
  return {
    ...last,
    leer: later(x.leer, y.leer),
    oir: later(x.oir, y.oir),
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
  return progress(b) > progress(a) ? b : a
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
  return { leer: mean('leer'), oir: mean('oir'), decir: mean('decir') }
}
