import { WORD, WORDS } from '../data/words.ts'
import { shuffle } from './choices.ts'
import { FOREIGN, stressIndex, syllables } from './spanish.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// Acento: where the stress falls in a word heard, and whether it is
// written with an accent mark (tilde). The rules come one at a time, each
// once a round of the last has gone well:
//   1  a word ending in a vowel, n or s is stressed on the next to last
//      syllable (llana), any other on the last (aguda)
//   2  a word that breaks rule 1 has a tilde (café, árbol)
//   3  a word stressed on the third to last always has one (esdrújula)
//   4  a tilde on i or u parts it from the vowel beside it (hiato: día)
//   5  a tilde tells two words apart (tú and tu, qué and que)
// bank.best.acento is the rule reached, and one more once the last is
// mastered too.

export type Kind =
  // Rule 1: stressed as the rule says, no tilde
  | 'llana'
  | 'aguda'
  // Rule 2: against it, with a tilde
  | 'tilde'
  // Rule 3
  | 'esdrujula'
  // Rule 4
  | 'hiato'

export const LAST_RULE = 5

// Right answers of a round of ten that open the next rule
export const MASTERED = 8
export const ROUND = 10

export interface Rule {
  n: number
  es: string
  no: string
  text: string
  // Words to hear it in, by id
  words: Array<string>
}

export const RULES: Array<Rule> = [
  {
    n: 1,
    es: 'Llanas y agudas',
    no: 'Trykket etter endelsen',
    text: 'Hvert ord har trykk på én stavelse, og endelsen sier hvilken. Slutter ordet på vokal, n eller s, ligger trykket på nest siste stavelse. Slutter det på en annen konsonant, ligger det på siste.',
    words: ['la casa', 'joven', 'el lunes', 'hablar', 'el reloj', 'la ciudad'],
  },
  {
    n: 2,
    es: 'La tilde',
    no: 'Når ordet bryter regelen',
    text: 'Ligger trykket et annet sted enn endelsen sier, viser en aksent hvor det er. Café og canción slutter på vokal og n, men har trykket på siste stavelse. Árbol og fácil slutter på l, men har det på nest siste.',
    words: ['el café', 'la canción', 'el árbol', 'fácil'],
  },
  {
    n: 3,
    es: 'Las esdrújulas',
    no: 'Trykk på tredje siste',
    text: 'Ligger trykket på tredje siste stavelse, får ordet alltid aksent, uansett hvordan det slutter.',
    words: ['el plátano', 'el sábado', 'la música', 'simpático'],
  },
  {
    n: 4,
    es: 'El hiato',
    no: 'To vokaler hver for seg',
    text: 'I og u glir vanligvis sammen med vokalen ved siden av, så de blir én stavelse, som i ciudad og bueno. Når trykket ligger på i eller u ved siden av en annen vokal, sies de hver for seg, og i-en eller u-en får aksent. Det gjelder også når ordet ellers følger regelen, som oír.',
    words: ['el día', 'el río', 'el tío', 'oír'],
  },
  {
    n: 5,
    es: 'La tilde diacrítica',
    no: 'Aksent som skiller ord',
    text: 'Ord på én stavelse skrives uten aksent, men noen par sies likt og skilles med en: tú (du) og tu (din), él (han) og el (-en), sí (ja) og si (hvis), té (te) og te (deg), sé (jeg vet) og se (seg), más (mer) og mas (men, gammeldags). Spørreord har også aksent: qué, cómo, dónde, cuándo.',
    words: ['tú', 'tu', 'él', 'el'],
  },
]

// --- Accent marks ---

const PLAIN: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
}

// The word without its accent marks (but with ü and ñ)
export const untilde = (s: string) => s.replace(/[áéíóú]/g, (c) => PLAIN[c])

export const hasTilde = (s: string) => /[áéíóú]/.test(s)

// Where the accent mark is, as a letter of the word, or -1
const markOf = (s: string) => s.search(/[áéíóú]/)

// A letter that can carry an accent mark
export const takesMark = (c: string) => /^[aeiou]$/.test(c)

// --- The words ---

// The kind of word by its stress and its tilde, or null for one the game
// does not ask: one syllable, or a tilde the rules above do not explain
// (dónde and cómo have theirs as question words)
export function kindOf(word: string): Kind | null {
  const syl = syllables(word)
  if (syl.length < 2) return null
  const plain = untilde(word)
  const at = stressIndex(word)
  const tilde = hasTilde(word)
  const parted = syllables(plain).length !== syl.length
  // Whether the rule alone would put the stress where it is
  const byRule = !parted && stressIndex(plain) === at
  if (tilde === byRule) return null
  if (!tilde) return at === syl.length - 1 ? 'aguda' : 'llana'
  if (parted) return 'hiato'
  return syl.length - 1 - at >= 2 ? 'esdrujula' : 'tilde'
}

// A word the game can ask: one word, in lower case, Spanish, and not an
// adverb in -mente, which has two stresses
export function usable(w: Word): Kind | null {
  const b = w.bare
  if (!/^[a-zñáéíóúü]+$/.test(b) || FOREIGN.has(b) || b.endsWith('mente'))
    return null
  return kindOf(b)
}

// Each usable word by its kind, worked out once
const KIND: Record<string, Kind | undefined> = Object.fromEntries(
  WORDS.flatMap((w) => {
    const k = usable(w)
    return k ? [[w.id, k]] : []
  }),
)

export const kindOfWord = (id: string) => KIND[id]

// A word told apart from its twin by a tilde (rule 5): the one asked for
// by its meaning, by its id in the bank, and the twin with its own
export interface Twin {
  id: string
  es: string
  no: string
  other: string
  otherNo: string
}

export const TWINS: Array<Twin> = [
  { id: 'tú', es: 'tú', no: 'du', other: 'tu', otherNo: 'din' },
  { id: 'tu', es: 'tu', no: 'din', other: 'tú', otherNo: 'du' },
  { id: 'él', es: 'él', no: 'han', other: 'el', otherNo: '-en (hankjønn)' },
  { id: 'el', es: 'el', no: '-en (hankjønn)', other: 'él', otherNo: 'han' },
  { id: 'sí', es: 'sí', no: 'ja', other: 'si', otherNo: 'hvis' },
  { id: 'el té', es: 'té', no: 'te (drikken)', other: 'te', otherNo: 'deg' },
  { id: 'te', es: 'te', no: 'deg', other: 'té', otherNo: 'te (drikken)' },
  { id: 'se', es: 'se', no: 'seg', other: 'sé', otherNo: 'jeg vet' },
  {
    id: 'más',
    es: 'más',
    no: 'mer',
    other: 'mas',
    otherNo: 'men (gammeldags)',
  },
  {
    id: 'qué',
    es: 'qué',
    no: 'hva?',
    other: 'que',
    otherNo: 'som, at',
  },
  {
    id: 'que',
    es: 'que',
    no: 'som, at',
    other: 'qué',
    otherNo: 'hva?',
  },
  {
    id: 'dónde',
    es: 'dónde',
    no: 'hvor?',
    other: 'donde',
    otherNo: 'der',
  },
  {
    id: 'cómo',
    es: 'cómo',
    no: 'hvordan?',
    other: 'como',
    otherNo: 'som, slik som',
  },
  {
    id: 'cuándo',
    es: 'cuándo',
    no: 'når?',
    other: 'cuando',
    otherNo: 'når, da',
  },
]

// A question in a round: a word whose stress is heard and whose tilde is
// placed, or a twin told apart by its tilde alone
export type Item =
  | {
      k: 'word'
      w: Word
      kind: Kind
      // The word without its article in syllables, as written and without
      // accent marks, as shown before the answer
      syl: Array<string>
      plain: Array<string>
      stress: number
      // The letter with the accent mark, or -1
      mark: number
    }
  | {
      k: 'twin'
      w: Word
      twin: Twin
      plain: Array<string>
      mark: number
    }

export function wordItem(w: Word): Item | null {
  const kind = KIND[w.id]
  if (!kind) return null
  const syl = syllables(w.bare)
  return {
    k: 'word',
    w,
    kind,
    syl,
    plain: syl.map(untilde),
    stress: stressIndex(w.bare),
    mark: markOf(w.bare),
  }
}

export function twinItem(twin: Twin): Item | null {
  const w = WORD[twin.id]
  if (!w) return null
  return {
    k: 'twin',
    w,
    twin,
    plain: [untilde(twin.es)],
    mark: markOf(twin.es),
  }
}

// Whether the tilde is asked: from rule 2 on, once the stress is found,
// and for a twin alone
export const asksTilde = (item: Item, rule: number) =>
  item.k === 'twin' || rule >= 2

// Whether the stress is asked: not of a twin, which sounds as its twin does
export const asksStress = (item: Item) => item.k === 'word'

// A tilde placed on a letter of the word (null for none): right or not
export const tildeRight = (item: Item, at: number | null) =>
  at === (item.mark >= 0 ? item.mark : null)

// How many of each kind a round at each rule asks: the newest rule most,
// and the earlier ones kept up
const MIX: Record<number, Array<[Kind | 'twin', number]>> = {
  1: [
    ['llana', 5],
    ['aguda', 5],
  ],
  2: [
    ['tilde', 5],
    ['llana', 3],
    ['aguda', 2],
  ],
  3: [
    ['esdrujula', 4],
    ['tilde', 3],
    ['llana', 2],
    ['aguda', 1],
  ],
  4: [
    ['hiato', 4],
    ['esdrujula', 2],
    ['tilde', 2],
    ['llana', 1],
    ['aguda', 1],
  ],
  5: [
    ['twin', 4],
    ['hiato', 1],
    ['esdrujula', 2],
    ['tilde', 2],
    ['llana', 1],
  ],
}

// The rule a player has reached, from 1, and whether the last is
// mastered too
export const ruleReached = (bank: Bank) =>
  Math.min(LAST_RULE, Math.max(1, bank.best.acento ?? 1))
export const allMastered = (bank: Bank) => (bank.best.acento ?? 1) > LAST_RULE

// What a round's right answers open: the next rule (or, after the last,
// one past it), if this was the rule reached and the round went well
export function opens(bank: Bank, rule: number, right: number): number | null {
  if (right < MASTERED || rule !== ruleReached(bank) || allMastered(bank))
    return null
  return rule + 1
}

// Up to n of the words, with no more than half of them verbs, which the
// agudas would otherwise be full of (hablar, comer, vivir)
function varied(words: Array<Word>, n: number): Array<Word> {
  const out: Array<Word> = []
  let verbs = 0
  for (const w of words) {
    if (out.length >= n) break
    if (w.pos === 'v' && verbs >= Math.ceil(n / 2)) continue
    if (w.pos === 'v') verbs++
    out.push(w)
  }
  return out
}

// A round of ten for a rule: words the player has met, of each kind as
// many as the rule's mix asks, and where too few are met, the first words
// of the lessons
export function round(
  bank: Bank,
  rule: number,
  random: () => number = Math.random,
): Array<Item> {
  const out: Array<Item> = []
  const mix = MIX[Math.min(LAST_RULE, Math.max(1, rule))]
  for (const [kind, n] of mix) {
    if (kind === 'twin') {
      const met = TWINS.filter((t) => bank.cards[t.id])
      const from = met.length >= n ? met : TWINS
      // (never a twin and its other half in one round)
      const seen = new Set<string>()
      for (const twin of shuffle(from, random)) {
        if (seen.size >= n || seen.has(twin.es) || seen.has(twin.other))
          continue
        const item = twinItem(twin)
        if (!item) continue
        seen.add(twin.es)
        out.push(item)
      }
      continue
    }
    const all = WORDS.filter((w) => KIND[w.id] === kind)
    const met = shuffle(
      all.filter((w) => bank.cards[w.id]),
      random,
    )
    // (the first ones of the lessons, should too few be met)
    const rest = shuffle(
      all.filter((w) => !bank.cards[w.id]).slice(0, 2 * n),
      random,
    )
    // (a spelling once: frío, cold, and el frío, the cold)
    const words = [...met, ...rest].filter(
      (w, i, ws) => ws.findIndex((x) => x.bare === w.bare) === i,
    )
    for (const w of varied(words, n)) {
      const item = wordItem(w)
      if (item) out.push(item)
    }
  }
  return shuffle(out, random)
}

// --- What is said after an answer ---

// The word's last letter, as the rule names it: «vokal», «n», «s», «l»
export function ending(word: string): string {
  const last = word.toLowerCase().slice(-1)
  return /[aeiouáéíóú]/.test(last) ? 'vokal' : last
}

const ORDINAL = ['siste', 'nest siste', 'tredje siste', 'fjerde siste']

// Where the stress falls, counted from the end: «nest siste»
export const fromEnd = (syl: number, at: number) =>
  ORDINAL[syl - 1 - at] ?? `${syl - at}. siste`

// Why a word is written as it is, in a sentence or two, for after the
// answer
export function why(item: Item): string {
  if (item.k === 'twin') {
    const t = item.twin
    const mine = `${t.es} «${t.no}»`
    const other = `${t.other} «${t.otherNo}»`
    const [a, b] = hasTilde(t.es) ? [mine, other] : [other, mine]
    return `${a} og ${b} sies likt. Aksenten skiller dem.`
  }
  const where = fromEnd(item.syl.length, item.stress)
  const end = ending(item.w.bare)
  const endsIn = end === 'vokal' ? 'på vokal' : `på ${end}`
  switch (item.kind) {
    case 'llana':
    case 'aguda':
      return `Slutter ${endsIn} og har trykket på ${where} stavelse, slik regelen sier. Da trengs ingen aksent.`
    case 'tilde':
      return `Slutter ${endsIn}, men har trykket på ${where} stavelse. Det bryter regelen, og da får ordet aksent.`
    case 'esdrujula':
      return `Trykket ligger på ${where} stavelse. Da får ordet alltid aksent.`
    case 'hiato': {
      const v = untilde(/[íú]/.exec(item.syl[item.stress])?.[0] ?? 'í')
      return `Trykket ligger på ${v}, ved siden av en annen vokal. Aksenten viser at de sies hver for seg.`
    }
  }
}
