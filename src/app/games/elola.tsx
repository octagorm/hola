import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Flame } from 'lucide-react'
import { gloss } from '../data/words'
import { LEAST, RUN, articleOf, deal, nounsMet, ruleOf } from '../lib/elola'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { Es, Speak, useFont, useMedia } from '../ui'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { Word } from '../data/words'
import type { Article } from '../lib/elola'
import './elola.css'

// ¿El o la?: the article of each noun met, el or la, before the candle
// burns down. The Spanish deck as hand-coloured woodcut on a green card
// table: the nouns come as cards of oros, el is the pile of bastos (el
// basto) on the left and la the pile of copas (la copa) on the right. A
// wrong answer turns the card over to show the article and the rule, and
// the candle waits while it is read.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Rye&family=Gloock&family=Alegreya:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap'

// A swipe this far to a side answers
const SWIPE = 70

// Saying el or la is saying the noun with its article (decir), but as a
// choice of two: a right answer says little (0.3), a wrong one more (0.6),
// as a slip that a choice of two shows up
const RIGHT = 0.3
const WRONG = 0.6

type Phase = 'ready' | 'play' | 'over'

export default function ElOLa() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('elola')
  const [runs, setRuns] = useState(0)
  const enough = nounsMet(bank) >= LEAST
  return (
    <div className="eo">
      <div className="eo-col">
        {enough ? (
          <Run
            key={runs}
            back={back}
            lit={runs > 0}
            onAgain={() => setRuns((n) => n + 1)}
          />
        ) : (
          <TooFew back={back} />
        )}
      </div>
    </div>
  )
}

function Top({ back, score }: { back: string; score?: number }) {
  return (
    <header className="eo-top">
      <a className="eo-round" href={back} aria-label="Tilbake">
        <ArrowLeft />
      </a>
      <h1>
        ¿El o la?<small>Hankjønn eller hunkjønn</small>
      </h1>
      {score !== undefined && (
        <span className="eo-score" aria-label={`${score} riktige`}>
          <Oro className="coin" />
          <b>{score}</b>
        </span>
      )}
    </header>
  )
}

function TooFew({ back }: { back: string }) {
  const { bank } = useStore()
  return (
    <>
      <Top back={back} />
      <section className="eo-panel">
        <p className="kick">Ikke ennå</p>
        <h2>Bunken trenger flere ord</h2>
        <p>
          Kortene lages av substantivene du har møtt, og det trengs minst{' '}
          {LEAST}. Du har {nounsMet(bank)}.
        </p>
        <div className="acts">
          <a className="eo-btn" href="#nuevas">
            Lær nye ord
          </a>
          <a className="eo-link" href="#">
            Til forsiden
          </a>
        </div>
      </section>
    </>
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

// What a wrong answer shows under the article: the rule, or that there is
// none to go by
const NO_RULE =
  'Endelsen sier ikke noe om kjønnet her; lær ordet med artikkelen.'

// The candle burns while `on`: the share of the run left is written to
// the element's --left each frame, and `done` is called when it is gone.
// Time with the page hidden does not count.
function useBurn(
  on: boolean,
  el: RefObject<HTMLElement | null>,
  done: () => void,
) {
  const spent = useRef(0)
  const end = useRef(done)
  useEffect(() => {
    end.current = done
  })
  useEffect(() => {
    if (!on) return
    let last = performance.now()
    let frame = 0
    const tick = () => {
      const now = performance.now()
      if (!document.hidden) spent.current += now - last
      last = now
      const left = Math.max(0, 1 - spent.current / RUN)
      el.current?.style.setProperty('--left', left.toFixed(4))
      if (left > 0) frame = requestAnimationFrame(tick)
      else end.current()
    }
    const onShow = () => {
      last = performance.now()
    }
    document.addEventListener('visibilitychange', onShow)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [on, el])
}

interface Leaving {
  w: Word
  to: Article
  n: number
}

function Run({
  back,
  lit,
  onAgain,
}: {
  back: string
  // Straight into a run, as after «En runde til»
  lit: boolean
  onAgain: () => void
}) {
  const { bank, settings, record, points, setBest, played } = useStore()
  const [phase, setPhase] = useState<Phase>(lit ? 'play' : 'ready')
  const [cards, setCards] = useState<Array<Word>>(() =>
    lit ? deal(bank, Date.now()) : [],
  )
  const [at, setAt] = useState(0)
  const [turned, setTurned] = useState(false)
  const [right, setRight] = useState(0)
  const [missed, setMissed] = useState<Array<Word>>([])
  const [won, setWon] = useState<Record<Article, number>>({ el: 0, la: 0 })
  const [leaving, setLeaving] = useState<Leaving | null>(null)
  const [dx, setDx] = useState(0)
  const drag = useRef<number | null>(null)
  const candle = useRef<HTMLDivElement>(null)
  const fine = useMedia('(hover: hover) and (pointer: fine)')

  useBurn(phase === 'play' && !turned, candle, () => setPhase('over'))

  // The run's end: its score kept, once (on the change of phase alone, so
  // the score is the one it ended with)
  useEffect(() => {
    if (phase !== 'over') return
    setBest('elola', right)
    if (right) points(right)
    played('elola')
    const t = setTimeout(() => blip('win'), 500)
    return () => clearTimeout(t)
  }, [phase])

  const start = () => {
    setCards(deal(bank, Date.now()))
    setAt(0)
    setPhase('play')
    blip('tap')
  }

  const w = cards.at(at)

  // On to the next card, dealing again if the deck is through
  const onward = () => {
    if (at + 1 >= cards.length)
      setCards((c) => [...c, ...deal(bank, Date.now())])
    setAt((i) => i + 1)
  }

  const answer = (said: Article) => {
    if (phase !== 'play' || turned || !w) return
    const ok = articleOf(w) === said
    record(w.id, ok, ok ? RIGHT : WRONG, 'decir')
    if (ok) {
      blip('right')
      if (settings.autoplay) void say(w.es)
      setRight((n) => n + 1)
      setWon((x) => ({ ...x, [said]: x[said] + 1 }))
      setLeaving({ w, to: said, n: at })
      onward()
    } else {
      blip('wrong')
      void say(w.es)
      setMissed((m) => (m.includes(w) ? m : [...m, w]))
      setTurned(true)
    }
  }

  const next = () => {
    if (!turned) return
    setTurned(false)
    onward()
  }

  // ← el, → la; Enter or space lights the candle, and turns to the next
  // card after a wrong one
  useEffect(() => {
    if (phase === 'over') return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        answer(e.key === 'ArrowLeft' ? 'el' : 'la')
      } else if (e.key === 'Enter' || e.key === ' ') {
        if ((e.target as HTMLElement | null)?.closest('button, a')) return
        if (phase === 'ready') start()
        else if (turned) next()
        else return
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // A card swiped to a side
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'play' || turned) return
    drag.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current === null) return
    setDx(e.clientX - drag.current)
  }
  const onUp = () => {
    if (drag.current === null) return
    drag.current = null
    const d = dx
    setDx(0)
    if (Math.abs(d) > SWIPE) answer(d < 0 ? 'el' : 'la')
  }
  const onCancel = () => {
    drag.current = null
    setDx(0)
  }

  const lean: Article | null = dx < -30 ? 'el' : dx > 30 ? 'la' : null

  if (phase === 'over')
    return (
      <>
        <Top back={back} />
        <Result right={right} missed={missed} onAgain={onAgain} />
      </>
    )

  return (
    <>
      <Top back={back} score={phase === 'play' ? right : undefined} />
      <div className="eo-play">
        <div className="eo-table">
          <Deck />
          <div className="eo-spot">
            {phase === 'ready' || !w ? (
              <div className="eo-card eo-start">
                <div className="eo-face front">
                  <p className="kick">Una vela, un minuto</p>
                  <h2>
                    Svar <span className="g-m">el</span> eller{' '}
                    <span className="g-f">la</span> før lyset brenner ned
                  </h2>
                  <p>
                    Ordene du har møtt, kommer ett og ett, uten artikkel. Bommer
                    du, snus kortet, og lyset venter mens du leser.
                  </p>
                  <button type="button" className="eo-btn" onClick={start}>
                    <Flame /> Tenn lyset
                  </button>
                </div>
              </div>
            ) : (
              <>
                {leaving && (
                  <div
                    key={`out${leaving.n}`}
                    className={`eo-card eo-leave to-${leaving.to}`}
                    aria-hidden="true"
                    onAnimationEnd={() =>
                      setLeaving((l) => (l?.n === leaving.n ? null : l))
                    }
                  >
                    <div className="eo-flip">
                      <Front w={leaving.w} />
                    </div>
                  </div>
                )}
                <div
                  key={at}
                  className={`eo-card eo-deal ${turned ? 'turned' : ''} ${drag.current !== null ? 'held' : ''}`}
                  style={
                    dx
                      ? {
                          transform: `translateX(${dx}px) rotate(${dx / 16}deg)`,
                        }
                      : undefined
                  }
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onCancel}
                  aria-live="polite"
                >
                  <div className="eo-flip">
                    <Front w={w} />
                    <Back w={w} hidden={!turned} />
                  </div>
                </div>
              </>
            )}
          </div>
          <Candle el={candle} lit={phase === 'play'} />
        </div>

        {turned && w ? (
          <div className="eo-after">
            <Speak text={w.es} label={`Hør ${w.es}`} className="eo-speak" />
            <button type="button" className="eo-btn" onClick={next} autoFocus>
              Neste <ArrowRight />
            </button>
          </div>
        ) : (
          <div className={`eo-piles ${phase === 'play' ? '' : 'idle'}`}>
            {(['el', 'la'] as const).map((a) => (
              <button
                key={a}
                type="button"
                className={`eo-pile ${a} ${lean === a ? 'near' : ''}`}
                onClick={() => answer(a)}
                disabled={phase !== 'play'}
                aria-label={a}
              >
                {/* The pile grows with the cards won to it */}
                {Array.from(
                  { length: 2 + Math.min(4, Math.floor(won[a] / 3)) },
                  (_, i) => (
                    <i
                      key={i}
                      className="layer"
                      style={{ ['--i' as string]: i + 1 }}
                    />
                  ),
                ).reverse()}
                <span className="face">
                  {a === 'el' ? (
                    <Basto className="suit" />
                  ) : (
                    <Copa className="suit" />
                  )}
                  <b>{a}</b>
                  {fine && (
                    <kbd aria-hidden="true">
                      {a === 'el' ? <ArrowLeft /> : <ArrowRight />}
                    </kbd>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
        <p className="eo-hint">
          {phase !== 'play'
            ? fine
              ? 'Svar med bunkene, eller med piltastene ← →.'
              : 'Svar med bunkene, eller sveip kortet til siden.'
            : turned
              ? ' '
              : fine
                ? '← el · la →'
                : 'Trykk, eller sveip kortet'}
        </p>
      </div>
    </>
  )
}

// The size of a word on its card: the longer its longest word, the
// smaller
const fit = (w: Word) => Math.max(4, ...w.bare.split(' ').map((s) => s.length))

function Front({ w }: { w: Word }) {
  return (
    <div className="eo-face front">
      <Oro className="pip top" />
      <p className="word" lang="es" style={{ ['--n' as string]: fit(w) }}>
        {w.bare}
      </p>
      <p className="mean">{gloss(w)}</p>
      <Oro className="pip bottom" />
    </div>
  )
}

// (`hidden` until turned: the back is there all along for the flip, and a
// screen reader would otherwise read the answer out first)
function Back({ w, hidden }: { w: Word; hidden: boolean }) {
  const a = articleOf(w)
  const rule = ruleOf(w)
  return (
    <div className={`eo-face back ${a}`} aria-hidden={hidden || undefined}>
      {a === 'el' ? <Basto className="pip" /> : <Copa className="pip" />}
      <p className="word" lang="es" style={{ ['--n' as string]: fit(w) + 3 }}>
        <Es w={w} />
      </p>
      <p className="mean">{gloss(w)}</p>
      <p className="rule">
        <Marked text={rule?.text ?? NO_RULE} />
      </p>
    </div>
  )
}

function Result({
  right,
  missed,
  onAgain,
}: {
  right: number
  missed: Array<Word>
  onAgain: () => void
}) {
  const { bank } = useStore()
  const best = bank.best.elola ?? right
  return (
    <section className="eo-panel eo-result">
      <Candle lit={false} out />
      <p className="kick">Se apagó la vela</p>
      <h2>
        {right} {right === 1 ? 'riktig' : 'riktige'}
      </h2>
      <p>
        {right >= best
          ? 'Din beste runde hittil.'
          : `Din beste runde: ${best} riktige.`}
      </p>
      {missed.length > 0 && (
        <>
          <h3>Ordene du bommet på</h3>
          <ul>
            {missed.map((w) => (
              <li key={w.id}>
                <b lang="es">
                  <Es w={w} peek />
                </b>
                <span className="mean">{gloss(w)}</span>
                <Speak
                  text={w.es}
                  small
                  label={`Hør ${w.es}`}
                  className="eo-speak"
                />
                <span className="rule">
                  <Marked text={ruleOf(w)?.text ?? NO_RULE} />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="acts">
        <TodayNext page="elola" className="eo-btn" />
        <button type="button" className="eo-btn" onClick={onAgain}>
          <Flame /> En runde til
        </button>
        <a className="eo-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// --- The drawings: the suits in the manner of a hand-coloured woodcut ---

const INK = '#1d1813'

// Oros: a gold coin with a rosette
function Oro({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r="17.5"
        fill="#d9a53a"
        stroke={INK}
        strokeWidth="2.2"
      />
      <circle
        cx="20"
        cy="20"
        r="12.5"
        fill="none"
        stroke={INK}
        strokeWidth="1.2"
      />
      <g fill="#c2402c" stroke={INK} strokeWidth="1">
        <path d="M20 9.5C22.5 14 22.5 16 20 20 17.5 16 17.5 14 20 9.5Z" />
        <path d="M20 30.5C22.5 26 22.5 24 20 20 17.5 24 17.5 26 20 30.5Z" />
        <path d="M9.5 20C14 17.5 16 17.5 20 20 16 22.5 14 22.5 9.5 20Z" />
        <path d="M30.5 20C26 17.5 24 17.5 20 20 24 22.5 26 22.5 30.5 20Z" />
      </g>
      <circle cx="20" cy="20" r="2.2" fill="#f4ead2" stroke={INK} />
      <path
        d="M31 27.5 33.5 29M28 31 29.5 33.5M33 23.5 35.5 24"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Bastos: a knotted club, in el's blue
function Basto({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 80" aria-hidden="true">
      <g transform="rotate(-24 30 40)">
        <path
          d="M34 42C38 38 43 38 45 41 41 43 37 44 34 42Z"
          fill="#5f7d46"
          stroke={INK}
          strokeWidth="1.2"
        />
        <path
          d="M25 24C21 22 17 23 15 26 19 27 22 27 25 24Z"
          fill="#5f7d46"
          stroke={INK}
          strokeWidth="1.2"
        />
        <path
          d="M27 76C25.5 62 23.5 44 21.5 26 20.5 13 25 5 31 5 37.5 5 41 13 40 26 38.5 44 35.5 62 33.5 76Z"
          fill="#4f7fa8"
          stroke={INK}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M25 61C28 63 32.5 63 35.5 61M25.4 66C28.4 68 32 68 35 66"
          fill="none"
          stroke="#c2402c"
          strokeWidth="3"
        />
        <ellipse
          cx="30.2"
          cy="76"
          rx="3.6"
          ry="1.8"
          fill="#d9a53a"
          stroke={INK}
        />
        <g fill="#f4ead2" stroke={INK} strokeWidth="1.2">
          <ellipse cx="27" cy="17" rx="2.6" ry="1.8" />
          <ellipse cx="35" cy="31" rx="2.2" ry="1.6" />
          <ellipse cx="28" cy="45" rx="2" ry="1.4" />
        </g>
        <path
          d="M24 22 25 34M25.2 40 26.2 52M37 14 36.6 22"
          stroke={INK}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

// Copas: a goblet, in la's red
function Copa({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 80" aria-hidden="true">
      <path
        d="M11 14H49C49 35 41 45 30 45 19 45 11 35 11 14Z"
        fill="#c2402c"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M12.6 25C21 28.5 39 28.5 47.4 25"
        fill="none"
        stroke="#d9a53a"
        strokeWidth="3.4"
      />
      <ellipse
        cx="30"
        cy="14"
        rx="19"
        ry="4.2"
        fill="#d9a53a"
        stroke={INK}
        strokeWidth="2"
      />
      <rect
        x="26.8"
        y="44"
        width="6.4"
        height="17"
        fill="#d9a53a"
        stroke={INK}
        strokeWidth="1.8"
      />
      <ellipse
        cx="30"
        cy="52"
        rx="6.2"
        ry="3.4"
        fill="#c2402c"
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d="M15 72C17 63 43 63 45 72Z"
        fill="#c2402c"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse
        cx="30"
        cy="72.5"
        rx="15.5"
        ry="3"
        fill="#d9a53a"
        stroke={INK}
        strokeWidth="1.8"
      />
      <path
        d="M41 30 38.5 39M44.5 30 43 35"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// The deck the cards come from, face down
function Deck() {
  return (
    <div className="eo-deck" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  )
}

// A candle in a brass stick, burnt down as far as --left says; out, with
// a wisp of smoke, at the end
function Candle({
  el,
  lit,
  out = false,
}: {
  el?: RefObject<HTMLDivElement | null>
  lit: boolean
  out?: boolean
}) {
  return (
    <div
      ref={el}
      className={`eo-candle ${lit ? 'lit' : ''} ${out ? 'out' : ''}`}
      style={{ ['--left' as string]: out ? 0 : 1 }}
      aria-hidden="true"
    >
      <div className="wax">
        <svg className="flame" viewBox="0 0 20 34">
          <path
            d="M10 1C14 9 18 14 18 21 18 27.5 14.5 31 10 31 5.5 31 2 27.5 2 21 2 14 6 9 10 1Z"
            fill="#e9b43c"
            stroke={INK}
            strokeWidth="1.3"
          />
          <path
            d="M10 12C12.4 17 14 19.5 14 23 14 26.5 12.2 28 10 28 7.8 28 6 26.5 6 23 6 19.5 7.6 17 10 12Z"
            fill="#c2402c"
          />
          <path d="M10 33V27" stroke={INK} strokeWidth="1.6" />
        </svg>
        <svg className="smoke" viewBox="0 0 20 40">
          <path
            d="M10 38C4 32 16 28 10 21 5 15 14 11 10 3"
            fill="none"
            stroke="#8a8172"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <svg className="stick" viewBox="0 0 70 34">
        <path
          d="M55 14C63 12 67 17 64 21 61 25 55 23 55 19"
          fill="none"
          stroke={INK}
          strokeWidth="2.6"
        />
        <path
          d="M55 14C63 12 67 17 64 21 61 25 55 23 55 19"
          fill="none"
          stroke="#d9a53a"
          strokeWidth="1.2"
        />
        <ellipse
          cx="33"
          cy="22"
          rx="30"
          ry="9"
          fill="#d9a53a"
          stroke={INK}
          strokeWidth="2.2"
        />
        <ellipse
          cx="33"
          cy="19"
          rx="22"
          ry="5"
          fill="#b9852a"
          stroke={INK}
          strokeWidth="1.4"
        />
        <path
          d="M24 6H42V17C42 19 24 19 24 17Z"
          fill="#d9a53a"
          stroke={INK}
          strokeWidth="2"
        />
        <ellipse
          cx="33"
          cy="6"
          rx="9"
          ry="2.6"
          fill="#b9852a"
          stroke={INK}
          strokeWidth="1.6"
        />
        <path
          d="M47 26 50 29M42 28 44 31M52 23 56 25"
          stroke={INK}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
