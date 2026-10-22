import { WORDS } from '../data/words.ts'
import { letters } from './spanish.ts'
import { dayNumber } from './today.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// La palabra: a word of five letters in six guesses. Accents do not
// count, as in Spanish crosswords, but Ñ is a letter of its own.

export type Mark = 'g' | 'c' | 'x'

export const LENGTH = 5
export const TRIES = 6

// Each letter of a guess: in the right place (g), in the word elsewhere
// (c), or not in it (x), a letter used twice counting only as often as the
// word has it
export function marks(guess: string, answer: string): Array<Mark> {
  const g = [...guess]
  const a = [...answer]
  const out: Array<Mark> = g.map(() => 'x')
  const left: Record<string, number> = {}
  g.forEach((c, i) => {
    if (c === a[i]) out[i] = 'g'
    else left[a[i]] = (left[a[i]] ?? 0) + 1
  })
  g.forEach((c, i) => {
    if (out[i] === 'g') return
    if ((left[c] ?? 0) > 0) {
      out[i] = 'c'
      left[c]--
    }
  })
  return out
}

// The best each letter has shown, for the keyboard
export function keyMarks(
  guesses: Array<string>,
  answer: string,
): Record<string, Mark | undefined> {
  const rank = { x: 0, c: 1, g: 2 }
  const out: Record<string, Mark | undefined> = {}
  for (const guess of guesses) {
    const m = marks(guess, answer)
    ;[...guess].forEach((c, i) => {
      const was = out[c]
      if (!was || rank[m[i]] > rank[was]) out[c] = m[i]
    })
  }
  return out
}

// The words that can be the answer: one word of five letters, not a
// greeting or a small word
export const ANSWERS: Array<Word> = (() => {
  const seen = new Set<string>()
  return WORDS.filter((w) => {
    if (w.bare.includes(' ') || ['expr', 'det', 'int'].includes(w.pos))
      return false
    const l = letters(w.bare)
    if (l.length !== LENGTH || seen.has(l)) return false
    seen.add(l)
    return true
  })
})()

// The same order of the words for everyone, shuffled once
const ORDER = (() => {
  let seed = 20261022
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const a = [...ANSWERS]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
})()

// The day's word: from the words met, once there are enough of them to
// keep it a puzzle, else from all
export function daily(bank: Bank, now: number): Word {
  const met = ORDER.filter((w) => bank.cards[w.id])
  const from = met.length >= 12 ? met : ORDER
  return from[dayNumber(now) % from.length]
}

// A word for another round, not the day's
export function practice(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Word {
  const day = daily(bank, now)
  const met = ANSWERS.filter((w) => bank.cards[w.id] && w !== day)
  const from = met.length >= 8 ? met : ANSWERS.filter((w) => w !== day)
  return from[Math.floor(random() * from.length)]
}

// A guess typed is a word in the bank, to show its meaning by
export const KNOWN_GUESS: Record<string, Word | undefined> = Object.fromEntries(
  WORDS.filter((w) => !w.bare.includes(' ')).map((w) => [letters(w.bare), w]),
)
