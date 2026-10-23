import { WORDS, gloss } from '../data/words.ts'
import { recall } from './bank.ts'
import { letters, plural } from './spanish.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// Letras, after the round of letters in «Cifras y letras» on Spanish TV:
// nine letters, drawn one at a time as the player asks for a vowel or a
// consonant, and the longest word she can make of them, each letter used
// once. Hola's words count, and their plurals and an adjective's other
// forms; accents do not matter, but Ñ is a letter of its own.
//
// The draw is fair: it picks a word she has met first and brings its
// letters as she asks, so that there is always a good word to find.

export const SIZE = 9
export const ROUNDS = 3

export type Ask = 'v' | 'c'

// At least three vowels and four consonants: so at most five vowels and
// six consonants are asked for
export const MOST: Record<Ask, number> = { v: 5, c: 6 }
const LEAST: Record<Ask, number> = { v: SIZE - MOST.c, c: SIZE - MOST.v }

export const askOf = (c: string): Ask => ('AEIOU'.includes(c) ? 'v' : 'c')

// How often each letter comes in Spanish, in per cent, for letters drawn
// beyond the word the draw is sure of. Q and X are made rarer, since they
// make few words, and K and W, which Hola's words have none of, never come.
const FREQ: Record<string, number> = {
  E: 13.7,
  A: 12.5,
  O: 8.7,
  I: 6.3,
  U: 3.9,
  S: 8,
  R: 6.9,
  N: 6.7,
  D: 5.9,
  L: 5,
  C: 4.7,
  T: 4.6,
  M: 3.2,
  P: 2.5,
  B: 1.4,
  G: 1,
  V: 0.9,
  Y: 0.9,
  H: 0.7,
  F: 0.7,
  Z: 0.5,
  J: 0.4,
  Ñ: 0.4,
  Q: 0.3,
  X: 0.1,
}

export const ALPHABET = Object.keys(FREQ)

// --- The words that count ---

export interface Form {
  // As written, accents and all: 'ventanas'
  es: string
  // Its letters, as the blocks show them: 'VENTANAS'
  key: string
  // The word in the bank it is a form of
  w: Word
  // The word itself, its plural, or an adjective's feminine (roja) or
  // feminine plural (rojas)
  form: 'word' | 'pl' | 'f' | 'fpl'
  // What is said for it: a noun with its article, as Hola says nouns
  say: string
}

export function formsOf(w: Word): Array<Form> {
  if (w.bare.includes(' ')) return []
  const out: Array<Form> = []
  const add = (es: string, form: Form['form'], say = es) =>
    out.push({ es, key: letters(es), w, form, say })
  add(w.bare, 'word', w.es)
  // (no plural for a name: Alhambra, Guggenheim)
  if (w.pos === 'n' && !w.pl && w.bare === w.bare.toLowerCase()) {
    const p = plural(w.bare)
    add(p, 'pl', `${w.g === 'f' ? 'las' : 'los'} ${p}`)
  }
  if (w.pos === 'adj') {
    add(plural(w.bare), 'pl')
    if (w.bare.endsWith('o')) {
      const stem = w.bare.slice(0, -1)
      add(`${stem}a`, 'f')
      add(`${stem}as`, 'fpl')
    }
  }
  // (a plural the same as the word, as los lunes, is the word)
  return out.filter((f) => f.form === 'word' || f.key !== out[0].key)
}

// Every form, of two letters to nine, made only of letters that can come
export const FORMS: Array<Form> = WORDS.flatMap(formsOf).filter(
  (f) =>
    f.key.length >= 2 &&
    f.key.length <= SIZE &&
    [...f.key].every((c) => c in FREQ),
)

const BY_KEY = new Map<string, Array<Form>>()
for (const f of FORMS) BY_KEY.set(f.key, [...(BY_KEY.get(f.key) ?? []), f])

// The forms with these letters, those of words met first
export function lookup(key: string, bank?: Bank): Array<Form> {
  const all = BY_KEY.get(key) ?? []
  if (!bank) return all
  const met = (f: Form) => (bank.cards[f.w.id] ? 0 : 1)
  return [...all].sort((a, b) => met(a) - met(b))
}

// The forms of the words met
export const metForms = (bank: Bank) => FORMS.filter((f) => bank.cards[f.w.id])

// What a form means, in Norwegian: «vindu», «vindu, flertall»
export function glossOf(f: Form): string {
  const g = gloss(f.w)
  switch (f.form) {
    case 'word':
      return f.w.pos === 'v' ? `å ${g}` : g
    case 'pl':
      return `${g}, flertall`
    case 'f':
      return `${g}, hunkjønn`
    case 'fpl':
      return `${g}, hunkjønn flertall`
  }
}

// --- Letters as a heap ---

// The letters of `key` not among `have`, each of those used once
export function missing(key: string, have: Array<string>): Array<string> {
  const left = [...have]
  const out: Array<string> = []
  for (const c of key) {
    const i = left.indexOf(c)
    if (i >= 0) left.splice(i, 1)
    else out.push(c)
  }
  return out
}

// Whether a word can be made of the blocks, each used once
export const makeable = (key: string, blocks: Array<string>) =>
  missing(key, blocks).length === 0

const tally = (cs: Array<string>) => ({
  v: cs.filter((c) => askOf(c) === 'v').length,
  c: cs.filter((c) => askOf(c) === 'c').length,
})

// A word whose letters come however the player asks: no more vowels than
// the least she will ask for, nor consonants
export function sure(key: string): boolean {
  const n = tally([...key])
  return n.v <= LEAST.v && n.c <= LEAST.c
}

// --- The draw ---

// The word the draw is sure of: a word she has met, of six or seven letters
// that come however she asks, those whose saying has faded most first;
// else one of five letters, else any of Hola's words
export function target(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
  // Words had already in the game
  had: Array<string> = [],
): Form {
  const ok = (f: Form, min: number) =>
    f.form === 'word' &&
    f.key.length >= min &&
    sure(f.key) &&
    !had.includes(f.w.id)
  const faded = (f: Form) => {
    const c = bank.cards[f.w.id]
    return c ? 1 - recall(c.decir, now) + random() * 0.35 : 0
  }
  const met = metForms(bank)
  for (const min of [6, 5]) {
    const fit = met.filter((f) => ok(f, min))
    if (fit.length)
      return fit
        .map((f) => ({ f, s: faded(f) }))
        .reduce((a, b) => (b.s > a.s ? b : a)).f
  }
  const any = FORMS.filter((f) => ok(f, 6))
  return any[Math.floor(random() * any.length)]
}

const oneOf = <T>(xs: Array<T>, random: () => number) =>
  xs[Math.floor(random() * xs.length)]

// The next letter, of the kind asked for. The target's letters of that
// kind come first, but where there is room to spare (fewer of them left
// than the asks of that kind still sure to come) now and then a letter
// for a longer word of hers comes instead, or one drawn as often as
// Spanish has it.
export function nextLetter(
  drawn: Array<string>,
  ask: Ask,
  // The target word's letters
  goal: string,
  // The letters of the words she has met, for longer words
  pool: Array<string>,
  random: () => number = Math.random,
): string {
  const asked = tally(drawn)
  const need = missing(goal, drawn)
  const mine = need.filter((c) => askOf(c) === ask)
  // Asks of this kind still sure to come, this one among them
  const certain = Math.max(0, LEAST[ask] - asked[ask])
  if (mine.length && (mine.length >= certain || random() < 0.6))
    return oneOf(mine, random)
  return longer(drawn, need, ask, pool, random) ?? common(drawn, ask, random)
}

// A letter for the longest word that can still be made, with the target's
// letters still to come
function longer(
  drawn: Array<string>,
  need: Array<string>,
  ask: Ask,
  pool: Array<string>,
  random: () => number,
): string | null {
  const asked = tally(drawn)
  // Asks still to come, this one among them
  const left = SIZE - drawn.length
  const room = { v: MOST.v - asked.v, c: MOST.c - asked.c }
  const needs = tally(need)
  let best: { miss: Array<string>; score: number } | null = null
  for (const key of pool) {
    if (key.length < 5) continue
    const miss = missing(key, [...drawn, ...need])
    if (!miss.length || miss.length > left - need.length) continue
    if (!miss.some((c) => askOf(c) === ask)) continue
    const m = tally(miss)
    if (needs.v + m.v > room.v || needs.c + m.c > room.c) continue
    const score = key.length * 2 - miss.length + random()
    if (!best || score > best.score) best = { miss, score }
  }
  return best
    ? oneOf(
        best.miss.filter((c) => askOf(c) === ask),
        random,
      )
    : null
}

// A letter as often as Spanish has it, less often again once drawn
function common(drawn: Array<string>, ask: Ask, random: () => number) {
  const opts = ALPHABET.filter((c) => askOf(c) === ask).map((c) => ({
    c,
    w: FREQ[c] * 0.35 ** drawn.filter((d) => d === c).length,
  }))
  let r = random() * opts.reduce((s, o) => s + o.w, 0)
  for (const o of opts) {
    r -= o.w
    if (r <= 0) return o.c
  }
  return opts[opts.length - 1].c
}

// Whether she may ask for a vowel, or a consonant, now
export function canAsk(drawn: Array<string>, ask: Ask): boolean {
  return drawn.length < SIZE && tally(drawn)[ask] < MOST[ask]
}

// --- The end of a round ---

// The longest words of hers to be made of the blocks: one form of each
// word, the longest, at most `n`
export function longest(
  blocks: Array<string>,
  forms: Array<Form>,
  n = 3,
): Array<Form> {
  const seen = new Set<string>()
  return forms
    .filter((f) => makeable(f.key, blocks))
    .sort(
      (a, b) =>
        b.key.length - a.key.length ||
        Number(a.form !== 'word') - Number(b.form !== 'word'),
    )
    .filter((f) => {
      if (seen.has(f.w.id) || seen.has(f.key)) return false
      seen.add(f.w.id)
      seen.add(f.key)
      return true
    })
    .slice(0, n)
}

// The forms said aloud that are not words in the list: plurals and an
// adjective's forms, for lib/spoken.ts
export const SAID = [
  ...new Set(FORMS.filter((f) => f.form !== 'word').map((f) => f.say)),
]
