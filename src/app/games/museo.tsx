import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { PICTURE, isPainted, paintedSrc } from '../data/museo'
import { THEME } from '../data/themes'
import { LESSON } from '../data/words'
import { RULE, howFar, progressOf, rooms, tally } from '../lib/colecciones'
import { blip } from '../lib/sound'
import { useStore } from '../lib/store'
import { roman, useFont } from '../ui'
import { PrintDefs, StandIn } from './museoArt'
import type { Picture } from '../data/museo'
import './museo.css'

// Tu museo, on the home page's Ordene under Tus palabras: a museum of your
// own, a room for each group of themes, in flat
// graphic style: coloured walls under a skylight, a bench, a doorway on to
// the next room. Each theme has a frame on the wall; its picture (a print
// or a poster, data/museo.ts) is hung once the theme is finished
// (lib/colecciones.ts), and until then the wall shows where it will hang,
// with the theme's name and how far it has come on a label. A picture not
// yet painted is shown as a drawn stand-in (games/museoArt.tsx). Tapping
// one shows it large. Nothing to answer and no score.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&display=swap'

// Each room's walls
const WALL: Record<string, string> = {
  diaria: '#9e3329',
  mesa: '#3d5a48',
  espana: '#2f4f6e',
  historia: '#6e2a35',
  america: '#a5512e',
  fiestas: '#2d6466',
  leyendas: '#2a3352',
  idioma: '#6b6a3a',
}
const wallOf = (id: string) => WALL[id] ?? '#8a3a30'

const ROOM_KEY = 'hola:museo-room'

export default function Museo() {
  useFont(FONTS)
  const { bank } = useStore()
  const all = rooms()
  const lessons = all.flatMap((r) => r.themes.map((t) => t.lesson))
  const total = tally(bank, lessons)
  const [room, setRoom] = useState(() => {
    try {
      const saved = localStorage.getItem(ROOM_KEY)
      if (saved && all.some((r) => r.id === saved)) return saved
    } catch {
      // private mode
    }
    return THEME[bank.theme.on[0]?.id ?? '']?.group.id ?? all[0].id
  })
  const [open, setOpen] = useState<string | null>(null)
  const frames = useRef(new Map<string, HTMLButtonElement>())
  const top = useRef<HTMLElement>(null)
  const ri = Math.max(
    0,
    all.findIndex((r) => r.id === room),
  )
  const here = all[ri]
  const next = all[(ri + 1) % all.length]

  const enter = (id: string) => {
    setRoom(id)
    blip('tap')
    try {
      localStorage.setItem(ROOM_KEY, id)
    } catch {
      // private mode
    }
  }
  const close = () => {
    const was = open
    setOpen(null)
    if (was) frames.current.get(was)?.focus()
  }
  const hereLessons = here.themes.map((t) => t.lesson)
  const hung = tally(bank, hereLessons).done

  return (
    <section
      ref={top}
      className="mu"
      aria-label="Tu museo"
      style={{ '--wall': wallOf(here.id) } as React.CSSProperties}
    >
      <PrintDefs />
      <header className="mu-top">
        <h2>
          Tu museo
          <small>Museet ditt</small>
        </h2>
        <span className="mu-count" aria-label="Bilder hengt opp">
          <b>{total.done}</b> / {total.all}
        </span>
      </header>
      <p className="mu-intro">
        Et rom for hver gruppe av emner. Når et emne er fullført, henges bildet
        opp på veggen. Trykk på et bilde for å se det nærmere.
      </p>

      <nav className="mu-plan" role="tablist" aria-label="Salene">
        {all.map((r, i) => {
          const t = tally(
            bank,
            r.themes.map((x) => x.lesson),
          )
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === here.id}
              aria-label={`Sala ${roman(i + 1)}: ${r.es}`}
              className={r.id === here.id ? 'on' : ''}
              style={{ '--door': wallOf(r.id) } as React.CSSProperties}
              onClick={() => enter(r.id)}
            >
              <i aria-hidden="true" />
              <b>{roman(i + 1)}</b>
              <span lang="es">{r.es}</span>
              <small>
                {t.done} / {t.all}
              </small>
            </button>
          )
        })}
      </nav>

      <section
        className="mu-room"
        aria-label={`Sala ${roman(ri + 1)}: ${here.es}`}
      >
        <Skylight />
        <div className="mu-wall">
          <div className="mu-sign">
            <span className="no">Sala {roman(ri + 1)}</span>
            <b lang="es">{here.es}</b>
            <small>
              {here.no} · {hung} av {here.themes.length} bilder
            </small>
          </div>
          <ul className="mu-hang">
            {here.themes.map((t) => {
              const pic = PICTURE[t.lesson]
              const lesson = LESSON[t.lesson]
              if (!pic || !lesson) return null
              const p = progressOf(bank, t.lesson)
              const on = p.stage === 2
              return (
                <li key={t.lesson} className={`${pic.shape} ${pic.size}`}>
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) frames.current.set(t.lesson, el)
                      else frames.current.delete(t.lesson)
                    }}
                    className={`mu-frame ${on ? 'hung' : 'empty'}`}
                    aria-label={
                      on
                        ? `${pic.es}: ${pic.no}`
                        : `${lesson.es}: ikke hengt opp ennå`
                    }
                    onClick={() => {
                      blip('tap')
                      setOpen(t.lesson)
                    }}
                  >
                    {on ? (
                      <span className="gilt">
                        <Art pic={pic} />
                      </span>
                    ) : (
                      <span className="patch">
                        <i className="nail" aria-hidden="true" />
                      </span>
                    )}
                    <span className="label">
                      {on ? (
                        <>
                          <b lang="es">{pic.es}</b>
                          <small>{lesson.es}</small>
                        </>
                      ) : (
                        <>
                          <b lang="es">{lesson.es}</b>
                          <span className="bar">
                            <i
                              style={{
                                width: `${Math.round(p.toward * 100)}%`,
                              }}
                            />
                          </span>
                          <small>
                            {p.met} av {p.size} ord møtt · {p.learnt} lært
                          </small>
                        </>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
            <li className="door">
              <button
                type="button"
                className="mu-door"
                style={{ '--next': wallOf(next.id) } as React.CSSProperties}
                onClick={() => {
                  enter(next.id)
                  top.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}
              >
                <span className="arch" aria-hidden="true">
                  <i />
                </span>
                <span className="go">
                  {ri + 1 < all.length ? 'Neste sal' : 'Første sal'}
                  <ArrowRight />
                </span>
                <small lang="es">
                  Sala {roman(((ri + 1) % all.length) + 1)} · {next.es}
                </small>
              </button>
            </li>
          </ul>
        </div>
        <div className="mu-floor" aria-hidden="true">
          <Bench />
        </div>
      </section>

      {open && (
        <Opened
          lesson={open}
          onClose={close}
          onGo={(d) => {
            const i = hereLessons.indexOf(open)
            setOpen(
              hereLessons[(i + d + hereLessons.length) % hereLessons.length],
            )
          }}
        />
      )}
    </section>
  )
}

// The picture itself: the painting once it is made, else its stand-in
function Art({ pic }: { pic: Picture }) {
  return isPainted(pic.lesson) ? (
    <img src={paintedSrc(pic.lesson)} alt="" loading="lazy" />
  ) : (
    <StandIn pic={pic} />
  )
}

// A picture looked at closely, or the place where it will hang
function Opened({
  lesson,
  onClose,
  onGo,
}: {
  lesson: string
  onClose: () => void
  onGo: (d: number) => void
}) {
  const { bank } = useStore()
  const pic = PICTURE[lesson]
  const l = LESSON[lesson]
  const theme = THEME[lesson]
  const p = progressOf(bank, lesson)
  const shut = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    shut.current?.focus()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onGo(1)
      else if (e.key === 'ArrowLeft') onGo(-1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onGo])

  if (!pic || !l) return null
  const on = p.stage === 2
  return (
    <div className="mu-veil" onClick={onClose}>
      <div
        className={`mu-open ${pic.shape} ${on ? 'hung' : 'empty'}`}
        role="dialog"
        aria-modal="true"
        aria-label={on ? pic.es : l.es}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mu-big">
          {on ? (
            <span className="gilt">
              <Art pic={pic} />
            </span>
          ) : (
            <span className="patch">
              <i className="nail" aria-hidden="true" />
              <em>Her skal bildet henge</em>
            </span>
          )}
        </div>
        <div className="mu-text">
          {on ? (
            <>
              <h2 lang="es">{pic.es}</h2>
              <p className="sub">{pic.no}</p>
              <p className="medium">
                {pic.medium} · {pic.shows}
              </p>
            </>
          ) : (
            <>
              <h2 lang="es">{l.es}</h2>
              <p className="sub">{l.no}</p>
            </>
          )}
          {theme && <p className="about">{theme.about}</p>}
          <div className="far">
            <span className="bar">
              <i style={{ width: `${Math.round(p.toward * 100)}%` }} />
            </span>
            <p>{howFar(p)}</p>
          </div>
          {!on && <p className="rule">{RULE}</p>}
          <div className="acts">
            <a className="mu-btn" href={`#tema/${lesson}`}>
              Til emnet <ArrowRight />
            </a>
            <button
              ref={shut}
              type="button"
              className="mu-btn ghost"
              onClick={onClose}
            >
              Tilbake til salen
            </button>
          </div>
        </div>
        <button
          type="button"
          className="mu-step prev"
          aria-label="Forrige bilde"
          onClick={() => onGo(-1)}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="mu-step next"
          aria-label="Neste bilde"
          onClick={() => onGo(1)}
        >
          <ChevronRight />
        </button>
        <button
          type="button"
          className="mu-x"
          aria-label="Lukk"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
    </div>
  )
}

// The skylight over the room: a long lantern of panes, light coming in
function Skylight() {
  return (
    <svg
      className="mu-sky"
      viewBox="0 0 1000 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect width="1000" height="120" fill="#efe2c4" />
      <path d="M60 0H940L880 84H120Z" fill="#e3d1aa" />
      <path d="M100 0H900L852 64H148Z" fill="#a9cbe0" />
      <path
        d="M140 10q40-10 90 0t80 0M560 22q50-12 110 0t70 0"
        stroke="#f6fbff"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <g stroke="#7a6a4a" strokeWidth="5">
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10
          const top = 100 + 800 * t
          const bottom = 148 + 704 * t
          return <path key={i} d={`M${top} 0L${bottom} 64`} />
        })}
        <path d="M124 32H876" />
      </g>
      <path
        d="M100 0H900L852 64H148Z"
        fill="none"
        stroke="#7a6a4a"
        strokeWidth="7"
      />
      <path d="M0 108H1000V120H0Z" fill="#d9c49a" />
      <path d="M0 108H1000" stroke="#7a6a4a" strokeWidth="2" />
    </svg>
  )
}

// The bench in the middle of the room
function Bench() {
  return (
    <svg className="mu-bench" viewBox="0 0 300 90" aria-hidden="true">
      <ellipse cx="150" cy="80" rx="140" ry="8" fill="rgba(0,0,0,.18)" />
      <g stroke="#2a1d14" strokeWidth="3" strokeLinejoin="round">
        <path d="M34 44V80h12V50M254 44V80h12V50" fill="#4a2c18" />
        <path
          className="seat"
          d="M22 20q0-8 8-8h240q8 0 8 8v18q0 6-6 6H28q-6 0-6-6Z"
        />
        <path d="M22 38q0 6 6 6h244q6 0 6-6" fill="none" />
        <path d="M30 18h240" stroke="rgba(255,255,255,.35)" strokeWidth="4" />
        <path d="M18 44H282V52H18Z" fill="#5a3620" />
      </g>
    </svg>
  )
}
