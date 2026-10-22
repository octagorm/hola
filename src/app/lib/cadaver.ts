import { ADJECTIVES, SUBJECTS, THINGS, VERBS } from '../data/grammar.ts'
import { shuffle } from './choices.ts'
import { plural } from './spanish.ts'
import type { Adjective, Subject, Thing, Verb } from '../data/grammar.ts'

// One sentence of Cadáver exquisito: someone does something to a thing of
// some kind, drawn at random. The verb has to agree with whoever does it,
// and the adjective with the thing, in gender and number.

export interface Sentence {
  subject: Subject
  verb: Verb
  thing: Thing
  many: boolean
  adjective: Adjective
}

const pickOne = <T>(xs: Array<T>, random: () => number) =>
  xs[Math.floor(random() * xs.length)]

export function draw(random: () => number = Math.random): Sentence {
  return {
    subject: pickOne(SUBJECTS, random),
    verb: pickOne(VERBS, random),
    thing: pickOne(THINGS, random),
    many: random() < 0.4,
    adjective: pickOne(ADJECTIVES, random),
  }
}

// An adjective's four forms: masculine and feminine, singular and plural.
// One that ends in -e or a consonant has one form for both genders.
export function forms(a: Adjective): {
  ms: string
  fs: string
  mp: string
  fp: string
} {
  if (a.es.endsWith('o')) {
    const stem = a.es.slice(0, -1)
    return { ms: a.es, fs: `${stem}a`, mp: `${stem}os`, fp: `${stem}as` }
  }
  const pl = plural(a.es)
  return { ms: a.es, fs: a.es, mp: pl, fp: pl }
}

export const verbForm = (s: Sentence) => s.verb.forms[s.subject.person]

export function adjectiveForm(s: Sentence): string {
  const f = forms(s.adjective)
  if (s.thing.g === 'm') return s.many ? f.mp : f.ms
  return s.many ? f.fp : f.fs
}

// The thing with its article: un reloj, unas langostas
export function thingPhrase(s: Sentence): string {
  const art =
    s.thing.g === 'm' ? (s.many ? 'unos' : 'un') : s.many ? 'unas' : 'una'
  return `${art} ${s.many ? plural(s.thing.es) : s.thing.es}`
}

export const spanish = (s: Sentence) =>
  `${s.subject.es} ${verbForm(s)} ${thingPhrase(s)} ${adjectiveForm(s)}.`

// What it means: Maurene spiser en myk klokke.
export function norwegian(s: Sentence): string {
  const [en, et, pl] = s.adjective.no
  const object = s.many
    ? `noen ${pl} ${s.thing.noPl}`
    : s.thing.neuter
      ? `et ${et} ${s.thing.no}`
      : `en ${en} ${s.thing.no}`
  return `${s.subject.no} ${s.verb.no} ${object}.`
}

// The forms to pick the verb from: the right one and others of the same
// verb, four in all
export function verbOptions(
  s: Sentence,
  random: () => number = Math.random,
): Array<string> {
  const right = verbForm(s)
  const rest = shuffle(
    [...new Set(s.verb.forms)].filter((f) => f !== right),
    random,
  ).slice(0, 3)
  return shuffle([right, ...rest], random)
}

// The adjective's forms to pick from: two for one with a form for both
// genders, four for one ending in -o
export function adjectiveOptions(
  s: Sentence,
  random: () => number = Math.random,
): Array<string> {
  const f = forms(s.adjective)
  return shuffle([...new Set([f.ms, f.fs, f.mp, f.fp])], random)
}

// Why a wrong pick is wrong, in Norwegian
export function whyVerb(s: Sentence): string {
  const who = ['jeg', 'du', 'han eller hun', 'vi', 'dere', 'de'][
    s.subject.person
  ]
  return `Det heter ${verbForm(s)}: ${s.subject.es} er «${who}», og da blir ${s.verb.inf} til ${verbForm(s)}.`
}

export function whyAdjective(s: Sentence): string {
  const kind = s.thing.g === 'm' ? 'hankjønn' : 'hunkjønn'
  const n = s.many ? 'flertall' : 'entall'
  return `Det heter ${adjectiveForm(s)}: ${s.many ? plural(s.thing.es) : s.thing.es} er ${kind} og ${n}.`
}
