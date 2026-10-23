import { WORDS } from '../data/words.ts'
import { EPIGRAPH } from '../data/quijote.ts'
import { ALL_CHAPTERS } from '../data/stories.ts'
import { SENTENCES as ORDEN } from '../data/orden.ts'
import { LINE_VOICE, SAMPLE, WORD_VOICE } from '../data/voices.ts'
import { GAPS } from '../data/porpara.ts'
import { SENTENCES, TIMES } from '../data/tiempos.ts'
import { DECK, spanish } from './cadaver.ts'
import { whole } from './porpara.ts'
import { plain as said } from './tiempos.ts'
import { SAID } from './letras.ts'
import { SAID as LAID, LINES_SAID } from './palabras.ts'
import { linesOf } from './orden.ts'
import { LOTTERY, DECK as NUMEROS } from './numeros.ts'
import { plain, tokens } from './text.ts'
import { tapasLines } from './tapas.ts'
import { rastroLines } from './rastro.ts'

// Everything Hola says aloud, with the voice that says it: in the teacher's
// voice each word, each form of one in the story (a tapped word's card says
// it), the plurals and an adjective's forms that Letras takes, and the
// sample in Settings; in the narrator's each line of the story, each
// sentence of Cadáver exquisito's deck, each sentence of Por o para (said
// once answered) and each of Ayer, hoy, mañana in all three times.
// scripts/audio.py makes the recordings with Gemini TTS; lib/speech.ts
// plays them by their text, and falls back on the browser's own Spanish
// voice where there is none.

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
  for (const s of SAID) add(WORD_VOICE, s, 'word')
  // (and those Palabras lays that are too long for Letras)
  for (const s of LAID) add(WORD_VOICE, s, 'word')
  add(WORD_VOICE, SAMPLE, 'line')
  for (const line of lines) add(LINE_VOICE, plain(line), 'line')
  for (const s of DECK) add(LINE_VOICE, spanish(s), 'line')
  // El relojero's lines in Palabras
  for (const s of LINES_SAID) add(LINE_VOICE, s, 'line')
  for (const g of GAPS) add(LINE_VOICE, whole(g), 'line')
  for (const s of SENTENCES)
    for (const t of TIMES) add(LINE_VOICE, said(s, t), 'line')
  // Orden's sentences, in the narrator's voice, in every order that is right
  for (const s of ORDEN)
    for (const line of linesOf(s)) add(LINE_VOICE, plain(line), 'line')
  // The guests' orders and thanks in Tapas, and everything said at El
  // Rastro, each in its speaker's voice; and in the teacher's, each form
  // in them, for a tapped word's card
  const spoken = [...tapasLines(), ...rastroLines()]
  for (const { voice, line } of spoken) add(voice, plain(line), 'line')
  for (const { line } of spoken)
    for (const t of tokens(line)) if (t.id) add(WORD_VOICE, t.es, 'word')
  // Números' sentences, each in its own voice, and the lottery sung
  for (const x of [...NUMEROS, ...LOTTERY]) add(x.voice, x.say, 'line')
  return items
}
