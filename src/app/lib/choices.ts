import { WORDS } from '../data/words.ts'
import type { Word } from '../data/words.ts'

// The wrong answers offered beside the right one: words of the same kind,
// from the same lesson where there are enough, never two that look or
// mean the same.

export function shuffle<T>(
  xs: Array<T>,
  random: () => number = Math.random,
): Array<T> {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const firstMeaning = (w: Word) => w.no.split(', ')[0]

// Three other words to stand beside `w`, from `pool` (the words met, or
// all), as like it as can be found
export function others(
  w: Word,
  pool: Array<Word> = WORDS,
  random: () => number = Math.random,
  n = 3,
): Array<Word> {
  const seen = new Set([w.es, firstMeaning(w)])
  const out: Array<Word> = []
  const tiers = [
    pool.filter((x) => x.pos === w.pos && x.lesson === w.lesson),
    pool.filter((x) => x.pos === w.pos),
    WORDS.filter((x) => x.pos === w.pos),
    WORDS,
  ]
  for (const tier of tiers) {
    for (const x of shuffle(tier, random)) {
      if (out.length >= n) return out
      if (seen.has(x.es) || seen.has(firstMeaning(x))) continue
      seen.add(x.es)
      seen.add(firstMeaning(x))
      out.push(x)
    }
  }
  return out
}

// The other article, to make the wrong one: «la agua» for «el agua»
const SWAP: Record<string, string | undefined> = {
  el: 'la',
  la: 'el',
  los: 'las',
  las: 'los',
}

// The Spanish to pick from for a meaning: for a noun, now and then the
// same noun with the other article, so that the article is learnt with it
export function spanishChoices(
  w: Word,
  pool: Array<Word> = WORDS,
  random: () => number = Math.random,
): Array<string> {
  const other = SWAP[w.es.split(' ')[0]]
  const wrongGender =
    w.pos === 'n' && random() < 0.5 && other ? `${other} ${w.bare}` : null
  const rest = others(w, pool, random, wrongGender ? 2 : 3).map((x) => x.es)
  return shuffle([w.es, ...(wrongGender ? [wrongGender] : []), ...rest], random)
}
