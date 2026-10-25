import { useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { THEME, THEME_GROUPS } from '../data/themes'
import { LESSON, LESSONS, WORDS, meaning } from '../data/words'
import { LINKS, counts, level, linkShares, recall } from '../lib/bank'
import { unaccent } from '../lib/spanish'
import { lasts } from '../lib/today'
import { useStore } from '../lib/store'
import { Es, InkBar, LINK_NAME, LinkIcon, Page, Speak, percent } from '../ui'
import type { Level } from '../lib/bank'

// Every word Hola teaches, lesson by lesson: how well each is known, and
// for each word met how well its two links hold. A lesson can be begun
// from here, or marked as known already. The lessons are shut, as a table
// of contents in groups (the first lessons, the themes' groups, the
// library's texts), and open one by one; a search opens those it finds.

type Filter = 'alle' | 'over' | 'kjente' | 'nye'

const FILTERS: Array<[Filter, string]> = [
  ['alle', 'Alle'],
  ['over', 'Lærer'],
  ['kjente', 'Kjente'],
  ['nye', 'Ikke møtt'],
]

const WANT: Record<Filter, Array<Level>> = {
  alle: [0, 1, 2],
  over: [1],
  kjente: [2],
  nye: [0],
}

const LEVEL_NAME = ['ikke møtt', 'lærer', 'kjent']

const fold = (s: string) => unaccent(s.toLowerCase())

const GROUPS: Array<{
  id: string
  es: string
  no: string
  lessons: Array<string>
}> = [
  {
    id: 'primero',
    es: 'Lo primero',
    no: 'Det første',
    lessons: LESSONS.filter((l) => !l.book && !THEME[l.id]).map((l) => l.id),
  },
  ...THEME_GROUPS.map((g) => ({
    id: g.id,
    es: g.es,
    no: g.no,
    lessons: g.themes.map((t) => t.lesson).filter((id) => LESSON[id]),
  })),
  {
    id: 'biblioteca',
    es: 'Biblioteca',
    no: 'Tekstene i biblioteket',
    lessons: LESSONS.filter((l) => l.book).map((l) => l.id),
  },
].filter((g) => g.lessons.length)

export default function Ordbank() {
  const { bank, know, forget } = useStore()
  const now = Date.now()
  const [filter, setFilter] = useState<Filter>('alle')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [shown, setShown] = useState<Set<string>>(() => new Set())
  const [sure, setSure] = useState<string | null>(null)
  const c = counts(bank, now)
  const shares = linkShares(bank, now)
  const query = fold(q.trim())
  const toggle = (id: string) =>
    setShown((was) => {
      const next = new Set(was)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Page es="Tus palabras" title="Ordbank">
      <section className="q-frame q-box">
        <div className="counts">
          <div>
            <b>{c.known}</b>kjente
          </div>
          <div>
            <b>{c.met - c.known}</b>lærer
          </div>
          <div>
            <b>{c.all - c.met}</b>ikke møtt
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

      {GROUPS.map((group) => {
        const lessons = group.lessons.flatMap((id) => {
          const lesson = LESSON[id]
          if (!lesson) return []
          const all = WORDS.filter((w) => w.lesson === id)
          const words = all.filter(
            (w) =>
              WANT[filter].includes(level(bank.cards[w.id], now)) &&
              (!query ||
                fold(w.es).includes(query) ||
                fold(w.no).includes(query)),
          )
          return words.length ? [{ lesson, all, words }] : []
        })
        if (!lessons.length) return null
        return (
          <section key={group.id} className="q-lgroup">
            <h3>
              {group.es}
              <small>{group.no}</small>
            </h3>
            {lessons.map(({ lesson, all, words }) => {
              const met = all.filter((w) => bank.cards[w.id]).length
              const known = all.filter(
                (w) => level(bank.cards[w.id], now) === 2,
              )
              const left = all.filter((w) => !bank.cards[w.id])
              const isShown = !!query || shown.has(lesson.id)
              return (
                <section
                  key={lesson.id}
                  className={`q-lesson ${isShown ? 'shown' : ''}`}
                >
                  <header>
                    <button
                      type="button"
                      className="toc"
                      aria-expanded={isShown}
                      onClick={() => toggle(lesson.id)}
                    >
                      <ChevronRight className="chev" aria-hidden="true" />
                      <span className="name">
                        {lesson.es}
                        <span>{lesson.no}</span>
                      </span>
                      <em>
                        {filter === 'alle'
                          ? `${met} av ${all.length} møtt`
                          : `${words.length} av ${all.length}`}
                      </em>
                      <span className="fill" aria-hidden="true">
                        <i
                          className="lv1"
                          style={{ width: `${(100 * met) / all.length}%` }}
                        />
                        <i
                          className="lv2"
                          style={{
                            width: `${(100 * known.length) / all.length}%`,
                          }}
                        />
                      </span>
                    </button>
                    {isShown && left.length > 0 && (
                      <span className="acts">
                        <a
                          className="q-btn small"
                          href={`#nuevas/${lesson.id}`}
                        >
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
                  {isShown && (
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
                              <i
                                className={`lv lv${lv}`}
                                title={LEVEL_NAME[lv]}
                              />
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
                                              r < 0.85
                                                ? 'var(--red)'
                                                : 'var(--blue)'
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
                  )}
                </section>
              )
            })}
          </section>
        )
      })}
    </Page>
  )
}
