import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import { CHART, CONTRASTS, SOUND } from '../src/app/data/sonidos'
import {
  DICTATION,
  EAR_ROUND,
  FOCUS_ROUND,
  HEARD,
  MISHEARD,
  SAID,
  SLIP_NOTE,
  check,
  dictable,
  dictation,
  earRound,
  flat,
  marks,
  spoken,
  wordsOf,
} from '../src/app/lib/sonidos'
import { emptyBank, newCard, withStart } from '../src/app/lib/bank'

const now = Date.UTC(2026, 9, 23, 12)

function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const sounds = CHART.flatMap((g) => g.sounds)
const word = (id: string) => {
  const w = WORD[id]
  if (!w) throw new Error(id)
  return w
}

describe('the chart', () => {
  it('has each sound once, with a note and two or three words of Hola’s', () => {
    expect(new Set(sounds.map((s) => s.id)).size).toBe(sounds.length)
    for (const s of sounds) {
      expect(s.note.length, s.id).toBeGreaterThan(10)
      expect(s.words.length, s.id).toBeGreaterThanOrEqual(2)
      expect(s.words.length, s.id).toBeLessThanOrEqual(3)
      for (const id of s.words) expect(WORD[id], `${s.id}: ${id}`).toBeTruthy()
    }
  })

  it('has its letters in each of the words that show them', () => {
    // (the vowels, and the sounds spelt one way)
    for (const id of ['a', 'e', 'i', 'o', 'u', 'ñ', 'h', 'd'] as const) {
      const s = SOUND[id]
      if (!s) throw new Error(id)
      for (const w of s.words) expect(flat(word(w).bare), w).toContain(id)
    }
  })
})

describe('the sets that sound alike', () => {
  it('are words of Hola’s, two or three, spelt and said apart', () => {
    for (const c of CONTRASTS) {
      const ws = wordsOf(c)
      expect(ws.length, c.words.join()).toBe(c.words.length)
      expect(ws.length).toBeGreaterThanOrEqual(2)
      expect(ws.length).toBeLessThanOrEqual(3)
      const said = ws.map((w) => spoken(c, w))
      expect(new Set(said).size, said.join()).toBe(ws.length)
      expect(new Set(ws.map((w) => w.bare)).size).toBe(ws.length)
    }
  })

  it('differ in the sounds they name, each in the chart', () => {
    for (const c of CONTRASTS) {
      expect(c.sounds.length).toBeGreaterThan(0)
      for (const s of c.sounds) expect(SOUND[s], s).toBeTruthy()
    }
  })

  it('leave out the articles where they would tell the words apart', () => {
    for (const c of CONTRASTS) {
      const ws = wordsOf(c)
      const arts = ws.map((w) => (w.es === w.bare ? '' : w.es.split(' ')[0]))
      if (new Set(arts).size > 1) expect(c.bare, c.words.join()).toBe(true)
    }
  })

  it('say the nouns without their article as words of their own', () => {
    expect(SAID).toContain('perro')
    expect(SAID).toContain('voz')
    expect(SAID).not.toContain('pero')
    for (const s of SAID) expect(s).not.toContain(' ')
  })

  it('give each word of the lesson for them something to be heard in', () => {
    const heard = new Set([
      ...sounds.flatMap((s) => s.words),
      ...CONTRASTS.flatMap((c) => c.words),
    ])
    const lesson = WORDS.filter((w) => w.lesson === 'sonidos')
    expect(lesson.length).toBeGreaterThan(10)
    for (const w of lesson) expect(heard.has(w.id), w.id).toBe(true)
  })
})

describe('a round for the ear', () => {
  it('says ten words, one from each of ten sets, among its look-alikes', () => {
    const b = withStart(emptyBank(), now)
    for (let seed = 1; seed < 10; seed++) {
      const items = earRound(b, now, seeded(seed))
      expect(items).toHaveLength(EAR_ROUND)
      expect(new Set(items.map((x) => x.c)).size).toBe(EAR_ROUND)
      for (const x of items) {
        expect(x.options).toContain(x.w)
        const ids = (ws: Array<{ id: string }>) => ws.map((w) => w.id).sort()
        expect(ids(x.options)).toEqual(ids(wordsOf(x.c)))
      }
    }
  })

  it('favours the sets whose words’ hearing has faded', () => {
    const b = withStart(emptyBank(), now)
    // The hearing of el perro long faded, and of the rest just practised
    for (const [id, card] of Object.entries(b.cards))
      if (card) b.cards[id] = { ...card, oir: { s: 30, t: now } }
    b.cards['el perro'] = {
      ...newCard(now),
      oir: { s: 0.1, t: now - 30 * 86_400_000 },
    }
    for (let seed = 1; seed < 10; seed++) {
      const items = earRound(b, now, seeded(seed))
      expect(items.map((x) => x.w.id)).toContain('el perro')
    }
  })

  it('keeps to the sets of one sound, when asked to', () => {
    const b = withStart(emptyBank(), now)
    for (const focus of ['r', 'ñ', 'bv', 'z'] as const) {
      const items = earRound(b, now, seeded(3), focus)
      expect(items).toHaveLength(FOCUS_ROUND)
      for (let i = 0; i < items.length; i++) {
        expect(items[i].c.sounds).toContain(focus)
        if (i) expect(items[i].w).not.toBe(items[i - 1].w)
      }
    }
  })

  it('records hearing as a choice among few', () => {
    expect(HEARD).toBe(0.6)
    expect(MISHEARD).toBeLessThan(HEARD)
  })
})

describe('the dictation', () => {
  it('asks eight words met, each spelt once, with something to watch for', () => {
    const b = withStart(emptyBank(), now)
    for (let seed = 1; seed < 10; seed++) {
      const ws = dictation(b, now, seeded(seed))
      expect(ws).toHaveLength(DICTATION)
      expect(new Set(ws.map((w) => w.bare)).size).toBe(DICTATION)
      for (const w of ws) {
        expect(dictable(w), w.id).toBe(true)
        expect(b.cards[w.id], w.id).toBeTruthy()
      }
    }
  })

  it('can be made with no words met', () => {
    expect(dictation(emptyBank(), now, seeded(2))).toHaveLength(DICTATION)
  })

  it('writes only what the keys can: one word, in Spanish letters', () => {
    expect(dictable(word('el vino'))).toBe(true)
    expect(dictable(word('la guitarra'))).toBe(true)
    expect(dictable(word('buenos días'))).toBe(false)
  })
})

describe('a word written from its sound', () => {
  it('is right with or without its accent marks and ü', () => {
    expect(check('cafe', word('el café')).right).toBe(true)
    expect(check('Café ', word('el café')).right).toBe(true)
    expect(check('pinguino', word('el pingüino')).right).toBe(true)
  })

  it('names the spelling of a sound heard right', () => {
    const slips = (typed: string, id: string) => {
      const c = check(typed, word(id))
      expect(c.right, typed).toBe(false)
      return c.slips
    }
    expect(slips('bino', 'el vino')).toEqual(['bv'])
    expect(slips('ola', 'hola')).toEqual(['h'])
    expect(slips('gerra', 'la guerra')).toEqual(['gu'])
    expect(slips('jente', 'la gente')).toEqual(['gj'])
    expect(slips('keso', 'el queso')).toEqual(['k'])
    expect(slips('zena', 'la cena')).toEqual(['z'])
    expect(slips('hoi', 'hoy')).toEqual(['y'])
    expect(slips('yave', 'la llave')).toEqual(['lly'])
  })

  it('names two sounds that Spain keeps apart', () => {
    expect(check('casa', word('la caza')).slips).toEqual(['sz'])
    expect(check('pero', word('el perro')).slips).toEqual(['rr'])
    expect(check('ana', word('la caña')).slips).toEqual([])
  })

  it('names nothing for a word heard otherwise', () => {
    expect(check('mesa', word('la misa')).slips).toEqual([])
    expect(check('gato', word('el vino')).slips).toEqual([])
  })

  it('marks the letters not as written', () => {
    expect(marks('bino', 'vino')).toEqual([true, false, false, false])
    expect(marks('ola', 'hola')).toEqual([true, false, false, false])
    expect(marks('pero', 'perro')).toEqual([false, false, true, false, false])
    expect(marks('vino', 'vino')).toEqual([false, false, false, false])
  })

  it('has a note for every slip', () => {
    for (const note of Object.values(SLIP_NOTE))
      expect(note).toMatch(/^[A-ZÆØÅÑ].+\.$/)
  })
})
