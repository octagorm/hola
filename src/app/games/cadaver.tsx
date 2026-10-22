import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Volume2 } from 'lucide-react'
import { WORD } from '../data/words'
import {
  adjectiveForm,
  adjectiveOptions,
  draw,
  norwegian,
  spanish,
  thingPhrase,
  verbForm,
  verbOptions,
  whyAdjective,
  whyVerb,
} from '../lib/cadaver'
import { blip } from '../lib/sound'
import { say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { useFont } from '../ui'
import type { Sentence } from '../lib/cadaver'
import './cadaver.css'

// Cadáver exquisito: the surrealists' game of a sentence written in folds,
// each part added without seeing the rest. The parts are drawn at random
// (from a deck of sentences made so, lib/cadaver.ts), and the player makes
// them agree: the verb with whoever does it, the adjective with the thing.
// Six sentences a round, in the colours of a 1969 poster.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Shrikhand&family=Rubik:wght@400;500;700;800&display=swap'

const ROUND = 6

type Part = 'verb' | 'adj'

interface Turn {
  s: Sentence
  verbs: Array<string>
  adjs: Array<string>
  // The forms picked wrong, of each part
  no: Record<Part, Array<string>>
  // The parts got right
  got: Array<Part>
}

// A sentence not yet had this round
const turn = (had: Array<Sentence> = []): Turn => {
  const s = draw(Math.random, had)
  return {
    s,
    verbs: verbOptions(s),
    adjs: adjectiveOptions(s),
    no: { verb: [], adj: [] },
    got: [],
  }
}

// The colours of the picture, a different set each sentence
const PALETTES = [
  {
    bg: '#ff4f8b',
    dots: '#ff86ae',
    table: '#2b59ff',
    line: '#5f82ff',
    sun: '#ffd23f',
  },
  {
    bg: '#2b59ff',
    dots: '#5f82ff',
    table: '#ff4f8b',
    line: '#ff86ae',
    sun: '#ffd23f',
  },
  {
    bg: '#19a974',
    dots: '#4cc79a',
    table: '#ffd23f',
    line: '#ffe27a',
    sun: '#ff4f8b',
  },
  {
    bg: '#ffd23f',
    dots: '#ffe27a',
    table: '#19a974',
    line: '#4cc79a',
    sun: '#ff4f8b',
  },
]

export default function Cadaver() {
  useFont(FONTS)
  const { record, points, played, setBest, levelOf, settings } = useStore()
  const { hear } = useVoices()
  const back = useBack('cadaver')
  const [t, setT] = useState<Turn>(() => turn())
  const [done, setDone] = useState<Array<{ s: Sentence; clean: boolean }>>([])
  const [streak, setStreak] = useState(0)
  const [best, setBestHere] = useState(0)
  const [over, setOver] = useState(false)

  const part: Part | null = !t.got.includes('verb')
    ? 'verb'
    : !t.got.includes('adj')
      ? 'adj'
      : null
  const finished = part === null
  const clean = !t.no.verb.length && !t.no.adj.length
  const n = done.length + 1

  // A sentence made: said aloud, and its words that are in the bank read
  const made = (s: Sentence) => {
    if (settings.autoplay) void say(spanish(s))
    const ids = [
      `${s.thing.g === 'm' ? 'el' : 'la'} ${s.thing.es}`,
      s.verb.inf,
      s.adjective.es,
    ]
    for (const id of ids)
      if (WORD[id] && levelOf(id) > 0) record(id, true, 0.3, 'leer')
  }

  const pick = (p: Part, form: string) => {
    if (part !== p || t.no[p].includes(form)) return
    const right = p === 'verb' ? verbForm(t.s) : adjectiveForm(t.s)
    if (form === right) {
      blip('right')
      const got = [...t.got, p]
      setT({ ...t, got })
      if (got.length === 2) made(t.s)
    } else {
      blip('wrong')
      setStreak(0)
      setT({ ...t, no: { ...t.no, [p]: [...t.no[p], form] } })
    }
  }

  const next = () => {
    if (!finished) return
    const all = [...done, { s: t.s, clean }]
    const run = clean ? streak + 1 : 0
    setStreak(run)
    setBestHere(Math.max(best, run))
    setDone(all)
    if (all.length >= ROUND) {
      const score = all.filter((x) => x.clean).length
      setOver(true)
      setBest('cadaver', Math.max(best, run))
      if (score) points(score)
      played('cadaver')
      setTimeout(() => blip('win'), 200)
      return
    }
    setT(turn(all.map((x) => x.s)))
  }

  const again = () => {
    setDone([])
    setStreak(0)
    setBestHere(0)
    setOver(false)
    setT(turn())
  }

  // 1–4 pick a form, Enter goes on
  useEffect(() => {
    if (over) return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if ((e.target as HTMLElement | null)?.closest('input, textarea')) return
      if (part && /^[1-4]$/.test(e.key)) {
        const opts = part === 'verb' ? t.verbs : t.adjs
        const o = opts.at(Number(e.key) - 1)
        if (o) pick(part, o)
      } else if (finished && e.key === 'Enter') {
        if ((e.target as HTMLElement | null)?.closest('button, a')) return
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const shown = clean ? streak + (finished ? 1 : 0) : 0
  const opts = part === 'verb' ? t.verbs : part === 'adj' ? t.adjs : []
  const wrong = part ? t.no[part].at(-1) : undefined

  return (
    <div className="c6">
      <div className="c6-col">
        <header className="c6-top">
          <a className="c6-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            Cadáver exquisito<small>Få ordene til å stemme</small>
          </h1>
          <span className="c6-streak" aria-label={`${shown} på rad uten feil`}>
            <Flower />
            {over ? best : shown}
          </span>
        </header>

        {over ? (
          <End done={done} best={best} onAgain={again} />
        ) : (
          <div className="c6-play">
            <div className="c6-left">
              <Picture n={done.length} />
              <p className="c6-count">
                Setning {n} av {ROUND}
              </p>
            </div>
            <div className="c6-right">
              <div className="c6-folds">
                <div className="c6-fold f1">
                  <i>Subjekt</i>
                  <b lang="es">{t.s.subject.es}</b>
                </div>
                <div
                  className={`c6-fold f2 ${t.got.includes('verb') ? '' : part === 'verb' ? 'now' : 'open'}`}
                >
                  <i>Verb</i>
                  <b lang="es">
                    {t.got.includes('verb') ? verbForm(t.s) : '¿…?'}
                  </b>
                  {t.got.includes('verb') && <Ok />}
                </div>
                <div className="c6-fold f3">
                  <i>Objekt</i>
                  <b lang="es">{thingPhrase(t.s)}</b>
                </div>
                <div
                  className={`c6-fold f4 ${t.got.includes('adj') ? '' : part === 'adj' ? 'now' : 'open'}`}
                >
                  <i>Adjektiv</i>
                  <b lang="es">
                    {t.got.includes('adj') ? adjectiveForm(t.s) : '¿…?'}
                  </b>
                  {t.got.includes('adj') && <Ok />}
                </div>
              </div>

              {finished ? (
                <>
                  <div className="c6-gloss">
                    {hear !== false && (
                      <button
                        type="button"
                        className="c6-round small"
                        aria-label="Hør setningen"
                        onClick={() => void say(spanish(t.s))}
                      >
                        <Volume2 />
                      </button>
                    )}
                    <em>{norwegian(t.s)}</em>
                  </div>
                  <div className="c6-next">
                    <button type="button" className="c6-btn" onClick={next}>
                      {n < ROUND ? 'Neste setning' : 'Ferdig'} <ArrowRight />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`c6-hint ${wrong ? 'no' : ''}`}
                    aria-live="polite"
                  >
                    <Bang />
                    <span>
                      {wrong
                        ? `Ikke ${wrong}. ${part === 'verb' ? whyVerb(t.s) : whyAdjective(t.s)}`
                        : part === 'verb'
                          ? `Velg formen av ${t.s.verb.inf} (${t.s.verb.no}) som passer til ${t.s.subject.es}.`
                          : `Velg formen av ${t.s.adjective.es} (${t.s.adjective.no[0]}) som passer til ${thingPhrase(t.s)}.`}
                    </span>
                  </div>
                  <div className={`c6-opts ${opts.length === 2 ? 'two' : ''}`}>
                    {opts.map((o, i) => (
                      <button
                        key={o}
                        type="button"
                        className={t.no[part].includes(o) ? 'no' : ''}
                        disabled={t.no[part].includes(o)}
                        onClick={() => pick(part, o)}
                      >
                        <kbd>{i + 1}</kbd>
                        {o}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function End({
  done,
  best,
  onAgain,
}: {
  done: Array<{ s: Sentence; clean: boolean }>
  best: number
  onAgain: () => void
}) {
  const { hear } = useVoices()
  const score = done.filter((x) => x.clean).length
  return (
    <section className="c6-card">
      <p className="kick">
        {score === done.length ? '¡Perfecto!' : '¡Qué cadáver!'}
      </p>
      <h2>
        {score} av {done.length} uten feil
      </h2>
      <p className="sub">
        {best > 1
          ? `${best} på rad på det beste.`
          : 'Seks setninger som aldri har vært sagt før.'}
      </p>
      <ol>
        {done.map(({ s, clean }, i) => (
          <li key={i} className={clean ? '' : 'miss'}>
            <span>
              <b lang="es">{spanish(s)}</b>
              <em>{norwegian(s)}</em>
            </span>
            {hear !== false && (
              <button
                type="button"
                className="c6-round small"
                aria-label="Hør setningen"
                onClick={() => void say(spanish(s))}
              >
                <Volume2 />
              </button>
            )}
          </li>
        ))}
      </ol>
      <div className="acts">
        <TodayNext page="cadaver" className="c6-btn" />
        <button type="button" className="c6-btn ghost" onClick={onAgain}>
          Seks til
        </button>
        <a className="c6-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

function Ok() {
  return (
    <span className="ok">
      <Check aria-label="riktig" />
    </span>
  )
}

function Flower() {
  return (
    <svg viewBox="-60 -60 120 120" aria-hidden="true">
      <g fill="#fff" stroke="#1a1a1a" strokeWidth="7">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse
            key={r}
            cy="-30"
            rx="15"
            ry="25"
            transform={`rotate(${r})`}
          />
        ))}
      </g>
      <circle r="17" fill="#ff8a1f" stroke="#1a1a1a" strokeWidth="7" />
    </svg>
  )
}

function Bang() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r="17"
        fill="#ffd23f"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      <path
        d="M20 11v11"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="29" r="2.6" fill="#1a1a1a" />
    </svg>
  )
}

// Ants marching along a table and up a soft watch dripping over its edge,
// drawn as a pop poster
function Picture({ n }: { n: number }) {
  const c = PALETTES[n % PALETTES.length]
  return (
    <div className="c6-pic" style={{ background: c.bg }}>
      <svg
        viewBox="0 0 352 244"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="c6-dots"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="6" cy="6" r="2.6" fill={c.dots} />
          </pattern>
          <g id="c6-ant" fill="#1a1a1a">
            <ellipse cx="-9" cy="0" rx="7" ry="5" />
            <ellipse cx="0" cy="0" rx="4.5" ry="3.2" />
            <circle cx="7" cy="-1.5" r="3.6" />
            <g
              stroke="#1a1a1a"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M-2 2-7 8M0 2.5 0 9M2 2 7 8M9-4Q12-10 16-9M8-4Q9-11 12-12" />
            </g>
          </g>
        </defs>
        <rect width="352" height="244" fill={c.bg} />
        <rect width="352" height="244" fill="url(#c6-dots)" />
        <circle
          cx="292"
          cy="58"
          r="38"
          fill={c.sun}
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <g transform="translate(46 46) scale(.32)">
          <g fill="#fff" stroke="#1a1a1a" strokeWidth="9">
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <ellipse
                key={r}
                cy="-46"
                rx="20"
                ry="38"
                transform={`rotate(${r})`}
              />
            ))}
          </g>
          <circle r="26" fill="#ff8a1f" stroke="#1a1a1a" strokeWidth="9" />
        </g>
        <rect
          x="-6"
          y="158"
          width="244"
          height="94"
          fill={c.table}
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <path d="M-6 172H238" stroke={c.line} strokeWidth="4" />
        <circle
          cx="190"
          cy="108"
          r="6"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <path
          d="M186 112h8v5h-8z"
          fill="#ffd23f"
          stroke="#1a1a1a"
          strokeWidth="2.4"
        />
        <path
          d="M120 154C118 130 160 116 196 116 228 116 252 124 260 142 268 160 270 186 266 206 264 220 258 228 250 228 240 228 238 214 240 200 242 184 240 170 230 164 206 160 160 162 134 160 126 160 120 158 120 154Z"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <path
          d="M132 152C132 136 162 125 194 125 222 125 242 131 248 144"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.6"
          opacity=".5"
        />
        <g stroke="#1a1a1a" strokeWidth="2.6" strokeLinecap="round">
          <path d="M190 129V134" />
          <path d="M240 143 244 145" />
          <path d="M138 148H142" />
          <path d="M262 188 258 188" />
        </g>
        <path
          d="M190 141 170 133M190 141 218 137"
          stroke="#1a1a1a"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="c6-hands"
        />
        <circle
          cx="190"
          cy="141"
          r="3.6"
          fill={c.table}
          stroke="#1a1a1a"
          strokeWidth="1.4"
        />
        <g className="c6-ants">
          <use href="#c6-ant" transform="translate(24 146) scale(1.3)" />
          <use href="#c6-ant" transform="translate(72 147) scale(1.3)" />
          <use
            href="#c6-ant"
            transform="translate(118 144) scale(1.3) rotate(-14)"
          />
          <use
            href="#c6-ant"
            transform="translate(160 146) scale(1.3) rotate(-4)"
          />
        </g>
        <use
          href="#c6-ant"
          transform="translate(253 200) scale(1.2) rotate(86)"
        />
        <g fill="#1a1a1a">
          <circle cx="120" cy="40" r="4" />
          <circle cx="218" cy="92" r="3" />
          <circle cx="330" cy="140" r="4" />
        </g>
      </svg>
    </div>
  )
}
