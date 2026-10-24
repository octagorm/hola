import { useEffect, useMemo, useRef, useState } from 'react'
import { PICTURES } from './data/pictures'
import {
  PERIODS,
  SCENE,
  blend,
  blendColour,
  clockFrom,
  cropOf,
  moon,
  moonHour,
  moonPath,
  moonPlace,
  moonRising,
  periods,
  weightOf,
} from './lib/sky'
import { useMedia } from './ui'
import type { CSSProperties } from 'react'
import type { Period, Rect } from './lib/sky'

// The painted scene at the top of the home page: La Mancha as a travel
// poster, painted for dawn, day, dusk and night (public/home/, made by
// scripts/pictures.mjs from data/home-prompts.ts), shown by the player's
// own clock (lib/sky.ts) and crossfaded around sunrise and sunset. Over
// it, in the poster's own flat colours and with no outlines: the moon in
// its real phase, travelling along the band of open sky the paintings
// leave for it, a few stars twinkling at night, clouds drifting slowly
// and now and then a pair of birds. The motion is CSS animation, still
// with reduced motion and paused out of view. ?time=21:30 (or
// ?date=2027-02-06&time=20:00) shows another hour.
//
// Until all four paintings are made the home page keeps its ink drawing.

const picture = (p: Period) => `home/${p}`

export const SCENE_PAINTED = PERIODS.every((p) => PICTURES.has(picture(p)))

const { width: W, height: H } = SCENE

// The sky's colour, under the painting until it has come
const SKY: Record<Period, string> = {
  day: '#b9cfc2',
  dawn: '#c6c3c8',
  dusk: '#4e4670',
  night: '#1f2a48',
}
const MOON: Record<Period, string> = {
  day: '#f8f4ea',
  dawn: '#f6ead2',
  dusk: '#f4e4c0',
  night: '#f3e6c4',
}
const MOON_ALPHA: Record<Period, number> = {
  day: 0.55,
  dawn: 0.8,
  dusk: 0.9,
  night: 1,
}
const HALO: Record<Period, number> = { day: 0, dawn: 0, dusk: 0.5, night: 1 }
const STARS: Record<Period, number> = {
  day: 0,
  dawn: 0.15,
  dusk: 0.35,
  night: 1,
}
const CLOUD: Record<Period, string> = {
  day: '#f4eedf',
  dawn: '#f2caae',
  dusk: '#de9a83',
  night: '#36426b',
}
const CLOUD_ALPHA: Record<Period, number> = {
  day: 0.9,
  dawn: 0.85,
  dusk: 0.75,
  night: 0.5,
}
const BIRD: Record<Period, string> = {
  day: '#3b4a50',
  dawn: '#4a4054',
  dusk: '#2c2236',
  night: '#1a2036',
}

// The moon's radius, in the picture's pixels
const MOON_R = 30

// Stars across the sky band, the same every night: x, y, size in screen
// pixels, and how fast and when each twinkles
const STAR_LIST = (() => {
  let s = 17
  const next = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  const { y0, y1 } = SCENE.stars
  return Array.from({ length: 46 }, () => ({
    x: next() * W,
    // more of them high up, where the sky is darkest
    y: (y0 + next() ** 1.3 * (y1 - y0)) * H,
    size: 0.9 + next() ** 2 * 1.6,
    period: 3 + next() * 5,
    delay: -next() * 8,
  }))
})()

// Flat clouds of the poster's kind, long rounded bands laid over each
// other: where each is, its bands (x, y, width, height) and how long it
// takes to cross
const CLOUDS: Array<{
  x: number
  y: number
  bands: Array<[number, number, number, number]>
  secs: number
}> = [
  {
    x: 180,
    y: SCENE.clouds.y0 * H + 20,
    bands: [
      [0, 0, 330, 30],
      [70, -24, 190, 30],
    ],
    secs: 560,
  },
  {
    x: 760,
    y: SCENE.clouds.y1 * H - 30,
    bands: [
      [0, 0, 420, 26],
      [120, -20, 220, 26],
      [-60, 22, 230, 22],
    ],
    secs: 720,
  },
  {
    x: 1180,
    y: (SCENE.clouds.y0 + SCENE.clouds.y1) * 0.5 * H,
    bands: [
      [0, 0, 260, 24],
      [50, -18, 150, 24],
    ],
    secs: 640,
  },
]

// A bird in flight, its wings as one flat shape, for a span of 2 × 7
const BIRD_PATH =
  'M-7 0.6C-5.2-2.6-2.4-3-0.2 0C2.2-3 5-2.6 7 0.6C4.6-1 2.4-0.6 0 1.8C-2.4-0.6-4.6-1-7 0.6Z'

// The height the birds cross at, low over the plain, under the title
const BIRDS_Y = 0.49 * H

const shapeOf = (bands: Array<[number, number, number, number]>) =>
  bands.map(([x, y, w, h], i) => (
    <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} />
  ))

export function PaintedScene({
  narrow = false,
  avoid,
  className = '',
}: {
  // The phone's strip, which shows the middle of the picture
  narrow?: boolean
  // What the page lays over the scene, which the moon and the clouds keep
  // clear of, as a selector within the scene's parent
  avoid?: string
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const measure = useRef<() => void>(null)
  const clock = useMemo(() => clockFrom(window.location.search), [])
  const [now, setNow] = useState(clock)
  const [size, setSize] = useState<[number, number] | null>(null)
  const [cover, setCover] = useState<Array<DOMRect>>([])
  const [loaded, setLoaded] = useState<ReadonlySet<Period>>(new Set())
  const [seen, setSeen] = useState(true)
  const still = useMedia('(prefers-reduced-motion: reduce)')

  // The clock, every half minute and whenever the page is shown again
  useEffect(() => {
    const tick = () => setNow(clock())
    const timer = setInterval(tick, 30_000)
    const onShow = () => !document.hidden && tick()
    document.addEventListener('visibilitychange', onShow)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [clock])

  // The box's size, and where the page's own things lie over it
  useEffect(() => {
    const el = box.current
    if (!el) return
    let gone = false
    const again = () => {
      if (gone) return
      const r = el.getBoundingClientRect()
      setSize(r.width && r.height ? [r.width, r.height] : null)
      const over = avoid
        ? Array.from(el.parentElement?.querySelectorAll(avoid) ?? [], (x) => {
            const b = x.getBoundingClientRect()
            return new DOMRect(
              b.left - r.left,
              b.top - r.top,
              b.width,
              b.height,
            )
          })
        : []
      setCover(over)
    }
    measure.current = again
    again()
    const ro = new ResizeObserver(again)
    ro.observe(el)
    // the title changes size as its fonts come, and the sign-in button
    // as the account is known
    const parent = avoid ? el.parentElement : null
    if (parent) ro.observe(parent)
    void document.fonts.ready.then(again)
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting))
    io.observe(el)
    return () => {
      gone = true
      ro.disconnect()
      io.disconnect()
    }
  }, [avoid])
  useEffect(() => measure.current?.(), [now])

  const ws = periods(now)
  const dark = weightOf(ws, 'night') + weightOf(ws, 'dusk') >= 0.5
  const crop = size
    ? cropOf(size[0], size[1], narrow ? SCENE.narrowSpan : 1)
    : null
  // A screen pixel, in the picture's pixels
  const unit = crop ? 1 / crop.scale : 1

  const m = moon(now)
  const hour = moonHour(now)
  // What the page lays over the scene, in the picture's pixels
  const over = crop
    ? cover.map((b): Rect => ({
        x0: (b.left - crop.left) * unit,
        x1: (b.right - crop.left) * unit,
        y0: (b.top - crop.top) * unit,
        y1: (b.bottom - crop.top) * unit,
      }))
    : []
  const place =
    crop && m.lit > 0.02 ? moonPlace(hour, crop.view, over, MOON_R) : null
  // The clouds keep to the right of the title, fading out behind it, so
  // that it reads over the sky at every hour
  const title = crop
    ? Math.max(
        -Infinity,
        ...over
          .filter((b) => b.x0 + b.x1 < crop.view.x0 + crop.view.x1)
          .map((b) => b.x1),
      )
    : -Infinity
  const moonAlpha = blend(ws, MOON_ALPHA) * moonRising(hour)
  const moonColour = blendColour(ws, MOON)
  const halo = blend(ws, HALO) * moonAlpha
  const starAlpha = blend(ws, STARS)
  const cloudColour = blendColour(ws, CLOUD)
  const cloudAlpha = blend(ws, CLOUD_ALPHA)
  const birdAlpha = 1 - weightOf(ws, 'night')

  return (
    <div
      ref={box}
      className={`q-sky ${narrow ? 'narrow' : 'wide'} ${dark ? 'dark' : ''} ${still ? 'still' : ''} ${seen ? '' : 'paused'} ${className}`}
      style={{ background: blendColour(ws, SKY) }}
      aria-hidden="true"
    >
      {crop && (
        <div
          className="stage"
          style={{
            left: crop.left,
            top: crop.top,
            width: crop.width,
            height: crop.height,
          }}
        >
          {ws.map(([p, w], i) => (
            <img
              key={p}
              src={`/${picture(p)}.webp`}
              alt=""
              draggable={false}
              decoding="async"
              onLoad={() => setLoaded((s) => new Set(s).add(p))}
              style={{ opacity: loaded.has(p) ? (i === 0 ? 1 : w) : 0 }}
            />
          ))}
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            {starAlpha > 0.03 && (
              <g fill="#fbf3dc" opacity={starAlpha}>
                {STAR_LIST.filter(
                  (s) =>
                    !place ||
                    Math.hypot(s.x - place.x, s.y - place.y) > MOON_R * 1.9,
                ).map((s, i) => (
                  <circle
                    key={i}
                    className="star"
                    cx={s.x}
                    cy={s.y}
                    r={s.size * unit}
                    style={{
                      animationDuration: `${s.period}s`,
                      animationDelay: `${s.delay}s`,
                    }}
                  />
                ))}
              </g>
            )}
            {title > -Infinity && (
              <defs>
                <linearGradient
                  id="q-sky-fade"
                  gradientUnits="userSpaceOnUse"
                  x1={title}
                  x2={title + 220}
                  y1="0"
                  y2="0"
                >
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="1" stopColor="#fff" />
                </linearGradient>
                <mask id="q-sky-clear" maskUnits="userSpaceOnUse">
                  <rect width={W} height={H} fill="url(#q-sky-fade)" />
                </mask>
              </defs>
            )}
            <g
              fill={cloudColour}
              opacity={cloudAlpha}
              mask={title > -Infinity ? 'url(#q-sky-clear)' : undefined}
            >
              {CLOUDS.map((c, i) => {
                const width = Math.max(...c.bands.map(([x, , w]) => x + w))
                const a = -c.x - width - 80
                const b = W - c.x + 80
                return (
                  <g
                    key={i}
                    className="cloud"
                    style={
                      {
                        '--a': `${a}px`,
                        '--b': `${b}px`,
                        animationDuration: `${c.secs}s`,
                        animationDelay: `${(c.secs * a) / (b - a)}s`,
                      } as CSSProperties
                    }
                  >
                    <g transform={`translate(${c.x} ${c.y})`}>
                      {shapeOf(c.bands)}
                    </g>
                  </g>
                )
              })}
            </g>
            {place && moonAlpha > 0.03 && (
              <g
                transform={`translate(${place.x} ${place.y})`}
                fill={moonColour}
              >
                {halo > 0.03 && (
                  <>
                    <circle r={MOON_R * 2.1} opacity={0.06 * halo} />
                    <circle r={MOON_R * 1.5} opacity={0.1 * halo} />
                  </>
                )}
                <path d={moonPath(m.phase, MOON_R)} opacity={moonAlpha} />
              </g>
            )}
            {!still && birdAlpha > 0.05 && (
              <g
                className="birds"
                fill={blendColour(ws, BIRD)}
                opacity={birdAlpha}
                style={
                  {
                    '--a': `${crop.view.x0 - 40 * unit}px`,
                    '--b': `${crop.view.x1 + 60 * unit}px`,
                  } as CSSProperties
                }
              >
                {[
                  [0, 0, 1],
                  [-30, 12, 0.8],
                ].map(([dx, dy, k], i) => (
                  <g
                    key={i}
                    transform={`translate(${dx * unit} ${BIRDS_Y + dy * unit}) scale(${unit * k * 1.5})`}
                  >
                    <path
                      className="wing"
                      d={BIRD_PATH}
                      style={{ animationDelay: `${-i * 0.3}s` }}
                    />
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  )
}
