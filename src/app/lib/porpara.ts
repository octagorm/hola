import { GAPS, RULES } from '../data/porpara.ts'
import { shuffle } from './choices.ts'
import type { Answer, Gap } from '../data/porpara.ts'
import type { Bank } from './bank.ts'

// Por o para: a sentence with a gap, and two doors to pick from. A round is
// ten sentences, four to six of them para, no rule more than twice, those
// whose words are met first and those seen in the last rounds last.

export const ROUND = 10

// Sentences seen lately, kept by the page so that the next rounds have
// others (newest first)
export const RECENT = 30

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// The Spanish before the gap and after it
export function parts(g: Gap): [string, string] {
  const i = g.es.indexOf('_')
  return [g.es.slice(0, i), g.es.slice(i + 1)]
}

// Whether the gap starts a sentence, and so takes a capital: «¡Por fin…»,
// «Hace frío. Por eso…»
export function atStart(g: Gap): boolean {
  const [before] = parts(g)
  return /^[¡¿]?$/.test(before) || /[.!?]\s+[¡¿]?$/.test(before)
}

// The word in the gap, as written there
export const inGap = (g: Gap) => (atStart(g) ? capital(g.a) : g.a)

// The sentence whole, as it is shown and said once answered
export const whole = (g: Gap) => g.es.replace('_', inGap(g))

// Why it is por or para, in a line
export function why(g: Gap): string {
  if (g.expr) return `«${capital(g.expr[0])}» betyr «${g.expr[1]}».`
  return RULES[g.rule].why
}

// The ten sentences of a round
export function round(
  bank: Bank,
  random: () => number = Math.random,
  recent: Array<string> = [],
): Array<Gap> {
  const seen = new Set(recent)
  const ranked = GAPS.map((g) => ({
    g,
    k:
      random() -
      0.6 * g.words.filter((id) => !bank.cards[id]).length -
      (seen.has(g.es) ? 10 : 0),
  }))
    .sort((a, b) => b.k - a.k)
    .map((x) => x.g)
  const paras = 4 + Math.floor(random() * 3)
  const left: Record<Answer, number> = { para: paras, por: ROUND - paras }
  const perRule: Record<string, number | undefined> = {}
  const out: Array<Gap> = []
  for (const g of ranked) {
    if (out.length >= ROUND) break
    if (left[g.a] <= 0 || (perRule[g.rule] ?? 0) >= 2) continue
    out.push(g)
    left[g.a]--
    perRule[g.rule] = (perRule[g.rule] ?? 0) + 1
  }
  return shuffle(out, random)
}

// The sentences seen lately, with a round's added
export const remember = (recent: Array<string>, gaps: Array<Gap>) =>
  [
    ...gaps.map((g) => g.es),
    ...recent.filter((k) => !gaps.some((g) => g.es === k)),
  ].slice(0, RECENT)
