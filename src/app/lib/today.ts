import { LESSON, WORD, WORDS, isClue } from '../data/words.ts'
import { ALL_CHAPTERS, CHAPTER } from '../data/stories.ts'
import { GAME } from '../data/games.ts'
import { THEME } from '../data/themes.ts'
import {
  DAY,
  LINKS,
  counts,
  dayKey,
  due,
  recallOf,
  streak,
  toMeet,
  unmet,
} from './bank.ts'
import type { Word } from '../data/words.ts'
import type { Bank, Link, Path, PathStep, StepKind } from './bank.ts'

// Today's chapter: a session of about ten minutes, made once a day from
// the bank and kept in it (bank.path), so it can be taken up again where
// it was left, even halfway through a step. In order: the words that are
// fading, a few new ones, a game or a chapter of a story, and a little
// listening; then a summary, and a stamp in the credential.

export const STEP: Record<
  StepKind,
  { es: string; no: string; minutes: number }
> = {
  review: { es: 'Repaso', no: 'Repetisjon', minutes: 3 },
  new: { es: 'Palabras nuevas', no: 'Nye ord', minutes: 3 },
  game: { es: 'Juego', no: 'Ordspill', minutes: 3 },
  story: { es: 'Lectura', no: 'Lesning', minutes: 3 },
  listen: { es: 'Al oído', no: 'Lytting', minutes: 1 },
}

// Games the chapter picks from, one a day in turn, once enough words are
// met to make a round of them: for the crossword, the ring, the word
// search, the soft clock and the chain, words that can be clues
// (data/words.ts). Letras wants enough words met for its letters to hold a
// few of them; the chain, words enough that a chain of eight can be made of
// them, as it first can about here when they are met lesson by lesson (a
// new player has 288 from the start).
export const DAILY_GAMES = [
  'palabra',
  'cadaver',
  'crucigrama',
  'rosco',
  'sopa',
  'reloj',
  'porpara',
  'tiempos',
  'letras',
  'cadena',
  'elola',
  'orden',
  'tapas',
  'sonidos',
  'acento',
]
export const NEEDS: Record<string, number> = {
  palabra: 0,
  cadaver: 0,
  crucigrama: 12,
  rosco: 16,
  sopa: 12,
  reloj: 12,
  letras: 40,
  cadena: 210,
  // A round of either can be made from the start, since each sentence comes
  // with its Norwegian
  porpara: 0,
  tiempos: 0,
  // (the lessons in order have eight nouns met by then, for ¿El o la?)
  elola: 45,
  orden: 60,
  // The bar opens from the start, on the food and drink every bank begins
  // with (El Rastro is not a step of the chapter: it meets words of its own)
  tapas: 0,
  // Sonidos' ear round is made of its own pairs, each with its Norwegian;
  // Acento's first rule wants five words met of each stress, which the
  // lessons in order have by about here
  sonidos: 0,
  acento: 45,
}
const BY_CLUES = new Set(['crucigrama', 'rosco', 'sopa', 'reloj', 'cadena'])

// The words met that can be clues, with any about to be met
export const clueCount = (bank: Bank, extra: Array<Word> = []) =>
  WORDS.filter((w) => bank.cards[w.id])
    .concat(extra)
    .filter(isClue).length

// Whether a game can be made, from how many words are met and how many of
// them can be clues
export const ready = (game: string, met: number, clues: number) =>
  (BY_CLUES.has(game) ? clues : met) >= (NEEDS[game] ?? 0)

// Words to review: those fading, the most faded first
const REVIEW = 8
// Below this chance of remembering, a word is fading
export const FADING = 0.85
// Words heard in the listening step
export const LISTEN = 4

// Days since 1970 on the player's clock, to take turns by
export const dayNumber = (now: number) => {
  const d = new Date(now)
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY)
}

// The day's plan, made from the bank as it is now. `hear` is whether the
// browser has a Spanish voice; without one there is no listening.
export function plan(
  bank: Bank,
  now: number,
  { hear = true, perDay = 4 }: { hear?: boolean; perDay?: number } = {},
): Path {
  const list = due(bank, now)
  const fading = list.filter((d) => d.r < FADING)
  // At least a few words to warm up with, even when none are fading
  const review = (fading.length >= 4 ? fading : list.slice(0, 4))
    .slice(0, REVIEW)
    .map((d) => d.w)
  const newCount =
    list.length === 0
      ? 5
      : fading.length >= 20
        ? 2
        : fading.length >= 10
          ? 3
          : perDay
  const fresh = unmet(bank, toMeet(bank)).slice(0, newCount)
  const met = list.length + fresh.length
  const n = dayNumber(now)
  const chapter = ALL_CHAPTERS.find((c) => bank.read[c.id] === undefined)
  const clues = clueCount(bank, fresh)
  const games = DAILY_GAMES.filter((g) => ready(g, met, clues))
  // A chapter every other day, once there are words enough to read it by
  const reading = !!chapter && met >= 15
  const story = reading && n % 2 === 0
  // The games take turns over the days that have one: every other day
  // while there are chapters to read, so count those days alone
  const turn = reading ? Math.floor(n / 2) : n

  const steps: Array<PathStep> = []
  if (review.length)
    steps.push({
      k: 'review',
      ids: review.map((w) => w.id),
      // none fading: a warm-up with the words most faded
      ...(fading.length >= 4 ? {} : { arg: 'warm' }),
    })
  if (fresh.length) steps.push({ k: 'new', ids: fresh.map((w) => w.id) })
  if (story) steps.push({ k: 'story', arg: chapter.id })
  else steps.push({ k: 'game', arg: games[turn % games.length] })
  if (hear && met >= LISTEN) steps.push({ k: 'listen' })

  // How long each link of the words practised lasted before
  const s0: Record<string, number> = {}
  for (const w of review) {
    const c = bank.cards[w.id]
    if (c) for (const l of LINKS) s0[partKey(w.id, l)] = c[l].s
  }
  const c = counts(bank, now)
  return { d: dayKey(now), t: now, steps, met: c.met, known: c.known, s0 }
}

// The day's plan with its new words taken from a theme just chosen, if
// none of them has been begun on
export function retheme(p: Path, bank: Bank): Path {
  const i = p.steps.findIndex((s) => s.k === 'new')
  if (i < 0) return p
  const s = p.steps[i]
  if (s.done || s.got?.length) return p
  const ids = unmet(bank, toMeet(bank))
    .slice(0, s.ids?.length ?? 0)
    .map((w) => w.id)
  return { ...p, steps: p.steps.map((x, j) => (j === i ? { ...x, ids } : x)) }
}

// The lesson all of a step's words are from, if they are from one
export function lessonOf(ids: Array<string>): string | undefined {
  const lessons = new Set(ids.map((id) => WORD[id]?.lesson))
  const [only] = lessons
  return lessons.size === 1 ? only : undefined
}

// The day's plan if one has been made today
export const todays = (bank: Bank, now: number): Path | null =>
  bank.path && bank.path.d === dayKey(now) ? bank.path : null

// The step to do next, or -1 when all are done
export const current = (p: Path) => p.steps.findIndex((s) => !s.done)

export const finished = (p: Path) => p.steps.every((s) => s.done)

export const markDone = (
  p: Path,
  i: number,
  now: number,
  skip = false,
): Path => ({
  ...p,
  steps: p.steps.map((s, j) =>
    j === i ? { ...s, done: s.done ?? now, ...(skip ? { skip } : {}) } : s,
  ),
})

// The steps played in Today itself keep what has been answered in `got`,
// so they can be left at any point and taken up again. Review keeps each
// word answered; new words each word met and its two questions ("el gato
// met", "el gato leer", "el gato oir"); listening each word heard.

export const playedHere = (s: PathStep) =>
  s.k === 'review' || s.k === 'new' || s.k === 'listen'

export const partKey = (id: string, part: string) => `${id} ${part}`

export const NEW_PARTS = ['met', 'leer', 'oir'] as const

// A step's parts answered, of how many (of the words still in the list)
export function progressOf(s: PathStep): { done: number; of: number } {
  const got = new Set(s.got)
  if (s.k === 'listen') return { done: Math.min(got.size, LISTEN), of: LISTEN }
  const ids = (s.ids ?? []).filter((id) => WORD[id])
  const keys =
    s.k === 'review'
      ? ids
      : s.k === 'new'
        ? ids.flatMap((id) => NEW_PARTS.map((p) => partKey(id, p)))
        : []
  return { done: keys.filter((k) => got.has(k)).length, of: keys.length }
}

// How much of a step is done, 0–1
export function share(s: PathStep): number {
  if (s.done) return 1
  const { done, of } = progressOf(s)
  return of ? done / of : 0
}

// The plan with one more thing answered in a step
export function gain(p: Path, i: number, key: string): Path {
  const s = p.steps[i]
  if (s.got?.includes(key)) return p
  return {
    ...p,
    steps: p.steps.map((x, j) =>
      j === i ? { ...s, got: [...(s.got ?? []), key] } : x,
    ),
  }
}

export interface Summary {
  // The words reviewed, each by its link that grew most, and how long that
  // will now last, in days, before and after
  words: Array<{ id: string; link: Link; before: number; after: number }>
  met: number
  known: number
  metGain: number
  knownGain: number
  streak: number
  points: number
  // Words that will be fading by this time tomorrow
  tomorrow: number
}

export function summary(p: Path, bank: Bank, now: number): Summary {
  const ids = p.steps.find((s) => s.k === 'review')?.ids ?? []
  const words = ids.flatMap((id) => {
    const c = bank.cards[id]
    if (!c) return []
    const each = LINKS.flatMap((link) => {
      const before = p.s0[partKey(id, link)]
      return before === undefined
        ? []
        : [{ id, link, before, after: c[link].s }]
    })
    if (!each.length) return []
    return [
      each.reduce((a, b) => (b.after / b.before > a.after / a.before ? b : a)),
    ]
  })
  const { met, known } = counts(bank, now)
  const tomorrow = WORDS.filter((w) => {
    const c = bank.cards[w.id]
    return c && recallOf(c, now + DAY) < FADING
  }).length
  return {
    words,
    met,
    known,
    metGain: Math.max(0, met - p.met),
    knownGain: Math.max(0, known - p.known),
    streak: streak(bank, now),
    points: bank.days[dayKey(now)] ?? 0,
    tomorrow,
  }
}

// How long a word's memory lasts, said shortly: the time until it starts
// to fade
export function lasts(s: number): string {
  // Recall falls to FADING after 9s(1/FADING − 1) days
  const days = 9 * s * (1 / FADING - 1)
  if (days < 1 / 24) return 'minutter'
  if (days < 1) return `${Math.max(1, Math.round(days * 24))} t`
  if (days < 60) return `${Math.round(days)} d`
  return `${Math.round(days / 30)} mnd`
}

// Days whose chapter was finished: the stages walked
export const stagesWalked = (bank: Bank) =>
  Object.values(bank.daily).filter(Boolean).length

// --- Said in words, for the chapter's heading ---

const NUMBERS = [
  'null',
  'en',
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
  'tretten',
  'fjorten',
  'femten',
]

// A number in words, for a noun that is neuter (ett ord) or not (en del)
export const inWords = (n: number, neuter = false) =>
  n === 1 && neuter ? 'ett' : (NUMBERS[n] ?? String(n))

export const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// a, b og c
export const listOf = (xs: Array<string>) =>
  xs.length <= 1
    ? (xs[0] ?? '')
    : `${xs.slice(0, -1).join(', ')} og ${xs[xs.length - 1]}`

export const minutesOf = (p: Path) =>
  p.steps.reduce((n, s) => n + STEP[s.k].minutes, 0)

// «Ti minutter, fire deler»
export function chapterTitle(p: Path): string {
  const n = p.steps.length
  return `${capital(inWords(minutesOf(p)))} minutter, ${n === 1 ? 'én del' : `${inWords(n)} deler`}`
}

// What the reader does in the day's chapter, as Cervantes heads his
// chapters: «Hvori leseren henter tilbake seks ord som har bleknet, …»
export function chapterLine(p: Path): string {
  const reviewed = p.steps.some((s) => s.k === 'review')
  const parts = p.steps.map((s) => {
    const n = s.ids?.length ?? 0
    switch (s.k) {
      case 'review':
        return s.arg === 'warm'
          ? `varmer opp med ${inWords(n, true)} ord`
          : `henter tilbake ${inWords(n, true)} ord som har bleknet`
      case 'new': {
        const lesson = LESSON[lessonOf(s.ids ?? []) ?? '']
        const from = lesson && THEME[lesson.id] ? ` fra «${lesson.no}»` : ''
        return `møter ${inWords(n, true)} nye${reviewed ? '' : ' ord'}${from}`
      }
      case 'game':
        return GAME[s.arg ?? '']?.doing ?? 'spiller et ordspill'
      case 'story': {
        const c = CHAPTER[s.arg ?? '']?.chapter
        return c ? `leser kapittelet «${c.no}»` : 'leser et kapittel'
      }
      case 'listen':
        return `hører ${inWords(LISTEN, true)} av dem uttalt`
    }
  })
  return `Hvori leseren ${listOf(parts)}.`
}
