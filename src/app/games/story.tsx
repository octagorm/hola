import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from 'lucide-react'
import { STORY, subtitle } from '../data/stories'
import { plain, wordIds } from '../lib/text'
import { say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { blip } from '../lib/sound'
import { shuffle } from '../lib/choices'
import { TodayNext, useBack } from '../daily'
import { Mixed, MixedKey, Page, roman } from '../ui'
import { Scene, hasView } from '../art'
import type { Chapter, Story } from '../data/stories'
import type { PageProps } from '../registry'

// A story (data/stories.ts), told simply, a line at a time in mixed text:
// the words met in Spanish, the rest in Norwegian, each a tap from its
// card. After the chapter, three questions on what happened. The words
// read without looking them up are counted as read. Every story's page is
// this one: /#quijote, and a chapter /#quijote/molinos.

export default function StoryPage({ id, arg }: PageProps) {
  const story = STORY[id]
  if (!story) return null
  const chapter = story.chapters.find((c) => c.id === arg)
  return chapter ? (
    <Reader key={chapter.id} story={story} c={chapter} />
  ) : (
    <Chapters story={story} />
  )
}

// The picture above a chapter, or above the story's chapters: Don
// Quijote's in ink (art.tsx), the others' painted
function Picture({ story, c }: { story: Story; c?: Chapter }) {
  if (story.id === 'quijote')
    return (
      <Scene
        view={c && hasView(c.id) ? c.id : 'narrow'}
        className="q-strip"
        whole
      />
    )
  const img = c?.img ?? story.chapters[0]?.img
  return img ? <img className="q-strip q-pic" src={img} alt="" /> : null
}

function Chapters({ story }: { story: Story }) {
  const { bank } = useStore()
  const next = story.chapters.find((c) => bank.read[c.id] === undefined)
  return (
    <Page es={story.es} title={story.no}>
      <div className="q-read">
        <Picture story={story} />
        <p className="q-intro">
          {story.intro} Ordene du ikke har møtt ennå står på norsk, i spansk
          rekkefølge, og blir spanske etter hvert som du lærer dem.
        </p>
        <ol className="q-chapters">
          {story.chapters.map((c, i) => {
            const read = bank.read[c.id]
            return (
              <li key={c.id} className={c === next ? 'next' : ''}>
                <a href={`#${story.id}/${c.id}`}>
                  <i>{roman(i + 1)}.</i>
                  <span>
                    <b>{c.title}</b>
                    <small>{subtitle(story, c)}</small>
                  </span>
                  <em>
                    {read === undefined ? (
                      c === next ? (
                        'neste'
                      ) : (
                        'ulest'
                      )
                    ) : (
                      <>
                        <Check aria-hidden="true" /> {read} / 3
                      </>
                    )}
                  </em>
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </Page>
  )
}

function Reader({ story, c }: { story: Story; c: Chapter }) {
  const { record, setRead, played, levelOf } = useStore()
  const { hear } = useVoices()
  const back = useBack(story.id, c.id)
  const no = story.chapters.indexOf(c) + 1
  const [shown, setShown] = useState(1)
  const [phase, setPhase] = useState<'read' | 'ask' | 'done'>('read')
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [right, setRight] = useState(0)
  const tapped = useRef(new Set<string>())
  const nowLine = useRef<HTMLParagraphElement>(null)

  const options = useMemo(() => c.questions.map((q) => shuffle([...q.a])), [c])

  const line = c.lines[shown - 1]
  const next = () => {
    if (phase !== 'read') return
    if (shown < c.lines.length) setShown(shown + 1)
    else setPhase('ask')
  }
  const prev = () => {
    if (phase === 'read' && shown > 1) setShown(shown - 1)
  }

  // The line just shown is kept in sight
  useEffect(() => {
    nowLine.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [shown])

  const finish = (score: number) => {
    setPhase('done')
    setRead(c.id, score)
    // Words read in Spanish without being looked up: read, a little
    const ids = new Set(c.lines.flatMap(wordIds))
    for (const id of ids)
      if (!tapped.current.has(id) && levelOf(id) > 0)
        record(id, true, 0.3, 'leer')
    played(c.id)
    blip('win')
  }

  const answer = (o: string) => {
    if (picked) return
    const ok = o === c.questions[qi].a[0]
    blip(ok ? 'right' : 'wrong')
    setPicked(o)
    if (ok) setRight((r) => r + 1)
  }

  const nextQuestion = () => {
    const score = right
    setPicked(null)
    if (qi + 1 < c.questions.length) setQi(qi + 1)
    else finish(score)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if ((e.target as HTMLElement | null)?.closest('input, textarea')) return
      if (phase === 'read') {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
          if (
            (e.target as HTMLElement | null)?.closest('[data-peek], button, a')
          )
            return
          e.preventDefault()
          next()
        }
        if (e.key === 'ArrowLeft') prev()
      } else if (phase === 'ask') {
        if (!picked && /^[1-3]$/.test(e.key))
          answer(options[qi][Number(e.key) - 1])
        else if (picked && e.key === 'Enter') {
          e.preventDefault()
          nextQuestion()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const nextChapter = story.chapters.at(no)

  return (
    <Page
      es={story.es}
      title={subtitle(story, c)}
      back={back === '#' ? `#${story.id}` : back}
      tools={
        hear !== false && phase === 'read' ? (
          <button
            type="button"
            className="q-round"
            aria-label="Les linjen høyt"
            onClick={() => void say(plain(line))}
          >
            <Volume2 />
          </button>
        ) : undefined
      }
    >
      <div className="q-read">
        <Picture story={story} c={c} />
        <div className="q-chap">
          <b>Capítulo {roman(no)}</b>
          <h2>{c.title}</h2>
        </div>

        <div className="q-text">
          {c.lines
            .slice(0, phase === 'read' ? shown : c.lines.length)
            .map((l, i) => (
              <p
                key={i}
                ref={phase === 'read' && i === shown - 1 ? nowLine : undefined}
                className={phase === 'read' && i === shown - 1 ? 'now' : ''}
              >
                <Mixed line={l} onPeek={(id) => tapped.current.add(id)} />
              </p>
            ))}
        </div>

        {phase === 'read' && (
          <>
            <nav className="q-readnav">
              <button
                type="button"
                className="prev"
                aria-label="Forrige linje"
                disabled={shown <= 1}
                onClick={prev}
              >
                <ChevronLeft />
              </button>
              <div className="dots">
                <span>
                  {c.lines.map((_, i) => (
                    <i
                      key={i}
                      className={
                        i < shown - 1 ? 'on' : i === shown - 1 ? 'at' : ''
                      }
                    />
                  ))}
                </span>
                linje {shown} av {c.lines.length} · så tre spørsmål
              </div>
              <button
                type="button"
                className="next"
                aria-label={
                  shown < c.lines.length ? 'Neste linje' : 'Til spørsmålene'
                }
                onClick={next}
              >
                <ChevronRight />
              </button>
            </nav>
            <MixedKey />
          </>
        )}

        {phase === 'ask' && (
          <section className="q-frame q-card q-ask fx-rise" key={qi}>
            <div className="q-label">
              Pregunta {qi + 1} <span>· av {c.questions.length}</span>
            </div>
            <h3>{c.questions[qi].q}</h3>
            <div className="q-choices one">
              {options[qi].map((o, i) => {
                const state = !picked
                  ? ''
                  : o === c.questions[qi].a[0]
                    ? 'right'
                    : o === picked
                      ? 'wrong'
                      : ''
                return (
                  <button
                    key={o}
                    type="button"
                    className={`q-choice ${state}`}
                    disabled={!!picked}
                    onClick={() => answer(o)}
                  >
                    <kbd>{i + 1}</kbd>
                    <span>{o}</span>
                  </button>
                )
              })}
            </div>
            {picked && (
              <div className="mt-4">
                <button type="button" className="q-btn" onClick={nextQuestion}>
                  {qi + 1 < c.questions.length ? 'Neste spørsmål' : 'Ferdig'}{' '}
                  <ArrowRight />
                </button>
              </div>
            )}
          </section>
        )}

        {phase === 'done' && (
          <section className="q-frame q-card fx-rise">
            <div className="q-label">
              Fin del capítulo <span>· kapittelet er lest</span>
            </div>
            <h3 className="q-display mt-1 text-[34px] leading-none">
              {right} av {c.questions.length} riktige
            </h3>
            <p className="q-muted mt-2">
              Ordene du leste på spansk uten å slå dem opp, er regnet som lest.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <TodayNext page={story.id} arg={c.id} />
              {nextChapter && (
                <a
                  className="q-btn ghost"
                  href={`#${story.id}/${nextChapter.id}`}
                >
                  Neste kapittel: {nextChapter.title}
                </a>
              )}
              <a className="q-link" href={`#${story.id}`}>
                Alle kapitlene
              </a>
            </div>
          </section>
        )}
      </div>
    </Page>
  )
}
