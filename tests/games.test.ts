import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import { ANSWERS, daily, marks } from '../src/app/lib/wordle'
import { build, squares } from '../src/app/lib/crossword'
import { isRight, ring } from '../src/app/lib/rosco'
import { emptyBank, known, newCard } from '../src/app/lib/bank'
import { judge, letters, plural } from '../src/app/lib/spanish'
import { others, spanishChoices } from '../src/app/lib/choices'

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

  it('never offer the right answer twice, even for «el agua»', () => {
    for (const id of ['el agua', 'el hambre', 'los zapatos', 'la mano']) {
      const w = WORD[id]
      if (!w) continue
      for (let i = 1; i <= 20; i++) {
        const xs = spanishChoices(w, WORDS, seeded(i))
        expect(new Set(xs).size, id).toBe(xs.length)
        expect(
          xs.filter((x) => x === w.es),
          id,
        ).toHaveLength(1)
      }
    }
    const agua = WORD['el agua']!
    const all = new Set(
      Array.from({ length: 20 }, (_, i) =>
        spanishChoices(agua, WORDS, seeded(i + 1)),
      ).flat(),
    )
    expect(all.has('la agua')).toBe(true)
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
