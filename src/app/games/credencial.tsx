import { STAGES, START } from '../data/camino'
import { useStore } from '../lib/store'
import { inWords } from '../lib/today'
import { Page } from '../ui'
import { EmptyStamp, Stamp } from '../art'

// The credential, the pilgrim's passport: a stamp for each day whose
// chapter was finished, a stage of the Camino Francés each, from the
// Pyrenees to Santiago and on to the sea at Fisterra

const date = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
  })
}

export default function Credencial() {
  const { bank } = useStore()
  const days = Object.keys(bank.daily)
    .filter((k) => bank.daily[k])
    .sort()
  const walked = days.length
  // Past Fisterra the walk begins again
  const lap = walked ? Math.floor((walked - 1) / STAGES.length) : 0
  const here = walked - lap * STAGES.length

  return (
    <Page es="La credencial" title="Pilegrimspasset">
      <div className="q-credpage">
        <p className="q-intro">
          Fra {START} over Pyreneene, gjennom Navarra, La Rioja, Castilla og
          León og Galicia til Santiago de Compostela, og videre til Fisterra ved
          havet: trettiseks etapper, én for hver dag du fullfører dagens økt.
          Hver by stempler passet.
        </p>
        <p className="q-label">
          {here} av {STAGES.length} etapper{' '}
          <span>{lap > 0 ? `· vandring nummer ${inWords(lap + 1)}` : ''}</span>
        </p>
        <ol className="q-stamps">
          {STAGES.map((s, i) => {
            const n = lap * STAGES.length + i + 1
            const got = i < here
            const next = i === here
            return (
              <li key={s.town} className={got ? 'got' : next ? 'next' : ''}>
                {got ? (
                  <Stamp motif={s.motif} n={n} />
                ) : (
                  <EmptyStamp label={next ? 'neste' : `${i + 1}`} />
                )}
                <b>{s.town}</b>
                <small>
                  {got ? date(days[n - 1]) : next ? 'neste etappe' : ''}
                </small>
              </li>
            )
          })}
        </ol>
      </div>
    </Page>
  )
}
