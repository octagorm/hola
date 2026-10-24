// The audiobooks: a story of fifteen to twenty minutes in Spain's Spanish,
// written for one reader's words (those known and being practised, and a
// few new), to listen to without the screen or to follow on it
// (games/lydbok.tsx). Each chapter begins with the guide saying in
// Norwegian what happens and which new words come; then the narrator reads
// the title and the lines, slowly, a line at a time, the story's people in
// the cast's voices (data/voices.ts).
//
// The lines are written in the markup of the stories (data/quijote.ts), so
// that the text on the page is mixed text and every word is in the bank.
// scripts/lydbok.py puts each book's recordings together, with pauses,
// into one file (public/lydbok/), and notes in data/lydbok-times.json when
// each line begins, for the page to follow.

export interface BookChapter {
  title: string
  no: string
  // Said by the guide, in Norwegian, before the chapter
  intro: string
  lines: Array<string>
  // Who says each line, by their voice; a line with none is the narrator's
  who?: Array<string | undefined>
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

// The pauses in an audiobook, in seconds: after the guide's Norwegian,
// after a chapter's title, after a line, and between chapters
export const PAUSE = { intro: 1.4, title: 1.2, line: 1.1, chapter: 2.8 }

export const AUDIOBOOKS: Array<Audiobook> = []
