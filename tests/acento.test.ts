import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import {
  LAST_RULE,
  MASTERED,
  ROUND,
  RULES,
  TWINS,
  allMastered,
  asksStress,
  asksTilde,
  fromEnd,
  kindOf,
  kindOfWord,
  opens,
  round,
  ruleReached,
  tildeRight,
  twinItem,
  untilde,
  why,
  wordItem,
} from '../src/app/lib/acento'
import { stressIndex, syllables } from '../src/app/lib/spanish'
import { emptyBank, withStart } from '../src/app/lib/bank'
import type { Item, Kind } from '../src/app/lib/acento'
import type { Bank } from '../src/app/lib/bank'

const now = Date.UTC(2026, 9, 23, 12)

function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const split = (w: string) => syllables(w).join('-')
const item = (id: string) => {
  const w = WORD[id]
  const x = w ? wordItem(w) : null
  if (!x) throw new Error(id)
  return x
}
const withBest = (acento: number): Bank => ({
  ...withStart(emptyBank(), now),
  best: { acento },
})
const kindsOf = (items: Array<Item>) => {
  const n: Partial<Record<Kind | 'twin', number>> = {}
  for (const x of items) {
    const k = x.k === 'twin' ? 'twin' : x.kind
    n[k] = (n[k] ?? 0) + 1
  }
  return n
}

describe('syllables, as the RAE divides them', () => {
  it('let a silent h between vowels leave a diphthong whole', () => {
    expect(split('prohibir')).toBe('prohi-bir')
    expect(split('ahumado')).toBe('ahu-ma-do')
    expect(split('rehusar')).toBe('rehu-sar')
  })

  it('give a weak vowel between two strong ones to the second, unless marked', () => {
    expect(split('ahuecar')).toBe('a-hue-car')
    expect(split('reía')).toBe('re-í-a')
  })

  it('part the vowels round an h where one has the stress mark', () => {
    expect(split('prohíbe')).toBe('pro-hí-be')
    expect(split('búho')).toBe('bú-ho')
    expect(split('ahí')).toBe('a-hí')
    expect(split('ahora')).toBe('a-ho-ra')
  })

  it('part two of the same weak vowel', () => {
    expect(split('chiita')).toBe('chi-i-ta')
  })

  it('keep the capital letters as written', () => {
    expect(split('España')).toBe('Es-pa-ña')
  })
})

describe('the stress', () => {
  it('falls on the next to last syllable after a vowel, n or s', () => {
    expect(stressIndex('casa')).toBe(0)
    expect(stressIndex('joven')).toBe(0)
    expect(stressIndex('lunes')).toBe(0)
    expect(stressIndex('examen')).toBe(1)
  })

  it('falls on the last after any other letter, y among them', () => {
    expect(stressIndex('hablar')).toBe(1)
    expect(stressIndex('reloj')).toBe(1)
    expect(stressIndex('ciudad')).toBe(1)
    expect(stressIndex('estoy')).toBe(1)
  })

  it('falls where the mark is, if there is one', () => {
    expect(stressIndex('café')).toBe(1)
    expect(stressIndex('canción')).toBe(1)
    expect(stressIndex('árbol')).toBe(0)
    expect(stressIndex('sábado')).toBe(0)
    expect(stressIndex('simpático')).toBe(1)
    expect(stressIndex('día')).toBe(0)
    expect(stressIndex('oír')).toBe(1)
    expect(stressIndex('país')).toBe(1)
  })

  it('has one place in a word of one syllable', () => {
    expect(stressIndex('hoy')).toBe(0)
    expect(stressIndex('sol')).toBe(0)
  })
})

describe('the kinds of word', () => {
  it('tell the rule a word follows, or breaks', () => {
    expect(kindOf('casa')).toBe('llana')
    expect(kindOf('hablar')).toBe('aguda')
    expect(kindOf('café')).toBe('tilde')
    expect(kindOf('árbol')).toBe('tilde')
    expect(kindOf('jamás')).toBe('tilde')
    expect(kindOf('sábado')).toBe('esdrujula')
    expect(kindOf('día')).toBe('hiato')
    expect(kindOf('oír')).toBe('hiato')
    expect(kindOf('país')).toBe('hiato')
  })

  it('leave out words of one syllable, and marks no rule above explains', () => {
    expect(kindOf('sol')).toBeNull()
    expect(kindOf('dónde')).toBeNull()
    expect(kindOf('cómo')).toBeNull()
    expect(kindOfWord('el sol')).toBeUndefined()
    expect(kindOfWord('bien')).toBeUndefined()
  })

  it('have many words of Hola’s each', () => {
    const n: Record<string, number> = {}
    for (const w of WORDS) {
      const k = kindOfWord(w.id)
      if (k) n[k] = (n[k] ?? 0) + 1
    }
    expect(n.llana).toBeGreaterThan(400)
    expect(n.aguda).toBeGreaterThan(100)
    expect(n.tilde).toBeGreaterThan(40)
    expect(n.esdrujula).toBeGreaterThan(20)
    expect(n.hiato).toBeGreaterThan(15)
  })

  it('put a word’s mark, if any, in its stressed syllable', () => {
    for (const w of WORDS) {
      const x = wordItem(w)
      if (!x || x.k !== 'word') continue
      expect(x.plain.join(''), w.id).toBe(untilde(w.bare))
      expect(x.syl[x.stress], w.id).toMatch(x.mark < 0 ? /^/ : /[áéíóú]/)
    }
  })
})

describe('the rules', () => {
  it('are five, each heard in words of its own kind', () => {
    expect(RULES.map((r) => r.n)).toEqual([1, 2, 3, 4, 5])
    expect(LAST_RULE).toBe(5)
    const kinds: Record<number, Array<Kind>> = {
      1: ['llana', 'aguda'],
      2: ['tilde'],
      3: ['esdrujula'],
      4: ['hiato'],
    }
    for (const r of RULES) {
      for (const id of r.words) {
        expect(WORD[id], id).toBeTruthy()
        if (r.n < 5) expect(kinds[r.n], id).toContain(kindOfWord(id))
        else expect(TWINS.map((t) => t.id)).toContain(id)
      }
    }
  })

  it('pair words that sound alike, one with a mark, each a word of Hola’s', () => {
    for (const t of TWINS) {
      expect(WORD[t.id], t.id).toBeTruthy()
      expect(untilde(t.es)).toBe(untilde(t.other))
      expect(/[áéíóú]/.test(t.es) !== /[áéíóú]/.test(t.other), t.id).toBe(true)
      expect(twinItem(t)?.mark).toBe(t.es.search(/[áéíóú]/))
    }
  })
})

describe('a round', () => {
  it('asks ten words, of the kinds of the rule and those before it', () => {
    const mixes: Record<number, Partial<Record<Kind | 'twin', number>>> = {
      1: { llana: 5, aguda: 5 },
      2: { tilde: 5, llana: 3, aguda: 2 },
      3: { esdrujula: 4, tilde: 3, llana: 2, aguda: 1 },
      4: { hiato: 4, esdrujula: 2, tilde: 2, llana: 1, aguda: 1 },
      5: { twin: 4, hiato: 1, esdrujula: 2, tilde: 2, llana: 1 },
    }
    const b = withStart(emptyBank(), now)
    for (let rule = 1; rule <= LAST_RULE; rule++) {
      for (let seed = 1; seed < 6; seed++) {
        const items = round(b, rule, seeded(seed))
        expect(items).toHaveLength(ROUND)
        expect(kindsOf(items)).toEqual(mixes[rule])
      }
    }
  })

  it('asks words met, a spelling once, and never a twin with its other', () => {
    const b = withStart(emptyBank(), now)
    for (let seed = 1; seed < 20; seed++) {
      for (const rule of [1, 3, 5]) {
        const items = round(b, rule, seeded(seed))
        const spelt = items.map((x) => (x.k === 'twin' ? x.twin.es : x.w.bare))
        expect(new Set(spelt).size).toBe(spelt.length)
        for (const x of items) {
          if (x.k === 'word') expect(b.cards[x.w.id], x.w.id).toBeTruthy()
          else expect(spelt).not.toContain(x.twin.other)
        }
      }
    }
  })

  it('has no more than three verbs among five words of a kind', () => {
    const b = withStart(emptyBank(), now)
    for (let seed = 1; seed < 20; seed++) {
      const items = round(b, 1, seeded(seed))
      const verbs = items.filter(
        (x) => x.k === 'word' && x.kind === 'aguda' && x.w.pos === 'v',
      )
      expect(verbs.length).toBeLessThanOrEqual(3)
    }
  })

  it('can be made with no words met, from the first of the lessons', () => {
    for (let rule = 1; rule <= LAST_RULE; rule++)
      expect(round(emptyBank(), rule, seeded(3))).toHaveLength(ROUND)
  })

  it('asks the stress of a word, and its mark from the second rule on', () => {
    const casa = item('la casa')
    expect(asksStress(casa)).toBe(true)
    expect(asksTilde(casa, 1)).toBe(false)
    expect(asksTilde(casa, 2)).toBe(true)
    const tu = twinItem(TWINS[0])
    if (!tu) throw new Error('tú')
    expect(asksStress(tu)).toBe(false)
    expect(asksTilde(tu, 5)).toBe(true)
  })

  it('takes a mark where it goes, or none where none does', () => {
    const cafe = item('el café')
    expect(cafe.plain).toEqual(['ca', 'fe'])
    expect(tildeRight(cafe, 3)).toBe(true)
    expect(tildeRight(cafe, 1)).toBe(false)
    expect(tildeRight(cafe, null)).toBe(false)
    const casa = item('la casa')
    expect(tildeRight(casa, null)).toBe(true)
    expect(tildeRight(casa, 1)).toBe(false)
  })
})

describe('the next rule', () => {
  it('opens with eight right at the rule reached', () => {
    expect(MASTERED).toBe(8)
    expect(opens(emptyBank(), 1, 8)).toBe(2)
    expect(opens(emptyBank(), 1, 7)).toBeNull()
    expect(opens(withBest(3), 2, 10)).toBeNull()
    expect(opens(withBest(3), 3, 9)).toBe(4)
  })

  it('is one past the last once the last is mastered too', () => {
    expect(opens(withBest(5), 5, 8)).toBe(6)
    expect(ruleReached(withBest(6))).toBe(5)
    expect(allMastered(withBest(6))).toBe(true)
    expect(allMastered(withBest(5))).toBe(false)
    expect(opens(withBest(6), 5, 10)).toBeNull()
  })
})

describe('what is said after an answer', () => {
  it('names the ending and where the stress is', () => {
    expect(why(item('la casa'))).toBe(
      'Slutter på vokal og har trykket på nest siste stavelse, slik regelen sier. Da trengs ingen aksent.',
    )
    expect(why(item('el reloj'))).toContain(
      'Slutter på j og har trykket på siste',
    )
    expect(why(item('el café'))).toBe(
      'Slutter på vokal, men har trykket på siste stavelse. Det bryter regelen, og da får ordet aksent.',
    )
    expect(why(item('el árbol'))).toContain(
      'Slutter på l, men har trykket på nest siste',
    )
    expect(why(item('el sábado'))).toContain('tredje siste stavelse')
    expect(why(item('el día'))).toContain('Trykket ligger på i,')
  })

  it('says of a twin which is which', () => {
    const tu = twinItem(TWINS[0])
    if (!tu) throw new Error('tú')
    expect(why(tu)).toBe('tú «du» og tu «din» sies likt. Aksenten skiller dem.')
  })

  it('counts syllables from the end', () => {
    expect(fromEnd(2, 1)).toBe('siste')
    expect(fromEnd(3, 1)).toBe('nest siste')
    expect(fromEnd(4, 1)).toBe('tredje siste')
    expect(fromEnd(4, 0)).toBe('fjerde siste')
  })
})
