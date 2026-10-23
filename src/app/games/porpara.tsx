import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Volume2, X } from 'lucide-react'
import { RULES } from '../data/porpara'
import { inGap, parts, remember, round, whole, why } from '../lib/porpara'
import { blip } from '../lib/sound'
import { say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { useFont, useMedia } from '../ui'
import type { Answer, Gap } from '../data/porpara'
import './porpara.css'

// Por o para: a sentence in the frieze over two doors of the Alhambra, por
// on the left and para on the right. The right one opens on the garden
// behind it, the sentence is said whole, and a line says why. Ten
// sentences a round, in layered paper-cut.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;1,400;1,500&family=Alegreya+SC:wght@500;700;800&display=swap'

// The sentences of the last rounds, so that the next rounds have others:
// kept while the page is open
let recent: Array<string> = []

export default function PorPara() {
  useFont(FONTS)
  const { bank, record, points, played, setBest, settings } = useStore()
  const { hear } = useVoices()
  const back = useBack('porpara')
  const [gaps, setGaps] = useState<Array<Gap>>(() =>
    round(bank, Math.random, recent),
  )
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Answer | null>(null)
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Array<boolean>>([])
  const [over, setOver] = useState(false)
  const [before, setBefore] = useState(0)
  const timers = useRef<Array<number>>([])

  const later = (f: () => void, ms: number) => {
    timers.current.push(window.setTimeout(f, ms))
  }
  const stop = () => {
    for (const t of timers.current) clearTimeout(t)
    timers.current = []
  }
  useEffect(() => stop, [])

  const g = gaps[i]

  const pick = (a: Answer) => {
    if (picked || over) return
    const right = a === g.a
    // Two doors are a choice of two: a guess is right half the time, so an
    // answer says little (0.3). It asks for the word the sentence needs
    // from what it means, so it is that word's saying that is weighed.
    record(g.a, right, 0.3, 'decir')
    setPicked(a)
    setResults([...results, right])
    blip(right ? 'right' : 'wrong')
    // The wrong door knocks and stays shut; then the right one opens
    later(() => setOpen(true), right ? 0 : 700)
    if (settings.autoplay) later(() => void say(whole(g)), right ? 450 : 1150)
  }

  const next = () => {
    if (!picked) return
    stop()
    if (i + 1 >= gaps.length) {
      const score = results.filter(Boolean).length
      recent = remember(recent, gaps)
      setBefore(bank.best.porpara ?? 0)
      setOver(true)
      setBest('porpara', score)
      if (score) points(score)
      played('porpara')
      setTimeout(() => blip('win'), 200)
      return
    }
    setI(i + 1)
    setPicked(null)
    setOpen(false)
  }

  const again = () => {
    stop()
    setGaps(round(bank, Math.random, recent))
    setI(0)
    setPicked(null)
    setOpen(false)
    setResults([])
    setOver(false)
  }

  // ← por, → para; Enter goes on
  useEffect(() => {
    if (over) return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea')) return
      if (!picked && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault()
        pick(e.key === 'ArrowLeft' ? 'por' : 'para')
      } else if (picked && e.key === 'Enter') {
        if (t?.closest('button, a')) return
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const right = picked === g.a
  const [head, tail] = parts(g)
  const doorState = (a: Answer) =>
    open && a === g.a ? 'open' : picked === a && !right ? 'no' : ''

  return (
    <div className="pp">
      <Defs />
      <div className="pp-col">
        <header className="pp-top">
          <a className="pp-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            Por o para<small>Por eller para</small>
          </h1>
        </header>

        {over ? (
          <End gaps={gaps} results={results} before={before} onAgain={again} />
        ) : (
          <main className="pp-play">
            <section className="pp-frieze">
              <Stars results={results} n={gaps.length} at={i} />
              <p className="pp-es" lang="es" aria-live="polite">
                {head}
                {picked ? (
                  <b className={`pp-word ${g.a}`} key={i}>
                    {inGap(g)}
                  </b>
                ) : (
                  <span className="pp-gap" aria-label="tomrom" />
                )}
                {tail}
              </p>
              <p className="pp-no">
                {g.no}
                {picked && hear !== false && (
                  <button
                    type="button"
                    className="pp-round small"
                    aria-label="Hør setningen"
                    onClick={() => void say(whole(g))}
                  >
                    <Volume2 />
                  </button>
                )}
              </p>
            </section>

            <div className="pp-wall">
              {DOORS.map(({ a }) => (
                <Door
                  key={a}
                  a={a}
                  state={doorState(a)}
                  disabled={!!picked}
                  onPick={pick}
                />
              ))}
              <Wall />
            </div>

            <div className="pp-court">
              <Jasmine className="pp-jas l" />
              <Jasmine className="pp-jas r" />
              {picked ? (
                <div className="pp-after">
                  <p className={`pp-why ${right ? 'yes' : 'no'}`}>
                    <span className="pp-mark">{right ? <Check /> : <X />}</span>
                    <span>
                      <b>{right ? 'Riktig.' : `Her er det ${g.a}.`}</b> {why(g)}
                      <span className="pp-tag">{RULES[g.rule].name}</span>
                    </span>
                  </p>
                  <button type="button" className="pp-btn" onClick={next}>
                    {i + 1 < gaps.length ? 'Neste' : 'Ferdig'} <ArrowRight />
                  </button>
                </div>
              ) : (
                <p className="pp-hint">
                  Trykk på døra som passer.
                  <span className="keys">
                    <kbd>←</kbd> por · para <kbd>→</kbd>
                  </span>
                </p>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  )
}

function End({
  gaps,
  results,
  before,
  onAgain,
}: {
  gaps: Array<Gap>
  results: Array<boolean>
  // The best before this round
  before: number
  onAgain: () => void
}) {
  const { hear } = useVoices()
  const score = results.filter(Boolean).length
  const all = gaps.length
  return (
    <section className="pp-card">
      <Stars results={results} n={all} at={all} />
      <p className="kick">
        {score === all
          ? '¡Perfecto!'
          : score >= 7
            ? '¡Muy bien!'
            : score >= 4
              ? '¡Bien!'
              : '¡Ánimo!'}
      </p>
      <h2>
        {score} av {all} riktige
      </h2>
      <p className="sub">
        {before === 0
          ? 'Ti setninger, ti dører.'
          : score > before
            ? 'Bedre enn noen gang før.'
            : `Det beste så langt er ${before} av ${all}.`}
      </p>
      <div className="acts">
        <TodayNext page="porpara" className="pp-btn" />
        <button type="button" className="pp-btn ghost" onClick={onAgain}>
          Ti til
        </button>
        <a className="pp-link" href="#">
          Til forsiden
        </a>
      </div>
      <ol>
        {gaps.map((g, k) => {
          const [head, tail] = parts(g)
          return (
            <li key={g.es} className={results[k] ? '' : 'miss'}>
              <span className="pp-mark">
                {results[k] ? (
                  <Check aria-label="riktig" />
                ) : (
                  <X aria-label="feil" />
                )}
              </span>
              <span className="txt">
                <span lang="es" className="es">
                  {head}
                  <b className={`pp-word ${g.a}`}>{inGap(g)}</b>
                  {tail}
                </span>
                <em>{g.no}</em>
              </span>
              {hear !== false && (
                <button
                  type="button"
                  className="pp-round small"
                  aria-label="Hør setningen"
                  onClick={() => void say(whole(g))}
                >
                  <Volume2 />
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

// --- The wall and its doors ---

// The wall in its own units, 460 × 330: two doors of 200, each a horseshoe
// arch whose middle is 100 in from its left and 150 down, its jambs down to
// the threshold
const DOORS: Array<{ a: Answer; x: number }> = [
  { a: 'por', x: 15 },
  { a: 'para', x: 245 },
]
const CY = 150
const FLOOR = 322
const f = (n: number) => n.toFixed(2)

// A horseshoe opening of radius r, its jambs j from the middle
function horseshoe(cx: number, r: number, j: number): string {
  const y = f(CY + Math.sqrt(r * r - j * j))
  return `M${cx - j} ${FLOOR}V${y}A${r} ${r} 0 1 1 ${cx + j} ${y}V${FLOOR}Z`
}

// The same with its edge cut in n lobes, as the Nasrid arches have it
function lobed(cx: number, r: number, j: number, n: number): string {
  const dy = Math.sqrt(r * r - j * j)
  const a0 = Math.atan2(dy, -j)
  const step = (Math.atan2(dy, j) + 2 * Math.PI - a0) / n
  const lr = f(2 * r * Math.sin(step / 2) * 0.62)
  let d = `M${cx - j} ${FLOOR}V${f(CY + dy)}`
  for (let k = 1; k <= n; k++) {
    const a = a0 + step * k
    d += `A${lr} ${lr} 0 0 1 ${f(cx + r * Math.cos(a))} ${f(CY + r * Math.sin(a))}`
  }
  return `${d}V${FLOOR}Z`
}

const both = (shape: (cx: number) => string) =>
  DOORS.map((d) => shape(d.x + 100)).join('')

const WALL = 'M-110 0H570V330H-110Z'
const OUTER = both((cx) => horseshoe(cx, 84, 74))
const MIDDLE = both((cx) => horseshoe(cx, 74, 64))
const INNER = both((cx) => lobed(cx, 62, 54, 11))

// The joints of the voussoirs, between the outer opening and the middle
const JOINTS = both((cx) =>
  Array.from({ length: 23 }, (_, k) => {
    const a = ((150 + k * 10.5) * Math.PI) / 180
    const p = (r: number) =>
      `${f(cx + r * Math.cos(a))} ${f(CY + r * Math.sin(a))}`
    return `M${p(74)}L${p(85)}`
  }).join(''),
)

// The tiles at the foot of the wall, beside the doors
const DADO = 'M-110 232H41V322H-110ZM189 232H271V322H189ZM419 232H570V322H419Z'

function Door({
  a,
  state,
  disabled,
  onPick,
}: {
  a: Answer
  state: '' | 'open' | 'no'
  disabled: boolean
  onPick: (a: Answer) => void
}) {
  return (
    <button
      type="button"
      className={`pp-door ${a} ${state}`}
      aria-label={a}
      disabled={disabled}
      onClick={() => onPick(a)}
    >
      <span className="pp-in">
        {a === 'por' ? <Sunset /> : <Night />}
        <span className="pp-leaf l">
          <Leaf hinge="l" />
        </span>
        <span className="pp-leaf r">
          <Leaf hinge="r" />
        </span>
      </span>
      <span className="pp-name" lang="es">
        {a}
      </span>
      <span className="pp-ring" />
    </button>
  )
}

// The wall over the doors, three layers of cut paper, each casting its
// shadow on the one behind. A wide screen sees more of it, and the orange
// trees beside the doors.
function Wall() {
  const wide = useMedia('(min-width: 900px)')
  return (
    <svg
      className="pp-art"
      viewBox={wide ? '-110 0 680 330' : '0 0 460 330'}
      aria-hidden="true"
    >
      <g filter="url(#pp-drop)">
        <path d={WALL + INNER} fill="#f6ecd6" fillRule="evenodd" />
      </g>
      <path d={INNER} fill="none" stroke="#d9b98a" strokeWidth=".9" />
      <g filter="url(#pp-drop)">
        <path d={WALL + MIDDLE} fill="#c0643c" fillRule="evenodd" />
      </g>
      <path d={JOINTS} stroke="#a14e2c" strokeWidth="1" />
      <path d={MIDDLE} fill="none" stroke="#e2a95c" strokeWidth="1.1" />
      <g filter="url(#pp-drop)">
        <path d={WALL + OUTER} fill="#f1e2c4" fillRule="evenodd" />
      </g>
      <path d={WALL + OUTER} fill="url(#pp-sebka)" fillRule="evenodd" />
      <path d={DADO} fill="url(#pp-tile)" />
      <path
        d="M-110 231H41M189 231H271M419 231H570"
        stroke="#c0643c"
        strokeWidth="2.6"
      />
      {DOORS.map(({ x }) => (
        <g key={x}>
          <rect
            x={x + 44}
            y="14"
            width="112"
            height="42"
            rx="7"
            fill="#fbf4e4"
            stroke="#c0643c"
            strokeWidth="1.8"
          />
          <rect
            x={x + 48.5}
            y="18.5"
            width="103"
            height="33"
            rx="4.5"
            fill="none"
            stroke="#c98f3e"
            strokeWidth=".9"
          />
        </g>
      ))}
      <Tree c={-52} />
      <Tree c={512} />
      <rect x="-110" y="321" width="680" height="9" fill="#a9512d" />
      <path d="M-110 321.6H570" stroke="#d9895a" strokeWidth="1.2" />
    </svg>
  )
}

// An orange tree in a pot, its middle at c
function Tree({ c }: { c: number }) {
  const fruit = [
    [-20, 176],
    [6, 158],
    [22, 180],
    [-6, 198],
    [30, 204],
    [-30, 206],
    [12, 204],
    [-14, 156],
    [-34, 186],
  ]
  return (
    <g>
      <g filter="url(#pp-drop)">
        <path d={`M${c - 3} 280V200H${c + 3}V280Z`} fill="#6b4a2c" />
        <g fill="#2f5d45">
          <circle cx={c} cy="180" r="38" />
          <circle cx={c - 26} cy="198" r="22" />
          <circle cx={c + 26} cy="196" r="22" />
        </g>
      </g>
      <g fill="#3d7253">
        <circle cx={c - 12} cy="168" r="18" />
        <circle cx={c + 16} cy="186" r="14" />
      </g>
      <g fill="#f0a540">
        {fruit.map(([dx, y]) => (
          <circle key={`${dx} ${y}`} cx={c + dx} cy={y} r="4.2" />
        ))}
      </g>
      <g filter="url(#pp-drop)">
        <path
          d={`M${c - 25} 270H${c + 25}L${c + 19} 321H${c - 19}Z`}
          fill="#c0643c"
        />
        <rect x={c - 28} y="264" width="56" height="9" rx="2" fill="#a9512d" />
      </g>
      <path d={`M${c - 22} 292H${c + 22}`} stroke="#e2a95c" strokeWidth="1.4" />
    </g>
  )
}

// One leaf of a cedar door: two panels, each with a star, and by the seam
// a ring to pull
function Leaf({ hinge }: { hinge: 'l' | 'r' }) {
  const ring = hinge === 'l' ? 53 : 7
  return (
    <svg viewBox="0 0 60 242" preserveAspectRatio="none" aria-hidden="true">
      <rect width="60" height="242" fill="#4b2b1b" />
      <g filter="url(#pp-drop-s)" fill="#5f3621">
        <rect x="7" y="14" width="46" height="106" rx="2" />
        <rect x="7" y="130" width="46" height="98" rx="2" />
      </g>
      <g fill="none" stroke="#d39a48" strokeWidth="1">
        <rect x="11" y="18" width="38" height="98" />
        <rect x="11" y="134" width="38" height="90" />
        <path d={STAR_BIG} transform="translate(30 70)" strokeWidth="1.4" />
        <path d={STAR_BIG} transform="translate(30 179)" strokeWidth="1.4" />
      </g>
      <g fill="#d39a48">
        <path d={STAR_SMALL} transform="translate(30 70)" />
        <path d={STAR_SMALL} transform="translate(30 179)" />
        <circle cx="15" cy="22" r="1.2" />
        <circle cx="45" cy="22" r="1.2" />
        <circle cx="15" cy="112" r="1.2" />
        <circle cx="45" cy="112" r="1.2" />
        <circle cx="15" cy="138" r="1.2" />
        <circle cx="45" cy="138" r="1.2" />
        <circle cx="15" cy="220" r="1.2" />
        <circle cx="45" cy="220" r="1.2" />
      </g>
      <circle
        cx={ring}
        cy="125"
        r="3.4"
        fill="none"
        stroke="#e2ae5c"
        strokeWidth="1.4"
      />
    </svg>
  )
}

// The flame of a cypress, its foot at x, base
const cypress = (x: number, base: number, h: number, w: number) =>
  `M${x} ${base - h}C${x + w * 0.42} ${base - h * 0.62} ${x + w * 0.66} ${base - h * 0.18} ${x + w * 0.28} ${base}H${x - w * 0.28}C${x - w * 0.66} ${base - h * 0.18} ${x - w * 0.42} ${base - h * 0.62} ${x} ${base - h}Z`

// Behind por: the garden at sunset, a tower against the sun, cypresses and
// a long pool with a fountain
function Sunset() {
  return (
    <svg
      className="pp-garden"
      viewBox="0 0 120 242"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <rect width="120" height="242" fill="#eb9a4c" />
      <rect y="80" width="120" height="82" fill="#f2b465" />
      <rect y="124" width="120" height="40" fill="#f6c97f" />
      <circle cx="76" cy="128" r="19" fill="#fbe3a6" />
      <g filter="url(#pp-drop-s)">
        <path
          d="M0 144C14 134 26 137 38 140S62 130 80 136 106 134 120 139V164H0Z"
          fill="#d9864d"
        />
      </g>
      <g filter="url(#pp-drop-s)" fill="#c4643a">
        <path d="M10 156V98H13V94H16V98H19V94H22V98H25V94H28V98H31V94H34V98H37V156Z" />
        <path d="M86 156V120H88V117H91V120H94V117H97V120H100V117H103V120H105V156Z" />
      </g>
      <g fill="#8a3d22">
        <rect x="17" y="108" width="3.4" height="7" rx="1.7" />
        <rect x="27" y="108" width="3.4" height="7" rx="1.7" />
        <rect x="94" y="128" width="2.6" height="5" rx="1.3" />
      </g>
      <g filter="url(#pp-drop-s)">
        <rect y="150" width="120" height="13" fill="#b65832" />
      </g>
      <g filter="url(#pp-drop-s)" fill="#2d5843">
        <path d={cypress(5, 166, 74, 12)} />
        <path d={cypress(46, 158, 52, 9)} />
        <path d={cypress(74, 158, 58, 9)} />
        <path d={cypress(115, 168, 82, 13)} />
      </g>
      <path d="M0 162H120V242H0Z" fill="#e6bd86" />
      <g filter="url(#pp-drop-s)" fill="#3e6a47">
        <path d="M0 162H42L28 198H0Z" />
        <path d="M120 162H78L92 198H120Z" />
      </g>
      <path d="M53 163H67L82 242H38Z" fill="#3c6f78" />
      <path d="M58.6 163H61.4L64.4 242H55.6Z" fill="#a8d3d0" opacity=".55" />
      <ellipse cx="60" cy="163" rx="10" ry="2.6" fill="#f4e2bb" />
      <path
        d="M60 162C58.4 155 59.3 150 60 146 60.7 150 61.6 155 60 162Z"
        fill="#d2ece8"
      />
      <g filter="url(#pp-drop-s)">
        <g fill="#c4643a">
          <path d="M2 224H18L16 242H4Z" />
          <path d="M102 224H118L116 242H104Z" />
        </g>
        <g fill="#2f5b45">
          <circle cx="10" cy="215" r="10" />
          <circle cx="110" cy="215" r="10" />
        </g>
      </g>
      <g fill="#f0a540">
        <circle cx="6" cy="212" r="1.9" />
        <circle cx="13" cy="217" r="1.9" />
        <circle cx="107" cy="213" r="1.9" />
        <circle cx="114" cy="218" r="1.9" />
      </g>
    </svg>
  )
}

// Behind para: the garden at night, the walls and towers lit, the moon, and
// jasmine white on the hedges
function Night() {
  return (
    <svg
      className="pp-garden"
      viewBox="0 0 120 242"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <rect width="120" height="242" fill="#1b2846" />
      <rect y="116" width="120" height="48" fill="#223459" />
      <g fill="#f4ead0">
        <circle cx="22" cy="40" r=".9" />
        <circle cx="40" cy="22" r="1.1" />
        <circle cx="58" cy="52" r=".8" />
        <circle cx="100" cy="86" r="1" />
        <circle cx="16" cy="80" r=".8" />
        <circle cx="48" cy="92" r=".9" />
        <circle cx="70" cy="30" r=".8" />
        <circle cx="106" cy="40" r=".9" />
      </g>
      <path d="M84 36A13 13 0 1 0 96 57 11 11 0 1 1 84 36Z" fill="#f3e4bd" />
      <g filter="url(#pp-drop-s)">
        <path
          d="M0 142C16 132 30 136 44 138S70 128 88 134 110 132 120 136V164H0Z"
          fill="#2a3e64"
        />
      </g>
      <g filter="url(#pp-drop-s)">
        <path
          d="M0 156V134H8V120H11V117H14V120H17V117H20V120H23V134H62V126H65V123H68V126H71V123H74V126H77V134H84V116H87V113H90V116H93V113H96V116H99V113H102V116H104V134H120V156Z"
          fill="#5b3c3b"
        />
      </g>
      <g fill="#f1c467">
        <rect x="13" y="125" width="2.4" height="4.4" rx="1.2" />
        <rect x="67" y="130" width="2" height="3.6" rx="1" />
        <rect x="90" y="121" width="2.4" height="4.4" rx="1.2" />
        <rect x="96" y="121" width="2.4" height="4.4" rx="1.2" />
        <rect x="40" y="140" width="2" height="3.4" rx="1" />
        <rect x="112" y="140" width="2" height="3.4" rx="1" />
      </g>
      <g filter="url(#pp-drop-s)">
        <rect y="150" width="120" height="13" fill="#3a2a2c" />
      </g>
      <g filter="url(#pp-drop-s)" fill="#132a25">
        <path d={cypress(6, 166, 78, 12)} />
        <path d={cypress(42, 158, 50, 9)} />
        <path d={cypress(78, 158, 60, 9)} />
        <path d={cypress(114, 168, 74, 13)} />
      </g>
      <path d="M0 162H120V242H0Z" fill="#5c5042" />
      <g filter="url(#pp-drop-s)" fill="#1d392f">
        <path d="M0 162H42L28 198H0Z" />
        <path d="M120 162H78L92 198H120Z" />
      </g>
      <g fill="#f5f0e2">
        <circle cx="8" cy="170" r="1.3" />
        <circle cx="20" cy="174" r="1.3" />
        <circle cx="12" cy="186" r="1.3" />
        <circle cx="30" cy="168" r="1.1" />
        <circle cx="100" cy="172" r="1.3" />
        <circle cx="110" cy="184" r="1.3" />
        <circle cx="92" cy="168" r="1.1" />
      </g>
      <path d="M53 163H67L82 242H38Z" fill="#253f5f" />
      <ellipse cx="62" cy="204" rx="4" ry="8" fill="#f3e4bd" opacity=".7" />
      <ellipse cx="60" cy="163" rx="10" ry="2.6" fill="#857563" />
      <path
        d="M60 162C58.4 155 59.3 150 60 146 60.7 150 61.6 155 60 162Z"
        fill="#9ab7c9"
      />
      <g filter="url(#pp-drop-s)">
        <g fill="#7b3f2a">
          <path d="M2 224H18L16 242H4Z" />
          <path d="M102 224H118L116 242H104Z" />
        </g>
        <g fill="#183229">
          <circle cx="10" cy="215" r="10" />
          <circle cx="110" cy="215" r="10" />
        </g>
      </g>
      <g fill="#f5f0e2">
        <circle cx="7" cy="212" r="1.5" />
        <circle cx="13" cy="218" r="1.5" />
        <circle cx="107" cy="213" r="1.5" />
        <circle cx="114" cy="217" r="1.5" />
      </g>
    </svg>
  )
}

// A spray of jasmine in a corner of the court: leaves along a branch, and
// white flowers
const LEAF = 'M0 0C7-7 20-7 28 0 20 7 7 7 0 0Z'
const LEAVES: Array<[number, number, number, string]> = [
  [4, 122, -48, '#2f5d45'],
  [14, 112, 8, '#3d7253'],
  [24, 104, -72, '#2f5d45'],
  [36, 96, -6, '#3d7253'],
  [48, 90, -82, '#2f5d45'],
  [60, 84, 14, '#2f5d45'],
  [72, 80, -58, '#3d7253'],
  [86, 76, 6, '#2f5d45'],
  [100, 72, -52, '#3d7253'],
  [114, 70, 18, '#2f5d45'],
  [126, 69, -38, '#3d7253'],
]
const FLOWERS: Array<[number, number, number]> = [
  [16, 100, 0.9],
  [32, 86, 1],
  [58, 74, 1.1],
  [84, 64, 0.95],
  [98, 86, 0.8],
  [114, 60, 1],
]

function Jasmine({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 150 130" aria-hidden="true">
      <g filter="url(#pp-drop-s)">
        <path
          d="M-4 134C20 110 40 92 70 82S120 68 150 70"
          fill="none"
          stroke="#3b5a3a"
          strokeWidth="3"
        />
        {LEAVES.map(([x, y, r, c]) => (
          <path
            key={`${x} ${y}`}
            d={LEAF}
            transform={`translate(${x} ${y}) rotate(${r})`}
            fill={c}
          />
        ))}
      </g>
      {FLOWERS.map(([x, y, s]) => (
        <g key={`${x} ${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse
              key={r}
              cy="-5"
              rx="2.7"
              ry="5"
              transform={`rotate(${r})`}
              fill="#fbf7ee"
            />
          ))}
          <circle r="1.7" fill="#e3b94f" />
        </g>
      ))}
    </svg>
  )
}

// An eight-pointed star around 0 0, its points r out
const star = (r: number) =>
  Array.from({ length: 16 }, (_, k) => {
    const a = (k * Math.PI) / 8 - Math.PI / 2
    const d = k % 2 ? r * 0.765 : r
    return `${k ? 'L' : 'M'}${f(d * Math.cos(a))} ${f(d * Math.sin(a))}`
  }).join('') + 'Z'

const STAR = star(9)
const STAR_BIG = star(13)
const STAR_SMALL = star(5)

// A star for each sentence of the round: filled when right
function Stars({
  results,
  n,
  at,
}: {
  results: Array<boolean>
  n: number
  // The sentence being answered
  at: number
}) {
  return (
    <div
      className="pp-stars"
      aria-label={at < n ? `Setning ${at + 1} av ${n}` : undefined}
    >
      {Array.from({ length: n }, (_, k) => (
        <svg
          key={k}
          viewBox="-10 -10 20 20"
          className={
            k < results.length
              ? results[k]
                ? 'yes'
                : 'no'
              : k === at
                ? 'now'
                : ''
          }
          aria-hidden="true"
        >
          <path d={STAR} />
        </svg>
      ))}
    </div>
  )
}

// The shadows and patterns the drawings share, once for the page
function Defs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="pp-drop" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="2.6"
            stdDeviation="2.2"
            floodColor="#3b2213"
            floodOpacity=".5"
          />
        </filter>
        <filter id="pp-drop-s" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow
            dx="0"
            dy="1.2"
            stdDeviation="1"
            floodColor="#2a160c"
            floodOpacity=".35"
          />
        </filter>
        <pattern
          id="pp-sebka"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 6 6 0 12 6 6 12Z"
            fill="none"
            stroke="#dcc497"
            strokeWidth=".8"
          />
          <circle cx="6" cy="6" r="1.1" fill="#dcc497" />
        </pattern>
        <pattern
          id="pp-tile"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="16" height="16" fill="#f1e2c4" />
          <path d={star(5.6)} transform="translate(8 8)" fill="#2f5d52" />
          <circle cx="8" cy="8" r="1.5" fill="#f1e2c4" />
          <path
            d="M0 0H3.2L0 3.2ZM16 0H12.8L16 3.2ZM0 16H3.2L0 12.8ZM16 16H12.8L16 12.8Z"
            fill="#22201d"
          />
        </pattern>
      </defs>
    </svg>
  )
}
