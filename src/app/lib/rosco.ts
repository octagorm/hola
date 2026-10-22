import { WORDS, isClue } from '../data/words.ts'
import { due } from './bank.ts'
import { letters } from './spanish.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// El rosco, after the ring of letters in the TV quiz Pasapalabra: a word
// for each letter, starting with it or else holding it, from a clue in
// Norwegian. Words met are asked first, those that need saying most.

export const ALPHABET = [...'ABCDEFGHIJLMNÑOPQRSTUVXYZ']

export interface Clue {
  letter: string
  // The word starts with the letter, or only has it in it
  starts: boolean
  word: Word
  answer: string
}

const usable = (w: Word) => isClue(w) && letters(w.bare).length >= 3

// The ring for a round: met words, those whose saying has faded most
// first, at most one per letter; letters no word met has are left out
export function ring(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Array<Clue> {
  const met = due(bank, now, WORDS, 'decir')
    .map((d) => ({ w: d.w, k: d.r + random() * 0.3 }))
    .sort((a, b) => a.k - b.k)
    .map((d) => d.w)
    .filter(usable)
  const used = new Set<string>()
  const out: Array<Clue> = []
  for (const letter of ALPHABET) {
    const take = (starts: boolean) =>
      met.find((w) => {
        const a = letters(w.bare)
        return (
          !used.has(a) && (starts ? a.startsWith(letter) : a.includes(letter))
        )
      })
    const first = take(true)
    const word = first ?? take(false)
    if (!word) continue
    const answer = letters(word.bare)
    used.add(answer)
    out.push({ letter, starts: !!first, word, answer })
  }
  return out
}

// A typed answer for a clue: the letters only, accents left off
export const isRight = (typed: string, clue: Clue) =>
  letters(typed) === clue.answer
