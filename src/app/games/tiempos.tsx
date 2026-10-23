import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Volume2, X } from 'lucide-react'
import { TIMES } from '../data/tiempos'
import { TENSE, around, form, plain, round, why } from '../lib/tiempos'
import { blip } from '../lib/sound'
import { say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { useFont, useMedia } from '../ui'
import type { ReactNode } from 'react'
import type { Time } from '../data/tiempos'
import type { Move } from '../lib/tiempos'
import './tiempos.css'

// Ayer, hoy, mañana: three posters of one town in the 1930s manner, at
// yesterday's dusk, in today's sun and under tomorrow's stars. A sentence
// stands in one of them and is moved to another, its verb picked from four.
// Eight moves a round, easiest first.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Limelight&display=swap'

const NAME: Record<Time, string> = {
  ayer: 'Ayer',
  hoy: 'Hoy',
  manana: 'Mañana',
}

const NO: Record<Time, string> = {
  ayer: 'i går',
  hoy: 'i dag',
  manana: 'i morgen',
}

export default function Tiempos() {
  useFont(FONTS)
  const { bank, levelOf, record, points, played, setBest, settings } =
    useStore()
  const { hear } = useVoices()
  const back = useBack('tiempos')
  const wide = useMedia('(min-width: 900px)')
  const [moves, setMoves] = useState<Array<Move>>(() => round(bank, Date.now()))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
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

  const m = moves[i]
  const answer = form(m.s, m.to)
  const right = picked === answer

  const pick = (o: string) => {
    if (picked || over) return
    const ok = o === answer
    // The sentence's meaning is given and its verb's form is picked from
    // four: the verb is said from what it means (decir), and a pick from a
    // few weighs 0.6. Only a verb already met is counted.
    if (levelOf(m.s.verb) > 0) record(m.s.verb, ok, 0.6, 'decir')
    setPicked(o)
    setResults([...results, ok])
    blip(ok ? 'right' : 'wrong')
    if (settings.autoplay)
      later(() => void say(plain(m.s, m.to)), ok ? 350 : 900)
  }

  const next = () => {
    if (!picked) return
    stop()
    if (i + 1 >= moves.length) {
      const score = results.filter(Boolean).length
      setBefore(bank.best.tiempos ?? 0)
      setOver(true)
      setBest('tiempos', score)
      if (score) points(score)
      played('tiempos')
      setTimeout(() => blip('win'), 200)
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  const again = () => {
    stop()
    setMoves(round(bank, Date.now()))
    setI(0)
    setPicked(null)
    setResults([])
    setOver(false)
  }

  // 1–4 pick a form, Enter goes on
  useEffect(() => {
    if (over) return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea')) return
      if (!picked && /^[1-4]$/.test(e.key)) {
        const o = m.options.at(Number(e.key) - 1)
        if (o) pick(o)
      } else if (picked && e.key === 'Enter') {
        if (t?.closest('button, a')) return
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="ah">
      <div className="ah-col">
        <header className="ah-top">
          <a className="ah-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            Ayer, hoy, mañana<small>I går, i dag, i morgen</small>
          </h1>
        </header>

        {over ? (
          <End
            moves={moves}
            results={results}
            before={before}
            onAgain={again}
          />
        ) : (
          <main className="ah-play">
            <Suns results={results} n={moves.length} at={i} />
            <div className="ah-panels">
              {TIMES.map((t) => (
                <Panel
                  key={t}
                  t={t}
                  wide={wide}
                  role={t === m.from ? 'from' : t === m.to ? 'to' : 'rest'}
                >
                  {t === m.from ? (
                    <p className="es" lang="es">
                      {around(m.s, t)[0]}
                      <u>{form(m.s, t)}</u>
                      {around(m.s, t)[1]}
                    </p>
                  ) : t === m.to ? (
                    <>
                      <p className="es" lang="es" aria-live="polite">
                        {around(m.s, t)[0]}
                        {picked ? (
                          <b className={right ? 'ok' : 'fix'} key={i}>
                            {answer}
                          </b>
                        ) : (
                          <span className="ah-gap" aria-label="tomrom" />
                        )}
                        {around(m.s, t)[1]}
                      </p>
                      <p className="no">
                        {m.s[t].no}
                        {picked && hear !== false && (
                          <button
                            type="button"
                            className="ah-round small"
                            aria-label="Hør setningen"
                            onClick={() => void say(plain(m.s, t))}
                          >
                            <Volume2 />
                          </button>
                        )}
                      </p>
                    </>
                  ) : null}
                </Panel>
              ))}
            </div>

            {picked ? (
              <div className="ah-after">
                <p className={`ah-why ${right ? 'yes' : 'no'}`}>
                  <span className="ah-mark">{right ? <Check /> : <X />}</span>
                  <span>
                    {right ? (
                      <>
                        <b>Riktig.</b> {TENSE[m.to]}
                      </>
                    ) : (
                      why(m.s, m.to, picked)
                    )}
                  </span>
                </p>
                <button type="button" className="ah-btn" onClick={next}>
                  {i + 1 < moves.length ? 'Neste' : 'Ferdig'} <ArrowRight />
                </button>
              </div>
            ) : (
              <>
                <p className="ah-hint">
                  Flytt setningen fra <b>{NO[m.from]}</b> til <b>{NO[m.to]}</b>.
                </p>
                <div className="ah-opts">
                  {m.options.map((o, k) => (
                    <button
                      key={o}
                      type="button"
                      lang="es"
                      onClick={() => pick(o)}
                    >
                      <kbd>{k + 1}</kbd>
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}
          </main>
        )}
      </div>
    </div>
  )
}

function End({
  moves,
  results,
  before,
  onAgain,
}: {
  moves: Array<Move>
  results: Array<boolean>
  // The best before this round
  before: number
  onAgain: () => void
}) {
  const { hear } = useVoices()
  const score = results.filter(Boolean).length
  const all = moves.length
  return (
    <section className="ah-card">
      <Suns results={results} n={all} at={all} />
      <p className="kick">
        {score === all
          ? '¡Perfecto!'
          : score >= 6
            ? '¡Muy bien!'
            : score >= 3
              ? '¡Bien!'
              : '¡Ánimo!'}
      </p>
      <h2>
        {score} av {all} riktige
      </h2>
      <p className="sub">
        {before === 0
          ? 'Åtte setninger, flyttet i tid.'
          : score > before
            ? 'Bedre enn noen gang før.'
            : `Det beste så langt er ${before} av ${all}.`}
      </p>
      <div className="acts">
        <TodayNext page="tiempos" className="ah-btn" />
        <button type="button" className="ah-btn ghost" onClick={onAgain}>
          Åtte til
        </button>
        <a className="ah-link" href="#">
          Til forsiden
        </a>
      </div>
      <ol>
        {moves.map((m, k) => {
          const [head, tail] = around(m.s, m.to)
          return (
            <li key={k} className={results[k] ? '' : 'miss'}>
              <span className="ah-mark">
                {results[k] ? (
                  <Check aria-label="riktig" />
                ) : (
                  <X aria-label="feil" />
                )}
              </span>
              <span className="txt">
                <small>
                  {NO[m.from]} → {NO[m.to]}
                </small>
                <span lang="es" className="es">
                  {head}
                  <b>{form(m.s, m.to)}</b>
                  {tail}
                </span>
                <em>{m.s[m.to].no}</em>
              </span>
              {hear !== false && (
                <button
                  type="button"
                  className="ah-round small"
                  aria-label="Hør setningen"
                  onClick={() => void say(plain(m.s, m.to))}
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

// A sun for each move of the round: filled when right
function Suns({
  results,
  n,
  at,
}: {
  results: Array<boolean>
  n: number
  // The move being made
  at: number
}) {
  return (
    <div
      className="ah-suns"
      aria-label={at < n ? `Setning ${at + 1} av ${n}` : undefined}
    >
      {Array.from({ length: n }, (_, k) => (
        <i
          key={k}
          className={
            k < results.length
              ? results[k]
                ? 'yes'
                : 'no'
              : k === at
                ? 'now'
                : ''
          }
        />
      ))}
    </div>
  )
}

// --- The posters ---

function Panel({
  t,
  role,
  wide,
  children,
}: {
  t: Time
  role: 'from' | 'to' | 'rest'
  wide: boolean
  children: ReactNode
}) {
  return (
    <section className={`ah-panel ${t} ${role}`}>
      <div className="ah-art">
        <Town t={t} wide={wide} />
        <h2 className="ah-name" lang="es">
          {NAME[t]}
        </h2>
      </div>
      <div className="ah-cap">
        <span className="ah-when">{NO[t]}</span>
        {children}
      </div>
    </section>
  )
}

interface Palette {
  sky: string
  sky2: string
  glow: string
  orb: string
  far: string
  mid: string
  field: string
  river: string
  shine: string
  bridge: string
  cliff: string
  strata: string
  wall: string
  roof: string
  win: string
  church: string
  castle: string
  tree: string
  front: string
}

// Yesterday in the browns of an old print, today in full colour, tomorrow
// at night with its windows lit
const PAL: Record<Time, Palette> = {
  ayer: {
    sky: '#ead5aa',
    sky2: '#e4c994',
    glow: '#f1e2bf',
    orb: '#f8eed6',
    far: '#ccae7c',
    mid: '#bd9b69',
    field: '#d3b886',
    river: '#e6d2a6',
    shine: '#f4e8cb',
    bridge: '#9f7e55',
    cliff: '#a98757',
    strata: '#8e6c43',
    wall: '#f1e3c2',
    roof: '#b48756',
    win: '#8a6942',
    church: '#e3cea2',
    castle: '#b39669',
    tree: '#6c5335',
    front: '#57412c',
  },
  hoy: {
    sky: '#3a80c4',
    sky2: '#5a99d2',
    glow: '#8bbde4',
    orb: '#fff3cb',
    far: '#30609a',
    mid: '#5b8e45',
    field: '#d6ad48',
    river: '#4e95c4',
    shine: '#a9d5ee',
    bridge: '#c79a69',
    cliff: '#cf9357',
    strata: '#ac703d',
    wall: '#fbf7ee',
    roof: '#dc6a3c',
    win: '#3a4a5f',
    church: '#ecc68e',
    castle: '#d0a169',
    tree: '#2b5a34',
    front: '#1e3c26',
  },
  manana: {
    sky: '#111c38',
    sky2: '#172649',
    glow: '#21355d',
    orb: '#f7e8b9',
    far: '#1e3157',
    mid: '#192947',
    field: '#20304f',
    river: '#233f6a',
    shine: '#f6c55a',
    bridge: '#363f5e',
    cliff: '#2b3552',
    strata: '#222b45',
    wall: '#3a4665',
    roof: '#283252',
    win: '#f6c55a',
    church: '#475172',
    castle: '#39405e',
    tree: '#0e1a2e',
    front: '#0a1222',
  },
}

const f = (n: number) => Math.round(n * 10) / 10

// The houses of the town, row upon row up the hill: x, top, width, height
const HOUSES = (() => {
  const out: Array<[number, number, number, number]> = []
  const rows: Array<[number, number, number]> = [
    // from x, to x, rows up
    [228, 330, 3],
    [210, 386, 2],
    [200, 396, 1],
    [192, 404, 0],
  ]
  let k = 0
  for (const [from, to, up] of rows) {
    for (let x = from; x < to; k++) {
      const w = 12 + ((k * 7) % 6)
      const h = 9 + ((k * 5) % 4)
      const base = 198 - (x - 192) * 0.11 - up * 10
      out.push([x, f(base - h), w, h])
      x += w + 1 + (k % 3)
    }
  }
  return out
})()

const STARS: Array<[number, number]> = [
  [30, 60],
  [62, 100],
  [96, 44],
  [140, 82],
  [168, 112],
  [190, 52],
  [226, 96],
  [262, 40],
  [300, 78],
  [344, 56],
  [376, 98],
  [20, 120],
  [214, 128],
  [120, 132],
]

// The flame of a cypress, its foot at x, base
const cypress = (x: number, base: number, h: number, w: number) =>
  `M${x} ${base - h}C${x + w * 0.42} ${base - h * 0.62} ${x + w * 0.66} ${base - h * 0.18} ${x + w * 0.28} ${base}H${x - w * 0.28}C${x - w * 0.66} ${base - h * 0.18} ${x - w * 0.42} ${base - h * 0.62} ${x} ${base - h}Z`

// A flat cloud, its bottom left at x, y
const cloud = (x: number, y: number, s: number) =>
  `M${x} ${y}C${x} ${y - 8 * s} ${x + 10 * s} ${y - 12 * s} ${x + 18 * s} ${y - 8 * s} ${x + 22 * s} ${y - 18 * s} ${x + 38 * s} ${y - 18 * s} ${x + 42 * s} ${y - 8 * s} ${x + 52 * s} ${y - 12 * s} ${x + 60 * s} ${y - 6 * s} ${x + 58 * s} ${y}Z`

// The arches of the bridge, cut out of it
const BRIDGE =
  'M54 208H190V252H54Z' +
  [62, 104, 146]
    .map((x) => `M${x} 252V236A18 13 0 0 1 ${x + 36} 236V252Z`)
    .join('')

// A town on a cliff over a river, a bridge, a church and a castle: drawn
// 400 × 300, and seen whole on a wide screen, as a band on a phone
function Town({ t, wide }: { t: Time; wide: boolean }) {
  const c = PAL[t]
  const night = t === 'manana'
  return (
    <svg
      className="ah-pic"
      viewBox={wide ? '104 0 296 300' : '0 106 400 136'}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="400" height="300" fill={c.sky} />
      <rect y="96" width="400" height="80" fill={c.sky2} />
      <rect y="132" width="400" height="44" fill={c.glow} />
      {night && (
        <g fill="#f4ead0">
          {STARS.map(([x, y]) => (
            <circle key={`${x} ${y}`} cx={x} cy={y} r={x % 3 ? 1 : 1.5} />
          ))}
        </g>
      )}
      {t === 'hoy' && (
        <g fill="#fbf7ee">
          <path d={cloud(214, 126, 0.8)} />
          <path d={cloud(312, 96, 0.9)} />
          <path d={cloud(236, 46, 1.1)} />
        </g>
      )}
      {t === 'ayer' && <circle cx="172" cy="142" r="20" fill={c.orb} />}
      {t === 'hoy' && <circle cx="180" cy="120" r="13" fill={c.orb} />}
      {night && (
        <path
          d="M176 112A14 14 0 1 0 190 134 12 12 0 1 1 176 112Z"
          fill={c.orb}
        />
      )}
      <path
        d="M0 154C24 142 44 140 70 148S118 122 146 128 196 148 228 144 280 130 312 136 370 142 400 138V230H0Z"
        fill={c.far}
      />
      <path
        d="M0 182C40 170 82 172 120 180S172 190 204 186V252H0Z"
        fill={c.mid}
      />
      <path
        d="M10 190C38 182 68 182 96 188L92 196C66 192 40 192 16 198Z"
        fill={c.field}
      />
      <path
        d="M104 192C124 188 146 190 168 194L166 201C146 198 126 197 108 199Z"
        fill={c.field}
      />
      <path
        d="M0 234C50 228 104 228 150 234S196 246 212 252V266C190 260 150 250 110 248S40 250 0 256Z"
        fill={c.river}
      />
      <path
        d="M10 242C50 238 96 238 136 242M30 250C60 247 90 246 120 248"
        fill="none"
        stroke={c.shine}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".8"
      />
      <path d={BRIDGE} fill={c.bridge} fillRule="evenodd" />
      <rect x="52" y="204" width="140" height="5" fill={c.strata} />
      <path
        d="M184 266V216C188 206 194 200 200 196L240 192 300 188 360 182 400 178V266Z"
        fill={c.cliff}
      />
      <g fill={c.strata}>
        <path d="M196 206 202 266H210L204 202Z" />
        <path d="M226 198 230 262H236L232 196Z" />
        <path d="M256 196 262 266H268L262 194Z" />
        <path d="M290 192 294 258H300L296 190Z" />
        <path d="M322 188 328 266H334L328 186Z" />
        <path d="M356 184 360 254H366L362 182Z" />
        <path d="M384 180 388 266H394L390 179Z" />
      </g>
      {/* the castle on the top of the hill, behind the houses */}
      <g fill={c.castle}>
        <path d="M326 160V142H392V160Z" />
        <path d="M326 142V124H329V121H332V124H335V121H338V124H341V142Z" />
        <path d="M350 146V130H353V127H356V130H359V127H362V130H364V146Z" />
        <path d="M372 146V118H375V115H378V118H381V115H384V118H387V115H390V118H392V146Z" />
      </g>
      <g fill={c.win}>
        <rect x="331" y="130" width="3" height="5" rx="1.5" />
        <rect x="380" y="126" width="3" height="5" rx="1.5" />
        <rect x="355" y="135" width="3" height="4" rx="1.5" />
      </g>
      {/* the church, its tower over the roofs */}
      <g fill={c.church}>
        <path d="M236 172V152H280V172Z" />
        <path d="M252 158V118H265V158Z" />
        <path d="M250 119H267L258.5 104Z" fill={c.roof} />
        <path d="M234 153H282L276 146H240Z" fill={c.roof} />
      </g>
      <rect x="256" y="124" width="5" height="9" rx="2.5" fill={c.win} />
      {HOUSES.map(([x, y, w, h], k) => (
        <g key={k}>
          <rect x={x} y={y} width={w} height={h + 3} fill={c.wall} />
          {k % 4 !== 3 && (
            <path
              d={`M${x - 1} ${y + 0.6}H${x + w + 1}L${x + w - 2} ${f(y - 4)}H${x + 2}Z`}
              fill={c.roof}
            />
          )}
          <rect
            x={f(x + w * 0.3)}
            y={f(y + h * 0.35)}
            width="2.6"
            height="3.4"
            fill={c.win}
          />
          {k % 3 === 0 && (
            <rect
              x={f(x + w * 0.62)}
              y={f(y + h * 0.35)}
              width="2.6"
              height="3.4"
              fill={c.win}
            />
          )}
        </g>
      ))}
      <g fill={c.tree}>
        <path d={cypress(214, 200, 34, 7)} />
        <path d={cypress(288, 190, 30, 6)} />
        <path d={cypress(318, 184, 38, 7)} />
        <path d={cypress(362, 178, 30, 6)} />
        <path d={cypress(150, 206, 28, 6)} />
        <path d={cypress(160, 208, 22, 5)} />
      </g>
      {night && (
        <g fill={c.shine} opacity=".85">
          <rect x="70" y="244" width="10" height="2" rx="1" />
          <rect x="112" y="252" width="14" height="2" rx="1" />
          <rect x="160" y="248" width="8" height="2" rx="1" />
        </g>
      )}
      {/* in front: an olive branch, a dark cypress, the bushes */}
      <g fill={c.front}>
        <path d="M0 300V262C30 252 60 258 90 270S150 280 200 276 300 262 400 270V300Z" />
        <path d={cypress(398, 274, 104, 18)} />
        <path
          d="M-6 236C10 222 22 214 40 206"
          fill="none"
          stroke={c.front}
          strokeWidth="2.4"
        />
        {[
          [6, 226, -30],
          [12, 218, 40],
          [20, 216, -40],
          [26, 208, 30],
          [34, 206, -20],
          [2, 234, 30],
        ].map(([x, y, r]) => (
          <ellipse
            key={`${x} ${y}`}
            cx={x}
            cy={y}
            rx="7"
            ry="2.4"
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
      </g>
    </svg>
  )
}
