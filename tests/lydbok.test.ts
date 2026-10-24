import { describe, expect, it } from 'vitest'
import { AUDIOBOOKS, PAUSE } from '../src/app/data/lydbok'
import { KNOWN_AT_START, PRACTISED_AT_START } from '../src/app/data/start'
import { VOICES } from '../src/app/data/voices'
import { MADE, markAt } from '../src/app/lib/lydbok'
import { plain, tokens } from '../src/app/lib/text'

// About how long a text takes to say slowly: letters a second
const PACE = 11

const said = (text: string) => text.replace(/[\W\d_]/g, '').length / PACE

// How long a book will be, roughly, before it is read in
const estimate = (b: (typeof AUDIOBOOKS)[number]) =>
  b.chapters.reduce(
    (n, c) =>
      n +
      said(c.intro) +
      PAUSE.intro +
      said(c.title) +
      PAUSE.title +
      c.lines.reduce((m, l) => m + said(plain(l)) + PAUSE.line, 0) +
      PAUSE.chapter,
    0,
  )

const START = new Set([...KNOWN_AT_START, ...PRACTISED_AT_START])

describe('the audiobooks', () => {
  it('have ids of their own', () => {
    const ids = AUDIOBOOKS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const b of AUDIOBOOKS) {
    describe(b.es, () => {
      it('has every word in the bank, and every speaker in the cast', () => {
        for (const c of b.chapters) {
          expect(c.intro.length, c.title).toBeGreaterThan(40)
          for (const l of c.lines) expect(() => tokens(l), l).not.toThrow()
          for (const who of c.who ?? [])
            if (who) expect(VOICES[who], who).toBeTruthy()
          expect((c.who ?? []).length).toBeLessThanOrEqual(c.lines.length)
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
            c.lines.flatMap((l) =>
              tokens(l).flatMap((t) =>
                t.id && !START.has(t.id) && !seen.has(t.id) ? [t.id] : [],
              ),
            ),
          )
          expect(
            fresh.size,
            `${c.title}: ${[...fresh].join(', ')}`,
          ).toBeLessThanOrEqual(8)
          for (const id of fresh) seen.add(id)
        }
      })

      it('is followed line by line once it is read in', () => {
        const made = MADE[b.id]
        if (!made) return
        const parts = b.chapters.reduce((n, c) => n + c.lines.length + 2, 0)
        expect(made.marks.length).toBe(parts)
        expect(markAt(made, 0)).toEqual([0, -2])
      })
    })
  }
})
