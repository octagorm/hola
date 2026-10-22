import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { WORDS } from '../src/app/data/words'
import { CHAPTERS, EPIGRAPH } from '../src/app/data/quijote'
import { DESIGNED, SAMPLE, VOICES } from '../src/app/data/voices'
import { DECK, spanish } from '../src/app/lib/cadaver'
import { speechItems, speechKey } from '../src/app/lib/spoken'
import { plain, tokens } from '../src/app/lib/text'

// Gemini's prebuilt voices, which the cast may use as well as its own
const PREBUILT = new Set(
  'Zephyr Puck Charon Kore Fenrir Leda Orus Aoede Callirrhoe Autonoe Enceladus Iapetus Umbriel Algieba Despina Erinome Algenib Rasalgethi Laomedeia Achernar Alnilam Schedar Gacrux Pulcherrima Achird Zubenelgenubi Vindemiatrix Sadachbia Sadaltager Sulafat'.split(
    ' ',
  ),
)

const FILES = JSON.parse(
  readFileSync('src/app/data/audio.json', 'utf8'),
) as Record<string, string>

describe('what is said aloud', () => {
  it('lists every word, form, line and sentence, each text once', () => {
    const items = speechItems()
    const texts = new Set(items.map((item) => item.text))
    expect(texts.size).toBe(items.length)
    const lines = CHAPTERS.flatMap((c) => c.lines)
    const said = [
      ...WORDS.map((w) => w.es),
      ...[EPIGRAPH.line, ...lines].flatMap((l) =>
        tokens(l).flatMap((t) => (t.id ? [t.es] : [])),
      ),
      ...lines.map(plain),
      ...DECK.map(spanish),
      SAMPLE,
    ]
    for (const t of said) expect(texts.has(t), t).toBe(true)
  })

  it('casts every voice, in a Gemini voice or one designed', () => {
    for (const item of speechItems())
      expect(VOICES[item.voice], `${item.voice}: ${item.text}`).toBeTruthy()
    for (const [name, v] of Object.entries(VOICES)) {
      expect(PREBUILT.has(v.base) || v.base in DESIGNED, name).toBe(true)
      expect(v.style.length, name).toBeLessThan(80)
    }
  })

  it('has a recording of all of it, once there are recordings', () => {
    const made = new Set(Object.values(FILES))
    // No file is left over, with recordings or without
    const there = existsSync('public/audio')
      ? readdirSync('public/audio').map((f) => f.replace(/\.mp3$/, ''))
      : []
    expect(there.filter((id) => !made.has(id))).toEqual([])
    if (!made.size) return
    const missing = speechItems()
      .map((item) => speechKey(item.voice, item.text))
      .filter((k) => !FILES[k])
    expect(missing).toEqual([])
    // A file is named by a hash of itself, so that browsers may keep it
    for (const id of made) {
      const path = `public/audio/${id}.mp3`
      expect(existsSync(path), path).toBe(true)
      expect(
        createHash('sha1')
          .update(readFileSync(path))
          .digest('hex')
          .slice(0, 12),
        path,
      ).toBe(id)
    }
  })
})
