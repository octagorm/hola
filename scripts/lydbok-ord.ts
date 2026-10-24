// The words of one reader's bank, for writing an audiobook from them
// (data/lydbok.ts): those known, those being practised (the weakest
// first), and the lessons begun, as text to write from.
//
// From an account, on a machine with the deployment's tools:
//   npx convex run --prod bank:forEmail '{"email": "…"}' > .cache/bank.json
//   node scripts/lydbok-ord.ts .cache/bank.json
// or from a backup file saved under Innstillinger.
import { readFileSync } from 'node:fs'
import { LESSON, WORD } from '../src/app/data/words.ts'
import { emptyBank, level, merge, recall } from '../src/app/lib/bank.ts'
import type { Bank } from '../src/app/lib/bank.ts'

const file = process.argv[2]
if (!file) {
  console.error('node scripts/lydbok-ord.ts <bank.json>')
  process.exit(1)
}
let raw: unknown = JSON.parse(readFileSync(file, 'utf8'))
// (convex run prints the stored JSON as a string; a backup holds it whole)
if (typeof raw === 'string') raw = JSON.parse(raw)
const found = raw as Partial<Bank> & { bank?: Partial<Bank> }
const bank = merge(found.bank ?? found, emptyBank())
const now = Date.now()

const known: Array<string> = []
const practised: Array<[string, number]> = []
const lessons = new Map<string, number>()
for (const [id, card] of Object.entries(bank.cards)) {
  const w = WORD[id]
  if (!w || !card) continue
  lessons.set(w.lesson, (lessons.get(w.lesson) ?? 0) + 1)
  if (level(card, now) === 2) known.push(`${w.id} (${w.no})`)
  else practised.push([`${w.id} (${w.no})`, recall(card.leer, now)])
}
practised.sort((a, b) => a[1] - b[1])

console.log(`Kjente (${known.length}):\n${known.join(', ')}\n`)
console.log(
  `Øver på, de svakeste først (${practised.length}):\n${practised.map(([w]) => w).join(', ')}\n`,
)
console.log(
  `Leksjoner begynt:\n${[...lessons]
    .map(([l, n]) => `${LESSON[l]?.es ?? l} (${n})`)
    .join(', ')}`,
)
