import { useState } from 'react'
import { Search } from 'lucide-react'
import { LESSONS, WORDS, meaning } from '../data/words'
import { LINKS, counts, level, linkShares, recall } from '../lib/bank'
import { unaccent } from '../lib/spanish'
import { lasts } from '../lib/today'
import { useStore } from '../lib/store'
import { Es, InkBar, LINK_NAME, LinkIcon, Page, Speak, percent } from '../ui'
import type { Level } from '../lib/bank'

// Every word Hola teaches, lesson by lesson: how well each is known, and
// for each word met how well its three links hold. A lesson can be begun
// from here, or marked as known already.

type Filter = 'alle' | 'over' | 'kjente' | 'nye'

const FILTERS: Array<[Filter, string]> = [
  ['alle', 'Alle'],
  ['over', 'Øver på'],
  ['kjente', 'Kjente'],
  ['nye', 'Ikke møtt'],
]

const WANT: Record<Filter, Array<Level>> = {
  alle: [0, 1, 2],
  over: [1],
  kjente: [2],
  nye: [0],
}

const LEVEL_NAME = ['ikke møtt', 'øver på', 'kjent']

const fold = (s: string) => unaccent(s.toLowerCase())

export default function Ordbank() {
  const { bank, know, forget } = useStore()
  const now = Date.now()
  const [filter, setFilter] = useState<Filter>('alle')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [sure, setSure] = useState<string | null>(null)
  const c = counts(bank, now)
  const shares = linkShares(bank, now)
  const query = fold(q.trim())

  return (
    <Page es="Tus palabras" title="Ordbank">
      <section className="q-frame q-box">
        <div className="counts">
          <div>
            <b>{c.known}</b>kjente
          </div>
          <div>
            <b>{c.met - c.known}</b>øver på
          </div>
          <div>
            <b>{c.all - c.met}</b>venter
          </div>
        </div>
        <ul className="links">
          {LINKS.map((l) => (
            <li key={l}>
              <LinkIcon link={l} className="i" />
              <b>
                {LINK_NAME[l].es}
                <small>{LINK_NAME[l].no}</small>
              </b>
              <InkBar
                share={shares[l]}
                color={l === 'decir' ? 'var(--red)' : 'var(--blue)'}
                className="bar"
              />
              <em>{percent(shares[l])}</em>
            </li>
          ))}
        </ul>
        <p className="q-muted mt-3 text-[16px] leading-snug">
          Hvert ord er to ting å huske: å forstå det, skrevet eller sagt (
          <i>entender</i>), og å komme på det selv når du vet hva det betyr (
          <i>recordar</i>). Strekene viser hvor godt de sitter nå, i snitt for
          ordene du har møtt.
        </p>
      </section>

      <div className="q-filter">
        <div className="chips" role="group" aria-label="Vis">
          {FILTERS.map(([f, label]) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="search">
          <Search aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søk på spansk eller norsk"
            aria-label="Søk"
          />
        </label>
      </div>

      {LESSONS.map((lesson) => {
        const all = WORDS.filter((w) => w.lesson === lesson.id)
        const words = all.filter(
          (w) =>
            WANT[filter].includes(level(bank.cards[w.id], now)) &&
            (!query ||
              fold(w.es).includes(query) ||
              fold(w.no).includes(query)),
        )
        if (!words.length) return null
        const met = all.filter((w) => bank.cards[w.id]).length
        const left = all.filter((w) => !bank.cards[w.id])
        return (
          <section key={lesson.id} className="q-lesson">
            <header>
              <h2>
                {lesson.es}
                <span>{lesson.no}</span>
              </h2>
              <em>
                {met} av {all.length} møtt
              </em>
              {left.length > 0 && (
                <span className="acts">
                  <a className="q-btn small" href={`#nuevas/${lesson.id}`}>
                    Lær fem nye
                  </a>
                  {sure === lesson.id ? (
                    <>
                      <button
                        type="button"
                        className="q-btn ghost small"
                        onClick={() => {
                          know(left.map((w) => w.id))
                          setSure(null)
                        }}
                      >
                        Ja, jeg kan dem
                      </button>
                      <button
                        type="button"
                        className="q-link"
                        onClick={() => setSure(null)}
                      >
                        Avbryt
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="q-link"
                      onClick={() => setSure(lesson.id)}
                    >
                      Kan disse fra før
                    </button>
                  )}
                </span>
              )}
            </header>
            <ul>
              {words.map((w) => {
                const card = bank.cards[w.id]
                const lv = level(card, now)
                const isOpen = open === w.id
                return (
                  <li key={w.id} className={isOpen ? 'open' : ''}>
                    <button
                      type="button"
                      className="row"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : w.id)}
                    >
                      <i className={`lv lv${lv}`} title={LEVEL_NAME[lv]} />
                      <b lang="es">
                        <Es w={w} />
                      </b>
                      <span>{meaning(w)}</span>
                    </button>
                    <Speak text={w.es} small label={`Hør ${w.es}`} />
                    {isOpen && (
                      <div className="more fx-rise">
                        {card ? (
                          <ul>
                            {LINKS.map((l) => {
                              const r = recall(card[l], now)
                              return (
                                <li key={l}>
                                  <LinkIcon link={l} className="i" />
                                  <b>{LINK_NAME[l].es}</b>
                                  <InkBar
                                    share={r}
                                    color={
                                      r < 0.85 ? 'var(--red)' : 'var(--blue)'
                                    }
                                    className="bar"
                                  />
                                  <em>sitter {lasts(card[l].s)}</em>
                                </li>
                              )
                            })}
                          </ul>
                        ) : (
                          <p className="q-muted">Ikke møtt ennå.</p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          {lv < 2 && (
                            <button
                              type="button"
                              className="q-btn ghost small"
                              onClick={() => know([w.id])}
                            >
                              Jeg kan det
                            </button>
                          )}
                          {card && (
                            <button
                              type="button"
                              className="q-link"
                              onClick={() => forget([w.id])}
                            >
                              Glem ordet
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </Page>
  )
}
