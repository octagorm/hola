import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Lock, Snail, Volume2 } from 'lucide-react'
import { WORD, gloss } from '../data/words'
import {
  LAST_RULE,
  MASTERED,
  RULES,
  allMastered,
  asksStress,
  asksTilde,
  opens,
  round,
  ruleReached,
  takesMark,
  tildeRight,
  why,
} from '../lib/acento'
import { stressIndex, syllables } from '../lib/spanish'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { useFont, useMedia } from '../ui'
import type { Item } from '../lib/acento'
import './acento.css'

// Acento: where the stress falls in a word heard, and whether it takes an
// accent mark, one rule at a time. A feria poster of the twenties: the
// syllables are paper lanterns on a wire over the fairground at night,
// and the stressed one lights up red. Each word is read, without its
// accent marks, and its stressed lantern tapped; only then is it heard,
// since hearing it would give the stress away. From the second rule on,
// the word is then shown without accents and the mark set where it goes,
// or left off. A pair told apart by a tilde, which sound alike, is heard
// at once. A round of ten with eight right opens the next rule.
//
// Nothing is recorded in the bank: stress and accents are rules of the
// written language, practised on words already met, and say nothing of
// whether a word's meaning is remembered (lib/bank.ts).

const FONTS =
  'https://fonts.googleapis.com/css2?family=Rozha+One&family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'

type Phase = 'intro' | 'play'
type Step = 'stress' | 'tilde' | 'shown'

// The wire across the fair: where its ends are and how far it sags in the
// middle, in pixels
const WIRE_TOP = 16
const SAG = 26

export default function Acento() {
  useFont(FONTS)
  const back = useBack('acento')
  const { bank } = useStore()
  const [rule, setRule] = useState(() => ruleReached(bank))
  const [phase, setPhase] = useState<Phase>('intro')
  const [game, setGame] = useState(0)
  return (
    <div className="ac">
      <div className="ac-col">
        <header className="ac-top">
          <a className="ac-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            <span lang="es">Acento</span>
            <small>Trykk og aksent</small>
          </h1>
          <span className="ac-rule" aria-label={`Regel ${rule} av 5`}>
            {rule}
          </span>
        </header>
        <div className="ac-awning" aria-hidden="true" />
        {phase === 'intro' ? (
          <Intro
            rule={rule}
            onRule={setRule}
            onStart={() => {
              setGame((g) => g + 1)
              setPhase('play')
              blip('tap')
            }}
          />
        ) : (
          <Round
            key={game}
            rule={rule}
            onAgain={(r) => {
              setRule(r)
              setGame((g) => g + 1)
              setPhase('play')
            }}
            onRules={() => setPhase('intro')}
          />
        )}
      </div>
      <Skyline />
    </div>
  )
}

// A word in syllables, the stressed one marked
function Syllables({ word }: { word: string }) {
  const syl = syllables(word)
  const at = stressIndex(word)
  return (
    <span className="ac-syl" lang="es">
      {syl.map((s, i) => (
        <span key={i}>
          {i > 0 && <i aria-hidden="true">·</i>}
          {i === at ? <b>{s}</b> : s}
        </span>
      ))}
    </span>
  )
}

function Intro({
  rule,
  onRule,
  onStart,
}: {
  rule: number
  onRule: (n: number) => void
  onStart: () => void
}) {
  const { bank } = useStore()
  const reached = ruleReached(bank)
  const r = RULES[rule - 1]
  // Enter starts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.altKey) return
      if ((e.target as HTMLElement | null)?.closest('button, a')) return
      e.preventDefault()
      onStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <section className="ac-card ac-intro">
      <div className="ac-rules" role="tablist" aria-label="Regler">
        {RULES.map((x) => {
          const open = x.n <= reached
          return (
            <button
              key={x.n}
              type="button"
              role="tab"
              aria-selected={x.n === rule}
              aria-label={`Regel ${x.n}${open ? '' : ', ikke låst opp ennå'}`}
              className={`${x.n === rule ? 'on' : ''} ${open ? '' : 'shut'}`}
              disabled={!open}
              onClick={() => onRule(x.n)}
            >
              {open ? x.n : <Lock />}
            </button>
          )
        })}
      </div>
      <p className="kick" lang="es">
        Regla {r.n}
      </p>
      <h2>
        <span lang="es">{r.es}</span>
        <small>{r.no}</small>
      </h2>
      <p className="text">{r.text}</p>
      <ul className="ac-examples">
        {r.words.map((id) => {
          const w = WORD[id]
          if (!w) return null
          return (
            <li key={id}>
              <button type="button" onClick={() => void say(w.es)}>
                <Volume2 />
                {r.n === LAST_RULE ? (
                  <b lang="es">{w.bare}</b>
                ) : (
                  <Syllables word={w.bare} />
                )}
                <small>{gloss(w)}</small>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="how">
        {rule === 1
          ? 'Les ordet, og trykk på lykten der trykket ligger. Du hører det når du har svart.'
          : rule === LAST_RULE
            ? 'Les ordet og finn trykket; du hører det når du har svart. Ordene med samme lyd får du høre og se med betydningen, og velger om de får aksent.'
            : 'Les ordet, skrevet uten aksent, og trykk på lykten der trykket ligger. Da hører du det, og setter aksenten der den skal være, eller ingen.'}
      </p>
      {allMastered(bank) && (
        <p className="all" lang="es">
          ¡Todas las reglas! <span lang="nb">Du har klart alle fem.</span>
        </p>
      )}
      <button type="button" className="ac-btn" onClick={onStart}>
        Empezar <ArrowRight />
      </button>
    </section>
  )
}

function Round({
  rule,
  onAgain,
  onRules,
}: {
  rule: number
  onAgain: (rule: number) => void
  onRules: () => void
}) {
  const { bank, points, setBest, played } = useStore()
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const [items] = useState<Array<Item>>(() => round(bank, rule))
  const [at, setAt] = useState(0)
  const [step, setStep] = useState<Step>('stress')
  const [stress, setStress] = useState<number | null>(null)
  // The letter the mark was set on, null for none, undefined not yet
  const [mark, setMark] = useState<number | null | undefined>(undefined)
  const [results, setResults] = useState<Array<boolean>>([])
  const [missed, setMissed] = useState<Array<Item>>([])
  const [unlocked, setUnlocked] = useState<number | null>(null)
  const item = items.at(at)
  const right = results.filter(Boolean).length

  // The wire is drawn across the whole width, and each lantern hangs from
  // it where it passes: measured, since the lanterns are laid out by CSS
  const wire = useRef<HTMLDivElement>(null)
  const [hang, setHang] = useState({ w: 0, drops: [] as Array<number> })
  useLayoutEffect(() => {
    const el = wire.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const drops = Array.from(
        el.querySelectorAll<HTMLElement>('.ac-lantern'),
        (b) => {
          const f = (b.offsetLeft + b.offsetWidth / 2) / w
          return Math.round((1 - (2 * f - 1) ** 2) * SAG)
        },
      )
      setHang((h) =>
        h.w === w && h.drops.join() === drops.join() ? h : { w, drops },
      )
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(el)
    const art = el.querySelector('.art')
    if (art) watch.observe(art)
    return () => watch.disconnect()
  }, [item])

  // Each word's first question; a word is heard once its stress is
  // answered, a pair that sounds alike at once
  useEffect(() => {
    if (!item) return
    setStep(asksStress(item) ? 'stress' : 'tilde')
    setStress(null)
    setMark(undefined)
    if (!asksStress(item)) void say(item.w.es)
  }, [item])

  // The round's end, once
  useEffect(() => {
    if (item || !items.length) return
    const opened = opens(bank, rule, right)
    setUnlocked(opened)
    if (opened) setBest('acento', opened)
    if (right) points(right)
    played('acento')
    const t = setTimeout(() => blip('win'), 300)
    return () => clearTimeout(t)
  }, [item])

  const finish = (ok: boolean) => {
    if (!item) return
    setResults((r) => [...r, ok])
    if (!ok) setMissed((m) => [...m, item])
    setStep('shown')
  }

  const pickStress = (i: number) => {
    if (!item || item.k !== 'word' || step !== 'stress') return
    setStress(i)
    const ok = i === item.stress
    blip(ok ? 'right' : 'wrong')
    // heard now, slowly if the stress was missed
    void say(item.w.es, !ok)
    if (asksTilde(item, rule)) setStep('tilde')
    else finish(ok)
  }

  const pickMark = (i: number | null) => {
    if (!item || step !== 'tilde') return
    setMark(i)
    const ok = tildeRight(item, i)
    blip(ok ? 'right' : 'wrong')
    finish(ok && (item.k === 'twin' || stress === item.stress))
  }

  const next = () => {
    if (step !== 'shown') return
    setAt((i) => i + 1)
  }

  // The vowels of the word as shown without its marks, by their place
  const letters = item ? item.plain.join('') : ''
  const vowels = [...letters].flatMap((c, i) => (takesMark(c) ? [i] : []))

  // 1–9 for a lantern or a vowel, 0 for no mark; Enter on; space again
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !item) return
      const onButton = (e.target as HTMLElement | null)?.closest('button, a')
      const n = Number(e.key)
      if (step === 'stress' && n >= 1 && n <= item.plain.length) {
        e.preventDefault()
        pickStress(n - 1)
      } else if (step === 'tilde' && e.key === '0') {
        e.preventDefault()
        pickMark(null)
      } else if (step === 'tilde' && n >= 1 && n <= vowels.length) {
        e.preventDefault()
        pickMark(vowels[n - 1])
      } else if (e.key === 'Enter' && step === 'shown' && !onButton) {
        e.preventDefault()
        next()
      } else if (e.key === ' ' && !onButton && step !== 'stress') {
        e.preventDefault()
        void say(item.w.es)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!item)
    return (
      <Result
        rule={rule}
        right={right}
        of={items.length}
        missed={missed}
        unlocked={unlocked}
        onAgain={onAgain}
        onRules={onRules}
      />
    )

  const shown = step === 'shown'
  const word = item.k === 'word' ? item : null
  // The lanterns: the syllables, without their marks until the answer
  const lanterns = shown && word ? word.syl : item.plain
  const lit = word && (shown || step === 'tilde') ? word.stress : null
  const ok = shown ? results.at(-1) : undefined

  return (
    <section className="ac-play">
      <ol className="ac-dots" aria-label={`Ord ${at + 1} av ${items.length}`}>
        {items.map((_, i) => (
          <li
            key={i}
            className={
              i < results.length
                ? results[i]
                  ? 'ok'
                  : 'no'
                : i === at
                  ? 'now'
                  : ''
            }
          />
        ))}
      </ol>

      <div className={`ac-hear ${step === 'stress' ? 'quiet' : ''}`}>
        <button
          type="button"
          className="ac-round light"
          aria-label="Hør igjen"
          onClick={() => void say(item.w.es)}
        >
          <Volume2 />
        </button>
        <button
          type="button"
          className="ac-round light"
          aria-label="Hør sakte"
          onClick={() => void say(item.w.es, true)}
        >
          <Snail />
        </button>
      </div>

      {item.k === 'twin' ? (
        <div className="ac-twin">
          <p className="ask">
            Ordet som betyr <b>«{item.twin.no}»</b>
          </p>
        </div>
      ) : (
        <>
          {/* the question, and in its place the verdict */}
          <p className="ac-ask" aria-live="polite">
            {step === 'stress' ? (
              'Hvor ligger trykket?'
            ) : step === 'tilde' ? (
              'Får det aksent, og hvor?'
            ) : ok ? (
              <b className="ok" lang="es">
                ¡Olé!
              </b>
            ) : (
              <b className="no">Ikke helt</b>
            )}
          </p>
          <div
            ref={wire}
            className="ac-wire"
            style={{
              ['--n' as string]: lanterns.length,
              paddingTop: WIRE_TOP,
            }}
          >
            {hang.w > 0 && (
              <svg
                className="line"
                width={hang.w}
                height={WIRE_TOP + SAG + 2}
                aria-hidden="true"
              >
                <path
                  d={`M0 ${WIRE_TOP}Q${hang.w / 2} ${WIRE_TOP + 2 * SAG} ${hang.w} ${WIRE_TOP}`}
                />
              </svg>
            )}
            {item.w.pos === 'n' && (
              <span className="art" lang="es">
                {item.w.es.split(' ')[0]}
              </span>
            )}
            {lanterns.map((s, i) => {
              const state =
                lit === i
                  ? 'lit'
                  : stress === i && step !== 'stress'
                    ? 'wrong'
                    : ''
              return (
                <button
                  key={i}
                  type="button"
                  lang="es"
                  className={`ac-lantern ${state}`}
                  style={{
                    ['--len' as string]: s.length,
                    marginTop: hang.drops.at(i) ?? 0,
                  }}
                  disabled={step !== 'stress'}
                  onClick={() => pickStress(i)}
                >
                  <span className="body">{s}</span>
                  {fine && step === 'stress' && (
                    <kbd aria-hidden="true">{i + 1}</kbd>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {(step === 'tilde' || (shown && asksTilde(item, rule))) && (
        <div className="ac-letters">
          <div className="word" lang="es">
            {[...letters].map((c, i) => {
              const v = vowels.indexOf(i)
              if (v < 0)
                return (
                  <span key={i} className="c">
                    {c}
                  </span>
                )
              // the mark where it goes, and where it was set if not there
              const marked = i === mark || (shown && i === item.mark)
              const wrong = shown && i === mark && i !== item.mark
              return (
                <button
                  key={i}
                  type="button"
                  className={`v ${marked ? 'marked' : ''} ${wrong ? 'wrong' : ''}`}
                  disabled={step !== 'tilde'}
                  aria-label={`Aksent på ${c}`}
                  onClick={() => pickMark(i)}
                >
                  {c}
                  {fine && step === 'tilde' && (
                    <kbd aria-hidden="true">{v + 1}</kbd>
                  )}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className={`ac-none ${shown && mark === null ? (item.mark < 0 ? 'right' : 'wrong') : ''}`}
            disabled={step !== 'tilde'}
            onClick={() => pickMark(null)}
          >
            Uten aksent
            {fine && step === 'tilde' && <kbd aria-hidden="true">0</kbd>}
          </button>
        </div>
      )}

      {shown && (
        <div className="ac-after" aria-live="polite">
          {item.k === 'twin' && (
            <p className="verdict">
              {ok ? (
                <b className="ok" lang="es">
                  ¡Olé!
                </b>
              ) : (
                <b className="no">Ikke helt</b>
              )}
            </p>
          )}
          <p className="written" lang="es">
            {item.k === 'word' ? (
              <Syllables word={item.w.bare} />
            ) : (
              <b>{item.twin.es}</b>
            )}
            <small lang="nb">
              {item.k === 'word' ? gloss(item.w) : item.twin.no}
            </small>
          </p>
          <p className="why">{why(item)}</p>
          <button type="button" className="ac-btn" onClick={next} autoFocus>
            Neste <ArrowRight />
          </button>
        </div>
      )}
    </section>
  )
}

function Result({
  rule,
  right,
  of,
  missed,
  unlocked,
  onAgain,
  onRules,
}: {
  rule: number
  right: number
  of: number
  missed: Array<Item>
  unlocked: number | null
  onAgain: (rule: number) => void
  onRules: () => void
}) {
  const next = unlocked && unlocked <= LAST_RULE ? RULES[unlocked - 1] : null
  return (
    <section className="ac-card ac-result">
      <p className="kick" lang="es">
        {right >= MASTERED ? '¡Olé!' : 'Otra vez'}
      </p>
      <h2>
        {right} av {of} riktige
      </h2>
      {next ? (
        <p className="opened">
          Ny regel: <b lang="es">{next.es}</b> ({next.no.toLowerCase()})
        </p>
      ) : unlocked ? (
        <p className="opened">Nå sitter alle fem reglene.</p>
      ) : (
        right < MASTERED && (
          <p>
            Med {MASTERED} riktige av {of} åpner neste regel seg.
          </p>
        )
      )}
      {missed.length > 0 && (
        <ul className="ac-missed">
          {missed.map((m, i) => (
            <li key={i}>
              <button type="button" onClick={() => void say(m.w.es)}>
                <Volume2 />
                {m.k === 'word' ? (
                  <Syllables word={m.w.bare} />
                ) : (
                  <b lang="es">{m.twin.es}</b>
                )}
              </button>
              <span>{why(m)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="acts">
        <TodayNext page="acento" className="ac-btn" />
        {next ? (
          <button
            type="button"
            className="ac-btn"
            onClick={() => onAgain(next.n)}
          >
            Neste regel <ArrowRight />
          </button>
        ) : null}
        <button
          type="button"
          className={`ac-btn ${next ? 'ghost' : ''}`}
          onClick={() => onAgain(rule)}
        >
          En runde til
        </button>
        <button type="button" className="ac-link" onClick={onRules}>
          Reglene
        </button>
        <a className="ac-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// The fair at the bottom: lanterns on wires far off, the roofs of the
// casetas with their doors lit, and the Giralda over them
const ROOFS = [100, 106, 96, 110, 102]
const CASETAS = ROOFS.concat(ROOFS, ROOFS, ROOFS)
  .map((h, i) => {
    const x = i * 60
    return `M${x} 162V${h + 16}L${x + 30} ${h}L${x + 60} ${h + 16}V162Z`
  })
  .join('')
const DOORS = Array.from(
  { length: 20 },
  (_, i) => `M${i * 60 + 24} 162V144a6 6 0 0 1 12 0V162Z`,
).join('')
const FESTOONS = [0, 1, 2, 3, 4]
  .map((s) => `M${s * 240} 20Q${s * 240 + 120} 64 ${s * 240 + 240} 20`)
  .join('')
const FAROLILLOS = Array.from({ length: 20 }, (_, i) => {
  const t = 0.2 * ((i % 4) + 1)
  return { x: Math.floor(i / 4) * 240 + 240 * t, y: 20 + 88 * t * (1 - t) }
})

function Skyline() {
  return (
    <svg
      className="ac-skyline"
      viewBox="0 0 1200 170"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <path className="festoon" d={FESTOONS} />
      {FAROLILLOS.map(({ x, y }, i) => (
        <g key={i} className={i % 2 ? 'cream' : 'red'}>
          <path className="festoon" d={`M${x} ${y}v5`} />
          <ellipse cx={x} cy={y + 12} rx="6.5" ry="7.5" />
        </g>
      ))}
      <path className="far" d={CASETAS} />
      <path className="door" d={DOORS} />
      <path
        className="tower"
        d="M686 162V92H690V78H694V68H698V62H702V54H704V62H708V68H712V78H716V92H720V162Z"
      />
      <path
        className="win"
        d="M694 81h3v8h-3ZM701.5 81h3v8h-3ZM709 81h3v8h-3ZM701.5 100h3v9h-3ZM701.5 122h3v9h-3Z"
      />
      <rect className="near" x="0" y="162" width="1200" height="8" />
    </svg>
  )
}
