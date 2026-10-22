import { describe, expect, it, vi } from 'vitest'

// Two recordings, and a browser with an audio element and a speech voice
// that only pretend to play
vi.mock('../src/app/data/audio.json', () => ({
  default: {
    'Profesora|el gato': 'a1b2c3d4e5f6',
    'Narrador|El gato come.': '0123456789ab',
  },
}))

class FakeAudio {
  static made = 0
  static refuse = false
  src = ''
  muted = false
  paused = true
  playbackRate = 1
  defaultPlaybackRate = 1
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  onplaying: (() => void) | null = null
  constructor() {
    FakeAudio.made++
  }
  play() {
    if (FakeAudio.refuse) return Promise.reject(new Error('NotAllowedError'))
    this.paused = false
    this.onplaying?.()
    return Promise.resolve()
  }
  pause() {
    this.paused = true
  }
  load() {}
  // The recording played to its end
  finish() {
    this.paused = true
    this.onended?.()
  }
}

const spoken: Array<{ text: string; rate: number }> = []
class FakeUtterance {
  text: string
  lang = ''
  rate = 1
  volume = 1
  voice = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}
vi.stubGlobal('Audio', FakeAudio)
vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
vi.stubGlobal('speechSynthesis', {
  speak: (u: FakeUtterance) => {
    spoken.push({ text: u.text, rate: u.rate })
    setTimeout(() => u.onend?.(), 0)
  },
  cancel: () => {},
  getVoices: () => [],
  addEventListener: () => {},
})

const { say, setVoice, canHear, RECORDED, stop } =
  await import('../src/app/lib/speech')

// The one element the recordings play in, once one has played
let element: FakeAudio | null = null
const OriginalPlay = FakeAudio.prototype.play
FakeAudio.prototype.play = function (this: FakeAudio) {
  element = this
  return OriginalPlay.call(this)
}

describe('saying Spanish aloud', () => {
  it('can be heard with recordings, though the browser has no voice', () => {
    expect(RECORDED).toBe(true)
    expect(canHear()).toBe(true)
  })

  it('plays a recording at the speed set, slower for slow', async () => {
    setVoice('', 1.2)
    let p = say('el gato')
    await Promise.resolve()
    expect(element?.src).toBe('/audio/a1b2c3d4e5f6.mp3')
    expect(element?.playbackRate).toBeCloseTo(1.2)
    element?.finish()
    await p
    p = say('el gato', true)
    await Promise.resolve()
    expect(element?.playbackRate).toBeCloseTo(0.84)
    element?.finish()
    await p
    // Slowed past what browsers play well, it stays at half speed
    setVoice('', 0.6)
    p = say('el gato', true)
    await Promise.resolve()
    expect(element?.playbackRate).toBeCloseTo(0.5)
    element?.finish()
    await p
    expect(spoken).toEqual([])
    expect(FakeAudio.made).toBe(1)
  })

  it('says one thing at a time: a new one ends the last', async () => {
    setVoice('', 1)
    const first = say('el gato')
    const second = say('El gato come.')
    await first
    expect(element?.src).toBe('/audio/0123456789ab.mp3')
    element?.finish()
    await second
    const third = say('el gato')
    stop()
    await third
    expect(element?.paused).toBe(true)
  })

  it('falls back on the browser’s voice without a recording', async () => {
    spoken.length = 0
    setVoice('', 1)
    await say('la casa')
    await say('la casa', true)
    expect(spoken.map((s) => s.text)).toEqual(['la casa', 'la casa'])
    expect(spoken[1].rate).toBeLessThan(spoken[0].rate)
  })

  it('falls back on it when a recording will not play or load', async () => {
    spoken.length = 0
    FakeAudio.refuse = true
    await say('el gato')
    FakeAudio.refuse = false
    const p = say('El gato come.')
    await Promise.resolve()
    element?.onerror?.()
    await p
    expect(spoken.map((s) => s.text)).toEqual(['el gato', 'El gato come.'])
  })
})
