import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  answerCard,
  dayKey,
  emptyBank,
  known,
  level,
  merge,
  newCard,
  withStart,
} from './bank'
import { retheme } from './today'
import { keep } from './colecciones'
import { setVoice } from './speech'
import { setEffects } from './sound'
import type { ReactNode } from 'react'
import type { Bank, Level, Link, Path } from './bank'

// The word bank and the settings as React state, for every game at once,
// both kept in this browser's localStorage. Nothing leaves the browser; a
// backup file moves it to another (games/ajustes.tsx).

export interface Settings {
  // The Spanish voice, by its voiceURI; '' lets the page choose
  voice: string
  rate: number
  // Say a word as it comes up
  autoplay: boolean
  // Count a typed answer as right without its accents
  lenient: boolean
  effects: boolean
  // The guitar in the background
  music: boolean
  // New words a day, when not many are fading
  perDay: number
  // The size of the text in the library's reader, a step of TEXT_SIZES
  textSize: number
  // The library's texts in Spanish alone, without the Norwegian over the
  // words, the lines as close as in a book
  plainText: boolean
}

// The library's text sizes, in pixels
export const TEXT_SIZES = [20, 23, 26, 30, 34]

export const DEFAULTS: Settings = {
  voice: '',
  rate: 1,
  autoplay: true,
  lenient: true,
  effects: true,
  music: false,
  perDay: 4,
  textSize: 2,
  plainText: false,
}

const BANK_KEY = 'hola:bank:v1'
const SETTINGS_KEY = 'hola:settings:v1'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

// JSON with each object's keys in order, so that two tabs holding the same
// bank write the same text
export const stable = (value: unknown): string =>
  JSON.stringify(value, (_, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
        )
      : v,
  )

// (only when it changes: each write tells the other tabs, and they answer)
function save(key: string, value: unknown) {
  try {
    const text = stable(value)
    if (localStorage.getItem(key) !== text) localStorage.setItem(key, text)
  } catch {
    // private mode, or full
  }
}

interface Store {
  bank: Bank
  settings: Settings
  setSettings: (s: Partial<Settings>) => void
  levelOf: (id: string) => Level
  // An answer about a word: right or not, how much it says (lib/bank.ts),
  // and which of the word's links it tested
  record: (
    id: string,
    right: boolean,
    weight: number,
    links: Link | Array<Link>,
  ) => void
  // Words met for the first time
  meet: (ids: Array<string>) => void
  // Words the player already knows
  know: (ids: Array<string>) => void
  forget: (ids: Array<string>) => void
  points: (n: number) => void
  setBest: (game: string, score: number) => void
  setPalabra: (day: string, guesses: number) => void
  setRead: (chapter: string, right: number) => void
  // How far a text in the library is read: up to paragraph `p`, and
  // whether to its end
  setPlace: (text: string, p: number, done?: boolean) => void
  // A game or a chapter played to its end: a step of Today's chapter that
  // was waiting for it is done
  played: (id: string) => void
  setPath: (f: (p: Path | null) => Path | null) => void
  // A lesson chosen as the theme, '' for none: today's chapter meets its
  // words first, from today's new words on if none of them is begun
  setTheme: (lesson: string) => void
  // A day's chapter finished, with points for it; only once a day
  finishDay: (day: string, bonus?: number) => void
  // A bank read in from a backup, merged with this one
  absorb: (b: Partial<Bank>) => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside BankProvider')
  return s
}

// A change to the bank, made so that a lesson finished before it stays
// finished after it (keep, in lib/colecciones.ts)
const keeping = (change: (b: Bank) => Bank) => (b: Bank) => {
  const now = Date.now()
  const was = keep(b, now)
  const next = change(was)
  return next === was ? was : keep(next, now)
}

export function BankProvider({ children }: { children: ReactNode }) {
  // (merged with nothing, so a bank kept by an older page is read as now,
  // and given the starting point if it has not had it)
  const [bank, setRaw] = useState<Bank>(() =>
    withStart(merge(load(BANK_KEY, emptyBank()), emptyBank()), Date.now()),
  )
  // Every change to the bank goes through keeping
  const setBank = useCallback(
    (change: (b: Bank) => Bank) => setRaw(keeping(change)),
    [],
  )
  const [settings, setAll] = useState<Settings>(() =>
    load(SETTINGS_KEY, DEFAULTS),
  )

  useEffect(() => save(BANK_KEY, bank), [bank])
  useEffect(() => {
    save(SETTINGS_KEY, settings)
    setVoice(settings.voice, settings.rate)
    setEffects(settings.effects)
  }, [settings])

  // Another tab's changes, so two tabs do not undo each other
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== BANK_KEY || !e.newValue) return
      try {
        const other = JSON.parse(e.newValue) as Partial<Bank>
        // Nothing new keeps the bank as it is, or the tabs would answer each
        // other for ever
        setBank((b) => {
          const both = merge(b, other)
          return stable(both) === stable(b) ? b : both
        })
      } catch {
        // not ours to read
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const today = () => dayKey(Date.now())

  const record = useCallback(
    (id: string, right: boolean, weight: number, links: Link | Array<Link>) =>
      setBank((b) => {
        const now = Date.now()
        const cards = {
          ...b.cards,
          [id]: answerCard(
            b.cards[id],
            typeof links === 'string' ? [links] : links,
            right,
            now,
            weight,
          ),
        }
        const days = right
          ? { ...b.days, [today()]: (b.days[today()] ?? 0) + 1 }
          : b.days
        return { ...b, cards, days }
      }),
    [],
  )

  const meet = useCallback(
    (ids: Array<string>) =>
      setBank((b) => {
        const fresh = ids.filter((id) => !b.cards[id])
        if (!fresh.length) return b
        const now = Date.now()
        const cards = { ...b.cards }
        for (const id of fresh) cards[id] = newCard(now)
        return { ...b, cards }
      }),
    [],
  )

  const know = useCallback(
    (ids: Array<string>) =>
      setBank((b) => {
        const now = Date.now()
        const cards = { ...b.cards }
        for (const id of ids)
          if (level(cards[id], now) < 2) cards[id] = known(now)
        return { ...b, cards }
      }),
    [],
  )

  const forget = useCallback(
    (ids: Array<string>) =>
      setBank((b) => {
        const cards = { ...b.cards }
        for (const id of ids) delete cards[id]
        return { ...b, cards }
      }),
    [],
  )

  const points = useCallback(
    (n: number) =>
      setBank((b) => ({
        ...b,
        days: { ...b.days, [today()]: (b.days[today()] ?? 0) + n },
      })),
    [],
  )

  const setBest = useCallback(
    (game: string, score: number) =>
      setBank((b) =>
        score > (b.best[game] ?? 0)
          ? { ...b, best: { ...b.best, [game]: score } }
          : b,
      ),
    [],
  )

  const setPalabra = useCallback(
    (day: string, guesses: number) =>
      setBank((b) =>
        b.palabra[day] !== undefined
          ? b
          : { ...b, palabra: { ...b.palabra, [day]: guesses } },
      ),
    [],
  )

  const setRead = useCallback(
    (chapter: string, right: number) =>
      setBank((b) => ({
        ...b,
        read: { ...b.read, [chapter]: Math.max(b.read[chapter] ?? 0, right) },
      })),
    [],
  )

  const setPlace = useCallback(
    (text: string, p: number, done = false) =>
      setBank((b) => {
        const was = b.place[text]
        if (was && was.p === p && (!done || was.done)) return b
        const now = Date.now()
        const end = was?.done ?? (done ? now : undefined)
        return {
          ...b,
          place: {
            ...b.place,
            [text]: { p, t: now, ...(end ? { done: end } : {}) },
          },
        }
      }),
    [],
  )

  const played = useCallback(
    (id: string) =>
      setBank((b) => {
        const p = b.path
        if (!p || p.d !== today()) return b
        const i = p.steps.findIndex(
          (s) => (s.k === 'game' || s.k === 'story') && s.arg === id && !s.done,
        )
        if (i < 0) return b
        const steps = p.steps.map((s, j) =>
          j === i ? { ...s, done: Date.now() } : s,
        )
        return { ...b, path: { ...p, steps } }
      }),
    [],
  )

  const setPath = useCallback(
    (f: (p: Path | null) => Path | null) =>
      setBank((b) => {
        const path = f(b.path)
        return path === b.path ? b : { ...b, path }
      }),
    [],
  )

  const setTheme = useCallback(
    (lesson: string) =>
      setBank((b) => {
        const next = { ...b, theme: { id: lesson, t: Date.now() } }
        const p = next.path
        return p && p.d === today() ? { ...next, path: retheme(p, next) } : next
      }),
    [],
  )

  const finishDay = useCallback(
    (day: string, bonus = 0) =>
      setBank((b) =>
        b.daily[day]
          ? b
          : {
              ...b,
              daily: { ...b.daily, [day]: 1 },
              days: { ...b.days, [day]: (b.days[day] ?? 0) + bonus },
            },
      ),
    [],
  )

  const absorb = useCallback(
    (other: Partial<Bank>) => setBank((b) => merge(b, other)),
    [],
  )

  const reset = useCallback(
    () => setBank(() => withStart(emptyBank(), Date.now())),
    [],
  )

  const setSettings = useCallback(
    (s: Partial<Settings>) => setAll((old) => ({ ...old, ...s })),
    [],
  )

  const value = useMemo<Store>(
    () => ({
      bank,
      settings,
      setSettings,
      levelOf: (id) => level(bank.cards[id], Date.now()),
      record,
      meet,
      know,
      forget,
      points,
      setBest,
      setPalabra,
      setRead,
      setPlace,
      played,
      setPath,
      setTheme,
      finishDay,
      absorb,
      reset,
    }),
    [
      bank,
      settings,
      setSettings,
      record,
      meet,
      know,
      forget,
      points,
      setBest,
      setPalabra,
      setRead,
      setPlace,
      played,
      setPath,
      setTheme,
      finishDay,
      absorb,
      reset,
    ],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
