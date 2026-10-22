import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import { ANSWERS, daily, marks } from '../src/app/lib/wordle'
import { build, squares } from '../src/app/lib/crossword'
import { isRight, ring } from '../src/app/lib/rosco'
import {
  DECK,
  adjectiveForm,
  adjectiveOptions,
  deck,
  draw,
  norwegian,
  spanish,
  verbOptions,
} from '../src/app/lib/cadaver'
import { ADJECTIVES, SUBJECTS, THINGS, VERBS } from '../src/app/data/grammar'
import { emptyBank, known, newCard } from '../src/app/lib/bank'
import { judge, letters, plural } from '../src/app/lib/spanish'
import { others, spanishChoices } from '../src/app/lib/choices'
import type { Sentence } from '../src/app/lib/cadaver'

const now = Date.UTC(2026, 9, 22, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('Spanish spelling', () => {
  it('keeps ñ when accents go', () => {
    expect(letters('el sueño')).toBe('ELSUEÑO')
    expect(letters('árbol')).toBe('ARBOL')
  })

  it('makes plurals by the usual rules', () => {
    expect(plural('reloj')).toBe('relojes')
    expect(plural('cajón')).toBe('cajones')
    expect(plural('luz')).toBe('luces')
    expect(plural('casa')).toBe('casas')
  })

  it('judges a typed noun by its article too', () => {
    const gato = WORD['el gato']!
    expect(judge('el gato', gato)).toBe('right')
    expect(judge('El Gato!', gato)).toBe('right')
    expect(judge('gato', gato)).toBe('bare')
    expect(judge('la gato', gato)).toBe('gender')
    expect(judge('el perro', gato)).toBe('wrong')
    const arbol = WORD['el árbol']!
    expect(judge('el arbol', arbol)).toBe('accent')
    expect(judge('el arbol', arbol, { lenient: false })).toBe('wrong')
  })
})

describe('choices', () => {
  it('are of the same kind and never the same meaning', () => {
    const w = WORD['comer']!
    const rest = others(w, WORDS, seeded())
    expect(rest).toHaveLength(3)
    for (const x of rest) {
      expect(x.pos).toBe('v')
      expect(x.no).not.toBe(w.no)
    }
  })

  it('offer a noun with the wrong article now and then', () => {
    const w = WORD['la mano']!
    const all = new Set(
      Array.from({ length: 20 }, (_, i) =>
        spanishChoices(w, WORDS, seeded(i + 1)),
      ).flat(),
    )
    expect(all.has('el mano')).toBe(true)
  })
})

describe('La palabra', () => {
  it('marks letters as Wordle does, twice-used letters too', () => {
    expect(marks('PERRO', 'PERRO')).toEqual(['g', 'g', 'g', 'g', 'g'])
    expect(marks('SUEÑO', 'LEJOS')).toEqual(['c', 'x', 'c', 'x', 'c'])
    expect(marks('ARRAS', 'PERRO')).toEqual(['x', 'c', 'g', 'x', 'x'])
  })

  it('has words enough, of five letters each', () => {
    expect(ANSWERS.length).toBeGreaterThan(40)
    for (const w of ANSWERS) expect(letters(w.bare)).toHaveLength(5)
  })

  it('gives everyone the same word on a day', () => {
    expect(daily(emptyBank(), now).id).toBe(
      daily(emptyBank(), now + 3600_000).id,
    )
  })
})

describe('the mini crossword', () => {
  it('crosses words in a small square, each square one letter', () => {
    const words = WORDS.filter((w) => w.pos === 'n').slice(0, 60)
    const p = build(words, { random: seeded() })
    expect(p).not.toBeNull()
    expect(p!.entries.length).toBeGreaterThanOrEqual(4)
    expect(p!.rows).toBeLessThanOrEqual(7)
    expect(p!.cols).toBeLessThanOrEqual(7)
    for (const e of p!.entries)
      squares(e).forEach(([r, c], i) =>
        expect(p!.cells[r][c]).toBe(e.answer[i]),
      )
  })

  it('numbers its clues from the top left', () => {
    const p = build(WORDS.filter((w) => w.pos === 'n').slice(0, 60), {
      random: seeded(3),
    })!
    const first = p.entries.find((e) => e.n === 1)!
    for (const e of p.entries)
      expect(e.row * 10 + e.col).toBeGreaterThanOrEqual(
        first.row * 10 + first.col,
      )
  })
})

describe('El rosco', () => {
  it('asks one met word to a letter', () => {
    const b = emptyBank()
    for (const w of WORDS) b.cards[w.id] = known(now)
    const clues = ring(b, now, seeded())
    expect(clues.length).toBeGreaterThan(18)
    expect(new Set(clues.map((c) => c.answer)).size).toBe(clues.length)
    for (const c of clues)
      expect(
        c.starts ? c.answer.startsWith(c.letter) : c.answer.includes(c.letter),
      ).toBe(true)
  })

  it('takes an answer without its accents', () => {
    const b = emptyBank()
    b.cards['el árbol'] = newCard(now)
    const [clue] = ring(b, now)
    expect(isRight('arbol', clue)).toBe(true)
  })
})

describe('Cadáver exquisito', () => {
  it('makes the adjective agree with the thing', () => {
    const reloj = THINGS.find((t) => t.es === 'reloj')!
    const s = { ...draw(seeded()), thing: reloj, many: true }
    s.adjective = { es: 'blando', no: ['myk', 'mykt', 'myke'] }
    expect(adjectiveForm(s)).toBe('blandos')
    expect(spanish(s)).toMatch(/unos relojes blandos\.$/)
    expect(norwegian(s)).toMatch(/noen myke klokker\.$/)
    expect(adjectiveOptions(s)).toHaveLength(4)
  })

  it('offers the verb in four forms, one of them right', () => {
    const s = draw(seeded(5))
    const opts = verbOptions(s)
    expect(opts).toHaveLength(4)
    expect(opts).toContain(s.verb.forms[s.subject.person])
  })

  it('deals from a deck that is the same every time', () => {
    expect(DECK).toHaveLength(360)
    expect(new Set(DECK.map(spanish)).size).toBe(360)
    // (made without Math.random, so a build cannot change it)
    const random = Math.random
    Math.random = () => 0.5
    try {
      expect(deck().map(spanish)).toEqual(DECK.map(spanish))
    } finally {
      Math.random = random
    }
    expect(deck(360, 7).map(spanish)).not.toEqual(DECK.map(spanish))
    // Every part comes round
    expect(new Set(DECK.map((s) => s.subject))).toEqual(new Set(SUBJECTS))
    expect(new Set(DECK.map((s) => s.verb))).toEqual(new Set(VERBS))
    expect(new Set(DECK.map((s) => s.thing))).toEqual(new Set(THINGS))
    expect(new Set(DECK.map((s) => s.adjective))).toEqual(new Set(ADJECTIVES))
    const many = DECK.filter((s) => s.many).length / DECK.length
    expect(many).toBeGreaterThan(0.3)
    expect(many).toBeLessThan(0.5)
  })

  it('draws only from the deck, and none twice in a round', () => {
    const random = seeded(3)
    for (let i = 0; i < 50; i++) expect(DECK).toContain(draw(random))
    const round: Array<Sentence> = []
    for (let i = 0; i < 6; i++) round.push(draw(random, round))
    expect(new Set(round).size).toBe(6)
    expect(draw(random, DECK.slice(1))).toBe(DECK[0])
  })

  it('makes every sentence in the deck agree', () => {
    const PERSON: Record<string, number> = {
      Yo: 0,
      Tú: 1,
      Nosotros: 3,
      Vosotros: 4,
    }
    // The endings of each person in the present
    const ENDING = [/o$/, /s$/, /[ae]$/, /mos$/, /[ií]s$/, /n$/]
    for (const s of DECK) {
      const said = spanish(s)
      expect(said, said).toMatch(/^[^ ].*[^ ]\.$/)
      const subject = s.subject.es.split(' ')
      const words = said.slice(0, -1).split(' ')
      expect(words.slice(0, subject.length), said).toEqual(subject)
      const [verb, article, noun, adjective, ...rest] = words.slice(
        subject.length,
      )
      expect(rest, said).toEqual([])
      // The verb agrees with whoever does it
      const person =
        PERSON[s.subject.es] ?? (/^(Los|Las) /.test(s.subject.es) ? 5 : 2)
      expect(s.subject.person, said).toBe(person)
      expect(verb, said).toBe(s.verb.forms[person])
      expect(verb, said).toMatch(ENDING[person])
      // The article and the noun with the thing's gender and number
      const g = s.thing.g
      expect(article, said).toBe(
        s.many ? (g === 'm' ? 'unos' : 'unas') : g === 'm' ? 'un' : 'una',
      )
      if (s.many) expect(noun, said).toMatch(/s$/)
      else expect(noun, said).toBe(s.thing.es)
      // The adjective with them too
      const a = s.adjective.es
      if (a.endsWith('o'))
        expect(adjective, said).toBe(
          a.slice(0, -1) + (g === 'm' ? 'o' : 'a') + (s.many ? 's' : ''),
        )
      else if (!s.many) expect(adjective, said).toBe(a)
      else if (a.endsWith('z'))
        expect(adjective, said).toBe(`${a.slice(0, -1)}ces`)
      else expect(adjective, said).toBe(/[aeiou]$/.test(a) ? `${a}s` : `${a}es`)
    }
  })
})
