import { useSyncExternalStore } from 'react'
import MANIFEST from '../data/audio.json'

// Spanish said aloud: the recordings made ahead with Gemini TTS
// (scripts/audio.py, data/audio.json) where there is one, and the browser's
// own voices for the rest, Spain's where there is one (Mónica on a Mac or
// an iPhone, Google español in Chrome), else any Spanish. One thing is said
// at a time; a new one stops the last.

// ?mute keeps the page silent, for testing: speech still takes its time,
// so a game keeps its pace, but nothing is heard
export const MUTED =
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).has('mute')

// Each recording's file by the text it says (the file has "voice|text";
// a text has one voice)
const FILES = new Map(
  Object.entries(MANIFEST as Record<string, string>).map(([key, id]) => [
    key.slice(key.indexOf('|') + 1),
    id,
  ]),
)

// Whether there are recordings, so that the browser's voice is only the
// fallback
export const RECORDED = FILES.size > 0

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

// Whether Spanish can be heard here, by the recordings or a Spanish voice:
// true, false, or null while the browser has not yet said which voices it
// has
export function canHear(): boolean | null {
  if (RECORDED) return true
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
  return { voices: spanishVoices(), hear: canHear(), recorded: RECORDED }
}

// The one element the recordings play in. Safari lets an element play
// sound only once a touch has started it, and then lets it play again
// without one: so the same element plays every recording, woken by the
// first touch, and a word a game says by itself is heard there too.
let player: HTMLAudioElement | null = null
const element = () => (player ??= new Audio())

if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
  // (the events Safari counts as a touch; a touch starting is not one)
  const events = ['touchend', 'click', 'keydown']
  const wake = () => {
    for (const e of events) window.removeEventListener(e, wake, true)
    const a = element()
    if (a.paused) a.load()
  }
  for (const e of events) window.addEventListener(e, wake, true)
}

// Ends the recording playing now, and settles its promise
let ending: (() => void) | null = null

export function stop() {
  if (ending) {
    player?.pause()
    ending()
  }
  synth()?.cancel()
}

// Says the Spanish and resolves when done (or stopped, or failed): its
// recording where there is one, at the speed set in Settings and slower
// for `slow`, else the browser's voice. A voice that never says it is done
// (some browsers' speech does not) is given up on after a while, so a game
// waiting for it goes on.
export function say(text: string, slow = false): Promise<void> {
  stop()
  const speed = rate * (slow ? 0.7 : 1)
  const limit = new Promise<void>((resolve) =>
    setTimeout(resolve, (1500 + text.length * 120) / speed),
  )
  const id = FILES.get(text)
  return Promise.race([id ? play(id, text, speed) : speak(text, speed), limit])
}

// A recording, in the one element. One that will not load, or that the
// browser will not play, is said by the browser's voice instead.
function play(id: string, text: string, speed: number): Promise<void> {
  const a = element()
  // (sound slowed or sped past this is muted or garbled in some browsers)
  const r = Math.min(2, Math.max(0.5, speed))
  return new Promise((resolve) => {
    // Settled once, by whichever comes first: the end, a stop, or a failure
    const done = (failed: boolean) => {
      if (ending !== end) return
      ending = null
      a.onended = a.onerror = a.onplaying = null
      resolve(failed ? speak(text, speed) : undefined)
    }
    const end = () => done(false)
    ending = end
    a.onended = end
    a.onerror = () => done(true)
    a.src = `/audio/${id}.mp3`
    a.muted = MUTED
    a.defaultPlaybackRate = r
    a.playbackRate = r
    // (Safari has been known to start at the normal speed)
    a.onplaying = () => {
      a.playbackRate = r
    }
    a.play().catch(() => done(true))
  })
}

function speak(text: string, speed: number): Promise<void> {
  const s = synth()
  if (!s) return Promise.resolve()
  return new Promise<void>((resolve) => {
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
}
