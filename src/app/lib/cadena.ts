import { WORDS, isClue } from '../data/words.ts'
import { recall } from './bank.ts'
import { shuffle } from './choices.ts'
import { syllables, unaccent } from './spanish.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// Palabras encadenadas: a chain of words, each beginning with the last
// syllable of the one before (casa → sapo → pozo).
//
// Measured over the words a chain may hold (canChain, below; 838
// spellings), three in four have a word to follow them, seven on average,
// and chains of over a hundred links can be made; over the 322 words a new
// player starts with (272 spellings), a little over half have one, two on
// average, and chains of eight links can start from 82 of them. Many
// endings lead nowhere (-ño, -che, -bre, -llo, -ción), so a chain left to
// chance soon stops: the game finds a chain of eight among the player's
// words before it starts, and gives the meaning of each next word as the
// clue.

// --- Links, by the last syllable (syllables in lib/spanish.ts) ---

// A word as the chain compares it: lower case, no accents, ñ kept
export const plainWord = (s: string) => unaccent(s.toLowerCase())

// What the next word must begin with: the last syllable, without accents.
// A word never begins with rr, which is said as an r there: perro → rojo.
export function link(word: string): string {
  const last = plainWord(syllables(word).at(-1) ?? word)
  return last.startsWith('rr') ? last.slice(1) : last
}

// Whether `next` may follow `prev` in a chain
export const follows = (prev: string, next: string) =>
  plainWord(next) !== plainWord(prev) && plainWord(next).startsWith(link(prev))

// --- The chain ---

// Links in a game, after the word it starts from
export const LENGTH = 8

// A word the game may put in a chain: one that can be a clue, of three
// letters or more, and not a name (Navidad, Alhambra) or an abbreviation
// (NIE), as the game is played. Any of Hola's words counts when typed.
export const canChain = (w: Word) =>
  isClue(w) && w.bare === w.bare.toLowerCase() && plainWord(w.bare).length >= 3

const CHAIN = WORDS.filter(canChain)

const spelling = (w: Word) => plainWord(w.bare)

// The words that may follow a word, those of the chain's words made once
// when first asked for
let NEXT: Map<string, Array<Word>> | null = null
const after = (w: Word) => {
  const l = link(w.bare)
  const s = spelling(w)
  return CHAIN.filter((b) => spelling(b) !== s && spelling(b).startsWith(l))
}
export function nextOf(w: Word): Array<Word> {
  NEXT ??= new Map(CHAIN.map((a) => [a.id, after(a)]))
  return NEXT.get(w.id) ?? after(w)
}

// Words that have faded most first, where there is a choice; words not
// met last of all, for a chain her own words cannot make
function scorer(bank: Bank, now: number, random: () => number) {
  const memo = new Map<string, number>()
  return (w: Word) => {
    let s = memo.get(w.id)
    if (s === undefined) {
      const c = bank.cards[w.id]
      s = c ? 1 - recall(c.decir, now) + random() * 0.5 : -1 + random() * 0.1
      memo.set(w.id, s)
    }
    return s
  }
}

// A chain of `links` more words after those given, each new, by search
function search(
  chain: Array<Word>,
  links: number,
  ok: (w: Word) => boolean,
  score: (w: Word) => number,
  budget: { n: number },
): Array<Word> | null {
  if (!links) return chain
  if (budget.n-- <= 0) return null
  const used = new Set(chain.map(spelling))
  const opts = nextOf(chain[chain.length - 1])
    .filter((w) => ok(w) && !used.has(spelling(w)))
    .sort((a, b) => score(b) - score(a))
  for (const w of opts) {
    const found = search([...chain, w], links - 1, ok, score, budget)
    if (found) return found
  }
  return null
}

// A game's chain: a word to start from and `links` more, all of them
// words she has met if a chain can be made of them, else with as few
// others as can be
export function plan(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
  links = LENGTH,
): Array<Word> | null {
  const score = scorer(bank, now, random)
  const met = (w: Word) => !!bank.cards[w.id]
  const mine = CHAIN.filter(met)
  for (const ok of [met, () => true]) {
    const starts = shuffle(mine.length ? mine : CHAIN, random)
    for (const start of starts) {
      const found = search([start], links, ok, score, { n: 3000 })
      if (found) return found
    }
  }
  return null
}

// The rest of a chain after a word she chose herself: `links` more, of
// her words where they can be, or null if none can follow far enough
export function extend(
  chain: Array<Word>,
  links: number,
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Array<Word> | null {
  const score = scorer(bank, now, random)
  for (const ok of [(w: Word) => !!bank.cards[w.id], () => true]) {
    const found = search(chain, links, ok, score, { n: 6000 })
    if (found) return found
  }
  return null
}

// Hola's words with the letters typed, that may follow the last word of
// the chain: any one word, not yet in it
export function fitting(chain: Array<Word>, typed: string): Array<Word> {
  const t = plainWord(typed)
  const last = chain[chain.length - 1]
  const used = new Set(chain.map(spelling))
  return WORDS.filter(
    (w) =>
      !w.bare.includes(' ') &&
      spelling(w) === t &&
      t.length >= 2 &&
      !used.has(t) &&
      follows(last.bare, w.bare),
  )
}

// The four to pick from, for a word not yet held well enough to type: the
// word, and three others beginning with the syllable where there are any,
// the player's words first, so that it is picked by its meaning and not by
// how it begins; else one or two beginning with its first letter
export function choices(
  right: Word,
  chain: Array<Word>,
  pool: Array<Word>,
  random: () => number = Math.random,
): Array<Word> {
  const l = link(chain[chain.length - 1].bare)
  const used = new Set([...chain, right].map(spelling))
  const free = (x: Word) => canChain(x) && !used.has(spelling(x))
  const on = (x: Word) => free(x) && spelling(x).startsWith(l)
  const fit = (x: Word) => free(x) && !spelling(x).startsWith(l)
  const near = (x: Word) => spelling(x).startsWith(l.charAt(0))
  const tiers = [
    pool.filter(on),
    CHAIN.filter(on),
    shuffle(
      pool.filter((x) => fit(x) && near(x)),
      random,
    ).slice(0, 2),
    pool.filter((x) => fit(x) && x.pos === right.pos),
    pool.filter(fit),
    CHAIN.filter(fit),
  ]
  const out: Array<Word> = []
  const seen = new Set<string>()
  for (const tier of tiers)
    for (const x of shuffle(tier, random)) {
      if (out.length >= 3 || seen.has(spelling(x))) continue
      seen.add(spelling(x))
      out.push(x)
    }
  return shuffle([right, ...out], random)
}
