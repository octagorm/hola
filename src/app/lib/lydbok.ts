import TIMES from '../data/lydbok-times.json'
import { AUDIOBOOKS } from '../data/lydbok.ts'
import type { Audiobook } from '../data/lydbok.ts'

// A book put together by scripts/lydbok.py: its file in public/, how long
// it is, and when each part begins (chapter, line: -2 the guide's
// Norwegian, -1 the title; seconds)
export interface Made {
  file: string
  seconds: number
  marks: Array<[number, number, number]>
}

export const MADE = TIMES as Record<string, Made | undefined>

export const BOOK: Record<string, Audiobook | undefined> = Object.fromEntries(
  AUDIOBOOKS.map((b) => [b.id, b]),
)

// The part playing at a time: the last mark begun
export function markAt(made: Made, t: number): [number, number] | null {
  let at: [number, number] | null = null
  for (const [c, l, s] of made.marks) {
    if (s > t + 0.05) break
    at = [c, l]
  }
  return at
}

// "18 min"
export const minutes = (seconds: number) =>
  `${Math.max(1, Math.round(seconds / 60))} min`
