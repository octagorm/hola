import type { Word } from '../data/words.ts'

// Spanish spelling for comparing answers and filling grids: accents can be
// left off where the player allows it, but ñ is a letter of its own.

const PLAIN: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
  Ü: 'U',
}

// Without accents, ñ kept
export const unaccent = (s: string) =>
  s.replace(/[áéíóúüÁÉÍÓÚÜ]/g, (c) => PLAIN[c])

// An answer as typed, made comparable: lower case, single spaces, no
// punctuation around it
export const clean = (s: string) =>
  s
    .toLowerCase()
    .replace(/[¿?¡!.,;:«»"'()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// A word's letters in a grid or a ring: capitals without accents or spaces
export const letters = (s: string) =>
  [...unaccent(s).toUpperCase()].filter((c) => /[A-ZÑ]/.test(c)).join('')

export type Verdict =
  // Spelt as it is
  | 'right'
  // Right but for its accents
  | 'accent'
  // A noun without its article
  | 'bare'
  // A noun with the other gender's article
  | 'gender'
  | 'wrong'

const ARTICLES = ['el', 'la', 'los', 'las']

// An answer typed for a word, which is said with its article
export function judge(
  typed: string,
  w: Word,
  { lenient = true }: { lenient?: boolean } = {},
): Verdict {
  const t = clean(typed)
  const want = clean(w.es)
  if (!t) return 'wrong'
  if (t === want) return 'right'
  if (lenient && unaccent(t) === unaccent(want)) return 'accent'
  if (w.pos === 'n') {
    const bare = clean(w.bare)
    const [art, ...rest] = t.split(' ')
    const noun = rest.join(' ')
    const same = (a: string) =>
      a === bare || (lenient && unaccent(a) === unaccent(bare))
    if (same(t)) return 'bare'
    if (ARTICLES.includes(art) && same(noun)) return 'gender'
  }
  return 'wrong'
}

// How much an answer says about the word, for the bank, and whether it
// counts as right
export const VERDICT: Record<Verdict, { right: boolean; weight: number }> = {
  right: { right: true, weight: 1 },
  accent: { right: true, weight: 0.85 },
  bare: { right: true, weight: 0.5 },
  gender: { right: false, weight: 0.5 },
  wrong: { right: false, weight: 1 },
}

const MARKED: Record<string, string | undefined> = {
  a: 'á',
  e: 'é',
  i: 'í',
  o: 'ó',
  u: 'ú',
}

// The plural of a noun or an adjective, by the usual rules: casa → casas,
// reloj → relojes, luz → luces, cajón → cajones, joven → jóvenes, and
// el lunes → los lunes
export function plural(s: string): string {
  if (/[aeiouáéó]$/.test(s)) return `${s}s`
  if (s.endsWith('z')) return `${s.slice(0, -1)}ces`
  // A loanword in a consonant no Spanish word ends in takes -s, as the
  // RAE has it: fuet → fuets, vermut → vermuts, cómic → cómics
  if (/[bcfgkpt]$/.test(s)) return `${s}s`
  // The vowels of each syllable, roughly: enough to tell where the stress is
  const groups = [...s.matchAll(/[aeiouáéíóúü]+/g)]
  const last = groups.at(-1)?.[0] ?? ''
  // Unstressed at the end and ending in s or x, it stays as it is
  if (/[sx]$/.test(s) && groups.length > 1 && !/[áéíóú]/.test(last)) return s
  // Stressed on the next to last and ending in n, it takes an accent
  // there once a syllable is added
  if (s.endsWith('n') && groups.length > 1 && !/[áéíóú]/.test(s)) {
    const g = groups[groups.length - 2]
    // (the strong vowel of a diphthong, or the second of two weak ones)
    const strong = g[0].search(/[aeo]/)
    const i = g.index + (strong >= 0 ? strong : g[0].length - 1)
    const marked = MARKED[s.charAt(i)] ?? s.charAt(i)
    return `${s.slice(0, i)}${marked}${s.slice(i + 1)}es`
  }
  // An accent on the last syllable goes when a syllable is added
  const stressed = s.replace(/([áéíóú])([nsl])$/, (_, v: string, c: string) => {
    const back: Record<string, string> = {
      á: 'a',
      é: 'e',
      í: 'i',
      ó: 'o',
      ú: 'u',
    }
    return back[v] + c
  })
  return `${stressed}es`
}
