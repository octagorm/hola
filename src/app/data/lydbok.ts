// The audiobooks: a podcast of fifteen to twenty minutes, written for one
// reader's words (those known and being practised, and a few new), to
// listen to without the screen or to follow on it (games/lydbok.tsx). Two
// hosts tell a story in Spain's Spanish together: Marta, from Madrid, who
// has lived long in Oslo, and Ingrid, a Norwegian learning Spanish. They
// talk in both languages, as Tian's hosts do, giving the new words before
// a scene and picking out phrases after it; the scenes are read slowly by
// the narrator, the story's people in the cast's voices (data/voices.ts).
//
// The story's lines are written in the markup of the stories
// (data/quijote.ts), so that the text on the page is mixed text and every
// word is in the bank.
// scripts/lydbok.py puts each book's recordings together, with pauses,
// into one file (public/lydbok/), and notes in data/lydbok-times.json when
// each line begins, for the page to follow.

import { plain } from '../lib/text.ts'
import { LINE_VOICE } from './voices.ts'

// A part of a chapter: the hosts' talk, free text in Norwegian and Spanish
// as they speak it; or a line of the story, in the stories' markup, read by
// the narrator (no who) or one of the cast
export type Part =
  { host: 'Marta' | 'Ingrid'; text: string } | { line: string; who?: string }

export interface BookChapter {
  title: string
  no: string
  parts: Array<Part>
}

export interface Audiobook {
  // Its page: /#lydbok/<id>
  id: string
  es: string
  no: string
  // On its page, in Norwegian
  about: string
  // Whose words it was written from, and when: «ordene alle starter med»
  for: string
  chapters: Array<BookChapter>
}

// The pauses in an audiobook, in seconds: after a host's line, after a
// line of the story, and between chapters
export const PAUSE = { host: 0.5, line: 1.1, chapter: 2.2 }

// What a part says, as the recording has it
export const spokenText = (p: Part) => ('host' in p ? p.text : plain(p.line))

// Who says a part
export const voiceOf = (p: Part) =>
  'host' in p ? p.host : (p.who ?? LINE_VOICE)

export const AUDIOBOOKS: Array<Audiobook> = []
