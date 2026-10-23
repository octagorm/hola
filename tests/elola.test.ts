import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import { emptyBank, newCard, withStart } from '../src/app/lib/bank'
import {
  ENDINGS,
  LEAST,
  articleOf,
  askable,
  deal,
  endingOf,
  isException,
  nounsMet,
  ruleOf,
} from '../src/app/lib/elola'
import type { Bank } from '../src/app/lib/bank'

const now = Date.UTC(2026, 9, 22, 12)

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const word = (id: string) => {
  const w = WORD[id]
  if (!w) throw new Error(`No word ${id}`)
  return w
}

const bankOf = (ids: Array<string>): Bank => {
  const b = emptyBank()
  for (const id of ids) b.cards[id] = newCard(now - 3 * 86_400_000)
  return b
}

// The Spanish of a rule's text, between asterisks
const spanishIn = (text: string) =>
  [...text.matchAll(/\*([^*]+)\*/g)].map((m) => m[1])

describe('¿El o la?', () => {
  it('asks for the article a noun is said with', () => {
    expect(articleOf(word('el gato'))).toBe('el')
    expect(articleOf(word('la mano'))).toBe('la')
    // feminine, but el before its stressed a
    expect(articleOf(word('el agua'))).toBe('el')
    expect(word('el agua').g).toBe('f')
    expect(articleOf(word('el hambre'))).toBe('el')
  })

  it('asks only singular nouns of one gender, and not names', () => {
    expect(askable(word('el gato'))).toBe(true)
    expect(askable(word('los padres'))).toBe(false)
    expect(askable(word('el azúcar'))).toBe(false)
    expect(askable(word('el taxista'))).toBe(false)
    expect(askable(word('la Alhambra'))).toBe(false)
    expect(askable(word('el Guggenheim'))).toBe(false)
    expect(askable(word('el castillo de Santa Bárbara'))).toBe(true)
    expect(askable(word('grande'))).toBe(false)
    const asked = WORDS.filter(askable)
    expect(asked.length).toBeGreaterThan(150)
    for (const w of asked) expect(w.es).toMatch(/^(el|la) /)
  })

  it('gives the exceptions their own rule', () => {
    expect(ruleOf(word('el agua'))?.kind).toBe('stress')
    expect(ruleOf(word('el agua'))?.text).toContain('*el agua fría*')
    expect(ruleOf(word('el hambre'))?.kind).toBe('stress')
    expect(ruleOf(word('el ama'))?.kind).toBe('stress')
    for (const id of [
      'la mano',
      'la foto',
      'el día',
      'el mediodía',
      'el mapa',
      'el sofá',
      'el cura',
      'el cava',
      'el clima',
      'el idioma',
      'el arte',
      'el avión',
      'la flor',
    ]) {
      expect(ruleOf(word(id))?.kind, id).toBe('exception')
      expect(isException(word(id)), id).toBe(true)
    }
    expect(ruleOf(word('la mano'))?.text).toContain('*La mano* er et unntak')
    expect(ruleOf(word('el idioma'))?.text).toContain('gresk')
    // a noun of several words has the rule of its head
    expect(ruleOf(word('el día de Sant Jordi'))).toEqual(ruleOf(word('el día')))
    expect(ruleOf(word('la media ración'))?.text).toContain('*-ión*')
  })

  it('gives men, women, the days and the languages their rule', () => {
    expect(ruleOf(word('el padre'))?.kind).toBe('person')
    expect(ruleOf(word('la madre'))?.kind).toBe('person')
    expect(ruleOf(word('la mujer'))?.kind).toBe('person')
    expect(ruleOf(word('el hombre'))?.kind).toBe('person')
    expect(ruleOf(word('el lunes'))?.kind).toBe('group')
    expect(ruleOf(word('el domingo'))?.kind).toBe('group')
    expect(ruleOf(word('el catalán'))?.kind).toBe('group')
    expect(ruleOf(word('el euskera'))?.kind).toBe('group')
    // against the rule of -a, so an exception all the same
    expect(isException(word('el euskera'))).toBe(true)
    expect(isException(word('el catalán'))).toBe(false)
    expect(isException(word('el lunes'))).toBe(false)
  })

  it('gives an ending rule where the ending tells', () => {
    expect(ruleOf(word('el gato'))?.text).toBe(
      'Ord på *-o* er som regel hankjønn.',
    )
    expect(ruleOf(word('la casa'))?.text).toBe(
      'Ord på *-a* er som regel hunkjønn.',
    )
    expect(ruleOf(word('la estación'))?.text).toContain('*-ión*')
    expect(ruleOf(word('la ciudad'))?.text).toContain('*-dad*')
    expect(ruleOf(word('el viaje'))?.text).toContain('*-aje*')
    expect(ruleOf(word('el color'))?.text).toContain('*-or*')
    expect(ruleOf(word('el jamón'))?.text).toContain('*-ón*')
    // by the first word of a noun of several
    expect(ruleOf(word('el molino de viento'))?.kind).toBe('ending')
  })

  it('gives no rule where the ending tells nothing', () => {
    for (const id of ['el pan', 'la leche', 'la sal', 'el mar', 'la noche'])
      expect(ruleOf(word(id)), id).toBeNull()
  })

  it('never gives a noun a rule that says the wrong article', () => {
    for (const w of WORDS.filter(askable)) {
      const r = ruleOf(w)
      const e = endingOf(w)
      // An ending that says otherwise is an exception, and has its own text
      if (e && e.art !== articleOf(w))
        expect(r?.kind, `${w.id} breaks the rule of -${e.end}`).toMatch(
          /stress|exception|person|group/,
        )
      if (r?.kind === 'ending') expect(e?.art).toBe(articleOf(w))
      if (r?.kind === 'group') expect(articleOf(w)).toBe('el')
      if (r?.kind === 'person')
        expect(r.text).toContain(
          articleOf(w) === 'el' ? 'hankjønn' : 'hunkjønn',
        )
    }
  })

  it('writes each rule in Norwegian with the Spanish marked', () => {
    for (const w of WORDS.filter(askable)) {
      const r = ruleOf(w)
      if (!r) continue
      expect(r.text, w.id).toMatch(/^[*A-ZÆØÅ]/)
      expect(r.text, w.id).toMatch(/\.$/)
      // asterisks in pairs
      expect((r.text.match(/\*/g) ?? []).length % 2, w.id).toBe(0)
      // a noun's own rule names it (or its head) with its article
      if (r.kind === 'exception' && !r.text.startsWith('Ord '))
        expect(
          w.es.toLowerCase().startsWith(spanishIn(r.text)[0].toLowerCase()),
          w.id,
        ).toBe(true)
    }
    for (const e of ENDINGS) expect(spanishIn(e.text)).toEqual([`-${e.end}`])
  })

  it('names only nouns that are in the bank, with the article they have', () => {
    // every noun a rule names on its own is asked with that article
    for (const id of [
      'el agua',
      'el hambre',
      'el ama',
      'la mano',
      'la foto',
      'el día',
      'el mediodía',
      'el mapa',
      'el sofá',
      'el cura',
      'el cava',
      'el clima',
      'el idioma',
      'el arte',
      'el avión',
      'la flor',
      'el lunes',
      'el domingo',
      'el catalán',
      'el euskera',
    ]) {
      expect(WORD[id], id).toBeDefined()
      expect(askable(word(id)), id).toBe(true)
    }
  })

  it('deals the nouns met, an exception every third card', () => {
    const bank = withStart(emptyBank(), now)
    const cards = deal(bank, now, seeded())
    expect(cards.length).toBe(60)
    expect(new Set(cards.map((w) => w.id)).size).toBe(cards.length)
    for (const w of cards) {
      expect(askable(w)).toBe(true)
      expect(bank.cards[w.id]).toBeDefined()
    }
    const odd = cards.filter(isException).length
    const met = WORDS.filter((w) => bank.cards[w.id] && askable(w))
    const metOdd = met.filter(isException).length
    expect(metOdd).toBeGreaterThan(2)
    expect(odd).toBe(Math.min(metOdd, 20))
    expect(isException(cards[1])).toBe(true)
    expect(isException(cards[4])).toBe(true)
    expect(isException(cards[0])).toBe(false)
  })

  it('deals what there is when little is met', () => {
    const bank = bankOf(['el gato', 'la casa', 'el agua', 'la mano', 'hola'])
    const cards = deal(bank, now, seeded())
    expect(cards.map((w) => w.id).sort()).toEqual(
      ['el agua', 'el gato', 'la casa', 'la mano'].sort(),
    )
    expect(nounsMet(bank)).toBe(4)
    expect(nounsMet(bank)).toBeLessThan(LEAST)
    expect(deal(emptyBank(), now, seeded())).toEqual([])
  })

  it('deals the faded first', () => {
    const bank = emptyBank()
    for (const w of WORDS.filter((x) => askable(x) && !isException(x)))
      bank.cards[w.id] = newCard(now - 3_600_000, 20)
    // one faded among words that hold
    bank.cards['la casa'] = newCard(now - 10 * 86_400_000, 0.05)
    expect(deal(bank, now, seeded(), 10)[0].id).toBe('la casa')
  })
})
