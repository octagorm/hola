import { ArrowRight, Check } from 'lucide-react'
import { THEME } from '../data/themes'
import { LESSON, WORDS, meaning } from '../data/words'
import { level } from '../lib/bank'
import { useStore } from '../lib/store'
import { Es, InkBar, Page, Speak } from '../ui'
import type { PageProps } from '../registry'

// A theme (data/themes.ts, /#tema/tapas): what it is about, its words and
// how far they have got, and the choice of it as the theme, so that today's
// chapter meets its words before the rest

const LEVEL_NAME = ['ikke møtt', 'øver på', 'kjent']

export default function Tema({ arg }: PageProps) {
  const { bank, setTheme } = useStore()
  const theme = THEME[arg ?? '']
  const lesson = LESSON[arg ?? '']
  if (!theme || !lesson)
    return (
      <Page es="Temas" title="Emner">
        <div className="q-frame q-card">
          <p>Det emnet finnes ikke.</p>
          <a className="q-btn mt-4" href="#">
            Til forsiden
          </a>
        </div>
      </Page>
    )

  const now = Date.now()
  const words = WORDS.filter((w) => w.lesson === lesson.id)
  const met = words.filter((w) => bank.cards[w.id]).length
  const known = words.filter((w) => level(bank.cards[w.id], now) === 2).length
  const left = words.length - met
  const chosen = bank.theme.id === lesson.id

  return (
    <Page es={lesson.es} title={lesson.no}>
      <section className="q-frame q-box q-theme">
        <div className="q-label">
          {theme.group.es} <span>· {theme.group.no}</span>
        </div>
        <p className="about">{theme.about}</p>
        <InkBar share={words.length ? met / words.length : 0} className="bar" />
        <p className="q-muted">
          {met} av {words.length} ord møtt, {known} kjente.
        </p>
        <div className="acts">
          {chosen ? (
            <>
              <span className="chosen">
                <Check aria-hidden="true" /> Dagens tema
              </span>
              <button
                type="button"
                className="q-link"
                onClick={() => setTheme('')}
              >
                Ikke lenger tema
              </button>
            </>
          ) : (
            left > 0 && (
              <button
                type="button"
                className="q-btn"
                onClick={() => setTheme(lesson.id)}
              >
                Velg som tema <ArrowRight />
              </button>
            )
          )}
          {left > 0 && (
            <a className="q-btn ghost" href={`#nuevas/${lesson.id}`}>
              Lær fem nye nå
            </a>
          )}
        </div>
        <p className="q-muted note">
          {left === 0
            ? 'Alle ordene her er møtt. Nå gjelder det å holde dem ved like.'
            : chosen
              ? 'De nye ordene i dagens økt kommer herfra, til alle er møtt.'
              : 'Velg det, så kommer de nye ordene i dagens økt herfra, til alle er møtt.'}
        </p>
      </section>

      <section className="q-lesson q-theme-words">
        <header>
          <h2>
            Las palabras<span>ordene</span>
          </h2>
        </header>
        <ul>
          {words.map((w) => {
            const lv = level(bank.cards[w.id], now)
            return (
              <li key={w.id}>
                <div className="row">
                  <i className={`lv lv${lv}`} title={LEVEL_NAME[lv]} />
                  <b lang="es">
                    <Es w={w} />
                  </b>
                  <span>{meaning(w)}</span>
                </div>
                <Speak text={w.es} small label={`Hør ${w.es}`} />
              </li>
            )
          })}
        </ul>
      </section>
    </Page>
  )
}
