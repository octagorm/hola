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
import type { ReactNode } from 'react'
import type { Sentence } from '../lib/cadaver'
import './cadaver.css'

// Cadáver exquisito: the surrealists' game of a sentence written in folds,
// each part added without seeing the rest. The parts are drawn at random
// (from a deck of sentences made so, lib/cadaver.ts), and the player makes
// them agree: the verb with whoever does it, the adjective with the thing.
// Six sentences a round. Its picture is the game drawn as a figure: a
// head, a body and legs on three strips of paper that do not quite line
// up, like its tile, the body and the legs unfolded as the verb and the
// adjective are got right.

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

// The colours of the picture's three strips, a different set each
// sentence, and those of the figure on them
const INK = '#1f3d5a'
const CREAM = '#f8e9cb'
const TERRA = '#cd6c47'
const MUSTARD = '#e3ac49'
const SAGE = '#6f9e89'
const SLATE = '#3b6a91'
const STRIPS = [
  [MUSTARD, TERRA, SAGE],
  [SAGE, MUSTARD, SLATE],
  [TERRA, SLATE, MUSTARD],
  [SLATE, SAGE, TERRA],
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
              <Picture
                n={done.length}
                seed={t.s.subject.es + thingPhrase(t.s)}
                body={t.got.includes('verb')}
                legs={t.got.includes('adj')}
              />
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
      <g fill={CREAM} stroke={INK} strokeWidth="7">
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
      <circle r="17" fill={TERRA} stroke={INK} strokeWidth="7" />
    </svg>
  )
}

function Bang() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill={MUSTARD} />
      <path d="M20 11v11" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="29" r="2.6" fill={INK} />
    </svg>
  )
}

// The figure of the exquisite corpse, on three strips of paper laid one
// under the other and a little askew: a head (with a hat, a beret, or the
// moon for one), a body and legs (in boots, a skirt, or a fish's tail),
// each drawn from the sentence, so that each has a figure of its own. A
// strip not unfolded yet shows the back of the paper.
function Picture({
  n,
  seed,
  body,
  legs,
}: {
  n: number
  seed: string
  body: boolean
  legs: boolean
}) {
  const h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const [g1, g2, g3] = STRIPS[n % STRIPS.length]
  // A colour for the figure that stands out from its strip
  const other = (ground: string) =>
    [TERRA, MUSTARD, SAGE].find((c) => c !== ground) ?? TERRA
  const W = 196
  return (
    <div className="c6-pic">
      <svg
        viewBox="50 0 252 244"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <Strip x={70} y={0} h={76} ground={g1} open>
          <Head kind={h % 3} ground={g1} acc={other(g1)} w={W} />
        </Strip>
        <Strip x={86} y={76} h={84} ground={g2} open={body}>
          <Body kind={(h >> 3) % 3} ground={g2} acc={other(g2)} />
        </Strip>
        <Strip x={77} y={160} h={84} ground={g3} open={legs}>
          <Legs kind={(h >> 6) % 3} acc={other(g3)} />
        </Strip>
      </svg>
    </div>
  )
}

function Strip({
  x,
  y,
  h,
  ground,
  open,
  children,
}: {
  x: number
  y: number
  h: number
  ground: string
  open: boolean
  children: ReactNode
}) {
  const W = 196
  const id = `c6-strip-${y}`
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={id}>
        <rect width={W} height={h} />
      </clipPath>
      {open ? (
        <g clipPath={`url(#${id})`} className="c6-strip">
          <rect width={W} height={h} fill={ground} />
          <g transform={`translate(${W / 2 - 98} 0)`}>{children}</g>
        </g>
      ) : (
        <g className="c6-back">
          <rect width={W} height={h} fill="#ead7b2" />
          <path d={`M${W - 34} 0H${W}V34Z`} fill="#d9c196" />
          <path
            d={`M14 ${h / 2}H${W - 14}`}
            stroke="#c9ad7d"
            strokeWidth="2"
            strokeDasharray="7 6"
          />
        </g>
      )}
    </g>
  )
}

// A head with no face: in a Cordoban hat, in a beret, or a crescent moon
function Head({
  kind,
  ground,
  acc,
  w,
}: {
  kind: number
  ground: string
  acc: string
  w: number
}) {
  const neck = <rect x="90" y="66" width="16" height="12" fill={CREAM} />
  if (kind === 2)
    return (
      <>
        {neck}
        <circle cx="98" cy="46" r="28" fill={CREAM} />
        <circle cx="112" cy="38" r="24" fill={ground} />
        <circle cx={w - 40} cy="18" r="4" fill={CREAM} />
        <circle cx="34" cy="30" r="3" fill={CREAM} />
      </>
    )
  return (
    <>
      {neck}
      <circle cx="98" cy="52" r="22" fill={CREAM} />
      {kind === 0 ? (
        <>
          <rect x="74" y="8" width="48" height="26" rx="3" fill={INK} />
          <rect x="74" y="24" width="48" height="6" fill={acc} />
          <rect x="54" y="30" width="88" height="7" rx="3.5" fill={INK} />
        </>
      ) : (
        <>
          <ellipse cx="92" cy="34" rx="34" ry="11" fill={acc} />
          <rect x="94" y="18" width="5" height="9" rx="2" fill={acc} />
        </>
      )}
    </>
  )
}

// A body with its arms: in a striped shirt, a spotted dress, or a jacket
function Body({
  kind,
  ground,
  acc,
}: {
  kind: number
  ground: string
  acc: string
}) {
  const coat = kind === 2 ? INK : kind === 1 ? acc : 'url(#c6-stripes)'
  const shape = 'M60 30Q60 0 88 0H108Q136 0 136 30V84H60Z'
  return (
    <>
      <pattern
        id="c6-stripes"
        width="18"
        height="18"
        patternUnits="userSpaceOnUse"
        y="4"
      >
        <rect width="18" height="18" fill={CREAM} />
        <rect width="18" height="9" fill={INK} />
      </pattern>
      <circle cx="46" cy="70" r="9" fill={CREAM} />
      <circle cx="150" cy="70" r="9" fill={CREAM} />
      <rect x="36" y="8" width="20" height="58" rx="10" fill={coat} />
      <rect x="140" y="8" width="20" height="58" rx="10" fill={coat} />
      <path d={shape} fill={coat} />
      {kind === 1 && (
        <g fill={ground === CREAM ? INK : CREAM}>
          {[
            [76, 22],
            [110, 16],
            [94, 42],
            [72, 62],
            [118, 56],
            [46, 30],
            [150, 40],
          ].map(([x, y]) => (
            <circle key={`${x} ${y}`} cx={x} cy={y} r="5" />
          ))}
        </g>
      )}
      {kind === 2 && (
        <>
          <path d="M88 0 98 26 108 0Z" fill={CREAM} />
          <g fill={MUSTARD}>
            <circle cx="98" cy="40" r="4" />
            <circle cx="98" cy="56" r="4" />
          </g>
          <rect x="60" y="68" width="76" height="9" fill={acc} />
        </>
      )}
    </>
  )
}

// Legs: in trousers and boots, a skirt and shoes, or a fish's tail
function Legs({ kind, acc }: { kind: number; acc: string }) {
  if (kind === 2)
    return (
      <path
        d="M64 0H132Q130 38 106 56L134 82H62L90 56Q66 38 64 0Z"
        fill={SLATE === acc ? INK : SLATE}
      />
    )
  if (kind === 1)
    return (
      <>
        <rect x="80" y="36" width="10" height="34" fill={CREAM} />
        <rect x="106" y="36" width="10" height="34" fill={CREAM} />
        <path d="M66 0H130L148 44H48Z" fill={acc} />
        <rect x="56" y="30" width="84" height="6" fill={CREAM} opacity=".7" />
        <ellipse cx="80" cy="72" rx="12" ry="6" fill={INK} />
        <ellipse cx="116" cy="72" rx="12" ry="6" fill={INK} />
      </>
    )
  return (
    <>
      <rect x="66" y="0" width="64" height="16" fill={INK} />
      <rect x="66" y="0" width="28" height="64" fill={INK} />
      <rect x="102" y="0" width="28" height="64" fill={INK} />
      <path d="M94 58V78H56Q56 64 70 58Z" fill={acc} />
      <path d="M102 58V78H140Q140 64 126 58Z" fill={acc} />
    </>
  )
}
