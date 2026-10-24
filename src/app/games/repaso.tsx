import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { WORD } from '../data/words'
import { pick } from '../lib/bank'
import { useStore } from '../lib/store'
import { blip } from '../lib/sound'
import { Drill } from '../quiz'
import { Es, Page } from '../ui'

// Practice whenever: ten of the words met, those that need it most, each
// asked by the link of it that has faded most

const ROUND = 10

export default function Repaso() {
  const [round, setRound] = useState(0)
  return (
    <Page es="Repaso" title="Repetisjon">
      <Round key={round} again={() => setRound((r) => r + 1)} />
    </Page>
  )
}

function Round({ again }: { again: () => void }) {
  const { bank } = useStore()
  const [ids] = useState(() => pick(bank, ROUND, Date.now()).map((w) => w.id))
  const [got, setGot] = useState<Array<{ id: string; right: boolean }>>([])

  if (!ids.length)
    return (
      <div className="q-frame q-card fx-rise">
        <h2 className="q-display text-[34px] leading-none">Ingen ord ennå</h2>
        <p className="q-muted mt-3">
          Repetisjonen øver på ordene du har møtt. Møt noen først, i dagens
          kapittel eller fem om gangen.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="q-btn" href="#hoy">
            Dagens økt <ArrowRight />
          </a>
          <a className="q-btn ghost" href="#nuevas">
            Fem nye ord
          </a>
        </div>
      </div>
    )

  if (got.length >= ids.length) {
    const right = got.filter((g) => g.right).length
    return (
      <div className="q-frame q-card fx-rise">
        <div className="q-label">
          Fin <span>· runden er ferdig</span>
        </div>
        <h2 className="q-display mt-1 text-[40px] leading-none">
          {right} av {ids.length} riktige
        </h2>
        <ul className="q-wordlist mt-4">
          {got.map((g) => {
            const w = WORD[g.id]
            return (
              w && (
                <li key={g.id} className={g.right ? '' : 'miss'}>
                  <b>
                    <Es w={w} peek />
                  </b>
                  <span>{w.no}</span>
                </li>
              )
            )
          })}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="q-btn" onClick={again}>
            En runde til <ArrowRight />
          </button>
          <a className="q-btn ghost" href="#">
            Til forsiden
          </a>
        </div>
      </div>
    )
  }

  return (
    <Drill
      ids={ids}
      got={new Set(got.map((g) => g.id))}
      onItem={(id, right) => {
        const next = [...got, { id, right }]
        setGot(next)
        if (next.length >= ids.length) blip('win')
      }}
    />
  )
}
