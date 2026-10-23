import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { WORD, article, meaning } from './data/words'
import { spaceBefore, tokens } from './lib/text'
import { say, useVoices } from './lib/speech'
import { useStore } from './lib/store'
import type { CSSProperties, ReactNode } from 'react'
import type { Word } from './data/words'
import type { Level, Link } from './lib/bank'
import type { Token } from './lib/text'

// The pieces the pages share: the page frame, Spanish said aloud, mixed
// text and the card a tapped word opens, the icons of the three links, the
// ring of today's chapter and the stamps of the credential.

// --- The page ---

export function Page({
  title,
  es,
  back = '#',
  tools,
  children,
  className = '',
}: {
  // Norwegian, under the Spanish
  title: string
  es: string
  back?: string
  tools?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`q-shell ${className}`}>
      <header className="q-top">
        <a className="q-round" href={back} aria-label="Tilbake">
          <ArrowLeft />
        </a>
        <h1>
          {es}
          <small>{title}</small>
        </h1>
        {tools && <div className="tools">{tools}</div>}
      </header>
      <main className="q-main">{children}</main>
    </div>
  )
}

// --- Speech ---

// A round button that says the Spanish; none where the browser has no
// Spanish voice
export function Speak({
  text,
  slow = false,
  dark = false,
  small = false,
  label = 'Hør',
  className = '',
}: {
  text: string
  slow?: boolean
  dark?: boolean
  small?: boolean
  label?: string
  className?: string
}) {
  const { hear } = useVoices()
  if (hear === false) return null
  return (
    <button
      type="button"
      className={`q-round ${dark ? 'dark' : ''} ${small ? 'small' : ''} ${className}`}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        void say(text, slow)
      }}
    >
      <Volume2 />
    </button>
  )
}

// A noun's article in its gender's colour, so that it is learnt with the
// word: blue for el, red for la. `plain` leaves the colour off, where the
// gender is what is asked.
export function Es({ w, plain = false }: { w: Word; plain?: boolean }) {
  const a = article(w)
  if (!a || plain) return <>{w.es}</>
  return (
    <>
      <span className={w.g === 'f' ? 'g-f' : 'g-m'}>{a.art}</span> {a.rest}
    </>
  )
}

// --- Mixed text ---

// A line of a story, every word in Spanish as the player knows it: with
// the Norwegian over it until it is known (in brown while it is not met, in
// blue while it is learnt), alone once known. A tap opens the word's card.
export function Mixed({
  line,
  className = '',
  onPeek,
  all,
  still = false,
}: {
  line: string
  className?: string
  // Told of each word tapped
  onPeek?: (id: string) => void
  // Every word at one level, as for a line shown in full
  all?: Level
  // Nothing to tap, as inside something that is itself a button
  still?: boolean
}) {
  const { levelOf } = useStore()
  const peek = usePeek()
  const toks = useMemo(() => tokens(line), [line])
  return (
    <span className={`mx ${className}`}>
      {toks.map((t, i) => {
        const space = spaceBefore(toks, i) ? ' ' : ''
        if (!t.id) return space + t.es
        const id = t.id
        const lv = all ?? levelOf(id)
        const tap = still
          ? {}
          : {
              role: 'button',
              tabIndex: 0,
              'data-peek': '',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                onPeek?.(id)
                peek(t, e.currentTarget)
              },
              onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                onPeek?.(id)
                peek(t, e.currentTarget)
              },
            }
        return (
          <span key={i}>
            {space}
            {lv < 2 ? (
              <ruby className={lv === 0 ? 'nw' : 'lw'} {...tap}>
                {t.es}
                <rt>{t.no}</rt>
              </ruby>
            ) : (
              <span className="kw" {...tap}>
                {t.es}
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

// What mixed text's three ways of showing a word mean
export function MixedKey() {
  return (
    <div className="mx-key">
      <span>
        <b>Spansk</b> · kjent
      </span>
      <span>
        <b>
          Spansk med <i style={{ color: 'var(--blue)' }}>blått</i> over
        </b>{' '}
        · øver på
      </span>
      <span>
        <b>
          Spansk med <i style={{ color: 'var(--nw)' }}>brunt</i> over
        </b>{' '}
        · ikke møtt ennå
      </span>
    </div>
  )
}

// --- A word's card, opened from mixed text ---

type Open = (t: Token, el: HTMLElement) => void

const PeekCtx = createContext<Open>(() => {})

export const usePeek = () => useContext(PeekCtx)

interface Peeked {
  t: Token
  el: HTMLElement
}

export function PeekProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Peeked | null>(null)
  const open = useCallback<Open>(
    (t, el) => setP((old) => (old?.el === el ? null : { t, el })),
    [],
  )
  useEffect(() => {
    if (!p) return
    const close = () => setP(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (!target?.closest('.q-peek, [data-peek]')) close()
    }
    // (a scroll of the page itself has the document as its target)
    const onScroll = (e: Event) => {
      if (!(e.target instanceof Element && e.target.closest('.q-peek'))) close()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
    window.addEventListener('hashchange', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('hashchange', close)
    }
  }, [p])
  return (
    <PeekCtx.Provider value={open}>
      {children}
      {p && <PeekCard key={`${p.t.id}`} {...p} onClose={() => setP(null)} />}
    </PeekCtx.Provider>
  )
}

function PeekCard({ t, el, onClose }: Peeked & { onClose: () => void }) {
  const { levelOf, meet } = useStore()
  const box = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState<CSSProperties>({ visibility: 'hidden' })
  const [arrow, setArrow] = useState<{ x: number; up: boolean }>({
    x: 30,
    up: true,
  })
  const w = t.id ? WORD[t.id] : undefined

  // Under the word if there is room, else over it
  useLayoutEffect(() => {
    const r = el.getBoundingClientRect()
    const card = box.current?.getBoundingClientRect()
    const width = card?.width ?? 300
    const height = card?.height ?? 160
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mid = r.left + r.width / 2
    const left = Math.max(16, Math.min(vw - width - 16, mid - 46))
    const below = vh - r.bottom > height + 24 || r.top < height + 24
    setAt({
      left,
      top: below ? r.bottom + 12 : r.top - height - 12,
    })
    setArrow({
      x: Math.max(14, Math.min(width - 30, mid - left - 8)),
      up: below,
    })
  }, [el])

  if (!w) return null
  const lv = levelOf(w.id)
  return (
    <div
      ref={box}
      className="q-peek"
      style={at}
      role="dialog"
      aria-label={`${t.es}: ${meaning(w)}`}
    >
      <i
        className={`q-peek-arrow ${arrow.up ? 'up' : 'down'}`}
        style={{ left: arrow.x }}
      />
      <div className="flex items-center justify-between gap-3">
        <b className="es">{t.es}</b>
        <Speak text={t.es} dark small label={`Hør ${t.es}`} />
      </div>
      <p>
        {/* The word as the word bank has it, where this is a form of it */}
        {w.es !== t.es && (
          <>
            <i>
              <Es w={w} />
            </i>{' '}
            ·{' '}
          </>
        )}
        {meaning(w)}
      </p>
      {lv === 0 ? (
        <button
          type="button"
          className="q-btn ghost small"
          onClick={() => {
            meet([w.id])
            onClose()
          }}
        >
          Lær dette ordet
        </button>
      ) : (
        <span className="q-sc text-[15px] text-[var(--ink-3)]">
          {lv === 1 ? 'Øver på' : 'Kjent'}
        </span>
      )}
    </div>
  )
}

// --- The three links of a word ---

export const LINK_NAME: Record<Link, { es: string; no: string }> = {
  leer: { es: 'Leer', no: 'lese' },
  oir: { es: 'Oír', no: 'høre' },
  decir: { es: 'Decir', no: 'si' },
}

// An eye for reading, an ear for hearing, lips for saying
export function LinkIcon({
  link,
  className = '',
  color = 'var(--ink)',
}: {
  link: Link
  className?: string
  color?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 30"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {link === 'leer' ? (
        <>
          <path d="M3 15C8 7 22 7 27 15 22 23 8 23 3 15Z" />
          <circle cx="15" cy="15" r="4.5" fill={color} />
          <path d="M6 9 4 6M15 6V3M24 9 26 6" strokeWidth="1.4" />
        </>
      ) : link === 'oir' ? (
        <>
          <path d="M8 11C8 6 11 3 16 3 21 3 24 7 24 11 24 18 16 18 16 24 16 27 14 28 12 28 10 28 8 26 8 24" />
          <path d="M13 11C13 9 14 8 16 8 18 8 19 9 19 11 19 13 16 14 16 16" />
        </>
      ) : (
        <>
          <path
            d="M3 15C7 10 11 9 14 11 15 11.6 16 11.6 17 11 20 9 24 10 27 15 24 20 20 22 15 22S6 20 3 15Z"
            fill="#c2402c"
            fillOpacity=".55"
          />
          <path d="M3 15C8 16.4 11 16.8 15 16.8S22 16.4 27 15" />
        </>
      )}
    </svg>
  )
}

// A bar drawn in three strokes of ink, as full as `share`
export function InkBar({
  share,
  color = 'var(--blue)',
  className = '',
}: {
  share: number | null
  color?: string
  className?: string
}) {
  const x = 2 + 196 * Math.max(0, Math.min(1, share ?? 0))
  return (
    <svg
      className={className}
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M2 7H198" stroke="#cbb998" strokeWidth="2" />
      {share !== null && share > 0 && (
        <path
          d={`M2 3 ${x} 3M2 7 ${x - 2} 7M2 11 ${x} 11`}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export const percent = (share: number | null) =>
  share === null ? '–' : `${Math.round(share * 100)} %`

// --- The ring of today's chapter ---

const WEDGE = ['#c2402c', '#d29a2e', '#4f7fa8']

// One wedge for each part of the day, filled as far as the part has got,
// with the chapter's number in the middle
export function Ring({
  shares,
  numeral,
  size,
  className = '',
}: {
  shares: Array<number>
  numeral: string
  // In pixels; without it, the stylesheet says
  size?: number
  className?: string
}) {
  const n = Math.max(1, shares.length)
  const each = 360 / n
  const point = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180
    return `${(90 + r * Math.cos(a)).toFixed(1)} ${(90 + r * Math.sin(a)).toFixed(1)}`
  }
  return (
    <svg
      viewBox="0 0 180 180"
      style={size ? { width: size, height: size } : undefined}
      className={className}
      aria-hidden="true"
    >
      {shares.map((s, i) => {
        if (s <= 0) return null
        const a0 = -90 + i * each + 2.5
        const a1 = a0 + (each - 5) * Math.min(1, s)
        const large = a1 - a0 > 180 ? 1 : 0
        return (
          <path
            key={i}
            d={`M${point(a0, 68)}A68 68 0 ${large} 1 ${point(a1, 68)}L90 90Z`}
            fill={WEDGE[i % WEDGE.length]}
            opacity=".55"
            filter="url(#q-w2)"
          />
        )
      })}
      <g
        filter="url(#q-ring)"
        fill="none"
        stroke="#1b1611"
        strokeLinecap="round"
      >
        <circle cx="90" cy="90" r="68" strokeWidth="4" />
        <circle cx="90" cy="90" r="60" strokeWidth="1.5" />
        <path
          d={shares
            .map(
              (_, i) =>
                `M${point(-90 + i * each, 68)}L${point(-90 + i * each, 54)}`,
            )
            .join('')}
          strokeWidth="3"
        />
      </g>
      <text
        x="90"
        y="104"
        textAnchor="middle"
        fontFamily="IM Fell English, serif"
        fontSize={numeral.length > 4 ? 30 : 42}
        fill="#1b1611"
      >
        {numeral}
      </text>
    </svg>
  )
}

// I, II, III … as chapters are numbered
export function roman(n: number): string {
  const parts: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let out = ''
  let left = Math.max(1, Math.floor(n))
  for (const [v, s] of parts) {
    while (left >= v) {
      out += s
      left -= v
    }
  }
  return out
}

// --- The filters that make shapes look drawn in ink, once for the page ---

export function InkDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="q-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".035"
            numOctaves="2"
            seed="3"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
        </filter>
        <filter id="q-ink-s" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".05"
            numOctaves="2"
            seed="3"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
        <filter id="q-wash" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".018"
            numOctaves="3"
            seed="8"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="46" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.5" />
        </filter>
        <filter id="q-wash-s" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".03"
            numOctaves="3"
            seed="8"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.6" />
        </filter>
        <filter id="q-blot" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".09"
            numOctaves="2"
            seed="5"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" />
        </filter>
        <filter id="q-ring">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".05"
            numOctaves="2"
            seed="9"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
        </filter>
        <filter id="q-w2" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".05"
            numOctaves="2"
            seed="2"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" />
        </filter>
      </defs>
    </svg>
  )
}

// --- Small helpers ---

// A web font a game uses, loaded when the game is first opened
const fonts = new Set<string>()
export function useFont(href: string) {
  useEffect(() => {
    if (fonts.has(href)) return
    fonts.add(href)
    if (document.querySelector(`link[href="${CSS.escape(href)}"]`)) return
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = href
    document.head.append(l)
  }, [href])
}

export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (f) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', f)
      return () => m.removeEventListener('change', f)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

// The letters of a Spanish keyboard, as the games draw it
export const KEY_ROWS = [[...'QWERTYUIOP'], [...'ASDFGHJKLÑ'], [...'ZXCVBNM']]

const PLAIN_KEY: Record<string, string> = {
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
  Ü: 'U',
  // A Norwegian keyboard has no Ñ, and Ø sits where Spain's Ñ does
  Ø: 'Ñ',
}

// Letters, Enter and Backspace typed on a real keyboard, for a game with
// a keyboard of its own on the screen. Not while something else that
// takes text has the focus.
export function useLetterKeys(on: (key: string) => void, enabled = true) {
  const handler = useRef(on)
  useEffect(() => {
    handler.current = on
  })
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, [contenteditable]')) return
      if (e.key === 'Enter' || e.key === 'Backspace') {
        if (e.key === 'Enter' && t?.closest('button, a')) return
        e.preventDefault()
        handler.current(e.key)
        return
      }
      if (e.key.length !== 1) return
      const up = e.key.toUpperCase()
      const k = PLAIN_KEY[up] ?? up
      if (!/^[A-ZÑ]$/.test(k)) return
      e.preventDefault()
      handler.current(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}

// The way back to the home page, for the end of a round
export function HomeLink({ className = '' }: { className?: string }) {
  return (
    <a className={`q-btn ghost ${className}`} href="#">
      Til forsiden
    </a>
  )
}
