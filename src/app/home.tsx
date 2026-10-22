import { ArrowRight, BookOpen, Music, Settings2 } from 'lucide-react'
import { CHAPTERS, EPIGRAPH } from './data/quijote'
import { stageOf } from './data/camino'
import { GAME_INFO } from './data/games'
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
  const read = CHAPTERS.filter((x) => bank.read[x.id] !== undefined).length
  const nextChapter = CHAPTERS.find((x) => bank.read[x.id] === undefined)
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

  const toc: Array<{
    id: TocId
    n: string
    es: string
    no: string
    blurb: string
    lead?: [string, string]
    href?: string
  }> = [
    {
      id: 'quijote',
      n: 'I.',
      es: 'Don Quijote',
      no: 'Romanen',
      blurb:
        'Begynnelsen av romanen, fortalt enkelt: adelsmannen, vertshuset, Sancho og vindmøllene.',
      lead: nextChapter
        ? [nextChapter.no, `${read} / ${CHAPTERS.length}`]
        : ['Alt er lest', `${read} / ${CHAPTERS.length}`],
      href: '#quijote',
    },
    {
      id: 'viaje',
      n: 'II.',
      es: 'El viaje',
      no: 'Reisen',
      blurb:
        'Fra Madrid til Cadaqués, scene for scene: tog, tapas og et rom for natten.',
    },
    {
      id: 'cuentos',
      n: 'III.',
      es: 'Cuentos',
      no: 'Historier',
      blurb: 'Gamle eventyr fra Spania og Amerika, spilt av dukker.',
    },
    {
      id: 'sueno',
      n: 'IV.',
      es: 'El sueño',
      no: 'Drømmen',
      blurb: 'En drøm som adlyder ordre på spansk: åpne den tredje skuffen.',
    },
  ]

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
