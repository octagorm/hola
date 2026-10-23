import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import {
  FORMS,
  MOST,
  SAID,
  SIZE,
  askOf,
  canAsk,
  glossOf,
  longest,
  lookup,
  makeable,
  metForms,
  missing,
  nextLetter,
  sure,
  target,
} from '../src/app/lib/letras'
import { emptyBank, known, newCard, withStart } from '../src/app/lib/bank'
import { letters, plural } from '../src/app/lib/spanish'
import type { Ask } from '../src/app/lib/letras'
import type { Bank } from '../src/app/lib/bank'

const now = Date.UTC(2026, 9, 22, 12)

function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Every order of asks the rules allow: three to five vowels in nine
const PATTERNS: Array<Array<Ask>> = (() => {
  const out: Array<Array<Ask>> = []
  for (let m = 0; m < 2 ** SIZE; m++) {
    const p = Array.from({ length: SIZE }, (_, i): Ask =>
      m & (1 << i) ? 'v' : 'c',
    )
    const v = p.filter((x) => x === 'v').length
    if (v >= SIZE - MOST.c && v <= MOST.v) out.push(p)
  }
  return out
})()

// A round drawn as the asks come, as the game does it
function drawn(bank: Bank, asks: Array<Ask>, random: () => number) {
  const t = target(bank, now, random)
  const pool = metForms(bank).map((f) => f.key)
  const got: Array<string> = []
  for (const a of asks) {
    expect(canAsk(got, a)).toBe(true)
    got.push(nextLetter(got, a, t.key, pool, random))
  }
  return { t, got }
}

describe('plurals', () => {
  it('leave a word unstressed at its end in -s as it is', () => {
    expect(plural('lunes')).toBe('lunes')
    expect(plural('miércoles')).toBe('miércoles')
    expect(plural('mes')).toBe('meses')
    expect(plural('gris')).toBe('grises')
    expect(plural('autobús')).toBe('autobuses')
  })

  it('give an accent where a syllable added calls for one', () => {
    expect(plural('joven')).toBe('jóvenes')
    expect(plural('examen')).toBe('exámenes')
    expect(plural('tren')).toBe('trenes')
    expect(plural('cajón')).toBe('cajones')
  })
})

describe('the words that count in Letras', () => {
  it('are Hola’s words of one word, with plurals and an adjective’s forms', () => {
    expect(lookup('VENTANA').map((f) => f.w.id)).toEqual(['la ventana'])
    expect(lookup('VENTANAS')[0]).toMatchObject({
      es: 'ventanas',
      form: 'pl',
      say: 'las ventanas',
    })
    expect(lookup('ROJAS')[0]).toMatchObject({ form: 'fpl', say: 'rojas' })
    expect(lookup('JOVENES')[0]?.es).toBe('jóvenes')
    expect(lookup('AGUAS')[0]?.say).toBe('las aguas')
    // Accents are left off, but Ñ is a letter of its own
    expect(lookup('ARBOL')[0]?.w.id).toBe('el árbol')
    expect(lookup('SUENO')).toEqual([])
    expect(lookup('SUEÑO')[0]?.w.id).toBe('el sueño')
    expect(lookup('LUNES').map((f) => f.form)).toEqual(['word'])
    expect(lookup('CASAZ')).toEqual([])
  })

  it('are made only of letters the draw gives, two to nine of them', () => {
    for (const f of FORMS) {
      expect(f.key, f.es).toBe(letters(f.es))
      expect(f.key.length).toBeGreaterThanOrEqual(2)
      expect(f.key.length).toBeLessThanOrEqual(SIZE)
      expect(/^[A-ZÑ]+$/.test(f.key), f.es).toBe(true)
      expect(/[KW]/.test(f.key), f.es).toBe(false)
    }
  })

  it('know the word they come from, and say what they mean', () => {
    for (const f of FORMS) expect(WORD[f.w.id], f.es).toBe(f.w)
    expect(glossOf(lookup('VENTANAS')[0])).toBe('vindu, flertall')
    expect(glossOf(lookup('COMER')[0])).toBe('å spise')
  })

  it('are said aloud with a noun’s article, the forms not in the list too', () => {
    for (const f of FORMS) {
      if (f.w.pos === 'n') expect(f.say, f.es).toMatch(/^(el|la|los|las) /)
      if (f.form !== 'word') expect(SAID).toContain(f.say)
    }
    expect(new Set(SAID).size).toBe(SAID.length)
  })
})

describe('the fair draw', () => {
  it('picks a word she has met that comes however she asks', () => {
    const b = withStart(emptyBank(), now)
    for (let seed = 1; seed <= 30; seed++) {
      const t = target(b, now, seeded(seed))
      expect(b.cards[t.w.id], t.es).toBeTruthy()
      expect(t.form).toBe('word')
      expect(t.key.length).toBeGreaterThanOrEqual(6)
      expect(sure(t.key), t.es).toBe(true)
    }
    expect(sure('VENTANA')).toBe(true)
    expect(sure('TELEFONO')).toBe(false)
  })

  it('takes the words whose saying has faded most first', () => {
    const b = emptyBank()
    for (const w of WORDS) b.cards[w.id] = known(now)
    b.cards['la ventana'] = newCard(now - 40 * 86_400_000)
    expect(target(b, now, seeded(1)).w.id).toBe('la ventana')
    // and not one had already in the game
    expect(target(b, now, seeded(1), ['la ventana']).w.id).not.toBe(
      'la ventana',
    )
  })

  it('brings the word’s letters, whichever way she asks', () => {
    const banks = [withStart(emptyBank(), now), emptyBank()]
    for (const w of WORDS) banks[1].cards[w.id] = known(now)
    let seed = 1
    for (const b of banks)
      for (const asks of PATTERNS) {
        const { t, got } = drawn(b, asks, seeded(seed++))
        expect(got).toHaveLength(SIZE)
        expect(got.map(askOf)).toEqual(asks)
        expect(makeable(t.key, got), `${t.es}: ${got.join('')}`).toBe(true)
        // so there is a word of hers of six letters or more
        expect(longest(got, metForms(b), 1)[0].key.length).toBeGreaterThan(5)
      }
  })

  it('lets her ask for five vowels and six consonants at most', () => {
    expect(canAsk([...'AEIOU'], 'v')).toBe(false)
    expect(canAsk([...'AEIOU'], 'c')).toBe(true)
    expect(canAsk([...'BCDFGH'], 'c')).toBe(false)
    expect(canAsk([...'BCDFGHAEI'], 'v')).toBe(false)
  })

  it('gives longer words often, and the letters of Spanish beyond them', () => {
    const b = withStart(emptyBank(), now)
    const random = seeded(5)
    const lengths: Array<number> = []
    for (let i = 0; i < 200; i++) {
      const asks = PATTERNS[Math.floor(random() * PATTERNS.length)]
      const { got } = drawn(b, asks, random)
      lengths.push(longest(got, metForms(b), 1)[0].key.length)
    }
    expect(lengths.filter((n) => n >= 8).length).toBeGreaterThan(20)
  })
})

describe('a round of Letras', () => {
  it('shows the longest words of hers, one form of each word', () => {
    const b = emptyBank()
    for (const id of ['la ventana', 'la venta', 'el vino', 'la mesa'])
      b.cards[id] = known(now)
    const best = longest([...'VENTANASX'], metForms(b))
    expect(best.map((f) => f.es)).toEqual(['ventanas', 'ventas'])
  })

  it('counts each letter once', () => {
    expect(missing('CASA', [...'CAS'])).toEqual(['A'])
    expect(makeable('CASA', [...'ASCA'])).toBe(true)
    expect(makeable('CAÑA', [...'CANA'])).toBe(false)
  })
})
