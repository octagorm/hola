import { Suspense, lazy, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Headphones,
  Library,
  Puzzle,
  Settings2,
  Shapes,
  Sun,
  X,
} from 'lucide-react'
import { EPIGRAPH } from './data/quijote'
import { STORY } from './data/stories'
import { stageOf } from './data/camino'
import { GAME_INFO } from './data/games'
import { AUDIOBOOKS } from './data/lydbok'
import { BOOKS, SHELVES } from './data/biblioteca'
import { MADE, minutes } from './lib/lydbok'
import { THEME_GROUPS } from './data/themes'
import { LESSON, WORDS } from './data/words'
import { LINKS, counts, dayKey, linkShares } from './lib/bank'
import { canHear, useVoices } from './lib/speech'
import { useStore } from './lib/store'
import {
  chapterLine,
  chapterTitle,
  clueCount,
  finished,
  memory,
  plan,
  ready,
  share,
  stagesWalked,
  todays,
} from './lib/today'
import { EmptyStamp, GameIcon, Scene, Stamp, TocArt } from './art'
import { AccountButton } from './account'
import { PaintedScene, SCENE_PAINTED } from './sky'
import { useAccount } from './lib/account'
import { Feedback } from './feedback'
import {
  InkBar,
  LINK_NAME,
  LinkIcon,
  Mixed,
  MixedKey,
  Priority,
  Ring,
  percent,
  useMedia,
} from './ui'
import type { ReactNode } from 'react'
import type { GameIconId, TocId } from './art'

// The home page: La Mancha at the top, in ink or, once painted, as a
// travel poster that follows the time of day (sky.tsx), and under it five
// parts, one at a time, picked from a bar at the foot of a phone's screen
// or under the picture on a larger one: today (today's chapter, the story
// to go on with, the credential, all on one phone screen), what there is
// to read and hear, the games in three groups, the themes in one list,
// and the words (the count and Tu museo).

// Tu museo, loaded only when Ordene is shown
const Museo = lazy(() => import('./games/museo'))

// What lies over the painted scene on a larger screen, for its moon and
// clouds to keep clear of
const AVOID = '.head h1, .head .motto, .head .tools'

type Tab = 'hoy' | 'leer' | 'jugar' | 'temas' | 'palabras'

const TABS: Array<{ id: Tab; no: string; Icon: typeof Sun }> = [
  { id: 'hoy', no: 'I dag', Icon: Sun },
  { id: 'leer', no: 'Les', Icon: BookOpen },
  { id: 'jugar', no: 'Spill', Icon: Puzzle },
  { id: 'temas', no: 'Emner', Icon: Shapes },
  { id: 'palabras', no: 'Ordene', Icon: Library },
]

// The part shown, kept while the player is in a game or a story and comes
// back (for this visit only)
const TAB_KEY = 'hola:tab'

function useTab(): [Tab, (t: Tab) => void] {
  const [tab, setTab] = useState<Tab>(() => {
    try {
      const t = sessionStorage.getItem(TAB_KEY)
      if (TABS.some((x) => x.id === t)) return t as Tab
    } catch {
      // storage closed
    }
    return 'hoy'
  })
  const choose = (t: Tab) => {
    setTab(t)
    try {
      sessionStorage.setItem(TAB_KEY, t)
    } catch {
      // storage closed
    }
    window.scrollTo(0, 0)
  }
  return [tab, choose]
}

// The games in three groups, the easiest first in each
const GAME_GROUPS: Array<{ es: string; no: string; ids: Array<string> }> = [
  {
    es: 'Palabras',
    no: 'Ordlek',
    ids: [
      'palabra',
      'sopa',
      'reloj',
      'crucigrama',
      'rosco',
      'cadena',
      'letras',
      'palabras',
    ],
  },
  {
    es: 'Gramática',
    no: 'Grammatikk',
    ids: ['elola', 'porpara', 'tiempos', 'orden', 'acento'],
  },
  {
    es: 'De oído',
    no: 'Lytting',
    ids: ['numeros', 'tapas', 'rastro', 'taxi', 'sonidos'],
  },
]

const ROMAN = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.']

// The index of stories (data/stories.ts), in order; one not written yet
// stands faded, with «Kommer»
const INDEX: Array<{
  id: TocId
  es: string
  no: string
  blurb: string
}> = [
  {
    id: 'quijote',
    es: 'Don Quijote',
    no: 'Romanen',
    blurb:
      'Begynnelsen av romanen, fortalt enkelt: adelsmannen, vertshuset, Sancho og vindmøllene.',
  },
  {
    id: 'viaje',
    es: 'El viaje',
    no: 'Reisen',
    blurb:
      'To venninner reiser fra Madrid til Cadaqués, ett sted i hvert kapittel: churros, flamenco, tapas, paella og sankthansbål.',
  },
  {
    id: 'leyendas',
    es: 'Leyendas',
    no: 'Sagnene',
    blurb:
      'Gustavo Adolfo Bécquers spøkelseshistorier, fortalt enkelt og lest høyt.',
  },
  {
    id: 'caso',
    es: 'El caso del reloj perdido',
    no: 'Klokken som forsvant',
    blurb:
      'Et detektivmysterium i Cadaqués: vitnene forteller, og du lytter etter sporene.',
  },
]

export default function Home() {
  const { bank, settings } = useStore()
  const [tab, choose] = useTab()
  const { hear, recorded } = useVoices()
  const narrow = useMedia('(max-width: 860px)')
  const account = useAccount()
  const now = Date.now()

  const today = todays(bank, now)
  const p =
    today ??
    plan(bank, now, { hear: canHear() !== false, perDay: settings.perDay })
  const done = !!today && finished(today)
  const stamped = !!bank.daily[dayKey(now)]
  const walked = stagesWalked(bank)
  const chapterNo = walked + (stamped ? 0 : 1)

  const c = counts(bank, now)
  const clues = clueCount(bank)
  const shares = linkShares(bank, now)
  const palabra = bank.palabra[dayKey(now)]

  // The stories, those not written yet faded: how far each is read
  const toc = INDEX.map((t, i) => {
    const story = STORY[t.id]
    if (!story) return { ...t, n: ROMAN[i], lead: undefined, href: undefined }
    const read = story.chapters.filter((x) => bank.read[x.id] !== undefined)
    const next = story.chapters.find((x) => bank.read[x.id] === undefined)
    const of = `${read.length} / ${story.chapters.length}`
    return {
      ...t,
      n: ROMAN[i],
      lead: [next ? next.no : 'Alt er lest', of] as [string, string],
      href: `#${story.id}`,
    }
  })

  // The library's shelves: how far each is read, and what comes next
  const shelves = SHELVES.map((shelf) => {
    const books = BOOKS.filter((b) => b.shelf === shelf.id)
    const read = books.filter((b) => bank.place[b.id]?.done).length
    const next = books.find((b) => !bank.place[b.id]?.done)
    return {
      shelf,
      lead: [next ? next.no : 'Alt er lest', `${read} / ${books.length}`] as [
        string,
        string,
      ],
    }
  })

  // The story to go on with: the first with a chapter not read
  const reading = INDEX.flatMap((t) => {
    const story = STORY[t.id]
    const next = story?.chapters.find((x) => bank.read[x.id] === undefined)
    return story && next ? [{ story, next, t }] : []
  }).at(0)

  // The last stamps got, and the next to get
  const shown = Array.from(
    { length: Math.min(4, walked) },
    (_, i) => walked - Math.min(4, walked) + i + 1,
  )
  const blanks = Array.from(
    { length: 5 - shown.length },
    (_, i) => walked + i + 1,
  )

  const game = (g: (typeof GAME_INFO)[number]) => {
    const note =
      g.id === 'palabra' && palabra !== undefined
        ? palabra
          ? `Løst på ${palabra} forsøk i dag`
          : 'Ikke løst i dag – nytt ord i morgen'
        : ready(g.id, c.met, clues)
          ? g.blurb
          : `${g.blurb} · trenger flere ord`
    const body = (
      <>
        <GameIcon id={g.id as GameIconId} />
        <span>
          <b>{g.es}</b>
          <small>{g.soon ? `${g.blurb} · kommer` : note}</small>
        </span>
      </>
    )
    return g.soon ? (
      <div key={g.id} className="soon">
        {body}
      </div>
    ) : (
      <a key={g.id} href={`#${g.id}`}>
        {body}
      </a>
    )
  }

  return (
    <div className={`q-home tab-${tab}`}>
      <section className="q-hero">
        {!narrow &&
          tab === 'hoy' &&
          (SCENE_PAINTED ? (
            <PaintedScene className="scene" avoid={AVOID} />
          ) : (
            <Scene view="home" className="scene" />
          ))}
        <div className="head">
          <div>
            <h1>Hola</h1>
            <p className="motto">
              Poco a poco se va lejos
              <em>litt etter litt kommer man langt</em>
            </p>
          </div>
          <div className="tools">
            <a
              className="q-round"
              href="#ajustes"
              aria-label="Innstillinger"
              title="Innstillinger"
            >
              <Settings2 />
            </a>
            <AccountButton />
          </div>
        </div>
        {narrow &&
          tab === 'hoy' &&
          (SCENE_PAINTED ? (
            <PaintedScene narrow className="strip" />
          ) : (
            <Scene view="narrow" className="strip" />
          ))}
      </section>

      <nav className="q-tabs" aria-label="Deler av forsiden">
        {TABS.map(({ id, no, Icon }) => (
          <button
            key={id}
            type="button"
            className={id === tab ? 'on' : ''}
            aria-current={id === tab ? 'page' : undefined}
            onClick={() => choose(id)}
          >
            <Icon aria-hidden="true" />
            {no}
          </button>
        ))}
      </nav>

      <main className="q-home-main">
        {tab === 'hoy' && (
          <>
            <section className="q-today">
              <a
                href="#hoy"
                className="q-ring-link"
                aria-hidden="true"
                tabIndex={-1}
              >
                <Ring
                  shares={done ? p.steps.map(() => 1) : p.steps.map(share)}
                  numeral={String(chapterNo)}
                />
              </a>
              <div>
                <div className="q-label">
                  La clase de hoy <span>· Dagens økt</span>
                </div>
                <h2>{done ? 'Ferdig for i dag' : chapterTitle(p)}</h2>
                <p>
                  {done
                    ? `Du har fått stempelet fra ${stageOf(chapterNo).town}. Ny økt i morgen.`
                    : chapterLine(p)}
                </p>
              </div>
              <a className="q-btn go" href="#hoy">
                {!today ? 'Begynn' : done ? 'Se dagen' : 'Fortsett'}
                <ArrowRight />
              </a>
            </section>

            <StartNotice />

            <Memory />

            <div className="q-row2">
              {reading && (
                <a
                  className="q-frame q-box q-reading"
                  href={`#${reading.story.id}/${reading.next.id}`}
                >
                  <TocArt id={reading.t.id} className="art" />
                  <span>
                    <span className="q-label">
                      Sigue leyendo <span>· Les videre</span>
                    </span>
                    <b>
                      {reading.t.es}: {reading.next.title}
                    </b>
                    <em>{reading.next.no}</em>
                  </span>
                  <ChevronRight className="chev" aria-hidden="true" />
                </a>
              )}
              <a className="q-frame q-box q-cred" href="#credencial">
                <span className="q-label">
                  La credencial <span>· Pilegrimspasset</span>
                </span>
                <p>
                  {walked
                    ? `Dag ${walked} på Caminoen: ${stageOf(walked).town}.`
                    : `Første etappe: over Pyreneene til ${stageOf(1).town}.`}{' '}
                  <span className="more">
                    Et stempel for hver dag du fullfører økten.
                  </span>
                </p>
                <div className="stamps">
                  {shown.map((n) => (
                    <Stamp key={n} motif={stageOf(n).motif} n={n} />
                  ))}
                  {blanks.map((n) => (
                    <EmptyStamp key={n} label={`día ${n}`} />
                  ))}
                </div>
              </a>
            </div>
          </>
        )}

        {tab === 'leer' && (
          <>
            <section className="q-shelf">
              <h4>
                Historias<small>Fortellinger, fortalt enkelt</small>
              </h4>
              <p className="intro">
                Dagens økt tar neste kapittel herfra, ett om gangen.
              </p>
              <ol>
                {toc.map((t) => (
                  <ReadRow
                    key={t.id}
                    href={t.href}
                    art={<TocArt id={t.id} />}
                    n={t.n}
                    es={t.es}
                    no={t.no}
                    blurb={t.blurb}
                    lead={t.lead}
                  />
                ))}
              </ol>
            </section>

            <section className="q-shelf">
              <h4>
                Biblioteca<small>Biblioteket, å lese i eget tempo</small>
              </h4>
              <ol>
                {shelves.map(({ shelf, lead }) => (
                  <ReadRow
                    key={shelf.id}
                    href="#biblioteca"
                    art={
                      <span className={`tile ${shelf.id}`}>
                        <Library />
                      </span>
                    }
                    es={shelf.es}
                    no={shelf.no}
                    blurb={shelf.about}
                    lead={lead}
                  />
                ))}
              </ol>
            </section>

            {AUDIOBOOKS.length > 0 && (
              <section className="q-shelf">
                <h4>
                  Para escuchar<small>Å lytte til</small>
                </h4>
                <ol>
                  {AUDIOBOOKS.map((b) => {
                    const made = MADE[b.id]
                    return (
                      <ReadRow
                        key={b.id}
                        href={`#lydbok/${b.id}`}
                        art={
                          <span className="tile listen">
                            <Headphones />
                          </span>
                        }
                        es={b.es}
                        no={b.no}
                        blurb={`En lydbok i ${b.chapters.length} kapitler, som en podkast: Marta og Ingrid forklarer, og historien leses på spansk.`}
                        lead={[
                          'Følg den i podkastappen',
                          made ? minutes(made.seconds) : '',
                        ]}
                      />
                    )
                  })}
                </ol>
              </section>
            )}

            <section className="q-epi">
              <h4>Así se lee · Slik leses teksten</h4>
              <div className="mix">
                <Mixed line={EPIGRAPH.line} />
              </div>
              <MixedKey />
            </section>
          </>
        )}

        {tab === 'jugar' &&
          GAME_GROUPS.map((group) => (
            <section key={group.no} className="q-shelf">
              <h4>
                {group.es}
                <small>{group.no}</small>
              </h4>
              <div className="q-games">
                {group.ids.flatMap((id) => {
                  const g = GAME_INFO.find((x) => x.id === id)
                  return g ? [game(g)] : []
                })}
              </div>
            </section>
          ))}

        {tab === 'temas' && <Themes />}

        {tab === 'palabras' && (
          <>
            <a className="q-frame q-box q-words" href="#ordbank">
              <h3>
                Tus palabras<span>dine ord</span>
              </h3>
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
              <span className="more">
                Se alle ordene <ArrowRight />
              </span>
            </a>

            <Suspense fallback={null}>
              <Museo />
            </Suspense>
          </>
        )}

        {account.on && <Feedback />}

        <footer className="q-foot">
          <nav>
            <a href="#ordbank">Ordbank</a>
            <a href="#ajustes">Innstillinger</a>
            <a href="/om">Om</a>
            {account.on && <a href="/personvern">Personvern</a>}
          </nav>
          {hear === false
            ? 'Denne nettleseren har ingen spansk stemme, så ordene leses ikke høyt her. '
            : recorded
              ? 'Stemmene er lest inn på forhånd med Googles Gemini. '
              : 'Stemmene er nettleserens egne spanske. '}
          {account.me
            ? 'Fremgangen lagres i denne nettleseren og på kontoen din.'
            : account.on
              ? 'Fremgangen lagres i denne nettleseren. Logg inn med Google for å ha den med overalt, eller ta den med i en sikkerhetskopi under Innstillinger.'
              : 'Fremgangen lagres i denne nettleseren, og en sikkerhetskopi under Innstillinger tar den med til en annen.'}
        </footer>
      </main>
    </div>
  )
}

// How the words stand, as one bar of three parts, the user's wish: known,
// being learnt and not met, with the known and the learnt due to practise
// now lit in their top half, side by side in the middle (the thing to do, with a round
// of ten to do it), and how many more are due soon, so that spaced
// repetition can be seen at work
// The starting point can be chosen under Innstillinger (Punto de
// partida): said on the home page until one is chosen or this is put away
// (on every device), so that a new player can look around first and come
// back to it
function StartNotice() {
  const { bank, markSeen } = useStore()
  if (bank.seen.start || bank.base.t) return null
  const begun = Object.values(bank.cards).some((c) => c && !c.z)
  return (
    <div className="q-frame q-box q-notice">
      <div className="text">
        <span className="q-label">
          Punto de partida <span>· Startpunkt</span>
        </span>
        <span>
          {begun
            ? 'Kunne du mer eller mindre spansk fra før? Velg hvor du vil begynne. Det du har øvd på, blir som det er.'
            : 'Hvor mye spansk kan du fra før? Se deg gjerne rundt først, og velg så hvor du vil begynne.'}
        </span>
        <a className="q-btn small" href="#ajustes/partida">
          Velg startpunkt
          <ArrowRight />
        </a>
      </div>
      <button
        type="button"
        className="close"
        aria-label="Lukk"
        onClick={() => markSeen('start')}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  )
}

function Memory() {
  const { bank } = useStore()
  const m = memory(bank, Date.now())
  if (!m.known && !m.learning) return null
  const n = (x: number) => x.toLocaleString('nb-NO')
  const parts = [
    { k: 'known', n: m.known - m.knownDue, no: 'kjente' },
    { k: 'known due', n: m.knownDue, no: 'kjente å øve på' },
    { k: 'learning due', n: m.learningDue, no: 'lærer, å øve på' },
    { k: 'learning', n: m.learning - m.learningDue, no: 'lærer' },
    { k: 'waiting', n: m.waiting, no: 'ikke møtt' },
  ]
  // (m.week counts tomorrow's too: the rest of the week is what is left)
  const later = m.week - m.tomorrow
  const soon =
    m.tomorrow || later
      ? `Flere å øve på: ${m.tomorrow ? `${n(m.tomorrow)} ord i morgen` : 'ingen i morgen'}, ${later ? `${n(later)} ${m.tomorrow ? '' : 'ord '}senere i uka` : 'ingen flere i uka'}.`
      : 'Ingen flere å øve på den neste uka.'
  return (
    <section className="q-frame q-box q-memory">
      <div className="top">
        <h3>
          Tu memoria<span>hukommelsen</span>
        </h3>
        <a className={`q-btn ${m.due ? '' : 'ghost'}`} href="#repaso">
          {m.due ? `Øv på ${Math.min(10, m.due)}` : 'Øv likevel'}
          <ArrowRight />
        </a>
      </div>
      <div
        className="bar"
        role="img"
        aria-label={parts.map((p) => `${n(p.n)} ${p.no}`).join(', ')}
      >
        {parts.map(
          (p) =>
            p.n > 0 && (
              <span key={p.k} className={p.k} style={{ flexGrow: p.n }} />
            ),
        )}
      </div>
      <ul className="legend" aria-hidden="true">
        {[
          { k: 'known', n: m.known, due: m.knownDue, no: 'kjente' },
          { k: 'learning', n: m.learning, due: m.learningDue, no: 'lærer' },
          { k: 'waiting', n: m.waiting, due: 0, no: 'ikke møtt' },
        ].map((p) => (
          <li key={p.k} className={p.k}>
            <i />
            <b>{n(p.n)}</b> {p.no}
            {p.due > 0 && (
              <span className="due">
                , <i />
                <b>{n(p.due)}</b> å øve på
              </span>
            )}
          </li>
        ))}
      </ul>
      <p>
        <span className="why">
          {m.due
            ? `${n(m.due)} ord bør du øve på nå. Øver du på dem i tide, sitter de lenger hver gang. `
            : 'Ingen ord å øve på nå. '}
        </span>
        <span className="soon">{soon}</span>
      </p>
    </section>
  )
}

// A line on the reading part: a picture, the name in Spanish and in
// Norwegian, a few words on it, and how far it is read; faded when it is
// not written yet
function ReadRow({
  href,
  art,
  n,
  es,
  no,
  blurb,
  lead,
}: {
  href: string | undefined
  art: ReactNode
  n?: string
  es: string
  no: string
  blurb: string
  lead: [string, string] | undefined
}) {
  const body = (
    <>
      <span className="art">{art}</span>
      <span>
        <span className="nm">
          {n && <i>{n}</i>}
          {es}
        </span>
        <span className="en">{no}</span>
        <p>{blurb}</p>
        <span className="lead">
          {lead ? lead[0] : 'Kommer'}
          <span />
          {lead ? lead[1] : ''}
        </span>
      </span>
    </>
  )
  return (
    <li className={href ? '' : 'soon'}>
      {href ? <a href={href}>{body}</a> : <div>{body}</div>}
    </li>
  )
}

// The themes, every group in one list: the group's name, and under it its
// themes, each with how far its words are met and its priority, chosen
// right there
function Themes() {
  const { bank, chooseTheme } = useStore()
  const groups = THEME_GROUPS.filter((g) => g.themes.length)
  const chosen = bank.theme.on.filter((x) => x.p > 0).length
  return (
    <section className="q-themes">
      <div className="q-shelf">
        <h4>
          Temas<small>Emner</small>
        </h4>
      </div>
      <p className="intro">
        Velg ett eller flere emner, så kommer de nye ordene i dagens økt derfra.
        Et emne på 3 får tre ord for hvert ord fra et på 1.{' '}
        {chosen
          ? `Du har valgt ${chosen === 1 ? 'ett emne' : `${chosen} emner`}.`
          : 'Ingen er valgt ennå.'}
      </p>
      {groups.map((group) => (
        <section key={group.id} className="group">
          <h5>
            {group.es}
            <span>{group.no}</span>
          </h5>
          <ul>
            {group.themes.map((t) => {
              const lesson = LESSON[t.lesson]
              if (!lesson) return null
              const all = WORDS.filter((w) => w.lesson === t.lesson)
              const met = all.filter((w) => bank.cards[w.id]).length
              const p = bank.theme.on.find((x) => x.id === t.lesson)?.p ?? 0
              return (
                <li key={t.lesson} className={p > 0 ? 'chosen' : ''}>
                  <a href={`#tema/${t.lesson}`}>
                    <b>{lesson.es}</b>
                    <small>
                      {lesson.no} ·{' '}
                      {met === all.length
                        ? 'alle ord møtt'
                        : `${met} av ${all.length} ord`}
                    </small>
                    <InkBar
                      share={all.length ? met / all.length : 0}
                      className="bar"
                    />
                  </a>
                  {/* Chosen or not, right here: as many as wanted */}
                  <Priority
                    p={p}
                    name={lesson.es}
                    onSet={(to) => chooseTheme(t.lesson, to)}
                  />
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </section>
  )
}
