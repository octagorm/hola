import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { LESSON, TAUGHT, WORD, WORDS } from '../data/words'
import { unmet } from '../lib/bank'
import { partKey } from '../lib/today'
import { useStore } from '../lib/store'
import { blip } from '../lib/sound'
import { Learn, learnQueue } from '../quiz'
import { Es, Page } from '../ui'
import type { PageProps } from '../registry'

// Five new words whenever, the next in the lessons' order, or the next of
// one lesson (/#nuevas/comida): each met, then read, then heard

const FIVE = 5

export default function Nuevas({ arg }: PageProps) {
  const [round, setRound] = useState(0)
  const lesson = arg && LESSON[arg] ? arg : undefined
  return (
    <Page
      es="Palabras nuevas"
      title={lesson ? `Nye ord · ${LESSON[lesson]?.no}` : 'Nye ord'}
      back={lesson ? '#ordbank' : '#'}
    >
      <Round key={round} lesson={lesson} again={() => setRound((r) => r + 1)} />
    </Page>
  )
}

function Round({ lesson, again }: { lesson?: string; again: () => void }) {
  const { bank } = useStore()
  const [ids] = useState(() =>
    unmet(bank, lesson ? WORDS.filter((w) => w.lesson === lesson) : TAUGHT)
      .slice(0, FIVE)
      .map((w) => w.id),
  )
  const [got, setGot] = useState<Set<string>>(new Set())

  if (!ids.length)
    return (
      <div className="q-frame q-card fx-rise">
        <h2 className="q-display text-[34px] leading-none">
          {lesson ? 'Hele leksjonen er møtt' : 'Alle ordene er møtt'}
        </h2>
        <p className="q-muted mt-3">
          Nå gjelder det å holde dem ved like, i dagens økt og i repetisjonen.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="q-btn" href="#repaso">
            Repetisjon <ArrowRight />
          </a>
          <a className="q-btn ghost" href="#ordbank">
            Ordbanken
          </a>
        </div>
      </div>
    )

  const all = learnQueue(ids).every((p) => got.has(partKey(p.id, p.part)))
  if (all)
    return (
      <div className="q-frame q-card fx-rise">
        <div className="q-label">
          Hecho <span>· fem nye ord i banken</span>
        </div>
        <ul className="q-wordlist mt-3">
          {ids.map((id) => {
            const w = WORD[id]
            return (
              w && (
                <li key={id}>
                  <b>
                    <Es w={w} />
                  </b>
                  <span>{w.no}</span>
                </li>
              )
            )
          })}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="q-btn" onClick={again}>
            Fem til <ArrowRight />
          </button>
          <a className="q-btn ghost" href="#">
            Til forsiden
          </a>
        </div>
      </div>
    )

  return (
    <Learn
      ids={ids}
      got={got}
      onPart={(keys) => {
        const next = new Set([...got, ...keys])
        setGot(next)
        if (learnQueue(ids).every((p) => next.has(partKey(p.id, p.part))))
          blip('win')
      }}
    />
  )
}
