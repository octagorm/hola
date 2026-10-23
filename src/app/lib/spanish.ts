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

// --- Syllables and stress ---

// Words of Hola's spelt by Basque or Catalan rules (tx, a final ll), where
// Spanish spelling and stress do not hold
export const FOREIGN = new Set(['castells', 'kaixo', 'pintxo', 'txakoli'])

// A word is read as units, by the rules of the RAE's Ortografía (2010): a
// strong vowel (a, e, o, and an accented í or ú, which stand apart from
// the vowel beside them), a weak one (i, u, ü, and y at the end of a word
// or before a consonant), or a consonant, which may be written with two
// letters: ch, ll, rr, and qu or gu before e or i, whose u is not said.
type Sound = 'c' | 'weak' | 'strong'

interface Unit {
  s: string
  k: Sound
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
  /^[pbcgfkdt]$/i.test(a) && /^[rl]$/i.test(b) && !/^[td]l$/i.test(a + b)

const silentH = (x: Unit | undefined) => x?.s.toLowerCase() === 'h'

// The syllables of a word, as it is written: ca-sa, pe-rro, ha-blar,
// hom-bre, puer-ta, rí-o, le-er, a-ve-ni-da. Vowels side by side share a
// syllable (a diphthong) unless both are strong, or the same weak one (a
// hiatus), and a silent h between them changes nothing, as the RAE has it
// (prohi-bir, ahu-ma-do, but pro-hí-be); a syllable has one strong vowel
// at most, so a weak one between two strong ones goes with the second
// (a-hue-car). Between vowels, one consonant goes with the next syllable,
// and of more, the last one goes, or the last two where they begin a
// syllable together.
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
    let strong = u[i].k === 'strong'
    for (;;) {
      const gap = silentH(u[j + 1]) ? 2 : 1
      const next = u[j + gap] as Unit | undefined
      if (!next || next.k === 'c') break
      // (two of the same weak vowel stand apart: chi-i-ta)
      if (next.s.toLowerCase() === u[j].s.toLowerCase() && next.k === 'weak')
        break
      if (next.k === 'strong' && strong) {
        // (a weak vowel after the strong one goes on with the next)
        if (u[j].k === 'weak' && j > i) {
          const end = silentH(u[j - 1]) ? j - 2 : j - 1
          nuclei.push([i, end])
          i = j
          j = -1
        }
        break
      }
      strong ||= next.k === 'strong'
      j += gap
    }
    if (j < 0) continue
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

// The syllable that carries the stress, counted from the first (0): the
// one with an accent mark, or else by the rule: the next to last in a word
// that ends in a vowel, or in n or s after one (ca-sa, jo-ven, lu-nes), and
// the last in any other (ha-blar, re-loj, ciu-dad, es-toy)
export function stressIndex(word: string): number {
  const syl = syllables(word)
  const marked = syl.findIndex((s) => /[áéíóú]/i.test(s))
  if (marked >= 0) return marked
  if (syl.length < 2) return 0
  return /[aeiou][ns]?$/i.test(word.trim()) ? syl.length - 2 : syl.length - 1
}
