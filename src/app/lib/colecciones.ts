import { LESSON, LESSONS, WORDS } from '../data/words.ts'
import { THEME, THEME_GROUPS } from '../data/themes.ts'
import { KNOWN } from './bank.ts'
import type { Bank, Card } from './bank.ts'

// The two collections, Los cajones (games/cajones.tsx) and Tu museo
// (games/museo.tsx): rewards to look at, filled by the words learnt, with
// nothing to answer. One rule serves both.
//
// A lesson is begun once one of its words is met: its drawer holds its
// keepsake wrapped in tissue paper. It is finished when every word in it
// is met and four in five are learnt: the paper comes off, and a theme's
// picture is hung in the museum. A theme of 25 words met four a day takes
// a week to meet and two or three more to learn, so a theme chosen is
// finished in a few weeks of play.
//
// Learnt is the bank's «known» without its fading: a word whose reading
// has lasted a day and a half or more (lib/bank.ts, KNOWN), however long
// ago it was practised; only a real slip, which cuts a word's memory, takes
// a word out of the count until it is got right again. And a lesson once
// finished stays so (keep, below): a keepsake is never wrapped up again,
// nor a picture taken down, whether the player was away for a week or
// slipped on a word.

export const FINISHED_SHARE = 0.8

export const learnt = (card: Card | undefined) => !!card && card.leer.s >= KNOWN

// 0 untouched (a drawer shut, an empty frame), 1 begun (wrapped), 2
// finished (unwrapped, hung)
export type Stage = 0 | 1 | 2

export interface LessonProgress {
  lesson: string
  size: number
  met: number
  learnt: number
  // Words learnt it takes to be finished
  need: number
  stage: Stage
  // How far towards finished, 0–1: meeting the words and learning them,
  // half each
  toward: number
}

const SIZE: Record<string, number> = {}
for (const w of WORDS) SIZE[w.lesson] = (SIZE[w.lesson] ?? 0) + 1

const IDS: Record<string, Array<string>> = {}
for (const w of WORDS) (IDS[w.lesson] ??= []).push(w.id)

export function progressOf(bank: Bank, lesson: string): LessonProgress {
  const ids = IDS[lesson] ?? []
  let met = 0
  let got = 0
  for (const id of ids) {
    const c = bank.cards[id]
    if (c) met++
    if (learnt(c)) got++
  }
  const size = ids.length
  const need = Math.ceil(FINISHED_SHARE * size)
  const done = !!bank.kept[lesson] || (size > 0 && met === size && got >= need)
  return {
    lesson,
    size,
    met,
    learnt: got,
    need,
    stage: done ? 2 : met > 0 ? 1 : 0,
    toward: done
      ? 1
      : size
        ? 0.5 * (met / size) + 0.5 * Math.min(1, got / Math.max(1, need))
        : 0,
  }
}

// The lessons found finished, noted in the bank (bank.kept) so that they
// stay finished whatever comes after: the store passes every change to the
// bank through this, before and after it (lib/store.tsx)
export function keep(bank: Bank, now: number): Bank {
  let kept: Bank['kept'] | undefined
  for (const lesson of Object.keys(IDS))
    if (!bank.kept[lesson] && progressOf(bank, lesson).stage === 2)
      (kept ??= { ...bank.kept })[lesson] = now
  return kept ? { ...bank, kept } : bank
}

// How far a lesson has come, in a line
export function howFar(p: LessonProgress): string {
  if (p.stage === 0) return `Ingen av de ${p.size} ordene er møtt ennå.`
  if (p.stage === 2)
    return p.met === p.size
      ? `Alle de ${p.size} ordene er møtt, og ${p.learnt} er lært.`
      : `Fullført, og ${p.learnt} av de ${p.size} ordene er lært nå.`
  const left = p.need - p.learnt
  if (p.met < p.size)
    return `${p.met} av ${p.size} ord er møtt, og ${p.learnt} er lært.`
  return `Alle de ${p.size} ordene er møtt, og ${p.learnt} er lært. ${left} til, så er emnet fullført.`
}

// The rule, as the pages say it
export const RULE =
  'Et emne er fullført når alle ordene er møtt og fire av fem er lært, det vil si husket i halvannet døgn eller mer. Da forblir det fullført, også om du bommer på et ord senere.'

export interface Chest {
  id: string
  es: string
  no: string
  lessons: Array<string>
}

// The chests of drawers: the first lessons, those that are no theme, in
// one; then a chest for each group of themes, in the home page's order
export function chests(): Array<Chest> {
  const first = LESSONS.filter((l) => !THEME[l.id]).map((l) => l.id)
  return [
    { id: 'primero', es: 'Lo primero', no: 'Det første', lessons: first },
    ...THEME_GROUPS.map((g) => ({
      id: g.id,
      es: g.es,
      no: g.no,
      lessons: g.themes.map((t) => t.lesson).filter((id) => LESSON[id]),
    })),
  ].filter((c) => c.lessons.length)
}

// The museum's rooms: a group of themes each, with themes that have words
export const rooms = () =>
  THEME_GROUPS.map((g) => ({
    ...g,
    themes: g.themes.filter((t) => LESSON[t.lesson]),
  })).filter((g) => g.themes.length)

// Of all lessons, those begun and those finished
export function tally(bank: Bank, lessons: Array<string>) {
  let begun = 0
  let done = 0
  for (const l of lessons) {
    const s = progressOf(bank, l).stage
    if (s > 0) begun++
    if (s === 2) done++
  }
  return { begun, done, all: lessons.length }
}

export const allLessons = () => LESSONS.map((l) => l.id)
export const allThemes = () =>
  rooms().flatMap((r) => r.themes.map((t) => t.lesson))
