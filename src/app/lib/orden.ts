import { POINTS, SENTENCES } from '../data/orden.ts'
import { shuffle } from './choices.ts'
import { plain, tokens, wordIds } from './text.ts'
import type { Sentence } from '../data/orden.ts'
import type { Bank } from './bank.ts'

// Orden: a Norwegian sentence, and its Spanish words as tiles in a heap,
// to be set in Spanish order. Tiles out of place go back to the heap, and
// the player tries again; a sentence right at the first try counts. Eight
// sentences make a sheet, the easiest first.

export const ROUND = 8

export interface Tile {
  // Its place in the sentence, which tells two tiles of the same word apart
  k: number
  // As shown: lower case, but for a name
  es: string
}

// A line's words as tiles, in its order, without its punctuation
export const tilesOf = (line: string): Array<Tile> =>
  tokens(line)
    .filter((t) => !t.punct)
    .map((t, k) => ({ k, es: t.name ? t.es : t.es.toLowerCase() }))

// Every order that is right, as the lines that write it: the sentence's
// own first
export const linesOf = (s: Sentence) => [s.line, ...(s.also ?? [])]

const wordsOf = (line: string) => tilesOf(line).map((t) => t.es)

// The right order an order of words is, by its place in linesOf, or -1
export function matchOf(s: Sentence, words: Array<string>): number {
  return linesOf(s).findIndex((line) => {
    const w = wordsOf(line)
    return w.length === words.length && w.every((x, i) => x === words[i])
  })
}

// The places whose word is out of place, measured against the right order
// that has the most words in place already
export function outOfPlace(s: Sentence, words: Array<string>): Array<number> {
  let best: Array<number> = words.map((_, i) => i)
  for (const line of linesOf(s)) {
    const w = wordsOf(line)
    const wrong = words.flatMap((x, i) => (w[i] === x ? [] : [i]))
    if (wrong.length < best.length) best = wrong
  }
  return best
}

// A right order as Spanish is written, to show and say
export const spanishOf = (s: Sentence, i = 0) => plain(linesOf(s)[i] ?? s.line)

// The words of the bank a sentence uses
export const idsOf = (s: Sentence) => wordIds(s.line)

// The words of a sentence the player has not met
export const unmetIn = (s: Sentence, bank: Bank) =>
  idsOf(s).filter((id) => !bank.cards[id]).length

// The tiles in a heap, never already in a right order
export function heap(
  s: Sentence,
  random: () => number = Math.random,
): Array<Tile> {
  const tiles = tilesOf(s.line)
  for (let i = 0; i < 20; i++) {
    const h = shuffle(tiles, random)
    if (
      matchOf(
        s,
        h.map((t) => t.es),
      ) < 0
    )
      return h
  }
  // (a sentence of one word repeated could never be out of order)
  return [...tiles].reverse()
}

// Two of each level, from the sentences whose words the player has met
const EACH = 2

// The sentences of a round: of those whose words are all met, two of each
// level, filled up from the levels nearest, the easiest first. Short of
// sentences met, those with the fewest words not met come in. Of those as
// good, one whose picture is not on the sheet yet is taken first, so that
// the sheet has as many pictures as it can.
export function round(
  bank: Bank,
  random: () => number = Math.random,
  all: Array<Sentence> = SENTENCES,
): Array<Sentence> {
  const pool = shuffle(all, random)
  const met = pool.filter((s) => unmetIn(s, bank) === 0)
  const out: Array<Sentence> = []
  // One at a time from xs, in their order, but among those with the same
  // key as the first one, one with a picture new to the sheet
  const take = (
    xs: Array<Sentence>,
    count: number,
    key: (s: Sentence) => number = () => 0,
  ) => {
    const left = xs.filter((s) => !out.includes(s))
    for (let n = 0; n < count && left.length; n++) {
      const k = key(left[0])
      const j = left.findIndex(
        (s) => key(s) === k && !out.some((o) => o.pic === s.pic),
      )
      out.push(...left.splice(Math.max(0, j), 1))
    }
  }
  // (the levels with the fewest sentences choose their pictures first)
  const of = (level: number) => met.filter((s) => s.level === level)
  for (const level of [1, 2, 3, 4].sort((a, b) => of(a).length - of(b).length))
    take(of(level), EACH)
  // The rest come in by how near their level is to the levels short of
  // sentences
  const short = [1, 2, 3, 4].filter(
    (level) => out.filter((s) => s.level === level).length < EACH,
  )
  const near = (s: Sentence) =>
    short.length ? Math.min(...short.map((l) => Math.abs(l - s.level))) : 0
  const byNear = [...met].sort((a, b) => near(a) - near(b))
  take(byNear, ROUND - out.length, near)
  const unmet = (s: Sentence) => unmetIn(s, bank) * 10 + near(s)
  const rest = pool
    .filter((s) => !met.includes(s))
    .sort((a, b) => unmet(a) - unmet(b))
  take(rest, ROUND - out.length, unmet)
  return [...out].sort((a, b) => a.level - b.level)
}

// What a sentence shows, as a hint while it is not yet right: the rule
// without its example, which may be the sentence itself
export function hintOf(s: Sentence): string {
  const text: string = POINTS[s.point]
  const colon = text.indexOf(':')
  return colon < 0 ? text : `${text.slice(0, colon)}.`
}
