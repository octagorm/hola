import { useSyncExternalStore } from 'react'

// Spanish said aloud by the browser's own voices: Spain's where there is
// one (Mónica on a Mac or an iPhone, Google español in Chrome), else any
// Spanish. One thing is said at a time; a new one stops the last.

// ?mute keeps the page silent, for testing: speech still takes its time,
// so a game keeps its pace, but nothing is heard
export const MUTED =
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).has('mute')

let chosen = ''
let rate = 1

// The voice picked in Settings, by its voiceURI ('' lets the page choose),
// and the speed
export function setVoice(uri: string, r: number) {
  chosen = uri
  rate = r
}

const synth = () =>
  typeof speechSynthesis === 'undefined' ? null : speechSynthesis

// The Spanish voices there are, best first: Spain's, then the voices that
// sound most natural
export function spanishVoices(): Array<SpeechSynthesisVoice> {
  const s = synth()
  if (!s) return []
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.replace('_', '-') === 'es-ES' ? 4 : 0) +
    (/natural|online|premium|enhanced|google/i.test(v.name) ? 2 : 0) +
    (/Mónica|Monica|Jorge|Elvira|Alvaro|Álvaro/i.test(v.name) ? 1 : 0)
  return s
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('es'))
    .sort((a, b) => score(b) - score(a))
}

function voice(): SpeechSynthesisVoice | null {
  const all = spanishVoices()
  return all.find((v) => v.voiceURI === chosen) ?? all.at(0) ?? null
}

// Voices load a moment after the page; whoever shows them listens
let version = 0
const listeners = new Set<() => void>()
if (typeof window !== 'undefined') {
  const s = synth()
  s?.addEventListener('voiceschanged', () => {
    version++
    listeners.forEach((f) => f())
  })
}

const subscribe = (f: () => void) => {
  listeners.add(f)
  return () => {
    listeners.delete(f)
  }
}

// Whether a Spanish voice is there to hear words by: true, false, or null
// while the browser has not yet said which voices it has
export function canHear(): boolean | null {
  const s = synth()
  if (!s) return false
  if (spanishVoices().length) return true
  return s.getVoices().length ? false : null
}

// The voices as React state, so a page shows them once they come
export function useVoices() {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  )
  return { voices: spanishVoices(), hear: canHear() }
}

export function stop() {
  synth()?.cancel()
}

// Says the Spanish and resolves when done (or stopped, or failed). A voice
// that never says it is done (some browsers' speech does not) is given up
// on after a while, so a game waiting for it goes on.
export function say(text: string, slow = false): Promise<void> {
  const s = synth()
  if (!s) return Promise.resolve()
  s.cancel()
  const speed = rate * (slow ? 0.7 : 1)
  const limit = new Promise<void>((resolve) =>
    setTimeout(resolve, (1500 + text.length * 120) / speed),
  )
  const spoken = new Promise<void>((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    const v = voice()
    if (v) {
      u.voice = v
      u.lang = v.lang
    }
    u.rate = 0.92 * speed
    if (MUTED) u.volume = 0
    u.onend = () => resolve()
    u.onerror = () => resolve()
    s.speak(u)
  })
  return Promise.race([spoken, limit])
}
