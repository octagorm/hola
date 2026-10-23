import { WORDS } from '../data/words.ts'
import { EPIGRAPH } from '../data/quijote.ts'
import { ALL_CHAPTERS } from '../data/stories.ts'
import { LINE_VOICE, SAMPLE, WORD_VOICE } from '../data/voices.ts'
import { DECK, spanish } from './cadaver.ts'
import { plain, tokens } from './text.ts'

// Everything Hola says aloud, with the voice that says it: in the teacher's
// voice each word, each form of one in the story (a tapped word's card says
// it) and the sample in Settings; in the narrator's each line of the story
// and each sentence of Cadáver exquisito's deck. scripts/audio.py makes the
// recordings with Gemini TTS; lib/speech.ts plays them by their text, and
// falls back on the browser's own Spanish voice where there is none.

export interface SpeechItem {
  voice: string
  text: string
  // What kind of reading, for the style asked of the TTS: a word on its
  // own, or a line
  kind: 'word' | 'line'
}

export const speechKey = (voice: string, text: string) => `${voice}|${text}`

export function speechItems(): Array<SpeechItem> {
  const items: Array<SpeechItem> = []
  // A text has one voice, the first it is listed with, since the page
  // finds a recording by its text alone
  const seen = new Set<string>()
  const add = (voice: string, text: string, kind: SpeechItem['kind']) => {
    if (seen.has(text)) return
    seen.add(text)
    items.push({ voice, text, kind })
  }
  for (const w of WORDS) add(WORD_VOICE, w.es, 'word')
  const lines = ALL_CHAPTERS.flatMap((c) => c.lines)
  for (const line of [EPIGRAPH.line, ...lines])
    for (const t of tokens(line)) if (t.id) add(WORD_VOICE, t.es, 'word')
  add(WORD_VOICE, SAMPLE, 'line')
  for (const line of lines) add(LINE_VOICE, plain(line), 'line')
  for (const s of DECK) add(LINE_VOICE, spanish(s), 'line')
  return items
}
