import { SENTENCES } from '../data/tiempos.ts'
import { WORDS } from '../data/words.ts'
import { due } from './bank.ts'
import { shuffle } from './choices.ts'
import type { Level, Sentence, Time, Who } from '../data/tiempos.ts'
import type { Bank } from './bank.ts'

// Ayer, hoy, mañana: a sentence stands in one of three panels, yesterday,
// today and tomorrow, and is moved to another, its verb picked from four.
// A round is eight moves, two from each level, easiest first.

export const ROUND = 8

export interface Move {
  s: Sentence
  from: Time
  to: Time
  // The forms to pick from, in the order shown
  options: Array<string>
}

const capital = (x: string) => x.charAt(0).toUpperCase() + x.slice(1)

// The verb's form in a version: what is in brackets
export function form(s: Sentence, t: Time): string {
  const m = /\[(.+?)\]/.exec(s[t].es)
  if (!m) throw new Error(`No form in "${s[t].es}"`)
  return m[1]
}

// The version before the verb's form and after it
export function around(s: Sentence, t: Time): [string, string] {
  const v = s[t].es
  return [v.slice(0, v.indexOf('[')), v.slice(v.indexOf(']') + 1)]
}

// The version as written and said
export const plain = (s: Sentence, t: Time) => s[t].es.replace(/[[\]]/g, '')

// The forms to pick from to put a sentence into `t`: the right one, the
// others' that are wrong there, and the forms for the wrong person. Never
// the present for mañana («mañana como paella» is good Spanish too), nor
// «ir a» for hoy («hoy voy a comer paella»).
export function options(
  s: Sentence,
  t: Time,
  random: () => number = Math.random,
): Array<string> {
  const past = form(s, 'ayer')
  const now = form(s, 'hoy')
  const next = form(s, 'manana')
  const all =
    t === 'ayer'
      ? [past, now, next, s.ayer.miss]
      : t === 'hoy'
        ? [now, past, s.hoy.miss, s.ayer.miss]
        : [next, past, s.manana.miss, s.ayer.miss]
  return shuffle(all, random)
}

// The time each panel stands for, as the game has it
export const TENSE: Record<Time, string> = {
  ayer: 'Med ayer står verbet i fortid.',
  hoy: 'Med hoy står verbet i nåtid.',
  manana: 'Med mañana brukes ir a og infinitiv.',
}

// Whose form the wrong person's is (data/tiempos.ts)
const MISS: Record<Who, string> = {
  yo: 'él og ella',
  tú: 'él og ella',
  ellos: 'él og ella',
  él: 'yo',
  ella: 'yo',
  usted: 'yo',
  nosotros: 'ellos',
  vosotros: 'ellos',
}

// What to say of a pick that was wrong: the person, if only the person was
// wrong, else the time
export function why(s: Sentence, t: Time, picked: string): string {
  const right = form(s, t)
  if (picked === s[t].miss)
    return `Det heter ${right}. ${capital(picked)} hører til ${MISS[s.who]}, men her er det ${s.who}.`
  return `Det heter ${right}. ${TENSE[t]}`
}

// The eight moves of a round: two sentences from each level, the verbs
// that most need saying first (those met before those not) and each verb
// once if it can be; the first move from today to yesterday, the easiest
const PAIRS: Array<[Time, Time]> = [
  ['hoy', 'ayer'],
  ['hoy', 'manana'],
  ['ayer', 'hoy'],
  ['ayer', 'manana'],
  ['manana', 'hoy'],
  ['manana', 'ayer'],
  ['hoy', 'manana'],
]

export function round(
  bank: Bank,
  now: number,
  random: () => number = Math.random,
): Array<Move> {
  const recall = new Map(
    due(bank, now, WORDS, 'decir').map((d) => [d.w.id, d.r]),
  )
  const used = new Set<string>()
  const picked: Array<Sentence> = []
  for (const level of [1, 2, 3, 4] as Array<Level>) {
    const ranked = SENTENCES.filter((s) => s.level === level)
      .map((s) => {
        const r = recall.get(s.verb)
        return { s, k: (r === undefined ? -1 : 1 - r) + random() * 0.6 }
      })
      .sort((a, b) => b.k - a.k)
      .map((x) => x.s)
    const fresh = ranked.filter((s) => !used.has(s.verb))
    for (const s of [...fresh, ...ranked]
      .filter((x, i, xs) => xs.indexOf(x) === i)
      .slice(0, 2)) {
      picked.push(s)
      used.add(s.verb)
    }
  }
  const pairs: Array<[Time, Time]> = [
    ['hoy', 'ayer'],
    ...shuffle(PAIRS, random),
  ]
  return picked.map((s, i) => {
    const [from, to] = pairs[i]
    return { s, from, to, options: options(s, to, random) }
  })
}
