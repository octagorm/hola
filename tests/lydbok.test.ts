import { describe, expect, it } from 'vitest'
import { AUDIOBOOKS, PAUSE, spokenText } from '../src/app/data/lydbok'
import { KNOWN_AT_START, PRACTISED_AT_START } from '../src/app/data/start'
import { VOICES } from '../src/app/data/voices'
import { MADE, markAt } from '../src/app/lib/lydbok'
import { tokens } from '../src/app/lib/text'
import type { Audiobook } from '../src/app/data/lydbok'

// About how long a text takes to say, at the hosts' and the narrator's
// calm pace: letters a second (as the first book was read, 7.4)
const PACE = 7.4

const said = (text: string) => text.replace(/[\W\d_]/g, '').length / PACE

// How long a book will be, roughly, before it is read in
const estimate = (b: Audiobook) =>
  b.chapters.reduce(
    (n, c) =>
      n +
      said(c.title) +
      PAUSE.line +
      c.parts.reduce(
        (m, p) =>
          m + said(spokenText(p)) + ('host' in p ? PAUSE.host : PAUSE.line),
        0,
      ),
    0,
  )

const START = new Set([...KNOWN_AT_START, ...PRACTISED_AT_START])

describe('the audiobooks', () => {
  it('have ids of their own, and the day each went out', () => {
    const ids = AUDIOBOOKS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const b of AUDIOBOOKS)
      expect(b.date, b.id).toMatch(/^\d{4}-\d\d-\d\d$/)
  })

  for (const b of AUDIOBOOKS) {
    describe(b.es, () => {
      it('has the story’s words in the bank, and every voice in the cast', () => {
        for (const c of b.chapters) {
          expect(
            c.parts.some((p) => 'host' in p),
            c.title,
          ).toBe(true)
          expect(
            c.parts.some((p) => 'line' in p),
            c.title,
          ).toBe(true)
          for (const p of c.parts)
            if ('host' in p) {
              expect(p.text.trim().length, c.title).toBeGreaterThan(0)
              expect(VOICES[p.host], p.host).toBeTruthy()
            } else {
              expect(() => tokens(p.line), p.line).not.toThrow()
              if (p.who) expect(VOICES[p.who], p.who).toBeTruthy()
            }
        }
      })

      it('lasts fifteen to twenty minutes, about', () => {
        const minutes = (MADE[b.id]?.seconds ?? estimate(b)) / 60
        expect(minutes).toBeGreaterThan(14)
        expect(minutes).toBeLessThan(21)
      })

      it('keeps to the words of the start, with a few new in each chapter', () => {
        if (!b.for.includes('alle starter med')) return
        const seen = new Set<string>()
        for (const c of b.chapters) {
          const fresh = new Set(
            c.parts.flatMap((p) =>
              'line' in p
                ? tokens(p.line).flatMap((t) =>
                    t.id && !START.has(t.id) && !seen.has(t.id) ? [t.id] : [],
                  )
                : [],
            ),
          )
          expect(
            fresh.size,
            `${c.title}: ${[...fresh].join(', ')}`,
          ).toBeLessThanOrEqual(8)
          for (const id of fresh) seen.add(id)
        }
      })

      it('is followed part by part once it is read in', () => {
        const made = MADE[b.id]
        if (!made) return
        const parts = b.chapters.reduce((n, c) => n + c.parts.length + 1, 0)
        expect(made.marks.length).toBe(parts)
        expect(markAt(made, 0)).toEqual([0, -1])
      })
    })
  }
})
