import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { keepsakeOf } from '../data/cajones'
import { LESSON } from '../data/words'
import { THEME } from '../data/themes'
import { RULE, chests, howFar, progressOf, tally } from '../lib/colecciones'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { Speak, useFont } from '../ui'
import { KeepsakeArt, Wrapped } from './cajonesArt'
import type { Chest, LessonProgress } from '../lib/colecciones'
import './cajones.css'

// Los cajones: chests of drawers standing in a desert at dusk, in layered
// paper-cut. A chest for the first lessons and one for each group of
// themes, a drawer for each lesson with its name on a card. A drawer is
// shut while its lesson is untouched; once its words are being met, its
// keepsake (data/cajones.ts) lies in it wrapped in tissue paper; once the
// lesson is finished (lib/colecciones.ts), it is unwrapped. Opening a
// drawer shows the keepsake, says its Spanish and tells how far the lesson
// has come. Nothing to answer and no score: a place to look at.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@500;600;700&family=Cormorant+Garamond:wght@600;700&family=Alegreya+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap'

const STATE = ['stengt', 'pakket inn', 'pakket opp']

interface Slot {
  lesson: string
  chest: number
  row: number
  col: number
  cols: number
  p: LessonProgress
}

const colsOf = (c: Chest) => (c.lessons.length > 8 ? 2 : 1)

export default function Cajones() {
  useFont(FONTS)
  const { bank } = useStore()
  const list = useMemo(() => chests(), [])
  const slots = useMemo<Array<Slot>>(
    () =>
      list.flatMap((c, ci) => {
        const cols = colsOf(c)
        return c.lessons.map((lesson, i) => ({
          lesson,
          chest: ci,
          row: Math.floor(i / cols),
          col: i % cols,
          cols,
          p: progressOf(bank, lesson),
        }))
      }),
    [list, bank],
  )
  const all = tally(
    bank,
    slots.map((s) => s.lesson),
  )
  const [open, setOpen] = useState<string | null>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())

  const show = (lesson: string) => {
    setOpen(lesson)
    const p = progressOf(bank, lesson)
    blip('tap')
    if (p.stage > 0) void say(keepsakeOf(lesson).es)
  }
  const close = () => {
    const was = open
    setOpen(null)
    if (was) buttons.current.get(was)?.focus()
  }

  // Arrow keys move between the drawers: up and down in a chest, left and
  // right across, on to the next chest at either end
  const move = (e: React.KeyboardEvent, i: number) => {
    const s = slots[i]
    let j = -1
    if (e.key === 'ArrowRight') j = i + 1
    else if (e.key === 'ArrowLeft') j = i - 1
    else if (e.key === 'ArrowDown') {
      const k = slots.findIndex(
        (x) => x.chest === s.chest && x.row === s.row + 1 && x.col === s.col,
      )
      j = k >= 0 ? k : slots.findIndex((x) => x.chest === s.chest + 1)
    } else if (e.key === 'ArrowUp') {
      const k = slots.findIndex(
        (x) => x.chest === s.chest && x.row === s.row - 1 && x.col === s.col,
      )
      j = k >= 0 ? k : i - 1
    } else return
    e.preventDefault()
    if (j >= 0 && j < slots.length)
      buttons.current.get(slots[j].lesson)?.focus()
  }

  return (
    <div className="cj">
      <Backdrop />
      <header className="cj-top">
        <a className="cj-round" href="#" aria-label="Tilbake">
          <ArrowLeft />
        </a>
        <h1>
          Los cajones
          <small>Skuffene</small>
        </h1>
        <span className="cj-count" aria-label="Pakket opp">
          <b>{all.done}</b> / {all.all}
        </span>
      </header>
      <p className="cj-intro">
        En skuff for hvert emne, med en liten ting i. Når du begynner på emnet,
        ligger tingen pakket inn i silkepapir. Når emnet er fullført, er papiret
        tatt av. Trykk på en skuff for å åpne den.
      </p>
      <p className="cj-tally">
        {all.begun} av {all.all} skuffer har noe i seg, og {all.done} er pakket
        opp.
      </p>

      <div className="cj-chests">
        {list.map((c, ci) => {
          const cols = colsOf(c)
          return (
            <section
              key={c.id}
              className={`cj-chest ${cols === 2 ? 'wide' : ''}`}
              aria-label={`${c.es} – ${c.no}`}
            >
              <div className="cj-crest">
                <span className="plate">
                  <b>{c.es}</b>
                  <small>{c.no}</small>
                </span>
              </div>
              <div
                className="cj-body"
                style={{ '--cols': cols } as React.CSSProperties}
              >
                {slots
                  .filter((s) => s.chest === ci)
                  .map((s) => {
                    const i = slots.indexOf(s)
                    const l = LESSON[s.lesson]
                    const k = keepsakeOf(s.lesson)
                    return (
                      <button
                        key={s.lesson}
                        type="button"
                        ref={(el) => {
                          if (el) buttons.current.set(s.lesson, el)
                          else buttons.current.delete(s.lesson)
                        }}
                        className={`cj-drawer st${s.p.stage} ${open === s.lesson ? 'out' : ''}`}
                        aria-label={`${l?.es ?? s.lesson}: ${STATE[s.p.stage]}`}
                        onClick={() => show(s.lesson)}
                        onKeyDown={(e) => move(e, i)}
                      >
                        {s.p.stage === 1 && (
                          <i className="tissue" aria-hidden="true" />
                        )}
                        <span className="knob l" aria-hidden="true" />
                        <span className="card">
                          {s.p.stage === 2 && (
                            <KeepsakeArt art={k.art} className="mini" />
                          )}
                          <span className="nm" lang="es">
                            {l?.es ?? s.lesson}
                          </span>
                        </span>
                        <span className="knob r" aria-hidden="true" />
                      </button>
                    )
                  })}
              </div>
              <div className="cj-plinth" aria-hidden="true">
                <i />
                <i />
              </div>
            </section>
          )
        })}
      </div>

      {open && (
        <Opened
          lesson={open}
          onClose={close}
          onGo={(d) => {
            const i = slots.findIndex((s) => s.lesson === open)
            const next = slots[(i + d + slots.length) % slots.length]
            show(next.lesson)
          }}
        />
      )}
    </div>
  )
}

// The drawer pulled out, seen from above
function Opened({
  lesson,
  onClose,
  onGo,
}: {
  lesson: string
  onClose: () => void
  onGo: (d: number) => void
}) {
  const { bank } = useStore()
  const p = progressOf(bank, lesson)
  const l = LESSON[lesson]
  const k = keepsakeOf(lesson)
  const theme = THEME[lesson]
  const shut = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    shut.current?.focus()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onGo(1)
      else if (e.key === 'ArrowLeft') onGo(-1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onGo])

  return (
    <div className="cj-veil" onClick={onClose}>
      <div
        className={`cj-open st${p.stage}`}
        role="dialog"
        aria-modal="true"
        aria-label={l?.es ?? lesson}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cj-box">
          <div className="inside">
            {p.stage === 0 ? (
              <span className="empty">Tom ennå</span>
            ) : (
              <>
                <i className="paper" aria-hidden="true" />
                {p.stage === 2 ? (
                  <KeepsakeArt art={k.art} className="thing" />
                ) : (
                  <Wrapped art={k.art} className="thing" />
                )}
              </>
            )}
          </div>
          <div className="front">
            <span className="card" lang="es">
              {l?.es ?? lesson}
            </span>
          </div>
        </div>

        <div className="cj-text">
          <p className="cj-lesson">
            {l?.es} <span>· {l?.no}</span>
          </p>
          {p.stage > 0 ? (
            <div className="cj-word">
              <b lang="es">{k.es}</b>
              <Speak text={k.es} label={`Hør ${k.es}`} className="cj-say" />
              <em>{k.no}</em>
            </div>
          ) : null}
          <p className="cj-line">
            {p.stage === 2
              ? k.line
              : p.stage === 1
                ? 'Pakket inn i silkepapir. Papiret tas av når emnet er fullført.'
                : 'Skuffen fylles når du møter de første ordene i emnet.'}
          </p>
          <div className="cj-far">
            <span className="bar">
              <i style={{ width: `${Math.round(p.toward * 100)}%` }} />
            </span>
            <p>{howFar(p)}</p>
          </div>
          {p.stage < 2 && <p className="cj-rule">{RULE}</p>}
          <div className="cj-acts">
            {theme ? (
              <a className="cj-btn" href={`#tema/${lesson}`}>
                Til emnet <ArrowRight />
              </a>
            ) : (
              p.met < p.size && (
                <a className="cj-btn" href={`#nuevas/${lesson}`}>
                  Lær fem nye ord <ArrowRight />
                </a>
              )
            )}
            <button
              ref={shut}
              type="button"
              className="cj-btn ghost"
              onClick={onClose}
            >
              Lukk skuffen
            </button>
          </div>
        </div>

        <button
          type="button"
          className="cj-step prev"
          aria-label="Forrige skuff"
          onClick={() => onGo(-1)}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="cj-step next"
          aria-label="Neste skuff"
          onClick={() => onGo(1)}
        >
          <ChevronRight />
        </button>
        <button
          type="button"
          className="cj-x"
          aria-label="Lukk"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
    </div>
  )
}

// The desert at dusk, in layers of cut paper: the sky, the low sun, the
// mountains and the dunes
function Backdrop() {
  return (
    <svg
      className="cj-sky"
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cj-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3f73" />
          <stop offset=".42" stopColor="#8a5f86" />
          <stop offset=".72" stopColor="#e3865a" />
          <stop offset="1" stopColor="#f2b765" />
        </linearGradient>
      </defs>
      <rect width="1200" height="520" fill="url(#cj-dusk)" />
      <g className="cut">
        <path
          d="M140 120q20-22 52-14 18-20 50-8 30-6 40 14 26 2 22 18H128q-14-6 12-10Z"
          fill="#d99a8c"
        />
        <path
          d="M820 80q16-18 44-10 20-16 46-4 28 0 30 16 24 4 16 16H806q-10-8 14-18Z"
          fill="#c98a92"
        />
        <circle cx="930" cy="372" r="64" fill="#f6c25c" />
        <path
          d="M0 380 90 330 170 362 260 300 360 352 450 320 540 368 640 318 760 366 860 336 960 372 1060 326 1200 366V520H0Z"
          fill="#6b5583"
        />
        <path
          d="M0 420 120 386 240 410 380 372 520 414 660 384 800 416 940 390 1080 414 1200 392V520H0Z"
          fill="#8d6a84"
        />
        <path
          d="M0 452Q160 410 330 440T680 432 1010 436 1200 430V520H0Z"
          fill="#d99d62"
        />
        <path
          d="M0 486Q220 452 460 476T900 470 1200 474V520H0Z"
          fill="#e6b678"
        />
      </g>
    </svg>
  )
}
