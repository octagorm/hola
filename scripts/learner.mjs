// A bank as of a learner some weeks in, for screenshots and tests: the
// first lessons met, every third word of them known, and nine stages of
// the Camino walked.
import { WORDS } from '../src/app/data/words.ts'
import { dayKey, emptyBank } from '../src/app/lib/bank.ts'

const DAY = 86_400_000

export async function learnerBank(now) {
  const bank = emptyBank()
  WORDS.slice(0, 90).forEach((w, i) => {
    const s = i % 3 === 0 ? 6 : i % 3 === 1 ? 0.9 : 0.25
    const t = now - (i % 5) * DAY * 0.4 - 3_600_000
    bank.cards[w.id] = {
      leer: { s, t },
      decir: { s: s * 0.45, t },
      t,
      n: 4,
      x: 1,
      i: now - 20 * DAY,
    }
  })
  for (let d = 1; d <= 9; d++) {
    const key = dayKey(now - (d + 1) * DAY)
    bank.daily[key] = 1
    bank.days[key] = 20 + d
  }
  bank.read.hidalgo = 3
  bank.read.dulcinea = 2
  return bank
}
