// A chapter read aloud (games/story.tsx): the narrator says a line, there
// is a short pause, and the reader goes on to the next, until the last
// line, or until it is paused or stopped. Here is one line of that, apart
// from the page so that it can be tested: what is said, the pause after
// it, and how it ended.

// The pause after a line before the next is said, in milliseconds
export const GAP = 900

export interface Voice {
  // Says the text, and resolves when it is done or cut short
  say: (text: string) => Promise<void>
  // How many things have been said so far (lib/speech.ts, saidCount)
  count: () => number
  // Silences whatever is being said
  stop: () => void
}

// How a line ended: said to its end with the pause after it; cut short by
// something else said over it, such as a word looked up; or cancelled by
// the page, when the reader pauses, stops or moves to another line
export type LineEnd = 'read' | 'cut' | 'cancelled'

export interface Wait {
  done: Promise<void>
  cancel: () => void
}

// A pause that can be ended early
export function pause(ms: number): Wait {
  let end = () => {}
  const done = new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    end = () => {
      clearTimeout(timer)
      resolve()
    }
  })
  return { done, cancel: () => end() }
}

// Says one line, then pauses. Cancelling silences the line if it is still
// the one being said, and never what was said after it.
export function readLine(
  text: string,
  voice: Voice,
  {
    gap = GAP,
    wait = pause,
  }: { gap?: number; wait?: (ms: number) => Wait } = {},
): { done: Promise<LineEnd>; cancel: () => void } {
  let cancelled = false
  let rest: Wait | null = null
  // Asked through a function, since it changes while the line is awaited
  const isCancelled = () => cancelled
  const saying = voice.say(text)
  const mine = voice.count()
  const done = (async (): Promise<LineEnd> => {
    await saying
    if (isCancelled()) return 'cancelled'
    if (voice.count() !== mine) return 'cut'
    rest = wait(gap)
    await rest.done
    return isCancelled() ? 'cancelled' : 'read'
  })()
  return {
    done,
    cancel: () => {
      if (cancelled) return
      cancelled = true
      rest?.cancel()
      if (voice.count() === mine) voice.stop()
    },
  }
}

// Where reading aloud begins: at the line the reader is at, or from the
// first line again when the last is reached (lines counted from 1)
export const aloudFrom = (at: number, of: number) => (at >= of ? 1 : at)
