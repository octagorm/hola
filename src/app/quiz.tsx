import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Snail, Volume2 } from 'lucide-react'
import { WORD, WORDS, meaning } from './data/words'
import { others, shuffle, spanishChoices } from './lib/choices'
import { VERDICT, judge } from './lib/spanish'
import { canHear, say, useVoices } from './lib/speech'
import { blip } from './lib/sound'
import { useStore } from './lib/store'
import { LINKS, weakest } from './lib/bank'
import { partKey } from './lib/today'
import { Es, Speak } from './ui'
import type { Word } from './data/words'
import type { Card, Link } from './lib/bank'
import type { Verdict } from './lib/spanish'

// The questions every practice is made of, one link of a word each:
//   leer      the Spanish written: pick its meaning
//   oir       the Spanish said: pick its meaning
//   elegir    the meaning: pick the Spanish, the article with it
//   escribir  the meaning: type the Spanish
// Each answer goes to the bank, weighed by how much it says (lib/bank.ts).

export type Kind = 'leer' | 'oir' | 'elegir' | 'escribir'

export const LINK_OF: Record<Kind, Link> = {
  leer: 'leer',
  oir: 'oir',
  elegir: 'decir',
  escribir: 'decir',
}

// The question for a link of a word: saying it is picked from four until
// it has held a while, then typed; hearing, where there is no Spanish
// voice, becomes reading
export function kindFor(
  link: Link,
  card: Card | undefined,
  hear: boolean,
): Kind {
  if (link === 'oir') return hear ? 'oir' : 'leer'
  if (link === 'decir')
    return card && card.decir.s >= 0.5 ? 'escribir' : 'elegir'
  return 'leer'
}

// What a pick from four says, against a word typed; and a word typed with
// letters given away
const PICKED = 0.6
const HINTED = 0.25

const PRAISE = ['¡Bien!', '¡Eso es!', '¡Muy bien!', '¡Perfecto!', '¡Exacto!']

const LABEL: Record<Kind, [string, string]> = {
  leer: ['Leer', 'hva betyr det?'],
  oir: ['Oír', 'hva betyr det du hører?'],
  elegir: ['Decir', 'hva heter det på spansk?'],
  escribir: ['Decir', 'skriv det på spansk'],
}

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡']

interface Answered {
  right: boolean
  // The choice picked, by its text
  picked?: string
  verdict?: Verdict
}

export function Question({
  w,
  kind,
  pool = WORDS,
  onDone,
}: {
  w: Word
  kind: Kind
  // Where the wrong answers come from: the words met, preferably
  pool?: Array<Word>
  onDone: (right: boolean) => void
}) {
  const { record, settings } = useStore()
  const [answered, setAnswered] = useState<Answered | null>(null)
  const [typed, setTyped] = useState('')
  const [hint, setHint] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const next = useRef(() => {})
  const praise = useMemo(
    () => PRAISE[Math.floor(Math.random() * PRAISE.length)],
    [],
  )

  // The four to pick from: meanings, or for saying the Spanish. Made once
  // for the question: the pool grows as words are answered, and the
  // choices must not move under the player
  const choices = useMemo(() => {
    if (kind === 'elegir')
      return spanishChoices(w, pool).map((s) => ({
        text: s,
        right: s === w.es,
      }))
    if (kind === 'escribir') return []
    return shuffle([w, ...others(w, pool)]).map((x) => ({
      text: meaning(x),
      right: x.id === w.id,
    }))
  }, [w, kind])

  // Hearing starts by saying the word
  useEffect(() => {
    if (kind === 'oir') void say(w.es)
    if (kind === 'escribir') input.current?.focus()
  }, [w, kind])

  const finish = (a: Answered, weight: number) => {
    record(w.id, a.right, weight, LINK_OF[kind])
    blip(a.right ? 'right' : 'wrong')
    setAnswered(a)
    if (settings.autoplay || kind === 'oir') void say(w.es)
  }

  const pick = (i: number) => {
    const c = choices.at(i)
    if (!c || answered) return
    finish({ right: c.right, picked: c.text }, PICKED)
  }

  const submit = () => {
    if (answered) return
    const verdict = judge(typed, w, { lenient: settings.lenient })
    const v = VERDICT[verdict]
    finish(
      { right: v.right, verdict },
      v.right && hint > 0 ? Math.min(HINTED, v.weight) : v.weight,
    )
  }

  const giveUp = () => {
    if (answered) return
    finish({ right: false, verdict: 'wrong' }, 1)
  }

  next.current = () => {
    if (answered) onDone(answered.right)
  }

  // A right pick goes on by itself after a moment
  useEffect(() => {
    if (!answered?.right) return
    if (answered.verdict && answered.verdict !== 'right') return
    const t = setTimeout(() => next.current(), kind === 'escribir' ? 1300 : 950)
    return () => clearTimeout(t)
  }, [answered, kind])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const inField = (e.target as HTMLElement | null)?.closest('input')
      if (answered && e.key === 'Enter') {
        e.preventDefault()
        next.current()
        return
      }
      if (inField) return
      if (!answered && /^[1-4]$/.test(e.key)) pick(Number(e.key) - 1)
      if (!answered && e.key === ' ' && kind === 'oir') {
        e.preventDefault()
        void say(w.es)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const [es, no] = LABEL[kind]
  const shown = hint ? hintOf(w.es, hint) : ''

  return (
    <div className="q-quiz fx-rise">
      <div className="q-label">
        {es} <span>· {no}</span>
      </div>

      <div className="q-prompt">
        {kind === 'leer' && (
          <b className="q-word">
            <Es w={w} />
          </b>
        )}
        {kind === 'oir' && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="q-play"
              aria-label="Hør ordet igjen"
              onClick={() => void say(w.es)}
            >
              <Volume2 />
            </button>
            <button
              type="button"
              className="q-round"
              aria-label="Hør det sakte"
              onClick={() => void say(w.es, true)}
            >
              <Snail />
            </button>
            {answered && (
              <b className="q-word fx-rise">
                <Es w={w} />
              </b>
            )}
          </div>
        )}
        {(kind === 'elegir' || kind === 'escribir') && (
          <b className="q-meaning">{meaning(w)}</b>
        )}
      </div>

      {kind === 'escribir' ? (
        <form
          className="q-write"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            ref={input}
            className={`q-input ${answered ? (answered.right ? 'right' : 'wrong') : ''}`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={!!answered}
            placeholder={shown || (w.pos === 'n' ? 'med artikkel' : '')}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            lang="es"
            aria-label="Svaret ditt"
          />
          {!answered && (
            <>
              <div className="q-accents">
                {ACCENTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      const el = input.current
                      const at = el?.selectionStart ?? typed.length
                      const end = el?.selectionEnd ?? at
                      setTyped(typed.slice(0, at) + a + typed.slice(end))
                      requestAnimationFrame(() => {
                        el?.focus()
                        el?.setSelectionRange(at + 1, at + 1)
                      })
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="q-btn">
                  Svar
                </button>
                <button
                  type="button"
                  className="q-btn ghost small"
                  disabled={hint >= w.es.length - 1}
                  onClick={() => {
                    setHint((h) => h + 1)
                    input.current?.focus()
                  }}
                >
                  En bokstav til
                </button>
                <button type="button" className="q-link" onClick={giveUp}>
                  Vet ikke
                </button>
              </div>
            </>
          )}
        </form>
      ) : (
        <div className="q-choices">
          {choices.map((c, i) => {
            const state = !answered
              ? ''
              : c.right
                ? 'right'
                : c.text === answered.picked
                  ? 'wrong'
                  : ''
            return (
              <button
                key={c.text}
                type="button"
                className={`q-choice ${state}`}
                disabled={!!answered}
                onClick={() => pick(i)}
              >
                <kbd>{i + 1}</kbd>
                <span lang={kind === 'elegir' ? 'es' : 'nb'}>{c.text}</span>
              </button>
            )
          })}
        </div>
      )}

      {answered && (
        <div
          className={`q-after fx-rise ${answered.right ? 'right' : 'wrong'}`}
        >
          <div className="q-after-text">
            {answered.right &&
            (!answered.verdict || answered.verdict === 'right') ? (
              <>
                <b>{praise}</b>{' '}
                <span>
                  <Es w={w} /> · {meaning(w)}
                </span>
              </>
            ) : (
              <>
                <b>{verdictLine(answered, kind)}</b>{' '}
                <span>
                  <Es w={w} /> · {meaning(w)}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Speak text={w.es} small />
            <button
              type="button"
              className="q-btn small"
              onClick={() => next.current()}
            >
              Neste <ArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function verdictLine(a: Answered, kind: Kind): string {
  switch (a.verdict) {
    case 'accent':
      return 'Riktig, men husk aksenten:'
    case 'bare':
      return 'Riktig, men husk artikkelen:'
    case 'gender':
      return 'Nesten, men det er det andre kjønnet:'
    case 'wrong':
      return 'Det heter'
    default:
      return kind === 'elegir' ? 'Det heter' : 'Det betyr'
  }
}

// The first letters of the answer, the rest as dots: for a noun the
// article comes with the first letter
function hintOf(es: string, n: number): string {
  const space = es.indexOf(' ')
  const upTo = Math.min(es.length, n + (space > 0 && space < 4 ? space + 1 : 0))
  return es.slice(0, upTo) + '…'
}

// --- A new word, met ---

export function WordCard({
  w,
  onNext,
  onKnown,
}: {
  w: Word
  onNext: () => void
  // The player knew it already
  onKnown?: () => void
}) {
  const { settings } = useStore()
  const { hear } = useVoices()
  useEffect(() => {
    if (settings.autoplay) void say(w.es)
  }, [w, settings.autoplay])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key !== 'Enter' ||
        (e.target as HTMLElement | null)?.closest('button, a')
      )
        return
      e.preventDefault()
      onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <div className="q-quiz q-new fx-rise">
      <div className="q-label">
        Palabra nueva <span>· nytt ord</span>
      </div>
      <b className="q-word big">
        <Es w={w} />
      </b>
      <p className="q-meaning">{meaning(w)}</p>
      {w.pos === 'n' && (
        <p className="q-muted text-[16px]">
          {w.g === 'f' ? 'Hunkjønn' : 'Hankjønn'}
          {w.pl ? ', flertall' : ''}: {w.es.split(' ')[0]}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Speak text={w.es} label={`Hør ${w.es}`} />
        {hear !== false && (
          <button
            type="button"
            className="q-round"
            aria-label="Hør det sakte"
            onClick={() => void say(w.es, true)}
          >
            <Snail />
          </button>
        )}
        <button type="button" className="q-btn" onClick={onNext}>
          Neste <ArrowRight />
        </button>
        {onKnown && (
          <button type="button" className="q-link" onClick={onKnown}>
            Kan det fra før
          </button>
        )}
      </div>
    </div>
  )
}

// --- New words: each met, then read, then heard ---

export type Part = 'met' | 'leer' | 'oir'

// The words' parts in an order that spaces them out a little: a word is
// read after the next is met, and heard after the one after that
export function learnQueue(
  ids: Array<string>,
): Array<{ id: string; part: Part }> {
  const out: Array<{ id: string; part: Part }> = []
  for (let k = 0; k < ids.length + 2; k++) {
    if (k < ids.length) out.push({ id: ids[k], part: 'met' })
    if (k >= 1 && k - 1 < ids.length) out.push({ id: ids[k - 1], part: 'leer' })
    if (k >= 2) out.push({ id: ids[k - 2], part: 'oir' })
  }
  return out
}

export function Learn({
  ids,
  got,
  onPart,
}: {
  ids: Array<string>
  // The parts done, as "el gato met"
  got: Set<string>
  onPart: (keys: Array<string>) => void
}) {
  const { meet, know } = useStore()
  const { hear } = useVoices()
  const pool = usePool()
  const left = learnQueue(ids.filter((id) => WORD[id])).filter(
    (p) => !got.has(partKey(p.id, p.part)),
  )
  const at = left.at(0)
  if (!at) return null
  const w = WORD[at.id] as Word
  const done = learnQueue(ids).length - left.length
  const total = learnQueue(ids).length
  const key = partKey(at.id, at.part)
  return (
    <div>
      <Dots n={total} done={done} />
      {at.part === 'met' ? (
        <WordCard
          key={key}
          w={w}
          onNext={() => {
            meet([w.id])
            onPart([key])
          }}
          onKnown={() => {
            know([w.id])
            onPart(['met', 'leer', 'oir'].map((p) => partKey(w.id, p)))
          }}
        />
      ) : (
        <Question
          key={key}
          w={w}
          kind={at.part === 'leer' ? 'leer' : hear === false ? 'elegir' : 'oir'}
          pool={pool.length >= 8 ? pool : WORDS}
          onDone={() => onPart([key])}
        />
      )}
    </div>
  )
}

// --- Words practised, one question each ---

// The words met, for wrong answers that look like the right one
export function usePool(): Array<Word> {
  const { bank } = useStore()
  return useMemo(() => WORDS.filter((w) => bank.cards[w.id]), [bank.cards])
}

export function Drill({
  ids,
  got,
  onItem,
  links,
}: {
  ids: Array<string>
  got: Set<string>
  onItem: (id: string, right: boolean) => void
  // The links to practise; all, or hearing only
  links?: Array<Link>
}) {
  const left = ids.filter((id) => WORD[id] && !got.has(id))
  const at = left.at(0)
  if (!at) return null
  return (
    <div>
      <Dots n={ids.length} done={ids.length - left.length} />
      <DrillItem key={at} id={at} links={links} onDone={(r) => onItem(at, r)} />
    </div>
  )
}

function DrillItem({
  id,
  links,
  onDone,
}: {
  id: string
  links?: Array<Link>
  onDone: (right: boolean) => void
}) {
  const { bank } = useStore()
  const pool = usePool()
  const w = WORD[id] as Word
  // Decided once, when the word comes up
  const [kind] = useState<Kind>(() => {
    const card = bank.cards[id]
    const hear = canHear() !== false
    const can = (links ?? LINKS).filter((l) => hear || l !== 'oir')
    // (only hearing asked for, and no voice to hear by: reading instead)
    const link =
      card && can.length
        ? weakest(card, Date.now(), Math.random, can)
        : (can.at(0) ?? 'leer')
    return kindFor(link, card, hear)
  })
  return (
    <Question
      w={w}
      kind={kind}
      pool={pool.length >= 8 ? pool : WORDS}
      onDone={onDone}
    />
  )
}

// A round's progress, a dot for each thing in it
export function Dots({ n, done }: { n: number; done: number }) {
  return (
    <div className="q-dots mb-4" aria-label={`${done} av ${n}`}>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className={i < done ? 'on' : i === done ? 'at' : ''} />
      ))}
    </div>
  )
}
