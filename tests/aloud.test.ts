import { afterEach, describe, expect, it, vi } from 'vitest'
import { aloudFrom, pause, readLine } from '../src/app/lib/aloud'
import type { Voice, Wait } from '../src/app/lib/aloud'

// A voice that says one thing at a time, as lib/speech.ts does: a new
// thing ends the last, and each is done when `finish` is called
function fakeVoice() {
  let count = 0
  let stops = 0
  let current: (() => void) | null = null
  const said: Array<string> = []
  const end = () => {
    const f = current
    current = null
    f?.()
  }
  const voice: Voice = {
    say: (text) => {
      count++
      end()
      said.push(text)
      return new Promise<void>((resolve) => {
        current = resolve
      })
    },
    count: () => count,
    stop: () => {
      stops++
      end()
    },
  }
  return { voice, said, finish: end, stops: () => stops }
}

// Pauses that end when told to
function fakeWait() {
  const waits: Array<{ ms: number; end: () => void }> = []
  const wait = (ms: number): Wait => {
    let end = () => {}
    const done = new Promise<void>((resolve) => {
      end = resolve
    })
    waits.push({ ms, end })
    return { done, cancel: () => end() }
  }
  return { wait, waits }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

afterEach(() => {
  vi.useRealTimers()
})

describe('a chapter read aloud', () => {
  it('says a line, then pauses before the next', async () => {
    const v = fakeVoice()
    const w = fakeWait()
    const line = readLine('Cae la noche.', v.voice, { gap: 900, wait: w.wait })
    expect(v.said).toEqual(['Cae la noche.'])
    await flush()
    expect(w.waits).toEqual([])
    v.finish()
    await flush()
    expect(w.waits.map((x) => x.ms)).toEqual([900])
    w.waits[0].end()
    await expect(line.done).resolves.toBe('read')
    expect(v.stops()).toBe(0)
  })

  it('is cut short by a word said over it, and leaves that word be', async () => {
    const v = fakeVoice()
    const w = fakeWait()
    const line = readLine('Cae la noche.', v.voice, { wait: w.wait })
    void v.voice.say('la noche')
    await expect(line.done).resolves.toBe('cut')
    expect(w.waits).toEqual([])
    line.cancel()
    expect(v.stops()).toBe(0)
  })

  it('silences its line when cancelled while saying it', async () => {
    const v = fakeVoice()
    const line = readLine('Cae la noche.', v.voice, { wait: fakeWait().wait })
    line.cancel()
    expect(v.stops()).toBe(1)
    await expect(line.done).resolves.toBe('cancelled')
  })

  it('ends quietly when cancelled in the pause', async () => {
    const v = fakeVoice()
    const w = fakeWait()
    const line = readLine('Cae la noche.', v.voice, { wait: w.wait })
    v.finish()
    await flush()
    line.cancel()
    await expect(line.done).resolves.toBe('cancelled')
  })

  it('pauses for its time, or less when ended early', async () => {
    vi.useFakeTimers()
    let over = false
    void pause(900).done.then(() => {
      over = true
    })
    await vi.advanceTimersByTimeAsync(899)
    expect(over).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(over).toBe(true)
    const early = pause(900)
    early.cancel()
    await expect(early.done).resolves.toBeUndefined()
  })

  it('begins at the line at hand, or from the first at the last', () => {
    expect(aloudFrom(1, 13)).toBe(1)
    expect(aloudFrom(6, 13)).toBe(6)
    expect(aloudFrom(13, 13)).toBe(1)
  })
})
