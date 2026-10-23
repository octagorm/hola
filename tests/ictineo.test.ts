import { describe, expect, it } from 'vitest'
import { WORD, WORDS } from '../src/app/data/words'
import { DESIGNED, VOICES } from '../src/app/data/voices'
import { THEME_GROUPS } from '../src/app/data/themes'
import { DODGE, LINES, ORDER, ORDERS, VOYAGES } from '../src/app/data/ictineo'
import {
  AIR_LOW,
  CAPTAIN,
  DEEPEST,
  Dive,
  HULL,
  MEND,
  REVEAL,
  SEEN_GAIN,
  actionsOf,
  bestKey,
  effect,
  evidence,
  fits,
  gain,
  ictineoLines,
  isOpen,
  pickDodge,
  span,
  startBoat,
  voyageOrders,
  voyageWords,
} from '../src/app/lib/ictineo'
import { speechItems } from '../src/app/lib/spoken'
import { plain, wordIds } from '../src/app/lib/text'
import type { Hud, Settled } from '../src/app/lib/ictineo'
import type { Voyage } from '../src/app/data/ictineo'

// The same numbers every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('the orders of the Ictíneo', () => {
  it('are said in words of the bank, each turning on words it has', () => {
    for (const o of ORDERS) {
      const ids = wordIds(o.line)
      expect(o.do.length, o.id).toBe(o.keys.length)
      for (const keys of o.keys) {
        expect(keys.length, o.id).toBeGreaterThan(0)
        for (const id of keys) {
          expect(WORD[id], `${o.id}: ${id}`).toBeTruthy()
          expect(ids, o.id).toContain(id)
        }
      }
      expect(o.no, o.id).toMatch(/[!.]$/)
    }
    for (const l of LINES) expect(() => wordIds(l.line), l.id).not.toThrow()
  })

  it('read as Spanish is written', () => {
    const said = (id: string) => plain(ORDER[id]!.line)
    expect(said('babor')).toBe('¡A babor!')
    expect(said('roca-estribor')).toBe('¡Una roca! ¡A estribor!')
    expect(said('superficie')).toBe('¡A la superficie!')
    expect(said('alto-ancla')).toBe('¡Alto! ¡Echa el ancla!')
    expect(said('cierra-inmersion')).toBe('¡Cierra la escotilla! ¡Inmersión!')
    expect(said('avante-toda')).toBe('¡Avante toda!')
    const line = (id: string) => plain(LINES.find((l) => l.id === id)!.line)
    expect(line('hola')).toBe('¡Buenos días! Soy Narciso Monturiol.')
    expect(line('este')).toBe('Este es el Ictíneo, mi submarino.')
    expect(line('a-casa')).toBe('Volvemos a casa. ¡Mañana, otra vez!')
  })

  it('are each said in the captain’s voice, every text its own', () => {
    expect(VOICES[CAPTAIN].base).toBe(CAPTAIN)
    expect(DESIGNED[CAPTAIN]).toBeTruthy()
    const texts = ictineoLines().map(({ line }) => plain(line))
    expect(new Set(texts).size).toBe(texts.length)
    const voice = new Map(speechItems().map((s) => [s.text, s.voice]))
    for (const t of texts) expect(voice.get(t), t).toBe(CAPTAIN)
  })

  it('use every word of their lesson, a theme among history and art', () => {
    const group = THEME_GROUPS.find((g) => g.id === 'historia')
    expect(group?.themes.map((t) => t.lesson)).toContain('ictineo')
    const used = new Set([...ORDERS, ...LINES].flatMap((x) => wordIds(x.line)))
    const lesson = WORDS.filter((w) => w.lesson === 'ictineo')
    expect(lesson.length).toBeGreaterThan(15)
    for (const w of lesson) expect(used.has(w.id), w.id).toBe(true)
  })
})

describe('the voyages', () => {
  it('give orders that exist, with the controls they have', () => {
    expect(VOYAGES.map((v) => v.id)).toEqual([
      'barcelona',
      'creus',
      'alicante',
      'noche',
    ])
    for (const v of VOYAGES) {
      for (const s of v.steps)
        if (s.k === 'order') expect(ORDER[s.order], s.order).toBeTruthy()
        else if (s.k === 'say')
          expect(
            LINES.some((l) => l.id === s.line),
            s.line,
          ).toBe(true)
      for (const id of [...v.pool, ...v.air, ...v.dive])
        expect(ORDER[id], id).toBeTruthy()
      for (const id of v.pool) expect(DODGE[id], id).toBeTruthy()
      const helm = new Set(actionsOf(v))
      for (const o of voyageOrders(v))
        for (const a of o.do) expect(helm.has(a), `${v.id}: ${o.id}`).toBe(true)
      // Both sides, up and down, on the way
      const kinds = new Set(v.pool.map((id) => DODGE[id]))
      for (const k of ['rock-l', 'rock-r', 'reef', 'net'] as const)
        expect(kinds.has(k), `${v.id}: ${k}`).toBe(true)
    }
    // Each voyage after the first brings something new to do
    expect(VOYAGES[0].tools).toEqual([])
    for (const v of VOYAGES.slice(1)) expect(v.tools.length).toBe(2)
  })

  it('open one after the other, as each comes home', () => {
    expect(isOpen({}, 0)).toBe(true)
    expect(isOpen({}, 1)).toBe(false)
    expect(isOpen({ [bestKey('barcelona')]: 120 }, 1)).toBe(true)
    expect(isOpen({ [bestKey('barcelona')]: 120 }, 2)).toBe(false)
  })

  it('meet a handful of new words each, the first voyage its own seven', () => {
    const first = voyageWords(VOYAGES[0]).filter(
      (id) => WORD[id]?.lesson === 'ictineo',
    )
    expect(first.sort()).toEqual(
      [
        'a babor',
        'a estribor',
        'arriba',
        'abajo',
        'avante',
        'despacio',
        '¡alto!',
      ].sort(),
    )
    let met = new Set(first)
    for (const v of VOYAGES.slice(1)) {
      const fresh = voyageWords(v).filter((id) => !met.has(id))
      expect(fresh.length, v.id).toBeLessThanOrEqual(6)
      met = new Set([...met, ...fresh])
    }
  })
})

describe('the boat', () => {
  const v = VOYAGES[1]

  it('steers, dives and comes up, and changes speed', () => {
    let b = startBoat(v)
    expect(b.hatch).toBe(true)
    b = effect(b, 'escotilla')
    expect(b.hatch).toBe(false)
    b = effect(b, 'rapido')
    expect(b.speed).toBe(2)
    b = effect(b, 'abajo')
    expect(b.depth).toBe(2)
    b = effect(effect(b, 'abajo'), 'abajo')
    expect(b.depth).toBe(DEEPEST)
    b = effect(b, 'arriba')
    expect(b.depth).toBe(2)
    b = effect(effect(b, 'babor'), 'babor')
    expect(b.lane).toBe(-1)
    b = effect(b, 'arriba', true)
    expect(b).toMatchObject({ depth: 0, lane: 0 })
    expect(effect(b, 'alto').speed).toBe(0)
    expect(effect(effect(b, 'despacio'), 'rapido').speed).toBe(2)
  })

  it('meets on the way only what it can get out of', () => {
    const b = { ...startBoat(v), depth: 1, speed: 2, lane: -1 }
    expect(fits('rock-l', ORDER.babor!, b)).toBe(false)
    expect(fits('rock-r', ORDER.estribor!, b)).toBe(true)
    expect(fits('reef', ORDER.arriba!, b)).toBe(false)
    expect(fits('keel', ORDER['barco-abajo']!, b)).toBe(true)
    expect(fits('bottom', ORDER['fondo-arriba']!, b)).toBe(false)
    // Nothing on the way at the surface, or stopped
    expect(fits('rock-r', ORDER.estribor!, { ...b, depth: 0 })).toBe(false)
    expect(fits('rock-r', ORDER.estribor!, { ...b, speed: 0 })).toBe(false)
    const random = seeded(3)
    for (let i = 0; i < 200; i++) {
      const at = {
        ...b,
        depth: 1 + Math.floor(random() * 3),
        lane: Math.floor(random() * 3) - 1,
        speed: 1 + Math.floor(random() * 3),
      }
      for (const w of VOYAGES) {
        const { order, danger } = pickDodge(w, at, ORDER.babor!, random)
        expect(w.pool, w.id).toContain(order.id)
        expect(order.id).not.toBe('babor')
        expect(fits(danger, order, at), `${order.id} at ${at.depth}`).toBe(true)
      }
    }
  })
})

describe('an order', () => {
  it('gives less time as the voyage goes on, more for two steps', () => {
    const v = VOYAGES[0]
    expect(span(ORDER.babor!, 0, v)).toBe(v.time)
    expect(span(ORDER.babor!, 20, v)).toBeLessThan(v.time)
    expect(span(ORDER.babor!, 200, v)).toBe(5)
    expect(span(ORDER['alto-ancla']!, 0, v)).toBe(v.time * 1.5)
  })

  it('earns more the quicker, twice as much for an officer', () => {
    expect(gain(true, 1, false)).toBe(20)
    expect(gain(true, 0, false)).toBe(10)
    expect(gain(true, 0.5, true)).toBe(30)
    expect(gain(false, 1, true)).toBe(0)
  })

  it('pays for being understood: half for a word looked up, little when seen', () => {
    expect(gain(true, 1, false, 'looked')).toBe(10)
    expect(gain(true, 0.5, true, 'looked')).toBe(16)
    expect(gain(true, 0.1, false, 'seen')).toBe(SEEN_GAIN)
    expect(gain(true, 0.1, true, 'seen')).toBe(SEEN_GAIN * 2)
    expect(gain(true, 0.1, false, 'seen')).toBeLessThan(gain(true, 0.1, false))
  })

  it('says something of its words only when understood, not seen', () => {
    const o = ORDER['roca-babor']!
    expect(evidence(o, 'right', [0.3], 'rock-l')).toEqual([
      { id: 'a babor', right: true, share: 1 },
    ])
    // Done once the rock showed the way: the picture told
    expect(evidence(o, 'right', [REVEAL + 0.05], 'rock-l')).toEqual([])
    expect(evidence(o, 'wrong', [], 'rock-l')).toEqual([
      { id: 'a babor', right: false, share: 1 },
    ])
    expect(evidence(o, 'late', [], 'rock-l')).toEqual([
      { id: 'a babor', right: false, share: 0.5 },
    ])
    // Two steps: the first done, the second wrong
    const two = ORDER['alto-ancla']!
    expect(evidence(two, 'wrong', [0.2], 'quay')).toEqual([
      { id: '¡alto!', right: true, share: 1 },
      { id: 'el ancla', right: false, share: 1 },
    ])
    // With nothing to see, late is still understood
    expect(evidence(ORDER.avante!, 'right', [0.9], 'none')).toEqual([
      { id: 'avante', right: true, share: 1 },
    ])
    // A word looked up says nothing, right or wrong
    const looked = new Set(['el ancla'])
    expect(evidence(two, 'right', [0.2, 0.3], 'quay', looked)).toEqual([
      { id: '¡alto!', right: true, share: 1 },
    ])
    expect(evidence(two, 'wrong', [0.2], 'quay', looked)).toEqual([
      { id: '¡alto!', right: true, share: 1 },
    ])
  })
})

// Sails a voyage to its end, the player doing `play` with each order a
// moment after it is given, as a player who has heard it would
async function sail(
  v: Voyage,
  play: (h: Hud, dive: Dive) => void,
  { officer = false, seed = 5, delay = 3 } = {},
) {
  const seen: { hud: Hud | null; over: Hud | null; air: number } = {
    hud: null,
    over: null,
    air: 100,
  }
  const settled: Array<Settled> = []
  let lowest = 100
  const dive = new Dive(v, {
    officer,
    speak: () => Promise.resolve(),
    onHud: (h) => (seen.hud = h),
    onTick: (t) => {
      seen.air = t.air
      lowest = Math.min(lowest, t.air)
    },
    onSettled: (s) => settled.push(s),
    onOver: (h) => (seen.over = h),
    random: seeded(seed),
  })
  void dive.sail()
  const flush = () => new Promise((r) => setImmediate(r))
  let given = -1
  let at = 0
  let t = 0
  for (let i = 0; i < 40000 && !seen.over; i++) {
    dive.update(0.05)
    t += 0.05
    await flush()
    const h = seen.hud
    if (h?.phase !== 'order') continue
    if (h.given !== given) {
      given = h.given
      at = t
    }
    if (at >= 0 && t - at >= delay) {
      at = -1
      play(h, dive)
      await flush()
    }
  }
  dive.stop()
  return { over: seen.over, settled, lowest, minutes: t / 60 }
}

describe('a dive', () => {
  for (const v of VOYAGES)
    it(`comes home from ${v.id} when every order is followed`, async () => {
      // Each order followed after a moment, as soon as it is given
      const { over, settled, lowest, minutes } = await sail(v, (h, d) => {
        for (const a of h.order?.do ?? []) d.act(a)
      })
      expect(over?.home).toBe(true)
      expect(over?.hull).toBe(HULL)
      expect(over?.missed).toEqual([])
      expect(over?.right).toBe(settled.length)
      expect(settled.every((s) => s.how === 'right')).toBe(true)
      expect(settled.flatMap((s) => s.evidence).every((e) => e.right)).toBe(
        true,
      )
      // Up for air once on the way, never short of it
      expect(over?.breaths, v.id).toBeGreaterThanOrEqual(1)
      expect(lowest, v.id).toBeGreaterThan(AIR_LOW - 15)
      expect(over?.score).toBeGreaterThan(settled.length * 15)
      expect(over?.bonus).toBe(HULL * 15)
      // A few minutes, followed at once; more when thought about
      expect(minutes, v.id).toBeGreaterThan(1.2)
      expect(minutes, v.id).toBeLessThan(3.5)
    })

  it('ends kindly after three bumps, the hull spent', async () => {
    // Every order missed by waiting
    const { over, settled } = await sail(VOYAGES[0], () => {})
    expect(over?.home).toBe(false)
    expect(over?.hull).toBe(0)
    expect(over?.hits).toBe(HULL)
    expect(over?.bonus).toBe(0)
    expect(over?.line?.id).toBe('a-casa')
    expect(settled.some((s) => s.how === 'late')).toBe(true)
    // Each miss is wrong by half on its words
    for (const e of settled.flatMap((s) => s.evidence))
      expect(e).toMatchObject({ right: false, share: 0.5 })
  })

  it('takes a wrong move as wrong at once, and doubles an officer’s points', async () => {
    let wrongs = 0
    const { over, settled } = await sail(
      VOYAGES[0],
      (h, d) => {
        const o = h.order
        if (!o) return
        // The first order underway steered the wrong way, the rest right
        if (wrongs === 0 && o.do[0] === 'babor') {
          wrongs++
          d.act('estribor')
          return
        }
        for (const a of o.do) d.act(a)
      },
      { officer: true },
    )
    expect(wrongs).toBe(1)
    const wrong = settled.find((s) => s.how === 'wrong')
    expect(wrong?.evidence).toEqual([{ id: 'a babor', right: false, share: 1 }])
    expect(over?.home).toBe(true)
    expect(over?.hits).toBe(1)
    const right = settled.find((s) => s.how === 'right')
    expect(right?.gain).toBeGreaterThanOrEqual(20)
    // The orders followed after it mended the plate
    const after = settled.slice(settled.indexOf(wrong!) + 1)
    expect(after.length).toBeGreaterThanOrEqual(MEND)
    expect(over?.mends).toBe(1)
    expect(over?.hull).toBe(HULL)
    expect(over?.bonus).toBe(HULL * 15 * 2)
  })

  it('mends no plate while the hull is whole, nor after a run broken', async () => {
    let n = 0
    const { over } = await sail(VOYAGES[0], (h, d) => {
      const o = h.order
      if (!o) return
      n++
      // Every fourth order missed by waiting: never five in a row
      if (n % 4 === 0) return
      for (const a of o.do) d.act(a)
    })
    expect(over?.mends).toBe(0)
    expect(over?.streak).toBeLessThan(MEND)
  })

  it('halves the points of an order whose words were looked up, and records nothing of them', async () => {
    let looked = 0
    const { settled } = await sail(VOYAGES[0], (h, d) => {
      const o = h.order
      if (!o) return
      if (looked === 0 && o.id === 'babor') {
        looked++
        d.look('a babor')
      }
      for (const a of o.do) d.act(a)
    })
    expect(looked).toBe(1)
    const helped = settled.find((s) => s.order.id === 'babor')!
    expect(helped.how).toBe('right')
    expect(helped.evidence).toEqual([])
    const unhelped = settled.find((s) => s.order.id === 'avante')!
    expect(helped.gain).toBe(Math.round(unhelped.gain / 2))
  })

  it('pays little for waiting until the danger shows the way', async () => {
    const { settled } = await sail(
      VOYAGES[0],
      (h, d) => {
        for (const a of h.order?.do ?? []) d.act(a)
      },
      { delay: 7.6 },
    )
    const seen = settled.filter((s) => s.how === 'right' && !s.evidence.length)
    expect(seen.length).toBeGreaterThan(0)
    for (const s of seen) expect(s.gain).toBe(SEEN_GAIN)
  })
})
