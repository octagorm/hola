import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Play,
  Square,
  Volume2,
} from 'lucide-react'
import { STORY, subtitle } from '../data/stories'
import { plain } from '../lib/text'
import { saidCount, say, stop, useVoices } from '../lib/speech'
import { aloudFrom, readLine } from '../lib/aloud'
import { UNDERSTOOD, credit } from '../lib/caso'
import { useStore } from '../lib/store'
import { blip } from '../lib/sound'
import { shuffle } from '../lib/choices'
import { TodayNext, useBack } from '../daily'
import { Mixed, MixedKey, Page, roman } from '../ui'
import { Scene, TocArt, hasView, isTocId } from '../art'
import { Accuse, Again, Heard, HeardKey, Libreta, NewClue, Who } from './caso'
import type { Chapter, Story } from '../data/stories'
import type { PageProps } from '../registry'

// A story (data/stories.ts), told simply, a line at a time in mixed text:
// the words met in Spanish, the rest in Norwegian, each a tap from its
// card. After the chapter, three questions on what happened. The words
// read without looking them up are counted as read. Every story's page is
// this one: /#quijote, and a chapter /#quijote/molinos.
//
// A chapter can be read aloud by the narrator, line after line from the
// line at hand (lib/aloud.ts): each line is marked and kept in sight while
// it is said. A word looked up makes the reading wait after its line, and
// anything else said over a line pauses it.
//
// A story told by ear (`listen`: El caso del reloj perdido) is heard
// before it is read: each line is said as it comes, by whoever says it,
// and shows as its sound wave (games/caso.tsx) until its text is asked
// for, or the questions are answered. The words of a line only heard
// count as heard, when the answers show it was understood (lib/caso.ts).
// Its chapters add to the inspector's notebook on the story's page, and
// one may stop to ask who did it.

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
// Quijote's in ink (art.tsx), the others' painted, and until they are, the
// story's drawing from the index as a vignette
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
  if (img) return <img className="q-strip q-pic" src={img} alt="" />
  return isTocId(story.id) ? (
    <TocArt id={story.id} className="q-vignette" />
  ) : null
}

function Chapters({ story }: { story: Story }) {
  const { bank } = useStore()
  const { hear } = useVoices()
  const next = story.chapters.find((c) => bank.read[c.id] === undefined)
  const ear = !!story.listen && hear !== false
  return (
    <Page es={story.es} title={story.no}>
      <div className="q-read">
        <Picture story={story} />
        <p className="q-intro">
          {story.intro} Ordene du ikke har møtt ennå står på norsk, i spansk
          rekkefølge, og blir spanske etter hvert som du lærer dem.
          {ear
            ? ' Hver linje sies høyt før du ser den: trykk på bølgen for å høre den igjen, på sneglen for å høre den sakte, og på øyet for å se teksten.'
            : hear !== false &&
              ' Trykk «Les høyt» i et kapittel, så leser fortelleren det for deg, linje for linje.'}
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
        {story.chapters.some((c) => c.clue) && (
          <Libreta story={story} read={bank.read} />
        )}
      </div>
    </Page>
  )
}

function Reader({ story, c }: { story: Story; c: Chapter }) {
  const { bank, record, setRead, played, levelOf } = useStore()
  const { hear } = useVoices()
  const back = useBack(story.id, c.id)
  const no = story.chapters.indexOf(c) + 1
  // Heard before it is read, while Spanish can be heard here
  const ear = !!story.listen && hear !== false
  const [shown, setShown] = useState(1)
  const [phase, setPhase] = useState<'read' | 'accuse' | 'ask' | 'done'>('read')
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [right, setRight] = useState(0)
  const tapped = useRef(new Set<string>())
  const nowLine = useRef<HTMLParagraphElement>(null)
  // Reading aloud: not, reading, or paused at the line it was on
  const [aloud, setAloud] = useState<'off' | 'on' | 'paused'>('off')
  // A word looked up: reading aloud waits after the line it is on
  const hold = useRef(false)
  // By ear: the lines whose text is shown, or all of them; the lines whose
  // text was seen before the questions were answered; the last line said
  // as it came; the line being said now
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set())
  const [all, setAll] = useState(false)
  const seen = useRef(new Set<number>())
  const said = useRef(0)
  const [talking, setTalking] = useState<number | null>(null)
  const talk = useRef(0)
  // Who did it: the tries it took, once named
  const [tries, setTries] = useState<number | null>(null)
  const asked = useRef<HTMLDivElement>(null)
  // By ear, how many lines were only heard, once the chapter is done
  const [heard, setHeard] = useState(0)

  const options = useMemo(() => c.questions.map((q) => shuffle([...q.a])), [c])

  // The lines read before the question of who did it, until it is answered
  const stopAt = c.accuse && tries === null ? c.accuse.after : c.lines.length

  // Says a line, in its speaker's voice, its wave moving while it is said
  const sayLine = (i: number, slow = false) => {
    const mine = ++talk.current
    setTalking(i)
    return say(plain(c.lines[i]), slow).finally(() => {
      if (talk.current === mine) setTalking(null)
    })
  }

  const next = () => {
    if (phase !== 'read') return
    if (shown < stopAt) setShown(shown + 1)
    else {
      setAloud('off')
      setPhase(shown < c.lines.length ? 'accuse' : 'ask')
    }
  }
  const prev = () => {
    if (phase === 'read' && shown > 1) setShown(shown - 1)
  }

  // From the line at hand, or from the first when the last is reached
  const readAloud = () => {
    hold.current = false
    if (aloud === 'off') setShown(aloudFrom(shown, c.lines.length))
    setAloud('on')
  }

  const toggle = (i: number) =>
    setOpen((o) => {
      const n = new Set(o)
      if (!n.delete(i)) n.add(i)
      return n
    })

  // The line just shown is kept in sight; while read aloud, in the middle,
  // so that the buttons under it are in sight too
  useEffect(() => {
    nowLine.current?.scrollIntoView({
      block: aloud === 'on' ? 'center' : 'nearest',
      behavior: 'smooth',
    })
  }, [shown, aloud])

  useEffect(() => {
    if (phase === 'accuse')
      asked.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [phase])

  // Read aloud: the line at hand, a pause, then the next, to the last
  useEffect(() => {
    if (aloud !== 'on' || phase !== 'read') return
    said.current = Math.max(said.current, shown)
    const reading = readLine(plain(c.lines[shown - 1]), {
      say: () => sayLine(shown - 1),
      count: saidCount,
      stop,
    })
    void reading.done.then((end) => {
      if (end === 'cancelled') return
      if (end === 'cut' || hold.current) {
        hold.current = false
        setAloud('paused')
      } else if (shown < stopAt) setShown(shown + 1)
      else setAloud('off')
    })
    return reading.cancel
  }, [aloud, shown, phase, c, stopAt])

  // By ear, each line is said as it first comes
  useEffect(() => {
    if (!ear || aloud !== 'off' || phase !== 'read') return
    if (said.current >= shown) return
    said.current = shown
    void sayLine(shown - 1)
  }, [ear, aloud, phase, shown])

  // By ear, the lines whose text has been seen
  useEffect(() => {
    if (!ear || phase === 'done') return
    const upto = phase === 'ask' ? c.lines.length : shown
    for (let i = 0; i < upto; i++) if (all || open.has(i)) seen.current.add(i)
  }, [ear, phase, shown, all, open, c])

  const finish = (score: number) => {
    setPhase('done')
    setRead(c.id, score)
    // Words read in Spanish without being looked up: read, a little; and
    // by ear, words only heard: heard, if the answers show it
    for (const { id, link } of credit(
      c.lines,
      ear ? seen.current : null,
      tapped.current,
      score,
      (w) => levelOf(w) > 0,
    ))
      record(id, true, 0.3, link)
    setHeard(ear ? c.lines.length - seen.current.size : 0)
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
  const reading = phase === 'read' || phase === 'accuse'

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
            onClick={() => void sayLine(shown - 1)}
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
          {c.lines.slice(0, reading ? shown : c.lines.length).map((l, i) => {
            const text = !ear || phase === 'done' || all || open.has(i)
            const mixed = (
              <Mixed
                line={l}
                onPeek={(id) => {
                  tapped.current.add(id)
                  hold.current = true
                }}
              />
            )
            return (
              <p
                key={i}
                ref={phase === 'read' && i === shown - 1 ? nowLine : undefined}
                className={
                  phase !== 'read' || i !== shown - 1
                    ? ''
                    : aloud === 'on'
                      ? 'now aloud'
                      : 'now'
                }
              >
                <Who name={c.who?.[i]} />
                {!ear ? (
                  mixed
                ) : text ? (
                  <span className="cs-said">
                    {mixed}
                    <Again
                      talking={talking === i}
                      onSay={(slow) => void sayLine(i, slow)}
                      onHide={
                        phase === 'done' || all ? undefined : () => toggle(i)
                      }
                    />
                  </span>
                ) : (
                  <Heard
                    text={plain(l)}
                    talking={talking === i}
                    onSay={(slow) => void sayLine(i, slow)}
                    onOpen={() => toggle(i)}
                  />
                )}
              </p>
            )
          })}
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
                  shown < stopAt
                    ? 'Neste linje'
                    : shown < c.lines.length
                      ? 'Til inspektørens spørsmål'
                      : 'Til spørsmålene'
                }
                onClick={next}
              >
                <ChevronRight />
              </button>
            </nav>
            {hear !== false && (
              <div className="q-aloud">
                {aloud === 'on' ? (
                  <button
                    type="button"
                    className="q-btn ghost small"
                    onClick={() => setAloud('paused')}
                  >
                    <Pause aria-hidden="true" /> Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    className="q-btn small"
                    onClick={readAloud}
                  >
                    <Play aria-hidden="true" />{' '}
                    {aloud === 'paused'
                      ? 'Fortsett'
                      : ear
                        ? 'Spill av'
                        : 'Les høyt'}
                  </button>
                )}
                {aloud !== 'off' && (
                  <button
                    type="button"
                    className="q-btn ghost small"
                    onClick={() => setAloud('off')}
                  >
                    <Square aria-hidden="true" /> Stopp
                  </button>
                )}
                {ear && (
                  <button
                    type="button"
                    className="q-btn ghost small"
                    aria-pressed={all}
                    onClick={() => setAll(!all)}
                  >
                    {all ? (
                      <>
                        <EyeOff aria-hidden="true" /> Skjul teksten
                      </>
                    ) : (
                      <>
                        <Eye aria-hidden="true" /> Vis teksten
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            {ear && <HeardKey />}
            {(!ear || all || open.size > 0) && <MixedKey />}
          </>
        )}

        {phase === 'accuse' && c.accuse && (
          <div ref={asked}>
            <Accuse
              a={c.accuse}
              story={story}
              read={bank.read}
              onSolved={(n) => {
                setTries(n)
                setShown(c.accuse!.after + 1)
                setPhase('read')
              }}
            />
          </div>
        )}

        {phase === 'ask' && (
          <section className="q-frame q-card q-ask fx-rise" key={qi}>
            <div className="q-label">
              Pregunta {qi + 1} <span>· av {c.questions.length}</span>
            </div>
            <h3>{c.questions[qi].q}</h3>
            {ear && qi === 0 && (
              <p className="q-muted -mt-2 mb-3">
                Du kan høre linjene over igjen, eller se teksten, før du svarer.
              </p>
            )}
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
              {tries !== null &&
                `Du fant ut hvem det var ${tries === 1 ? 'på første forsøk' : `på ${tries}. forsøk`}. `}
              {heard === 0
                ? 'Ordene du leste på spansk uten å slå dem opp, er regnet som lest.'
                : right < UNDERSTOOD
                  ? 'Med to riktige svar eller flere er ordene i linjene du bare hørte, regnet som hørt.'
                  : heard === c.lines.length
                    ? 'Du hørte hele kapittelet uten å se teksten: ordene i det er regnet som hørt.'
                    : 'Ordene i linjene du bare hørte, er regnet som hørt, og de du leste på spansk uten å slå dem opp, som lest.'}
            </p>
            {c.clue && <NewClue clue={c.clue} />}
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
                {c.clue ? 'Notatboka og alle kapitlene' : 'Alle kapitlene'}
              </a>
            </div>
          </section>
        )}
      </div>
    </Page>
  )
}
