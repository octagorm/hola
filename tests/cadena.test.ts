import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import { KNOWN_AT_START } from '../src/app/data/start'
import {
  LENGTH,
  canChain,
  choices,
  extend,
  fitting,
  follows,
  link,
  nextOf,
  plainWord,
  plan,
  syllables,
} from '../src/app/lib/cadena'
import { emptyBank, known, newCard, withStart } from '../src/app/lib/bank'
import { clueCount, ready } from '../src/app/lib/today'
import type { Word } from '../src/app/data/words'

const now = Date.UTC(2026, 9, 22, 12)

function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const split = (w: string) => syllables(w).join('-')

// Each word follows the one before, and none comes twice
function isChain(chain: Array<Word>) {
  for (let i = 1; i < chain.length; i++)
    expect(follows(chain[i - 1].bare, chain[i].bare), chain[i].bare).toBe(true)
  expect(new Set(chain.map((w) => plainWord(w.bare))).size).toBe(chain.length)
}

describe('syllables', () => {
  it('put one consonant with the vowel after it', () => {
    expect(split('casa')).toBe('ca-sa')
    expect(split('ordenador')).toBe('or-de-na-dor')
    expect(split('ahora')).toBe('a-ho-ra')
    expect(split('sábado')).toBe('sá-ba-do')
  })

  it('keep ch, ll and rr together, and qu and gu before e and i', () => {
    expect(split('noche')).toBe('no-che')
    expect(split('calle')).toBe('ca-lle')
    expect(split('perro')).toBe('pe-rro')
    expect(split('derretirse')).toBe('de-rre-tir-se')
    expect(split('pequeño')).toBe('pe-que-ño')
    expect(split('guitarra')).toBe('gui-ta-rra')
  })

  it('keep a consonant and r or l together where a syllable can begin so', () => {
    expect(split('hablar')).toBe('ha-blar')
    expect(split('libro')).toBe('li-bro')
    expect(split('escribir')).toBe('es-cri-bir')
    expect(split('iglesia')).toBe('i-gle-sia')
    expect(split('hombre')).toBe('hom-bre')
    expect(split('siempre')).toBe('siem-pre')
    expect(split('extraño')).toBe('ex-tra-ño')
    expect(split('instrumento')).toBe('ins-tru-men-to')
    expect(split('construir')).toBe('cons-truir')
  })

  it('divide other consonants, tl as Spain does', () => {
    expect(split('ventana')).toBe('ven-ta-na')
    expect(split('carne')).toBe('car-ne')
    expect(split('obstáculo')).toBe('obs-tá-cu-lo')
    expect(split('atlas')).toBe('at-las')
  })

  it('keep a diphthong together and divide a hiatus', () => {
    expect(split('puerta')).toBe('puer-ta')
    expect(split('ciudad')).toBe('ciu-dad')
    expect(split('lluvia')).toBe('llu-via')
    expect(split('agua')).toBe('a-gua')
    expect(split('cuidado')).toBe('cui-da-do')
    expect(split('aceite')).toBe('a-cei-te')
    expect(split('también')).toBe('tam-bién')
    expect(split('pingüino')).toBe('pin-güi-no')
    expect(split('buey')).toBe('buey')
    // Two strong vowels, or a weak one with an accent, stand apart
    expect(split('leer')).toBe('le-er')
    expect(split('museo')).toBe('mu-se-o')
    expect(split('poeta')).toBe('po-e-ta')
    expect(split('río')).toBe('rí-o')
    expect(split('día')).toBe('dí-a')
    expect(split('oír')).toBe('o-ír')
    expect(split('país')).toBe('pa-ís')
  })

  it('read y as a vowel at the end and as a consonant before one', () => {
    expect(split('rey')).toBe('rey')
    expect(split('muy')).toBe('muy')
    expect(split('ayer')).toBe('a-yer')
    expect(split('playa')).toBe('pla-ya')
    expect(split('mayor')).toBe('ma-yor')
  })

  it('make up every word of Hola’s, each with a vowel', () => {
    for (const w of WORDS.filter((x) => !x.bare.includes(' '))) {
      const s = syllables(w.bare)
      expect(s.join(''), w.bare).toBe(w.bare)
      for (const x of s)
        expect(/[aeiouáéíóúüy]/i.test(x), `${w.bare}: ${x}`).toBe(true)
    }
  })
})

describe('the links of the chain', () => {
  it('are the last syllable, without its accent', () => {
    expect(link('casa')).toBe('sa')
    expect(link('café')).toBe('fe')
    expect(link('jamón')).toBe('mon')
    expect(link('río')).toBe('o')
    expect(link('estación')).toBe('cion')
  })

  it('begin with r for rr, as a word does', () => {
    expect(link('perro')).toBe('ro')
    expect(link('marrón')).toBe('ron')
    expect(follows('perro', 'rojo')).toBe(true)
  })

  it('let a word follow that begins with the link', () => {
    expect(follows('casa', 'sábado')).toBe(true)
    expect(follows('mesa', 'sal')).toBe(true)
    expect(follows('tomar', 'mar')).toBe(true)
    expect(follows('café', 'feo')).toBe(true)
    expect(follows('casa', 'cama')).toBe(false)
    expect(follows('casa', 'casa')).toBe(false)
    expect(follows('niño', 'noche')).toBe(false)
  })
})

describe('Palabras encadenadas', () => {
  it('makes a chain of the words a new player starts with', () => {
    const b = withStart(emptyBank(), now)
    for (let seed = 1; seed <= 20; seed++) {
      const chain = plan(b, now, seeded(seed))!
      expect(chain).toHaveLength(LENGTH + 1)
      isChain(chain)
      for (const w of chain) expect(b.cards[w.id], w.id).toBeTruthy()
    }
  })

  it('varies from game to game', () => {
    const b = withStart(emptyBank(), now)
    const chains = new Set(
      Array.from({ length: 20 }, (_, i) =>
        plan(b, now, seeded(i + 1))!
          .map((w) => w.bare)
          .join(' '),
      ),
    )
    expect(chains.size).toBeGreaterThan(10)
  })

  it('takes the words whose saying has faded most, where it can', () => {
    // Every word held well, but for some that fade
    const b = emptyBank()
    for (const w of WORDS) b.cards[w.id] = known(now)
    const weak = [
      'la casa',
      'el sábado',
      'el domingo',
      'gordo',
      'dorado',
      'la mesa',
      'la sal',
    ]
    for (const id of weak) b.cards[id] = newCard(now - 30 * 86_400_000)
    let hits = 0
    for (let seed = 1; seed <= 20; seed++) {
      const chain = plan(b, now, seeded(seed))!
      isChain(chain)
      hits += chain.filter((w) => weak.includes(w.id)).length
    }
    // (left to chance, seven words of some eight hundred would come once
    // or twice in twenty chains)
    expect(hits).toBeGreaterThan(12)
  })

  it('comes in today’s chapter once the words met make a chain', () => {
    // Met lesson by lesson, without the starting point
    const b = emptyBank()
    let met = 0
    while (!ready('cadena', met, clueCount(b)))
      b.cards[WORDS[met++].id] = newCard(now)
    const chain = plan(b, now, seeded(1))!
    isChain(chain)
    for (const w of chain) expect(b.cards[w.id], w.id).toBeTruthy()
  })

  it('takes words not met only where hers make no chain', () => {
    const b = emptyBank()
    for (const id of KNOWN_AT_START) b.cards[id] = known(now)
    const chain = plan(b, now, seeded(3))!
    expect(chain).toHaveLength(LENGTH + 1)
    isChain(chain)
    expect(b.cards[chain[0].id]).toBeTruthy()
    // With none met at all, it still makes one
    expect(plan(emptyBank(), now, seeded(4))).toHaveLength(LENGTH + 1)
  })

  it('goes on from a word she chose herself, or says it cannot', () => {
    const b = withStart(emptyBank(), now)
    const start = [WORD['la mesa']!, WORD['el sábado']!]
    const rest = extend(start, 4, b, now, seeded(2))!
    expect(rest).toHaveLength(6)
    isChain(rest)
    // Nothing begins with -che
    expect(extend([WORD['la noche']!], 1, b, now, seeded(2))).toBeNull()
  })

  it('takes any of Hola’s words that fits, typed without accents', () => {
    const chain = [WORD['la mesa']!]
    expect(fitting(chain, 'SABADO').map((w) => w.id)).toEqual(['el sábado'])
    expect(fitting(chain, 'sal').map((w) => w.id)).toEqual(['la sal'])
    expect(fitting(chain, 'MESA')).toEqual([])
    expect(fitting(chain, 'CASA')).toEqual([])
    expect(fitting([WORD['el perro']!], 'ROJO').map((w) => w.id)).toEqual([
      'rojo',
    ])
    // Not a word twice
    expect(fitting([WORD['la casa']!, WORD['la sal']!], 'SAL')).toEqual([])
  })

  it('offers four to pick from, only one of them beginning right', () => {
    const b = withStart(emptyBank(), now)
    const pool = WORDS.filter((w) => b.cards[w.id])
    const chain = [WORD['la mesa']!]
    for (let seed = 1; seed <= 10; seed++) {
      const opts = choices(WORD['el sábado']!, chain, pool, seeded(seed))
      expect(opts).toHaveLength(4)
      expect(opts).toContain(WORD['el sábado'])
      expect(
        opts.filter((w) => follows(chain[0].bare, w.bare)).map((w) => w.id),
      ).toEqual(['el sábado'])
      expect(new Set(opts.map((w) => plainWord(w.bare))).size).toBe(4)
    }
  })

  it('can find a word to follow two in three of Hola’s chain words', () => {
    const all = WORDS.filter(canChain)
    const on = all.filter((w) => nextOf(w).length > 0)
    expect(on.length / all.length).toBeGreaterThan(0.6)
  })
})
