import { useState } from 'react'
import { ArrowRight, BookOpen, Music, Settings2 } from 'lucide-react'
import { EPIGRAPH } from './data/quijote'
import { STORY } from './data/stories'
import { stageOf } from './data/camino'
import { GAME_INFO } from './data/games'
import { THEME, THEME_GROUPS } from './data/themes'
import { LESSON, WORDS } from './data/words'
import { LINKS, counts, dayKey, linkShares } from './lib/bank'
import { canHear, useVoices } from './lib/speech'
import { useStore } from './lib/store'
import { startMusic, stopMusic, useMusic } from './lib/music'
import {
  chapterLine,
  chapterTitle,
  clueCount,
  finished,
  plan,
  ready,
  share,
  stagesWalked,
  todays,
} from './lib/today'
import { EmptyStamp, GameIcon, Scene, Stamp, TocArt } from './art'
import { AccountButton } from './account'
import { Colecciones } from './colecciones'
import { useAccount } from './lib/account'
import {
  InkBar,
  LINK_NAME,
  LinkIcon,
  Mixed,
  MixedKey,
  Ring,
  percent,
  roman,
  useMedia,
} from './ui'
import type { GameIconId, TocId } from './art'

// The home page, a page of an old book: La Mancha in ink at the top, then
// today's chapter, the novel's first line in mixed text, the words and
// the credential, the index of the stories and the games.

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
  const { bank, settings, setSettings } = useStore()
  const { hear, recorded } = useVoices()
  const narrow = useMedia('(max-width: 860px)')
  const playing = useMusic()
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

  const toggleMusic = () => {
    if (settings.music) {
      setSettings({ music: false })
      stopMusic()
    } else {
      setSettings({ music: true })
      startMusic()
    }
  }

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

  // The last stamps got, and the next to get
  const shown = Array.from(
    { length: Math.min(4, walked) },
    (_, i) => walked - Math.min(4, walked) + i + 1,
  )
  const blanks = Array.from(
    { length: 5 - shown.length },
    (_, i) => walked + i + 1,
  )

  return (
    <div className="q-home">
      <section className="q-hero">
        {!narrow && <Scene view="home" className="scene" />}
        <div className="head">
          <div>
            <h1>Hola</h1>
            <p className="motto">
              Poco a poco se va lejos
              <em>litt etter litt kommer man langt</em>
            </p>
          </div>
          <div className="tools">
            <button
              type="button"
              className={`q-round ${playing ? 'dark' : ''}`}
              aria-label="Musikk"
              aria-pressed={playing}
              onClick={toggleMusic}
            >
              <Music />
            </button>
            <a className="q-round" href="#ordbank" aria-label="Ordbank">
              <BookOpen />
            </a>
            <a className="q-round" href="#ajustes" aria-label="Innstillinger">
              <Settings2 />
            </a>
            <AccountButton />
          </div>
        </div>
        {narrow && <Scene view="narrow" className="strip" />}
      </section>

      <main className="q-home-main">
        <section className="q-frame q-today">
          <a
            href="#hoy"
            className="q-ring-link"
            aria-hidden="true"
            tabIndex={-1}
          >
            <Ring
              shares={done ? p.steps.map(() => 1) : p.steps.map(share)}
              numeral={roman(chapterNo)}
            />
          </a>
          <div>
            <div className="q-label">
              Capítulo de hoy <span>· Dagens kapittel</span>
            </div>
            <h2>{done ? 'Dagens kapittel er skrevet' : chapterTitle(p)}</h2>
            <p className="drop">
              {done
                ? `Hvori leseren har gjort dagens arbeid og fått stempelet fra ${stageOf(chapterNo).town}.`
                : chapterLine(p)}
            </p>
          </div>
          <a className="q-btn go" href="#hoy">
            {!today ? 'Begynn' : done ? 'Se dagen' : 'Fortsett'}
            <ArrowRight />
          </a>
        </section>

        <section className="q-epi">
          <div className="orig">«{EPIGRAPH.es}»</div>
          <div className="mix">
            <Mixed line={EPIGRAPH.line} />
          </div>
          <MixedKey />
        </section>

        <div className="q-row2">
          <a className="q-frame q-box" href="#ordbank">
            <h3>
              Tus palabras<span>dine ord</span>
            </h3>
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
                  <b>{LINK_NAME[l].es}</b>
                  <InkBar
                    share={shares[l]}
                    color={l === 'decir' ? 'var(--red)' : 'var(--blue)'}
                    className="bar"
                  />
                  <em>{percent(shares[l])}</em>
                </li>
              ))}
            </ul>
          </a>
          <a className="q-frame q-box q-cred" href="#credencial">
            <h3>
              La credencial<span>pilegrimspasset</span>
            </h3>
            <p>
              Hver dag du fullfører dagens kapittel, går du en etappe av
              Caminoen til Santiago og får et stempel.{' '}
              {walked
                ? `Dag ${walked}: ${stageOf(walked).town}.`
                : `Første etappe: over Pyreneene til ${stageOf(1).town}.`}
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

        <Colecciones />

        <Themes />

        <section className="q-toc">
          <h4>
            Índice<small>Eventyr</small>
          </h4>
          <ol>
            {toc.map((t) => {
              const body = (
                <>
                  <TocArt id={t.id} />
                  <span>
                    <span className="nm">
                      <i>{t.n}</i>
                      {t.es}
                    </span>
                    <span className="en">{t.no}</span>
                    <p>{t.blurb}</p>
                    <span className="lead">
                      {t.lead ? t.lead[0] : 'Kommer'}
                      <span />
                      {t.lead ? t.lead[1] : ''}
                    </span>
                  </span>
                </>
              )
              return (
                <li key={t.id} className={t.href ? '' : 'soon'}>
                  {t.href ? <a href={t.href}>{body}</a> : <div>{body}</div>}
                </li>
              )
            })}
          </ol>
        </section>

        <section>
          <div className="q-toc">
            <h4>
              Juegos<small>Ordspill</small>
            </h4>
          </div>
          <div className="q-games">
            {GAME_INFO.map((g) => {
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
            })}
          </div>
        </section>

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

// The themes, a group at a time: the group of the theme chosen first
function Themes() {
  const { bank } = useStore()
  const groups = THEME_GROUPS.filter((g) => g.themes.length)
  const chosenGroup = THEME[bank.theme.id]?.group.id
  const [open, setOpen] = useState(chosenGroup ?? groups[0].id)
  const group = groups.find((g) => g.id === open) ?? groups[0]
  return (
    <section className="q-themes">
      <div className="q-toc">
        <h4>
          Temas<small>Emner</small>
        </h4>
      </div>
      <p className="intro">
        Velg et emne, så kommer de nye ordene i dagens kapittel derfra.
      </p>
      <div className="tabs" role="tablist" aria-label="Emner">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`q-tab-${g.id}`}
            aria-selected={g.id === group.id}
            aria-controls="q-themes-panel"
            className={g.id === group.id ? 'on' : ''}
            onClick={() => setOpen(g.id)}
          >
            {g.es}
            <span>{g.no}</span>
            {g.id === chosenGroup && <i title="Dagens tema er her" />}
          </button>
        ))}
      </div>
      <ul
        role="tabpanel"
        id="q-themes-panel"
        aria-labelledby={`q-tab-${group.id}`}
      >
        {group.themes.map((t) => {
          const lesson = LESSON[t.lesson]
          if (!lesson) return null
          const all = WORDS.filter((w) => w.lesson === t.lesson)
          const met = all.filter((w) => bank.cards[w.id]).length
          const chosen = bank.theme.id === t.lesson
          return (
            <li key={t.lesson}>
              <a href={`#tema/${t.lesson}`} className={chosen ? 'chosen' : ''}>
                <b>{lesson.es}</b>
                <small>{lesson.no}</small>
                <InkBar
                  share={all.length ? met / all.length : 0}
                  className="bar"
                />
                <em>
                  {chosen
                    ? 'Dagens tema'
                    : met === all.length
                      ? 'Alle møtt'
                      : `${met} av ${all.length} ord`}
                </em>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
