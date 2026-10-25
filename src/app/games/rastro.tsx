import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Snail,
  Star,
  Volume2,
  Wallet,
} from 'lucide-react'
import { WORD, gloss } from '../data/words'
import {
  ASK,
  MOVE,
  MOVE_NO,
  OFFER,
  STALLS_A_DAY,
  makeDay,
  num,
  numberWords,
  purseFor,
  respond,
  stars,
  startState,
  understood,
  visitWords,
} from '../lib/rastro'
import { plain } from '../lib/text'
import { blip } from '../lib/sound'
import { stop as hush, say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { Es, Mixed, useFont } from '../ui'
import { RastroDefs, SellerFace, StallScene, WarePic } from './rastroArt'
import type { Mood, SellerId } from './rastroArt'
import type { HaggleState, Move, MoveKind, Reply, Visit } from '../lib/rastro'
import './rastro.css'

// El Rastro: Madrid's flea market on a Sunday morning, in hand-coloured
// woodcut. Four things on the list, at four stalls: ask what each costs,
// hear the price, and haggle it down by ear (lib/rastro.ts). What the
// seller says is written out once it is answered, or looked at.

const FONTS =
  'https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=IM+Fell+English:ital@0;1&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap'

// The moves, in the order of their keys; an offer opens its prices
const MOVES: Array<MoveKind> = ['dear', 'cheaper', 'offer', 'buy', 'leave']

interface Result {
  visit: Visit
  paid: number | null
  stars: number
  // What was asked, when the player offered more
  over?: number
  gone?: 'bye' | 'enough'
}

export default function Rastro() {
  useFont(FONTS)
  const { bank, meet, setBest, points, played } = useStore()
  const back = useBack('rastro')
  const [day, setDay] = useState(() => makeDay(bank))
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready')
  const [at, setAt] = useState(0)
  const [purse, setPurse] = useState(0)
  const [results, setResults] = useState<Array<Result>>([])
  const [before, setBefore] = useState(0)

  // The day's words not met yet: what is on the list, and the numbers the
  // sellers will say. They are met as the day begins.
  const fresh = useMemo(
    () => [...new Set(day.flatMap(visitWords))].filter((id) => !bank.cards[id]),
    [day, bank],
  )

  const start = () => {
    if (fresh.length) meet(fresh)
    setPurse(purseFor(day))
    setAt(0)
    setResults([])
    setPhase('play')
  }
  const again = () => {
    setDay(makeDay(bank))
    setPhase('ready')
  }
  const done = (r: Result) => {
    setResults((rs) => [...rs, r])
    if (r.paid !== null) setPurse((p) => p - (r.paid ?? 0))
  }
  const next = () => {
    if (at + 1 < day.length) {
      setAt(at + 1)
      return
    }
    const total = results.reduce((s, r) => s + r.stars, 0)
    const deals = results.filter((r) => r.paid !== null).length
    setBefore(bank.best.rastro ?? 0)
    setBest('rastro', total)
    if (deals) points(deals)
    played('rastro')
    blip('win')
    setPhase('over')
  }

  return (
    <div className="ra">
      <RastroDefs />
      <div className="ra-col">
        <header className="ra-top">
          <a className="ra-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            El Rastro<small>Loppemarkedet</small>
          </h1>
          {phase === 'play' && (
            <span className="ra-purse" aria-label={`${purse} euro i pungen`}>
              <Wallet aria-hidden="true" />
              <b key={purse}>{purse}&nbsp;€</b>
            </span>
          )}
        </header>

        {phase === 'ready' ? (
          <Ready
            day={day}
            fresh={fresh}
            best={bank.best.rastro ?? 0}
            onStart={start}
          />
        ) : phase === 'play' ? (
          <main className="ra-play">
            <List day={day} at={at} results={results} />
            <Stall
              key={at}
              visit={day[at]}
              purse={purse}
              last={at + 1 === day.length}
              onDone={done}
              onNext={next}
            />
          </main>
        ) : (
          <Summary results={results} before={before} onAgain={again} />
        )}
      </div>
    </div>
  )
}

function Ready({
  day,
  fresh,
  best,
  onStart,
}: {
  day: Array<Visit>
  fresh: Array<string>
  best: number
  onStart: () => void
}) {
  // Enter goes to the market
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== 'Enter' || t?.closest('button, a, [role=button]')) return
      e.preventDefault()
      onStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <section className="ra-ready">
      <div className="ra-frame">
        <StallScene who={null} ware="reloj" />
      </div>
      <div className="ra-card">
        <p className="kick">Domingo por la mañana</p>
        <p>
          Du har en handleliste og en pengepung. Spør hva tingene koster, og hør
          godt etter: selgeren sier prisen høyt. Prut den ned, men ikke for
          hardt.
        </p>
        <ol className="ra-want" aria-label="Handlelisten">
          {day.map((v) => (
            <li key={v.ware.id}>
              <WarePic id={v.ware.id} className="pic" />
              <span className="what">
                <Mixed line={v.ware.name} />
              </span>
              <span className="fair">rimelig pris {v.ware.fair}&nbsp;€</span>
            </li>
          ))}
        </ol>
        {fresh.length > 0 && (
          <p className="ra-fresh">
            <b>Nye ord i dag:</b>{' '}
            {fresh.map((id, i) => {
              const w = WORD[id]
              if (!w) return null
              return (
                <span key={id}>
                  {i > 0 && ' · '}
                  <span lang="es">
                    <Es w={w} peek />
                  </span>{' '}
                  – <i>{gloss(w)}</i>
                </span>
              )
            })}
          </p>
        )}
        <p className="small">
          Den laveste prisen selgeren vil gå ned til gir tre stjerner, en
          rimelig pris to. Det selgeren sier, står skrevet først når du har
          svart.
        </p>
        <button type="button" className="ra-btn" onClick={onStart}>
          Gå til markedet <ArrowRight />
        </button>
        {best > 0 && (
          <p className="small">
            Den beste søndagen så langt: {best} av {STALLS_A_DAY * 3} stjerner
          </p>
        )}
      </div>
    </section>
  )
}

// The list: each thing, about what it should cost, and how it went
function List({
  day,
  at,
  results,
}: {
  day: Array<Visit>
  at: number
  results: Array<Result>
}) {
  return (
    <ol className="ra-list" aria-label="Handlelisten">
      {day.map((v, i) => {
        const r = results[i] as Result | undefined
        return (
          <li
            key={v.ware.id}
            className={`${i === at ? 'now' : ''} ${r ? (r.paid === null ? 'none' : 'got') : ''}`}
            title={`Rimelig pris: ${v.ware.fair}\u00a0€`}
          >
            <WarePic id={v.ware.id} className="pic" />
            <span className="nm">
              <Mixed line={v.ware.name} still />
            </span>
            <span className="txt">
              {r ? (
                r.paid === null ? (
                  <span className="how">ikke kjøpt</span>
                ) : (
                  <Stars n={r.stars} />
                )
              ) : (
                <span className="fair">ca. {v.ware.fair}&nbsp;€</span>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span className="ra-stars" aria-label={`${n} av ${of} stjerner`}>
      {Array.from({ length: of }, (_, i) => (
        <Star key={i} className={i < n ? 'on' : ''} aria-hidden="true" />
      ))}
    </span>
  )
}

interface Said {
  who: 'them' | 'you'
  line: string
  // The price named in it
  price?: number
  // Written out: answered, or looked at
  open: boolean
}

// One stall: ask the price, haggle, and see how it went
function Stall({
  visit,
  purse,
  last,
  onDone,
  onNext,
}: {
  visit: Visit
  purse: number
  last: boolean
  onDone: (r: Result) => void
  onNext: () => void
}) {
  const { ware, seller, ladder } = visit
  const who = seller.id as SellerId
  const { record, levelOf } = useStore()
  const { hear } = useVoices()
  const [step, setStep] = useState<'ask' | 'haggle' | 'end'>('ask')
  const [st, setSt] = useState<HaggleState>(() => startState(ware))
  const [log, setLog] = useState<Array<Said>>([])
  const [busy, setBusy] = useState(false)
  const [talking, setTalking] = useState(false)
  const [mood, setMood] = useState<Mood>('wait')
  const [offering, setOffering] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const turn = useRef(0)
  const talk = useRef(0)
  const chat = useRef<HTMLOListElement>(null)
  // With no voice to hear, every line is written out
  const blind = hear === false

  useEffect(
    () => () => {
      turn.current++
      talk.current++
      hush()
    },
    [],
  )

  const price = ladder[st.i]
  const heard = [...log].reverse().find((s) => s.who === 'them')

  // The newest line in view
  useEffect(() => {
    const el = chat.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [log, talking, step])

  // A line said aloud: the player's in the teacher's voice, the seller's
  // in their own (each line has one voice: lib/spoken.ts)
  const speak = async (line: string, them: boolean, slow = false) => {
    const me = ++talk.current
    setTalking(them)
    await say(plain(line), slow)
    if (talk.current === me) setTalking(false)
  }

  // The player says their line; once it is said, the seller answers
  const exchange = async (
    you: string,
    reply: Pick<Reply, 'line' | 'price' | 'paid' | 'gone' | 'mood'> & {
      state?: HaggleState
    },
  ) => {
    const me = ++turn.current
    setBusy(true)
    setNote(null)
    setOffering(false)
    setMood('wait')
    setLog((l) => [
      ...l.map((s) => ({ ...s, open: true })),
      { who: 'you', line: you, open: true },
    ])
    await speak(you, false)
    if (turn.current !== me) return
    const end = reply.paid !== undefined || !!reply.gone
    setLog((l) => [
      ...l,
      { who: 'them', line: reply.line, price: reply.price, open: end || blind },
    ])
    if (reply.state) setSt(reply.state)
    if (reply.mood) setMood(reply.mood)
    await speak(reply.line, true)
    if (turn.current !== me) return
    setBusy(false)
    if (end) finish(reply)
    else if (step === 'ask') setStep('haggle')
  }

  const finish = (reply: Pick<Reply, 'paid' | 'gone'>) => {
    const paid = reply.paid ?? null
    const r: Result = {
      visit,
      paid,
      stars: paid === null ? 0 : stars(ware, ladder, paid),
      ...(reply.gone ? { gone: reply.gone } : {}),
      ...(paid !== null && paid > price ? { over: price } : {}),
    }
    setResult(r)
    setStep('end')
    onDone(r)
    blip(paid === null ? 'wrong' : 'right')
  }

  // A move on a price just heard, and not read, says whether it was heard
  // right: «too dear» of a price over a fair one, buying at one no more
  // than fair, an offer under it. Each word of the price is recorded as
  // heard, at 0.3, since a move is a rough sign of it, nearer a 50/50
  // choice than a pick from a few. A price read first, or a move that
  // says nothing of it (a little cheaper, walking on), records nothing.
  const judge = (m: Move) => {
    if (!heard || heard.price === undefined || heard.open) return
    const ok = understood(ware, heard.price, m)
    if (ok === null) return
    for (const id of numberWords(heard.price))
      if (levelOf(id) > 0) record(id, ok, 0.3, 'leer')
  }

  const ask = () => {
    if (busy || step !== 'ask') return
    void exchange(ASK, {
      line: seller.lines.open(ladder[0]),
      price: ladder[0],
    })
  }

  const move = (m: Move) => {
    if (busy || step !== 'haggle') return
    if (m.k === 'offer' && m.n > purse) return
    if (m.k === 'buy' && price > purse) {
      // More than the purse holds: nothing is said
      setNote(`Du har bare ${purse}\u00a0€ igjen i pungen.`)
      blip('wrong')
      return
    }
    judge(m)
    const reply = respond(ware, ladder, st, m)
    void exchange(
      m.k === 'offer' ? OFFER(m.n, ware.g) : MOVE[m.k](ware.g),
      reply,
    )
  }

  const pick = (k: MoveKind) => {
    if (k === 'offer') {
      if (!busy) setOffering(true)
    } else move({ k })
  }

  // Look at what the seller said, before answering
  const peek = () =>
    setLog((l) =>
      l.map((s, i) => (i === l.length - 1 ? { ...s, open: true } : s)),
    )

  const hearAgain = (slow = false) => {
    if (heard && !busy) void speak(heard.line, true, slow)
  }

  // 1–5 for the moves (and the offers), Space to hear the seller again,
  // Escape back from the offers, Enter on to the next stall
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea')) return
      const onButton = !!t?.closest('button, a, [role=button]')
      if (e.key === ' ') {
        if (onButton) return
        e.preventDefault()
        hearAgain()
        return
      }
      if (step === 'end') {
        if (e.key === 'Enter' && !onButton) {
          e.preventDefault()
          onNext()
        }
        return
      }
      if (step === 'ask') {
        if (e.key === '1' || (e.key === 'Enter' && !onButton)) {
          e.preventDefault()
          ask()
        }
        return
      }
      const n = Number(e.key) - 1
      if (offering) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          e.preventDefault()
          setOffering(false)
        } else if (n >= 0 && n < ware.offers.length) {
          e.preventDefault()
          move({ k: 'offer', n: ware.offers[n] })
        }
        return
      }
      if (n >= 0 && n < MOVES.length) {
        e.preventDefault()
        pick(MOVES[n])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const me = ware.g === 'f' ? 'Me la' : 'Me lo'

  return (
    <div className="ra-stall">
      <div className="ra-frame ra-walk">
        <StallScene who={who} ware={ware.id} mood={mood} talking={talking} />
        {step === 'haggle' && <Patience left={st.left} of={ware.patience} />}
        <PriceTag log={log} paid={result?.paid ?? null} />
      </div>

      <ol className="ra-talk" ref={chat} aria-live="polite">
        {log.length === 0 && (
          <li className="ra-hint">
            <WarePic id={ware.id} className="pic" />
            <span>
              <span className="what">
                <Mixed line={ware.name} />
              </span>
              <small>
                Rimelig pris: ca. {ware.fair}&nbsp;€. Spør {seller.name} om
                prisen.
              </small>
            </span>
          </li>
        )}
        {log.map((s, i) => (
          <Line
            key={i}
            said={s}
            who={who}
            name={seller.name}
            talking={talking && s.who === 'them' && i === log.length - 1}
            hear={!blind}
            onHear={(slow) => void speak(s.line, s.who === 'them', slow)}
            onPeek={peek}
          />
        ))}
      </ol>

      <div className="ra-moves">
        {note && <p className="ra-note">{note}</p>}
        {step === 'ask' && (
          <button
            type="button"
            className="ra-move ask"
            onClick={ask}
            disabled={busy}
          >
            <kbd aria-hidden="true">1</kbd>
            <span className="es" lang="es">
              {plain(ASK)}
            </span>
            <span className="no">Hva koster den?</span>
          </button>
        )}
        {step === 'haggle' && !offering && (
          <div className="ra-grid">
            {MOVES.map((k, i) => (
              <button
                key={k}
                type="button"
                className={`ra-move ${k}`}
                onClick={() => pick(k)}
                disabled={busy}
              >
                <kbd aria-hidden="true">{i + 1}</kbd>
                <span className="es" lang="es">
                  {k === 'offer' ? `¿${me} deja en …?` : plain(MOVE[k](ware.g))}
                </span>
                <span className="no">{MOVE_NO[k]}</span>
              </button>
            ))}
          </div>
        )}
        {step === 'haggle' && offering && (
          <div className="ra-offer">
            <div className="head">
              <button
                type="button"
                className="ra-round small"
                onClick={() => setOffering(false)}
                aria-label="Tilbake til trekkene"
              >
                <ArrowLeft />
              </button>
              <span className="es" lang="es">
                ¿{me} deja en …?
              </span>
              <span className="no">Hva byr du?</span>
            </div>
            <div className="chips">
              {ware.offers.map((n, i) => (
                <button
                  key={n}
                  type="button"
                  disabled={busy || n > purse}
                  onClick={() => move({ k: 'offer', n })}
                  aria-label={`${n} euro`}
                >
                  <kbd aria-hidden="true">{i + 1}</kbd>
                  <b>{n}&nbsp;€</b>
                  <span lang="es">{num(n)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 'end' && result && (
          <Outcome result={result} last={last} onNext={onNext} />
        )}
        {step !== 'end' && (
          <p className="ra-keys">
            <kbd>1</kbd>–
            <kbd>{step === 'ask' ? 1 : offering ? ware.offers.length : 5}</kbd>{' '}
            svar · <kbd>Mellomrom</kbd> hør selgeren igjen
            {offering && (
              <>
                {' '}
                · <kbd>Esc</kbd> tilbake
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

// How many more pushes the seller will take
function Patience({ left, of }: { left: number; of: number }) {
  return (
    <div
      className="ra-patience"
      role="meter"
      aria-label="Selgerens tålmodighet"
      aria-valuemin={0}
      aria-valuemax={of}
      aria-valuenow={left}
    >
      <span>Tålmodighet</span>
      <span className="dots" aria-hidden="true">
        {Array.from({ length: of }, (_, i) => (
          <i key={i} className={i < left ? (left <= 1 ? 'low' : 'on') : ''} />
        ))}
      </span>
    </div>
  )
}

// The tag on the thing: each price once it is written out, the old ones
// struck through, and what was paid
function PriceTag({ log, paid }: { log: Array<Said>; paid: number | null }) {
  const named = log.filter((s) => s.who === 'them' && s.price !== undefined)
  const shown = [
    ...new Set(named.filter((s) => s.open).map((s) => s.price ?? 0)),
  ]
  const hidden = named.length > 0 && !named[named.length - 1].open
  const now = paid ?? (hidden ? null : (shown.at(-1) ?? null))
  const struck = shown.filter((p) => p !== now).slice(-2)
  return (
    <div className={`ra-tag ${paid !== null ? 'sold' : ''}`} aria-hidden="true">
      {struck.map((p) => (
        <s key={p}>{p}&nbsp;€</s>
      ))}
      <b>{now === null ? '?' : `${now}\u00a0€`}</b>
    </div>
  )
}

// A line of the haggling: the seller's on the left, written out once
// answered or looked at; the player's on the right
function Line({
  said,
  who,
  name,
  talking,
  hear,
  onHear,
  onPeek,
}: {
  said: Said
  who: SellerId
  name: string
  talking: boolean
  hear: boolean
  onHear: (slow: boolean) => void
  onPeek: () => void
}) {
  const them = said.who === 'them'
  return (
    <li className={`ra-line ${them ? 'them' : 'you'}`}>
      {them && <SellerFace who={who} talking={talking} className="face" />}
      <div className={`bubble ${said.open ? 'open' : ''}`}>
        {said.open ? (
          <span lang="es" className="said">
            {/* (what the player said is in Spanish, as on its button) */}
            <Mixed line={said.line} {...(them ? {} : { all: 2 as const })} />
          </span>
        ) : (
          <span className={`ear ${talking ? 'on' : ''}`}>
            {talking && <Volume2 aria-hidden="true" />}
            {talking ? 'Hør …' : `Hva sa ${name}?`}
          </span>
        )}
        <span className="tools">
          {hear && (
            <button
              type="button"
              className="ra-icon"
              aria-label="Hør igjen"
              onClick={() => onHear(false)}
            >
              <Volume2 />
            </button>
          )}
          {hear && !said.open && (
            <button
              type="button"
              className="ra-icon"
              aria-label="Hør det sakte"
              onClick={() => onHear(true)}
            >
              <Snail />
            </button>
          )}
          {!said.open && (
            <button
              type="button"
              className="ra-pill"
              onClick={onPeek}
              aria-label="Les det selgeren sa"
            >
              <Eye aria-hidden="true" /> Les
            </button>
          )}
        </span>
      </div>
    </li>
  )
}

// How a stall went, and what could have been
function Outcome({
  result,
  last,
  onNext,
}: {
  result: Result
  last: boolean
  onNext: () => void
}) {
  const { visit, paid } = result
  const low = visit.ladder[visit.ladder.length - 1]
  return (
    <div className={`ra-outcome ${paid === null ? 'none' : ''}`}>
      {paid !== null ? (
        <>
          <Stars n={result.stars} />
          <p className="what">Kjøpt for {paid}&nbsp;€</p>
          <p className="why">
            {result.over !== undefined
              ? `${visit.seller.name} ba om ${result.over}\u00a0€, og du bød mer.`
              : result.stars === 3
                ? `Så lavt som ${visit.seller.name} ville gå.`
                : result.stars === 2
                  ? `En rimelig pris. ${visit.seller.name} ville ha gått ned til ${low}\u00a0€.`
                  : `Mer enn en rimelig pris på ${visit.ware.fair}\u00a0€. ${visit.seller.name} ville ha gått ned til ${low}\u00a0€.`}
          </p>
        </>
      ) : (
        <>
          <p className="what">Ingen handel</p>
          <p className="why">
            {result.gone === 'enough'
              ? `Du presset for hardt, og ${visit.seller.name} ville ikke handle mer.`
              : `Du gikk videre. ${visit.seller.name} ville ha gått ned til ${low}\u00a0€.`}
          </p>
        </>
      )}
      <button type="button" className="ra-btn" onClick={onNext}>
        {last ? 'Se dagen' : 'Neste bod'} <ArrowRight />
      </button>
    </div>
  )
}

function Summary({
  results,
  before,
  onAgain,
}: {
  results: Array<Result>
  // The best day before this one
  before: number
  onAgain: () => void
}) {
  const { hear } = useVoices()
  const total = results.reduce((s, r) => s + r.stars, 0)
  const deals = results.filter((r) => r.paid !== null)
  const saved = deals.reduce((s, r) => s + r.visit.ware.fair - (r.paid ?? 0), 0)
  return (
    <section className="ra-card ra-end">
      <p className="kick">¡Hasta el domingo!</p>
      <h2>
        {total} <span>av {STALLS_A_DAY * 3} stjerner</span>
      </h2>
      <p className="sub">
        {deals.length} av {results.length} kjøpt
        {deals.length > 0 &&
          (saved > 0
            ? `, til sammen ${saved}\u00a0€ under rimelig pris`
            : saved < 0
              ? `, til sammen ${-saved}\u00a0€ over rimelig pris`
              : ', akkurat til rimelig pris')}
        .{' '}
        {before === 0
          ? ''
          : total > before
            ? 'Den beste søndagen så langt.'
            : `Den beste søndagen er ${before} stjerner.`}
      </p>
      <div className="acts">
        <TodayNext page="rastro" className="ra-btn" />
        <button type="button" className="ra-btn ghost" onClick={onAgain}>
          En søndag til
        </button>
        <a className="ra-link" href="#">
          Til forsiden
        </a>
      </div>
      <ol className="ra-day">
        {results.map((r) => (
          <li key={r.visit.ware.id} className={r.paid === null ? 'none' : ''}>
            <WarePic id={r.visit.ware.id} className="pic" />
            <span className="what">
              <Mixed line={r.visit.ware.name} />
              <small>
                hos {r.visit.seller.name}, rimelig pris {r.visit.ware.fair}
                &nbsp;€
              </small>
            </span>
            <span className="paid">
              {r.paid === null ? 'ikke kjøpt' : `${r.paid}\u00a0€`}
              <Stars n={r.stars} />
            </span>
            {hear !== false && (
              <button
                type="button"
                className="ra-icon"
                aria-label={`Hør hva ${r.visit.seller.name} ba om først`}
                onClick={() =>
                  void say(plain(r.visit.seller.lines.open(r.visit.ladder[0])))
                }
              >
                <Volume2 />
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
