import { useEffect, useState } from 'react'
import { ArrowLeft, Delete } from 'lucide-react'
import { article, meaning } from '../data/words'
import { isRight, ring } from '../lib/rosco'
import { letters } from '../lib/spanish'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { NEEDS, clueCount } from '../lib/today'
import { TodayNext, useBack } from '../daily'
import { Es, KEY_ROWS, Speak, useFont, useLetterKeys } from '../ui'
import type { Clue } from '../lib/rosco'
import './rosco.css'

// El rosco, after the ring of letters in the TV quiz Pasapalabra: a word
// for each letter from its meaning in Norwegian, said in Spanish (decir).
// «Pasapalabra» leaves a letter for the next time round. On the red walls
// of Dalí's Teatro-Museo in Figueres, with its loaves and eggs.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,700;0,6..96,900;1,6..96,500;1,6..96,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap'

// Fewer letters than this make no ring
const LEAST = 8

type Status = 'right' | 'wrong' | 'pass'

export default function Rosco() {
  useFont(FONTS)
  const { bank } = useStore()
  const back = useBack('rosco')
  const [round, setRound] = useState(() => ({
    n: 0,
    clues: ring(bank, Date.now()),
  }))
  const enough = round.clues.length >= LEAST && clueCount(bank) >= NEEDS.rosco

  return (
    <div className="r6">
      <div className="r6-col">
        {enough ? (
          <Game
            key={round.n}
            clues={round.clues}
            back={back}
            onAgain={() =>
              setRound((r) => ({ n: r.n + 1, clues: ring(bank, Date.now()) }))
            }
          />
        ) : (
          <TooFew back={back} />
        )}
      </div>
    </div>
  )
}

function Top({ back, score }: { back: string; score?: [number, number] }) {
  return (
    <header className="r6-top">
      <a className="r6-round" href={back} aria-label="Tilbake">
        <ArrowLeft />
      </a>
      <h1>
        El rosco<small>Bokstavringen</small>
      </h1>
      {score && (
        <span className="r6-score">
          <b>{score[0]}</b> riktige <i /> <b>{score[1]}</b> igjen
        </span>
      )}
    </header>
  )
}

function TooFew({ back }: { back: string }) {
  const { bank } = useStore()
  const clues = clueCount(bank)
  return (
    <>
      <Top back={back} />
      <section className="r6-card">
        <p className="kick">Ikke ennå</p>
        <h2>Ringen trenger flere ord</h2>
        <p>
          Bokstavringen lages av ordene du har møtt, ett for hver bokstav, og
          det trengs minst {NEEDS.rosco} som kan være et hint. Hilsener og
          uttrykk kan ikke det. Du har {clues}.
        </p>
        <div className="acts">
          <a className="r6-btn gold" href="#nuevas">
            Lær nye ord
          </a>
          <a className="r6-link" href="#">
            Til forsiden
          </a>
        </div>
      </section>
    </>
  )
}

// The answer typed, with or without the noun's article
const answers = (typed: string, c: Clue) =>
  isRight(typed, c) ||
  ['EL', 'LA', 'LOS', 'LAS'].some((a) => letters(typed) === a + c.answer)

function Game({
  clues,
  back,
  onAgain,
}: {
  clues: Array<Clue>
  back: string
  onAgain: () => void
}) {
  const { record, setBest, points, played } = useStore()
  const [status, setStatus] = useState<Array<Status | undefined>>(() =>
    clues.map(() => undefined),
  )
  const [at, setAt] = useState(0)
  const [typed, setTyped] = useState('')
  // The letter just got wrong, to show its word
  const [last, setLast] = useState<number | null>(null)
  const [over, setOver] = useState(false)

  const open = (s: Array<Status | undefined>) =>
    s.flatMap((x, i) => (x === 'right' || x === 'wrong' ? [] : [i]))
  const right = status.filter((x) => x === 'right').length
  const left = open(status).length

  const end = (s: Array<Status | undefined>) => {
    const n = s.filter((x) => x === 'right').length
    setOver(true)
    setBest('rosco', n)
    if (n) points(n)
    played('rosco')
    setTimeout(() => blip('win'), 400)
  }

  // On to the next letter still open, after this one
  const onward = (s: Array<Status | undefined>) => {
    const rest = open(s)
    if (!rest.length) return end(s)
    setAt(rest.find((i) => i > at) ?? rest[0])
    setTyped('')
  }

  const answer = () => {
    if (over || !typed) return
    const c = clues[at]
    const ok = answers(typed, c)
    const s = status.map((x, i) => (i === at ? (ok ? 'right' : 'wrong') : x))
    record(c.word.id, ok, 1, 'decir')
    setStatus(s)
    setLast(ok ? null : at)
    if (ok) blip('right')
    else {
      blip('wrong')
      void say(c.word.es)
    }
    onward(s)
  }

  const pass = () => {
    if (over) return
    const s = status.map((x, i) => (i === at ? 'pass' : x))
    setStatus(s)
    setLast(null)
    blip('tap')
    onward(s)
  }

  // The rest left unanswered, and the ring ends
  const stop = () => {
    if (over) return
    end(status)
  }

  const onKey = (k: string) => {
    if (over) return
    if (k === 'Enter') answer()
    else if (k === 'Backspace') setTyped((t) => t.slice(0, -1))
    else setTyped((t) => (t.length < 16 ? t + k : t))
  }
  useLetterKeys(onKey, !over)

  // Space passes the word
  useEffect(() => {
    if (over) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.ctrlKey || e.metaKey || e.altKey) return
      if ((e.target as HTMLElement | null)?.closest('button, a, input')) return
      e.preventDefault()
      pass()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const c = clues[at]
  const a = article(c.word)
  const n = clues.length

  return (
    <>
      <Top back={back} score={[right, over ? 0 : left]} />
      <div className="r6-play">
        <div className="r6-ring" style={{ ['--k' as string]: n }}>
          {clues.map((x, i) => (
            <span
              key={x.letter}
              className={`r6-egg ${status[i] ?? ''} ${!over && i === at ? 'at' : ''}`}
              style={{ ['--a' as string]: `${(360 / n) * i}deg` }}
              aria-label={`${x.letter}${status[i] === 'right' ? ', riktig' : status[i] === 'wrong' ? ', feil' : ''}`}
            >
              {x.letter}
            </span>
          ))}
          <div className="r6-dome">
            <i className="bulbs" aria-hidden="true" />
            {over ? (
              <div className="end">
                <b>{right}</b>
                <span>av {n}</span>
              </div>
            ) : (
              <div className="clue" aria-live="polite">
                <p className="how">
                  {c.starts ? 'Empieza por' : 'Contiene'} <b>{c.letter}</b>
                  <small>{c.starts ? 'begynner på' : 'inneholder'}</small>
                </p>
                <p className="mean">
                  {meaning(c.word)}
                  {a && (
                    <em>
                      {' '}
                      (
                      <span className={c.word.g === 'f' ? 'g-f' : 'g-m'}>
                        {a.art}
                      </span>{' '}
                      …)
                    </em>
                  )}
                </p>
                <p className={`typed ${typed ? '' : 'empty'}`}>
                  {typed || '·'}
                </p>
              </div>
            )}
          </div>
        </div>

        {over ? (
          <Result clues={clues} status={status} onAgain={onAgain} />
        ) : (
          <>
            <p className="r6-note" aria-live="polite">
              {last !== null ? (
                <>
                  {clues[last].letter}: det var{' '}
                  <b lang="es">{clues[last].word.bare}</b> ·{' '}
                  {meaning(clues[last].word)}
                </>
              ) : status[at] === 'pass' ? (
                'Andre runde for denne bokstaven.'
              ) : (
                'Skriv ordet på spansk. Aksenter trengs ikke.'
              )}
            </p>
            <div className="r6-acts">
              <button type="button" className="r6-btn" onClick={pass}>
                Pasapalabra
              </button>
              <button
                type="button"
                className="r6-btn gold"
                onClick={answer}
                disabled={!typed}
              >
                Svar
              </button>
            </div>
            <div className="r6-keys" aria-label="Tastatur">
              {KEY_ROWS.map((row, i) => (
                <div key={i}>
                  {row.map((k) => (
                    <button key={k} type="button" onClick={() => onKey(k)}>
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
            <p className="r6-stop">
              <button type="button" className="r6-link" onClick={stop}>
                Stopp her
              </button>
            </p>
          </>
        )}
      </div>
    </>
  )
}

function Result({
  clues,
  status,
  onAgain,
}: {
  clues: Array<Clue>
  status: Array<Status | undefined>
  onAgain: () => void
}) {
  const { bank } = useStore()
  const right = status.filter((x) => x === 'right').length
  const best = bank.best.rosco ?? right
  const missed = clues.flatMap((c, i) =>
    status[i] === 'right' ? [] : [{ c, s: status[i] }],
  )
  return (
    <section className="r6-card r6-result">
      <p className="kick">
        {right === clues.length ? '¡Rosco completo!' : 'Fin del rosco'}
      </p>
      <h2>
        {right} av {clues.length} bokstaver
      </h2>
      <p>
        {right >= best ? 'Din beste ring hittil.' : `Din beste ring: ${best}.`}
      </p>
      {missed.length > 0 && (
        <>
          <h3>Ordene du ikke fikk</h3>
          <ul>
            {missed.map(({ c, s }) => (
              <li key={c.letter}>
                <i>{c.letter}</i>
                <b lang="es">
                  <Es w={c.word} />
                </b>
                <span>
                  {meaning(c.word)}
                  {s !== 'wrong' && ' · ikke svart'}
                </span>
                <Speak
                  text={c.word.es}
                  small
                  label={`Hør ${c.word.es}`}
                  className="r6-speak"
                />
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="acts">
        <TodayNext page="rosco" className="r6-btn gold" />
        <button type="button" className="r6-btn" onClick={onAgain}>
          En ring til
        </button>
        <a className="r6-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}
