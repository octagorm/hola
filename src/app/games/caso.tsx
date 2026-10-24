import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Snail, Volume2 } from 'lucide-react'
import { notes, wave } from '../lib/caso'
import { blip } from '../lib/sound'
import { roman, useFont } from '../ui'
import { PICTURES } from '../data/pictures'
import { FACES, castPicture } from '../data/casoLayout'
import type { ReactNode } from 'react'
import type { Face } from '../data/casoLayout'
import type { Accusation, Story } from '../data/stories'
import './caso.css'

// The parts of the reader (games/story.tsx) for a story told by ear, El
// caso del reloj perdido: who says a line, painted beside it; a line heard
// and not yet read, drawn as its sound wave on a ruled line; the
// inspector's notebook, with a clue for each chapter read; and the question
// of who did it.

// The inspector's hand
const FONTS =
  'https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap'

// Who says a line, over it
export function Who({ name }: { name?: string }) {
  return name ? <span className="cs-who">{name}</span> : null
}

// Whether a speaker is painted (scripts/pictures.mjs, from
// data/caso-prompts.ts): all four faces of their sheet. Until they are,
// their lines look as they always have.
export const painted = (who?: string): who is string =>
  !!who && FACES.every((f) => PICTURES.has(`${castPicture(who)}-${f}`))

// A line with its speaker's bust beside it, in an arched window: their
// face once the line is said, the mouth moving while it is said (the
// speaking face over the waiting one every other moment), and breathing
// while it is the line at hand. Every face is there from the start, so
// that none waits to load when it is wanted.
export function Speaker({
  who,
  face = 'wait',
  talking,
  live,
  children,
}: {
  who: string
  face?: Face
  talking: boolean
  live: boolean
  children: ReactNode
}) {
  const shown = talking ? 'wait' : face
  return (
    <>
      <span className="cs-window" aria-hidden="true">
        <span
          className={`cs-bust ${shown} ${talking ? 'talking' : ''} ${live ? 'live' : ''}`}
        >
          {FACES.map((f) => (
            <img
              key={f}
              className={f}
              src={`/${castPicture(who)}-${f}.webp`}
              alt=""
              decoding="async"
            />
          ))}
        </span>
      </span>
      <span className="cs-line">{children}</span>
    </>
  )
}

// A line as heard, its text not shown: its wave, which says it again
// when tapped, the snail that says it slowly, and the eye that shows it
export function Heard({
  text,
  talking,
  onSay,
  onOpen,
}: {
  text: string
  talking: boolean
  onSay: (slow: boolean) => void
  onOpen: () => void
}) {
  const bars = useMemo(() => wave(text), [text])
  const width = bars.length * 6
  return (
    <span className="cs-heard">
      <button
        type="button"
        className={`cs-wave ${talking ? 'on' : ''}`}
        aria-label="Hør linjen igjen"
        onClick={() => onSay(false)}
      >
        <Volume2 aria-hidden="true" />
        <svg
          className="bars"
          viewBox={`0 0 ${width} 32`}
          preserveAspectRatio="none"
          style={{ width }}
          aria-hidden="true"
        >
          {bars.map((h, i) => (
            <rect
              key={i}
              x={i * 6 + 1.5}
              y={16 - h * 14}
              width="3"
              height={h * 28}
              rx="1.5"
              style={{ animationDelay: `${(i % 7) * -0.09}s` }}
            />
          ))}
        </svg>
      </button>
      <button
        type="button"
        className="q-round small"
        aria-label="Hør linjen sakte"
        onClick={() => onSay(true)}
      >
        <Snail />
      </button>
      <button
        type="button"
        className="q-round small"
        aria-label="Vis teksten"
        onClick={onOpen}
      >
        <Eye />
      </button>
    </span>
  )
}

// After a line heard whose text is shown: say it again, slowly, or hide
// the text again (none to hide once it is shown for good)
export function Again({
  talking,
  onSay,
  onHide,
}: {
  talking: boolean
  onSay: (slow: boolean) => void
  onHide?: () => void
}) {
  return (
    <span className="cs-again">
      <button
        type="button"
        className={`q-round small ${talking ? 'dark' : ''}`}
        aria-label="Hør linjen igjen"
        onClick={() => onSay(false)}
      >
        <Volume2 />
      </button>
      <button
        type="button"
        className="q-round small"
        aria-label="Hør linjen sakte"
        onClick={() => onSay(true)}
      >
        <Snail />
      </button>
      {onHide && (
        <button
          type="button"
          className="q-round small"
          aria-label="Skjul teksten"
          onClick={onHide}
        >
          <EyeOff />
        </button>
      )}
    </span>
  )
}

// What the three buttons of a line heard do
export function HeardKey() {
  return (
    <div className="mx-key cs-key">
      <span>
        <Volume2 aria-hidden="true" /> hør igjen
      </span>
      <span>
        <Snail aria-hidden="true" /> sakte
      </span>
      <span>
        <Eye aria-hidden="true" /> vis teksten
      </span>
    </div>
  )
}

// The inspector's notebook: a clue for each chapter read, and a blank line
// for each still to come. `mark` is the chapter a hint points back to.
export function Libreta({
  story,
  read,
  mark,
}: {
  story: Story
  read: Readonly<Record<string, number | undefined>>
  mark?: number
}) {
  useFont(FONTS)
  const pages = notes(story, read)
  const solved = pages.length > 0 && pages.every((p) => p.clue)
  return (
    <section className="cs-libreta" aria-label="Inspektørens notatbok">
      <header>
        <b>La libreta</b>
        <small>inspektørens notatbok</small>
        {pages.every((p) => !p.clue) && (
          <p>
            Det vitnene røper, skriver inspektøren inn her etter hvert kapittel.
          </p>
        )}
      </header>
      <ol>
        {pages.map((p) => (
          <li
            key={p.id}
            className={`${p.clue ? '' : 'blank'} ${p.n === mark ? 'mark' : ''}`}
          >
            <i>{roman(p.n)}</i>
            <span>{p.clue ?? ''}</span>
          </li>
        ))}
      </ol>
      {solved && <div className="cs-stamp">Caso cerrado</div>}
    </section>
  )
}

// A clue just written in, under a chapter read
export function NewClue({ clue }: { clue: string }) {
  useFont(FONTS)
  return (
    <div className="cs-newclue">
      <span className="q-label">I notatboka</span>
      <p>{clue}</p>
    </div>
  )
}

// Who did it: the suspects, one of them picked. A wrong one is struck out,
// with a hint at the chapter that rules them out, and another try; the
// right one lets the chapter go on, to the inspector's explanation.
export function Accuse({
  a,
  story,
  read,
  onSolved,
}: {
  a: Accusation
  story: Story
  read: Readonly<Record<string, number | undefined>>
  onSolved: (tries: number) => void
}) {
  const [wrong, setWrong] = useState<Array<string>>([])
  const [right, setRight] = useState(false)
  const last = a.suspects.find((s) => s.name === wrong.at(-1))

  const pick = (name: string) => {
    if (right || wrong.includes(name)) return
    if (name === a.culprit) {
      blip('right')
      setRight(true)
    } else {
      blip('wrong')
      setWrong((w) => [...w, name])
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const n = Number(e.key)
      if (!right && n >= 1 && n <= a.suspects.length)
        pick(a.suspects[n - 1].name)
      else if (right && e.key === 'Enter') {
        e.preventDefault()
        onSolved(wrong.length + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <section className="q-frame q-card cs-accuse fx-rise">
      <div className="q-label">
        ¿Quién fue? <span>· inspektøren spør deg</span>
      </div>
      <h3>{a.q}</h3>
      <p className="q-muted">
        Se i notatboka under, og pek ut den du tror det var.
      </p>
      <div className="q-choices cs-suspects">
        {a.suspects.map((s, i) => {
          const state = wrong.includes(s.name)
            ? 'wrong'
            : right && s.name === a.culprit
              ? 'right'
              : ''
          return (
            <button
              key={s.name}
              type="button"
              className={`q-choice ${state}`}
              disabled={right || !!state}
              onClick={() => pick(s.name)}
            >
              <kbd>{i + 1}</kbd>
              <span>
                <b>{s.name}</b>
                <small>{s.no}</small>
              </span>
            </button>
          )
        })}
      </div>
      {right ? (
        <div className="cs-verdict fx-rise">
          <p>
            <b>Ja, det var {a.culprit}.</b> Hør hvordan inspektøren fant det ut,
            og hvorfor.
          </p>
          <button
            type="button"
            className="q-btn"
            onClick={() => onSolved(wrong.length + 1)}
          >
            Hør forklaringen <ArrowRight />
          </button>
        </div>
      ) : (
        last?.hint && (
          <div className="cs-hint fx-rise" key={last.name}>
            <b>Ikke {last.name}.</b> {last.hint}
            {last.from && ` Se kapittel ${roman(last.from)} i notatboka.`} Prøv
            igjen.
          </div>
        )
      )}
      <Libreta
        story={story}
        read={read}
        mark={right ? undefined : last?.from}
      />
    </section>
  )
}
