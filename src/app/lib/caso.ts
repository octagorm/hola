import { wordIds } from './text.ts'
import type { Story } from '../data/stories.ts'
import type { Link } from './bank.ts'

// A story told by ear (data/stories.ts, `listen`; El caso del reloj
// perdido), read in games/story.tsx: what a chapter's words count for once
// its questions are answered, a line's sound wave as drawn, and the
// inspector's notebook. Apart from the page, so that they can be tested.

// Right answers of three that show a chapter was understood by ear
export const UNDERSTOOD = 2

// What the words of a chapter count for, once its questions are answered:
// those in a line whose text was seen, read; those in a line only heard,
// heard, when the answers show it was understood. A word looked up, or not
// met yet, counts for neither. `seen` is the lines whose text was shown,
// counted from 0, or null where every line was, as in a story read.
export function credit(
  lines: ReadonlyArray<string>,
  seen: ReadonlySet<number> | null,
  looked: ReadonlySet<string>,
  score: number,
  met: (id: string) => boolean,
): Array<{ id: string; link: Link }> {
  const read = new Set<string>()
  const heard = new Set<string>()
  lines.forEach((line, i) => {
    const into = !seen || seen.has(i) ? read : heard
    for (const id of wordIds(line)) into.add(id)
  })
  const counts = (id: string) => !looked.has(id) && met(id)
  return [
    ...[...read].filter(counts).map((id) => ({ id, link: 'leer' as const })),
    ...(score >= UNDERSTOOD ? [...heard] : [])
      .filter(counts)
      .map((id) => ({ id, link: 'oir' as const })),
  ]
}

// A line's sound wave as drawn while its text is hidden: a bar for every
// few letters, high on the vowels, low between words and flat at a pause,
// so that a long line draws a long wave. Heights from 0 to 1, the same
// for the same line each time.
export function wave(text: string): Array<number> {
  const level: Array<number> = [...text].map((ch) =>
    /[aeiouáéíóúü]/i.test(ch)
      ? 1
      : /\p{L}/u.test(ch)
        ? 0.6
        : ch === ' '
          ? 0.25
          : 0,
  )
  const n = Math.max(6, Math.min(56, Math.round(level.length / 2.4)))
  // A little unevenness, from the text itself
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const bars: Array<number> = []
  for (let b = 0; b < n; b++) {
    const from = Math.floor((b * level.length) / n)
    const to = Math.max(from + 1, Math.floor(((b + 1) * level.length) / n))
    const part = level.slice(from, to)
    const mean = part.reduce((sum, x) => sum + x, 0) / part.length
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    const uneven = 0.6 + (((h >>> 0) % 1000) / 1000) * 0.4
    bars.push(Math.round(Math.max(0.12, mean * uneven) * 100) / 100)
  }
  return bars
}

// The inspector's notebook: a line for each chapter with a clue, written
// in once the chapter is read
export interface Note {
  n: number
  id: string
  clue?: string
}

export const notes = (
  story: Story,
  read: Readonly<Record<string, number | undefined>>,
): Array<Note> =>
  story.chapters.flatMap((c, i) =>
    c.clue === undefined
      ? []
      : [
          {
            n: i + 1,
            id: c.id,
            clue: read[c.id] === undefined ? undefined : c.clue,
          },
        ],
  )
