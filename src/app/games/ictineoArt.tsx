import type { ReactNode } from 'react'
import type { Action, Danger, Sight, VoyageId } from '../data/ictineo'
import type { Boat } from '../lib/ictineo'

// El Ictíneo as a wood engraving of the 1860s, coloured by hand: a sepia
// line cut fine, hatching for shade, and washes of muted colour laid on a
// little off the line, on warm paper. The boat is seen from its side, cut
// away to show the crew at their stations; behind it the harbour, under it
// a green sea that darkens with depth. Everything is drawn in one picture
// of 1600 × 600, the surface of the sea at y 150, the boat at x 600.

export const INK = '#2a2017'
export const PAPER = '#f1e6cb'

const C = {
  sky: '#e6dec2',
  cloud: '#f3ecd6',
  sea: '#86a99a',
  seaL: '#a9c3b2',
  seaD: '#557c6f',
  deep: '#33544c',
  wood: '#b98a55',
  woodL: '#d8b680',
  woodD: '#7c5532',
  inner: '#e6cfa3',
  copper: '#b8683a',
  copperL: '#d8925e',
  brass: '#c9a24a',
  coat: '#3e4c5c',
  coat2: '#5d4a38',
  shirt: '#f1e8d2',
  skin: '#dfb08a',
  stone: '#cfc1a0',
  stoneD: '#a6977a',
  hill: '#bdb48e',
  hillD: '#a09670',
  roof: '#c0704a',
  wall: '#e9dcbc',
  coral: '#c64f38',
  weed: '#6f8a4f',
  weedD: '#4c6838',
  sand: '#d6c69c',
  red: '#b23a2e',
  green: '#3f7a4e',
  lamp: '#f6d77e',
  night: '#141f26',
}

// Where things are in the picture
export const W = 1600
export const H = 600
export const SURFACE = 150
export const BOAT_X = 600
// The boat's middle at each depth, and its size and shift for each lane
// (to port it is further off, to starboard nearer)
export const DEPTH_Y = [158, 262, 360, 452]
export const LANE_SCALE = [0.86, 1, 1.13]
export const LANE_DY = [-16, 0, 16]
// The boat is drawn 300 long and shown a fifth bigger
export const BOAT_SCALE = 1.2
// Its bow, from its middle, and the tip of the claw for coral under it
export const BOW = 152 * BOAT_SCALE
export const CLAW = { x: 112, y: 88 }
// The middle of the coral's tops, in the coral bed's own drawing
export const CORAL_TOP = { x: 180, y: 486 }

// --- Small engravers' tools ---

// The same numbers every time, for scenery drawn by rule
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const f1 = (n: number) => Math.round(n * 10) / 10

// A shape cut in the block and coloured by hand: the paper inside its
// line, the colour laid on a little off it, and the line over both
function Cut({
  d,
  c,
  w = 2,
  o = 2.2,
  k = INK,
}: {
  d: string
  c?: string
  w?: number
  o?: number
  k?: string
}) {
  return (
    <>
      {c && <path d={d} fill={PAPER} />}
      {c && (
        <path d={d} fill={c} transform={`translate(${o} ${f1(o * 0.5)})`} />
      )}
      {w > 0 && (
        <path
          d={d}
          fill="none"
          stroke={k}
          strokeWidth={w}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </>
  )
}

function Ln({
  d,
  w = 1.4,
  k = INK,
  o,
}: {
  d: string
  w?: number
  k?: string
  o?: number
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={k}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={o}
    />
  )
}

// The shade of a shape, hatched
function Hatch({
  d,
  o = 0.7,
  id = 'ic-hatch',
}: {
  d: string
  o?: number
  id?: string
}) {
  return <path d={d} fill={`url(#${id})`} opacity={o} />
}

// The patterns every picture of the game draws on, once on the page
export function IctineoDefs() {
  return (
    <svg className="ic-defs" aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id="ic-hatch"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-40)"
        >
          <line x1="0" y1="0" x2="0" y2="5" stroke={INK} strokeWidth="1.1" />
        </pattern>
        <pattern
          id="ic-hatch-f"
          width="3.4"
          height="3.4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-40)"
        >
          <line x1="0" y1="0" x2="0" y2="3.4" stroke={INK} strokeWidth="0.8" />
        </pattern>
        <pattern
          id="ic-cross"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-40)"
        >
          <path d="M0 0V5M0 0H5" stroke={INK} strokeWidth="0.9" />
        </pattern>
        <pattern
          id="ic-lines"
          width="40"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 3.5Q10 2.6 20 3.5T40 3.5"
            fill="none"
            stroke={INK}
            strokeWidth="0.9"
          />
        </pattern>
        <pattern
          id="ic-sky"
          width="60"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 3H60" stroke={INK} strokeWidth="0.7" />
        </pattern>
        <pattern
          id="ic-mesh"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path d="M0 0V12M0 0H12" stroke={INK} strokeWidth="1.1" />
        </pattern>
        <pattern
          id="ic-dots"
          width="9"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="0.9" fill={INK} />
          <circle cx="6.5" cy="5.5" r="0.7" fill={INK} />
        </pattern>
        <linearGradient id="ic-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.seaL} />
          <stop offset=".35" stopColor={C.sea} />
          <stop offset=".75" stopColor={C.seaD} />
          <stop offset="1" stopColor={C.deep} />
        </linearGradient>
        <linearGradient id="ic-sea-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d5a57" />
          <stop offset="1" stopColor="#14262a" />
        </linearGradient>
        <linearGradient id="ic-sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2a35" />
          <stop offset="1" stopColor="#3b4a52" />
        </linearGradient>
        <linearGradient id="ic-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAPER} stopOpacity=".55" />
          <stop offset="1" stopColor={PAPER} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ic-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.lamp} stopOpacity=".95" />
          <stop offset=".55" stopColor={C.lamp} stopOpacity=".45" />
          <stop offset="1" stopColor={C.lamp} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ic-beam-m" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset=".7" stopColor="#000" stopOpacity=".75" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ic-moon" cx=".5" cy=".5" r=".5">
          <stop offset=".6" stopColor="#fbf3d4" stopOpacity=".55" />
          <stop offset="1" stopColor="#fbf3d4" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// --- The sky and the land behind ---

function Clouds({ seed, night = false }: { seed: number; night?: boolean }) {
  const r = rng(seed)
  const clouds = Array.from({ length: 5 }, () => {
    const x = r() * 1500
    const y = 18 + r() * 60
    const w = 120 + r() * 200
    const rows = 3 + Math.floor(r() * 3)
    return { x, y, w, rows }
  })
  return (
    <g opacity={night ? 0.25 : 0.55}>
      {clouds.map((c, i) => (
        <g key={i}>
          <path
            d={`M${f1(c.x)} ${f1(c.y + 18)}q${f1(c.w * 0.2)} -26 ${f1(c.w * 0.45)} -14q${f1(c.w * 0.25)} -20 ${f1(c.w * 0.55)} 8z`}
            fill={night ? '#46545c' : C.cloud}
          />
          {Array.from({ length: c.rows }, (_, k) => (
            <path
              key={k}
              d={`M${f1(c.x + 20 + k * 9)} ${f1(c.y + 4 + k * 5)}h${f1(c.w * 0.75 - k * 18)}`}
              stroke={night ? '#9aa6a8' : INK}
              strokeWidth="0.8"
              opacity=".7"
            />
          ))}
        </g>
      ))}
    </g>
  )
}

// A row of houses along the water, with a few windows and roofs of tile
function Houses({
  x0,
  x1,
  base,
  seed,
  tall = 40,
  lit = false,
}: {
  x0: number
  x1: number
  base: number
  seed: number
  tall?: number
  lit?: boolean
}) {
  const r = rng(seed)
  const houses: Array<{ x: number; w: number; h: number }> = []
  for (let x = x0; x < x1;) {
    const w = 26 + r() * 34
    houses.push({ x, w, h: tall * (0.45 + r() * 0.75) })
    x += w + (r() < 0.2 ? 6 : 0)
  }
  return (
    <g>
      {houses.map((h, i) => {
        const top = base - h.h
        const body = `M${f1(h.x)} ${base}V${f1(top)}H${f1(h.x + h.w)}V${base}Z`
        const roof = `M${f1(h.x - 2)} ${f1(top)}L${f1(h.x + h.w / 2)} ${f1(top - 9)}L${f1(h.x + h.w + 2)} ${f1(top)}Z`
        return (
          <g key={i}>
            <Cut d={body} c={lit ? '#2b3439' : C.wall} w={1.1} o={1.2} />
            <Cut d={roof} c={lit ? '#252c30' : C.roof} w={1.1} o={1} />
            {Array.from({ length: Math.floor(h.h / 14) }, (_, k) => (
              <rect
                key={k}
                x={f1(h.x + h.w * 0.3)}
                y={f1(top + 6 + k * 13)}
                width="4"
                height="6"
                fill={lit ? (k % 2 ? C.lamp : '#2b3439') : INK}
                opacity={lit ? 0.9 : 0.75}
              />
            ))}
            {!lit && (
              <Hatch
                d={`M${f1(h.x + h.w * 0.7)} ${base}V${f1(top)}H${f1(h.x + h.w)}V${base}Z`}
                o={0.45}
              />
            )}
          </g>
        )
      })}
    </g>
  )
}

// Montjuïc with its castle, over Barcelona's harbour
function Barcelona({ night = false }: { night?: boolean }) {
  const hill =
    'M120 150C200 130 260 92 360 72C420 60 470 48 540 50C610 52 660 70 720 96C780 120 860 138 960 150Z'
  return (
    <g>
      <Cut d={hill} c={night ? '#25313a' : C.hill} w={1.6} />
      {!night && (
        <Hatch
          d="M540 50C610 52 660 70 720 96C780 120 860 138 960 150H700C640 120 600 80 540 50Z"
          o={0.4}
        />
      )}
      {/* The castle on the top */}
      <Cut
        d="M470 54V38H486V44H500V36H520V44H534V38H556V54Z"
        c={night ? '#1f2a31' : C.stoneD}
        w={1.3}
        o={1}
      />
      <Ln d="M478 38V34M548 38V34" w={1.2} />
      {/* The city along the water, and the two towers of Santa Maria */}
      <Houses x0={880} x1={1580} base={150} seed={4} lit={night} />
      <Cut
        d="M1090 150V84L1096 74L1102 84V150ZM1124 150V88L1130 78L1136 88V150Z"
        c={night ? '#232d33' : C.stone}
        w={1.2}
        o={1}
      />
      <Ln d="M1090 104H1102M1124 106H1136" w={1} />
      {/* The breakwater */}
      <Cut
        d="M0 150V136L60 134L320 138L330 150Z"
        c={night ? '#2a3238' : C.stone}
        w={1.4}
      />
      <Ln
        d="M20 141H300M60 136V150M120 137V150M180 137V150M240 138V150"
        w={0.9}
        o={0.7}
      />
    </g>
  )
}

// The cape: rocks to the sea, the lighthouse on top, and far off the white
// houses of Cadaqués under their church
function Creus() {
  return (
    <g>
      <Cut
        d="M60 150C120 132 170 120 230 118C290 116 330 128 380 150Z"
        c={C.hill}
        w={1.4}
      />
      <Houses x0={150} x1={330} base={150} seed={11} tall={26} />
      <Cut d="M226 150V96L234 84L242 96V150Z" c={C.wall} w={1.2} o={1} />
      <Cut
        d="M860 150C900 120 940 112 980 96C1030 76 1060 70 1100 52C1140 34 1180 30 1230 36C1290 42 1330 30 1380 40C1440 52 1500 80 1560 100L1600 106V150Z"
        c={C.hillD}
        w={1.8}
      />
      <Hatch
        d="M980 96C1030 76 1060 70 1100 52C1140 34 1180 30 1230 36L1180 150H900C920 130 950 110 980 96Z"
        o={0.55}
      />
      <Ln
        d="M1000 120L1040 108M1060 132L1110 112M1240 92L1300 80M1320 120L1390 100M1420 130L1480 116"
        w={1}
        o={0.6}
      />
      {/* The lighthouse */}
      <g className="ic-faro">
        <Cut d="M1228 38V10H1244V38Z" c={C.wall} w={1.4} o={1} />
        <Cut d="M1224 10L1236 0L1248 10Z" c={C.roof} w={1.2} o={1} />
        <Cut d="M1246 38V24H1268V38Z" c={C.wall} w={1.2} o={1} />
        <circle
          className="glint"
          cx="1236"
          cy="6"
          r="14"
          fill={C.lamp}
          opacity="0"
        />
      </g>
    </g>
  )
}

// Mount Benacantil and the castle of Santa Bárbara over Alicante, in a
// grey sky and a high sea
function Alicante() {
  return (
    <g>
      <Cut
        d="M640 150C700 140 760 120 820 104C880 88 900 60 930 44C960 30 990 26 1020 34C1060 44 1080 70 1120 92C1170 118 1240 136 1340 150Z"
        c={C.hillD}
        w={1.6}
      />
      <Hatch
        d="M1020 34C1060 44 1080 70 1120 92C1170 118 1240 136 1340 150H1060C1040 110 1030 70 1020 34Z"
        o={0.5}
      />
      <Cut
        d="M928 44V30H946V36H966V26H990V36H1006V32H1024V46Z"
        c={C.stoneD}
        w={1.2}
        o={1}
      />
      <Houses x0={420} x1={940} base={150} seed={23} tall={34} />
      {[460, 600, 760].map((x) => (
        <g key={x}>
          <Ln d={`M${x} 150C${x + 2} 130 ${x - 2} 116 ${x + 4} 100`} w={1.6} />
          <Ln
            d={`M${x + 4} 100C${x - 10} 96 ${x - 18} 104 ${x - 22} 110M${x + 4} 100C${x + 16} 94 ${x + 24} 102 ${x + 28} 108M${x + 4} 100C${x - 4} 90 ${x - 14} 88 ${x - 20} 92M${x + 4} 100C${x + 12} 90 ${x + 22} 90 ${x + 26} 94`}
            w={1.4}
            k={C.weedD}
          />
        </g>
      ))}
      {/* The pier, the sea breaking over it */}
      <Cut d="M0 150V128L300 126L316 150Z" c={C.stone} w={1.4} />
      <Ln d="M20 134H290M80 128V150M150 127V150M220 127V150" w={0.9} o={0.7} />
      <path
        className="ic-spray"
        d="M240 126C250 100 268 92 280 104C290 90 306 92 308 110C318 104 330 112 322 126Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1.1"
      />
    </g>
  )
}

function Night() {
  const r = rng(31)
  const stars = Array.from({ length: 70 }, () => ({
    x: r() * W,
    y: r() * 120,
    s: 0.6 + r() * 1.4,
  }))
  return (
    <g>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={f1(s.x)}
          cy={f1(s.y)}
          r={f1(s.s)}
          fill="#f2ead2"
          opacity=".8"
        />
      ))}
      <g className="ic-luna">
        <circle cx="1250" cy="56" r="60" fill="url(#ic-moon)" />
        <circle
          cx="1250"
          cy="56"
          r="24"
          fill="#f6efd4"
          stroke="#cfc6a6"
          strokeWidth="1.2"
        />
        <path
          d="M1240 46a5 5 0 1 0 1 0zM1258 62a3.5 3.5 0 1 0 1 0z"
          fill="#ddd2ae"
        />
        <circle
          className="glint"
          cx="1250"
          cy="56"
          r="34"
          fill="none"
          stroke="#f6efd4"
          strokeWidth="2"
          opacity="0"
        />
      </g>
      <Barcelona night />
    </g>
  )
}

// Ships at anchor in the harbour, a tile of the picture's width, drawn
// twice and moved past as the boat goes
function Masts({ voyage }: { voyage: VoyageId }) {
  const night = voyage === 'noche'
  const ships =
    voyage === 'creus'
      ? []
      : voyage === 'alicante'
        ? [{ x: 1180, s: 0.9 }]
        : [
            { x: 250, s: 1 },
            { x: 1040, s: 0.8 },
            { x: 1420, s: 1.1 },
          ]
  return (
    <g>
      {ships.map((sh, i) => (
        <g key={i} transform={`translate(${sh.x} ${SURFACE}) scale(${sh.s})`}>
          <Cut
            d="M-70 -14H74L60 4H-60Z"
            c={night ? '#232b30' : C.woodD}
            w={1.5}
            o={1.2}
          />
          <Ln
            d="M-30 -14V-118M26 -14V-104M-30 -96H-2M-30 -70H6M26 -84H48M26 -60H54"
            w={1.5}
          />
          <Ln
            d="M-30 -118L-70 -14M-30 -118L26 -104M26 -104L74 -14M-30 -100L-62 -40"
            w={0.7}
            o={0.8}
          />
          {!night && (
            <>
              <path
                d="M-28 -94H-6Q-10 -84 -28 -86Z"
                fill={C.cloud}
                stroke={INK}
                strokeWidth="0.9"
              />
              <path
                d="M28 -82H46Q42 -74 28 -76Z"
                fill={C.cloud}
                stroke={INK}
                strokeWidth="0.9"
              />
            </>
          )}
        </g>
      ))}
      {voyage === 'creus' &&
        [180, 760, 1300].map((x, i) => (
          <g key={x}>
            <Cut
              d={`M${x} ${SURFACE + 4}L${x + 14} ${SURFACE - 30 - i * 6}L${x + 34} ${SURFACE - 40 - i * 4}L${x + 52} ${SURFACE - 18}L${x + 70} ${SURFACE + 4}Z`}
              c={C.stoneD}
              w={1.5}
            />
            <Hatch
              d={`M${x + 34} ${SURFACE - 40 - i * 4}L${x + 52} ${SURFACE - 18}L${x + 70} ${SURFACE + 4}H${x + 34}Z`}
              o={0.6}
            />
          </g>
        ))}
    </g>
  )
}

export function Backdrop({ voyage }: { voyage: VoyageId }) {
  const night = voyage === 'noche'
  return (
    <g className="ic-back">
      <rect
        width={W}
        height={SURFACE + 2}
        fill={night ? 'url(#ic-sky-night)' : C.sky}
      />
      {!night && (
        <rect width={W} height={SURFACE} fill="url(#ic-sky)" opacity=".18" />
      )}
      <Clouds seed={voyage === 'alicante' ? 41 : 7} night={night} />
      {voyage === 'alicante' && (
        <path
          d="M0 0H1600V60C1400 74 1200 50 1000 66C800 82 500 54 300 70C180 78 80 66 0 72Z"
          fill="#9aa0a0"
          opacity=".35"
        />
      )}
      <g className="ic-land">
        {voyage === 'barcelona' && <Barcelona />}
        {voyage === 'creus' && <Creus />}
        {voyage === 'alicante' && <Alicante />}
        {night && <Night />}
      </g>
    </g>
  )
}

export function MastLayer({ voyage }: { voyage: VoyageId }) {
  return (
    <g className="ic-scroll ic-mid">
      <Masts voyage={voyage} />
      <g transform={`translate(${W} 0)`}>
        <Masts voyage={voyage} />
      </g>
    </g>
  )
}

// --- The sea ---

export function Sea({ voyage }: { voyage: VoyageId }) {
  const night = voyage === 'noche'
  const rays = [140, 420, 700, 980, 1260]
  return (
    <g className="ic-sea">
      <rect
        y={SURFACE}
        width={W}
        height={H - SURFACE}
        fill={night ? 'url(#ic-sea-night)' : 'url(#ic-sea)'}
      />
      <rect
        y={SURFACE}
        width={W}
        height="130"
        fill="url(#ic-lines)"
        opacity=".16"
      />
      <rect
        y={SURFACE + 130}
        width={W}
        height="150"
        fill="url(#ic-lines)"
        opacity=".24"
      />
      <rect
        y={SURFACE + 280}
        width={W}
        height={H - SURFACE - 280}
        fill="url(#ic-lines)"
        opacity=".32"
      />
      {!night &&
        rays.map((x) => (
          <path
            key={x}
            d={`M${x} ${SURFACE}L${x + 60} ${SURFACE}L${x - 80} ${H}L${x - 150} ${H}Z`}
            fill="url(#ic-ray)"
            opacity=".35"
          />
        ))}
    </g>
  )
}

// The waterline in front: the crests of the little waves, a tile drawn
// twice; at Alicante a high sea
export function Waves({ rough = false }: { rough?: boolean }) {
  const tile = (dx: number) => {
    const n = rough ? 10 : 20
    const step = W / n
    let d = `M${dx} ${SURFACE}`
    for (let i = 0; i < n; i++) {
      const x = dx + i * step
      d += rough
        ? `Q${f1(x + step * 0.3)} ${SURFACE - 22} ${f1(x + step * 0.5)} ${SURFACE - 8}T${f1(x + step)} ${SURFACE}`
        : `Q${f1(x + step / 4)} ${SURFACE - 5} ${f1(x + step / 2)} ${SURFACE}T${f1(x + step)} ${SURFACE}`
    }
    return d
  }
  return (
    <g className="ic-scroll ic-near ic-waves">
      {[0, W].map((dx) => (
        <g key={dx}>
          <path
            d={`${tile(dx)}V${SURFACE + 14}H${dx}Z`}
            fill={C.seaL}
            opacity=".55"
          />
          <path d={tile(dx)} fill="none" stroke={INK} strokeWidth="1.6" />
          <path
            d={tile(dx)}
            fill="none"
            stroke={INK}
            strokeWidth="0.8"
            transform="translate(14 7)"
            opacity=".45"
          />
        </g>
      ))}
    </g>
  )
}

// Rocks far off under water, hazy
export function FarRocks() {
  const tile = (dx: number) => {
    const r = rng(17)
    let d = ''
    for (let i = 0; i < 6; i++) {
      const x = dx + i * 270 + r() * 80
      const h = 60 + r() * 120
      const w = 90 + r() * 120
      d += `M${f1(x)} ${H}C${f1(x + w * 0.1)} ${f1(H - h)} ${f1(x + w * 0.5)} ${f1(H - h - 20)} ${f1(x + w * 0.7)} ${f1(H - h * 0.7)}C${f1(x + w * 0.85)} ${f1(H - h * 0.4)} ${f1(x + w)} ${f1(H - 20)} ${f1(x + w)} ${H}Z`
    }
    return d
  }
  return (
    <g className="ic-scroll ic-far">
      <path d={tile(0) + tile(W)} fill={C.deep} opacity=".28" />
    </g>
  )
}

// The bottom near by: sand, stones and sea grass, a tile drawn twice
export function Seabed({ voyage }: { voyage: VoyageId }) {
  const tile = (dx: number, seed: number) => {
    const r = rng(seed)
    const stones = Array.from({ length: 7 }, (_, i) => ({
      x: dx + i * 230 + r() * 120,
      w: 50 + r() * 70,
      h: 22 + r() * 30,
    }))
    const grass = Array.from({ length: 16 }, (_, i) => ({
      x: dx + i * 100 + r() * 60,
      h: 40 + r() * 60,
      lean: -14 + r() * 28,
    }))
    let ground = `M${dx} ${H}V${H - 44}`
    for (let i = 1; i <= 8; i++)
      ground += `Q${f1(dx + i * 200 - 100)} ${f1(H - 54 + r() * 18)} ${dx + i * 200} ${f1(H - 44 + r() * 8)}`
    ground += `V${H}Z`
    return { stones, grass, ground }
  }
  const tiles = [tile(0, 5), tile(W, 5)]
  const muddy = voyage === 'alicante'
  return (
    <g className="ic-scroll ic-near">
      {tiles.map((t, k) => (
        <g key={k}>
          <Cut d={t.ground} c={muddy ? '#b9a97e' : C.sand} w={1.4} />
          <path d={t.ground} fill="url(#ic-dots)" opacity=".35" />
          {t.grass.map((g, i) => (
            <Ln
              key={i}
              d={`M${f1(g.x)} ${H - 40}q${f1(g.lean)} ${f1(-g.h / 2)} ${f1(g.lean * 0.4)} ${f1(-g.h)}M${f1(g.x + 6)} ${H - 40}q${f1(g.lean * 0.6)} ${f1(-g.h / 3)} ${f1(g.lean + 6)} ${f1(-g.h * 0.75)}`}
              w={2.2}
              k={i % 3 ? C.weedD : C.weed}
            />
          ))}
          {t.stones.map((s, i) => {
            const d = `M${f1(s.x)} ${H - 30}C${f1(s.x)} ${f1(H - 30 - s.h)} ${f1(s.x + s.w)} ${f1(H - 30 - s.h)} ${f1(s.x + s.w)} ${H - 30}Z`
            return (
              <g key={i}>
                <Cut d={d} c={C.stoneD} w={1.4} />
                <Hatch
                  d={`M${f1(s.x + s.w * 0.5)} ${f1(H - 30 - s.h * 0.75)}C${f1(s.x + s.w)} ${f1(H - 30 - s.h)} ${f1(s.x + s.w)} ${H - 30} ${f1(s.x + s.w)} ${H - 30}H${f1(s.x + s.w * 0.55)}Z`}
                  o={0.6}
                />
              </g>
            )
          })}
        </g>
      ))}
    </g>
  )
}

// --- The boat ---

// The outer hull, a fish of wood: the bow to the right, the propeller in
// the tail to the left
const HULL =
  'M152 2C152 -34 122 -56 58 -60C0 -63 -70 -54 -118 -28C-132 -20 -140 -12 -144 -6L-144 10C-140 16 -132 24 -118 32C-70 58 0 64 58 62C122 58 152 38 152 2Z'
// Where the side is cut away to show the crew
const OPEN =
  'M-96 -18C-96 -36 -82 -46 -62 -46H94C110 -46 120 -34 120 -16V20C120 28 114 32 104 32H-82C-92 32 -96 28 -96 20Z'

// A man of the crew, sitting or standing, his arms where his work is
function Man({
  x,
  y,
  coat,
  stand = false,
  beard = false,
  arms,
  className,
}: {
  x: number
  y: number
  coat: string
  stand?: boolean
  beard?: boolean
  arms: string
  className?: string
}) {
  const legs = stand
    ? `M${x - 5} ${y + 22}L${x - 7} ${y + 46}M${x + 4} ${y + 22}L${x + 6} ${y + 46}`
    : `M${x - 4} ${y + 20}L${x + 10} ${y + 22}L${x + 12} ${y + 40}`
  return (
    <g className={className}>
      <Ln d={legs} w={5} k={C.coat2} />
      <Ln d={legs} w={1} />
      <Cut
        d={`M${x - 9} ${y + 24}C${x - 10} ${y + 8} ${x - 8} ${y - 2} ${x} ${y - 2}C${x + 8} ${y - 2} ${x + 10} ${y + 8} ${x + 9} ${y + 24}Z`}
        c={coat}
        w={1.3}
        o={1}
      />
      <Hatch
        d={`M${x + 2} ${y}C${x + 8} ${y} ${x + 10} ${y + 8} ${x + 9} ${y + 24}H${x + 2}Z`}
        o={0.5}
      />
      <g className="arms">
        <Ln d={arms} w={4.2} k={coat} />
        <Ln d={arms} w={0.9} />
      </g>
      <circle
        cx={x}
        cy={y - 9}
        r="7"
        fill={C.skin}
        stroke={INK}
        strokeWidth="1.2"
      />
      {beard && (
        <path
          d={`M${x - 6} ${y - 8}C${x - 6} ${y + 4} ${x + 6} ${y + 4} ${x + 6} ${y - 8}C${x + 3} ${y - 4} ${x - 3} ${y - 4} ${x - 6} ${y - 8}Z`}
          fill="#4a3a2c"
        />
      )}
      <path
        d={`M${x - 8} ${y - 12}C${x - 7} ${y - 19} ${x + 7} ${y - 19} ${x + 8} ${y - 12}Z`}
        fill={INK}
      />
    </g>
  )
}

export function Boat({
  boat,
  hits,
  tools,
  coralAt,
}: {
  boat: Boat
  hits: number
  tools: Array<string>
  // Coral gathered, to play the claw anew each time
  coralAt: number
}) {
  const spin = ['stop', 'slow', 'go', 'fast'][boat.speed]
  return (
    <g className={`ic-boat ${spin} ${boat.depth === 0 ? 'up' : 'down'}`}>
      {/* Bubbles, under way under water */}
      <g className="ic-bubbles" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={-150 - (i % 3) * 6}
            cy={4 - (i % 2) * 6}
            r={2 + (i % 3)}
            fill="none"
            stroke={PAPER}
            strokeWidth="1.2"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}
      </g>
      {/* The propeller in the tail, turning */}
      <g transform="translate(-150 2)">
        <g className="ic-prop">
          <Cut
            d="M0 0C-6 -10 -8 -26 -2 -30C4 -26 4 -10 0 0Z"
            c={C.brass}
            w={1.2}
            o={0.8}
          />
          <Cut
            d="M0 0C-6 10 -8 26 -2 30C4 26 4 10 0 0Z"
            c={C.brass}
            w={1.2}
            o={0.8}
          />
        </g>
        <circle r="3.5" fill={C.copper} stroke={INK} strokeWidth="1.1" />
      </g>
      {/* Fins: on the back, under the belly, and at the side to dive */}
      <Cut d="M-92 -44L-112 -66L-74 -52Z" c={C.woodD} w={1.3} o={1} />
      <Cut d="M-96 44L-118 64L-74 52Z" c={C.woodD} w={1.3} o={1} />
      {/* The hull */}
      <Cut d={HULL} c={C.wood} w={2.2} o={2} />
      <Hatch
        d="M152 2C152 38 122 58 58 62C0 64 -70 58 -118 32C-132 24 -140 16 -144 10V2Z"
        o={0.45}
      />
      {/* Planks and the iron bands round it */}
      <Ln
        d="M-136 16C-80 44 20 52 140 26M-130 -10C-70 -40 40 -48 146 -20M-100 40C-40 56 60 58 120 44"
        w={0.9}
        o={0.6}
      />
      <Ln
        d="M-60 -50C-66 -10 -66 30 -60 55M10 -61C6 -20 6 30 10 63M80 -58C84 -20 84 30 80 59"
        w={3.2}
        k={C.woodD}
      />
      <Ln
        d="M-60 -50C-66 -10 -66 30 -60 55M10 -61C6 -20 6 30 10 63M80 -58C84 -20 84 30 80 59"
        w={0.9}
      />
      {/* Cut away: the inner hull and the crew */}
      <path d={OPEN} fill={C.inner} />
      <Hatch
        d="M-96 -18C-96 -36 -82 -46 -62 -46H-30V32H-82C-92 32 -96 28 -96 20Z"
        o={0.35}
      />
      <Ln
        d="M-70 -46V32M-40 -46V32M-10 -46V32M20 -46V32M50 -46V32M80 -46V32M106 -44V32"
        w={0.8}
        o={0.45}
      />
      <Ln d="M-96 24H120" w={2.2} k={C.woodD} />
      {/* Copper tanks of air, and their pipes */}
      <Cut
        d="M-34 22V-14C-34 -22 -20 -22 -20 -14V22Z"
        c={C.copper}
        w={1.2}
        o={1}
      />
      <Cut
        d="M-18 22V-6C-18 -13 -6 -13 -6 -6V22Z"
        c={C.copperL}
        w={1.2}
        o={1}
      />
      <Ln d="M-27 -20V-34H40M-12 -12V-28" w={1.4} k={C.copper} />
      {/* The shaft to the propeller, and the crank */}
      <Ln d="M-150 2H-62" w={3} k={C.woodD} />
      <g transform="translate(-74 2)">
        <circle r="13" fill="none" stroke={INK} strokeWidth="1.4" />
        <g className="ic-crank">
          <Ln d="M0 0L0 -13" w={2.4} />
          <circle
            cx="0"
            cy="-13"
            r="2.4"
            fill={C.brass}
            stroke={INK}
            strokeWidth="0.8"
          />
        </g>
      </g>
      <Man
        className="ic-cranker"
        x={-52}
        y={-14}
        coat={C.coat}
        arms="M-56 -6L-66 -4L-72 -9"
        beard
      />
      <Man x={8} y={-12} coat={C.coat2} arms="M8 -4L-6 0L-14 -4" />
      {/* Monturiol, standing under the tower */}
      <Man
        x={46}
        y={-26}
        coat="#2f3a46"
        stand
        beard
        arms="M46 -18L58 -10L62 -24"
      />
      {/* The helmsman at the wheel, by the window in the bow */}
      <g transform="translate(108 -6)">
        <circle r="10" fill="none" stroke={INK} strokeWidth="1.6" />
        <Ln d="M-10 0H10M0 -10V10M-7 -7L7 7M7 -7L-7 7" w={1} />
      </g>
      <Man x={86} y={-12} coat={C.coat} arms="M88 -4L102 -6L106 -12" />
      {/* The window in the bow */}
      <circle
        cx="140"
        cy="-6"
        r="8"
        fill={C.seaL}
        stroke={C.brass}
        strokeWidth="3"
      />
      <circle cx="140" cy="-6" r="8" fill="none" stroke={INK} strokeWidth="1" />
      {/* The edge of the cut */}
      <path d={OPEN} fill="none" stroke={INK} strokeWidth="2" />
      <Ln
        d="M-96 -10L-100 -6L-96 0M120 -6L124 -2L120 4M-40 32L-36 36L-30 32M60 32L64 37L70 32"
        w={1.4}
      />
      {/* The tower, its windows and its hatch */}
      <Cut
        d="M24 -58V-84C24 -96 64 -96 64 -84V-58Z"
        c={C.copper}
        w={1.8}
        o={1.4}
      />
      <Hatch d="M48 -58V-90C58 -90 64 -88 64 -84V-58Z" o={0.5} />
      {[34, 44, 54].map((x) => (
        <circle
          key={x}
          cx={x}
          cy="-74"
          r="3.4"
          fill={C.seaL}
          stroke={INK}
          strokeWidth="1.1"
        />
      ))}
      <g className={`ic-hatch ${boat.hatch ? 'open' : ''}`}>
        <Cut
          d="M28 -92H60V-97C60 -101 28 -101 28 -97Z"
          c={C.brass}
          w={1.4}
          o={0.8}
        />
      </g>
      {/* The lamp in the bow, lit or not */}
      {tools.includes('lampara') && (
        <g className={`ic-lamp ${boat.lamp ? 'on' : ''}`}>
          <circle cx="150" cy="-26" r="13" fill={C.lamp} className="halo" />
          <Cut
            d="M142 -32H156V-20H142Z"
            c={boat.lamp ? C.lamp : C.brass}
            w={1.3}
            o={0.6}
          />
        </g>
      )}
      {/* The claw for coral, under the bow */}
      {tools.includes('coral') && (
        <g className="ic-claw" key={`c${coralAt}`}>
          <Ln d="M104 54L118 72L112 88" w={3} k={C.woodD} />
          <Ln d="M104 54L118 72L112 88M106 90L112 88L118 92" w={1.1} />
          {boat.coral > 0 && (
            <Ln
              d="M108 92L104 100M112 92L114 102M108 96L102 98"
              w={2}
              k={C.coral}
            />
          )}
        </g>
      )}
      {/* The anchor at the bow, and its chain once dropped */}
      {tools.includes('ancla') && (
        <g className={`ic-anchor ${boat.anchor ? 'down' : ''}`}>
          <g className="chain">
            <Ln d="M136 30V40" w={1.4} />
          </g>
          <g className="iron">
            <Ln d="M136 40V58M128 52C130 60 142 60 144 52M131 44H141" w={2.4} />
          </g>
        </g>
      )}
      {/* Knocks the hull has taken */}
      {hits > 0 && (
        <Ln d="M120 -40L128 -32L122 -26L130 -18" w={1.6} k="#5b2d1f" />
      )}
      {hits > 1 && <Ln d="M-20 40L-12 46L-18 52L-10 58" w={1.6} k="#5b2d1f" />}
    </g>
  )
}

// --- What comes at the boat ---

// A rock that rises from the bottom, its top at `top`; `w` wide
function Rock({
  top,
  w = 170,
  seed = 3,
}: {
  top: number
  w?: number
  seed?: number
}) {
  const r = rng(seed)
  const j = () => f1(-10 + r() * 20)
  const d = `M0 ${H}C${j()} ${f1(top + 120)} ${f1(w * 0.12)} ${f1(top + 40)} ${f1(w * 0.28)} ${f1(top + 10)}L${f1(w * 0.42)} ${f1(top + 18 + Number(j()))}L${f1(w * 0.55)} ${top}C${f1(w * 0.75)} ${f1(top + 20)} ${f1(w * 0.86)} ${f1(top + 70)} ${f1(w * 0.9)} ${f1(top + 140)}C${f1(w * 0.94)} ${f1(top + 220)} ${f1(w)} ${f1(H - 60)} ${f1(w)} ${H}Z`
  const shade = `M${f1(w * 0.55)} ${top}C${f1(w * 0.75)} ${f1(top + 20)} ${f1(w * 0.86)} ${f1(top + 70)} ${f1(w * 0.9)} ${f1(top + 140)}C${f1(w * 0.94)} ${f1(top + 220)} ${f1(w)} ${f1(H - 60)} ${f1(w)} ${H}H${f1(w * 0.6)}C${f1(w * 0.62)} ${f1(top + 200)} ${f1(w * 0.66)} ${f1(top + 60)} ${f1(w * 0.55)} ${top}Z`
  return (
    <g>
      <Cut d={d} c={C.stoneD} w={2} o={3} />
      <Hatch d={shade} o={0.65} />
      <Ln
        d={`M${f1(w * 0.2)} ${f1(top + 60)}l${f1(w * 0.12)} 16M${f1(w * 0.3)} ${f1(top + 130)}l${f1(w * 0.16)} 10M${f1(w * 0.18)} ${f1(top + 200)}l${f1(w * 0.1)} 22`}
        w={1}
        o={0.7}
      />
      <Ln
        d={`M${f1(w * 0.3)} ${f1(top + 12)}q-8 -16 -2 -30M${f1(w * 0.36)} ${f1(top + 14)}q6 -14 2 -26`}
        w={2.2}
        k={C.weed}
      />
    </g>
  )
}

// A fishing boat at the surface, and its net hanging down to `bottom`
function Net({ bottom }: { bottom: number }) {
  const net = `M10 ${SURFACE + 6}L190 ${SURFACE + 6}L170 ${bottom}L30 ${bottom}Z`
  return (
    <g>
      <path d={net} fill="url(#ic-mesh)" opacity=".85" />
      <Ln
        d={`M10 ${SURFACE + 6}L30 ${bottom}H170L190 ${SURFACE + 6}`}
        w={1.6}
      />
      {[30, 70, 110, 150, 170].map((x) => (
        <circle
          key={x}
          cx={x}
          cy={SURFACE + 6}
          r="4.5"
          fill={C.coral}
          stroke={INK}
          strokeWidth="1"
        />
      ))}
      {[40, 80, 120, 160].map((x) => (
        <rect
          key={x}
          x={x - 4}
          y={bottom - 2}
          width="8"
          height="8"
          fill={INK}
        />
      ))}
      <g transform={`translate(100 ${SURFACE})`}>
        <Cut d="M-80 -16H84L66 8H-64Z" c={C.woodD} w={1.6} />
        <Ln d="M-10 -16V-80M-10 -76L36 -20" w={1.6} />
        <path
          d="M-8 -76L30 -24H-8Z"
          fill={C.cloud}
          stroke={INK}
          strokeWidth="1.1"
        />
        <Man x={-46} y={-26} coat={C.coat2} arms="M-46 -18L-30 -10L-24 -4" />
      </g>
    </g>
  )
}

// A ship's hull going over, its keel down to `bottom`
function Keel({ bottom }: { bottom: number }) {
  const hull = `M0 ${SURFACE - 26}H440L410 ${SURFACE + 10}C380 ${bottom - 10} 320 ${bottom} 220 ${bottom}C120 ${bottom} 60 ${bottom - 10} 30 ${SURFACE + 10}Z`
  return (
    <g>
      <Cut d={hull} c="#4b3a2c" w={2} o={3} />
      <Hatch
        d={`M220 ${bottom}C320 ${bottom} 380 ${bottom - 10} 410 ${SURFACE + 10}L440 ${SURFACE - 26}H230Z`}
        o={0.6}
      />
      <Ln d={`M40 ${SURFACE + 4}H400M60 ${SURFACE + 24}H380`} w={1} o={0.6} />
      <Ln
        d={`M140 ${SURFACE - 26}V${SURFACE - 150}M300 ${SURFACE - 26}V${SURFACE - 140}`}
        w={2}
      />
      <Ln
        d={`M140 ${SURFACE - 150}L0 ${SURFACE - 26}M300 ${SURFACE - 140}L440 ${SURFACE - 26}`}
        w={0.8}
      />
    </g>
  )
}

// A breaking wave rolling in at the surface
function Wave() {
  const d = `M0 ${SURFACE + 20}C40 ${SURFACE + 10} 70 ${SURFACE - 40} 120 ${SURFACE - 80}C160 ${SURFACE - 110} 220 ${SURFACE - 110} 250 ${SURFACE - 80}C230 ${SURFACE - 92} 200 ${SURFACE - 86} 190 ${SURFACE - 66}C210 ${SURFACE - 60} 220 ${SURFACE - 40} 260 ${SURFACE - 10}C290 ${SURFACE + 8} 320 ${SURFACE + 16} 340 ${SURFACE + 20}Z`
  return (
    <g>
      <Cut d={d} c={C.seaL} w={2} o={3} />
      <Ln
        d={`M40 ${SURFACE + 6}C90 ${SURFACE - 30} 130 ${SURFACE - 80} 190 ${SURFACE - 96}M70 ${SURFACE + 8}C110 ${SURFACE - 20} 150 ${SURFACE - 60} 200 ${SURFACE - 70}M100 ${SURFACE + 12}C140 ${SURFACE - 10} 200 ${SURFACE - 30} 240 ${SURFACE - 30}`}
        w={1}
        o={0.8}
      />
      <path
        d={`M120 ${SURFACE - 80}C160 ${SURFACE - 110} 220 ${SURFACE - 110} 250 ${SURFACE - 80}C236 ${SURFACE - 86} 214 ${SURFACE - 86} 200 ${SURFACE - 74}C180 ${SURFACE - 90} 150 ${SURFACE - 90} 120 ${SURFACE - 80}Z`}
        fill={PAPER}
        stroke={INK}
        strokeWidth="1.2"
      />
    </g>
  )
}

// Something dark in the water ahead, not yet clear
function Shadow({ y }: { y: number }) {
  return (
    <g opacity=".75">
      <path
        d={`M0 ${y}C10 ${y - 70} 80 ${y - 90} 150 ${y - 60}C200 ${y - 40} 220 ${y + 30} 180 ${y + 70}C130 ${y + 100} 40 ${y + 90} 10 ${y + 50}Z`}
        fill={C.deep}
        opacity=".55"
      />
      <path
        d={`M0 ${y}C10 ${y - 70} 80 ${y - 90} 150 ${y - 60}C200 ${y - 40} 220 ${y + 30} 180 ${y + 70}C130 ${y + 100} 40 ${y + 90} 10 ${y + 50}Z`}
        fill="url(#ic-hatch-f)"
        opacity=".55"
      />
    </g>
  )
}

// The quay: stone blocks to the bottom, a bollard and a lantern on top
export function Quay() {
  const top = SURFACE - 40
  return (
    <g>
      <Cut d={`M0 ${top}H520V${H}H0Z`} c={C.stone} w={2.2} o={3} />
      <Hatch d={`M0 ${SURFACE}H520V${H}H0Z`} o={0.35} />
      {Array.from({ length: 12 }, (_, i) => (
        <Ln key={i} d={`M0 ${top + 18 + i * 38}H520`} w={1.1} o={0.7} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <Ln
          key={i}
          d={[0, 1, 2, 3, 4]
            .map(
              (k) =>
                `M${(k * 110 + (i % 2) * 55) % 520} ${top + 18 + i * 38}v38`,
            )
            .join('')}
          w={1}
          o={0.6}
        />
      ))}
      <Cut
        d={`M40 ${top}V${top - 18}C40 ${top - 26} 60 ${top - 26} 60 ${top - 18}V${top}Z`}
        c={C.woodD}
        w={1.4}
        o={1}
      />
      <Ln d={`M150 ${top}V${top - 80}M140 ${top - 80}H160`} w={2} />
      <Cut
        d={`M142 ${top - 98}H158V${top - 80}H142Z`}
        c={C.lamp}
        w={1.4}
        o={1}
      />
    </g>
  )
}

// What an order brings, drawn from its left edge, which reaches the bow
// when the order's time is up. `y` is where the boat was when it was
// given. Until it is close it is only something dark ahead (the shape
// shows with data-shown on the plate). A rock with the open water to port
// passes on the near side, in front of the boat; one with the open water
// to starboard on the far side, behind it.
export function DangerArt({
  kind,
  y,
  layer,
}: {
  kind: Danger
  y: number
  layer: 'back' | 'front'
}) {
  if (kind === 'none' || kind === 'quay') return null
  const near = kind === 'rock-l'
  if (layer === 'front' && !near) return null
  const plane = (s: number, child: ReactNode) => (
    <g transform={`translate(0 ${H}) scale(${s}) translate(0 ${-H})`}>
      {child}
    </g>
  )
  const shape: ReactNode =
    kind === 'rock-l' ? (
      plane(1.15, <Rock top={y - 110} seed={3} />)
    ) : kind === 'rock-r' ? (
      <g opacity=".82">{plane(0.85, <Rock top={y - 110} seed={8} />)}</g>
    ) : kind === 'reef' ? (
      <g>
        <Rock top={y + 6} w={200} seed={12} />
        <g transform="translate(150 30)">
          <Rock top={y + 30} w={180} seed={14} />
        </g>
      </g>
    ) : kind === 'bottom' ? (
      <Cut
        d={`M0 ${H}C60 ${y + 60} 140 ${y + 8} 260 ${y + 4}C380 ${y} 460 ${y + 60} 520 ${H}Z`}
        c={C.sand}
        w={2}
        o={3}
      />
    ) : kind === 'net' ? (
      <Net bottom={y + 56} />
    ) : kind === 'keel' ? (
      <Keel bottom={y + 34} />
    ) : (
      <Wave />
    )
  if (layer === 'front') return <g className="ic-shape">{shape}</g>
  return (
    <g>
      {kind !== 'wave' && (
        <g className="ic-shadow">
          <Shadow y={y} />
        </g>
      )}
      {!near && <g className="ic-shape">{shape}</g>}
    </g>
  )
}

// --- The coral bed, and what is seen on the way ---

// A rock with coral on it, rising from the bottom as high as it is placed
// (its foot reaches far down, out of the picture)
export function CoralBed() {
  const branch = (x: number, h: number, s: number) =>
    `M${x} 560l${-4 * s} ${-h * 0.4}l${-8 * s} ${-h * 0.3}M${x - 4 * s} ${560 - h * 0.4}l${6 * s} ${-h * 0.35}l${-2 * s} ${-h * 0.25}M${x} 560l${6 * s} ${-h * 0.5}l${8 * s} ${-h * 0.2}M${x + 6 * s} ${560 - h * 0.5}l${-2 * s} ${-h * 0.4}`
  return (
    <g>
      <Cut
        d="M14 1000C18 820 4 660 22 590C40 552 90 538 160 536C240 532 320 548 350 586C370 660 358 820 366 1000Z"
        c={C.stoneD}
        w={2}
        o={3}
      />
      <Hatch
        d="M190 534C260 532 320 548 350 586C370 660 358 820 366 1000H230C226 800 232 640 190 534Z"
        o={0.5}
      />
      <Ln
        d="M60 620l20 14M120 700l26 10M70 800l18 22M260 640l-16 20M300 760l-20 16"
        w={1}
        o={0.6}
      />
      {[60, 110, 150, 200, 250, 300].map((x, i) => (
        <g key={x} transform={`translate(0 ${-16 + (i % 2) * 8})`}>
          <Ln
            d={branch(x, 54 + (i % 3) * 14, i % 2 ? 1 : -1)}
            w={4.4}
            k={C.coral}
          />
          <Ln d={branch(x, 54 + (i % 3) * 14, i % 2 ? 1 : -1)} w={1} />
        </g>
      ))}
    </g>
  )
}

export function SightArt({ sight }: { sight: Sight }) {
  if (sight === 'peces')
    return (
      <g className="ic-sight ic-school">
        {Array.from({ length: 9 }, (_, i) => {
          const x = (i % 3) * 46 + ((i * 17) % 23)
          const y = Math.floor(i / 3) * 26 + (i % 2) * 8
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <Cut
                d="M0 0C10 -8 26 -8 34 0C26 8 10 8 0 0ZM34 0L44 -7V7Z"
                c="#b9b49a"
                w={1.2}
                o={1}
              />
              <Ln d="M10 -3V3M16 -4V4M22 -4V4" w={0.8} />
              <circle cx="6" cy="-1" r="1.2" fill={INK} />
            </g>
          )
        })}
      </g>
    )
  if (sight === 'buzo')
    return (
      <g className="ic-sight ic-diver">
        <Ln d="M60 -160V-10" w={1} />
        <Cut d="M50 -10H70L66 4H54Z" c={C.stoneD} w={1.3} o={1} />
        <g transform="translate(40 -40) rotate(-20)">
          <Ln d="M-30 0H10" w={6} k={C.shirt} />
          <Ln d="M-30 -2H10M-30 2H10" w={0.9} />
          <Ln d="M-30 0L-48 -6M-30 0L-48 6" w={4} k={C.skin} />
          <Ln d="M10 0L28 -10M10 0L30 6" w={3.2} k={C.skin} />
          <circle
            cx="16"
            cy="-2"
            r="6"
            fill={C.skin}
            stroke={INK}
            strokeWidth="1.1"
          />
          <path
            d="M14 8C20 14 28 14 30 8Z"
            fill="url(#ic-mesh)"
            stroke={INK}
            strokeWidth="0.9"
          />
        </g>
      </g>
    )
  if (sight === 'pulpo')
    return (
      <g className="ic-sight ic-octopus">
        <Cut
          d="M0 0C-4 -30 40 -40 44 -6C40 4 4 4 0 0Z"
          c="#c9784a"
          w={1.6}
          o={1.5}
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <Ln
            key={i}
            d={`M${6 + i * 8} 0q${-10 + i * 5} 16 ${-4 + i * 4} 26q6 4 10 -2`}
            w={3}
            k="#c9784a"
          />
        ))}
        <circle cx="16" cy="-14" r="2.2" fill={INK} />
        <circle cx="28" cy="-14" r="2.2" fill={INK} />
      </g>
    )
  return null
}

// --- The helm's controls, as pictures ---

export function Pictogram({ a, boat }: { a: Action; boat?: Boat }) {
  const s = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const
  switch (a) {
    case 'babor':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M26 40V18C26 8 18 6 10 10" {...s} />
          <path d="M14 4L8 10L15 15" {...s} />
          <path
            d="M30 28C30 22 34 18 38 18C42 18 44 22 44 28V42H30Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="37" cy="30" r="4" className="port" />
        </svg>
      )
    case 'estribor':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M22 40V18C22 8 30 6 38 10" {...s} />
          <path d="M34 4L40 10L33 15" {...s} />
          <path
            d="M4 28C4 22 8 18 12 18C16 18 18 22 18 28V42H4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="11" cy="30" r="4" className="star" />
        </svg>
      )
    case 'arriba':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M4 8Q10 4 16 8T28 8T40 8T48 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M24 42V16M14 25L24 15L34 25" {...s} />
        </svg>
      )
    case 'abajo':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M4 8Q10 4 16 8T28 8T40 8T48 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M24 14V40M14 31L24 41L34 31" {...s} />
        </svg>
      )
    case 'rapido':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 12L20 24L8 36M22 12L34 24L22 36" {...s} />
          <path d="M38 14V34" {...s} strokeWidth={2} />
        </svg>
      )
    case 'despacio':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M18 12L30 24L18 36" {...s} />
          <path
            d="M6 30H12M4 24H12M6 18H12"
            {...s}
            strokeWidth={2}
            opacity=".5"
          />
        </svg>
      )
    case 'alto':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect x="12" y="12" width="24" height="24" rx="2" {...s} />
          <path d="M18 18H30V30H18Z" fill="currentColor" opacity=".35" />
        </svg>
      )
    case 'escotilla': {
      const open = !!boat?.hatch
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M8 40V28C8 20 40 20 40 28V40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          {open ? (
            <path d="M12 22L20 6M16 24L26 9" {...s} />
          ) : (
            <path
              d="M10 22H38C38 14 10 14 10 22Z"
              fill="currentColor"
              opacity=".55"
              stroke="currentColor"
              strokeWidth="2.4"
            />
          )}
          <circle cx="16" cy="32" r="2.5" fill="currentColor" />
          <circle cx="24" cy="32" r="2.5" fill="currentColor" />
          <circle cx="32" cy="32" r="2.5" fill="currentColor" />
        </svg>
      )
    }
    case 'coral':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M24 44V30M24 30L16 20L14 10M16 20L8 16M24 30L32 18L30 8M32 18L40 14M24 36L34 32"
            fill="none"
            className="coral"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M24 44V30M24 30L16 20L14 10M16 20L8 16M24 30L32 18L30 8M32 18L40 14M24 36L34 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'ancla':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="8" r="4" {...s} strokeWidth={2.4} />
          <path
            d="M24 12V42M14 20H34M8 30C10 40 20 43 24 42C28 43 38 40 40 30"
            {...s}
          />
          <path
            d="M5 33L8 29L12 33M36 33L40 29L43 33"
            {...s}
            strokeWidth={2.4}
          />
        </svg>
      )
    case 'lampara': {
      const on = !!boat?.lamp
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          {on && <circle cx="24" cy="24" r="17" className="glow" />}
          <path
            d="M18 8H30M20 8V12H28V8M17 12H31L33 34H15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M24 18C21 22 21 26 24 29C27 26 27 22 24 18Z"
            fill={on ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M13 38H35" {...s} />
          {on && (
            <path
              d="M6 14L10 16M42 14L38 16M4 26H9M44 26H39"
              {...s}
              strokeWidth={2}
            />
          )}
        </svg>
      )
    }
  }
}

// The captain, Narciso Monturiol, in an oval: long hair and a beard, a high
// collar, after the portraits of his time
export function Captain({ talking = false }: { talking?: boolean }) {
  return (
    <svg
      className={`ic-captain ${talking ? 'talking' : ''}`}
      viewBox="0 0 80 96"
      aria-hidden="true"
    >
      <ellipse
        cx="40"
        cy="48"
        rx="36"
        ry="44"
        fill={C.sky}
        stroke={INK}
        strokeWidth="2"
      />
      <ellipse
        cx="40"
        cy="48"
        rx="31"
        ry="39"
        fill="url(#ic-sky)"
        opacity=".35"
      />
      <path
        d="M12 90C14 70 26 64 40 64C54 64 66 70 68 90Z"
        fill="#2f3a46"
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d="M33 64L40 76L47 64Z"
        fill={C.shirt}
        stroke={INK}
        strokeWidth="1.2"
      />
      <path d="M40 66V88" stroke={INK} strokeWidth="1" />
      <path
        d="M22 40C20 22 30 14 40 14C52 14 60 22 58 40C58 50 56 56 54 58L26 58C24 56 22 50 22 40Z"
        fill="#4a3a2c"
        stroke={INK}
        strokeWidth="1.4"
      />
      <path
        d="M28 38C28 28 33 24 40 24C47 24 52 28 52 38C52 46 48 52 40 52C32 52 28 46 28 38Z"
        fill={C.skin}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path
        className="beard"
        d="M28 42C28 58 34 66 40 66C46 66 52 58 52 42C48 48 44 50 40 50C36 50 32 48 28 42Z"
        fill="#4a3a2c"
        stroke={INK}
        strokeWidth="1.2"
      />
      <path
        d="M32 36Q35 34 38 36M42 36Q45 34 48 36"
        fill="none"
        stroke={INK}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M36 46Q40 44 44 46"
        fill="none"
        stroke="#2a1d14"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M44 22C46 30 50 34 54 36"
        fill="none"
        stroke={INK}
        strokeWidth="0.9"
        opacity=".6"
      />
    </svg>
  )
}
