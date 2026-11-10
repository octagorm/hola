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
// faded (practice spaced out counts for more than practice crammed), and
// by more the easier the link has proved (its difficulty `d`, which a
// miss raises and a right answer lowers); a right answer never shortens
// it. A miss cuts it down, but a link held for long keeps more than one
// just learnt, as in FSRS. Games weigh their evidence: typing a word says
// more than picking its meaning from four, and a pick from fewer choices
// less than one from more, since it is more often a lucky guess (`luck`).
// These are FSRS's ideas fitted to games, not FSRS itself, which grades
// flashcards by hand. Each answer is logged on the card with the chance it
// was given (`log`), so that the numbers here can one day be checked
// against what was remembered. Tian does the same; keep the two alike.
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
  // Difficulty, 1–10 (5 middling): how slowly a right answer makes it
  // last longer. Links from before 2026-11-04 have none until next
  // answered, and it is then guessed from the word's misses (guessD)
  d?: number
  // Times forgotten once it held: a real miss (weight ½ or more) while
  // lasting KNOWN days or more. LEECH of them make the word one that keeps
  // slipping
  l?: number
  // Missed for real since last got right: not known, however long it
  // still lasts, so the Norwegian comes back until it is got right again
  f?: 1
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
  // The last LOG answers, oldest first
  log?: Array<LogEntry>
}

// An answer about one link: when (minutes since 1970), the link, the
// weight in tenths (negative for a miss), and the link's stability (days)
// and chance of remembering (%) just before. The chance beside what
// happened is what the numbers here can be checked against.
export type LogEntry = [min: number, how: Link, w: number, s: number, r: number]

export const LOG = 8

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
// A word just met lasts half a day: it is asked again the day after, when
// most of it is still there. (It was an hour until 2026-11-10, which left a
// new word nearly gone by the next day and asked for a review more of each.)
const FIRST = 0.5
const MIN = 0.02
export const KNOWN = 1.5

export type Level = 0 | 1 | 2

// The chance of remembering, now
export function recall(m: Memory, now: number): number {
  const days = Math.max(0, now - m.t) / DAY
  return 1 / (1 + days / (9 * m.s))
}

// A link known: lasting a day and a half or more, not faded much, and
// not missed since last got right
export const holds = (m: Memory, now: number) =>
  !m.f && m.s >= KNOWN && recall(m, now) >= 0.8

// A word missed this many times once it held keeps slipping (a leech, in
// FSRS's words): worth a closer look, or putting off
export const LEECH = 4

// Times the word's links were forgotten once they held: the most of them
export const lapses = (card: Card | undefined) =>
  card ? Math.max(...LINKS.map((l) => card[l].l ?? 0)) : 0

export const slipping = (card: Card | undefined) => lapses(card) >= LEECH

// Spanish alone once the written word brings back its meaning. A word from
// the starting point, never answered, is known or not as it was given: its
// memories were guessed at, and no time passing says she has forgotten it.
export function level(card: Card | undefined, now: number): Level {
  if (!card) return 0
  if (card.z) return card.leer.s >= KNOWN ? 2 : 1
  return holds(card.leer, now) ? 2 : 1
}

const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x))
const round3 = (n: number) => Math.round(n * 1000) / 1000

// How much a right answer grows a link of difficulty `d`, against a
// middling one: half as much again at 1, a little over a third at 10.
// FSRS's (11 − d), made gentler, since a game's answer says less than a
// flashcard graded by hand.
export const ease = (d: number) => (13 - d) / 8

// Difficulty after an answer, by its weight. A miss raises it a good deal
// and a right answer lowers it a little, so it settles at 5 for a link
// missed about one time in five.
export function nextD(d: number, right: boolean, weight: number): number {
  return right
    ? clamp(d - (0.6 * weight * (d - 1)) / 9, 1, 10)
    : clamp(d + (2 * weight * (10 - d)) / 9, 1, 10)
}

// The stability after a full miss, as FSRS has it: more is kept the longer
// it had lasted, and the more it had faded when missed (forgetting after
// a long while says less than forgetting soon). Never more than it had.
export function fallTo(s: number, r: number): number {
  const kept = 1.5 * (Math.pow(s + 1, 0.26) - 1) * Math.exp(1.6 * (1 - r))
  return clamp(kept, MIN, s)
}

// A link's difficulty from before difficulty was kept: from how often the
// word was missed, leaning on one in five while there are few answers
export function guessD(card: Card | undefined): number {
  const rate = ((card?.x ?? 0) + 0.4) / ((card?.n ?? 0) + 2)
  return round3(clamp(5 + 12 * (rate - 0.2), 1, 10))
}

// A memory after an answer. `weight` (0–1] is how much the answer says.
// `d` is the difficulty to go by when the memory has none yet.
export function answer(
  m: Memory,
  right: boolean,
  now: number,
  weight = 1,
  d = 5,
): Memory {
  const r = recall(m, now)
  const d0 = m.d ?? d
  const keep = m.l ? { l: m.l } : {}
  if (right) {
    const gain = Math.min(8, 1.1 + 15 * (1 - r))
    return {
      s: round3(m.s * (1 + (gain - 1) * weight * ease(d0))),
      t: now,
      d: round3(nextD(d0, true, weight)),
      ...keep,
    }
  }
  // A weak hint of a slip cuts it a little, a real miss down to what a
  // full miss leaves. A real miss also takes a known link back below
  // known until it is got right again, and counts as a lapse when the
  // link had held.
  const real = weight >= 0.5
  const lapse = real && !m.f && m.s >= KNOWN
  const s = m.s - (m.s - fallTo(m.s, r)) * weight
  return {
    s: round3(Math.max(MIN, s)),
    t: now,
    d: round3(nextD(d0, false, weight)),
    ...(lapse ? { l: (m.l ?? 0) + 1 } : keep),
    ...(real || m.f ? { f: 1 as const } : {}),
  }
}

// How much a right pick says, by how many choices it was picked from:
// the weights the games give are for four, a pick from two says a third
// less (half of them are luck), and one from more a little more. A miss
// says as much whatever the choices. Typed answers have no choices.
export function luck(weight: number, right: boolean, choices?: number) {
  if (!right || !choices || choices < 2) return weight
  return Math.min(1, (weight * (1 - 1 / choices)) / (1 - 1 / 4))
}

export const newCard = (now: number, s = FIRST): Card => ({
  leer: { s, t: now },
  decir: { s, t: now },
  t: now,
  n: 0,
  x: 0,
  i: now,
})

// A link whose memory was guessed at and never answered: given by the
// starting point, or by «Kan det». (A new word's links start at FIRST, and
// are no guess.)
const guessed = (card: Card, l: Link) =>
  card[l].t < card.i || (card[l].t === card.i && card[l].s >= 1)

// A card after an answer about some of its links. A link only guessed at
// starts its clock at the word's first answer, as nothing was known of it
// before: so a word from the starting point does not come out of its first
// answer with its other link long forgotten. And coming up with a word says
// it is understood too (the Spanish was read, or written), so a right
// answer about `decir` counts for `leer` as well; a miss says nothing of it.
export function answerCard(
  card: Card | undefined,
  links: Array<Link>,
  right: boolean,
  now: number,
  weight = 1,
): Card {
  const c = { ...(card ?? newCard(now)), t: now, n: (card?.n ?? 0) + 1 }
  delete c.z
  for (const l of LINKS)
    if (card && !links.includes(l) && guessed(card, l))
      c[l] = { ...c[l], t: now }
  if (right && links.includes('decir') && !links.includes('leer'))
    c.leer = answer(c.leer, true, now, weight, guessD(card))
  const log = [...(c.log ?? [])]
  for (const l of links) {
    const m = c[l]
    log.push([
      Math.round(now / 60_000),
      l,
      Math.round(weight * 10) * (right ? 1 : -1),
      Math.round(m.s * 100) / 100,
      Math.round(recall(m, now) * 100),
    ])
    c[l] = answer(m, right, now, weight, guessD(card))
  }
  if (!right) c.x++
  c.log = log.slice(-LOG)
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

// A day turns at three in the night, not at midnight (the user's choice),
// so that a session late in the evening is not cut in two, and one finished
// at half past twelve counts for the day it was begun
export const TURN = 3 * 3_600_000

// The day an instant belongs to, as a date on the player's clock at noon
const dayOf = (now: number) => {
  const d = new Date(now - TURN)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)
}

const keyOf = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const dayKey = (now: number) => keyOf(dayOf(now))

// Days in a row with points, up to today (or yesterday, if today has none
// yet). Counted by the calendar, so that a change to or from summer time
// neither skips a day nor counts one twice.
export function streak(bank: Bank, now: number): number {
  const d = dayOf(now)
  const back = () => d.setDate(d.getDate() - 1)
  let n = 0
  if (!bank.days[keyOf(d)]) back()
  while (bank.days[keyOf(d)]) {
    n++
    back()
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
    const c = !x ? y && heard(y) : !y ? heard(x) : both(heard(x), heard(y))
    out.cards[id] = c && settled(c)
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

// A card answered before a guessed link's clock started at the first answer
// (answerCard): such a link, never answered itself, is taken as last sure
// when the word was last answered, not when the starting point was given
function settled(card: Card): Card {
  if (card.z || !card.n) return card
  const c = { ...card }
  for (const l of LINKS)
    if (guessed(card, l) && card[l].t < card.t) c[l] = { ...card[l], t: card.t }
  return c
}

// The answers logged on either device, each once, the last LOG of them,
// the same whichever bank is merged into which
function bothLogs(x: Card, y: Card): Card['log'] {
  if (!x.log || !y.log) return x.log ?? y.log
  const seen = new Map<string, LogEntry>()
  for (const e of [...x.log, ...y.log]) {
    const k = `${e[0]} ${e[1]}`
    const had = seen.get(k)
    if (!had || JSON.stringify(e) > JSON.stringify(had)) seen.set(k, e)
  }
  return [...seen.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, e]) => e)
    .sort((a, b) => a[0] - b[0])
    .slice(-LOG)
}

function both(x: Card, y: Card): Card {
  if (x.z && !y.z) return y
  if (y.z && !x.z) return x
  // of two from starting points, the one given last
  if (x.z && y.z && x.i !== y.i) return x.i > y.i ? x : y
  const last = later(x, y, (c) => [c.n, c.x])
  const log = bothLogs(x, y)
  return {
    ...last,
    leer: later(x.leer, y.leer),
    decir: later(x.decir, y.decir),
    i: Math.min(x.i, y.i),
    ...(log ? { log } : {}),
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
