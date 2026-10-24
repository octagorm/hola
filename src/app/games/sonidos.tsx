import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Delete,
  Ear as EarIcon,
  Snail,
  Volume2,
  X,
} from 'lucide-react'
import { CHART, CONTRASTS, SOUND } from '../data/sonidos'
import { WORD, article, gloss } from '../data/words'
import {
  HEARD,
  MISHEARD,
  SLIP_NOTE,
  check,
  dictation,
  earRound,
  flat,
  spoken,
  wordsOf,
} from '../lib/sonidos'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack, useInToday } from '../daily'
import { Es, KEY_ROWS, useFont, useLetterKeys, useMedia } from '../ui'
import type { Checked, EarItem } from '../lib/sonidos'
import type { SoundId } from '../data/sonidos'
import type { Word } from '../data/words'
import './sonidos.css'

// Sonidos: the sounds of Spanish as Spain says them, on a radio set of the
// fifties in a Spanish living room, drawn in ligne claire. Its three keys
// are the chart of the letters and their sounds (each to hear in words of
// the bank), the ear (a word said, and two or three that sound alike to
// pick it from) and the dictation (a word said, and written down). The
// dial shows the sound chosen, or how far a round has come.
//
// The ear records each answer as hearing (oír) of a word met, and keeps
// its best round of ten. The dictation records nothing: a word heard can
// be written down without knowing what it means, Spanish being written
// much as it is said, and each link of the bank goes to or from a word's
// meaning (lib/bank.ts).

const FONTS =
  'https://fonts.googleapis.com/css2?family=Yellowtail&family=Barlow+Condensed:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&display=swap'

type Tab = 'abc' | 'oido' | 'dictado'

const TABS: Array<{ id: Tab; es: string; no: string }> = [
  { id: 'abc', es: 'Abecedario', no: 'Alfabetet' },
  { id: 'oido', es: 'Oído', no: 'Øret' },
  { id: 'dictado', es: 'Dictado', no: 'Diktat' },
]

const TAB_KEY = 'hola:sonidos-tab'

function savedTab(): Tab {
  try {
    const t = localStorage.getItem(TAB_KEY)
    return t === 'oido' || t === 'dictado' ? t : 'abc'
  } catch {
    return 'abc'
  }
}

// How far a round has come, for the dial: right or wrong for each word
// answered
interface Progress {
  n: number
  at: number
  marks: Array<boolean>
}

// The sounds the ear can be trained on, from their place in the chart
const TRAINS = new Set(CONTRASTS.flatMap((c) => c.sounds))

export default function Sonidos() {
  useFont(FONTS)
  const back = useBack('sonidos')
  const { step } = useInToday('sonidos')
  // (from today's chapter, the ear, which is its step)
  const [tab, setTab] = useState<Tab>(() => (step ? 'oido' : savedTab()))
  const [sound, setSound] = useState<SoundId>('a')
  const [focus, setFocus] = useState<SoundId | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const choose = (t: Tab) => {
    setTab(t)
    setProgress(null)
    blip('tap')
    try {
      localStorage.setItem(TAB_KEY, t)
    } catch {
      // private mode
    }
  }
  return (
    <div className="so">
      <div className="so-col">
        <div className="so-set">
          <header className="so-top">
            <a className="so-knob" href={back} aria-label="Tilbake">
              <ArrowLeft />
            </a>
            <h1>
              <span className="brand">Sonidos</span>
              <small>Lydene</small>
            </h1>
            <span className="so-knob idle" aria-hidden="true" />
          </header>
          <Dial tab={tab} sound={sound} progress={progress} />
          <nav className="so-keys" role="tablist" aria-label="Del">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? 'on' : ''}
                onClick={() => choose(t.id)}
              >
                <b lang="es">{t.es}</b>
                <small>{t.no}</small>
              </button>
            ))}
          </nav>
        </div>
        <main className="so-main">
          {tab === 'abc' ? (
            <Chart
              sound={sound}
              onSound={setSound}
              onTrain={(s) => {
                setFocus(s)
                choose('oido')
              }}
            />
          ) : tab === 'oido' ? (
            <Ear
              key={focus ?? ''}
              focus={focus}
              onUnfocus={() => setFocus(null)}
              onProgress={setProgress}
            />
          ) : (
            <Dictado onProgress={setProgress} />
          )}
        </main>
      </div>
    </div>
  )
}

// --- The dial ---

// Where on a band a station sits, from 0 to 1
const spot = (i: number, n: number) => (i + 0.5) / n

const BANDS = ['VOC', 'LET', 'OÍD']

function Dial({
  tab,
  sound,
  progress,
}: {
  tab: Tab
  sound: SoundId
  progress: Progress | null
}) {
  const band = CHART.findIndex((g) => g.sounds.some((s) => s.id === sound))
  const sounds = CHART.at(band)?.sounds ?? []
  const x =
    tab === 'abc'
      ? spot(
          sounds.findIndex((s) => s.id === sound),
          sounds.length,
        )
      : progress
        ? spot(Math.min(progress.at, progress.n - 1), progress.n)
        : 0
  return (
    <div className="so-dial" aria-hidden="true">
      <div className="glass">
        {tab === 'abc' ? (
          CHART.map((g, b) => (
            <div key={g.id} className={`band ${band === b ? 'on' : ''}`}>
              <span className="name">{BANDS[b]}</span>
              <span className="scale">
                {g.sounds.map((s, i) => (
                  <span
                    key={s.id}
                    className={`st ${s.id === sound ? 'on' : ''}`}
                    style={{ left: `${spot(i, g.sounds.length) * 100}%` }}
                  >
                    {s.letters.replace(/ · /g, '·')}
                  </span>
                ))}
              </span>
            </div>
          ))
        ) : (
          <div className="band round">
            <span className="name">{tab === 'oido' ? 'OÍD' : 'DIC'}</span>
            <span className="scale">
              {Array.from({ length: progress?.n ?? 10 }, (_, i) => {
                const n = progress?.n ?? 10
                const m = progress?.marks[i]
                return (
                  <span
                    key={i}
                    className={`st num ${m === true ? 'ok' : m === false ? 'no' : ''} ${progress?.at === i ? 'on' : ''}`}
                    style={{ left: `${spot(i, n) * 100}%` }}
                  >
                    {i + 1}
                  </span>
                )
              })}
            </span>
          </div>
        )}
        <span className="track">
          <i className="needle" style={{ left: `${x * 100}%` }} />
        </span>
      </div>
    </div>
  )
}

// --- The chart ---

function Chart({
  sound,
  onSound,
  onTrain,
}: {
  sound: SoundId
  onSound: (s: SoundId) => void
  onTrain: (s: SoundId) => void
}) {
  const card = useRef<HTMLElement>(null)
  const s = SOUND[sound] ?? CHART[0].sounds[0]
  const tune = (id: SoundId) => {
    onSound(id)
    const w = WORD[SOUND[id]?.words[0] ?? '']
    if (w) void say(w.es)
    card.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  return (
    <div className="so-chart">
      <article className="so-card" ref={card} aria-live="polite">
        <div className="head">
          <b className="letters" lang="es">
            {s.letters}
          </b>
          {s.spelt && (
            <span className="spelt" lang="es">
              {s.spelt}
            </span>
          )}
        </div>
        <p className="note">{s.note}</p>
        <ul className="words">
          {s.words.map((id) => {
            const w = WORD[id]
            if (!w) return null
            return (
              <li key={id}>
                <button
                  type="button"
                  className="so-word"
                  onClick={() => void say(w.es)}
                >
                  <Volume2 />
                  <span className="es" lang="es">
                    <Es w={w} />
                  </span>
                  <small>{gloss(w)}</small>
                </button>
              </li>
            )
          })}
        </ul>
        {TRAINS.has(s.id) && (
          <button
            type="button"
            className="so-btn ghost"
            onClick={() => onTrain(s.id)}
          >
            <EarIcon />
            <span>
              Øv øret på <span lang="es">{s.letters}</span>
            </span>
          </button>
        )}
      </article>
      {CHART.map((g) => (
        <section key={g.id} className="so-group">
          <h2>
            <span lang="es">{g.es}</span>
            <small>{g.no}</small>
          </h2>
          <p>{g.about}</p>
          <div className={`stations n${g.sounds.length}`}>
            {g.sounds.map((x) => (
              <button
                key={x.id}
                type="button"
                lang="es"
                className={`so-station ${x.id === sound ? 'on' : ''} ${x.letters.split('·').length > 2 ? 'long' : ''}`}
                aria-pressed={x.id === sound}
                onClick={() => tune(x.id)}
              >
                {x.letters}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// --- Hearing ---

// The big speaker that says it again, and the snail that says it slowly
function Speaker({ text, playing }: { text: string; playing: number }) {
  const [again, setAgain] = useState(0)
  return (
    <div className="so-speaker">
      <button
        type="button"
        className="grille"
        aria-label="Hør igjen"
        onClick={() => {
          setAgain((n) => n + 1)
          void say(text)
        }}
      >
        {/* (the rings go out again each time a word is said) */}
        <i key={`${playing}.${again}`} className="waves" />
        <span className="cap">
          <Volume2 />
        </span>
      </button>
      <button
        type="button"
        className="so-knob slow"
        aria-label="Hør sakte"
        onClick={() => void say(text, true)}
      >
        <Snail />
      </button>
    </div>
  )
}

function Ear({
  focus,
  onUnfocus,
  onProgress,
}: {
  focus: SoundId | null
  onUnfocus: () => void
  onProgress: (p: Progress | null) => void
}) {
  const { bank, record, points, played, setBest } = useStore()
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const deal = () => earRound(bank, Date.now(), Math.random, focus ?? undefined)
  const [items, setItems] = useState<Array<EarItem>>(deal)
  const [at, setAt] = useState(0)
  const [chosen, setChosen] = useState<Word | null>(null)
  const [marks, setMarks] = useState<Array<boolean>>([])
  const [missed, setMissed] = useState<Array<EarItem>>([])
  const item = items.at(at)
  const right = marks.filter(Boolean).length

  useEffect(() => {
    onProgress({ n: items.length, at, marks })
  }, [items, at, marks])
  useEffect(() => () => onProgress(null), [])

  // Each word said as it comes
  useEffect(() => {
    if (item) void say(spoken(item.c, item.w))
  }, [item])

  // The best round of ten before this one, once it is over; a round on
  // one sound is not counted, being shorter and easier
  const [before, setBefore] = useState<number | null>(null)

  // The round's end, once
  useEffect(() => {
    if (item || !items.length) return
    if (right) points(right)
    played('sonidos')
    if (!focus) {
      setBefore(bank.best.sonidos ?? 0)
      setBest('sonidos', right)
    }
    const t = setTimeout(() => blip('win'), 300)
    return () => clearTimeout(t)
  }, [item])

  const answer = (w: Word) => {
    if (!item || chosen) return
    const ok = w.id === item.w.id
    setChosen(w)
    setMarks((m) => [...m, ok])
    if (!ok) setMissed((m) => [...m, item])
    if (bank.cards[item.w.id])
      record(item.w.id, ok, ok ? HEARD : MISHEARD, 'oir')
    blip(ok ? 'right' : 'wrong')
  }
  const next = () => {
    if (!chosen) return
    setChosen(null)
    setAt((i) => i + 1)
  }
  const again = () => {
    setItems(deal())
    setAt(0)
    setMarks([])
    setMissed([])
    setChosen(null)
    setBefore(null)
  }

  // 1, 2, 3 for the words; Enter on; space says it again
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !item) return
      if ((e.target as HTMLElement | null)?.closest('input, textarea')) return
      const n = Number(e.key)
      if (n >= 1 && n <= item.options.length && !chosen) {
        e.preventDefault()
        answer(item.options[n - 1])
      } else if (e.key === 'Enter' && chosen) {
        if ((e.target as HTMLElement | null)?.closest('button, a')) return
        e.preventDefault()
        next()
      } else if (e.key === ' ' && !chosen) {
        if ((e.target as HTMLElement | null)?.closest('button, a')) return
        e.preventDefault()
        void say(spoken(item.c, item.w))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!item)
    return (
      <section className="so-panel so-result">
        <p className="kick" lang="es">
          {right >= items.length - 1 ? '¡Qué oído!' : 'Fin de la emisión'}
        </p>
        <h2>
          {right} av {items.length} riktige
        </h2>
        <p>
          {right === items.length
            ? 'Du hørte hvert eneste ord.'
            : 'Hør gjerne parene du bommet på en gang til.'}
          {before
            ? right > before
              ? ' Bedre enn noen gang før.'
              : ` Det beste så langt er ${before} av ${items.length}.`
            : ''}
        </p>
        {missed.length > 0 && (
          <ul className="so-missed">
            {missed.map((m, i) => (
              <li key={i}>
                {wordsOf(m.c).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className={`so-word ${w === m.w ? 'said' : ''}`}
                    onClick={() => void say(spoken(m.c, w))}
                  >
                    <Volume2 />
                    <span className="es" lang="es">
                      {spoken(m.c, w)}
                    </span>
                    <small>{gloss(w)}</small>
                  </button>
                ))}
              </li>
            ))}
          </ul>
        )}
        <div className="acts">
          <TodayNext page="sonidos" className="so-btn" />
          <button type="button" className="so-btn" onClick={again}>
            <EarIcon /> En runde til
          </button>
          <a className="so-link" href="#">
            Til forsiden
          </a>
        </div>
      </section>
    )

  const text = spoken(item.c, item.w)
  return (
    <section className="so-panel so-ear">
      {focus && (
        <p className="so-focus">
          Øver på <b lang="es">{SOUND[focus]?.letters}</b>
          <button type="button" aria-label="Alle lydene" onClick={onUnfocus}>
            <X />
          </button>
        </p>
      )}
      <Speaker text={text} playing={at} />
      <p className="so-ask">Hvilket ord hørte du?</p>
      <div className={`so-opts n${item.options.length}`}>
        {item.options.map((w, i) => {
          const state = !chosen
            ? ''
            : w.id === item.w.id
              ? 'right'
              : w === chosen
                ? 'wrong'
                : 'other'
          return (
            <button
              key={w.id}
              type="button"
              className={`so-opt ${state}`}
              disabled={!!chosen}
              onClick={() => answer(w)}
            >
              {fine && <kbd aria-hidden="true">{i + 1}</kbd>}
              <span className="es" lang="es">
                {spoken(item.c, w)}
              </span>
              <small>{gloss(w)}</small>
            </button>
          )
        })}
      </div>
      {chosen && (
        <div className="so-after" aria-live="polite">
          <p className="verdict">
            {chosen.id === item.w.id ? (
              <b className="ok" lang="es">
                ¡Eso es!
              </b>
            ) : (
              <>
                <b className="no">Det var </b>
                <b lang="es">{text}</b>
              </>
            )}
          </p>
          <p className="note">{item.c.note}</p>
          <div className="pair">
            {item.options.map((w) => (
              <button
                key={w.id}
                type="button"
                className="so-word small"
                onClick={() => void say(spoken(item.c, w))}
              >
                <Volume2 />
                <span className="es" lang="es">
                  {spoken(item.c, w)}
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="so-btn" onClick={next} autoFocus>
            Neste <ArrowRight />
          </button>
        </div>
      )}
    </section>
  )
}

// --- The dictation ---

// The keys on the screen: the letters, rubbing out, and checking
function Keys({
  onKey,
  disabled,
}: {
  onKey: (k: string) => void
  disabled: boolean
}) {
  return (
    <div className="so-typer" aria-label="Tastatur">
      {KEY_ROWS.map((row, r) => (
        <div key={r} className="row">
          {row.map((k) => (
            <button
              key={k}
              type="button"
              disabled={disabled}
              onClick={() => onKey(k)}
            >
              {k}
            </button>
          ))}
          {r === 2 && (
            <button
              type="button"
              className="wide"
              disabled={disabled}
              aria-label="Slett"
              onClick={() => onKey('Backspace')}
            >
              <Delete />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// The word written as it is, the letters missed marked
function Marked({ word, marks }: { word: string; marks: Array<boolean> }) {
  return (
    <span className="so-marked" lang="es">
      {[...word].map((c, i) => (
        <span key={i} className={marks[i] ? 'miss' : ''}>
          {c}
        </span>
      ))}
    </span>
  )
}

function Dictado({ onProgress }: { onProgress: (p: Progress | null) => void }) {
  const { bank, points, played } = useStore()
  const deal = () => dictation(bank, Date.now())
  const [words, setWords] = useState<Array<Word>>(deal)
  const [at, setAt] = useState(0)
  const [typed, setTyped] = useState('')
  const [checked, setChecked] = useState<Checked | null>(null)
  const [hint, setHint] = useState(false)
  const [marks, setMarks] = useState<Array<boolean>>([])
  const [missed, setMissed] = useState<Array<Word>>([])
  const w = words.at(at)
  const right = marks.filter(Boolean).length

  useEffect(() => {
    onProgress({ n: words.length, at, marks })
  }, [words, at, marks])
  useEffect(() => () => onProgress(null), [])

  useEffect(() => {
    if (w) void say(w.es)
  }, [w])

  useEffect(() => {
    if (w || !words.length) return
    if (right) points(right)
    played('sonidos')
    const t = setTimeout(() => blip('win'), 300)
    return () => clearTimeout(t)
  }, [w])

  const submit = (gaveUp = false) => {
    if (!w || checked) return
    if (!gaveUp && !typed.trim()) return
    const c: Checked = gaveUp
      ? { right: false, slips: [], marks: [...w.bare].map(() => true) }
      : check(typed, w)
    setChecked(c)
    setMarks((m) => [...m, c.right])
    if (!c.right) setMissed((m) => [...m, w])
    blip(c.right ? 'right' : 'wrong')
  }
  const next = () => {
    if (!checked) return
    setChecked(null)
    setTyped('')
    setHint(false)
    setAt((i) => i + 1)
  }
  const again = () => {
    setWords(deal())
    setAt(0)
    setMarks([])
    setMissed([])
    setTyped('')
    setChecked(null)
    setHint(false)
  }
  const onKey = (k: string) => {
    if (checked) {
      if (k === 'Enter') next()
      return
    }
    if (k === 'Enter') submit()
    else if (k === 'Backspace') setTyped((t) => t.slice(0, -1))
    else if (typed.length < 14) setTyped((t) => t + k.toLowerCase())
  }
  useLetterKeys(onKey, !!w)

  if (!w)
    return (
      <section className="so-panel so-result">
        <p className="kick" lang="es">
          {right === words.length ? '¡Sin una falta!' : 'Fin del dictado'}
        </p>
        <h2>
          {right} av {words.length} riktig skrevet
        </h2>
        {missed.length > 0 && (
          <ul className="so-missed">
            {missed.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="so-word"
                  onClick={() => void say(m.es)}
                >
                  <Volume2 />
                  <span className="es" lang="es">
                    <Es w={m} />
                  </span>
                  <small>{gloss(m)}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="acts">
          <TodayNext page="sonidos" className="so-btn" />
          <button type="button" className="so-btn" onClick={again}>
            En diktat til
          </button>
          <a className="so-link" href="#">
            Til forsiden
          </a>
        </div>
      </section>
    )

  const art = article(w)?.art
  const accent = /[áéíóú]/.test(w.bare)
  return (
    <section className="so-panel so-dict">
      <Speaker text={w.es} playing={at} />
      <p className="so-ask">Skriv ordet du hører</p>
      <div
        className={`so-sheet ${checked ? (checked.right ? 'ok' : 'no') : ''}`}
      >
        {art && (
          <span className="art" lang="es">
            {art}
          </span>
        )}
        <span className="line" lang="es" aria-label="Det du har skrevet">
          {checked && !checked.right && !typed ? '' : typed}
          {!checked && <i className="caret" />}
        </span>
      </div>
      {checked ? (
        <div className="so-after" aria-live="polite">
          {checked.right ? (
            <p className="verdict">
              <b className="ok" lang="es">
                ¡Bien escrito!
              </b>
            </p>
          ) : (
            <p className="verdict">
              <b className="no">Det skrives </b>
              {art && <span lang="es">{art} </span>}
              <Marked word={w.bare} marks={checked.marks} />
            </p>
          )}
          {checked.right && (accent || w.bare.includes('ü')) && (
            <p className="note">
              {w.bare.includes('ü') ? 'Med prikker over u-en' : 'Med aksent'}:{' '}
              <b lang="es">{w.bare}</b>
            </p>
          )}
          {!checked.right &&
            checked.slips.map((s) => (
              <p key={s} className="note">
                {SLIP_NOTE[s]}
              </p>
            ))}
          {!checked.right && !checked.slips.length && typed && (
            <p className="note">
              Du skrev <b lang="es">{typed}</b>. Hør på ordet en gang til.
            </p>
          )}
          <p className="mean">
            <span lang="es">
              <Es w={w} peek />
            </span>{' '}
            betyr «{gloss(w)}»
          </p>
          <button type="button" className="so-btn" onClick={next} autoFocus>
            Neste <ArrowRight />
          </button>
        </div>
      ) : (
        <>
          <div className="so-tools">
            {hint ? (
              <p className="so-hint">Betyr «{gloss(w)}»</p>
            ) : (
              <button
                type="button"
                className="so-link"
                onClick={() => setHint(true)}
              >
                Hva betyr det?
              </button>
            )}
            <button
              type="button"
              className="so-link"
              onClick={() => submit(true)}
            >
              Vis ordet
            </button>
          </div>
          <Keys onKey={onKey} disabled={!!checked} />
          <button
            type="button"
            className="so-btn check"
            disabled={!flat(typed)}
            onClick={() => submit()}
          >
            Sjekk
          </button>
        </>
      )}
    </section>
  )
}
