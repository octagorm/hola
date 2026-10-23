import { describe, expect, it } from 'vitest'
import { WORD } from '../src/app/data/words'
import {
  FIRST_STOP,
  FIRST_WORDS,
  NX,
  NY,
  PLACES,
  SAY,
  SIDE,
  TAXI_LINES,
} from '../src/app/data/taxi'
import { TAXI_VOICE, VOICES } from '../src/app/data/voices'
import {
  endOf,
  euros,
  fare,
  judge,
  loops,
  pathOf,
  plan,
  spotAt,
  standing,
  stopsFor,
} from '../src/app/lib/taxi'
import { speechItems } from '../src/app/lib/spoken'
import { plain, tokens } from '../src/app/lib/text'
import type { Instruction, Point } from '../src/app/lib/taxi'

// The same rides every run
function seeded(seed = 7) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('the passenger', () => {
  it('only says words in the bank', () => {
    for (const line of TAXI_LINES)
      expect(() => tokens(line), line).not.toThrow()
    for (const id of [...FIRST_WORDS, ...PLACES.map((p) => p.id)])
      expect(WORD[id], id).toBeTruthy()
  })

  it('says each line once, as Spanish has it', () => {
    expect(new Set(TAXI_LINES).size).toBe(TAXI_LINES.length)
    expect(plain(SAY.go('el banco'))).toBe(
      'Buenas tardes. Al banco, por favor.',
    )
    expect(plain(SAY.go('la estación'))).toBe(
      'Buenas tardes. A la estación, por favor.',
    )
    expect(plain(SAY.stop('el museo'))).toBe(
      'Pare delante del museo, por favor.',
    )
    expect(plain(SAY.stop('la farmacia'))).toBe(
      'Pare delante de la farmacia, por favor.',
    )
    expect(plain(SAY.at('el cine', 'left'))).toBe(
      'Al llegar al cine, a la izquierda.',
    )
    expect(plain(SAY.count({ form: 'tercera', id: 'tercero' }, 'right'))).toBe(
      'En la tercera calle, a la derecha.',
    )
  })

  it('has every line listed to be said aloud, in its own voice', () => {
    const items = new Map(speechItems().map((s) => [s.text, s.voice]))
    for (const line of TAXI_LINES)
      expect(items.get(plain(line)), line).toBe(TAXI_VOICE)
    expect(VOICES[TAXI_VOICE]).toBeTruthy()
  })
})

describe('the town', () => {
  it('has each place once, to be stopped at from two streets', () => {
    const lots = new Set(
      PLACES.map((p) => `${p.lot.bx},${p.lot.by},${p.lot.q}`),
    )
    expect(lots.size).toBe(PLACES.length)
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length)
    for (const p of PLACES) {
      expect(p.lot.bx < NX - 1 && p.lot.by < NY - 1, p.id).toBe(true)
      expect(stopsFor(p.lot), p.id).toHaveLength(2)
    }
    expect(PLACES.some((p) => p.id === FIRST_STOP)).toBe(true)
  })
})

describe('a ride', () => {
  it('asks for each move once, in order, and ends at its place', () => {
    const rand = seeded(20261023)
    let spot = spotAt(FIRST_STOP)
    let last: Array<string> = []
    const seen = new Set<string>()
    for (let n = 0; n < 300; n++) {
      const ride = plan(spot, rand, last)
      const path = pathOf(ride.route)
      expect(TAXI_LINES).toContain(ride.opener)
      let s = -1
      const crossings: Array<Point> = []
      for (const ins of ride.instructions) {
        expect(TAXI_LINES, ins.line).toContain(ins.line)
        seen.add(ins.kind)
        ins.points.forEach((p, i) => {
          expect(path.sOf(p), ins.line).toBeGreaterThan(s)
          s = path.sOf(p)
          // the move asked for is the one that is right
          expect(judge(ins, i, p.expect).ok).toBe(true)
          if (!p.lot) crossings.push(p)
        })
        for (const id of ins.words) expect(WORD[id], id).toBeTruthy()
      }
      expect(crossings.map((p) => p.expect)).toEqual(ride.route.moves)
      const end = ride.instructions[ride.instructions.length - 1]
      const stop = end.points[end.points.length - 1]
      expect(end.kind).toBe('stop')
      expect(stop.expect).toBe('stop')
      expect(path.sOf(stop)).toBeCloseTo(path.len, 6)
      expect(ride.route.moves.length).toBeGreaterThan(0)
      // never round a block to get there
      expect(loops(ride.route), ride.route.moves.join(' ')).toBe(false)
      // a fare as long as the ride
      expect(ride.fare).toBe(fare(ride.route.edges.length))
      last = [ride.to.id]
      spot = endOf(ride)
    }
    // every kind of instruction comes up
    expect([...seen].sort()).toEqual(
      ['ahead', 'at', 'count', 'forward', 'stop', 'straight', 'turn'].sort(),
    )
  })

  it('asks more of the ear than izquierda and derecha', () => {
    const rand = seeded(11)
    let spot = spotAt(FIRST_STOP)
    let last: Array<string> = []
    let past = 0
    let caught = 0
    const N = 300
    for (let n = 0; n < N; n++) {
      const ride = plan(spot, rand, last)
      const end = ride.instructions[ride.instructions.length - 1]
      const lots = end.points.filter((p) => p.lot)
      // another place on the right to drive past before the one asked for
      if (lots[0].expect !== 'stop') past++
      // a driver who only catches the side, and turns at once, or stops at
      // the first place
      const wrong = ride.instructions.some((ins) => {
        if (ins.kind === 'stop') return lots[0].expect !== 'stop'
        const side = ins.words.includes(SIDE.left)
          ? 'left'
          : ins.words.includes(SIDE.right)
            ? 'right'
            : 'straight'
        return ins.points[0].expect !== side
      })
      if (wrong) caught++
      last = [ride.to.id]
      spot = endOf(ride)
    }
    expect(past / N).toBeGreaterThan(0.7)
    expect(caught / N).toBeGreaterThan(0.9)
  })

  it('starts where the taxi stands, and goes somewhere else', () => {
    const rand = seeded(3)
    const spot = spotAt(FIRST_STOP)
    for (let n = 0; n < 40; n++) {
      const ride = plan(spot, rand)
      expect(ride.to.id).not.toBe(FIRST_STOP)
      const a = standing(spot).at(0)
      const b = pathOf(ride.route).at(0)
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(1e-9)
    }
  })

  it('says so when a turn comes too early, or the stop is wrong', () => {
    const count: Instruction = {
      kind: 'count',
      line: SAY.count({ form: 'segunda', id: 'segundo' }, 'left'),
      words: ['segundo', 'a la izquierda'],
      points: [
        { edge: 0, d: 64, expect: 'straight' },
        { edge: 1, d: 64, expect: 'left' },
      ],
    }
    expect(judge(count, 0, 'left')).toEqual({
      ok: false,
      missed: ['segundo'],
      complaint: 'early',
    })
    expect(judge(count, 1, 'right').missed).toEqual(['a la izquierda'])
    expect(judge(count, 1, 'straight').missed).toEqual(['segundo'])
    const lot = { bx: 1, by: 1, q: 0 as const }
    const stop: Instruction = {
      kind: 'stop',
      line: SAY.stop('el bar'),
      words: ['el bar', 'parar'],
      points: [
        { edge: 0, d: 24, expect: 'straight', lot },
        { edge: 0, d: 48, expect: 'stop', lot },
      ],
    }
    expect(judge(stop, 0, 'stop').complaint).toBe('notHere')
    expect(judge(stop, 1, 'straight').missed).toEqual(['el bar'])
    const turn: Instruction = {
      kind: 'turn',
      line: SAY.turn('right'),
      words: ['a la derecha'],
      points: [{ edge: 0, d: 64, expect: 'right' }],
    }
    expect(judge(turn, 0, 'left')).toEqual({
      ok: false,
      missed: ['a la derecha'],
      complaint: 'wrong',
    })
  })
})

describe('the meter', () => {
  it('starts at the flag drop and adds for each street after two', () => {
    expect(fare(1)).toBe(255)
    expect(fare(2)).toBe(255)
    expect(fare(3)).toBe(325)
    expect(fare(6)).toBe(535)
    expect(euros(255)).toBe('2,55 €')
    expect(euros(1005)).toBe('10,05 €')
  })
})
