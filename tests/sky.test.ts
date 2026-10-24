import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  PERIODS,
  SCENE,
  blendColour,
  clockFrom,
  cropOf,
  moon,
  moonHour,
  moonPath,
  moonPlace,
  periods,
  sunTimes,
} from '../src/app/lib/sky'
import { HOME_PICTURES } from '../src/app/data/home-prompts'

const H = SCENE.height

describe('the time of day', () => {
  it('shows one painting, or two crossfading, all day', () => {
    for (const day of [
      '2026-03-20',
      '2026-06-21',
      '2026-10-16',
      '2026-12-21',
    ]) {
      const { rise, set } = sunTimes(new Date(`${day}T12:00:00`))
      // Oslo at midsummer: up before three, down after ten
      expect(rise, day).toBeGreaterThan(2 * 60)
      expect(set, day).toBeLessThan(23 * 60)
      expect(rise, day).toBeLessThan(set)
      for (let m = 0; m < 24 * 60; m += 10) {
        const d = new Date(`${day}T00:00:00`)
        d.setMinutes(m)
        const ws = periods(d)
        expect(ws.length, `${day} ${m}`).toBeLessThanOrEqual(2)
        const sum = ws.reduce((s, [, w]) => s + w, 0)
        expect(sum, `${day} ${m}`).toBeCloseTo(1, 6)
      }
      expect(periods(new Date(`${day}T13:30:00`))[0][0], day).toBe('day')
      expect(periods(new Date(`${day}T00:30:00`))[0][0], day).toBe('night')
    }
  })

  it('goes through dawn and dusk in order', () => {
    const seen: Array<string> = []
    for (let m = 0; m < 24 * 60; m += 5) {
      const d = new Date('2026-10-16T00:00:00')
      d.setMinutes(m)
      const [p] = periods(d).reduce((a, b) => (b[1] > a[1] ? b : a))
      if (seen.at(-1) !== p) seen.push(p)
    }
    expect(seen).toEqual(['night', 'dawn', 'day', 'dusk', 'night'])
  })

  it('blends colours by the weights', () => {
    const table = {
      day: '#ffffff',
      dawn: '#000000',
      dusk: '#000000',
      night: '#000000',
    }
    expect(blendColour([['day', 1]], table)).toBe('#ffffff')
    expect(
      blendColour(
        [
          ['day', 0.5],
          ['dusk', 0.5],
        ],
        table,
      ),
    ).toBe('#808080')
  })

  it('reads another hour from the address', () => {
    expect(clockFrom('?time=21:30')().getHours()).toBe(21)
    expect(clockFrom('?time=21:30')().getMinutes()).toBe(30)
    const d = clockFrom('?date=2027-02-06&time=20:00')()
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([
      2027, 1, 6, 20,
    ])
    const now = Date.now()
    expect(Math.abs(clockFrom('?mute')().getTime() - now)).toBeLessThan(1000)
    expect(
      Math.abs(clockFrom('?date=nonsense')().getTime() - now),
    ).toBeLessThan(1000)
  })
})

describe('the moon', () => {
  it('is new at the eclipse of 8 April 2024 and full a fortnight on', () => {
    expect(moon(new Date('2024-04-08T18:21:00Z')).lit).toBeLessThan(0.02)
    expect(moon(new Date('2024-04-23T23:49:00Z')).lit).toBeGreaterThan(0.98)
  })

  it('is highest at midnight when full, and down at midnight when new', () => {
    // Full on 23 April 2024, new on 8 April
    const full = new Date('2024-04-24T00:30:00')
    expect(Math.abs(moonHour(full))).toBeLessThan(1.5)
    const fresh = new Date('2024-04-09T00:30:00')
    expect(Math.abs(moonHour(fresh))).toBeGreaterThan(6)
    // A first quarter is highest in the evening and sets about midnight
    const quarter = new Date('2024-04-15T19:30:00')
    expect(moon(quarter).phase).toBeGreaterThan(0.2)
    expect(moon(quarter).phase).toBeLessThan(0.3)
    expect(Math.abs(moonHour(quarter))).toBeLessThan(2.5)
    for (let m = 0; m < 24 * 60; m += 7) {
      const d = new Date('2026-10-16T00:00:00')
      d.setMinutes(m)
      expect(Math.abs(moonHour(d))).toBeLessThanOrEqual(12)
    }
  })

  it('is drawn lit on the right while waxing and on the left while waning', () => {
    expect(moonPath(0, 30)).toBe('')
    // The first arc goes round the lit side
    expect(moonPath(0.2, 30)).toMatch(/^M0 -30A30 30 0 0 1 0 30/)
    expect(moonPath(0.8, 30)).toMatch(/^M0 -30A30 30 0 0 0 0 30/)
    // At the quarters the terminator is straight; full, it is the other half
    expect(moonPath(0.25, 30)).toMatch(/A0 30 /)
    expect(moonPath(0.5, 30)).toMatch(/A30 30 0 0 0 0 -30Z$/)
    // A crescent's terminator bulges towards the lit side, a gibbous
    // moon's away from it
    expect(moonPath(0.1, 30)).toMatch(/0 0 0 0 -30Z$/)
    expect(moonPath(0.4, 30)).toMatch(/0 0 1 0 -30Z$/)
    expect(moonPath(0.9, 30)).toMatch(/0 0 1 0 -30Z$/)
    expect(moonPath(0.6, 30)).toMatch(/0 0 0 0 -30Z$/)
  })
})

describe('the scene', () => {
  const wide = cropOf(1280, 540)
  const title = {
    x0: wide.view.x0 + 150 / wide.scale,
    x1: wide.view.x0 + 430 / wide.scale,
    y0: wide.view.y0 + 30 / wide.scale,
    y1: wide.view.y0 + 240 / wide.scale,
  }

  it('crops the picture around its middle, covering the box', () => {
    for (const [w, h, span] of [
      [1280, 540, 1],
      [1920, 540, 1],
      [900, 540, 1],
      [390, 151, SCENE.narrowSpan],
    ]) {
      const c = cropOf(w, h, span)
      expect(c.width).toBeGreaterThanOrEqual(w - 0.01)
      expect(c.height).toBeGreaterThanOrEqual(h - 0.01)
      expect(c.view.x0).toBeGreaterThanOrEqual(0)
      expect(c.view.y0).toBeGreaterThanOrEqual(0)
      expect(c.view.x1).toBeLessThanOrEqual(SCENE.width + 0.01)
      expect(c.view.y1).toBeLessThanOrEqual(H + 0.01)
      // The riders and the moon's band are in view
      expect(c.view.y0, `${w}`).toBeLessThan(SCENE.moon.y1 * H - 60)
      expect(c.view.y1, `${w}`).toBeGreaterThan(SCENE.riders.y1 * H)
      expect(c.view.x0).toBeLessThan(SCENE.riders.x0 * SCENE.width)
    }
    // A phone shows only the middle of its width
    const phone = cropOf(390, 151, SCENE.narrowSpan)
    expect((phone.view.x1 - phone.view.x0) / SCENE.width).toBeCloseTo(
      SCENE.narrowSpan,
    )
  })

  it('puts the moon in its band, clear of the title, rising on the left', () => {
    let last = -Infinity
    for (let h = -5.9; h < 6; h += 0.25) {
      const at = moonPlace(h, wide.view, [title], 30)
      expect(at, `${h}`).not.toBeNull()
      if (!at) continue
      expect(at.y - 30).toBeGreaterThanOrEqual(SCENE.moon.y0 * H - 0.01)
      expect(at.y + 30).toBeLessThanOrEqual(SCENE.moon.y1 * H + 0.01)
      expect(at.x - 30).toBeGreaterThan(title.x1)
      expect(at.x).toBeGreaterThan(last)
      last = at.x
    }
    const high = moonPlace(0, wide.view, [], 30)
    const low = moonPlace(5, wide.view, [], 30)
    expect(high && low && high.y < low.y).toBe(true)
    expect(moonPlace(7, wide.view, [], 30)).toBeNull()
    expect(moonPlace(-6.5, wide.view, [], 30)).toBeNull()
  })

  it('passes under a button in the way', () => {
    const at = moonPlace(0, wide.view, [], 30)
    if (!at) throw new Error('no moon')
    const button = { x0: at.x - 20, x1: at.x + 20, y0: at.y - 40, y1: at.y }
    const moved = moonPlace(0, wide.view, [button], 30)
    expect(moved && moved.y).toBeGreaterThan(button.y1)
  })

  it('has a prompt for each painting, the others following the day', () => {
    expect(Object.keys(HOME_PICTURES).sort()).toEqual(
      PERIODS.map((p) => `home/${p}`).sort(),
    )
    for (const [name, p] of Object.entries(HOME_PICTURES)) {
      expect(p.size).toBe(`${SCENE.width}x${SCENE.height}`)
      expect(p.prompt).toMatch(/no moon/)
      if (name === 'home/day')
        expect(p.ref).toBe('design/sketches/reiseplakat.jpg')
      else
        expect(p.ref).toEqual([
          'design/sketches/reiseplakat.jpg',
          '.cache/pictures/home/day.png',
        ])
    }
  })

  it('keeps the prompts out of the page', () => {
    for (const file of [
      'src/app/sky.tsx',
      'src/app/home.tsx',
      'src/app/lib/sky.ts',
    ])
      expect(readFileSync(file, 'utf8'), file).not.toMatch(
        /from '[^']*-prompts/,
      )
  })
})
