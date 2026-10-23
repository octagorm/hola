import { WORDS } from '../data/words.ts'
import { pick } from './bank.ts'
import type { Word } from '../data/words.ts'
import type { Bank } from './bank.ts'

// ¿El o la?: a noun's article against the clock. The nouns met come one at
// a time without their article, and the player says el or la; a wrong
// answer shows the article, and the rule behind it where there is one.
// Among them come the exceptions, often: el agua, la mano, el día.

export type Article = 'el' | 'la'

// A run lasts a minute
export const RUN = 60_000

// The article a noun is said with in the singular: el agua, though agua
// is feminine
export const articleOf = (w: Word): Article =>
  w.es.startsWith('la ') ? 'la' : 'el'

// Nouns that both articles are right for: el azúcar and la azúcar, and
// el or la taxista by who drives
const EITHER = new Set([
  'el azúcar',
  'el taxista',
  'el turista',
  'el periodista',
  'el cantante',
  'el pariente',
  'el bebé',
])

// The nouns that can be asked: singular ones (not los padres), of one
// gender, and not names (la Alhambra, el Guggenheim), whose article comes
// from what they name
export const askable = (w: Word) =>
  w.pos === 'n' &&
  !w.pl &&
  !EITHER.has(w.id) &&
  w.bare.charAt(0) === w.bare.charAt(0).toLowerCase()

export interface Rule {
  // stress: feminine, but el before a stressed a; exception: a noun of a
  // gender its ending does not give; person: a man or a woman; group: the
  // days of the week, the languages; ending: the rule of its ending
  kind: 'stress' | 'exception' | 'person' | 'group' | 'ending'
  // In Norwegian, with the Spanish between asterisks
  text: string
}

// Feminine nouns that begin with a stressed a (or ha) take el in the
// singular, and are feminine still
const STRESSED: Record<string, string> = {
  'el agua':
    '*Agua* er hunkjønn, men får *el* fordi trykket ligger på a-en: *el agua fría*.',
  'el hambre':
    '*Hambre* er hunkjønn, men får *el* fordi trykket ligger på a-en (h-en er stum): *tengo mucha hambre*.',
  'el ama':
    '*Ama* er hunkjønn, men får *el* fordi trykket ligger på a-en. I flertall: *las amas*.',
  'el alma':
    '*Alma* er hunkjønn, men får *el* fordi trykket ligger på a-en. I flertall: *las almas*.',
}

// Nouns of a gender their ending does not give
const EXCEPTIONS: Record<string, string> = {
  'la mano': '*La mano* er et unntak: hunkjønn, selv om ordet ender på *-o*.',
  'la foto': '*La foto* er kort for *la fotografía*, og beholder hunkjønnet.',
  'la radio':
    '*La radio* er kort for *la radiodifusión*, og beholder hunkjønnet.',
  'el día': '*El día* er et unntak: hankjønn, selv om ordet ender på *-a*.',
  'el mediodía': '*El mediodía* er hankjønn, som *el día*.',
  'el mapa': '*El mapa* er et unntak: hankjønn, selv om ordet ender på *-a*.',
  'el sofá': '*El sofá* er et unntak: hankjønn, selv om ordet ender på *-á*.',
  'el cura': '*El cura* er presten, en mann, og får *el*. *La cura* betyr kur.',
  'el cava':
    '*El cava* er vinen, og er hankjønn som *el vino*. *La cava* er vinkjelleren.',
  'el clima': 'Ord fra gresk på *-ma* er hankjønn: *el clima*, *el problema*.',
  'el idioma':
    'Ord fra gresk på *-ma* er hankjønn: *el idioma*, *el problema*.',
  'el drama': 'Ord fra gresk på *-ma* er hankjønn: *el drama*, *el problema*.',
  'el fantasma':
    'Ord fra gresk på *-ma* er hankjønn: *el fantasma*, *el problema*.',
  'el arte':
    '*El arte* er hankjønn i entall, men ofte hunkjønn i flertall: *las bellas artes*.',
  'el avión':
    'Ord på *-ión* er som regel hunkjønn, men *avión* er et unntak: *el avión*.',
  'la flor':
    'Ord på *-or* er som regel hankjønn, men *flor* er et unntak: *la flor*.',
}

// Words for a man take el, for a woman la, whatever their ending
const MEN = new Set(['el hombre', 'el padre', 'el rey', 'el califa'])
const WOMEN = new Set(['la mujer', 'la madre'])

const DAYS = new Set([
  'el lunes',
  'el martes',
  'el miércoles',
  'el jueves',
  'el viernes',
  'el sábado',
  'el domingo',
])

const LANGUAGES = new Set(['el catalán', 'el euskera'])

// What an ending says of a noun's gender, the longest endings first
export const ENDINGS: Array<{ end: string; art: Article; text: string }> = [
  { end: 'ión', art: 'la', text: 'Ord på *-ión* er som regel hunkjønn.' },
  { end: 'dad', art: 'la', text: 'Ord på *-dad* er hunkjønn.' },
  { end: 'aje', art: 'el', text: 'Ord på *-aje* er hankjønn.' },
  { end: 'or', art: 'el', text: 'Ord på *-or* er som regel hankjønn.' },
  { end: 'ón', art: 'el', text: 'Ord på *-ón* er som regel hankjønn.' },
  { end: 'o', art: 'el', text: 'Ord på *-o* er som regel hankjønn.' },
  { end: 'a', art: 'la', text: 'Ord på *-a* er som regel hunkjønn.' },
]

// The noun a noun of several words is said by: its first word (molino de
// viento by molino), but for an adjective that comes first
const HEAD: Record<string, string> = { 'la media ración': 'ración' }

const headOf = (w: Word) => HEAD[w.id] ?? w.bare.split(' ')[0]

// The ending rule a noun falls under, by its head, whether or not the noun
// keeps it
export const endingOf = (w: Word) => {
  const head = headOf(w)
  return ENDINGS.find((e) => head.endsWith(e.end))
}

// The rule that gives a noun its article, or null where its gender has to
// be learnt with it (la leche, el pan). A noun of several words has the
// rule of its head: el día de Sant Jordi that of el día.
export function ruleOf(w: Word): Rule | null {
  const head = `${articleOf(w)} ${headOf(w)}`
  const stressed = STRESSED[w.id] ?? STRESSED[head]
  if (stressed) return { kind: 'stress', text: stressed }
  const exception = EXCEPTIONS[w.id] ?? EXCEPTIONS[head]
  if (exception) return { kind: 'exception', text: exception }
  if (MEN.has(w.id))
    return { kind: 'person', text: 'Ord for en mann er hankjønn.' }
  if (WOMEN.has(w.id))
    return { kind: 'person', text: 'Ord for en kvinne er hunkjønn.' }
  if (DAYS.has(w.id))
    return {
      kind: 'group',
      text: 'Ukedagene er hankjønn: *el lunes*, *el domingo*.',
    }
  if (LANGUAGES.has(w.id))
    return {
      kind: 'group',
      text: 'Språkene er hankjønn: *el catalán*, *el euskera*.',
    }
  const e = endingOf(w)
  return e && e.art === articleOf(w) ? { kind: 'ending', text: e.text } : null
}

// The exceptions, which come round often: el before a stressed a, and
// nouns of a gender their ending does not give (el día, el euskera)
export const isException = (w: Word) => {
  const k = ruleOf(w)?.kind
  const e = endingOf(w)
  return k === 'stress' || k === 'exception' || (!!e && e.art !== articleOf(w))
}

// Every third card is an exception, while there are some
const EVERY = 3

// The cards of a run: the nouns met, those whose article has faded most
// first, with an exception every third card while the player has met any
export function deal(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
  size = 60,
): Array<Word> {
  const odd = pick(bank, size, now, {
    fit: (w) => askable(w) && isException(w),
    link: 'decir',
    random,
  })
  const rest = pick(bank, size, now, {
    fit: (w) => askable(w) && !isException(w),
    link: 'decir',
    random,
  })
  const out: Array<Word> = []
  while (out.length < size && (odd.length || rest.length)) {
    const fromOdd =
      odd.length > 0 && (out.length % EVERY === 1 || rest.length === 0)
    out.push((fromOdd ? odd : rest).shift() as Word)
  }
  return out
}

// How many nouns the player has met that can be asked
export const nounsMet = (bank: Bank) =>
  WORDS.filter((w) => askable(w) && bank.cards[w.id]).length

// Fewer than this makes no run
export const LEAST = 8
