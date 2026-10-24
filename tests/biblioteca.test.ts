import { describe, expect, it } from 'vitest'
import { BOOKS, sentencesOf } from '../src/app/data/biblioteca'
import { LESSON, TAUGHT, WORDS } from '../src/app/data/words'
import { emptyBank, merge, toMeet } from '../src/app/lib/bank'
import { tokens, wordIds } from '../src/app/lib/text'

describe('the library', () => {
  it('gives each text a lesson of its own words, met only there', () => {
    for (const b of BOOKS) {
      expect(LESSON[b.id]?.book, b.id).toBe(true)
      expect(LESSON[b.id]?.es, b.id).toBe(b.es)
    }
    for (const w of TAUGHT) expect(LESSON[w.lesson]?.book, w.id).toBeFalsy()
    const met = toMeet({
      ...emptyBank(),
      theme: { on: [{ id: BOOKS[0].id, p: 1 }], t: 1 },
    })
    expect(met.some((w) => LESSON[w.lesson]?.book)).toBe(false)
  })

  it('uses every word of a text’s lesson in the text', () => {
    for (const b of BOOKS) {
      const used = new Set(sentencesOf(b).flatMap(wordIds))
      for (const w of WORDS.filter((x) => x.lesson === b.id))
        expect(used.has(w.id), `${b.id}: ${w.id}`).toBe(true)
    }
  })

  it('has every word in the bank, and its sentences punctuated', () => {
    for (const b of BOOKS) {
      expect(b.text.length, b.id).toBeGreaterThan(3)
      for (const s of sentencesOf(b)) {
        expect(() => tokens(s), s).not.toThrow()
        expect(s.trim(), s).toMatch(/[.!?:…;]$/)
      }
    }
  })

  it('explains only forms that stand in the text, and has every note', () => {
    for (const b of BOOKS) {
      const toks = sentencesOf(b).flatMap(tokens)
      const forms = new Set(toks.map((t) => t.es.toLowerCase()))
      for (const f of Object.keys(b.forms))
        expect(forms.has(f), `${b.id}: ${f}`).toBe(true)
      const keys = new Set(toks.flatMap((t) => (t.note ? [t.note] : [])))
      for (const k of keys) expect(b.notes[k], `${b.id}: ${k}`).toBeTruthy()
      for (const k of Object.keys(b.notes))
        expect(keys.has(k), `${b.id}: ${k}`).toBe(true)
    }
  })

  it('keeps the later place in a merge, and a text read to the end so', () => {
    const a = { ...emptyBank(), place: { x: { p: 4, t: 10, done: 5 } } }
    const b = {
      ...emptyBank(),
      place: { x: { p: 1, t: 20 }, y: { p: 2, t: 1 } },
    }
    const m = merge(a, b)
    expect(m.place.x).toEqual({ p: 1, t: 20, done: 5 })
    expect(m.place.y).toEqual({ p: 2, t: 1 })
    expect(merge({}, emptyBank()).place).toEqual({})
  })
})
