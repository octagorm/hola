import { useEffect, useState } from 'react'
import { ArrowLeft, ChartColumn, Delete, X } from 'lucide-react'
import { WORD, gloss } from '../data/words'
import { dayKey } from '../lib/bank'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import {
  KNOWN_GUESS,
  LENGTH,
  TRIES,
  daily,
  keyMarks,
  marks,
  practice,
} from '../lib/wordle'
import { letters } from '../lib/spanish'
import { TodayNext, useBack } from '../daily'
import { Es, KEY_ROWS, Speak, useFont, useLetterKeys } from '../ui'
import type { Word } from '../data/words'
import type { Mark } from '../lib/wordle'
import './palabra.css'

// La palabra: the day's word in six guesses, pearls in a night sky (after
// Dalí's Galatea of the Spheres). Gold is a letter in its place, coral a
// letter in the word elsewhere, dark a letter not in it. The day's word is
// one of the words met, once there are enough of them; after it, more
// words can be played for practice.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap'

// The day's word and the guesses so far, kept so a reload goes on where it
// was: the word is fixed for the day once it is first shown
const KEY = 'hola:palabra:v1'

interface Saved {
  day: string
  id: string
  guesses: Array<string>
}

function loadSaved(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') as Saved | null
  } catch {
    return null
  }
}

function save(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // the round is not kept, no more
  }
}

export default function Palabra() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('palabra')
  const day = dayKey(Date.now())
  // The day's word: the one saved for today, or a new one
  const [today] = useState<Saved>(() => {
    const s = loadSaved()
    if (s?.day === day && WORD[s.id]) return s
    const fresh = { day, id: daily(bank, Date.now()).id, guesses: [] }
    save(fresh)
    return fresh
  })
  const [round, setRound] = useState<{ w: Word; daily: boolean; n: number }>(
    () => ({
      w: WORD[today.id] as Word,
      daily: true,
      n: 0,
    }),
  )
  const [stats, setStats] = useState(false)
  const met = Object.keys(bank.cards).length

  return (
    <div className="g5">
      <div className="g5-sky" aria-hidden="true">
        <i className="gold" />
        <i className="coral" />
        <i className="cyan" />
        <i className="pearl" />
        <i className="pearl small" />
      </div>
      <div className="g5-col">
        <header className="g5-top">
          <a className="g5-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            La palabra
            <small>
              {round.daily
                ? `${met >= 12 ? 'Fra dine ord' : 'Fra ordlista'} · ${new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}`
                : 'Øving · et ord til'}
            </small>
          </h1>
          <button
            type="button"
            className="g5-round"
            aria-label="Statistikk"
            aria-pressed={stats}
            onClick={() => setStats(!stats)}
          >
            {stats ? <X /> : <ChartColumn />}
          </button>
        </header>
        {stats ? (
          <Stats />
        ) : (
          <Board
            key={`${round.w.id} ${round.n}`}
            w={round.w}
            daily={round.daily}
            start={round.daily ? today.guesses : []}
            onAgain={() =>
              setRound((r) => ({
                w: practice(bank, Date.now()),
                daily: false,
                n: r.n + 1,
              }))
            }
          />
        )}
      </div>
    </div>
  )
}

function Board({
  w,
  daily: isDaily,
  start,
  onAgain,
}: {
  w: Word
  daily: boolean
  start: Array<string>
  onAgain: () => void
}) {
  const { bank, setPalabra, played, points, meet, record } = useStore()
  const answer = letters(w.bare)
  const day = dayKey(Date.now())
  const [guesses, setGuesses] = useState<Array<string>>(start)
  const [typed, setTyped] = useState('')
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [fresh, setFresh] = useState(-1)
  const won = guesses.includes(answer)
  const over = won || guesses.length >= TRIES
  // A round taken up again that was already over
  const [ended, setEnded] = useState(over)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1600)
    return () => clearTimeout(t)
  }, [toast])

  // The end of a round: the word goes to the bank, the day's to the
  // record of days
  useEffect(() => {
    if (!over || ended) return
    setEnded(true)
    // After the last row has turned
    setTimeout(
      () => {
        blip(won ? 'win' : 'wrong')
        void say(w.es)
      },
      LENGTH * 140 + 200,
    )
    if (!bank.cards[w.id]) meet([w.id])
    else if (won) record(w.id, true, 0.3, 'decir')
    if (isDaily) {
      setPalabra(day, won ? guesses.length : 0)
      played('palabra')
      if (won) points(TRIES + 1 - guesses.length)
    }
  }, [
    over,
    ended,
    won,
    w,
    isDaily,
    day,
    guesses.length,
    bank.cards,
    meet,
    record,
    setPalabra,
    played,
    points,
  ])

  const onKey = (k: string) => {
    if (over) return
    if (k === 'Backspace') {
      setTyped((t) => t.slice(0, -1))
      return
    }
    if (k === 'Enter') {
      if (typed.length < LENGTH) {
        setShake(true)
        setTimeout(() => setShake(false), 400)
        setToast('For få bokstaver')
        return
      }
      const next = [...guesses, typed]
      setGuesses(next)
      setFresh(next.length - 1)
      setTyped('')
      if (isDaily) save({ day, id: w.id, guesses: next })
      if (typed !== answer) blip('tap')
      return
    }
    if (typed.length < LENGTH) setTyped((t) => t + k)
  }
  useLetterKeys(onKey, !over)

  const keys = keyMarks(guesses, answer)
  const seen = guesses.flatMap((g) => {
    const x = KNOWN_GUESS[g]
    return x ? [x] : []
  })

  return (
    <>
      <div
        className="g5-rows"
        role="img"
        aria-label={`${guesses.length} forsøk av ${TRIES}`}
      >
        {Array.from({ length: TRIES }, (_, r) => {
          const g = guesses.at(r)
          const m: Array<Mark> | null = g ? marks(g, answer) : null
          const now = r === guesses.length && !over
          const row = g ?? (now ? typed : '')
          return (
            <div
              key={r}
              className={`g5-row ${now && shake ? 'shake' : ''} ${r === fresh ? 'reveal' : ''}`}
            >
              {Array.from({ length: LENGTH }, (_c, i) => {
                const c = row.at(i)
                const cls = m ? m[i] : c ? 'p' : 'e'
                const cur = now && i === typed.length
                return (
                  <b
                    key={i}
                    className={`${cls} ${cur ? 'cur' : ''}`}
                    style={
                      r === fresh
                        ? { animationDelay: `${i * 140}ms` }
                        : undefined
                    }
                  >
                    {c}
                  </b>
                )
              })}
            </div>
          )
        })}
      </div>

      {toast && <div className="g5-toast">{toast}</div>}

      {over && ended ? (
        <div
          className="g5-result"
          style={{ animationDelay: `${LENGTH * 140}ms` }}
        >
          <p className="kick">{won ? '¡Lo tienes!' : 'Ordet var'}</p>
          <div className="word">
            <b lang="es">
              <Es w={w} />
            </b>
            <Speak text={w.es} small className="g5-speak" />
          </div>
          <p className="mean">{gloss(w)}</p>
          <p className="note">
            {won ? `På ${guesses.length} forsøk.` : 'Seks forsøk brukt.'}{' '}
            {isDaily ? 'Et nytt ord kommer i morgen.' : ''}
          </p>
          <div className="acts">
            <TodayNext page="palabra" className="g5-btn" />
            <button type="button" className="g5-btn ghost" onClick={onAgain}>
              Øv med et ord til
            </button>
            <a className="g5-link" href="#">
              Til forsiden
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="g5-legend">
            <span>
              <i style={{ background: '#e8b44f' }} />
              riktig plass
            </span>
            <span>
              <i style={{ background: '#ef7a5c' }} />i ordet
            </span>
            <span>
              <i style={{ background: '#27306a' }} />
              ikke med
            </span>
          </div>
          {seen.length > 0 && (
            <div className="g5-seen">
              {seen.map((x) => (
                <span key={x.id}>
                  <b>{x.bare}</b>
                  {gloss(x)}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <div className="g5-keys" aria-label="Tastatur">
        {KEY_ROWS.map((row, i) => (
          <div key={i}>
            {i === 2 && (
              <button
                type="button"
                className="wide"
                onClick={() => onKey('Enter')}
              >
                SEND
              </button>
            )}
            {row.map((k) => (
              <button
                key={k}
                type="button"
                className={keys[k] ?? ''}
                onClick={() => onKey(k)}
              >
                {k}
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
    </>
  )
}

// The days played: how many, how many solved, and in how many guesses
function Stats() {
  const { bank } = useStore()
  const days = Object.values(bank.palabra).filter((n) => n !== undefined)
  const solved = days.filter((n) => n > 0)
  const by = Array.from(
    { length: TRIES },
    (_, i) => solved.filter((n) => n === i + 1).length,
  )
  const most = Math.max(1, ...by)
  return (
    <div className="g5-stats">
      <div className="nums">
        <div>
          <b>{days.length}</b>dager spilt
        </div>
        <div>
          <b>
            {days.length ? Math.round((solved.length / days.length) * 100) : 0}
          </b>
          % løst
        </div>
      </div>
      <h2>Antall forsøk</h2>
      <ol>
        {by.map((n, i) => (
          <li key={i}>
            <span>{i + 1}</span>
            <i style={{ width: `${Math.max(6, (n / most) * 100)}%` }}>{n}</i>
          </li>
        ))}
      </ol>
    </div>
  )
}
