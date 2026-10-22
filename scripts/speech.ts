// Prints what Hola says aloud, as JSON, for scripts/audio.py: the cast
// (data/voices.ts) and every word and line with its voice.
//
//   mkdir -p .cache && node scripts/speech.ts > .cache/speech.json
import { speechItems } from '../src/app/lib/spoken.ts'
import { DESIGNED, VOICES } from '../src/app/data/voices.ts'

console.log(
  JSON.stringify(
    { voices: VOICES, designed: DESIGNED, items: speechItems() },
    null,
    1,
  ),
)
