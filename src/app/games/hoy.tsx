import { useEffect, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { LESSON, WORD } from '../data/words'
import { CHAPTER } from '../data/stories'
import { fromOf, stageOf } from '../data/camino'
import { GAME } from '../data/games'
import { dayKey, pick } from '../lib/bank'
import { canHear, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { blip } from '../lib/sound'
import {
  LISTEN,
  STEP,
  chapterLine,
  chapterTitle,
  current,
  finished,
  gain,
  inWords,
  lasts,
  markDone,
  plan,
  playedHere,
  progressOf,
  share,
  stagesWalked,
  summary,
  todays,
} from '../lib/today'
import { Drill, Learn } from '../quiz'
import { Es, LINK_NAME, LinkIcon, Page, Ring, roman } from '../ui'
import { GameIcon, Stamp, TocArt, isTocId } from '../art'
import type { GameIconId } from '../art'
import type { Path, PathStep } from '../lib/bank'

// Today's chapter: about ten minutes, made once a day (lib/today.ts) and
// played here part by part. The words are practised on this page; a game
// or a chapter of the story opens on its own page and comes back here.

export default function Hoy() {
  const { bank, settings, setPath, finishDay } = useStore()
  const now = Date.now()
  const day = dayKey(now)
  const p = todays(bank, now)

  // The day's plan, made on its first visit
  useEffect(() => {
    if (todays(bank, Date.now())) return
    setPath(() =>
      plan(bank, Date.now(), {
        hear: canHear() !== false,
        perDay: settings.perDay,
      }),
    )
  }, [bank, setPath, settings.perDay])

  // A part played here is done once all of it is answered
  useEffect(() => {
    if (!p) return
    const i = current(p)
    const s = p.steps.at(i)
    if (!s || !playedHere(s)) return
    const { done, of } = progressOf(s)
    if (done >= of)
      setPath((q) => (q && q.d === p.d ? markDone(q, i, Date.now()) : q))
  }, [p, setPath])

  // The day done: a stage walked, and its stamp
  useEffect(() => {
    if (!p || !finished(p) || bank.daily[day]) return
    finishDay(day, 10)
    blip('win')
  }, [p, bank.daily, day, finishDay])

  if (!p)
    return (
      <Page es="La clase de hoy" title="Dagens økt">
        {null}
      </Page>
    )

  const at = current(p)
  const done = at < 0
  const walked = stagesWalked(bank)
  const chapterNo = walked + (bank.daily[day] ? 0 : 1)

  return (
    <Page
      es={`Día ${chapterNo}`}
      title="Dagens økt"
      className={`q-hoy ${done ? '' : 'busy'}`}
    >
      <section className="q-hoy-head">
        <Ring
          shares={p.steps.map(share)}
          numeral={String(chapterNo)}
          size={92}
        />
        <div>
          <h2>{done ? 'Ferdig for i dag' : chapterTitle(p)}</h2>
          <p>{chapterLine(p)}</p>
        </div>
      </section>

      <ol className="q-steps">
        {p.steps.map((s, i) => {
          const { done: n, of } = progressOf(s)
          return (
            <li key={i} className={s.done ? 'done' : i === at ? 'at' : ''}>
              <span className="n">{roman(i + 1)}.</span>
              <b>{STEP[s.k].es}</b>
              <span className="no">{stepName(s)}</span>
              <em>
                {s.done ? (
                  s.skip ? (
                    'hoppet over'
                  ) : (
                    <Check aria-label="ferdig" />
                  )
                ) : i === at && of ? (
                  `${n} / ${of}`
                ) : (
                  `${STEP[s.k].minutes} min`
                )}
              </em>
            </li>
          )
        })}
      </ol>

      {done ? <Summary p={p} /> : <Part key={`${p.d} ${at}`} p={p} i={at} />}
    </Page>
  )
}

const stepName = (s: PathStep) =>
  s.k === 'game'
    ? (GAME[s.arg ?? '']?.es ?? STEP.game.no)
    : s.k === 'story'
      ? (CHAPTER[s.arg ?? '']?.chapter.title ?? STEP.story.no)
      : STEP[s.k].no

// The part of the day to do now
function Part({ p, i }: { p: Path; i: number }) {
  const { bank, setPath } = useStore()
  const { hear } = useVoices()
  const s = p.steps[i]
  const got = new Set(s.got)
  const add = (keys: Array<string>) =>
    setPath((q) =>
      q && q.d === p.d ? keys.reduce((acc, k) => gain(acc, i, k), q) : q,
    )
  const skip = () =>
    setPath((q) => (q && q.d === p.d ? markDone(q, i, Date.now(), true) : q))

  // The words to hear, picked once: those whose meaning has faded most
  const [heard] = useState(() => {
    if (s.k !== 'listen') return []
    const fresh = pick(bank, LISTEN + 4, Date.now(), { link: 'leer' })
      .map((w) => w.id)
      .filter((id) => !got.has(id))
    return [...got, ...fresh].slice(0, LISTEN)
  })

  // No Spanish voice, nothing to listen to
  useEffect(() => {
    if (s.k === 'listen' && (hear === false || heard.length === 0)) skip()
  })

  if (s.k === 'review')
    return (
      <section className="q-part">
        <p className="q-part-intro">
          {s.arg === 'warm'
            ? 'Ingen ord har bleknet ennå. Disse er de svakeste du har:'
            : 'Disse ordene holder du på å glemme. Repeter dem:'}
        </p>
        <Drill ids={s.ids ?? []} got={got} onItem={(id) => add([id])} />
      </section>
    )

  if (s.k === 'new')
    return (
      <section className="q-part">
        <p className="q-part-intro">
          Nye ord fra leksjonen «{lessonOf(s.ids)}»: først ordet, så hva det
          betyr skrevet og sagt.
        </p>
        <Learn ids={s.ids ?? []} got={got} onPart={add} />
      </section>
    )

  if (s.k === 'listen')
    return (
      <section className="q-part">
        <p className="q-part-intro">
          Til slutt med øret: hør ordet, og velg hva det betyr.
        </p>
        <Drill ids={heard} got={got} ear onItem={(id) => add([id])} />
        <div className="mt-4">
          <button type="button" className="q-link" onClick={skip}>
            Hopp over lyttingen
          </button>
        </div>
      </section>
    )

  if (s.k === 'game') {
    const g = GAME[s.arg ?? '']
    return (
      <section className="q-frame q-card q-away fx-rise">
        <GameIcon id={(g?.id ?? 'palabra') as GameIconId} className="icon" />
        <div>
          <div className="q-label">
            Juego <span>· dagens ordspill</span>
          </div>
          <h3>{g?.es}</h3>
          <p>{g?.blurb}.</p>
        </div>
        <div className="acts">
          <a className="q-btn" href={`#${s.arg}`}>
            Spill <ArrowRight />
          </a>
          <button type="button" className="q-link" onClick={skip}>
            Hopp over
          </button>
        </div>
      </section>
    )
  }

  const found = CHAPTER[s.arg ?? '']
  const story = found?.story
  const c = found?.chapter
  return (
    <section className="q-frame q-card q-away fx-rise">
      {story && isTocId(story.id) ? (
        <TocArt id={story.id} className="icon wide" />
      ) : (
        c?.img && <img className="icon wide" src={c.img} alt="" />
      )}
      <div>
        <div className="q-label">
          Lectura{' '}
          <span>
            · {story?.es}
            {c?.from ? `, ${c.from}` : ''}
          </span>
        </div>
        <h3>{c?.title}</h3>
        <p>
          {c?.no}: {inWords(c?.lines.length ?? 0)} linjer
          {story?.listen ? ' å høre' : ''}, så tre spørsmål.
        </p>
      </div>
      <div className="acts">
        <a className="q-btn" href={`#${story?.id ?? ''}/${s.arg}`}>
          {story?.listen ? 'Lytt' : 'Les'} <ArrowRight />
        </a>
        <button type="button" className="q-link" onClick={skip}>
          Hopp over
        </button>
      </div>
    </section>
  )
}

const lessonOf = (ids: Array<string> | undefined) => {
  const w = ids?.map((id) => WORD[id]).find(Boolean)
  return w ? (LESSON_NAME[w.lesson] ?? w.lesson) : ''
}

const LESSON_NAME: Record<string, string | undefined> = Object.fromEntries(
  Object.entries(LESSON).map(([id, l]) => [id, l ? `${l.es} · ${l.no}` : id]),
)

// The day done: the stage walked and its stamp, how much longer the words
// practised will last now, and the counts
function Summary({ p }: { p: Path }) {
  const { bank } = useStore()
  const now = Date.now()
  const sum = summary(p, bank, now)
  const walked = stagesWalked(bank)
  const n = Math.max(1, walked)
  const stage = stageOf(n)
  return (
    <section className="q-frame q-card q-summary fx-rise">
      <div className="stamp">
        <Stamp motif={stage.motif} n={n} className="fx-stamp" />
      </div>
      <div className="q-label">
        ¡Hecho! <span>· ferdig for i dag</span>
      </div>
      <h3>{stage.town}</h3>
      <p className="q-muted">
        Etappe {n} av Caminoen: fra {fromOf(n)} til {stage.town}.
      </p>

      {sum.words.length > 0 && (
        <>
          <h4>Ordene du repeterte</h4>
          <ul className="q-gains">
            {sum.words.map((x) => {
              const w = WORD[x.id]
              if (!w) return null
              return (
                <li key={x.id}>
                  <LinkIcon link={x.link} className="i" />
                  <b>
                    <Es w={w} peek />
                  </b>
                  <span
                    title={`${LINK_NAME[x.link].es}: hvor lenge det sitter`}
                  >
                    {lasts(x.before)} → <strong>{lasts(x.after)}</strong>
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <div className="q-sum-counts">
        <div>
          <b>{sum.met}</b>
          møtt{sum.metGain ? ` (+${sum.metGain})` : ''}
        </div>
        <div>
          <b>{sum.known}</b>
          kjente{sum.knownGain ? ` (+${sum.knownGain})` : ''}
        </div>
        <div>
          <b>{sum.streak}</b>
          {sum.streak === 1 ? 'dag' : 'dager'} på rad
        </div>
      </div>
      <p className="q-muted">
        {sum.tomorrow
          ? `I morgen har ${sum.tomorrow} ord begynt å blekne, og de kommer tilbake i morgendagens økt.`
          : 'Ingen ord blekner før i morgen.'}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <a className="q-btn" href="#credencial">
          Pilegrimspasset <ArrowRight />
        </a>
        <a className="q-btn ghost" href="#">
          Til forsiden
        </a>
        <a className="q-link" href="#repaso">
          Øv litt til
        </a>
      </div>
    </section>
  )
}
