// Prints each audiobook as the order its recordings are played in, as JSON,
// for scripts/lydbok.py: for each chapter its title, then its parts, each
// with the pause after it and its mark for the page (chapter, and part:
// -1 the title).
//
//   mkdir -p .cache && node scripts/lydbok.ts > .cache/lydbok.json
import { AUDIOBOOKS, PAUSE, spokenText } from '../src/app/data/lydbok.ts'

console.log(
  JSON.stringify(
    AUDIOBOOKS.map((b) => ({
      id: b.id,
      parts: b.chapters.flatMap((c, ci) => [
        { text: c.title, pause: PAUSE.line, chapter: ci, line: -1 },
        ...c.parts.map((p, pi) => ({
          text: spokenText(p),
          pause:
            pi === c.parts.length - 1
              ? PAUSE.chapter
              : 'host' in p && 'host' in (c.parts[pi + 1] ?? {})
                ? PAUSE.host
                : PAUSE.line,
          chapter: ci,
          line: pi,
        })),
      ]),
    })),
    null,
    1,
  ),
)
