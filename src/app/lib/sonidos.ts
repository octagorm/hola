import { WORD, WORDS } from '../data/words.ts'
import { CONTRASTS } from '../data/sonidos.ts'
import { pick, recall } from './bank.ts'
import { shuffle } from './choices.ts'
import { FOREIGN, unaccent } from './spanish.ts'
import type { Contrast, SoundId } from '../data/sonidos.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// Sonidos: the ear, which hears one of two or three words that sound
// alike and picks it, and the dictation, which hears a word and writes it.

// --- The ear ---

export const EAR_ROUND = 10
// A round on the sounds of one place in the chart
export const FOCUS_ROUND = 6

// Picking the word heard among look-alikes is hearing it (oír), as a
// choice among few: right says something (0.6); wrong says a little (0.3),
// as a slip between two sounds says more about the ear than about the word
export const HEARD = 0.6
export const MISHEARD = 0.3

export const wordsOf = (c: Contrast): Array<Word> =>
  c.words.map((id) => WORD[id]).filter((w): w is Word => !!w)

// The text said and shown for a word of a set: without its article where
// the articles would tell the words apart
export const spoken = (c: Contrast, w: Word) => (c.bare ? w.bare : w.es)

// Everything the ear says that is not a word of the bank as listed:
// nouns said without their article
export const SAID: Array<string> = [
  ...new Set(
    CONTRASTS.flatMap((c) =>
      c.bare ? wordsOf(c).filter((w) => w.pos === 'n') : [],
    ).map((w) => w.bare),
  ),
]

export interface EarItem {
  c: Contrast
  // The word said, and the words to pick from, in the order shown
  w: Word
  options: Array<Word>
}

// How much a word's hearing needs practice: the more faded, the more; a
// word not met in between
function need(bank: Bank, w: Word, now: number): number {
  const card = bank.cards[w.id]
  return card ? 1 - recall(card.oir, now) : 0.35
}

// A round for the ear: of the sets of look-alikes, those whose words'
// hearing has faded most, one word said from each; or, on the sounds of
// one place in the chart, its sets' words in turn, again if they are few
export function earRound(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
  focus?: SoundId,
): Array<EarItem> {
  const sets = CONTRASTS.filter((c) => !focus || c.sounds.includes(focus))
  const score = (w: Word) => need(bank, w, now) + random() * 0.5
  if (!focus) {
    return shuffle(
      sets
        .map((c) => {
          const ws = wordsOf(c)
          const top = ws
            .map((w) => ({ w, s: score(w) }))
            .sort((a, b) => b.s - a.s)[0]
          return { c, w: top.w, s: top.s, ws }
        })
        .sort((a, b) => b.s - a.s)
        .slice(0, EAR_ROUND)
        .map(({ c, w, ws }) => ({ c, w, options: shuffle(ws, random) })),
      random,
    )
  }
  const pairs = shuffle(
    sets.flatMap((c) => wordsOf(c).map((w) => ({ c, w }))),
    random,
  )
  const out: Array<EarItem> = []
  for (let i = 0; pairs.length && out.length < FOCUS_ROUND; i++) {
    const { c, w } = pairs[i % pairs.length]
    // (not the same word twice in a row, when they come round again)
    if (out.at(-1)?.w === w) continue
    out.push({ c, w, options: shuffle(wordsOf(c), random) })
  }
  return out
}

// --- The dictation ---

export const DICTATION = 8

// A word for the dictation: one word, in Spanish letters, no name, and
// spelt by the rules the chart has (not with k, w or x)
export const dictable = (w: Word) =>
  /^[a-zñáéíóúü]{3,10}$/.test(w.bare) &&
  !/[kwx]/.test(w.bare) &&
  !FOREIGN.has(w.bare)

// What makes a word worth writing down: the spellings of one sound
const TRAPS: Array<[string, RegExp]> = [
  ['bv', /[bv]/],
  ['h', /(^|[^c])h/],
  ['z', /z|c[eiéí]/],
  ['j', /j|g[eiéí]/],
  ['ll', /ll|y/],
  ['k', /qu/],
  ['g', /gu[eiéí]|gü/],
  ['ñ', /ñ/],
  ['rr', /rr/],
]

const trapsOf = (w: Word) =>
  TRAPS.filter(([, re]) => re.test(w.bare)).map(([t]) => t)

// A dictation: words met with something to watch for in their spelling,
// those whose hearing has faded most, as many spellings as can be among
// them; where too few are met, the first words of the lessons
export function dictation(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Array<Word> {
  const fit = (w: Word) => dictable(w) && trapsOf(w).length > 0
  const pool = pick(bank, 6 * DICTATION, now, { fit, link: 'oir', random })
  if (pool.length < DICTATION)
    pool.push(
      ...WORDS.filter((w) => fit(w) && !pool.includes(w)).slice(
        0,
        DICTATION - pool.length,
      ),
    )
  // Each spelling once before any twice
  const out: Array<Word> = []
  const seen = new Set<string>()
  const spelt = new Set<string>()
  for (const w of pool) {
    if (out.length >= DICTATION) break
    if (spelt.has(w.bare) || trapsOf(w).every((t) => seen.has(t))) continue
    out.push(w)
    spelt.add(w.bare)
    for (const t of trapsOf(w)) seen.add(t)
  }
  for (const w of pool) {
    if (out.length >= DICTATION) break
    if (spelt.has(w.bare)) continue
    out.push(w)
    spelt.add(w.bare)
  }
  return shuffle(out, random)
}

// A word as the dictation compares it: lower case, no accent marks, ü as u
// (neither can be typed on the game's keys), ñ kept
export const flat = (s: string) => unaccent(s.toLowerCase())

// What a word written wrong may have heard right: a sound spelt another
// way than the word has it, or two sounds that Spain keeps apart. Each
// with a way to make both spellings alike.
export type Slip =
  'h' | 'gu' | 'gj' | 'k' | 'z' | 'sz' | 'bv' | 'lly' | 'rr' | 'ñ' | 'y'

const SAME: Array<[Slip, (s: string) => string]> = [
  ['h', (s) => s.replace(/(^|[^c])h/g, '$1')],
  ['gu', (s) => s.replace(/gu(?=[ei])/g, 'g')],
  ['gj', (s) => s.replace(/g(?=[ei])/g, 'j')],
  [
    'k',
    (s) =>
      s.replace(/qu(?=[ei])/g, 'k').replace(/c(?=[aou]|[^aeiouh]|$)/g, 'k'),
  ],
  ['z', (s) => s.replace(/c(?=[ei])/g, 'z')],
  ['sz', (s) => s.replace(/c(?=[ei])/g, 's').replace(/z/g, 's')],
  ['bv', (s) => s.replace(/v/g, 'b')],
  ['lly', (s) => s.replace(/ll/g, 'y')],
  ['rr', (s) => s.replace(/rr/g, 'r')],
  ['ñ', (s) => s.replace(/ñ/g, 'n')],
  ['y', (s) => s.replace(/y$/, 'i')],
]

// What to know about each slip, after the answer
export const SLIP_NOTE: Record<Slip, string> = {
  h: 'H sies ikke, men skrives.',
  gu: 'Foran e og i skrives g-lyden gu. Med bare g leses det som j.',
  gj: 'Foran e og i høres g og j likt, så ordet må læres med riktig bokstav.',
  k: 'K-lyden skrives c foran a, o og u, og qu foran e og i.',
  z: 'Læspelyden skrives z foran a, o og u, og c foran e og i.',
  sz: 'S og z er to ulike lyder: z, og c foran e og i, sies med tungen mellom tennene.',
  bv: 'B og v sies likt, så ordet må læres med riktig bokstav.',
  lly: 'Ll og y sies likt, så ordet må læres med riktig bokstav.',
  rr: 'Rr ruller, mens r mellom vokaler er ett slag med tungen.',
  ñ: 'Ñ er n og j i én lyd, n er bare n.',
  y: 'Til slutt i ordet, etter en vokal, skrives i-lyden y.',
}

const key = (s: string, slips: Array<Slip>) =>
  SAME.reduce((t, [slip, f]) => (slips.includes(slip) ? f(t) : t), s)

export interface Checked {
  right: boolean
  // For a word written wrong, what may have been heard right but spelt
  // otherwise; empty if it was heard otherwise
  slips: Array<Slip>
  // The letters of the word that were not as written
  marks: Array<boolean>
}

// The letters of `want` that `got` does not have where it should: by the
// fewest letters changed, added or left out
export function marks(got: string, want: string): Array<boolean> {
  const a = flat(got)
  const b = flat(want)
  const d = Array.from({ length: a.length + 1 }, (_r, i) =>
    Array.from({ length: b.length + 1 }, (_c, j) => (i ? (j ? 0 : i) : j)),
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
      )
  const out = Array.from({ length: b.length }, () => false)
  let i = a.length
  let j = b.length
  while (j > 0) {
    if (
      i > 0 &&
      d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
    ) {
      out[j - 1] = a[i - 1] !== b[j - 1]
      i--
      j--
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) i--
    else {
      out[j - 1] = true
      j--
    }
  }
  return out
}

// A word written down from its sound: right if its letters are the
// word's, accent marks aside; else what was likely heard right but spelt
// otherwise, the fewest such slips that make the two alike
export function check(typed: string, w: Word): Checked {
  const got = flat(typed.trim())
  const want = flat(w.bare)
  if (got === want) return { right: true, slips: [], marks: [] }
  const may = SAME.map(([s]) => s).filter(
    (s) => key(got, [s]) !== got || key(want, [s]) !== want,
  )
  let slips: Array<Slip> = []
  let fewest = Infinity
  for (let m = 1; m < 1 << may.length; m++) {
    const set = may.filter((_, i) => m & (1 << i))
    if (set.length >= fewest) continue
    if (key(got, set) === key(want, set)) {
      slips = set
      fewest = set.length
    }
  }
  return { right: false, slips, marks: marks(got, want) }
}
