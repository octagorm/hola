import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { POINTS } from '../data/orden'
import {
  heap,
  hintOf,
  idsOf,
  matchOf,
  outOfPlace,
  round,
  spanishOf,
} from '../lib/orden'
import { tokens } from '../lib/text'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { Speak, useFont, useMedia } from '../ui'
import { Vineta } from './vinetas'
import type { RefObject } from 'react'
import type { Sentence } from '../data/orden'
import './orden.css'

// Orden: a Norwegian sentence, and its Spanish words as tiles in a heap,
// to be set in Spanish order in the caption of a frame of an aleluya, the
// Spanish broadsheet of woodcuts. Tiles out of place go back to the heap,
// and the player tries again; a sentence put right prints its line and
// colours its picture. Eight make a sheet.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap'

// A sentence in order at the first try says that its words were read, a
// little each (leer): they were picked from a heap, with the Norwegian
// beside. Mistakes are not counted against the words, since they are
// about the order.
const WEIGHT = 0.3

// The wrong tiles shake this long before they go back
const SHAKE = 560

// How a sentence was put right, and in which of its right orders
interface Done {
  how: 'first' | 'later' | 'shown'
  line: number
}

export default function Orden() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('orden')
  const [sheet, setSheet] = useState(() => ({ n: 0, sentences: round(bank) }))
  return (
    <div className="or">
      <div className="or-col">
        <Sheet
          key={sheet.n}
          back={back}
          sentences={sheet.sentences}
          onAgain={() =>
            setSheet((s) => ({ n: s.n + 1, sentences: round(bank) }))
          }
        />
      </div>
    </div>
  )
}

function Sheet({
  back,
  sentences,
  onAgain,
}: {
  back: string
  sentences: Array<Sentence>
  onAgain: () => void
}) {
  const { bank, points, setBest, played } = useStore()
  const [before] = useState(() => bank.best.orden ?? 0)
  const [done, setDone] = useState<Array<Done>>([])
  const [at, setAt] = useState(0)
  const over = at >= sentences.length
  const score = done.filter((d) => d.how === 'first').length

  useEffect(() => {
    if (!over) return
    setBest('orden', score)
    if (score) points(score)
    played('orden')
    const t = setTimeout(() => blip('win'), 300)
    return () => clearTimeout(t)
  }, [over])

  return (
    <>
      <header className="or-top">
        <a className="or-round" href={back} aria-label="Tilbake">
          <ArrowLeft />
        </a>
        <h1>
          Orden<small>Ordstilling</small>
        </h1>
        {!over && (
          <div
            className="or-strip"
            role="img"
            aria-label={`${done.length} av ${sentences.length} setninger`}
          >
            {sentences.map((s, i) => (
              <i key={i} className={i === at ? 'at' : ''}>
                {i < done.length && <Vineta pic={s.pic} />}
              </i>
            ))}
          </div>
        )}
      </header>
      {over ? (
        <End
          sentences={sentences}
          done={done}
          score={score}
          before={before}
          onAgain={onAgain}
        />
      ) : (
        <Puzzle
          key={at}
          s={sentences[at]}
          last={at === sentences.length - 1}
          done={done.at(at)}
          onSolve={(d) => setDone((xs) => [...xs, d])}
          onNext={() => setAt(at + 1)}
        />
      )}
    </>
  )
}

function Puzzle({
  s,
  last,
  done,
  onSolve,
  onNext,
}: {
  s: Sentence
  last: boolean
  done: Done | undefined
  onSolve: (d: Done) => void
  onNext: () => void
}) {
  const { bank, record, settings } = useStore()
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const [tiles] = useState(() => heap(s))
  // The tiles by their place in the sentence's own order
  const byK = [...tiles].sort((a, b) => a.k - b.k)
  // Each place of the caption, and the tile set there
  const [slots, setSlots] = useState<Array<number | null>>(() =>
    tiles.map(() => null),
  )
  const [tries, setTries] = useState(0)
  // The places right at the last check, and those shaking to go back
  const [kept, setKept] = useState<Array<number>>([])
  const [shake, setShake] = useState<Array<number>>([])
  const root = useRef<HTMLDivElement>(null)
  const timer = useRef(0)
  useFlip(root)
  useEffect(() => () => clearTimeout(timer.current), [])

  const set = new Set(slots)
  const tray = tiles.filter((t) => !set.has(t.k))
  const full = !set.has(null)
  const busy = shake.length > 0
  const still = !!done || busy

  const marks = tokens(s.line)
  const lead = marks[0].punct ? marks[0].es : ''
  const end = marks[marks.length - 1].punct ? marks[marks.length - 1].es : ''

  const put = (k: number) => {
    const i = slots.indexOf(null)
    if (still || i < 0) return
    blip('tap')
    setSlots(slots.map((x, j) => (j === i ? k : x)))
  }

  const take = (i: number) => {
    if (still) return
    setSlots(slots.map((x, j) => (j === i ? null : x)))
    setKept(kept.filter((j) => j !== i))
  }

  const win = (line: number, how: Done['how']) => {
    if (how !== 'shown') blip('right')
    if (how === 'first')
      for (const id of idsOf(s))
        if (bank.cards[id]) record(id, true, WEIGHT, 'leer')
    if (settings.autoplay) void say(spanishOf(s, line))
    onSolve({ how, line })
  }

  const check = () => {
    if (still || !full) return
    const words = slots.map((k) => (k === null ? '' : byK[k].es))
    const m = matchOf(s, words)
    if (m >= 0) {
      win(m, tries ? 'later' : 'first')
      return
    }
    const wrong = outOfPlace(s, words)
    blip('wrong')
    setTries(tries + 1)
    setKept(slots.flatMap((_, i) => (wrong.includes(i) ? [] : [i])))
    setShake(wrong)
    timer.current = window.setTimeout(() => {
      setSlots((xs) => xs.map((x, i) => (wrong.includes(i) ? null : x)))
      setShake([])
    }, SHAKE)
  }

  // The sentence's own order, for one who is stuck
  const show = () => {
    if (done) return
    // (even while the wrong tiles shake)
    clearTimeout(timer.current)
    setShake([])
    setSlots(byK.map((t) => t.k))
    setKept([])
    win(0, 'shown')
  }

  // Keys: 1–9 the tiles in the heap, Backspace the last tile set, Enter to
  // check, and then on
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const control =
        e.target instanceof Element && !!e.target.closest('button, a, input')
      if (e.key === 'Enter' && !control) {
        e.preventDefault()
        if (done) onNext()
        else check()
      } else if (/^[1-9]$/.test(e.key)) {
        const t = tray.at(Number(e.key) - 1)
        if (t) put(t.k)
      } else if (e.key === 'Backspace') {
        const i = slots.reduce<number>((a, k, j) => (k === null ? a : j), -1)
        if (i >= 0) {
          e.preventDefault()
          take(i)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const said = done ? spanishOf(s, done.line) : ''
  return (
    <div className="or-play" ref={root}>
      <p className="or-no">{s.no}</p>
      <figure className="or-panel">
        <Vineta pic={s.pic} bare={!done} />
        <figcaption className="or-caption">
          {done ? (
            <p className="or-printed" lang="es">
              {said}
            </p>
          ) : (
            <div className="or-slots" lang="es">
              {lead && <span className="or-mark">{lead}</span>}
              {slots.map((k, i) =>
                k === null ? (
                  <span key={`e${i}`} className="or-slot" />
                ) : (
                  <button
                    key={`t${k}`}
                    type="button"
                    data-flip={k}
                    className={`or-tile ${kept.includes(i) ? 'kept' : ''} ${shake.includes(i) ? 'shake' : ''}`}
                    onClick={() => take(i)}
                  >
                    {byK[k].es}
                  </button>
                ),
              )}
              {end && <span className="or-mark">{end}</span>}
            </div>
          )}
        </figcaption>
      </figure>
      {done ? (
        <p className="or-point">
          <Marked text={POINTS[s.point]} />
        </p>
      ) : (
        tries > 0 && (
          <p className="or-point">
            <Marked text={hintOf(s)} />
          </p>
        )
      )}
      {done ? (
        <div className="or-acts">
          <Speak text={said} className="or-speak" label="Hør setningen" />
          <button type="button" className="or-btn" onClick={onNext}>
            {last ? 'Se arket' : 'Neste'} <ArrowRight />
          </button>
        </div>
      ) : (
        <>
          <div className="or-tray" lang="es">
            {tray.map((t, i) => (
              <button
                key={`t${t.k}`}
                type="button"
                data-flip={t.k}
                className="or-tile"
                onClick={() => put(t.k)}
              >
                {fine && i < 9 && <small aria-hidden="true">{i + 1}</small>}
                {t.es}
              </button>
            ))}
          </div>
          <div className="or-acts">
            {tries >= 2 && (
              <button type="button" className="or-link" onClick={show}>
                Vis meg
              </button>
            )}
            <button
              type="button"
              className="or-btn"
              disabled={!full || busy}
              onClick={check}
            >
              Sjekk
            </button>
          </div>
          <p className="or-hint">
            {tries
              ? 'De grønne står riktig; de andre er lagt tilbake.'
              : fine
                ? 'Velg ordene i spansk rekkefølge, med musa eller tallene.'
                : 'Trykk på ordene i spansk rekkefølge.'}
          </p>
        </>
      )}
    </div>
  )
}

function End({
  sentences,
  done,
  score,
  before,
  onAgain,
}: {
  sentences: Array<Sentence>
  done: Array<Done>
  score: number
  before: number
  onAgain: () => void
}) {
  return (
    <section className="or-end">
      <p className="kick">¡Aleluya!</p>
      <h2>
        {score} av {sentences.length} på første forsøk
      </h2>
      {score > before ? (
        <p>Ditt beste ark hittil.</p>
      ) : (
        before > 0 && (
          <p>
            Ditt beste: {before} av {sentences.length}.
          </p>
        )
      )}
      <div className="or-sheet">
        {sentences.map((s, i) => {
          const d = done.at(i)
          const line = spanishOf(s, d?.line)
          return (
            <button
              key={i}
              type="button"
              className={d?.how === 'shown' ? 'shown' : ''}
              onClick={() => void say(line)}
            >
              <Vineta pic={s.pic} />
              <span lang="es">{line}</span>
              {d?.how === 'first' && <Star />}
            </button>
          )
        })}
      </div>
      <div className="or-acts">
        <TodayNext page="orden" className="or-btn" />
        <button type="button" className="or-btn" onClick={onAgain}>
          Et ark til
        </button>
        <a className="or-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// Norwegian with the Spanish between asterisks set apart
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split('*').map((part, i) =>
        i % 2 ? (
          <i key={i} lang="es">
            {part}
          </i>
        ) : (
          part
        ),
      )}
    </>
  )
}

// A printer's star, for a sentence put right at the first try
function Star() {
  return (
    <svg
      className="star"
      viewBox="0 0 20 20"
      role="img"
      aria-label="Første forsøk"
    >
      <path
        d="M10 1.5 12 8l6.5 2-6.5 2-2 6.5L8 12l-6.5-2L8 8Z"
        fill="#b8361f"
        stroke="#221a12"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Tiles glide to where they go: each [data-flip] in the root that has
// moved since the last render is played from where it was
function useFlip(root: RefObject<HTMLElement | null>) {
  const last = useRef(new Map<string, { x: number; y: number }>())
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const base = el.getBoundingClientRect()
    const next = new Map<string, { x: number; y: number }>()
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    for (const item of el.querySelectorAll<HTMLElement>('[data-flip]')) {
      const id = item.dataset.flip ?? ''
      const r = item.getBoundingClientRect()
      // Where the tile stands in the layout, without the glide it may be
      // in the middle of, or each render would start a longer one
      const glide = new DOMMatrixReadOnly(getComputedStyle(item).transform)
      const at = {
        x: r.left - base.left - glide.m41,
        y: r.top - base.top - glide.m42,
      }
      next.set(id, at)
      const was = last.current.get(id)
      if (!was || still) continue
      const dx = was.x - at.x
      const dy = was.y - at.y
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
      item.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 280, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      )
    }
    last.current = next
  })
}
