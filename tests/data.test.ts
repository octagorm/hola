import { describe, expect, it } from 'vitest'
import { LESSONS, WORD, WORDS } from '../src/app/data/words'
import { CHAPTERS, EPIGRAPH } from '../src/app/data/quijote'
import { ALL_CHAPTERS, STORIES } from '../src/app/data/stories'
import { STAGES } from '../src/app/data/camino'
import { THEME_GROUPS } from '../src/app/data/themes'
import { plain, tokens, wordIds } from '../src/app/lib/text'
import { PAGES } from '../src/app/registry'

describe('the words', () => {
  it('are each listed once', () => {
    const ids = WORDS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('belong to a lesson and have a meaning', () => {
    const lessons = new Set(LESSONS.map((l) => l.id))
    for (const w of WORDS) {
      expect(lessons.has(w.lesson), w.id).toBe(true)
      expect(w.no.trim().length, w.id).toBeGreaterThan(0)
    }
  })

  it('give every noun a gender and a word after its article', () => {
    for (const w of WORDS.filter((x) => x.pos === 'n')) {
      expect(['m', 'f'], w.id).toContain(w.g)
      expect(w.bare.length, w.id).toBeGreaterThan(0)
    }
  })

  it('know the feminine nouns that take el', () => {
    expect(WORD['el agua']?.g).toBe('f')
    expect(WORD['el hambre']?.g).toBe('f')
    expect(WORD['la mano']?.g).toBe('f')
    expect(WORD['el día']?.g).toBe('m')
  })

  it('are some hundreds', () => {
    expect(WORDS.length).toBeGreaterThan(450)
  })
})

describe('the stories', () => {
  it('have every word of every line in the bank', () => {
    for (const c of ALL_CHAPTERS)
      for (const line of c.lines)
        expect(() => tokens(line), `${c.id}: ${line}`).not.toThrow()
    expect(() => tokens(EPIGRAPH.line)).not.toThrow()
  })

  it('give each chapter an id of its own across all of them', () => {
    const ids = ALL_CHAPTERS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    const stories = STORIES.map((s) => s.id)
    expect(new Set(stories).size).toBe(stories.length)
  })

  it('each have a page', () => {
    const pages = new Set<string>(PAGES.map((p) => p.id))
    for (const s of STORIES) expect(pages.has(s.id), s.id).toBe(true)
  })

  it('have three questions to each chapter, with three answers', () => {
    for (const c of ALL_CHAPTERS) {
      expect(c.lines.length, c.id).toBeGreaterThan(0)
      expect(c.questions, c.id).toHaveLength(3)
      for (const q of c.questions) expect(new Set(q.a).size, q.q).toBe(3)
    }
  })

  it('glosses a word at the start of a sentence with a capital', () => {
    const t = tokens('De_pronto>de_pronto=plutselig , ^Sancho .')
    expect(t[0].no).toBe('Plutselig')
    expect(t[2]).toMatchObject({ es: 'Sancho', name: true })
  })
})

describe('Don Quijote', () => {
  it('reads as Spanish is written', () => {
    expect(plain(EPIGRAPH.line)).toBe(EPIGRAPH.es)
    const molinos = CHAPTERS.find((c) => c.id === 'molinos')!
    expect(plain(molinos.lines[3])).toBe(
      '—¿Qué gigantes? —dice Sancho—. Son molinos, señor.',
    )
    expect(plain(CHAPTERS[0].lines[7])).toBe('—¡Voy a ser caballero! —dice.')
  })

  it('uses words from many lessons', () => {
    const ids = CHAPTERS.flatMap((c) => c.lines.flatMap(wordIds))
    const lessons = new Set(ids.map((id) => WORD[id]!.lesson))
    expect(lessons.size).toBeGreaterThan(8)
  })
})

describe('the credential', () => {
  it('walks the Camino to Santiago and on to Fisterra', () => {
    expect(STAGES.at(-1)?.town).toBe('Fisterra')
    expect(STAGES.findIndex((s) => s.town === 'Santiago de Compostela')).toBe(
      32,
    )
  })
})

describe('the themes', () => {
  it('are lessons with words, each in one group, with a few lines about it', () => {
    const lessons = new Set(LESSONS.map((l) => l.id))
    const seen = new Set<string>()
    for (const g of THEME_GROUPS)
      for (const t of g.themes) {
        expect(lessons.has(t.lesson), t.lesson).toBe(true)
        expect(seen.has(t.lesson), t.lesson).toBe(false)
        seen.add(t.lesson)
        expect(
          WORDS.some((w) => w.lesson === t.lesson),
          t.lesson,
        ).toBe(true)
        expect(t.about.length, t.lesson).toBeGreaterThan(40)
      }
  })
})
