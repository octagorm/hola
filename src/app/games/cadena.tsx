import { Fragment, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Delete } from 'lucide-react'
import { WORDS, meaning } from '../data/words'
import {
  LENGTH,
  choices,
  extend,
  fitting,
  link,
  nextOf,
  plan,
} from '../lib/cadena'
import { letters, syllables } from '../lib/spanish'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { kindFor } from '../quiz'
import { TodayNext, useBack } from '../daily'
import { Es, KEY_ROWS, Speak, useFont, useLetterKeys } from '../ui'
import type { CSSProperties } from 'react'
import type { Word } from '../data/words'
import type { Bank } from '../lib/bank'
import './cadena.css'

// Palabras encadenadas: a chain of words, each beginning with the last
// syllable of the one before (casa → sábado → domingo …). The chain is
// found among her words before the game starts (lib/cadena.ts); each link
// gives the meaning of a word that fits as the clue, and any of Hola's
// words that fits counts. Each word made hangs a paper flag on the
// garlands of a summer verbena in a village square at night.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Figtree:wght@400;500;600;700;800&display=swap'

// How a link was made: typed, or picked from four, without help; with
// letters given or a wrong pick first; or shown
type How = 'start' | 'typed' | 'picked' | 'helped' | 'shown'

interface Link {
  w: Word
  how: How
}

const CLEAN: Array<How> = ['typed', 'picked']

// Typed, or picked from four: a word whose saying has held a while is
// typed, as in the other practice; a weaker one, or one not met, picked
const typedFor = (bank: Bank, w: Word) =>
  !!bank.cards[w.id] && kindFor('decir', bank.cards[w.id], true) === 'escribir'

export default function Cadena() {
  useFont(FONTS)
  const { bank } = useStore()
  const [game, setGame] = useState(() => ({
    n: 0,
    path: plan(bank, Date.now()),
  }))
  return (
    <div className="en-verbena">
      {game.path ? (
        <Game
          key={game.n}
          start={game.path}
          onAgain={() =>
            setGame((g) => ({ n: g.n + 1, path: plan(bank, Date.now()) }))
          }
        />
      ) : (
        <>
          <Night chain={[]} />
          <main className="en-col">
            <section className="en-panel en-card">
              <p className="kick">Todavía no</p>
              <h2>Kjeden trenger flere ord</h2>
              <p>Lær noen nye ord først, så kan de henges opp.</p>
              <div className="en-acts">
                <a className="en-btn" href="#nuevas">
                  Lær nye ord
                </a>
                <a className="en-link" href="#">
                  Til forsiden
                </a>
              </div>
            </section>
          </main>
        </>
      )}
      <Plaza />
    </div>
  )
}

function Game({ start, onAgain }: { start: Array<Word>; onAgain: () => void }) {
  const { bank, record, meet, points, setBest, played } = useStore()
  // The words planned, the chain made so far among them
  const [path, setPath] = useState<Array<Word>>(start)
  const [chain, setChain] = useState<Array<Link>>(() => [
    { w: start[0], how: 'start' },
  ])
  const [typed, setTyped] = useState('')
  // Letters of the word given away, after the syllable
  const [hint, setHint] = useState(0)
  const [wrong, setWrong] = useState<Array<string>>([])
  const [note, setNote] = useState<{ text: string; ok?: boolean } | null>(null)
  // A word shown when she did not know it, until she goes on
  const [shown, setShown] = useState<Word | null>(null)
  const [end, setEnd] = useState<{ score: number; before: number } | null>(null)
  const pool = useMemo(
    () => WORDS.filter((w) => bank.cards[w.id]),
    [bank.cards],
  )

  const k = chain.length
  const want = path.at(k)
  const last = chain[chain.length - 1].w
  const syl = link(last.bare)
  // Typed or picked, decided when the link comes up
  const [typing, setTyping] = useState(() =>
    start[1] ? typedFor(bank, start[1]) : true,
  )
  const [opts, setOpts] = useState<Array<Word>>(() =>
    start[1] ? choices(start[1], [start[0]], pool) : [],
  )
  // What is typed as of the last key, since keys can come faster than the
  // page is drawn again
  const live = useRef('')

  // The letters she need not type: the syllable, and any given away
  const lockedLen = want
    ? Math.max(letters(syl).length, letters(syl).length + hint)
    : 0
  const locked = want
    ? hint
      ? letters(want.bare).slice(0, lockedLen)
      : letters(syl)
    : ''

  // On to the next link, or the end
  const advance = (made: Array<Link>, route: Array<Word>) => {
    setChain(made)
    setPath(route)
    setTyped('')
    live.current = ''
    setHint(0)
    setWrong([])
    setShown(null)
    if (made.length > LENGTH) {
      const score = made.filter((l) => CLEAN.includes(l.how)).length
      setEnd({ score, before: bank.best.cadena ?? 0 })
      setBest('cadena', score)
      if (score) points(score)
      played('cadena')
      setTimeout(() => blip('win'), 500)
      return
    }
    const next = route[made.length]
    setTyping(typedFor(bank, next))
    setOpts(
      choices(
        next,
        made.map((l) => l.w),
        pool,
      ),
    )
  }

  // A word made: hung on the garland, and said
  const hang = (w: Word, how: How, route = path) => {
    blip('right')
    void say(w.es)
    advance([...chain, { w, how }], route)
  }

  const submit = () => {
    if (!want || end || shown) return
    const word = locked + live.current
    if (word.length < 2) return
    if (word === letters(want.bare)) {
      // Typed from its meaning: as much as a word can say; with letters
      // given away, a little
      if (bank.cards[want.id]) record(want.id, true, hint ? 0.3 : 1, 'decir')
      else meet([want.id])
      setNote({ text: `${want.bare} · ${meaning(want)}`, ok: true })
      hang(want, hint ? 'helped' : 'typed')
      return
    }
    const words = chain.map((l) => l.w)
    const fits = fitting(words, word)
    const w = fits.find((x) => bank.cards[x.id]) ?? fits.at(0)
    if (!w) {
      const used = words.some((x) => letters(x.bare) === word)
      setNote({
        text: used
          ? 'Det ordet henger alt i kjeden. Prøv et annet.'
          : 'Det ordet kjenner ikke Hola ennå. Prøv et annet.',
      })
      blip('tap')
      return
    }
    // Another word that fits: the chain goes on from it, if it can
    const left = LENGTH - k
    const rest = left
      ? extend([...words, w], left, bank, Date.now())
      : [...words, w]
    if (!rest) {
      setNote({
        text: nextOf(w).length
          ? `${w.bare} passer, men kjeden kan ikke bli lang nok derfra. Prøv et annet.`
          : `${w.bare} passer, men ingen ord begynner på ${link(w.bare)}-. Prøv et annet.`,
      })
      blip('tap')
      return
    }
    // A word of her own that fits, not the one asked for: a lucky find,
    // which says little of how well she knows it
    if (bank.cards[w.id]) record(w.id, true, 0.3, 'decir')
    else meet([w.id])
    setNote({ text: `Det passer også! ${w.bare} · ${meaning(w)}`, ok: true })
    hang(w, hint ? 'helped' : 'typed', rest)
  }

  const pick = (o: Word) => {
    if (!want || end || shown || wrong.includes(o.id)) return
    if (o.id === want.id) {
      // Picked from four, only one of them beginning right: less than
      // typing it
      if (!bank.cards[want.id]) meet([want.id])
      else if (!wrong.length) record(want.id, true, 0.6, 'decir')
      setNote({ text: `${want.bare} · ${meaning(want)}`, ok: true })
      hang(want, wrong.length ? 'helped' : 'picked')
      return
    }
    // The first wrong pick counts against the word asked for
    if (!wrong.length && bank.cards[want.id])
      record(want.id, false, 0.6, 'decir')
    setWrong([...wrong, o.id])
    setNote({ text: `${o.bare} begynner ikke på ${syl}-.` })
    blip('wrong')
  }

  // One more letter of the word, after the syllable
  const more = () => {
    if (!want || shown || end) return
    if (lockedLen >= letters(want.bare).length - 1) return
    setHint(hint + 1)
    setTyped('')
    live.current = ''
    setNote(null)
  }

  // She does not know it: the word is shown and hung, and she goes on.
  // Not knowing a word asked for by its meaning counts fully against it.
  const giveUp = () => {
    if (!want || shown || end) return
    if (bank.cards[want.id]) record(want.id, false, 1, 'decir')
    else meet([want.id])
    blip('wrong')
    void say(want.es)
    setNote(null)
    setShown(want)
  }

  const goOn = () => {
    if (!shown) return
    advance([...chain, { w: shown, how: 'shown' }], path)
  }

  const onKey = (key: string) => {
    if (end) return
    if (shown) {
      if (key === 'Enter') goOn()
      return
    }
    if (!typing) return
    if (key === 'Enter') return submit()
    if (key === 'Backspace') {
      live.current = live.current.slice(0, -1)
      setTyped(live.current)
      return
    }
    if (live.current.length + lockedLen >= 14) return
    live.current += key
    setTyped(live.current)
    setNote(null)
  }
  useLetterKeys(onKey, !end)

  return (
    <>
      <Night chain={chain} shown={shown} done={!!end} />
      <main className="en-col">
        {end ? (
          <End chain={chain} end={end} onAgain={onAgain} />
        ) : (
          <>
            <section className="en-panel" aria-live="polite">
              <div className="en-step">
                <span>
                  Ledd {Math.min(k, LENGTH)} av {LENGTH}
                </span>
                <i aria-hidden="true">
                  {Array.from({ length: LENGTH }, (_, i) =>
                    chain.at(i + 1),
                  ).map((l, i) => (
                    <b
                      key={i}
                      className={
                        !l ? '' : CLEAN.includes(l.how) ? 'ok' : 'help'
                      }
                    />
                  ))}
                </i>
              </div>
              <div className="en-from" lang="es">
                <span className="word">
                  {syllables(last.bare).map((s, i, all) => (
                    <Fragment key={i}>
                      {i > 0 && <i>·</i>}
                      <span className={i === all.length - 1 ? 'end' : ''}>
                        {s}
                      </span>
                    </Fragment>
                  ))}
                </span>
                <ArrowRight aria-hidden="true" />
                <span className="link">{syl}…</span>
              </div>
              {shown ? (
                <div className="en-shown">
                  <p>
                    Det var <b lang="es">{shown.bare}</b>
                    <span>{meaning(shown)}</span>
                  </p>
                  <div className="en-acts">
                    <Speak text={shown.es} label={`Hør ${shown.es}`} />
                    <button type="button" className="en-btn" onClick={goOn}>
                      Neste <ArrowRight />
                    </button>
                  </div>
                </div>
              ) : (
                want && (
                  <>
                    <p className="en-clue">
                      <small>
                        {k === 1
                          ? `Hvert ord begynner med siste stavelse i ordet før. Et ord på ${syl}- som betyr`
                          : `Et ord på ${syl}- som betyr`}
                      </small>
                      «{meaning(want)}»
                    </p>
                    {typing ? (
                      <div className="en-answer" aria-label="Svaret ditt">
                        <span className="lock">{locked}</span>
                        <span className="typed">{typed}</span>
                        <span className="caret" />
                      </div>
                    ) : (
                      <div className="en-opts">
                        {opts.map((o, i) => (
                          <button
                            key={o.id}
                            type="button"
                            className={`hue-${HUES[(i + 1) % 4]} ${wrong.includes(o.id) ? 'no' : ''}`}
                            disabled={wrong.includes(o.id)}
                            onClick={() => pick(o)}
                            lang="es"
                          >
                            {o.bare}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={`en-note ${note?.ok ? 'ok' : ''}`}>
                      {note?.ok && <Check aria-hidden="true" />}
                      {note?.text ??
                        (typing
                          ? 'Skriv ordet. Aksenter trengs ikke.'
                          : 'Velg ordet som begynner riktig.')}
                    </p>
                    {typing && (
                      <div className="en-acts">
                        <button
                          type="button"
                          className="en-btn ghost"
                          disabled={lockedLen >= letters(want.bare).length - 1}
                          onClick={more}
                        >
                          En bokstav til
                        </button>
                        <button
                          type="button"
                          className="en-link"
                          onClick={giveUp}
                        >
                          Vet ikke
                        </button>
                        <button
                          type="button"
                          className="en-btn"
                          disabled={!typed && lockedLen < 2}
                          onClick={submit}
                        >
                          Svar
                        </button>
                      </div>
                    )}
                  </>
                )
              )}
            </section>
            {typing && !shown && (
              <div className="en-keys" aria-label="Tastatur">
                {KEY_ROWS.map((row, i) => (
                  <div key={i}>
                    {row.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onKey(key)}
                      >
                        {key}
                      </button>
                    ))}
                    {i === 2 && (
                      <button
                        type="button"
                        className="wide"
                        aria-label="Slett"
                        onClick={() => onKey('Backspace')}
                      >
                        <Delete />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}

// The night over the square: the way back and the title, then the
// garlands hung in front of the village
function Night({
  chain,
  shown = null,
  done = false,
}: {
  chain: Array<Link>
  shown?: Word | null
  done?: boolean
}) {
  const back = useBack('cadena')
  return (
    <div className="en-night">
      <svg className="en-moon" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M24 3A17 17 0 1 0 37 30 14 14 0 1 1 24 3Z" />
      </svg>
      <header className="en-top">
        <a className="en-round" href={back} aria-label="Tilbake">
          <ArrowLeft />
        </a>
        <h1>
          Palabras encadenadas<small>Ordkjeden</small>
        </h1>
      </header>
      <div className="en-scene">
        <Village lit={done} />
        <Garland chain={chain} shown={shown} done={done} />
      </div>
    </div>
  )
}

// The colours of the paper flags, in turn along the garlands, and the
// three places on a string
const HUES = ['red', 'saffron', 'cream', 'coral', 'green']
const SPOTS = ['left', 'mid', 'right']

// The garlands: three strings of three paper flags, the first word's and
// one for each word made, each said on a tap
function Garland({
  chain,
  shown,
  done,
}: {
  chain: Array<Link>
  shown: Word | null
  done: boolean
}) {
  const flags: Array<Link | null> = Array.from(
    { length: LENGTH + 1 },
    (_, i) =>
      chain.at(i) ??
      (i === chain.length && shown ? { w: shown, how: 'shown' } : null),
  )
  const next = shown ? -1 : chain.length
  return (
    <div className={`en-garland ${done ? 'done' : ''}`}>
      {[0, 1, 2].map((row) => (
        <div key={row} className="en-string">
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M-2 4Q50 44 102 4" />
          </svg>
          {[0, 1, 2].map((col) => {
            const i = row * 3 + col
            const f = flags[i]
            // (where on its string a flag hangs is in cadena.css)
            const style = { '--i': i } as CSSProperties
            if (!f)
              return (
                <span
                  key={col}
                  className={`en-flag ${SPOTS[col]} empty ${i === next && chain.length ? 'next' : ''}`}
                  style={style}
                />
              )
            const n = f.w.bare.length
            return (
              <button
                key={col}
                type="button"
                className={`en-flag ${SPOTS[col]} hue-${HUES[(i * 3) % HUES.length]} ${f.how === 'shown' ? 'pale' : ''} ${n >= 10 ? 'xl' : n >= 8 ? 'l' : ''}`}
                style={style}
                onClick={() => void say(f.w.es)}
                aria-label={`Hør ${f.w.es}`}
                lang="es"
              >
                <span>{f.w.bare}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function End({
  chain,
  end,
  onAgain,
}: {
  chain: Array<Link>
  end: { score: number; before: number }
  onAgain: () => void
}) {
  const best = Math.max(end.before, end.score)
  return (
    <section className="en-panel en-card">
      <p className="kick">
        {end.score === LENGTH ? '¡Cadena perfecta!' : '¡Cadena completa!'}
      </p>
      <h2>
        {end.score} av {LENGTH} uten hjelp
      </h2>
      <p>
        {end.score > end.before && end.before > 0
          ? `Ny rekord! Den forrige var ${end.before}.`
          : end.score >= best
            ? 'Din beste kjede hittil.'
            : `Din beste kjede: ${best} av ${LENGTH}.`}
      </p>
      <ol className="en-list">
        {chain.map((l, i) => {
          // The part that came from the word before
          const from = i ? link(chain[i - 1].w.bare).length : 0
          return (
            <li
              key={l.w.id}
              className={
                l.how === 'start' ? '' : CLEAN.includes(l.how) ? 'ok' : 'help'
              }
            >
              <b lang="es">
                {from > 0 && (
                  <span className="from">{l.w.bare.slice(0, from)}</span>
                )}
                {l.w.bare.slice(from)}
              </b>
              <span>
                <Es w={l.w} peek /> · {meaning(l.w)}
              </span>
              <Speak
                text={l.w.es}
                small
                label={`Hør ${l.w.es}`}
                className="en-speak"
              />
            </li>
          )
        })}
      </ol>
      <div className="en-acts">
        <TodayNext page="cadena" className="en-btn" />
        <button type="button" className="en-btn ghost" onClick={onAgain}>
          En kjede til
        </button>
        <a className="en-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// --- The village round the square, in layers of cut paper ---

// A house: its wall from x, w wide, up to `top`, under a low tiled roof
interface House {
  x: number
  w: number
  top: number
  wall: string
  roof: string
}

const HOUSES: Array<House> = [
  { x: -10, w: 100, top: 74, wall: '#f3ead6', roof: '#c4582f' },
  { x: 84, w: 112, top: 60, wall: '#ebdfc4', roof: '#a9462a' },
  { x: 240, w: 98, top: 80, wall: '#f3ead6', roof: '#c4582f' },
  { x: 332, w: 120, top: 64, wall: '#ebdfc4', roof: '#a9462a' },
  { x: 556, w: 112, top: 70, wall: '#f3ead6', roof: '#c4582f' },
  { x: 712, w: 108, top: 58, wall: '#ebdfc4', roof: '#a9462a' },
  { x: 814, w: 98, top: 78, wall: '#f3ead6', roof: '#c4582f' },
  { x: 906, w: 106, top: 66, wall: '#ebdfc4', roof: '#a9462a' },
]

// Windows as [x, y, w, h], lit or dark; the dark ones light up when the
// chain is done
const WINDOWS: Array<[number, number, number, number, boolean]> = [
  [12, 90, 12, 16, true],
  [52, 90, 12, 16, false],
  [102, 72, 14, 18, true],
  [142, 72, 14, 18, false],
  [104, 110, 14, 18, false],
  [256, 96, 12, 16, true],
  [300, 96, 12, 16, false],
  [348, 80, 13, 18, true],
  [386, 80, 13, 18, false],
  [424, 80, 13, 18, true],
  [352, 114, 13, 18, true],
  [572, 86, 14, 18, true],
  [610, 86, 14, 18, false],
  [644, 86, 12, 18, true],
  [578, 114, 14, 18, false],
  [728, 72, 14, 18, false],
  [770, 72, 14, 18, true],
  [742, 108, 14, 18, true],
  [830, 94, 12, 16, true],
  [872, 94, 12, 16, false],
  [924, 82, 14, 18, true],
  [964, 82, 14, 18, false],
  [940, 112, 14, 18, true],
]

// Doors as [x, w, colour]
const DOORS: Array<[number, number, string]> = [
  [148, 18, '#2f5a3e'],
  [298, 16, '#7a3b22'],
  [402, 18, '#2f5a3e'],
  [620, 18, '#7a3b22'],
  [784, 18, '#2f5a3e'],
  [848, 16, '#7a3b22'],
]

// Balconies with geraniums, as [x1, x2, y]
const BALCONIES: Array<[number, number, number]> = [
  [94, 168, 94],
  [340, 444, 102],
  [720, 800, 94],
]

// Cypresses behind, as [x, base, height, half width]
const CYPRESSES: Array<[number, number, number, number]> = [
  [120, 98, 60, 8],
  [136, 98, 46, 7],
  [318, 96, 64, 9],
  [334, 96, 50, 7],
  [648, 94, 60, 8],
  [664, 94, 46, 7],
  [874, 98, 54, 8],
]

// Orange trees in front, as [x, y, radius]
const ORANGE_TREES: Array<[number, number, number]> = [
  [222, 104, 24],
  [690, 106, 22],
]

// The lantern string: two swags meeting at the bell tower
const sag = (x: number) => {
  const left = x <= 500
  const t = left ? x / 500 : (x - 500) / 500
  const [a, b] = left ? [50, 56] : [56, 50]
  return a * (1 - t) ** 2 + 184 * t * (1 - t) + b * t * t
}
const LANTERNS: Array<[number, string]> = [
  [60, '#fff1cf'],
  [180, '#ffd36b'],
  [300, '#ff9d73'],
  [420, '#fff1cf'],
  [580, '#ffd36b'],
  [700, '#fff1cf'],
  [820, '#ff9d73'],
  [940, '#ffd36b'],
]

const cypress = ([x, base, h, w]: [number, number, number, number]) =>
  `M${x - w} ${base}C${x - w} ${base - h * 0.55} ${x - w * 0.4} ${base - h * 0.86} ${x} ${base - h}C${x + w * 0.4} ${base - h * 0.86} ${x + w} ${base - h * 0.55} ${x + w} ${base}Z`

function Village({ lit }: { lit: boolean }) {
  return (
    <svg
      className={`en-village ${lit ? 'lit' : ''}`}
      viewBox="0 0 1000 140"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="en-cut" x="-5%" y="-20%" width="110%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="1.8"
            floodColor="#050a1f"
            floodOpacity=".55"
          />
        </filter>
        <radialGradient id="en-glow">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity=".85" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Hills, cypresses and the bell tower, far off */}
      <g filter="url(#en-cut)">
        <path
          d="M0 104C80 90 160 96 240 88S400 78 500 84 700 76 780 86 920 90 1000 82V140H0Z"
          fill="#16234d"
        />
        {CYPRESSES.map((c, i) => (
          <path key={i} d={cypress(c)} fill={i % 2 ? '#163a26' : '#10301f'} />
        ))}
        <path d="M472 140V50H528V140Z" fill="#e3cfa6" />
        <path d="M466 52 500 30 534 52Z" fill="#b9542c" />
        <path d="M466 52H534V56H466Z" fill="#c9b38a" />
        <path d="M472 84H528V88H472Z" fill="#c9b38a" />
        <path d="M488 80V64C488 55 512 55 512 64V80Z" fill="#16234d" />
        <path
          d="M494.5 75C494.5 68 496.5 65 500 65S505.5 68 505.5 75Z"
          fill="#d9a640"
        />
        <path
          d="M500 30V19M495.5 23H504.5"
          stroke="#e3cfa6"
          strokeWidth="1.8"
        />
        <path d="M497 98H503V110H497Z" fill="#16234d" />
      </g>
      {/* The houses round the square, and the church's door */}
      <g filter="url(#en-cut)">
        {HOUSES.map((h, i) => (
          <g key={i}>
            <path d={`M${h.x} 140V${h.top}H${h.x + h.w}V140Z`} fill={h.wall} />
            <path
              d={`M${h.x - 5} ${h.top + 2}L${h.x + h.w / 2} ${h.top - 9}L${h.x + h.w + 5} ${h.top + 2}Z`}
              fill={h.roof}
            />
            <path
              d={`M${h.x - 5} ${h.top + 2}H${h.x + h.w + 5}V${h.top + 4.5}H${h.x - 5}Z`}
              fill="#7d3219"
              opacity=".55"
            />
          </g>
        ))}
        <path d="M452 140V100H548V140Z" fill="#e9dcc0" />
        <path d="M448 100H552V95H448Z" fill="#b9542c" />
        <path d="M486 140V120C486 110 514 110 514 120V140Z" fill="#6b3420" />
        {WINDOWS.map(([x, y, w, h, on], i) => (
          <path
            key={i}
            className={on ? 'win on' : 'win'}
            d={`M${x} ${y + h}V${y + 4}Q${x + w / 2} ${y - 2} ${x + w} ${y + 4}V${y + h}Z`}
          />
        ))}
        {DOORS.map(([x, w, c], i) => (
          <path
            key={i}
            d={`M${x} 140V${140 - 26}Q${x + w / 2} ${140 - 31} ${x + w} ${140 - 26}V140Z`}
            fill={c}
          />
        ))}
        {BALCONIES.map(([a, b, y], i) => (
          <g key={i}>
            <path
              d={`M${a} ${y}H${b}M${a} ${y + 10}H${b}${Array.from(
                { length: Math.floor((b - a) / 5) + 1 },
                (_, j) => `M${a + j * 5} ${y}V${y + 10}`,
              ).join('')}`}
              stroke="#241a14"
              strokeWidth="1.2"
            />
            <path
              d={`M${a - 2} ${y + 10}H${b + 2}V${y + 13}H${a - 2}Z`}
              fill="#241a14"
            />
            {Array.from({ length: Math.floor((b - a) / 12) }, (_, j) => {
              const cx = a + 6 + j * 12
              return (
                <g key={j}>
                  <circle cx={cx - 2} cy={y - 2} r="3" fill="#2e5a32" />
                  <circle cx={cx + 3} cy={y - 1.5} r="2.6" fill="#2e5a32" />
                  <circle cx={cx} cy={y - 4} r="2.4" fill="#d8402d" />
                  <circle cx={cx + 4} cy={y - 5} r="1.8" fill="#e8604a" />
                </g>
              )
            })}
          </g>
        ))}
        {ORANGE_TREES.map(([x, y, r], i) => (
          <g key={i}>
            <path d={`M${x - 2} 140V${y}H${x + 2}V140Z`} fill="#3a2414" />
            <circle cx={x} cy={y - 6} r={r} fill="#1f4a2c" />
            <circle cx={x - r * 0.55} cy={y + 2} r={r * 0.6} fill="#245433" />
            <circle cx={x + r * 0.6} cy={y} r={r * 0.62} fill="#1c4429" />
            {[
              [-0.5, -0.6],
              [0.1, -0.9],
              [0.55, -0.35],
              [-0.25, 0],
              [0.3, 0.25],
              [-0.8, 0.2],
              [0.85, 0.15],
              [0, -0.3],
            ].map(([dx, dy], j) => (
              <circle
                key={j}
                cx={x + dx * r}
                cy={y - 6 + dy * r}
                r="2.4"
                fill="#f08a2a"
              />
            ))}
          </g>
        ))}
      </g>
      {/* Paper lanterns strung across the square */}
      <path
        d="M0 50Q250 92 500 56T1000 50"
        fill="none"
        stroke="#241a14"
        strokeWidth="1"
      />
      {LANTERNS.map(([x, c]) => {
        const y = sag(x)
        return (
          <g key={x} className="lantern">
            <circle
              className="glow"
              cx={x}
              cy={y + 12}
              r="22"
              fill="url(#en-glow)"
            />
            <path d={`M${x} ${y}v3`} stroke="#241a14" strokeWidth="1" />
            <ellipse cx={x} cy={y + 12} rx="7.5" ry="8.5" fill={c} />
            <path
              d={`M${x - 7.5} ${y + 12}h15M${x - 6.5} ${y + 7.5}h13M${x - 6.5} ${y + 16.5}h13`}
              stroke="#c98a3a"
              strokeWidth=".6"
              opacity=".7"
            />
            <path
              d={`M${x - 3.5} ${y + 2.5}h7v2h-7zM${x - 3.5} ${y + 20}h7v2h-7z`}
              fill="#241a14"
            />
          </g>
        )
      })}
    </svg>
  )
}

// The square itself, on a wide screen: a café table on one side and
// geraniums on the other
function Plaza() {
  return (
    <div className="en-plaza" aria-hidden="true">
      <svg className="en-table" viewBox="0 0 240 170">
        <defs>
          <pattern
            id="en-check"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <rect width="14" height="14" fill="#f6ecd6" />
            <rect width="7" height="14" fill="#c8402c" opacity=".55" />
            <rect width="14" height="7" fill="#c8402c" opacity=".55" />
          </pattern>
        </defs>
        <g className="en-cut">
          {['', 'translate(240 0) scale(-1 1)'].map((t) => (
            <path
              key={t}
              transform={t || undefined}
              d="M30 170 36 128 33 96Q32 88 42 86M34 128H70M68 128 74 170"
              fill="none"
              stroke="#2f5a3e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <path d="M117 140V170H123V140Z" fill="#241a14" />
          <path d="M100 168H140" stroke="#241a14" strokeWidth="5" />
          <path
            d="M62 104H178L184 140Q173 135 164 141 152 135 142 141 131 135 120 141 109 135 98 141 88 135 76 141 67 135 56 140Z"
            fill="url(#en-check)"
          />
          <path d="M62 104H178V108H62Z" fill="#a8301f" opacity=".35" />
          <path d="M84 104A12 6 0 0 0 108 104Z" fill="#b8562e" />
          <g fill="#6b7a2e">
            <circle cx="90" cy="102.5" r="3" />
            <circle cx="96" cy="101" r="3" />
            <circle cx="102" cy="102.5" r="3" />
          </g>
          <circle cx="154" cy="94" r="18" fill="url(#en-glow)" />
          <path d="M146 104V87H162V104Z" fill="#fff1cf" opacity=".92" />
          <path d="M144 87H164V83H144Z" fill="#241a14" />
          <path
            d="M149 83Q154 75 159 83"
            fill="none"
            stroke="#241a14"
            strokeWidth="1.6"
          />
          <path
            d="M154 98V93"
            stroke="#ff9d40"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <svg className="en-pots" viewBox="0 0 200 170">
        <g className="en-cut">
          {[
            [56, 1],
            [140, 0.82],
          ].map(([x, s]) => (
            <g
              key={x}
              transform={`translate(${x} 170) scale(${s}) translate(-50 -110)`}
            >
              <path d="M14 30H86L78 110H22Z" fill="#b8562e" />
              <path d="M10 22H90V36H10Z" fill="#a14522" />
              {[
                [20, 18, 14],
                [40, 6, 16],
                [64, 10, 15],
                [82, 20, 12],
                [52, 22, 14],
              ].map(([cx, cy, r], j) => (
                <circle
                  key={j}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={j % 2 ? '#2e5a32' : '#25502c'}
                />
              ))}
              {[
                [26, 0],
                [48, -12],
                [70, -6],
                [86, 6],
                [36, 12],
                [60, 8],
              ].map(([cx, cy], j) => (
                <g key={j} fill={j % 3 ? '#d8402d' : '#e8604a'}>
                  <circle cx={cx} cy={cy} r="7" />
                  <circle cx={cx - 5} cy={cy + 4} r="4.5" />
                  <circle cx={cx + 5} cy={cy + 3} r="4.5" />
                </g>
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
