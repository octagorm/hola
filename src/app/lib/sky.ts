// The time of day and the moon, from the player's own clock, for the
// painted scene at the top of the home page (sky.tsx): which of its four
// paintings to show, and where the moon is and how much of it is lit.
// After Tian's ornament/sky.ts.

export type Period = 'dawn' | 'day' | 'dusk' | 'night'

export const PERIODS: ReadonlyArray<Period> = ['dawn', 'day', 'dusk', 'night']

// The paintings' layout, in shares of their width and height, which the
// prompts (data/home-prompts.ts) describe to the painter and the page
// draws by. Each is painted 3:2 and kept whole.
export const SCENE = {
  width: 1536,
  height: 1024,
  // The point kept in view when the picture is cropped to its box
  focus: { x: 0.5, y: 0.51 },
  // On a phone the strip shows only the middle of the picture, this share
  // of its width, so the riders and the mills are not too small
  narrowSpan: 0.72,
  // The band of open sky where the moon travels, rising at the left (east,
  // looking south over the plain) and setting at the right; over the
  // mills it keeps above their sails
  moon: { y0: 0.26, y1: 0.47 },
  // Where stars may shine and clouds drift: sky only, above the mills
  stars: { y0: 0.04, y1: 0.37 },
  clouds: { y0: 0.23, y1: 0.35 },
  // Where the riders are, and the ridge of windmills, as the day painting
  // has them, for the prompts of the others
  riders: { x0: 0.31, x1: 0.42, y0: 0.58, y1: 0.71 },
  mills: { x0: 0.55, x1: 0.96, top: 0.37, ridge: 0.51 },
  // The far horizon, left of the ridge
  horizon: 0.55,
} as const

// How the picture is fitted to a box of bw × bh pixels: scaled to cover
// it, showing at most `span` of its width, and cropped around the focus.
// Gives the scale, where the picture's top left corner goes, and the part
// of it in view, in the picture's pixels.
export function cropOf(bw: number, bh: number, span = 1) {
  const { width: W, height: H, focus } = SCENE
  const scale = Math.max(bw / (W * span), bh / H)
  const sw = W * scale
  const sh = H * scale
  const left = Math.min(0, Math.max(bw - sw, bw / 2 - focus.x * sw))
  const top = Math.min(0, Math.max(bh - sh, bh / 2 - focus.y * sh))
  const view: Rect = {
    x0: -left / scale,
    y0: -top / scale,
    x1: (bw - left) / scale,
    y1: (bh - top) / scale,
  }
  return { scale, left, top, width: sw, height: sh, view }
}

// Degrees north. The player's place is not asked for: Hola is for
// Norwegians, so Oslo's latitude, which is fair for the rest of the north
const LATITUDE = 60

const DAY_MS = 86_400_000

// Sunrise and sunset, in minutes after local midnight
export function sunTimes(d: Date): { rise: number; set: number } {
  const start = new Date(d.getFullYear(), 0, 1)
  const day = Math.floor((d.getTime() - start.getTime()) / DAY_MS) + 1
  const decl =
    ((-23.44 * Math.PI) / 180) * Math.cos(((2 * Math.PI) / 365) * (day + 10))
  const phi = (LATITUDE * Math.PI) / 180
  // The sun's centre 0.83° below the horizon: its disc and refraction
  const cosH =
    (Math.sin((-0.83 * Math.PI) / 180) - Math.sin(phi) * Math.sin(decl)) /
    (Math.cos(phi) * Math.cos(decl))
  const half = (Math.acos(Math.max(-1, Math.min(1, cosH))) * 720) / Math.PI
  // Noon by the sun is about 12:20 on a standard-time clock in Norway, an
  // hour later in summer time
  const jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset()
  const summerTime = d.getTimezoneOffset() < Math.max(jan, jul)
  const noon = 12 * 60 + 20 + (summerTime ? 60 : 0)
  return { rise: noon - half, set: noon + half }
}

const minuteOf = (d: Date) =>
  d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60

// Which of the four paintings to show, as weights adding up to one: one
// painting most of the time, two crossfading around sunrise and sunset
export function periods(d: Date): Array<[Period, number]> {
  const m = minuteOf(d)
  const { rise, set } = sunTimes(d)
  const keys: Array<[number, Period]> = [
    [rise - 80, 'night'],
    [rise - 45, 'dawn'],
    [rise + 35, 'dawn'],
    [rise + 80, 'day'],
    [set - 85, 'day'],
    [set - 40, 'dusk'],
    [set + 30, 'dusk'],
    [set + 70, 'night'],
  ]
  if (m <= keys[0][0] || m >= keys[keys.length - 1][0]) return [['night', 1]]
  for (let i = 0; i < keys.length - 1; i++) {
    const [m0, a] = keys[i]
    const [m1, b] = keys[i + 1]
    if (m >= m0 && m < m1) {
      if (a === b) return [[a, 1]]
      const k = (m - m0) / (m1 - m0)
      // Eased, so neither painting lingers half-seen
      const e = k * k * (3 - 2 * k)
      return [
        [a, 1 - e],
        [b, e],
      ]
    }
  }
  return [['day', 1]]
}

export const weightOf = (ws: Array<[Period, number]>, p: Period) =>
  ws.find(([q]) => q === p)?.[1] ?? 0

// A value for each time of day, blended by the weights
export const blend = (
  ws: Array<[Period, number]>,
  table: Record<Period, number>,
) => ws.reduce((s, [p, w]) => s + table[p] * w, 0)

// The same for colours (#rrggbb)
export function blendColour(
  ws: Array<[Period, number]>,
  table: Record<Period, string>,
): string {
  const rgb = [0, 0, 0]
  for (const [p, w] of ws) {
    const n = parseInt(table[p].slice(1), 16)
    rgb[0] += (n >> 16) * w
    rgb[1] += ((n >> 8) & 255) * w
    rgb[2] += (n & 255) * w
  }
  return `#${rgb
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

const SYNODIC = 29.530588853

// The moon's age as a share of its month (0 new, 0.5 full) and how much
// of its face is lit
export function moon(d: Date): { phase: number; lit: number } {
  // A new moon: 6 January 2000, 18:14 UTC
  const days = (d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / DAY_MS
  const phase = (((days / SYNODIC) % 1) + 1) % 1
  return { phase, lit: (1 - Math.cos(phase * 2 * Math.PI)) / 2 }
}

// Hours from the moon's highest point, near enough: it lags the sun by its
// age, so a full moon is highest at midnight by the sun and a first
// quarter at six in the evening, and it is up for about six hours either
// side (its own seasons left out). From -12 to 12; up between -6 and 6.
export function moonHour(d: Date): number {
  const { rise, set } = sunTimes(d)
  const noon = (rise + set) / 2
  const h = (minuteOf(d) - noon) / 60 - moon(d).phase * 24
  return ((((h + 12) % 24) + 24) % 24) - 12
}

// The lit part of the moon, as an SVG path around (0, 0) with radius r:
// lit on the right while waxing, on the left while waning, as seen from
// the north. Empty at new moon.
export function moonPath(phase: number, r: number): string {
  const edge = Math.cos(2 * Math.PI * phase)
  if (edge > 0.999) return ''
  const waxing = phase < 0.5
  // The terminator is half an ellipse, bulging towards the lit side while
  // a crescent and away from it once more than half is lit
  const rx = Math.abs(edge) * r
  const f = (n: number) => Number(n.toFixed(2))
  const out = waxing ? 1 : 0
  const back = edge > 0 === waxing ? 0 : 1
  return `M0 ${f(-r)}A${f(r)} ${f(r)} 0 0 ${out} 0 ${f(r)}A${f(rx)} ${f(r)} 0 0 ${back} 0 ${f(-r)}Z`
}

export interface Rect {
  x0: number
  y0: number
  x1: number
  y1: number
}

// Where to draw the moon, in the picture's pixels, or null when it is
// down or there is no room: along an arc in the moon's band, across the
// part of it that is in view and not behind the page's title, low at
// either end and highest at the middle. `view` is the part of the picture
// in view, `avoid` what the page lays over it, r the moon's radius.
export function moonPlace(
  hour: number,
  view: Rect,
  avoid: ReadonlyArray<Rect>,
  r: number,
): { x: number; y: number } | null {
  if (Math.abs(hour) >= 6) return null
  // room for its halo
  const pad = r * 1.6
  const band = {
    x0: view.x0 + pad,
    x1: view.x1 - pad,
    y0: Math.max(view.y0 + pad, SCENE.moon.y0 * SCENE.height + r),
    y1: Math.min(view.y1 - pad, SCENE.moon.y1 * SCENE.height - r),
  }
  const grown = avoid.map((a) => ({
    x0: a.x0 - pad,
    x1: a.x1 + pad,
    y0: a.y0 - pad,
    y1: a.y1 + pad,
  }))
  // What covers the band's height (the title) narrows it from its side
  const mid = (band.x0 + band.x1) / 2
  for (const a of grown) {
    const over = Math.min(a.y1, band.y1) - Math.max(a.y0, band.y0)
    if (over < (band.y1 - band.y0) * 0.6 || a.x1 < band.x0 || a.x0 > band.x1)
      continue
    if ((a.x0 + a.x1) / 2 < mid) band.x0 = Math.max(band.x0, a.x1)
    else band.x1 = Math.min(band.x1, a.x0)
  }
  if (band.x1 - band.x0 < r * 2 || band.y1 < band.y0) return null
  const x = band.x0 + ((hour + 6) / 12) * (band.x1 - band.x0)
  const high = Math.cos((hour / 6) * (Math.PI / 2))
  let y = band.y1 - high * (band.y1 - band.y0)
  // Over the mills, above their sails, or not at all if that is out of view
  const { mills } = SCENE
  if (x > mills.x0 * SCENE.width - r && x < mills.x1 * SCENE.width + r) {
    y = Math.min(y, mills.top * SCENE.height - r)
    if (y < band.y0) return null
  }
  // Smaller things in the way (the buttons): passed below, or above
  for (const a of grown) {
    if (x < a.x0 || x > a.x1 || y < a.y0 || y > a.y1) continue
    if (a.y1 <= band.y1) y = a.y1
    else if (a.y0 >= band.y0) y = a.y0
    else return null
  }
  return { x, y }
}

// How visible the moon is near the horizon: it fades in as it rises and
// out as it sets
export const moonRising = (hour: number) =>
  Math.max(0, Math.min(1, (6 - Math.abs(hour)) / 0.75))

// For trying the scene at another time: ?time=21:30 or
// ?date=2027-02-06&time=20:00. Without either, the real clock.
export function clockFrom(search: string): () => Date {
  const q = new URLSearchParams(search)
  const time = q.get('time')
  const date = q.get('date')
  if (!time && !date) return () => new Date()
  return () => {
    const d = date ? new Date(`${date}T12:00:00`) : new Date()
    if (Number.isNaN(d.getTime())) return new Date()
    if (time) {
      const [h, m] = time.split(':').map(Number)
      d.setHours(h || 0, m || 0, 0, 0)
    }
    return d
  }
}
