import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Delete, Shuffle } from 'lucide-react'
import {
  MOST,
  ROUNDS,
  SIZE,
  askOf,
  canAsk,
  glossOf,
  longest,
  lookup,
  metForms,
  nextLetter,
  target,
} from '../lib/letras'
import { shuffle } from '../lib/choices'
import { blip } from '../lib/sound'
import { say } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { Speak, useFont, useLetterKeys } from '../ui'
import type { CSSProperties } from 'react'
import type { Ask, Form } from '../lib/letras'
import './letras.css'

// Letras, after the round of letters in «Cifras y letras» on Spanish TV:
// nine letters drawn one at a time as the player asks for a vowel or a
// consonant, and the longest word she can set from them, each letter used
// once. No clock. Three rounds; the score is the letters of her words. In a
// letterpress print shop: wooden type in a composing stick, printed in
// black and red on cream paper.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Bitter:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap'

interface Round {
  target: Form
  blocks: Array<string>
  // Her word, or none if she let it be
  word: Form | null
  // The longest words of hers in the letters
  best: Array<Form>
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

const ASK_NAME: Record<Ask, string> = { v: 'Vokal', c: 'Konsonant' }

// Under each button: how many she has, and how many she may have
function askNote(a: Ask, n: number): string {
  const least = SIZE - MOST[a === 'v' ? 'c' : 'v']
  if (n < least) return `${n} av minst ${least}`
  if (n < MOST[a]) return `${n} · høyst ${MOST[a]}`
  return a === 'v' ? 'nok vokaler' : 'nok konsonanter'
}

export default function Letras() {
  useFont(FONTS)
  const back = useBack('letras')
  const [game, setGame] = useState(0)
  return (
    <div className="lt">
      <Case />
      <div className="lt-col">
        <Game key={game} back={back} onAgain={() => setGame((g) => g + 1)} />
      </div>
    </div>
  )
}

function Top({
  back,
  round,
  score,
}: {
  back: string
  round?: number
  score?: number
}) {
  return (
    <header className="lt-top">
      <a className="lt-round" href={back} aria-label="Tilbake">
        <ArrowLeft />
      </a>
      <h1>
        Letras<small>Bokstavene</small>
      </h1>
      {round !== undefined && (
        <div className="lt-score">
          <span className="pips" aria-label={`Runde ${round} av ${ROUNDS}`}>
            {range(ROUNDS).map((i) => (
              <i key={i} className={i < round ? 'on' : ''} />
            ))}
          </span>
          <b>{score ?? 0}</b>
          <span>bokstaver</span>
        </div>
      )}
    </header>
  )
}

function Game({ back, onAgain }: { back: string; onAgain: () => void }) {
  const { bank, record, meet, points, setBest, played } = useStore()
  const [done, setDone] = useState<Array<Round>>([])
  const [goal, setGoal] = useState<Form>(() => target(bank, Date.now()))
  const [blocks, setBlocks] = useState<Array<string>>([])
  // The blocks in the stick, in the order they stand there
  const [order, setOrder] = useState<Array<number>>(() => range(SIZE))
  // The blocks set in her word, in order
  const [word, setWord] = useState<Array<number>>([])
  // The word as of the last key, since keys can come faster than the page
  // is drawn again
  const liveWord = useRef<Array<number>>([])
  const putWord = (next: Array<number>) => {
    liveWord.current = next
    setWord(next)
  }
  const [note, setNote] = useState('')
  const [shake, setShake] = useState(0)
  const [shown, setShown] = useState<Round | null>(null)
  const [end, setEnd] = useState<{ score: number; before: number } | null>(null)
  // The letters drawn as of the last ask, since asks can come faster than
  // the page is drawn again
  const live = useRef<Array<string>>([])

  const drawing = blocks.length < SIZE
  // (a word made counts as soon as it is printed)
  const score = [...done, ...(shown ? [shown] : [])].reduce(
    (s, r) => s + (r.word?.key.length ?? 0),
    0,
  )
  const tally = (cs: Array<string>, a: Ask) =>
    cs.filter((c) => askOf(c) === a).length

  const ask = (a: Ask) => {
    const cur = live.current
    if (shown || end || !canAsk(cur, a)) return
    // Longer words of hers to give letters for, but not those shown in
    // the rounds before, so that each round has words of its own
    const seen = new Set(
      done.flatMap((r) => [r.target.key, ...r.best.map((f) => f.key)]),
    )
    const pool = metForms(bank)
      .map((f) => f.key)
      .filter((k) => !seen.has(k))
    const next = [...cur, nextLetter(cur, a, goal.key, pool)]
    live.current = next
    setBlocks(next)
    blip('tap')
  }

  // A block set in the word, or taken out of it again
  const toggle = (i: number) => {
    if (drawing || shown || end) return
    setNote('')
    const cur = liveWord.current
    if (cur.includes(i)) putWord(cur.filter((j) => j !== i))
    else {
      putWord([...cur, i])
      blip('tap')
    }
  }

  // A letter typed: the first block with it not yet in the word
  const type = (ch: string) => {
    const i = order.find(
      (j) => blocks[j] === ch && !liveWord.current.includes(j),
    )
    if (i !== undefined) toggle(i)
  }

  const finish = (form: Form | null) => {
    setShown({
      target: goal,
      blocks,
      word: form,
      best: longest(blocks, metForms(bank)),
    })
    setNote('')
    if (form) {
      blip('right')
      void say(form.say)
    }
  }

  const check = () => {
    const cur = liveWord.current
    if (drawing || shown || end || cur.length < 2) return
    const key = cur.map((i) => blocks[i]).join('')
    const form = lookup(key, bank).at(0)
    if (!form) {
      // Kindly, and nothing lost: another word can be tried
      setNote('Det ordet kjenner ikke Hola ennå. Prøv et annet.')
      setShake((n) => n + 1)
      return
    }
    // Her word, set from letters she was given: saying it, as when picking
    // the Spanish from a few, since the letters were there to choose from
    if (bank.cards[form.w.id]) record(form.w.id, true, 0.6, 'decir')
    else meet([form.w.id])
    finish(form)
  }

  const next = () => {
    if (!shown) return
    const all = [...done, shown]
    setDone(all)
    setShown(null)
    putWord([])
    setOrder(range(SIZE))
    setNote('')
    live.current = []
    setBlocks([])
    if (all.length < ROUNDS) {
      setGoal(
        target(
          bank,
          Date.now(),
          Math.random,
          all.map((r) => r.target.w.id),
        ),
      )
      return
    }
    const total = all.reduce((s, r) => s + (r.word?.key.length ?? 0), 0)
    setEnd({ score: total, before: bank.best.letras ?? 0 })
    setBest('letras', total)
    if (total) points(total)
    played('letras')
    setTimeout(() => blip('win'), 300)
  }

  const onKey = (k: string) => {
    if (end) return
    if (shown) {
      if (k === 'Enter') next()
      return
    }
    if (drawing) {
      // V for a vowel, K for a consonant
      if (k === 'V') ask('v')
      else if (k === 'K') ask('c')
      return
    }
    if (k === 'Enter') check()
    else if (k === 'Backspace') putWord(liveWord.current.slice(0, -1))
    else type(k)
  }
  useLetterKeys(onKey, !end)

  if (end)
    return (
      <>
        <Top back={back} round={ROUNDS} score={end.score} />
        <End rounds={done} end={end} onAgain={onAgain} />
      </>
    )

  const round = done.length + 1
  const set = word.map((i) => blocks[i])
  const v = tally(blocks, 'v')
  const c = tally(blocks, 'c')

  return (
    <>
      <Top back={back} round={round} score={score} />

      <section
        className={`lt-sheet ${shown ? 'printed' : ''}`}
        aria-live="polite"
      >
        <span className="lt-sun" aria-hidden="true" />
        {shown ? (
          <Printed r={shown} round={round} />
        ) : drawing ? (
          <div className="lt-ask-head">
            <p className="kick">Runde {round}</p>
            <h2 lang="es">
              <span className="red">¿Vocal</span> o consonante?
            </h2>
            <p className="sub">
              Be om ni bokstaver, minst tre vokaler og fire konsonanter. Så
              lager du det lengste ordet du kan av dem.
            </p>
            <p className="lt-hint">Tastene V og K virker også.</p>
          </div>
        ) : (
          <div className="lt-set">
            <p className="kick">Ditt ord</p>
            <div
              key={shake}
              className={`lt-line ${set.length ? '' : 'empty'} ${shake ? 'shake' : ''}`}
              style={{ '--n': Math.max(set.length, 6) } as CSSProperties}
            >
              {set.length ? (
                set.map((ch, k) => (
                  <button
                    key={`${word[k]}`}
                    type="button"
                    className={askOf(ch) === 'v' ? 'red' : ''}
                    aria-label={`Ta ut ${ch}`}
                    onClick={() => toggle(word[k])}
                  >
                    {ch}
                  </button>
                ))
              ) : (
                <span>Trykk på bokstavene for å sette et ord</span>
              )}
            </div>
            <p className={`lt-note ${note ? 'no' : ''}`}>
              {note ||
                (set.length === 1
                  ? 'Minst to bokstaver.'
                  : 'Ordene i Hola teller, også i flertall.')}
            </p>
          </div>
        )}
      </section>

      <div className="lt-stick" role="group" aria-label="Bokstavene">
        {order.map((i) => {
          const ch = blocks.at(i)
          if (!ch) return <span key={i} className="lt-slot" />
          const used = word.includes(i)
          return (
            <button
              key={i}
              type="button"
              className={`lt-block ${askOf(ch) === 'v' ? 'red' : ''} ${used ? 'used' : ''}`}
              aria-label={used ? `${ch}, satt` : ch}
              aria-pressed={used}
              disabled={drawing || !!shown}
              onClick={() => toggle(i)}
            >
              {ch}
            </button>
          )
        })}
      </div>

      {shown ? (
        <Best r={shown} last={round >= ROUNDS} onNext={next} />
      ) : drawing ? (
        <div className="lt-asks">
          {(['v', 'c'] as const).map((a) => (
            <button
              key={a}
              type="button"
              className={`lt-ask ${a === 'v' ? 'red' : ''}`}
              disabled={!canAsk(blocks, a)}
              onClick={() => ask(a)}
            >
              {ASK_NAME[a]}
              <small>{askNote(a, a === 'v' ? v : c)}</small>
            </button>
          ))}
        </div>
      ) : (
        <div className="lt-acts">
          <button
            type="button"
            className="lt-btn"
            disabled={word.length < 2}
            onClick={check}
          >
            Sjekk ordet
          </button>
          <button
            type="button"
            className="lt-tool"
            aria-label="Ta ut den siste"
            disabled={!word.length}
            onClick={() => putWord(liveWord.current.slice(0, -1))}
          >
            <Delete />
          </button>
          <button
            type="button"
            className="lt-tool"
            aria-label="Bland bokstavene"
            onClick={() => {
              setOrder(shuffle(order))
              blip('tap')
            }}
          >
            <Shuffle />
          </button>
          <button
            type="button"
            className="lt-link"
            onClick={() => finish(null)}
          >
            Vis de lengste ordene
          </button>
        </div>
      )}
    </>
  )
}

// Her word, printed, and what it means
function Printed({ r, round }: { r: Round; round: number }) {
  const w = r.word
  return (
    <div className="lt-print">
      <p className="kick">
        Runde {round}
        {w ? ` · ${w.key.length} bokstaver` : ''}
      </p>
      {w ? (
        <>
          <div
            className="lt-word"
            lang="es"
            style={{ '--n': Math.max(w.key.length, 5) } as CSSProperties}
          >
            {[...w.key].map((ch, i) => (
              <span
                key={i}
                className={askOf(ch) === 'v' ? 'red' : ''}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {ch}
              </span>
            ))}
          </div>
          <p className="lt-gloss">
            <b lang="es">{w.say}</b> · {glossOf(w)}
            <Speak text={w.say} small label={`Hør ${w.say}`} />
          </p>
        </>
      ) : (
        <h2 className="lt-none">Ikke noe ord denne gangen</h2>
      )}
    </div>
  )
}

// The longest words of hers in the letters, each said on a tap
function Best({
  r,
  last,
  onNext,
}: {
  r: Round
  last: boolean
  onNext: () => void
}) {
  const mine = r.word?.key
  return (
    <section className="lt-proof">
      <h3>
        {r.best.length > 1 ? 'De lengste ordene' : 'Det lengste ordet'}{' '}
        <span>av ordene dine</span>
      </h3>
      <ul>
        {r.best.map((f) => (
          <li key={f.key}>
            <button
              type="button"
              className="lt-say"
              onClick={() => void say(f.say)}
              aria-label={`Hør ${f.say}`}
            >
              <b lang="es">{f.es}</b>
              <span>{glossOf(f)}</span>
            </button>
            <em>
              {f.key === mine ? 'ditt ord · ' : ''}
              {f.key.length}
            </em>
          </li>
        ))}
      </ul>
      <div className="lt-acts">
        <button type="button" className="lt-btn" onClick={onNext}>
          {last ? 'Se hvordan det gikk' : 'Neste runde'} <ArrowRight />
        </button>
      </div>
    </section>
  )
}

function End({
  rounds,
  end,
  onAgain,
}: {
  rounds: Array<Round>
  end: { score: number; before: number }
  onAgain: () => void
}) {
  const best = Math.max(end.before, end.score)
  return (
    <section className="lt-sheet lt-end">
      <span className="lt-sun" aria-hidden="true" />
      <p className="kick">Fin de la partida</p>
      <h2>
        {end.score} {end.score === 1 ? 'bokstav' : 'bokstaver'}
      </h2>
      <p className="sub">
        {end.score > end.before && end.before > 0
          ? `Ny rekord! Den forrige var ${end.before}.`
          : end.score >= best
            ? 'Din beste hittil.'
            : `Din beste: ${best}.`}
      </p>
      <ol>
        {rounds.map((r, i) => (
          <li key={i}>
            <i>{i + 1}</i>
            {r.word ? (
              <button
                type="button"
                className="lt-say"
                onClick={() => void say(r.word?.say ?? '')}
                aria-label={`Hør ${r.word.say}`}
              >
                <b lang="es">{r.word.es}</b>
                <span>{glossOf(r.word)}</span>
              </button>
            ) : (
              <span className="none">ikke noe ord</span>
            )}
            <em>{r.word?.key.length ?? 0}</em>
          </li>
        ))}
      </ol>
      <div className="lt-acts">
        <TodayNext page="letras" className="lt-btn" />
        <button type="button" className="lt-btn ghost" onClick={onAgain}>
          Tre runder til
        </button>
        <a className="lt-link" href="#">
          Til forsiden
        </a>
      </div>
    </section>
  )
}

// A hash of a compartment, so that the sorts lie about as they would
const scatter = (i: number) => {
  let h = Math.imul(i + 1, 0x9e3779b1)
  h ^= h >>> 15
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  return h >>> 0
}

// The type case along the top of the page: its compartments, some with
// type in them
function Case() {
  const TYPE = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ'
  return (
    <div className="lt-case" aria-hidden="true">
      {range(48).map((i) => {
        const h = scatter(i)
        const n = h % 5
        return (
          <span key={i} className={`fill${n}`}>
            {n > 1 && <i>{TYPE.charAt((h >>> 8) % TYPE.length)}</i>}
            {n > 3 && <i>{TYPE.charAt((h >>> 16) % TYPE.length)}</i>}
          </span>
        )
      })}
    </div>
  )
}
