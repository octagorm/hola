import { describe, expect, it } from 'vitest'
import {
  DAY,
  KNOWN,
  answer,
  answerCard,
  emptyBank,
  known,
  level,
  merge,
  newCard,
  recall,
  same,
  stable,
  toMeet,
  weakest,
  withStart,
} from '../src/app/lib/bank'
import {
  DAILY_GAMES,
  FADING,
  NEEDS,
  chapterLine,
  clueCount,
  fadingWords,
  memory,
  plan,
  ready,
  retheme,
  summary,
} from '../src/app/lib/today'
import { TAUGHT, WORD, WORDS } from '../src/app/data/words'
import {
  KNOWN_AT_START,
  PRACTISED_AT_START,
  START,
  THEMES_AT_START,
} from '../src/app/data/start'
import { THEME } from '../src/app/data/themes'
import type { Bank } from '../src/app/lib/bank'

const now = Date.UTC(2026, 9, 22, 12)

describe('memory', () => {
  it('fades to 90 % after its stability in days', () => {
    expect(recall({ s: 2, t: now }, now + 2 * DAY)).toBeCloseTo(0.9, 2)
  })

  it('grows more from practice spaced out than crammed', () => {
    const m = { s: 1, t: now }
    const soon = answer(m, true, now + DAY / 24)
    const later = answer(m, true, now + 3 * DAY)
    expect(later.s).toBeGreaterThan(soon.s)
  })

  it('falls below known on a real slip', () => {
    expect(answer({ s: 10, t: now }, false, now + DAY).s).toBeLessThan(KNOWN)
  })
})

describe('a card', () => {
  it('shows a word in Spanish alone once reading it holds', () => {
    expect(level(undefined, now)).toBe(0)
    expect(level(newCard(now), now)).toBe(1)
    expect(level(known(now), now)).toBe(2)
  })

  it('learns only the links asked about', () => {
    const c = answerCard(newCard(now), ['decir'], true, now + DAY)
    expect(c.decir.s).toBeGreaterThan(c.leer.s)
  })

  it('has its most faded link practised', () => {
    const c = { ...known(now), decir: { s: 0.05, t: now } }
    expect(weakest(c, now + DAY, () => 0)).toBe('decir')
    expect(weakest(c, now + DAY, () => 0, ['leer'])).toBe('leer')
  })

  it('reads a card saved with hearing apart as the better of the two', () => {
    const t = now - 10 * DAY
    const old = (leer: number, oir: number) => ({
      cards: {
        hola: {
          ...newCard(t),
          leer: { s: leer, t },
          oir: { s: oir, t: t + DAY },
        },
      },
    })
    const heard = merge(old(0.5, 6), emptyBank()).cards.hola
    expect(heard?.leer).toEqual({ s: 6, t: t + DAY })
    expect(heard).not.toHaveProperty('oir')
    const read = merge(old(9, 0.2), emptyBank()).cards.hola
    expect(read?.leer).toEqual({ s: 9, t })
    expect(read).not.toHaveProperty('oir')
  })
})

describe('two banks merged', () => {
  it('keep each link answered last and the larger points', () => {
    const a = emptyBank()
    const b = emptyBank()
    a.cards['el gato'] = { ...newCard(now), leer: { s: 3, t: now + 5 } }
    b.cards['el gato'] = { ...newCard(now), decir: { s: 4, t: now + 9 } }
    a.days['2026-10-22'] = 5
    b.days['2026-10-22'] = 9
    const m = merge(a, b)
    expect(m.cards['el gato']?.leer.s).toBe(3)
    expect(m.cards['el gato']?.decir.s).toBe(4)
    expect(m.days['2026-10-22']).toBe(9)
  })

  it('read a bank saved before a field existed', () => {
    const m = merge({ cards: {} }, emptyBank())
    expect(m.palabra).toEqual({})
  })

  // Two copies as late as each other: each device must keep the same one,
  // or they save their own over the other's for ever
  const path = (arg: string): Bank['path'] => ({
    d: '2026-10-25',
    t: now,
    steps: [{ k: 'game', arg }],
    met: 0,
    known: 0,
    s0: {},
  })
  const ties = (): Array<[Bank, Bank]> => {
    const a = emptyBank()
    const b = emptyBank()
    a.cards['el gato'] = { ...newCard(now), n: 2, leer: { s: 3, t: now } }
    b.cards['el gato'] = { ...newCard(now), n: 1, leer: { s: 5, t: now } }
    a.path = path('palabra')
    b.path = path('rosco')
    a.place.cuento = { p: 3, t: now }
    b.place.cuento = { p: 7, w: 2, t: now }
    a.theme = { on: [{ id: 'mancha', p: 1 }], t: now }
    b.theme = { on: [{ id: 'mancha', p: 2 }], t: now }
    const c = emptyBank()
    c.cards['el gato'] = newCard(now)
    // The same bank, with its keys in another order, as localStorage keeps it
    const sorted = JSON.parse(stable(c)) as Bank
    return [
      [a, b],
      [c, sorted],
    ]
  }

  it('keep the same of two as late, whichever is merged into which', () => {
    for (const [a, b] of ties())
      expect(same(merge(a, b), merge(b, a))).toBe(true)
  })

  it('settle when two devices sync through the account', () => {
    // As Synced does (lib/account.tsx): each copy from the account is
    // merged in, and saved back if the account's differs; every save comes
    // back to both devices
    for (const [a, b] of ties()) {
      const devices = [a, b]
      let saved: string | null = null
      let saves = 0
      const queue = [0, 1]
      while (queue.length && saves < 50) {
        const i = queue.shift() ?? 0
        const remote = saved === null ? null : (JSON.parse(saved) as Bank)
        devices[i] = merge(devices[i], remote ?? emptyBank())
        if (!remote || !same(devices[i], remote)) {
          saved = JSON.stringify(devices[i])
          saves++
          queue.push(0, 1)
        }
      }
      expect(saves).toBeLessThanOrEqual(2)
      expect(same(devices[0], devices[1])).toBe(true)
    }
  })
})

describe('the starting point', () => {
  it('lists words of the bank, each once', () => {
    const all = [...KNOWN_AT_START, ...PRACTISED_AT_START]
    for (const id of all) expect(WORD[id], id).toBeDefined()
    expect(new Set(all).size).toBe(all.length)
  })

  it('starts the simplest words known and the easy ones practised', () => {
    const b = withStart(emptyBank(), now)
    expect(b.start).toBe(START)
    for (const id of KNOWN_AT_START)
      expect(level(b.cards[id], now + 14 * DAY), id).toBe(2)
    // understood, so read without the Norwegian, but weak to come up with
    for (const id of PRACTISED_AT_START) {
      const c = b.cards[id]
      expect(level(c, now + 5 * DAY), id).toBe(2)
      if (c) expect(recall(c.decir, now), id).toBeLessThan(recall(c.leer, now))
    }
    // spread, so that they do not all fade on the same day
    const s = new Set(PRACTISED_AT_START.map((id) => b.cards[id]?.leer.s))
    expect(s.size).toBeGreaterThan(PRACTISED_AT_START.length / 2)
    // and the first warm-up is of words being practised
    const warm = plan(b, now).steps[0]
    expect(warm.k).toBe('review')
    for (const id of warm.ids ?? []) expect(PRACTISED_AT_START).toContain(id)
    // and the starting point's words, fading but never answered, hold no
    // new words back, on the first day or later
    for (const t of [now, now + 3 * DAY]) {
      const fresh = plan(b, t).steps.find((x) => x.k === 'new')
      expect(fresh?.ids).toHaveLength(4)
      expect(summary(plan(b, t), b, t).tomorrow).toBe(0)
    }
  })

  it('sums up the link answered today, shorter when got wrong', () => {
    const b = withStart(emptyBank(), now)
    const p = plan(b, now)
    const id = p.steps[0].ids?.[0] ?? ''
    const later = now + 60_000
    b.cards[id] = answerCard(b.cards[id], ['decir'], false, later)
    const [row] = summary(p, b, later).words
    expect(row.id).toBe(id)
    expect(row.link).toBe('decir')
    expect(row.after).toBeLessThan(row.before)
    // and leaves out a word not answered yet
    expect(summary(p, b, later).words).toHaveLength(1)
  })

  it('touches nothing learnt, and is given once', () => {
    const b = emptyBank()
    b.cards.hola = newCard(now)
    b.cards['el gato'] = answerCard(newCard(now), ['leer'], false, now)
    const s = withStart(b, now + DAY)
    expect(s.cards.hola).toBe(b.cards.hola)
    expect(s.cards['el gato']).toBe(b.cards['el gato'])
    expect(s.cards.adiós?.z).toBe(1)
    delete s.cards.adiós
    expect(withStart(s, now + 2 * DAY).cards.adiós).toBeUndefined()
  })

  it('has the easy words understood in a bank given them before', () => {
    const first = withStart(emptyBank(), now)
    const b: Bank = { ...first, start: 2 }
    const [easy, answered] = PRACTISED_AT_START
    for (const id of [easy, answered]) {
      const c = b.cards[id]
      if (c) b.cards[id] = { ...c, leer: { s: 0.5, t: now - DAY / 2 } }
    }
    b.cards[answered] = answerCard(b.cards[answered], ['decir'], true, now)
    const s = withStart(b, now + DAY)
    expect(s.start).toBe(START)
    expect(level(s.cards[easy], now + DAY), easy).toBe(2)
    expect(s.cards[easy]?.decir).toEqual(b.cards[easy]?.decir)
    expect(s.cards[answered]).toBe(b.cards[answered])
    // and a device still with the old seed takes the new one in a merge
    expect(level(merge(b, s).cards[easy], now + DAY)).toBe(2)
  })

  it('starts with the everyday themes, unless themes have been chosen', () => {
    for (const x of THEMES_AT_START) expect(THEME[x.id], x.id).toBeDefined()
    const b = withStart(emptyBank(), now)
    expect(b.theme).toEqual({ on: THEMES_AT_START, t: 0 })
    expect(toMeet(b)[0].lesson).toBe(THEMES_AT_START[0].id)
    // a bank given an earlier starting point gets them too
    const before = { ...emptyBank(), start: START - 1 }
    expect(withStart(before, now).theme.on).toEqual(THEMES_AT_START)
    // but a choice made, even of none, is kept
    const none = { ...emptyBank(), theme: { on: [], t: now } }
    expect(withStart(none, now).theme).toEqual(none.theme)
    const one = {
      ...emptyBank(),
      theme: { on: [{ id: 'cuba', p: 3 as const }], t: now },
    }
    expect(withStart(one, now).theme).toEqual(one.theme)
    // and wins in a merge, while a bank that never chose takes them
    expect(merge(b, none).theme).toEqual(none.theme)
    expect(merge(emptyBank(), b).theme.on).toEqual(THEMES_AT_START)
    expect(merge(b, emptyBank()).theme.on).toEqual(THEMES_AT_START)
  })

  it('gives way in a merge to a card with answers, however old', () => {
    const old = emptyBank()
    old.cards.hola = answerCard(newCard(now), ['leer'], true, now)
    const fresh = withStart(emptyBank(), now + 30 * DAY)
    const m = merge(fresh, old)
    expect(m.cards.hola).toEqual(old.cards.hola)
    expect(m.cards.hola?.z).toBeUndefined()
    expect(m.cards.adiós?.z).toBe(1)
    expect(m.start).toBe(START)
  })

  it('is no longer a seed once answered', () => {
    const b = withStart(emptyBank(), now)
    const c = answerCard(b.cards.hola, ['decir'], true, now + DAY)
    expect(c.z).toBeUndefined()
    expect(c.leer).toEqual(b.cards.hola?.leer)
  })
})

describe('the day’s chapter', () => {
  it('starts a new player on new words and a game', () => {
    const p = plan(emptyBank(), now)
    expect(p.steps.map((s) => s.k)).toEqual(['new', 'game', 'listen'])
    expect(p.steps[0].ids).toHaveLength(5)
  })

  it('reviews fading words first, and leaves listening out without a voice', () => {
    const b = emptyBank()
    for (const w of WORDS.slice(0, 30)) b.cards[w.id] = newCard(now - 5 * DAY)
    const p = plan(b, now, { hear: false })
    expect(p.steps[0].k).toBe('review')
    expect(p.steps[0].ids).toHaveLength(8)
    expect(p.steps.some((s) => s.k === 'listen')).toBe(false)
  })

  it('waits for words that make clues before the crossword, the ring and the chain', () => {
    // The first lesson is greetings, which make no clues
    const b = emptyBank()
    for (const w of WORDS.slice(0, 25)) b.cards[w.id] = newCard(now)
    const clues = clueCount(b)
    expect(clues).toBeLessThan(12)
    const games = DAILY_GAMES.filter((g) => ready(g, 25, clues))
    expect(games).toEqual(DAILY_GAMES.filter((g) => !NEEDS[g]))
    for (const w of WORDS.slice(0, 60)) b.cards[w.id] = newCard(now)
    // The chain waits for words enough to make a chain of eight
    expect(DAILY_GAMES.filter((g) => !ready(g, 60, clueCount(b)))).toEqual([
      'cadena',
    ])
    for (const w of WORDS.slice(0, 260)) b.cards[w.id] = newCard(now)
    expect(DAILY_GAMES.every((g) => ready(g, 260, clueCount(b)))).toBe(true)
  })

  it('gives every game its turn, on the days between the chapters too', () => {
    const b = emptyBank()
    for (const w of WORDS.slice(0, 300)) b.cards[w.id] = newCard(now)
    const seen = new Set<string>()
    let stories = 0
    for (let d = 0; d < 2 * DAILY_GAMES.length; d++) {
      const p = plan(b, now + d * DAY)
      if (p.steps.some((s) => s.k === 'story')) stories++
      for (const s of p.steps) if (s.k === 'game' && s.arg) seen.add(s.arg)
    }
    expect(stories).toBe(DAILY_GAMES.length)
    expect([...seen].sort()).toEqual([...DAILY_GAMES].sort())
  })
})

describe('the themes', () => {
  const theme = (id: string, t = now) => ({
    ...emptyBank(),
    theme: { on: [{ id, p: 1 as const }], t },
  })

  it('has today’s chapter meet its words before the rest', () => {
    const p = plan(theme('mancha'), now)
    const fresh = p.steps.find((s) => s.k === 'new')?.ids ?? []
    expect(fresh).toHaveLength(5)
    for (const id of fresh) expect(WORD[id]?.lesson).toBe('mancha')
    expect(chapterLine(p)).toContain('fra «Don Quijotes ord»')
    // without one, in lesson order
    const plain = plan(emptyBank(), now).steps[0].ids ?? []
    expect(WORD[plain[0]]?.lesson).toBe(WORDS[0].lesson)
    expect(chapterLine(plan(emptyBank(), now))).not.toContain('fra «')
  })

  it('goes on in lesson order once its words are all met', () => {
    const b = theme('mancha')
    for (const w of WORDS.filter((x) => x.lesson === 'mancha'))
      b.cards[w.id] = newCard(now - DAY)
    const fresh = plan(b, now).steps.find((s) => s.k === 'new')?.ids ?? []
    expect(fresh.length).toBeGreaterThan(0)
    for (const id of fresh) expect(WORD[id]?.lesson).not.toBe('mancha')
  })

  it('takes over today’s new words if none of them is begun', () => {
    const p = plan(emptyBank(), now)
    const b = theme('suenos')
    const q = retheme(p, b)
    const fresh = q.steps.find((s) => s.k === 'new')?.ids ?? []
    expect(fresh).toHaveLength(5)
    for (const id of fresh) expect(WORD[id]?.lesson).toBe('suenos')
    // a step begun keeps its words
    const begun = {
      ...p,
      steps: p.steps.map((s) =>
        s.k === 'new' ? { ...s, got: [`${s.ids?.[0]} met`] } : s,
      ),
    }
    expect(retheme(begun, b)).toEqual(begun)
  })

  it('are the choice made last when two banks are merged', () => {
    const a = theme('mancha', now)
    const both = [
      { id: 'suenos', p: 2 as const },
      { id: 'mancha', p: 1 as const },
    ]
    const b = { ...emptyBank(), theme: { on: both, t: now + 1000 } }
    expect(merge(a, b).theme.on).toEqual(both)
    expect(merge(b, a).theme.on).toEqual(both)
    // leaving them all is a choice too
    const none = { ...emptyBank(), theme: { on: [], t: now + 2000 } }
    expect(merge(none, b).theme.on).toEqual([])
    // a bank saved before themes has none, and one saved before
    // priorities has those it chose at 1
    const old: Partial<Bank> = { cards: {} }
    expect(merge(old, emptyBank()).theme).toEqual({ on: [], t: 0 })
    expect(merge(old, a).theme.on).toEqual([{ id: 'mancha', p: 1 }])
    const one = { theme: { id: 'tapas', t: now } } as unknown as Partial<Bank>
    expect(merge(one, emptyBank()).theme).toEqual({
      on: [{ id: 'tapas', p: 1 }],
      t: now,
    })
    const ids = {
      theme: { ids: ['tapas', 'mancha'], t: now },
    } as unknown as Partial<Bank>
    expect(merge(ids, emptyBank()).theme.on).toEqual([
      { id: 'tapas', p: 1 },
      { id: 'mancha', p: 1 },
    ])
  })

  it('give today’s new words from each chosen theme in turn', () => {
    const on = [
      { id: 'mancha', p: 1 as const },
      { id: 'suenos', p: 1 as const },
    ]
    const b = { ...emptyBank(), theme: { on, t: now } }
    const fresh = plan(b, now).steps.find((s) => s.k === 'new')?.ids ?? []
    expect(fresh).toHaveLength(5)
    const lessons = fresh.map((id) => WORD[id]?.lesson)
    expect(lessons).toEqual(['mancha', 'suenos', 'mancha', 'suenos', 'mancha'])
    // all of theirs before any other
    const chosen = toMeet(b).map((w) => ['mancha', 'suenos'].includes(w.lesson))
    expect(chosen.indexOf(false)).toBe(chosen.lastIndexOf(true) + 1)
  })

  it('take as many words a round from a theme as its priority', () => {
    const on = [
      { id: 'mancha', p: 1 as const },
      { id: 'suenos', p: 3 as const },
    ]
    const b = { ...emptyBank(), theme: { on, t: now } }
    const lessons = toMeet(b)
      .slice(0, 8)
      .map((w) => w.lesson)
    expect(lessons).toEqual([
      'mancha',
      'suenos',
      'suenos',
      'suenos',
      'mancha',
      'suenos',
      'suenos',
      'suenos',
    ])
  })
})

describe('how the words stand', () => {
  it('counts the starting point by how it is read, and none of it fading', () => {
    const b = withStart(emptyBank(), now)
    const m = memory(b, now + 3 * DAY)
    expect(m.fading).toBe(0)
    expect(m.known + m.learning).toBe(WORDS.filter((w) => b.cards[w.id]).length)
    expect(m.waiting).toBe(TAUGHT.filter((w) => !b.cards[w.id]).length)
    expect(fadingWords(b, now + 3 * DAY)).toEqual([])
  })

  it('counts a word answered as fading once it falls, and soon before', () => {
    const b = withStart(emptyBank(), now)
    const gato = answerCard(newCard(now), ['leer', 'decir'], true, now)
    b.cards['el gato'] = gato
    // recall reaches FADING after 9s(1/FADING − 1) days
    const falls = 9 * gato.decir.s * (1 / FADING - 1) * DAY
    expect(memory(b, now + falls - DAY / 2).tomorrow).toBe(1)
    expect(memory(b, now + falls - DAY / 2).fading).toBe(0)
    expect(memory(b, now + falls + 1000).fading).toBe(1)
    expect(fadingWords(b, now + falls + 1000).map((w) => w.id)).toEqual([
      'el gato',
    ])
    // but not while just seen
    const seen = { ...b, cards: { ...b.cards } }
    seen.cards['el gato'] = { ...gato, t: now + falls }
    expect(fadingWords(seen, now + falls + 1000)).toEqual([])
  })
})
