import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CHAPTERS } from '../src/app/data/caso'
import { CASO_PICTURES, CAST } from '../src/app/data/caso-prompts'
import { FACES, castPicture } from '../src/app/data/casoLayout'
import { STORIES, STORY } from '../src/app/data/stories'
import { LINE_VOICE, VOICES } from '../src/app/data/voices'
import { WORD, WORDS } from '../src/app/data/words'
import { THEME_GROUPS } from '../src/app/data/themes'
import { UNDERSTOOD, credit, notes, wave } from '../src/app/lib/caso'
import { speechItems } from '../src/app/lib/spoken'
import { plain, wordIds } from '../src/app/lib/text'

const caso = STORY.caso!

describe('El caso del reloj perdido', () => {
  it('is a story told by ear, read last', () => {
    expect(caso.listen).toBe(true)
    expect(caso.chapters).toBe(CHAPTERS)
    expect(STORIES.at(-1)).toBe(caso)
  })

  it('has seven to nine chapters of ten to fourteen lines', () => {
    expect(CHAPTERS.length).toBeGreaterThanOrEqual(7)
    expect(CHAPTERS.length).toBeLessThanOrEqual(9)
    for (const c of CHAPTERS) {
      expect(c.id, c.id).toMatch(/^caso-/)
      expect(c.lines.length, c.id).toBeGreaterThanOrEqual(10)
      expect(c.lines.length, c.id).toBeLessThanOrEqual(14)
    }
  })

  it('says who says each line, in a voice of the cast', () => {
    for (const c of CHAPTERS) {
      expect(c.who, c.id).toHaveLength(c.lines.length)
      c.lines.forEach((line, i) => {
        const who = c.who![i]
        // A line said is a speech, and the narrator's lines are not
        expect(line.startsWith('— '), `${c.id} ${i + 1}`).toBe(!!who)
        if (who) expect(VOICES[who], who).toBeTruthy()
      })
    }
  })

  it('reads as Spanish is written', () => {
    expect(plain(CHAPTERS[0].lines[3])).toBe(
      '—¡Inspector, mi reloj de oro ha desaparecido!',
    )
    expect(CHAPTERS[0].who![3]).toBe('Narcís')
    expect(plain(CHAPTERS[0].lines[13])).toBe(
      'Y escribe en su libreta: «Puerta cerrada, ventana cerrada… ¿y el reloj?».',
    )
  })

  it('has every line said in its speaker’s voice, each text its own', () => {
    const items = speechItems()
    const voice = new Map(items.map((item) => [item.text, item.voice]))
    const texts = new Set<string>()
    for (const c of CHAPTERS)
      c.lines.forEach((line, i) => {
        const text = plain(line)
        expect(texts.has(text), text).toBe(false)
        texts.add(text)
        expect(voice.get(text), text).toBe(c.who![i] ?? LINE_VOICE)
      })
  })

  it('gives each chapter a clue for the notebook', () => {
    for (const c of CHAPTERS) expect(c.clue?.length, c.id).toBeGreaterThan(40)
  })

  it('asks who did it in the last chapter, with a hint for each wrong one', () => {
    const last = CHAPTERS.at(-1)!
    const a = last.accuse!
    expect(a).toBeTruthy()
    expect(a.after).toBeGreaterThan(1)
    expect(a.after).toBeLessThan(last.lines.length)
    const names = a.suspects.map((s) => s.name)
    expect(new Set(names).size).toBe(names.length)
    expect(names).toContain(a.culprit)
    for (const s of a.suspects) {
      if (s.name === a.culprit) {
        expect(s.hint).toBeUndefined()
        continue
      }
      expect(s.hint?.length, s.name).toBeGreaterThan(30)
      // pointing back to a chapter before, whose clue is in the notebook
      expect(s.from, s.name).toBeGreaterThanOrEqual(1)
      expect(s.from, s.name).toBeLessThan(CHAPTERS.length)
      expect(CHAPTERS[s.from! - 1].clue, s.name).toBeTruthy()
    }
    // Only the last chapter asks
    for (const c of CHAPTERS.slice(0, -1)) expect(c.accuse).toBeUndefined()
    // and the culprit is heard of before
    const before = CHAPTERS.slice(0, -1).flatMap((c) => c.lines)
    expect(before.some((l) => l.includes(`^${a.culprit}`))).toBe(true)
  })

  it('uses every word of its lesson, which is a theme', () => {
    const used = new Set(CHAPTERS.flatMap((c) => c.lines.flatMap(wordIds)))
    const lesson = WORDS.filter((w) => w.lesson === 'caso')
    expect(lesson.length).toBeGreaterThan(10)
    for (const w of lesson) expect(used.has(w.id), w.id).toBe(true)
    const themes = THEME_GROUPS.flatMap((g) => g.themes.map((t) => t.lesson))
    expect(themes).toContain('caso')
    expect(WORD['a las nueve y media']?.no).toBe('klokka halv ti')
  })
})

describe('what a chapter heard counts for', () => {
  const lines = [
    'El_inspector=inspektøren mira>mirar=ser .',
    'El_gato=katten duerme>dormir=sover .',
  ]
  const met = (id: string) => id !== 'dormir'
  const none = new Set<string>()

  it('counts every word as read where every line was seen', () => {
    expect(credit(lines, null, none, 0, met)).toEqual([
      { id: 'el inspector', link: 'leer' },
      { id: 'mirar', link: 'leer' },
      { id: 'el gato', link: 'leer' },
    ])
  })

  it('counts a line only heard as heard, once it was understood', () => {
    const seen = new Set([0])
    expect(credit(lines, seen, none, UNDERSTOOD, met)).toEqual([
      { id: 'el inspector', link: 'leer' },
      { id: 'mirar', link: 'leer' },
      { id: 'el gato', link: 'oir' },
    ])
    expect(credit(lines, seen, none, UNDERSTOOD - 1, met)).toEqual([
      { id: 'el inspector', link: 'leer' },
      { id: 'mirar', link: 'leer' },
    ])
  })

  it('counts nothing for a word looked up, or not met', () => {
    const looked = new Set(['el inspector'])
    expect(credit(lines, new Set(), looked, 3, met)).toEqual([
      { id: 'mirar', link: 'oir' },
      { id: 'el gato', link: 'oir' },
    ])
  })
})

describe('a line’s wave', () => {
  it('is the same each time, longer for a longer line', () => {
    const short = wave('—¿Dónde estaba el reloj?')
    expect(wave('—¿Dónde estaba el reloj?')).toEqual(short)
    const long = wave(plain(CHAPTERS[0].lines[8]))
    expect(long.length).toBeGreaterThan(short.length)
    expect(long.length).toBeLessThanOrEqual(56)
    for (const h of [...short, ...long]) {
      expect(h).toBeGreaterThanOrEqual(0.12)
      expect(h).toBeLessThanOrEqual(1)
    }
  })
})

describe('the inspector’s notebook', () => {
  it('has a line for each chapter, written in once it is read', () => {
    const read = { 'caso-puerto': 3, 'caso-iglesia': 1 }
    const pages = notes(caso, read)
    expect(pages).toHaveLength(CHAPTERS.length)
    expect(pages[0]).toEqual({
      n: 1,
      id: 'caso-puerto',
      clue: CHAPTERS[0].clue,
    })
    expect(pages[1].clue).toBeUndefined()
    expect(pages[2].clue).toBe(CHAPTERS[2].clue)
  })
})

describe('the painted cast', () => {
  const speakers = new Set(
    CHAPTERS.flatMap((c) => c.who!.filter((w) => w !== undefined)),
  )

  it('has a sheet of four faces for everyone who speaks', () => {
    expect(Object.keys(CAST).sort()).toEqual([...speakers].sort())
    for (const who of speakers) {
      const name = castPicture(who)
      expect(name, who).toMatch(/^caso\/[a-z]+$/)
      expect(Object.keys(CASO_PICTURES), who).toContain(name)
      expect(CASO_PICTURES[name].parts, who).toEqual(FACES)
      expect(CASO_PICTURES[name].cutout, who).toBe(true)
    }
    expect(castPicture('Narcís')).toBe('caso/narcis')
  })

  it('is each the person the chapters’ paintings show', () => {
    const chapters = readFileSync('scripts/pictures.mjs', 'utf8')
    for (const [who, c] of Object.entries(CAST))
      expect(chapters.includes(c.is), who).toBe(true)
  })

  it('makes a face only on a line said, and one of the four', () => {
    for (const c of CHAPTERS) {
      expect(c.face, c.id).toHaveLength(c.lines.length)
      c.face!.forEach((f, i) => {
        if (f === undefined) return
        expect(c.who![i], `${c.id} ${i + 1}`).toBeTruthy()
        expect(FACES, `${c.id} ${i + 1}`).toContain(f)
      })
    }
    expect(CHAPTERS[0].face![3]).toBe('worried')
    expect(CHAPTERS[0].lines[3].startsWith('— ¡ Inspector')).toBe(true)
  })
})
