import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import { SENTENCES, TIMES } from '../src/app/data/tiempos'
import { LINE_VOICE } from '../src/app/data/voices'
import {
  ROUND,
  around,
  form,
  options,
  plain,
  round,
  why,
} from '../src/app/lib/tiempos'
import { emptyBank, newCard } from '../src/app/lib/bank'
import { speechItems } from '../src/app/lib/spoken'
import type { Time, Who } from '../src/app/data/tiempos'

const now = Date.UTC(2026, 9, 22, 12)

function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// --- The forms, worked out here a second way, to check those written by
// hand in data/tiempos.ts ---

// yo, tú, él (ella, usted), nosotros, vosotros, ellos
const PERSON: Record<Who, number> = {
  yo: 0,
  tú: 1,
  él: 2,
  ella: 2,
  usted: 2,
  nosotros: 3,
  vosotros: 4,
  ellos: 5,
}

// The wrong person offered beside each (data/tiempos.ts)
const MISSED: Record<Who, number> = {
  yo: 2,
  tú: 2,
  ellos: 2,
  él: 0,
  ella: 0,
  usted: 0,
  nosotros: 5,
  vosotros: 5,
}

const IR = ['voy', 'vas', 'va', 'vamos', 'vais', 'van']

const PRESENT: Record<string, Array<string> | undefined> = {
  ir: IR,
  ser: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
  estar: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
  tener: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
  hacer: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
  ver: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
  poder: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
  venir: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
  decir: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
  salir: ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
  pensar: ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'],
  volver: ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'volvéis', 'vuelven'],
  dormir: ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
}

const FUI = ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron']

const PAST: Record<string, Array<string> | undefined> = {
  ir: FUI,
  ser: FUI,
  estar: [
    'estuve',
    'estuviste',
    'estuvo',
    'estuvimos',
    'estuvisteis',
    'estuvieron',
  ],
  tener: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
  hacer: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
  ver: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
  poder: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
  venir: ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
  decir: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
  dormir: [
    'dormí',
    'dormiste',
    'durmió',
    'dormimos',
    'dormisteis',
    'durmieron',
  ],
  leer: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'],
}

const ENDINGS = {
  present: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  past: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
}

type Kind = keyof typeof ENDINGS.present

function regular(inf: string, p: number, tense: 'present' | 'past') {
  const stem = inf.slice(0, -2)
  const kind = inf.slice(-2) as Kind
  // The spelling keeps the sound before é: llegué, busqué, empecé
  if (tense === 'past' && p === 0 && kind === 'ar') {
    if (stem.endsWith('c')) return `${stem.slice(0, -1)}qué`
    if (stem.endsWith('g')) return `${stem}ué`
    if (stem.endsWith('z')) return `${stem.slice(0, -1)}cé`
  }
  return stem + ENDINGS[tense][kind][p]
}

function expected(verb: string, p: number, t: Time): string {
  if (t === 'manana') return `${IR[p]} a ${verb}`
  const table = t === 'ayer' ? PAST : PRESENT
  return table[verb]?.[p] ?? regular(verb, p, t === 'ayer' ? 'past' : 'present')
}

const ALL = SENTENCES.flatMap((s) => TIMES.map((t) => ({ s, t })))

describe('the sentences of Ayer, hoy, mañana', () => {
  it('are about forty, with verbs from the bank', () => {
    expect(SENTENCES.length).toBeGreaterThanOrEqual(40)
    for (const s of SENTENCES) expect(WORD[s.verb]?.pos, s.verb).toBe('v')
  })

  it('come in four levels, the first regular verbs with yo', () => {
    for (const level of [1, 2, 3, 4])
      expect(
        SENTENCES.filter((s) => s.level === level).length,
      ).toBeGreaterThanOrEqual(6)
    for (const s of SENTENCES.filter((x) => x.level === 1)) {
      expect(s.who).toBe('yo')
      expect(PRESENT[s.verb] ?? PAST[s.verb], s.verb).toBeUndefined()
    }
  })

  it('say each version with its time word, its verb in brackets', () => {
    const start = { ayer: 'Ayer ', hoy: 'Hoy ', manana: 'Mañana ' }
    const no = { ayer: 'I går ', hoy: 'I dag ', manana: 'I morgen ' }
    for (const { s, t } of ALL) {
      expect(s[t].es.startsWith(start[t]), s[t].es).toBe(true)
      expect(s[t].no.startsWith(no[t]), s[t].no).toBe(true)
      expect(s[t].es.match(/\[/g), s[t].es).toHaveLength(1)
      expect(s[t].es, s[t].es).toMatch(/[.!?]$/)
      const [before, after] = around(s, t)
      expect(before + form(s, t) + after).toBe(plain(s, t))
    }
  })

  it('differ only in the time word and the verb', () => {
    for (const s of SENTENCES) {
      const rest = TIMES.map((t) => {
        const [before, after] = around(s, t)
        return `${before.split(' ').slice(1).join(' ')}…${after}`
      })
      expect(new Set(rest).size, s.ayer.es).toBe(1)
    }
  })

  it('have every form right, checked against the tables', () => {
    for (const { s, t } of ALL) {
      expect(form(s, t), s[t].es).toBe(expected(s.verb, PERSON[s.who], t))
      expect(s[t].miss, `${s[t].es} (miss)`).toBe(
        expected(s.verb, MISSED[s.who], t),
      )
    }
  })

  it('offer four different forms to pick from, one of them right', () => {
    for (const { s, t } of ALL) {
      const o = options(s, t, seeded())
      expect(new Set(o).size, s[t].es).toBe(4)
      expect(o.filter((x) => x === form(s, t))).toHaveLength(1)
    }
  })

  it('never offer what is good Spanish too: the present for mañana, ir a for hoy', () => {
    for (const s of SENTENCES) {
      expect(options(s, 'manana')).not.toContain(form(s, 'hoy'))
      expect(options(s, 'hoy')).not.toContain(form(s, 'manana'))
    }
  })

  it('are each said aloud by the narrator, in all three times', () => {
    const items = new Map(speechItems().map((i) => [i.text, i.voice]))
    for (const { s, t } of ALL)
      expect(items.get(plain(s, t)), plain(s, t)).toBe(LINE_VOICE)
  })
})

describe('a round of Ayer, hoy, mañana', () => {
  const met = () => {
    const b = emptyBank()
    for (const s of SENTENCES) b.cards[s.verb] = newCard(now - 86_400_000)
    return b
  }

  it('is eight moves, easiest first, each to another time', () => {
    for (let seed = 1; seed < 30; seed++) {
      const r = round(met(), now, seeded(seed))
      expect(r).toHaveLength(ROUND)
      expect(r.map((m) => m.s.level)).toEqual([1, 1, 2, 2, 3, 3, 4, 4])
      expect(new Set(r.map((m) => m.s)).size).toBe(ROUND)
      expect([r[0].from, r[0].to]).toEqual(['hoy', 'ayer'])
      for (const m of r) {
        expect(m.from).not.toBe(m.to)
        expect(m.options).toContain(form(m.s, m.to))
      }
      expect(new Set(r.map((m) => m.to)).size).toBe(3)
    }
  })

  it('takes verbs met before verbs not met', () => {
    const b = emptyBank()
    b.cards.comer = newCard(now)
    b.cards.hablar = newCard(now)
    const firsts = round(b, now, seeded(2)).slice(0, 2)
    expect(firsts.map((m) => m.s.verb).sort()).toEqual(['comer', 'hablar'])
  })

  it('says why a pick was wrong', () => {
    const s = SENTENCES.find((x) => x.verb === 'comer' && x.who === 'yo')!
    expect(why(s, 'ayer', 'comió')).toBe(
      'Det heter comí. Comió hører til él og ella, men her er det yo.',
    )
    expect(why(s, 'ayer', 'como')).toBe(
      'Det heter comí. Med ayer står verbet i fortid.',
    )
    const x = SENTENCES.find((y) => y.verb === 'decir')!
    expect(why(x, 'hoy', 'digo')).toBe(
      'Det heter dice. Digo hører til yo, men her er det ella.',
    )
    // the wrong person and the wrong time: the time is what the game is about
    expect(why(s, 'manana', 'comió')).toBe(
      'Det heter voy a comer. Med mañana brukes ir a og infinitiv.',
    )
  })
})
