import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Delete,
  Euro,
  Hash,
  Phone,
  Snail,
  Ticket,
  Volume2,
  X,
} from 'lucide-react'
import {
  BONUS,
  TYPING,
  deal,
  group,
  heard,
  isRight,
  roundKinds,
  shown,
  type,
  unType,
  worth,
} from '../lib/numeros'
import { blip } from '../lib/sound'
import { say, stop, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { TodayNext, useBack } from '../daily'
import { useFont } from '../ui'
import { PICTURES } from '../data/pictures'
import {
  BUST_TOP,
  FACES,
  MADRID,
  SORTEO,
  placeOf,
  speakerFace,
} from '../data/numerosLayout'
import { LOTTERY_VOICE, NUMBER_VOICES } from '../data/voices'
import type { Face } from '../data/numerosLayout'
import type { Item, Kind } from '../lib/numeros'
import './numeros.css'

// Números: a number heard in an everyday sentence (a price at the till, a
// time to meet, a phone number, a year, a big number), typed in digits.
// Then the sentence is shown, and the number taken apart, each piece with
// its Spanish words. Six to a round, and then three numbers of Spain's
// Christmas lottery, sung as the San Ildefonso children sing them. Drawn as
// an engraved lottery ticket: fine green lines, a seal, sepia numbers; once
// painted, whoever says the number is the portrait on the note.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap'

// What a right answer says about the bank's number words in it: each was
// heard and understood (leer), from a sentence where the digits typed show
// which word was missed, if one was. No choices are offered, but the
// sentence around a number helps (prices end in round cents, a shop opens
// in the morning), so each counts as a word picked from a few, not typed.
const HEARD = 0.6

const KINDS: Array<{ id: Kind | 'all'; no: string }> = [
  { id: 'all', no: 'Blandet' },
  { id: 'price', no: 'Priser' },
  { id: 'time', no: 'Klokka' },
  { id: 'phone', no: 'Telefon' },
  { id: 'year', no: 'Årstall' },
  { id: 'big', no: 'Store tall' },
]

const LABEL: Record<Item['kind'], { no: string; Icon: typeof Euro }> = {
  price: { no: 'En pris', Icon: Euro },
  time: { no: 'Et klokkeslett', Icon: Clock },
  phone: { no: 'Et telefonnummer', Icon: Phone },
  year: { no: 'Et årstall', Icon: Calendar },
  big: { no: 'Et stort tall', Icon: Hash },
  lottery: { no: 'Julelotteriet', Icon: Ticket },
}

// The numbers heard, kept in this browser so that the deck is dealt
// through before any comes again (a convenience: without it, it deals
// from the whole deck)
const HEARD_KEY = 'hola:numeros:v1'

function loadHeard(): Array<string> {
  try {
    const raw = localStorage.getItem(HEARD_KEY)
    const ids = raw ? (JSON.parse(raw) as { heard?: unknown }).heard : null
    return Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function saveHeard(ids: Array<string>) {
  try {
    localStorage.setItem(HEARD_KEY, JSON.stringify({ heard: ids }))
  } catch {
    // private mode, or full
  }
}

// A round's six numbers and the lottery's three, dealt from the decks
function dealRound(kind: Kind | 'all') {
  let had = loadHeard()
  const items: Array<Item> = []
  for (const k of roundKinds(kind)) {
    const d = deal(
      k,
      had,
      Math.random,
      items.map((x) => x.id),
    )
    items.push(d.item)
    had = d.heard
  }
  const bonus: Array<Item> = []
  for (let n = 0; n < BONUS; n++) {
    const d = deal(
      'lottery',
      had,
      Math.random,
      bonus.map((x) => x.id),
    )
    bonus.push(d.item)
    had = d.heard
  }
  saveHeard(had)
  return { items, bonus }
}

interface Result {
  item: Item
  typed: string
  right: boolean
}

type Phase = 'ready' | 'play' | 'draw' | 'bonus' | 'over'

export default function Numeros() {
  useFont(FONTS)
  const { bank, record, levelOf, points, played, setBest } = useStore()
  const { hear } = useVoices()
  const back = useBack('numeros')
  const [phase, setPhase] = useState<Phase>('ready')
  const [kind, setKind] = useState<Kind | 'all'>('all')
  const [items, setItems] = useState<Array<Item>>([])
  const [bonus, setBonus] = useState<Array<Item>>([])
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState('')
  const [results, setResults] = useState<Array<Result>>([])
  const [before, setBefore] = useState(0)
  const [talking, setTalking] = useState(false)
  const turn = useRef(0)
  const timers = useRef<Array<number>>([])

  const later = (f: () => void, ms: number) => {
    timers.current.push(window.setTimeout(f, ms))
  }
  const clear = () => {
    for (const t of timers.current) clearTimeout(t)
    timers.current = []
  }
  useEffect(
    () => () => {
      clear()
      stop()
    },
    [],
  )

  const list = phase === 'bonus' ? bonus : items
  const item = list[i] as Item | undefined
  const offset = phase === 'bonus' ? items.length : 0
  const done = results[offset + i] as Result | undefined

  const play = (x: Item | undefined, slow = false) => {
    if (!x) return
    const me = ++turn.current
    setTalking(true)
    void say(x.say, slow).then(() => {
      if (turn.current === me) setTalking(false)
    })
  }

  // Each number is said as it comes up
  useEffect(() => {
    if ((phase !== 'play' && phase !== 'bonus') || !item) return
    const t = window.setTimeout(() => play(item), 380)
    return () => clearTimeout(t)
    // (said once, as it comes up)
  }, [phase, i, item?.id])

  const start = () => {
    clear()
    const r = dealRound(kind)
    setItems(r.items)
    setBonus(r.bonus)
    setI(0)
    setTyped('')
    setResults([])
    setPhase('play')
  }

  const check = () => {
    if (!item || done || worth(typed, item.kind) === null) return
    const right = isRight(typed, item)
    for (const w of heard(item, typed))
      if (levelOf(w.id) > 0) record(w.id, w.right, HEARD, 'leer')
    setResults((rs) => [...rs, { item, typed, right }])
    blip(right ? 'right' : 'wrong')
    // The sentence again, now that it is shown
    later(() => play(item), right ? 500 : 900)
  }

  const finish = (all: Array<Result>) => {
    clear()
    stop()
    const score = all.filter((r) => r.right).length
    setBefore(bank.best.numeros ?? 0)
    setBest('numeros', score)
    if (score) points(score)
    played('numeros')
    setPhase('over')
    later(() => blip('win'), 200)
  }

  const next = () => {
    if (!done) return
    clear()
    stop()
    setTyped('')
    if (i + 1 < list.length) {
      setI(i + 1)
      return
    }
    if (phase === 'play') {
      setPhase('draw')
      setI(0)
    } else finish(results)
  }

  const press = (key: string) => {
    if (!item || done) return
    const t = key === 'Backspace' ? unType(typed) : type(typed, key, item.kind)
    if (t !== typed) blip('tap')
    setTyped(t)
  }

  // Digits, the comma or colon, Backspace and Enter from the keyboard;
  // Space says it again
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select')) return
      const onButton = !!t?.closest('button, a')
      if (phase === 'ready' || phase === 'draw') {
        if (e.key === 'Enter' && !onButton) {
          e.preventDefault()
          if (phase === 'ready') start()
          else setPhase('bonus')
        }
        return
      }
      if (phase !== 'play' && phase !== 'bonus') return
      if (e.key === ' ') {
        e.preventDefault()
        play(item)
      } else if (e.key === 'Enter') {
        if (onButton) return
        e.preventDefault()
        if (done) next()
        else check()
      } else if (/^[\d.,:]$/.test(e.key) || e.key === 'Backspace') {
        e.preventDefault()
        press(e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const lottery = phase === 'bonus' || phase === 'draw'

  return (
    <div className={`nu ${lottery ? 'gold' : ''}`}>
      <div className="nu-col">
        <header className="nu-top">
          <a className="nu-round" href={back} aria-label="Tilbake">
            <ArrowLeft />
          </a>
          <h1>
            Números<small>Tallene</small>
          </h1>
          {(phase === 'play' || phase === 'bonus') && (
            <Progress
              results={results.slice(offset)}
              n={list.length}
              at={i}
              gold={phase === 'bonus'}
            />
          )}
        </header>

        {phase === 'ready' && (
          <Start
            kind={kind}
            onKind={setKind}
            best={bank.best.numeros ?? 0}
            onStart={start}
          />
        )}

        {(phase === 'play' || phase === 'bonus') && item && (
          <main className="nu-play" key={`${phase}${i}`}>
            <section
              className={`nu-ticket ${done ? (done.right ? 'yes' : 'no') : ''}`}
            >
              <Band />
              <div className="nu-head">
                <span className="nu-kind">
                  <LabelIcon kind={item.kind} />
                  {LABEL[item.kind].no}
                </span>
                <span className="nu-serial">
                  Nº {String(offset + i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="nu-body">
                {!done ? (
                  <>
                    {hear === false && (
                      <p className="nu-quiet" lang="es">
                        {item.say}
                      </p>
                    )}
                    <div
                      className={
                        painted(item) ? 'nu-listen faced' : 'nu-listen'
                      }
                    >
                      {painted(item) ? (
                        <Portrait who={item.voice} talking={talking} />
                      ) : (
                        phase === 'bonus' && <Bombo spinning={talking} />
                      )}
                      <button
                        type="button"
                        className={`nu-hear ${talking ? 'on' : ''}`}
                        onClick={() => play(item)}
                        aria-label="Hør igjen"
                      >
                        <img
                          className="nu-ring"
                          src={hearRing(phase === 'bonus')}
                          alt=""
                        />
                        <Volume2 />
                      </button>
                      <button
                        type="button"
                        className="nu-round small"
                        onClick={() => play(item, true)}
                        aria-label="Hør sakte"
                      >
                        <Snail />
                      </button>
                    </div>
                    <Field item={item} typed={typed} />
                  </>
                ) : (
                  <Reveal
                    item={item}
                    result={done}
                    talking={talking}
                    onHear={(slow) => play(item, slow)}
                  />
                )}
              </div>
              <Band flip />
            </section>

            {!done ? (
              <div className="nu-pad-wrap">
                <Keypad kind={item.kind} onKey={press} />
                <button
                  type="button"
                  className="nu-btn"
                  disabled={worth(typed, item.kind) === null}
                  onClick={check}
                >
                  Sjekk <Check />
                </button>
                <p className="nu-hint">
                  Skriv tallet du hører.
                  <span className="keys">
                    <kbd>mellomrom</kbd> hør igjen · <kbd>Enter</kbd> sjekk
                  </span>
                </p>
              </div>
            ) : (
              <div className="nu-after">
                <button
                  type="button"
                  className="nu-btn"
                  onClick={next}
                  autoFocus
                >
                  {i + 1 < list.length
                    ? 'Neste'
                    : phase === 'play'
                      ? 'Til trekningen'
                      : 'Ferdig'}{' '}
                  <ArrowRight />
                </button>
              </div>
            )}
          </main>
        )}

        {phase === 'draw' && (
          <Draw
            score={results.filter((r) => r.right).length}
            of={items.length}
            onGo={() => setPhase('bonus')}
            onSkip={() => finish(results)}
          />
        )}

        {phase === 'over' && (
          <End
            results={results}
            main={items.length}
            before={before}
            onAgain={start}
            onHear={(x) => play(x)}
          />
        )}
      </div>
    </div>
  )
}

function LabelIcon({ kind }: { kind: Item['kind'] }) {
  const { Icon } = LABEL[kind]
  return <Icon aria-hidden="true" />
}

// --- The start ---

function Start({
  kind,
  onKind,
  best,
  onStart,
}: {
  kind: Kind | 'all'
  onKind: (k: Kind | 'all') => void
  best: number
  onStart: () => void
}) {
  return (
    <main className="nu-start first">
      <section className="nu-ticket intro note">
        <Band />
        <div className="nu-intro">
          <Seal />
          <div className="nu-text">
            <h2>Seis números</h2>
            <p>
              Hør et tall i en vanlig setning: en pris, et klokkeslett, et
              telefonnummer, et årstall eller et stort tall. Skriv det med
              sifre, så blir tallet tatt fra hverandre.
            </p>
            <p className="small">
              Til slutt synger barna fra San Ildefonso-skolen i Madrid tre tall
              fra trekningen i det spanske julelotteriet.
            </p>
          </div>
          <Seal other />
        </div>
        <Band flip />
      </section>
      <div className="nu-kinds" role="radiogroup" aria-label="Slags tall">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            role="radio"
            aria-checked={kind === k.id}
            className={kind === k.id ? 'on' : ''}
            onClick={() => onKind(k.id)}
          >
            {k.no}
          </button>
        ))}
      </div>
      <button type="button" className="nu-btn big" onClick={onStart}>
        Begynn <ArrowRight />
      </button>
      {best > 0 && <p className="nu-best">Det beste så langt: {best} av 9</p>}
    </main>
  )
}

// --- Playing ---

function Progress({
  results,
  n,
  at,
  gold,
}: {
  results: Array<Result>
  n: number
  at: number
  gold: boolean
}) {
  return (
    <ol
      className={`nu-progress ${gold ? 'gold' : ''}`}
      aria-label={`${at + 1} av ${n}`}
    >
      {Array.from({ length: n }, (_, k) => {
        const r = results[k] as Result | undefined
        return (
          <li
            key={k}
            className={r ? (r.right ? 'yes' : 'no') : k === at ? 'now' : ''}
          >
            {r ? r.right ? <Check /> : <X /> : null}
          </li>
        )
      })}
    </ol>
  )
}

// The form of each kind of number, printed faintly before anything is typed
// (a phone number's groups as it is read, and only the form of the rest,
// never their length)
const FORM: Record<Item['kind'], string> = {
  price: '0,00',
  time: '00:00',
  phone: '000 000 000',
  year: '0000',
  big: '000 000',
  lottery: '00000',
}

// What is typed, as a serial number on a ticket: in sepia, with the form of
// the number drawn faintly where nothing is typed yet
function Field({ item, typed }: { item: Item; typed: string }) {
  const text = shown(typed, item)
  const unit = item.kind === 'price' ? '€' : item.kind === 'time' ? 'kl.' : null
  const shape =
    item.kind === 'phone' && item.groups
      ? item.groups.map((g) => '0'.repeat(g.n)).join(' ')
      : FORM[item.kind]
  return (
    <div className={`nu-field ${item.kind}`} aria-live="polite">
      {unit === 'kl.' && <span className="unit pre">{unit}</span>}
      <span className={`digits ${text ? '' : 'empty'}`}>
        {text || shape}
        {text && <span className="caret" aria-hidden="true" />}
      </span>
      {unit === '€' && <span className="unit">{unit}</span>}
    </div>
  )
}

// The keys: lottery balls of turned wood, nine and nought, the comma or
// the colon the kind takes, and a key to take one back
function Keypad({
  kind,
  onKey,
}: {
  kind: Item['kind']
  onKey: (k: string) => void
}) {
  const sep = TYPING[kind].sep
  const keys = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    sep ?? '',
    '0',
    'Backspace',
  ]
  return (
    <div className="nu-pad">
      {keys.map((k, n) =>
        k === '' ? (
          <span key={n} />
        ) : (
          <button
            key={k}
            type="button"
            className={`nu-ball ${k === 'Backspace' ? 'back' : /\d/.test(k) ? '' : 'sep'}`}
            // (a click leaves no focus behind, so that Enter checks the
            // answer rather than typing the key again)
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onKey(k)}
            aria-label={k === 'Backspace' ? 'Visk ut' : k}
          >
            {k === 'Backspace' ? <Delete /> : <span>{k}</span>}
          </button>
        ),
      )}
    </div>
  )
}

// After the answer: right or not, the sentence and what it means, and the
// number taken apart
function Reveal({
  item,
  result,
  talking,
  onHear,
}: {
  item: Item
  result: Result
  talking: boolean
  onHear: (slow: boolean) => void
}) {
  const { hear } = useVoices()
  const typedShown = shown(result.typed, item)
  return (
    <div className="nu-reveal">
      {painted(item) && (
        <Portrait
          who={item.voice}
          face={result.right ? 'glad' : 'kind'}
          talking={talking}
        />
      )}
      <p className={`nu-verdict ${result.right ? 'yes' : 'no'}`}>
        <span className="mark">{result.right ? <Check /> : <X />}</span>
        {result.right ? (
          <b>Riktig</b>
        ) : (
          <span>
            Du skrev <s>{typedShown}</s>, det var
          </span>
        )}
        <span className="answer">
          {item.kind === 'time' && 'kl. '}
          {item.answer}
          {item.kind === 'price' && ' €'}
        </span>
      </p>
      {item.prize && <Prize item={item} />}
      <div className="nu-said">
        <p className="es" lang="es">
          {item.say}
        </p>
        {hear !== false && (
          <span className="nu-again">
            <button
              type="button"
              className="nu-round small"
              aria-label="Hør setningen"
              onClick={() => onHear(false)}
            >
              <Volume2 />
            </button>
            <button
              type="button"
              className="nu-round small"
              aria-label="Hør sakte"
              onClick={() => onHear(true)}
            >
              <Snail />
            </button>
          </span>
        )}
      </div>
      <p className="nu-no">{item.no}</p>
      <div className="nu-apart">
        <ul className="nu-parts">
          {item.parts.map((p, k) => (
            <li key={k}>
              <span className="es" lang="es">
                {p.es}
              </span>
              <span className="val">{p.value || ' '}</span>
              {p.no && <span className="no">{p.no}</span>}
            </li>
          ))}
        </ul>
        {item.clock && <Face h={item.clock.h} m={item.clock.m} />}
      </div>
    </div>
  )
}

// The prize, as the ball from the second drum: the sum for a whole series of
// ten tickets, as it is sung
function Prize({ item }: { item: Item }) {
  const p = item.prize!
  const gordo = p.euros >= 4_000_000
  return (
    <div className={`nu-prize ${gordo ? 'gordo' : ''}`}>
      <span className="nu-pball">{group(p.euros)} €</span>
      <span className="what">
        <b lang="es">{p.es.charAt(0).toUpperCase() + p.es.slice(1)}</b>
        <small>{p.no.charAt(0).toUpperCase() + p.no.slice(1)}</small>
      </span>
    </div>
  )
}

// --- The lottery ---

function Draw({
  score,
  of,
  onGo,
  onSkip,
}: {
  score: number
  of: number
  onGo: () => void
  onSkip: () => void
}) {
  return (
    <main className="nu-start">
      <section className="nu-ticket intro">
        <Band />
        <div className="nu-intro">
          <p className="kick">
            {score} av {of} riktige
          </p>
          {LOTTERY_PAINTED ? (
            <Portrait who={LOTTERY_VOICE} big />
          ) : (
            <Bombo spinning />
          )}
          <h2 lang="es">El sorteo de Navidad</h2>
          <p>
            Hver 22. desember synger barna fra San Ildefonso-skolen i Madrid
            vinnertallene og premiene i julelotteriet, ett for ett, i en lang
            syngende tone. Skriv tallene du hører: fem sifre hver.
          </p>
        </div>
        <Band flip />
      </section>
      <button type="button" className="nu-btn big" onClick={onGo}>
        Til trekningen <ArrowRight />
      </button>
      <button type="button" className="nu-link" onClick={onSkip}>
        Hopp over trekningen
      </button>
    </main>
  )
}

// --- The end ---

function End({
  results,
  main,
  before,
  onAgain,
  onHear,
}: {
  results: Array<Result>
  main: number
  before: number
  onAgain: () => void
  onHear: (x: Item) => void
}) {
  const { hear } = useVoices()
  const score = results.filter((r) => r.right).length
  const first = results.slice(0, main).filter((r) => r.right).length
  const drawn = results.slice(main)
  const all = main + drawn.length
  return (
    <main className="nu-start">
      <section className="nu-ticket intro end">
        <Band />
        <div className="nu-intro">
          <Seal />
          <p className="kick" lang="es">
            {score === all
              ? '¡Perfecto!'
              : score >= all - 2
                ? '¡Muy bien!'
                : score >= all / 2
                  ? '¡Bien!'
                  : '¡Ánimo!'}
          </p>
          <h2>
            {first} av {main} riktige
          </h2>
          {drawn.length > 0 && (
            <p className="sub">
              Og {drawn.filter((r) => r.right).length} av {drawn.length} i
              trekningen.
            </p>
          )}
          <p className="sub">
            {before === 0
              ? 'Den første runden.'
              : score > before
                ? 'Bedre enn noen gang før.'
                : `Det beste så langt er ${before} av 9.`}
          </p>
        </div>
        <Band flip />
      </section>
      <div className="nu-acts">
        <TodayNext page="numeros" className="nu-btn" />
        <button type="button" className="nu-btn ghost" onClick={onAgain}>
          Seks til
        </button>
        <a className="nu-link" href="#">
          Til forsiden
        </a>
      </div>
      <ol className="nu-list">
        {results.map((r, k) => (
          <li key={k} className={r.right ? '' : 'miss'}>
            <span className="mark">
              {r.right ? (
                <Check aria-label="riktig" />
              ) : (
                <X aria-label="feil" />
              )}
            </span>
            <span className="txt">
              <span className="es" lang="es">
                {r.item.say}
              </span>
              <em>
                {r.item.kind === 'time' ? 'kl. ' : ''}
                {r.item.answer}
                {r.item.kind === 'price' ? ' €' : ''}
                {!r.right && (
                  <>
                    {' '}
                    · du skrev <s>{shown(r.typed, r.item)}</s>
                  </>
                )}
              </em>
            </span>
            {hear !== false && (
              <button
                type="button"
                className="nu-round small"
                aria-label="Hør setningen"
                onClick={() => onHear(r.item)}
              >
                <Volume2 />
              </button>
            )}
          </li>
        ))}
      </ol>
    </main>
  )
}

// --- The portrait ---

// Whether the speakers of a kind of number are painted (scripts/pictures.mjs,
// from data/numeros-prompts.ts): the place behind them and every face of
// each who speaks there. Until they are, the ticket is as it always was.
const paintedAll = (place: string, who: Array<string>) =>
  PICTURES.has(place) &&
  who.every((w) => FACES.every((f) => PICTURES.has(speakerFace(w, f))))
const SENTENCES_PAINTED = paintedAll(MADRID, NUMBER_VOICES)
const LOTTERY_PAINTED = paintedAll(SORTEO, [LOTTERY_VOICE])
const painted = (item: Item) =>
  item.kind === 'lottery' ? LOTTERY_PAINTED : SENTENCES_PAINTED

// Who says the number, as the portrait on a banknote: their bust in an oval
// vignette before the place, breathing. While they speak, the speaking face
// shows over the other every other moment (Ildefonso holds his sung note),
// and once answered they nod with a glad face, or give a small shake of
// the head with a kind one. Every face is there from the start, so that
// none waits to load when it is wanted.
function Portrait({
  who,
  face = 'wait',
  talking = false,
  big = false,
}: {
  who: string
  face?: Face
  talking?: boolean
  big?: boolean
}) {
  return (
    <span className={`nu-portrait ${big ? 'big' : ''}`} aria-hidden="true">
      <img className="place" src={`/${placeOf(who)}.webp`} alt="" />
      <span
        className={`nu-react ${face}`}
        style={{ top: `${BUST_TOP * 100}%` }}
      >
        <span
          className={`nu-bust f-${talking ? 'wait' : face} ${talking ? 'talking' : ''}`}
        >
          {FACES.map((f) => (
            <img
              key={f}
              className={f}
              src={`/${speakerFace(who, f)}.webp`}
              alt=""
              decoding="async"
            />
          ))}
        </span>
      </span>
    </span>
  )
}

// --- Engraving ---

// The guilloche of a banknote: rosettes and waves of lines too many and too
// fine to be parts of the page, so each is drawn once, as a picture. Points
// are kept in tenths, each a short step from the last, to keep them small.
function pathOf(points: Array<[number, number]>) {
  let d = ''
  let px = 0
  let py = 0
  points.forEach(([x, y], k) => {
    const ax = Math.round(x * 10)
    const ay = Math.round(y * 10)
    d += k ? `l${ax - px} ${ay - py}` : `M${ax} ${ay}`
    px = ax
    py = ay
  })
  return d
}

// A rosette: rings of petals, each turned on from the last by a little,
// over half a petal in all, so that together they twist like a ribbon
function rosette(
  r: number,
  a: number,
  petals: number,
  rings: number,
  steps: number,
) {
  const out: Array<string> = []
  for (let k = 0; k < rings; k++) {
    const points: Array<[number, number]> = []
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * 2 * Math.PI
      const rr = r + a * Math.sin(petals * t + (k * Math.PI) / rings)
      points.push([rr * Math.sin(t), -rr * Math.cos(t)])
    }
    out.push(`${pathOf(points)}z`)
  }
  return out
}

// The loops a spirograph draws, eighteen of them, for the seal's heart
function spiro(scale: number) {
  const [R, r, d] = [100, 28, 40]
  const points: Array<[number, number]> = []
  for (let s = 0; s <= 1400; s++) {
    const t = (s / 1400) * 7 * 2 * Math.PI
    points.push([
      ((R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)) * scale,
      ((R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)) * scale,
    ])
  }
  return pathOf(points)
}

const lines = (paths: Array<string>, color: string, width: number) =>
  `<g fill="none" stroke="${color}" stroke-width="${width * 10}">${paths
    .map((d) => `<path d="${d}"/>`)
    .join('')}</g>`

const picture = (body: string, box: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${body}</svg>`,
  )}`

const INK = {
  green: '#56755f',
  dark: '#2c4a3a',
  red: '#9e3d28',
  salmon: '#c27b5c',
  brass: '#a98234',
  paper: '#f7f2e3',
}

const drawn = new Map<string, string>()

function art(name: string, make: () => string) {
  let a = drawn.get(name)
  if (!a) drawn.set(name, (a = make()))
  return a
}

const ring = (r: number, width: number, fill = 'none') =>
  `<circle r="${r}" fill="${fill}" stroke="${INK.dark}" stroke-width="${width}"/>`

// The seals at the note's ends: green and red rosettes round a spirograph,
// and green and salmon round a smaller one
const SEALS = {
  seal: () =>
    picture(
      ring(580, 10, INK.paper) +
        ring(545, 4) +
        lines(rosette(44, 7, 22, 16, 520), INK.green, 0.22) +
        lines(rosette(28, 6.5, 12, 14, 400), INK.red, 0.22) +
        `<circle r="160" fill="${INK.paper}"/>` +
        lines([spiro(0.15)], INK.dark, 0.22),
      '-600 -600 1200 1200',
    ),
  other: () =>
    picture(
      ring(580, 10, INK.paper) +
        ring(545, 4) +
        lines(rosette(48, 6, 26, 16, 560), INK.green, 0.2) +
        lines(rosette(34, 5, 14, 12, 420), INK.salmon, 0.24) +
        lines(rosette(22, 6, 9, 12, 320), INK.green, 0.22),
      '-600 -600 1200 1200',
    ),
}

// The ring round the button that says the number again
const hearPicture = (color: string) => () =>
  picture(
    lines(rosette(47, 5, 20, 14, 480), color, 0.22),
    '-560 -560 1120 1120',
  )

// A border of waves, each line a little out of step with the next, as along
// a banknote's edge: one wave, repeated along the band as a mask, so that
// it takes the ticket's colour
const bandPicture = () => {
  const out: Array<string> = []
  for (let k = 0; k < 10; k++) {
    const points: Array<[number, number]> = []
    for (let x = 0; x <= 36; x += 0.5)
      points.push([
        x,
        11 + 7 * Math.sin((2 * Math.PI * x) / 36 + (k * Math.PI) / 10),
      ])
    out.push(pathOf(points))
  }
  return `url("${picture(lines(out, '#000', 0.6), '0 0 360 220')}")`
}

function Band({ flip = false }: { flip?: boolean }) {
  const mask = art('band', bandPicture)
  return (
    <div
      className={`nu-band ${flip ? 'flip' : ''}`}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      aria-hidden="true"
    />
  )
}

function Seal({ other = false }: { other?: boolean }) {
  const name = other ? 'other' : 'seal'
  return (
    <img
      className={`nu-seal ${other ? 'other' : ''}`}
      src={art(name, SEALS[name])}
      alt=""
    />
  )
}

function hearRing(gold: boolean) {
  return gold
    ? art('hear-gold', hearPicture(INK.brass))
    : art('hear', hearPicture(INK.green))
}

const ROMAN = [
  'XII',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
]

const facePicture = () =>
  picture(
    ring(580, 10, INK.paper) +
      lines(rosette(50, 4, 36, 12, 600), INK.green, 0.2),
    '-600 -600 1200 1200',
  )

// A clock face, engraved, with the time's hands
function Face({ h, m }: { h: number; m: number }) {
  const minute = m * 6
  const hour = (h % 12) * 30 + m / 2
  return (
    <span
      className="nu-face"
      role="img"
      aria-label={`${h}:${String(m).padStart(2, '0')}`}
    >
      <img src={art('face', facePicture)} alt="" />
      <svg viewBox="-60 -60 120 120" aria-hidden="true">
        <circle r="38" className="paper" />
        <circle r="38" className="line" />
        {ROMAN.map((r, k) => {
          const a = (k * Math.PI) / 6
          return (
            <text
              key={r}
              x={(30 * Math.sin(a)).toFixed(1)}
              y={(-30 * Math.cos(a) + 2.6).toFixed(1)}
              className="num"
            >
              {r}
            </text>
          )
        })}
        <path
          className="hand"
          d="M-2.2 4 0 -19 2.2 4Z"
          transform={`rotate(${hour})`}
        />
        <path
          className="hand min"
          d="M-1.5 5 0 -30 1.5 5Z"
          transform={`rotate(${minute})`}
        />
        <circle r="3" className="boss" />
      </svg>
    </span>
  )
}

// The drum the lottery's balls are drawn from, its cage of brass turning
function Bombo({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      className={`nu-bombo ${spinning ? 'spin' : ''}`}
      viewBox="0 0 160 120"
      aria-hidden="true"
    >
      <path className="stand" d="M44 112 62 70H98L116 112M36 112H124" />
      <g className="cage">
        <circle cx="80" cy="54" r="40" className="rim" />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse
            key={k}
            cx="80"
            cy="54"
            rx="40"
            ry="40"
            className={`mer m${k}`}
          />
        ))}
        {[-26, -13, 0, 13, 26].map((dy) => {
          const w = Math.sqrt(1600 - dy * dy)
          return (
            <path
              key={dy}
              className="par"
              d={`M${(80 - w).toFixed(1)} ${54 + dy}H${(80 + w).toFixed(1)}`}
            />
          )
        })}
        {[
          [66, 76],
          [78, 80],
          [90, 77],
          [72, 68],
          [86, 70],
          [100, 66],
          [60, 66],
        ].map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r="5.5" className="ball" />
        ))}
      </g>
      <path className="axle" d="M30 54H130M130 54V40H138" />
      <circle cx="80" cy="54" r="5" className="hub" />
    </svg>
  )
}
