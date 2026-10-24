// Prints each audiobook as the order its recordings are played in, as JSON,
// for scripts/lydbok.py: for each chapter the guide's Norwegian, the title,
// then the lines, each with the pause after it and its mark for the page
// (chapter, and line: -2 the guide, -1 the title).
//
//   mkdir -p .cache && node scripts/lydbok.ts > .cache/lydbok.json
import { AUDIOBOOKS, PAUSE } from '../src/app/data/lydbok.ts'
import { plain } from '../src/app/lib/text.ts'

console.log(
  JSON.stringify(
    AUDIOBOOKS.map((b) => ({
      id: b.id,
      parts: b.chapters.flatMap((c, ci) => [
        { text: c.intro, pause: PAUSE.intro, chapter: ci, line: -2 },
        { text: c.title, pause: PAUSE.title, chapter: ci, line: -1 },
        ...c.lines.map((l, li) => ({
          text: plain(l),
          pause: li === c.lines.length - 1 ? PAUSE.chapter : PAUSE.line,
          chapter: ci,
          line: li,
        })),
      ]),
    })),
    null,
    1,
  ),
)
