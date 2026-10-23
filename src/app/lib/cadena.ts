import { WORDS, isClue } from '../data/words.ts'
import { recall } from './bank.ts'
import { shuffle } from './choices.ts'
import { unaccent } from './spanish.ts'
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

// --- Syllables, by Spanish spelling ---

// A word is read as units: a strong vowel (a, e, o, and an accented í or ú,
// which stand apart from the vowel beside them), a weak one (i, u, ü, and y
// at the end of a word or before a consonant), or a consonant, which may be
// written with two letters: ch, ll, rr, and qu or gu before e or i, whose u
// is not said.
type Kind = 'c' | 'weak' | 'strong'

interface Unit {
  s: string
  k: Kind
}

const STRONG = new Set([...'aeoáéóíú'])
const WEAK = new Set([...'iuü'])
const vowel = (c: string | undefined) =>
  !!c && (STRONG.has(c) || WEAK.has(c) || c === 'y')

function units(word: string): Array<Unit> {
  const w = word.toLowerCase()
  // (each unit as it is written, a capital kept, though read in small)
  const as = w.length === word.length ? word : w
  const out: Array<Unit> = []
  for (let i = 0; i < w.length;) {
    const two = w.slice(i, i + 2)
    if (
      two === 'ch' ||
      two === 'll' ||
      two === 'rr' ||
      ((two === 'qu' || two === 'gu') && /[eéií]/.test(w.charAt(i + 2)))
    ) {
      out.push({ s: as.slice(i, i + 2), k: 'c' })
      i += 2
      continue
    }
    const c = w.charAt(i)
    const s = as.charAt(i)
    if (STRONG.has(c)) out.push({ s, k: 'strong' })
    else if (WEAK.has(c)) out.push({ s, k: 'weak' })
    else if (c === 'y')
      // A consonant before a vowel (yo, playa), else a vowel (rey, muy)
      out.push({ s, k: vowel(w.charAt(i + 1)) ? 'c' : 'weak' })
    else out.push({ s, k: 'c' })
    i++
  }
  return out
}

// Two consonants that begin a syllable together: pr, bl, tr, cl, gr, fl …
// (but not tl or dl, which Spain divides: at-las)
const together = (a: string, b: string) =>
  /^[pbcgfkdt]$/.test(a) &&
  /^[rl]$/.test(b) &&
  !((a === 't' || a === 'd') && b === 'l')

// The syllables of a word, as it is written: ca-sa, pe-rro, ha-blar,
// hom-bre, puer-ta, rí-o, le-er, a-ve-ni-da. Vowels side by side share a
// syllable (a diphthong) unless both are strong (a hiatus); between
// vowels, one consonant goes with the next syllable, and of more, the last
// one goes, or the last two where they begin a syllable together.
export function syllables(word: string): Array<string> {
  const u = units(word.trim())
  // The vowels of each syllable, as ranges of units
  const nuclei: Array<[number, number]> = []
  for (let i = 0; i < u.length;) {
    if (u[i].k === 'c') {
      i++
      continue
    }
    let j = i
    while (
      j + 1 < u.length &&
      u[j + 1].k !== 'c' &&
      !(u[j].k === 'strong' && u[j + 1].k === 'strong')
    )
      j++
    nuclei.push([i, j])
    i = j + 1
  }
  if (nuclei.length <= 1) return [u.map((x) => x.s).join('')]
  // Where each syllable after the first begins
  const starts = [0]
  for (let k = 1; k < nuclei.length; k++) {
    const from = nuclei[k - 1][1] + 1
    const to = nuclei[k][0]
    const n = to - from
    if (n === 0) starts.push(to)
    else if (n >= 2 && together(u[to - 2].s, u[to - 1].s)) starts.push(to - 2)
    else starts.push(to - 1)
  }
  return starts.map((s, k) =>
    u
      .slice(s, starts[k + 1] ?? u.length)
      .map((x) => x.s)
      .join(''),
  )
}

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
// word, and three that do not begin with the syllable, one or two of them
// beginning with its first letter
export function choices(
  right: Word,
  chain: Array<Word>,
  pool: Array<Word>,
  random: () => number = Math.random,
): Array<Word> {
  const l = link(chain[chain.length - 1].bare)
  const used = new Set([...chain, right].map(spelling))
  const fit = (x: Word) =>
    canChain(x) && !spelling(x).startsWith(l) && !used.has(spelling(x))
  const near = (x: Word) => spelling(x).startsWith(l.charAt(0))
  const tiers = [
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
