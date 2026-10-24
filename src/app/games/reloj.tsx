import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { article, meaning } from '../data/words'
import {
  MISSES,
  ROUND,
  bend,
  crown,
  drip,
  drips,
  dropFrom,
  fold,
  hand,
  marks,
  meltAt,
  meltOf,
  middle,
  progress,
  ring,
  round,
  scoreOf,
  spelling,
} from '../lib/reloj'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { NEEDS, clueCount } from '../lib/today'
import { TodayNext, useBack } from '../daily'
import { Es, KEY_ROWS, Speak, useFont, useLetterKeys, useMedia } from '../ui'
import type { Word } from '../data/words'
import type { Ledge } from '../lib/reloj'
import './reloj.css'

// El reloj blando: hangman in an empty desert, drawn as a poster of the
// 1930s. A pocket watch stands on the edge of a block of stone; each
// letter not in the word makes it melt further over the edge, while the
// sun sinks and the shadows grow long. At the seventh it has run down the
// stone and the word is lost; found in time, the watch springs back firm
// and the sun climbs again. The clock is bent by lib/reloj.ts.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Limelight&display=swap'

// What an answer says (lib/bank.ts). The meaning brings back the word,
// whose letters are then found one by one: with few wrong letters on the
// way, the word was recalled, about as good as picking it from a few;
// after many, it was partly pieced together from common letters; lost,
// it was not there to recall.
const CLEAN = 0.6
const LATE = 0.3
const LOST = 0.6
// The wrong letters a word may take and still count as recalled
const FEW = 3

interface Done {
  misses: number
  saved: boolean
}

const total = (done: Array<Done>) =>
  done.reduce((s, d) => s + (d.saved ? scoreOf(d.misses) : 0), 0)

export default function Reloj() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('reloj')
  const [game, setGame] = useState(() => ({
    n: 0,
    words: round(bank, Date.now()),
  }))
  const enough = game.words.length >= ROUND && clueCount(bank) >= NEEDS.reloj

  return (
    <div className="rb">
      <div className="rb-col">
        {enough ? (
          <Game
            key={game.n}
            words={game.words}
            back={back}
            onAgain={() =>
              setGame((g) => ({ n: g.n + 1, words: round(bank, Date.now()) }))
            }
          />
        ) : (
          <TooFew back={back} />
        )}
      </div>
    </div>
  )
}

type Mark = 'saved' | 'lost' | 'now' | 'later'

function Top({ back, marks: ms }: { back: string; marks?: Array<Mark> }) {
  const at = ms ? ms.findIndex((m) => m === 'now') : -1
  return (
    <header className="rb-top">
      <a className="rb-round" href={back} aria-label="Tilbake">
        <ArrowLeft />
      </a>
      <h1>
        El reloj blando<small>Den myke klokken</small>
      </h1>
      {ms && (
        <ol
          className="rb-dials"
          aria-label={
            at >= 0 ? `Ord ${at + 1} av ${ms.length}` : `${ms.length} ord`
          }
        >
          {ms.map((m, i) => (
            <li key={i} className={m}>
              <Dial melted={m === 'lost'} />
            </li>
          ))}
        </ol>
      )}
    </header>
  )
}

// A small watch: for each word of the round, and the words of the result
function Dial({ melted = false }: { melted?: boolean }) {
  return (
    <svg className="rb-dial" viewBox="0 0 24 24" aria-hidden="true">
      {melted ? (
        <path d="M3.5 9.5C3.5 4.5 20.5 4.5 20.5 9.5 20.5 13 16.5 13.5 15.2 18.2 14.6 21.6 12.4 21.8 11.9 18.4 11.2 13.6 3.5 13.4 3.5 9.5Z" />
      ) : (
        <>
          <circle cx="12" cy="13" r="8.2" />
          <path className="h" d="M12 13V8.4M12 13 15.2 14.6" />
          <path className="h" d="M12 4.8V2.6" />
        </>
      )}
    </svg>
  )
}

function TooFew({ back }: { back: string }) {
  const { bank } = useStore()
  return (
    <>
      <Top back={back} />
      <section className="rb-card">
        <p className="kick">Todavía no</p>
        <h2>Klokken trenger flere ord</h2>
        <p>
          Ordene her er ord du har møtt, og det trengs minst {NEEDS.reloj} som
          kan stå alene med en betydning. Hilsener og uttrykk kan ikke det. Du
          har {clueCount(bank)}.
        </p>
        <div className="acts">
          <a className="rb-btn" href="#nuevas">
            Lær nye ord
          </a>
          <a className="rb-link" href="#">
            Til forsiden
          </a>
        </div>
      </section>
    </>
  )
}

function Game({
  words,
  back,
  onAgain,
}: {
  words: Array<Word>
  back: string
  onAgain: () => void
}) {
  const { record, points, played, setBest, settings } = useStore()
  const [at, setAt] = useState(0)
  const [guessed, setGuessed] = useState<Array<string>>([])
  const [done, setDone] = useState<Array<Done>>([])
  const [over, setOver] = useState(false)

  const w = words[at]
  const p = progress(w, guessed)
  const misses = p.wrong.length
  const finished = p.solved || p.lost

  const guess = (k: string) => {
    if (over || finished || guessed.includes(k)) return
    const g = [...guessed, k]
    const q = progress(w, g)
    setGuessed(g)
    if (q.solved) {
      const m = q.wrong.length
      record(w.id, true, m <= FEW ? CLEAN : LATE, 'decir')
      setDone([...done, { misses: m, saved: true }])
      blip('right')
      if (settings.autoplay) void say(w.es)
    } else if (q.lost) {
      record(w.id, false, LOST, 'decir')
      setDone([...done, { misses: q.wrong.length, saved: false }])
      blip('wrong')
      if (settings.autoplay) setTimeout(() => void say(w.es), 700)
    } else blip(q.wrong.length > misses ? 'wrong' : 'tap')
  }

  const end = () => {
    const saved = done.filter((d) => d.saved).length
    setBest('reloj', total(done))
    if (saved) points(saved)
    played('reloj')
    setOver(true)
    setTimeout(() => blip('win'), 300)
  }

  const next = () => {
    if (over || !finished) return
    if (at + 1 >= words.length) return end()
    setAt(at + 1)
    setGuessed([])
  }

  useLetterKeys((k) => {
    if (k === 'Enter') next()
    else if (k !== 'Backspace') guess(k)
  }, !over)

  const ms: Array<Mark> = words.map((_, i) =>
    i < done.length
      ? done[i].saved
        ? 'saved'
        : 'lost'
      : i === at && !over
        ? 'now'
        : 'later',
  )

  return (
    <>
      <Top back={back} marks={ms} />
      <div className={`rb-play ${over ? 'over' : ''}`}>
        <Scene
          word={at}
          misses={misses}
          state={p.solved ? 'saved' : p.lost ? 'lost' : 'play'}
        />
        {over ? (
          <Result words={words} done={done} onAgain={onAgain} />
        ) : (
          <div className="rb-side">
            <div className="rb-ask">
              <p>Hva heter det på spansk?</p>
              <Drops misses={misses} />
            </div>
            <p className="rb-mean">{meaning(w)}</p>
            <Blanks w={w} guessed={guessed} solved={p.solved} lost={p.lost} />
            {finished ? (
              <After
                key={at}
                w={w}
                solved={p.solved}
                misses={misses}
                last={at + 1 >= words.length}
                onNext={next}
              />
            ) : (
              <Keys w={w} guessed={guessed} onKey={guess} />
            )}
          </div>
        )}
      </div>
    </>
  )
}

// The wrong letters so far, as drops fallen from the watch
function Drops({ misses }: { misses: number }) {
  return (
    <span
      className="rb-drops"
      role="img"
      aria-label={`${misses} av ${MISSES} feil`}
    >
      {Array.from({ length: MISSES }, (_, i) => (
        <svg key={i} viewBox="0 0 10 14" className={i < misses ? 'on' : ''}>
          <path d={DROP_PIP} />
        </svg>
      ))}
    </span>
  )
}

const DROP_PIP = 'M5 1C6.5 4 9 6.6 9 9.2A4 4 0 0 1 1 9.2C1 6.6 3.5 4 5 1Z'

function Blanks({
  w,
  guessed,
  solved,
  lost,
}: {
  w: Word
  guessed: Array<string>
  solved: boolean
  lost: boolean
}) {
  const a = article(w)
  const ls = spelling(w)
  const said = ls
    .map((l) => (guessed.includes(l.key) || lost ? l.shown : '–'))
    .join(' ')
  return (
    <p
      className={`rb-word ${solved ? 'solved' : ''} ${lost ? 'lost' : ''}`}
      lang="es"
      aria-label={`${a ? `${a.art} ` : ''}${said}`}
      aria-live="polite"
    >
      {a && (
        <span className={`art ${w.g === 'f' ? 'g-f' : 'g-m'}`}>{a.art}</span>
      )}
      <span className="slots" style={{ ['--n' as string]: ls.length }}>
        {ls.map((l, i) => {
          const open = guessed.includes(l.key)
          return (
            <span
              key={i}
              className={`slot ${open ? 'open' : lost ? 'gone' : ''}`}
              style={{ ['--i' as string]: i }}
            >
              {open || lost ? l.shown : ''}
            </span>
          )
        })}
      </span>
    </p>
  )
}

function Keys({
  w,
  guessed,
  onKey,
}: {
  w: Word
  guessed: Array<string>
  onKey: (k: string) => void
}) {
  const inWord = new Set(spelling(w).map((l) => l.key))
  return (
    <div className="rb-keys" aria-label="Tastatur">
      {KEY_ROWS.map((row, i) => (
        <div key={i}>
          {row.map((k) => {
            const used = guessed.includes(k)
            return (
              <button
                key={k}
                type="button"
                className={used ? (inWord.has(k) ? 'hit' : 'miss') : ''}
                disabled={used}
                onClick={() => onKey(k)}
              >
                {k}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function After({
  w,
  solved,
  misses,
  last,
  onNext,
}: {
  w: Word
  solved: boolean
  misses: number
  last: boolean
  onNext: () => void
}) {
  const go = useRef<HTMLButtonElement>(null)
  useEffect(() => go.current?.focus(), [])
  return (
    <div className={`rb-after ${solved ? 'saved' : 'lost'}`}>
      <p className="kick">{solved ? '¡A tiempo!' : '¡Se derritió!'}</p>
      <p className="said">
        <b lang="es">
          <Es w={w} peek />
        </b>
        <Speak text={w.es} small label={`Hør ${w.es}`} className="rb-speak" />
      </p>
      <p className="note">
        {!solved
          ? 'Ordet kommer igjen snart.'
          : misses
            ? `Reddet med ${misses} feil bokstav${misses > 1 ? 'er' : ''}.`
            : 'Reddet uten en eneste feil bokstav.'}
      </p>
      <button ref={go} type="button" className="rb-btn" onClick={onNext}>
        {last ? 'Se resultatet' : 'Neste ord'}
      </button>
    </div>
  )
}

function Result({
  words,
  done,
  onAgain,
}: {
  words: Array<Word>
  done: Array<Done>
  onAgain: () => void
}) {
  const { bank } = useStore()
  const saved = done.filter((d) => d.saved).length
  const score = total(done)
  const best = Math.max(bank.best.reloj ?? 0, score)
  return (
    <section className="rb-card rb-result">
      <p className="kick">
        {saved === words.length ? '¡Todos a tiempo!' : 'Se acabó el tiempo'}
      </p>
      <h2>
        {saved} av {words.length} ord reddet
      </h2>
      <p>
        {score} poeng.{' '}
        {score > 0 && score >= best
          ? 'Din beste runde hittil.'
          : best > 0
            ? `Din beste: ${best}.`
            : ''}
      </p>
      <ul>
        {words.map((w, i) => {
          const d = done.at(i)
          return (
            <li key={w.id} className={d?.saved ? 'saved' : 'lost'}>
              <Dial melted={!d?.saved} />
              <span className="txt">
                <b lang="es">
                  <Es w={w} peek />
                </b>
                <small>
                  {meaning(w)} ·{' '}
                  {!d?.saved
                    ? 'smeltet'
                    : d.misses
                      ? `${d.misses} feil`
                      : 'uten feil'}
                </small>
              </span>
              <Speak
                text={w.es}
                small
                label={`Hør ${w.es}`}
                className="rb-speak"
              />
            </li>
          )
        })}
      </ul>
      <div className="acts">
        <TodayNext page="reloj" className="rb-btn" />
        <button type="button" className="rb-btn" onClick={onAgain}>
          Fem ord til
        </button>
        <a className="rb-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// --- The scene ---

// The poster, and on a phone the part of it around the watch
const POSTER = '30 40 540 720'
const PHONE = '20 150 580 550'

const HORIZON = 420
// The block of stone: its face, and the far edges of its top and side
const BLOCK = { x0: 185, x1: 395, top: 452, base: 664 }
const BACK = { dx: 30, top: 434, base: 640 }
const LEDGE: Ledge = { x: 290, edge: BLOCK.top, r: 64 }
// Stones on the sand, far and near: where, and how big
const STONES = [
  [500, 482, 9],
  [110, 592, 13],
  [540, 742, 8],
  [334, 446, 5],
]
// Stars, as the light goes: where, and how big
const STARS = [
  [430, 112, 1],
  [556, 150, 0.8],
  [362, 140, 0.7],
  [252, 100, 0.9],
  [590, 86, 0.7],
  [70, 96, 0.6],
  [180, 160, 0.6],
]

// The colours by daylight, in the golden hour, and at dusk
const KEYS = [
  'skyTop',
  'skyMid',
  'skyLow',
  'sun',
  'halo',
  'cloud',
  'cloudShade',
  'mesa',
  'mesaFar',
  'sandFar',
  'sand',
  'sandNear',
  'streak',
  'top',
  'front',
  'side',
  'rim',
  'shadow',
] as const
type Palette = Record<(typeof KEYS)[number], string>

const DAY: Palette = {
  skyTop: '#c6d6d4',
  skyMid: '#e7e3d0',
  skyLow: '#f5e2bc',
  sun: '#fff5d6',
  halo: '#fbebc6',
  cloud: '#fcf6e8',
  cloudShade: '#e2d7c5',
  mesa: '#c4b4c2',
  mesaFar: '#d8cdd0',
  sandFar: '#ecd5a8',
  sand: '#e3c18c',
  sandNear: '#d8ae75',
  streak: '#f2dfb8',
  top: '#e6cba3',
  front: '#c29a70',
  side: '#a07c5c',
  rim: '#f7e5bf',
  shadow: '#8d6f7c',
}
const AMBER: Palette = {
  skyTop: '#9db3c2',
  skyMid: '#e9cf9e',
  skyLow: '#f7c47a',
  sun: '#ffdc7e',
  halo: '#fbd391',
  cloud: '#fde3bd',
  cloudShade: '#e6b78d',
  mesa: '#b29ab6',
  mesaFar: '#ccb2ba',
  sandFar: '#eabd84',
  sand: '#dca46d',
  sandNear: '#c98f59',
  streak: '#f0cf99',
  top: '#eec38d',
  front: '#b17f5c',
  side: '#88604b',
  rim: '#ffd893',
  shadow: '#7a566a',
}
const DUSK: Palette = {
  skyTop: '#3b3968',
  skyMid: '#b65f7a',
  skyLow: '#f08b53',
  sun: '#f36b3b',
  halo: '#f49a59',
  cloud: '#ec8c78',
  cloudShade: '#a3586b',
  mesa: '#69538a',
  mesaFar: '#8b6993',
  sandFar: '#c88a69',
  sand: '#a86c58',
  sandNear: '#875550',
  streak: '#c3866b',
  top: '#c98a69',
  front: '#7c5150',
  side: '#583946',
  rim: '#f7a66b',
  shadow: '#3a2949',
}

const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a: string, b: string, x: number) => {
  const p = rgb(a)
  const q = rgb(b)
  return `#${p
    .map((v, i) =>
      Math.round(v + (q[i] - v) * x)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

function paletteAt(t: number): Palette {
  const x = Math.max(0, Math.min(1, t))
  const [a, b, y] = x < 0.5 ? [DAY, AMBER, x / 0.5] : [AMBER, DUSK, x / 0.5 - 1]
  const out = {} as Palette
  for (const k of KEYS) out[k] = mix(a[k], b[k], y)
  return out
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

type Pt = [number, number]

// A point's shadow on the ground: away from the low sun, to the right
// and a little towards the onlooker
const SLANT = 0.16
const SLANT_DEG = (SLANT * 180) / Math.PI
const cast = (p: Pt, len: number): Pt => [
  p[0] + Math.cos(SLANT) * len,
  p[1] + Math.sin(SLANT) * len,
]

const pts = (ps: Array<Pt>) =>
  ps
    .map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`)
    .join(' ')

// A four-pointed star
const star = (x: number, y: number, z: number) =>
  `M${x} ${y - 7 * z}L${x + 1.6 * z} ${y - 1.6 * z}L${x + 7 * z} ${y}L${x + 1.6 * z} ${y + 1.6 * z}L${x} ${y + 7 * z}L${x - 1.6 * z} ${y + 1.6 * z}L${x - 7 * z} ${y}L${x - 1.6 * z} ${y - 1.6 * z}Z`

type SceneState = 'play' | 'saved' | 'lost'

interface Pose {
  // The melt, the time of day (0 morning, 1 dusk) and a wobble
  m: number
  t: number
  w: number
}

// The watch and the sky moved smoothly to where they should be: melting
// with a wobble, springing back firm in a beat, or a new watch at once
function usePose(word: number, misses: number, state: SceneState): Pose {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const m1 = state === 'saved' ? 0 : state === 'lost' ? 1 : meltOf(misses)
  const t1 = m1
  const [pose, setPose] = useState<Pose>({ m: m1, t: t1, w: 0 })
  const now = useRef(pose)
  const lastWord = useRef(word)

  useEffect(() => {
    const set = (q: Pose) => {
      now.current = q
      setPose(q)
    }
    const fresh = word !== lastWord.current
    lastWord.current = word
    const from = now.current
    if (reduced) {
      set({ m: m1, t: t1, w: 0 })
      return
    }
    const firm = state === 'saved'
    const dur = firm ? 1400 : fresh ? 1000 : 1100
    const start = performance.now()
    let raf = 0
    const step = (ts: number) => {
      const x = Math.max(0, Math.min(1, (ts - start) / dur))
      const e = 1 - (1 - x) ** 3
      let m = m1
      let w = 0
      if (firm) {
        // Back past firm, taller for a moment, and settling
        m =
          from.m * (1 - x) ** 3 * Math.cos(2.5 * Math.PI * x) -
          0.16 * Math.sin(Math.PI * x) * (1 - x)
      } else if (!fresh) {
        m = from.m + (m1 - from.m) * e
        w = 0.045 * Math.sin(x * Math.PI * 4) * (1 - x)
      }
      const t = from.t + (t1 - from.t) * (firm ? x * x * (3 - 2 * x) : e)
      set({ m, t, w })
      if (x < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [word, m1, t1, state, reduced])

  return pose
}

function Scene({
  word,
  misses,
  state,
}: {
  word: number
  misses: number
  state: SceneState
}) {
  const wide = useMedia('(min-width: 900px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const { m, t, w } = usePose(word, misses, state)
  const c = paletteAt(t)
  const g = LEDGE
  const k = meltAt(m, g.r, w)

  // The sun sinking, and the shadows growing long
  const sun: Pt = [112 - 22 * t, 240 + 180 * t]
  const height = BLOCK.base - BLOCK.top
  const ratio = 0.45 + 3 * t * t
  const len = height * ratio
  const a: Pt = [BLOCK.x0, BLOCK.base]
  const b: Pt = [BLOCK.x1, BLOCK.base]
  const s: Pt = [BLOCK.x1 + BACK.dx, BACK.base]
  const shadow = [a, cast(a, len), cast(b, len), cast(s, len), s]

  // The watch's own shadow, beyond the block's: as long as the watch
  // still stands tall
  const top = crown(k, g)
  const stand = Math.max(6, g.edge - bend(k, g, 0, 0)[1])
  const blob = cast([g.x, BLOCK.base], len + (stand / 2) * ratio)

  const hub = middle(k, g)
  const rim = ring(k, g, 1)
  const crease = fold(k, g)
  const runs = drips(k, g).filter((d) => d.long > 0.5)
  const from = dropFrom(k, g)
  const puddle = smooth(0.3, 1, m)
  const dripping = state !== 'saved' && m > 0.34 && !reduced
  const minute = 60 + 350 * m
  const hour = 300 + 29 * m

  const label =
    state === 'saved'
      ? 'Klokken står fast igjen'
      : state === 'lost'
        ? 'Klokken har smeltet ned'
        : misses
          ? `Klokken smelter: ${misses} av ${MISSES}`
          : 'En lommeklokke på en steinblokk i ørkenen'

  return (
    <div className="rb-scene">
      <svg
        viewBox={wide ? POSTER : PHONE}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={label}
      >
        <defs>
          {/* The block's top and face, where the watch throws its shadow */}
          <clipPath id="rb-stone">
            <polygon
              points={pts([
                [BLOCK.x0, BLOCK.base],
                [BLOCK.x0, BLOCK.top],
                [BLOCK.x0 + BACK.dx, BACK.top],
                [BLOCK.x1 + BACK.dx, BACK.top],
                [BLOCK.x1, BLOCK.top],
                [BLOCK.x1, BLOCK.base],
              ])}
            />
          </clipPath>
        </defs>

        {/* The sky, in flat bands */}
        <rect x="-300" y="-600" width="1200" height="770" fill={c.skyTop} />
        <rect
          x="-300"
          y="160"
          width="1200"
          height="90"
          fill={mix(c.skyTop, c.skyMid, 0.5)}
        />
        <rect x="-300" y="245" width="1200" height="75" fill={c.skyMid} />
        <rect
          x="-300"
          y="315"
          width="1200"
          height="65"
          fill={mix(c.skyMid, c.skyLow, 0.5)}
        />
        <rect x="-300" y="375" width="1200" height="60" fill={c.skyLow} />
        <path
          d="M452 330h70M500 344h56M24 348h52M470 398h88M150 404h30M40 270h46M520 262h40"
          stroke={mix(c.skyLow, '#ffffff', 0.35)}
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".7"
        />

        {/* Stars and the moon, as the light goes */}
        <g fill="#fff6dc" opacity={smooth(0.6, 1, t)}>
          {STARS.map(([x, y, z]) => (
            <path key={`${x}`} d={star(x, y, z)} />
          ))}
        </g>
        <path
          d="M508 150a15 15 0 1 0 14 20a12 12 0 1 1 -14 -20z"
          fill="#fbefd0"
          opacity={smooth(0.4, 0.85, t)}
        />

        {/* The sun, with its rings */}
        <g transform={`translate(${sun[0]} ${sun[1]})`}>
          <circle
            r={78 + 14 * t}
            fill={mix(c.skyLow, c.halo, 0.45)}
            opacity=".55"
          />
          <circle r={52 + 10 * t} fill={c.halo} opacity=".8" />
          <circle r={30 + 8 * t} fill={c.sun} />
        </g>

        {/* Clouds of cut paper */}
        <g fill={c.cloudShade} transform="translate(0 5)">
          <Cloud />
        </g>
        <g fill={c.cloud}>
          <Cloud />
        </g>
        <rect
          x="-40"
          y="338"
          width="250"
          height="8"
          rx="4"
          fill={c.cloud}
          opacity=".9"
        />
        <rect
          x="30"
          y="352"
          width="140"
          height="6"
          rx="3"
          fill={c.cloud}
          opacity=".75"
        />

        {/* The ground: far mesas, and sand to the edge */}
        <path d="M520 420 530 412H646L652 420Z" fill={c.mesaFar} />
        <path d="M-70 420-56 410H40L54 420Z" fill={c.mesaFar} />
        <path d="M446 420 462 404H560L574 420Z" fill={c.mesa} />
        <rect x="-300" y={HORIZON} width="1200" height="900" fill={c.sandFar} />
        <path
          d="M-300 444C-100 439 100 450 300 443S600 438 900 445V1300H-300Z"
          fill={c.sand}
        />
        <path
          d="M-300 700C-50 690 250 712 520 696S800 701 900 698V1300H-300Z"
          fill={c.sandNear}
        />
        <path
          d="M58 470h74M452 462h110M478 560h52M84 640h110M300 750h150M498 776h66M28 520h40M560 520h30M150 728h60M226 470h40"
          stroke={c.streak}
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".8"
        />

        {/* Shadows, long as the sun sinks */}
        <g fill={c.shadow} opacity=".5">
          <polygon points={pts(shadow)} />
          <ellipse
            cx={blob[0]}
            cy={blob[1]}
            rx={(stand / 2) * ratio}
            ry={g.r * k.wide * 0.18}
            transform={`rotate(${SLANT_DEG} ${blob[0]} ${blob[1]})`}
          />
          {STONES.map(([x, y, r]) => {
            const e = cast([x, y], r * (0.6 + 1.6 * ratio))
            const mid: Pt = [(x + e[0]) / 2, (y + e[1]) / 2]
            return (
              <ellipse
                key={x}
                cx={mid[0]}
                cy={mid[1] + r * 0.25}
                rx={(e[0] - x) / 2 + r * 0.6}
                ry={r * 0.42}
                transform={`rotate(${SLANT_DEG} ${mid[0]} ${mid[1]})`}
              />
            )
          })}
        </g>
        <g fill={c.side}>
          {STONES.map(([x, y, r]) => (
            <path
              key={x}
              d={`M${x - r} ${y}C${x - r} ${y - r * 0.9} ${x + r * 0.7} ${y - r} ${x + r} ${y}Z`}
            />
          ))}
        </g>

        {/* The block of stone: its side, its face and its top */}
        <polygon
          points={pts([
            [BLOCK.x1, BLOCK.top],
            [BLOCK.x1 + BACK.dx, BACK.top],
            [BLOCK.x1 + BACK.dx, BACK.base],
            [BLOCK.x1, BLOCK.base],
          ])}
          fill={c.side}
        />
        <rect
          x={BLOCK.x0}
          y={BLOCK.top}
          width={BLOCK.x1 - BLOCK.x0}
          height={height}
          fill={c.front}
        />
        <polygon
          points={pts([
            [BLOCK.x0, BLOCK.top],
            [BLOCK.x0 + BACK.dx, BACK.top],
            [BLOCK.x1 + BACK.dx, BACK.top],
            [BLOCK.x1, BLOCK.top],
          ])}
          fill={c.top}
        />
        <path
          d="M352 500h30M318 590h52M210 630h40M364 646h20"
          stroke={mix(c.front, c.side, 0.7)}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={`M${BLOCK.x0 + 1.5} ${BLOCK.base}V${BLOCK.top}H${BLOCK.x1}`}
          fill="none"
          stroke={c.rim}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Gold run down to the ground */}
        {puddle > 0 && (
          <g transform={`translate(${from[0]} ${BLOCK.base + 6})`}>
            <ellipse
              rx={6 + 44 * puddle}
              ry={2 + 7 * puddle}
              fill={GOLD}
              stroke={BROWN}
              strokeWidth="1.5"
            />
            <ellipse
              cx={-10 * puddle}
              cy={-2 * puddle}
              rx={14 * puddle}
              ry={1.6 * puddle}
              fill={SHINE}
            />
          </g>
        )}
        {dripping && (
          <g
            transform={`translate(${from[0]} ${from[1] - 3})`}
            className="rb-fall"
            style={{
              ['--fall' as string]: `${BLOCK.base + 4 - from[1]}px`,
              ['--dur' as string]: `${2.4 - 1.1 * m}s`,
            }}
          >
            <path d={DROP} />
            <path d={DROP} />
          </g>
        )}

        {/* A burst of light as the watch springs back */}
        {state === 'saved' && !reduced && (
          <g key={`b${word}`} transform={`translate(${g.x} ${g.edge - g.r})`}>
            <g className="rb-burst">
              {Array.from({ length: 14 }, (_, i) => (
                <path
                  key={i}
                  d="M-6 -80L0 -136L6 -80Z"
                  transform={`rotate(${(i * 360) / 14})`}
                />
              ))}
            </g>
          </g>
        )}

        {/* The watch */}
        <g key={word} className={reduced ? '' : 'rb-clock'}>
          <g clipPath="url(#rb-stone)" opacity=".35">
            <path d={rim} fill={c.shadow} transform="translate(9 4)" />
          </g>
          <path d={top.bow} fill="none" stroke={BROWN} strokeWidth="9" />
          <path d={top.bow} fill="none" stroke={GOLD} strokeWidth="4.5" />
          <path
            d={top.stem}
            fill={GOLD}
            stroke={BROWN}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {runs.map((d, i) => (
            <path
              key={i}
              d={drip(d)}
              fill={GOLD}
              stroke={BROWN}
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ))}
          <path
            d={rim}
            fill={GOLD}
            stroke={BROWN}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {runs.map((d, i) => (
            <path
              key={i}
              d={`M${d.x - d.wide * 0.35} ${d.y}v${d.long * 0.75}`}
              stroke={SHINE}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
          <path
            d={ring(k, g, 0.93, 60)}
            fill="none"
            stroke={SHINE}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="13 87"
            strokeDashoffset={-79}
          />
          <path
            d={ring(k, g, 0.84)}
            fill="#fbf3dc"
            stroke={BROWN}
            strokeWidth="2"
          />
          <path
            d={marks(k, g)}
            stroke={INK}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path d={hand(k, g, hour, 0.42, 0.1)} fill={INK} />
          <path d={hand(k, g, minute, 0.64, 0.075)} fill={INK} />
          <circle cx={hub[0]} cy={hub[1]} r="5" fill={INK} />
          <circle cx={hub[0]} cy={hub[1]} r="1.8" fill={GOLD} />
          {crease && (
            <path
              d={crease}
              stroke={BROWN}
              strokeWidth="2"
              strokeLinecap="round"
              opacity=".4"
            />
          )}
        </g>
      </svg>
      <i className="rb-grain" aria-hidden="true" />
    </div>
  )
}

// The watch's gold, its shine, its dark edge, and the ink of its face
const GOLD = '#e3a83e'
const SHINE = '#f8d78a'
const BROWN = '#6b3f1d'
const INK = '#2e2340'

// A drop, hanging from its top
const DROP = 'M0 -2C2.6 2 6 5.5 6 9A6 6 0 0 1 -6 9C-6 5.5 -2.6 2 0 -2Z'

function Cloud() {
  return (
    <>
      <rect x="378" y="189" width="186" height="15" rx="7.5" />
      <circle cx="414" cy="191" r="15" />
      <circle cx="446" cy="182" r="21" />
      <circle cx="483" cy="186" r="17" />
      <circle cx="514" cy="192" r="12" />
      <circle cx="540" cy="195" r="9" />
    </>
  )
}
