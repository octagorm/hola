import { useSyncExternalStore } from 'react'
import { context, pluck } from './sound'

// Music to learn by: a guitar picking its way, slowly and with a little
// chance in it, round the Andalusian cadence (A minor, G, F, E), made on
// the spot with the same plucked strings as the game's sounds. It stops
// while the page is hidden.

// Each chord's root, third and fifth
const CHORDS: Array<[number, number, number]> = [
  [57, 60, 64],
  [55, 59, 62],
  [53, 57, 60],
  [52, 56, 59],
]

// A bar of three beats, picked in quavers, two bars to a chord
const EIGHTH = 0.42
const BAR = 6

let playing = false
let timer = 0
let master: GainNode | null = null
let next = 0
let step = 0

const listeners = new Set<() => void>()
const tell = () => listeners.forEach((f) => f())

function schedule() {
  const c = context()
  if (!c || !master) return
  while (next < c.currentTime + 0.6) {
    const bar = Math.floor(step / BAR)
    const beat = step % BAR
    const [r, t, f] = CHORDS[Math.floor(bar / 2) % CHORDS.length]
    const second = bar % 2 === 1
    const pattern = second
      ? [r - 12, t, f, r + 12, f, t]
      : [r - 12, f, r + 12, t + 12, f, t + 12]
    const note = pattern[beat]
    pluck(c, note, 0, beat === 0 ? 0.2 : 0.11, master, next)
    // Now and then a high note over the chord
    if (beat === 3 && Math.random() < 0.35) {
      const top = [r + 24, t + 24, f + 12][Math.floor(Math.random() * 3)]
      pluck(c, top, 0, 0.07, master, next + EIGHTH * 0.5)
    }
    next += EIGHTH * (beat === 5 && Math.random() < 0.2 ? 1.25 : 1)
    step++
  }
}

function run() {
  const c = context()
  if (!c) return
  if (!master) {
    master = c.createGain()
    master.gain.value = 0.55
    master.connect(c.destination)
  }
  next = Math.max(next, c.currentTime + 0.1)
  window.clearInterval(timer)
  timer = window.setInterval(schedule, 120)
  schedule()
}

export function startMusic() {
  if (playing) return
  playing = true
  if (!document.hidden) run()
  tell()
}

export function stopMusic() {
  if (!playing) return
  playing = false
  window.clearInterval(timer)
  tell()
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!playing) return
    if (document.hidden) window.clearInterval(timer)
    else run()
  })
}

export function useMusic(): boolean {
  return useSyncExternalStore(
    (f) => {
      listeners.add(f)
      return () => {
        listeners.delete(f)
      }
    },
    () => playing,
    () => false,
  )
}
