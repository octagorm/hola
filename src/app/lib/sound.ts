import { MUTED } from './speech'

// Small sounds, made on the spot with Web Audio: a plucked string for a
// right answer, a muffled knock for a wrong one, and a flourish in E, the
// key of the Andalusian cadence, for a round won.

let ctx: AudioContext | null = null
let on = true

export const setEffects = (enabled: boolean) => {
  on = enabled
}

// The page's one audio context, made (and woken) on first use. Browsers
// only let it play after the player has touched the page.
export function context(): AudioContext | null {
  if (MUTED) return null
  try {
    if (!ctx) {
      const AC = window.AudioContext as typeof AudioContext | undefined
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
    return ctx
  } catch {
    return null
  }
}

const midi = (m: number) => 440 * 2 ** ((m - 69) / 12)

// A note plucked like a guitar string: bright at first, soon dark. `at`
// is seconds from now, or with `when` the context's own time.
export function pluck(
  c: AudioContext,
  note: number,
  at: number,
  loud = 0.22,
  out: AudioNode = c.destination,
  when?: number,
) {
  const t = when ?? c.currentTime + at
  const o = c.createOscillator()
  o.type = 'triangle'
  o.frequency.value = midi(note)
  const o2 = c.createOscillator()
  o2.type = 'sawtooth'
  o2.frequency.value = midi(note)
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(4200, t)
  f.frequency.exponentialRampToValueAtTime(700, t + 0.35)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(loud, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
  const g2 = c.createGain()
  g2.gain.value = 0.18
  o.connect(g)
  o2.connect(g2).connect(g)
  g.connect(f).connect(out)
  o.start(t)
  o2.start(t)
  o.stop(t + 1)
  o2.stop(t + 1)
}

function knock(c: AudioContext) {
  const t = c.currentTime
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(150, t)
  o.frequency.exponentialRampToValueAtTime(70, t + 0.18)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.3, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + 0.3)
}

export type Blip = 'right' | 'wrong' | 'win' | 'tap'

export function blip(kind: Blip) {
  if (!on) return
  const c = context()
  if (!c) return
  try {
    switch (kind) {
      case 'right':
        pluck(c, 76, 0)
        pluck(c, 81, 0.07)
        break
      case 'wrong':
        knock(c)
        break
      case 'win':
        // A, G, F, E: the Andalusian cadence, then E's own chord
        ;[69, 67, 65, 64].forEach((n, i) => pluck(c, n + 12, i * 0.11, 0.18))
        ;[64, 68, 71, 76].forEach((n, i) => pluck(c, n, 0.5 + i * 0.03, 0.14))
        break
      case 'tap':
        pluck(c, 88, 0, 0.06)
        break
    }
  } catch {
    // no sound, no matter
  }
}
